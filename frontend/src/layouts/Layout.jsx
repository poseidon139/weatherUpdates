import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CloudRain, LogOut, User } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className="container" style={{ maxWidth: '1400px', display: 'flex', flexDirection: 'column' }}>
                <nav className="navbar">
                    <Link to="/" className="nav-brand">
                        <CloudRain size={28} />
                        <span>WeatherUpdates</span>
                    </Link>

                    <div className="nav-links">
                        {user ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <User size={18} />
                                    <span>{user.name} ({user.role})</span>
                                </div>
                                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Login</Link>
                                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Register</Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            <main className="container" style={{ flex: 1 }}>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
