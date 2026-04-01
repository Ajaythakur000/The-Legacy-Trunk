import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
function StoryComposer({ activeCircleId, onPostStory, uploading }) {
  // 📝 Saari Form State ab iske andar local rahegi
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isGlobalPublic, setIsGlobalPublic] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [localError, setLocalError] = useState('');

  // 🖼️ Handle Image/Video Preview
  useEffect(() => {
    if (!mediaFile) return setMediaPreviewUrl('');
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLocalError(''); <-- 🔥 Iski ab zaroorat nahi, Toaster sab sambhal lega!

    if (!activeCircleId) {
      toast.error('Please select an Active Family from the top navigation first. 👨‍👩‍👧‍👦'); // ❌ ERROR TOAST
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required ⚠️'); // ❌ ERROR TOAST
      return;
    }

    // 📦 Pack data for backend
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    if (tags.trim()) formData.append('tags', tags.trim());
    formData.append('isGlobalPublic', isGlobalPublic ? 'true' : 'false');
    if (mediaFile) formData.append('media', mediaFile);
    formData.append('circleId', activeCircleId);

    // ⏳ LOADING TOAST SHURU (ID save kar rahe hain taaki baad mein isko success/error mein badal sakein)
    const toastId = toast.loading('Uploading to Vault... 🚀');

    try {
      // Parent component (Page) ko data bhej do API call ke liye
      await onPostStory(formData);
      
      // ✅ SUCCESS TOAST (Wahi loading wala toast ab hare rang ka success ban jayega)
      toast.success('Story posted successfully! 🎉', { id: toastId });

      // form clear kar do
      setTitle('');
      setContent('');
      setTags('');
      setIsGlobalPublic(false);
      setMediaFile(null);
      setMediaPreviewUrl('');
    } catch (err) {
      // ❌ API ERROR TOAST (Agar upload fail ho gaya)
      toast.error(err?.message || 'Failed to post story ❌', { id: toastId });
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '16px', marginBottom: '24px', background: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937' }}>✍️ Create Story</h3>
      
      {localError ? <p style={{ color: 'crimson', margin: '0 0 12px 0', fontSize: '14px' }}>{localError}</p> : null}

      <form onSubmit={handleSubmit}>
        
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your story a catchy title..."
          maxLength={150} 
          style={{ width: '100%', padding: '10px 12px', marginBottom: '4px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          disabled={!activeCircleId || uploading}
        />
        {/* Chota sa counter dikhane ke liye */}
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
          {title.length}/100
        </div>
        
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in the family?"
          rows={4}
          maxLength={2000} 
          style={{ width: '100%', padding: '10px 12px', marginBottom: '4px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
          disabled={!activeCircleId || uploading}
        />
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
          {content.length}/2000
        </div>
        
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g., trip, birthday, update)"
          style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          disabled={!activeCircleId || uploading}
        />

        {/* 📸 File Upload & Preview */}
        <div style={{ marginBottom: '12px', padding: '12px', border: '1px dashed #bbb', borderRadius: '8px', background: '#f9fafb' }}>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            disabled={!activeCircleId || uploading}
            style={{ width: '100%' }}
          />
          {mediaPreviewUrl && mediaFile?.type?.startsWith('image') && (
            <img src={mediaPreviewUrl} alt="Preview" style={{ marginTop: '12px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
          )}
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="globalPublic"
            checked={isGlobalPublic}
            onChange={(e) => setIsGlobalPublic(e.target.checked)}
            disabled={!activeCircleId || uploading}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="globalPublic" style={{ fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
            🌍 Make global public (Visible outside family)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={uploading || !activeCircleId} 
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: (!activeCircleId || uploading) ? '#9ca3af' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: (!activeCircleId || uploading) ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {uploading ? '⏳ Uploading to Vault...' : '🚀 Post Story'}
        </button>
      </form>
    </div>
  );
}

export default StoryComposer;