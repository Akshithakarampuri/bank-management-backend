import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="bank-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#1a3a5c"/>
                <path d="M16 4L28 10v2H4v-2L16 4z" fill="#c9a84c"/>
                <rect x="6" y="14" width="3" height="10" fill="#c9a84c"/>
                <rect x="11" y="14" width="3" height="10" fill="#c9a84c"/>
                <rect x="18" y="14" width="3" height="10" fill="#c9a84c"/>
                <rect x="23" y="14" width="3" height="10" fill="#c9a84c"/>
                <rect x="4" y="25" width="24" height="3" fill="#c9a84c"/>
              </svg>
            </div>
            <div className="bank-name">
              <span className="bank-title">NexaBank</span>
              <span className="bank-subtitle">Management System</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Customers
            </NavLink>
            <NavLink to="/accounts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Accounts
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Transactions
            </NavLink>
          </nav>
          <div className="sidebar-footer">v1.0.0</div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
