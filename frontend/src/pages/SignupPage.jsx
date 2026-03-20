import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin', // default admin: create new family
    familyCode: '',
    relationToAdmin: '',
  });

  const [error, setError] = useState('');

  const isAdmin = form.role === 'admin';

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // if admin selected, familyCode not needed
      if (name === 'role' && value === 'admin') {
        next.familyCode = '';
        next.relationToAdmin = 'Admin';
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // payload clean
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      relationToAdmin: isAdmin
        ? 'Admin'
        : form.relationToAdmin?.trim() || '',
      ...(isAdmin ? {} : { familyCode: form.familyCode.trim().toUpperCase() }),
    };

    const result = await signup(payload);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result?.data?.token) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '40px auto', padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>Signup</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label>
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 6, padding: 8 }}
          >
            <option value="admin">Admin (Create new family)</option>
            <option value="member">Member (Join family)</option>
            <option value="restricted">Restricted (Join family)</option>
          </select>
        </label>

        {!isAdmin && (
          <>
            <input
              type="text"
              name="familyCode"
              placeholder="Enter family invite code (e.g. FAM-1234)"
              value={form.familyCode}
              onChange={handleChange}
              required={!isAdmin}
            />

            <input
              type="text"
              name="relationToAdmin"
              placeholder="Relation to admin (e.g. Brother, Mother)"
              value={form.relationToAdmin}
              onChange={handleChange}
            />
          </>
        )}

        {error ? <p style={{ color: 'crimson', margin: 0 }}>{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Signup'}
        </button>
      </form>

      <p style={{ marginTop: 14 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default SignupPage;