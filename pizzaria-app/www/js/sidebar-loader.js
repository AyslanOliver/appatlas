// Script para carregar o sidebar dinamicamente

// Função para carregar o sidebar de forma compatível com Cordova
async function loadSidebar() {
    try {
        const response = await fetch('components/sidebar.html');
        if (!response.ok) {
            throw new Error('Erro ao carregar sidebar');
        }
        return await response.text();
    } catch (error) {
        console.error('Erro ao carregar sidebar via fetch, tentando método alternativo:', error);
        
        // Fallback: retornar HTML do sidebar diretamente
        return `
<!-- Sidebar -->
<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
    <!-- Sidebar - Brand -->
    <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
        <div class="sidebar-brand-icon rotate-n-15">
            <i class="fas fa-pizza-slice"></i>
        </div>
        <div class="sidebar-brand-text mx-3">Pizzaria Atlas</div>
    </a>

    <!-- Divider -->
    <hr class="sidebar-divider my-0">

    <!-- Nav Item - Dashboard -->
    <li class="nav-item">
        <a class="nav-link" href="index.html">
            <i class="fas fa-fw fa-tachometer-alt"></i>
            <span>Dashboard</span>
        </a>
    </li>

    <!-- Divider -->
    <hr class="sidebar-divider">

    <!-- Heading -->
    <div class="sidebar-heading">
        Pedidos
    </div>

    <!-- Nav Item - Novo Pedido -->
    <li class="nav-item">
        <a class="nav-link" href="novo-pedido.html">
            <i class="fas fa-fw fa-plus"></i>
            <span>Novo Pedido</span>
        </a>
    </li>

    <!-- Nav Item - Lista de Pedidos -->
    <li class="nav-item">
        <a class="nav-link" href="lista-pedidos.html">
            <i class="fas fa-fw fa-list"></i>
            <span>Lista de Pedidos</span>
        </a>
    </li>

    <!-- Divider -->
    <hr class="sidebar-divider">

    <!-- Heading -->
    <div class="sidebar-heading">
        Gestão
    </div>

    <!-- Nav Item - Produtos -->
    <li class="nav-item">
        <a class="nav-link" href="produtos.html">
            <i class="fas fa-fw fa-box"></i>
            <span>Produtos</span>
        </a>
    </li>

    <!-- Nav Item - Configurações -->
    <li class="nav-item">
        <a class="nav-link" href="configuracoes.html">
            <i class="fas fa-fw fa-cog"></i>
            <span>Configurações</span>
        </a>
    </li>

    <!-- Divider -->
    <hr class="sidebar-divider d-none d-md-block">

    <!-- Sidebar Toggler (Sidebar) -->
    <div class="text-center d-none d-md-inline">
        <button class="rounded-circle border-0" id="sidebarToggle"></button>
    </div>
</ul>
        `;
    }
}

// Função para configurar eventos do sidebar com JavaScript nativo
function setupSidebarEvents() {
    console.log('Configurando eventos do sidebar...');
    
    // Encontrar botões de toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleTop = document.getElementById('sidebarToggleTop');
    
    // Função para toggle do sidebar
    function toggleSidebar(e) {
        e.preventDefault();
        console.log('Toggle sidebar clicado');
        
        const body = document.body;
        const sidebar = document.querySelector('.sidebar');
        
        if (body && sidebar) {
            body.classList.toggle('sidebar-toggled');
            sidebar.classList.toggle('toggled');
            
            // Fechar menus collapse se sidebar for fechado
            if (sidebar.classList.contains('toggled')) {
                const collapseElements = sidebar.querySelectorAll('.collapse.show');
                collapseElements.forEach(element => {
                    element.classList.remove('show');
                });
            }
            
            console.log('Sidebar toggled. Classes:', {
                body: body.className,
                sidebar: sidebar.className
            });
        }
    }
    
    // Adicionar eventos aos botões
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
        console.log('Evento adicionado ao sidebarToggle');
    }
    
    if (sidebarToggleTop) {
        sidebarToggleTop.addEventListener('click', toggleSidebar);
        console.log('Evento adicionado ao sidebarToggleTop');
    }
    
    // Adicionar eventos de redimensionamento
    window.addEventListener('resize', function() {
        const windowWidth = window.innerWidth;
        const body = document.body;
        const sidebar = document.querySelector('.sidebar');
        
        if (windowWidth < 768) {
            // Fechar menus collapse em telas pequenas
            const collapseElements = document.querySelectorAll('.sidebar .collapse.show');
            collapseElements.forEach(element => {
                element.classList.remove('show');
            });
        }
        
        // Auto-toggle em telas muito pequenas
        if (windowWidth < 480 && sidebar && !sidebar.classList.contains('toggled')) {
            body.classList.add('sidebar-toggled');
            sidebar.classList.add('toggled');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        // Tentar carregar o sidebar
        loadSidebar()
            .then(html => {
                sidebarContainer.innerHTML = html;
                
                // Configurar eventos do sidebar (com fallback para JavaScript nativo)
                setupSidebarEvents();
                
                // Reativar os eventos do Bootstrap se jQuery estiver disponível
                if (typeof $ !== 'undefined') {
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
                }
                
                // Marcar item ativo baseado na URL atual
                const currentPage = window.location.pathname.split('/').pop();
                const navLinks = document.querySelectorAll('.sidebar .nav-link');
                
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href === currentPage) {
                        link.closest('.nav-item').classList.add('active');
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao carregar sidebar:', error);
            });
    }
});