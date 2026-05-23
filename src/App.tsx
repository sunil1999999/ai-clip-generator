import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import ProjectDashboard from './components/ProjectDashboard';
import AuthModal from './components/AuthModal';
import BillingModal from './components/BillingModal';
import { translations } from './components/Translations';
import { Globe, LogOut, LayoutDashboard, Compass, Lock, RefreshCw, Sparkles, Video } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    const saved = localStorage.getItem("viraclip_lang");
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const [user, setUser] = useState<{ email: string; name: string; credits: number; tier: string } | null>(() => {
    const saved = localStorage.getItem("viraclip_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'landing' | 'dashboard' | 'workspace'>('landing');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Modal active states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const t = translations[lang];

  // Auto-sync user metadata on initial boot
  useEffect(() => {
    if (user) {
      syncLatestUserProfile(user.email);
    }
  }, []);

  const syncLatestUserProfile = async (email: string) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("viraclip_user", JSON.stringify(data.user));
      }
    } catch (e) {
      console.warn("Silent profile sync failed. Keeping local storage values.", e);
    }
  };

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    localStorage.setItem("viraclip_lang", nextLang);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem("viraclip_user", JSON.stringify(userData));
    syncLatestUserProfile(userData.email);
    setView('dashboard'); // take logged-in user straight to their dynamic dashboard!
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("viraclip_user");
    setView('landing');
  };

  const handleStartWorkspace = (initialTopic?: string) => {
    setSelectedTopic(initialTopic || '');
    setSelectedProject(null);
    setView('workspace');
  };

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    setSelectedTopic(project.topic || '');
    setView('workspace');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setSelectedTopic('');
    setSelectedProject(null);
    if (user) {
      syncLatestUserProfile(user.email);
    }
  };

  return (
    <div id="main-app-container" className="min-h-screen bg-brand-black text-brand-offwhite flex flex-col font-sans selection:bg-brand-green selection:text-black">
      
      {/* Dynamic Sub-header Navigation for Workspace views other than Landing & Workspace */}
      {view === 'dashboard' && (
        <nav id="dashboard-navbar" className="w-full border-b border-white/10 bg-brand-black/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(0,255,102,0.4)]">
                <div className="w-3 h-3 bg-black rounded-sm rotate-45"></div>
              </div>
              <span id="brand-title" className="font-sans font-black text-xl tracking-tighter text-white flex items-center gap-1.5 cursor-pointer" onClick={() => setView('landing')}>
                VIRACLIP.AI <span className="text-[9px] font-mono font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{t.appEngine}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Language selection */}
              <button
                id="dashboard-lang-switcher"
                onClick={handleLangToggle}
                className="px-3 py-1.5 rounded border border-white/10 text-[10px] font-mono hover:bg-white/5 uppercase tracking-widest flex items-center gap-1 cursor-pointer text-brand-green"
              >
                <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'हिन्दी' : 'English'}
              </button>

              <button
                id="tour-redirect"
                onClick={() => setView('landing')}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4 text-brand-green" /> {t.exploreTab || "App Tour"}
              </button>

              {user ? (
                <>
                  <div className="text-right hidden md:block">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">{user.name}</p>
                    <p className="text-[9px] font-mono text-brand-green font-black uppercase tracking-widest">{user.tier} • {user.credits} credits</p>
                  </div>
                  
                  <button
                    id="profile-upgrade-credits"
                    onClick={() => setIsBillingOpen(true)}
                    className="px-4 py-2 bg-brand-green hover:bg-white text-black font-sans font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                  >
                    + {t.creditsLabel || "Buy Credits"}
                  </button>

                  <button
                    id="dashboard-logout-btn"
                    onClick={handleLogout}
                    className="p-2 text-white/40 hover:text-white rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  id="dashboard-login-btn"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 bg-brand-green text-black font-sans font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  {t.btnSignIn}
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Primary view routers */}
      <main id="primary-view" className="flex-grow p-0">
        {view === 'landing' && (
          <LandingPage 
            lang={lang}
            onLangToggle={handleLangToggle}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onGoToDashboard={() => setView('dashboard')}
            onOpenPricing={() => setIsBillingOpen(true)}
            onStart={handleStartWorkspace} 
          />
        )}

        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-6 border-b border-white/5 pb-4">
              <h1 className="font-sans font-black text-2xl text-white uppercase tracking-wider flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-brand-green" /> {t.dashboardTitle}
              </h1>
              <p className="text-white/40 text-xs mt-1 uppercase tracking-wider font-light">
                {user ? `${user.name}${t.dashboardSubtitle}` : "Organize generated shorts."}
              </p>
            </div>
            
            <ProjectDashboard 
              lang={lang}
              user={user}
              onSelectProject={handleSelectProject}
              onCreateNewProject={() => setView('workspace')}
              onOpenPricingModal={() => setIsBillingOpen(true)}
            />
          </div>
        )}

        {view === 'workspace' && (
          <Workspace 
            lang={lang}
            user={user}
            onRefreshUser={(updated) => syncLatestUserProfile(updated.email)}
            onOpenAuth={() => setIsAuthOpen(true)}
            initialTopic={selectedTopic} 
            initialProject={selectedProject}
            onBackToLanding={handleBackToLanding} 
          />
        )}
      </main>

      {/* Persistent global styled modals/popups components */}
      {isAuthOpen && (
        <AuthModal 
          lang={lang}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {isBillingOpen && user && (
        <BillingModal 
          lang={lang}
          userEmail={user.email}
          onClose={() => setIsBillingOpen(false)}
          onPaymentSuccess={(updated) => {
            setUser(updated);
            localStorage.setItem("viraclip_user", JSON.stringify(updated));
            syncLatestUserProfile(updated.email);
          }}
        />
      )}

      {isBillingOpen && !user && (
        <div id="unauthorized-billing-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-brand-gray border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 relative">
            <button onClick={() => setIsBillingOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">✕</button>
            <div className="w-12 h-12 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-black text-sm uppercase text-white tracking-wider">{t.authRequiredTitle}</h3>
            <p className="text-[11px] text-white/50 leading-relaxed uppercase tracking-wide">
              {t.authRequiredDesc}
            </p>
            <button
              onClick={() => { setIsBillingOpen(false); setIsAuthOpen(true); }}
              className="w-full py-3 bg-brand-green text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-colors"
            >
              {t.btnSignIn}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
