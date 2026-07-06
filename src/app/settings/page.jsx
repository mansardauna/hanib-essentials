'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, enrollMFA, verifyMFAEnrollment, unenrollMFA, updateProfile } = useAuth();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');
  const [mfaError, setMfaError] = useState('');

  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setPhone(user.phone || '');
      checkMFAStatus();
    }
  }, [user]);

  const checkMFAStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (data && data.totp && data.totp.length > 0) {
      const verifiedFactor = data.totp.find(f => f.status === 'verified');
      if (verifiedFactor) {
        setMfaEnabled(true);
        setMfaFactorId(verifiedFactor.id);
      }
    } else if (data && data.length > 0) {
       const verifiedFactor = data.find(f => f.factor_type === 'totp' && f.status === 'verified');
       if (verifiedFactor) {
         setMfaEnabled(true);
         setMfaFactorId(verifiedFactor.id);
       }
    }
  };

  const handleUpdateProfile = async () => {
    const res = await updateProfile(address, phone);
    if (res.success) {
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    }
  };

  const handleEnrollMFA = async () => {
    setMfaError('');
    setMfaMessage('');
    const res = await enrollMFA();
    if (res.success) {
      setMfaFactorId(res.id);
      setQrCodeSvg(res.totp.qr_code);
      setTotpSecret(res.totp.secret);
    } else {
      setMfaError(res.error || 'Failed to start MFA enrollment.');
    }
  };

  const handleVerifyMFA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setMfaError('Please enter a valid 6-digit code.');
      return;
    }
    setMfaError('');
    setMfaMessage('');
    
    const res = await verifyMFAEnrollment(mfaFactorId, verifyCode);
    if (res.success) {
      setMfaEnabled(true);
      setQrCodeSvg('');
      setTotpSecret('');
      setVerifyCode('');
      setMfaMessage('Two-Factor Authentication enabled successfully!');
      setTimeout(() => setMfaMessage(''), 3000);
    } else {
      setMfaError(res.error || 'Invalid code. Please try again.');
    }
  };

  const handleDisableMFA = async () => {
    if (!mfaFactorId) return;
    const res = await unenrollMFA(mfaFactorId);
    if (res.success) {
      setMfaEnabled(false);
      setMfaFactorId(null);
      setMfaMessage('Two-Factor Authentication disabled.');
      setTimeout(() => setMfaMessage(''), 3000);
    } else {
      setMfaError(res.error || 'Failed to disable MFA.');
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-xl font-medium text-slate-500">Please login to view your settings.</div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your profile, addresses, and security preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-100 pb-4">Profile Details</h2>
          
          {profileMessage && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100">{profileMessage}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username / Email</label>
              <input type="text" className="w-full bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-slate-500 cursor-not-allowed" defaultValue={user.username} readOnly />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Address</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900" 
              />
            </div>
            
            <button onClick={handleUpdateProfile} className="w-full py-3 bg-brand-500 text-white font-semibold rounded-xl shadow-sm hover:bg-brand-600 transition-colors">
              Save Changes
            </button>
          </div>
        </section>

        {/* Security / 2FA */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 space-y-6 flex flex-col">
          <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-100 pb-4">Security & Authentication</h2>
          
          {mfaMessage && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100">{mfaMessage}</div>}
          {mfaError && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{mfaError}</div>}
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Two-Factor Auth (2FA)</h3>
                <p className="text-sm text-slate-500 mt-1">{mfaEnabled ? 'Your account is extra secure.' : 'Add an extra layer of security.'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${mfaEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            {mfaEnabled ? (
              <div className="mt-auto pt-6">
                <button onClick={handleDisableMFA} className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                  Disable 2FA
                </button>
              </div>
            ) : qrCodeSvg ? (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 font-medium">1. Scan this QR code with your Authenticator App (e.g. Google Authenticator, Authy):</p>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                
                <p className="text-sm text-slate-600 font-medium mt-4">2. Enter the 6-digit code generated by the app:</p>
                <input 
                  type="text" 
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="123456" 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 tracking-widest text-center text-lg font-medium"
                />
                
                <button onClick={handleVerifyMFA} className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl shadow-sm hover:bg-slate-900 transition-colors">
                  Verify & Enable
                </button>
              </div>
            ) : (
              <div className="mt-auto pt-6">
                <button onClick={handleEnrollMFA} className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl shadow-sm hover:bg-slate-900 transition-colors">
                  Setup 2FA
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
