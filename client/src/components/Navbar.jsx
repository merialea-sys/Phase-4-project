import React from "react";
import { NavLink, useNavigate} from "react-router-dom";

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

    const handleLogout = () => {
        fetch(`${API_BASE_URL}/logout`, {
            method: "DELETE",
            credentials: "include"
        })
        .then((r) => {
            if (r.ok) {
                if (onLogout) onLogout();
                navigate("/login");
            }else {
                console.error("Logout failed");
            }
        });
    };

    return(
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo"> APEX BANK</div>

                <nav className="navbar-links">
                    <NavLink to="/" className="nav-link">Dashboard</NavLink>
                    <NavLink to="/accounts" className="nav-link">Accounts</NavLink>
                    <NavLink to="/transactions" className="nav-link">Transactions</NavLink>
                    <NavLink to="/branches" className="nav-link">Branches</NavLink>
                    <NavLink to="/loans" className="nav-link">Loans</NavLink>
                    <NavLink to="/users" className="nav-link">Users</NavLink>
                </nav>
                <div className="navbar-auth">
                    {user ? (
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    ) : (
                        <>
                            <button className="signup-button"
                            onClick={() => navigate("/signup")}>Sign Up</button>
                            <button className="login-button" onClick={() => navigate("/login")}>Login</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;