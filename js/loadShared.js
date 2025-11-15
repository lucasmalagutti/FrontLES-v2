// loadShared.js
document.addEventListener('DOMContentLoaded', () => {
    const loadHtml = (url, selector, targetElement) => {
        return fetch(url)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const content = doc.querySelector(selector);
                if (content) {
                    targetElement.appendChild(content);
                }
            })
            .catch(error => console.error(`Erro ao carregar ${url}:`, error));
    };

    const loadComponent = (url, selector, prepend = false) => {
        return fetch(url)
            .then(response => response.text())
            .then(data => {
                // Substituir placeholders de clienteId por 33 para testes
                data = data.replace(/\$\{clienteId\}/g, '33');
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const content = doc.querySelector(selector);
                if (content) {
                    if (prepend) {
                        document.body.prepend(content);
                    } else {
                        document.body.appendChild(content);
                    }
                }
                // Chamar initializeCartFunctionality apenas quando cartOffcanvasContent for carregado
                if (selector === '#cartOffcanvas' && typeof initializeCartFunctionality === 'function') {
                    initializeCartFunctionality();
                }
            })
            .catch(error => console.error(`Erro ao carregar ${url}:`, error));
    };

    const fetches = [
        loadComponent('shared.html', 'header', true),
        loadComponent('shared.html', 'footer'),
        loadComponent('shared.html', '#cartOffcanvas'),
        loadComponent('modals/_loginModel.html', '#loginModal'),
        loadComponent('modals/_chatModal.html', '#chatModal'),
        loadComponent('modals/_chatModal.html', '.chat-btn'), 
        loadComponent('modals/pagAdm/_addEnderecoModal.html', '#addEnderecoModal'),
        loadComponent('modals/pagAdm/_addCartaoModal.html', '#addCartaoModal'),
        loadComponent('modals/pagAdm/_editarDadosModal.html', '#editarDadosModal'),
        loadComponent('modals/pagAdm/_enderecosModal.html', '#enderecosModal'),
        loadComponent('modals/pagAdm/_cartoesModal.html', '#cartoesModal'),
        loadComponent('modals/pagAdm/_editarSenhaModal.html', '#editarSenhaModal'),
        loadComponent('modals/pagAdm/_transacoesModal.html', '#transacoesModal'),
        loadComponent('modals/pagAdm/_confirmExchangeModal.html', '#confirmExchangeModal'),
        loadComponent('modals/solicitarTrocaModal.html', '#solicitarTrocaModal')
    ];

    Promise.all(fetches)
        .then(() => {
            document.dispatchEvent(new Event('sharedContentLoaded'));
        })
        .catch(error => console.error('Erro ao carregar componentes compartilhados:', error));
});
