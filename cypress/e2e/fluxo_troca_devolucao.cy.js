describe('Fluxo de Troca/Devolução E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Maximum call stack size exceeded')) {
        return false;
      }
      return true;
    });
  });

  it('Deve executar o fluxo completo de troca/devolução', () => {
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

    // 6. Manter opção devolução completa (já vem marcada por padrão)
    cy.get('#tipoDevolucao').should('be.checked');

    // 7. No motivo da devolução escreva 'nao gostei'
    cy.get('#motivoTroca').type('nao gostei', { delay: 50 });

    // 8. Clicar em enviar solicitação
    cy.get('#btnEnviarSolicitacao').click();
    cy.wait(3000);

    // 9. Visitar tela gerenciar trocas e devoluções
    cy.visit('gerenciarTrocas.html');
    cy.url().should('include', 'gerenciarTrocas.html');
    cy.wait(3000); // Aguardar carregamento das solicitações

    // 10. Em ações clicar em aprovar
    cy.get('tbody#solicitacoesTableBody').should('be.visible');
    cy.get('tbody#solicitacoesTableBody tr').first().within(() => {
      cy.get('button[onclick*="aprovarSolicitacao"]').click();
    });
    cy.wait(2000);
    
    // 11. Clicar no botão recarregar
    cy.get('button[onclick="recarregarSolicitacoes()"]').click();
    

    // 12. Em ações clicar em marcar em transporte
    cy.get('tbody#solicitacoesTableBody tr').first().within(() => {
      cy.get('button[onclick*="definirEmTransporte"]').click();
    });
    cy.wait(2000);

    // 13. Clicar no botão recarregar
    cy.get('button[onclick="recarregarSolicitacoes()"]').click();
    

    // 14. Em ações clicar em confirme recebimento
    cy.get('tbody#solicitacoesTableBody tr').first().within(() => {
      cy.get('button[onclick*="confirmarRecebimento"]').click();
    });
    cy.wait(2000);

    // 15. Clicar em recarregar
    cy.get('button[onclick="recarregarSolicitacoes()"]').click();
    

    // 16. Clicar em gerar cupom
    cy.get('tbody#solicitacoesTableBody tr').first().within(() => {
      cy.get('button[onclick*="gerarCupom"]').click();
    });
    cy.wait(2000);

    // 17. Clicar em recarregar
    cy.get('button[onclick="recarregarSolicitacoes()"]').click();
    

    // 18. Clicar em finalizar troca
    cy.get('tbody#solicitacoesTableBody tr').first().within(() => {
      cy.get('button[onclick*="finalizarTroca"]').click();
    });
    cy.wait(2000);

    // 19. Clicar em recarregar
    cy.get('button[onclick="recarregarSolicitacoes()"]').click();
    

    // 20. Visitar tela index
    cy.visit('index.html');
    cy.url().should('include', 'index.html');
    cy.wait(3000); 

    // 21. Clicar em comprar uma bola de futebol nike
    cy.get('#futebol').should('be.visible');
    
    // Tentar encontrar produto com "nike" primeiro
    cy.get('#futebol .card').then(($cards) => {
      const temNike = Array.from($cards).some(card => 
        Cypress.$(card).text().toLowerCase().includes('nike')
      );
      
      if (temNike) {
        cy.get('#futebol .card').contains('nike', { matchCase: false }).parents('.card').within(() => {
          cy.get('.btn-comprar, .add-to-cart').first().click();
        });
      } else {
        // Não encontrou, usar o primeiro produto de futebol
        cy.get('#futebol .card').first().within(() => {
          cy.get('.btn-comprar, .add-to-cart').first().click();
        });
      }
    });
    cy.wait(2000);

    // 22. Acessar carrinho e clicar em finalizar compra
    cy.get('.offcanvas').should('be.visible');
    cy.get('.offcanvas-title').should('contain', 'Carrinho');
    cy.get('#checkout-btn').click();
    cy.wait(2000);

    // 23. Escolher um endereço e um cartão
    cy.get('#saved-addresses > :nth-child(1) > .form-check-label').click();
    cy.wait(1000);
    cy.get(':nth-child(1) > [name="payment-method"]').click();
    cy.wait(1000);

    const cupomUsado = 'TROCA17_202511030154460';
    // 24. Aplicar cupom gerado pela troca
    cy.get('#coupon-input').type(cupomUsado, { delay: 50 });
    cy.get('#apply-coupon-btn').click();
    cy.wait(2000);

    // 25. Efetuar pagamento
    cy.get('#place-order-btn').should('not.be.disabled');
    cy.get('#place-order-btn').click();
    cy.wait(3000);

    // 26. Fazer outro pedido do mesmo item
    cy.visit('index.html');
    cy.url().should('include', 'index.html');
    cy.wait(3000);

    // 27. Clicar em comprar o mesmo produto (bola de futebol nike)
    cy.get('#futebol').should('be.visible');
    
    // Tentar encontrar produto com "nike" primeiro
    cy.get('#futebol .card').then(($cards) => {
      const temNike = Array.from($cards).some(card => 
        Cypress.$(card).text().toLowerCase().includes('nike')
      );
      
      if (temNike) {
        cy.get('#futebol .card').contains('nike', { matchCase: false }).parents('.card').within(() => {
          cy.get('.btn-comprar, .add-to-cart').first().click();
        });
      } else {
        // Não encontrou, usar o primeiro produto de futebol
        cy.get('#futebol .card').first().within(() => {
          cy.get('.btn-comprar, .add-to-cart').first().click();
        });
      }
    });
    cy.wait(2000);

    // 28. Acessar carrinho e clicar em finalizar compra
    cy.get('.offcanvas').should('be.visible');
    cy.get('.offcanvas-title').should('contain', 'Carrinho');
    cy.get('#checkout-btn').click();
    cy.wait(2000);

    // 29. Escolher um endereço e um cartão
    cy.get('#saved-addresses > :nth-child(1) > .form-check-label').click();
    cy.wait(1000);
    cy.get(':nth-child(1) > [name="payment-method"]').click();
    cy.wait(1000);

    // 30. Tentar aplicar o cupom já utilizado novamente
    // Configurar stub do window.alert para capturar a mensagem de erro ANTES de aplicar
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });
    
    cy.get('#coupon-input').type(cupomUsado, { delay: 50 });
    cy.get('#apply-coupon-btn').click();
    cy.wait(2000);

    // 31. Verificar se apareceu erro de cupom já utilizado
    cy.get('@alertStub').should('have.been.called');
    cy.get('@alertStub').then((stub) => {
      const alertMessage = stub.getCall(0).args[0];
      // Verificar se a mensagem contém indicação de cupom inválido ou já utilizado
      expect(alertMessage).to.satisfy((msg) => {
        const msgLower = msg.toLowerCase();
        return msgLower.includes('cupom') && 
               (msgLower.includes('inválido') || 
                msgLower.includes('já') || 
                msgLower.includes('utilizado') ||
                msgLower.includes('usado') ||
                msgLower.includes('já foi'));
      });
    });

    // 32. Cancelar o pedido
    cy.get('#cancel-order-btn').should('be.visible');
    cy.get('#cancel-order-btn').click();
    cy.wait(2000);

    cy.log('Teste de fluxo de troca/devolução concluído com sucesso!');
  });
});
