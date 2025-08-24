document.addEventListener('sharedContentLoaded', () => {
    // Dados simulados de pedidos
    let orders = JSON.parse(localStorage.getItem('orders')) || [
        {
            id: 'ORD001',
            status: 'EM PROCESSAMENTO',
            date: '2023-10-26',
            total: 150.75,
            items: [
                { product: 'Bola de Futebol Nike', brand: 'Nike', sport: 'Futebol', price: 100.00, quantity: 1, code: '0001', deliveryAddress: 'Rua Glicério, 70 - Itaquaquecetuba, SP' },
                { product: 'Meia de Basquete Adidas', brand: 'Adidas', sport: 'Basquete', price: 25.30, quantity: 2, code: '0002', deliveryAddress: 'Rua Glicério, 70 - Itaquaquecetuba, SP' }
            ]
        },
        {
            id: 'ORD002',
            status: 'ENTREGUE',
            date: '2023-10-20',
            total: 75.00,
            items: [
                { product: 'Camisa de Time São Paulo', brand: 'Adidas', sport: 'Futebol', price: 75.00, quantity: 1, code: '0003', deliveryAddress: 'Av. Principal, 456 - Rio de Janeiro, RJ' }
            ]
        }
    ];

    const ordersListContainer = document.getElementById('orders-list');

    // Variável para armazenar o ID do pedido que será trocado
    let orderIdToExchange = null;

    function renderOrders() {
        if (orders.length === 0) {
            ordersListContainer.innerHTML = '<p class="text-muted text-center">Nenhum pedido encontrado.</p>';
        } else {
            ordersListContainer.innerHTML = '';
            orders.forEach(order => {
                const orderCard = document.createElement('div');
                orderCard.classList.add('card', 'mb-3', 'shadow-sm');
                orderCard.innerHTML = `
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Pedido #${order.id}</h5>
                        <span class="badge bg-primary">${order.status}</span>

                    </div>
                    <div class="card-body">
                        <p class="card-text">Data: ${order.date}</p>
                        <p class="card-text">Total: R$ ${order.total.toFixed(2)}</p>
                        <button class="btn btn-sm btn-info me-2 view-order-details" data-order-id="${order.id}">Ver Detalhes</button>
                        <button class="btn btn-sm btn-warning request-exchange" data-order-id="${order.id}" ${order.status === 'EM TROCA' ? 'disabled' : ''}>Realizar Troca/Devolução</button>
                    </div>
                `;
                ordersListContainer.appendChild(orderCard);
            });

            // Event Listeners para Ver Detalhes
            document.querySelectorAll('.view-order-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const orderId = event.target.dataset.orderId;
                    const selectedOrder = orders.find(order => order.id === orderId);
                    if (selectedOrder) {
                        populateTransacoesModal(selectedOrder);
                        const transacoesModalEl = document.getElementById('transacoesModal');
                        if (transacoesModalEl) {
                            const transacoesModal = new bootstrap.Modal(transacoesModalEl);
                            transacoesModal.show();
                        }
                    }
                });
            });

            // Event Listeners para Realizar Troca/Devolução
            document.querySelectorAll('.request-exchange').forEach(button => {
                button.addEventListener('click', (event) => {
                    orderIdToExchange = event.target.dataset.orderId;
                    const confirmOrderIdSpan = document.getElementById('confirm-order-id');
                    if (confirmOrderIdSpan) {
                        confirmOrderIdSpan.textContent = orderIdToExchange;
                    }
                    const confirmExchangeModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmExchangeModal'));
                    confirmExchangeModal.show();
                });
            });
        }
    }

    // Event Listener para o botão de confirmação dentro do modal
    const confirmExchangeBtn = document.getElementById('confirm-exchange-btn');
    if (confirmExchangeBtn) {
        confirmExchangeBtn.addEventListener('click', () => {
            if (orderIdToExchange) {
                const orderIndex = orders.findIndex(order => order.id === orderIdToExchange);
                if (orderIndex !== -1) {
                    orders[orderIndex].status = 'EM TROCA';
                    localStorage.setItem('orders', JSON.stringify(orders));
                    renderOrders(); // Re-renderiza a lista para refletir a mudança de status
                    showAlert(`Pedido #${orderIdToExchange} em troca.`, 'info');
                }
                const confirmExchangeModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmExchangeModal'));
                confirmExchangeModal.hide();
                orderIdToExchange = null; // Limpa o ID do pedido após a ação
            }
        });
    }

    function populateTransacoesModal(order) {
        const modalTitle = document.getElementById('transacoesModalLabel');
        if (modalTitle) modalTitle.textContent = `Detalhes do Pedido #${order.id}`;

        const modalBody = document.querySelector('#transacoesModal .modal-body');
        if (modalBody) {
            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="table-responsive mb-3">
                        <table class="table table-bordered table-striped">
                            <tbody>
                                <tr>
                                    <th>Produto:</th>
                                    <td>${item.product}</td>
                                </tr>
                                <tr>
                                    <th>Marca:</th>
                                    <td>${item.brand}</td>
                                </tr>
                                <tr>
                                    <th>Esporte:</th>
                                    <td>${item.sport}</td>
                                </tr>
                                <tr>
                                    <th>Preço:</th>
                                    <td>R$ ${item.price.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Quantidade:</th>
                                    <td>${item.quantity}</td>
                                </tr>
                                <tr>
                                    <th>Código do Produto:</th>
                                    <td>${item.code}</td>
                                </tr>
                                <tr>
                                    <th>Endereço de Entrega:</th>
                                    <td>${item.deliveryAddress}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });
            modalBody.innerHTML = `
                <p><strong>Data do Pedido:</strong> ${order.date}</p>
                <p><strong>Total do Pedido:</strong> R$ ${order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="badge bg-primary">${order.status}</span></p>
                <hr>
                <h5>Itens do Pedido:</h5>
                ${itemsHtml}
            `;
        }
    }

    // Inicialização
    renderOrders();
});
