import React from 'react';
import OperationalLogin from '../../../components/compartilhados/OperationalLogin';

export default function ProfessionalLoginPage({ initialError, onCancel, onLoginSuccess }) {
  return <OperationalLogin professionalMode initialError={initialError}
    onCancel={onCancel} onLoginSuccess={onLoginSuccess} />;
}
