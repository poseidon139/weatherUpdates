import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await axios.post('/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="card auth-card" style={{ maxWidth: '550px' }}>
                <div className="text-center mb-8">
                    <h2>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign up to receive daily weather updates</p>
                </div>

                {error && <div className="text-danger mb-4 text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">City (for weather updates)</label>
                        <input type="text" className="form-input" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. New York, London, Tokyo" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        <UserPlus size={20} />
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-8" style={{ color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign in instead</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
