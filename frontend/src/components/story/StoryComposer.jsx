import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import CollageMaker from '../../pages/CollageMaker';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import imageCompression from 'browser-image-compression';
import { Sparkles, PenTool, Image as ImageIcon, Wand2, Tags, Type, X, Camera, Scissors, Plus, Trophy, Globe, Pin } from 'lucide-react';

const GLOBAL_STYLES = `
  .sc-textarea { scrollbar-width: thin; scrollbar-color: rgba(62,39,35,0.3) transparent; }
  .sc-textarea::-webkit-scrollbar { width: 8px; }
  .sc-textarea::-webkit-scrollbar-thumb { background: rgba(62,39,35,0.3); border-radius: 4px; }
  .sc-textarea::placeholder, .sc-input::placeholder { color: rgba(140, 123, 107, 0.6); font-family: 'Courier Prime', monospace; font-style: italic; }

  /* DatePicker vintage override */
  .vault-dp-wrap .react-datepicker-wrapper, .vault-dp-wrap .react-datepicker__input-container { width: 100%; }
  .vault-dp-wrap .react-datepicker__input-container input {
    width: 100%; padding: 12px 16px;
    background: transparent; border: 1px dashed rgba(62,39,35,0.3);
    border-radius: 4px; color: #3E2723;
    font-family: 'Courier Prime', monospace; font-size: 14px; outline: none;
    transition: all .2s; box-sizing: border-box;
  }
  .vault-dp-wrap .react-datepicker__input-container input:focus {
     border-color: #3E2723;
  }
  .react-datepicker { background: #FDFBF7 !important; border: 1px solid #3E2723 !important; font-family: 'Courier Prime', monospace !important; box-shadow: 4px 4px 0 rgba(0,0,0,0.1); border-radius: 4px !important; }
  .react-datepicker__header { background: #EEDEC1 !important; border-bottom: 1px solid #3E2723 !important; }
  .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker-time__header { color: #3E2723 !important; font-family: 'Playfair Display', serif !important; font-size: 14px !important; }
  .react-datepicker__day { color: #3E2723 !important; border-radius: 2px !important; font-size: 14px !important; }
  .react-datepicker__day:hover { background: rgba(62,39,35,0.1) !important; color: #3E2723 !important; }
  .react-datepicker__day--selected { background: #3E2723 !important; color: #FFF !important; }
  .react-datepicker__triangle { display: none !important; }
  .react-datepicker__time-container { border-left: 1px solid #3E2723 !important; }
  .react-datepicker__time { background: #FDFBF7 !important; }
  .react-datepicker__time-list-item { color: #3E2723 !important; }
  .react-datepicker__time-list-item:hover { background: rgba(62,39,35,0.1) !important; }
  .react-datepicker__time-list-item--selected { background: #3E2723 !important; color: #FFF !important; }
`;

function TypewriterInput({ label, type = 'text', name, value, onChange, placeholder, icon: Icon, disabled, as: Tag = 'input', rows, maxLength, style: extraStyle }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#8C7B6B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        {Icon && <Icon size={14} />} {label}
      </label>}
      <div style={{ position: 'relative' }}>
        <Tag
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} rows={rows} maxLength={maxLength} disabled={disabled}
          className={Tag === 'textarea' ? 'sc-textarea' : 'sc-input'}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ 
            width: '100%', padding: '12px 16px', 
            background: Tag === 'textarea' ? 'transparent' : 'rgba(255,255,255,0.5)', 
            border: 'none',
            borderBottom: focused ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.2)',
            borderRadius: 0, 
            color: '#3E2723', fontFamily: "'Courier Prime', monospace", fontSize: 16, lineHeight: 1.6,
            outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            transition: 'border-bottom 0.2s',
            ...(Tag === 'textarea' && {
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(62,39,35,0.05) 31px, rgba(62,39,35,0.05) 32px)',
              backgroundAttachment: 'local',
              lineHeight: '32px',
              paddingTop: '6px'
            }),
            ...extraStyle 
          }}
        />
      </div>
    </div>
  );
}

