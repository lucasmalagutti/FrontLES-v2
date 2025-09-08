const apiUrl = "https://localhost:7280/Cliente/Listar";

        document.addEventListener('DOMContentLoaded', () => {
            carregarClientes();
        });

        async function carregarClientes() {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error("Erro ao buscar clientes: " + response.statusText);
                const clientes = await response.json();

                const tbody = document.getElementById('clientesTableBody');
                tbody.innerHTML = '';

                clientes.forEach(cliente => {
                    const tr = document.createElement('tr');

                    let generoTexto = '';
                    switch (cliente.genero) {
                        case 1: generoTexto = 'Cis Masculino'; break;
                        case 2: generoTexto = 'Cis Feminino'; break;
                        case 3: generoTexto = 'Não Binário'; break;
                        case 4: generoTexto = 'Trans Masculino'; break;
                        case 5: generoTexto = 'Trans Feminino'; break;
                        case 6: generoTexto = 'Gênero Fluido'; break;
                        case 7: generoTexto = 'Bigênero'; break;
                        case 8: generoTexto = 'Outro'; break;
                        default: generoTexto = 'Desconhecido'; break;
                    }

                    let tipoTelefoneTexto = '';
                    switch (cliente.tipoTelefone) {
                        case 1: tipoTelefoneTexto = 'Fixo'; break;
                        case 2: tipoTelefoneTexto = 'Celular'; break;
                        default: tipoTelefoneTexto = 'Desconhecido'; break;
                    }

                    const statusBadge = cliente.cadastroAtivo
                        ? '<span class="badge bg-success">Ativo</span>'
                        : '<span class="badge bg-danger">Inativo</span>';

                    tr.innerHTML = `
                        <td>${cliente.nome}</td>
                        <td>${cliente.cpf}</td>
                        <td>${cliente.email}</td>
                        <td>${generoTexto}</td>
                        <td>${new Date(cliente.dtNasc).toLocaleDateString()}</td>
                        <td>${cliente.ddd}</td>
                        <td>${cliente.numeroTelefone}</td>
                        <td>${tipoTelefoneTexto}</td>
                        <td><button class="btn btn-primary btn-sm visualizar-enderecos-btn" data-cliente-id="${cliente.id}" 
                        data-bs-toggle="modal"
                                data-bs-target="#enderecosModal">Visualizar Endereços</button></td>
                        <td><button class="btn btn-primary btn-sm visualizar-cartoes-btn" data-cliente-id="${cliente.id}"
                        data-bs-toggle="modal"
                                data-bs-target="#cartoesModal">Visualizar Cartões</button></td>
                        <td><button class="btn btn-primary btn-sm" data-bs-toggle="modal"
                                data-bs-target="#transacoesModal">Visualizar Transações</button></td>
                        <td>${statusBadge}</td>
                        <td>
                            <div class="row d-flex flex-wrap gap-2">
                                <button class="btn btn-primary btn-sm editar-dados-btn" data-bs-toggle="modal"
                                    data-cliente-id="${cliente.id}" data-bs-target="#editarDadosModal">Editar Dados</button>
                                <button class="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-cliente-id="${cliente.id}" data-bs-target="#addEnderecoModal">Adicionar Endereço</button>
                                <button class="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-cliente-id="${cliente.id}" data-bs-target="#addCartaoModal">Adicionar Cartão</button>
                                <button class="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-cliente-id="${cliente.id}" data-bs-target="#editarSenhaModal">Editar Senha</button>
                                <button class="btn btn-danger btn-sm inativar-cliente-btn" data-cliente-id="${cliente.id}">Inativar</button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Adicionar listener de evento para os botões usando delegação de evento
                tbody.addEventListener('click', async (event) => {
                    const targetAddEnderecoButton = event.target.closest('[data-bs-target="#addEnderecoModal"]');
                    const targetAddCartaoButton = event.target.closest('[data-bs-target="#addCartaoModal"]');
                    const targetAddPasswordButton = event.target.closest('[data-bs-target="#editarSenhaModal"]');
                    const targetInativarButton = event.target.closest('.inativar-cliente-btn');

                    if (targetAddEnderecoButton) {
                        const clienteId = targetAddEnderecoButton.getAttribute('data-cliente-id');
                        const addEnderecoModalElement = document.getElementById('addEnderecoModal');
                        if (addEnderecoModalElement && clienteId) {
                            addEnderecoModalElement.setAttribute('data-cliente-id', clienteId);
                        }
                    } else if (targetAddCartaoButton) {
                        const clienteId = targetAddCartaoButton.getAttribute('data-cliente-id');
                        const addCartaoModalElement = document.getElementById('addCartaoModal');
                        if (addCartaoModalElement && clienteId) {
                            addCartaoModalElement.setAttribute('data-cliente-id', clienteId);
                        }
                    } else if (targetAddPasswordButton) {
                        const clienteId = targetAddPasswordButton.getAttribute('data-cliente-id');
                        const editarSenhaModalElement = document.getElementById('editarSenhaModal');
                        if (editarSenhaModalElement && clienteId) {
                            editarSenhaModalElement.setAttribute('data-cliente-id', clienteId);
                        }
                    } else if (targetInativarButton) {
                        const clienteId = targetInativarButton.getAttribute('data-cliente-id');
                        if (clienteId && confirm('Tem certeza que deseja inativar este cliente?')) {
                            // Chamar a função de inativação (a ser criada em inativar.js)
                            await inativarCliente(clienteId);
                        }
                    }
                });

            } catch (error) {
                console.error(error);
                alert("Erro ao carregar clientes: " + error.message);
            }
        }