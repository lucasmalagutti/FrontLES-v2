// js/gerenciarPedidos.js
// Função para aguardar o Bootstrap estar disponível
function waitForBootstrap(callback) {
    if (typeof bootstrap !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForBootstrap(callback), 100);
    }
}

// ENUMs de Status de Pedido (baseado no StatusPedido.cs do backend)
// O backend usa: EmProcessamento, EmTransporte, Entregue, EmTroca, Trocado
// Mapeamento entre enum do backend e valores exibidos no frontend
const STATUS_PEDIDO_BACKEND = {
    EmProcessamento: 1,
    EmTransporte: 2,
    Entregue: 3,
    EmTroca: 4,
    Trocado: 5
};

// ENUMs de Status de Pedido para exibição no frontend
const STATUS_PEDIDO = {
    EM_PROCESSAMENTO: 'EM PROCESSAMENTO',
    EM_TRANSITO: 'EM TRANSITO',
    ENTREGUE: 'ENTREGUE',
    EM_TROCA: 'EM TROCA',
    TROCA_AUTORIZADA: 'TROCA AUTORIZADA',
    ITENS_RECEBIDOS: 'ITENS RECEBIDOS',
    CANCELADO: 'CANCELADO'
};

// Função para converter enum do backend para string do frontend
function converterStatusBackendParaFrontend(statusBackend) {
    if (typeof statusBackend === 'number') {
        // Se for número, converter baseado no enum
        switch (statusBackend) {
            case STATUS_PEDIDO_BACKEND.EmProcessamento: return STATUS_PEDIDO.EM_PROCESSAMENTO;
            case STATUS_PEDIDO_BACKEND.EmTransporte: return STATUS_PEDIDO.EM_TRANSITO;
            case STATUS_PEDIDO_BACKEND.Entregue: return STATUS_PEDIDO.ENTREGUE;
            case STATUS_PEDIDO_BACKEND.EmTroca: return STATUS_PEDIDO.EM_TROCA;
            case STATUS_PEDIDO_BACKEND.Trocado: return STATUS_PEDIDO.TROCA_AUTORIZADA;
            default: return STATUS_PEDIDO.EM_PROCESSAMENTO;
        }
    }
    
    if (typeof statusBackend === 'string') {
        // Se for string, tentar fazer match com os valores do enum
        const statusLower = statusBackend.toLowerCase();
        if (statusLower.includes('processamento')) return STATUS_PEDIDO.EM_PROCESSAMENTO;
        if (statusLower.includes('transporte') || statusLower.includes('transito')) return STATUS_PEDIDO.EM_TRANSITO;
        if (statusLower.includes('entregue')) return STATUS_PEDIDO.ENTREGUE;
        if (statusLower.includes('troca') && !statusLower.includes('autorizada')) return STATUS_PEDIDO.EM_TROCA;
        if (statusLower.includes('trocado') || statusLower.includes('autorizada')) return STATUS_PEDIDO.TROCA_AUTORIZADA;
        
        // Se já estiver no formato correto, retornar como está
        if (Object.values(STATUS_PEDIDO).includes(statusBackend)) {
            return statusBackend;
        }
    }
    
    return STATUS_PEDIDO.EM_PROCESSAMENTO;
}

// Função para converter string do frontend para enum do backend
function converterStatusFrontendParaBackend(statusFrontend) {
    switch (statusFrontend) {
        case STATUS_PEDIDO.EM_PROCESSAMENTO: return 'EmProcessamento';
        case STATUS_PEDIDO.EM_TRANSITO: return 'EmTransporte';
        case STATUS_PEDIDO.ENTREGUE: return 'Entregue';
        case STATUS_PEDIDO.EM_TROCA: return 'EmTroca';
        case STATUS_PEDIDO.TROCA_AUTORIZADA: return 'Trocado';
        default: return 'EmProcessamento';
    }
}

// ENUMs de Status de Transação disponíveis (mantido para compatibilidade)
const STATUS_TRANSACAO = STATUS_PEDIDO;

