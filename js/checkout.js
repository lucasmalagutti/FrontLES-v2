document.addEventListener('sharedContentLoaded', async () => {
    // Limpar localStorage do carrinho para evitar dados antigos
    localStorage.removeItem('cart');
    
    // Carregar carrinho do backend (ClienteID 33 para testes)
    let cart = []; // Sempre iniciar vazio
    try {
        // Para testes, sempre usar backend com ClienteID 33
        if (window.carrinhoService) {
            const carrinhoBackend = await window.carrinhoService.obterCarrinho();
            cart = carrinhoBackend.itens.map(item => ({
                id: item.produtoId,
                name: item.nomeProduto,
                price: item.precoUnitario,
                quantity: item.quantidade,
                image: item.imagemProduto
            }));
        }
        // Se não conseguir carregar do backend, manter vazio
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        // Manter carrinho vazio se não conseguir carregar do backend
    }

    // Declarar os contêineres e botões no início para evitar ReferenceError
    const savedAddressesContainer = document.getElementById('saved-addresses');
    const addAddressBtn = document.getElementById('add-address-btn');
    const savedCardsContainer = document.getElementById('saved-cards');
    const addCardBtn = document.getElementById('add-card-btn');

    // Variáveis para armazenar endereços e cartões carregados da API
    let addresses = [];
    let cards = [];

    let selectedAddress = null;
    let selectedCard = null;
    let appliedCoupons = []; // Array para múltiplos cupons
    let couponDiscount = 0;

    const CLIENT_ID = 15; // ID do cliente para testes

    async function fetchAddresses(clientId) {
        try {
            const response = await fetch(`https://localhost:7280/Endereco/Listar/${clientId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            addresses = await response.json();
            console.log('Endereços carregados da API:', addresses);
            renderAddresses(); // Renderiza os endereços após o carregamento
        } catch (error) {
            console.error('Erro ao carregar endereços da API:', error);
            addresses = []; // Garante que a lista de endereços esteja vazia em caso de erro
        }
    }

    async function fetchCards(clientId) {
        try {
            const response = await fetch(`https://localhost:7280/Cartao/Listar/${clientId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            cards = await response.json();
            console.log('Cartões carregados da API:', cards);
            renderCards(); // Renderiza os cartões após o carregamento
        } catch (error) {
            console.error('Erro ao carregar cartões da API:', error);
            cards = []; // Garante que a lista de cartões esteja vazia em caso de erro
        }
    }

    // Chamar as funções de carregamento na inicialização
    await fetchAddresses(CLIENT_ID);
    await fetchCards(CLIENT_ID);

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
        if (addresses.length === 0) {
            savedAddressesContainer.innerHTML = '<p class="text-muted">Nenhum endereço salvo. Por favor, adicione um.</p>';
        } else {
            savedAddressesContainer.innerHTML = '';
            addresses.forEach(address => {
                const addressDiv = document.createElement('div');
                addressDiv.classList.add('list-group-item', 'd-flex', 'align-items-center');
                addressDiv.innerHTML = `
                    <input class="form-check-input me-2" type="radio" name="shipping-address" id="address-${address.id}" value="${address.id}" ${selectedAddress && selectedAddress.id === address.id ? 'checked' : ''}>
                    <label class="form-check-label stretched-link" for="address-${address.id}">
                        ${address.logradouro}, ${address.numero} - ${address.cidade}, ${address.estado}, ${address.cep}
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
        if (cards.length === 0) {
            savedCardsContainer.innerHTML = '<p class="text-muted">Nenhum cartão salvo. Por favor, adicione um.</p>';
        } else {
            savedCardsContainer.innerHTML = '';
            cards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('list-group-item', 'd-flex', 'align-items-center');

                // Mapeamento para exibir o nome da bandeira
                const bandeiraMap = {
                    0: 'Visa',
                    1: 'Mastercard',
                    // Adicione outras bandeiras conforme necessário
                };
                const bandeiraNome = bandeiraMap[card.bandeira] || 'Desconhecida';

                cardDiv.innerHTML = `
                    <input class="form-check-input me-2" type="radio" name="payment-method" id="card-${card.id}" value="${card.id}" ${selectedCard && selectedCard.id === card.id ? 'checked' : ''}>
                    <label class="form-check-label stretched-link" for="card-${card.id}">
                        ${bandeiraNome} ${card.numCartao}
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

    placeOrderBtn.addEventListener('click', async () => {
        if (selectedAddress && selectedCard) {
            try {
                // Para testes, sempre usar backend com ClienteID 33
                if (window.carrinhoService) {
                    await window.carrinhoService.finalizarCarrinho();
                } else {
                    // Limpar carrinho local se não estiver logado
                    localStorage.removeItem('cart');
                }
                
                alert('Compra efetuada!');
                setTimeout(() => {
                    window.location.href = 'index.html?order=success';
                }, 1000);
            } catch (error) {
                console.error('Erro ao finalizar pedido:', error);
                alert('Erro ao finalizar pedido. Tente novamente.');
            }
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
