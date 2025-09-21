describe('CRUD de Cliente', () => {
  beforeEach(() => {
      cy.visit('PaginaAdm.html');
  });

  it('Deve cadastrar um novo cliente com sucesso', () => {
      cy.visit('FormCliente.html');

      cy.get('#nome')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Malagueta', { delay: 50 })
        .should('have.value', 'Malagueta');
      
      cy.get('#dataNascimento')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('1990-01-01', { delay: 50 })
        .should('have.value', '1990-01-01');
      
      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('44554581851', { delay: 50 })
        .should('have.value', '44554581851');
      
      cy.get('#genero').select('Masculino');
      
      cy.get('#email')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('malagueta@gmail.com', { delay: 50 })
        .should('have.value', 'malagueta@gmail.com');
      
      cy.get('#tipoTelefone').select('Celular');
      
      cy.get('#DDD')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11', { delay: 50 })
        .should('have.value', '11');
      
      cy.get('#numeroTelefone')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('99999-9999', { delay: 50 })
        .should('have.value', '99999-9999');
      
      cy.get('#senha')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Malagueta!222', { delay: 50 })
        .should('have.value', 'Malagueta!222');
      
      cy.get('#confirmarSenha')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Malagueta!222', { delay: 50 })
        .should('have.value', 'Malagueta!222');

      cy.get('#nomeEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Casa', { delay: 50 })
        .should('have.value', 'Casa');
      
      cy.get('#tipoResidenciaEntrega').select('Casa');
      cy.get('#tipoLogradouroEntrega').select('Rua');
      
      cy.get('#logradouroEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Rua das Flores', { delay: 50 })
        .should('have.value', 'Rua das Flores');
      
      cy.get('#numeroEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('123', { delay: 50 })
        .should('have.value', '123');
      
      cy.get('#cepEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('01000-000', { delay: 50 })
        .should('have.value', '01000-000');
      
      cy.get('#bairroEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Centro', { delay: 50 })
        .should('have.value', 'Centro');
      
      cy.get('#cidadeEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('São Paulo', { delay: 50 })
        .should('have.value', 'São Paulo');
      
      cy.get('#estadoEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('SP', { delay: 50 })
        .should('have.value', 'SP');
      
      cy.get('#paisEntrega')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Brasil', { delay: 50 })
        .should('have.value', 'Brasil');

      cy.get('#nomeCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Casa', { delay: 50 })
        .should('have.value', 'Casa');
      
      cy.get('#tipoResidenciaCobranca').select('Casa');
      cy.get('#tipoLogradouroCobranca').select('Rua');
      
      cy.get('#logradouroCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Rua das Flores', { delay: 50 })
        .should('have.value', 'Rua das Flores');
      
      cy.get('#numeroCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('123', { delay: 50 })
        .should('have.value', '123');
      
      cy.get('#cepCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('01000-000', { delay: 50 })
        .should('have.value', '01000-000');
      
      cy.get('#bairroCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Centro', { delay: 50 })
        .should('have.value', 'Centro');
      
      cy.get('#cidadeCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('São Paulo', { delay: 50 })
        .should('have.value', 'São Paulo');
      
      cy.get('#estadoCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('SP', { delay: 50 })
        .should('have.value', 'SP');
      
      cy.get('#paisCobranca')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Brasil', { delay: 50 })
        .should('have.value', 'Brasil');

      cy.get('#numeroCartao')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('1234567890123456', { delay: 50 })
        .should('have.value', '1234567890123456');
      
      cy.get('#cvv')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('123', { delay: 50 })
        .should('have.value', '123');
      
      cy.get('#nomeImpresso')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('JOAO DA SILVA', { delay: 50 })
        .should('have.value', 'JOAO DA SILVA');
      
      cy.get('#bandeira').select('Visa');

      cy.get('#salvarCliente').click();

      cy.wait(3000);

      cy.visit('PaginaAdm.html');

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('44554581851', { delay: 50 })
        .should('have.value', '44554581851');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', 'Malagueta');
  });

  it('Deve editar os dados de um cliente existente', () => {
      cy.visit('PaginaAdm.html');

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('44554581851', { delay: 50 })
        .should('have.value', '44554581851');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', 'Malagueta');

      cy.get('.editar-dados-btn').first().click();

      cy.get('#editarDadosModal').should('be.visible');

      cy.get('#editNomeCompleto')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Malagueta Editado', { delay: 50 })
        .should('have.value', 'Malagueta Editado');

      cy.get('#editCpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11122233344', { delay: 50 })
        .should('have.value', '11122233344');

      cy.get('#editDataNascimento')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('1995-05-05', { delay: 50 })
        .should('have.value', '1995-05-05');

      cy.get('#editGenero').should('exist').and('be.visible').and('not.be.disabled').select('Cis Feminino');

      cy.get('#editEmail')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('malagueta.editado@gmail.com', { delay: 50 })
        .should('have.value', 'malagueta.editado@gmail.com');

      cy.get('#editTipoTelefone').should('exist').and('be.visible').and('not.be.disabled').select('Fixo');

      cy.get('#editDdd')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('21', { delay: 50 })
        .should('have.value', '21');

      cy.get('#editNumeroTelefone')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('88888-8888', { delay: 50 })
        .should('have.value', '88888-8888');

      cy.get('#salvarAlteracoesBtn').click();

      cy.wait(3000);

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11122233344', { delay: 50 })
        .should('have.value', '11122233344');
      cy.get('#filtrar').click();
      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', '11122233344');
      cy.wait(2000);
  });

  it('Deve adicionar um novo endereço para o cliente', () => {
      cy.visit('PaginaAdm.html');

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11122233344', { delay: 50 })
        .should('have.value', '11122233344');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', '11122233344');

      cy.get('.add-endereco-btn').first().click();
      cy.get('#addEnderecoModal').should('be.visible');

      cy.get('#enderecoNome')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Trabalho', { delay: 50 })
        .should('have.value', 'Trabalho');
      
      cy.get('#enderecoTipoEndereco').should('be.visible').and('not.be.disabled').select('Entrega');
      cy.get('#enderecoTipoResidencia').should('be.visible').and('not.be.disabled').select('Comercial');
      cy.get('#enderecoTipoLogradouro').should('be.visible').and('not.be.disabled').select('Avenida');
      
      cy.get('#enderecoLogradouro')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Avenida Brasil', { delay: 50 })
        .should('have.value', 'Avenida Brasil');
      
      cy.get('#enderecoNumero')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('1000', { delay: 50 })
        .should('have.value', '1000');
      
      cy.get('#enderecoCep')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('20000-000', { delay: 50 })
        .should('have.value', '20000-000');
      
      cy.get('#enderecoBairro')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Centro', { delay: 50 })
        .should('have.value', 'Centro');
      
      cy.get('#enderecoCidade')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Rio de Janeiro', { delay: 50 })
        .should('have.value', 'Rio de Janeiro');
      
      cy.get('#enderecoEstado')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('RJ', { delay: 50 })
        .should('have.value', 'RJ');
      
      cy.get('#enderecoPais')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Brasil', { delay: 50 })
        .should('have.value', 'Brasil');
      
      cy.get('#enderecoObservacoes')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('Próximo ao shopping', { delay: 50 })
        .should('have.value', 'Próximo ao shopping');
      
      cy.get('#salvarEnderecoBtn').click();
      cy.get('#addEnderecoModal').should('not.be.visible');

      cy.wait(3000);
  });

  it('Deve visualizar os endereços do cliente', () => {
      cy.visit('PaginaAdm.html');

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11122233344', { delay: 50 })
        .should('have.value', '11122233344');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', '11122233344');

      cy.get('.visualizar-enderecos-btn').first().click();
      cy.get('#enderecosModal').should('be.visible');
      cy.wait(3000);
      cy.get('#enderecosModal .btn-close').click();
      cy.wait(1000);
  });

  it('Deve adicionar um novo cartão para o cliente', () => {
      cy.visit('PaginaAdm.html');

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11122233344', { delay: 50 })
        .should('have.value', '11122233344');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', '11122233344');

      cy.get('.add-cartao-btn').first().click();
      cy.get('#addCartaoModal').should('be.visible');

      cy.get('#addCartaoNomeImpresso')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('TESTE', { delay: 50 })
        .should('have.value', 'TESTE');
      
      cy.get('#addCartaoNumero')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('1111222233334444', { delay: 50 })
        .should('have.value', '1111222233334444');
      
      cy.get('#addCartaoCvv')
        .should('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('123', { delay: 50 })
        .should('have.value', '123');
      
      cy.get('#addCartaoBandeira').should('be.visible').and('not.be.disabled').select('Visa');
      cy.get('#salvarCartaoBtn').click();
      cy.get('#addCartaoModal').should('not.be.visible');

      cy.wait(3000);
  });

  it('Deve visualizar os cartões do cliente', () => {
      cy.visit('PaginaAdm.html');

      cy.get('#cpf')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .clear()
        .wait(100)
        .type('11122233344', { delay: 50 })
        .should('have.value', '11122233344');
      cy.get('#filtrar').click();

      cy.wait(2000);
      cy.get('#clientesTableBody').should('contain', '11122233344');

      cy.get('.visualizar-cartoes-btn').first().click();
      cy.get('#cartoesModal').should('be.visible');
      cy.wait(3000);
      cy.get('#cartoesModal .btn-close').click();
      cy.wait(1000);
  });

  it('Deve alterar a senha do cliente com sucesso', () => {
    cy.visit('PaginaAdm.html');

    cy.get('#cpf')
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled')
      .clear()
      .wait(100)
      .type('11122233344', { delay: 50 })
      .should('have.value', '11122233344');
    cy.get('#filtrar').click();
    cy.wait(2000);

    cy.get('#clientesTableBody').should('contain', '11122233344');

    cy.get('.editar-senha-btn').first().click();

    cy.get('#editarSenhaModal').should('be.visible');


    cy.get('#senhaAtual')
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled')
      .clear()
      .wait(100)
      .type('Malagueta!222', { delay: 50 })
      .should('have.value', 'Malagueta!222');

    cy.get('#novaSenha')
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled')
      .clear()
      .wait(100)
      .type('Malagueta!211', { delay: 50 })
      .should('have.value', 'Malagueta!211');
    
    cy.get('#confirmarNovaSenha')
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled')
      .clear()
      .wait(100)
      .type('Malagueta!211', { delay: 50 })
      .should('have.value', 'Malagueta!211');

    cy.get('#salvarSenhaBtn').click();

    cy.wait(3000);

    cy.get('#editarSenhaModal').should('not.be.visible');
  });

  it('Deve inativar o cliente com sucesso', () => {
    cy.visit('PaginaAdm.html');

    cy.get('#cpf')
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled')
      .clear()
      .wait(100)
      .type('11122233344', { delay: 50 })
      .should('have.value', '11122233344');
    cy.get('#filtrar').click();

    cy.wait(2000);
    cy.get('#clientesTableBody').should('contain', '11122233344');

    cy.get('#clientesTableBody').should('contain', 'Ativo');

    cy.get('.inativar-cliente-btn').first().click();

    cy.wait(3000);

    cy.get('#clientesTableBody').should('contain', 'Inativo');
  });


});