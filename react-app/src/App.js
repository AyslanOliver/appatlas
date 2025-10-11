import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import NovoPedido from './pages/NovoPedido';
import Produtos from './pages/Produtos';
import Configuracoes from './pages/Configuracoes';
import './styles/custom.css';

function App() {
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Funcionalidade de swipe para mobile
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const diffX = currentX - startX;
      const threshold = 50;

      // Swipe da esquerda para direita (abrir sidebar)
      if (diffX > threshold && startX < 50 && !sidebarToggled) {
        setSidebarToggled(true);
      }
      // Swipe da direita para esquerda (fechar sidebar)
      else if (diffX < -threshold && sidebarToggled) {
        setSidebarToggled(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, sidebarToggled]);

  const handleSidebarToggle = () => {
    setSidebarToggled(!sidebarToggled);
  };

  // Fechar sidebar ao clicar fora (apenas em mobile)
  const handleOverlayClick = () => {
    if (isMobile && sidebarToggled) {
      setSidebarToggled(false);
    }
  };

  return (
    <Router>
      <div id="wrapper">
        <Sidebar isToggled={sidebarToggled} onToggle={handleSidebarToggle} />
        
        {/* Botão mobile flutuante */}
        {isMobile && (
          <button 
            className={`mobile-menu-btn ${sidebarToggled ? 'active' : ''}`}
            onClick={handleSidebarToggle}
            aria-label="Toggle menu"
          >
            <i className={`fas ${sidebarToggled ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        )}
        
        {/* Overlay para mobile */}
        {isMobile && sidebarToggled && (
          <div 
            className="sidebar-overlay" 
            onClick={handleOverlayClick}
          ></div>
        )}
        
        {/* Área de swipe */}
        {isMobile && !sidebarToggled && (
          <div className="swipe-area"></div>
        )}
        
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/novo-pedido" element={<NovoPedido />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;