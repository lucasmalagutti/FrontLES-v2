document.addEventListener('sharedContentLoaded', () => {
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
    let appliedCoupons = []; // Array para múltiplos cupons
    let couponDiscount = 0;

    const savedAddressesContainer = document.getElementById('saved-addresses');
    const addAddressBtn = document.getElementById('add-address-btn');
    const savedCardsContainer = document.getElementById('saved-cards');
    const addCardBtn = document.getElementById('add-card-btn');
    const couponInput = document.getElementById('coupon-input');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const appliedCouponsContainer = document.getElementById('applied-coupons');
    const orderItemsContainer = document.getElementById('order-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');

    // Função para calcular o total considerando frete e cupons
    function calculateTotal() {
        let subtotal = 0;
        let shippingCost = 10.00; // Valor fixo do frete
        
        // Calcular subtotal dos produtos
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        // Aplicar desconto dos cupons (se houver)
        let totalDiscountAmount = 0;
        let subtotalWithDiscount = subtotal;
        
        if (appliedCoupons.length > 0) {
            // Calcular desconto total de todos os cupons percentuais
            appliedCoupons.forEach(coupon => {
                if (coupon !== 'FRETEZERO') {
                    const validCoupons = {
                        'DESCONTO10': 10,
                        'DESCONTO20': 20
                    };
                    if (validCoupons[coupon]) {
                        totalDiscountAmount += subtotal * (validCoupons[coupon] / 100);
                    }
                }
            });
            
            subtotalWithDiscount = subtotal - totalDiscountAmount;
        }
        
        // Aplicar cupom de frete grátis
        if (appliedCoupons.includes('FRETEZERO')) {
            shippingCost = 0;
        }
        
        // Calcular total final (subtotal com desconto + frete)
        const total = subtotalWithDiscount + shippingCost;
        
        return {
            subtotal: subtotal,
            subtotalWithDiscount: subtotalWithDiscount,
            discountAmount: totalDiscountAmount,
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

    function renderAppliedCoupons() {
        if (appliedCoupons.length === 0) {
            appliedCouponsContainer.innerHTML = '<p class="text-muted">Nenhum cupom aplicado.</p>';
        } else {
            appliedCouponsContainer.innerHTML = '';
            appliedCoupons.forEach(coupon => {
                const couponDiv = document.createElement('div');
                couponDiv.classList.add('badge', 'bg-info', 'text-dark', 'me-2', 'mb-2', 'p-2');
                
                let discountText = '';
                if (coupon === 'FRETEZERO') {
                    discountText = 'Frete Grátis';
                } else if (coupon === 'DESCONTO10') {
                    discountText = '10% de desconto';
                } else if (coupon === 'DESCONTO20') {
                    discountText = '20% de desconto';
                }
                
                couponDiv.innerHTML = `
                    ${coupon} (${discountText})
                    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remover cupom"></button>
                `;
                
                couponDiv.querySelector('.btn-close').addEventListener('click', () => {
                    removeCoupon(coupon);
                });
                
                appliedCouponsContainer.appendChild(couponDiv);
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
        if (appliedCoupons.length > 0) {
            // Adicionar linha de desconto se não existir
            let discountRow = document.getElementById('discount-row');
            if (!discountRow) {
                discountRow = document.createElement('div');
                discountRow.id = 'discount-row';
                discountRow.classList.add('d-flex', 'justify-content-between', 'p-2', 'border-top', 'text-success');
                discountRow.innerHTML = `
                    <span>Desconto (${appliedCoupons.join(', ')}):</span>
                    <span>-R$ ${totals.discountAmount.toFixed(2)}</span>
                `;
                
                // Inserir antes do frete
                const shippingRow = document.querySelector('.order-summary .border-top');
                if (shippingRow) {
                    shippingRow.parentNode.insertBefore(discountRow, shippingRow);
                }
            } else {
                discountRow.innerHTML = `
                    <span>Desconto (${appliedCoupons.join(', ')}):</span>
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

    function applyCoupon(couponCode) {
        const validCoupons = {
            'DESCONTO10': 10, // 10% de desconto
            'DESCONTO20': 20, // 20% de desconto
            'FRETEZERO': 0    // Frete grátis
        };
        
        if (validCoupons.hasOwnProperty(couponCode.toUpperCase())) {
            if (!appliedCoupons.includes(couponCode.toUpperCase())) {
                appliedCoupons.push(couponCode.toUpperCase());
                couponDiscount = validCoupons[couponCode.toUpperCase()];
                
                // Se for cupom de frete grátis, aplicar desconto no frete
                if (couponCode.toUpperCase() === 'FRETEZERO') {
                    couponDiscount = 0; // Não aplicar desconto percentual
                }
                
                alert(`Cupom ${couponCode} aplicado com sucesso!`);
                couponInput.value = '';
                renderOrderSummary(); // Recalcular totais
                renderAppliedCoupons(); // Atualizar a lista de cupons aplicados
            } else {
                alert('Este cupom já foi aplicado.');
            }
        } else {
            alert('Cupom inválido. Tente: DESCONTO10, DESCONTO20 ou FRETEZERO');
        }
    }

    function removeCoupon(couponCode) {
        const index = appliedCoupons.indexOf(couponCode);
        if (index > -1) {
            appliedCoupons.splice(index, 1);
            renderOrderSummary(); // Recalcular totais
            renderAppliedCoupons(); // Atualizar a lista de cupons aplicados
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
            applyCoupon(couponCode);
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
    renderAppliedCoupons(); // Inicializar a lista de cupons aplicados
    renderOrderSummary();
    updatePlaceOrderButtonState();
});
