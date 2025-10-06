class CarrinhoService {
    constructor() {
        this.baseUrl = 'https://localhost:7280/api/Carrinho'; 
        this.clienteId = this.obterClienteId();
    }

    obterClienteId() {
        return 33;
    }

    async obterCarrinho() {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}`);
            if (!response.ok) {
                throw new Error('Erro ao obter carrinho');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter carrinho:', error);
            throw error;
        }
    }

    async adicionarItem(produtoId, quantidade, precoUnitario) {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/adicionar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    produtoId: produtoId,
                    quantidade: quantidade,
                    precoUnitario: precoUnitario
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar item ao carrinho');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            throw error;
        }
    }

    async atualizarItem(produtoId, quantidade) {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/atualizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clienteId: this.clienteId,
                    produtoId: produtoId,
                    quantidade: quantidade
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar item do carrinho');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            throw error;
        }
    }

    async removerItem(produtoId) {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/remover/${produtoId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao remover item do carrinho');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao remover item:', error);
            throw error;
        }
    }

    async limparCarrinho() {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/limpar`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao limpar carrinho');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            throw error;
        }
    }

    async finalizarCarrinho() {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/finalizar`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Erro ao finalizar carrinho');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao finalizar carrinho:', error);
            throw error;
        }
    }

    // Método específico para aumentar quantidade
    async adicionarQtdCarrinho(produtoId) {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/adicionar-qtd`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    produtoId: produtoId
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao aumentar quantidade');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao aumentar quantidade:', error);
            throw error;
        }
    }

    // Método específico para diminuir quantidade
    async diminuirQtdCarrinho(produtoId) {
        if (!this.clienteId) {
            throw new Error('Cliente não logado');
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.clienteId}/diminuir-qtd`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    produtoId: produtoId
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao diminuir quantidade');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao diminuir quantidade:', error);
            throw error;
        }
    }

    // Método para sincronizar carrinho local com o backend
    async sincronizarCarrinho() {
        // Para testes com ClienteID 33, não sincronizar localStorage
        // O carrinho deve sempre vir do backend
        console.log('Sincronização desabilitada para testes - carrinho sempre vem do backend');
        return;
        
        // Código original comentado para referência futura:
        /*
        const carrinhoLocal = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (carrinhoLocal.length === 0) {
            return;
        }

        try {
            // Limpar carrinho no backend primeiro
            await this.limparCarrinho();

            // Adicionar todos os itens do carrinho local
            for (const item of carrinhoLocal) {
                await this.adicionarItem(item.id, item.quantity, item.price);
            }

            console.log('Carrinho sincronizado com sucesso');
        } catch (error) {
            console.error('Erro ao sincronizar carrinho:', error);
            throw error;
        }
        */
    }
}

// Instância global do serviço
window.carrinhoService = new CarrinhoService();
