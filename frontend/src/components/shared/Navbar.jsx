import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';
import api from '../../api/axios';
import { connectSocket, getSocket } from '../../services/socket';
import ChampionDetailModal from '../modals/ChampionDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 Sidebar Components Import
import Sidebar, { LogoRing } from './Sidebar';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(212,168,80,0.25); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,80,0.5); }

  .lt-app-layout {
    display: flex; height: 100vh; overflow: hidden;
    background: #06080f; font-family: 'Cinzel', serif; position: relative;
  }

  /* ── Sidebar overlay ── */
  .lt-sb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(4,6,14,0.85);
    backdrop-filter: blur(8px);
    z-index: 45;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.3s, visibility 0.3s;
  }
  .lt-sb-overlay.lt-sb-vis {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  /* ═══════════════ SIDEBAR ═══════════════ */
  .lt-sidebar {
    position: relative; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, #080c1a 0%, #06080f 60%, #050710 100%);
    border-right: 1px solid rgba(212,168,80,0.18);
    overflow: hidden; white-space: nowrap; z-index: 50;
    transition: width 0.32s cubic-bezier(0.4,0,0.2,1),
                transform 0.32s cubic-bezier(0.4,0,0.2,1);
  }
  .lt-sidebar::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(212,168,80,0.65), transparent);
  }
  .lt-sidebar::after {
    content:''; position:absolute; top:0; left:0; width:1px; height:100%;
    background: linear-gradient(180deg, rgba(212,168,80,0.35), transparent 40%, transparent 60%, rgba(212,168,80,0.12));
  }

  .lt-sb-head {
    padding: 20px 14px 14px;
    border-bottom: 1px solid rgba(212,168,80,0.07);
    flex-shrink: 0;
  }

  /* Brand row */
  .lt-sb-brand { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .lt-sb-brand-sub {
    display:block; font-family:'Space Mono',monospace;
    font-size:7.5px; letter-spacing:2.8px; text-transform:uppercase;
    color:rgba(212,168,80,0.4); margin-bottom:2px;
  }
  .lt-sb-brand-name {
    display:block; font-family:'Cinzel',serif; font-size:13px; font-weight:700;
    color:#e8c87a; letter-spacing:1px;
    text-shadow:0 0 20px rgba(212,168,80,0.35);
  }

  /* User card */
  .lt-sb-user {
    display:flex; align-items:center; gap:10px; padding:8px 10px;
    background:rgba(212,168,80,0.04); border:1px solid rgba(212,168,80,0.12);
    border-radius:12px; cursor:pointer; transition:all 0.25s;
    position:relative; overflow:hidden;
  }
  .lt-sb-user::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.4),transparent);
  }
  .lt-sb-user:hover { background:rgba(212,168,80,0.08); border-color:rgba(212,168,80,0.22); }
  .lt-sb-avatar {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,#c4a054,#7a5e28);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cinzel',serif; font-size:11px; color:#06080f; font-weight:700;
    border:1.5px solid rgba(212,168,80,0.45);
    box-shadow:0 0 14px rgba(212,168,80,0.25); overflow:hidden;
  }
  .lt-sb-uname {
    font-family:'Cinzel',serif; font-size:10px; color:#e8c87a;
    letter-spacing:0.5px; overflow:hidden; text-overflow:ellipsis;
  }
  .lt-sb-urole {
    font-family:'Cormorant Garamond',serif; font-style:italic;
    font-size:10px; color:rgba(255,255,255,0.38); margin-top:1px;
  }
  .lt-sb-online {
    width:7px; height:7px; border-radius:50%; background:#4ade80;
    flex-shrink:0; margin-left:auto;
    box-shadow:0 0 8px rgba(74,222,128,0.8);
    animation:ltOnlinePulse 2.5s ease-in-out infinite;
  }

  /* Section labels */
  .lt-sb-section { padding:0 10px; margin-top:12px; }
  .lt-sec-label {
    font-family:'Space Mono',monospace; font-size:7.5px;
    letter-spacing:3px; text-transform:uppercase;
    color:rgba(212,168,80,0.35); padding:0 6px; margin-bottom:4px;
    display:flex; align-items:center; gap:8px;
  }
  .lt-sec-label::after {
    content:''; flex:1; height:1px;
    background:linear-gradient(90deg,rgba(212,168,80,0.2),transparent);
  }

  /* Nav links */
  .lt-sb-link {
    display:flex; align-items:center; gap:10px;
    padding:8px 10px; border-radius:10px; margin-bottom:2px;
    text-decoration:none; cursor:pointer;
    border:1px solid transparent; transition:all 0.22s; position:relative;
  }
  .lt-sb-link:hover { background:rgba(212,168,80,0.06); border-color:rgba(212,168,80,0.1); }
  .lt-sb-link.lt-active {
    background:rgba(212,168,80,0.09); border-color:rgba(212,168,80,0.22);
    box-shadow:inset 0 0 20px rgba(212,168,80,0.04);
  }
  .lt-sb-link.lt-active::before {
    content:''; position:absolute; left:0; top:20%; bottom:20%; width:2.5px;
    background:linear-gradient(180deg,#c4a054,#f0d080,#c4a054);
    border-radius:0 3px 3px 0;
    box-shadow:0 0 12px rgba(212,168,80,0.7), 0 0 4px rgba(212,168,80,1);
  }
  .lt-sb-icon {
    width:30px; height:30px; border-radius:8px; flex-shrink:0;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
    display:flex; align-items:center; justify-content:center; font-size:13px;
    transition:all 0.22s;
  }
  .lt-sb-link.lt-active .lt-sb-icon {
    background:rgba(212,168,80,0.13); border-color:rgba(212,168,80,0.28);
    box-shadow:0 0 12px rgba(212,168,80,0.18);
  }
  .lt-sb-link:hover .lt-sb-icon { background:rgba(212,168,80,0.07); border-color:rgba(212,168,80,0.14); }
  .lt-sb-lbl {
    font-family:'Cinzel',serif; font-size:10.5px;
    color:rgba(212,168,80,0.5); letter-spacing:0.5px; transition:color 0.22s;
  }
  .lt-sb-sublbl {
    font-family:'Cormorant Garamond',serif; font-style:italic;
    font-size:9.5px; color:rgba(212,168,80,0.28); margin-top:1px;
  }
  .lt-sb-link.lt-active .lt-sb-lbl { color:#e8c87a; text-shadow:0 0 20px rgba(212,168,80,0.4); }
  .lt-sb-link:hover .lt-sb-lbl     { color:rgba(212,168,80,0.82); }
  .lt-sb-link.lt-active .lt-sb-sublbl { color:rgba(212,168,80,0.5); }
  .lt-sb-badge {
    font-family:'Space Mono',monospace; font-size:8px;
    background:rgba(212,168,80,0.1); border:1px solid rgba(212,168,80,0.25);
    color:#e8c87a; border-radius:20px; padding:1px 7px;
    margin-left:auto; flex-shrink:0;
  }
  .lt-sb-badge.lt-hot {
    background:rgba(239,99,39,0.12); border-color:rgba(239,99,39,0.35);
    color:#ef6327; box-shadow:0 0 8px rgba(239,99,39,0.25);
  }

  /* Sidebar footer */
  .lt-sb-foot {
    margin-top:auto; padding:10px;
    border-top:1px solid rgba(212,168,80,0.07);
  }
  .lt-sb-logout {
    display:flex; align-items:center; gap:10px; padding:8px 10px;
    border-radius:10px; cursor:pointer; background:none; width:100%;
    border:1px solid transparent; transition:all 0.22s;
  }
  .lt-sb-logout:hover { background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.16); }
  .lt-sb-logout:hover .lt-sb-lbl { color:rgba(239,68,68,0.72) !important; }
  .lt-sb-logout:hover .lt-sb-icon { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.22); }
  .lt-rune-footer {
    text-align:center; font-family:'Cinzel',serif; font-size:9px; letter-spacing:4px;
    color:rgba(212,168,80,0.18); user-select:none; padding:6px 0 2px;
  }

  /* ═══════════════ MAIN COLUMN ═══════════════ */
  .lt-main-col { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  /* ── TOP HEADER ── */
  .lt-top-header {
    height:66px; flex-shrink:0;
    background:rgba(6,8,15,0.97);
    border-bottom:1px solid rgba(212,168,80,0.14);
    backdrop-filter:blur(24px);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 22px; position:relative; z-index:40;
  }
  .lt-top-header::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.5),transparent);
  }
  .lt-top-header::after {
    content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.22),transparent);
  }
  /* Corner accents on header */
  .lt-hc { position:absolute; width:14px; height:14px; border-color:rgba(212,168,80,0.45); border-style:solid; }
  .lt-hc-tl { top:8px; left:10px; border-width:1px 0 0 1px; border-radius:3px 0 0 0; }
  .lt-hc-tr { top:8px; right:10px; border-width:1px 1px 0 0; border-radius:0 3px 0 0; }

  .lt-nb-left  { display:flex; align-items:center; gap:14px; }
  .lt-nb-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

  /* Hamburger */
  .lt-ham-btn {
    width:36px; height:36px; border-radius:9px;
    background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.22s; color:rgba(212,168,80,0.6); flex-shrink:0;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
  }
  .lt-ham-btn:hover {
    background:rgba(212,168,80,0.1); border-color:rgba(212,168,80,0.45);
    color:#e8c87a; box-shadow:0 0 14px rgba(212,168,80,0.18);
  }

  /* Header brand */
  .lt-header-brand { display:flex; align-items:center; gap:11px; user-select:none; }
  .lt-header-brand-sub {
    display:block; font-family:'Space Mono',monospace; font-size:7px;
    letter-spacing:3px; text-transform:uppercase; color:rgba(212,168,80,0.45); line-height:1;
  }
  .lt-header-brand-name {
    display:block; font-family:'Cinzel',serif; font-size:13px; font-weight:700;
    color:#e8c87a; letter-spacing:1.5px;
    text-shadow:0 0 24px rgba(212,168,80,0.4);
  }

  /* Search bar */
  .lt-search-form {
    display:flex; align-items:center; gap:9px;
    background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22);
    border-radius:30px; padding:7px 16px; transition:all 0.32s; width:220px;
    box-shadow:0 4px 20px rgba(0,0,0,0.3); position:relative; overflow:hidden;
  }
  .lt-search-form::before {
    content:''; position:absolute; top:0; left:20%; right:20%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.45),transparent);
  }
  .lt-search-form:focus-within {
    background:rgba(12,16,32,0.95); border-color:rgba(212,168,80,0.55);
    width:280px; box-shadow:0 0 0 3px rgba(212,168,80,0.08), 0 8px 30px rgba(0,0,0,0.4);
  }
  .lt-search-input {
    border:none; background:transparent; outline:none;
    font-family:'Cinzel',serif; font-size:11px;
    color:rgba(212,168,80,0.8); width:100%; letter-spacing:0.8px;
  }
  .lt-search-input::placeholder {
    color:rgba(212,168,80,0.32); font-style:normal;
    font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:1px;
  }
  .lt-search-icon { color:rgba(212,168,80,0.45); flex-shrink:0; display:flex; align-items:center; }

  /* Oracle */
  .lt-oracle-btn {
    display:flex; align-items:center;
    background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22);
    border-radius:30px; padding:5px; height:36px; width:36px;
    cursor:pointer; transition:all 0.4s ease;
    overflow:hidden; position:relative;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
  }
  .lt-oracle-btn:hover {
    width:152px; padding:5px 14px 5px 5px;
    background:linear-gradient(135deg,#3730a3,#6d28d9,#7c3aed);
    border-color:transparent;
    box-shadow:0 0 24px rgba(109,40,217,0.5), 0 0 0 1px rgba(212,168,80,0.2);
  }
  .lt-oracle-icon {
    width:26px; height:26px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; flex-shrink:0; transition:all 0.4s;
  }
  .lt-oracle-btn:hover .lt-oracle-icon { background:rgba(255,255,255,0.15); }
  .lt-oracle-sparkle { transition:all 0.4s; display:inline-block; }
  .lt-oracle-btn:hover .lt-oracle-sparkle { transform:scale(1.2) rotate(-10deg); filter:drop-shadow(0 0 8px rgba(255,255,255,0.9)); }
  .lt-oracle-text {
    max-width:0; opacity:0; font-size:10px; color:#fff;
    white-space:nowrap; overflow:hidden; transition:all 0.4s;
    letter-spacing:1.2px; font-family:'Cinzel',serif;
  }
  .lt-oracle-btn:hover .lt-oracle-text { max-width:120px; opacity:1; margin-left:9px; }

  /* Hub */
  .lt-hub-btn {
    display:flex; align-items:center; gap:8px; padding:6px 12px;
    background:rgba(12,16,32,0.85); color:rgba(212,168,80,0.65);
    border:1px solid rgba(212,168,80,0.22); border-radius:10px;
    cursor:pointer; transition:all 0.22s; height:36px;
    font-family:'Cinzel',serif; box-shadow:0 4px 12px rgba(0,0,0,0.3);
  }
  .lt-hub-btn:hover, .lt-hub-btn.lt-open {
    background:rgba(212,168,80,0.1); border-color:rgba(212,168,80,0.45);
    color:#e8c87a; box-shadow:0 0 16px rgba(212,168,80,0.15);
  }
  .lt-hub-name { max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10.5px; letter-spacing:0.5px; }
  .lt-hub-arrow { font-size:8px; opacity:0.45; transition:transform 0.22s; }
  .lt-hub-btn.lt-open .lt-hub-arrow { transform:rotate(180deg); }

  /* Dark dropdown */
  .lt-dark-dropdown {
    background:rgba(8,10,22,0.98); border:1px solid rgba(212,168,80,0.2);
    border-radius:14px; box-shadow:0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,80,0.05);
    overflow:hidden; min-width:220px; padding:8px; position:relative;
  }
  .lt-dark-dropdown::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent);
  }
  .lt-dd-header {
    font-family:'Space Mono',monospace; font-size:7.5px;
    letter-spacing:2.8px; color:rgba(212,168,80,0.38); text-transform:uppercase;
    padding:8px 12px 6px;
  }
  .lt-dd-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 13px; border-radius:9px; cursor:pointer;
    font-family:'Cinzel',serif; font-size:10.5px; color:rgba(212,168,80,0.52);
    letter-spacing:0.4px; transition:all 0.2s; border:1px solid transparent;
  }
  .lt-dd-item:hover  { background:rgba(212,168,80,0.07); border-color:rgba(212,168,80,0.14); color:rgba(212,168,80,0.9); }
  .lt-dd-item.lt-dd-active { background:rgba(212,168,80,0.12); border-color:rgba(212,168,80,0.24); color:#e8c87a; }
  .lt-dd-check { font-size:10px; color:#e8c87a; }

  /* Icon btn */
  .lt-icon-btn {
    width:36px; height:36px; border-radius:50%;
    background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:15px; transition:all 0.22s;
    position:relative; color:rgba(212,168,80,0.6);
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
  }
  .lt-icon-btn:hover {
    background:rgba(212,168,80,0.1); border-color:rgba(212,168,80,0.45);
    color:#e8c87a; box-shadow:0 0 16px rgba(212,168,80,0.18);
  }
  .lt-notif-badge {
    position:absolute; top:-3px; right:-3px;
    background:#ef4444; color:#fff; font-size:7.5px; font-weight:700;
    width:16px; height:16px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:2px solid #06080f;
  }

  /* Notif dropdown */
  .lt-notif-dropdown {
    width:330px; background:rgba(8,10,22,0.98);
    border:1px solid rgba(212,168,80,0.2); border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,0.7); overflow:hidden; position:relative;
  }
  .lt-notif-dropdown::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent);
  }
  .lt-notif-head {
    padding:13px 18px; border-bottom:1px solid rgba(212,168,80,0.08);
    display:flex; justify-content:space-between; align-items:center;
  }
  .lt-notif-title { font-family:'Space Mono',monospace; font-size:9px; color:#e8c87a; letter-spacing:2.5px; text-transform:uppercase; }
  .lt-notif-count { background:rgba(212,168,80,0.1); border:1px solid rgba(212,168,80,0.25); color:#e8c87a; padding:2px 9px; border-radius:20px; font-family:'Space Mono',monospace; font-size:8px; }
  .lt-notif-item { padding:12px 18px; border-bottom:1px solid rgba(212,168,80,0.05); display:flex; gap:11px; align-items:flex-start; transition:background 0.2s; cursor:pointer; }
  .lt-notif-item:hover { background:rgba(212,168,80,0.04); }
  .lt-notif-item.lt-unread { background:rgba(212,168,80,0.025); }
  .lt-notif-icon { width:32px; height:32px; border-radius:50%; flex-shrink:0; background:rgba(212,168,80,0.07); border:1px solid rgba(212,168,80,0.16); display:flex; align-items:center; justify-content:center; font-size:13px; }
  .lt-notif-msg { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:12px; color:rgba(212,168,80,0.6); line-height:1.5; margin:0 0 3px; }
  .lt-notif-msg.lt-unread-txt { color:rgba(255,255,255,0.75); font-style:normal; font-family:'Cinzel',serif; font-size:10px; }
  .lt-notif-date { font-family:'Space Mono',monospace; font-size:8px; color:rgba(212,168,80,0.3); letter-spacing:0.5px; }
  .lt-notif-empty { padding:36px; text-align:center; font-family:'Cormorant Garamond',serif; font-style:italic; color:rgba(212,168,80,0.28); font-size:14px; }
  .lt-accept-btn { flex:1; background:rgba(16,185,129,0.12); color:#6ee87a; border:1px solid rgba(16,185,129,0.28); padding:7px; border-radius:8px; font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:0.8px; cursor:pointer; transition:all 0.22s; }
  .lt-accept-btn:hover { background:rgba(16,185,129,0.22); }
  .lt-decline-btn { flex:1; background:rgba(239,68,68,0.08); color:rgba(239,68,68,0.7); border:1px solid rgba(239,68,68,0.22); padding:7px; border-radius:8px; font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:0.8px; cursor:pointer; transition:all 0.22s; }
  .lt-decline-btn:hover { background:rgba(239,68,68,0.16); }

  /* ── RUNE CRYSTAL STREAK ── */
  .lt-streak-wrap {
    display:flex; align-items:center; gap:8px; padding:5px 13px;
    background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22);
    border-radius:30px; height:36px; cursor:default; transition:all 0.35s;
    box-shadow:0 4px 12px rgba(0,0,0,0.3); position:relative; overflow:hidden;
  }
  .lt-streak-wrap::before {
    content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.45),transparent);
  }
  .lt-streak-wrap.lt-streak-lit {
    border-color:rgba(212,168,80,0.55);
    box-shadow:0 0 20px rgba(212,168,80,0.22), 0 4px 12px rgba(0,0,0,0.3);
    background:rgba(12,16,32,0.92);
  }
  .lt-rune-crystal { width:18px; height:22px; flex-shrink:0; transition:all 0.4s; filter:drop-shadow(0 0 0px rgba(212,168,80,0)); }
  .lt-streak-wrap.lt-streak-lit .lt-rune-crystal { filter:drop-shadow(0 0 8px rgba(232,200,122,0.9)) drop-shadow(0 0 3px rgba(255,220,100,1)); animation:ltCrystalPulse 2.2s ease-in-out infinite; }
  .lt-streak-num { font-family:'Cinzel',serif; font-size:13px; font-weight:700; color:rgba(212,168,80,0.45); letter-spacing:0.5px; transition:all 0.4s; }
  .lt-streak-wrap.lt-streak-lit .lt-streak-num { color:#e8c87a; text-shadow:0 0 14px rgba(212,168,80,0.7); }
  .lt-streak-label { font-family:'Space Mono',monospace; font-size:7px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(212,168,80,0.35); transition:color 0.4s; }
  .lt-streak-wrap.lt-streak-lit .lt-streak-label { color:rgba(212,168,80,0.65); }

  /* Avatar */
  .lt-avatar-btn {
    width:36px; height:36px; border-radius:50%; padding:2px;
    background:linear-gradient(135deg,#c4a054,#7a5e28);
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 16px rgba(212,168,80,0.25); transition:all 0.22s;
  }
  .lt-avatar-btn:hover { box-shadow:0 0 26px rgba(212,168,80,0.5); transform:scale(1.05); }
  .lt-avatar-inner {
    width:100%; height:100%; border-radius:50%; overflow:hidden;
    background:#0c1020; display:flex; align-items:center; justify-content:center;
    font-family:'Cinzel',serif; font-size:11px; color:#e8c87a;
  }

  /* Profile dropdown */
  .lt-profile-wrap { position:relative; }
  .lt-profile-dd {
    visibility:hidden; opacity:0; transform:translateY(-8px) scale(0.97);
    transition:all 0.22s ease;
    position:absolute; top:calc(100% + 12px); right:0; z-index:100;
  }
  .lt-profile-wrap:hover .lt-profile-dd { visibility:visible; opacity:1; transform:translateY(0) scale(1); }
  .lt-profile-box {
    min-width:235px; background:rgba(8,10,22,0.98);
    border:1px solid rgba(212,168,80,0.2); border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,0.7); overflow:hidden; position:relative;
  }
  .lt-profile-box::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.6),transparent);
  }
  .lt-profile-head { padding:14px 16px; border-bottom:1px solid rgba(212,168,80,0.08); display:flex; align-items:center; gap:11px; }
  .lt-profile-avatar { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#c4a054,#7a5e28); display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:11px; color:#06080f; font-weight:700; border:1px solid rgba(212,168,80,0.4); overflow:hidden; }
  .lt-profile-name  { font-family:'Cinzel',serif; font-size:11px; color:#e8c87a; letter-spacing:0.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lt-profile-email { font-family:'Space Mono',monospace; font-size:8.5px; color:rgba(212,168,80,0.38); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lt-profile-links { padding:8px; }
  .lt-profile-link { display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:9px 13px; background:transparent; border:1px solid transparent; font-family:'Cinzel',serif; font-size:10px; letter-spacing:0.5px; color:rgba(212,168,80,0.52); border-radius:9px; cursor:pointer; text-decoration:none; transition:all 0.22s; }
  .lt-profile-link:hover { background:rgba(212,168,80,0.07); border-color:rgba(212,168,80,0.14); color:rgba(212,168,80,0.9); }
  .lt-profile-link.lt-danger { color:rgba(239,68,68,0.55); }
  .lt-profile-link.lt-danger:hover { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.16); color:rgba(239,68,68,0.82); }
  .lt-profile-divider { height:1px; background:rgba(212,168,80,0.07); margin:4px 0; }

  .lt-page-wrap { flex:1; overflow-y:auto; position:relative; background:#06080f; }

  /* Mobile search */
  .lt-mobile-search { display:none; padding:0 14px 12px; }
  .lt-mobile-search-form { display:flex; align-items:center; background:rgba(12,16,32,0.85); border:1px solid rgba(212,168,80,0.22); border-radius:12px; padding:8px 14px; box-shadow:0 4px 12px rgba(0,0,0,0.3); }
  .lt-mobile-search-input { border:none; background:transparent; outline:none; padding-left:8px; width:100%; color:rgba(212,168,80,0.8); font-family:'Cinzel',serif; font-size:11px; letter-spacing:0.8px; }
  .lt-mobile-search-input::placeholder { color:rgba(212,168,80,0.32); font-style:normal; font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:1px; }

  /* ═══════ KEYFRAMES ═══════ */
  @keyframes ltRingSpin    { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes ltOnlinePulse { 0%,100%{box-shadow:0 0 8px rgba(74,222,128,.7)} 50%{box-shadow:0 0 14px rgba(74,222,128,1)} }
  @keyframes ltCrystalPulse {
    0%,100% { filter:drop-shadow(0 0 6px rgba(232,200,122,0.8)) drop-shadow(0 0 2px rgba(255,220,100,.9)); }
    50%     { filter:drop-shadow(0 0 16px rgba(232,200,122,1)) drop-shadow(0 0 8px rgba(255,240,150,1)); }
  }
  @keyframes ltShine { 0%,70%{left:-100%} 100%{left:150%} }
  @keyframes ltPulseGlow { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.5)} }

  /* 🔥 FIX: HYPER-STRICT HIDING LOGIC WHEN SIDEBAR IS OPEN */
  .lt-sidebar-open .lt-header-brand {
     display: none !important;
  }

  /* RESPONSIVE */
  @media (min-width:769px) {
    .lt-sidebar.lt-sb-open   { width:255px; }
    .lt-sidebar.lt-sb-closed { width:0; transform:translateX(-100%); }
    .lt-hide-desktop { display:none !important; }
    .lt-sb-overlay { display:none !important; }
  }
  @media (max-width:768px) {
    .lt-top-header { padding:0 14px; height:60px; }
    .lt-nb-right { gap:8px; }
    .lt-desktop-only { display:none !important; }
    .lt-sidebar { position:fixed; top:0; left:0; bottom:0; width:255px !important; transform:translateX(-100%); box-shadow:16px 0 60px rgba(0,0,0,0.6); }
    .lt-sidebar.lt-sb-open { transform:translateX(0); }
    .lt-sb-overlay { display:block; } /* keep render, but non-clickable unless .lt-sb-vis */
    .lt-sb-overlay.lt-sb-vis { opacity:1; visibility:visible; pointer-events:auto; }
    .lt-mobile-search { display:block; }
    .lt-notif-dropdown { width:290px; }
    .lt-oracle-btn, .lt-icon-btn, .lt-avatar-btn { width:34px; height:34px; }
  }
`;

// ─── RUNE CRYSTAL ─────────────────────────────────────────────────────────────
function RuneCrystal({ lit }) {
  const c  = lit ? '#e8c87a'             : 'rgba(212,168,80,0.3)';
  const cm = lit ? 'rgba(232,200,122,0.65)' : 'rgba(212,168,80,0.12)';
  const cf = lit ? 'rgba(212,168,80,0.16)' : 'rgba(212,168,80,0.04)';
  return (
    <svg className="lt-rune-crystal" viewBox="0 0 18 22" fill="none">
      <polygon points="9,1 16,7 13,20 5,20 2,7" fill={cf} stroke={c} strokeWidth="1"/>
      <polygon points="9,3 14,7.5 9,11 4,7.5" fill={cm} opacity="0.4"/>
      <polygon points="9,11 13,13 9,19 5,13" fill={cm} opacity="0.22"/>
      <line x1="9" y1="3" x2="9" y2="19" stroke={c} strokeWidth="0.5" opacity="0.5"/>
      <text x="9" y="15.5" textAnchor="middle" fontSize="5.5" fill={c} opacity="0.85" fontFamily="serif">ᛋ</text>
      <line x1="7" y1="2" x2="11" y2="2" stroke={c} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
function Navbar({ children }) {
  const { isAuthenticated, user, logout, switchActiveCircle } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [myCircles,         setMyCircles]         = useState([]);
  const [isHubOpen,         setIsHubOpen]         = useState(false);
  const [isNotifOpen,       setIsNotifOpen]       = useState(false);
  const [notifications,     setNotifications]     = useState([]);
  const [showChampionModal, setShowChampionModal] = useState(false);
  const [championUser,      setChampionUser]      = useState(null);
  const [isSidebarOpen,     setIsSidebarOpen]     = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');

  const hubRef   = useRef(null);
  const notifRef = useRef(null);

  const currentStreak    = user?.currentStreak || 0;
  const publicRoutes     = ['/login', '/signup'];
  const isPublicRoute    = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/invite/');
  const unreadCount      = notifications.filter(n => !n.isRead).length;
  const activeCircleName = myCircles.find(c => c._id === user?.activeCircleId)?.circleName || 'Select Family';
  const initials         = user?.name ? user.name.slice(0,2).toUpperCase() : 'M';

  useEffect(() => {
    if (isPublicRoute || !isAuthenticated || !user?._id) return;
    const fetchCircles = async () => {
      try {
        const res  = await getMyCirclesApi();
        const list = Array.isArray(res) ? res : (res?.data || res?.circles || []);
        setMyCircles(list);
        if (list.length > 0 && !user?.activeCircleId) switchActiveCircle(list[0]._id);
      } catch(e){ console.error(e); }
    };
    const fetchNotifs = async () => {
      try { const r = await api.get('/notifications'); setNotifications(r.data); } catch(e){ console.error(e); }
    };
    fetchCircles(); fetchNotifs();
    const sock = connectSocket();
    if (!sock) return;
    const onConn  = () => sock.emit('setup_user', user._id);
    const onNotif = (n) => setNotifications(p => [n,...p]);
    if (sock.connected) onConn();
    sock.on('connect', onConn); sock.on('new_notification', onNotif);
    return () => { const s = getSocket(); if(!s) return; s.off('connect',onConn); s.off('new_notification',onNotif); };
  }, [isPublicRoute, isAuthenticated, user?._id, user?.activeCircleId, switchActiveCircle]);

  useEffect(() => {
    if (isPublicRoute || !user?.activeCircleId) return;
    api.get(`/circles/${user.activeCircleId}/top-contributor`).then(r => setChampionUser(r.data)).catch(console.error);
  }, [isPublicRoute, user?.activeCircleId]);

  useEffect(() => {
    if (isPublicRoute) return;
    const h = e => {
      if (hubRef.current   && !hubRef.current.contains(e.target))   setIsHubOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isPublicRoute]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const markAsRead = async id => {
    try { await api.put(`/notifications/${id}/read`); setNotifications(p => p.map(n => n._id===id?{...n,isRead:true}:n)); } catch(e){ console.error(e); }
  };
  const handleAcceptInvite = async id => {
    try {
      await api.post(`/notifications/${id}/accept`);
      const [nr,cr] = await Promise.all([api.get('/notifications'), getMyCirclesApi()]);
      setNotifications(nr.data);
      setMyCircles(Array.isArray(cr)?cr:(cr?.data||cr?.circles||[]));
    } catch(e){ console.error(e); }
  };
  const handleRejectInvite = async id => {
    try { await api.post(`/notifications/${id}/reject`); const nr = await api.get('/notifications'); setNotifications(nr.data); } catch(e){ console.error(e); }
  };
  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); if(window.innerWidth<=768) setIsSidebarOpen(false); }
  };

  if (isPublicRoute || !isAuthenticated || !user?._id) return <>{children}</>;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {/* 🔥 Track Sidebar state globally for layout */}
      <div className={`lt-app-layout ${isSidebarOpen ? 'lt-sidebar-open' : ''}`}>

        {/* 🔥 SIDEBAR COMPONENT (Imported) */}
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          user={user}
          initials={initials}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          unreadCount={unreadCount}
          handleLogout={handleLogout}
        />

        {/* ══════ MAIN COLUMN ══════ */}
        <div className="lt-main-col">

          {/* TOP HEADER */}
          <header className="lt-top-header">
            <div className="lt-hc lt-hc-tl"/>
            <div className="lt-hc lt-hc-tr"/>

            <div className="lt-nb-left">
              {/* Hamburger */}
              <button className="lt-ham-btn" onClick={() => setIsSidebarOpen(p=>!p)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              {/* Header brand — Spinning ring + THE MEMENTO */}
              {/* 🔥 MAGIC FIX: Automatically hides completely when sidebar is open */}
              <div className="lt-header-brand lt-desktop-only">
                <LogoRing size={38}/>
                <div>
                  <span className="lt-header-brand-sub">The Memento</span>
                  <span className="lt-header-brand-name">THE LEGACY TRUNK</span>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="lt-search-form lt-desktop-only">
                <span className="lt-search-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </span>
                <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  placeholder="Search your legacy..." className="lt-search-input"/>
              </form>
            </div>

            <div className="lt-nb-right">

              {/* Oracle AI */}
              <motion.button onClick={() => navigate('/oracle')} className="lt-oracle-btn" whileTap={{scale:0.92}} title="Ask Oracle AI">
                <div className="lt-oracle-icon"><span className="lt-oracle-sparkle">🔮</span></div>
                <span className="lt-oracle-text">Ask Oracle AI</span>
              </motion.button>

              {/* Circle Hub */}
              <div ref={hubRef} style={{position:'relative'}}>
                <button onClick={() => setIsHubOpen(p=>!p)}
                  className={`lt-hub-btn lt-desktop-only${isHubOpen?' lt-open':''}`}>
                  <span style={{fontSize:13}}>🏰</span>
                  <span className="lt-hub-name">{activeCircleName}</span>
                  <span className="lt-hub-arrow">▼</span>
                </button>
                <AnimatePresence>
                  {isHubOpen && (
                    <motion.div style={{position:'absolute',top:'calc(100% + 12px)',right:0,zIndex:100}}
                      initial={{opacity:0,y:-8,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-6,scale:0.96}} transition={{duration:0.18}}>
                      <div className="lt-dark-dropdown">
                        <div className="lt-dd-header">Switch Legacy</div>
                        {myCircles.map(c => (
                          <div key={c._id} onClick={() => { switchActiveCircle(c._id); setIsHubOpen(false); }}
                            className={`lt-dd-item${user?.activeCircleId===c._id?' lt-dd-active':''}`}>
                            {c.circleName}
                            {user?.activeCircleId===c._id && <span className="lt-dd-check">✓</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <div ref={notifRef} style={{position:'relative'}}>
                <motion.button onClick={() => setIsNotifOpen(p=>!p)} className="lt-icon-btn" whileHover={{scale:1.06}} whileTap={{scale:0.9}}>
                  🔔
                  {unreadCount>0 && <span className="lt-notif-badge">{unreadCount}</span>}
                </motion.button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div style={{position:'absolute',top:'calc(100% + 12px)',right:0,zIndex:100}}
                      initial={{opacity:0,y:-8,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-6,scale:0.96}} transition={{duration:0.18}}>
                      <div className="lt-notif-dropdown">
                        <div className="lt-notif-head">
                          <span className="lt-notif-title">Notifications</span>
                          {unreadCount>0 && <span className="lt-notif-count">{unreadCount} New</span>}
                        </div>
                        <div style={{maxHeight:360,overflowY:'auto'}}>
                          {notifications.length===0 ? (
                            <div className="lt-notif-empty">
                              <div style={{fontSize:26,marginBottom:8,opacity:0.4}}>📭</div>
                              <div>All quiet in the vault</div>
                            </div>
                          ) : notifications.map(notif => {
                            const isInvite = notif.type==='invite';
                            const icon = notif.type==='like'?'❤️':notif.type==='comment'?'💬':isInvite?'✉️':'📌';
                            return (
                              <div key={notif._id} onClick={() => !isInvite && markAsRead(notif._id)}
                                className={`lt-notif-item${!notif.isRead?' lt-unread':''}`}>
                                <div className="lt-notif-icon">{icon}</div>
                                <div style={{flex:1}}>
                                  <p className={`lt-notif-msg${!notif.isRead?' lt-unread-txt':''}`}>{notif.message}</p>
                                  <span className="lt-notif-date">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                  {isInvite && !notif.isRead && (
                                    <div style={{display:'flex',gap:8,marginTop:10}}>
                                      <button onClick={e=>{e.stopPropagation();handleAcceptInvite(notif._id);}} className="lt-accept-btn">Accept</button>
                                      <button onClick={e=>{e.stopPropagation();handleRejectInvite(notif._id);}} className="lt-decline-btn">Decline</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── RUNE CRYSTAL STREAK ── */}
              <div className={`lt-streak-wrap${currentStreak>0?' lt-streak-lit':''}`}
                title={currentStreak>0?`Legacy Streak: ${currentStreak} Days`:'Post a memory to ignite your streak'}>
                <RuneCrystal lit={currentStreak>0}/>
                {currentStreak>0
                  ? <span className="lt-streak-num">{currentStreak}</span>
                  : <span className="lt-streak-label">Streak</span>
                }
              </div>

              {/* Avatar + profile dropdown */}
              <div className="lt-profile-wrap">
                <motion.button className="lt-avatar-btn" whileHover={{scale:1.06}} whileTap={{scale:0.92}}>
                  <div className="lt-avatar-inner">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : initials}
                  </div>
                </motion.button>
                <div className="lt-profile-dd">
                  <div className="lt-profile-box">
                    <div className="lt-profile-head">
                      <div className="lt-profile-avatar">
                        {user?.avatar
                          ? <img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          : initials}
                      </div>
                      <div style={{minWidth:0}}>
                        <div className="lt-profile-name">{user?.name||'Family Member'}</div>
                        <div className="lt-profile-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="lt-profile-links">
                      <button onClick={() => setShowChampionModal(true)} className="lt-profile-link">👑 &nbsp; Top Contributor</button>
                      <Link to="/profile?edit=true" className="lt-profile-link">✏️ &nbsp; Edit Profile</Link>
                      <Link to="/profile" className="lt-profile-link">🏛️ &nbsp; View Profile</Link>
                      <div className="lt-profile-divider"/>
                      <button onClick={handleLogout} className="lt-profile-link lt-danger">🚪 &nbsp; Leave the Vault</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </header>

          <main className="lt-page-wrap">{children}</main>
        </div>

        {showChampionModal && <ChampionDetailModal champion={championUser} onClose={() => setShowChampionModal(false)}/>}
      </div>
    </>
  );
}

export default Navbar;