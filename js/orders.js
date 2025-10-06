document.addEventListener('sharedContentLoaded', async () => {

    const ordersListContainer = document.getElementById('orders-list');
    const clienteId = 33; // ID mocado para teste
    const apiUrl = `https://localhost:7280/Transacao/ListarPorCliente/${clienteId}`;

    let orders = [];
    let orderIdToExchange = null;

    // ================================
    // 🔹 Carrega transações do cliente
    // ================================
    async function loadOrders() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok)
                throw new Error(`Erro HTTP: ${response.status}`);

            const data = await response.json();

            // Garante que sempre será um array
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

    // ================================
    // 🔹 Renderiza as transações/pedidos
    // ================================
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

            orderCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Pedido #${pedidoId}</h5>
                    <span class="badge bg-primary">${status}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">Data: ${data}</p>
                    <p class="card-text">Total: R$ ${total.toFixed(2)}</p>
                    <button class="btn btn-sm btn-info me-2 view-order-details" data-order-id="${pedidoId}">Ver Detalhes</button>
                    <button class="btn btn-sm btn-warning request-exchange" data-order-id="${pedidoId}">Realizar Troca/Devolução</button>
                </div>
            `;

            ordersListContainer.appendChild(orderCard);
        });

        // Eventos de "Ver Detalhes"
        document.querySelectorAll('.view-order-details').forEach(button => {
            button.addEventListener('click', async e => {
                const orderId = e.target.dataset.orderId;
                const selectedOrder = orders.find(o =>
                    o.pedidoId == orderId ||
                    (o.pedido && o.pedido.id == orderId) ||
                    o.id == orderId
                );
                if (selectedOrder) {
                    // Buscar detalhes completos da transação incluindo os itens
                    await loadOrderDetailsAndShowModal(selectedOrder);
                }
            });
        });

        // Eventos de "Troca/Devolução"
        document.querySelectorAll('.request-exchange').forEach(button => {
            button.addEventListener('click', e => {
                orderIdToExchange = e.target.dataset.orderId;
                const confirmOrderIdSpan = document.getElementById('confirm-order-id');
                if (confirmOrderIdSpan) confirmOrderIdSpan.textContent = orderIdToExchange;
                const confirmExchangeModal = new bootstrap.Modal(document.getElementById('confirmExchangeModal'));
                confirmExchangeModal.show();
            });
        });
    }

    // ================================
    // 🔹 Carrega detalhes completos da transação e exibe o modal
    // ================================
    async function loadOrderDetailsAndShowModal(order) {
        try {
            // Mostrar loading no modal
            const modalBody = document.querySelector('#transacoesModal .modal-body');
            if (modalBody) {
                modalBody.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
            }

            // Buscar detalhes completos da transação por PedidoId
            const pedidoId = order.pedidoId || (order.pedido ? order.pedido.id : order.id);
            const response = await fetch(`https://localhost:7280/api/Transacao/pedido/${pedidoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const transacaoCompleta = await response.json();
            
            // Popular o modal com os dados completos
            populateTransacoesModal(transacaoCompleta);
            
            // Exibir o modal
            const modal = new bootstrap.Modal(document.getElementById('transacoesModal'));
            modal.show();

        } catch (error) {
            console.error("Erro ao carregar detalhes do pedido:", error);
            
            // Mostrar erro no modal
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

    // ================================
    // 🔹 Popula o modal com detalhes
    // ================================
    function populateTransacoesModal(order) {
        const modalTitle = document.getElementById('transacoesModalLabel');
        const modalBody = document.querySelector('#transacoesModal .modal-body');

        // Agora os itens vêm diretamente do ResponseTransacaoDTO
        const itens = order.itens || []; // Itens vêm diretamente da transação

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

    // ================================
    // 🔹 Formata data
    // ================================
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    // ================================
    // 🔹 Inicialização
    // ================================
    await loadOrders();
});
