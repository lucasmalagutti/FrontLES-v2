// js/gerenciarTrocas.js
const API_BASE_URL = 'https://localhost:7280';

// Mapeamento de status (enum do backend)
const STATUS_SOLICITACAO = {
    PENDENTE: 1,
    APROVADA: 2,
    NEGADA: 3,
    EM_TRANSPORTE: 4,
    PRODUTO_RECEBIDO: 5,
    CUPOM_GERADO: 6,
    FINALIZADA: 7
};

const STATUS_SOLICITACAO_NOMES = {
    [STATUS_SOLICITACAO.PENDENTE]: 'Pendente',
    [STATUS_SOLICITACAO.APROVADA]: 'Aprovada',
    [STATUS_SOLICITACAO.NEGADA]: 'Negada',
    [STATUS_SOLICITACAO.EM_TRANSPORTE]: 'Em Transporte',
    [STATUS_SOLICITACAO.PRODUTO_RECEBIDO]: 'Produto Recebido',
    [STATUS_SOLICITACAO.CUPOM_GERADO]: 'Cupom Gerado',
    [STATUS_SOLICITACAO.FINALIZADA]: 'Finalizada'
};

let solicitacoes = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar Bootstrap estar disponível
    waitForBootstrap(() => {
        setupEventListeners();
        carregarSolicitacoes();
    });
});

function waitForBootstrap(callback) {
    if (typeof bootstrap !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForBootstrap(callback), 100);
    }
}

function setupEventListeners() {
    // Filtros de status
    const filtros = document.querySelectorAll('input[name="statusFilter"]');
    filtros.forEach(filtro => {
        filtro.addEventListener('change', () => {
            const filtroAtivo = filtro.value;
            renderizarSolicitacoes(filtroAtivo);
        });
    });
}

function normalizarSolicitacao(solicitacao) {
    const statusOriginal = solicitacao.status;
    let statusValor = statusOriginal;

    if (typeof statusOriginal === 'string') {
        const chave = statusOriginal.toUpperCase().replace(/[\s-]/g, '_');
        statusValor = STATUS_SOLICITACAO[chave] ?? statusOriginal;
    }

    if (typeof statusValor !== 'number') {
        // fallback para  valor conhecido via statusNome
        if (solicitacao.statusNome) {
            const chave = solicitacao.statusNome.toUpperCase().replace(/[\s-]/g, '_');
            statusValor = STATUS_SOLICITACAO[chave] ?? STATUS_SOLICITACAO.PENDENTE;
        } else {
            statusValor = STATUS_SOLICITACAO.PENDENTE;
        }
    }

    const statusNome = solicitacao.statusNome || STATUS_SOLICITACAO_NOMES[statusValor] || 'Pendente';

    return {
        ...solicitacao,
        statusValor,
        statusNome
    };
}

async function carregarSolicitacoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/todas`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const dadosApi = await response.json();
        solicitacoes = Array.isArray(dadosApi) ? dadosApi.map(normalizarSolicitacao) : [];
        console.log('Solicitações carregadas:', solicitacoes);

        if (solicitacoes.length === 0) {
            const tbody = document.getElementById('solicitacoesTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhuma solicitação encontrada.</td></tr>';
            }
        } else {
            renderizarSolicitacoes();
        }

    } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        const tbody = document.getElementById('solicitacoesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-danger">
                        <strong>Erro ao carregar solicitações</strong><br>
                        ${error.message}
                    </td>
                </tr>
            `;
        }
        showAlert(`Erro ao carregar solicitações: ${error.message}`, 'danger');
    }
}

window.recarregarSolicitacoes = function() {
    carregarSolicitacoes();
};

