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

            // Garante que seja um array
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
    // 🔹 Renderiza os pedidos
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
            const pedidoId = order.pedidoId || order.id || '—';

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

        // Botões de detalhes
        document.querySelectorAll('.view-order-details').forEach(button => {
            button.addEventListener('click', e => {
                const orderId = e.target.dataset.orderId;
                const selectedOrder = orders.find(o => o.pedidoId == orderId || o.id == orderId);
                if (selectedOrder) {
                    populateTransacoesModal(selectedOrder);
                    const modal = new bootstrap.Modal(document.getElementById('transacoesModal'));
                    modal.show();
                }
            });
        });

        // Botões de troca/devolução
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
    // 🔹 Modal de detalhes da transação
    // ================================
    function populateTransacoesModal(order) {
        const modalTitle = document.getElementById('transacoesModalLabel');
        const modalBody = document.querySelector('#transacoesModal .modal-body');

        if (modalTitle)
            modalTitle.textContent = `Detalhes do Pedido #${order.pedidoId || order.id}`;

        if (modalBody) {
            let itemsHtml = '';

            // Se o backend retornar os itens (em DTOs futuros), renderiza
            if (order.itens && Array.isArray(order.itens)) {
                order.itens.forEach(item => {
                    itemsHtml += `
                        <div class="table-responsive mb-3">
                            <table class="table table-bordered table-striped">
                                <tbody>
                                    <tr><th>Produto:</th><td>${item.nomeProduto || item.product || '—'}</td></tr>
                                    <tr><th>Preço:</th><td>R$ ${(item.preco || item.price || 0).toFixed(2)}</td></tr>
                                    <tr><th>Quantidade:</th><td>${item.quantidade || item.quantity || 1}</td></tr>
                                    <tr><th>Código:</th><td>${item.codigoProduto || item.code || '—'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                });
            }

            modalBody.innerHTML = `
                <p><strong>Data da Transação:</strong> ${formatDate(order.dataTransacao)}</p>
                <p><strong>Valor Total:</strong> R$ ${(order.valorTotal || 0).toFixed(2)}</p>
                <p><strong>Frete:</strong> R$ ${(order.valorFrete || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="badge bg-primary">${order.statusTransacao || '—'}</span></p>
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
