import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
    setText('');
    onTyping('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image is too large (Max 10MB)');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading image... 📸');
    try {
      const res = await uploadChatMediaApi(file);
      if (res.success && res.url) {
        onSend({ text: text.trim(), imageUrl: res.url, audioUrl: '' });
        setText('');
        onTyping('');
        toast.success('Image sent!', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to upload image.', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        
        setUploading(true);
        const toastId = toast.loading('Sending voice note... 🎤');
        try {
          const res = await uploadChatMediaApi(audioFile);
          if (res.success && res.url) {
            onSend({ text: '', imageUrl: '', audioUrl: res.url });
            toast.success('Voice note sent!', { id: toastId });
          }
        } catch (err) {
          toast.error('Failed to send voice note.', { id: toastId });
        } finally {
          setUploading(false);
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      toast('Recording... Click again to send.', { icon: '🎙️', id: 'recordingToast' });
    } catch (err) {
      toast.error('Microphone access denied or error.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.dismiss('recordingToast');
    }
  };

  const isUI_Disabled = disabled || uploading || isRecording;
  const isSendDisabled = isUI_Disabled || !text.trim(); // Helper for Send button state

  return (
    <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: '800px', display: 'flex', gap: '12px', padding: '12px 24px', alignItems: 'center'
      }}>
        
        {/* 📎 Image Attachment Icon */}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUI_Disabled}
          style={{ 
            background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '50%', width: '44px', height: '44px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isUI_Disabled ? 'not-allowed' : 'pointer', 
            color: '#64748b', transition: 'all 0.2s ease', opacity: isUI_Disabled ? 0.5 : 1, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' 
          }} 
          onMouseOver={(e) => !isUI_Disabled && (e.currentTarget.style.color = '#3b82f6', e.currentTarget.style.borderColor = '#3b82f6', e.currentTarget.style.transform = 'scale(1.05)')} 
          onMouseOut={(e) => !isUI_Disabled && (e.currentTarget.style.color = '#64748b', e.currentTarget.style.borderColor = '#cbd5e1', e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        </button>

        {/* Input Box Wrapper */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '24px',
          border: isFocused ? '2px solid #6366f1' : '1px solid #cbd5e1',
          transition: 'all 0.3s ease', padding: '6px 20px', boxShadow: isFocused ? '0 4px 15px rgba(99, 102, 241, 0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.01)'
        }}>
          <input
            type="text"
            value={text}
            placeholder={isUI_Disabled ? "Processing..." : "Message your family..."}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              const val = e.target.value;
              setText(val);
              if (val.trim()) onTyping(val); else onTyping('');
            }}
            disabled={isUI_Disabled}
            autoComplete="off"
            style={{ flex: 1, border: 'none', padding: '10px 0', outline: 'none', background: 'transparent', fontSize: '15px', color: '#1e293b' }}
          />
          
          {/* 🎙️ Voice Note Icon */}
          <button 
            type="button" 
            onClick={isRecording ? stopRecording : startRecording} 
            disabled={disabled || uploading}
            style={{ 
              background: 'transparent', border: 'none', fontSize: '20px', 
              cursor: (disabled || uploading) ? 'not-allowed' : 'pointer', 
              color: isRecording ? '#ef4444' : '#94a3b8', 
              transition: 'all 0.2s ease', padding: '0 0 0 8px', display: text.trim() ? 'none' : 'block' // Hide mic when text is typed
            }} 
            onMouseOver={(e) => !(disabled || uploading || isRecording) && (e.currentTarget.style.color = '#6366f1', e.currentTarget.style.transform = 'scale(1.1)')} 
            onMouseOut={(e) => !(disabled || uploading || isRecording) && (e.currentTarget.style.color = '#94a3b8', e.currentTarget.style.transform = 'scale(1)')}
          >
            {isRecording ? (
               <div style={{ animation: 'pulse 1s infinite' }}>🔴</div>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            )}
          </button>
        </div>

        {/* 🚀 Always Visible Send Button */}
        <motion.button 
          whileHover={{ scale: isSendDisabled ? 1 : 1.05 }}
          whileTap={{ scale: isSendDisabled ? 1 : 0.95 }}
          type="submit" disabled={isSendDisabled} 
          style={{
            width: '46px', height: '46px', borderRadius: '50%', 
            background: isSendDisabled ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            color: isSendDisabled ? '#94a3b8' : '#ffffff',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: isSendDisabled ? 'not-allowed' : 'pointer', 
            boxShadow: isSendDisabled ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'background 0.3s ease, color 0.3s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: isSendDisabled ? '0' : '-2px', marginTop: '2px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </motion.button>
      </form>
    </div>
  );
}

export default MessageInput;