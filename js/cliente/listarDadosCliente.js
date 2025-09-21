const apiUrlListar = "https://localhost:7280/Cliente/Listar";
const apiUrlFiltro = "https://localhost:7280/Cliente/BuscarPorFiltro";

document.addEventListener("DOMContentLoaded", () => {
    listarTodosClientes();
});

document.getElementById("formBusca").addEventListener("submit", async function (e) {
    e.preventDefault();
    buscarClientesPorFiltro(new FormData(this));
});

document.getElementById("formBusca").addEventListener("reset", async function () {
    setTimeout(() => listarTodosClientes(), 0);
});

async function listarTodosClientes() {
    try {
        const response = await fetch(apiUrlListar);
        if (!response.ok) throw new Error("Erro ao listar clientes: " + response.statusText);

        const clientes = await response.json();
        renderClientes(clientes);
    } catch (error) {
        console.error(error);
        alert("Erro ao listar clientes: " + error.message);
    }
}

async function buscarClientesPorFiltro(formData) {
    try {
        const params = new URLSearchParams(formData);
        const response = await fetch(`${apiUrlFiltro}?${params.toString()}`);

        if (!response.ok) throw new Error("Erro ao buscar clientes: " + response.statusText);

        const clientes = await response.json();
        renderClientes(clientes);
    } catch (error) {
        console.error(error);
        alert("Erro ao buscar clientes: " + error.message);
    }
}

function renderClientes(clientes) {
    const tbody = document.getElementById("clientesTableBody");
    tbody.innerHTML = "";

    clientes.forEach(cliente => {
        const tr = document.createElement("tr");

        let generoTexto = "";
        switch (cliente.genero) {
            case 1: generoTexto = "Cis Masculino"; break;
            case 2: generoTexto = "Cis Feminino"; break;
            case 3: generoTexto = "Não Binário"; break;
            case 4: generoTexto = "Trans Masculino"; break;
            case 5: generoTexto = "Trans Feminino"; break;
            case 6: generoTexto = "Gênero Fluido"; break;
            case 7: generoTexto = "Bigênero"; break;
            case 8: generoTexto = "Outro"; break;
            default: generoTexto = "Desconhecido"; break;
        }

        let tipoTelefoneTexto = "";
        switch (cliente.tipoTelefone) {
            case 1: tipoTelefoneTexto = "Fixo"; break;
            case 2: tipoTelefoneTexto = "Celular"; break;
            default: tipoTelefoneTexto = "Desconhecido"; break;
        }

        const statusBadge = cliente.cadastroAtivo
            ? '<span class="badge bg-success">Ativo</span>'
            : '<span class="badge bg-danger">Inativo</span>';

        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cpf}</td>
            <td>${cliente.email}</td>
            <td>${generoTexto}</td>
            <td>${new Date(cliente.dtNasc).toLocaleDateString()}</td>
            <td>${cliente.ddd}</td>
            <td>${cliente.numeroTelefone}</td>
            <td>${tipoTelefoneTexto}</td>
            <td><button class="btn btn-primary btn-sm visualizar-enderecos-btn" data-cliente-id="${cliente.id}" data-bs-toggle="modal" data-bs-target="#enderecosModal">Visualizar Endereços</button></td>
            <td><button class="btn btn-primary btn-sm visualizar-cartoes-btn" data-cliente-id="${cliente.id}" data-bs-toggle="modal" data-bs-target="#cartoesModal">Visualizar Cartões</button></td>
            <td><button class="btn btn-primary btn-sm visualizar-transacoes-btn" data-bs-toggle="modal" data-bs-target="#transacoesModal">Visualizar Transações</button></td>
            <td>${statusBadge}</td>
            <td>
                <div class="row d-flex flex-wrap gap-2">
                    <button class="btn btn-primary btn-sm editar-dados-btn" data-bs-toggle="modal" data-cliente-id="${cliente.id}" data-bs-target="#editarDadosModal">Editar Dados</button>
                    <button class="btn btn-primary btn-sm add-endereco-btn" data-bs-toggle="modal" data-cliente-id="${cliente.id}" data-bs-target="#addEnderecoModal">Adicionar Endereço</button>
                    <button class="btn btn-primary btn-sm add-cartao-btn" data-bs-toggle="modal" data-cliente-id="${cliente.id}" data-bs-target="#addCartaoModal">Adicionar Cartão</button>
                    <button class="btn btn-primary btn-sm editar-senha-btn" data-bs-toggle="modal" data-cliente-id="${cliente.id}" data-bs-target="#editarSenhaModal">Editar Senha</button>
                    <button class="btn btn-danger btn-sm inativar-cliente-btn" data-cliente-id="${cliente.id}">Inativar</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Add event delegation for inativar-cliente-btn outside the loop
document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('inativar-cliente-btn')) {
        const clienteId = event.target.dataset.clienteId;
        if (clienteId && window.inativarCliente) {
            await window.inativarCliente(clienteId);
        }
    }

    if (event.target.classList.contains('add-endereco-btn')) {
        const clienteId = event.target.dataset.clienteId;
        const addEnderecoModal = document.getElementById('addEnderecoModal');
        if (addEnderecoModal && clienteId) {
            addEnderecoModal.setAttribute('data-cliente-id', clienteId);
        }
    }

    if (event.target.classList.contains('editar-dados-btn')) {
        const clienteId = event.target.dataset.clienteId;
        const editarDadosModal = document.getElementById('editarDadosModal');
        if (editarDadosModal && clienteId) {
            editarDadosModal.setAttribute('data-cliente-id', clienteId);
        }
    }

    if (event.target.classList.contains('add-cartao-btn')) {
        const clienteId = event.target.dataset.clienteId;
        const addCartaoModal = document.getElementById('addCartaoModal');
        if (addCartaoModal && clienteId) {
            addCartaoModal.setAttribute('data-cliente-id', clienteId);
        }
    }

    if (event.target.classList.contains('editar-senha-btn')) {
        const clienteId = event.target.dataset.clienteId;
        const editarSenhaModal = document.getElementById('editarSenhaModal');
        if (editarSenhaModal && clienteId) {
            editarSenhaModal.setAttribute('data-cliente-id', clienteId);
        }
    }
});