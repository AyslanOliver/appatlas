import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isToggled, onToggle }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/' && location.pathname === '/dashboard');
  };

  return (
    <>
      <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isToggled ? 'toggled' : ''}`} 
          id="accordionSidebar">
        
        {/* Sidebar - Brand */}
        <Link to="/" className="sidebar-brand d-flex align-items-center justify-content-center">
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-utensils"></i>
          </div>
          <div className="sidebar-brand-text mx-3">AppAtlas</div>
        </Link>

        {/* Divider */}
        <hr className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className={`nav-item ${isActive('/') || isActive('/dashboard') ? 'active' : ''}`}>
          <Link className="nav-link" to="/dashboard">
            <i className="fas fa-fw fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Pedidos
        </div>

        {/* Nav Item - Novo Pedido */}
        <li className={`nav-item ${isActive('/novo-pedido') ? 'active' : ''}`}>
          <Link className="nav-link" to="/novo-pedido">
            <i className="fas fa-fw fa-plus-circle"></i>
            <span>Novo Pedido</span>
          </Link>
        </li>

        {/* Nav Item - Lista de Pedidos */}
        <li className={`nav-item ${isActive('/pedidos') ? 'active' : ''}`}>
          <Link className="nav-link" to="/pedidos">
            <i className="fas fa-fw fa-list"></i>
            <span>Lista de Pedidos</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Produtos
        </div>

        {/* Nav Item - Produtos */}
        <li className={`nav-item ${isActive('/produtos') ? 'active' : ''}`}>
          <Link className="nav-link" to="/produtos">
            <i className="fas fa-fw fa-pizza-slice"></i>
            <span>Produtos</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Sistema
        </div>

        {/* Nav Item - Configurações */}
        <li className={`nav-item ${isActive('/configuracoes') ? 'active' : ''}`}>
          <Link className="nav-link" to="/configuracoes">
            <i className="fas fa-fw fa-cog"></i>
            <span>Configurações</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider d-none d-md-block" />

        {/* Sidebar Toggler (Sidebar) */}
        <div className="text-center d-none d-md-inline">
          <button 
            className="rounded-circle border-0" 
            id="sidebarToggle"
            onClick={onToggle}
            aria-label="Toggle Sidebar"
            type="button"
          >
            <i className={`fas ${isToggled ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>
        </div>

        {/* Sidebar Toggler for Mobile */}
        <div className="text-center d-md-none">
          <button 
            className="btn btn-link text-white p-2 m-2" 
            onClick={onToggle}
            aria-label="Fechar Sidebar"
            type="button"
          >
            <i className="fas fa-times"></i>
            <span className="ml-2">Fechar</span>
          </button>
        </div>
      </ul>
    </>
  );
};

export default Sidebar;