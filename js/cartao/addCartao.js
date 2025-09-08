(function() {
    async function salvarCartao() {
        const modal = document.getElementById('addCartaoModal');
        const clienteId = modal.getAttribute('data-cliente-id');

        if (!clienteId || clienteId === "${clienteId}") {
            alert('ID do cliente não encontrado. Por favor, certifique-se de que o ID do cliente está sendo passado corretamente para o modal.');
            return;
        }

        const cartao = {
            numCartao: document.getElementById('addCartaoNumero').value,
            nomeImpresso: document.getElementById('addCartaoNomeImpresso').value,
            bandeira: parseInt(document.getElementById('addCartaoBandeira').value), // Mapeado para enum numérico
            cvc: parseInt(document.getElementById('addCartaoCvv').value),
            preferencial: false // Valor padrão conforme a DTO
        };

        try {
            const response = await fetch(`https://localhost:7280/Cartao/Cadastrar/${clienteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartao)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || 'Erro ao salvar o cartão');
            }

            showAlert('Cartão salvo com sucesso', 'success');
            // Fechar o modal após o sucesso
            const addCartaoModal = bootstrap.Modal.getInstance(document.getElementById('addCartaoModal'));
            if (addCartaoModal) {
                addCartaoModal.hide();
            }
        } catch (error) {
            console.error('Erro ao salvar cartão:', error);
            showAlert('Erro ao salvar o cartão: ' + error.message, 'danger');
        }
    }

    // Usa MutationObserver para detectar quando o modal é adicionado ao DOM
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === 1 && addedNode.id === 'addCartaoModal') {
                        // O modal foi adicionado, agora podemos anexar o listener ao botão
                        const salvarCartaoBtn = document.getElementById('salvarCartaoBtn');
                        if (salvarCartaoBtn) {
                            salvarCartaoBtn.addEventListener('click', salvarCartao);
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
