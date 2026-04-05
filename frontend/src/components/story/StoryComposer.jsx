import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function StoryComposer({ activeCircleId, onPostStory, uploading }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isGlobalPublic, setIsGlobalPublic] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  
  // ==========================================
  // 🔥 NAYA: Milestone States
  // ==========================================
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneDate, setMilestoneDate] = useState('');

  // 🖼️ Handle Image/Video Preview
  useEffect(() => {
    if (!mediaFile) return setMediaPreviewUrl('');
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeCircleId) {
      toast.error('Please select an Active Family from the top navigation first. 👨‍👩‍👧‍👦'); 
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required ⚠️'); 
      return;
    }

    // Agar milestone hai, toh date honi hi chahiye
    if (isMilestone && !milestoneDate) {
      toast.error('Please select a date for this family milestone! 📅');
      return;
    }

    // 📦 Pack data for backend
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    if (tags.trim()) formData.append('tags', tags.trim());
    formData.append('isGlobalPublic', isGlobalPublic ? 'true' : 'false');
    formData.append('circleId', activeCircleId);
    
    // 🔥 Milestone data packing
    formData.append('isMilestone', isMilestone ? 'true' : 'false');
    if (isMilestone && milestoneDate) {
      formData.append('milestoneDate', milestoneDate);
    }

    if (mediaFile) formData.append('media', mediaFile);

    const toastId = toast.loading('Uploading to Vault... 🚀');

    try {
      await onPostStory(formData);
      
      toast.success('Story posted successfully! 🎉', { id: toastId });

      // Form clear kar do
      setTitle('');
      setContent('');
      setTags('');
      setIsGlobalPublic(false);
      setMediaFile(null);
      setMediaPreviewUrl('');
      setIsMilestone(false);
      setMilestoneDate('');
    } catch (err) {
      toast.error(err?.message || 'Failed to post story ❌', { id: toastId });
    }
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '24px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ✍️ Add to the Vault
      </h3>
      
      <form onSubmit={handleSubmit}>
        
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your story a catchy title..."
          maxLength={150} 
          style={{ width: '100%', padding: '12px 14px', marginBottom: '4px', borderRadius: '10px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '15px', outline: 'none' }}
          disabled={!activeCircleId || uploading}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#9ca3af', marginBottom: '12px', fontWeight: 'bold' }}>
          {title.length}/150
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in the family?"
          rows={4}
          maxLength={2000} 
          style={{ width: '100%', padding: '12px 14px', marginBottom: '4px', borderRadius: '10px', border: '1px solid #d1d5db', boxSizing: 'border-box', resize: 'vertical', fontSize: '15px', outline: 'none' }}
          disabled={!activeCircleId || uploading}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#9ca3af', marginBottom: '12px', fontWeight: 'bold' }}>
          {content.length}/2000
        </div>
        
        {/* 📸 File Upload */}
        <div style={{ marginBottom: '16px', padding: '16px', border: '2px dashed #d1d5db', borderRadius: '12px', background: '#f9fafb', transition: 'all 0.2s' }}>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            disabled={!activeCircleId || uploading}
            style={{ width: '100%', fontSize: '14px', color: '#4b5563' }}
          />
          {mediaPreviewUrl && mediaFile?.type?.startsWith('image') && (
            <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', width: 'fit-content' }}>
              <img src={mediaPreviewUrl} alt="Preview" style={{ maxHeight: '150px', display: 'block', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 🌟 THE MILESTONE TOGGLE BOX */}
        {/* ========================================== */}
        <div style={{ 
          marginBottom: '16px', padding: '16px', 
          background: isMilestone ? '#fffbeb' : '#f8fafc', 
          border: isMilestone ? '2px solid #fbbf24' : '1px solid #e5e7eb', 
          borderRadius: '12px', transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="milestoneToggle"
              checked={isMilestone}
              onChange={(e) => setIsMilestone(e.target.checked)}
              disabled={!activeCircleId || uploading}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#d97706' }}
            />
            <label htmlFor="milestoneToggle" style={{ fontSize: '15px', fontWeight: '800', color: isMilestone ? '#d97706' : '#475569', cursor: 'pointer', userSelect: 'none' }}>
              🌟 Mark as Family Milestone (Memory Lane)
            </label>
          </div>
          
          {/* Agar toggle ON hai, toh date picker dikhega */}
          {isMilestone && (
            <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease-in-out' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', display: 'block', marginBottom: '6px' }}>
                When did this historical event happen? 📅
              </label>
              <input 
                type="datetime-local" 
                value={milestoneDate} 
                onChange={(e) => setMilestoneDate(e.target.value)} 
                disabled={uploading} 
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #fbbf24', outline: 'none', background: '#fff', color: '#92400e', fontWeight: 'bold' }} 
              />
            </div>
          )}
        </div>

        {/* Global Public Toggle */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="globalPublic"
            checked={isGlobalPublic}
            onChange={(e) => setIsGlobalPublic(e.target.checked)}
            disabled={!activeCircleId || uploading}
            style={{ cursor: 'pointer', accentColor: '#2563eb' }}
          />
          <label htmlFor="globalPublic" style={{ fontSize: '14px', color: '#4b5563', cursor: 'pointer', fontWeight: '600' }}>
            🌍 Make global public (Visible outside family)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={uploading || !activeCircleId} 
          style={{ 
            width: '100%', padding: '14px', 
            background: (!activeCircleId || uploading) ? '#9ca3af' : (isMilestone ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#1e293b'), 
            color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', 
            cursor: (!activeCircleId || uploading) ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: isMilestone ? '0 10px 20px rgba(217, 119, 6, 0.3)' : '0 10px 20px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => { if (activeCircleId && !uploading) e.target.style.transform = 'translateY(-2px)' }}
          onMouseOut={(e) => { if (activeCircleId && !uploading) e.target.style.transform = 'translateY(0)' }}
        >
          {uploading ? '⏳ Sealing in the Vault...' : (isMilestone ? '🌟 Lock Family Milestone' : '🚀 Post Story')}
        </button>
      </form>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default StoryComposer;