import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect} from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import BranchesPage from './pages/BranchesPage';
import LoansPage from './pages/LoansPage';
import UsersPage from './pages/UsersPage';
import AuthPage from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

  useEffect(() => {
    fetch(`${API_BASE_URL}/check_session`, {
      credentials: "include"
    })
      .then((r) => {
        if (r.ok) {
          r.json().then((user) => setUser(user));
        }
        })
    .catch(() => {
      //ignore 401
    })
    .finally(() => setLoading(false));
}, [API_BASE_URL]);

    if(loading) return <div>Loading Apex Bank...</div>;

  return (
    <Router>
      <div className ="App">
        <Navbar user={user} onLogout={() => setUser(null)} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/login" element={<AuthPage onLogin={setUser} />} />
            <Route path="/signup" element={<AuthPage onLogin={setUser} />} />
            <Route path="/accounts" element={<ProtectedRoute user={user}><AccountsPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute user={user}><TransactionsPage /></ProtectedRoute>} />
            <Route path="/branches" element={<ProtectedRoute user={user}><BranchesPage /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute user={user}><LoansPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute user={user}><UsersPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
    
  );
}

export default App;
