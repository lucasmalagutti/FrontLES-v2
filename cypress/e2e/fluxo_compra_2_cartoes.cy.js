describe('Fluxo de Vendas E2E - 2 Cartões', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Deve executar o fluxo completo de vendas com 2 cartões', () => {
    cy.visit('index.html');
    cy.url().should('include', 'index.html');

    cy.wait(2000);

    cy.get('#futebol > .row > :nth-child(1) > .card > .card-body > .btn-comprar').click();
    cy.wait(2000);

    cy.get('.offcanvas').should('be.visible');
    cy.get('.offcanvas-title').should('contain', 'Carrinho');
    cy.wait(1000);

    cy.get('.increase-quantity').click();
    cy.wait(1000);

    cy.get('#checkout-btn').click();
    
    cy.wait(1000);
    
    cy.get('#saved-addresses > :nth-child(1) > .form-check-label').click();
    cy.wait(1000);

    cy.get('#coupon-input').type('Lucas10', { delay: 50 });
    cy.get('#apply-coupon-btn').click();
    cy.wait(1000);
    
    cy.get('#total-amount').invoke('text').then((valorString) => {
      const valorTratado = valorString.replace('R$ ', '').replace(',', '.').trim();
      const valorNumerico = parseFloat(valorTratado);
      
      cy.log(`Valor total capturado: R$ ${valorNumerico.toFixed(2)}`);
      
      const valorCartao1 = Math.floor((valorNumerico / 2) * 100) / 100;
      const valorCartao2 = valorNumerico - valorCartao1;
      
      cy.log(`Valor Cartão 1: R$ ${valorCartao1.toFixed(2)}`);
      cy.log(`Valor Cartão 2: R$ ${valorCartao2.toFixed(2)}`);
      cy.log(`Soma dos cartões: R$ ${(valorCartao1 + valorCartao2).toFixed(2)}`);

      cy.get(':nth-child(1) > [name="payment-method"]').click();
      cy.wait(1000);
      
      cy.get('#saved-cards > :nth-child(2) > .form-check-label').click();
      cy.wait(1000);

      cy.window().then((win) => {
        const input1 = win.document.querySelector('#amount-44');
        const input2 = win.document.querySelector('#amount-45');
        
        if (input1) {
          input1.value = valorCartao1.toFixed(2);
          const event = new win.Event('input', { bubbles: true });
          input1.dispatchEvent(event);
        }
        
        if (input2) {
          input2.value = valorCartao2.toFixed(2);
          const event = new win.Event('input', { bubbles: true });
          input2.dispatchEvent(event);
        }
      });
      
      cy.log(`Valor R$ ${valorCartao1.toFixed(2)} atribuído ao Cartão 1`);
      cy.log(`Valor R$ ${valorCartao2.toFixed(2)} atribuído ao Cartão 2`);

      cy.get('#place-order-btn').click();
      cy.wait(2000);

    });
  });

});
  