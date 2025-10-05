let produtos = [];

export async function carregarProdutos() {
    try {
        const response = await fetch('https://localhost:7280/Produto/Listar');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        produtos = await response.json();
        // Ajusta o caminho da imagem para usar imagens locais
        produtos = produtos.map(produto => {
            const fileName = (typeof produto.imagem === 'string' && produto.imagem.length > 0)
                             ? produto.imagem.split('/').pop()
                             : 'logo/default.png';

            let finalFileName = fileName;
            
            // Ajusta a extensão para .png se for .avif e categoria futebol
            if (produto.categoria.toLowerCase() === 'futebol' && finalFileName.endsWith('.avif')) {
                finalFileName = finalFileName.replace('.avif', '.png');
            }

            // Constrói o caminho final da imagem
            let finalImagePath;
            if (fileName === 'logo/default.png') {
                finalImagePath = `imagens/${finalFileName}`;
            } else {
                finalImagePath = `imagens/${produto.categoria.toLowerCase()}/${finalFileName}`;
            }

            return {
                ...produto,
                imagem: finalImagePath
            };
        });
        console.log('Produtos final com imagens ajustadas para renderização:', produtos);
        return produtos;
    } catch (error) {
        console.error('Erro ao carregar produtos da API:', error);
        return [];
    }
}
