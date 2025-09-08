document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('visualizar-cartoes-btn')) {
        const clienteId = event.target.getAttribute('data-cliente-id');

        try {
            const response = await fetch(`https://localhost:7280/Cartao/Listar/${clienteId}`);
            if (!response.ok) throw new Error('Erro ao buscar cartões do cliente.');

            const cartoes = await response.json();
            const container = document.getElementById('cartoesContainer');

            // Limpa cartões anteriores
            container.innerHTML = '';

            if (cartoes.length === 0) {
                container.innerHTML = '<p>Este cliente não possui cartões cadastrados.</p>';
                return;
            }

            // Adiciona cada cartão
            cartoes.forEach(cartao => {
                const table = document.createElement('table');
                table.className = 'table table-bordered table-striped mb-3';
                table.innerHTML = `
                    <tbody>
                        <tr>
                            <th>Número:</th>
                            <td>${cartao.numCartao}</td>
                        </tr>
                        <tr>
                            <th>Nome Impresso:</th>
                            <td>${cartao.nomeImpresso}</td>
                        </tr>
                        <tr>
                            <th>CVV:</th>
                            <td>${cartao.cvc}</td>
                        </tr>
                        <tr>
                            <th>Bandeira:</th>
                            <td>${cartao.bandeiraNome}</td>
                        </tr>
                        <tr>
                            <th>Preferencial:</th>
                            <td>${cartao.preferencial ? 'Sim' : 'Não'}</td>
                        </tr>
                    </tbody>
                `;
                container.appendChild(table);
            });

        } catch (error) {
            console.error(error);
            const container = document.getElementById('cartoesContainer');
            container.innerHTML = '<p class="text-danger">Não foi possível carregar os cartões.</p>';
        }
    }
});
