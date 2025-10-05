// Script para carregar o sidebar dinamicamente
document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        fetch('components/sidebar.html')
            .then(response => response.text())
            .then(html => {
                sidebarContainer.innerHTML = html;
                
                // Reativar os eventos do Bootstrap após carregar o sidebar
                if (typeof $ !== 'undefined') {
                    // Reativar collapse
                    $('[data-toggle="collapse"]').collapse();
                    
                    // Sidebar toggle
                    $('#sidebarToggle, #sidebarToggleTop').on('click', function(e) {
                        $('body').toggleClass('sidebar-toggled');
                        $('.sidebar').toggleClass('toggled');
                        if ($('.sidebar').hasClass('toggled')) {
                            $('.sidebar .collapse').collapse('hide');
                        }
                    });
                    
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