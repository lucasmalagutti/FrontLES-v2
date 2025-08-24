document.addEventListener('DOMContentLoaded', () => {
    // Simulação de dados de carrinho, endereços e cartões
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let savedAddresses = JSON.parse(localStorage.getItem('savedAddresses')) || [
        { id: '1', street: 'Rua Exemplo, 123', city: 'São Paulo', state: 'SP', zip: '01000-000' },
        { id: '2', street: 'Av. Principal, 456', city: 'Rio de Janeiro', state: 'RJ', zip: '20000-000' }
    ];
    let savedCards = JSON.parse(localStorage.getItem('savedCards')) || [
        { id: '1', last4: '1234', brand: 'Visa' },
        { id: '2', last4: '5678', brand: 'Mastercard' }
    ];

    let selectedAddress = null;
    let selectedCard = null;
    let appliedCoupon = null;
    let couponDiscount = 0;

    const savedAddressesContainer = document.getElementById('saved-addresses');
    const addAddressBtn = document.getElementById('add-address-btn');
    const savedCardsContainer = document.getElementById('saved-cards');
    const addCardBtn = document.getElementById('add-card-btn');
    const couponInput = document.getElementById('coupon-input');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const orderItemsContainer = document.getElementById('order-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');

    // Função para calcular o total considerando frete e cupom
    function calculateTotal() {
        let subtotal = 0;
        let shippingCost = 10.00; // Valor fixo do frete
        
        // Calcular subtotal dos produtos
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        // Aplicar desconto do cupom (se houver)
        let discountAmount = 0;
        let subtotalWithDiscount = subtotal;
        
        if (appliedCoupon && appliedCoupon !== 'FRETEZERO') {
            discountAmount = subtotal * (couponDiscount / 100);
            subtotalWithDiscount = subtotal - discountAmount;
        }
        
        // Aplicar cupom de frete grátis
        if (appliedCoupon === 'FRETEZERO') {
            shippingCost = 0;
        }
        
        // Calcular total final (subtotal com desconto + frete)
        const total = subtotalWithDiscount + shippingCost;
        
        return {
            subtotal: subtotal,
            subtotalWithDiscount: subtotalWithDiscount,
            discountAmount: discountAmount,
            shippingCost: shippingCost,
            total: total
        };
    }

    function renderAddresses() {
        if (savedAddresses.length === 0) {
            savedAddressesContainer.innerHTML = '<p class="text-muted">Nenhum endereço salvo. Por favor, adicione um.</p>';
        } else {
            savedAddressesContainer.innerHTML = '';
            savedAddresses.forEach(address => {
                const addressDiv = document.createElement('div');
                addressDiv.classList.add('list-group-item', 'd-flex', 'align-items-center');
                addressDiv.innerHTML = `
                    <input class="form-check-input me-2" type="radio" name="shipping-address" id="address-${address.id}" value="${address.id}" ${selectedAddress && selectedAddress.id === address.id ? 'checked' : ''}>
                    <label class="form-check-label stretched-link" for="address-${address.id}">
                        ${address.street}, ${address.city} - ${address.state}, ${address.zip}
                    </label>
                `;
                addressDiv.querySelector('input').addEventListener('change', () => {
                    selectedAddress = address;
                    updatePlaceOrderButtonState();
                });
                savedAddressesContainer.appendChild(addressDiv);
            });
        }
    }

    function renderCards() {
        if (savedCards.length === 0) {
            savedCardsContainer.innerHTML = '<p class="text-muted">Nenhum cartão salvo. Por favor, adicione um.</p>';
        } else {
            savedCardsContainer.innerHTML = '';
            savedCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('list-group-item', 'd-flex', 'align-items-center');
                cardDiv.innerHTML = `
                    <input class="form-check-input me-2" type="radio" name="payment-method" id="card-${card.id}" value="${card.id}" ${selectedCard && selectedCard.id === card.id ? 'checked' : ''}>
                    <label class="form-check-label stretched-link" for="card-${card.id}">
                        ${card.brand} **** ${card.last4}
                    </label>
                `;
                cardDiv.querySelector('input').addEventListener('change', () => {
                    selectedCard = card;
                    updatePlaceOrderButtonState();
                });
                savedCardsContainer.appendChild(cardDiv);
            });
        }
    }

    function renderOrderSummary() {
        orderItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.classList.add('list-group-item', 'text-muted');
            emptyItem.textContent = 'Seu carrinho está vazio.';
            orderItemsContainer.appendChild(emptyItem);
        } else {
            cart.forEach(item => {
                const itemLi = document.createElement('li');
                itemLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                itemLi.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                `;
                orderItemsContainer.appendChild(itemLi);
            });
        }
        
        // Calcular totais usando a nova função
        const totals = calculateTotal();
        
        // Atualizar o valor do frete
        const shippingCostSpan = document.getElementById('shipping-cost');
        if (shippingCostSpan) {
            if (totals.shippingCost === 0) {
                shippingCostSpan.textContent = 'Grátis';
                shippingCostSpan.classList.add('text-success');
            } else {
                shippingCostSpan.textContent = `R$ ${totals.shippingCost.toFixed(2)}`;
                shippingCostSpan.classList.remove('text-success');
            }
        }
        
        // Atualizar o total
        totalAmountSpan.textContent = `R$ ${totals.total.toFixed(2)}`;
        
        // Se há cupom aplicado, mostrar o desconto
        if (appliedCoupon) {
            // Adicionar linha de desconto se não existir
            let discountRow = document.getElementById('discount-row');
            if (!discountRow) {
                discountRow = document.createElement('div');
                discountRow.id = 'discount-row';
                discountRow.classList.add('d-flex', 'justify-content-between', 'p-2', 'border-top', 'text-success');
                discountRow.innerHTML = `
                    <span>Desconto (${appliedCoupon}):</span>
                    <span>-R$ ${totals.discountAmount.toFixed(2)}</span>
                `;
                
                // Inserir antes do frete
                const shippingRow = document.querySelector('.order-summary .border-top');
                if (shippingRow) {
                    shippingRow.parentNode.insertBefore(discountRow, shippingRow);
                }
            } else {
                discountRow.innerHTML = `
                    <span>Desconto (${appliedCoupon}):</span>
                    <span>-R$ ${totals.discountAmount.toFixed(2)}</span>
                `;
            }
        } else {
            // Remover linha de desconto se não há cupom
            const discountRow = document.getElementById('discount-row');
            if (discountRow) {
                discountRow.remove();
            }
        }
    }

    function updatePlaceOrderButtonState() {
        if (selectedAddress && selectedCard && cart.length > 0) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.classList.remove('btn-secondary');
            placeOrderBtn.classList.add('btn-success');
        } else {
            placeOrderBtn.disabled = true;
            placeOrderBtn.classList.remove('btn-success');
            placeOrderBtn.classList.add('btn-secondary');
        }
    }

    // Event Listeners
    addAddressBtn.addEventListener('click', () => {
        const addEnderecoModalEl = document.getElementById('addEnderecoModal');
        if (addEnderecoModalEl) {
            const addEnderecoModal = new bootstrap.Modal(addEnderecoModalEl);
            addEnderecoModal.show();
        }
    });

    addCardBtn.addEventListener('click', () => {
        const addCartaoModalEl = document.getElementById('addCartaoModal');
        if (addCartaoModalEl) {
            const addCartaoModal = new bootstrap.Modal(addCartaoModalEl);
            addCartaoModal.show();
        }
    });

    applyCouponBtn.addEventListener('click', () => {
        const couponCode = couponInput.value.trim();
        if (couponCode) {
            // Simular cupons válidos (em um sistema real, isso viria do backend)
            const validCoupons = {
                'DESCONTO10': 10, // 10% de desconto
                'DESCONTO20': 20, // 20% de desconto
                'FRETEZERO': 0    // Frete grátis
            };
            
            if (validCoupons.hasOwnProperty(couponCode.toUpperCase())) {
                appliedCoupon = couponCode.toUpperCase();
                couponDiscount = validCoupons[appliedCoupon];
                
                // Se for cupom de frete grátis, aplicar desconto no frete
                if (couponCode.toUpperCase() === 'FRETEZERO') {
                    couponDiscount = 0; // Não aplicar desconto percentual
                }
                
                alert(`Cupom ${appliedCoupon} aplicado com sucesso!`);
                couponInput.value = '';
                renderOrderSummary(); // Recalcular totais
            } else {
                alert('Cupom inválido. Tente: DESCONTO10, DESCONTO20 ou FRETEZERO');
            }
        } else {
            alert('Por favor, digite um código de cupom.');
        }
    });

    placeOrderBtn.addEventListener('click', () => {
        if (selectedAddress && selectedCard) {
            alert('Compra efetuada!');
            localStorage.removeItem('cart'); // Limpar carrinho após a compra
            setTimeout(() => {
                window.location.href = 'index.html?order=success';
            }, 1000);
        } else {
            alert('Por favor, selecione um endereço de entrega e um método de pagamento.');
        }
    });

    cancelOrderBtn.addEventListener('click', () => {
        alert('Pedido cancelado!');
        setTimeout(() => {
            window.location.href = 'index.html?order=cancelled';
        }, 1000);
    });

    // Inicialização
    renderAddresses();
    renderCards();
    renderOrderSummary();
    updatePlaceOrderButtonState();
});
