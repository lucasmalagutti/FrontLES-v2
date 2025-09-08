document.addEventListener('click', async function(event) {
    const editarDadosModalEl = document.getElementById('editarDadosModal');

    if (editarDadosModalEl) {
        editarDadosModalEl.addEventListener('hidden.bs.modal', () => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
        });
    }
    
    if (event.target.classList.contains('editar-dados-btn')) {
        const clienteId = event.target.getAttribute('data-cliente-id');

        try {
            const response = await fetch("https://localhost:7280/Cliente/Listar");
            if (!response.ok) throw new Error('Erro ao buscar clientes.');
            const clientes = await response.json();
            const cliente = clientes.find(c => c.id == clienteId);

            if (cliente) {
                document.getElementById('editNomeCompleto').value = cliente.nome ?? '';
                document.getElementById('editCpf').value = cliente.cpf ?? '';
                document.getElementById('editDataNascimento').value = cliente.dtNasc
                    ? new Date(cliente.dtNasc).toISOString().slice(0, 10)
                    : '';
                document.getElementById('editGenero').value = cliente.genero ?? '';
                document.getElementById('editEmail').value = cliente.email ?? '';
                document.getElementById('editTipoTelefone').value = cliente.tipoTelefone ?? '';
                document.getElementById('editDdd').value = cliente.ddd ?? '';
                document.getElementById('editNumeroTelefone').value = cliente.numeroTelefone ?? '';

                const modalEl = document.getElementById('editarDadosModal');
                const modal = new bootstrap.Modal(modalEl);
                modal.show();

                const salvarBtn = document.getElementById('salvarAlteracoesBtn');
                salvarBtn.replaceWith(salvarBtn.cloneNode(true));
                const novoSalvarBtn = document.getElementById('salvarAlteracoesBtn');

                novoSalvarBtn.addEventListener('click', async () => {
                    const editarCliente = {
                        Cpf: document.getElementById('editCpf').value || null,
                        Nome: document.getElementById('editNomeCompleto').value || null,
                        DtNascimento: document.getElementById('editDataNascimento').value
                            ? new Date(document.getElementById('editDataNascimento').value)
                            : null,
                        Genero: document.getElementById('editGenero').value
                            ? parseInt(document.getElementById('editGenero').value)
                            : null,
                        Email: document.getElementById('editEmail').value || null,
                        TipoTelefone: document.getElementById('editTipoTelefone').value
                            ? parseInt(document.getElementById('editTipoTelefone').value)
                            : 0,
                        Ddd: document.getElementById('editDdd').value || '',
                        NumeroTelefone: document.getElementById('editNumeroTelefone').value || ''
                    };

                    try {
                        const putResponse = await fetch(`https://localhost:7280/Cliente/Editar/${clienteId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editarCliente)
                        });

                        const text = await putResponse.text();

                        if (!putResponse.ok) {
                            console.error('Erro do backend:', text);
                            showAlert(`Erro: ${text}`, 'danger');
                            return;
                        }

                        showAlert('Cliente editado com sucesso', 'success');

                        setTimeout(() => {
                        const editarDadosModalEl = document.getElementById('editarDadosModal');
                        const editarDadosModal = bootstrap.Modal.getInstance(editarDadosModalEl);
                        editarDadosModal?.hide();

                        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.removeProperty('padding-right');

                        if (typeof carregarClientes === 'function') carregarClientes();
                        }, 100);

                    } catch (error) {
                        console.error(error);
                        showAlert('Não foi possível atualizar os dados do cliente.', 'danger');
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados do cliente:', error);
            showAlert('Não foi possível carregar os dados do cliente.', 'danger');
        }
    }
});
