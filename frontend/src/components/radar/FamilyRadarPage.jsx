import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import {
  getFamilyRadarApi,
  toggleGhostModeApi,
  updateMyLocationApi,
} from '../../api/locationApi';
import { getCircleFeedApi } from '../../api/storyApi';
import { getSocket } from '../../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');

  .fr-root *, .fr-root *::before, .fr-root *::after { box-sizing: border-box; }
  .fr-root {
    min-height: 100vh; background: #06080f;
    padding: 0 0 60px; position: relative; overflow-x: hidden;
    font-family: 'Cinzel', serif;
  }
  .fr-star-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
  .fr-dust { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
  .fr-mote { position: absolute; border-radius: 50%; animation: frFloat var(--dur) var(--delay) linear infinite; }
  .fr-content { position: relative; z-index: 10; max-width: 1280px; margin: 0 auto; padding: 32px 20px; }

  /* HEADER */
  .fr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
  .fr-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .fr-eyebrow-line  { height: 1px; width: 40px; background: linear-gradient(90deg, transparent, rgba(212,168,80,0.6)); }
  .fr-eyebrow-line-r{ height: 1px; width: 40px; background: linear-gradient(270deg, transparent, rgba(212,168,80,0.6)); }
  .fr-eyebrow-text  { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(212,168,80,0.55); }
  .fr-page-title    { font-family: 'Cinzel', serif; font-size: 2.2rem; font-weight: 700; color: #e8c87a; margin: 0 0 6px; text-shadow: 0 0 40px rgba(212,168,80,0.4), 0 0 80px rgba(212,168,80,0.15); letter-spacing: 2px; }
  .fr-page-sub      { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 15px; color: rgba(255,255,255,0.38); margin: 0; }

  /* GHOST BUTTON */
  .fr-ghost-btn {
    position: relative; overflow: hidden;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 22px;
    background: rgba(12,16,32,0.85); border: 1px solid rgba(212,168,80,0.22); border-radius: 12px;
    font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(212,168,80,0.7); cursor: pointer; transition: all 0.35s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .fr-ghost-btn::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,168,80,0.5), transparent); }
  .fr-ghost-btn::after  { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); transform: skewX(-20deg); animation: frShine 4s ease-in-out infinite; }
  .fr-ghost-btn.fr-ghost-on { background: rgba(109,40,217,0.18); border-color: rgba(109,40,217,0.45); color: #c084fc; box-shadow: 0 0 24px rgba(109,40,217,0.3), 0 4px 20px rgba(0,0,0,0.4); }
  .fr-ghost-btn:hover { border-color: rgba(212,168,80,0.5); color: #e8c87a; box-shadow: 0 0 20px rgba(212,168,80,0.18), 0 4px 20px rgba(0,0,0,0.4); transform: translateY(-1px); }
  .fr-ghost-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(212,168,80,0.6); flex-shrink: 0; transition: all 0.35s; }
  .fr-ghost-btn.fr-ghost-on .fr-ghost-dot { background: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.8); animation: frGhostPulse 1.8s ease-in-out infinite; }

  /* STATUS BAR */
  .fr-status-bar { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding: 12px 18px; background: rgba(12,16,32,0.6); border: 1px solid rgba(212,168,80,0.1); border-radius: 10px; flex-wrap: wrap; }
  .fr-status-item { display: flex; align-items: center; gap: 8px; font-family: 'Space Mono', monospace; font-size: 9.5px; letter-spacing: 1px; color: rgba(212,168,80,0.5); }
  .fr-status-dot { width: 6px; height: 6px; border-radius: 50%; }
  .fr-status-dot.fr-sd-online  { background: #4ade80; box-shadow: 0 0 6px rgba(74,222,128,0.8); animation: frOnlinePulse 2s infinite; }
  .fr-status-dot.fr-sd-warning { background: #f59e0b; }
  .fr-status-dot.fr-sd-error   { background: #ef4444; }
  .fr-status-val { color: #e8c87a; font-weight: 700; }

  /* GRID */
  .fr-grid { display: grid; grid-template-columns: minmax(0,1.3fr) 340px; gap: 24px; margin-bottom: 28px; }

  /* MAP CHAMBER */
  .fr-map-chamber {
    position: relative; border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(212,168,80,0.22);
    box-shadow: 0 0 0 1px rgba(212,168,80,0.05), 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(212,168,80,0.06) inset;
  }
  .fr-map-chamber::before { content:''; position:absolute; top:0; left:15%; right:15%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.7),transparent); z-index:20; pointer-events:none; }
  .fr-map-chamber::after  { content:''; position:absolute; bottom:0; left:15%; right:15%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent); z-index:20; pointer-events:none; }
  
  .fr-map-inner { height: 520px; position: relative; }
  
  /* 🔥 CHANGE 1: Naya Map CSS Filter */
  .fr-map-inner .leaflet-container { 
    height: 100%; width: 100%; background: #020617 !important; 
    filter: brightness(0.72) contrast(1.35) saturate(0.45) sepia(0.55) hue-rotate(5deg) invert(0); 
  }
  .fr-map-inner .leaflet-tile-container {
    filter: brightness(1) contrast(1.1);
  }

  /* 🔥 CHANGE 4: Map vignette & glow edges */
  .fr-map-inner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(6,8,15,0.55) 75%, rgba(6,8,15,0.85) 100%);
    pointer-events: none;
    z-index: 15;
  }
  .fr-map-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top left, rgba(212,168,80,0.08) 0%, transparent 45%),
                radial-gradient(ellipse at bottom right, rgba(212,168,80,0.06) 0%, transparent 45%);
    pointer-events: none;
    z-index: 14;
  }

  .fr-corner { position:absolute; width:22px; height:22px; border-color:rgba(212,168,80,0.6); border-style:solid; z-index:30; pointer-events:none; }
  .fr-corner-tl { top:12px; left:12px;  border-width:2px 0 0 2px; border-radius:4px 0 0 0; }
  .fr-corner-tr { top:12px; right:12px; border-width:2px 2px 0 0; border-radius:0 4px 0 0; }
  .fr-corner-bl { bottom:12px; left:12px;  border-width:0 0 2px 2px; border-radius:0 0 0 4px; }
  .fr-corner-br { bottom:12px; right:12px; border-width:0 2px 2px 0; border-radius:0 0 4px 0; }
  .fr-radar-overlay { position:absolute; inset:0; pointer-events:none; z-index:25; }
  .fr-sweep-group { animation: frSweep 4s linear infinite; }
  .fr-map-label {
    position:absolute; top:16px; left:50%; transform:translateX(-50%);
    z-index:30; pointer-events:none;
    font-family:'Space Mono',monospace; font-size:8.5px; letter-spacing:3px; text-transform:uppercase; color:rgba(212,168,80,0.5);
    background:rgba(6,8,15,0.7); padding:4px 14px; border:1px solid rgba(212,168,80,0.18); border-radius:20px; backdrop-filter:blur(8px);
  }
  .fr-coords-hud {
    position:absolute; bottom:16px; left:16px; z-index:30; pointer-events:none;
    font-family:'Space Mono',monospace; font-size:8px; letter-spacing:1px; color:rgba(212,168,80,0.45);
    background:rgba(6,8,15,0.75); padding:6px 12px; border:1px solid rgba(212,168,80,0.12); border-radius:8px; backdrop-filter:blur(8px); line-height:1.6;
  }
  .fr-member-hud {
    position:absolute; bottom:16px; right:16px; z-index:30; pointer-events:none;
    display:flex; align-items:center; gap:8px;
    font-family:'Space Mono',monospace; font-size:8px; letter-spacing:1px; color:rgba(212,168,80,0.45);
    background:rgba(6,8,15,0.75); padding:6px 12px; border:1px solid rgba(212,168,80,0.12); border-radius:8px; backdrop-filter:blur(8px);
  }
  .fr-member-hud-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.8); animation:frOnlinePulse 2s infinite; }

  /* PANEL */
  .fr-panel { display:flex; flex-direction:column; background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22); border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.6); position:relative; }
  .fr-panel::before { content:''; position:absolute; top:0; left:15%; right:15%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.65),transparent); }
  .fr-panel-header { padding:18px 18px 14px; border-bottom:1px solid rgba(212,168,80,0.08); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .fr-panel-title { font-family:'Cinzel',serif; font-size:11px; font-weight:700; color:#e8c87a; letter-spacing:2px; text-transform:uppercase; }
  .fr-panel-count { font-family:'Space Mono',monospace; font-size:8.5px; color:rgba(212,168,80,0.45); letter-spacing:1px; }
  .fr-panel-body { flex:1; overflow-y:auto; padding:12px; max-height:450px; }
  .fr-panel-body::-webkit-scrollbar { width:3px; }
  .fr-panel-body::-webkit-scrollbar-thumb { background:rgba(212,168,80,0.2); border-radius:10px; }

  /* MEMBER CARD */
  .fr-member-card {
    padding:14px 14px 12px; background:rgba(255,255,255,0.02); border:1px solid rgba(212,168,80,0.1);
    border-radius:14px; margin-bottom:10px; transition:all 0.25s; position:relative; overflow:hidden;
  }
  .fr-member-card::before { content:''; position:absolute; top:0; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.3),transparent); }
  .fr-member-card:hover { background:rgba(212,168,80,0.05); border-color:rgba(212,168,80,0.22); transform:translateX(2px); }
  .fr-member-card.fr-me { background:rgba(212,168,80,0.06); border-color:rgba(212,168,80,0.2); }
  .fr-member-card.fr-ghost-card { opacity:0.55; filter:blur(0.3px); }
  .fr-member-card-top { display:flex; align-items:center; gap:12px; margin-bottom:10px; }

  /* SOUL ORB */
  .fr-orb-wrap { position:relative; width:38px; height:38px; flex-shrink:0; }
  .fr-orb {
    width:38px; height:38px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Cinzel',serif; font-size:12px; font-weight:700; color:#06080f;
    background:radial-gradient(circle at 35% 35%,#e8c87a,#c4a054,#7a5e28);
    border:1.5px solid rgba(212,168,80,0.5); box-shadow:0 0 14px rgba(212,168,80,0.35); transition:all 0.3s;
    position:relative; overflow:hidden;
  }
  .fr-orb.fr-orb-online { box-shadow:0 0 0 2px rgba(74,222,128,0.3),0 0 20px rgba(212,168,80,0.5),0 0 40px rgba(212,168,80,0.2); animation:frOrbGlow 2.5s ease-in-out infinite; }
  .fr-orb.fr-orb-ghost  { background:radial-gradient(circle at 35% 35%,#a78bfa,#7c3aed,#4c1d95); border-color:rgba(139,92,246,0.5); box-shadow:0 0 14px rgba(139,92,246,0.4); }
  .fr-orb-ring   { position:absolute; inset:-6px;  border-radius:50%; border:1px solid rgba(212,168,80,0.3); animation:frOrbRing 2.5s ease-out infinite; }
  .fr-orb-ring-2 { position:absolute; inset:-12px; border-radius:50%; border:1px solid rgba(212,168,80,0.15); animation:frOrbRing 2.5s ease-out infinite 0.8s; }
  .fr-orb-img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
  .fr-si { position:absolute; bottom:1px; right:1px; width:10px; height:10px; border-radius:50%; border:2px solid rgba(12,16,32,0.9); }
  .fr-si-online  { background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.9); }
  .fr-si-offline { background:#6b7280; }
  .fr-si-ghost   { background:#a855f7; box-shadow:0 0 6px rgba(168,85,247,0.9); animation:frGhostPulse 2s infinite; }
  .fr-member-info { flex:1; min-width:0; }
  .fr-member-name { font-family:'Cinzel',serif; font-size:11px; color:#e8c87a; letter-spacing:0.5px; margin-bottom:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .fr-member-role { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:10px; color:rgba(255,255,255,0.35); }
  .fr-member-dist { font-family:'Space Mono',monospace; font-size:8.5px; color:rgba(212,168,80,0.6); letter-spacing:0.5px; text-align:right; flex-shrink:0; }
  .fr-member-stats { display:flex; gap:8px; flex-wrap:wrap; }
  .fr-chip { display:flex; align-items:center; gap:5px; padding:3px 9px; background:rgba(212,168,80,0.06); border:1px solid rgba(212,168,80,0.12); border-radius:20px; font-family:'Space Mono',monospace; font-size:7.5px; letter-spacing:0.5px; color:rgba(212,168,80,0.5); }
  .fr-chip.fr-chip-on  { background:rgba(74,222,128,0.08);  border-color:rgba(74,222,128,0.2);  color:#4ade80; }
  .fr-chip.fr-chip-gh  { background:rgba(168,85,247,0.1);   border-color:rgba(168,85,247,0.25); color:#c084fc; }
  .fr-chip.fr-chip-off { background:rgba(107,114,128,0.08); border-color:rgba(107,114,128,0.2); color:rgba(255,255,255,0.3); }

  /* ACTIVITY */
  .fr-activity { background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22); border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.6); position:relative; }
  .fr-activity::before { content:''; position:absolute; top:0; left:15%; right:15%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.65),transparent); }
  .fr-activity::after  { content:''; position:absolute; bottom:0; left:15%; right:15%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent); }
  .fr-act-c { position:absolute; width:16px; height:16px; border-color:rgba(212,168,80,0.45); border-style:solid; }
  .fr-act-c-tl { top:10px; left:10px;  border-width:1px 0 0 1px; border-radius:3px 0 0 0; }
  .fr-act-c-tr { top:10px; right:10px; border-width:1px 1px 0 0; border-radius:0 3px 0 0; }
  .fr-act-c-bl { bottom:10px; left:10px;  border-width:0 0 1px 1px; border-radius:0 0 0 3px; }
  .fr-act-c-br { bottom:10px; right:10px; border-width:0 1px 1px 0; border-radius:0 0 3px 0; }
  .fr-act-header { padding:22px 24px 18px; border-bottom:1px solid rgba(212,168,80,0.08); display:flex; align-items:center; gap:14px; }
  .fr-act-icon-wrap { width:36px; height:36px; border-radius:10px; background:rgba(212,168,80,0.08); border:1px solid rgba(212,168,80,0.2); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .fr-act-title    { font-family:'Cinzel',serif; font-size:13px; font-weight:700; color:#e8c87a; letter-spacing:1.5px; text-shadow:0 0 20px rgba(212,168,80,0.3); }
  .fr-act-subtitle { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:11px; color:rgba(255,255,255,0.3); margin-top:1px; }
  .fr-act-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; padding:20px 24px 24px; }
  .fr-act-entry {
    display:flex; gap:14px; align-items:flex-start; padding:16px;
    background:rgba(255,255,255,0.02); border:1px solid rgba(212,168,80,0.1); border-radius:14px;
    transition:all 0.25s; position:relative; overflow:hidden;
  }
  .fr-act-entry::before { content:''; position:absolute; top:0; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.25),transparent); }
  .fr-act-entry:hover { background:rgba(212,168,80,0.05); border-color:rgba(212,168,80,0.2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
  .fr-act-scroll-icon { width:38px; height:38px; border-radius:10px; flex-shrink:0; background:rgba(212,168,80,0.08); border:1px solid rgba(212,168,80,0.18); display:flex; align-items:center; justify-content:center; font-size:16px; }
  .fr-act-body { flex:1; min-width:0; }
  .fr-act-user { font-family:'Cinzel',serif; font-size:10.5px; color:#e8c87a; letter-spacing:0.5px; margin-bottom:3px; }
  .fr-act-text { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:12px; color:rgba(255,255,255,0.5); line-height:1.5; margin:0 0 10px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
  .fr-act-footer { display:flex; justify-content:space-between; align-items:center; }
  .fr-act-time { font-family:'Space Mono',monospace; font-size:8px; color:rgba(212,168,80,0.35); letter-spacing:0.5px; }
  .fr-act-link { font-family:'Space Mono',monospace; font-size:8.5px; letter-spacing:1px; text-transform:uppercase; color:rgba(212,168,80,0.7); text-decoration:none; padding:4px 12px; background:rgba(212,168,80,0.08); border:1px solid rgba(212,168,80,0.2); border-radius:20px; transition:all 0.22s; }
  .fr-act-link:hover { background:rgba(212,168,80,0.15); border-color:rgba(212,168,80,0.4); color:#e8c87a; }
  .fr-empty { padding:40px; text-align:center; font-family:'Cormorant Garamond',serif; font-style:italic; font-size:16px; color:rgba(212,168,80,0.3); }
  .fr-empty-icon { font-size:28px; margin-bottom:10px; opacity:0.4; }
  .fr-error-bar { padding:10px 16px; margin-bottom:16px; background:rgba(220,60,60,0.12); border:1px solid rgba(220,60,60,0.28); border-radius:10px; color:#f08080; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.5px; display:flex; align-items:center; gap:8px; }
  .fr-rune-foot { padding:10px; border-top:1px solid rgba(212,168,80,0.07); text-align:center; font-family:'Cinzel',serif; font-size:9px; letter-spacing:4px; color:rgba(212,168,80,0.18); user-select:none; }

  /* LEAFLET POPUP */
  .fr-root .leaflet-popup-content-wrapper { background:rgba(10,14,24,0.97) !important; border:1px solid rgba(212,168,80,0.35) !important; border-radius:14px !important; padding:0 !important; box-shadow:0 16px 40px rgba(0,0,0,0.7) !important; backdrop-filter:blur(16px); }
  .fr-root .leaflet-popup-tip { background:rgba(10,14,24,0.97) !important; }
  .fr-root .leaflet-popup-content { margin:0 !important; }

  /* KEYFRAMES */
  @keyframes frFloat { 0%{opacity:0;transform:translate(0,0) scale(1)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
  @keyframes frSweep { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes frShine { 0%,70%{left:-100%} 100%{left:150%} }
  @keyframes frOnlinePulse  { 0%,100%{box-shadow:0 0 6px rgba(74,222,128,.7)} 50%{box-shadow:0 0 12px rgba(74,222,128,1)} }
  @keyframes frGhostPulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes frOrbGlow  { 0%,100%{box-shadow:0 0 0 2px rgba(74,222,128,0.3),0 0 20px rgba(212,168,80,0.5)} 50%{box-shadow:0 0 0 3px rgba(74,222,128,0.5),0 0 32px rgba(212,168,80,0.8)} }
  @keyframes frOrbRing  { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }
  @keyframes frMyPulse  { 0%{box-shadow:0 0 0 0 rgba(212,168,80,0.7)} 70%{box-shadow:0 0 0 14px rgba(212,168,80,0)} 100%{box-shadow:0 0 0 0 rgba(212,168,80,0)} }
  @keyframes frOtPulse  { 0%{box-shadow:0 0 0 0 rgba(168,85,247,0.7)} 70%{box-shadow:0 0 0 10px rgba(168,85,247,0)} 100%{box-shadow:0 0 0 0 rgba(168,85,247,0)} }

  @media (max-width:900px) { .fr-grid{grid-template-columns:1fr} .fr-map-inner{height:380px} }
  @media (max-width:600px) { .fr-act-grid{grid-template-columns:1fr} .fr-page-title{font-size:1.6rem} }
`;

// ── Leaflet icons ─────────────────────────────────────────────────────────────
const myIcon = () => L.divIcon({
  className: '', iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-16],
  html:`<div style="width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#e8c87a,#c4a054,#7a5e28);border:2.5px solid rgba(232,200,122,0.9);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:#06080f;animation:frMyPulse 2s infinite;position:relative;"><span>✦</span><div style="position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(212,168,80,0.25);animation:frOrbRing 2.5s ease-out infinite;pointer-events:none;"></div></div>`,
});

const otherIcon = (init='?', online=false) => L.divIcon({
  className:'', iconSize:[24,24], iconAnchor:[12,12], popupAnchor:[0,-14],
  html:`<div style="width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#c084fc,#7c3aed,#4c1d95);border:2px solid rgba(168,85,247,${online?'0.85':'0.4'});display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:#fff;${online?'animation:frOtPulse 2.2s infinite;':''}position:relative;"><span>${init}</span>${online?`<div style="position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(168,85,247,0.2);animation:frOrbRing 2.5s ease-out infinite 0.4s;pointer-events:none;"></div>`:''}</div>`,
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

function StarCanvas() {
  const ref=useRef(null),raf=useRef(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const stars=Array.from({length:120},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.1+0.2,sp:Math.random()*0.007+0.002,ph:Math.random()*Math.PI*2}));
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize(); window.addEventListener('resize',resize);
    const draw=t=>{ctx.clearRect(0,0,canvas.width,canvas.height);stars.forEach(s=>{const a=0.2+0.4*(0.5+0.5*Math.sin(t*s.sp+s.ph));ctx.beginPath();ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(212,180,80,${a})`;ctx.fill();});};
    const animate=ts=>{draw(ts*0.001);raf.current=requestAnimationFrame(animate);};
    raf.current=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={ref} className="fr-star-canvas"/>;
}

function DustLayer() {
  const motes=useMemo(()=>Array.from({length:16},(_,i)=>{
    const sz=Math.random()*3+1.2,gold=Math.random()>0.35,dur=`${Math.random()*9+6}s`,delay=`${Math.random()*10}s`,tx=`${(Math.random()-0.5)*110}px`,ty=`${-(Math.random()*70+30)}px`;
    return{id:i,sz,gold,dur,delay,tx,ty,x:Math.random()*100,y:Math.random()*100};
  }),[]);
  return(<div className="fr-dust">{motes.map(m=>(<div key={m.id} className="fr-mote" style={{width:m.sz,height:m.sz,left:`${m.x}%`,top:`${m.y}%`,background:`radial-gradient(circle,${m.gold?'rgba(255,200,80,0.65)':'rgba(180,200,255,0.45)'} 0%,transparent 70%)`,'--dur':m.dur,'--delay':m.delay,'--tx':m.tx,'--ty':m.ty}}/>))}</div>);
}

function RadarOverlay({width,height}){
  const cx=width/2,cy=height/2,maxR=Math.min(width,height)*0.48;
  return(
    /* 🔥 CHANGE 3: Opacity badhayi for better radar feel */
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.28,pointerEvents:'none',zIndex:25}} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="frSG" cx="0%" cy="50%" r="100%"><stop offset="0%" stopColor="rgba(212,168,80,0.55)"/><stop offset="100%" stopColor="rgba(212,168,80,0)"/></radialGradient>
        <radialGradient id="frCG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(212,168,80,0.12)"/><stop offset="100%" stopColor="rgba(212,168,80,0)"/></radialGradient>
      </defs>
      {[0.25,0.5,0.75,1].map((r,i)=><circle key={i} cx={cx} cy={cy} r={maxR*r} fill="none" stroke="rgba(212,168,80,0.15)" strokeWidth="0.5"/>)}
      <line x1={cx} y1={cy-maxR} x2={cx} y2={cy+maxR} stroke="rgba(212,168,80,0.08)" strokeWidth="0.5"/>
      <line x1={cx-maxR} y1={cy} x2={cx+maxR} y2={cy} stroke="rgba(212,168,80,0.08)" strokeWidth="0.5"/>
      <circle cx={cx} cy={cy} r={maxR} fill="url(#frCG)"/>
      <circle cx={cx} cy={cy} r={4} fill="rgba(212,168,80,0.7)"/>
      <g className="fr-sweep-group" style={{transformOrigin:`${cx}px ${cy}px`}}>
        <path d={`M ${cx} ${cy} L ${cx+maxR} ${cy} A ${maxR} ${maxR} 0 0 0 ${cx+maxR*Math.cos(-60*Math.PI/180)} ${cy+maxR*Math.sin(-60*Math.PI/180)} Z`} fill="url(#frSG)" opacity="0.5"/>
        <line x1={cx} y1={cy} x2={cx+maxR} y2={cy} stroke="rgba(212,168,80,0.85)" strokeWidth="1.5" style={{filter:'drop-shadow(0 0 4px rgba(212,168,80,1))'}}/>
      </g>
      {Array.from({length:36},(_,i)=>{const a=(i*10-90)*Math.PI/180,maj=i%9===0,len=maj?8:4,r1=maxR-len;return(<line key={i} x1={cx+r1*Math.cos(a)} y1={cy+r1*Math.sin(a)} x2={cx+maxR*Math.cos(a)} y2={cy+maxR*Math.sin(a)} stroke={`rgba(212,168,80,${maj?0.4:0.15})`} strokeWidth={maj?1:0.5}/>);})}
    </svg>
  );
}

function PopupContent({name,isMe,isOnline,isGhost,distance,time}){
  return(
    <div style={{padding:'14px 16px',minWidth:160}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'#e8c87a',letterSpacing:1,marginBottom:6,textShadow:'0 0 12px rgba(212,168,80,0.5)'}}>{name}{isMe?' (You)':''}</div>
      {isGhost?(<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:11,color:'#c084fc'}}>Ghost mode active 👻</div>):(
        <>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:isOnline?'#4ade80':'#6b7280',display:'inline-block',boxShadow:isOnline?'0 0 6px rgba(74,222,128,0.8)':'none'}}/>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8.5,letterSpacing:0.5,color:isOnline?'#4ade80':'rgba(255,255,255,0.35)'}}>{isOnline?'ACTIVE NOW':`LAST SEEN ${time}`}</span>
          </div>
          {distance&&distance!=='--'&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:'rgba(212,168,80,0.55)',letterSpacing:0.5}}>{distance}</div>}
        </>
      )}
      <div style={{marginTop:10,height:1,background:'linear-gradient(90deg,transparent,rgba(212,168,80,0.35),transparent)'}}/>
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
  const [recentActivities,setRecentActivities]=useState([]);
  const [activityLoading,setActivityLoading]=useState(true);
  const [mapSize,setMapSize]=useState({w:800,h:520});
  const chamberRef=useRef(null);

  useEffect(()=>{
    if(!chamberRef.current)return;
    const obs=new ResizeObserver(entries=>{for(const e of entries)setMapSize({w:e.contentRect.width,h:e.contentRect.height});});
    obs.observe(chamberRef.current);
    return()=>obs.disconnect();
  },[]);

  const formatTime=iso=>{if(!iso)return'--';try{return new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}catch{return'--';}};
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

  useEffect(()=>{
    const fetch=async()=>{
      if(!familyCircleId){setActivityLoading(false);return;}
      try{const s=await getCircleFeedApi(familyCircleId);setRecentActivities(s.slice(0,10).map(x=>({id:x._id,user:x.user?.name||'Someone',text:`inscribed a new memory: "${x.title}"`,time:new Date(x.createdAt),link:`/vault-stories/${x._id}`})));}
      catch{}finally{setActivityLoading(false);}
    };fetch();
  },[familyCircleId]);

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
      <StarCanvas/><DustLayer/>

      <motion.div className="fr-content" initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:[0.16,1,0.3,1]}}>

        {/* HEADER */}
        <div className="fr-header">
          <div>
            <div className="fr-eyebrow"><div className="fr-eyebrow-line"/><span className="fr-eyebrow-text">Oracle Surveillance · Live</span><div className="fr-eyebrow-line-r"/></div>
            <h1 className="fr-page-title">Family Radar</h1>
            <p className="fr-page-sub">The Oracle watches over all souls in the vault</p>
          </div>
          <motion.button className={`fr-ghost-btn${isGhostModeOn?' fr-ghost-on':''}`} onClick={handleToggleGhostMode} whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
            <span className="fr-ghost-dot"/><span>{isGhostModeOn?'Ghost Mode · ON':'Ghost Mode · OFF'}</span><span style={{fontSize:16}}>{isGhostModeOn?'👻':'📡'}</span>
          </motion.button>
        </div>

        {/* STATUS BAR */}
        <div className="fr-status-bar">
          <div className="fr-status-item"><span className={`fr-status-dot ${myLocation?'fr-sd-online':loadingLoc?'fr-sd-warning':'fr-sd-error'}`}/><span>GPS: <span className="fr-status-val">{myLocation?'LOCKED':loadingLoc?'SCANNING':'ERROR'}</span></span></div>
          <div className="fr-status-item"><span className={`fr-status-dot ${radarLoading?'fr-sd-warning':'fr-sd-online'}`}/><span>Radar: <span className="fr-status-val">{radarLoading?'SYNCING':'ACTIVE'}</span></span></div>
          <div className="fr-status-item"><span className="fr-status-dot fr-sd-online"/><span>Souls: <span className="fr-status-val">{visibleMembers.length}</span></span></div>
          {myLocation&&<div className="fr-status-item"><span>Coords: <span className="fr-status-val">{myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}</span></span></div>}
          {isGhostModeOn&&<div className="fr-status-item"><span className="fr-status-dot fr-sd-warning"/><span style={{color:'#c084fc'}}>GHOST MODE — invisible to family</span></div>}
        </div>

        <AnimatePresence>
          {locError&&<motion.div className="fr-error-bar" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>{locError}</motion.div>}
          {radarError&&<motion.div className="fr-error-bar" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>{radarError}</motion.div>}
        </AnimatePresence>

        {/* MAIN GRID */}
        <div className="fr-grid">

          {/* MAP */}
          <div className="fr-map-chamber">
            <div className="fr-corner fr-corner-tl"/><div className="fr-corner fr-corner-tr"/>
            <div className="fr-corner fr-corner-bl"/><div className="fr-corner fr-corner-br"/>
            <div className="fr-map-label">◉ ORACLE'S EYE · LIVE SURVEILLANCE</div>
            <div className="fr-map-inner" ref={chamberRef}>
              <MapContainer center={center} zoom={13} style={{height:'100%',width:'100%',zIndex:0}} scrollWheelZoom touchZoom dragging zoomControl={false}>
                <TouchpadPanHandler/>
                {/* 🔥 CHANGE 2: Naya TileLayer */}
                <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
                {myLocation&&!isGhostModeOn&&(
                  <><Marker icon={myIcon()} position={[myLocation.lat,myLocation.lng]}><Popup><PopupContent name={user?.name||'You'} isMe isOnline/></Popup></Marker>
                  <Circle center={[myLocation.lat,myLocation.lng]} radius={120} pathOptions={{color:'rgba(212,168,80,0.6)',fillColor:'rgba(212,168,80,0.06)',fillOpacity:1,weight:1}}/>
                  <Circle center={[myLocation.lat,myLocation.lng]} radius={300} pathOptions={{color:'rgba(212,168,80,0.2)',fillColor:'rgba(212,168,80,0.02)',fillOpacity:1,weight:0.5,dashArray:'4 8'}}/></>
                )}
                {visibleMembers.map(m=>(
                  <Marker key={m._id} icon={otherIcon(init(m.name),m.isOnline)} position={[m.latitude,m.longitude]}>
                    <Popup><PopupContent name={m.name} isOnline={m.isOnline} distance={getDist(m)} time={timeAgo(m.updatedAt)}/></Popup>
                  </Marker>
                ))}
              </MapContainer>
              <RadarOverlay width={mapSize.w} height={mapSize.h}/>
            </div>
            {myLocation&&<div className="fr-coords-hud"><div>LAT {myLocation.lat.toFixed(5)}</div><div>LNG {myLocation.lng.toFixed(5)}</div></div>}
            <div className="fr-member-hud"><div className="fr-member-hud-dot"/>{visibleMembers.length} SOUL{visibleMembers.length!==1?'S':''} DETECTED</div>
          </div>

          {/* PANEL */}
          <div className="fr-panel">
            <div className="fr-panel-header"><span className="fr-panel-title">Soul Registry</span><span className="fr-panel-count">{members.length+1} SOULS</span></div>
            <div className="fr-panel-body">
              {/* Self */}
              <motion.div className="fr-member-card fr-me" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1}}>
                <div className="fr-member-card-top">
                  <div className="fr-orb-wrap">
                    <div className="fr-orb fr-orb-online">{user?.avatar?<img src={user.avatar} alt="" className="fr-orb-img"/>:(user?.name||'Y').slice(0,2).toUpperCase()}</div>
                    <div className="fr-orb-ring"/><div className="fr-orb-ring-2"/><span className={`fr-si fr-si-online`}/>
                  </div>
                  <div className="fr-member-info"><div className="fr-member-name">{user?.name||'You'}</div><div className="fr-member-role">Your soul · Present</div></div>
                </div>
                <div className="fr-member-stats">
                  {isGhostModeOn?<span className="fr-chip fr-chip-gh">👻 Ghost Mode</span>:<span className="fr-chip fr-chip-on">● Visible</span>}
                  <span className="fr-chip">✦ You</span>
                </div>
              </motion.div>

              {members.length===0&&!radarLoading&&<div className="fr-empty"><div className="fr-empty-icon">🔮</div><div>No other souls detected</div></div>}

              {members.map((m,i)=>(
                <motion.div key={m._id} className={`fr-member-card${m.isGhostModeOn?' fr-ghost-card':''}`} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.06}}>
                  <div className="fr-member-card-top">
                    <div className="fr-orb-wrap">
                      <div className={`fr-orb${m.isGhostModeOn?' fr-orb-ghost':m.isOnline?' fr-orb-online':''}`}>{init(m.name)}</div>
                      {m.isOnline&&!m.isGhostModeOn&&<><div className="fr-orb-ring"/><div className="fr-orb-ring-2"/></>}
                      <span className={`fr-si ${m.isGhostModeOn?'fr-si-ghost':m.isOnline?'fr-si-online':'fr-si-offline'}`}/>
                    </div>
                    <div className="fr-member-info"><div className="fr-member-name">{m.name}</div><div className="fr-member-role">{m.isGhostModeOn?'Concealed soul':m.isOnline?'Active soul':`Last seen ${timeAgo(m.updatedAt)}`}</div></div>
                    <div className="fr-member-dist">{getDist(m)}</div>
                  </div>
                  <div className="fr-member-stats">
                    {m.isGhostModeOn?<span className="fr-chip fr-chip-gh">👻 Hidden</span>:m.isOnline?<span className="fr-chip fr-chip-on">● Active</span>:<span className="fr-chip fr-chip-off">○ Offline</span>}
                    {!m.isGhostModeOn&&<span className="fr-chip">🕐 {formatTime(m.updatedAt)}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="fr-rune-foot">✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ✦</div>
          </div>
        </div>

        {/* ACTIVITY */}
        <motion.div className="fr-activity" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.6,ease:[0.16,1,0.3,1]}}>
          <div className="fr-act-c fr-act-c-tl"/><div className="fr-act-c fr-act-c-tr"/>
          <div className="fr-act-c fr-act-c-bl"/><div className="fr-act-c fr-act-c-br"/>
          <div className="fr-act-header">
            <div className="fr-act-icon-wrap">⚡</div>
            <div><div className="fr-act-title">Chronicle of Recent Deeds</div><div className="fr-act-subtitle">What the souls have inscribed in the vault</div></div>
          </div>
          {activityLoading?(
            <div className="fr-empty"><div className="fr-empty-icon">🔮</div><div>The Oracle reads the threads of fate...</div></div>
          ):recentActivities.length===0?(
            <div className="fr-empty"><div className="fr-empty-icon">📭</div><div>The vault lies silent. No recent deeds.</div></div>
          ):(
            <div className="fr-act-grid">
              {recentActivities.map((act,i)=>(
                <motion.div key={act.id} className="fr-act-entry" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35+i*0.05}}>
                  <div className="fr-act-scroll-icon">📜</div>
                  <div className="fr-act-body">
                    <div className="fr-act-user">{act.user}</div>
                    <p className="fr-act-text">{act.text}</p>
                    <div className="fr-act-footer"><span className="fr-act-time">{timeAgo(act.time)}</span><Link to={act.link} className="fr-act-link">View</Link></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}

export default FamilyRadarPage;