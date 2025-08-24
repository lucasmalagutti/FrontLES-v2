// Funcionalidades de busca - usa produtos definidos em productData.js

function realizarBusca(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('searchInput');
    const termoBusca = searchInput.value.trim().toLowerCase();
    
    if (!termoBusca) {
        alert('Por favor, digite um termo para buscar.');
        return false;
    }
    
    const url = `resultadosBusca.html?q=${encodeURIComponent(termoBusca)}`;
    window.location.href = url;
    
    return false;
}

function exibirResultados() {
    const urlParams = new URLSearchParams(window.location.search);
    const termoBusca = urlParams.get('q');
    
    if (!termoBusca) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('searchTerm').textContent = termoBusca;
    
    document.getElementById('loadingMessage').classList.remove('d-none');
    
    setTimeout(() => {
        const produtosFiltrados = produtos.filter(produto => 
            produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            produto.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
            produto.categoria.toLowerCase().includes(termoBusca.toLowerCase())
        );
        
        document.getElementById('loadingMessage').classList.add('d-none');
        
        if (produtosFiltrados.length === 0) {
            document.getElementById('noResultsMessage').classList.remove('d-none');
        } else {
            document.getElementById('resultsContainer').classList.remove('d-none');
            renderizarProdutos(produtosFiltrados);
        }
    }, 1000);
}

function renderizarProdutos(produtosParaExibir) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
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
                        <a href="#" class="btn btn-comprar w-100 add-to-cart">Comprar</a>
                    </div>
                </div>
            </div>
        `;
        productsGrid.innerHTML += produtoHTML;
    });
}

function buscarEmTempoReal(termo) {
    if (termo.length < 2) return [];
    
    return produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(termo.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(termo.toLowerCase())
    );
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('resultadosBusca.html')) {
        exibirResultados();
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = this.value.trim();
            if (termo.length >= 2) {
                console.log('Buscando:', termo);
            }
        });
    }
});
