import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  // backend ke expected fields ke according names rakho
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await signup(form);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Agar signup token return karta hai -> direct dashboard
    // warna login page pe bhej do
    if (result?.data?.token) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
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