function VintageButton({ children, onClick, type = 'button', disabled, fullWidth, primary }) {
  return (
    <motion.button
      type={type} onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { opacity: 0.85 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '10px 20px', background: disabled ? 'transparent' : (primary ? '#3E2723' : 'transparent'),
        border: primary ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.3)', 
        borderRadius: 4, 
        color: disabled ? 'rgba(62,39,35,0.3)' : (primary ? '#FDFBF7' : '#3E2723'),
        fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', letterSpacing: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
      }}
    >
      {children}
    </motion.button>
  );
}

function VintageToggle({ checked, onChange, label, icon: Icon }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange} style={{ 
        width: 18, height: 18, borderRadius: 2, 
        border: checked ? '1px solid #3E2723' : '1px solid rgba(62,39,35,0.3)', 
        background: checked ? '#3E2723' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        transition: 'all .1s' 
      }}>
        {checked && <span style={{ fontSize: 12, color: '#FDFBF7' }}>✓</span>}
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Courier Prime', monospace", fontSize: 13, color: '#3E2723', textTransform: 'uppercase' }}>
        {Icon && <Icon size={14} />} {label}
      </span>
    </label>
  );
}

const TONES = [
  { value: 'Correct Grammar & Improve Flow', label: 'Correct Grammar' },
  { value: 'Expand and add more details',    label: 'Expand Details' },
  { value: 'Very Funny',                     label: 'Funny' },
  { value: 'Emotional',                      label: 'Emotional' },
  { value: 'Gen-Z Slang',                    label: 'Gen-Z Slang' },
  { value: 'Sarcastic & Witty',              label: 'Sarcastic' },
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
    if (selected.some(f => f.size > 2 * 1024 * 1024)) tid = toast.loading("Processing images...");

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
    if (tid) toast.success("Images ready!", { id: tid });
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
    if (!content.trim()) return toast.error('Draft something first!');
    setAiLoading(true);
    const tid = toast.loading('Typing title...');
    try {
      const res = await api.post('/ai/generate-title', { storyText: content });
      setTitle(res.data.title);
      toast.success('Title drafted.', { id: tid });
    } catch { toast.error('Typewriter jammed.', { id: tid }); }
    finally { setAiLoading(false); }
  };

  const handleEnhanceStory = async () => {
    if (!content.trim()) return toast.error('Draft something first!');
    if (!tone) return toast.error('Select an ink flavor.');
    setAiLoading(true);
    const tid = toast.loading('Rewriting draft...');
    try {
      const res = await api.post('/ai/enhance-story', { text: content, tone });
      setContent(res.data.enhancedText);
      toast.success('Draft revised.', { id: tid });
    } catch { toast.error('Ink dried up.', { id: tid }); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCircleId) return toast.error('Select an Archive');
    if (!title.trim() || !content.trim()) return toast.error('Title and entry are required');
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

    const tid = toast.loading('Filing entry...');
    try {
      await onPostStory(fd);
      toast.success('Entry Archived.', { id: tid });
      setTitle(''); setContent(''); setTags(''); setIsGlobalPublic(false); setMediaFiles([]); setMediaPreviews([]); setIsMilestone(false); setMilestoneDate(null); setTone('');
    } catch (err) { toast.error(err?.message || 'Filing failed', { id: tid }); }
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* Typewriter Paper Effect */}
      <div style={{ 
        background: '#FDFBF7', 
        border: '1px solid rgba(62,39,35,0.1)', 
        padding: '40px 40px 60px', 
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1), inset 0 0 60px rgba(140, 123, 107, 0.05)', 
        position: 'relative',
        maxWidth: 800,
        margin: '0 auto',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}>
        
        {/* Metal paper clip graphic */}
        <div style={{ position: 'absolute', top: -15, right: 60, width: 20, height: 50, border: '3px solid rgba(140,123,107,0.6)', borderRadius: 10, borderBottom: 'none', zIndex: 10, transform: 'rotate(12deg)' }}></div>
        <div style={{ position: 'absolute', top: -5, right: 64, width: 12, height: 35, border: '3px solid rgba(140,123,107,0.6)', borderRadius: 6, borderTop: 'none', zIndex: 11, transform: 'rotate(12deg)' }}></div>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3E2723', fontStyle: 'italic', margin: 0 }}>New Entry</h2>
          <div style={{ width: 40, height: 1, background: '#D4B895', margin: '12px auto' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── TITLE ── */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <TypewriterInput label="Header Title" name="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Type a title..." maxLength={150} disabled={!activeCircleId || uploading || aiLoading || compressing} icon={Type} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <VintageButton onClick={handleAutoTitle} disabled={aiLoading || compressing || !content.trim() || !activeCircleId}>
                <Wand2 size={14} /> Auto-Title
              </VintageButton>
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div>
            <TypewriterInput label="Draft Body" as="textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Begin typing..." rows={8} maxLength={2000} disabled={!activeCircleId || uploading || aiLoading || compressing} icon={PenTool} />
            
            {/* AI Toolbar (Vintage style) */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '12px 0', borderTop: '1px dashed rgba(62,39,35,0.1)' }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#8C7B6B', textTransform: 'uppercase' }}><Sparkles size={14} style={{ verticalAlign: 'text-bottom' }}/> Edit with Ink:</span>
              <select value={tone} onChange={e => setTone(e.target.value)} disabled={aiLoading || compressing || !activeCircleId} style={{ padding: '6px 10px', borderRadius: 2, border: '1px solid rgba(62,39,35,0.2)', fontFamily: "'Courier Prime', monospace", fontSize: 13, outline: 'none', cursor: 'pointer', background: 'transparent', flex: 1, minWidth: 150, color: '#3E2723' }}>
                <option value="" disabled>Select flavor...</option>
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <VintageButton type="button" onClick={handleEnhanceStory} disabled={aiLoading || compressing || !content.trim() || !activeCircleId || !tone}>
                {aiLoading ? 'Drafting...' : 'Rewrite'}
              </VintageButton>
            </div>
          </div>

          {/* ── TAGS ── */}
          <TypewriterInput label="Index Tags" name="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. vacation, 1999" disabled={!activeCircleId || uploading || aiLoading || compressing} icon={Tags} />

          {/* ── MEDIA UPLOAD ── */}
          <div style={{ border: '1px solid rgba(62,39,35,0.2)', padding: '24px', background: 'rgba(255,255,255,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px dashed rgba(62,39,35,0.2)', paddingBottom: 12 }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: '#3E2723', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={16} /> Attachments (Max 5)
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <VintageButton type="button" onClick={() => setShowCollageMaker(true)} disabled={!activeCircleId || uploading || aiLoading || compressing}>
                  <Scissors size={14} /> Collage
                </VintageButton>
                <label style={{ display: 'inline-block' }}>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} disabled={compressing || uploading} style={{ display: 'none' }} />
                  <div style={{ padding: '10px 20px', border: '1px solid rgba(62,39,35,0.3)', borderRadius: 4, color: '#3E2723', fontFamily: "'Courier Prime', monospace", fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={14} /> Browse
                  </div>
                </label>
              </div>
            </div>

            {/* Polaroid Previews */}
            <AnimatePresence>
              {mediaPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 10 }}>
                  {mediaPreviews.map((url, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      style={{ position: 'relative', width: 90, height: 100, background: '#FFF', padding: '4px 4px 16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '2px 4px 10px rgba(0,0,0,0.1)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3)' }} />
                      <button type="button" onClick={() => removeFile(idx)} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#3E2723', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SETTINGS ── */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', borderTop: '1px solid rgba(62,39,35,0.1)', paddingTop: 20 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <VintageToggle checked={isMilestone} onChange={() => setIsMilestone(v => !v)} label="Mark as Milestone" icon={Trophy} />
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
            
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'flex-start' }}>
              <VintageToggle checked={isGlobalPublic} onChange={() => setIsGlobalPublic(v => !v)} label="Public to World" icon={Globe} />
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <div style={{ marginTop: 10 }}>
            <VintageButton type="submit" fullWidth primary disabled={uploading || aiLoading || compressing || !activeCircleId}>
              <Pin size={16} /> {uploading ? 'Filing...' : 'File Entry'}
            </VintageButton>
          </div>
        </form>
      </div>

      {/* Collage Maker Portal */}
      {createPortal(
        <AnimatePresence>
          {showCollageMaker && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(23,23,25,0.9)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <motion.div initial={{ scale: .9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 20 }} transition={{ type: 'spring', bounce: 0.5 }}
                style={{ position: 'relative', width: '100%', maxWidth: 900, maxHeight: '90vh', background: '#FDFBF7', border: '1px solid #3E2723', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => setShowCollageMaker(false)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'transparent', border: '1px solid #3E2723', color: '#3E2723', width: 32, height: 32, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
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
