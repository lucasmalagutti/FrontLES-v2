(function() {
    async function salvarEndereco() {
        const modal = document.getElementById('addEnderecoModal');
        const clienteId = modal.getAttribute('data-cliente-id');

        if (!clienteId || clienteId === "${clienteId}") {
            alert('ID do cliente não encontrado. Por favor, certifique-se de que o ID do cliente está sendo passado corretamente para o modal.');
            return;
        }

        const endereco = {
            nome: document.getElementById('enderecoNome').value,
            tipoEndereco: parseInt(document.getElementById('enderecoTipoEndereco').value),
            tipoResidencia: parseInt(document.getElementById('enderecoTipoResidencia').value),
            tipoLogradouro: parseInt(document.getElementById('enderecoTipoLogradouro').value),
            logradouro: document.getElementById('enderecoLogradouro').value,
            numero: document.getElementById('enderecoNumero').value,
            cep: document.getElementById('enderecoCep').value,
            bairro: document.getElementById('enderecoBairro').value,
            cidade: document.getElementById('enderecoCidade').value,
            estado: document.getElementById('enderecoEstado').value,
            pais: document.getElementById('enderecoPais').value,
            observacoes: document.getElementById('enderecoObservacoes').value
        };

        try {
            const response = await fetch(`https://localhost:7280/Endereco/Cadastrar/${clienteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(endereco)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar o endereço');
            }

            const data = await response.json();
            alert(data.message);
            // Fechar o modal após o sucesso
            const addEnderecoModal = bootstrap.Modal.getInstance(document.getElementById('addEnderecoModal'));
            if (addEnderecoModal) {
                addEnderecoModal.hide();
            }
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            showAlert('Erro ao salvar o endereço: ' + error.message, 'danger');
        }
    }

    // Usa MutationObserver para detectar quando o modal é adicionado ao DOM
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === 1 && addedNode.id === 'addEnderecoModal') {
                        // O modal foi adicionado, agora podemos anexar o listener ao botão
                        const salvarEnderecoBtn = document.getElementById('salvarEnderecoBtn');
                        if (salvarEnderecoBtn) {
                            salvarEnderecoBtn.addEventListener('click', salvarEndereco);
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
