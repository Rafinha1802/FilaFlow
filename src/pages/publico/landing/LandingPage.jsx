import React from 'react';
import Navbar from '../../../components/exclusivos/publico/landing/Navbar';
import LandingContent from '../../../components/exclusivos/publico/landing/LandingContent';
import QrScannerModal from '../../../components/exclusivos/publico/landing/QrScannerModal';
import PreCheckinModal from '../../../components/exclusivos/publico/landing/PreCheckinModal';
import QueueSearchModal from '../../../components/exclusivos/publico/landing/QueueSearchModal';

export default function LandingPage({
  demo, session, navigate, playChime, onOpenPricing,
  handleOpenCompanySignup, handleOpenDashboard, handleOpenProfessional, handleLogout,
}) {
  const { isAuthenticated, currentUser } = session;
  const {
    mobileClientUser, setMobileClientUser, isClientAuthenticated, setIsClientAuthenticated,
    clientActiveQueues, selectedQueueId, setSelectedQueueId, hasConflict, setHasConflict,
    isQrScannerOpen, setIsQrScannerOpen, isSearchOpen, setIsSearchOpen,
    isPreCheckinOpen, setIsPreCheckinOpen, preCheckinBusiness,
    handleConfirmPreCheckin, handleRemoveClientQueue, handleSecretaryCheckin,
    handleClientImOnMyWay, handleClientAskMoreTime, handleScanBusiness, handleSearchSelectBusiness,
  } = demo;
  return <>
    <Navbar
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      onGoToLanding={() => navigate('/')}
      onOpenLogin={() => navigate('/empresa/login')}
      onOpenSignup={handleOpenCompanySignup}
      onOpenDashboard={handleOpenDashboard}
      onOpenPricing={onOpenPricing}
      onOpenProfessional={() => handleOpenProfessional()}
      onLogout={handleLogout}
    />
    <LandingContent
      activeQueue={clientActiveQueues[0]}
      activeQueues={clientActiveQueues}
      selectedQueueId={selectedQueueId}
      onSelectQueue={setSelectedQueueId}
      onOpenQrScanner={() => setIsQrScannerOpen(true)}
      onOpenSearch={() => setIsSearchOpen(true)}
      onRemoveQueue={handleRemoveClientQueue}
      onSecretaryCheckin={handleSecretaryCheckin}
      onClientImOnMyWay={handleClientImOnMyWay}
      onClientAskMoreTime={handleClientAskMoreTime}
      hasConflict={hasConflict}
      onDismissConflict={() => setHasConflict(false)}
      onGoToLanding={() => navigate('/')}
      onGoToCompany={handleOpenDashboard}
      onSelectBusiness={handleSearchSelectBusiness}
      onPlayChime={playChime}
      currentUser={mobileClientUser}
      isAuthenticated={isClientAuthenticated}
      onLogout={() => setIsClientAuthenticated(false)}
      onAuthSuccess={(user) => {
        setMobileClientUser(user);
        setIsClientAuthenticated(true);
      }}
      onOpenSignup={handleOpenCompanySignup}
      onOpenLogin={() => navigate('/empresa/login')}
      onOpenPricing={onOpenPricing}
    />
    <QrScannerModal
      isOpen={isQrScannerOpen}
      onClose={() => setIsQrScannerOpen(false)}
      onScanBusiness={handleScanBusiness}
    />

    <PreCheckinModal
      isOpen={isPreCheckinOpen}
      business={preCheckinBusiness}
      onClose={() => setIsPreCheckinOpen(false)}
      onConfirmCheckin={handleConfirmPreCheckin}
    />

    <QueueSearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      onSelectBusiness={handleSearchSelectBusiness}
    />
  </>;
}
