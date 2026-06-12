import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ShieldCheck, MailWarning, ListChecks, Database, ListPlus, Layers, Bell, Eye } from 'lucide-react';
import { db } from '../utils/storage';

export default function Profile() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Collapse Section States
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  
  // Change Password State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    const sesh = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!sesh) { navigate('/login'); return; }
    setSession(sesh);

    if (sesh.role === 'ADMIN' || sesh.role === 'SUPERADMIN') {
      loadPendingRequests();
      loadNotifications(sesh.role);
    }
  }, [navigate]);

  const loadPendingRequests = async () => {
    const reqs = await db.getPendingAdminRequests();
    setPendingRequests(reqs);
  };

  const loadNotifications = async (role) => {
    const data = await db.getNotifications(role);
    setNotifications(data);
  };

  const loadAuditLogs = async () => {
    const data = await db.getAuditLogs();
    setAuditLogs(data);
  };

  const handleDismissNotification = async (id) => {
    await db.dismissNotification(id);
    if (session) {
      loadNotifications(session.role);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const { authOTP } = await db.approveAdminRequest(requestId, session.id);
      alert(`Admin Approved! Share this Authorization Code with them to activate their account:\n\n${authOTP}\n\nPlease copy this code and send it securely.`);
      loadPendingRequests();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this registration request?')) return;
    try {
      await db.rejectAdminRequest(requestId, session.id);
      alert('Admin registration request rejected.');
      loadPendingRequests();
    } catch (e) {
      alert(e.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (passwords.new !== passwords.confirm) {
      setPassError("New passwords don't match.");
      return;
    }
    try {
      const users = JSON.parse(localStorage.getItem('parikrama_users'));
      const userIndex = users.findIndex(u => u.id === session.id);
      if (users[userIndex].password !== passwords.current) {
        setPassError("Current password is incorrect.");
        return;
      }
      users[userIndex].password = passwords.new;
      localStorage.setItem('parikrama_users', JSON.stringify(users));
      setPassSuccess("Password updated successfully!");
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setShowPasswordChange(false), 2000);
      
      db.addAuditLog('CHANGE_PASSWORD', session.id, 'User changed account password.');
    } catch (err) {
      setPassError("Error updating password.");
    }
  };

  const handleLogout = () => {
    db.addAuditLog('USER_LOGOUT', session.id, 'User logged out.');
    localStorage.removeItem('parikrama_session');
    navigate('/login');
  };

  if (!session) return null;

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header banner */}
      <div style={{ padding: '24px', backgroundColor: 'var(--primary)', color: '#fff' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>My Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', marginRight: '16px' }}>
            <User size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px' }}>{session.name}</h3>
            <p style={{ opacity: 0.8 }}>{session.id} • {session.role}</p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* Notifications Center (For Admins/SuperAdmins) */}
        {(session.role === 'ADMIN' || session.role === 'SUPERADMIN') && notifications.length > 0 && (
          <div style={{ backgroundColor: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '15px', marginBottom: '12px' }}>
              <Bell size={18} />
              <span>Operations Notifications ({notifications.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((notif) => (
                <div key={notif.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-main)', flex: 1, paddingRight: '8px' }}>
                    {notif.message}
                  </div>
                  <button 
                    onClick={() => handleDismissNotification(notif.id)}
                    style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Info card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Registered Phone Number</p>
          <p style={{ fontWeight: '600' }}>{session.phone || 'N/A'}</p>
        </div>

        {/* Change Password Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowPasswordChange(!showPasswordChange)}>
             <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>Change Password</h3>
             <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{showPasswordChange ? 'Cancel' : 'Edit'}</span>
          </div>
          
          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} style={{ marginTop: '16px' }}>
               {passError && <div style={{ color: 'var(--warning)', fontSize: '12px', marginBottom: '8px' }}>{passError}</div>}
               {passSuccess && <div style={{ color: 'var(--success)', fontSize: '12px', marginBottom: '8px' }}>{passSuccess}</div>}
               
               <input type="password" placeholder="Current Password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
               <input type="password" placeholder="New Password" required minLength={8} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
               <input type="password" placeholder="Confirm New Password" required minLength={8} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
               <button type="submit" className="btn-primary" style={{ padding: '8px' }}>Update Password</button>
            </form>
          )}
        </div>

        {/* Enterprise Audit Logs (Collapsible for Admin/SuperAdmin) */}
        {(session.role === 'ADMIN' || session.role === 'SUPERADMIN') && (
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => { setShowAuditLogs(!showAuditLogs); if(!showAuditLogs) loadAuditLogs(); }}>
               <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>System Audit Logs</h3>
               <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{showAuditLogs ? 'Hide' : 'View'}</span>
            </div>
            
            {showAuditLogs && (
              <div style={{ marginTop: '16px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditLogs.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>No audit logs recorded yet.</div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} style={{ padding: '8px 12px', backgroundColor: '#F8F9FA', borderLeft: '3px solid var(--primary)', borderRadius: '4px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '2px' }}>
                        <span>{log.action} • {log.userId}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{log.details}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Approvals List */}
        {(session.role === 'ADMIN' || session.role === 'SUPERADMIN') && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--primary-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <ShieldCheck size={18} style={{ marginRight: '8px' }} />
              Admin Creation Requests ({pendingRequests.length})
            </h3>
            
            {pendingRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No pending requests.</p>
            ) : (
              pendingRequests.map(req => (
                <div key={req.requestId} style={{ backgroundColor: '#fff', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--warning)', fontWeight: 'bold', marginBottom: '8px' }}>
                    <MailWarning size={16} style={{ marginRight: '6px' }} /> Approval Pending
                  </div>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>{req.name} ({req.employeeId})</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Phone: {req.phone}</p>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleReject(req.requestId)} 
                      className="btn-outline" 
                      style={{ padding: '8px', flex: 1, borderColor: '#D32F2F', color: '#D32F2F', fontSize: '13px' }}
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(req.requestId)} 
                      className="btn-primary" 
                      style={{ padding: '8px', flex: 2, fontSize: '13px' }}
                    >
                      Approve & Code
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button onClick={handleLogout} className="btn-outline" style={{ color: '#D32F2F', borderColor: '#D32F2F' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Bottom Navigation Navbar */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderTop: '1px solid var(--border-color)', padding: '12px 24px', paddingBottom: '24px' }}>
        {session.role === 'USER' ? (
          <>
            <div onClick={() => navigate('/user/checklist')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
                <ListChecks size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Checklist</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
              <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 20px', borderRadius: '20px', marginBottom: '4px' }}>
                <User size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Profile</span>
            </div>
          </>
        ) : (
          <>
            <div onClick={() => navigate('/admin/create')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
                <ListPlus size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Create</span>
            </div>
            
            <div onClick={() => navigate('/admin/existing')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
                <Layers size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Existing</span>
            </div>
            
            <div onClick={() => navigate(session.role === 'SUPERADMIN' ? '/superadmin' : '/admin/data')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
                {session.role === 'SUPERADMIN' ? <ShieldCheck size={24} /> : <Database size={24} />}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Data</span>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
              <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 20px', borderRadius: '20px', marginBottom: '4px' }}>
                <User size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Profile</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
