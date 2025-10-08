import React, { useState } from 'react';

const Topbar = ({ onSidebarToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // Implementar lógica de busca aqui
        console.log('Buscando por:', searchTerm);
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* Sidebar Toggle (Topbar) */}
            <button 
                id="sidebarToggleTop" 
                className="btn btn-link d-md-none rounded-circle mr-3"
                onClick={onSidebarToggle}
            >
                <i className="fa fa-bars"></i>
            </button>

            {/* Topbar Search */}
            <form 
                className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"
                onSubmit={handleSearch}
            >
                <div className="input-group">
                    <input 
                        type="text" 
                        className="form-control bg-light border-0 small" 
                        placeholder="Buscar pedido..."
                        aria-label="Search" 
                        aria-describedby="basic-addon2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                            <i className="fas fa-search fa-sm"></i>
                        </button>
                    </div>
                </div>
            </form>

            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
                {/* Nav Item - Alerts */}
                <li className="nav-item dropdown no-arrow mx-1">
                    <button 
                        className="nav-link dropdown-toggle btn btn-link" 
                        id="alertsDropdown" 
                        type="button"
                        data-toggle="dropdown" 
                        aria-haspopup="true" 
                        aria-expanded="false"
                        style={{ border: 'none', background: 'none' }}
                    >
                        <i className="fas fa-bell fa-fw"></i>
                        {/* Counter - Alerts */}
                        <span className="badge badge-danger badge-counter">3+</span>
                    </button>
                    {/* Dropdown - Alerts */}
                    <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
                         aria-labelledby="alertsDropdown">
                        <h6 className="dropdown-header">
                            Notificações
                        </h6>
                        <button className="dropdown-item d-flex align-items-center" type="button">
                            <div className="mr-3">
                                <div className="icon-circle bg-primary">
                                    <i className="fas fa-file-alt text-white"></i>
                                </div>
                            </div>
                            <div>
                                <div className="small text-gray-500">12 de Dezembro, 2023</div>
                                <span className="font-weight-bold">Novo pedido recebido!</span>
                            </div>
                        </button>
                        <button className="dropdown-item text-center small text-gray-500" type="button">
                            Ver todas as notificações
                        </button>
                    </div>
                </li>

                {/* Nav Item - User Information */}
                <li className="nav-item dropdown no-arrow">
                    <button 
                        className="nav-link dropdown-toggle btn btn-link" 
                        id="userDropdown" 
                        type="button"
                        data-toggle="dropdown" 
                        aria-haspopup="true" 
                        aria-expanded="false"
                        style={{ border: 'none', background: 'none' }}
                    >
                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                        <i className="fas fa-user-circle fa-fw"></i>
                    </button>
                    {/* Dropdown - User Information */}
                    <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                         aria-labelledby="userDropdown">
                        <button className="dropdown-item" type="button">
                            <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                            Perfil
                        </button>
                        <button className="dropdown-item" type="button">
                            <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                            Configurações
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" type="button">
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                            Sair
                        </button>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default Topbar;