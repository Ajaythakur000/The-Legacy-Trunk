import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'; 
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import {
  getFamilyRadarApi,
  toggleGhostModeApi,
  updateMyLocationApi,
} from '../../api/locationApi';
import { getCircleFeedApi } from '../../api/storyApi'; 
import { getSocket } from '../../services/socket';
import 'leaflet/dist/leaflet.css';

// -----------------------------------------------------------
// 🔥 NEW CUSTOM MARKER ICONS
// -----------------------------------------------------------
const myIcon = L.divIcon({
  className: 'user-marker', 
  iconSize: [20, 20],
  iconAnchor: [10, 10], 
  popupAnchor: [0, -10] 
});

const otherMemberIcon = L.divIcon({
  className: 'other-marker', 
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

// -----------------------------------------------------------
// 🚀 THE FIX: SMART TOUCHPAD HANDLER
// -----------------------------------------------------------
// -----------------------------------------------------------
// 🚀 THE FIX: SMART TOUCHPAD HANDLER (STRICT VERTICAL/HORIZONTAL PAN)
// -----------------------------------------------------------
function TouchpadPanHandler() {
  const map = useMap();

  useEffect(() => {
    const handleWheel = (e) => {
      // 1. Agar user Pinch (Zoom) kar raha hai (Touchpad pinch par ctrlKey true hoti hai)
      if (e.ctrlKey) {
        return; // Leaflet ko apna Zoom ka kaam karne do
      }

      // 2. Agar user sirf Slide (Pan) kar raha hai kisi bhi direction mein
      e.preventDefault();
      
      // 🔥 YEH HAI MAGIC WORD: Leaflet ko vertical scroll padhne se roko!
      e.stopImmediatePropagation(); 
      
      // Map ko exact us direction mein slide karo
      map.panBy([e.deltaX, e.deltaY], { animate: false }); 
    };

    const container = map.getContainer();
    // 'capture: true' se humara code Leaflet se pehle event pakad lega
    container.addEventListener('wheel', handleWheel, { capture: true, passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [map]);

  return null;
}

function FamilyRadarPage() {
  const { user } = useAuth();

  const myUserId = String(user?._id || '');
  const familyCircleId =
    user?.familyCircleId || user?.activeCircleId || user?.familyCircle?._id || null;

  const [myLocation, setMyLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isGhostModeOn, setIsGhostModeOn] = useState(!!user?.isGhostModeOn);
  const [members, setMembers] = useState([]);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarError, setRadarError] = useState('');

  const [recentActivities, setRecentActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const center = useMemo(() => {
    if (myLocation?.lat && myLocation?.lng) return [myLocation.lat, myLocation.lng];
    const firstVisible = members.find(
      (m) => !m.isGhostModeOn && Number.isFinite(m.latitude) && Number.isFinite(m.longitude)
    );
    if (firstVisible) return [firstVisible.latitude, firstVisible.longitude];
    return [28.6139, 77.209];
  }, [myLocation, members]);

  const formatTime = (iso) => {
    if (!iso) return '--';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return '--'; }
  };

  const timeAgo = (iso) => {
    if (!iso) return 'unknown';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day ago`;
  };

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const normalizeMembers = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((m, idx) => {
        const latRaw = m?.latitude ?? m?.currentLocation?.coordinates?.[1] ?? m?.location?.coordinates?.[1] ?? m?.liveLocation?.coordinates?.[1];
        const lngRaw = m?.longitude ?? m?.currentLocation?.coordinates?.[0] ?? m?.location?.coordinates?.[0] ?? m?.liveLocation?.coordinates?.[0];
        const latitude = typeof latRaw === 'number' ? latRaw : Number(latRaw);
        const longitude = typeof lngRaw === 'number' ? lngRaw : Number(lngRaw);

        return {
          _id: String(m?._id || m?.memberId || `member-${idx}`),
          name: m?.name || m?.memberName || 'Unknown',
          latitude,
          longitude,
          isOnline: Boolean(m?.isOnline),
          isGhostModeOn: Boolean(m?.isGhostModeOn),
          updatedAt: m?.updatedAt || m?.lastLocationUpdatedAt || m?.lastSeenAt || null,
        };
      })
      .filter((m) => m._id !== myUserId); 
  };

  const loadFamilyRadar = async () => {
    setRadarLoading(true);
    setRadarError('');
    try {
      const data = await getFamilyRadarApi();
      const list = data?.members || data?.data?.members || data?.familyMembers || data?.data?.familyMembers || [];
      setMembers(normalizeMembers(list));
    } catch (e) {
      setRadarError(e?.response?.data?.message || 'Failed to load family radar');
    } finally {
      setRadarLoading(false);
    }
  };

  useEffect(() => {
    const fetchActivity = async () => {
      if (!familyCircleId) {
        setActivityLoading(false);
        return;
      }
      try {
        const stories = await getCircleFeedApi(familyCircleId);
        const activities = stories.slice(0, 10).map(story => ({
          id: story._id,
          type: 'POST',
          user: story.user?.name || 'Someone',
          text: `posted a new story: "${story.title}"`,
          time: new Date(story.createdAt),
          link: `/vault-stories/${story._id}`
        }));
        setRecentActivities(activities);
      } catch (err) {
        console.error("Failed to load activities", err);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, [familyCircleId]);

  useEffect(() => {
    loadFamilyRadar();
    const id = setInterval(() => loadFamilyRadar(), 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported in this browser.');
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMyLocation({ lat, lng });
        setLocError('');
        setLoadingLoc(false);
        try {
          await updateMyLocationApi({ latitude: lat, longitude: lng });
          await loadFamilyRadar();
        } catch { /* silent */ }
      },
      (err) => {
        setLocError(err?.message || 'Location access denied. Radar will not work.');
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !familyCircleId) return;

    socket.emit('join_vault', { familyCircleId: familyCircleId, userId: myUserId, name: user?.name });

    const onMemberLocationChanged = (payload) => {
      const changedUserId = String(payload?.userId || payload?.memberId || '');
      if (!changedUserId || changedUserId === myUserId) return;

      const lat = Number(payload?.latitude);
      const lng = Number(payload?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      setMembers((prev) => {
        const idx = prev.findIndex((m) => String(m._id) === changedUserId);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], latitude: lat, longitude: lng, updatedAt: payload?.updatedAt || new Date().toISOString(), isOnline: true };
        return copy;
      });
    };

    socket.on('member_location_changed', onMemberLocationChanged);
    return () => socket.off('member_location_changed', onMemberLocationChanged);
  }, [familyCircleId, myUserId, user?.name]);

  const handleToggleGhostMode = async () => {
    const next = !isGhostModeOn;
    setIsGhostModeOn(next);
    try {
      await toggleGhostModeApi(next);
      await loadFamilyRadar();
    } catch (e) {
      setIsGhostModeOn(!next); 
      alert(e?.response?.data?.message || 'Failed to update ghost mode');
    }
  };

  const visibleMembers = members.filter(
    (m) => !m.isGhostModeOn && Number.isFinite(m.latitude) && Number.isFinite(m.longitude)
  );

  const getDistanceLabel = (m) => {
    if (!myLocation || !Number.isFinite(m.latitude) || !Number.isFinite(m.longitude)) return '--';
    const km = haversineKm(myLocation.lat, myLocation.lng, m.latitude, m.longitude);
    return `${km.toFixed(1)} km away`;
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
      
      <div style={{ maxWidth: 1200, margin: '24px auto', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#111827' }}>Family Radar 📡</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Live family location & recent activities</p>
          </div>
          <button
            onClick={handleToggleGhostMode}
            style={{
              border: '1px solid #d1d5db',
              background: isGhostModeOn ? '#111827' : '#fff',
              color: isGhostModeOn ? '#fff' : '#111827',
              borderRadius: 999,
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            Ghost Mode: {isGhostModeOn ? 'ON 👻' : 'OFF'}
          </button>
        </div>

        {loadingLoc && <p style={{ color: '#6b7280' }}>Detecting your location...</p>}
        {locError && <p style={{ color: 'crimson', background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>{locError}</p>}
        {radarLoading && members.length === 0 && <p style={{ color: '#6b7280' }}>Loading family radar...</p>}
        {radarError && <p style={{ color: 'crimson' }}>{radarError}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: 20, marginBottom: 30, '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
          
          <div style={{ height: 470, border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', background: '#111827', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <MapContainer 
              center={center} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              // 🔥 scrollWheelZoom ko TRUE kar diya taaki Pinch (Zoom) kaam kare
              scrollWheelZoom={true} 
              dragging={true}
              touchZoom={true}
            >
              {/* THE SMART TOUCHPAD HANDLER */}
              <TouchpadPanHandler />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {myLocation && !isGhostModeOn && (
                <>
                  <Marker icon={myIcon} position={[myLocation.lat, myLocation.lng]}>
                    <Popup>{user?.name || 'You'} (You) 📍</Popup>
                  </Marker>
                  <Circle center={[myLocation.lat, myLocation.lng]} radius={120} pathOptions={{ color: '#3b82f6', fillOpacity: 0.2 }} />
                </>
              )}

              {visibleMembers.map((m) => (
                <Marker key={m._id} icon={otherMemberIcon} position={[m.latitude, m.longitude]}>
                  <Popup>
                    <div>
                      <b style={{ color: '#111827' }}>{m.name}</b>
                      <div style={{ color: m.isOnline ? '#10b981' : '#6b7280' }}>{m.isOnline ? 'Active now 🟢' : `Last seen ${timeAgo(m.updatedAt)}`}</div>
                      <div style={{ fontWeight: 'bold' }}>{getDistanceLabel(m)}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: '#fff', maxHeight: 470, overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>Family Members</h3>
            
            <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>{user?.name || 'You'} (You)</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{isGhostModeOn ? 'Hidden (Ghost Mode ON)' : 'Visible to family'}</div>
            </div>

            {members.length === 0 ? (
              <p style={{ color: '#666' }}>No members found.</p>
            ) : (
              members.map((m) => (
                <div key={m._id} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#374151', fontWeight: 'bold' }}>{getDistanceLabel(m)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.isGhostModeOn ? '#6b7280' : m.isOnline ? '#10b981' : '#9ca3af', boxShadow: m.isOnline ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none' }} />
                    <span style={{ fontSize: 13, color: '#4b5563', fontWeight: m.isOnline ? 'bold' : 'normal' }}>
                      {m.isGhostModeOn ? 'Ghost Mode ON' : m.isOnline ? 'Active now' : `Last seen ${timeAgo(m.updatedAt)}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>Updated: {formatTime(m.updatedAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span style={{ fontSize: '20px' }}>⚡</span> Recent Family Activity
          </h3>
          {activityLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Scanning radar... ⏳</p>
          ) : recentActivities.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No recent activity found. It's quiet... too quiet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {recentActivities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '20px', background: '#e0e7ff', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', color: '#374151', fontSize: '14px' }}>
                      <b style={{ color: '#111827' }}>{act.user}</b> {act.text}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <small style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 'bold' }}>{timeAgo(act.time)}</small>
                      <Link to={act.link} style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', background: '#dbeafe', padding: '6px 12px', borderRadius: '12px', transition: 'background 0.2s' }}>
                        View Post
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 💅 CSS MAGIC */}
      <style>{`
        .user-marker {
          width: 20px;
          height: 20px;
          background-color: #3b82f6; 
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .other-marker {
          width: 16px;
          height: 16px;
          background-color: #8b5cf6; 
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </div>
  );
}

export default FamilyRadarPage;