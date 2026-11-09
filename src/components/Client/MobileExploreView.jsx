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
  QrCode,
  Star,
  MessageCircle,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { AVAILABLE_DEMO_BUSINESSES } from '../../data/mockData';

export default function MobileExploreView({ onSelectBusiness, onOpenQrScanner }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortFilter, setSortFilter] = useState('all'); // 'all' | 'near' | 'fast' | 'top'
  const [joinedToast, setJoinedToast] = useState(null);

  const categories = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'Clínica', label: 'Clínicas', icon: <Stethoscope size={14} />, color: 'peach' },
    { id: 'Laboratório', label: 'Exames', icon: <FlaskConical size={14} />, color: 'mint' },
    { id: 'Restaurante', label: 'Restaurantes', icon: <Utensils size={14} />, color: 'lavender' },
    { id: 'Barbearia', label: 'Barbearias', icon: <Scissors size={14} />, color: 'sky' },
    { id: 'Órgãos Públicos', label: 'Cartórios', icon: <Landmark size={14} />, color: 'amber' }
  ];

  // Distâncias e avaliações simuladas para cada local
  const businessExtraData = {
    'clinica-vida': { distance: '280m', distanceMeters: 280, rating: 4.9, reviews: 194, phone: '5511988881000' },
    'examelab': { distance: '650m', distanceMeters: 650, rating: 4.8, reviews: 142, phone: '5511977772000' },
    'bistro': { distance: '1.2km', distanceMeters: 1200, rating: 4.9, reviews: 310, phone: '5511966663000' },
    'barbearia-elite': { distance: '450m', distanceMeters: 450, rating: 5.0, reviews: 228, phone: '5511955554000' },
    'salao-glam': { distance: '900m', distanceMeters: 900, rating: 4.8, reviews: 115, phone: '5511944445000' },
    'oficina-tech': { distance: '1.8km', distanceMeters: 1800, rating: 4.7, reviews: 88, phone: '5511933336000' },
    'cartorio-central': { distance: '850m', distanceMeters: 850, rating: 4.6, reviews: 420, phone: '5511922227000' }
  };

  let filteredBusinesses = AVAILABLE_DEMO_BUSINESSES.filter((b) => {
    const matchesSearch = 
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || b.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Apply Sort Filters
  if (sortFilter === 'near') {
    filteredBusinesses = [...filteredBusinesses].sort((a, b) => {
      const distA = businessExtraData[a.id]?.distanceMeters || 9999;
      const distB = businessExtraData[b.id]?.distanceMeters || 9999;
      return distA - distB;
    });
  } else if (sortFilter === 'fast') {
    filteredBusinesses = [...filteredBusinesses].sort((a, b) => {
      const waitA = parseInt(a.avgWait) || 99;
      const waitB = parseInt(b.avgWait) || 99;
      return waitA - waitB;
    });
  } else if (sortFilter === 'top') {
    filteredBusinesses = [...filteredBusinesses].sort((a, b) => {
      const rateA = businessExtraData[a.id]?.rating || 4.0;
      const rateB = businessExtraData[b.id]?.rating || 4.0;
      return rateB - rateA;
    });
  }

  const getWaitBadgeInfo = (avgWait) => {
    const min = parseInt(avgWait) || 20;
    if (min <= 15) return { label: `Rápido: ~${avgWait}`, color: 'mint' };
    if (min <= 30) return { label: `Médio: ~${avgWait}`, color: 'amber' };
    return { label: `Intenso: ~${avgWait}`, color: 'peach' };
  };

  const handleOpenWhatsAppContact = (b) => {
    const phone = businessExtraData[b.id]?.phone || '5511987654321';
    const text = encodeURIComponent(`Olá! Gostaria de informações sobre o atendimento e fila da ${b.companyName} (${b.unitName}).`);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
  };

  return (
    <div className="ff-mob-clean-view">
      {/* Toast de Confirmação */}
      {joinedToast && (
        <div style={{
          position: 'sticky',
          top: 10,
          zIndex: 999,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '10px 16px',
          borderRadius: 12,
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
          fontSize: 12.5,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12
        }}>
          <CheckCircle2 size={16} />
          <span>{joinedToast}</span>
        </div>
      )}

      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Descubra</span>
          <h2 className="view-maintitle">Explorar Locais</h2>
        </div>
        <button 
          className="btn-icon-soft" 
          onClick={onOpenQrScanner} 
          title="Ler QR de Totem Presencial"
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
            placeholder="Buscar clínicas, exames, cartórios, restaurantes..."
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

      {/* Category Pills Slider */}
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

      {/* Secondary Sort Filters: Mais Próximos, Menor Fila, Melhor Avaliados */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 4px 8px 4px', scrollbarWidth: 'none' }}>
        {[
          { id: 'all', label: 'Todos os Locais' },
          { id: 'near', label: '📍 Mais Próximos' },
          { id: 'fast', label: '⚡ Menor Espera' },
          { id: 'top', label: '⭐ Mais Bem Avaliados' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSortFilter(f.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: sortFilter === f.id ? 800 : 600,
              border: sortFilter === f.id ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
              background: sortFilter === f.id ? '#f5f3ff' : '#ffffff',
              color: sortFilter === f.id ? '#6d28d9' : '#64748b',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Live Badge Contador */}
      <div className="clean-explore-meta-row" style={{ marginTop: 4 }}>
        <span className="explore-count-text">
          <strong>{filteredBusinesses.length}</strong> estabelecimentos com FilaFlow ativo
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
          const extra = businessExtraData[b.id] || { distance: '500m', rating: 4.8, reviews: 90 };
          return (
            <div key={b.id} className="clean-explore-card">
              <div className="explore-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="clean-chip-badge lavender">{b.category}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      {extra.rating} <small style={{ color: '#94a3b8', fontWeight: 500 }}>({extra.reviews})</small>
                    </span>
                  </div>
                  <h3 className="biz-clean-title">{b.companyName}</h3>
                  <div className="biz-clean-location">
                    <Navigation size={11} color="#6366f1" />
                    <span style={{ color: '#4f46e5', fontWeight: 700 }}>{extra.distance}</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span>{b.address}</span>
                  </div>
                </div>

                <div className={`biz-clean-wait-pill ${wait.color}`}>
                  <Clock size={12} />
                  <span>{wait.label}</span>
                </div>
              </div>

              {/* Tags de Serviços */}
              <div className="biz-clean-services-box">
                <span className="services-box-title">Especialidades & Atendimentos:</span>
                <div className="services-chips-wrap">
                  {b.services.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="clean-service-tag">{s}</span>
                  ))}
                  {b.services.length > 2 && (
                    <span className="clean-service-tag more">+{b.services.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Rodapé do Card com Ações */}
              <div className="explore-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div className="biz-queue-count">
                  <div className="icon-squircle mini mint">
                    <Users size={13} />
                  </div>
                  <div>
                    <strong>{b.currentWaiting} na fila</strong>
                    <span>Próxima: #{b.nextTicket}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* WhatsApp Direct Contact Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWhatsAppContact(b);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#ecfdf5',
                      border: '1.5px solid #a7f3d0',
                      color: '#059669',
                      padding: '7px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="Conversar e tirar dúvidas no WhatsApp"
                  >
                    <MessageCircle size={14} color="#10b981" />
                    <span>Whats</span>
                  </button>

                  {/* Primary Enter Queue Button */}
                  <button 
                    className="clean-pill-btn primary"
                    onClick={() => {
                      if (onSelectBusiness) {
                        onSelectBusiness(b);
                      }
                    }}
                    style={{ padding: '7px 14px' }}
                  >
                    <span>Pegar Senha</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
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
