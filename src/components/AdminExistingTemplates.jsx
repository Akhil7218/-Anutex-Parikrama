import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ListPlus, Database, User, CheckCircle2, Trash, AlertTriangle } from 'lucide-react';
import { db } from '../utils/storage';

export default function AdminExistingTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      navigate('/login');
      return;
    }
    loadTemplates();
  }, [navigate]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await db.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await db.setActiveTemplate(id);
      loadTemplates();
    } catch (err) {
      setError(err.message || 'Failed to set active template.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await db.deleteTemplate(id);
      loadTemplates();
    } catch (err) {
      setError(err.message || 'Failed to delete template.');
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
          <Layers size={22} style={{ marginRight: '8px' }} />
          Inspection Standards
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Manage active daily checklists</p>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {error && (
          <div style={{ padding: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading standards...</div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
            No templates found. Please create one to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {templates.map((tpl) => (
              <div 
                key={tpl.id}
                style={{
                  backgroundColor: '#fff',
                  border: `1px solid ${tpl.active ? 'var(--success)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  boxShadow: tpl.active ? '0 4px 12px rgba(46, 125, 50, 0.1)' : 'none',
                  position: 'relative'
                }}
              >
                {/* Active Indicator Badge */}
                {tpl.active && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'var(--success-bg)',
                    color: 'var(--success)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={12} /> ACTIVE STANDARD
                  </div>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px', paddingRight: tpl.active ? '130px' : '0' }}>
                  {tpl.name}
                </h3>
                
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Created on: {new Date(tpl.createdAt).toLocaleDateString()}
                </div>

                <div style={{ backgroundColor: '#F8F9FA', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Inspection Checklist Tasks:
                  </div>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>
                    {tpl.items.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                  {!tpl.active ? (
                    <>
                      <button 
                        onClick={() => handleDelete(tpl.id)}
                        style={{ color: '#D32F2F', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                      >
                        <Trash size={14} /> Delete
                      </button>
                      <button 
                        onClick={() => handleSetActive(tpl.id)}
                        className="btn-outline" 
                        style={{ padding: '8px 16px', fontSize: '13px', width: 'auto' }}
                      >
                        Set Active Standard
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Active templates cannot be edited or deleted.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Bottom Navigation */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderTop: '1px solid var(--border-color)', padding: '12px 24px', paddingBottom: '24px' }}>
        <div onClick={() => navigate('/admin/create')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
            <ListPlus size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Create</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 20px', borderRadius: '20px', marginBottom: '4px' }}>
            <Layers size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Existing</span>
        </div>
        
        <div onClick={() => navigate('/admin/data')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
            <Database size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Data</span>
        </div>
        
        <div onClick={() => navigate('/profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <div style={{ padding: '4px 20px', marginBottom: '4px' }}>
            <User size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Profile</span>
        </div>
      </div>
    </div>
  );
}
