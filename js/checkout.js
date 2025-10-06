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
    let appliedCouponsData = []; // Array para armazenar dados dos cupons aplicados
    let couponDiscount = 0;

    const CLIENT_ID = 33; // ID do cliente para testes

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
        let shippingCost = 0;
        
        // Calcular subtotal dos produtos
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        // Calcular frete baseado no estado do endereço selecionado
        if (selectedAddress) {
            if (selectedAddress.estado === 'SP') {
                shippingCost = 10.00; // SP = R$ 10,00
            } else {
                shippingCost = 20.00; // Outros estados = R$ 20,00
            }
        } else {
            shippingCost = 0.00; // Valor padrão se não houver endereço selecionado
        }
        
        // Aplicar cupom de frete grátis - zerar frete se FRETEZERO estiver aplicado
        if (appliedCoupons.includes('FRETEZERO')) {
            shippingCost = 0;
        }
        
        // Aplicar desconto dos cupons (se houver)
        let totalDiscountAmount = 0;
        let subtotalWithDiscount = subtotal;
        
        if (appliedCouponsData.length > 0) {
            // Para cada cupom aplicado, aplicar o desconto correspondente
            appliedCouponsData.forEach(cupomData => {
                if (cupomData.nome.toUpperCase() !== 'FRETEZERO') {
                    // Aplicar desconto percentual baseado no valor retornado pela API
                    totalDiscountAmount += subtotal * cupomData.desconto;
                }
            });
            
            subtotalWithDiscount = subtotal - totalDiscountAmount;
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
                    renderOrderSummary(); // Recalcular total com novo frete
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
        if (appliedCouponsData.length === 0) {
            appliedCouponsContainer.innerHTML = '<p class="text-muted">Nenhum cupom aplicado.</p>';
        } else {
            appliedCouponsContainer.innerHTML = '';
            appliedCouponsData.forEach((cupomData, index) => {
                const couponDiv = document.createElement('div');
                couponDiv.classList.add('badge', 'bg-info', 'text-dark', 'me-2', 'mb-2', 'p-2');
                
                let discountText = '';
                if (cupomData.nome.toUpperCase() === 'FRETEZERO') {
                    discountText = 'Frete Grátis';
                } else {
                    discountText = `${(cupomData.desconto * 100).toFixed(0)}% de desconto`;
                }
                
                couponDiv.innerHTML = `
                    ${cupomData.nome} (${discountText})
                    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remover cupom"></button>
                `;
                
                couponDiv.querySelector('.btn-close').addEventListener('click', () => {
                    removeCoupon(appliedCoupons[index]);
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
        if (appliedCouponsData.length > 0) {
            // Adicionar linha de desconto se não existir
            let discountRow = document.getElementById('discount-row');
            if (!discountRow) {
                discountRow = document.createElement('div');
                discountRow.id = 'discount-row';
                discountRow.classList.add('d-flex', 'justify-content-between', 'p-2', 'border-top', 'text-success');
                discountRow.innerHTML = `
                    <span>Desconto (${appliedCouponsData.map(c => c.nome).join(', ')}):</span>
                    <span>-R$ ${totals.discountAmount.toFixed(2)}</span>
                `;
                
                // Inserir antes do frete
                const shippingRow = document.querySelector('.order-summary .border-top');
                if (shippingRow) {
                    shippingRow.parentNode.insertBefore(discountRow, shippingRow);
                }
            } else {
                discountRow.innerHTML = `
                    <span>Desconto (${appliedCouponsData.map(c => c.nome).join(', ')}):</span>
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

    async function applyCoupon(couponCode) {
        if (!couponCode || couponCode.trim() === '') {
            alert('Por favor, digite um código de cupom.');
            return;
        }

        // Verificar se o cupom já foi aplicado
        if (appliedCoupons.includes(couponCode.toUpperCase())) {
            alert('Este cupom já foi aplicado.');
            return;
        }

        try {
            const response = await fetch('https://localhost:7280/api/Cupom/validar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: couponCode.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.valido) {
                // Cupom válido - adicionar à lista de cupons aplicados
                appliedCoupons.push(couponCode.toUpperCase());
                appliedCouponsData.push({
                    nome: data.nome,
                    desconto: data.desconto
                });
                
                alert(`Cupom ${couponCode} aplicado com sucesso!`);
                couponInput.value = '';
                renderOrderSummary(); // Recalcular totais
                renderAppliedCoupons(); // Atualizar a lista de cupons aplicados
            } else {
                // Cupom inválido
                alert(data.mensagem || 'Cupom inválido.');
            }
        } catch (error) {
            console.error('Erro ao validar cupom:', error);
            alert('Erro ao validar cupom. Tente novamente.');
        }
    }

    function removeCoupon(couponCode) {
        const index = appliedCoupons.indexOf(couponCode);
        if (index > -1) {
            appliedCoupons.splice(index, 1);
            appliedCouponsData.splice(index, 1); // Remover também os dados do cupom
            renderOrderSummary(); // Recalcular totais
            renderAppliedCoupons(); // Atualizar a lista de cupons aplicados
        }
    }

    // Função para adicionar endereço
    async function adicionarEndereco() {
        const modal = document.getElementById('addEnderecoModal');
        const clienteId = modal.getAttribute('data-cliente-id');

        if (!clienteId || clienteId === "${clienteId}") {
            alert('ID do cliente não encontrado. Por favor, certifique-se de que o ID do cliente está sendo passado corretamente para o modal.');
            return;
        }

        const endereco = {
            nome: document.getElementById('enderecoNome').value,
            tipoEndereco: parseInt(document.getElementById('enderecoTipoEndereco').value),
            tipoResidencia: parseInt(document.getElementById('enderecoTipoResidencia').value),
            tipoLogradouro: parseInt(document.getElementById('enderecoTipoLogradouro').value),
            logradouro: document.getElementById('enderecoLogradouro').value,
            numero: document.getElementById('enderecoNumero').value,
            cep: document.getElementById('enderecoCep').value,
            bairro: document.getElementById('enderecoBairro').value,
            cidade: document.getElementById('enderecoCidade').value,
            estado: document.getElementById('enderecoEstado').value,
            pais: document.getElementById('enderecoPais').value,
            observacoes: document.getElementById('enderecoObservacoes').value
        };

        try {
            const response = await fetch(`https://localhost:7280/Endereco/Cadastrar/${clienteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(endereco)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar o endereço');
            }

            const data = await response.json();
            alert('Endereço salvo com sucesso!');
            
            // Fechar o modal após o sucesso
            const addEnderecoModal = bootstrap.Modal.getInstance(document.getElementById('addEnderecoModal'));
            if (addEnderecoModal) {
                addEnderecoModal.hide();
            }
            
            // Recarregar a lista de endereços
            await fetchAddresses(CLIENT_ID);
            
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            alert('Erro ao salvar o endereço: ' + error.message);
        }
    }

    // Função para adicionar cartão
    async function adicionarCartao() {
        const modal = document.getElementById('addCartaoModal');
        const clienteId = modal.getAttribute('data-cliente-id');

        if (!clienteId || clienteId === "${clienteId}") {
            alert('ID do cliente não encontrado. Por favor, certifique-se de que o ID do cliente está sendo passado corretamente para o modal.');
            return;
        }

        const cartao = {
            numCartao: document.getElementById('addCartaoNumero').value,
            nomeImpresso: document.getElementById('addCartaoNomeImpresso').value,
            bandeira: parseInt(document.getElementById('addCartaoBandeira').value),
            cvc: parseInt(document.getElementById('addCartaoCvv').value),
            preferencial: false
        };

        try {
            const response = await fetch(`https://localhost:7280/Cartao/Cadastrar/${clienteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartao)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || 'Erro ao salvar o cartão');
            }

            alert('Cartão salvo com sucesso!');
            
            // Fechar o modal após o sucesso
            const addCartaoModal = bootstrap.Modal.getInstance(document.getElementById('addCartaoModal'));
            if (addCartaoModal) {
                addCartaoModal.hide();
            }
            
            // Recarregar a lista de cartões
            await fetchCards(CLIENT_ID);
            
        } catch (error) {
            console.error('Erro ao salvar cartão:', error);
            alert('Erro ao salvar o cartão: ' + error.message);
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

    // Configurar event listeners para os botões dos modais
    function setupModalEventListeners() {
        // Event listener para o botão "Salvar Endereço"
        const salvarEnderecoBtn = document.getElementById('salvarEnderecoBtn');
        if (salvarEnderecoBtn) {
            salvarEnderecoBtn.addEventListener('click', adicionarEndereco);
        }

        // Event listener para o botão "Salvar Cartão"
        const salvarCartaoBtn = document.getElementById('salvarCartaoBtn');
        if (salvarCartaoBtn) {
            salvarCartaoBtn.addEventListener('click', adicionarCartao);
        }
    }

    // Usar MutationObserver para detectar quando os modais são carregados
    const modalObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === 1) {
                        // Verificar se o modal de endereço foi adicionado
                        if (addedNode.id === 'addEnderecoModal') {
                            const salvarEnderecoBtn = document.getElementById('salvarEnderecoBtn');
                            if (salvarEnderecoBtn) {
                                salvarEnderecoBtn.addEventListener('click', adicionarEndereco);
                            }
                        }
                        // Verificar se o modal de cartão foi adicionado
                        if (addedNode.id === 'addCartaoModal') {
                            const salvarCartaoBtn = document.getElementById('salvarCartaoBtn');
                            if (salvarCartaoBtn) {
                                salvarCartaoBtn.addEventListener('click', adicionarCartao);
                            }
                        }
                    }
                }
            }
        }
    });

    // Começar a observar mudanças no DOM
    modalObserver.observe(document.body, { childList: true, subtree: true });

    // Inicialização
    renderAddresses();
    renderCards();
    renderAppliedCoupons(); // Inicializar a lista de cupons aplicados
    renderOrderSummary();
    updatePlaceOrderButtonState();
    setupModalEventListeners(); // Configurar event listeners dos modais
});
