import React from 'react';
import { db } from '../utils/storage';
import { Clock } from 'lucide-react';

export default function TimeSimulator() {
  const handleFastForward = async () => {
    if (!window.confirm('Simulate advancing time by 46 days? This will permanently delete records older than 45 days.')) return;
    
    // Simulate advancing time
    await db.simulateTimePassage(46);
    alert('Time advanced. Old checklists and verification logs have been purged automatically from the database.');
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: '#1C1C1E',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999,
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold'
    }} onClick={handleFastForward}>
      <Clock size={16} /> Fast-Forward 45 Days
    </div>
  );
}
