import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios'; 
import CollageMaker from '../../pages/CollageMaker'; // 🔥 IMPORTING THE NEW MAGIC COMPONENT

function StoryComposer({ activeCircleId, onPostStory, uploading }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(''); 
  const [isGlobalPublic, setIsGlobalPublic] = useState(false);
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState([]);
  
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneDate, setMilestoneDate] = useState('');

  const [tone, setTone] = useState('Nostalgic and Warm');
  const [aiLoading, setAiLoading] = useState(false);

  // 🔥 STATE FOR COLLAGE POPUP
  const [showCollageMaker, setShowCollageMaker] = useState(false);

  // 🖼️ Preview URLs generation
  useEffect(() => {
    if (!mediaFiles || mediaFiles.length === 0) {
      setMediaPreviewUrls([]);
      return;
    }
    const urls = mediaFiles.map(file => URL.createObjectURL(file));
    setMediaPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [mediaFiles]);

  // 📸 Multi-File Upload Logic (Max 5, 15MB each)
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (mediaFiles.length + selectedFiles.length > 5) {
      toast.error('You can only upload a maximum of 5 photos! 📸');
      return;
    }

    const MAX_FILE_SIZE_MB = 15; 
    const validFiles = [];

    selectedFiles.forEach(file => {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        toast.error(`❌ "${file.name}" is too large! Max is ${MAX_FILE_SIZE_MB}MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
    e.target.value = null; 
  };

  const removeFile = (indexToRemove) => {
    setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 🔥 HANDLE COLLAGE SAVE (Received from CollageMaker)
  const handleCollageSave = (collageFile) => {
    if (mediaFiles.length >= 5) {
      toast.error("You already have 5 files. Remove one to add the collage!");
      setShowCollageMaker(false);
      return;
    }
    setMediaFiles(prev => [...prev, collageFile]); // Add the generated image to our list
    setShowCollageMaker(false); // Close modal
  };

  // ✨ AI Magic: Auto-Title
  const handleAutoTitle = async () => {
    if (!content.trim()) return toast.error("Write something first for AI to read! 📝");
    setAiLoading(true);
    const tId = toast.loading("Thinking of a title... 🧠");
    try {
      const res = await api.post('/ai/generate-title', { storyText: content });
      setTitle(res.data.title);
      toast.success("Catchy title generated! ✨", { id: tId });
    } catch (err) {
      toast.error("AI is resting. Try manually! 😅", { id: tId });
    } finally {
      setAiLoading(false);
    }
  };

  // ✨ AI Magic: Enhance Story
  const handleEnhanceStory = async () => {
    if (!content.trim()) return toast.error("Write some rough notes first! 📝");
    setAiLoading(true);
    const tId = toast.loading(`Polishing with a ${tone.toLowerCase()}... ✨`);
    try {
      const res = await api.post('/ai/enhance-story', { text: content, tone });
      setContent(res.data.enhancedText);
      toast.success("Text Enhanced! 🪄", { id: tId });
    } catch (err) {
      toast.error("Magic spell failed. Try again! 🧙‍♂️", { id: tId });
    } finally {
      setAiLoading(false);
    }
  };

  // 🚀 Submit Story
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeCircleId) return toast.error('Please select an Active Family first. 👨‍👩‍👧‍👦'); 
    if (!title.trim() || !content.trim()) return toast.error('Title and content are required ⚠️'); 
    if (isMilestone && !milestoneDate) return toast.error('Select a date for this family milestone! 📅');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    
    // 🔥 ADDED: Append tags if they exist
    if (tags.trim()) formData.append('tags', tags.trim());
    
    formData.append('isGlobalPublic', isGlobalPublic ? 'true' : 'false');
    formData.append('circleId', activeCircleId);
    
    formData.append('isMilestone', isMilestone ? 'true' : 'false');
    if (isMilestone && milestoneDate) {
      formData.append('milestoneDate', milestoneDate);
    }
    formData.append('tone', tone);

    mediaFiles.forEach(file => {
      formData.append('media', file);
    });

    const toastId = toast.loading('Securing in Vault... 🚀');

    try {
      await onPostStory(formData);
      toast.success('Memory saved successfully! 🎉', { id: toastId });

      // Reset
      setTitle(''); setContent(''); setTags(''); setIsGlobalPublic(false);
      setMediaFiles([]); setMediaPreviewUrls([]);
      setIsMilestone(false); setMilestoneDate('');
    } catch (err) {
      toast.error(err?.message || 'Failed to save memory ❌', { id: toastId });
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', marginBottom: '40px', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)' }}>
      <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>📸</span> Save a Family Moment
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 🪄 TITLE BOX */}
        <div style={{ position: 'relative' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this moment called?..."
            maxLength={150} 
            style={{ width: '100%', padding: '16px 120px 16px 0', background: 'transparent', border: 'none', borderBottom: '2px solid #f1f5f9', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', outline: 'none', transition: 'border-color 0.2s', letterSpacing: '-0.5px' }}
            disabled={!activeCircleId || uploading || aiLoading}
            onFocus={(e) => e.target.style.borderBottomColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderBottomColor = '#f1f5f9'}
          />
          <button 
            type="button" 
            onClick={handleAutoTitle}
            disabled={aiLoading || !content.trim() || !activeCircleId}
            style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: (aiLoading || !content.trim()) ? 'not-allowed' : 'pointer', opacity: (aiLoading || !content.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            ✨ AI Title
          </button>
        </div>

        {/* 📝 TEXTAREA + AI TOOLBAR */}
        <div style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s', background: '#fafaf9' }}
             onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
             onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe this moment, what happened, who was there..."
            rows={5}
            maxLength={2000} 
            style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', color: '#334155', fontSize: '1.1rem', outline: 'none', resize: 'vertical', lineHeight: '1.6' }}
            disabled={!activeCircleId || uploading || aiLoading}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              
              {/* 🔥 EXPANDED AI TONES */}
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)}
                disabled={uploading || aiLoading}
                style={{ appearance: 'none', background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', cursor: 'pointer', outline: 'none' }}
              >
                <option value="Nostalgic and Warm">❤️ Nostalgic & Warm</option>
                <option value="😂 Very Funny">😂 Very Funny</option>
                <option value="🥺 Emotional">🥺 Emotional</option>
                <option value="🚀 Excited & Energetic">🚀 Excited & Energetic</option>
                <option value="📖 Storybook Tale">📖 Storybook Tale</option>
                <option value="🧐 Sarcastic & Witty">🧐 Sarcastic & Witty</option>
                <option value="😎 Gen-Z Slang">😎 Gen-Z Slang</option>
                <option value="📜 Poetic & Deep">📜 Poetic & Deep</option>
                <option value="👔 Formal & Respectful">👔 Formal & Respectful</option>
                <option value="🦸‍♂️ Action Movie Style">🦸‍♂️ Action Movie Style</option>
              </select>
              
              <button 
                type="button" 
                onClick={handleEnhanceStory}
                disabled={aiLoading || !content.trim() || !activeCircleId}
                style={{ background: 'transparent', color: '#8b5cf6', border: 'none', fontSize: '0.9rem', fontWeight: '700', cursor: (aiLoading || !content.trim()) ? 'not-allowed' : 'pointer', opacity: (aiLoading || !content.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {aiLoading ? 'Polishing...' : '🪄 AI Polish Text'}
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>{content.length}/2000</span>
          </div>
        </div>

        {/* 🏷️ TAGS BOX (Moved Below Textarea) */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', transition: 'border-color 0.2s' }}
             onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
             onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
          <span style={{ color: '#94a3b8', marginRight: '8px', fontWeight: 'bold' }}>#</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Add tags separated by commas (e.g. goa, wedding, 2025)"
            disabled={!activeCircleId || uploading || aiLoading}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', color: '#334155' }}
          />
        </div>
        
        {/* 📸 CLEAN FILE UPLOAD + COLLAGE MAKER */}
        <div style={{ padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mediaPreviewUrls.length > 0 ? '16px' : '0', flexWrap: 'wrap', gap: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📸</span>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '1rem' }}>Attach Media</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Up to 5 photos. Max 15MB each.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowCollageMaker(true)}
                disabled={!activeCircleId || uploading || aiLoading}
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700', cursor: (!activeCircleId || uploading || aiLoading) ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)', transition: 'transform 0.2s' }}
              >
                🔲 Build Collage
              </button>

              <label style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '20px', color: '#475569', fontSize: '0.9rem', fontWeight: '600', cursor: (!activeCircleId || uploading || aiLoading) ? 'not-allowed' : 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleFileSelect} disabled={!activeCircleId || uploading || aiLoading} style={{ display: 'none' }} />
                + Select Files
              </label>
            </div>

          </div>

          {/* Multiple Previews Grid */}
          {mediaPreviewUrls.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {mediaPreviewUrls.map((url, index) => (
                <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); removeFile(index); }}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🌟 TOGGLES */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px', padding: '16px', background: isMilestone ? '#fffbeb' : '#f8fafc', border: isMilestone ? '1px solid #fcd34d' : '1px solid #e2e8f0', borderRadius: '16px', transition: 'all 0.2s' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: isMilestone ? '#b45309' : '#475569', fontWeight: '700' }}>
              <input type="checkbox" checked={isMilestone} onChange={(e) => setIsMilestone(e.target.checked)} disabled={!activeCircleId || uploading || aiLoading} style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }} />
              🌟 Mark as Family Milestone
            </label>
            {isMilestone && (
              <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s' }}>
                <input type="datetime-local" value={milestoneDate} onChange={(e) => setMilestoneDate(e.target.value)} disabled={uploading} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fcd34d', background: '#fff', color: '#b45309', outline: 'none', fontWeight: '600' }} />
              </div>
            )}
          </div>
          
          <div style={{ flex: '1', minWidth: '250px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#475569', fontWeight: '700' }}>
              <input type="checkbox" checked={isGlobalPublic} onChange={(e) => setIsGlobalPublic(e.target.checked)} disabled={!activeCircleId || uploading || aiLoading} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
              🌍 Make Global Public
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={uploading || aiLoading || !activeCircleId} 
          style={{ width: '100%', padding: '16px', background: (!activeCircleId || uploading || aiLoading) ? '#cbd5e1' : '#0f172a', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', cursor: (!activeCircleId || uploading || aiLoading) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (!activeCircleId || uploading) ? 'none' : '0 10px 25px -5px rgba(15, 23, 42, 0.4)' }}
        >
          {uploading ? 'Securing in Vault...' : 'Save to Family Vault 🔐'}
        </button>

      </form>

      {/* 🔥 THE COLLAGE MODAL */}
      {showCollageMaker && (
        <CollageMaker 
          onClose={() => setShowCollageMaker(false)} 
          onSave={handleCollageSave} 
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default StoryComposer;