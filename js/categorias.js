import { carregarProdutos } from './productData.js';
import { initializeCartFunctionality } from './script.js';

async function renderizarProdutosCategoria(categoria) {
    const produtos = await carregarProdutos(); // 🔹 usa o retorno direto da função

    const produtosFiltrados = produtos.filter(produto => 
        produto.categoria.toLowerCase() === categoria.toLowerCase()
    );

    const gridId = categoria.toLowerCase() === 'futebol' ? 'futebolGrid' : 'basqueteGrid';
    const grid = document.getElementById(gridId);

    if (!grid) return;
    
    renderizarProdutosNoGrid(grid, produtosFiltrados);
}

function renderizarProdutosNoGrid(gridElement, produtosParaExibir) {
    gridElement.innerHTML = '';
    
    produtosParaExibir.forEach(produto => {
        const produtoHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm product-card">
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.alt || produto.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">${produto.descricao}</p>
                        <p class="fw-bold fs-5">R$ ${produto.preco.toFixed(2)}</p>
                        <div class="d-flex justify-content-center align-items-center mb-2">
                            <button class="btn btn-sm btn-outline-secondary decrease-product-quantity" data-product-id="${produto.id}">-</button>
                            <span class="mx-2 product-quantity-display" data-product-id="${produto.id}">1</span>
                            <button class="btn btn-sm btn-outline-secondary increase-product-quantity" data-product-id="${produto.id}">+</button>
                        </div>
                        <a href="#" class="btn btn-comprar w-100 add-to-cart" 
                           data-product-id="${produto.id}" 
                           data-product-name="${produto.nome}" 
                           data-product-price="${produto.preco}" 
                           data-product-image="${produto.imagem}">
                           Comprar
                        </a>
                    </div>
                </div>
            </div>
        `;
        gridElement.innerHTML += produtoHTML;
    });

    initializeCartFunctionality();
}

document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('futebol.html')) {
        await renderizarProdutosCategoria('Futebol');
    } else if (currentPage.includes('basquete.html')) {
        await renderizarProdutosCategoria('Basquete');
    }
});
