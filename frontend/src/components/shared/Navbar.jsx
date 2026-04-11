import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getMyCirclesApi } from '../../api/circleApi';
import api from '../../api/axios';
import { connectSocket, getSocket } from '../../services/socket';
import ChampionDetailModal from '../modals/ChampionDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { LogoRing } from './Sidebar';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(212,168,80,0.25); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,80,0.5); }

  .lt-app-layout {
    display: flex; height: 100vh; overflow: hidden;
    background: #06080f; font-family: 'Cinzel', serif; position: relative;
  }

  .lt-sb-overlay {
    position: fixed; inset: 0;
    background: rgba(4,6,14,0.85); backdrop-filter: blur(8px);
    z-index: 45; opacity: 0; visibility: hidden; pointer-events: none;
    transition: opacity 0.3s, visibility 0.3s;
  }
  .lt-sb-overlay.lt-sb-vis { opacity: 1; visibility: visible; pointer-events: auto; }

  /* ═══════ SIDEBAR BASE ═══════ */
  .lt-sidebar {
    position: relative; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, #080c1a 0%, #06080f 60%, #050710 100%);
    border-right: 1px solid rgba(212,168,80,0.18);
    overflow: hidden; white-space: nowrap; z-index: 50;
    transition: width 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1);
  }
  .lt-sidebar::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(212,168,80,0.65), transparent);
  }
  .lt-sidebar::after {
    content:''; position:absolute; top:0; left:0; width:1px; height:100%;
    background: linear-gradient(180deg, rgba(212,168,80,0.35), transparent 40%, transparent 60%, rgba(212,168,80,0.12));
  }
  .lt-sb-head { padding: 20px 14px 14px; border-bottom: 1px solid rgba(212,168,80,0.07); flex-shrink: 0; }
  .lt-sb-brand { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .lt-sb-brand-sub { display:block; font-family:'Space Mono',monospace; font-size:7.5px; letter-spacing:2.8px; text-transform:uppercase; color:rgba(212,168,80,0.4); margin-bottom:2px; }
  .lt-sb-brand-name { display:block; font-family:'Cinzel',serif; font-size:13px; font-weight:700; color:#e8c87a; letter-spacing:1px; text-shadow:0 0 20px rgba(212,168,80,0.35); }
  .lt-sb-user { display:flex; align-items:center; gap:10px; padding:8px 10px; background:rgba(212,168,80,0.04); border:1px solid rgba(212,168,80,0.12); border-radius:12px; cursor:pointer; transition:all 0.25s; position:relative; overflow:hidden; }
  .lt-sb-user::before { content:''; position:absolute; top:0; left:15%; right:15%; height:1px; background:linear-gradient(90deg,transparent,rgba(212,168,80,0.4),transparent); }
  .lt-sb-user:hover { background:rgba(212,168,80,0.08); border-color:rgba(212,168,80,0.22); }
  .lt-sb-avatar { width:34px; height:34px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#c4a054,#7a5e28); display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:11px; color:#06080f; font-weight:700; border:1.5px solid rgba(212,168,80,0.45); box-shadow:0 0 14px rgba(212,168,80,0.25); overflow:hidden; }
  .lt-sb-uname { font-family:'Cinzel',serif; font-size:10px; color:#e8c87a; letter-spacing:0.5px; overflow:hidden; text-overflow:ellipsis; }
  .lt-sb-urole { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:10px; color:rgba(255,255,255,0.38); margin-top:1px; }
  .lt-sb-online { width:7px; height:7px; border-radius:50%; background:#4ade80; flex-shrink:0; margin-left:auto; box-shadow:0 0 8px rgba(74,222,128,0.8); animation:ltOnlinePulse 2.5s ease-in-out infinite; }
  .lt-sb-section { padding:0 10px; margin-top:12px; }
  .lt-sec-label { font-family:'Space Mono',monospace; font-size:7.5px; letter-spacing:3px; text-transform:uppercase; color:rgba(212,168,80,0.35); padding:0 6px; margin-bottom:4px; display:flex; align-items:center; gap:8px; }
  .lt-sec-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(212,168,80,0.2),transparent); }
  .lt-sb-link { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; margin-bottom:2px; text-decoration:none; cursor:pointer; border:1px solid transparent; transition:all 0.22s; position:relative; }
  .lt-sb-link:hover { background:rgba(212,168,80,0.06); border-color:rgba(212,168,80,0.1); }
  .lt-sb-link.lt-active { background:rgba(212,168,80,0.09); border-color:rgba(212,168,80,0.22); box-shadow:inset 0 0 20px rgba(212,168,80,0.04); }
  .lt-sb-link.lt-active::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:2.5px; background:linear-gradient(180deg,#c4a054,#f0d080,#c4a054); border-radius:0 3px 3px 0; box-shadow:0 0 12px rgba(212,168,80,0.7), 0 0 4px rgba(212,168,80,1); }
  .lt-sb-icon { width:30px; height:30px; border-radius:8px; flex-shrink:0; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; font-size:13px; transition:all 0.22s; }
  .lt-sb-link.lt-active .lt-sb-icon { background:rgba(212,168,80,0.13); border-color:rgba(212,168,80,0.28); box-shadow:0 0 12px rgba(212,168,80,0.18); }
  .lt-sb-link:hover .lt-sb-icon { background:rgba(212,168,80,0.07); border-color:rgba(212,168,80,0.14); }
  .lt-sb-lbl { font-family:'Cinzel',serif; font-size:10.5px; color:rgba(212,168,80,0.5); letter-spacing:0.5px; transition:color 0.22s; }
  .lt-sb-sublbl { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:9.5px; color:rgba(212,168,80,0.28); margin-top:1px; }
  .lt-sb-link.lt-active .lt-sb-lbl { color:#e8c87a; text-shadow:0 0 20px rgba(212,168,80,0.4); }
  .lt-sb-link:hover .lt-sb-lbl { color:rgba(212,168,80,0.82); }
  .lt-sb-link.lt-active .lt-sb-sublbl { color:rgba(212,168,80,0.5); }
  .lt-sb-badge { font-family:'Space Mono',monospace; font-size:8px; background:rgba(212,168,80,0.1); border:1px solid rgba(212,168,80,0.25); color:#e8c87a; border-radius:20px; padding:1px 7px; margin-left:auto; flex-shrink:0; }
  .lt-sb-badge.lt-hot { background:rgba(239,99,39,0.12); border-color:rgba(239,99,39,0.35); color:#ef6327; box-shadow:0 0 8px rgba(239,99,39,0.25); }
  .lt-sb-foot { margin-top:auto; padding:10px; border-top:1px solid rgba(212,168,80,0.07); }
  .lt-sb-logout { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; cursor:pointer; background:none; width:100%; border:1px solid transparent; transition:all 0.22s; }
  .lt-sb-logout:hover { background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.16); }
  .lt-sb-logout:hover .lt-sb-lbl { color:rgba(239,68,68,0.72) !important; }
  .lt-sb-logout:hover .lt-sb-icon { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.22); }
  .lt-rune-footer { text-align:center; font-family:'Cinzel',serif; font-size:9px; letter-spacing:4px; color:rgba(212,168,80,0.18); user-select:none; padding:6px 0 2px; }

  /* ═══════════════════════════════════════
     MAIN COLUMN
  ═══════════════════════════════════════ */
  .lt-main-col { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  /* ═══════════════════════════════════════
     TOP HEADER — BEAST MODE 🔥
     Every element now bright, glowing, Cinzel
  ═══════════════════════════════════════ */
  .lt-top-header {
    height: 68px; flex-shrink: 0;
    background: rgba(6,8,15,0.98);
    border-bottom: 1px solid rgba(212,168,80,0.2);
    backdrop-filter: blur(30px);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; position: relative; z-index: 40;
    box-shadow: 0 2px 40px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(212,168,80,0.08);
  }
  /* Bright top shimmer line */
  .lt-top-header::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(212,168,80,0.4) 10%,
      rgba(232,200,122,0.95) 50%,
      rgba(212,168,80,0.4) 90%,
      transparent 100%
    );
  }
  .lt-top-header::after {
    content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(212,168,80,0.3), transparent);
  }

  /* Corner accents — brighter */
  .lt-hc { position:absolute; width:16px; height:16px; border-color:rgba(212,168,80,0.6); border-style:solid; }
  .lt-hc-tl { top:9px; left:12px; border-width:1.5px 0 0 1.5px; border-radius:3px 0 0 0; }
  .lt-hc-tr { top:9px; right:12px; border-width:1.5px 1.5px 0 0; border-radius:0 3px 0 0; }

  .lt-nb-left  { display:flex; align-items:center; gap:14px; }
  .lt-nb-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

  /* ── Hamburger — glowing ── */
  .lt-ham-btn {
    width:38px; height:38px; border-radius:10px;
    background:rgba(12,16,32,0.9); border:1px solid rgba(212,168,80,0.35);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.25s;
    color:rgba(212,168,80,0.8);   /* WAS 0.6 — now bright */
    flex-shrink:0; box-shadow:0 4px 16px rgba(0,0,0,0.4);
  }
  .lt-ham-btn:hover {
    background:rgba(212,168,80,0.12); border-color:rgba(212,168,80,0.65);
    color:#e8c87a; box-shadow:0 0 20px rgba(212,168,80,0.25);
    transform:scale(1.05);
  }

  /* ── Header brand — BEAST shimmer ── */
  .lt-header-brand { display:flex; align-items:center; gap:12px; user-select:none; }
  .lt-header-brand-sub {
    display:block; font-family:'Space Mono',monospace; font-size:8px;
    letter-spacing:3px; text-transform:uppercase;
    color:rgba(212,168,80,0.65);   /* WAS 0.45 — now clearly visible */
    line-height:1; margin-bottom:2px;
  }
  .lt-header-brand-name {
    display:block; font-family:'Cinzel',serif; font-size:15px; font-weight:700;
    letter-spacing:2px;
    /* BEAST: animated gold shimmer gradient */
    background: linear-gradient(90deg, #c9933a, #f0d080, #e8c87a, #f5e09a, #c9933a);
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ltNavShimmer 5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(212,168,80,0.4));
  }

  /* ── Search bar ── */
  .lt-search-form {
    display:flex; align-items:center; gap:9px;
    background:rgba(12,16,32,0.9); border:1px solid rgba(212,168,80,0.28);
    border-radius:30px; padding:8px 18px; transition:all 0.35s; width:230px;
    box-shadow:0 4px 20px rgba(0,0,0,0.35); position:relative; overflow:hidden;
  }
  .lt-search-form::before {
    content:''; position:absolute; top:0; left:20%; right:20%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.55),transparent);
  }
  .lt-search-form:focus-within {
    background:rgba(12,16,32,0.98); border-color:rgba(212,168,80,0.65);
    width:285px;
    box-shadow:0 0 0 3px rgba(212,168,80,0.1), 0 8px 32px rgba(0,0,0,0.45);
  }
  .lt-search-input {
    border:none; background:transparent; outline:none;
    font-family:'Cinzel',serif; font-size:11.5px;
    color:rgba(212,168,80,0.92);   /* WAS 0.8 */
    width:100%; letter-spacing:0.8px;
  }

  /* 🔥 BUG FIX: Forced font-style to normal so it doesn't inherit italic */
  .lt-search-input::placeholder {
    color:rgba(212,168,80,0.42);   /* WAS 0.32 */
    font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:1px;
    font-style: normal !important;
  }

  .lt-search-icon { color:rgba(212,168,80,0.6); flex-shrink:0; display:flex; align-items:center; }

  /* ── Oracle button ── */
  .lt-oracle-btn {
    display:flex; align-items:center;
    background:rgba(12,16,32,0.9); border:1px solid rgba(212,168,80,0.32);
    border-radius:30px; padding:5px; height:38px; width:38px;
    cursor:pointer; transition:all 0.4s ease; overflow:hidden; position:relative;
    box-shadow:0 4px 14px rgba(0,0,0,0.4);
  }
  .lt-oracle-btn:hover {
    width:158px; padding:5px 14px 5px 5px;
    background:linear-gradient(135deg,#3730a3,#6d28d9,#7c3aed);
    border-color:transparent;
    box-shadow:0 0 28px rgba(109,40,217,0.55), 0 0 0 1px rgba(212,168,80,0.25);
  }
  .lt-oracle-icon { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; transition:all 0.4s; }
  .lt-oracle-btn:hover .lt-oracle-icon { background:rgba(255,255,255,0.18); }
  .lt-oracle-sparkle { transition:all 0.4s; display:inline-block; }
  .lt-oracle-btn:hover .lt-oracle-sparkle { transform:scale(1.25) rotate(-12deg); filter:drop-shadow(0 0 10px rgba(255,255,255,0.9)); }
  .lt-oracle-text {
    max-width:0; opacity:0; font-size:11px; color:#fff;
    white-space:nowrap; overflow:hidden; transition:all 0.4s;
    letter-spacing:1.5px; font-family:'Cinzel',serif; font-weight:600;
  }
  .lt-oracle-btn:hover .lt-oracle-text { max-width:130px; opacity:1; margin-left:10px; }

  /* ── Hub (circle switcher) ── */
  .lt-hub-btn {
    display:flex; align-items:center; gap:9px; padding:7px 14px;
    background:rgba(12,16,32,0.9);
    border:1px solid rgba(212,168,80,0.3); border-radius:11px;
    cursor:pointer; transition:all 0.25s; height:38px;
    font-family:'Cinzel',serif; box-shadow:0 4px 14px rgba(0,0,0,0.35);
  }
  .lt-hub-btn:hover, .lt-hub-btn.lt-open {
    background:rgba(212,168,80,0.12); border-color:rgba(212,168,80,0.55);
    box-shadow:0 0 20px rgba(212,168,80,0.2);
  }
  /* Hub castle icon */
  .lt-hub-btn span:first-child { font-size:14px; }
  /* Hub circle name — BEAST bright */
  .lt-hub-name {
    max-width:96px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    font-size:11.5px; letter-spacing:0.8px; font-weight:600;
    color:rgba(212,168,80,0.92);   /* WAS 0.65 — now bright gold */
    text-shadow:0 0 10px rgba(212,168,80,0.3);
  }
  .lt-hub-btn:hover .lt-hub-name { color:#e8c87a; text-shadow:0 0 14px rgba(212,168,80,0.5); }
  .lt-hub-arrow { font-size:8px; opacity:0.6; transition:transform 0.25s; color:rgba(212,168,80,0.7); }
  .lt-hub-btn.lt-open .lt-hub-arrow { transform:rotate(180deg); }

  /* ── Dark dropdown ── */
  .lt-dark-dropdown {
    background:rgba(8,10,22,0.99); border:1px solid rgba(212,168,80,0.22);
    border-radius:16px; box-shadow:0 24px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(212,168,80,0.06);
    overflow:hidden; min-width:230px; padding:8px; position:relative;
  }
  .lt-dark-dropdown::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.65),transparent);
  }
  /* Dropdown header label */
  .lt-dd-header {
    font-family:'Space Mono',monospace; font-size:8.5px;
    letter-spacing:2.8px; color:rgba(212,168,80,0.6);   /* WAS 0.38 */
    text-transform:uppercase; padding:10px 14px 7px;
  }
  /* Dropdown items */
  .lt-dd-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 14px; border-radius:10px; cursor:pointer;
    font-family:'Cinzel',serif; font-size:11.5px;
    color:rgba(212,168,80,0.75);   /* WAS 0.52 — now bright */
    letter-spacing:0.5px; transition:all 0.2s; border:1px solid transparent;
  }
  .lt-dd-item:hover { background:rgba(212,168,80,0.08); border-color:rgba(212,168,80,0.18); color:rgba(212,168,80,0.98); }
  .lt-dd-item.lt-dd-active {
    background:rgba(212,168,80,0.13); border-color:rgba(212,168,80,0.3);
    color:#e8c87a; text-shadow:0 0 12px rgba(212,168,80,0.4);
  }
  .lt-dd-check { font-size:12px; color:#e8c87a; }

  /* ── Icon button (bell etc.) ── */
  .lt-icon-btn {
    width:38px; height:38px; border-radius:50%;
    background:rgba(12,16,32,0.9); border:1px solid rgba(212,168,80,0.3);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:16px; transition:all 0.25s;
    position:relative; box-shadow:0 4px 14px rgba(0,0,0,0.4);
  }
  .lt-icon-btn:hover {
    background:rgba(212,168,80,0.12); border-color:rgba(212,168,80,0.55);
    box-shadow:0 0 20px rgba(212,168,80,0.22); transform:scale(1.07);
  }
  .lt-notif-badge {
    position:absolute; top:-3px; right:-3px;
    background:#ef4444; color:#fff; font-size:8px; font-weight:700;
    width:17px; height:17px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:2px solid #06080f;
    box-shadow:0 0 8px rgba(239,68,68,0.8);
  }

  /* ── Notification dropdown ── */
  .lt-notif-dropdown {
    width:340px; background:rgba(8,10,22,0.99);
    border:1px solid rgba(212,168,80,0.22); border-radius:18px;
    box-shadow:0 24px 70px rgba(0,0,0,0.75); overflow:hidden; position:relative;
  }
  .lt-notif-dropdown::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.65),transparent);
  }
  .lt-notif-head {
    padding:14px 20px; border-bottom:1px solid rgba(212,168,80,0.1);
    display:flex; justify-content:space-between; align-items:center;
  }
  /* Notification title — BEAST */
  .lt-notif-title {
    font-family:'Cinzel',serif; font-size:12px; font-weight:700;
    color:#e8c87a; letter-spacing:2.5px; text-transform:uppercase;
    text-shadow:0 0 16px rgba(212,168,80,0.5);
  }
  .lt-notif-count {
    background:rgba(212,168,80,0.12); border:1px solid rgba(212,168,80,0.3);
    color:#e8c87a; padding:3px 10px; border-radius:20px;
    font-family:'Space Mono',monospace; font-size:8.5px;
    text-shadow:0 0 8px rgba(212,168,80,0.4);
  }
  .lt-notif-item { padding:13px 20px; border-bottom:1px solid rgba(212,168,80,0.05); display:flex; gap:12px; align-items:flex-start; transition:background 0.2s; cursor:pointer; }
  .lt-notif-item:hover { background:rgba(212,168,80,0.05); }
  .lt-notif-item.lt-unread { background:rgba(212,168,80,0.03); }
  .lt-notif-icon { width:34px; height:34px; border-radius:50%; flex-shrink:0; background:rgba(212,168,80,0.08); border:1px solid rgba(212,168,80,0.2); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .lt-notif-msg { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:13px; color:rgba(212,168,80,0.7); line-height:1.55; margin:0 0 3px; }
  .lt-notif-msg.lt-unread-txt { color:rgba(255,255,255,0.88); font-style:normal; font-family:'Cinzel',serif; font-size:11px; letter-spacing:0.3px; }
  .lt-notif-date { font-family:'Space Mono',monospace; font-size:8px; color:rgba(212,168,80,0.4); letter-spacing:0.5px; }
  .lt-notif-empty { padding:40px; text-align:center; font-family:'Cormorant Garamond',serif; font-style:italic; color:rgba(212,168,80,0.38); font-size:15px; }
  .lt-accept-btn { flex:1; background:rgba(16,185,129,0.12); color:#6ee87a; border:1px solid rgba(16,185,129,0.3); padding:8px; border-radius:9px; font-family:'Cinzel',serif; font-size:10px; letter-spacing:0.8px; cursor:pointer; transition:all 0.22s; font-weight:600; }
  .lt-accept-btn:hover { background:rgba(16,185,129,0.22); box-shadow:0 0 12px rgba(16,185,129,0.2); }
  .lt-decline-btn { flex:1; background:rgba(239,68,68,0.08); color:rgba(239,68,68,0.75); border:1px solid rgba(239,68,68,0.24); padding:8px; border-radius:9px; font-family:'Cinzel',serif; font-size:10px; letter-spacing:0.8px; cursor:pointer; transition:all 0.22s; }
  .lt-decline-btn:hover { background:rgba(239,68,68,0.16); }

  /* ── Streak wrap ── */
  .lt-streak-wrap {
    display:flex; align-items:center; gap:9px; padding:5px 14px;
    background:rgba(12,16,32,0.9); border:1px solid rgba(212,168,80,0.28);
    border-radius:30px; height:38px; cursor:default; transition:all 0.38s;
    box-shadow:0 4px 14px rgba(0,0,0,0.4); position:relative; overflow:hidden;
  }
  .lt-streak-wrap::before {
    content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.55),transparent);
  }
  .lt-streak-wrap.lt-streak-lit {
    border-color:rgba(212,168,80,0.65);
    box-shadow:0 0 26px rgba(212,168,80,0.28), 0 4px 14px rgba(0,0,0,0.4);
  }
  .lt-rune-crystal { width:18px; height:22px; flex-shrink:0; transition:all 0.4s; }
  .lt-streak-wrap.lt-streak-lit .lt-rune-crystal { filter:drop-shadow(0 0 9px rgba(232,200,122,0.95)) drop-shadow(0 0 4px rgba(255,220,100,1)); animation:ltCrystalPulse 2.2s ease-in-out infinite; }
  /* Streak number — BEAST glow */
  .lt-streak-num {
    font-family:'Cinzel',serif; font-size:15px; font-weight:700;
    color:rgba(212,168,80,0.6); letter-spacing:0.5px; transition:all 0.4s;
  }
  .lt-streak-wrap.lt-streak-lit .lt-streak-num {
    color:#e8c87a; text-shadow:0 0 18px rgba(212,168,80,0.85);
    font-size:16px;
  }
  /* Streak label */
  .lt-streak-label {
    font-family:'Space Mono',monospace; font-size:8px;
    letter-spacing:2px; text-transform:uppercase;
    color:rgba(212,168,80,0.5);   /* WAS 0.35 */
    transition:color 0.4s;
  }
  .lt-streak-wrap.lt-streak-lit .lt-streak-label { color:rgba(212,168,80,0.75); }

  /* ── Avatar button ── */
  .lt-avatar-btn {
    width:38px; height:38px; border-radius:50%; padding:2px;
    background:linear-gradient(135deg,#c4a054,#7a5e28);
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 18px rgba(212,168,80,0.3); transition:all 0.25s;
  }
  .lt-avatar-btn:hover { box-shadow:0 0 32px rgba(212,168,80,0.65); transform:scale(1.07); }
  .lt-avatar-inner {
    width:100%; height:100%; border-radius:50%; overflow:hidden;
    background:#0c1020; display:flex; align-items:center; justify-content:center;
    font-family:'Cinzel',serif; font-size:12px; font-weight:700; color:#e8c87a;
  }

  /* ── Profile dropdown ── */
  .lt-profile-wrap { position:relative; }
  .lt-profile-dd {
    visibility:hidden; opacity:0; transform:translateY(-10px) scale(0.96);
    transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
    position:absolute; top:calc(100% + 14px); right:0; z-index:100;
  }
  .lt-profile-wrap:hover .lt-profile-dd { visibility:visible; opacity:1; transform:translateY(0) scale(1); }
  .lt-profile-box {
    min-width:245px; background:rgba(8,10,22,0.99);
    border:1px solid rgba(212,168,80,0.22); border-radius:18px;
    box-shadow:0 24px 70px rgba(0,0,0,0.75); overflow:hidden; position:relative;
  }
  .lt-profile-box::before {
    content:''; position:absolute; top:0; left:15%; right:15%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,168,80,0.65),transparent);
  }
  .lt-profile-head { padding:16px 18px; border-bottom:1px solid rgba(212,168,80,0.09); display:flex; align-items:center; gap:12px; }
  .lt-profile-avatar { width:38px; height:38px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#c4a054,#7a5e28); display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:12px; color:#06080f; font-weight:700; border:2px solid rgba(212,168,80,0.55); overflow:hidden; box-shadow:0 0 14px rgba(212,168,80,0.28); }
  /* Profile name — bright gold */
  .lt-profile-name {
    font-family:'Cinzel',serif; font-size:13px; font-weight:700;
    color:#e8c87a; letter-spacing:0.5px;
    text-shadow:0 0 14px rgba(212,168,80,0.45);
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  /* Profile email */
  .lt-profile-email {
    font-family:'Space Mono',monospace; font-size:9px;
    color:rgba(212,168,80,0.5);   /* WAS 0.38 */
    margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  .lt-profile-links { padding:8px; }
  /* Profile links — bright */
  .lt-profile-link {
    display:flex; align-items:center; gap:10px; width:100%; text-align:left;
    padding:10px 14px; background:transparent; border:1px solid transparent;
    font-family:'Cinzel',serif; font-size:11px; letter-spacing:0.5px;
    color:rgba(212,168,80,0.75);   /* WAS 0.52 */
    border-radius:10px; cursor:pointer; text-decoration:none; transition:all 0.22s;
  }
  .lt-profile-link:hover {
    background:rgba(212,168,80,0.08); border-color:rgba(212,168,80,0.18);
    color:#e8c87a; text-shadow:0 0 10px rgba(212,168,80,0.3);
  }
  .lt-profile-link.lt-danger { color:rgba(239,68,68,0.68); }
  .lt-profile-link.lt-danger:hover { background:rgba(239,68,68,0.09); border-color:rgba(239,68,68,0.22); color:rgba(239,68,68,0.92); }
  .lt-profile-divider { height:1px; background:rgba(212,168,80,0.08); margin:5px 0; }

  .lt-page-wrap { flex:1; overflow-y:auto; position:relative; background:#06080f; }

  .lt-mobile-search { display:none; padding:0 14px 12px; }
  .lt-mobile-search-form { display:flex; align-items:center; background:rgba(12,16,32,0.9); border:1px solid rgba(212,168,80,0.28); border-radius:12px; padding:9px 14px; box-shadow:0 4px 14px rgba(0,0,0,0.4); }
  .lt-mobile-search-input { border:none; background:transparent; outline:none; padding-left:9px; width:100%; color:rgba(212,168,80,0.9); font-family:'Cinzel',serif; font-size:11px; letter-spacing:0.8px; }
  .lt-mobile-search-input::placeholder { color:rgba(212,168,80,0.38); font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:1px; }

  /* ═══════ KEYFRAMES ═══════ */
  @keyframes ltRingSpin    { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes ltOnlinePulse { 0%,100%{box-shadow:0 0 8px rgba(74,222,128,.7)} 50%{box-shadow:0 0 14px rgba(74,222,128,1)} }
  @keyframes ltCrystalPulse {
    0%,100% { filter:drop-shadow(0 0 7px rgba(232,200,122,0.85)) drop-shadow(0 0 3px rgba(255,220,100,.9)); }
    50%     { filter:drop-shadow(0 0 18px rgba(232,200,122,1))   drop-shadow(0 0 9px rgba(255,240,150,1)); }
  }
  /* 🔥 NEW: navbar brand shimmer */
  @keyframes ltNavShimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes ltPulseGlow { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,0.25)} 50%{box-shadow:0 6px 40px rgba(212,168,80,0.5)} }

  .lt-sidebar-open .lt-header-brand { display: none !important; }

  /* RESPONSIVE */
  @media (min-width:769px) {
    .lt-sidebar.lt-sb-open   { width:255px; }
    .lt-sidebar.lt-sb-closed { width:0; transform:translateX(-100%); }
    .lt-hide-desktop { display:none !important; }
    .lt-sb-overlay { display:none !important; }
  }
  @media (max-width:768px) {
    .lt-top-header { padding:0 14px; height:62px; }
    .lt-nb-right { gap:8px; }
    .lt-desktop-only { display:none !important; }
    .lt-sidebar { position:fixed; top:0; left:0; bottom:0; width:255px !important; transform:translateX(-100%); box-shadow:16px 0 60px rgba(0,0,0,0.6); }
    .lt-sidebar.lt-sb-open { transform:translateX(0); }
    .lt-sb-overlay.lt-sb-vis { opacity:1; visibility:visible; pointer-events:auto; }
    .lt-mobile-search { display:block; }
    .lt-notif-dropdown { width:296px; }
    .lt-oracle-btn, .lt-icon-btn, .lt-avatar-btn { width:36px; height:36px; }
  }
`;

// ─── RUNE CRYSTAL (unchanged) ─────────────────────────────────────────────────
function RuneCrystal({ lit, streak = 0 }) {
  const fillPct = lit ? Math.min(100, 18 + Math.min(streak, 10) * 8.2) : 0;
  const vialTop = 6.5, vialBot = 20.5;
  const vialH   = vialBot - vialTop;
  const liquidY = vialBot - (fillPct / 100) * vialH;
  const stroke  = lit ? '#e8c87a'               : 'rgba(212,168,80,0.35)';
  const liquidT = lit ? 'rgba(255,210,60,0.80)' : 'transparent';
  const liquidB = lit ? 'rgba(232,140,30,0.95)' : 'transparent';
  const glowCol = lit ? 'rgba(255,200,50,0.30)' : 'transparent';
  const uid = 'avial';
  return (
    <svg className="lt-rune-crystal" viewBox="0 0 18 26" fill="none"
      style={{ width:18, height:22, overflow:'visible', flexShrink:0 }}>
      <defs>
        <linearGradient id={`${uid}lg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={liquidT}/>
          <stop offset="100%" stopColor={liquidB}/>
        </linearGradient>
        <clipPath id={`${uid}cp`}>
          <rect x="4.8" y="6.5" width="8.4" height="14" rx="3.8"/>
        </clipPath>
      </defs>
      <rect x="6.2" y="1" width="5.6" height="3.6" rx="1.3"
        fill={lit?'rgba(180,130,40,0.7)':'rgba(212,168,80,0.15)'} stroke={stroke} strokeWidth="0.65"/>
      <line x1="7.8"  y1="1.5" x2="7.8"  y2="4.4" stroke={stroke} strokeWidth="0.35" opacity="0.55"/>
      <line x1="9"    y1="1.5" x2="9"    y2="4.4" stroke={stroke} strokeWidth="0.35" opacity="0.55"/>
      <line x1="10.2" y1="1.5" x2="10.2" y2="4.4" stroke={stroke} strokeWidth="0.35" opacity="0.55"/>
      <rect x="6.6" y="4.6" width="4.8" height="2.2" rx="0.6"
        fill="rgba(212,168,80,0.04)" stroke={stroke} strokeWidth="0.55"/>
      <rect x="4.4" y="6.5" width="9.2" height="14" rx="4.2"
        fill="rgba(255,255,255,0.03)" stroke={stroke} strokeWidth="0.85"/>
      {lit && fillPct > 0 && (<>
        <rect x="4.4" y={liquidY} width="9.2" height={vialBot-liquidY+4.2}
          rx="4.2" fill={`url(#${uid}lg)`} clipPath={`url(#${uid}cp)`}/>
        <line x1="6" y1={liquidY+0.6} x2="12" y2={liquidY+0.6}
          stroke="rgba(255,240,140,0.7)" strokeWidth="0.55" clipPath={`url(#${uid}cp)`}/>
        <circle cx="7.8"  cy={liquidY+3.5} r="0.85"
          fill="rgba(255,240,100,0.38)" clipPath={`url(#${uid}cp)`}/>
        <circle cx="10.5" cy={liquidY+7}   r="0.6"
          fill="rgba(255,240,100,0.28)" clipPath={`url(#${uid}cp)`}/>
      </>)}
      <line x1="6.0" y1="8.5" x2="6.0" y2="19"
        stroke="rgba(255,255,255,0.15)" strokeWidth="0.9" strokeLinecap="round"/>
      {lit && <ellipse cx="9" cy="21.2" rx="3.8" ry="0.9" fill={glowCol}/>}
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — ALL ORIGINAL LOGIC 100% UNCHANGED
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
      <div className={`lt-app-layout ${isSidebarOpen ? 'lt-sidebar-open' : ''}`}>

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

        <div className="lt-main-col">
          <header className="lt-top-header">
            <div className="lt-hc lt-hc-tl"/>
            <div className="lt-hc lt-hc-tr"/>

            <div className="lt-nb-left">
              <button className="lt-ham-btn" onClick={() => setIsSidebarOpen(p=>!p)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              <div className="lt-header-brand lt-desktop-only">
                <LogoRing size={38}/>
                <div>
                  <span className="lt-header-brand-sub">The Memento</span>
                  <span className="lt-header-brand-name">THE LEGACY TRUNK</span>
                </div>
              </div>

              <form onSubmit={handleSearch} className="lt-search-form lt-desktop-only">
                <span className="lt-search-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,0.6)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </span>
                <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  placeholder="Search your legacy..." className="lt-search-input"/>
              </form>
            </div>

            <div className="lt-nb-right">
              <motion.button onClick={() => navigate('/oracle')} className="lt-oracle-btn" whileTap={{scale:0.92}} title="Ask Oracle AI">
                <div className="lt-oracle-icon"><span className="lt-oracle-sparkle">🔮</span></div>
                <span className="lt-oracle-text">Ask Oracle AI</span>
              </motion.button>

              <div ref={hubRef} style={{position:'relative'}}>
                <button onClick={() => setIsHubOpen(p=>!p)}
                  className={`lt-hub-btn lt-desktop-only${isHubOpen?' lt-open':''}`}>
                  <span style={{fontSize:14}}>🏰</span>
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

              <div ref={notifRef} style={{position:'relative'}}>
                <motion.button onClick={() => setIsNotifOpen(p=>!p)} className="lt-icon-btn" whileHover={{scale:1.07}} whileTap={{scale:0.9}}>
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
                        <div style={{maxHeight:370,overflowY:'auto'}}>
                          {notifications.length===0 ? (
                            <div className="lt-notif-empty">
                              <div style={{fontSize:28,marginBottom:10,opacity:0.4}}>📭</div>
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

              <div className={`lt-streak-wrap${currentStreak>0?' lt-streak-lit':''}`}
                title={currentStreak>0?`Legacy Streak: ${currentStreak} Days`:'Post a memory to ignite your streak'}>
                <RuneCrystal lit={currentStreak>0} streak={currentStreak}/>
                {currentStreak>0
                  ? <span className="lt-streak-num">{currentStreak}</span>
                  : <span className="lt-streak-label">Streak</span>
                }
              </div>

              <div className="lt-profile-wrap">
                <motion.button className="lt-avatar-btn" whileHover={{scale:1.07}} whileTap={{scale:0.92}}>
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