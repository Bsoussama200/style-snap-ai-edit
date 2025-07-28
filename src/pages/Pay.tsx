import React from 'react';
import PaymentGate from '@/components/PaymentGate';
import { useNavigate } from 'react-router-dom';

const Pay = () => {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/');
  };

  return <PaymentGate onPaymentSuccess={handlePaymentSuccess} />;
};

export default Pay;