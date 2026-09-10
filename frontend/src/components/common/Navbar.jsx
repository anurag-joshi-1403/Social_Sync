import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initial = user?.name?.charAt(0).toUpperCase() || 'U';

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/dashboard">
                    <i className="bi bi-broadcast me-2"></i>
                    SocialSync
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    aria-controls="mainNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="mainNavbar">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/dashboard">
                                <i className="bi bi-speedometer2 me-1"></i>Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/editor">
                                <i className="bi bi-pencil-square me-1"></i>Create Post
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/schedule">
                                <i className="bi bi-calendar-event me-1"></i>Schedule
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/analytics">
                                <i className="bi bi-bar-chart-line me-1"></i>Analytics
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/accounts">
                                <i className="bi bi-link-45deg me-1"></i>Accounts
                            </NavLink>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center text-white">
                            <div className="user-avatar me-2">{initial}</div>
                            <span className="d-none d-lg-inline">{user?.name}</span>
                        </div>
                        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;