function renderizarSolicitacoes(filtroStatus = 'todos') {
    const tbody = document.getElementById('solicitacoesTableBody');
    if (!tbody) return;

    let solicitacoesFiltradas = solicitacoes;
    if (filtroStatus !== 'todos') {
        const filtroNormalizado = filtroStatus.toLowerCase();
        solicitacoesFiltradas = solicitacoes.filter(s => {
            const statusNome = (s.statusNome || '').toLowerCase();
            return statusNome === filtroNormalizado;
        });
    }

    if (solicitacoesFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhuma solicitação encontrada para este filtro.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    solicitacoesFiltradas.forEach(solicitacao => {
        const statusValor = solicitacao.statusValor ?? solicitacao.status;
        const statusNome = solicitacao.statusNome || STATUS_SOLICITACAO_NOMES[statusValor] || 'Pendente';
        const tr = document.createElement('tr');
        
        const badgeClass = getBadgeClass(statusValor);
        const dataFormatada = formatDate(solicitacao.dataSolicitacao);
        
        tr.innerHTML = `
            <td>${solicitacao.id}</td>
            <td>${solicitacao.pedidoId}</td>
            <td>${solicitacao.clienteNome}</td>
            <td><span class="badge ${solicitacao.tipoSolicitacao === 1 ? 'bg-info' : 'bg-warning'}">${solicitacao.tipoSolicitacaoNome}</span></td>
            <td>${solicitacao.nomeProduto}</td>
            <td><span class="badge ${badgeClass} badge-status">${statusNome}</span></td>
            <td>${dataFormatada}</td>
            <td>${solicitacao.motivo.substring(0, 50)}${solicitacao.motivo.length > 50 ? '...' : ''}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="verDetalhes(${solicitacao.id})" title="Ver Detalhes">
                    <i class="bi bi-eye"></i>
                </button>
                ${getBotoesAcao(solicitacao)}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getBadgeClass(statusValor) {
    switch (statusValor) {
        case 1: return 'bg-warning'; // Pendente
        case 2: return 'bg-success'; // Aprovada
        case 3: return 'bg-danger';  // Negada
        case 4: return 'bg-info';    // EmTransporte
        case 5: return 'bg-primary'; // ProdutoRecebido
        case 6: return 'bg-success'; // CupomGerado
        case 7: return 'bg-secondary'; // Finalizada
        default: return 'bg-secondary';
    }
}

function getBotoesAcao(solicitacao) {
    let botoes = '';
    const statusValor = solicitacao.statusValor ?? solicitacao.status;
    
    // Aprovar/Negar (apenas se estiver Pendente)
    if (statusValor === STATUS_SOLICITACAO.PENDENTE) {
        botoes += `
            <button class="btn btn-sm btn-success me-1" onclick="aprovarSolicitacao(${solicitacao.id})" title="Aprovar">
                <i class="bi bi-check-circle"></i>
            </button>
            <button class="btn btn-sm btn-danger me-1" onclick="negarSolicitacao(${solicitacao.id})" title="Negar">
                <i class="bi bi-x-circle"></i>
            </button>
        `;
    }
    
    // Definir Em Transporte (apenas se estiver Aprovada)
    if (statusValor === STATUS_SOLICITACAO.APROVADA) {
        botoes += `
            <button class="btn btn-sm btn-info me-1" onclick="definirEmTransporte(${solicitacao.id})" title="Marcar como Em Transporte">
                <i class="bi bi-truck"></i>
            </button>
        `;
    }
    
    // Confirmar Recebimento (apenas se estiver EmTransporte)
    if (statusValor === STATUS_SOLICITACAO.EM_TRANSPORTE) {
        botoes += `
            <button class="btn btn-sm btn-primary me-1" onclick="confirmarRecebimento(${solicitacao.id})" title="Confirmar Recebimento">
                <i class="bi bi-box-seam"></i>
            </button>
        `;
    }
    
    // Gerar Cupom (apenas se ProdutoRecebido)
    if (statusValor === STATUS_SOLICITACAO.PRODUTO_RECEBIDO) {
        botoes += `
            <button class="btn btn-sm btn-success me-1" onclick="gerarCupom(${solicitacao.id})" title="Gerar Cupom">
                <i class="bi bi-ticket-perforated"></i>
            </button>
        `;
    }
    
    // Finalizar (apenas se CupomGerado)
    if (statusValor === STATUS_SOLICITACAO.CUPOM_GERADO) {
        botoes += `
            <button class="btn btn-sm btn-primary me-1" onclick="finalizarTroca(${solicitacao.id})" title="Finalizar Troca">
                <i class="bi bi-check2-all"></i>
            </button>
        `;
    }
    
    return botoes;
}

window.verDetalhes = async function(id) {
    const solicitacao = solicitacoes.find(s => s.id === id);
    if (!solicitacao) {
        showAlert('Solicitação não encontrada', 'warning');
        return;
    }
    
    const modalBody = document.getElementById('detalhesModalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Informações da Solicitação</h6>
                <p><strong>ID:</strong> ${solicitacao.id}</p>
                <p><strong>Pedido ID:</strong> ${solicitacao.pedidoId}</p>
                <p><strong>Cliente:</strong> ${solicitacao.clienteNome}</p>
                <p><strong>Tipo:</strong> <span class="badge ${solicitacao.tipoSolicitacao === 1 ? 'bg-info' : 'bg-warning'}">${solicitacao.tipoSolicitacaoNome}</span></p>
                <p><strong>Status:</strong> <span class="badge ${getBadgeClass(solicitacao.statusValor ?? solicitacao.status)}">${solicitacao.statusNome}</span></p>
                <p><strong>Data Solicitação:</strong> ${formatDate(solicitacao.dataSolicitacao)}</p>
                ${solicitacao.dataAprovacao ? `<p><strong>Data Aprovação:</strong> ${formatDate(solicitacao.dataAprovacao)}</p>` : ''}
                ${solicitacao.dataRecebimento ? `<p><strong>Data Recebimento:</strong> ${formatDate(solicitacao.dataRecebimento)}</p>` : ''}
            </div>
            <div class="col-md-6">
                <h6>Detalhes do Produto/Pedido</h6>
                <p><strong>Produto/Item:</strong> ${solicitacao.nomeProduto}</p>
                ${solicitacao.itemPedidoId ? `<p><strong>Item Pedido ID:</strong> ${solicitacao.itemPedidoId}</p>` : '<p><strong>Devolução:</strong> Pedido completo</p>'}
                ${solicitacao.cupomId ? `<p><strong>Cupom:</strong> ${solicitacao.cupomNome || solicitacao.cupomId}</p>` : ''}
                ${solicitacao.valorCupom ? `<p><strong>Valor do Cupom:</strong> R$ ${solicitacao.valorCupom.toFixed(2)}</p>` : ''}
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6>Motivo</h6>
                <p>${solicitacao.motivo}</p>
            </div>
        </div>
        ${solicitacao.observacoesAdm ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Observações do Administrador</h6>
                <p>${solicitacao.observacoesAdm}</p>
            </div>
        </div>
        ` : ''}
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('detalhesModal'));
    modal.show();
};

window.aprovarSolicitacao = async function(id) {
    if (!confirm('Tem certeza que deseja aprovar esta solicitação?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/${id}/aprovar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aprovar: true,
                observacoes: ''
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao aprovar solicitação');
        }
        
        const data = await response.json();
        showSuccessNotification('Solicitação aprovada com sucesso!');
        await carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao aprovar solicitação:', error);
        showAlert(`Erro ao aprovar solicitação: ${error.message}`, 'danger');
    }
};

window.negarSolicitacao = async function(id) {
    const observacoes = prompt('Digite o motivo da negação (opcional):');
    
    if (observacoes === null) {
        return; // Usuário cancelou
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/${id}/aprovar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aprovar: false,
                observacoes: observacoes || ''
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao negar solicitação');
        }
        
        const data = await response.json();
        showSuccessNotification('Solicitação negada.');
        await carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao negar solicitação:', error);
        showAlert(`Erro ao negar solicitação: ${error.message}`, 'danger');
    }
};

