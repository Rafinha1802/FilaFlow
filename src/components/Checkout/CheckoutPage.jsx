import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  QrCode, 
  Receipt, 
  Copy, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft, 
  Sparkles, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Tag, 
  Download, 
  Printer, 
  Zap, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { PRICING_PLANS } from '../../data/mockData';

export default function CheckoutPage({
  initialPlanName = 'Profissional',
  initialBillingCycle = 'monthly', // 'monthly' | 'annual'
  onGoBack,
  onPaymentSuccess
}) {
  // Plan Selection
  const [selectedPlanName, setSelectedPlanName] = useState(initialPlanName);
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);

  // Active plan object
  const currentPlan = PRICING_PLANS.find(p => p.name === selectedPlanName) || PRICING_PLANS[1];

  // Active Payment Method Tab: 'pix' | 'card' | 'boleto'
  const [paymentMethod, setPaymentMethod] = useState('pix');

  // Customer / Business Information State
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Dra. Beatriz Santos',
    companyName: 'Centro Médico Aurora',
    email: 'contato@centromedicofila.com.br',
    document: '28.749.123/0001-44', // CNPJ / CPF
    phone: '(11) 97123-4567'
  });

  // Credit Card Form State
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1',
    saveCard: true
  });

  // Discount Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code: 'FILA10', discountPercent: 10 }
  const [couponError, setCouponError] = useState('');

  // Pix state
  const [pixCopied, setPixCopied] = useState(false);
  const [boletoCopied, setBoletoCopied] = useState(false);
  const [pixTimerSeconds, setPixTimerSeconds] = useState(15 * 60); // 15 minutes

  // Loading & Submission State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);

  // Pix Countdown Timer Effect
  useEffect(() => {
    if (orderCompleted) return;
    const interval = setInterval(() => {
      setPixTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [orderCompleted]);

  // Format Timer to MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Base plan price calculation
  const rawPriceString = billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice;

  // Annual is billed per year (or per month with 20% discount)
  const baseMonthly = parseFloat(currentPlan.monthlyPrice.replace('R$', '').trim());
  const baseAnnualPerMonth = parseFloat(currentPlan.annualPrice.replace('R$', '').trim());
  
  const annualSavingsTotal = (baseMonthly - baseAnnualPerMonth) * 12;

  // Calculate Subtotal & Discounts
  let totalAmount = billingCycle === 'annual' ? baseAnnualPerMonth * 12 : baseMonthly;
  
  // Coupon discount
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    couponDiscountAmount = (totalAmount * appliedCoupon.discountPercent) / 100;
    totalAmount -= couponDiscountAmount;
  }

  // Pix discount (5% extra)
  let pixDiscountAmount = 0;
  if (paymentMethod === 'pix') {
    pixDiscountAmount = totalAmount * 0.05;
    totalAmount -= pixDiscountAmount;
  }

  // Card brand detector
  const getCardBrand = (num) => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return { name: 'Visa', color: '#1a1f71', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' };
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return { name: 'Mastercard', color: '#eb001b', gradient: 'linear-gradient(135deg, #2b0938 0%, #1e1b4b 100%)' };
    if (/^(4011|4389|4514|5041|5066|5067|509|6277|6362|6363)/.test(clean)) return { name: 'Elo', color: '#00a4e8', gradient: 'linear-gradient(135deg, #09203f 0%, #537895 100%)' };
    if (/^3[47]/.test(clean)) return { name: 'Amex', color: '#006fcf', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' };
    return { name: 'Cartão', color: '#7c3aed', gradient: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 60%, #1e1b4b 100%)' };
  };

  const cardBrand = getCardBrand(cardData.number);

  // Masks and formatting
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: val });
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: val });
  };

  const handleCardCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({ ...cardData, cvv: val });
  };

  const handleDocumentChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length <= 11) {
      // CPF: 000.000.000-00
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      val = val.slice(0, 14)
               .replace(/^(\d{2})(\d)/, '$1.$2')
               .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
               .replace(/\.(\d{3})(\d)/, '.$1/$2')
               .replace(/(\d{4})(\d)/, '$1-$2');
    }
    setCustomerInfo({ ...customerInfo, document: val });
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    if (val.length > 9) {
      val = `${val.slice(0, 10)}-${val.slice(10)}`;
    }
    setCustomerInfo({ ...customerInfo, phone: val });
  };

  // Coupon apply
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'FILA10') {
      setAppliedCoupon({ code: 'FILA10', discountPercent: 10 });
    } else if (clean === 'FILA20' || clean === 'BEMVINDO') {
      setAppliedCoupon({ code: clean, discountPercent: 20 });
    } else {
      setCouponError('Cupom inválido ou expirado. Tente o cupom FILA10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Pix copy
  const pixKeyMock = `00020126580014BR.GOV.BCB.PIX0136d8f28941-8c43-4e89-bf86-${Date.now().toString().slice(-8)}520400005303986540${totalAmount.toFixed(2)}5802BR5920FilaFlow Tech S.A.6009Sao Paulo62070503***6304E8A2`;
  
  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyMock);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  // Boleto barcode mock
  const boletoBarcodeMock = `34191.79001 01043.510047 91020.150008 5 94520000${Math.round(totalAmount).toString().padStart(6, '0')}`;
  
  const handleCopyBoleto = () => {
    navigator.clipboard.writeText(boletoBarcodeMock.replace(/\s+/g, ''));
    setBoletoCopied(true);
    setTimeout(() => setBoletoCopied(false), 3000);
  };

  // Process Payment Simulation
  const handleProcessPayment = (methodChosen) => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const order = {
        orderId: `FLF-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: currentPlan.name,
        billingCycle,
        amount: totalAmount,
        paymentMethod: methodChosen || paymentMethod,
        customerName: customerInfo.name || 'Dra. Beatriz Santos',
        companyName: customerInfo.companyName || 'Centro Médico Aurora',
        email: customerInfo.email || 'contato@centromedicofila.com.br',
        document: customerInfo.document,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      setOrderCompleted(order);
    }, 1200);
  };

  // Quick fill sample data for fast testing
  const handleFillDemoData = () => {
    setCustomerInfo({
      name: 'Dr. Carlos Mendes',
      companyName: 'Clínica Vida',
      email: 'atendimento@clinicavida.com.br',
      document: '12.345.678/0001-90',
      phone: '(11) 98765-4321'
    });
    setCardData({
      number: '5502 0012 3456 7890',
      name: 'CARLOS MENDES',
      expiry: '08/29',
      cvv: '882',
      installments: '1',
      saveCard: true
    });
  };

  // -------------------------------------------------------------
  // VIEW: SUCCESS CONFIRMATION SCREEN
  // -------------------------------------------------------------
  if (orderCompleted) {
    return (
      <div className="ff-checkout-success-wrap">
        <div className="ff-checkout-success-card">
          <div className="ff-success-icon-badge">
            <CheckCircle2 size={46} strokeWidth={2.4} />
          </div>

          <span className="ff-success-badge-top">
            {orderCompleted.paymentMethod === 'boleto' ? 'Boleto Gerado com Sucesso' : 'Pagamento Aprovado Instantaneamente'}
          </span>

          <h2 className="ff-success-title">
            {orderCompleted.paymentMethod === 'boleto' 
              ? 'Tudo certo! Aguardando compensação' 
              : 'Parabéns! Sua assinatura está ativa'}
          </h2>

          <p className="ff-success-desc">
            {orderCompleted.paymentMethod === 'boleto'
              ? `O boleto foi emitido em nome de ${orderCompleted.companyName}. O comprovante e código de barras foram enviados para ${orderCompleted.email}.`
              : `O plano ${orderCompleted.planName} (${orderCompleted.billingCycle === 'annual' ? 'Anual' : 'Mensal'}) já está liberado para ${orderCompleted.companyName}.`}
          </p>

          {/* Receipt Breakdown Box */}
          <div className="ff-success-receipt">
            <div className="ff-receipt-row">
              <span className="ff-receipt-label">Número do Pedido</span>
              <span className="ff-receipt-val ff-receipt-bold">#{orderCompleted.orderId}</span>
            </div>
            <div className="ff-receipt-row">
              <span className="ff-receipt-label">Data & Hora</span>
              <span className="ff-receipt-val">{orderCompleted.date}</span>
            </div>
            <div className="ff-receipt-row">
              <span className="ff-receipt-label">Plano Selecionado</span>
              <span className="ff-receipt-val ff-receipt-bold">{orderCompleted.planName} • {orderCompleted.billingCycle === 'annual' ? 'Ciclo Anual' : 'Ciclo Mensal'}</span>
            </div>
            <div className="ff-receipt-row">
              <span className="ff-receipt-label">Empresa Cadastrada</span>
              <span className="ff-receipt-val">{orderCompleted.companyName}</span>
            </div>
            <div className="ff-receipt-row">
              <span className="ff-receipt-label">Forma de Pagamento</span>
              <span className="ff-receipt-val" style={{ textTransform: 'capitalize' }}>
                {orderCompleted.paymentMethod === 'pix' && '⚡ PIX Instantâneo'}
                {orderCompleted.paymentMethod === 'card' && '💳 Cartão de Crédito'}
                {orderCompleted.paymentMethod === 'boleto' && '📄 Boleto Bancário'}
              </span>
            </div>
            <div className="ff-receipt-divider" />
            <div className="ff-receipt-row ff-receipt-total">
              <span className="ff-receipt-label">Valor Pago</span>
              <span className="ff-receipt-total-val">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderCompleted.amount)}
              </span>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="ff-success-steps-box">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#7c3aed" />
              <span>O que acontece agora?</span>
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Enviamos a Nota Fiscal Eletrônica e os dados de confirmação para <strong>{orderCompleted.email}</strong>.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Sua fila virtual já está criada e você pode imprimir seu primeiro QR Code de balcão.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Garantia de 7 dias com cancelamento simplificado a 1 clique.</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="ff-success-actions">
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: 15, justifyContent: 'center' }}
              onClick={() => {
                if (onPaymentSuccess) {
                  onPaymentSuccess(orderCompleted);
                } else if (onGoBack) {
                  onGoBack();
                }
              }}
            >
              <span>Acessar Painel da Empresa</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn-outline-purple"
              style={{ width: '100%', padding: '10px 16px', fontSize: 14, justifyContent: 'center' }}
              onClick={onGoBack}
            >
              <span>Voltar à Página Inicial</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: CHECKOUT MAIN PAGE
  // -------------------------------------------------------------
  return (
    <div className="ff-checkout-page">
      {/* Checkout Minimal Top Header */}
      <header className="ff-checkout-header">
        <div className="ff-checkout-header-inner">
          <div className="ff-checkout-nav-left">
            <button 
              className="ff-checkout-back-btn" 
              onClick={onGoBack} 
              title="Voltar ao site"
            >
              <ChevronLeft size={20} />
              <span>Voltar ao Site</span>
            </button>

            <div className="ff-logo-group" onClick={onGoBack} style={{ cursor: 'pointer' }}>
              <div className="ff-logo-mark">
                <Receipt size={18} />
              </div>
              <span className="ff-logo-text">
                Fila<span>Flow</span>
              </span>
            </div>
          </div>

          <div className="ff-checkout-security-pill">
            <ShieldCheck size={16} color="#10b981" />
            <span>Ambiente Criptografado SSL 256-bit</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <div className="ff-checkout-container">
        {/* Progress Stepper Bar */}
        <div className="ff-chk-stepper-wrap">
          <div className="ff-chk-step done">
            <div className="ff-chk-step-circle">
              <Check size={15} strokeWidth={3} />
            </div>
            <div className="ff-chk-step-info">
              <span className="ff-chk-step-num">ETAPA 1</span>
              <span className="ff-chk-step-name">Escolha do Plano</span>
            </div>
          </div>

          <div className="ff-chk-step-line done" />

          <div className="ff-chk-step active">
            <div className="ff-chk-step-circle">
              2
            </div>
            <div className="ff-chk-step-info">
              <span className="ff-chk-step-num">ETAPA 2</span>
              <span className="ff-chk-step-name">Identificação & Pagamento</span>
            </div>
          </div>

          <div className="ff-chk-step-line" />

          <div className="ff-chk-step pending">
            <div className="ff-chk-step-circle">
              3
            </div>
            <div className="ff-chk-step-info">
              <span className="ff-chk-step-num">ETAPA 3</span>
              <span className="ff-chk-step-name">Ativação Imediata</span>
            </div>
          </div>
        </div>

        <div className="ff-checkout-grid">
          {/* ========================================================
              LEFT COLUMN: FORM & PAYMENT METHODS
              ======================================================== */}
          <div className="ff-checkout-left-col">
            {/* Quick Demo Data Banner */}
            <div className="ff-demo-banner-box">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#581c87' }}>
                  Modo de Demonstração Interativa
                </div>
                <div style={{ fontSize: 12, color: '#6b21a8', marginTop: 2 }}>
                  Deseja testar sem digitar? Preencha os campos com um clique.
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleFillDemoData} 
                className="ff-demo-fill-btn"
              >
                Preencher Dados de Teste
              </button>
            </div>

            {/* Block 1: Customer & Business Details */}
            <div className="ff-checkout-card">
              <div className="ff-checkout-card-header">
                <div className="ff-checkout-card-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="ff-checkout-card-title">Dados da Empresa & Faturamento</h3>
                  <p className="ff-checkout-card-subtitle">
                    Utilizados para emissão da nota fiscal eletrônica e acesso ao painel
                  </p>
                </div>
              </div>

              <div className="ff-form-grid">
                <div className="ff-form-group span-2">
                  <label className="ff-form-label">Nome Completo do Responsável</label>
                  <div className="ff-input-icon-wrap">
                    <User size={16} className="ff-input-icon" />
                    <input
                      type="text"
                      className="ff-form-input"
                      placeholder="Ex: Dra. Mariana Costa"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="ff-form-group span-2">
                  <label className="ff-form-label">E-mail Corporativo (Login e NF-e)</label>
                  <div className="ff-input-icon-wrap">
                    <Mail size={16} className="ff-input-icon" />
                    <input
                      type="email"
                      className="ff-form-input"
                      placeholder="seu@negocio.com.br"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="ff-form-group">
                  <label className="ff-form-label">Razão Social ou Nome Fantasia</label>
                  <div className="ff-input-icon-wrap">
                    <Building2 size={16} className="ff-input-icon" />
                    <input
                      type="text"
                      className="ff-form-input"
                      placeholder="Clínica / Restaurante"
                      value={customerInfo.companyName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="ff-form-group">
                  <label className="ff-form-label">CNPJ ou CPF</label>
                  <div className="ff-input-icon-wrap">
                    <FileText size={16} className="ff-input-icon" />
                    <input
                      type="text"
                      className="ff-form-input"
                      placeholder="00.000.000/0001-00"
                      value={customerInfo.document}
                      onChange={handleDocumentChange}
                      required
                    />
                  </div>
                </div>

                <div className="ff-form-group span-2">
                  <label className="ff-form-label">WhatsApp / Telefone para Contato</label>
                  <div className="ff-input-icon-wrap">
                    <Phone size={16} className="ff-input-icon" />
                    <input
                      type="text"
                      className="ff-form-input"
                      placeholder="(11) 98765-4321"
                      value={customerInfo.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: Payment Method Choice */}
            <div className="ff-checkout-card">
              <div className="ff-checkout-card-header">
                <div className="ff-checkout-card-icon">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="ff-checkout-card-title">Forma de Pagamento</h3>
                  <p className="ff-checkout-card-subtitle">
                    Escolha a opção mais conveniente para o seu negócio
                  </p>
                </div>
              </div>

              {/* Payment Tabs Switcher */}
              <div className="ff-payment-tabs">
                <button
                  type="button"
                  className={`ff-payment-tab ${paymentMethod === 'pix' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <div className="ff-tab-icon-row">
                    <QrCode size={20} />
                    <span className="ff-tab-title">PIX</span>
                  </div>
                  <span className="ff-tab-tag green">5% OFF • Instantâneo</span>
                </button>

                <button
                  type="button"
                  className={`ff-payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="ff-tab-icon-row">
                    <CreditCard size={20} />
                    <span className="ff-tab-title">Cartão de Crédito</span>
                  </div>
                  <span className="ff-tab-tag purple">Até 12x</span>
                </button>

                <button
                  type="button"
                  className={`ff-payment-tab ${paymentMethod === 'boleto' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('boleto')}
                >
                  <div className="ff-tab-icon-row">
                    <Receipt size={20} />
                    <span className="ff-tab-title">Boleto Bancário</span>
                  </div>
                  <span className="ff-tab-tag gray">1 a 3 dias úteis</span>
                </button>
              </div>

              {/* TAB 1: PIX CONTENT */}
              {paymentMethod === 'pix' && (
                <div className="ff-pix-content">
                  <div className="ff-pix-highlight-strip">
                    <Sparkles size={16} color="#059669" />
                    <span>
                      <strong>Desconto de 5% aplicado:</strong> Pague via Pix e sua fila virtual é ativada em menos de 10 segundos!
                    </span>
                  </div>

                  <div className="ff-pix-qr-section">
                    <div className="ff-pix-qr-box">
                      {/* Styled Dynamic QR Code Canvas/SVG */}
                      <svg
                        className="ff-pix-qr-svg"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Frame */}
                        <rect width="200" height="200" rx="16" fill="white" />
                        {/* Corner Targets */}
                        <rect x="18" y="18" width="46" height="46" rx="8" fill="#0f172a" />
                        <rect x="25" y="25" width="32" height="32" rx="4" fill="white" />
                        <rect x="31" y="31" width="20" height="20" rx="2" fill="#7c3aed" />

                        <rect x="136" y="18" width="46" height="46" rx="8" fill="#0f172a" />
                        <rect x="143" y="25" width="32" height="32" rx="4" fill="white" />
                        <rect x="149" y="31" width="20" height="20" rx="2" fill="#7c3aed" />

                        <rect x="18" y="136" width="46" height="46" rx="8" fill="#0f172a" />
                        <rect x="25" y="143" width="32" height="32" rx="4" fill="white" />
                        <rect x="31" y="149" width="20" height="20" rx="2" fill="#7c3aed" />

                        {/* QR Code Matrix Dots */}
                        <rect x="74" y="24" width="8" height="8" rx="2" fill="#0f172a" />
                        <rect x="88" y="24" width="16" height="8" rx="2" fill="#0f172a" />
                        <rect x="112" y="24" width="8" height="8" rx="2" fill="#0f172a" />

                        <rect x="74" y="40" width="18" height="8" rx="2" fill="#0f172a" />
                        <rect x="100" y="40" width="12" height="8" rx="2" fill="#7c3aed" />
                        <rect x="118" y="40" width="8" height="8" rx="2" fill="#0f172a" />

                        <rect x="74" y="56" width="8" height="14" rx="2" fill="#0f172a" />
                        <rect x="92" y="56" width="14" height="8" rx="2" fill="#0f172a" />
                        <rect x="112" y="56" width="14" height="14" rx="2" fill="#0f172a" />

                        {/* Mid Row */}
                        <rect x="24" y="74" width="14" height="8" rx="2" fill="#0f172a" />
                        <rect x="46" y="74" width="8" height="14" rx="2" fill="#0f172a" />
                        <rect x="74" y="78" width="14" height="8" rx="2" fill="#7c3aed" />
                        <rect x="136" y="74" width="14" height="8" rx="2" fill="#0f172a" />
                        <rect x="158" y="74" width="18" height="8" rx="2" fill="#0f172a" />

                        {/* Center FilaFlow Badge */}
                        <rect x="82" y="82" width="36" height="36" rx="8" fill="#7c3aed" />
                        <path d="M92 94h16M92 100h12M92 106h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />

                        {/* Bottom Row Dots */}
                        <rect x="74" y="130" width="8" height="14" rx="2" fill="#0f172a" />
                        <rect x="90" y="136" width="18" height="8" rx="2" fill="#0f172a" />
                        <rect x="116" y="130" width="8" height="20" rx="2" fill="#7c3aed" />
                        <rect x="136" y="136" width="14" height="8" rx="2" fill="#0f172a" />
                        <rect x="158" y="136" width="8" height="14" rx="2" fill="#0f172a" />

                        <rect x="74" y="160" width="24" height="8" rx="2" fill="#0f172a" />
                        <rect x="106" y="160" width="8" height="14" rx="2" fill="#0f172a" />
                        <rect x="122" y="154" width="14" height="8" rx="2" fill="#0f172a" />
                        <rect x="144" y="160" width="32" height="8" rx="2" fill="#7c3aed" />
                      </svg>

                      {/* Expiration Timer Box */}
                      <div className="ff-pix-timer">
                        <Clock size={13} />
                        <span>Expira em: <strong>{formatTimer(pixTimerSeconds)}</strong></span>
                      </div>
                    </div>

                    {/* Copy Paste Code Box */}
                    <div className="ff-pix-code-wrap">
                      <label className="ff-form-label">Pix Copia e Cola (Chave EMV)</label>
                      <div className="ff-pix-input-group">
                        <input
                          type="text"
                          readOnly
                          value={pixKeyMock}
                          className="ff-pix-code-input"
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleCopyPix}
                          style={{ padding: '10px 16px', gap: 6, flexShrink: 0 }}
                        >
                          {pixCopied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{pixCopied ? 'Copiado!' : 'Copiar Código'}</span>
                        </button>
                      </div>

                      <div className="ff-pix-steps-list">
                        <div className="ff-pix-step">
                          <span className="ff-pix-num">1</span>
                          <span>Abra o app do seu banco ou internet banking</span>
                        </div>
                        <div className="ff-pix-step">
                          <span className="ff-pix-num">2</span>
                          <span>Escolha a opção <strong>Pix com QR Code</strong> ou <strong>Pix Copia e Cola</strong></span>
                        </div>
                        <div className="ff-pix-step">
                          <span className="ff-pix-num">3</span>
                          <span>Confira o beneficiário <strong>FilaFlow Soluções Tecnológicas</strong> e confirme</span>
                        </div>
                      </div>

                      {/* Simulate Payment Confirmation Button */}
                      <button
                        type="button"
                        className="ff-simulate-pix-btn"
                        disabled={isProcessing}
                        onClick={() => handleProcessPayment('pix')}
                      >
                        {isProcessing ? (
                          <div className="ff-btn-spinner" />
                        ) : (
                          <>
                            <Zap size={16} />
                            <span>Simular Confirmação Instantânea de Pagamento Pix</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT CARD CONTENT */}
              {paymentMethod === 'card' && (
                <div className="ff-card-content">
                  {/* Dynamic Interactive Card Preview */}
                  <div 
                    className="ff-interactive-card-preview"
                    style={{ background: cardBrand.gradient }}
                  >
                    <div className="ff-card-top-row">
                      <div className="ff-card-chip">
                        <div className="ff-chip-line" />
                      </div>
                      <span className="ff-card-brand-badge">{cardBrand.name}</span>
                    </div>

                    <div className="ff-card-number-display">
                      {cardData.number || '•••• •••• •••• ••••'}
                    </div>

                    <div className="ff-card-bottom-row">
                      <div>
                        <div className="ff-card-label-mini">TITULAR DO CARTÃO</div>
                        <div className="ff-card-name-display">
                          {cardData.name.toUpperCase() || 'NOME DO TITULAR'}
                        </div>
                      </div>

                      <div>
                        <div className="ff-card-label-mini">VALIDADE</div>
                        <div className="ff-card-expiry-display">
                          {cardData.expiry || 'MM/AA'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="ff-form-grid" style={{ marginTop: 20 }}>
                    <div className="ff-form-group span-2">
                      <label className="ff-form-label">Número do Cartão de Crédito</label>
                      <div className="ff-input-icon-wrap">
                        <CreditCard size={16} className="ff-input-icon" />
                        <input
                          type="text"
                          className="ff-form-input"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={handleCardNumberChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group span-2">
                      <label className="ff-form-label">Nome Impresso no Cartão</label>
                      <div className="ff-input-icon-wrap">
                        <User size={16} className="ff-input-icon" />
                        <input
                          type="text"
                          className="ff-form-input"
                          placeholder="Como está gravado no cartão"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Validade (MM/AA)</label>
                      <div className="ff-input-icon-wrap">
                        <Calendar size={16} className="ff-input-icon" />
                        <input
                          type="text"
                          className="ff-form-input"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={handleCardExpiryChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Código CVV</label>
                      <div className="ff-input-icon-wrap">
                        <Lock size={16} className="ff-input-icon" />
                        <input
                          type="password"
                          maxLength={4}
                          className="ff-form-input"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={handleCardCvvChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group span-2">
                      <label className="ff-form-label">Opções de Parcelamento</label>
                      <select
                        className="ff-form-input ff-form-select"
                        value={cardData.installments}
                        onChange={(e) => setCardData({ ...cardData, installments: e.target.value })}
                      >
                        <option value="1">
                          1x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)} (à vista sem juros)
                        </option>
                        <option value="2">
                          2x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount / 2)} sem juros
                        </option>
                        <option value="3">
                          3x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount / 3)} sem juros
                        </option>
                        <option value="6">
                          6x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount / 6)} sem juros
                        </option>
                        <option value="12">
                          12x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount / 12)} sem juros
                        </option>
                      </select>
                    </div>

                    <div className="ff-form-group span-2" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        id="save-card-check"
                        checked={cardData.saveCard}
                        onChange={(e) => setCardData({ ...cardData, saveCard: e.target.checked })}
                        style={{ accentColor: '#7c3aed', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <label htmlFor="save-card-check" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                        Salvar este cartão de forma segura com criptografia PCI para as renovações automáticas
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: 20, padding: '14px', fontSize: 15, justifyContent: 'center' }}
                    disabled={isProcessing}
                    onClick={() => handleProcessPayment('card')}
                  >
                    {isProcessing ? (
                      <div className="ff-btn-spinner" />
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>
                          Pagar {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)} com Cartão
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: BOLETO CONTENT */}
              {paymentMethod === 'boleto' && (
                <div className="ff-boleto-content">
                  <div className="ff-boleto-notice">
                    <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
                        Prazo de compensação bancária: 1 a 3 dias úteis
                      </div>
                      <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
                        A liberação da sua conta FilaFlow ocorre de forma 100% automática assim que o banco liquidar o pagamento.
                      </div>
                    </div>
                  </div>

                  {/* Boleto Simulation Visual Box */}
                  <div className="ff-boleto-visual-card">
                    <div className="ff-boleto-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Receipt size={18} color="#7c3aed" />
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>Banco FilaFlow S.A.</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#64748b' }}>
                        | 341-7 |
                      </div>
                    </div>

                    <div className="ff-boleto-info-grid">
                      <div>
                        <div className="ff-boleto-lbl">Beneficiário</div>
                        <div className="ff-boleto-val">FilaFlow Soluções Tecnológicas S.A. (51.942.109/0001-88)</div>
                      </div>
                      <div>
                        <div className="ff-boleto-lbl">Vencimento</div>
                        <div className="ff-boleto-val" style={{ color: '#dc2626', fontWeight: 700 }}>
                          Em 3 dias úteis
                        </div>
                      </div>
                      <div>
                        <div className="ff-boleto-lbl">Pagador</div>
                        <div className="ff-boleto-val">{customerInfo.companyName || 'Sua Empresa'}</div>
                      </div>
                      <div>
                        <div className="ff-boleto-lbl">Valor do Documento</div>
                        <div className="ff-boleto-val" style={{ fontWeight: 800, color: '#0f172a' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Barcode Graphic */}
                    <div className="ff-boleto-bars">
                      <div className="ff-mock-barcode" />
                      <div className="ff-boleto-digits">{boletoBarcodeMock}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button
                        type="button"
                        className="btn-outline-purple"
                        style={{ flex: 1, padding: '10px 14px', fontSize: 13, justifyContent: 'center' }}
                        onClick={handleCopyBoleto}
                      >
                        {boletoCopied ? <Check size={15} /> : <Copy size={15} />}
                        <span>{boletoCopied ? 'Linha Copiada!' : 'Copiar Código de Barras'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: 20, padding: '14px', fontSize: 15, justifyContent: 'center' }}
                    disabled={isProcessing}
                    onClick={() => handleProcessPayment('boleto')}
                  >
                    {isProcessing ? (
                      <div className="ff-btn-spinner" />
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Gerar Boleto & Finalizar Pedido</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: ORDER SUMMARY, PLAN SWITCHER & GUARANTEES
              ======================================================== */}
          <div className="ff-checkout-right-col">
            <div className="ff-checkout-summary-card">
              <h3 className="ff-summary-title">Resumo do Pedido</h3>

              {/* Plan Switcher Pills */}
              <div className="ff-plan-switcher">
                <span className="ff-plan-switcher-label">Plano Selecionado:</span>
                <div className="ff-plan-pill-group">
                  {PRICING_PLANS.map((plan) => (
                    <button
                      key={plan.name}
                      type="button"
                      className={`ff-plan-pill ${selectedPlanName === plan.name ? 'active' : ''}`}
                      onClick={() => setSelectedPlanName(plan.name)}
                    >
                      <span>{plan.name}</span>
                      {plan.popular && <span className="ff-pill-mini-badge">Popular</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="ff-billing-switcher">
                <button
                  type="button"
                  className={`ff-cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  className={`ff-cycle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('annual')}
                >
                  <span>Anual</span>
                  <span className="ff-cycle-discount-tag">Economize 20%</span>
                </button>
              </div>

              {/* Plan Card Box */}
              <div className="ff-summary-plan-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="ff-plan-badge-tag">{currentPlan.badge}</span>
                    <h4 className="ff-summary-plan-name">Plano {currentPlan.name}</h4>
                    <p className="ff-summary-plan-desc">{currentPlan.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="ff-summary-price">
                      {billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice}
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      {billingCycle === 'annual' ? '/mês faturado anualmente' : '/mês'}
                    </span>
                  </div>
                </div>

                {/* Plan Features Checklist */}
                <div className="ff-summary-features">
                  {currentPlan.features.slice(0, 4).map((feat, idx) => (
                    <div key={idx} className="ff-feature-item">
                      <Check size={14} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Form */}
              <div className="ff-coupon-box">
                {appliedCoupon ? (
                  <div className="ff-coupon-applied">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={16} color="#059669" />
                      <span style={{ fontWeight: 700, color: '#065f46', fontSize: 13 }}>
                        Cupom {appliedCoupon.code} aplicado ({appliedCoupon.discountPercent}% OFF)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ff-remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="ff-coupon-form">
                    <div className="ff-input-icon-wrap" style={{ flex: 1 }}>
                      <Tag size={15} className="ff-input-icon" />
                      <input
                        type="text"
                        placeholder="Cupom de Desconto (ex: FILA10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="ff-form-input ff-coupon-input"
                      />
                    </div>
                    <button type="submit" className="ff-coupon-submit-btn">
                      Aplicar
                    </button>
                  </form>
                )}
                {couponError && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                    {couponError}
                  </div>
                )}
              </div>

              {/* Price Breakdown Calculation */}
              <div className="ff-price-breakdown">
                <div className="ff-price-row">
                  <span>Subtotal do Plano ({billingCycle === 'annual' ? '12 meses' : '1 mês'})</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      billingCycle === 'annual' ? baseAnnualPerMonth * 12 : baseMonthly
                    )}
                  </span>
                </div>

                {billingCycle === 'annual' && (
                  <div className="ff-price-row discount">
                    <span>Economia do Ciclo Anual (20% OFF)</span>
                    <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(annualSavingsTotal)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="ff-price-row discount">
                    <span>Desconto Cupom ({appliedCoupon.code})</span>
                    <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(couponDiscountAmount)}</span>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className="ff-price-row discount">
                    <span>Desconto Pagamento PIX (5% à vista)</span>
                    <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pixDiscountAmount)}</span>
                  </div>
                )}

                <div className="ff-price-divider" />

                <div className="ff-price-row ff-total-row">
                  <div>
                    <span className="ff-total-label">Total a Pagar Hoje</span>
                    <span className="ff-total-sub">Sem taxas ocultas</span>
                  </div>
                  <div className="ff-total-number">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                  </div>
                </div>
              </div>

              {/* Trust Badges & Guarantee */}
              <div className="ff-checkout-guarantees">
                <div className="ff-guarantee-item">
                  <ShieldCheck size={18} color="#7c3aed" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: 13 }}>
                      Garantia Incondicional de 7 Dias
                    </strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Não gostou? Devolvemos 100% do seu dinheiro sem burocracia.
                    </span>
                  </div>
                </div>

                <div className="ff-guarantee-item">
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: 13 }}>
                      Cancelamento Sem Multa
                    </strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Cancele sua assinatura quando quiser pelo próprio painel.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
