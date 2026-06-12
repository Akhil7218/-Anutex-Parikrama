import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Database, LogOut, ShieldCheck, RefreshCw, Trash2, Shield, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { db } from '../utils/storage';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, totalLogs: 0, totalChecklists: 0 });

  useEffect(() => {
    const sesh = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!sesh || sesh.role !== 'SUPERADMIN') {
      navigate('/login');
      return;
    }
    setSession(sesh);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    
    // Load users
    const allUsers = JSON.parse(localStorage.getItem('parikrama_users')) || [];
    setUsers(allUsers);
    
    // Load logs
    const logs = await db.getAuditLogs();
    setAuditLogs(logs);

    // Load submissions count
    const checklists = JSON.parse(localStorage.getItem('parikrama_checklists')) || [];

    setStats({
      totalUsers: allUsers.length,
      totalAdmins: allUsers.filter(u => u.role === 'ADMIN').length,
      totalLogs: logs.length,
      totalChecklists: checklists.length
    });
    
    setLoading(false);
  };

  const handleLogout = () => {
    db.addAuditLog('USER_LOGOUT', session.id, 'User logged out.');
    localStorage.removeItem('parikrama_session');
    navigate('/login');
  };

  const handleCompliancePurge = async () => {
    const confirmMessage = 
      "Trigger Compliance Retention Purge?\n\n" +
      "This action simulates the passage of 45+ days. As per enterprise data retention guidelines:\n" +
      "- All finalized employee checklists will be deleted\n" +
      "- Historical admin approval requests will be cleared\n" +
      "- A permanent audit log entry of this action will be written\n\n" +
      "Are you sure you want to run this cleanup simulation?";

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      await db.simulateTimePassage(45);
      alert("Retention purge simulated successfully! Checklists older than 45 days have been permanently wiped.");
      await loadData();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div style={{ backgroundColor: '#1C1C1E', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: '#000', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', margin: 0 }}>
            <ShieldAlert size={24} style={{ marginRight: '8px' }} />
            Super Admin Control Center
          </h2>
          <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>Anutex Enterprise Infrastructure Operations</p>
        </div>
        <button 
          onClick={loadData}
          style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <RefreshCw size={16} color="#fff" />
        </button>
      </div>

      {/* Main Panel Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        
        {/* Statistics Tiles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#2C2C2E', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Users</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{stats.totalUsers}</div>
          </div>
          <div style={{ backgroundColor: '#2C2C2E', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Admins</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{stats.totalAdmins}</div>
          </div>
          <div style={{ backgroundColor: '#2C2C2E', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Submissions</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{stats.totalChecklists}</div>
          </div>
          <div style={{ backgroundColor: '#2C2C2E', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Audit Logs</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{stats.totalLogs}</div>
          </div>
        </div>

        {/* Compliance & Data Retention Simulator Panel */}
        <div style={{ backgroundColor: '#2C2C2E', border: '1px solid #D32F2F', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF5350', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span>Compliance Retention Policies</span>
          </div>
          <p style={{ fontSize: '12px', color: '#B0BEC5', lineHeight: '1.5', marginBottom: '14px' }}>
            Industrial audit records require automatic deletion after <strong style={{ color: '#EF5350' }}>45 days</strong>. Run the fast-forward simulation to purge submissions and check retention workflows.
          </p>
          <button 
            onClick={handleCompliancePurge} 
            disabled={loading}
            style={{ 
              backgroundColor: '#D32F2F', 
              color: '#fff', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} /> Run 45-Day Retention Purge
          </button>
        </div>

        {/* System Audit Logs Section */}
        <div style={{ backgroundColor: '#2C2C2E', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', border: '1px solid #444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold', color: '#B0BEC5', marginBottom: '12px' }}>
            <Calendar size={16} />
            <span>Real-time System Audit Trail</span>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {auditLogs.length === 0 ? (
              <div style={{ color: '#888', fontSize: '12px', textAlign: 'center', padding: '12px' }}>No system events recorded.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} style={{ padding: '8px 12px', backgroundColor: '#1C1C1E', borderRadius: '4px', fontSize: '11px', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ECEFF1', fontWeight: 'bold', marginBottom: '2px' }}>
                    <span>{log.action} ({log.userId})</span>
                    <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Clock size={10} />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: '#B0BEC5' }}>{log.details}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Registry List */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            User Registry ({users.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map(u => (
              <div key={u.id} style={{ backgroundColor: '#2C2C2E', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{u.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    ID: {u.id} • Phone: {u.phone}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    backgroundColor: u.role === 'SUPERADMIN' ? '#0D47A1' : u.role === 'ADMIN' ? '#EF6C00' : '#2E7D32',
                    color: '#fff'
                  }}>
                    {u.role}
                  </span>
                  <div style={{ fontSize: '10px', color: u.status === 'ACTIVE' ? '#66BB6A' : '#EF5350', marginTop: '6px', fontWeight: 'bold' }}>
                    {u.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer CTA panel */}
      <div style={{ padding: '24px', backgroundColor: '#000', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '12px' }}>
         <button onClick={() => navigate('/profile')} className="btn-primary" style={{ backgroundColor: '#2C2C2E', border: '1px solid #444', color: '#fff', margin: 0 }}>
           Admin Creation Requests / Profile
         </button>
         <button onClick={handleLogout} className="btn-outline" style={{ borderColor: '#EF5350', color: '#EF5350', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           <LogOut size={18} /> Logout
         </button>
      </div>
    </div>
  );
}
