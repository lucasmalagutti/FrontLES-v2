describe('Fluxo de Vendas E2E', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    cy.clearLocalStorage();
  });

  it('Deve executar o fluxo completo de vendas', () => {
    // 1° - Acessa a página principal do site (index.html)
    cy.visit('index.html');
    cy.url().should('include', 'index.html');

    // Aguardando o carregamento da página
    cy.wait(2000);


    // Procurar e clicar no botão "Comprar" de um produto
    cy.get('#futebol > .row > :nth-child(1) > .card > .card-body > .btn-comprar').click();
    cy.wait(2000);


    // Aguardando o carrinho abrir
    cy.get('.offcanvas').should('be.visible');
    cy.get('.offcanvas-title').should('contain', 'Carrinho');
    cy.wait(1000);

    
    // Clicar no botão de adicionar mais uma unidade do produto
    cy.get('.increase-quantity').click();
    cy.wait(1000);

    // 4° - Clicando no botão "Finalizar compra"
    cy.get('#checkout-btn').click();
    
    // Aguardar 3 segundos
    cy.wait(1000);
    
    //Utilizamos para selecionar endereço e cartão
    cy.get('#saved-addresses > :nth-child(1) > .form-check-label').click();
    cy.wait(1000);
    cy.get(':nth-child(1) > [name="payment-method"]').click();
    cy.wait(1000);

    //Adicionamos Cupom de desconto
    cy.get('#coupon-input').type('Lucas10', { delay: 50 })
    cy.get('#apply-coupon-btn').click();
    cy.wait(1000);
    
    "Clicamos no botão Finalizar compra"
    cy.get('#place-order-btn').click();
    cy.wait(2000);

    cy.log('Teste de fluxo de vendas concluído com sucesso!');
  });

 

});
