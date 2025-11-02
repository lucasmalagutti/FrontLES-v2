document.addEventListener('sharedContentLoaded', async () => {

    const ordersListContainer = document.getElementById('orders-list');
    const clienteId = 33; // TODO: Obter do contexto de autenticação
    const API_BASE_URL = 'https://localhost:7280';
    const apiUrl = `${API_BASE_URL}/Transacao/ListarPorCliente/${clienteId}`;

    let orders = [];
    let pedidoAtualParaTroca = null;
    let itensPedidoAtual = [];

    async function loadOrders() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok)
                throw new Error(`Erro HTTP: ${response.status}`);

            const data = await response.json();

            if (Array.isArray(data)) {
                orders = data;
            } else if (data && data.transacoes) {
                orders = data.transacoes;
            } else {
                orders = [];
            }

            renderOrders();

        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            ordersListContainer.innerHTML = `
                <p class="text-danger text-center">Erro ao carregar pedidos. Verifique a conexão com o servidor.</p>
            `;
        }
    }

    function renderOrders() {
        if (!orders || orders.length === 0) {
            ordersListContainer.innerHTML = '<p class="text-muted text-center">Nenhum pedido encontrado.</p>';
            return;
        }

        ordersListContainer.innerHTML = '';

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('card', 'mb-3', 'shadow-sm');

            const status = order.statusTransacao || 'EM PROCESSAMENTO';
            const total = order.valorTotal || 0;
            const data = formatDate(order.dataTransacao);
            const pedidoId = order.pedidoId || (order.pedido ? order.pedido.id : order.id) || '—';

            // Verificar se o pedido foi entregue (status 3 = Entregue)
            const statusPedido = order.statusPedido || (order.pedido ? order.pedido.statusPedido : null);
            const podeSolicitarTroca = statusPedido === 3 || statusPedido === 'Entregue' || statusPedido === 'ENTREGUE';
            
            orderCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Pedido #${pedidoId}</h5>
                    <span class="badge ${getStatusBadgeClass(status)}">${status}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">Data: ${data}</p>
                    <p class="card-text">Total: R$ ${total.toFixed(2)}</p>
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-sm btn-info view-order-details" data-order-id="${pedidoId}">
                            <i class="bi bi-eye"></i> Ver Detalhes
                        </button>
                        ${podeSolicitarTroca ? `
                            <button class="btn btn-sm btn-warning solicitar-troca-btn" data-order-id="${pedidoId}" data-order-data='${JSON.stringify(order)}'>
                                <i class="bi bi-arrow-left-right"></i> Solicitar Troca/Devolução
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-secondary" disabled title="Apenas pedidos entregues podem ter troca/devolução">
                                <i class="bi bi-arrow-left-right"></i> Troca/Devolução (Indisponível)
                            </button>
                        `}
                    </div>
                </div>
            `;

            ordersListContainer.appendChild(orderCard);
        });

        document.querySelectorAll('.view-order-details').forEach(button => {
            button.addEventListener('click', async e => {
                const orderId = e.target.dataset.orderId;
                const selectedOrder = orders.find(o =>
                    o.pedidoId == orderId ||
                    (o.pedido && o.pedido.id == orderId) ||
                    o.id == orderId
                );
                if (selectedOrder) {
                    await loadOrderDetailsAndShowModal(selectedOrder);
                }
            });
        });

        // Event listener para solicitar troca/devolução
        document.querySelectorAll('.solicitar-troca-btn').forEach(button => {
            button.addEventListener('click', async e => {
                try {
                    const orderDataStr = e.target.dataset.orderData;
                    if (!orderDataStr) {
                        showAlert('Erro ao carregar dados do pedido', 'danger');
                        return;
                    }
                    
                    const order = JSON.parse(orderDataStr);
                    const pedidoId = order.pedidoId || (order.pedido ? order.pedido.id : order.id);
                    
                    // Buscar detalhes completos do pedido para obter os itens
                    const response = await fetch(`${API_BASE_URL}/api/Transacao/pedido/${pedidoId}`);
                    if (!response.ok) {
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }
                    
                    const pedidoCompleto = await response.json();
                    pedidoAtualParaTroca = pedidoCompleto;
                    itensPedidoAtual = pedidoCompleto.itens || [];
                    
                    await abrirModalSolicitacaoTroca(pedidoId);
                } catch (error) {
                    console.error('Erro ao preparar solicitação de troca:', error);
                    showAlert(`Erro ao carregar dados do pedido: ${error.message}`, 'danger');
                }
            });
        });
    }

    async function loadOrderDetailsAndShowModal(order) {
        try {
            const modalBody = document.querySelector('#transacoesModal .modal-body');
            if (modalBody) {
                modalBody.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
            }

            const pedidoId = order.pedidoId || (order.pedido ? order.pedido.id : order.id);
            const response = await fetch(`https://localhost:7280/api/Transacao/pedido/${pedidoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const transacaoCompleta = await response.json();
            
            populateTransacoesModal(transacaoCompleta);
            
            const modal = new bootstrap.Modal(document.getElementById('transacoesModal'));
            modal.show();

        } catch (error) {
            console.error("Erro ao carregar detalhes do pedido:", error);
            
            const modalBody = document.querySelector('#transacoesModal .modal-body');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h5>Erro ao carregar detalhes</h5>
                        <p>Não foi possível carregar os detalhes do pedido. Verifique a conexão com o servidor.</p>
                        <p class="mb-0"><small>Erro: ${error.message}</small></p>
                    </div>
                `;
            }
            
            const modal = new bootstrap.Modal(document.getElementById('transacoesModal'));
            modal.show();
        }
    }

    function populateTransacoesModal(order) {
        const modalTitle = document.getElementById('transacoesModalLabel');
        const modalBody = document.querySelector('#transacoesModal .modal-body');

        const itens = order.itens || [];

        if (modalTitle)
            modalTitle.textContent = `Detalhes do Pedido #${order.pedidoId || order.id}`;

        if (modalBody) {
            let itemsHtml = '';

            if (Array.isArray(itens) && itens.length > 0) {
                itens.forEach((item, index) => {
                    const subtotal = item.precoUnitario * item.quantidade;
                    itemsHtml += `
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0">Item ${index + 1}</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <p class="mb-1"><strong>Produto:</strong> ${item.nomeProduto || '—'}</p>
                                        <p class="mb-1"><strong>ID do Produto:</strong> ${item.produtoId || '—'}</p>
                                    </div>
                                    <div class="col-md-4 text-end">
                                        <p class="mb-1"><strong>Preço Unitário:</strong> R$ ${(item.precoUnitario || 0).toFixed(2)}</p>
                                        <p class="mb-1"><strong>Quantidade:</strong> ${item.quantidade || 1}</p>
                                        <p class="mb-0"><strong>Subtotal:</strong> R$ ${subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            modalBody.innerHTML = `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <p><strong>Data da Transação:</strong> ${formatDate(order.dataTransacao)}</p>
                        <p><strong>Status:</strong> <span class="badge bg-primary">${order.statusTransacao || '—'}</span></p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Valor Total:</strong> R$ ${(order.valorTotal || 0).toFixed(2)}</p>
                        <p><strong>Frete:</strong> R$ ${(order.valorFrete || 0).toFixed(2)}</p>
                    </div>
                </div>
                <hr>
                <h5>Itens do Pedido:</h5>
                ${itemsHtml || '<p class="text-muted">Nenhum item encontrado.</p>'}
            `;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    function getStatusBadgeClass(status) {
        if (!status) return 'bg-secondary';
        const statusLower = String(status).toLowerCase();
        if (statusLower.includes('entregue') || statusLower.includes('entregue')) return 'bg-success';
        if (statusLower.includes('transporte') || statusLower.includes('transito')) return 'bg-info';
        if (statusLower.includes('processamento')) return 'bg-warning';
        if (statusLower.includes('troca')) return 'bg-danger';
        return 'bg-primary';
    }

    async function abrirModalSolicitacaoTroca(pedidoId) {
        const modal = document.getElementById('solicitarTrocaModal');
        if (!modal) {
            showAlert('Modal não encontrado. Recarregue a página.', 'danger');
            return;
        }

        // Preencher ID do pedido
        document.getElementById('troca-pedido-id').value = pedidoId;

        // Limpar formulário
        document.getElementById('solicitarTrocaForm').reset();
        document.getElementById('motivoTroca').value = '';
        document.getElementById('tipoDevolucao').checked = true;
        document.getElementById('selecaoItemContainer').style.display = 'none';
        document.getElementById('item-pedido-select').innerHTML = '<option value="">Selecione um item...</option>';

        // Preencher select de itens se houver
        const itemSelect = document.getElementById('item-pedido-select');
        if (itensPedidoAtual && itensPedidoAtual.length > 0) {
            itensPedidoAtual.forEach(item => {
                const option = document.createElement('option');
                // Usar o ID do ItemPedido (não do produto)
                const itemPedidoId = item.id || item.itemPedidoId;
                option.value = itemPedidoId;
                option.textContent = `${item.nomeProduto || 'Produto'} - Qtd: ${item.quantidade || 1} - R$ ${((item.precoUnitario || 0) * (item.quantidade || 1)).toFixed(2)}`;
                option.dataset.itemPedidoId = itemPedidoId;
                itemSelect.appendChild(option);
            });
        }

        // Event listener para mudança de tipo de solicitação
        document.querySelectorAll('input[name="tipoSolicitacao"]').forEach(radio => {
            radio.removeEventListener('change', handleTipoSolicitacaoChange);
            radio.addEventListener('change', handleTipoSolicitacaoChange);
        });

        // Event listener para enviar solicitação
        const btnEnviar = document.getElementById('btnEnviarSolicitacao');
        btnEnviar.removeEventListener('click', handleEnviarSolicitacao);
        btnEnviar.addEventListener('click', handleEnviarSolicitacao);

        // Abrir modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    function handleTipoSolicitacaoChange(e) {
        const selecaoContainer = document.getElementById('selecaoItemContainer');
        const itemSelect = document.getElementById('item-pedido-select');
        
        if (e.target.value === '1') { // Troca
            selecaoContainer.style.display = 'block';
            itemSelect.required = true;
        } else { // Devolução
            selecaoContainer.style.display = 'none';
            itemSelect.required = false;
            itemSelect.value = '';
        }
    }

    async function handleEnviarSolicitacao() {
        const form = document.getElementById('solicitarTrocaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const pedidoId = parseInt(document.getElementById('troca-pedido-id').value);
        const tipoSolicitacao = parseInt(document.querySelector('input[name="tipoSolicitacao"]:checked').value);
        const motivo = document.getElementById('motivoTroca').value.trim();
        const itemSelect = document.getElementById('item-pedido-select');
        let itemPedidoId = null;

        if (tipoSolicitacao === 1) { // Troca de produto
            if (!itemSelect.value) {
                showAlert('Por favor, selecione o produto para troca', 'warning');
                return;
            }
            // O value já é o itemPedidoId
            itemPedidoId = parseInt(itemSelect.value);
            if (!itemPedidoId || isNaN(itemPedidoId)) {
                showAlert('Erro ao identificar o item selecionado', 'danger');
                return;
            }
        }

        if (!motivo || motivo.length === 0) {
            showAlert('Por favor, informe o motivo da solicitação', 'warning');
            return;
        }

        if (motivo.length > 500) {
            showAlert('O motivo deve ter no máximo 500 caracteres', 'warning');
            return;
        }

        const btnEnviar = document.getElementById('btnEnviarSolicitacao');
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/criar/${clienteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pedidoId: pedidoId,
                    itemPedidoId: itemPedidoId,
                    tipoSolicitacao: tipoSolicitacao,
                    motivo: motivo
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('solicitarTrocaModal'));
            if (modal) modal.hide();

            // Mostrar mensagem de sucesso
            showSuccessNotification('Solicitação de troca/devolução enviada com sucesso! Aguarde a análise do administrador.');
            
            // Recarregar pedidos
            await loadOrders();

        } catch (error) {
            console.error('Erro ao enviar solicitação de troca:', error);
            showAlert(`Erro ao enviar solicitação: ${error.message}`, 'danger');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="bi bi-send"></i> Enviar Solicitação';
        }
    }

    function showAlert(message, type = 'info') {
        // Usar alert nativo ou implementar toast/alert do Bootstrap
        alert(message);
    }

    function showSuccessNotification(message) {
        // Implementar notificação de sucesso (pode usar toast do Bootstrap)
        alert(message);
    }

    await loadOrders();
});
