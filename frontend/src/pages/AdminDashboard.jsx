import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Save, X, Users, Send } from 'lucide-react';

const AdminDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('/api/admin/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await axios.delete(`/api/admin/customers/${id}`);
                setCustomers(customers.filter(c => c.id !== id));
            } catch (error) {
                alert('Failed to delete customer');
            }
        }
    };

    const handleEditClick = (customer) => {
        setEditingId(customer.id);
        setEditForm(customer);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async () => {
        try {
            const res = await axios.put(`/api/admin/customers/${editingId}`, editForm);
            setCustomers(customers.map(c => (c.id === editingId ? res.data.user : c)));
            setEditingId(null);
        } catch (error) {
            alert('Failed to update customer');
        }
    };

    const handleTriggerSingle = async (id) => {
        try {
            await axios.post(`/api/admin/customers/${id}/trigger`);
            alert('Weather update dispatched for customer!');
        } catch (error) {
            alert('Failed to dispatch update');
        }
    };

    const handleTriggerAll = async () => {
        if (!window.confirm('Are you sure you want to send updates to ALL customers? This may take some time.')) return;

        setSending(true);
        try {
            const res = await axios.post('/api/admin/customers/trigger-all');
            alert(res.data.message);
        } catch (error) {
            alert('Failed to dispatch bulk updates');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="text-center mt-8">Loading dashboard...</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '0.5rem',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: 0 }}>Admin Dashboard</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Manage all customer weather subscriptions</p>
                    </div>
                </div>
                <div>
                    <button
                        onClick={handleTriggerAll}
                        className="btn btn-primary"
                        style={{ marginRight: '1rem' }}
                        disabled={sending || customers.length === 0}
                    >
                        <Send size={18} />
                        {sending ? 'Sending...' : 'Send to All'}
                    </button>
                    <span style={{
                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                        padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 600
                    }}>
                        {customers.length} Total Customers
                    </span>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center" style={{ padding: '3rem 0', color: 'var(--text-muted)' }}>
                                        No customers found. Wait for someone to register!
                                    </td>
                                </tr>
                            ) : (
                                customers.map(customer => (
                                    <tr key={customer.id}>
                                        {editingId === customer.id ? (
                                            <>
                                                <td><input type="text" className="form-input" style={{ padding: '0.5rem' }} name="name" value={editForm.name} onChange={handleEditChange} /></td>
                                                <td><input type="email" className="form-input" style={{ padding: '0.5rem' }} name="email" value={editForm.email} onChange={handleEditChange} /></td>
                                                <td><input type="tel" className="form-input" style={{ padding: '0.5rem' }} name="phone" value={editForm.phone} onChange={handleEditChange} /></td>
                                                <td><input type="text" className="form-input" style={{ padding: '0.5rem' }} name="city" value={editForm.city} onChange={handleEditChange} /></td>
                                                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={handleSaveEdit} className="btn" style={{ padding: '0.5rem', background: 'var(--success)', color: 'white' }} title="Save">
                                                            <Save size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '0.5rem' }} title="Cancel">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ fontWeight: 500 }}>{customer.name}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{customer.email}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{customer.phone}</td>
                                                <td>
                                                    <span style={{
                                                        background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.25rem', fontSize: '0.875rem'
                                                    }}>
                                                        {customer.city}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)' }}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleEditClick(customer)} className="btn btn-outline" style={{ padding: '0.5rem', borderColor: 'transparent' }} title="Edit">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(customer.id)} className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--danger)' }} title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleTriggerSingle(customer.id)} className="btn btn-outline" style={{ padding: '0.5rem', borderColor: 'transparent', color: 'var(--success)' }} title="Send Update Now">
                                                            <Send size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
