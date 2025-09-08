(function() {
    async function salvarSenha() {
        const modal = document.getElementById('editarSenhaModal');
        const clienteId = modal.getAttribute('data-cliente-id');

        if (!clienteId || clienteId === "${clienteId}") {
            alert('ID do cliente não encontrado. Por favor, certifique-se de que o ID do cliente está sendo passado corretamente para o modal.');
            return;
        }

        const senhaData = {
            senhaAtual: document.getElementById('senhaAtual').value,
            novaSenha: document.getElementById('novaSenha').value,
            confirmarNovaSenha: document.getElementById('confirmarNovaSenha').value
        };

        if (senhaData.novaSenha !== senhaData.confirmarNovaSenha) {
            showAlert('A nova senha e a confirmação da nova senha não coincidem.', 'warning');
            return;
        }

        try {
            const response = await fetch(`https://localhost:7280/Cliente/AlterarSenha/${clienteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(senhaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Erro ao salvar a senha');
            }

            showAlert('Senha alterada com sucesso', 'success');
            // Fechar o modal após o sucesso
            const editarSenhaModal = bootstrap.Modal.getInstance(document.getElementById('editarSenhaModal'));
            if (editarSenhaModal) {
                editarSenhaModal.hide();
            }
        } catch (error) {
            console.error('Erro ao salvar senha:', error);
            showAlert('Erro ao salvar a senha: ' + error.message, 'danger');
        }
    }

    // Usa MutationObserver para detectar quando o modal é adicionado ao DOM
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === 1 && addedNode.id === 'editarSenhaModal') {
                        // O modal foi adicionado, agora podemos anexar o listener ao botão
                        const salvarSenhaBtn = document.getElementById('salvarSenhaBtn');
                        if (salvarSenhaBtn) {
                            salvarSenhaBtn.addEventListener('click', salvarSenha);
                            // Uma vez que o listener foi anexado, podemos parar de observar
                            observer.disconnect();
                        }
                    }
                }
            }
        }
    });

    // Começa a observar o body para adições de nós filhos
    observer.observe(document.body, { childList: true, subtree: true });
})();
