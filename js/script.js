import { carregarProdutos } from './productData.js';

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        const newAlertContainer = document.createElement('div');
        newAlertContainer.id = 'alertContainer';
        document.body.appendChild(newAlertContainer);
        Object.assign(newAlertContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1050',
            maxWidth: '300px'
        });
    }

    const finalAlertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    finalAlertContainer.appendChild(alertDiv);
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getInstance(alertDiv);
        if (bsAlert) {
            bsAlert.close();
        } else if (alertDiv) {
            alertDiv.remove();
        }
    }, 5000);
}

let cart = [];

async function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (window.carrinhoService) {
        try {
            await window.carrinhoService.sincronizarCarrinho();
        } catch (error) {
            console.error('Erro ao sincronizar carrinho:', error);
        }
    }
}

function updateCartCount() {
    const cartCountSpan = document.getElementById('cart-count');
    if (cartCountSpan) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    }
}

function updateCartTotal() {
    const cartTotalSpan = document.getElementById('cart-total');
    if (cartTotalSpan) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.textContent = total.toFixed(2);
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalSpan = document.getElementById('cart-total');

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartTotalSpan) cartTotalSpan.textContent = '0.00';
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('d-flex', 'align-items-center', 'mb-3', 'border-bottom', 'pb-3');
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 10px;">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-product-id="${item.id}">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-product-id="${item.id}">+</button>
                        </div>
                        <p class="mb-0">R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <button class="btn btn-danger btn-sm remove-from-cart" data-product-id="${item.id}"><i class="bi bi-trash"></i></button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }
        updateCartTotal();
        updateCartCount();
        saveCartToLocalStorage();
    }
}

export function initializeCartFunctionality() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            
            const productImage = button.dataset.productImage;
            const productCard = button.closest('.product-card');
            const quantityDisplay = productCard.querySelector(`.product-quantity-display[data-product-id="${productId}"]`);
            const quantityToAdd = parseInt(quantityDisplay.textContent);

            try {
                if (window.carrinhoService) {
                    await window.carrinhoService.adicionarItem(productId, quantityToAdd, productPrice);
                    const carrinhoBackend = await window.carrinhoService.obterCarrinho();
                    cart = carrinhoBackend.itens.map(item => ({
                        id: item.produtoId,
                        name: item.nomeProduto,
                        price: item.precoUnitario,
                        quantity: item.quantidade,
                        image: item.imagemProduto
                    }));
                } else {
                    const existingItem = cart.find(item => item.id === productId);

                    if (existingItem) {
                        existingItem.quantity += quantityToAdd;
                    } else {
                        cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: quantityToAdd });
                    }
                }

                renderCart();
                await saveCartToLocalStorage();

                const cartOffcanvasElement = document.getElementById('cartOffcanvas');
                if (bootstrap && bootstrap.Offcanvas && cartOffcanvasElement) {
                    const cartOffcanvas = new bootstrap.Offcanvas(cartOffcanvasElement);
                    cartOffcanvas.show();
                }
                
                if (quantityDisplay) quantityDisplay.textContent = '1';
                
                showAlert('Produto adicionado ao carrinho!', 'success');
            } catch (error) {
                console.error('Erro ao adicionar produto ao carrinho:', error);
                showAlert('Erro ao adicionar produto ao carrinho', 'danger');
            }
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        const productId = card.querySelector('.add-to-cart').dataset.productId;
        const quantityDisplay = card.querySelector(`.product-quantity-display[data-product-id="${productId}"]`);
        const decreaseButton = card.querySelector(`.decrease-product-quantity[data-product-id="${productId}"]`);
        const increaseButton = card.querySelector(`.increase-product-quantity[data-product-id="${productId}"]`);

        if (decreaseButton && quantityDisplay) {
            decreaseButton.addEventListener('click', () => {
                let currentQuantity = parseInt(quantityDisplay.textContent);
                if (currentQuantity > 1) {
                    currentQuantity--;
                    quantityDisplay.textContent = currentQuantity;
                }
            });
        }

        if (increaseButton && quantityDisplay) {
            increaseButton.addEventListener('click', () => {
                let currentQuantity = parseInt(quantityDisplay.textContent);
                currentQuantity++;
                quantityDisplay.textContent = currentQuantity;
            });
        }
    });

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('remove-from-cart') || event.target.closest('.remove-from-cart')) {
                const removeButton = event.target.closest('.remove-from-cart');
                const productId = removeButton.dataset.productId;
                
                try {
                    if (window.carrinhoService) {
                        await window.carrinhoService.removerItem(productId);
                        const carrinhoBackend = await window.carrinhoService.obterCarrinho();
                        cart = carrinhoBackend.itens.map(item => ({
                            id: item.produtoId,
                            name: item.nomeProduto,
                            price: item.precoUnitario,
                            quantity: item.quantidade,
                            image: item.imagemProduto
                        }));
                    } else {
                        cart = cart.filter(item => item.id !== productId);
                    }
                    renderCart();
                    await saveCartToLocalStorage();
                } catch (error) {
                    console.error('Erro ao remover item:', error);
                    showAlert('Erro ao remover item do carrinho', 'danger');
                }
            } else if (event.target.classList.contains('increase-quantity')) {
                const productId = event.target.dataset.productId;
                
                try {
                    if (window.carrinhoService) {
                        await window.carrinhoService.adicionarQtdCarrinho(productId);
                        const carrinhoBackend = await window.carrinhoService.obterCarrinho();
                        cart = carrinhoBackend.itens.map(item => ({
                            id: item.produtoId,
                            name: item.nomeProduto,
                            price: item.precoUnitario,
                            quantity: item.quantidade,
                            image: item.imagemProduto
                        }));
                    } else {
                        const item = cart.find(i => i.id === productId);
                        if (item) {
                            item.quantity++;
                        }
                    }
                    renderCart();
                    await saveCartToLocalStorage();
                } catch (error) {
                    console.error('Erro ao aumentar quantidade:', error);
                    showAlert('Erro ao aumentar quantidade', 'danger');
                }
            } else if (event.target.classList.contains('decrease-quantity')) {
                const productId = event.target.dataset.productId;
                
                try {
                    if (window.carrinhoService) {
                        await window.carrinhoService.diminuirQtdCarrinho(productId);
                        const carrinhoBackend = await window.carrinhoService.obterCarrinho();
                        cart = carrinhoBackend.itens.map(item => ({
                            id: item.produtoId,
                            name: item.nomeProduto,
                            price: item.precoUnitario,
                            quantity: item.quantidade,
                            image: item.imagemProduto
                        }));
                    } else {
                        const item = cart.find(i => i.id === productId);
                        if (item) {
                            item.quantity--;
                            if (item.quantity <= 0) {
                                cart = cart.filter(i => i.id !== productId);
                            }
                        }
                    }
                    renderCart();
                    await saveCartToLocalStorage();
                } catch (error) {
                    console.error('Erro ao diminuir quantidade:', error);
                    showAlert('Erro ao diminuir quantidade', 'danger');
                }
            }
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', async () => {
            try {
                if (window.carrinhoService) {
                    await window.carrinhoService.limparCarrinho();
                    cart = [];
                } else {
                    cart = [];
                }
                renderCart();
                await saveCartToLocalStorage();
                showAlert('Carrinho limpo!', 'info');
            } catch (error) {
                console.error('Erro ao limpar carrinho:', error);
                showAlert('Erro ao limpar carrinho', 'danger');
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length > 0) {
                await saveCartToLocalStorage();
                window.location.href = 'checkout.html';
            } else {
                showAlert('Seu carrinho está vazio!', 'warning');
            }
        });
    }

    renderCart();
}

