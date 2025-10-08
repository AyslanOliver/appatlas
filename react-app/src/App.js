import React, { useState } from 'react';
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

  const handleSidebarToggle = () => {
    setSidebarToggled(!sidebarToggled);
  };

  return (
    <Router>
      <div id="wrapper">
        <Sidebar />
        
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