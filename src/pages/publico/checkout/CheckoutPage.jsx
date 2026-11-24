import React from 'react';
import CheckoutForm from '../../../components/exclusivos/publico/checkout/CheckoutForm';
import { registerCompanyAndProfessionals } from '../../../services/authService';

export default function CheckoutPage({
  initialPlanName, initialBillingCycle, pendingRegistrationData, onGoBack,
  onBusinessDataChange, onRegistrationConsumed, onComplete, onPlayChime, onNotify,
}) {
  const handlePaymentSuccess = (order) => {
    if (order && order.pendingRegistrationData) {
      const regResult = registerCompanyAndProfessionals({
        companyData: order.pendingRegistrationData.companyData,
        professionalsList: order.pendingRegistrationData.professionalsList,
        selectedPlan: order.planName
      });
      onBusinessDataChange((prev) => ({
        ...prev,
        companyName: regResult.company.companyName,
        unitName: regResult.company.unitName || prev.unitName,
        attendantName: regResult.company.attendantName || prev.attendantName,
        category: regResult.company.category || prev.category,
        room: regResult.company.room || prev.room
      }));
      onRegistrationConsumed();
    } else if (order && order.companyName) {
      onBusinessDataChange((prev) => ({
        ...prev,
        companyName: order.companyName,
        attendantName: order.customerName || prev.attendantName,
        email: order.email || prev.email
      }));
    }
    onComplete();
    onPlayChime();
    onNotify(`Assinatura do Plano ${order ? order.planName : 'Profissional'} ativada com sucesso!`);
  };
  return <CheckoutForm initialPlanName={initialPlanName} initialBillingCycle={initialBillingCycle}
    pendingRegistrationData={pendingRegistrationData} onGoBack={onGoBack} onPaymentSuccess={handlePaymentSuccess} />;
}
