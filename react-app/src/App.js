import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
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
        
        {/* Overlay para mobile */}
        {isMobile && sidebarToggled && (
          <div 
            className="sidebar-overlay" 
            onClick={handleOverlayClick}
          ></div>
        )}
        
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Topbar onSidebarToggle={handleSidebarToggle} />
            
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