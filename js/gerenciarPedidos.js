// js/gerenciarPedidos.js
// Função para aguardar o Bootstrap estar disponível
function waitForBootstrap(callback) {
    if (typeof bootstrap !== 'undefined') {
        callback();
    } else {
        // Aguardar um pouco e tentar novamente
        setTimeout(() => waitForBootstrap(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Dados iniciais dos pedidos (sempre os mesmos para testes)
    const pedidosIniciais = [
        {
            id: 'PED001',
            cliente: 'Luiz Eduardo',
            cpf: '29932381080',
            email: 'luizeduardo@gmail.com',
            data: '2023-10-26',
            total: 299.80,
            status: 'EM PROCESSAMENTO',
            items: [
                { produto: 'Bola de Futebol Nike', marca: 'Nike', esporte: 'Futebol', preco: 199.90, quantidade: 1, codigo: '0001' },
                { produto: 'Cones', marca: 'Genérico', esporte: 'Futebol', preco: 99.90, quantidade: 1, codigo: '0002' }
            ]
        },
        {
            id: 'PED002',
            cliente: 'Maria Silva',
            cpf: '12345678901',
            email: 'maria.silva@email.com',
            data: '2023-10-25',
            total: 129.90,
            status: 'EM TROCA',
            items: [
                { produto: 'Bola de Basquete oficial', marca: 'Spalding', esporte: 'Basquete', preco: 129.90, quantidade: 1, codigo: '0005' }
            ]
        },
        {
            id: 'PED003',
            cliente: 'João Santos',
            cpf: '98765432100',
            email: 'joao.santos@email.com',
            data: '2023-10-24',
            total: 449.90,
            status: 'EM PROCESSAMENTO',
            items: [
                { produto: 'Aro', marca: 'Genérico', esporte: 'Basquete', preco: 399.90, quantidade: 1, codigo: '0007' },
                { produto: 'Retornador de Bolas', marca: 'Genérico', esporte: 'Basquete', preco: 50.00, quantidade: 1, codigo: '0008' }
            ]
        }
    ];

    // Array para armazenar cupons gerados
    let cupons = JSON.parse(localStorage.getItem('cupons')) || [];

    // Carregar pedidos do localStorage ou usar dados iniciais
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [...pedidosIniciais];
    
    // Verificar se é a primeira vez que a página é carregada
    const primeiraVez = !localStorage.getItem('pedidos');
    if (primeiraVez) {
        // Se for a primeira vez, salvar os dados iniciais
        localStorage.setItem('pedidos', JSON.stringify(pedidosIniciais));
        pedidos = [...pedidosIniciais];
    }

    // Salvar pedidos no localStorage
    function salvarPedidos() {
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
    }

    // Resetar pedidos para status inicial (para testes)
    function resetarPedidos() {
        // Confirmar com o usuário antes de resetar
        if (confirm('Tem certeza que deseja resetar todos os pedidos para o status inicial?\n\nEsta ação irá:\n• Voltar PED001 para "EM PROCESSAMENTO"\n• Voltar PED002 para "EM TROCA"\n• Voltar PED003 para "EM PROCESSAMENTO"\n\nEsta ação não pode ser desfeita.')) {
            pedidos = [...pedidosIniciais];
            salvarPedidos();
            renderizarPedidos();
            showSuccessNotification('✅ Pedidos resetados com sucesso para o status inicial!');
        }
    }

    // Função para resetar pedidos (disponível globalmente)
    window.resetarPedidos = resetarPedidos;

    // Renderizar tabela de pedidos
    function renderizarPedidos(filtroStatus = 'todos') {
        const tbody = document.getElementById('pedidosTableBody');
        if (!tbody) return;

        let pedidosFiltrados = pedidos;
        if (filtroStatus !== 'todos') {
            pedidosFiltrados = pedidos.filter(pedido => pedido.status === filtroStatus);
        }

        if (pedidosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pedidosFiltrados.forEach(pedido => {
            const tr = document.createElement('tr');
            
            // Determinar cor do badge baseado no status
            let badgeClass = 'bg-secondary';
            if (pedido.status === 'EM PROCESSAMENTO') badgeClass = 'bg-warning';
            else if (pedido.status === 'EM TROCA') badgeClass = 'bg-danger';
            else if (pedido.status === 'EM TRANSITO') badgeClass = 'bg-info';
            else if (pedido.status === 'ENTREGUE') badgeClass = 'bg-success';
            else if (pedido.status === 'TROCA AUTORIZADA') badgeClass = 'bg-primary';
            else if (pedido.status === 'ITENS RECEBIDOS') badgeClass = 'bg-success';

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
                <td>
                    ${getBotoesAcao(pedido)}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Gerar botões de ação baseado no status do pedido
    function getBotoesAcao(pedido) {
        let botoes = '';
        
        if (pedido.status === 'EM PROCESSAMENTO') {
            botoes = `
                <button class="btn btn-sm btn-success me-1" onclick="aceitarPedido('${pedido.id}')">
                    Aceitar Pedido
                </button>
            `;
        } else if (pedido.status === 'EM TRANSITO') {
            botoes = `
                <button class="btn btn-sm btn-success me-1" onclick="aceitarPedido('${pedido.id}')">
                    Confirmar Entrega
                </button>
            `;
        } else if (pedido.status === 'EM TROCA') {
            botoes = `
                <button class="btn btn-sm btn-success me-1" onclick="autorizarTroca('${pedido.id}')">
                    Autorizar Troca
                </button>
            `;
        } else if (pedido.status === 'TROCA AUTORIZADA') {
            botoes = `
                <button class="btn btn-sm btn-info me-1" onclick="confirmarChegadaItens('${pedido.id}')">
                    <i class="bi bi-box-seam"></i> Confirmar Chegada dos Itens
                </button>
            `;
        } else {
            botoes = '<span class="text-muted">Nenhuma ação disponível</span>';
        }
        
        return botoes;
    }

    // Aceitar pedido (muda status de EM PROCESSAMENTO para EM TRANSITO, ou de EM TRANSITO para ENTREGUE)
    window.aceitarPedido = function(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        if (pedido.status === 'EM PROCESSAMENTO') {
            pedido.status = 'EM TRANSITO';
            showSuccessNotification(`Pedido ${pedidoId} aceito e enviado para entrega!`);
        } else if (pedido.status === 'EM TRANSITO') {
            pedido.status = 'ENTREGUE';
            showSuccessNotification(`Pedido ${pedidoId} entregue com sucesso!`);
        }

        salvarPedidos();
        renderizarPedidos();
    };

    // Autorizar troca (muda status de EM TROCA para TROCA AUTORIZADA)
    window.autorizarTroca = function(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        // Verificar se o Bootstrap está disponível
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap não está disponível');
            showAlert('Erro: Bootstrap não está carregado', 'danger');
            return;
        }

        // Fechar modal de gerenciar pedidos primeiro
        const gerenciarModal = bootstrap.Modal.getInstance(document.getElementById('gerenciarPedidosModal'));
        if (gerenciarModal) {
            gerenciarModal.hide();
        }

        // Mostrar modal de confirmação
        const confirmarModal = document.getElementById('confirmarTrocaModal');
        if (confirmarModal) {
            document.getElementById('pedidoTrocaConfirmId').textContent = pedidoId;
            
            try {
                // Usar Bootstrap.Modal.getOrCreateInstance para evitar erros
                const modal = bootstrap.Modal.getOrCreateInstance(confirmarModal);
                modal.show();
                
                // Configurar o botão de confirmação
                const confirmarBtn = document.getElementById('confirmarTrocaBtn');
                if (confirmarBtn) {
                    // Remover event listeners anteriores para evitar duplicação
                    const newBtn = confirmarBtn.cloneNode(true);
                    confirmarBtn.parentNode.replaceChild(newBtn, confirmarBtn);
                    
                    newBtn.addEventListener('click', () => {
                        // Executar a autorização da troca
                        executarAutorizacaoTroca(pedidoId);
                        
                        // Fechar modal de confirmação
                        modal.hide();
                    });
                }
            } catch (error) {
                console.error('Erro ao abrir modal:', error);
                showAlert('Erro ao abrir modal de confirmação', 'danger');
            }
        } else {
            console.error('Modal de confirmação não encontrado');
            showAlert('Erro: Modal de confirmação não encontrado', 'danger');
        }
    };

    // Função para executar a autorização da troca após confirmação
    function executarAutorizacaoTroca(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        pedido.status = 'TROCA AUTORIZADA';
        
        salvarPedidos();
        renderizarPedidos();
        
        // Mostrar notificação de sucesso
        showSuccessNotification(`Troca do pedido ${pedidoId} autorizada com sucesso!`);
    }

    // Função para confirmar chegada dos itens e gerar cupom
    window.confirmarChegadaItens = function(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        // Verificar se o Bootstrap está disponível
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap não está disponível');
            showAlert('Erro: Bootstrap não está carregado', 'danger');
            return;
        }

        // Fechar modal de gerenciar pedidos primeiro
        const gerenciarModal = bootstrap.Modal.getInstance(document.getElementById('gerenciarPedidosModal'));
        if (gerenciarModal) {
            gerenciarModal.hide();
        }

        // Preencher dados no modal de confirmação
        document.getElementById('pedidoChegadaId').textContent = pedidoId;
        document.getElementById('clienteChegadaId').textContent = pedido.cliente;

        // Mostrar modal de confirmação de chegada
        const confirmarModal = document.getElementById('confirmarChegadaItensModal');
        if (confirmarModal) {
            try {
                const modal = bootstrap.Modal.getOrCreateInstance(confirmarModal);
                modal.show();
                
                // Configurar o botão de confirmação
                const confirmarBtn = document.getElementById('confirmarChegadaBtn');
                if (confirmarBtn) {
                    // Remover event listeners anteriores para evitar duplicação
                    const newBtn = confirmarBtn.cloneNode(true);
                    confirmarBtn.parentNode.replaceChild(newBtn, confirmarBtn);
                    
                    newBtn.addEventListener('click', () => {
                        // Executar a confirmação e gerar cupom
                        executarConfirmacaoChegada(pedidoId);
                        
                        // Fechar modal de confirmação
                        modal.hide();
                    });
                }
            } catch (error) {
                console.error('Erro ao abrir modal:', error);
                showAlert('Erro ao abrir modal de confirmação', 'danger');
            }
        }
    };

    // Função para executar a confirmação de chegada e gerar cupom
    function executarConfirmacaoChegada(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        // Obter observações
        const observacoes = document.getElementById('observacoesItens').value || 'Nenhuma observação';

        // Gerar cupom
        const cupom = gerarCupom(pedido, observacoes);
        
        // Atualizar status do pedido
        pedido.status = 'ITENS RECEBIDOS';
        pedido.observacoesTroca = observacoes;
        pedido.cupomGerado = cupom.codigo;
        
        salvarPedidos();
        renderizarPedidos();
        
        // Mostrar modal com o cupom gerado
        mostrarCupomGerado(cupom);
        
        // Mostrar notificação de sucesso
        showSuccessNotification(`Cupom de troca gerado com sucesso para o pedido ${pedidoId}!`);
    }

    // Função para gerar cupom de troca
    function gerarCupom(pedido, observacoes) {
        const codigo = 'CUP' + Date.now().toString().slice(-6);
        const dataGeracao = new Date().toISOString();
        
        const cupom = {
            codigo: codigo,
            pedidoId: pedido.id,
            cliente: pedido.cliente,
            valor: pedido.total,
            dataGeracao: dataGeracao,
            observacoes: observacoes,
            status: 'ATIVO'
        };
        
        cupons.push(cupom);
        localStorage.setItem('cupons', JSON.stringify(cupons));
        
        return cupom;
    }

    // Função para mostrar o cupom gerado
    function mostrarCupomGerado(cupom) {
        // Preencher dados do cupom no modal
        document.getElementById('codigoCupom').textContent = cupom.codigo;
        document.getElementById('dataCupom').textContent = new Date(cupom.dataGeracao).toLocaleDateString('pt-BR');
        document.getElementById('pedidoCupom').textContent = cupom.pedidoId;
        document.getElementById('clienteCupom').textContent = cupom.cliente;
        document.getElementById('valorCupom').textContent = `R$ ${cupom.valor.toFixed(2)}`;
        
        // Mostrar modal do cupom
        const cupomModal = document.getElementById('cupomGeradoModal');
        if (cupomModal) {
            const modal = bootstrap.Modal.getOrCreateInstance(cupomModal);
            modal.show();
        }
    }

    // Função para imprimir cupom (disponível globalmente)
    window.imprimirCupom = function() {
        const conteudo = document.getElementById('cupomGeradoModal').innerHTML;
        const janela = window.open('', '_blank');
        janela.document.write(`
            <html>
                <head>
                    <title>Cupom de Troca</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        @media print {
                            .btn { display: none !important; }
                            .modal-footer { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    ${conteudo}
                    <script>window.print();</script>
                </body>
            </html>
        `);
        janela.document.close();
    };

    // Ver detalhes do pedido
    window.verDetalhesPedido = function(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        // Usar o modal de transações existente para mostrar detalhes
        const modalTitle = document.getElementById('transacoesModalLabel');
        if (modalTitle) modalTitle.textContent = `Detalhes do Pedido #${pedido.id}`;

        const modalBody = document.querySelector('#transacoesModal .modal-body');
        if (modalBody) {
            let itemsHtml = '';
            pedido.items.forEach(item => {
                itemsHtml += `
                    <div class="table-responsive mb-3">
                        <table class="table table-bordered table-striped">
                            <tbody>
                                <tr>
                                    <th>Produto:</th>
                                    <td>${item.produto}</td>
                                </tr>
                                <tr>
                                    <th>Marca:</th>
                                    <td>${item.marca}</td>
                                </tr>
                                <tr>
                                    <th>Esporte:</th>
                                    <td>${item.esporte}</td>
                                </tr>
                                <tr>
                                    <th>Preço:</th>
                                    <td>R$ ${item.preco.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Quantidade:</th>
                                    <td>${item.quantidade}</td>
                                </tr>
                                <tr>
                                    <th>Código do Produto:</th>
                                    <td>${item.codigo}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });
            modalBody.innerHTML = `
                <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                <p><strong>CPF:</strong> ${pedido.cpf}</p>
                <p><strong>Email:</strong> ${pedido.email}</p>
                <p><strong>Data do Pedido:</strong> ${new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
                <p><strong>Total do Pedido:</strong> R$ ${pedido.total.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="badge bg-primary">${pedido.status}</span></p>
                <hr>
                <h5>Itens do Pedido:</h5>
                ${itemsHtml}
            `;
        }

        // Fechar modal de gerenciar pedidos e abrir modal de detalhes
        const gerenciarModal = bootstrap.Modal.getInstance(document.getElementById('gerenciarPedidosModal'));
        if (gerenciarModal) gerenciarModal.hide();

        const transacoesModal = new bootstrap.Modal(document.getElementById('transacoesModal'));
        transacoesModal.show();
    };

    // Event listeners para filtros de status
    document.addEventListener('change', (e) => {
        if (e.target.name === 'statusFilter') {
            renderizarPedidos(e.target.value);
        }
    });

    // Função para mostrar alertas
    function showAlert(message, type = 'info') {
        // Criar elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Remover alerta após 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Função para mostrar notificação de sucesso
    function showSuccessNotification(message) {
        showAlert(message, 'success');
    }

    // Inicializar quando o modal for aberto
    waitForBootstrap(() => {
        const gerenciarPedidosModal = document.getElementById('gerenciarPedidosModal');
        if (gerenciarPedidosModal) {
            gerenciarPedidosModal.addEventListener('shown.bs.modal', () => {
                renderizarPedidos();
            });
        }

        // Também inicializar quando a página carregar (para casos onde o modal já estiver aberto)
        if (document.getElementById('gerenciarPedidosModal')) {
            renderizarPedidos();
        }
    });

    // Comentário: Reset automático removido - agora apenas manual através do botão
    // Os pedidos mantêm seus status até que o usuário clique em "Resetar Pedidos"
});
