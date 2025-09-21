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
      cy.get('#cpf').type('44554581855');
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

      cy.get('#cpf').type('44554581881');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', 'Malagueta');
      
      cy.get('.inativar-cliente-btn').click();
      cy.wait(2000);

      // Clica no botão "Editar Dados" do cliente
      cy.get('.editar-dados-btn').first().click(); // Clica no primeiro botão de editar dados encontrado

      // Espera o modal de edição abrir
      cy.get('#editarDadosModal').should('be.visible');

      // Preenche os campos do modal de edição com novos dados
      cy.get('#editNomeCompleto').should('exist').and('be.visible').and('not.be.disabled').clear();
      cy.get('#editNomeCompleto').should('exist').and('be.visible').and('not.be.disabled').type('Malagueta Editado');

      cy.get('#editCpf').should('exist').and('be.visible').and('not.be.disabled').clear();
      cy.get('#editCpf').should('exist').and('be.visible').and('not.be.disabled').type('11122233344'); // Novo CPF

      cy.get('#editDataNascimento').should('exist').and('be.visible').and('not.be.disabled').type('1995-05-05'); // Nova data de nascimento

      cy.get('#editGenero').should('exist').and('be.visible').and('not.be.disabled').select('Cis Feminino'); // Novo gênero

      cy.get('#editEmail').should('exist').and('be.visible').and('not.be.disabled').clear();
      cy.get('#editEmail').should('exist').and('be.visible').and('not.be.disabled').type('malagueta.editado@gmail.com');

      cy.get('#editTipoTelefone').should('exist').and('be.visible').and('not.be.disabled').select('Fixo');

      cy.get('#editDdd').should('exist').and('be.visible').and('not.be.disabled').clear();
      cy.get('#editDdd').should('exist').and('be.visible').and('not.be.disabled').type('21');

      cy.get('#editNumeroTelefone').should('exist').and('be.visible').and('not.be.disabled').clear();
      cy.get('#editNumeroTelefone').should('exist').and('be.visible').and('not.be.disabled').type('88888-8888');

      // Clica no botão para salvar as alterações
      cy.get('#salvarAlteracoesBtn').click();

      cy.wait(3000); // Espera a alteração ser processada e a lista ser recarregada

      // Filtra novamente para verificar os dados editados
      cy.get('#cpf').clear().type('11122233344'); // Busca pelo novo CPF
      cy.get('#filtrar').click();
      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', '11122233344');// Verifica que o nome antigo não está presente
      cy.wait(2000);

      // Adicionar novo endereço
      cy.get('.add-endereco-btn').first().click(); // Clica no botão Adicionar Endereço
      cy.get('#addEnderecoModal').should('be.visible');

      cy.get('#enderecoNome').should('be.visible').and('not.be.disabled').type('Trabalho');
      cy.get('#enderecoTipoEndereco').should('be.visible').and('not.be.disabled').select('Entrega');
      cy.get('#enderecoTipoResidencia').should('be.visible').and('not.be.disabled').select('Comercial');
      cy.get('#enderecoTipoLogradouro').should('be.visible').and('not.be.disabled').select('Avenida');
      cy.get('#enderecoLogradouro').should('be.visible').and('not.be.disabled').type('Avenida Brasil');
      cy.get('#enderecoNumero').should('be.visible').and('not.be.disabled').type('1000');
      cy.get('#enderecoCep').should('be.visible').and('not.be.disabled').type('20000-000');
      cy.get('#enderecoBairro').should('be.visible').and('not.be.disabled').type('Centro');
      cy.get('#enderecoCidade').should('be.visible').and('not.be.disabled').type('Rio de Janeiro');
      cy.get('#enderecoEstado').should('be.visible').and('not.be.disabled').type('RJ');
      cy.get('#enderecoPais').should('be.visible').and('not.be.disabled').type('Brasil');
      cy.get('#enderecoObservacoes').should('be.visible').and('not.be.disabled').type('Próximo ao shopping');
      cy.get('#salvarEnderecoBtn').click();
      cy.get('#addEnderecoModal').should('not.be.visible'); // Ensure modal is closed

      cy.wait(3000); // Espera o endereço ser salvo e a lista ser recarregada

      // Visualizar endereços
      cy.get('.visualizar-enderecos-btn').first().click();
      cy.get('#enderecosModal').should('be.visible');
      cy.get('#enderecosTable').should('contain', 'Trabalho');
      cy.get('#enderecosTable').should('contain', 'Avenida Brasil');
      cy.get('#enderecosTable').should('contain', 'Rio de Janeiro');
      cy.wait(3000);
      cy.get('#enderecosModal .btn-close').click(); // Fecha o modal de endereços
      
      cy.wait(3000);

      // Adicionar novo cartão
      cy.get('.add-cartao-btn').first().click(); // Clica no botão Adicionar Cartão
      cy.get('#addCartaoModal').should('be.visible');

      cy.get('#addCartaoNomeImpresso').should('be.visible').and('not.be.disabled').type('TESTE CYPRESS');
      cy.get('#addCartaoNumero').should('be.visible').and('not.be.disabled').type('1111222233334444');
      cy.get('#addCartaoCvv').should('be.visible').and('not.be.disabled').type('123');
      cy.get('#addCartaoBandeira').should('be.visible').and('not.be.disabled').select('Visa');
      cy.get('#salvarCartaoBtn').click();
      cy.get('#addCartaoModal').should('not.be.visible'); // Ensure modal is closed

      cy.wait(3000); // Espera o cartão ser salvo e a lista ser recarregada

      // Visualizar cartões
      cy.get('.visualizar-cartoes-btn').first().click();
      cy.get('#cartoesModal').should('be.visible');
      cy.wait(3000);
      cy.get('#cartoesModal .btn-close').click(); // Fecha o modal de cartões
      cy.wait(1000);

  });

});