function renderizarProdutosEmDestaque(produtosParaExibir) {
    const futebolGrid = document.querySelector('#futebol .row');
    const basqueteGrid = document.querySelector('#basquete .row');

    if (futebolGrid) futebolGrid.innerHTML = '';
    if (basqueteGrid) basqueteGrid.innerHTML = '';

    produtosParaExibir.forEach(produto => {
        const produtoHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm product-card">
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.alt}">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">${produto.descricao}</p>
                        <p class="fw-bold fs-5">R$ ${produto.preco.toFixed(2)}</p>
                        <div class="d-flex justify-content-center align-items-center mb-2">
                                <button class="btn btn-sm btn-outline-secondary decrease-product-quantity" data-product-id="${produto.id}">-</button>
                                <span class="mx-2 product-quantity-display" data-product-id="${produto.id}">1</span>
                                <button class="btn btn-sm btn-outline-secondary increase-product-quantity" data-product-id="${produto.id}">+</button>
                            </div>
                        <a href="#" class="btn btn-comprar w-100 add-to-cart" data-product-id="${produto.id}" data-product-name="${produto.nome}" data-product-price="${produto.preco}" data-product-image="${produto.imagem}">Comprar</a>
                    </div>
                </div>
            </div>
        `;
        if (produto.categoria.toLowerCase() === 'futebol' && futebolGrid) {
            futebolGrid.innerHTML += produtoHTML;
        } else if (produto.categoria.toLowerCase() === 'basquete' && basqueteGrid) {
            basqueteGrid.innerHTML += produtoHTML;
        }
    });
    initializeCartFunctionality();
}

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.removeItem('cart');
    if (window.carrinhoService) {
        try {
            const carrinhoBackend = await window.carrinhoService.obterCarrinho();
            cart = carrinhoBackend.itens.map(item => ({
                id: item.produtoId,
                name: item.nomeProduto,
                price: item.precoUnitario,
                quantity: item.quantidade,
                image: item.imagemProduto
            }));
        } catch (error) {
            console.error('Erro ao carregar carrinho do backend:', error);
        }
    }

    const produtosCarregados = await carregarProdutos();
    renderizarProdutosEmDestaque(produtosCarregados);
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderStatus = urlParams.get('order');
    const pedidoId = urlParams.get('pedidoId');
    const transacaoId = urlParams.get('transacaoId');

    if (orderStatus === 'success') {
        let message = 'Compra efetuada com sucesso!';
        if (pedidoId && transacaoId) {
            message += `<br><br><strong>ID do Pedido:</strong> ${pedidoId}<br><strong>ID da Transação:</strong> ${transacaoId}`;
        }
        showAlert(message, 'success');
        history.replaceState(null, '', window.location.pathname);
    } else if (orderStatus === 'cancelled') {
        showAlert('Pedido cancelado.', 'info');
        history.replaceState(null, '', window.location.pathname);
    }
});