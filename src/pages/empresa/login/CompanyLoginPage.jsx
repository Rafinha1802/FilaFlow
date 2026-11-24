import React from 'react';
import OperationalLogin from '../../../components/compartilhados/OperationalLogin';

export default function CompanyLoginPage({ session, navigate, onGoToSignup }) {
  const handleLogin = (user) => {
    session.acceptUser(user);
    navigate('/empresa/dashboard');
  };
  return <OperationalLogin initialError={session.sessionError} onLoginSuccess={handleLogin}
    onGoToSignup={onGoToSignup} onCancel={() => navigate('/')} />;
}