// Mapeamento de Status de Pagamento (número para nome por extenso)
const STATUS_PAGAMENTO = {
    0: 'Pendente',
    1: 'Pendente',
    2: 'Aprovado',
    3: 'Recusado',
    4: 'Cancelado',
    5: 'Reembolsado',
    6: 'Em Análise',
    7: 'Processando'
};

// Função para obter o nome do status de pagamento
function obterNomeStatusPagamento(statusPagamento) {
    if (statusPagamento === null || statusPagamento === undefined) {
        return 'Não informado';
    }
    
    // Se já for uma string, retornar como está
    if (typeof statusPagamento === 'string') {
        return statusPagamento;
    }
    
    // Se for um número, buscar no mapeamento
    if (typeof statusPagamento === 'number') {
        return STATUS_PAGAMENTO[statusPagamento] || `Status ${statusPagamento}`;
    }
    
    return 'Desconhecido';
}

// URL base da API
const API_BASE_URL = 'https://localhost:7280';

document.addEventListener('DOMContentLoaded', () => {
    let pedidos = [];
    let isLoading = false;

    // Carregar todos os pedidos da API
    async function carregarPedidos() {
        if (isLoading) return;
        isLoading = true;

        const tbody = document.getElementById('pedidosTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando pedidos...</span></div></td></tr>';
        }

        try {
            // Primeiro, tentar buscar diretamente todas as transações (se houver endpoint)
            try {
                const response = await fetch(`${API_BASE_URL}/Transacao/Listar`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (Array.isArray(data)) {
                        pedidos = data;
                    } else if (data && Array.isArray(data.transacoes)) {
                        pedidos = data.transacoes;
                    } else if (data && data.data && Array.isArray(data.data)) {
                        pedidos = data.data;
                    } else {
                        pedidos = [];
                    }

                    // Adicionar statusDisponiveis a cada pedido se não existir
                    pedidos.forEach(pedido => {
                        if (!pedido.statusDisponiveis) {
                            pedido.statusDisponiveis = Object.values(STATUS_PEDIDO);
                        }
                    });

                    if (pedidos.length > 0) {
                        renderizarPedidos();
                        isLoading = false;
                        return;
                    }
                }
            } catch (e) {
                console.log('Endpoint /Transacao/Listar não disponível, buscando por clientes...');
            }

            // Se não houver endpoint direto, buscar todas as transações através dos clientes
            console.log('Buscando todos os clientes...');
            const clientesResponse = await fetch(`${API_BASE_URL}/Cliente/Listar`);
            
            if (!clientesResponse.ok) {
                throw new Error(`Erro ao buscar clientes: ${clientesResponse.status}`);
            }

            const clientes = await clientesResponse.json();
            
            if (!Array.isArray(clientes) || clientes.length === 0) {
                throw new Error('Nenhum cliente encontrado.');
            }

            console.log(`Encontrados ${clientes.length} clientes. Buscando transações...`);

            // Buscar transações de todos os clientes em paralelo
            const promises = clientes.map(cliente => 
                fetch(`${API_BASE_URL}/Transacao/ListarPorCliente/${cliente.id}`)
                    .then(res => {
                        if (!res.ok) {
                            console.warn(`Erro ao buscar transações do cliente ${cliente.id}: ${res.status}`);
                            return null;
                        }
                        return res.json();
                    })
                    .catch(error => {
                        console.warn(`Erro ao buscar transações do cliente ${cliente.id}:`, error);
                        return null;
                    })
            );

            const resultados = await Promise.all(promises);
            const todosPedidos = [];

            // Processar resultados de cada cliente
            resultados.forEach((resultado, index) => {
                if (resultado) {
                    if (Array.isArray(resultado)) {
                        resultado.forEach(pedido => {
                            // Adicionar informações do cliente se não estiver presente
                            if (!pedido.cliente && clientes[index]) {
                                pedido.cliente = { id: clientes[index].id, nome: clientes[index].nome };
                                pedido.clienteNome = clientes[index].nome;
                            }
                            // Se não houver statusDisponiveis, usar todos do enum como padrão
                            if (!pedido.statusDisponiveis) {
                                pedido.statusDisponiveis = Object.values(STATUS_PEDIDO);
                            }
                            todosPedidos.push(pedido);
                        });
                    } else if (resultado.transacoes && Array.isArray(resultado.transacoes)) {
                        resultado.transacoes.forEach(pedido => {
                            if (!pedido.cliente && clientes[index]) {
                                pedido.cliente = { id: clientes[index].id, nome: clientes[index].nome };
                                pedido.clienteNome = clientes[index].nome;
                            }
                            // Se não houver statusDisponiveis, usar todos do enum como padrão
                            if (!pedido.statusDisponiveis) {
                                pedido.statusDisponiveis = Object.values(STATUS_PEDIDO);
                            }
                            todosPedidos.push(pedido);
                        });
                    }
                }
            });

            // Remover duplicatas baseado no ID da transação
            pedidos = todosPedidos.filter((pedido, index, self) => {
                const pedidoId = pedido.id || pedido.transacaoId;
                return index === self.findIndex(p => (p.id === pedidoId) || (p.transacaoId === pedidoId));
            });

            console.log(`Total de ${pedidos.length} transações encontradas.`);

            if (pedidos.length === 0) {
                const tbody = document.getElementById('pedidosTableBody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Nenhum pedido encontrado no banco de dados.</td></tr>';
                }
                showAlert('Nenhum pedido encontrado. Verifique se há transações cadastradas no banco de dados.', 'info');
            } else {
                renderizarPedidos();
            }

        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            const tbody = document.getElementById('pedidosTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            <strong>Erro ao carregar pedidos</strong><br>
                            ${error.message}<br>
                            <small>Verifique se o servidor está rodando e a conexão com o banco de dados.</small>
                        </td>
                    </tr>
                `;
            }
            showAlert(`Erro ao carregar pedidos: ${error.message}`, 'danger');
        } finally {
            isLoading = false;
        }
    }

    // Atualizar status de um pedido via API
    async function atualizarStatusPedidoAPI(pedidoId, novoStatus) {
        try {
            // Converter status do frontend para o formato do backend
            const statusBackend = converterStatusFrontendParaBackend(novoStatus);
            
            // Tentar atualizar via endpoint de pedido primeiro
            let response = await fetch(`${API_BASE_URL}/Pedido/AtualizarStatus/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    statusPedido: statusBackend
                })
            });

            // Se não existir endpoint de Pedido, tentar via Transação
            if (!response.ok && response.status === 404) {
                response = await fetch(`${API_BASE_URL}/Transacao/AtualizarStatus/${pedidoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        statusPedido: statusBackend
                    })
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao atualizar status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            // Atualizar o pedido local automaticamente
            const pedidoIndex = pedidos.findIndex(p => {
                const id = p.pedidoId || (p.pedido ? p.pedido.id : null) || p.id || p.transacaoId;
                return id == pedidoId || id === pedidoId;
            });

            if (pedidoIndex !== -1) {
                // Atualizar status no objeto local (mantendo o formato do backend)
                const statusBackendFormat = converterStatusFrontendParaBackend(novoStatus);
                pedidos[pedidoIndex].statusPedido = statusBackendFormat;
                // Também manter a versão convertida para o frontend
                pedidos[pedidoIndex].statusPedidoFrontend = novoStatus;
                if (pedidos[pedidoIndex].status) {
                    pedidos[pedidoIndex].status = novoStatus;
                }
                if (pedidos[pedidoIndex].pedido) {
                    pedidos[pedidoIndex].pedido.statusPedido = statusBackendFormat;
                }
                
                // Obter o filtro atual ativo
                const filtroAtivo = document.querySelector('input[name="statusFilter"]:checked')?.value || 'todos';
                
                // Se o novo status não corresponde ao filtro, remover a linha, caso contrário atualizar
                const statusAtualPedido = pedidos[pedidoIndex].statusPedido || pedidos[pedidoIndex].statusTransacao || '';
                if (filtroAtivo !== 'todos' && statusAtualPedido !== filtroAtivo) {
                    // A linha será removida automaticamente pelo filtro, então recarregar
                    renderizarPedidos(filtroAtivo);
                } else {
                    // Atualizar apenas a linha específica na tabela
                    atualizarLinhaTabelaPorId(pedidoId, pedidos[pedidoIndex]);
                }
            } else {
                // Se não encontrou, recarregar tudo
            renderizarPedidos();
            }

            showSuccessNotification(`Status do pedido atualizado para "${novoStatus}" com sucesso!`);
            return true;

        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showAlert(`Erro ao atualizar status: ${error.message}`, 'danger');
            return false;
        }
    }

    // Atualizar apenas uma linha específica da tabela pelo ID do pedido
    function atualizarLinhaTabelaPorId(pedidoId, pedido) {
        const tbody = document.getElementById('pedidosTableBody');
        if (!tbody) return;
        
        const linhas = tbody.querySelectorAll('tr');
        let linhaEncontrada = null;
        
        // Procurar a linha que contém o ID do pedido
        linhas.forEach(tr => {
            const primeiraCelula = tr.querySelector('td:first-child');
            if (primeiraCelula && primeiraCelula.textContent.trim() == pedidoId) {
                linhaEncontrada = tr;
            }
        });
        
        if (linhaEncontrada) {
            const tr = linhaEncontrada;
            
            // Obter informações do pedido
            const pedidoIdExibicao = pedido.pedidoId || (pedido.pedido ? pedido.pedido.id : pedido.id) || '—';
            const clienteNome = pedido.cliente?.nome || pedido.clienteNome || 'Cliente não identificado';
            const dataTransacao = pedido.dataTransacao || pedido.data || new Date().toISOString();
            const valorTotal = pedido.valorTotal || pedido.total || 0;
            // Converter status do backend para frontend
            const statusBackend = pedido.statusPedido !== undefined ? pedido.statusPedido :
                                  (pedido.pedido && pedido.pedido.statusPedido !== undefined) ? pedido.pedido.statusPedido :
                                  pedido.statusTransacao || pedido.status || null;
            const statusAtual = pedido.statusPedidoFrontend || converterStatusBackendParaFrontend(statusBackend);
            const transacaoId = pedido.id || pedido.transacaoId || null;
            
            // Obter status de pagamento
            const statusPagamentoNum = pedido.statusPagamento !== undefined ? pedido.statusPagamento :
                                      (pedido.pagamento && pedido.pagamento.statusPagamento !== undefined) ? pedido.pagamento.statusPagamento :
                                      (pedido.transacao && pedido.transacao.statusPagamento !== undefined) ? pedido.transacao.statusPagamento :
                                      null;
            const statusPagamentoTexto = obterNomeStatusPagamento(statusPagamentoNum);

            // Determinar cor do badge baseado no status de pagamento
            let badgeClassPagamento = 'bg-secondary';
            if (statusPagamentoNum === 0 || statusPagamentoNum === 1) badgeClassPagamento = 'bg-warning';
            else if (statusPagamentoNum === 2) badgeClassPagamento = 'bg-success';
            else if (statusPagamentoNum === 3) badgeClassPagamento = 'bg-danger';
            else if (statusPagamentoNum === 4) badgeClassPagamento = 'bg-dark';
            else if (statusPagamentoNum === 5) badgeClassPagamento = 'bg-info';
            else if (statusPagamentoNum === 6) badgeClassPagamento = 'bg-primary';
            else if (statusPagamentoNum === 7) badgeClassPagamento = 'bg-info';

            // Determinar cor do badge baseado no status da transação
            let badgeClass = 'bg-secondary';
            if (statusAtual === STATUS_PEDIDO.EM_PROCESSAMENTO) badgeClass = 'bg-warning';
            else if (statusAtual === STATUS_PEDIDO.EM_TROCA) badgeClass = 'bg-danger';
            else if (statusAtual === STATUS_PEDIDO.EM_TRANSITO) badgeClass = 'bg-info';
            else if (statusAtual === STATUS_PEDIDO.ENTREGUE) badgeClass = 'bg-success';
            else if (statusAtual === STATUS_PEDIDO.TROCA_AUTORIZADA) badgeClass = 'bg-primary';
            else if (statusAtual === STATUS_PEDIDO.ITENS_RECEBIDOS) badgeClass = 'bg-success';

            // Obter status disponíveis baseado no enum do backend
            const statusDisponiveisFrontend = [
                STATUS_PEDIDO.EM_PROCESSAMENTO,
                STATUS_PEDIDO.EM_TRANSITO,
                STATUS_PEDIDO.ENTREGUE,
                STATUS_PEDIDO.EM_TROCA,
                STATUS_PEDIDO.TROCA_AUTORIZADA
            ];
            
            // Se o pedido tiver statusDisponiveis específicos, usar esses, senão usar todos do enum
            const statusDisponiveis = pedido.statusDisponiveis ? 
                pedido.statusDisponiveis.map(s => converterStatusBackendParaFrontend(s)) :
                statusDisponiveisFrontend;
            
            // Criar seletor de status com apenas os status disponíveis
            let statusSelectOptions = '';
            statusDisponiveis.forEach(status => {
                const selected = statusAtual === status ? 'selected' : '';
                statusSelectOptions += `<option value="${status}" ${selected}>${status}</option>`;
            });

            const statusSelect = `
                <select class="form-select form-select-sm" onchange="alterarStatusPedido(${pedidoId}, this.value)" ${!transacaoId && !pedidoId ? 'disabled' : ''}>
                    ${statusSelectOptions}
                </select>
            `;

            const dataFormatada = formatDate(dataTransacao);

            tr.innerHTML = `
                <td>${pedidoIdExibicao}</td>
                <td>${clienteNome}</td>
                <td>${dataFormatada}</td>
                <td>R$ ${valorTotal.toFixed(2)}</td>
                <td><span class="badge ${badgeClassPagamento}">${statusPagamentoTexto}</span></td>
                <td>${statusSelect}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalhesPedido(${transacaoId || pedidoId})">
                        Ver Itens
                    </button>
                </td>
                <td>
                    ${getBotoesAcao(pedido)}
                </td>
            `;
        }
    }

    // Renderizar tabela de pedidos
    function renderizarPedidos(filtroStatus = 'todos') {
        const tbody = document.getElementById('pedidosTableBody');
        if (!tbody) return;

        let pedidosFiltrados = pedidos;
        if (filtroStatus !== 'todos') {
            pedidosFiltrados = pedidos.filter(pedido => {
                const statusBackend = pedido.statusPedido !== undefined ? pedido.statusPedido :
                                      (pedido.pedido && pedido.pedido.statusPedido !== undefined) ? pedido.pedido.statusPedido :
                                      pedido.statusTransacao || pedido.status || null;
                const statusFrontend = pedido.statusPedidoFrontend || converterStatusBackendParaFrontend(statusBackend);
                return statusFrontend === filtroStatus;
            });
        }

        if (pedidosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pedidosFiltrados.forEach(pedido => {
            const tr = document.createElement('tr');
            
            // Obter informações do pedido
            const pedidoId = pedido.pedidoId || (pedido.pedido ? pedido.pedido.id : pedido.id) || '—';
            const clienteNome = pedido.cliente?.nome || pedido.clienteNome || 'Cliente não identificado';
            const dataTransacao = pedido.dataTransacao || pedido.data || new Date().toISOString();
            const valorTotal = pedido.valorTotal || pedido.total || 0;
            // Priorizar statusPedido sobre statusTransacao e converter do backend
            const statusBackend = pedido.statusPedido !== undefined ? pedido.statusPedido :
                                  (pedido.pedido && pedido.pedido.statusPedido !== undefined) ? pedido.pedido.statusPedido :
                                  pedido.statusTransacao || pedido.status || null;
            const statusAtual = converterStatusBackendParaFrontend(statusBackend);
            const transacaoId = pedido.id || pedido.transacaoId || null;
            
            // Obter status de pagamento e converter para nome por extenso
            // Buscar em diferentes propriedades possíveis
            const statusPagamentoNum = pedido.statusPagamento !== undefined ? pedido.statusPagamento :
                                      (pedido.pagamento && pedido.pagamento.statusPagamento !== undefined) ? pedido.pagamento.statusPagamento :
                                      (pedido.transacao && pedido.transacao.statusPagamento !== undefined) ? pedido.transacao.statusPagamento :
                                      null;
            const statusPagamentoTexto = obterNomeStatusPagamento(statusPagamentoNum);

            // Determinar cor do badge baseado no status de pagamento
            let badgeClassPagamento = 'bg-secondary';
            if (statusPagamentoNum === 0 || statusPagamentoNum === 1) badgeClassPagamento = 'bg-warning'; // Pendente
            else if (statusPagamentoNum === 2) badgeClassPagamento = 'bg-success'; // Aprovado
            else if (statusPagamentoNum === 3) badgeClassPagamento = 'bg-danger'; // Recusado
            else if (statusPagamentoNum === 4) badgeClassPagamento = 'bg-dark'; // Cancelado
            else if (statusPagamentoNum === 5) badgeClassPagamento = 'bg-info'; // Reembolsado
            else if (statusPagamentoNum === 6) badgeClassPagamento = 'bg-primary'; // Em Análise
            else if (statusPagamentoNum === 7) badgeClassPagamento = 'bg-info'; // Processando

            // Determinar cor do badge baseado no status da transação (para a coluna de alterar status)
            let badgeClass = 'bg-secondary';
            if (statusAtual === STATUS_PEDIDO.EM_PROCESSAMENTO) badgeClass = 'bg-warning';
            else if (statusAtual === STATUS_PEDIDO.EM_TROCA) badgeClass = 'bg-danger';
            else if (statusAtual === STATUS_PEDIDO.EM_TRANSITO) badgeClass = 'bg-info';
            else if (statusAtual === STATUS_PEDIDO.ENTREGUE) badgeClass = 'bg-success';
            else if (statusAtual === STATUS_PEDIDO.TROCA_AUTORIZADA) badgeClass = 'bg-primary';
            else if (statusAtual === STATUS_PEDIDO.ITENS_RECEBIDOS) badgeClass = 'bg-success';

            // Formatar data
            const dataFormatada = formatDate(dataTransacao);

            // Obter status disponíveis baseado no enum do backend
            // O backend tem: EmProcessamento, EmTransporte, Entregue, EmTroca, Trocado
            // Mapear para os valores do frontend correspondentes
            const statusDisponiveisFrontend = [
                STATUS_PEDIDO.EM_PROCESSAMENTO,
                STATUS_PEDIDO.EM_TRANSITO,
                STATUS_PEDIDO.ENTREGUE,
                STATUS_PEDIDO.EM_TROCA,
                STATUS_PEDIDO.TROCA_AUTORIZADA
            ];
            
            // Se o pedido tiver statusDisponiveis específicos, usar esses, senão usar todos do enum
            const statusDisponiveis = pedido.statusDisponiveis ? 
                pedido.statusDisponiveis.map(s => converterStatusBackendParaFrontend(s)) :
                statusDisponiveisFrontend;
            
            // Criar seletor de status apenas com os status disponíveis
            let statusSelectOptions = '';
            statusDisponiveis.forEach(status => {
                const selected = statusAtual === status ? 'selected' : '';
                statusSelectOptions += `<option value="${status}" ${selected}>${status}</option>`;
            });

            const statusSelect = `
                <select class="form-select form-select-sm" onchange="alterarStatusPedido(${pedidoId}, this.value)" ${!transacaoId && !pedidoId ? 'disabled' : ''}>
                    ${statusSelectOptions}
                </select>
            `;

            tr.innerHTML = `
                <td>${pedidoId}</td>
                <td>${clienteNome}</td>
                <td>${dataFormatada}</td>
                <td>R$ ${valorTotal.toFixed(2)}</td>
                <td><span class="badge ${badgeClassPagamento}">${statusPagamentoTexto}</span></td>
                <td>${statusSelect}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalhesPedido(${transacaoId || pedidoId})">
                        Ver Itens
                    </button>
                </td>
                <td>
                    ${getBotoesAcao(pedido)}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Gerar botões de ação baseado no status do pedido
    function getBotoesAcao(pedido) {
        const pedidoId = pedido.pedidoId || (pedido.pedido ? pedido.pedido.id : null) || pedido.id || pedido.transacaoId;
        const statusAtual = pedido.statusPedido || pedido.statusTransacao || pedido.status || '';
        let botoes = '';
        
        if (statusAtual === STATUS_PEDIDO.EM_PROCESSAMENTO) {
            botoes = `
                <button class="btn btn-sm btn-success me-1" onclick="aceitarPedido('${pedidoId}')">
                    Aceitar Pedido
                </button>
            `;
        } else if (statusAtual === STATUS_PEDIDO.EM_TRANSITO) {
            botoes = `
                <button class="btn btn-sm btn-success me-1" onclick="confirmarEntrega('${pedidoId}')">
                    Confirmar Entrega
                </button>
            `;
        } else if (statusAtual === STATUS_PEDIDO.EM_TROCA) {
            botoes = `
                <button class="btn btn-sm btn-success me-1" onclick="autorizarTroca('${pedidoId}')">
                    Autorizar Troca
                </button>
            `;
        } else if (statusAtual === STATUS_PEDIDO.TROCA_AUTORIZADA) {
            botoes = `
                <button class="btn btn-sm btn-info me-1" onclick="confirmarChegadaItens('${pedidoId}')">
                    <i class="bi bi-box-seam"></i> Confirmar Chegada
                </button>
            `;
        } else {
            botoes = '<span class="text-muted">Nenhuma ação disponível</span>';
        }
        
        return botoes;
    }

    // Função para formatar data
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            return dateStr;
        }
    }

    // Função global para alterar status do pedido
    window.alterarStatusPedido = async function(pedidoId, novoStatus) {
        if (!pedidoId) {
            showAlert('ID do pedido não encontrado.', 'warning');
            return;
        }

        const pedido = pedidos.find(p => {
            const id = p.pedidoId || (p.pedido ? p.pedido.id : null) || p.id || p.transacaoId;
            return id == pedidoId || id === pedidoId;
        });

        if (!pedido) {
            showAlert('Pedido não encontrado.', 'warning');
            return;
        }

        const statusAtual = pedido.statusPedido || pedido.statusTransacao || pedido.status || '';
        
        if (statusAtual === novoStatus) {
            return; // Não fazer nada se o status não mudou
        }

        const confirmacao = confirm(`Tem certeza que deseja alterar o status do pedido ${pedidoId} de "${statusAtual}" para "${novoStatus}"?`);
        if (!confirmacao) {
            // Restaurar valor anterior no select
            const select = event?.target || document.querySelector(`select[onchange*="${pedidoId}"]`);
            if (select) {
                select.value = statusAtual;
            }
            return;
        }

        await atualizarStatusPedidoAPI(pedidoId, novoStatus);
    };

    // Aceitar pedido
    window.aceitarPedido = async function(pedidoId) {
        const pedido = pedidos.find(p => {
            const id = p.pedidoId || (p.pedido ? p.pedido.id : null) || p.id || p.transacaoId;
            return id == pedidoId || id === pedidoId;
        });
        
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'warning');
            return;
        }

        await atualizarStatusPedidoAPI(pedidoId, STATUS_PEDIDO.EM_TRANSITO);
    };

    // Confirmar entrega
    window.confirmarEntrega = async function(pedidoId) {
        const pedido = pedidos.find(p => {
            const id = p.pedidoId || (p.pedido ? p.pedido.id : null) || p.id || p.transacaoId;
            return id == pedidoId || id === pedidoId;
        });
        
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'warning');
            return;
        }

        await atualizarStatusPedidoAPI(pedidoId, STATUS_PEDIDO.ENTREGUE);
    };

    // Autorizar troca
    window.autorizarTroca = async function(pedidoId) {
        const pedido = pedidos.find(p => {
            const id = p.pedidoId || (p.pedido ? p.pedido.id : null) || p.id || p.transacaoId;
            return id == pedidoId || id === pedidoId;
        });
        
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'warning');
            return;
        }

        await atualizarStatusPedidoAPI(pedidoId, STATUS_PEDIDO.TROCA_AUTORIZADA);
    };

    // Confirmar chegada dos itens
    window.confirmarChegadaItens = async function(pedidoId) {
        const pedido = pedidos.find(p => {
            const id = p.pedidoId || (p.pedido ? p.pedido.id : null) || p.id || p.transacaoId;
            return id == pedidoId || id === pedidoId;
        });
        
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'warning');
            return;
        }

        await atualizarStatusPedidoAPI(pedidoId, STATUS_PEDIDO.ITENS_RECEBIDOS);
    };

    // Ver detalhes do pedido
    window.verDetalhesPedido = async function(pedidoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Transacao/pedido/${pedidoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const pedidoCompleto = await response.json();

        // Usar o modal de transações existente para mostrar detalhes
        const modalTitle = document.getElementById('transacoesModalLabel');
            if (modalTitle) modalTitle.textContent = `Detalhes do Pedido #${pedidoId}`;

            const modalBody = document.querySelector('#transacoesModal .modal-body') || document.getElementById('transacoesModalBody');
        if (modalBody) {
                const itens = pedidoCompleto.itens || [];
            let itemsHtml = '';

                if (Array.isArray(itens) && itens.length > 0) {
                    itemsHtml = '<div class="table-responsive"><table class="table table-bordered table-striped"><thead><tr><th>Produto</th><th>Preço Unitário</th><th>Quantidade</th><th>Subtotal</th></tr></thead><tbody>';
                    
                    itens.forEach(item => {
                        const subtotal = (item.precoUnitario || 0) * (item.quantidade || 1);
                itemsHtml += `
                            <tr>
                                <td>${item.nomeProduto || '—'}</td>
                                <td>R$ ${(item.precoUnitario || 0).toFixed(2)}</td>
                                <td>${item.quantidade || 1}</td>
                                <td>R$ ${subtotal.toFixed(2)}</td>
                                </tr>
                        `;
                    });
                    
                    itemsHtml += '</tbody></table></div>';
                } else {
                    itemsHtml = '<p class="text-muted">Nenhum item encontrado.</p>';
                }

                modalBody.innerHTML = `
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p><strong>Data da Transação:</strong> ${formatDate(pedidoCompleto.dataTransacao)}</p>
                            <p><strong>Status:</strong> <span class="badge bg-primary">${pedidoCompleto.statusTransacao || '—'}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Valor Total:</strong> R$ ${(pedidoCompleto.valorTotal || 0).toFixed(2)}</p>
                            <p><strong>Frete:</strong> R$ ${(pedidoCompleto.valorFrete || 0).toFixed(2)}</p>
                        </div>
                    </div>
                <hr>
                <h5>Itens do Pedido:</h5>
                ${itemsHtml}
            `;
        }

            // Abrir modal de detalhes (não precisa fechar nada se estiver na página)
            const transacoesModalElement = document.getElementById('transacoesModal');
            if (transacoesModalElement) {
                const transacoesModal = new bootstrap.Modal(transacoesModalElement);
                transacoesModal.show();
            }

        } catch (error) {
            console.error('Erro ao carregar detalhes do pedido:', error);
            showAlert(`Erro ao carregar detalhes: ${error.message}`, 'danger');
        }
    };

    // Função para resetar pedidos (mantida para compatibilidade com modal antigo)
    window.resetarPedidos = function() {
        if (confirm('Deseja recarregar todos os pedidos do servidor?')) {
            carregarPedidos();
        }
    };

    // Event listeners para filtros de status
    document.addEventListener('change', (e) => {
        if (e.target.name === 'statusFilter') {
            renderizarPedidos(e.target.value);
        }
    });

    // Função para mostrar alertas
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Função para mostrar notificação de sucesso
    function showSuccessNotification(message) {
        showAlert(message, 'success');
    }

    // Função global para recarregar pedidos
    window.recarregarPedidos = function() {
        carregarPedidos();
    };

    // Inicializar quando a página carregar
    waitForBootstrap(() => {
        // Verificar se estamos na página de gerenciar pedidos ou no modal
        const gerenciarPedidosModal = document.getElementById('gerenciarPedidosModal');
        const pedidosTableBody = document.getElementById('pedidosTableBody');
        
        if (pedidosTableBody) {
            // Se estamos na página de gerenciar pedidos, carregar diretamente
            carregarPedidos();
        } else if (gerenciarPedidosModal) {
            // Se estamos no modal (compatibilidade com versão antiga)
            gerenciarPedidosModal.addEventListener('shown.bs.modal', () => {
                carregarPedidos();
            });
        }
    });
});
