import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-redirect to login after 3 seconds
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: '#fff'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        fontWeight: 'bold',
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', // simple triangle "A" shape look
        marginBottom: '24px'
      }}>
        A
      </div>
      <h1 style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Anutex Parikrama
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
        Daily Checklist & Verification System
      </p>
      
      {/* Simple loading indicator */}
      <div style={{
        width: '40px',
        height: '4px',
        backgroundColor: 'var(--border-color)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          backgroundColor: 'var(--primary)',
          animation: 'load 1.5s infinite ease-in-out'
        }} />
      </div>
      <style>{`
        @keyframes load {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
