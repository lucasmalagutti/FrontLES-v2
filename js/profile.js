document.addEventListener('DOMContentLoaded', () => {
    // Dados simulados do cliente
    const customerData = {
        name: "Luiz Eduardo",
        cpf: "29932381080",
        email: "luizeduardo@gmail.com",
        gender: "Masculino",
        ddd: "11",
        phone: "965425853",
        phoneType: "Celular"
    };

    let savedAddresses = [
        { id: '1', name: 'Trabalho', typeResidence: 'Apartamento', typeStreet: 'Rua', street: 'Rua Glicério', number: '70', zip: '00000-000', neighborhood: 'Jardim Pinheiro', city: 'Itaqua', state: 'SP', country: 'Brasil' },
    ];

    let savedCards = [
        { id: '1', last4: '1111', namePrinted: 'Luiz Silva', cvv: '123', brand: 'Visa' }
    ];

    // Elementos do DOM
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileGender = document.getElementById('profile-gender');
    const profileCpf = document.getElementById('profile-cpf');
    const profilePhone = document.getElementById('profile-phone');

    const editPersonalDataBtn = document.getElementById('edit-personal-data-btn');
    const addNewAddressBtn = document.getElementById('add-new-address-btn');
    const addNewCardBtn = document.getElementById('add-new-card-btn');
    const editPasswordBtn = document.getElementById('edit-password-btn');

    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const savedCardsContainer = document.getElementById('saved-cards-container');

    // Funções para renderizar dados
    function renderPersonalData() {
        if (profileName) profileName.textContent = customerData.name;
        if (profileEmail) profileEmail.textContent = customerData.email;
        if (profileGender) profileGender.textContent = customerData.gender;
        if (profileCpf) profileCpf.textContent = customerData.cpf;
        if (profilePhone) profilePhone.textContent = `(${customerData.ddd}) ${customerData.phone} (${customerData.phoneType})`;
    }

    function renderSavedAddresses() {
        if (savedAddresses.length === 0) {
            savedAddressesContainer.innerHTML = '<p class="text-muted">Nenhum endereço salvo.</p>';
        } else {
            savedAddressesContainer.innerHTML = '';
            savedAddresses.forEach(address => {
                const addressDiv = document.createElement('div');
                addressDiv.classList.add('card', 'card-body', 'mb-2');
                addressDiv.innerHTML = `
                    <h6>${address.name}</h6>
                    <p class="mb-0">${address.typeStreet} ${address.street}, ${address.number} - ${address.neighborhood}</p>
                    <p class="mb-0">${address.city} - ${address.state}, ${address.zip}</p>
                    <p class="mb-0">${address.country}</p>
                    <button class="btn btn-sm btn-outline-primary mt-2 view-address-details" data-address-id="${address.id}">Ver Detalhes</button>
                `;
                savedAddressesContainer.appendChild(addressDiv);
            });

            document.querySelectorAll('.view-address-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const addressId = event.target.dataset.addressId;
                    // Lógica para abrir modal com detalhes do endereço
                    const enderecosModalEl = document.getElementById('enderecosModal');
                    if (enderecosModalEl) {
                        const enderecosModal = new bootstrap.Modal(enderecosModalEl);
                        enderecosModal.show();
                    }
                });
            });
        }
    }

    function renderSavedCards() {
        if (savedCards.length === 0) {
            savedCardsContainer.innerHTML = '<p class="text-muted">Nenhum cartão salvo.</p>';
        } else {
            savedCardsContainer.innerHTML = '';
            savedCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('card', 'card-body', 'mb-2');
                cardDiv.innerHTML = `
                    <h6>${card.brand} **** ${card.last4}</h6>
                    <p class="mb-0">Nome impresso: ${card.namePrinted}</p>
                    <button class="btn btn-sm btn-outline-primary mt-2 view-card-details" data-card-id="${card.id}">Ver Detalhes</button>
                `;
                savedCardsContainer.appendChild(cardDiv);
            });

            document.querySelectorAll('.view-card-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const cardId = event.target.dataset.cardId;
                    // Lógica para abrir modal com detalhes do cartão
                    const cartoesModalEl = document.getElementById('cartoesModal');
                    if (cartoesModalEl) {
                        const cartoesModal = new bootstrap.Modal(cartoesModalEl);
                        cartoesModal.show();
                    }
                });
            });
        }
    }

    // Event Listeners para botões de ação
    if (editPersonalDataBtn) {
        editPersonalDataBtn.addEventListener('click', () => {
            const editarDadosModalEl = document.getElementById('editarDadosModal');
            if (editarDadosModalEl) {
                const editarDadosModal = new bootstrap.Modal(editarDadosModalEl);
                editarDadosModal.show();
            }
        });
    }

    if (addNewAddressBtn) {
        addNewAddressBtn.addEventListener('click', () => {
            const addEnderecoModalEl = document.getElementById('addEnderecoModal');
            if (addEnderecoModalEl) {
                const addEnderecoModal = new bootstrap.Modal(addEnderecoModalEl);
                addEnderecoModal.show();
            }
        });
    }

    if (addNewCardBtn) {
        addNewCardBtn.addEventListener('click', () => {
            const addCartaoModalEl = document.getElementById('addCartaoModal');
            if (addCartaoModalEl) {
                const addCartaoModal = new bootstrap.Modal(addCartaoModalEl);
                addCartaoModal.show();
            }
        });
    }

    if (editPasswordBtn) {
        editPasswordBtn.addEventListener('click', () => {
            const editarSenhaModalEl = document.getElementById('editarSenhaModal');
            if (editarSenhaModalEl) {
                const editarSenhaModal = new bootstrap.Modal(editarSenhaModalEl);
                editarSenhaModal.show();
            }
        });
    }

    // Inicialização
    renderPersonalData();
    renderSavedAddresses();
    renderSavedCards();
});
