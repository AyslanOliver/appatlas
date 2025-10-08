// Função para carregar o sidebar
async function loadSidebar() {
    try {
        const response = await fetch('components/sidebar.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.warn('Erro ao carregar sidebar.html, usando fallback:', error);
        // Fallback HTML hardcoded
        return `
        <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
                <div class="sidebar-brand-icon rotate-n-15">
                    <i class="fas fa-pizza-slice"></i>
                </div>
                <div class="sidebar-brand-text mx-3">Pizzaria Atlas</div>
            </a>
            <hr class="sidebar-divider my-0">
            <li class="nav-item active">
                <a class="nav-link" href="index.html">
                    <i class="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <hr class="sidebar-divider">
            <div class="sidebar-heading">Gestão</div>
            <li class="nav-item">
                <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                    <i class="fas fa-fw fa-shopping-cart"></i>
                    <span>Pedidos</span>
                </a>
                <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">
                    <div class="bg-white py-2 collapse-inner rounded">
                        <h6 class="collapse-header">Gerenciar Pedidos:</h6>
                        <a class="collapse-item" href="pedidos.html">Ver Pedidos</a>
                        <a class="collapse-item" href="novo-pedido.html">Novo Pedido</a>
                    </div>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities" aria-expanded="true" aria-controls="collapseUtilities">
                    <i class="fas fa-fw fa-pizza-slice"></i>
                    <span>Produtos</span>
                </a>
                <div id="collapseUtilities" class="collapse" aria-labelledby="headingUtilities" data-parent="#accordionSidebar">
                    <div class="bg-white py-2 collapse-inner rounded">
                        <h6 class="collapse-header">Gerenciar Produtos:</h6>
                        <a class="collapse-item" href="produtos.html">Ver Produtos</a>
                        <a class="collapse-item" href="novo-produto.html">Novo Produto</a>
                    </div>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="clientes.html">
                    <i class="fas fa-fw fa-users"></i>
                    <span>Clientes</span>
                </a>
            </li>
            <hr class="sidebar-divider">
            <div class="sidebar-heading">Relatórios</div>
            <li class="nav-item">
                <a class="nav-link" href="relatorios.html">
                    <i class="fas fa-fw fa-chart-area"></i>
                    <span>Relatórios</span>
                </a>
            </li>
            <hr class="sidebar-divider d-none d-md-block">
            <div class="text-center d-none d-md-inline">
                <button class="rounded-circle border-0" id="sidebarToggle"></button>
            </div>
        </ul>
        `;
    }
}

// Função para marcar o item ativo no menu
function markActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const parentLi = link.closest('.nav-item');
        
        if (href === currentPage) {
            parentLi.classList.add('active');
        } else {
            parentLi.classList.remove('active');
        }
    });
}

// Função para configurar eventos do sidebar usando JavaScript nativo
function setupSidebarEvents() {
    console.log('Configurando eventos do sidebar...');
    
    // Função para alternar o sidebar
    function toggleSidebar() {
        const body = document.body;
        const sidebar = document.querySelector('.sidebar');
        
        if (body && sidebar) {
            body.classList.toggle('sidebar-toggled');
            sidebar.classList.toggle('toggled');
            
            // Fechar menus collapse quando sidebar é fechado
            if (body.classList.contains('sidebar-toggled')) {
                const collapseElements = document.querySelectorAll('.sidebar .collapse.show');
                collapseElements.forEach(collapse => {
                    collapse.classList.remove('show');
                });
            }
        }
    }
    
    // Event listeners para botões de toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleTop = document.getElementById('sidebarToggleTop');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
        console.log('Event listener adicionado ao sidebarToggle');
    }
    
    if (sidebarToggleTop) {
        sidebarToggleTop.addEventListener('click', toggleSidebar);
        console.log('Event listener adicionado ao sidebarToggleTop');
    }
    
    // Event listener para redimensionamento da janela
    window.addEventListener('resize', function() {
        const windowWidth = window.innerWidth;
        const body = document.body;
        const sidebar = document.querySelector('.sidebar');
        
        if (windowWidth < 768) {
            // Fechar menus collapse em telas pequenas
            const collapseElements = document.querySelectorAll('.sidebar .collapse.show');
            collapseElements.forEach(collapse => {
                collapse.classList.remove('show');
            });
        }
        
        if (windowWidth < 480 && sidebar && !sidebar.classList.contains('toggled')) {
            // Auto-toggle sidebar em telas muito pequenas
            body.classList.add('sidebar-toggled');
            sidebar.classList.add('toggled');
            
            const collapseElements = document.querySelectorAll('.sidebar .collapse.show');
            collapseElements.forEach(collapse => {
                collapse.classList.remove('show');
            });
        }
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DEBUG SIDEBAR ===');
    console.log('DOM carregado, iniciando sidebar-loader');
    console.log('Protocolo:', window.location.protocol);
    console.log('Hostname:', window.location.hostname);
    console.log('User Agent:', navigator.userAgent);
    
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        console.log('Container do sidebar encontrado');
        
        // Tentar carregar o sidebar
        loadSidebar()
            .then(html => {
                console.log('Sidebar carregado com sucesso');
                sidebarContainer.innerHTML = html;
                
                // Configurar eventos do sidebar (com fallback para JavaScript nativo)
                setupSidebarEvents();
                
                // Reativar os eventos do Bootstrap se jQuery estiver disponível
                if (typeof $ !== 'undefined') {
                    console.log('jQuery disponível, configurando eventos Bootstrap');
                    // Reativar collapse
                    $('[data-toggle="collapse"]').collapse();
                    
                    // Close any open menu accordions when window is resized below 768px
                    $(window).resize(function() {
                        if ($(window).width() < 768) {
                            $('.sidebar .collapse').collapse('hide');
                        }
                        
                        // Toggle the side navigation when window is resized below 480px
                        if ($(window).width() < 480 && !$('.sidebar').hasClass('toggled')) {
                            $('body').addClass('sidebar-toggled');
                            $('.sidebar').addClass('toggled');
                            $('.sidebar .collapse').collapse('hide');
                        }
                    });
                } else {
                    console.log('jQuery não disponível, usando apenas JavaScript nativo');
                }
                
                // Marcar item ativo
                markActiveNavItem();
                console.log('Sidebar inicializado completamente');
            })
            .catch(error => {
                console.error('Erro ao carregar sidebar:', error);
                // Mesmo com erro, tentar configurar eventos
                setupSidebarEvents();
            });
    } else {
        console.error('Container do sidebar NÃO encontrado!');
    }
    console.log('=== FIM DEBUG SIDEBAR ===');
});