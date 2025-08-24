// Função para renderizar produtos de uma categoria específica
function renderizarProdutosCategoria(categoria) {
    const produtosFiltrados = produtos.filter(produto => 
        produto.categoria.toLowerCase() === categoria.toLowerCase()
    );
    
    if (categoria.toLowerCase() === 'futebol') {
        const grid = document.getElementById('futebolGrid');
        if (grid) {
            renderizarProdutosNoGrid(grid, produtosFiltrados);
        }
    } else if (categoria.toLowerCase() === 'basquete') {
        const grid = document.getElementById('basqueteGrid');
        if (grid) {
            renderizarProdutosNoGrid(grid, produtosFiltrados);
        }
    }
}

// Função para renderizar produtos em um grid específico
function renderizarProdutosNoGrid(gridElement, produtosParaExibir) {
    gridElement.innerHTML = '';
    
    produtosParaExibir.forEach(produto => {
        const produtoHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm product-card">
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.alt}">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">${produto.descricao}</p>
                        <p class="fw-bold fs-5">${produto.preco}</p>
                        <a href="#" class="btn btn-primary w-100">Comprar</a>
                    </div>
                </div>
            </div>
        `;
        gridElement.innerHTML += produtoHTML;
    });
}

// Função para inicializar a página baseada na categoria
function inicializarPaginaCategoria() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('futebol.html')) {
        renderizarProdutosCategoria('Futebol');
    } else if (currentPage.includes('basquete.html')) {
        renderizarProdutosCategoria('Basquete');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    inicializarPaginaCategoria();
});
