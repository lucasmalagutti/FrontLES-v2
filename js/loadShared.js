// loadShared.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('shared.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const sharedDoc = parser.parseFromString(data, 'text/html');

            const headerContent = sharedDoc.querySelector('header');
            const footerContent = sharedDoc.querySelector('footer');
            const cartOffcanvasContent = sharedDoc.querySelector('#cartOffcanvas');

            if (headerContent) {
                const headerPlaceholder = document.createElement('div');
                headerPlaceholder.id = 'header-placeholder';
                document.body.prepend(headerPlaceholder);
                headerPlaceholder.replaceWith(headerContent);
            }
            if (footerContent) {
                const footerPlaceholder = document.createElement('div');
                footerPlaceholder.id = 'footer-placeholder';
                document.body.appendChild(footerPlaceholder);
                footerPlaceholder.replaceWith(footerContent);
            }
            if (cartOffcanvasContent) {
                document.body.appendChild(cartOffcanvasContent);
                if (typeof initializeCartFunctionality === 'function') {
                    initializeCartFunctionality();
                }
            }
        })
        .catch(error => console.error('Erro ao carregar shared.html:', error));

    // Carregar o modal de login
    fetch('modals/_loginModel.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const loginModalDoc = parser.parseFromString(data, 'text/html');
            const loginModalContent = loginModalDoc.querySelector('#loginModal');

            if (loginModalContent) {
                document.body.appendChild(loginModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/_loginModel.html:', error));

    // Carregar o modal de chat
    fetch('modals/_chatModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const chatModalDoc = parser.parseFromString(data, 'text/html');
            const chatModalContent = chatModalDoc.querySelector('#chatModal');

            // O botão do chat também está no _chatModal.html, então o container deve ser o body
            const chatButtonContent = chatModalDoc.querySelector('.chat-btn');

            if (chatModalContent) {
                document.body.appendChild(chatModalContent);
            }
            if (chatButtonContent) {
                document.body.appendChild(chatButtonContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/_chatModal.html:', error));

    // Carregar o modal de adicionar endereço
    fetch('modals/pagAdm/_addEnderecoModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const addEnderecoModalDoc = parser.parseFromString(data, 'text/html');
            const addEnderecoModalContent = addEnderecoModalDoc.querySelector('#addEnderecoModal');

            if (addEnderecoModalContent) {
                document.body.appendChild(addEnderecoModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/pagAdm/_addEnderecoModal.html:', error));

    // Carregar o modal de adicionar cartão
    fetch('modals/pagAdm/_addCartaoModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const addCartaoModalDoc = parser.parseFromString(data, 'text/html');
            const addCartaoModalContent = addCartaoModalDoc.querySelector('#addCartaoModal');

            if (addCartaoModalContent) {
                document.body.appendChild(addCartaoModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/pagAdm/_addCartaoModal.html:', error));

    // Carregar o modal de editar dados do cliente
    fetch('modals/pagAdm/_editarDadosModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const editarDadosModalDoc = parser.parseFromString(data, 'text/html');
            const editarDadosModalContent = editarDadosModalDoc.querySelector('#editarDadosModal');

            if (editarDadosModalContent) {
                document.body.appendChild(editarDadosModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/pagAdm/_editarDadosModal.html:', error));

    // Carregar o modal de endereços
    fetch('modals/pagAdm/_enderecosModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const enderecosModalDoc = parser.parseFromString(data, 'text/html');
            const enderecosModalContent = enderecosModalDoc.querySelector('#enderecosModal');

            if (enderecosModalContent) {
                document.body.appendChild(enderecosModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/pagAdm/_enderecosModal.html:', error));

    // Carregar o modal de cartões
    fetch('modals/pagAdm/_cartoesModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const cartoesModalDoc = parser.parseFromString(data, 'text/html');
            const cartoesModalContent = cartoesModalDoc.querySelector('#cartoesModal');

            if (cartoesModalContent) {
                document.body.appendChild(cartoesModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/pagAdm/_cartoesModal.html:', error));

    // Carregar o modal de editar senha
    fetch('modals/pagAdm/_editarSenhaModal.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const editarSenhaModalDoc = parser.parseFromString(data, 'text/html');
            const editarSenhaModalContent = editarSenhaModalDoc.querySelector('#editarSenhaModal');

            if (editarSenhaModalContent) {
                document.body.appendChild(editarSenhaModalContent);
            }
        })
        .catch(error => console.error('Erro ao carregar modals/pagAdm/_editarSenhaModal.html:', error));

});
