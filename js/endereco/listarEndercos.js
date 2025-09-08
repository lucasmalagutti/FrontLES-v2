const enderecosApiUrl = "https://localhost:7280/Endereco/Listar"; 

document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('visualizar-enderecos-btn')) {
        const clienteId = event.target.getAttribute('data-cliente-id');
        await carregarEnderecos(clienteId);
    }
});

async function carregarEnderecos(clienteId) {
    try {
        const response = await fetch(`${enderecosApiUrl}/${clienteId}`);
        if (!response.ok) throw new Error("Erro ao buscar endereços: " + response.statusText);
        const enderecos = await response.json();

        const tbody = document.querySelector('#enderecosTable tbody');
        tbody.innerHTML = '';

        if (enderecos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center">Nenhum endereço cadastrado</td></tr>';
            return;
        }

        enderecos.forEach(endereco => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <th>Nome do Endereço:</th><td>${endereco.nome}</td>
                <th>Tipo Residência:</th><td>${endereco.tipoResidenciaNome}</td>
                <th>Tipo Logradouro:</th><td>${endereco.tipoLogradouroNome}</td>
                <th>Logradouro:</th><td>${endereco.logradouro}</td>
                <th>Número:</th><td>${endereco.numero}</td>
                <th>CEP:</th><td>${endereco.cep}</td>
                <th>Bairro:</th><td>${endereco.bairro}</td>
                <th>Cidade:</th><td>${endereco.cidade}</td>
                <th>Estado:</th><td>${endereco.estado}</td>
                <th>País:</th><td>${endereco.pais}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar endereços: " + error.message);
    }
}
