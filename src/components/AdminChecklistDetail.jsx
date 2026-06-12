import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleDashed, Image as ImageIcon, Eye, ShieldCheck, X } from 'lucide-react';
import { db } from '../utils/storage';

export default function AdminChecklistDetail() {
  const navigate = useNavigate();
  const { checklistId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Image Inspector Modal State
  const [inspectorItem, setInspectorItem] = useState(null); 

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      navigate('/login');
      return;
    }
    loadData();
  }, [checklistId, navigate]);

  const loadData = async () => {
    const data = await db.getAllSubmissions();
    const found = data.find(c => c.id === checklistId);
    setSubmission(found);
    setLoading(false);
  };

  const handleVerify = async (itemId) => {
    try {
      const session = JSON.parse(localStorage.getItem('parikrama_session'));
      await db.verifyEvidence(checklistId, itemId, session.id);
      loadData(); // reload
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !submission) {
    return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading checklist details...</div>;
  }

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => navigate('/admin/data')} style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} color="var(--primary-dark)" />
        </button>
        <div>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{submission.employeeName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '2px 0 0' }}>
            ID: {submission.employeeId} • Shift Date: {submission.date}
          </p>
        </div>
      </div>

      {/* Main Checklist Items List */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        {submission.items.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0, paddingRight: '8px' }}>{item.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: item.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 'bold', flexShrink: 0 }}>
                {item.status === 'COMPLETED' ? <CheckCircle2 size={14} style={{ marginRight: '4px' }}/> : <CircleDashed size={14} style={{ marginRight: '4px' }}/>}
                {item.status}
              </div>
            </div>

            {item.status === 'COMPLETED' ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderTop: '1px solid #F0F2F5', paddingTop: '12px' }}>
                {/* Clickable Image Evidence Thumbnail */}
                <div 
                  onClick={() => setInspectorItem(item)}
                  style={{ width: '72px', height: '72px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
                  title="Click to inspect evidence image"
                >
                  <img src={item.image} alt="evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    <Eye size={10} /> VIEW
                  </div>
                </div>
                
                {/* Verification Actions & Details */}
                <div style={{ flex: 1 }}>
                  {item.verified ? (
                    <div>
                      <div style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                        <ShieldCheck size={16} style={{ marginRight: '4px' }} />
                        Verified Active
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        By: {item.verifiedBy} at {new Date(item.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleVerify(item.id)}
                      className="btn-outline" 
                      style={{ padding: '8px 16px', fontSize: '13px', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ShieldCheck size={14} /> Verify Work
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', borderTop: '1px solid #F0F2F5', paddingTop: '12px' }}>
                <ImageIcon size={14} style={{ marginRight: '6px' }} /> Pending user evidence upload
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Inspector Modal */}
      {inspectorItem && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          {/* Modal Header */}
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
            <div>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Evidence Inspector</span>
              <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{inspectorItem.title}</div>
            </div>
            <button 
              onClick={() => setInspectorItem(null)} 
              style={{ color: '#fff', padding: '8px', backgroundColor: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Modal Image Body */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <img src={inspectorItem.image} alt="Fullscreen evidence" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>

          {/* Modal Footer (Audit log details) */}
          <div style={{ padding: '20px 24px', backgroundColor: '#1C1C1E', borderTop: '1px solid #333', color: '#fff', fontSize: '13px' }}>
            {inspectorItem.verified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                <ShieldCheck size={18} />
                <span>Verified by {inspectorItem.verifiedBy} on {new Date(inspectorItem.verifiedAt).toLocaleString()}</span>
              </div>
            ) : (
              <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CircleDashed className="animate-pulse" size={18} />
                <span>Evidence pending verification by supervisor.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