window.definirEmTransporte = async function(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/${id}/em-transporte`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao definir como em transporte');
        }
        
        showSuccessNotification('Status atualizado para Em Transporte!');
        await carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao definir em transporte:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
    }
};

window.confirmarRecebimento = async function(id) {
    if (!confirm('Confirmar que o produto foi recebido?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/${id}/confirmar-recebimento`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao confirmar recebimento');
        }
        
        showSuccessNotification('Recebimento do produto confirmado!');
        await carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao confirmar recebimento:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
    }
};

window.gerarCupom = async function(id) {
    if (!confirm('Gerar cupom de troca para esta solicitação?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/${id}/gerar-cupom`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao gerar cupom');
        }
        
        const data = await response.json();
        showSuccessNotification(`Cupom gerado com sucesso! ${data.mensagem || ''}`);
        await carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao gerar cupom:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
    }
};

window.finalizarTroca = async function(id) {
    if (!confirm('Finalizar esta troca/devolução? O status do pedido será atualizado.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/SolicitacaoTroca/${id}/finalizar`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao finalizar troca');
        }
        
        showSuccessNotification('Troca/devolução finalizada com sucesso!');
        await carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao finalizar troca:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
    }
};

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR');
    } catch (e) {
        return dateStr;
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showSuccessNotification(message) {
    showAlert(message, 'success');
}

