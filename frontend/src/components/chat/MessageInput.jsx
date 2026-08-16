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
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large! (Max 10MB)'); return; }
    setUploading(true);
    const tid = toast.loading('Uploading...');
    try {
      const res = await uploadChatMediaApi(file);
      if (res.success && res.url) { onSend({ text: text.trim(), imageUrl: res.url, audioUrl: '' }); setText(''); onTyping(''); toast.success('Image Sent!', { id: tid }); }
    } catch { toast.error('Upload failed.', { id: tid }); }
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
        const tid = toast.loading('Sending voice note...');
        try {
          const res = await uploadChatMediaApi(audioFile);
          if (res.success && res.url) { onSend({ text: '', imageUrl: '', audioUrl: res.url }); toast.success('Sent!', { id: tid }); }
        } catch { toast.error('Voice note failed.', { id: tid }); }
        finally { setUploading(false); }
      };
      setMediaRecorder(recorder); recorder.start(); setIsRecording(true);
    } catch { toast.error('Microphone denied.'); }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) { mediaRecorder.stop(); setIsRecording(false); }
  };

  const isUIDisabled = disabled || uploading || isRecording;
  const canSend = !isUIDisabled && text.trim();
  const shouldExpand = isFocused || text.trim().length > 0;

  return (
    <div style={{ position: 'relative', zIndex: 20, background: 'transparent', padding: '0 24px 32px', display: 'flex', justifyContent: 'center', width: '100%' }}>
      
      <motion.form layout onSubmit={handleSubmit} 
        style={{ 
          width: '100%', maxWidth: shouldExpand ? '860px' : '500px', display: 'flex', gap: 12, alignItems: 'center',
          background: '#FFF', border: '6px solid #171719', borderRadius: '40px', padding: '8px 12px 8px 24px',
          boxShadow: shouldExpand ? '12px 12px 0px 0px #3FE0FF' : '8px 8px 0px 0px #171719', transition: 'box-shadow 0.2s'
        }}
      >
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        {/* Attach */}
        <motion.button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUIDisabled}
          whileHover={!isUIDisabled ? { scale: 1.1 } : {}} whileTap={!isUIDisabled ? { scale: 0.9 } : {}}
          style={{ background: '#FFD23F', border: '3px solid #171719', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isUIDisabled ? 'not-allowed' : 'pointer', fontSize: 24, boxShadow: '2px 2px 0px 0px #171719', flexShrink: 0 }}
        >
          📎
        </motion.button>

        {/* Input */}
        <input
          type="text" value={text} placeholder={isRecording ? '🎙️ RECORDING...' : isUIDisabled ? 'UPLOADING...' : 'TYPE SOMETHING...'}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          onChange={(e) => { const v = e.target.value; setText(v); if (v.trim()) onTyping(v); else onTyping(''); }}
          disabled={isUIDisabled} autoComplete="off"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 20, color: '#171719', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700 }}
        />

        {/* Mic */}
        <AnimatePresence>
          {!text.trim() && (
            <motion.button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={disabled || uploading}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
              style={{ background: isRecording ? '#FF3D81' : '#FFF', border: '3px solid #171719', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (disabled || uploading) ? 'not-allowed' : 'pointer', fontSize: 20, boxShadow: '2px 2px 0px 0px #171719', flexShrink: 0 }}
            >
              🎙️
            </motion.button>
          )}
        </AnimatePresence>

        {/* Send */}
        <motion.button type="submit" disabled={!canSend}
          whileHover={canSend ? { scale: 1.1 } : {}} whileTap={canSend ? { scale: 0.9, boxShadow: '0px 0px 0px 0px #171719' } : {}}
          style={{ width: 56, height: 56, borderRadius: '50%', background: canSend ? '#00C853' : '#F5F5F5', border: '4px solid #171719', cursor: canSend ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: canSend ? '4px 4px 0px 0px #171719' : 'none', fontSize: 24, flexShrink: 0 }}
        >
          {uploading ? '⏳' : '🚀'}
        </motion.button>
      </motion.form>
    </div>
  );
}

export default MessageInput;