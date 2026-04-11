import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import CollageMaker from '../../pages/CollageMaker';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ─── Global styles injected once ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');

  @keyframes scShine    { 0%,70%{left:-100%} 100%{left:160%} }
  @keyframes scPulse    { 0%,100%{box-shadow:0 4px 20px rgba(212,168,80,.25)} 50%{box-shadow:0 6px 36px rgba(212,168,80,.5),0 0 60px rgba(212,168,80,.12)} }
  @keyframes scDot      { 0%,80%,100%{transform:scale(.6);opacity:.5} 40%{transform:scale(1);opacity:1} }
  @keyframes scFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes scGlow     { 0%,100%{opacity:.5} 50%{opacity:1} }

  .sc-textarea { scrollbar-width: thin; scrollbar-color: rgba(212,168,80,.2) transparent; }
  .sc-textarea::-webkit-scrollbar { width: 4px; }
  .sc-textarea::-webkit-scrollbar-thumb { background: rgba(212,168,80,.2); border-radius: 2px; }
  .sc-textarea::placeholder,
  .sc-input::placeholder { color: rgba(255,255,255,.2); font-style: italic; font-family: 'Cormorant Garamond', serif; }
  .sc-textarea:-webkit-autofill, .sc-input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px #080c1a inset !important;
    -webkit-text-fill-color: rgba(255,255,255,.88) !important;
  }

  /* DatePicker dark override */
  .vault-dp-wrap .react-datepicker-wrapper,
  .vault-dp-wrap .react-datepicker__input-container { width: 100%; }
  .vault-dp-wrap .react-datepicker__input-container input {
    width: 100%; padding: 11px 16px 11px 40px;
    background: rgba(255,255,255,.03); border: 1px solid rgba(212,168,80,.25);
    border-radius: 10px; color: rgba(255,255,255,.85);
    font-family: 'Cormorant Garamond', serif; font-size: 16px; outline: none;
    transition: border-color .3s, box-shadow .3s;
    box-sizing: border-box;
  }
  .vault-dp-wrap .react-datepicker__input-container input:focus {
    border-color: rgba(212,168,80,.6); box-shadow: 0 0 0 3px rgba(212,168,80,.08);
  }
  .vault-dp-wrap .react-datepicker__input-container input::placeholder { color: rgba(212,168,80,.35); font-style: italic; }
  .react-datepicker { background: #0b1020 !important; border: 1px solid rgba(212,168,80,.3) !important; font-family: 'Space Mono', monospace !important; box-shadow: 0 20px 60px rgba(0,0,0,.7) !important; border-radius: 12px !important; overflow: hidden; }
  .react-datepicker__header { background: rgba(212,168,80,.08) !important; border-bottom: 1px solid rgba(212,168,80,.2) !important; }
  .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker-time__header { color: #e8c87a !important; font-size: 11px !important; letter-spacing: 2px !important; }
  .react-datepicker__day { color: rgba(255,255,255,.7) !important; border-radius: 6px !important; font-size: 12px !important; }
  .react-datepicker__day:hover { background: rgba(212,168,80,.15) !important; color: #e8c87a !important; }
  .react-datepicker__day--selected { background: rgba(212,168,80,.3) !important; color: #e8c87a !important; font-weight: 700 !important; box-shadow: 0 0 8px rgba(212,168,80,.3); }
  .react-datepicker__day--today { border: 1px solid rgba(212,168,80,.4) !important; }
  .react-datepicker__navigation-icon::before { border-color: rgba(212,168,80,.6) !important; }
  .react-datepicker__time-container { border-left: 1px solid rgba(212,168,80,.2) !important; }
  .react-datepicker__time { background: #0b1020 !important; }
  .react-datepicker__time-list-item { color: rgba(255,255,255,.6) !important; font-size: 11px !important; }
  .react-datepicker__time-list-item:hover { background: rgba(212,168,80,.15) !important; color: #e8c87a !important; }
  .react-datepicker__time-list-item--selected { background: rgba(212,168,80,.25) !important; color: #e8c87a !important; }
  .react-datepicker__day--disabled { color: rgba(255,255,255,.2) !important; }
  .react-datepicker__triangle { display: none !important; }

  .sc-select option { background: #0b1020; color: #e8c87a; padding: 10px; }
  .sc-select option:disabled { color: rgba(212,168,80,.3); font-style: italic; }
  .sc-file-label:hover { border-color: rgba(212,168,80,.55) !important; background: rgba(212,168,80,.07) !important; color: rgba(212,168,80,.85) !important; }
`;

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(212,168,80,.55)', marginBottom: 8 }}>
    {children}
  </div>
);

// ─── Input wrapper ────────────────────────────────────────────────────────────
function DarkInput({ label, type = 'text', name, value, onChange, placeholder, icon, disabled, as: Tag = 'input', rows, maxLength, style: extraStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <SectionLabel>{label}</SectionLabel>}
      <div style={{
        border: `1px solid ${focused ? 'rgba(212,168,80,.6)' : 'rgba(212,168,80,.22)'}`,
        background: focused ? 'rgba(212,168,80,.05)' : 'rgba(255,255,255,.03)',
        borderRadius: 12, position: 'relative', display: 'flex', alignItems: Tag === 'input' ? 'center' : 'flex-start',
        boxShadow: focused ? '0 0 0 3px rgba(212,168,80,.08)' : 'none',
        transition: 'all .3s',
      }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, top: Tag === 'input' ? '50%' : 16, transform: Tag === 'input' ? 'translateY(-50%)' : 'none', opacity: focused ? .8 : .35, transition: 'opacity .3s', pointerEvents: 'none', zIndex: 1 }}>
            {icon}
          </div>
        )}
        <Tag
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} rows={rows} maxLength={maxLength} disabled={disabled}
          className={Tag === 'textarea' ? 'sc-textarea' : 'sc-input'}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: '100%', padding: icon ? '13px 16px 13px 42px' : '13px 16px', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,.88)', fontFamily: "'Cormorant Garamond',serif", fontSize: 17, resize: 'none', boxSizing: 'border-box', lineHeight: 1.6, ...extraStyle }}
        />
        {/* Bottom sweep */}
        <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,.6),transparent)', transform: focused ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform .4s ease', borderRadius: 0 }} />
      </div>
    </div>
  );
}

// ─── Corner accents ───────────────────────────────────────────────────────────
function CornerAccents({ size = 16, inset = 12, opacity = .4 }) {
  const s = { position: 'absolute', width: size, height: size, borderColor: `rgba(212,168,80,${opacity})`, borderStyle: 'solid' };
  return (
    <>
      <div style={{ ...s, top: inset, left: inset, borderWidth: '1px 0 0 1px', borderRadius: '3px 0 0 0' }} />
      <div style={{ ...s, top: inset, right: inset, borderWidth: '1px 1px 0 0', borderRadius: '0 3px 0 0' }} />
      <div style={{ ...s, bottom: inset, left: inset, borderWidth: '0 0 1px 1px', borderRadius: '0 0 0 3px' }} />
      <div style={{ ...s, bottom: inset, right: inset, borderWidth: '0 1px 1px 0', borderRadius: '0 0 3px 0' }} />
    </>
  );
}

// ─── Gold button ──────────────────────────────────────────────────────────────
function GoldButton({ children, onClick, type = 'button', disabled, fullWidth, small, danger, ghost }) {
  return (
    <motion.button
      type={type} onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: .97 } : {}}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: small ? '8px 16px' : '14px 28px',
        position: 'relative', overflow: 'hidden',
        background: disabled
          ? 'rgba(212,168,80,.15)'
          : danger
            ? 'linear-gradient(135deg,#7f1d1d,#ef4444)'
            : ghost
              ? 'transparent'
              : 'linear-gradient(135deg,#c9933a 0%,#e8a820 50%,#c9933a 100%)',
        backgroundSize: '200%',
        border: ghost ? '1px solid rgba(212,168,80,.28)' : 'none',
        borderRadius: 10,
        color: disabled ? 'rgba(255,255,255,.25)' : danger ? '#fff' : ghost ? 'rgba(212,168,80,.7)' : '#1a0f00',
        fontFamily: "'Cinzel',serif",
        fontSize: small ? 10 : 12, fontWeight: 700,
        letterSpacing: small ? 1.5 : 2, textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        animation: !disabled && !danger && !ghost ? 'scPulse 3s ease-in-out infinite' : 'none',
        boxShadow: disabled ? 'none' : danger ? '0 4px 20px rgba(239,68,68,.3)' : ghost ? 'none' : '0 4px 20px rgba(212,168,80,.25)',
        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      {!disabled && !danger && !ghost && (
        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '55%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)', transform: 'skewX(-20deg)', animation: 'scShine 3s ease-in-out infinite' }} />
      )}
      {children}
    </motion.button>
  );
}

// ─── Divider with label ───────────────────────────────────────────────────────
function GoldDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(212,168,80,.12)' }} />
      {label && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(212,168,80,.3)', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'rgba(212,168,80,.12)' }} />
    </div>
  );
}

// ─── Toggle checkbox ──────────────────────────────────────────────────────────
function GoldToggle({ checked, onChange, label, icon, accentBlue }) {
  const col = accentBlue ? '#3b82f6' : '#e8c87a';
  const colA = accentBlue ? 'rgba(59,130,246,' : 'rgba(212,168,80,';
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange}
        style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${checked ? col : 'rgba(212,168,80,.25)'}`, background: checked ? `${colA}.15)` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .25s', flexShrink: 0, boxShadow: checked ? `0 0 8px ${colA}.2)` : 'none' }}>
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}>
            <path d="M2 6l3 3 5-5" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: checked ? col : 'rgba(212,168,80,.45)', transition: 'color .25s' }}>
        {icon} {label}
      </span>
    </label>
  );
}

// ─── Tone Dropdown Options ──────────────────────────────────────────────────
// 🔥 ALL TONES RE-ADDED AND EXPANDED
const TONES = [
  { value: 'Correct Grammar & Improve Flow', label: 'Correct Grammar', icon: '✍️' },
  { value: 'Expand and add more details',    label: 'Expand Details',  icon: '✨' },
  { value: '👔 Formal & Professional',       label: 'Professional',    icon: '👔' },
  { value: 'Nostalgic and Warm',             label: 'Nostalgic',       icon: '❤️' },
  { value: '📖 Storybook Tale',              label: 'Storybook',       icon: '📖' },
  { value: '😂 Very Funny',                  label: 'Funny',           icon: '😂' },
  { value: '🥺 Emotional',                   label: 'Emotional',       icon: '🥺' },
  { value: '🚀 Excited & Energetic',         label: 'Excited',         icon: '🚀' },
  { value: '🧐 Sarcastic & Witty',           label: 'Sarcastic',       icon: '🧐' },
  { value: '😎 Gen-Z Slang',                 label: 'Gen-Z Slang',     icon: '😎' },
  { value: '📜 Poetic & Deep',               label: 'Poetic',          icon: '📜' },
  { value: '🕵️ Mysterious & Cryptic',        label: 'Mysterious',      icon: '🕵️' },
  { value: '🎬 Cinematic Epic',              label: 'Cinematic',       icon: '🎬' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
function StoryComposer({ activeCircleId, onPostStory, uploading }) {
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [tags, setTags]             = useState('');
  const [isGlobalPublic, setIsGlobalPublic] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneDate, setMilestoneDate] = useState(null);
  
  // 🔥 Default is empty so "Select Tone" shows up
  const [tone, setTone]             = useState('');
  
  const [aiLoading, setAiLoading]   = useState(false);
  const [showCollageMaker, setShowCollageMaker] = useState(false);

  const cardRef = useRef(null);
  const [spotlight, setSpotlight]   = useState({ x: 50, y: 50 });
  const [hovering, setHovering]     = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpotlight({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  useEffect(() => {
    if (!mediaFiles.length) { setMediaPreviews([]); return; }
    const urls = mediaFiles.map(f => URL.createObjectURL(f));
    setMediaPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [mediaFiles]);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (mediaFiles.length + selected.length > 5) { toast.error('Max 5 photos allowed!'); return; }
    const valid = selected.filter(f => {
      if (f.size / (1024 * 1024) > 15) { toast.error(`"${f.name}" exceeds 15MB`); return false; }
      return true;
    });
    if (valid.length) setMediaFiles(p => [...p, ...valid]);
    e.target.value = null;
  };

  const removeFile = (i) => setMediaFiles(p => p.filter((_, idx) => idx !== i));

  const handleCollageSave = (file) => {
    if (mediaFiles.length >= 5) { toast.error('Remove one file first!'); setShowCollageMaker(false); return; }
    setMediaFiles(p => [...p, file]);
    setShowCollageMaker(false);
  };

  const handleAutoTitle = async () => {
    if (!content.trim()) return toast.error('Write something first!');
    setAiLoading(true);
    const tid = toast.loading('Inscribing a title...');
    try {
      const res = await api.post('/ai/generate-title', { storyText: content });
      setTitle(res.data.title);
      toast.success('Title inscribed! ✨', { id: tid });
    } catch { toast.error('Oracle rests. Try manually!', { id: tid }); }
    finally { setAiLoading(false); }
  };

  const handleEnhanceStory = async () => {
    if (!content.trim()) return toast.error('Write some notes first!');
    if (!tone) return toast.error('Select an AI Tone first!');
    setAiLoading(true);
    const selectedLabel = TONES.find(t => t.value === tone)?.label || 'Enhancing';
    const tid = toast.loading(`Polishing with ${selectedLabel}...`);
    try {
      const res = await api.post('/ai/enhance-story', { text: content, tone });
      setContent(res.data.enhancedText);
      toast.success('Text Enhanced! 🪄', { id: tid });
    } catch { toast.error('Magic spell failed!', { id: tid }); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCircleId) return toast.error('Select an Active Family first');
    if (!title.trim() || !content.trim()) return toast.error('Title and content are required');
    if (isMilestone && !milestoneDate) return toast.error('Select a date for this milestone');

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('content', content.trim());
    if (tags.trim()) fd.append('tags', tags.trim());
    fd.append('isGlobalPublic', isGlobalPublic ? 'true' : 'false');
    fd.append('circleId', activeCircleId);
    fd.append('isMilestone', isMilestone ? 'true' : 'false');
    if (isMilestone && milestoneDate) fd.append('milestoneDate', milestoneDate.toISOString());
    fd.append('tone', tone || 'Original');
    mediaFiles.forEach(f => fd.append('media', f));

    const tid = toast.loading('Sealing in the Vault...');
    try {
      await onPostStory(fd);
      toast.success('Memory sealed! ⚔️', { id: tid });
      setTitle(''); setContent(''); setTags('');
      setIsGlobalPublic(false); setMediaFiles([]); setMediaPreviews([]);
      setIsMilestone(false); setMilestoneDate(null); setTone('');
    } catch (err) {
      toast.error(err?.message || 'Failed to seal memory', { id: tid });
    }
  };

  const iconPen  = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
  const iconTag  = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
  const iconCal  = <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.9)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          background: 'rgba(10,14,26,0.9)',
          border: '1px solid rgba(212,168,80,.22)',
          borderRadius: 22,
          padding: '44px 40px 40px',
          position: 'relative',
          overflow: 'visible',
          boxShadow: '0 24px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(212,168,80,.08)',
          fontFamily: "'Cormorant Garamond',serif",
        }}
      >
        {/* Spotlight */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 22, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', background: hovering ? `radial-gradient(340px at ${spotlight.x}px ${spotlight.y}px, rgba(212,168,80,.07) 0%, transparent 70%)` : 'none' }} />
        {/* Gold edge lines */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,.7),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,.22),transparent)' }} />
        <CornerAccents size={18} inset={13} opacity={.45} />

        <div style={{ position: 'relative', zIndex: 2 }}>

          {/* ── HEADER ── */}
          <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid rgba(212,168,80,.1)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(212,168,80,.5)', marginBottom: 8 }}>
                  Legacy Vault · Memory Inscription
                </div>
                <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: '#e8c87a', textShadow: '0 0 40px rgba(212,168,80,.3)', margin: '0 0 6px', letterSpacing: 1, lineHeight: 1.15 }}>
                  Inscribe a Memory
                </h2>
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.32)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
                  Seal this moment into the family vault for eternity
                </p>
              </div>
              {/* Decorative crest */}
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(212,168,80,.25)', background: 'rgba(212,168,80,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'scFloat 4s ease-in-out infinite', boxShadow: '0 0 20px rgba(212,168,80,.08)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#e8c87a" strokeWidth="1.2" style={{ width: 24, height: 24, opacity: .7 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* ── TITLE ── */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <DarkInput
                  label="Memory Title"
                  name="title" value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What is this moment called?"
                  maxLength={150}
                  disabled={!activeCircleId || uploading || aiLoading}
                  icon={iconPen}
                  style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-.2px' }}
                />
              </div>
              <GoldButton small onClick={handleAutoTitle} disabled={aiLoading || !content.trim() || !activeCircleId}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                AI Title
              </GoldButton>
            </div>

            {/* ── CONTENT ── */}
            <div>
              <SectionLabel>The Memory</SectionLabel>
              <div style={{
                border: '1px solid rgba(212,168,80,.22)',
                borderRadius: 14, overflow: 'hidden',
                background: 'rgba(255,255,255,.02)',
                transition: 'border-color .3s',
              }}>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Describe this moment… who was there, what happened, how it felt…"
                  rows={7} maxLength={2000}
                  disabled={!activeCircleId || uploading || aiLoading}
                  className="sc-textarea"
                  style={{ width: '100%', padding: '18px 20px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,.88)', fontFamily: "'Cormorant Garamond',serif", fontSize: 17, outline: 'none', resize: 'vertical', lineHeight: 1.75, boxSizing: 'border-box' }}
                />
                
                {/* 🔥 FIXED TOOLBAR: Dropdown for AI Tones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: '1px solid rgba(212,168,80,.1)', background: 'rgba(0,0,0,.25)', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
                    
                    {/* Themed Select Dropdown */}
                    <div style={{ position: 'relative', width: '220px' }}>
                      <select 
                        value={tone} 
                        onChange={e => setTone(e.target.value)} 
                        className="sc-select"
                        disabled={aiLoading || !activeCircleId}
                        style={{ 
                          width: '100%', appearance: 'none', 
                          background: 'rgba(212,168,80,.05)', 
                          border: '1px solid rgba(212,168,80,.3)', 
                          borderRadius: 8, padding: '8px 30px 8px 12px', 
                          fontFamily: "'Space Mono',monospace", fontSize: 10, 
                          color: tone ? '#e8c87a' : 'rgba(212,168,80,.5)', 
                          cursor: 'pointer', outline: 'none', letterSpacing: '0.5px' 
                        }}>
                        <option value="" disabled>✨ Select AI Tone...</option>
                        {TONES.map(t => (
                          <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                        ))}
                      </select>
                      {/* Dropdown Arrow */}
                      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(212,168,80,.5)', fontSize: 10 }}>
                        ▼
                      </div>
                    </div>

                    {/* AI Polish Button */}
                    <motion.button type="button" onClick={handleEnhanceStory}
                      disabled={aiLoading || !content.trim() || !activeCircleId || !tone}
                      whileHover={content.trim() && !aiLoading && tone ? { scale: 1.04 } : {}}
                      whileTap={content.trim() && !aiLoading && tone ? { scale: .96 } : {}}
                      style={{ padding: '7px 14px', border: '1px solid rgba(139,92,246,.4)', borderRadius: 8, background: 'rgba(139,92,246,.08)', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, color: (aiLoading || !content.trim() || !tone) ? 'rgba(139,92,246,.3)' : '#a78bfa', cursor: (aiLoading || !content.trim() || !tone) ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z"/></svg>
                      {aiLoading ? 'Polishing...' : 'AI Polish'}
                    </motion.button>
                  </div>

                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: content.length > 1800 ? 'rgba(248,113,113,.7)' : 'rgba(212,168,80,.25)', letterSpacing: 1, transition: 'color .3s' }}>
                    {content.length}/2000
                  </span>
                </div>
              </div>
            </div>

            {/* ── TAGS ── */}
            <DarkInput
              label="Tags"
              name="tags" value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="goa, wedding, 2025 — separate by commas"
              disabled={!activeCircleId || uploading || aiLoading}
              icon={iconTag}
            />

            <GoldDivider label="Attachments" />

            {/* ── MEDIA UPLOAD ── */}
            <div style={{ border: '1px dashed rgba(212,168,80,.25)', borderRadius: 16, padding: '20px 22px', background: 'rgba(212,168,80,.02)', transition: 'border-color .3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: mediaPreviews.length > 0 ? 16 : 0 }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: 'rgba(212,168,80,.75)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,80,.7)" strokeWidth="1.5" style={{ width: 14, height: 14 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                    Attach Memories
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 1.5, color: 'rgba(212,168,80,.3)' }}>Up to 5 photos · Max 15MB each</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <GoldButton small ghost onClick={() => setShowCollageMaker(true)} disabled={!activeCircleId || uploading || aiLoading}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    Collage
                  </GoldButton>
                  <label className="sc-file-label"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid rgba(212,168,80,.25)', borderRadius: 10, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(212,168,80,.55)', cursor: !activeCircleId || uploading ? 'not-allowed' : 'pointer', transition: 'all .25s', background: 'rgba(212,168,80,.04)' }}>
                    <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleFileSelect} disabled={!activeCircleId || uploading || aiLoading} style={{ display: 'none' }} />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload
                  </label>
                </div>
              </div>

              {/* Image previews */}
              <AnimatePresence>
                {mediaPreviews.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {mediaPreviews.map((url, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .85 }}
                        style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(212,168,80,.3)', boxShadow: '0 4px 16px rgba(0,0,0,.5)' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.15)' }} />
                        <button type="button" onClick={e => { e.preventDefault(); removeFile(idx); }}
                          style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: 'rgba(6,8,15,.88)', border: '1px solid rgba(212,168,80,.4)', color: '#e8c87a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, transition: 'all .2s' }}>✕</button>
                      </motion.div>
                    ))}
                    {mediaFiles.length < 5 && (
                      <label style={{ width: 80, height: 80, borderRadius: 10, border: '1px dashed rgba(212,168,80,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(212,168,80,.3)', gap: 4, transition: 'all .2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,.5)'; e.currentTarget.style.color = 'rgba(212,168,80,.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,80,.2)'; e.currentTarget.style.color = 'rgba(212,168,80,.3)'; }}>
                        <input type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: 1 }}>Add</span>
                      </label>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <GoldDivider label="Settings" />

            {/* ── MILESTONE + PUBLIC ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Milestone */}
              <div style={{ padding: '16px 18px', background: isMilestone ? 'rgba(212,168,80,.07)' : 'rgba(255,255,255,.02)', border: `1px solid ${isMilestone ? 'rgba(212,168,80,.4)' : 'rgba(212,168,80,.12)'}`, borderRadius: 14, transition: 'all .3s', position: 'relative' }}>
                {isMilestone && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,.5),transparent)' }} />}
                <GoldToggle checked={isMilestone} onChange={() => setIsMilestone(v => !v)} label="Family Milestone" icon="🌟" />
                <AnimatePresence>
                  {isMilestone && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 14, overflow: 'visible' }}>
                      <SectionLabel>Date & Time</SectionLabel>
                      <div className="vault-dp-wrap" style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2, opacity: .5 }}>
                          {iconCal}
                        </div>
                        <DatePicker
                          selected={milestoneDate}
                          onChange={d => setMilestoneDate(d)}
                          showTimeSelect timeFormat="HH:mm" timeIntervals={15}
                          dateFormat="MMM d, yyyy h:mm aa"
                          placeholderText="Select Date & Time..."
                          disabled={uploading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Global Public */}
              <div style={{ padding: '16px 18px', background: isGlobalPublic ? 'rgba(59,130,246,.06)' : 'rgba(255,255,255,.02)', border: `1px solid ${isGlobalPublic ? 'rgba(59,130,246,.35)' : 'rgba(212,168,80,.12)'}`, borderRadius: 14, transition: 'all .3s', display: 'flex', alignItems: 'center' }}>
                <GoldToggle checked={isGlobalPublic} onChange={() => setIsGlobalPublic(v => !v)} label="Make Global Public" icon="🌍" accentBlue />
              </div>
            </div>

            {/* ── SUBMIT ── */}
            <div style={{ marginTop: 4 }}>
              <GoldButton type="submit" fullWidth disabled={uploading || aiLoading || !activeCircleId}>
                {uploading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a0f00', display: 'inline-block', animation: `scDot 1.2s ${i * .2}s ease-in-out infinite` }} />)}
                    Sealing in Vault...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Seal Memory into the Vault
                  </span>
                )}
              </GoldButton>
            </div>

            {/* Rune footer */}
            <div style={{ textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,80,.12)', userSelect: 'none', marginTop: 2 }}>
              ✦ &nbsp; ᚦ ᛖ &nbsp; ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ &nbsp; ᛏ ᚱ ᚢ ᚾ ᚲ &nbsp; ✦
            </div>
          </form>
        </div>
      </div>

      {/* Collage Maker Portal */}
      {createPortal(
        <AnimatePresence>
          {showCollageMaker && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(4,6,14,.96)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
              <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle,rgba(212,168,80,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <motion.div initial={{ scale: .9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ position: 'relative', width: '100%', maxWidth: 900, maxHeight: '90vh', background: 'rgba(10,14,26,1)', border: '1px solid rgba(212,168,80,.3)', borderRadius: 22, boxShadow: '0 30px 100px rgba(0,0,0,.9), 0 0 40px rgba(212,168,80,.12)', overflow: 'hidden', margin: 20 }}>
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,80,.6),transparent)' }} />
                <CornerAccents size={16} inset={12} opacity={.4} />
                <button onClick={() => setShowCollageMaker(false)}
                  style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, background: 'rgba(6,8,15,.85)', border: '1px solid rgba(212,168,80,.3)', color: '#e8c87a', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,80,.15)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,8,15,.85)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  ✕
                </button>
                <CollageMaker onClose={() => setShowCollageMaker(false)} onSave={handleCollageSave} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default StoryComposer;