document.addEventListener('sharedContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get("id");

    if (!clienteId) {
        alert("ID do cliente não informado na URL!");
        return;
    }

    // --- Mapas de enums ---
    const generoMap = { 1: "Cis Masculino", 2: "Cis Feminino", 3: "Não Binário", 4: "Trans Masculino", 5: "Trans Feminino", 6: "Gênero Fluido", 7: "Bigênero", 8: "Outro" };
    const tipoTelefoneMap = { 1: "Fixo", 2: "Celular" };
    const tipoResidenciaMap = { 1: "Casa", 2: "Apartamento", 3: "Comercial" };
    const tipoLogradouroMap = { 1: "Rua", 2: "Avenida", 3: "Alameda", 4: "Travessa", 5: "Praça", 6: "Estrada", 7: "Rodovia", 8: "Beco", 9: "Passarela", 10: "Chácara", 11: "Sítio", 12: "Outros" };
    const tipoEnderecoMap = { 1: "Cobrança", 2: "Entrega" };
    const bandeiraCartaoMap = { 1: "Visa", 2: "MasterCard", 3: "American Express", 4: "Elo", 5: "HiperCard", 6: "Aura" };

    // --- Elementos do DOM ---
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileGender = document.getElementById('profile-gender');
    const profileCpf = document.getElementById('profile-cpf');
    const profilePhone = document.getElementById('profile-phone');
    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const savedCardsContainer = document.getElementById('saved-cards-container');

    const editPersonalDataBtn = document.getElementById('edit-personal-data-btn');
    const addNewAddressBtn = document.getElementById('add-new-address-btn');
    const addNewCardBtn = document.getElementById('add-new-card-btn');
    const editPasswordBtn = document.getElementById('edit-password-btn');

    // --- Função para abrir modal ---
    function openModal(modalId) {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;
        modalEl.setAttribute('data-cliente-id', clienteId);
        new bootstrap.Modal(modalEl).show();
    }

    // --- Bind dos botões ---
    if (editPersonalDataBtn) editPersonalDataBtn.onclick = () => openModal('editarDadosModal');
    if (addNewAddressBtn) addNewAddressBtn.onclick = () => openModal('addEnderecoModal');
    if (addNewCardBtn) addNewCardBtn.onclick = () => openModal('addCartaoModal');
    if (editPasswordBtn) editPasswordBtn.onclick = () => openModal('editarSenhaModal');

    // --- Função para carregar dados do cliente ---
    async function carregarCliente() {
        try {
            const response = await fetch(`https://localhost:7280/Cliente/BuscarPorId/${clienteId}`);
            if (!response.ok) throw new Error(`Erro ao buscar cliente: ${response.status}`);
            const cliente = await response.json();

            // --- Dados pessoais ---
            profileName.textContent = cliente.nome || "";
            profileEmail.textContent = cliente.email || "";
            profileGender.textContent = generoMap[cliente.genero] || cliente.genero || "";
            profileCpf.textContent = cliente.cpf || "";

            // --- Telefones ---
            profilePhone.innerHTML = '';
            if (cliente.telefones && cliente.telefones.length > 0) {
                cliente.telefones.forEach(tel => {
                    const telEl = document.createElement('p');
                    telEl.textContent = `(${tel.ddd || ""}) ${tel.numero || ""} (${tipoTelefoneMap[tel.tipo] || ""})`;
                    profilePhone.appendChild(telEl);
                });
            } else {
                profilePhone.textContent = 'Nenhum telefone cadastrado.';
            }

            // --- Endereços ---
            const enderecos = cliente.enderecos || [];
            savedAddressesContainer.innerHTML = '';
            if (enderecos.length === 0) {
                savedAddressesContainer.innerHTML = '<p class="text-muted">Nenhum endereço salvo.</p>';
            } else {
                enderecos.forEach(endereco => {
                    const div = document.createElement('div');
                    div.classList.add('card', 'card-body', 'mb-2');

                    const tipoLogradouro = tipoLogradouroMap[endereco.tipoLogradouro] || endereco.tipoLogradouro || "";
                    const tipoResidencia = tipoResidenciaMap[endereco.tipoResidencia] || endereco.tipoResidencia || "";
                    const tipoEndereco = tipoEnderecoMap[endereco.tipoEndereco] || endereco.tipoEndereco || "";

                    // Montagem do endereço considerando objetos aninhados
                    const cidade = endereco.cidade?.nome || endereco.cidade || '';
                    const estado = endereco.cidade?.estado?.nome || endereco.estado || '';
                    const pais = endereco.cidade?.estado?.pais?.nome || endereco.pais || '';

                    div.innerHTML = `
                        <h6>${endereco.nome || tipoEndereco}</h6>
                        <p class="mb-0">${tipoLogradouro} ${endereco.logradouro || ''}, ${endereco.numero || ''} - ${endereco.bairro || ''}</p>
                        <p class="mb-0">${cidade} - ${estado}, ${endereco.cep || ''}</p>
                        <p class="mb-0">${pais} (${tipoResidencia})</p>
                    `;
                    savedAddressesContainer.appendChild(div);
                });
            }

            // --- Cartões ---
            const cartoes = cliente.cartoes || [];
            savedCardsContainer.innerHTML = '';
            if (cartoes.length === 0) {
                savedCardsContainer.innerHTML = '<p class="text-muted">Nenhum cartão salvo.</p>';
            } else {
                cartoes.forEach(cartao => {
                    const numeroExibicao = cartao.numero ? `**** ${cartao.numero.slice(-4)}` : '';
                    const bandeiraNome = bandeiraCartaoMap[cartao.bandeira] || cartao.bandeira || "Desconhecida";

                    const div = document.createElement('div');
                    div.classList.add('card', 'card-body', 'mb-2');
                    div.innerHTML = `
                        <h6>${bandeiraNome} ${numeroExibicao}</h6>
                        <p class="mb-0">Nome impresso: ${cartao.nomeImpresso || ''}</p>
                    `;
                    savedCardsContainer.appendChild(div);
                });
            }

        } catch (error) {
            console.error("Erro:", error);
            alert("Não foi possível carregar os dados do cliente. Verifique o ID na URL.");
        }
    }

    await carregarCliente();
});
