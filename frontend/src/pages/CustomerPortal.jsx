import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, User as UserIcon } from 'lucide-react';

const CustomerPortal = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        city: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/customer/profile');
            setProfile(res.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.put('/api/customer/profile', profile);
            setMessage({ type: 'success', text: res.data.message });
            // Update local storage if name changed
            localStorage.setItem('name', res.data.user.name);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-8">Loading profile...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <UserIcon size={32} color="white" />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.25rem' }}>Customer Profile</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and weather location</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-4 text-center ${message.type === 'error' ? 'text-danger' : 'text-success'}`}
                        style={{
                            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            padding: '0.75rem', borderRadius: '0.5rem'
                        }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" name="name" value={profile.name} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" name="email" value={profile.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" className="form-input" name="phone" value={profile.phone} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">City (for daily weather update)</label>
                        <input type="text" className="form-input" name="city" value={profile.city} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerPortal;
