window.inativarCliente = async function (clienteId) {
    try {
        // Fetch all clients to check the status of the specific client
        const listResponse = await fetch('https://localhost:7280/Cliente/Listar');
        if (!listResponse.ok) {
            throw new Error('Erro ao buscar lista de clientes para verificar status.');
        }
        const clientes = await listResponse.json();
        const clienteToInactivate = clientes.find(c => c.id == clienteId);

        if (!clienteToInactivate) {
            showAlert('Cliente não encontrado.', 'danger');
            return;
        }

        if (clienteToInactivate.cadastroAtivo === false) {
            showAlert('Cliente já inativado.', 'danger');
            setTimeout(async () => {
                if (typeof carregarClientes === 'function') {
                    await carregarClientes();
                } else {
                    location.reload();
                }
            }, 2000); // Small delay to show message
            return;
        }

        const response = await fetch(`https://localhost:7280/Cliente/AlterarStatus/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ativo: false // Define o status como inativo
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao inativar cliente');
        }

        showAlert('Cliente inativado com sucesso', 'success');
        // Recarregar a lista de clientes para refletir a mudança de status
        setTimeout(async () => {
            if (typeof carregarClientes === 'function') {
                await carregarClientes();
            } else {
                location.reload(); // Fallback caso carregarClientes não esteja disponível
            }
        }, 2000); // 2-second delay

    } catch (error) {
        console.error('Erro ao inativar cliente:', error);
        showAlert('Erro ao inativar cliente: ' + error.message, 'danger');
    }
};
