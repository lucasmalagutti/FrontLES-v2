document.addEventListener('DOMContentLoaded', () => {
    const salvarClienteBtn = document.getElementById('salvarCliente');
    const cancelarClienteBtn = document.getElementById('cancelarCliente');
    const alertContainer = document.getElementById('alertContainer');

    function showAlert(message, type) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}" role="alert">
                ${message}
            </div>
        `;
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 3000);
    }

    if (salvarClienteBtn) {
        salvarClienteBtn.addEventListener('click', async () => {
            const clienteDTO = {
                Id: 0,
                Nome: document.getElementById('nome').value,
                Cpf: document.getElementById('cpf').value,
                DtNasc: document.getElementById('dataNascimento').value,
                Email: document.getElementById('email').value,
                Senha: document.getElementById('senha').value,
                NumRanking: null,
                CadastroAtivo: true,
                DtCadastro: new Date().toISOString(),
                Genero: parseInt(document.getElementById('genero').value),
                TipoTelefone: parseInt(document.getElementById('tipoTelefone').value),
                Ddd: document.getElementById('DDD').value,
                NumeroTelefone: document.getElementById('numeroTelefone').value,
                Enderecos: [
                    {
                        Id: 0,
                        Nome: document.getElementById('nomeEntrega').value,
                        TipoEndereco: 2, // Entrega
                        TipoResidencia: parseInt(document.getElementById('tipoResidenciaEntrega').value),
                        TipoLogradouro: parseInt(document.getElementById('tipoLogradouroEntrega').value),
                        Logradouro: document.getElementById('logradouroEntrega').value,
                        Numero: document.getElementById('numeroEntrega').value,
                        Cep: document.getElementById('cepEntrega').value,
                        Bairro: document.getElementById('bairroEntrega').value,
                        Cidade: document.getElementById('cidadeEntrega').value,
                        Estado: document.getElementById('estadoEntrega').value,
                        Pais: document.getElementById('paisEntrega').value,
                        ClienteId: 0,
                        Observacoes: null
                    },
                    {
                        Id: 0,
                        Nome: document.getElementById('nomeCobranca').value,
                        TipoEndereco: 1, 
                        TipoResidencia: parseInt(document.getElementById('tipoResidenciaCobranca').value),
                        TipoLogradouro: parseInt(document.getElementById('tipoLogradouroCobranca').value),
                        Logradouro: document.getElementById('logradouroCobranca').value,
                        Numero: document.getElementById('numeroCobranca').value,
                        Cep: document.getElementById('cepCobranca').value,
                        Bairro: document.getElementById('bairroCobranca').value,
                        Cidade: document.getElementById('cidadeCobranca').value,
                        Estado: document.getElementById('estadoCobranca').value,
                        Pais: document.getElementById('paisCobranca').value,
                        ClienteId: 0,
                        Observacoes: null
                    }
                ],
                NumCartao: document.getElementById('numeroCartao').value,
                NomeImpresso: document.getElementById('nomeImpresso').value,
                Cvc: parseInt(document.getElementById('cvv').value),
                Bandeira: parseInt(document.getElementById('bandeira').value),
                Preferencial: true
            };

            try {
                const response = await fetch('https://localhost:7280/Cliente/Cadastrar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(clienteDTO)
                });

                if (response.ok) {
                    showAlert('Cliente salvo com sucesso!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    const errorData = await response.json();
                    showAlert('Erro ao salvar: ' + (errorData.message || 'Verifique os dados'), 'danger');
                }
            } catch (error) {
                showAlert('Erro na conexão com o servidor: ' + error.message, 'danger');
            }
        });
    }

    if (cancelarClienteBtn) {
        cancelarClienteBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});
