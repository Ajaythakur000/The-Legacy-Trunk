import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import CollageMaker from '../../pages/CollageMaker';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import imageCompression from 'browser-image-compression';

// ─── Global Neo-Brutalist Styles ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  .sc-textarea { scrollbar-width: thin; scrollbar-color: #3E2723 transparent; }
  .sc-textarea::-webkit-scrollbar { width: 8px; }
  .sc-textarea::-webkit-scrollbar-thumb { background: #3E2723; border-radius: 4px; }
  .sc-textarea::placeholder, .sc-input::placeholder { color: rgba(23,23,25,0.4); font-family: 'Playfair Display', serif; }

  /* DatePicker pop-art override */
  .vault-dp-wrap .react-datepicker-wrapper, .vault-dp-wrap .react-datepicker__input-container { width: 100%; }
  .vault-dp-wrap .react-datepicker__input-container input {
    width: 100%; padding: 14px 16px 14px 44px;
    background: #FFF; border: 1px solid #3E2723;
    borderRadius: 12px; color: #3E2723;
    font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 16px; outline: none;
    transition: all .2s; box-sizing: border-box;
    box-shadow: 4px 4px 15px 0px rgba(0,0,0,0.3);
  }
  .vault-dp-wrap .react-datepicker__input-container input:focus {
    transform: translate(-2px, -2px); box-shadow: 6px 6px 15px 0px rgba(0,0,0,0.3);
  }
  .react-datepicker { background: #FFF !important; border: 2px solid #3E2723 !important; font-family: 'Baloo 2', sans-serif !important; font-weight: 700 !important; box-shadow: 8px 8px 15px 0px rgba(0,0,0,0.3); border-radius: 12px !important; overflow: hidden; }
  .react-datepicker__header { background: #D4B895 !important; border-bottom: 3px solid #3E2723 !important; }
  .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker-time__header { color: #3E2723 !important; font-family: 'Playfair Display', serif !important; font-size: 14px !important; letter-spacing: 1px !important; }
  .react-datepicker__day { color: #3E2723 !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 700; }
  .react-datepicker__day:hover { background: #8B5A2B !important; color: #3E2723 !important; border: 2px solid #3E2723; }
  .react-datepicker__day--selected { background: #632020 !important; color: #FFF !important; border: 2px solid #3E2723; }
  .react-datepicker__triangle { display: none !important; }
  .react-datepicker__time-container { border-left: 3px solid #3E2723 !important; }
  .react-datepicker__time { background: #FFF !important; }
  .react-datepicker__time-list-item { color: #3E2723 !important; font-weight: 700 !important; }
  .react-datepicker__time-list-item:hover { background: #D4B895 !important; }
  .react-datepicker__time-list-item--selected { background: #632020 !important; color: #FFF !important; }

  .sc-select option { background: #FFF; color: #3E2723; padding: 10px; font-weight: 700; }
`;

// ─── Input wrapper ────────────────────────────────────────────────────────────
function ComicInput({ label, type = 'text', name, value, onChange, placeholder, icon, disabled, as: Tag = 'input', rows, maxLength, style: extraStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#3E2723', marginBottom: 6 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 16, top: Tag === 'input' ? '50%' : 20, transform: Tag === 'input' ? 'translateY(-50%)' : 'none', fontSize: 18, zIndex: 1 }}>
            {icon}
          </div>
        )}
        <Tag
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} rows={rows} maxLength={maxLength} disabled={disabled}
          className={Tag === 'textarea' ? 'sc-textarea' : 'sc-input'}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ 
            width: '100%', padding: icon ? '14px 16px 14px 44px' : '14px 16px', 
            background: '#FFF', border: '1px solid #3E2723', borderRadius: 12, 
            color: '#3E2723', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, 
            outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            boxShadow: focused ? '6px 6px 0px 0px #8B5A2B' : '4px 4px 0px 0px #3E2723',
            transform: focused ? 'translate(-2px, -2px)' : 'none', transition: 'all .2s',
            ...extraStyle 
          }}
        />
      </div>
    </div>
  );
}

// ─── Comic Button ──────────────────────────────────────────────────────────────
function ComicButton({ children, onClick, type = 'button', disabled, fullWidth, color = '#8B5A2B' }) {
  return (
    <motion.button
      type={type} onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.3)' } : {}}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '14px 24px', background: disabled ? '#ccc' : color,
        border: '2px solid #3E2723', borderRadius: 12, color: '#3E2723',
        fontFamily: "'Playfair Display', serif", fontSize: 20, letterSpacing: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '6px 6px 15px 0px rgba(0,0,0,0.3)', transition: 'box-shadow 0.1s, transform 0.1s',
        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
      }}
    >
      {children}
    </motion.button>
  );
}

// ─── Toggle checkbox ──────────────────────────────────────────────────────────
function ComicToggle({ checked, onChange, label, icon, color = '#D4B895' }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange} style={{ 
        width: 28, height: 28, borderRadius: 8, border: '1px solid #3E2723', 
        background: checked ? color : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        boxShadow: checked ? '2px 2px 0px 0px #3E2723' : '4px 4px 0px 0px #3E2723',
        transform: checked ? 'translate(2px, 2px)' : 'none', transition: 'all .1s' 
      }}>
        {checked && <span style={{ fontSize: 18, color: '#3E2723' }}>✓</span>}
      </div>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#3E2723' }}>
        {icon} {label}
      </span>
    </label>
  );
}

const TONES = [
  { value: 'Correct Grammar & Improve Flow', label: 'Correct Grammar', icon: '✍️' },
  { value: 'Expand and add more details',    label: 'Expand Details',  icon: '✨' },
  { value: '😂 Very Funny',                  label: 'Funny',           icon: '😂' },
  { value: '🥺 Emotional',                   label: 'Emotional',       icon: '🥺' },
  { value: '😎 Gen-Z Slang',                 label: 'Gen-Z Slang',     icon: '😎' },
  { value: '🧐 Sarcastic & Witty',           label: 'Sarcastic',       icon: '🧐' },
];

export default function StoryComposer({ activeCircleId, onPostStory, uploading }) {
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [tags, setTags]             = useState('');
  const [isGlobalPublic, setIsGlobalPublic] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneDate, setMilestoneDate] = useState(null);
  const [tone, setTone]             = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const [showCollageMaker, setShowCollageMaker] = useState(false);
  const [compressing, setCompressing] = useState(false); 

  useEffect(() => {
    if (!mediaFiles.length) { setMediaPreviews([]); return; }
    const urls = mediaFiles.map(f => URL.createObjectURL(f));
    setMediaPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [mediaFiles]);

  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    if (mediaFiles.length + selected.length > 5) { toast.error('Max 5 photos allowed!'); return; }

    setCompressing(true);
    let tid;
    if (selected.some(f => f.size > 2 * 1024 * 1024)) tid = toast.loading("Squishing photos...");

    const compressedFiles = [];
    const options = { maxSizeMB: 8, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.85 };

    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        if (file.size / (1024 * 1024) > 15) toast.error(`"${file.name}" is too big (Max 15MB)`);
        else compressedFiles.push(file);
        continue;
      }
      try {
        compressedFiles.push(await imageCompression(file, options));
      } catch (error) {
        if (file.size / (1024 * 1024) > 15) toast.error(`"${file.name}" is too big.`);
        else compressedFiles.push(file);
      }
    }

    if (compressedFiles.length > 0) setMediaFiles(prev => [...prev, ...compressedFiles]);
    if (tid) toast.success("Photos squished!", { id: tid });
    setCompressing(false);
    e.target.value = null;
  };

  const removeFile = (i) => setMediaFiles(p => p.filter((_, idx) => idx !== i));

  const handleCollageSave = (file) => {
    if (mediaFiles.length >= 5) { toast.error('Remove a file first!'); setShowCollageMaker(false); return; }
    setMediaFiles(p => [...p, file]);
    setShowCollageMaker(false);
  };

  const handleAutoTitle = async () => {
    if (!content.trim()) return toast.error('Write something first!');
    setAiLoading(true);
    const tid = toast.loading('Thinking of a title...');
    try {
      const res = await api.post('/ai/generate-title', { storyText: content });
      setTitle(res.data.title);
      toast.success('Boom! Title ready. 💥', { id: tid });
    } catch { toast.error('AI is tired. Do it yourself!', { id: tid }); }
    finally { setAiLoading(false); }
  };

  const handleEnhanceStory = async () => {
    if (!content.trim()) return toast.error('Write something first!');
    if (!tone) return toast.error('Pick a tone!');
    setAiLoading(true);
    const tid = toast.loading('Adding flavor...');
    try {
      const res = await api.post('/ai/enhance-story', { text: content, tone });
      setContent(res.data.enhancedText);
      toast.success('Text souped up! 🪄', { id: tid });
    } catch { toast.error('Magic failed!', { id: tid }); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCircleId) return toast.error('Select a Family');
    if (!title.trim() || !content.trim()) return toast.error('Title and content are required');
    if (isMilestone && !milestoneDate) return toast.error('Select a date');

    const fd = new FormData();
    fd.append('title', title.trim()); fd.append('content', content.trim());
    if (tags.trim()) fd.append('tags', tags.trim());
    fd.append('isGlobalPublic', isGlobalPublic ? 'true' : 'false');
    fd.append('circleId', activeCircleId);
    fd.append('isMilestone', isMilestone ? 'true' : 'false');
    if (isMilestone && milestoneDate) fd.append('milestoneDate', milestoneDate.toISOString());
    fd.append('tone', tone || 'Original');
    mediaFiles.forEach(f => fd.append('media', f));

    const tid = toast.loading('Pasting into scrapbook...');
    try {
      await onPostStory(fd);
      toast.success('Memory Pasted! 📌', { id: tid });
      setTitle(''); setContent(''); setTags(''); setIsGlobalPublic(false); setMediaFiles([]); setMediaPreviews([]); setIsMilestone(false); setMilestoneDate(null); setTone('');
    } catch (err) { toast.error(err?.message || 'Failed to paste', { id: tid }); }
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div style={{ background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, padding: '40px', boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── TITLE ── */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <ComicInput label="MEMORY TITLE" name="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g. The Great Pie Disaster of '24" maxLength={150} disabled={!activeCircleId || uploading || aiLoading || compressing} icon="✍️" />
            </div>
            <div style={{ marginTop: 26 }}>
              <ComicButton onClick={handleAutoTitle} disabled={aiLoading || compressing || !content.trim() || !activeCircleId} color="#D4B895">
                🤖 AI TITLE
              </ComicButton>
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div>
            <ComicInput label="THE STORY" as="textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="So, here's what actually happened..." rows={6} maxLength={2000} disabled={!activeCircleId || uploading || aiLoading || compressing} icon="💭" />
            
            {/* AI Toolbar */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: '#F5F5F5', padding: 12, border: '3px dashed #3E2723', borderRadius: 12, marginTop: -8 }}>
              <select value={tone} onChange={e => setTone(e.target.value)} disabled={aiLoading || compressing || !activeCircleId} style={{ padding: '10px', borderRadius: 8, border: '1px solid #3E2723', fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, outline: 'none', cursor: 'pointer', background: '#FFF', flex: 1, minWidth: 180 }}>
                <option value="" disabled>✨ Pick an AI Flavor...</option>
                {TONES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
              <motion.button type="button" onClick={handleEnhanceStory} disabled={aiLoading || compressing || !content.trim() || !activeCircleId || !tone} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: '10px 16px', background: '#8B5A2B', border: '1px solid #3E2723', borderRadius: 8, fontFamily: "'Playfair Display', serif", color: '#3E2723', cursor: 'pointer', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.3)' }}>
                {aiLoading ? 'MIXING...' : 'SPICE IT UP! 🌶️'}
              </motion.button>
            </div>
          </div>

          {/* ── TAGS ── */}
          <ComicInput label="TAGS" name="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="funny, vacation, uncle-bob" disabled={!activeCircleId || uploading || aiLoading || compressing} icon="🏷️" />

          {/* ── MEDIA UPLOAD ── */}
          <div style={{ border: '4px dashed #3E2723', borderRadius: 16, padding: '24px', background: '#D4B895' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3E2723' }}>📸 PHOTOS (MAX 5)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setShowCollageMaker(true)} disabled={!activeCircleId || uploading || aiLoading || compressing} style={{ padding: '8px 16px', background: '#632020', border: '1px solid #3E2723', borderRadius: 8, fontFamily: "'Playfair Display', serif", color: '#FFF', cursor: 'pointer', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.3)' }}>
                  ✂️ COLLAGE
                </button>
                <label style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #3E2723', borderRadius: 8, fontFamily: "'Playfair Display', serif", color: '#3E2723', cursor: 'pointer', boxShadow: '2px 2px 15px 0px rgba(0,0,0,0.3)' }}>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} disabled={compressing || uploading} style={{ display: 'none' }} />
                  ➕ BROWSE
                </label>
              </div>
            </div>

            {/* Polaroid Previews */}
            <AnimatePresence>
              {mediaPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {mediaPreviews.map((url, idx) => (
                    <motion.div key={idx} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: idx % 2 === 0 ? 4 : -4 }} exit={{ scale: 0 }}
                      style={{ position: 'relative', width: 100, height: 110, background: '#FFF', padding: '6px 6px 20px', border: '1px solid #3E2723', borderRadius: 4, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid #3E2723' }} />
                      <button type="button" onClick={() => removeFile(idx)} style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderRadius: '50%', background: '#632020', border: '1px solid #3E2723', color: '#FFF', cursor: 'pointer', fontFamily: "'Playfair Display', serif" }}>X</button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SETTINGS ── */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250, padding: 16, border: '1px solid #3E2723', borderRadius: 12, background: isMilestone ? '#8B5A2B' : '#F5F5F5', transition: 'background .3s' }}>
              <ComicToggle checked={isMilestone} onChange={() => setIsMilestone(v => !v)} label="MARK AS MILESTONE" icon="🏆" color="#D4B895" />
              <AnimatePresence>
                {isMilestone && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 12 }}>
                    <div className="vault-dp-wrap">
                      <DatePicker selected={milestoneDate} onChange={d => setMilestoneDate(d)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="MMM d, yyyy h:mm aa" placeholderText="Select Date..." disabled={uploading || compressing} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div style={{ flex: 1, minWidth: 250, padding: 16, border: '1px solid #3E2723', borderRadius: 12, background: isGlobalPublic ? '#D4B895' : '#F5F5F5', display: 'flex', alignItems: 'center' }}>
              <ComicToggle checked={isGlobalPublic} onChange={() => setIsGlobalPublic(v => !v)} label="PUBLIC TO WORLD" icon="🌍" color="#8B5A2B" />
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <ComicButton type="submit" fullWidth disabled={uploading || aiLoading || compressing || !activeCircleId} color="#00C853">
            {uploading ? 'GLUING IT DOWN...' : 'PASTE INTO SCRAPBOOK 📌'}
          </ComicButton>
        </form>
      </div>

      {/* Collage Maker Portal */}
      {createPortal(
        <AnimatePresence>
          {showCollageMaker && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <motion.div initial={{ scale: .9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 20 }} transition={{ type: 'spring', bounce: 0.5 }}
                style={{ position: 'relative', width: '100%', maxWidth: 900, maxHeight: '90vh', background: '#FFF', border: '6px solid #3E2723', borderRadius: 24, boxShadow: '16px 16px 15px 0px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => setShowCollageMaker(false)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: '#632020', border: '2px solid #3E2723', color: '#FFF', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontSize: 20, boxShadow: '4px 4px 15px 0px rgba(0,0,0,0.3)' }}>✕</button>
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