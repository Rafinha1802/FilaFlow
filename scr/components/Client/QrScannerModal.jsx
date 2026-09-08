import React from 'react';
import { X, QrCode, Sparkles, Building2, Camera } from 'lucide-react';
import { AVAILABLE_DEMO_BUSINESSES } from '../../data/mockData';

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanBusiness
}) {
  if (!isOpen) return null;

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div 
        className="ff-modal-dialog" 
        style={{ maxWidth: 440, width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              background: '#ede9fe', 
              color: '#7c3aed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Camera size={18} />
            </div>
            <h3 className="ff-modal-title">Escanear QR Code do Balcão</h3>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="ff-camera-viewfinder">
          {/* Animated Laser Line */}
          <div className="ff-scanner-laser"></div>

          {/* Reticle Focus Box */}
          <div className="ff-scanner-reticle">
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center'
            }}>
              <QrCode size={48} strokeWidth={1.5} />
            </div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}>
            Aponte para o totem de atendimento presencial
          </div>
        </div>

        {/* Selection of available balcão QR Codes */}
        <div className="ff-modal-body">
          <div style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            color: '#64748b', 
            textTransform: 'uppercase', 
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Sparkles size={13} color="#7c3aed" />
            <span>Ou escolha um totem para simular a leitura:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {AVAILABLE_DEMO_BUSINESSES.map((biz) => (
              <div
                key={biz.id}
                onClick={() => onScanBusiness(biz)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.background = '#faf5ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed'
                  }}>
                    <QrCode size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      {biz.companyName}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {biz.unitName} • {biz.category}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: '#b45309', 
                    background: '#fef3c7', 
                    padding: '2px 8px', 
                    borderRadius: 999 
                  }}>
                    ~{biz.avgWait}
                  </span>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    {biz.currentWaiting} na fila
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
