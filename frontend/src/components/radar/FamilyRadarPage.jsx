import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import {
  getFamilyRadarApi,
  toggleGhostModeApi,
  updateMyLocationApi,
} from '../../api/locationApi';
import { getSocket } from '../../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Baloo+2:wght@500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  .fr-root *, .fr-root *::before, .fr-root *::after { box-sizing: border-box; }
  .fr-root {
    min-height: 100vh; background: transparent;
    padding: 0 0 60px; position: relative; overflow-x: hidden;
    font-family: 'Baloo 2', sans-serif;
  }
  .fr-content { position: relative; z-index: 10; max-width: 1280px; margin: 0 auto; padding: 40px 20px; }

  /* HEADER */
  .fr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
  .fr-page-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 48px); color: #632020; margin: 0 0 6px; text-shadow: 4px 4px 0px #3E2723; -webkit-text-stroke: 2px #3E2723; letter-spacing: 2px; }
  .fr-page-sub { font-family: 'Baloo 2', sans-serif; font-weight: 800; font-size: 18px; color: #3E2723; margin: 0; background: #D4B895; display: inline-block; padding: 4px 16px; border: 1px solid #3E2723; border-radius: 8px; transform: rotate(-2deg); box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3); }

  /* GHOST BUTTON */
  .fr-ghost-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 24px;
    background: #FFF; border: 2px solid #3E2723; border-radius: 12px;
    font-family: 'Playfair Display', serif; font-size: 18px;
    color: #3E2723; cursor: pointer; transition: all 0.1s;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);
  }
  .fr-ghost-btn.fr-ghost-on { background: #8B5A2B; }
  .fr-ghost-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.3); }
  .fr-ghost-btn:active { transform: translate(2px, 2px); box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.3); }

  /* STATUS BAR */
  .fr-status-bar { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; padding: 16px 20px; background: #FFF; border: 2px solid #3E2723; border-radius: 16px; flex-wrap: wrap; box-shadow: 8px 8px 15px 0px rgba(0,0,0,0.3); }
  .fr-status-item { display: flex; align-items: center; gap: 8px; font-family: 'Playfair Display', serif; font-size: 16px; color: #3E2723; }
  .fr-status-dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #3E2723; }
  .fr-status-dot.fr-sd-online  { background: #00C853; }
  .fr-status-dot.fr-sd-warning { background: #D4B895; }
  .fr-status-dot.fr-sd-error   { background: #632020; }

  /* GRID */
  .fr-grid { display: grid; grid-template-columns: minmax(0,1.5fr) 400px; gap: 32px; margin-bottom: 40px; }

  /* MAP CHAMBER */
  .fr-map-chamber {
    position: relative; border-radius: 24px; overflow: hidden;
    border: 6px solid #3E2723; background: #FFF;
    box-shadow: 16px 16px 15px 0px rgba(0,0,0,0.3);
  }
  .fr-map-inner { height: 600px; position: relative; }
  
  /* CARTO Light Map CSS Filter for Pop-Art Look */
  .fr-map-inner .leaflet-container { 
    height: 100%; width: 100%; background: #FFF !important; 
    filter: brightness(1.05) contrast(1.1) saturate(1.2);
  }

  .fr-map-label {
    position: absolute; top: 20px; left: 20px;
    z-index: 30; pointer-events: none;
    font-family: 'Playfair Display', serif; font-size: 24px; color: #FFF;
    background: #632020; padding: 8px 16px; border: 2px solid #3E2723; border-radius: 12px;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3); transform: rotate(-3deg);
  }
  .fr-coords-hud {
    position: absolute; bottom: 20px; left: 20px; z-index: 30; pointer-events: none;
    font-family: 'Playfair Display', serif; font-size: 14px; color: #3E2723;
    background: #FFF; padding: 10px 16px; border: 2px solid #3E2723; border-radius: 12px;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);
  }
  .fr-member-hud {
    position: absolute; bottom: 20px; right: 20px; z-index: 30; pointer-events: none;
    display: flex; align-items: center; gap: 8px;
    font-family: 'Playfair Display', serif; font-size: 16px; color: #3E2723;
    background: #D4B895; padding: 10px 16px; border: 2px solid #3E2723; border-radius: 12px;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);
  }

  /* PANEL */
  .fr-panel { display: flex; flex-direction: column; background: #8B5A2B; border: 6px solid #3E2723; border-radius: 24px; overflow: hidden; box-shadow: 16px 16px 15px 0px rgba(0,0,0,0.3); position: relative; }
  .fr-panel-header { padding: 24px; border-bottom: 6px solid #3E2723; display: flex; align-items: center; justify-content: space-between; background: #FFF; }
  .fr-panel-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #3E2723; }
  .fr-panel-body { flex: 1; overflow-y: auto; padding: 20px; max-height: 520px; }
  .fr-panel-body::-webkit-scrollbar { width: 8px; }
  .fr-panel-body::-webkit-scrollbar-thumb { background: #3E2723; border-radius: 4px; }

  /* MEMBER CARD */
  .fr-member-card {
    padding: 16px; background: #FFF; border: 2px solid #3E2723;
    border-radius: 16px; margin-bottom: 16px; transition: all 0.1s; position: relative;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);
  }
  .fr-member-card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.3); }
  .fr-member-card.fr-me { background: #D4B895; }
  .fr-member-card.fr-ghost-card { opacity: 0.6; }
  .fr-member-card-top { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }

  /* ORB */
  .fr-orb-wrap { position: relative; width: 48px; height: 48px; flex-shrink: 0; }
  .fr-orb {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 24px; color: #FFF;
    background: #632020;
    border: 1px solid #3E2723;
    overflow: hidden;
  }
  .fr-orb.fr-orb-ghost { background: #c084fc; }
  .fr-orb-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  
  .fr-member-info { flex: 1; min-width: 0; }
  .fr-member-name { font-family: 'Playfair Display', serif; font-size: 18px; color: #3E2723; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fr-member-role { font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 14px; color: rgba(23,23,25,0.7); }
  .fr-member-stats { display: flex; gap: 8px; flex-wrap: wrap; }
  .fr-chip { display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: #FFF; border: 1px solid #3E2723; border-radius: 8px; font-family: 'Playfair Display', serif; font-size: 12px; color: #3E2723; }
  .fr-chip.fr-chip-on  { background: #00C853; color: #FFF; }
  .fr-chip.fr-chip-gh  { background: #c084fc; color: #FFF; }

  .fr-empty { padding: 40px; text-align: center; font-family: 'Playfair Display', serif; font-size: 24px; color: #3E2723; }
  .fr-error-bar { padding: 16px; margin-bottom: 24px; background: #632020; border: 2px solid #3E2723; border-radius: 12px; color: #FFF; font-family: 'Playfair Display', serif; font-size: 18px; display: flex; alignItems: center; gap: 12px; box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3); }

  /* LEAFLET POPUP OVERRIDE */
  .fr-root .leaflet-popup-content-wrapper { background: #FFF !important; border: 2px solid #3E2723 !important; border-radius: 16px !important; padding: 0 !important; box-shadow: 8px 8px 15px 0px rgba(0,0,0,0.3); }
  .fr-root .leaflet-popup-tip { background: #FFF !important; border: 2px solid #3E2723 !important; }
  .fr-root .leaflet-popup-content { margin: 0 !important; }

  @media (max-width: 900px) { .fr-grid{grid-template-columns: 1fr;} .fr-map-inner{height: 400px;} }
`;

// ── Leaflet icons (Comic Style) ───────────────────────────────────────────────
const myIcon = () => L.divIcon({
  className: '', iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20],
  html: `<div style="width:40px;height:40px;border-radius:50%;background:#D4B895;border: 2px solid #3E2723;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display', serif;font-size:18px;color:#3E2723;box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);transform:rotate(-5deg);">ME</div>`,
});

const otherIcon = (init='?', online=false) => L.divIcon({
  className: '', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18],
  html: `<div style="width:36px;height:36px;border-radius:50%;background:${online ? '#8B5A2B' : '#FFF'};border: 2px solid #3E2723;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display', serif;font-size:16px;color:#3E2723;box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);">${init}</div>`,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function TouchpadPanHandler() {
  const map = useMap();
  useEffect(() => {
    const h = e => { if(e.ctrlKey) return; e.preventDefault(); e.stopImmediatePropagation(); map.panBy([e.deltaX,e.deltaY],{animate:false}); };
    const c = map.getContainer();
    c.addEventListener('wheel',h,{capture:true,passive:false});
    return () => c.removeEventListener('wheel',h,{capture:true});
  },[map]); return null;
}

function PopupContent({ name, isMe, isOnline, isGhost, distance, time }) {
  return (
    <div style={{ padding: '16px', minWidth: 180, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#632020', marginBottom: 8 }}>{name}{isMe ? ' (YOU)' : ''}</div>
      {isGhost ? (
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 16, color: '#3E2723' }}>👻 Ghost Mode</div>
      ) : (
        <>
          <div style={{ display: 'inline-block', padding: '4px 10px', background: isOnline ? '#00C853' : '#F5F5F5', border: '1px solid #3E2723', borderRadius: 8, fontFamily: "'Playfair Display', serif", fontSize: 14, color: isOnline ? '#FFF' : '#3E2723', marginBottom: 8 }}>
            {isOnline ? 'ACTIVE' : `SEEN: ${time}`}
          </div>
          {distance && distance !== '--' && <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, color: '#3E2723' }}>📍 {distance} AWAY</div>}
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
function FamilyRadarPage() {
  const { user } = useAuth();
  const myUserId       = String(user?._id||'');
  const familyCircleId = user?.familyCircleId||user?.activeCircleId||user?.familyCircle?._id||null;

  const [myLocation,setMyLocation]=useState(null);
  const [locError,setLocError]=useState('');
  const [loadingLoc,setLoadingLoc]=useState(false);
  const [isGhostModeOn,setIsGhostModeOn]=useState(!!user?.isGhostModeOn);
  const [members,setMembers]=useState([]);
  const [radarLoading,setRadarLoading]=useState(false);
  const [radarError,setRadarError]=useState('');
  const [mapSize,setMapSize]=useState({w:800,h:520});
  const chamberRef=useRef(null);

  useEffect(()=>{
    if(!chamberRef.current)return;
    const obs=new ResizeObserver(entries=>{for(const e of entries)setMapSize({w:e.contentRect.width,h:e.contentRect.height});});
    obs.observe(chamberRef.current);
    return()=>obs.disconnect();
  },[]);

  const timeAgo=iso=>{if(!iso)return'unknown';const m=Math.floor((Date.now()-new Date(iso).getTime())/60000);if(m<1)return'just now';if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`;};
  const haversineKm=(la1,lo1,la2,lo2)=>{const R=6371,toRad=v=>v*Math.PI/180,dLat=toRad(la2-la1),dLon=toRad(lo2-lo1),a=Math.sin(dLat/2)**2+Math.cos(toRad(la1))*Math.cos(toRad(la2))*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));};
  const init=name=>(name||'?').slice(0,2).toUpperCase();

  const normalizeMembers=useCallback(raw=>{
    if(!Array.isArray(raw))return[];
    return raw.map((m,idx)=>{
      const latR=m?.latitude??m?.currentLocation?.coordinates?.[1]??m?.location?.coordinates?.[1]??m?.liveLocation?.coordinates?.[1];
      const lngR=m?.longitude??m?.currentLocation?.coordinates?.[0]??m?.location?.coordinates?.[0]??m?.liveLocation?.coordinates?.[0];
      return{_id:String(m?._id||m?.memberId||`member-${idx}`),name:m?.name||m?.memberName||'Unknown',latitude:typeof latR==='number'?latR:Number(latR),longitude:typeof lngR==='number'?lngR:Number(lngR),isOnline:Boolean(m?.isOnline),isGhostModeOn:Boolean(m?.isGhostModeOn),updatedAt:m?.updatedAt||m?.lastLocationUpdatedAt||m?.lastSeenAt||null};
    }).filter(m=>m._id!==myUserId);
  },[myUserId]);

  const loadFamilyRadar=useCallback(async()=>{
    setRadarLoading(true);setRadarError('');
    try{const d=await getFamilyRadarApi();const l=d?.members||d?.data?.members||d?.familyMembers||d?.data?.familyMembers||[];setMembers(normalizeMembers(l));}
    catch(e){setRadarError(e?.response?.data?.message||'Radar signal lost');}
    finally{setRadarLoading(false);}
  },[normalizeMembers]);

  useEffect(()=>{loadFamilyRadar();const id=setInterval(loadFamilyRadar,20000);return()=>clearInterval(id);},[loadFamilyRadar]);

  useEffect(()=>{
    if(!navigator.geolocation){setLocError('Geolocation not supported.');return;}
    setLoadingLoc(true);
    const wid=navigator.geolocation.watchPosition(async pos=>{
      const lat=pos.coords.latitude,lng=pos.coords.longitude;
      setMyLocation({lat,lng});setLocError('');setLoadingLoc(false);
      if(!isGhostModeOn){try{await updateMyLocationApi({latitude:lat,longitude:lng});}catch{}}
    },err=>{setLocError(err?.message||'Location access denied.');setLoadingLoc(false);},{enableHighAccuracy:true,timeout:10000,maximumAge:0});
    return()=>navigator.geolocation.clearWatch(wid);
  },[isGhostModeOn]);

  useEffect(()=>{
    const socket=getSocket();if(!socket||!familyCircleId)return;
    socket.emit('join_vault',{familyCircleId});
    const onLoc=payload=>{
      const uid=String(payload?.userId||payload?.memberId||'');if(!uid||uid===myUserId)return;
      const lat=Number(payload?.latitude),lng=Number(payload?.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
      setMembers(prev=>{const idx=prev.findIndex(m=>String(m._id)===uid);if(idx===-1)return prev;const copy=[...prev];copy[idx]={...copy[idx],latitude:lat,longitude:lng,updatedAt:payload?.updatedAt||new Date().toISOString(),isOnline:true};return copy;});
    };
    socket.on('member_location_changed',onLoc);return()=>socket.off('member_location_changed',onLoc);
  },[familyCircleId,myUserId]);

  const handleToggleGhostMode=async()=>{
    const next=!isGhostModeOn;setIsGhostModeOn(next);
    try{await toggleGhostModeApi(next);await loadFamilyRadar();}
    catch(e){setIsGhostModeOn(!next);alert(e?.response?.data?.message||'Failed to toggle ghost mode');}
  };

  const center=useMemo(()=>{
    if(myLocation?.lat&&myLocation?.lng)return[myLocation.lat,myLocation.lng];
    const f=members.find(m=>!m.isGhostModeOn&&Number.isFinite(m.latitude)&&Number.isFinite(m.longitude));
    if(f)return[f.latitude,f.longitude];return[28.6139,77.209];
  },[myLocation,members]);

  const visibleMembers=members.filter(m=>!m.isGhostModeOn&&Number.isFinite(m.latitude)&&Number.isFinite(m.longitude));
  const getDist=m=>{if(!myLocation||!Number.isFinite(m.latitude)||!Number.isFinite(m.longitude))return'--';return`${haversineKm(myLocation.lat,myLocation.lng,m.latitude,m.longitude).toFixed(1)} km`;};

  return (
    <div className="fr-root">
      <style>{CSS}</style>

      <motion.div className="fr-content" initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{type: 'spring', bounce: 0.4}}>

        {/* HEADER */}
        <div className="fr-header">
          <div>
            <div className="fr-page-sub">LIVE TRACKING</div>
            <h1 className="fr-page-title">FAMILY RADAR</h1>
          </div>
          <button className={`fr-ghost-btn${isGhostModeOn?' fr-ghost-on':''}`} onClick={handleToggleGhostMode}>
            <span>{isGhostModeOn?'GHOST MODE ON':'GHOST MODE OFF'}</span>
            <span style={{fontSize:24}}>{isGhostModeOn?'👻':'📡'}</span>
          </button>
        </div>

        {/* STATUS BAR */}
        <div className="fr-status-bar">
          <div className="fr-status-item"><span className={`fr-status-dot ${myLocation?'fr-sd-online':loadingLoc?'fr-sd-warning':'fr-sd-error'}`}/><span>GPS: {myLocation?'LOCKED':loadingLoc?'SCANNING':'ERROR'}</span></div>
          <div className="fr-status-item"><span className={`fr-status-dot ${radarLoading?'fr-sd-warning':'fr-sd-online'}`}/><span>RADAR: {radarLoading?'SYNCING':'ACTIVE'}</span></div>
          <div className="fr-status-item"><span className="fr-status-dot fr-sd-online"/><span>SOULS: {visibleMembers.length}</span></div>
          {isGhostModeOn&&<div className="fr-status-item"><span className="fr-status-dot fr-sd-warning"/><span style={{color:'#3E2723'}}>GHOST MODE</span></div>}
        </div>

        <AnimatePresence>
          {locError&&<motion.div className="fr-error-bar" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>⚠️ {locError}</motion.div>}
          {radarError&&<motion.div className="fr-error-bar" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>⚠️ {radarError}</motion.div>}
        </AnimatePresence>

        {/* MAIN GRID */}
        <div className="fr-grid">

          {/* MAP */}
          <div className="fr-map-chamber">
            <div className="fr-map-label">LIVE FEED</div>
            <div className="fr-map-inner" ref={chamberRef}>
              <MapContainer center={center} zoom={13} style={{height:'100%',width:'100%',zIndex:0}} scrollWheelZoom touchZoom dragging zoomControl={false}>
                <TouchpadPanHandler/>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {myLocation&&!isGhostModeOn&&(
                  <><Marker icon={myIcon()} position={[myLocation.lat,myLocation.lng]}><Popup><PopupContent name={user?.name||'You'} isMe isOnline/></Popup></Marker>
                  <Circle center={[myLocation.lat,myLocation.lng]} radius={120} pathOptions={{color:'#D4B895',fillColor:'#D4B895',fillOpacity:0.2,weight:2}}/>
                  <Circle center={[myLocation.lat,myLocation.lng]} radius={300} pathOptions={{color:'#632020',fillColor:'#632020',fillOpacity:0.05,weight:1,dashArray:'4 8'}}/></>
                )}
                {visibleMembers.map(m=>(
                  <Marker key={m._id} icon={otherIcon(init(m.name),m.isOnline)} position={[m.latitude,m.longitude]}>
                    <Popup><PopupContent name={m.name} isOnline={m.isOnline} distance={getDist(m)} time={timeAgo(m.updatedAt)}/></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            {myLocation&&<div className="fr-coords-hud">LAT {myLocation.lat.toFixed(4)} <br/> LNG {myLocation.lng.toFixed(4)}</div>}
            <div className="fr-member-hud">👨‍👩‍👧‍👦 {visibleMembers.length} MEMBERS</div>
          </div>

          {/* PANEL */}
          <div className="fr-panel">
            <div className="fr-panel-header"><span className="fr-panel-title">FAMILY ONLINE</span><span className="fr-panel-count" style={{fontFamily:"'Playfair Display', serif", color:'#3E2723'}}>{members.length+1} TOTAL</span></div>
            <div className="fr-panel-body">
              {/* Self */}
              <motion.div className="fr-member-card fr-me" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1}}>
                <div className="fr-member-card-top">
                  <div className="fr-orb-wrap">
                    <div className="fr-orb">{user?.avatar?<img src={user.avatar} alt="" className="fr-orb-img"/>:(user?.name||'Y').slice(0,2).toUpperCase()}</div>
                  </div>
                  <div className="fr-member-info"><div className="fr-member-name">{user?.name||'You'}</div><div className="fr-member-role">Here</div></div>
                </div>
                <div className="fr-member-stats">
                  {isGhostModeOn?<span className="fr-chip fr-chip-gh">👻 Hidden</span>:<span className="fr-chip fr-chip-on">Visible</span>}
                  <span className="fr-chip">YOU</span>
                </div>
              </motion.div>

              {members.length===0&&!radarLoading&&<div className="fr-empty"><div className="fr-empty-icon" style={{fontSize:48}}>🤷‍♂️</div><div>No one else is here.</div></div>}

              {members.map((m,i)=>(
                <motion.div key={m._id} className={`fr-member-card${m.isGhostModeOn?' fr-ghost-card':''}`} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.06}}>
                  <div className="fr-member-card-top">
                    <div className="fr-orb-wrap">
                      <div className={`fr-orb${m.isGhostModeOn?' fr-orb-ghost':m.isOnline?'':''}`}>{init(m.name)}</div>
                    </div>
                    <div className="fr-member-info"><div className="fr-member-name">{m.name}</div><div className="fr-member-role">{m.isGhostModeOn?'Hiding':m.isOnline?'Active':`Last seen ${timeAgo(m.updatedAt)}`}</div></div>
                    <div style={{fontFamily:"'Playfair Display', serif",fontSize:14,color:'#632020'}}>{getDist(m)}</div>
                  </div>
                  <div className="fr-member-stats">
                    {m.isGhostModeOn?<span className="fr-chip fr-chip-gh">👻 Hidden</span>:m.isOnline?<span className="fr-chip fr-chip-on">Active</span>:<span className="fr-chip">Offline</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default FamilyRadarPage;