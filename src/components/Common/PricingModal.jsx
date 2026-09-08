import React, { useState } from 'react';
import { X, Check, Sparkles, Building2, Zap, Shield } from 'lucide-react';
import { PRICING_PLANS } from '../../data/mockData';

export default function PricingModal({ isOpen, onClose, onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  if (!isOpen) return null;

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div 
        className="ff-modal-dialog" 
        style={{ maxWidth: 840, width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header">
          <div>
            <h3 className="ff-modal-title">Planos Transparentes para o seu Negócio</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Cancele quando quiser • 14 dias de teste grátis sem cartão de crédito
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ color: '#64748b', padding: 6, borderRadius: 8, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 28px' }}>
          {/* Billing Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              background: '#f1f5f9', 
              padding: 4, 
              borderRadius: 999,
              border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '6px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  background: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'monthly' ? '#7c3aed' : '#64748b',
                  boxShadow: billingCycle === 'monthly' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '6px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  background: billingCycle === 'annual' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'annual' ? '#7c3aed' : '#64748b',
                  boxShadow: billingCycle === 'annual' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>Anual</span>
                <span style={{ 
                  background: '#dcfce7', 
                  color: '#15803d', 
                  fontSize: 10, 
                  fontWeight: 800, 
                  padding: '2px 6px', 
                  borderRadius: 999 
                }}>
                  Economize 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 20
          }}>
            {PRICING_PLANS.map((plan, idx) => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              const isPopular = plan.popular;

              return (
                <div 
                  key={idx}
                  style={{
                    background: isPopular ? 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)' : '#ffffff',
                    border: isPopular ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: isPopular ? '0 10px 25px -5px rgba(124, 58, 237, 0.15)' : 'none'
                  }}
                >
                  {isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      Mais Popular
                    </div>
                  )}

                  <div style={{ marginBottom: 14 }}>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      color: isPopular ? '#7c3aed' : '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {plan.badge}
                    </span>
                    <h4 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {plan.name}
                    </h4>
                    <p style={{ fontSize: 12, color: '#64748b', minHeight: 36 }}>
                      {plan.desc}
                    </p>
                  </div>

                  <div style={{ margin: '12px 0 18px' }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#0f172a' }}>
                      {price}
                    </span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{plan.period}</span>
                  </div>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      background: isPopular ? '#7c3aed' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      transition: 'all 0.2s',
                      marginBottom: 20
                    }}
                  >
                    {plan.cta}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#334155' }}>
                        <div style={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          background: isPopular ? '#ede9fe' : '#f1f5f9',
                          color: isPopular ? '#7c3aed' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
