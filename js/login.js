// Função para realizar o login
function realizarLogin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const lembrar = document.getElementById('lembrarLogin').checked;
    
    // Validação básica
    if (!usuario || !senha) {
        mostrarAlerta('Por favor, preencha todos os campos.', 'warning');
        return false;
    }
    
    // Simular processo de login (aqui você conectaria com seu backend)
    mostrarAlerta('Fazendo login...', 'info');
    
    // Simular delay de autenticação
    setTimeout(() => {
        // Aqui você faria a validação real com seu backend
        if (validarCredenciais(usuario, senha)) {
            // Login bem-sucedido
            if (lembrar) {
                localStorage.setItem('usuarioLogado', usuario);
            }
            
            mostrarAlerta('Login realizado com sucesso!', 'success');
            
            // Fechar modal após 1.5 segundos
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                // Atualizar interface para usuário logado
                atualizarInterfaceUsuario(usuario);
            }, 1500);
        } else {
            // Login falhou
            mostrarAlerta('Usuário ou senha incorretos. Tente novamente.', 'danger');
        }
    }, 1500);
    
    return false;
}

// Função para validar credenciais (simulada)
function validarCredenciais(usuario, senha) {
    // Aqui você implementaria a validação real com seu backend
    // Por enquanto, vamos simular com algumas credenciais de teste
    
    const credenciaisValidas = [
        { usuario: 'admin', senha: '123456' },
        { usuario: 'teste', senha: 'teste123' },
        { usuario: 'user', senha: 'password' }
    ];
    
    return credenciaisValidas.some(credencial => 
        credencial.usuario === usuario && credencial.senha === senha
    );
}

// Função para mostrar alertas
function mostrarAlerta(mensagem, tipo) {
    // Remover alertas existentes
    const alertasExistentes = document.querySelectorAll('.alert');
    alertasExistentes.forEach(alerta => alerta.remove());
    
    // Criar novo alerta
    const alertaHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Inserir alerta no modal
    const modalBody = document.querySelector('#loginModal .modal-body');
    modalBody.insertAdjacentHTML('afterbegin', alertaHTML);
}

// Função para atualizar interface após login
function atualizarInterfaceUsuario(usuario) {
    // Atualizar botão de login para mostrar usuário logado
    const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
    if (loginBtn) {
        loginBtn.innerHTML = `<i class="bi bi-person-fill"></i> ${usuario}`;
        loginBtn.classList.remove('btn-outline-light');
        loginBtn.classList.add('btn-success');
        loginBtn.setAttribute('data-bs-toggle', '');
        loginBtn.setAttribute('data-bs-target', '');
        loginBtn.onclick = function() {
            mostrarMenuUsuario(usuario);
        };
    }
    
    // Atualizar link "Minha Conta"
    const minhaContaLink = document.querySelector('.nav-link[href="#"]');
    if (minhaContaLink && minhaContaLink.innerHTML.includes('Minha Conta')) {
        minhaContaLink.innerHTML = `<i class="bi bi-person-fill"></i> ${usuario}`;
        minhaContaLink.onclick = function() {
            mostrarMenuUsuario(usuario);
        };
    }
}

// Função para mostrar menu do usuário logado
function mostrarMenuUsuario(usuario) {
    const opcoes = [
        'Meus Pedidos',
        'Meus Dados',
        'Favoritos',
        'Configurações',
        'Sair'
    ];
    
    const menuHTML = `
        <div class="dropdown-menu show" style="position: absolute; transform: translate3d(0px, 38px, 0px); top: 0px; left: 0px; will-change: transform;" x-placement="bottom-start">
            <h6 class="dropdown-header">Olá, ${usuario}!</h6>
            <div class="dropdown-divider"></div>
            ${opcoes.map(opcao => `
                <a class="dropdown-item" href="#" onclick="executarAcaoUsuario('${opcao}')">
                    <i class="bi bi-${getIconeOpcao(opcao)} me-2"></i>${opcao}
                </a>
            `).join('')}
        </div>
    `;
    
    // Remover menus existentes
    const menusExistentes = document.querySelectorAll('.dropdown-menu');
    menusExistentes.forEach(menu => menu.remove());
    
    // Adicionar novo menu
    const loginBtn = document.querySelector('.btn-success');
    if (loginBtn) {
        loginBtn.insertAdjacentHTML('afterend', menuHTML);
    }
}

// Função para obter ícone baseado na opção
function getIconeOpcao(opcao) {
    const icones = {
        'Meus Pedidos': 'box-seam',
        'Meus Dados': 'person-gear',
        'Favoritos': 'heart',
        'Configurações': 'gear',
        'Sair': 'box-arrow-right'
    };
    return icones[opcao] || 'circle';
}

// Função para executar ações do usuário
function executarAcaoUsuario(acao) {
    switch (acao) {
        case 'Sair':
            fazerLogout();
            break;
        case 'Meus Pedidos':
            mostrarAlerta('Funcionalidade em desenvolvimento!', 'info');
            break;
        case 'Meus Dados':
            mostrarAlerta('Funcionalidade em desenvolvimento!', 'info');
            break;
        case 'Favoritos':
            mostrarAlerta('Funcionalidade em desenvolvimento!', 'info');
            break;
        case 'Configurações':
            mostrarAlerta('Funcionalidade em desenvolvimento!', 'info');
            break;
    }
}

// Função para fazer logout
function fazerLogout() {
    // Limpar dados do usuário
    localStorage.removeItem('usuarioLogado');
    
    // Restaurar interface original
    const loginBtn = document.querySelector('.btn-success');
    if (loginBtn) {
        loginBtn.innerHTML = 'Login';
        loginBtn.classList.remove('btn-success');
        loginBtn.classList.add('btn-outline-light');
        loginBtn.setAttribute('data-bs-toggle', 'modal');
        loginBtn.setAttribute('data-bs-target', '#loginModal');
        loginBtn.onclick = null;
    }
    
    // Restaurar link "Minha Conta"
    const minhaContaLink = document.querySelector('.nav-link[onclick]');
    if (minhaContaLink) {
        minhaContaLink.innerHTML = '<i class="bi bi-person-fill"></i> Minha Conta';
        minhaContaLink.onclick = null;
    }
    
    // Remover menus de usuário
    const menusUsuario = document.querySelectorAll('.dropdown-menu');
    menusUsuario.forEach(menu => menu.remove());
    
    mostrarAlerta('Logout realizado com sucesso!', 'success');
}

// Verificar se há usuário logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        atualizarInterfaceUsuario(usuarioLogado);
    }
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            const menusUsuario = document.querySelectorAll('.dropdown-menu');
            menusUsuario.forEach(menu => menu.remove());
        }
    });
});
