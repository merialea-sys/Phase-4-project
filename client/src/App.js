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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/check_session")
      .then((r) => {
        if (r.ok) {
          r.json().then((user) => setUser(user));
        }
        setLoading(false);
      });
    }, []);

    if(loading) return <div>Loading Apex Bank...</div>;

  return (
    <Router>
      <div className ="App">
        <Navbar user={user} onLogout={() => setUser(null)} />
        <main className="content">
          <Routes>
            <Route path="/login" element={<AuthPage onLogin={setUser} />} />
            <Route path="/signup" element={<AuthPage onLogin={setUser} />} />
            <Route path="/" element={<Dashboard user={user} />} />
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
