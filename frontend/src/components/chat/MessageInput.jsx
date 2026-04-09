import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadChatMediaApi } from '../../api/messageApi';

function MessageInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !uploading) return;
    onSend({ text: text.trim(), imageUrl: '', audioUrl: '' });
    setText(''); onTyping('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large (Max 10MB)'); return; }
    setUploading(true);
    const tid = toast.loading('Transmitting image...');
    try {
      const res = await uploadChatMediaApi(file);
      if (res.success && res.url) { onSend({ text: text.trim(), imageUrl: res.url, audioUrl: '' }); setText(''); onTyping(''); toast.success('Image transmitted!', { id: tid }); }
    } catch { toast.error('Transmission failed.', { id: tid }); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        const audioFile = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        setUploading(true);
        const tid = toast.loading('Sealing voice note...');
        try {
          const res = await uploadChatMediaApi(audioFile);
          if (res.success && res.url) { onSend({ text: '', imageUrl: '', audioUrl: res.url }); toast.success('Voice note sent!', { id: tid }); }
        } catch { toast.error('Voice note failed.', { id: tid }); }
        finally { setUploading(false); }
      };
      setMediaRecorder(recorder); recorder.start(); setIsRecording(true);
      toast('Recording... tap again to seal.', { icon: '🎙️', id: 'rec' });
    } catch { toast.error('Microphone denied.'); }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) { mediaRecorder.stop(); setIsRecording(false); toast.dismiss('rec'); }
  };

  const isUIDisabled = disabled || uploading || isRecording;
  const canSend = !isUIDisabled && text.trim();

  // 🔥 EXPAND LOGIC: Expand if focused OR if there is text typed
  const shouldExpand = isFocused || text.trim().length > 0;

  return (
    <div style={{
      position: 'relative', zIndex: 20,
      background: 'transparent', // ❌ REMOVED THE UGLY BOTTOM BAR
      padding: '0 24px 32px', // Floating padding from bottom
      display: 'flex', justifyContent: 'center', width: '100%'
    }}>
      <style>{`
        @keyframes miPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.1)} }
        @keyframes miShine { 0%,70%{left:-100%} 100%{left:150%} }
        .mi-input::placeholder{color:rgba(212,168,80,0.4);font-style:italic;font-family:'Cormorant Garamond',serif;}
      `}</style>

      {/* 🔥 THE MAGIC FLOATING PILL */}
      <motion.form 
        layout // Framer motion will automatically animate width changes perfectly smoothly
        onSubmit={handleSubmit} 
        style={{ 
          width: '100%', 
          maxWidth: shouldExpand ? '820px' : '450px', // The expansion magic!
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'rgba(8, 12, 22, 0.75)', // Deep glass
          backdropFilter: 'blur(24px)',
          border: `1px solid ${shouldExpand ? 'rgba(212,168,80,0.4)' : 'rgba(212,168,80,0.15)'}`,
          borderRadius: '40px', // Perfect pill shape
          padding: '6px 8px 6px 16px',
          boxShadow: shouldExpand 
            ? '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(212,168,80,0.1)' 
            : '0 10px 30px rgba(0,0,0,0.5)',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
        }}
      >
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        {/* Attach button (Minimal, no borders) */}
        <motion.button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUIDisabled}
          whileHover={!isUIDisabled ? { scale: 1.1, color: '#e8c87a' } : {}} 
          whileTap={!isUIDisabled ? { scale: 0.9 } : {}}
          style={{
            background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isUIDisabled ? 'not-allowed' : 'pointer',
            color: 'rgba(212,168,80,0.6)', opacity: isUIDisabled ? 0.4 : 1,
            transition: 'color 0.3s', padding: 0
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </motion.button>

        {/* Input Field */}
        <input
          className="mi-input"
          type="text" value={text}
          placeholder={isRecording ? '🎙️ Recording your voice note...' : isUIDisabled ? 'Processing transmission...' : 'Inscribe your message...'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => { const v = e.target.value; setText(v); if (v.trim()) onTyping(v); else onTyping(''); }}
          disabled={isUIDisabled}
          autoComplete="off"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent', 
            fontSize: 16, color: 'rgba(255,255,255,0.9)',
            fontFamily: "'Cormorant Garamond',serif", padding: '8px 10px',
            lineHeight: '1.2'
          }}
        />

        {/* Mic button (Minimal) */}
        <AnimatePresence>
          {!text.trim() && (
            <motion.button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || uploading}
              initial={{ opacity: 0, scale: 0.8, width: 0 }} 
              animate={{ opacity: 1, scale: 1, width: 'auto' }} 
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              whileHover={!(disabled || uploading) ? { scale: 1.1, color: isRecording ? '#f87171' : '#e8c87a' } : {}}
              style={{
                background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (disabled || uploading) ? 'not-allowed' : 'pointer',
                color: isRecording ? '#f87171' : 'rgba(212,168,80,0.6)',
                transition: 'color 0.25s', padding: '0 4px',
                animation: isRecording ? 'miPulse 1s ease-in-out infinite' : 'none',
              }}
            >
              {isRecording
                ? <svg viewBox="0 0 24 24" fill="#f87171" style={{ width: 16, height: 16 }}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
              }
            </motion.button>
          )}
        </AnimatePresence>

        {/* Send button (Integrated perfectly inside the pill) */}
        <motion.button
          type="submit" disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0, // Slightly smaller to fit in pill nicely
            position: 'relative', overflow: 'hidden',
            background: canSend
              ? 'linear-gradient(135deg,#c9933a 0%,#e8a820 100%)'
              : 'rgba(255,255,255,0.06)',
            border: canSend ? 'none' : '1px solid rgba(212,168,80,0.1)',
            color: canSend ? '#1a0f00' : 'rgba(212,168,80,0.3)',
            cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: canSend ? '0 4px 15px rgba(212,168,80,0.4)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          {canSend && (
            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', transform: 'skewX(-20deg)', animation: 'miShine 2.5s ease-in-out infinite' }} />
          )}
          {uploading
            ? <div style={{ width: 14, height: 14, border: '2px solid rgba(212,168,80,0.3)', borderTopColor: '#e8c87a', borderRadius: '50%', animation: 'vrSpin 0.8s linear infinite' }} />
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginLeft: -1, marginTop: 1 }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          }
        </motion.button>
      </motion.form>
    </div>
  );
}

export default MessageInput;