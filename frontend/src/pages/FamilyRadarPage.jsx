import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import {
  getFamilyRadarApi,
  toggleGhostModeApi,
  updateMyLocationApi,
} from '../api/locationApi';
import { getSocket } from '../services/socket';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
const OtherMemberIcon = DefaultIcon;

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
    } catch {
      return '--';
    }
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
        const latRaw =
          m?.latitude ??
          m?.currentLocation?.coordinates?.[1] ??
          m?.location?.coordinates?.[1] ??
          m?.liveLocation?.coordinates?.[1];

        const lngRaw =
          m?.longitude ??
          m?.currentLocation?.coordinates?.[0] ??
          m?.location?.coordinates?.[0] ??
          m?.liveLocation?.coordinates?.[0];

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
      const list =
        data?.members ||
        data?.data?.members ||
        data?.familyMembers ||
        data?.data?.familyMembers ||
        [];
      setMembers(normalizeMembers(list));
    } catch (e) {
      setRadarError(e?.response?.data?.message || 'Failed to load family radar');
    } finally {
      setRadarLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyRadar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      loadFamilyRadar();
    }, 20000);
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
        } catch {
          // silent
        }
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
        copy[idx] = {
          ...copy[idx],
          latitude: lat,
          longitude: lng,
          updatedAt: payload?.updatedAt || new Date().toISOString(),
          isOnline: true,
        };
        return copy;
      });
    };

    socket.on('member_location_changed', onMemberLocationChanged);
    return () => socket.off('member_location_changed', onMemberLocationChanged);
  }, [familyCircleId, myUserId]);

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Family Radar</h1>
          <p style={{ margin: '6px 0 0', color: '#666' }}>
            Live family location with privacy controls
          </p>
        </div>

        <button
          onClick={handleToggleGhostMode}
          style={{
            border: '1px solid #d1d5db',
            background: isGhostModeOn ? '#111827' : '#fff',
            color: isGhostModeOn ? '#fff' : '#111827',
            borderRadius: 999,
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Ghost Mode: {isGhostModeOn ? 'ON 👻' : 'OFF'}
        </button>
      </div>

      {loadingLoc ? <p>Detecting your location...</p> : null}
      {locError ? <p style={{ color: 'crimson' }}>{locError}</p> : null}
      {radarLoading ? <p>Loading family radar...</p> : null}
      {radarError ? <p style={{ color: 'crimson' }}>{radarError}</p> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          gap: 14,
        }}
      >
        <div
          style={{
            height: 470,
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {myLocation && !isGhostModeOn ? (
              <>
                <Marker position={[myLocation.lat, myLocation.lng]}>
                  <Popup>{user?.name || 'You'} (You) 📍</Popup>
                </Marker>
                <Circle
                  center={[myLocation.lat, myLocation.lng]}
                  radius={120}
                  pathOptions={{ color: '#2563eb', fillOpacity: 0.08 }}
                />
              </>
            ) : null}

            {visibleMembers.map((m) => (
              <Marker key={m._id} icon={OtherMemberIcon} position={[m.latitude, m.longitude]}>
                <Popup>
                  <div>
                    <b>{m.name}</b>
                    <div>{m.isOnline ? 'Active now' : `Last seen ${timeAgo(m.updatedAt)}`}</div>
                    <div>{getDistanceLabel(m)}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            padding: 12,
            background: '#fff',
            maxHeight: 470,
            overflowY: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Family Members</h3>

          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 700 }}>{user?.name || 'You'} (You)</div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
              {isGhostModeOn ? 'Hidden (Ghost Mode ON)' : 'Visible to family'}
            </div>
          </div>

          {members.length === 0 ? (
            <p style={{ color: '#666' }}>No members found.</p>
          ) : (
            members.map((m) => (
              <div
                key={m._id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#374151' }}>{getDistanceLabel(m)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: m.isGhostModeOn ? '#6b7280' : m.isOnline ? '#16a34a' : '#9ca3af',
                      boxShadow: m.isOnline ? '0 0 0 4px rgba(22,163,74,0.15)' : 'none',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#4b5563' }}>
                    {m.isGhostModeOn
                      ? 'Ghost Mode ON'
                      : m.isOnline
                      ? 'Active now'
                      : `Last seen ${timeAgo(m.updatedAt)}`}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>
                  Updated at: {formatTime(m.updatedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FamilyRadarPage;