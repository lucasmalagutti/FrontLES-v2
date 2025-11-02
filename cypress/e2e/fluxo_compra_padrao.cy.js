describe('Fluxo de Vendas E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Deve executar o fluxo completo de vendas', () => {
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
    cy.get(':nth-child(1) > [name="payment-method"]').click();
    cy.wait(1000);

    cy.get('#coupon-input').type('Lucas10', { delay: 50 })
    cy.get('#apply-coupon-btn').click();
    cy.wait(1000);
    
    "Clicamos no botão Finalizar compra"
    cy.get('#place-order-btn').click();
    cy.wait(2000);

    cy.log('Teste de fluxo de vendas concluído com sucesso!');
  });

 

});
