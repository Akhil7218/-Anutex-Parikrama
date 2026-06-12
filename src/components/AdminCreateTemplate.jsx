import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, ListPlus, Layers, Database, User } from 'lucide-react';
import { db } from '../utils/storage';

export default function AdminCreateTemplate() {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('');
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    if (items.includes(newItemText.trim())) {
      setError('Item already exists in this template.');
      return;
    }
    setItems([...items, newItemText.trim()]);
    setNewItemText('');
    setError('');
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveTemplate = async () => {
    setError('');
    setSuccess('');
    if (!templateName.trim()) {
      setError('Template Name is required.');
      return;
    }
    if (items.length === 0) {
      setError('At least one checklist item is required.');
      return;
    }

    setLoading(true);
    try {
      await db.createTemplate(templateName.trim(), items);
      setSuccess('Template saved successfully!');
      setTimeout(() => {
        navigate('/admin/existing');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
          <ListPlus size={22} style={{ marginRight: '8px' }} />
          Create Checklist Template
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Define new inspection standards</p>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {error && (
          <div style={{ padding: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        {/* Template General Info */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Template Title</label>
            <div className="input-field">
              <input 
                type="text" 
                placeholder="e.g. Line A Daily Vitals" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Add Items Form */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <label className="input-label">Add Inspection Items</label>
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '8px' }}>
            <div className="input-field" style={{ flex: 1, padding: '12px' }}>
              <input 
                type="text" 
                placeholder="e.g. Oil Pressure Check" 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 16px' }} disabled={loading}>
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* List of current items */}
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Items in Template ({items.length})
        </h3>
        
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '14px' }}>
            No items added yet. Add items above to build your checklist.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  backgroundColor: '#fff', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)' 
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {idx + 1}. {item}
                </span>
                <button 
                  onClick={() => handleRemoveItem(idx)} 
                  style={{ color: '#D32F2F', padding: '4px', cursor: 'pointer' }}
                  disabled={loading}
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Save CTA */}
        {items.length > 0 && (
          <button 
            onClick={handleSaveTemplate} 
            className="btn-primary" 
            style={{ marginTop: '32px' }} 
            disabled={loading}
          >
            {loading ? 'Saving Standard...' : 'Save Template Standard'}
          </button>
        )}
      </div>

      {/* Admin Bottom Navigation */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderTop: '1px solid var(--border-color)', padding: '12px 24px', paddingBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 20px', borderRadius: '20px', marginBottom: '4px' }}>
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
