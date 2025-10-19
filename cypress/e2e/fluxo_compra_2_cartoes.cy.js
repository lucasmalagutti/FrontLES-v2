describe('Fluxo de Vendas E2E - 2 Cartões', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    cy.clearLocalStorage();
  });

  it('Deve executar o fluxo completo de vendas com 2 cartões', () => {
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
    
    // Selecionar endereço
    cy.get('#saved-addresses > :nth-child(1) > .form-check-label').click();
    cy.wait(1000);

    // Adicionar cupom de desconto
    cy.get('#coupon-input').type('Lucas10', { delay: 50 });
    cy.get('#apply-coupon-btn').click();
    cy.wait(1000);
    
    // Capturar o valor total e dividir entre 2 cartões
    cy.get('#total-amount').invoke('text').then((valorString) => {
      const valorTratado = valorString.replace('R$ ', '').replace(',', '.').trim();
      const valorNumerico = parseFloat(valorTratado);
      
      cy.log(`Valor total capturado: R$ ${valorNumerico.toFixed(2)}`);
      
      // Calcular valores para cada cartão (dividir igualmente)
      const valorCartao1 = Math.floor((valorNumerico / 2) * 100) / 100;
      const valorCartao2 = valorNumerico - valorCartao1;
      
      cy.log(`Valor Cartão 1: R$ ${valorCartao1.toFixed(2)}`);
      cy.log(`Valor Cartão 2: R$ ${valorCartao2.toFixed(2)}`);
      cy.log(`Soma dos cartões: R$ ${(valorCartao1 + valorCartao2).toFixed(2)}`);

      // Selecionar o primeiro cartão
      cy.get(':nth-child(1) > [name="payment-method"]').click();
      cy.wait(1000);
      
      // Selecionar o segundo cartão
      cy.get('#saved-cards > :nth-child(2) > .form-check-label').click();
      cy.wait(1000);

      // Definir valores diretamente no DOM para evitar event listeners da aplicação
      cy.window().then((win) => {
        const input1 = win.document.querySelector('#amount-44');
        const input2 = win.document.querySelector('#amount-45');
        
        if (input1) {
          input1.value = valorCartao1.toFixed(2);
          // Disparar evento input sem chamar funções da aplicação
          const event = new win.Event('input', { bubbles: true });
          input1.dispatchEvent(event);
        }
        
        if (input2) {
          input2.value = valorCartao2.toFixed(2);
          // Disparar evento input sem chamar funções da aplicação
          const event = new win.Event('input', { bubbles: true });
          input2.dispatchEvent(event);
        }
      });
      
      cy.log(`Valor R$ ${valorCartao1.toFixed(2)} atribuído ao Cartão 1`);
      cy.log(`Valor R$ ${valorCartao2.toFixed(2)} atribuído ao Cartão 2`);

      // Clicar no botão "Efetuar Pagamento"
      cy.get('#place-order-btn').click();
      cy.wait(2000);

    });
  });

});
  