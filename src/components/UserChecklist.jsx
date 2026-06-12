import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, CircleDashed, User as UserIcon, ListChecks } from 'lucide-react';
import { db } from '../utils/storage';

export default function UserChecklist() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!session || session.role !== 'USER') {
      navigate('/login');
      return;
    }
    loadChecklist(session.id);
  }, [navigate]);

  const loadChecklist = async (employeeId) => {
    const data = await db.getUserChecklist(employeeId);
    setChecklist(data);
    setLoading(false);
  };

  const completedCount = checklist.filter(item => item.status === 'COMPLETED').length;
  const isAllCompleted = checklist.length > 0 && completedCount === checklist.length;
  const isFinalSubmitted = checklist.length > 0 && checklist[0].locked;

  const handleFinalSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? This cannot be undone.')) return;
    
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    await db.submitFinalChecklist(session.id);
    alert('Checklist submitted successfully to Admin.');
    loadChecklist(session.id);
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 24px 16px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Inspection Progress</span>
          <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>{completedCount}/{checklist.length} Completed</span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${checklist.length ? (completedCount / checklist.length) * 100 : 0}%`, 
            height: '100%', 
            backgroundColor: 'var(--primary)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {checklist.map((item) => (
          <div 
            key={item.id}
            onClick={() => {
              if (item.status !== 'COMPLETED' && !isFinalSubmitted) {
                navigate(`/user/upload/${item.id}`);
              } else {
                navigate(`/user/upload/${item.id}?readonly=true`);
              }
            }}
            style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: isFinalSubmitted ? 0.85 : 1
            }}
          >
            {/* Minimal Icon based on type (Mocking icons via generic box for now) */}
            <div style={{ width: '48px', height: '48px', backgroundColor: '#F0F0F0', borderRadius: '8px', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <ListChecks size={24} color="var(--text-muted)" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', color: item.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-muted)' }}>
                {item.status === 'COMPLETED' ? <CheckCircle2 size={16} style={{ marginRight: '6px' }} /> : <CircleDashed size={16} style={{ marginRight: '6px' }} />}
                {item.status === 'COMPLETED' ? 'Completed (Evidence Locked)' : 'Pending'}
              </div>
            </div>

            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        ))}

        {isAllCompleted && !isFinalSubmitted && (
          <button onClick={handleFinalSubmit} className="btn-primary" style={{ marginTop: '24px' }}>
            Final Submit
          </button>
        )}
        
        {isFinalSubmitted && (
          <div style={{ textAlign: 'center', color: 'var(--success)', marginTop: '24px', fontWeight: 'bold' }}>
            <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
            <div>Checklist Locked & Submitted</div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderTop: '1px solid var(--border-color)', padding: '12px 24px', paddingBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 20px', borderRadius: '20px', marginBottom: '4px' }}>
            <ListChecks size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Checklist</span>
        </div>
        <div onClick={() => navigate('/profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
            <UserIcon size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Profile</span>
        </div>
      </div>
    </div>
  );
}
