describe('CRUD de Cliente', () => {
  // Visita a página de administração antes de cada teste
  beforeEach(() => {
      cy.visit('PaginaAdm.html');
  });

  it('Deve cadastrar um novo cliente com sucesso', () => {
      // Visita a página de formulário do cliente
      cy.visit('FormCliente.html');

      // Preenche os dados pessoais
      cy.get('#nome').type('Malagueta');
      cy.get('#dataNascimento').type('1990-01-01');
      cy.get('#cpf').type('44554581888');
      cy.get('#genero').select('Masculino');
      cy.get('#email').type('malagueta@gmail.com');
      cy.get('#tipoTelefone').select('Celular');
      cy.get('#DDD').type('11');
      cy.get('#numeroTelefone').type('99999-9999');
      cy.get('#senha').type('Malagueta!2');
      cy.get('#confirmarSenha').type('Malagueta!2');

      // Preenche o endereço de entrega
      cy.get('#nomeEntrega').type('Casa');
      cy.get('#tipoResidenciaEntrega').select('Casa');
      cy.get('#tipoLogradouroEntrega').select('Rua');
      cy.get('#logradouroEntrega').type('Rua das Flores');
      cy.get('#numeroEntrega').type('123');
      cy.get('#cepEntrega').type('01000-000');
      cy.get('#bairroEntrega').type('Centro');
      cy.get('#cidadeEntrega').type('São Paulo');
      cy.get('#estadoEntrega').type('SP');
      cy.get('#paisEntrega').type('Brasil');

      // Preenche o endereço de cobrança (pode ser o mesmo da entrega)
      cy.get('#nomeCobranca').type('Casa');
      cy.get('#tipoResidenciaCobranca').select('Casa');
      cy.get('#tipoLogradouroCobranca').select('Rua');
      cy.get('#logradouroCobranca').type('Rua das Flores');
      cy.get('#numeroCobranca').type('123');
      cy.get('#cepCobranca').type('01000-000');
      cy.get('#bairroCobranca').type('Centro');
      cy.get('#cidadeCobranca').type('São Paulo');
      cy.get('#estadoCobranca').type('SP');
      cy.get('#paisCobranca').type('Brasil');

      // Preenche os dados do cartão de crédito
      cy.get('#numeroCartao').type('1234567890123456');
      cy.get('#cvv').type('123');
      cy.get('#nomeImpresso').type('JOAO DA SILVA');
      cy.get('#bandeira').select('Visa');

      // Clica no botão para salvar o cliente
      cy.get('#salvarCliente').click();

      cy.wait(3000);

      // Verifica se o cliente foi cadastrado e aparece na lista
      cy.visit('PaginaAdm.html'); // Volta para a página de administração

      cy.get('#cpf').type('44554581888');
      cy.get('#filtrar').click();
      cy.get('#clientesTableBody').should('contain', 'Malagueta');
  });

});