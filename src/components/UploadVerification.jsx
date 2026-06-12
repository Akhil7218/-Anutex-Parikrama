import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera as CameraIcon, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { db } from '../utils/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function UploadVerification() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [searchParams] = useSearchParams();
  const readonlyParam = searchParams.get('readonly') === 'true';
  
  const [item, setItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('parikrama_session'));
    if (!session) { navigate('/login'); return; }
    
    db.getUserChecklist(session.id).then(list => {
      const found = list.find(i => i.id === itemId);
      if (!found) {
        navigate('/user/checklist');
      } else {
        setItem(found);
        // If checklist is locked OR item is already completed OR explicitly requested readonly
        if (found.locked || found.status === 'COMPLETED' || readonlyParam) {
          setIsReadOnly(true);
          setImagePreview(found.image);
        }
      }
    });
  }, [itemId, navigate, readonlyParam]);

  const handleTakePhoto = async () => {
    if (isReadOnly) return;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90
      });
      setImagePreview(photo.dataUrl);
    } catch (error) {
      console.error("User cancelled camera or error:", error);
    }
  };

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateMockImage = () => {
    if (isReadOnly) return;
    // Generate a high quality mock verification proof image
    const mockSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="100%" height="100%" fill="#0D47A1"/>
        <circle cx="200" cy="120" r="50" fill="#002171"/>
        <path d="M180 120 l15 15 l30 -30" stroke="#E8F5E8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="50%" y="210" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">${item ? item.title.toUpperCase() : 'INSPECTION'} PASSED</text>
        <text x="50%" y="240" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#E5E5EA">Anutex Parikrama Digital Evidence</text>
        <text x="50%" y="265" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B0BEC5">Timestamp: ${new Date().toLocaleString()}</text>
      </svg>
    `)}`;
    setImagePreview(mockSvg);
  };

  const handleSave = async () => {
    if (isReadOnly || !imagePreview) return;
    setSaving(true);
    try {
      const session = JSON.parse(localStorage.getItem('parikrama_session'));
      await db.updateChecklistEvidence(session.id, itemId, imagePreview);
      navigate('/user/checklist');
    } catch (err) {
      alert(err.message);
      setSaving(false);
    }
  };

  if (!item) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#F8F9FA', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => navigate('/user/checklist')} style={{ marginRight: '16px' }}>
          <ArrowLeft size={24} color="var(--primary-dark)" />
        </button>
        <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px' }}>{item.title}</h2>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-main)' }}>
          {isReadOnly ? 'Evidence Record' : 'Upload Verification'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          {isReadOnly ? 'This item is locked. Uploaded evidence is archived below.' : 'Use the camera to capture evidence for this checklist item.'}
        </p>

        {isReadOnly ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
             <div style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', marginBottom: '16px', fontSize: '14px' }}>
                  <CheckCircle2 size={20} style={{ marginRight: '8px' }} />
                  Evidence Locked & Verified
                </div>
                {imagePreview ? (
                  <img src={imagePreview} alt="evidence" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                ) : (
                  <div style={{ padding: '24px', color: 'var(--text-muted)' }}>No image uploaded.</div>
                )}
             </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
            {!imagePreview ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={handleTakePhoto} className="btn-primary" style={{ padding: '16px' }}>
                    <CameraIcon size={24} style={{ marginRight: '8px' }}/> OPEN CAMERA
                  </button>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                      UPLOAD FILE
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    
                    <button onClick={handleSimulateMockImage} className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: '14px', color: 'var(--success)', borderColor: 'var(--success)' }}>
                      SIMULATE MOCK
                    </button>
                  </div>
               </div>
            ) : (
               <div style={{ textAlign: 'center' }}>
                  <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', marginBottom: '16px' }}>
                    <CheckCircle2 size={20} style={{ marginRight: '8px' }} />
                    Evidence Captured
                  </div>
                  
                  <img src={imagePreview} alt="evidence" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }} />
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleTakePhoto} className="btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                      <RotateCcw size={18} style={{ marginRight: '8px' }}/> Retake
                    </button>
                    <button onClick={() => setImagePreview(null)} className="btn-outline" style={{ flex: 1, padding: '12px', color: '#D32F2F', borderColor: '#D32F2F' }}>
                      Clear
                    </button>
                  </div>
               </div>
            )}
          </div>
        )}

        <div style={{ backgroundColor: isReadOnly ? '#ECEFF1' : '#F0F2F5', borderLeft: `4px solid ${isReadOnly ? 'var(--text-muted)' : 'var(--primary-dark)'}`, padding: '16px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: isReadOnly ? 'var(--text-muted)' : 'var(--primary-dark)' }} />
          <span>
            {isReadOnly 
              ? 'This evidence record is securely archived. As per compliance standards, finalized submissions are locked and cannot be edited, replaced, or deleted.'
              : 'Ensure the machine ID and safety guards are clearly visible. The preview above allows you to check the quality before saving. Saving will lock this evidence.'}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px', backgroundColor: '#F8F9FA' }}>
        {isReadOnly ? (
          <button 
            onClick={() => navigate('/user/checklist')} 
            className="btn-primary" 
            style={{ backgroundColor: 'var(--text-muted)' }}
          >
            Back to Checklist
          </button>
        ) : (
          <button 
            onClick={handleSave} 
            className="btn-primary" 
            disabled={!imagePreview || saving}
          >
            {saving ? 'Saving...' : 'Save & Complete'}
          </button>
        )}
      </div>
    </div>
  );
}
