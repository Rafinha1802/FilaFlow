import React, { useState } from 'react';
import { X, Search, Sparkles, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { AVAILABLE_DEMO_BUSINESSES } from '../../data/mockData';

export default function QueueSearchModal({
  isOpen,
  onClose,
  onSelectBusiness
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  if (!isOpen) return null;

  const categories = ['Todas', 'Clínica', 'Restaurante', 'Barbearia', 'Salão', 'Laboratório', 'Oficina', 'Órgãos Públicos'];

  const filteredBusinesses = AVAILABLE_DEMO_BUSINESSES.filter((biz) => {
    const matchesSearch = 
      biz.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCategory === 'Todas' || biz.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div 
        className="ff-modal-dialog" 
        style={{ maxWidth: 540, width: '94%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Search size={16} />
            </div>
            <div>
              <h3 className="ff-modal-title">Explorar Filas Próximas</h3>
              <p style={{ fontSize: 12, color: '#64748b' }}>
                Entre em filas virtuais à distância ou no caminho
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Search Input */}
          <div className="ff-input-wrapper" style={{ marginBottom: 12 }}>
            <Search size={16} className="ff-input-icon" />
            <input
              type="text"
              className="ff-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar clínica, restaurante, barbearia, cartório..."
              autoFocus
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ 
            display: 'flex', 
            gap: 6, 
            overflowX: 'auto', 
            paddingBottom: 8,
            marginBottom: 14,
            scrollbarWidth: 'none'
          }}>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: selectedCategory === cat ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                  background: selectedCategory === cat ? '#faf5ff' : '#ffffff',
                  color: selectedCategory === cat ? '#7c3aed' : '#64748b',
                  transition: 'all 0.18s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {filteredBusinesses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b' }}>
                Nenhum estabelecimento encontrado para "{searchTerm}".
              </div>
            ) : (
              filteredBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectBusiness(biz)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                        {biz.companyName}
                      </h4>
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        color: '#6d28d9', 
                        background: '#ede9fe', 
                        padding: '2px 6px', 
                        borderRadius: 4 
                      }}>
                        {biz.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      <MapPin size={12} />
                      <span>{biz.address || biz.unitName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#475569', marginTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} color="#b45309" />
                        <span style={{ fontWeight: 700, color: '#b45309' }}>Espera: ~{biz.avgWait}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={12} />
                        <span>{biz.currentWaiting} pessoas na fila</span>
                      </div>
                    </div>
                  </div>

                  <button
                    style={{
                      padding: '8px 14px',
                      background: '#7c3aed',
                      color: 'white',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0
                    }}
                  >
                    <span>Entrar</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
