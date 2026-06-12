import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { db } from '../utils/storage';
import { otpService } from '../utils/otpService';

export default function Login() {
  const navigate = useNavigate();
  
  // Step 1: Login Data, Step 2: OTP, Step 3: Admin Auth Code
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ employeeId: '', password: '' });
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyPasswordAndTriggerOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Verify Password against local DB
      const users = JSON.parse(localStorage.getItem('parikrama_users')) || [];
      const user = users.find(u => u.id === formData.employeeId && u.password === formData.password);
      
      if (!user) {
        throw new Error('Invalid Employee ID or Password');
      }
      
      if (user.status === 'PENDING_APPROVAL') {
        throw new Error('Account is pending admin approval.');
      }
      
      if (user.status === 'PENDING_AUTH_OTP') {
        // Switch to admin authorization code verify step (step 3)
        setStep(3);
        setOtp(''); // clear otp state for input
        setLoading(false);
        return;
      }
      
      if (user.status !== 'ACTIVE') {
        throw new Error('Account is inactive.');
      }

      // Store the user's phone number from DB so we can send OTP
      const userPhone = user.phone;
      
      // 2. Trigger SMS OTP to the registered phone number via otpService
      const result = await otpService.sendOTP(userPhone);
      setVerificationId(result.verificationId);

      // Move to step 2
      setStep(2);
      
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Verify OTP with our modular service
      await otpService.verifyOTP(verificationId, otp);
      
      // 2. Fetch User and create local session
      const users = JSON.parse(localStorage.getItem('parikrama_users')) || [];
      const user = users.find(u => u.id === formData.employeeId);
      
      const session = {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone
      };
      
      localStorage.setItem('parikrama_session', JSON.stringify(session));

      // 3. Route based on role
      if (user.role === 'USER') {
        navigate('/user/checklist');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/data');
      } else if (user.role === 'SUPERADMIN') {
        navigate('/superadmin');
      }
      
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAdminAuthOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await db.verifyAdminAuthOTP(formData.employeeId, otp);
      alert('Admin account activated successfully! You can now log in.');
      setStep(1);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Invalid Authorization Code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--primary-dark)', fontSize: '28px', marginBottom: '8px' }}>Login</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sign in to Anutex Parikrama</p>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleVerifyPasswordAndTriggerOTP}>
          <div className="input-group">
            <label className="input-label">Employee ID</label>
            <div className="input-field">
              <User className="input-icon" size={18} />
              <input 
                name="employeeId" type="text" placeholder="e.g. SUPER1 or EMP1001" 
                value={formData.employeeId} 
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})} required 
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Super Admin: <strong>SUPER1</strong>. Testing Users: <strong>EMP1001</strong>.
            </span>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-field">
              <Lock className="input-icon" size={18} />
              <input 
                name="password" type="password" placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} required 
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Next: Verify OTP'}
          </button>
        </form>
      ) : step === 2 ? (
        <form onSubmit={handleVerifyOTP}>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
            A simulated SMS has been sent to your registered phone number.<br />
            Enter the testing OTP: <strong style={{ color: 'var(--primary-dark)' }}>123456</strong>
          </p>
          <div className="input-group">
            <div className="input-field" style={{ justifyContent: 'center' }}>
              <input 
                type="text" maxLength="6" placeholder="000000" 
                value={otp} onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
          <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ marginTop: '16px' }} disabled={loading}>
            Back
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAdminAuthOTP}>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Account approved! Enter the 4-digit Admin Authorization Code generated by the Super Admin below.
          </p>
          <div className="input-group">
            <div className="input-field" style={{ justifyContent: 'center' }}>
              <input 
                type="text" maxLength="4" placeholder="0000" 
                value={otp} onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '12px' }} required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Activating...' : 'Activate & Continue'}
          </button>
          <button type="button" onClick={() => { setStep(1); setOtp(''); }} className="btn-outline" style={{ marginTop: '16px' }} disabled={loading}>
            Back
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Need an account? </span>
        <Link to="/register" style={{ color: 'var(--primary-dark)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
      </div>
    </div>
  );
}
