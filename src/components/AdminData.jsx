import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, User as UserIcon, Calendar, CheckCircle2, ChevronRight, ListPlus, Layers, Search, Filter, RefreshCw, BarChart2 } from 'lucide-react';
import { db } from '../utils/storage';

export default function AdminData() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, IN_PROGRESS, SUBMITTED
  const [verificationFilter, setVerificationFilter] = useState('ALL'); // ALL, FULLY, PARTIAL, UNVERIFIED

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setRefreshing(true);
    const data = await db.getAllSubmissions();
    setSubmissions(data);
    setLoading(false);
    setRefreshing(false);
  };

  // Compute stats based on ALL submissions
  const totalCount = submissions.length;
  const submittedLockedCount = submissions.filter(s => s.locked).length;
  const inProgressCount = totalCount - submittedLockedCount;
  
  const fullyVerifiedCount = submissions.filter(s => {
    const completed = s.items.filter(i => i.status === 'COMPLETED').length;
    const verified = s.items.filter(i => i.verified).length;
    return verified === completed && completed > 0;
  }).length;

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    // 1. Search term match
    const matchesSearch = 
      sub.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.date.includes(searchTerm);

    // 2. Status match
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'SUBMITTED' && sub.locked) ||
      (statusFilter === 'IN_PROGRESS' && !sub.locked);

    // 3. Verification match
    const completedCount = sub.items.filter(i => i.status === 'COMPLETED').length;
    const verifiedCount = sub.items.filter(i => i.verified).length;
    const isFully = verifiedCount === completedCount && completedCount > 0;
    const isPartial = verifiedCount > 0 && verifiedCount < completedCount;
    const isUnverified = verifiedCount === 0;

    const matchesVerification = 
      verificationFilter === 'ALL' ||
      (verificationFilter === 'FULLY' && isFully) ||
      (verificationFilter === 'PARTIAL' && isPartial) ||
      (verificationFilter === 'UNVERIFIED' && isUnverified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  // Group filtered submissions by date
  const grouped = filteredSubmissions.reduce((acc, sub) => {
    if (!acc[sub.date]) {
      acc[sub.date] = [];
    }
    acc[sub.date].push(sub);
    return acc;
  }, {});

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--primary)" style={{ marginBottom: 12 }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading plant operations data...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 16px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', margin: 0 }}>
            <Database size={22} style={{ marginRight: '8px' }} />
            Inspection Operations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Review checklist status, verify evidence, & track compliance</p>
        </div>
        <button 
          onClick={loadData} 
          disabled={refreshing}
          style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#ECEFF1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title="Refresh Operations Grid"
        >
          <RefreshCw size={18} color="var(--text-main)" className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ backgroundColor: '#F5F7FA', padding: '12px 8px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Submissions</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{totalCount}</div>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', padding: '12px 8px', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{inProgressCount}</div>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', padding: '12px 8px', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Fully Verified</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{fullyVerifiedCount}</div>
        </div>
      </div>

      {/* Search & Premium Filters Grid */}
      <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Search Input */}
        <div className="input-field" style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
          <Search className="input-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search by Employee ID, Name, or Date..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '14px' }}
          />
        </div>

        {/* Filters Selectors */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Status filter */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Submission Status</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', width: '100%', backgroundColor: '#fff', color: 'var(--text-main)', fontWeight: '500' }}
            >
              <option value="ALL">All States</option>
              <option value="SUBMITTED">Submitted & Locked</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>

          {/* Verification filter */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Verification State</span>
            <select 
              value={verificationFilter} 
              onChange={(e) => setVerificationFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', width: '100%', backgroundColor: '#fff', color: 'var(--text-main)', fontWeight: '500' }}
            >
              <option value="ALL">All Verification</option>
              <option value="FULLY">Fully Verified</option>
              <option value="PARTIAL">Partially Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Operations List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {filteredSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', padding: '32px 24px', backgroundColor: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
            No submissions match the current filter selection.
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} style={{ marginBottom: '24px' }}>
              {/* Shift Date Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '12px',
                color: 'var(--primary-dark)',
                fontWeight: 'bold',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Calendar size={14} />
                <span>Shift Date: {date}</span>
                <span style={{ 
                  fontSize: '11px', 
                  backgroundColor: '#ECEFF1', 
                  color: 'var(--text-muted)', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontWeight: '600'
                }}>
                  {grouped[date].length} {grouped[date].length === 1 ? 'Record' : 'Records'}
                </span>
              </div>

              {/* Employee Submissions for this Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {grouped[date].map((sub) => {
                  const totalItems = sub.items.length;
                  const completedItems = sub.items.filter(i => i.status === 'COMPLETED').length;
                  const verifiedItems = sub.items.filter(i => i.verified).length;
                  const isFullyVerified = verifiedItems === completedItems && completedItems > 0;

                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => navigate(`/admin/checklist/${sub.id}`)}
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '15px' }}>
                          <UserIcon size={16} style={{ marginRight: '8px', color: 'var(--text-muted)' }} />
                          {sub.employeeName}
                          <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({sub.employeeId})
                          </span>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                      </div>

                      {/* Status Badges Row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '11px' }}>
                        {sub.locked ? (
                          <span style={{ backgroundColor: 'var(--primary-dark)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            SUBMITTED & LOCKED
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#ECEFF1', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            IN PROGRESS
                          </span>
                        )}

                        {isFullyVerified ? (
                          <span style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={12} /> FULLY VERIFIED
                          </span>
                        ) : verifiedItems > 0 ? (
                          <span style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            PARTIALLY VERIFIED
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#ECEFF1', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            UNVERIFIED
                          </span>
                        )}
                      </div>

                      {/* Verification Status Progress Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F8F9FA', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: isFullyVerified ? 'var(--success)' : 'var(--text-main)' }}>
                          Verification Status
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: isFullyVerified ? 'var(--success)' : 'var(--primary-dark)' }}>
                          {verifiedItems}/{completedItems} Items Verified
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Bottom Nav */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderTop: '1px solid var(--border-color)', padding: '12px 24px', paddingBottom: '24px' }}>
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
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 20px', borderRadius: '20px', marginBottom: '4px' }}>
            <Database size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Data</span>
        </div>
        
        <div onClick={() => navigate('/profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
            <UserIcon size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Profile</span>
        </div>
      </div>
      
      {/* Global CSS animation utility in code wrapper */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
