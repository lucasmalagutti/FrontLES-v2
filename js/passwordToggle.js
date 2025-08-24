// Funcionalidade para mostrar/ocultar senha nos campos de senha
console.log('passwordToggle.js carregado');

// Função para alternar a visibilidade da senha
function togglePasswordVisibility(inputId, buttonId, iconId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);
    
    console.log('Configurando toggle para:', inputId, buttonId, iconId);
    console.log('Elementos encontrados:', { input, button, icon });
    
    if (input && button && icon) {
        // Adicionar event listener diretamente
        button.onclick = function() {
            console.log('Botão clicado para:', inputId);
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
                button.title = 'Ocultar senha';
                console.log('Senha mostrada para:', inputId);
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
                button.title = 'Mostrar senha';
                console.log('Senha ocultada para:', inputId);
            }
        };
        
        console.log('Event listener adicionado para:', inputId);
        return true;
    } else {
        console.log('Elementos não encontrados para:', inputId);
        return false;
    }
}

// Função para configurar todos os campos de senha
function setupPasswordToggles() {
    console.log('Configurando toggles de senha...');
    
    let successCount = 0;
    
    // Senha Atual
    if (togglePasswordVisibility('senhaAtual', 'toggleSenhaAtual', 'iconSenhaAtual')) successCount++;
    
    // Nova Senha
    if (togglePasswordVisibility('novaSenha', 'toggleNovaSenha', 'iconNovaSenha')) successCount++;
    
    // Confirmar Nova Senha
    if (togglePasswordVisibility('confirmarNovaSenha', 'toggleConfirmarNovaSenha', 'iconConfirmarNovaSenha')) successCount++;
    
    console.log(`Configurados ${successCount} de 3 campos de senha`);
    return successCount === 3;
}

// Função para configurar o campo de senha da página de perfil
function setupProfilePasswordToggle() {
    console.log('Configurando toggle de senha do perfil...');
    
    const input = document.getElementById('senhaPerfil');
    const button = document.getElementById('toggleSenhaPerfil');
    const icon = document.getElementById('iconSenhaPerfil');
    
    if (input && button && icon) {
        button.onclick = function() {
            console.log('Botão clicado para senha do perfil');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
                button.title = 'Ocultar senha';
                console.log('Senha do perfil mostrada');
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
                button.title = 'Mostrar senha';
                console.log('Senha do perfil ocultada');
            }
        };
        
        console.log('Toggle de senha do perfil configurado com sucesso');
        return true;
    } else {
        console.log('Elementos de senha do perfil não encontrados');
        return false;
    }
}

// Função para verificar e configurar o modal quando estiver disponível
function checkAndSetupModal() {
    const editarSenhaModal = document.getElementById('editarSenhaModal');
    if (editarSenhaModal) {
        console.log('Modal encontrado, configurando event listener');
        
        // Usar o evento do Bootstrap
        editarSenhaModal.addEventListener('shown.bs.modal', () => {
            console.log('Modal aberto (Bootstrap), configurando toggles');
            setTimeout(() => {
                if (setupPasswordToggles()) {
                    console.log('Todos os toggles configurados com sucesso!');
                } else {
                    console.log('Alguns toggles não puderam ser configurados');
                }
            }, 100);
        });
        
        return true;
    }
    return false;
}

// Função para tentar configurar o modal várias vezes
function trySetupModal() {
    let attempts = 0;
    const maxAttempts = 50;
    
    const tryInterval = setInterval(() => {
        attempts++;
        console.log(`Tentativa ${attempts} de configurar modal`);
        
        if (checkAndSetupModal()) {
            console.log('Modal configurado com sucesso na tentativa', attempts);
            clearInterval(tryInterval);
        } else if (attempts >= maxAttempts) {
            console.log('Máximo de tentativas atingido, parando verificação');
            clearInterval(tryInterval);
        }
    }, 100);
}

// Tentar configurar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, verificando modal e perfil');
    
    // Configurar toggle de senha do perfil
    setupProfilePasswordToggle();
    
    // Verificar modal
    if (!checkAndSetupModal()) {
        console.log('Modal não encontrado no DOMContentLoaded, iniciando tentativas periódicas');
        trySetupModal();
    }
});

// Tentar configurar quando a página estiver completamente carregada
window.addEventListener('load', () => {
    console.log('Página carregada, verificando modal novamente');
    
    // Configurar toggle de senha do perfil novamente
    setupProfilePasswordToggle();
    
    if (!checkAndSetupModal()) {
        console.log('Modal não encontrado no load, iniciando tentativas periódicas');
        trySetupModal();
    }
});

// Observar mudanças no DOM para quando o modal for carregado dinamicamente
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && 
                    node.id === 'editarSenhaModal') {
                    console.log('Modal carregado dinamicamente, configurando event listener');
                    
                    node.addEventListener('shown.bs.modal', () => {
                        console.log('Modal dinâmico aberto, configurando toggles');
                        setTimeout(() => {
                            if (setupPasswordToggles()) {
                                console.log('Todos os toggles configurados com sucesso!');
                            } else {
                                console.log('Alguns toggles não puderam ser configurados');
                            }
                        }, 100);
                    });
                }
            });
        }
    });
});

// Iniciar observação
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Função global para teste manual
window.testPasswordToggle = function() {
    console.log('Testando password toggle manualmente...');
    return setupPasswordToggles();
};

// Função global para forçar configuração
window.forceSetupPasswordToggle = function() {
    console.log('Forçando configuração de password toggle...');
    trySetupModal();
};

// Função global para testar toggle do perfil
window.testProfilePasswordToggle = function() {
    console.log('Testando toggle de senha do perfil...');
    return setupProfilePasswordToggle();
};
