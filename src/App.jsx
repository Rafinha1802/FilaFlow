import React, { useEffect, useState } from 'react';
import { useAppRouter } from './router/useAppRouter';
import { useCompanySession } from './hooks/useCompanySession';
import { useLandingDemo } from './hooks/useLandingDemo';
import LandingPage from './pages/publico/landing/LandingPage';
import CheckoutPage from './pages/publico/checkout/CheckoutPage';
import ClientAppPage from './pages/cliente/app/ClientAppPage';
import CompanyDashboardPage from './pages/empresa/painel/CompanyDashboardPage';
import ProfessionalWorkspacePage from './pages/profissional/consultorio/ProfessionalWorkspacePage';
import PricingModal from './components/exclusivos/publico/checkout/PricingModal';
import NotificationBanner from './components/compartilhados/NotificationBanner';
import { getPendingCompanyRegistration } from './services/authService';
import { fetchQueues } from './services/api';

export default function App() {
  const { currentPath, navigate, isAppRoute, isCompanyRoute, isCheckoutRoute,
    isProfessionalRoute, isSiteRoute } = useAppRouter();
  const session = useCompanySession(currentPath, isCompanyRoute);
  const [pendingRegistrationData, setPendingRegistrationData] = useState(() => getPendingCompanyRegistration());
  const [checkoutPlan, setCheckoutPlan] = useState('Profissional');
  const [checkoutCycle, setCheckoutCycle] = useState('monthly');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [callAlertMessage, setCallAlertMessage] = useState(null);
  const showToast = (message) => {
    setCallAlertMessage(message);
    setTimeout(() => setCallAlertMessage(null), 6000);
  };
  // Sound chime helper
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
      console.log('AudioContext not allowed without gesture');
    }
  };

  const demo = useLandingDemo({ navigate, playChime, showToast });
  // Business / Company Data State
  const [businessData, setBusinessData] = useState({
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    attendantName: 'Dr. Carlos Mendes',
    category: 'Clínica',
    room: 'Consultório 04'
  });

  // -------------------------------------------------------------
  // Sincronização Automática com o Backend FastAPI & WebSockets
  // -------------------------------------------------------------
  useEffect(() => {
    // 2. Busca filas reais do backend FastAPI
    async function syncBackendData() {
      try {
        const queues = await fetchQueues();
        if (Array.isArray(queues) && queues.length > 0) {
          console.log('[TemFyla] Filas sincronizadas com o backend:', queues);
          const vidaQueue = queues.find((q) => q.id === 'clinica-vida') || queues[0];
          if (vidaQueue) {
            setBusinessData((prev) => ({
              ...prev,
              companyName: vidaQueue.companyName || prev.companyName,
              attendantName: vidaQueue.attendantName || prev.attendantName,
              room: vidaQueue.room || prev.room
            }));


          }
        }
      } catch (err) {
        console.warn('[TemFyla] Rodando com dados locais:', err);
      }
    }

    syncBackendData();

  }, []);


  const handleOpenCompanySignup = () => alert('O cadastro de empresas ainda não está disponível.');
  const handleOpenDashboard = () => navigate(session.isAuthenticated ? '/empresa/dashboard' : '/empresa/login');
  const handleOpenProfessional = () => navigate('/profissional');
  const handleLogout = () => {
    session.logout();
    navigate('/');
    showToast('Sessão encerrada.');
  };

  return (
    <div className="ff-app-root">
      <NotificationBanner message={callAlertMessage} onDismiss={() => setCallAlertMessage(null)} compact={isAppRoute} />
      {isSiteRoute && <LandingPage demo={demo} session={session} navigate={navigate} playChime={playChime}
        onOpenPricing={() => setIsPricingOpen(true)} handleOpenCompanySignup={handleOpenCompanySignup}
        handleOpenDashboard={handleOpenDashboard} handleOpenProfessional={handleOpenProfessional} handleLogout={handleLogout} />}
      {isAppRoute && <ClientAppPage onGoToLanding={() => navigate('/')} />}
      {isCompanyRoute && <CompanyDashboardPage currentPath={currentPath} navigate={navigate} session={session}
        businessData={businessData} onUpdateBusinessData={(data) => { if (data) setBusinessData(data); }}
        onNotify={showToast} onReportDelay={demo.handleReportDelay} onLogout={handleLogout} onGoToSignup={handleOpenCompanySignup} />}
      {isProfessionalRoute && <ProfessionalWorkspacePage onGoToSite={() => navigate('/')} onGoToClient={() => navigate('/app')} />}
      {isCheckoutRoute && <CheckoutPage initialPlanName={checkoutPlan} initialBillingCycle={checkoutCycle}
        pendingRegistrationData={pendingRegistrationData} onGoBack={() => navigate('/')}
        onBusinessDataChange={setBusinessData} onRegistrationConsumed={() => setPendingRegistrationData(null)}
        onComplete={() => navigate('/empresa/dashboard')} onPlayChime={playChime} onNotify={showToast} />}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} onSelectPlan={(plan, cycle = 'monthly') => {
        setIsPricingOpen(false);
        setCheckoutPlan(plan.name);
        setCheckoutCycle(cycle);
        navigate('/checkout');
      }} />
    </div>
  );
}
