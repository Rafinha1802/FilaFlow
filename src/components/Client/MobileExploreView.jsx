import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Stethoscope,
  Utensils,
  Scissors,
  FlaskConical,
  Landmark,
  ChevronRight,
  QrCode
} from 'lucide-react';
import { AVAILABLE_DEMO_BUSINESSES } from '../../data/mockData';

export default function MobileExploreView({ onSelectBusiness, onOpenQrScanner }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'Clínica', label: 'Clínicas', icon: <Stethoscope size={14} />, color: 'peach' },
    { id: 'Laboratório', label: 'Exames', icon: <FlaskConical size={14} />, color: 'mint' },
    { id: 'Restaurante', label: 'Restaurantes', icon: <Utensils size={14} />, color: 'lavender' },
    { id: 'Barbearia', label: 'Barbearias', icon: <Scissors size={14} />, color: 'sky' },
    { id: 'Órgãos Públicos', label: 'Cartórios', icon: <Landmark size={14} />, color: 'amber' }
  ];

  const filteredBusinesses = AVAILABLE_DEMO_BUSINESSES.filter((b) => {
    const matchesSearch = 
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || b.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getWaitBadgeInfo = (avgWait) => {
    const min = parseInt(avgWait) || 20;
    if (min <= 15) return { label: `Rápido: ~${avgWait}`, color: 'mint' };
    if (min <= 30) return { label: `Médio: ~${avgWait}`, color: 'amber' };
    return { label: `Intenso: ~${avgWait}`, color: 'peach' };
  };

  return (
    <div className="ff-mob-clean-view">
      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Descubra</span>
          <h2 className="view-maintitle">Explorar Locais</h2>
        </div>
        <button 
          className="btn-icon-soft" 
          onClick={onOpenQrScanner} 
          title="Ler QR de Totem"
        >
          <QrCode size={18} />
        </button>
      </div>

      {/* Search Input em Pílula Macia */}
      <div className="clean-search-wrap">
        <div className="clean-search-inner">
          <Search size={18} className="search-icon-soft" />
          <input
            type="text"
            placeholder="Buscar clínicas, exames, cartórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="clean-search-input"
          />
          {searchTerm && (
            <button className="search-clear-clean" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider estilo Screen 2 */}
      <div className="clean-categories-slider">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-pill-item ${isActive ? 'active' : ''} ${cat.color || 'neutral'}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon && <span className="cat-pill-icon">{cat.icon}</span>}
              <span className="cat-pill-label">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Badge Contador */}
      <div className="clean-explore-meta-row">
        <span className="explore-count-text">
          <strong>{filteredBusinesses.length}</strong> locais com fila inteligente
        </span>
        <div className="live-pill-tag">
          <span className="live-dot-pulse"></span>
          <span>Tempo Real</span>
        </div>
      </div>

      {/* Lista de Estabelecimentos em Cards Pastéis */}
      <div className="clean-explore-list">
        {filteredBusinesses.map((b) => {
          const wait = getWaitBadgeInfo(b.avgWait);
          return (
            <div key={b.id} className="clean-explore-card">
              <div className="explore-card-header">
                <div>
                  <span className="clean-chip-badge lavender">{b.category}</span>
                  <h3 className="biz-clean-title">{b.companyName}</h3>
                  <div className="biz-clean-location">
                    <MapPin size={12} />
                    <span>{b.address} • {b.unitName}</span>
                  </div>
                </div>

                <div className={`biz-clean-wait-pill ${wait.color}`}>
                  <Clock size={12} />
                  <span>{wait.label}</span>
                </div>
              </div>

              {/* Tags de Serviços */}
              <div className="biz-clean-services-box">
                <span className="services-box-title">Especialidades & Exames:</span>
                <div className="services-chips-wrap">
                  {b.services.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="clean-service-tag">{s}</span>
                  ))}
                  {b.services.length > 2 && (
                    <span className="clean-service-tag more">+{b.services.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="explore-card-footer">
                <div className="biz-queue-count">
                  <div className="icon-squircle mini mint">
                    <Users size={13} />
                  </div>
                  <div>
                    <strong>{b.currentWaiting} na fila</strong>
                    <span>Próxima: #{b.nextTicket}</span>
                  </div>
                </div>

                <button 
                  className="clean-pill-btn primary"
                  onClick={() => onSelectBusiness(b)}
                >
                  <span>Pegar Senha</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredBusinesses.length === 0 && (
          <div className="clean-empty-state-card">
            <div className="empty-state-squircle peach">
              <Search size={32} />
            </div>
            <h4 className="empty-state-title">Nenhum local encontrado</h4>
            <p className="empty-state-sub">
              Tente buscar por outro termo ou clique na categoria "Todos".
            </p>
            <button 
              className="clean-pill-btn soft" 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
