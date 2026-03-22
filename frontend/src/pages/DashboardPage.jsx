import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  addMemberToCircleApi,
  createCircleApi,
  getCircleByIdApi,
  getMyCirclesApi,
  removeMemberFromCircleApi,
} from '../api/circleApi';

function DashboardPage() {
  const { user } = useAuth();

  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState('');
  const [selectedCircle, setSelectedCircle] = useState(null);

  const [newCircleName, setNewCircleName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const [loadingCircles, setLoadingCircles] = useState(false);
  const [loadingCircleDetails, setLoadingCircleDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = useMemo(() => {
    if (!selectedCircle || !user?._id) return false;
    return String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(user._id);
  }, [selectedCircle, user]);

  const clearFlash = () => {
    setError('');
    setSuccess('');
  };

  const loadMyCircles = async () => {
    setLoadingCircles(true);
    setError('');
    try {
      const data = await getMyCirclesApi();
      const list = Array.isArray(data) ? data : [];
      setCircles(list);

      if (!selectedCircleId && list.length > 0) {
        setSelectedCircleId(list[0]._id);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load circles');
    } finally {
      setLoadingCircles(false);
    }
  };

  const loadCircleDetails = async (circleId) => {
    if (!circleId) {
      setSelectedCircle(null);
      return;
    }

    setLoadingCircleDetails(true);
    setError('');
    try {
      const data = await getCircleByIdApi(circleId);
      setSelectedCircle(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load circle details');
    } finally {
      setLoadingCircleDetails(false);
    }
  };

  useEffect(() => {
    loadMyCircles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCircleId) {
      loadCircleDetails(selectedCircleId);
    } else {
      setSelectedCircle(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCircleId]);

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    clearFlash();

    if (!newCircleName.trim()) {
      setError('Circle name is required');
      return;
    }

    setActionLoading(true);
    try {
      const created = await createCircleApi({ circleName: newCircleName.trim() });
      setSuccess('Circle created successfully');
      setNewCircleName('');

      await loadMyCircles();
      if (created?._id) setSelectedCircleId(created._id);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to create circle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    clearFlash();

    if (!selectedCircleId) {
      setError('Please select a circle first');
      return;
    }

    if (!memberEmail.trim()) {
      setError('Member email is required');
      return;
    }

    setActionLoading(true);
    try {
      await addMemberToCircleApi(selectedCircleId, { email: memberEmail.trim() });
      setSuccess('Member added successfully');
      setMemberEmail('');
      await loadCircleDetails(selectedCircleId);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    clearFlash();

    if (!selectedCircleId) {
      setError('Please select a circle first');
      return;
    }

    const ok = window.confirm(`Remove ${memberName || 'this member'} from circle?`);
    if (!ok) return;

    setActionLoading(true);
    try {
      await removeMemberFromCircleApi(selectedCircleId, memberId);
      setSuccess('Member removed successfully');
      await loadCircleDetails(selectedCircleId);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || 'User'} 👋</p>

      {/* quick nav */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        <Link to="/vault">
          <button>Go to Vault Room</button>
        </Link>
        <Link to="/radar">
          <button>Go to Family Radar</button>
        </Link>
      </div>

      {/* flash */}
      {error ? <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p> : null}
      {success ? <p style={{ color: 'green', marginTop: 12 }}>{success}</p> : null}

      {/* responsive grid */}
      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 14,
        }}
      >
        {/* create circle */}
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Create Circle</h3>
          <form onSubmit={handleCreateCircle}>
            <input
              value={newCircleName}
              onChange={(e) => setNewCircleName(e.target.value)}
              placeholder="Enter circle name"
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />
            <button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Please wait...' : 'Create Circle'}
            </button>
          </form>
        </div>

        {/* select circle + add member */}
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Manage Circle</h3>

          <label style={{ fontSize: 13, color: '#444' }}>Select Circle</label>
          <select
            value={selectedCircleId}
            onChange={(e) => setSelectedCircleId(e.target.value)}
            style={{ width: '100%', padding: 10, margin: '6px 0 10px' }}
          >
            <option value="">-- Select --</option>
            {circles.map((c) => (
              <option key={c._id} value={c._id}>
                {c.circleName}
              </option>
            ))}
          </select>

          <form onSubmit={handleAddMember}>
            <input
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Member email"
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />
            <button type="submit" disabled={actionLoading || !isAdmin}>
              {actionLoading ? 'Please wait...' : 'Add Member'}
            </button>
            {!isAdmin && selectedCircleId ? (
              <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Only circle admin can add members.
              </p>
            ) : null}
          </form>
        </div>
      </div>

      {/* members panel */}
      <div
        style={{
          marginTop: 16,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 12,
          background: '#fff',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Circle Members</h3>

        {loadingCircles ? <p>Loading circles...</p> : null}
        {loadingCircleDetails ? <p>Loading circle details...</p> : null}

        {!selectedCircleId ? <p style={{ color: '#666' }}>Select a circle to view members.</p> : null}

        {selectedCircle && Array.isArray(selectedCircle.members) && selectedCircle.members.length > 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {selectedCircle.members.map((m) => {
              const isSelf = String(m._id) === String(user?._id);
              const isCircleAdmin =
                String(selectedCircle?.admin?._id || selectedCircle?.admin) === String(m._id);

              return (
                <div
                  key={m._id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {m.name} {isSelf ? '(You)' : ''}
                    </div>
                    <div style={{ fontSize: 13, color: '#555' }}>{m.email}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
                      {isCircleAdmin ? 'Admin' : 'Member'}
                    </div>
                  </div>

                  {isAdmin && !isCircleAdmin ? (
                    <button
                      onClick={() => handleRemoveMember(m._id, m.name)}
                      disabled={actionLoading}
                      style={{
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        background: '#fff',
                        borderRadius: 8,
                        padding: '6px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : selectedCircleId && !loadingCircleDetails ? (
          <p style={{ color: '#666' }}>No members in this circle.</p>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardPage;