describe('Fluxo de Troca/Devolução Negada E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Maximum call stack size exceeded')) {
        return false;
      }
      return true;
    });
  });

  it('Deve executar o fluxo completo de troca/devolução negada', () => {
    // 1. Visitar tela de gerenciar Pedidos
    cy.visit('gerenciarPedidos.html');
    cy.url().should('include', 'gerenciarPedidos.html');
    cy.wait(3000); // Aguardar carregamento dos pedidos

    // 2. Mudar status do pagamento de pendente para aprovado
    cy.get('tbody#pedidosTableBody').should('be.visible');
    cy.get('tbody#pedidosTableBody tr').first().within(() => {
      cy.get('select').eq(0).select('APROVADO'); 
    });
    cy.wait(2000);

    // 3. Mudar status gradualmente: aguardando confirmação -> em processamento -> em trânsito -> entregue
    cy.get('tbody#pedidosTableBody tr').first().within(() => {
      cy.get('select').eq(1).select('EM PROCESSAMENTO');
    });
    cy.wait(2000);

    // 3.2. Mudar de em processamento para em trânsito
    cy.get('tbody#pedidosTableBody tr').first().within(() => {
      cy.get('select').eq(1).select('EM TRANSITO'); 
    });
    cy.wait(2000);

    // 3.3. Mudar de em trânsito para entregue
    cy.get('tbody#pedidosTableBody tr').first().within(() => {
      cy.get('select').eq(1).select('ENTREGUE'); 
    });
    cy.wait(2000);

    // 4. Visitar tela ver pedidos
    cy.visit('orders.html');
    cy.url().should('include', 'orders.html');
    cy.wait(3000); // Aguardar carregamento dos pedidos

    // 5. Clicar em solicitar troca/devolução
    cy.get('.solicitar-troca-btn').first().click();
    cy.wait(2000);

    // 6. Selecionar opção "Troca de Produto" ao invés de devolução completa
    cy.get('#tipoTroca').check();
    cy.wait(500); // Aguardar evento de mudança processar

    // 6.1. Aguardar container de seleção aparecer e selecionar o primeiro produto
    cy.get('#selecaoItemContainer').should('be.visible');
    cy.get('#item-pedido-select').should('be.visible');
    
    // Selecionar o primeiro item disponível (excluindo a opção vazia "Selecione um item...")
    // Pega todas as opções, filtra a primeira que tenha valor não vazio e seleciona
    cy.get('#item-pedido-select option').not(':first').first().then(($option) => {
      const valor = $option.val();
      if (valor) {
        cy.get('#item-pedido-select').select(valor);
      }
    });
    cy.wait(500);

    // 7. No motivo da troca escreva 'nao gostei'
    cy.get('#motivoTroca').type('nao gostei', { delay: 50 });

    // 8. Clicar em enviar solicitação
    cy.get('#btnEnviarSolicitacao').click();
    cy.wait(3000);

    // 9. Visitar tela gerenciar trocas e devoluções
    cy.visit('gerenciarTrocas.html');
    cy.url().should('include', 'gerenciarTrocas.html');
    cy.wait(3000); // Aguardar carregamento das solicitações

    // 10. Em ações clicar em negar (ao invés de aprovar)
    cy.get('tbody#solicitacoesTableBody').should('be.visible');
    
    // Configurar stub do window.prompt para retornar 'reprovado'
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('reprovado').as('promptStub');
      
    });

    // Clicar no botão negar (o prompt retornará 'reprovado' automaticamente)
    cy.get('tbody#solicitacoesTableBody tr').first().within(() => {
      cy.get('button[onclick*="negarSolicitacao"]').click();
    });
    
    // Verificar se o prompt foi chamado e aguardar processamento
    cy.get('@promptStub').should('have.been.called');
    cy.wait(3000); // Aguardar processamento da negação
    
    // 11. Clicar no botão recarregar
    cy.get('button[onclick="recarregarSolicitacoes()"]').click();
    cy.wait(3000);

    // Verificar se a solicitação foi negada (deve aparecer com status "Negada")
    cy.get('tbody#solicitacoesTableBody').should('be.visible');
    cy.get('tbody#solicitacoesTableBody').should('contain', 'Negada');

    cy.log('Teste de fluxo de troca/devolução negada concluído com sucesso!');
  });
});
