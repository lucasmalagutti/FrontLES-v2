document.addEventListener('sharedContentLoaded', async () => {

    const ordersListContainer = document.getElementById('orders-list');
    const clienteId = 1; // ID mocado para teste
    const apiUrl = `https://localhost:7280/Transacao/Listar/${clienteId}`;

    let orders = [];
    let orderIdToExchange = null;

    async function loadOrders() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

            const data = await response.json();

            // Se sua API retorna apenas 1 pedido (não uma lista), ajustamos para um array
            if (Array.isArray(data)) {
                orders = data;
            } else if (data && data.transacoes) {
                orders = data.transacoes; // Exemplo: se o DTO tiver uma propriedade com as transações
            } else {
                orders = [data]; // Apenas um pedido
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
            orderCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Pedido #${order.id || order.idTransacao || '—'}</h5>
                    <span class="badge bg-primary">${order.status || 'EM PROCESSAMENTO'}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">Data: ${formatDate(order.dataTransacao || order.date)}</p>
                    <p class="card-text">Total: R$ ${(order.valorTotal || order.total || 0).toFixed(2)}</p>
                    <button class="btn btn-sm btn-info me-2 view-order-details" data-order-id="${order.id || order.idTransacao}">Ver Detalhes</button>
                    <button class="btn btn-sm btn-warning request-exchange" data-order-id="${order.id || order.idTransacao}">Realizar Troca/Devolução</button>
                </div>
            `;
            ordersListContainer.appendChild(orderCard);
        });

        // Atribui os eventos dos botões
        document.querySelectorAll('.view-order-details').forEach(button => {
            button.addEventListener('click', e => {
                const orderId = e.target.dataset.orderId;
                const selectedOrder = orders.find(o => o.id == orderId || o.idTransacao == orderId);
                if (selectedOrder) {
                    populateTransacoesModal(selectedOrder);
                    const modal = new bootstrap.Modal(document.getElementById('transacoesModal'));
                    modal.show();
                }
            });
        });

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

    // Modal de detalhes
    function populateTransacoesModal(order) {
        const modalTitle = document.getElementById('transacoesModalLabel');
        const modalBody = document.querySelector('#transacoesModal .modal-body');

        if (modalTitle) modalTitle.textContent = `Detalhes do Pedido #${order.id || order.idTransacao}`;

        if (modalBody) {
            let itemsHtml = '';

            // Se o backend retorna uma lista de itens, renderiza
            if (order.itens && Array.isArray(order.itens)) {
                order.itens.forEach(item => {
                    itemsHtml += `
                        <div class="table-responsive mb-3">
                            <table class="table table-bordered table-striped">
                                <tbody>
                                    <tr><th>Produto:</th><td>${item.nomeProduto || item.product}</td></tr>
                                    <tr><th>Preço:</th><td>R$ ${(item.preco || item.price).toFixed(2)}</td></tr>
                                    <tr><th>Quantidade:</th><td>${item.quantidade || item.quantity}</td></tr>
                                    <tr><th>Código:</th><td>${item.codigoProduto || item.code}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                });
            }

            modalBody.innerHTML = `
                <p><strong>Data do Pedido:</strong> ${formatDate(order.dataTransacao || order.date)}</p>
                <p><strong>Total:</strong> R$ ${(order.valorTotal || order.total || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="badge bg-primary">${order.status || 'EM PROCESSAMENTO'}</span></p>
                <hr>
                <h5>Itens do Pedido:</h5>
                ${itemsHtml || '<p>Nenhum item encontrado.</p>'}
            `;
        }
    }

    // Formata data YYYY-MM-DD -> DD/MM/YYYY
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR');
    }

    // Inicialização
    await loadOrders();
});
