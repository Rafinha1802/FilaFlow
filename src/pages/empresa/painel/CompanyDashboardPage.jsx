import React from 'react';
import CompanyDashboard from '../../../components/exclusivos/empresa/painel/CompanyDashboard';
import CompanyLoginPage from '../login/CompanyLoginPage';
import { useCompanyQueue } from '../../../hooks/useCompanyQueue';
import { getToken } from '../../../services/api';
import { COMPANY_TAB_PATHS, companyTabForPath } from '../../../router/routes';

export default function CompanyDashboardPage({
  currentPath, navigate, session, businessData, onUpdateBusinessData,
  onNotify, onReportDelay, onLogout, onGoToSignup,
}) {
  const { isAuthenticated, authCheckedPath } = session;
  const {
    operationalContext, operationalQueue, operationalQueues, selectQueue,
    queueBusy, queueReady, canIssue, canAttend, queueError, queueActionError,
    dismissActionError, activeAttendingTicket, companyWaitingQueue,
    callNext: handleCallNextTicket, finishCurrent: handleFinishCurrent,
    addManualTicket: handleAddManualTicket,
  } = useCompanyQueue(isAuthenticated ? getToken() : null, onNotify);
  const handleOpenClient = () => navigate('/app');
  const handleOpenProfessional = () => navigate('/profissional');
  const handleSkipTicket = () => onNotify('O registro de ausência ainda não está integrado.');
  if (authCheckedPath !== currentPath) return <p role="status">Verificando sessão...</p>;
  if (!isAuthenticated) return <CompanyLoginPage session={session} navigate={navigate} onGoToSignup={onGoToSignup} />;
  return (
    <CompanyDashboard
      key={operationalContext}
      operationalQueues={operationalQueues}
      selectedOperationalQueue={operationalQueue}
      onSelectOperationalQueue={selectQueue}
      selectionBusy={queueBusy}
      canIssue={canIssue}
      canAttend={canAttend}
      queueBusy={!queueReady || queueBusy}
      queueError={queueError}
      queueActionError={queueActionError}
      onDismissQueueActionError={dismissActionError}
      businessData={operationalQueue ? { ...businessData, ...operationalQueue } : { companyName: 'TemFyla', unitName: 'Selecione uma fila' }}
      activeAttendingTicket={activeAttendingTicket}
      waitingQueue={companyWaitingQueue}
      onCallNext={handleCallNextTicket}
      onReportDelay={onReportDelay}
      onFinishCurrent={handleFinishCurrent}
      onSkipTicket={handleSkipTicket}
      onAddManualTicket={handleAddManualTicket}
      onOpenMobileTest={handleOpenClient}
      onGoToSite={() => navigate('/')}
      onLogout={onLogout}
      onOpenProfessional={handleOpenProfessional}
      onUpdateBusinessData={onUpdateBusinessData}
      initialTab={companyTabForPath(currentPath)}
      onTabChange={(tab) => {
        if (COMPANY_TAB_PATHS[tab]) navigate(COMPANY_TAB_PATHS[tab]);
      }}
    />
  );
}
