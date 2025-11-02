// js/gerenciarPedidos.js
// Função para aguardar o Bootstrap estar disponível
function waitForBootstrap(callback) {
    if (typeof bootstrap !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForBootstrap(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let pedidos = [];
    let cupons = JSON.parse(localStorage.getItem('cupons')) || [];

    // ================================
    // 🔹 Função principal: carregar pedidos do backend
    // ================================
    async function carregarPedidosDoBanco() {
        try {
            // 1️⃣ Buscar todas as transações
            const response = await fetch("https://localhost:7280/Transacao/ListarTodos");
            if (!response.ok) throw new Error(`Erro ao buscar pedidos: ${response.status}`);
            const transacoes = await response.json();

            // 2️⃣ Buscar todos os clientes (para exibir o nome, CPF, e-mail)
            const clientesResponse = await fetch("https://localhost:7280/Cliente/Listar");
            const clientes = clientesResponse.ok ? await clientesResponse.json() : [];

            // 3️⃣ Converter os dados do backend para o formato de exibição no front
            pedidos = transacoes.map(transacao => {
                const cliente = clientes.find(c => c.id === transacao.clienteId);
                const nomeCliente = cliente ? cliente.nome : `Cliente #${transacao.clienteId}`;

                return {
                    id: transacao.pedidoId ?? transacao.id,
                    cliente: nomeCliente,
                    data: transacao.dataTransacao,
                    total: transacao.valorTotal,
                    status: obterDescricaoStatus(transacao.statusTransacao),
                    items: (transacao.itens || []).map(item => ({
                        produto: item.nomeProduto || "Produto",
                        preco: item.precoUnitario || 0,
                        quantidade: item.quantidade || 1
                    }))
                };
            });

            renderizarPedidos();
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            showAlert("Erro ao carregar pedidos do servidor.", "danger");
        }
    }

    // ================================
    // 🔹 Converter enum numérico para nome do status
    // ================================
    function obterDescricaoStatus(statusCodigo) {
        // Se for null ou undefined, considerar como em processamento
        if (statusCodigo === null || statusCodigo === undefined) {
            return 'EM PROCESSAMENTO';
        }
        
        // Se for string, mapear os valores do enum do backend
        if (typeof statusCodigo === 'string') {
            const statusMap = {
                // Valores do enum como vêm do backend (PascalCase)
                'EmProcessamento': 'EM PROCESSAMENTO',
                'EmTransporte': 'EM TRANSPORTE',
                'Entregue': 'ENTREGUE',
                'EmTroca': 'EM TROCA',
                'Trocado': 'TROCADO',
                // Variações em maiúsculas/minúsculas
                'EMPROCESSAMENTO': 'EM PROCESSAMENTO',
                'EMTRANSPORTE': 'EM TRANSPORTE',
                'ENTREGUE': 'ENTREGUE',
                'EMTROCA': 'EM TROCA',
                'TROCADO': 'TROCADO',
                'emprocessamento': 'EM PROCESSAMENTO',
                'emtransporte': 'EM TRANSPORTE',
                'entregue': 'ENTREGUE',
                'emtroca': 'EM TROCA',
                'trocado': 'TROCADO',
                // Formatos alternativos
                'EM PROCESSAMENTO': 'EM PROCESSAMENTO',
                'EM TRANSPORTE': 'EM TRANSPORTE',
                'EM TROCA': 'EM TROCA'
            };
            
            // Tentar encontrar o status no mapa
            const statusKey = statusCodigo.trim();
            if (statusMap[statusKey]) {
                return statusMap[statusKey];
            }
            
            // Tentar converter para número (caso venha como string numérica)
            const codigoNum = parseInt(statusCodigo, 10);
            if (!isNaN(codigoNum)) {
                statusCodigo = codigoNum;
            } else {
                console.warn('Status string não reconhecido:', statusCodigo);
                return 'DESCONHECIDO';
            }
        }
        
        // Tratar como número - valores do enum do backend
        // EmProcessamento = 3, EmTransporte = 2, Entregue = 1, EmTroca = 4, Trocado = 5
        switch (statusCodigo) {
            case 1:
                return 'ENTREGUE';
            case 2:
                return 'EM TRANSPORTE';
            case 3:
                return 'EM PROCESSAMENTO';
            case 4:
                return 'EM TROCA';
            case 5:
                return 'TROCADO';
            default:
                console.warn('Status desconhecido recebido:', statusCodigo, 'tipo:', typeof statusCodigo);
                return 'DESCONHECIDO';
        }
    }

    // ================================
    // 🔹 Renderização da tabela de pedidos
    // ================================
    function renderizarPedidos(filtroStatus = 'todos') {
        const tbody = document.getElementById('pedidosTableBody');
        if (!tbody) return;

        let pedidosFiltrados = pedidos;
        if (filtroStatus !== 'todos') {
            pedidosFiltrados = pedidos.filter(p => p.status === filtroStatus);
        }

        if (pedidosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pedidosFiltrados.forEach(pedido => {
            const tr = document.createElement('tr');

            // Determinar cor do badge
            let badgeClass = 'bg-secondary';
            if (pedido.status === 'EM PROCESSAMENTO') badgeClass = 'bg-warning';
            else if (pedido.status === 'EM TRANSPORTE') badgeClass = 'bg-info';
            else if (pedido.status === 'ENTREGUE') badgeClass = 'bg-success';
            else if (pedido.status === 'EM TROCA') badgeClass = 'bg-danger';
            else if (pedido.status === 'TROCADO') badgeClass = 'bg-primary';

            tr.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.cliente}</td>
                <td>${new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                <td>R$ ${pedido.total.toFixed(2)}</td>
                <td><span class="badge ${badgeClass}">${pedido.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalhesPedido('${pedido.id}')">
                        Ver Itens
                    </button>
                </td>
                <td>${getBotoesAcao(pedido)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ================================
    // 🔹 Função de botões de ação
    // ================================
    function getBotoesAcao(pedido) {
        const buttons = [];
        
        // EM PROCESSAMENTO: Definir como em transporte
        if (pedido.status === 'EM PROCESSAMENTO') {
            buttons.push(`<button class="btn btn-sm btn-info me-1" onclick="definirEmTransporte('${pedido.id}')">
                <i class="bi bi-truck"></i> Definir em Transporte
            </button>`);
        }
        
        // EM TRANSPORTE: Confirmar entrega
        if (pedido.status === 'EM TRANSPORTE') {
            buttons.push(`<button class="btn btn-sm btn-success me-1" onclick="confirmarEntrega('${pedido.id}')">
                <i class="bi bi-check-circle-fill"></i> Confirmar Entrega
            </button>`);
        }
        
        // EM TROCA: Aceitar ou negar troca/devolução
        if (pedido.status === 'EM TROCA') {
            buttons.push(`<button class="btn btn-sm btn-success me-1" onclick="autorizarTroca('${pedido.id}')">
                <i class="bi bi-check-circle"></i> Autorizar Troca
            </button>`);
            buttons.push(`<button class="btn btn-sm btn-danger me-1" onclick="negarTroca('${pedido.id}')">
                <i class="bi bi-x-circle"></i> Negar Troca
            </button>`);
        }
        
        // TROCADO: Status final após troca autorizada e processada
        // Não precisa de ação, é um status final
        
        return buttons.length > 0 ? buttons.join('') : '<span class="text-muted">Nenhuma ação disponível</span>';
    }

    // ================================
    // 🔹 Funções auxiliares de ações
    // ================================
    
    // Definir produto em transporte (EM PROCESSAMENTO -> EM TRANSPORTE)
    window.definirEmTransporte = async function (pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'danger');
            return;
        }
        
        try {
            // TODO: Implementar chamada ao backend quando o endpoint estiver disponível
            // const response = await fetch(`https://localhost:7280/Transacao/AtualizarStatus/${pedidoId}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ statusTransacao: 2 }) // EmTransporte = 2
            // });
            // if (!response.ok) throw new Error('Erro ao definir em transporte');
            
            pedido.status = 'EM TRANSPORTE';
            renderizarPedidos();
            showSuccessNotification(`Pedido ${pedidoId} definido como em transporte!`);
        } catch (error) {
            console.error('Erro ao definir em transporte:', error);
            showAlert('Erro ao definir pedido em transporte. Tente novamente.', 'danger');
        }
    };
    
    // Confirmar entrega (EM TRANSPORTE -> ENTREGUE)
    window.confirmarEntrega = async function (pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'danger');
            return;
        }
        
        try {
            // TODO: Implementar chamada ao backend quando o endpoint estiver disponível
            // const response = await fetch(`https://localhost:7280/Transacao/AtualizarStatus/${pedidoId}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ statusTransacao: 1 }) // Entregue = 1
            // });
            // if (!response.ok) throw new Error('Erro ao confirmar entrega');
            
            pedido.status = 'ENTREGUE';
            renderizarPedidos();
            showSuccessNotification(`Entrega do pedido ${pedidoId} confirmada!`);
        } catch (error) {
            console.error('Erro ao confirmar entrega:', error);
            showAlert('Erro ao confirmar entrega. Tente novamente.', 'danger');
        }
    };
    
    // Autorizar troca/devolução (EM TROCA -> TROCADO)
    window.autorizarTroca = async function (pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'danger');
            return;
        }
        
        // Confirmar ação
        const confirmar = confirm(`Deseja realmente autorizar a troca/devolução do pedido ${pedidoId}?`);
        if (!confirmar) return;
        
        try {
            // TODO: Implementar chamada ao backend quando o endpoint estiver disponível
            // const response = await fetch(`https://localhost:7280/Transacao/AtualizarStatus/${pedidoId}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ statusTransacao: 5 }) // Trocado = 5
            // });
            // if (!response.ok) throw new Error('Erro ao autorizar troca');
            
            pedido.status = 'TROCADO';
            renderizarPedidos();
            showSuccessNotification(`Troca do pedido ${pedidoId} autorizada e processada!`);
        } catch (error) {
            console.error('Erro ao autorizar troca:', error);
            showAlert('Erro ao autorizar troca. Tente novamente.', 'danger');
        }
    };
    
    // Negar troca/devolução (EM TROCA -> volta para EM PROCESSAMENTO ou ENTREGUE)
    window.negarTroca = async function (pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            showAlert('Pedido não encontrado.', 'danger');
            return;
        }
        
        // Confirmar ação
        const confirmar = confirm(`Deseja realmente negar a troca/devolução do pedido ${pedidoId}?`);
        if (!confirmar) return;
        
        try {
            // TODO: Implementar chamada ao backend quando o endpoint estiver disponível
            // A lógica do backend pode variar - pode voltar para o status anterior ou manter EM TROCA
            // const response = await fetch(`https://localhost:7280/Transacao/NegarTroca/${pedidoId}`, {
            //     method: 'PUT'
            // });
            // if (!response.ok) throw new Error('Erro ao negar troca');
            
            // Por enquanto, apenas removemos o status de troca (volta para processamento)
            // O backend deve definir a lógica correta
            showSuccessNotification(`Troca do pedido ${pedidoId} negada. O pedido permanece em análise.`);
            // Recarregar pedidos do backend para obter o status atualizado
            await carregarPedidosDoBanco();
        } catch (error) {
            console.error('Erro ao negar troca:', error);
            showAlert('Erro ao negar troca. Tente novamente.', 'danger');
        }
    };

    // ================================
    // 🔹 Exibir detalhes do pedido
    // ================================
    window.verDetalhesPedido = function (pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) return;

        const modalBody = document.querySelector('#transacoesModal .modal-body');
        const modalTitle = document.getElementById('transacoesModalLabel');

        if (modalTitle) modalTitle.textContent = `Detalhes do Pedido #${pedido.id}`;

        if (modalBody) {
            let itemsHtml = pedido.items.map(item => `
                <div class="table-responsive mb-3">
                    <table class="table table-bordered table-striped">
                        <tbody>
                            <tr><th>Produto:</th><td>${item.produto}</td></tr>
                            <tr><th>Preço unitário:</th><td>R$ ${item.preco.toFixed(2)}</td></tr>
                            <tr><th>Quantidade:</th><td>${item.quantidade}</td></tr>
                        </tbody>
                    </table>
                </div>
            `).join('');

            modalBody.innerHTML = `
                <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                <p><strong>Data:</strong> ${new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
                <p><strong>Total:</strong> R$ ${pedido.total.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="badge bg-primary">${pedido.status}</span></p>
                <hr><h5>Itens:</h5>${itemsHtml}
            `;
        }

        const modal = new bootstrap.Modal(document.getElementById('transacoesModal'));
        modal.show();
    };

    // ================================
    // 🔹 Alertas e notificações
    // ================================
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }

    function showSuccessNotification(message) {
        showAlert(message, 'success');
    }

    // ================================
    // 🔹 Inicialização
    // ================================
    waitForBootstrap(() => {
        const gerenciarModal = document.getElementById('gerenciarPedidosModal');
        if (gerenciarModal) {
            gerenciarModal.addEventListener('shown.bs.modal', carregarPedidosDoBanco);
        }
        
        // Adicionar listeners para os filtros de status
        const statusFilters = document.querySelectorAll('input[name="statusFilter"]');
        statusFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                renderizarPedidos(e.target.value);
            });
        });
        
        carregarPedidosDoBanco(); // Carrega também ao abrir a página
    });
});
