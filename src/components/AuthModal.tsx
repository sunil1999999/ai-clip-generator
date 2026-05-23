import React, { useState } from 'react';
import { translations } from './Translations';
import { User, Mail, Lock, Key, AlertCircle, CheckCircle, Shield, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  lang: 'en' | 'hi';
  onClose: () => void;
  onAuthSuccess: (user: { email: string; name: string; credits: number; tier: string }) => void;
}

export default function AuthModal({ lang, onClose, onAuthSuccess }: AuthModalProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recover'>('login');
  
  // Forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Recovery state
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');
  
  // Flags & messages
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setError('');
    setInfo('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) return setError("Please fill in all credentials.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Unable to connect to security database. Activating fail-safe.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password || !name) return setError("Please fill in all details.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || "Registration error occurred.");
      }
    } catch (err) {
      setError("Secure server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email) return setError("Please specify your registered email.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setInfo(data.message || `A security recovery code has been sent: ${data.code}`);
        setRecoveryCode(data.code); // pre-populate for frictionless developer testing!
        setRecoveryStep('verify');
      } else {
        setError(data.error || "No registered user linked to this address.");
      }
    } catch (err) {
      setError("Database failed to process request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !recoveryCode || !newPassword) return setError("Please complete all recovery input slots.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: recoveryCode, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setInfo("Security settings restored! You can now log in with the new password.");
        setActiveTab('login');
        setPassword(newPassword);
        setRecoveryStep('request');
      } else {
        setError(data.error || "Reset credentials failed.");
      }
    } catch (err) {
      setError("Reset pipeline error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div id="auth-modal" className="bg-brand-gray border border-white/10 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-6">
        
        {/* Close cross */}
        <button 
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-lg transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Modal headers */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-brand-green/10 border border-brand-green/20 rounded-full flex items-center justify-center text-brand-green mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-sans font-black text-lg text-white uppercase tracking-wider">
            {activeTab === 'login' && t.authModalTitleLogin}
            {activeTab === 'register' && t.authModalTitleRegister}
            {activeTab === 'recover' && "Recovery Portal"}
          </h2>
          <p className="text-white/40 text-[11px] leading-relaxed mt-1 font-sans">
            {t.authModalDesc}
          </p>
        </div>

        {/* Errors / Success displays */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-md text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-sans text-[11px]">{error}</p>
          </div>
        )}
        {info && (
          <div className="p-3 bg-brand-green/10 border border-brand-green/25 rounded-md text-brand-green text-xs flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-mono text-[11px] leading-relaxed select-all">{info}</p>
          </div>
        )}

        {/* Active Auth view controller */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input 
                  id="auth-login-email"
                  type="email"
                  placeholder="creator@viraclip.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">{t.passwordLabel}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input 
                  id="auth-login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            <button 
              id="auth-submit-btn"
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-brand-green hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t.btnSignIn}
            </button>

            <div className="pt-2 text-center flex flex-col gap-1.5">
              <button 
                id="toggle-register-btn"
                type="button" 
                onClick={() => { setActiveTab('register'); clearMessages(); }}
                className="text-[10px] text-brand-green hover:underline uppercase tracking-wide"
              >
                {t.noAccount}
              </button>
              <button 
                id="toggle-recover-btn"
                type="button" 
                onClick={() => { setActiveTab('recover'); clearMessages(); setRecoveryStep('request'); }}
                className="text-[10px] text-white/40 hover:text-white hover:underline uppercase tracking-wide block"
              >
                {t.recoveryHint}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Full Developer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input 
                  id="auth-register-name"
                  type="text"
                  placeholder="Aman Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input 
                  id="auth-register-email"
                  type="email"
                  placeholder="creator@viraclip.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">{t.passwordLabel}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input 
                  id="auth-register-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            <button 
              id="auth-register-submit-btn"
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-brand-green hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t.btnRegister}
            </button>

            <div className="pt-2 text-center">
              <button 
                id="toggle-login-btn"
                type="button" 
                onClick={() => { setActiveTab('login'); clearMessages(); }}
                className="text-[10px] text-brand-green hover:underline uppercase tracking-wide"
              >
                {t.alreadyRegistered}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'recover' && (
          <div className="space-y-4">
            {recoveryStep === 'request' ? (
              <form onSubmit={handleRecoveryRequest} className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">{t.emailLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                    <input 
                      id="auth-recover-email"
                      type="email"
                      placeholder="Enter registered email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                    />
                  </div>
                </div>

                <button 
                  id="auth-recover-btn"
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-green hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5" /> : t.btnRecover}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">{t.securityCodeLabel}</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                    <input 
                      id="auth-recover-code"
                      type="text"
                      placeholder="e.g. VIRA-1234"
                      value={recoveryCode}
                      onChange={e => setRecoveryCode(e.target.value)}
                      className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors font-mono tracking-widest"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">New Account Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                    <input 
                      id="auth-recover-new-password"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 text-white rounded-lg pl-10 pr-4.5 py-2.5 text-xs focus:outline-none focus:border-brand-green transition-colors"
                    />
                  </div>
                </div>

                <button 
                  id="auth-recover-reset-submit"
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-green hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5" /> : t.btnResetNow}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button 
                id="auth-recover-back-to-login"
                type="button"
                onClick={() => { setActiveTab('login'); clearMessages(); }}
                className="text-[10px] text-brand-green hover:underline uppercase tracking-wide"
              >
                ← Back to Login Credentials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
