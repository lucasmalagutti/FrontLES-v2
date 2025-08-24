// Base de dados dos produtos
const produtos = [
    // Futebol
    {
        id: 1,
        nome: "Bola de Futebol Nike",
        descricao: "Bola oficial Nike para campos, alta durabilidade e precisão.",
        preco: "R$ 199,90",
        categoria: "Futebol",
        imagem: "imagens/futebol/bolaNike.avif",
        alt: "Bola de Futebol Nike"
    },
    {
        id: 2,
        nome: "Cones",
        descricao: "Cones versáteis para exercícios de agilidade e treinos técnicos.",
        preco: "R$ 89,90",
        categoria: "Futebol",
        imagem: "imagens/futebol/cones.jpg",
        alt: "Cones"
    },
    {
        id: 3,
        nome: "Rede para trave de Campo",
        descricao: "Rede resistente e durável para traves de futebol profissional.",
        preco: "R$ 179,90",
        categoria: "Futebol",
        imagem: "imagens/futebol/rede.jpg",
        alt: "Rede para trave de Campo"
    },
    {
        id: 4,
        nome: "Bandeira de Escanteio",
        descricao: "Bandeiras oficiais para marcar escanteios e laterais do campo.",
        preco: "R$ 49,90",
        categoria: "Futebol",
        imagem: "imagens/futebol/bandeira.jpg",
        alt: "Bandeira de Escanteio"
    },
    // Basquete
    {
        id: 5,
        nome: "Bola de Basquete oficial",
        descricao: "Bola oficial para quadras internas e externas, com excelente aderência.",
        preco: "R$ 129,90",
        categoria: "Basquete",
        imagem: "imagens/basquete/bolaBasquete.jpg",
        alt: "Bola de Basquete"
    },
    {
        id: 6,
        nome: "Tabela",
        descricao: "Tabela de basquete resistente para quadras profissionais e amadoras.",
        preco: "R$ 899,90",
        categoria: "Basquete",
        imagem: "imagens/basquete/tabela.png",
        alt: "Tabela"
    },
    {
        id: 7,
        nome: "Aro",
        descricao: "Aro de basquete regulável com rede, ideal para treinos e jogos.",
        preco: "R$ 399,90",
        categoria: "Basquete",
        imagem: "imagens/basquete/aro.jpg",
        alt: "Aro"
    },
    {
        id: 8,
        nome: "Retornador de Bolas",
        descricao: "Retornador de bolas para treinos de basquete, ideal para prática individual.",
        preco: "R$ 45,90",
        categoria: "Basquete",
        imagem: "imagens/basquete/retornador.jpg",
        alt: "Retornador de Bolas"
    }
];

// Função para realizar a busca
function realizarBusca(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('searchInput');
    const termoBusca = searchInput.value.trim().toLowerCase();
    
    if (!termoBusca) {
        alert('Por favor, digite um termo para buscar.');
        return false;
    }
    
    // Redirecionar para a página de resultados com o termo de busca
    const url = `resultados-busca.html?q=${encodeURIComponent(termoBusca)}`;
    window.location.href = url;
    
    return false;
}

// Função para exibir os resultados da busca
function exibirResultados() {
    const urlParams = new URLSearchParams(window.location.search);
    const termoBusca = urlParams.get('q');
    
    if (!termoBusca) {
        window.location.href = 'index.html';
        return;
    }
    
    // Exibir o termo de busca
    document.getElementById('searchTerm').textContent = termoBusca;
    
    // Mostrar loading
    document.getElementById('loadingMessage').classList.remove('d-none');
    
    // Simular delay para melhor UX
    setTimeout(() => {
        // Filtrar produtos
        const produtosFiltrados = produtos.filter(produto => 
            produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            produto.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
            produto.categoria.toLowerCase().includes(termoBusca.toLowerCase())
        );
        
        document.getElementById('loadingMessage').classList.add('d-none');
        
        if (produtosFiltrados.length === 0) {
            // Nenhum resultado encontrado
            document.getElementById('noResultsMessage').classList.remove('d-none');
        } else {
            // Exibir resultados
            document.getElementById('resultsContainer').classList.remove('d-none');
            renderizarProdutos(produtosFiltrados);
        }
    }, 1000);
}

// Função para renderizar os produtos
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
                        <p class="fw-bold fs-5">${produto.preco}</p>
                        <a href="#" class="btn btn-primary w-100">Comprar</a>
                    </div>
                </div>
            </div>
        `;
        productsGrid.innerHTML += produtoHTML;
    });
}

// Função para buscar produtos em tempo real (opcional)
function buscarEmTempoReal(termo) {
    if (termo.length < 2) return [];
    
    return produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(termo.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(termo.toLowerCase())
    );
}

// Inicializar a página quando carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de resultados
    if (window.location.pathname.includes('resultados-busca.html')) {
        exibirResultados();
    }
    
    // Adicionar evento de busca em tempo real (opcional)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = this.value.trim();
            if (termo.length >= 2) {
                // Aqui você pode implementar sugestões em tempo real
                console.log('Buscando:', termo);
            }
        });
    }
});
