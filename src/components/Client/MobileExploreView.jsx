import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Filter,
  Stethoscope,
  Utensils,
  Scissors,
  FlaskConical,
  Landmark,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { AVAILABLE_DEMO_BUSINESSES } from '../../data/mockData';

export default function MobileExploreView({ onSelectBusiness, onOpenQrScanner }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'Clínica', label: 'Clínicas', icon: <Stethoscope size={13} /> },
    { id: 'Laboratório', label: 'Laboratórios', icon: <FlaskConical size={13} /> },
    { id: 'Restaurante', label: 'Restaurantes', icon: <Utensils size={13} /> },
    { id: 'Barbearia', label: 'Barbearias', icon: <Scissors size={13} /> },
    { id: 'Órgãos Públicos', label: 'Cartórios & Órgãos', icon: <Landmark size={13} /> }
  ];

  const filteredBusinesses = AVAILABLE_DEMO_BUSINESSES.filter((b) => {
    const matchesSearch = 
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || b.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getWaitBadgeClass = (avgWait) => {
    const min = parseInt(avgWait) || 20;
    if (min <= 15) return 'quick';
    if (min <= 30) return 'moderate';
    return 'busy';
  };

  return (
    <div className="ff-mob-explore-view">
      {/* Search Bar */}
      <div className="ff-mob-search-container">
        <div className="ff-mob-search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar clínicas, cartórios, restaurantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ff-mob-search-input"
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="ff-mob-category-slider">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon && <span className="cat-icon">{cat.icon}</span>}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="explore-results-header">
        <span>{filteredBusinesses.length} estabelecimentos com fila inteligente</span>
        <span className="live-badge">
          <span className="live-dot"></span> Ao vivo
        </span>
      </div>

      {/* Business Cards List */}
      <div className="explore-business-list">
        {filteredBusinesses.map((b) => {
          const waitClass = getWaitBadgeClass(b.avgWait);
          return (
            <div key={b.id} className="explore-business-card">
              <div className="biz-card-top">
                <div>
                  <span className="biz-category-badge">{b.category}</span>
                  <h4 className="biz-name">{b.companyName}</h4>
                  <div className="biz-address">
                    <MapPin size={11} />
                    <span>{b.address} • {b.unitName}</span>
                  </div>
                </div>

                <div className={`biz-wait-pill ${waitClass}`}>
                  <Clock size={12} />
                  <span>~{b.avgWait}</span>
                </div>
              </div>

              <div className="biz-services-preview">
                <div className="services-title">Procedimentos / Atendimentos:</div>
                <div className="services-tags">
                  {b.services.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="service-tag-chip">{s}</span>
                  ))}
                  {b.services.length > 2 && (
                    <span className="service-tag-chip more">+{b.services.length - 2} mais</span>
                  )}
                </div>
              </div>

              <div className="biz-card-bottom">
                <div className="biz-queue-stats">
                  <Users size={13} color="#64748b" />
                  <span>{b.currentWaiting} aguardando • Próxima: #{b.nextTicket}</span>
                </div>

                <button 
                  className="biz-enter-btn"
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
          <div className="ff-mob-empty-queues">
            <Search size={32} color="#94a3b8" />
            <h4>Nenhum local encontrado</h4>
            <p>Tente buscar por outro termo ou selecione a categoria "Todos".</p>
          </div>
        )}
      </div>
    </div>
  );
}
