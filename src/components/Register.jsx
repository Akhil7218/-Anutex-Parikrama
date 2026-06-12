import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Lock, ShieldCheck } from 'lucide-react';
import { db } from '../utils/storage';
import { otpService } from '../utils/otpService';

export default function Register() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState('USER');
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    phoneNumber: '+91 99999 99999',
    password: '',
    confirmPassword: ''
  });
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify employee ID exists in local mock or cloud database
      const isValid = await db.checkEmployeeValid(formData.employeeId);
      if (!isValid) {
        throw new Error('Employee ID not authorized in company records.');
      }

      // 2. Trigger SMS OTP via our modular OTP Service
      const result = await otpService.sendOTP(formData.phoneNumber);
      setVerificationId(result.verificationId);
      setStep(2); // Proceed to OTP screen
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Verify OTP using the modular service
      await otpService.verifyOTP(verificationId, otp);

      // 2. Complete Database Registration
      if (role === 'USER') {
        await db.registerUser(formData);
        // Force them to ACTIVE immediately since OTP validated them
        const users = JSON.parse(localStorage.getItem('parikrama_users'));
        const u = users.find(x => x.id === formData.employeeId);
        if (u) { u.status = 'ACTIVE'; localStorage.setItem('parikrama_users', JSON.stringify(users)); }
        
        alert(`Account created successfully! User ID: ${formData.employeeId}`);
        navigate('/login');
      } else {
        await db.registerAdmin(formData);
        alert(`Admin request submitted! ID: ${formData.employeeId}. Waiting for Super Admin approval.`);
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code entered.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div style={{ padding: '32px 24px', backgroundColor: '#F8F9FA', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <button onClick={() => setStep(1)} style={{ marginRight: '16px' }}><ArrowLeft size={24} color="var(--primary-dark)" /></button>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px' }}>Verify OTP</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
          A simulated SMS OTP has been sent to {formData.phoneNumber}. <br />
          Enter the testing OTP: <strong style={{ color: 'var(--primary-dark)', fontSize: '16px' }}>123456</strong>
        </p>
        
        {error && <div style={{ padding: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleVerifyOTP}>
          <div className="input-group">
            <div className="input-field" style={{ justifyContent: 'center' }}>
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8F9FA', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ marginRight: '16px' }}><ArrowLeft size={24} color="var(--primary-dark)" /></button>
        <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px' }}>Create Account</h2>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="input-label" style={{ textTransform: 'uppercase', fontSize: '12px', color: 'var(--text-muted)' }}>Choose Identity</label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div 
            onClick={() => setRole('USER')}
            style={{
              flex: 1, padding: '24px 16px', backgroundColor: 'var(--surface)',
              border: `2px solid ${role === 'USER' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer'
            }}
          >
            <User size={32} color={role === 'USER' ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: '600', color: role === 'USER' ? 'var(--primary)' : 'var(--text-muted)' }}>USER</div>
          </div>
          <div 
            onClick={() => setRole('ADMIN')}
            style={{
              flex: 1, padding: '24px 16px', backgroundColor: 'var(--surface)',
              border: `2px solid ${role === 'ADMIN' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer'
            }}
          >
            <ShieldCheck size={32} color={role === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: '600', color: role === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)' }}>ADMIN</div>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleGetOTP}>
        <div className="input-group">
          <label className="input-label">Employee ID</label>
          <div className="input-field">
            <User className="input-icon" size={18} />
            <input name="employeeId" type="text" placeholder="e.g. EMP1001 or ADM1001" value={formData.employeeId} onChange={handleChange} required />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Must be a valid employee record. For users, try EMP1001 to EMP1010. For admins, try ADM1001 or ADM1002.
          </span>
        </div>

        <div className="input-group">
          <label className="input-label">Full Name</label>
          <div className="input-field">
            <User className="input-icon" size={18} />
            <input name="fullName" type="text" placeholder="Enter your legal name" value={formData.fullName} onChange={handleChange} required />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Phone Number (Authorized Test Number)</label>
          <div className="input-field">
            <Phone className="input-icon" size={18} />
            <input name="phoneNumber" type="tel" placeholder="+91 99999 99999" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Note: During testing, only the testing number <strong style={{ color: 'var(--primary-dark)' }}>+91 99999 99999</strong> is authorized.
          </span>
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-field">
            <Lock className="input-icon" size={18} />
            <input name="password" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={handleChange} required minLength={8} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Password</label>
          <div className="input-field">
            <Lock className="input-icon" size={18} />
            <input name="confirmPassword" type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '32px' }}>
          {loading ? 'Processing...' : 'Get SMS OTP →'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', paddingBottom: '32px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
        <Link to="/login" style={{ color: 'var(--primary-dark)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
      </div>
    </div>
  );
}
