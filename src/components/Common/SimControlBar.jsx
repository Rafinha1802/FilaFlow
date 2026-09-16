import React, { useState } from 'react';
import { 
  Play, 
  AlertTriangle, 
  Sparkles, 
  Smartphone, 
  Building2, 
  Globe, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sliders,
  LogIn,
  CreditCard
} from 'lucide-react';

export default function SimControlBar({
  currentView,
  setCurrentView,
  onNextTicket,
  onSimulateDelay,
  onToggleConflict,
  onResetQueues,
  onOpenAuth
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="ff-sim-widget-root">
      {/* Minimized Floating Trigger Button */}
      {!isExpanded ? (
        <button
          className="ff-sim-trigger-btn"
          onClick={() => setIsExpanded(true)}
          title="Abrir painel de testes do simulador de IA"
        >
          <span className="ff-sim-trigger-dot" />
          <Sparkles size={15} />
          <span>Simulador & Testes Live</span>
          <ChevronUp size={14} />
        </button>
      ) : (
        /* Expanded Floating Card */
        <div className="ff-sim-expanded-card">
          {/* Header */}
          <div className="ff-sim-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#34d399" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
                Simulador de Eventos Live
              </span>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: 6,
                padding: '3px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Minimizar painel de simulação"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Dispare ações para observar o recálculo da IA e os alertas sincronizados no celular do cliente.
          </p>

          {/* Trigger Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <button
              className="ff-sim-action-btn green"
              onClick={onNextTicket}
              title="Chama a próxima senha na empresa e alerta o cliente"
            >
              <Play size={12} fill="white" />
              <span>Chamar Próximo</span>
            </button>

            <button
              className="ff-sim-action-btn amber"
              onClick={onSimulateDelay}
              title="Acrescenta atraso na sala para a IA recalcular a previsão"
            >
              <AlertTriangle size={12} />
              <span>+5m Atraso IA</span>
            </button>

            <button
              className="ff-sim-action-btn purple"
              onClick={onToggleConflict}
              title="Gera ou remove choque de horário entre múltiplas filas"
            >
              <span>⚡ Conflito Filas</span>
            </button>

            <button
              className="ff-sim-action-btn gray"
              onClick={onResetQueues}
              title="Restaura os dados originais da demonstração"
            >
              <RotateCcw size={12} />
              <span>Resetar Demo</span>
            </button>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0 10px' }} />

          {/* Direct Navigation Links */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
            Atalhos Diretos de Navegação:
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className={`ff-sim-nav-btn ${currentView === 'landing' ? 'active' : ''}`}
              onClick={() => setCurrentView('landing')}
            >
              <Globe size={12} />
              <span>Site</span>
            </button>

            <button
              className={`ff-sim-nav-btn ${currentView === 'company-auth' ? 'active' : ''}`}
              onClick={() => onOpenAuth ? onOpenAuth('login') : setCurrentView('company-auth')}
            >
              <LogIn size={12} />
              <span>Login/Cadastro</span>
            </button>

            <button
              className={`ff-sim-nav-btn ${currentView === 'client-mobile' ? 'active' : ''}`}
              onClick={() => setCurrentView('client-mobile')}
            >
              <Smartphone size={12} />
              <span>Celular</span>
            </button>

            <button
              className={`ff-sim-nav-btn ${currentView === 'professional' ? 'active' : ''}`}
              onClick={() => setCurrentView('professional')}
              style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}
            >
              <span>🩺 Consultório</span>
            </button>

            <button
              className={`ff-sim-nav-btn ${currentView === 'company-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('company-dashboard')}
            >
              <Building2 size={12} />
              <span>Painel B2B</span>
            </button>

            <button
              className={`ff-sim-nav-btn ${currentView === 'checkout' ? 'active' : ''}`}
              onClick={() => setCurrentView('checkout')}
            >
              <CreditCard size={12} />
              <span>Pagamento</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
