const CHATBOT_API_URL = 'https://localhost:7280/api/Chatbot/sugerir';
const MAX_SUGGESTIONS = 5;
const CHATBOT_API_ORIGIN = new URL(CHATBOT_API_URL).origin;

let isInitialized = false;
let isSendingMessage = false;
let ultimaRecomendacaoProdutos = []; // Para rastrear feedback negativo

const formatCurrency = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const numberValue = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(numberValue)) {
        return '';
    }

    return numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

const createMultilineFragment = (text) => {
    const fragment = document.createDocumentFragment();
    const lines = text.split('\n');

    lines.forEach((line, index) => {
        fragment.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) {
            fragment.appendChild(document.createElement('br'));
        }
    });

    return fragment;
};

export function initializeChatbot() {
    if (isInitialized) {
        return;
    }

    const modal = document.getElementById('chatModal');
    const messagesContainer = modal?.querySelector('#chatbotMessages');
    const input = modal?.querySelector('#chatbotInput');
    const sendButton = modal?.querySelector('#chatbotSendButton');
    const typingIndicator = modal?.querySelector('#chatbotTyping');

    if (!modal || !messagesContainer || !input || !sendButton || !typingIndicator) {
        return;
    }

    isInitialized = true;
    const originalButtonContent = sendButton.innerHTML;

    const scrollToBottom = () => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const setLoadingState = (loading) => {
        isSendingMessage = loading;
        sendButton.disabled = loading;
        input.disabled = loading;
        typingIndicator.hidden = !loading;

        if (loading) {
            sendButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando';
        } else {
            sendButton.innerHTML = originalButtonContent;
            input.focus();
        }
    };

    const createMessageWrapper = (isUser) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('chat-message', isUser ? 'chat-message-user' : 'chat-message-bot');

        const label = document.createElement('strong');
        label.textContent = isUser ? 'Você:' : 'Atendente:';
        wrapper.appendChild(label);

        return wrapper;
    };

    const appendMessageElement = (element) => {
        messagesContainer.appendChild(element);
        scrollToBottom();
    };

    const appendUserMessage = (message) => {
        const wrapper = createMessageWrapper(true);
        wrapper.appendChild(createMultilineFragment(message));
        appendMessageElement(wrapper);
    };

    const appendBotMessage = (message) => {
        const wrapper = createMessageWrapper(false);
        wrapper.appendChild(createMultilineFragment(message));
        appendMessageElement(wrapper);
    };

    const obterCampo = (obj, chave) => {
        if (!obj || !chave) {
            return undefined;
        }

        if (Object.prototype.hasOwnProperty.call(obj, chave)) {
            return obj[chave];
        }

        const capitalizada = chave.charAt(0).toUpperCase() + chave.slice(1);
        if (Object.prototype.hasOwnProperty.call(obj, capitalizada)) {
            return obj[capitalizada];
        }

        const lower = chave.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(obj, lower)) {
            return obj[lower];
        }

        return undefined;
    };

    const executarAcaoProduto = async (produto, acaoPadrao) => {
        const acao = produto?.acao ?? produto?.Acao ?? acaoPadrao;
        if (!acao) {
            const link = obterCampo(produto, 'linkProduto');
            if (link) {
                window.location.href = link;
            }
            return false;
        }

        const metodo = (acao.metodo ?? 'POST').toUpperCase();
        const payloadOriginal = acao.payload ?? {};
        const headers = acao.headers ?? { 'Content-Type': 'application/json' };

        const produtoId = payloadOriginal.produtoId ?? obterCampo(produto, 'id');
        const quantidade = Number(payloadOriginal.quantidade ?? 1) || 1;
        const precoUnitario = Number(payloadOriginal.precoUnitario ?? obterCampo(produto, 'preco') ?? 0);

        if (acao.tipo === 'comprar') {
            if (!produtoId) {
                throw new Error('Produto sem identificador para adicionar ao carrinho.');
            }

            const carrinhoService = window.carrinhoService;
            if (carrinhoService?.adicionarItem) {
                await carrinhoService.adicionarItem(
                    Number(produtoId),
                    quantidade,
                    precoUnitario
                );
                return true;
            }
        }

        if (!acao.endpoint) {
            const link = obterCampo(produto, 'linkProduto');
            if (link) {
                window.location.href = link;
                return false;
            }
            throw new Error('Ação não suportada.');
        }

        const url = acao.endpoint.startsWith('http')
            ? acao.endpoint
            : `${CHATBOT_API_ORIGIN}${acao.endpoint}`;

        const options = {
            method: metodo,
            headers
        };

        if (!['GET', 'HEAD'].includes(metodo)) {
            options.body = typeof payloadOriginal === 'string'
                ? payloadOriginal
                : JSON.stringify(payloadOriginal);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Falha ao executar ação do produto.');
        }

        return true;
    };

    const buildProductCardElement = (produto, acaoPadrao) => {
        const card = document.createElement('div');
        card.classList.add('card', 'mt-2');
        card.style.maxWidth = '300px';

        const imagem = obterCampo(produto, 'imagemUrl');
        if (imagem) {
            const img = document.createElement('img');
            img.src = imagem;
            img.classList.add('card-img-top');
            img.style.maxHeight = '200px';
            img.style.objectFit = 'cover';
            card.appendChild(img);
        }

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const title = document.createElement('h6');
        title.classList.add('card-title');
        title.textContent = obterCampo(produto, 'nome') ?? 'Produto';
        cardBody.appendChild(title);

        const preco = obterCampo(produto, 'preco');
        if (preco !== undefined && preco !== null && preco !== '') {
            const price = document.createElement('p');
            price.classList.add('card-text', 'mb-2');
            price.textContent = formatCurrency(preco);
            cardBody.appendChild(price);
        }

        const descricaoCurta = obterCampo(produto, 'descricaoCurta');
        if (descricaoCurta) {
            const description = document.createElement('p');
            description.classList.add('card-text', 'text-muted', 'small');
            description.textContent = descricaoCurta;
            cardBody.appendChild(description);
        }

        const acao = produto?.acao ?? produto?.Acao ?? acaoPadrao;
        const linkProduto = obterCampo(produto, 'linkProduto');

        if (acao) {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('btn', 'btn-primary', 'btn-sm');
            const labelOriginal = acao.label ?? acao.Label ?? 'Comprar';
            button.textContent = labelOriginal;

            const limparFeedback = () => {
                cardBody.querySelectorAll('.chatbot-card-feedback').forEach(node => node.remove());
            };

            button.addEventListener('click', async () => {
                const textoOriginal = button.textContent;
                button.classList.remove('btn-success', 'btn-warning');
                button.classList.add('btn-primary');
                button.disabled = true;
                button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processando';
                limparFeedback();

                try {
                    const sucesso = await executarAcaoProduto(produto, acaoPadrao);
                    if (sucesso) {
                        button.innerHTML = 'No carrinho!';
                        button.classList.remove('btn-primary');
                        button.classList.add('btn-success');
                        const feedback = document.createElement('small');
                        feedback.classList.add('text-success', 'd-block', 'mt-2', 'chatbot-card-feedback');
                        feedback.textContent = 'Produto adicionado ao carrinho com sucesso!';
                        cardBody.appendChild(feedback);
                    } else {
                        button.textContent = textoOriginal;
                        button.disabled = false;
                    }
                } catch (error) {
                    console.error('Erro ao executar ação do produto:', error);
                    button.textContent = 'Tentar novamente';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-warning');
                    button.disabled = false;
                    const feedbackErro = document.createElement('small');
                    feedbackErro.classList.add('text-danger', 'd-block', 'mt-2', 'chatbot-card-feedback');
                    feedbackErro.textContent = 'Não foi possível adicionar ao carrinho. Verifique seu login e tente novamente.';
                    cardBody.appendChild(feedbackErro);
                }
            });

            cardBody.appendChild(button);
        } else if (linkProduto) {
            const link = document.createElement('a');
            link.href = linkProduto;
            link.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            link.textContent = 'Ver produto';
            cardBody.appendChild(link);
        }

        card.appendChild(cardBody);
        return card;
    };

    const appendBotSuggestions = (produtos, mensagem = '', acaoPadrao = null) => {
        const wrapper = createMessageWrapper(false);

        if (mensagem) {
            const intro = document.createElement('div');
            intro.classList.add('mb-2');
            intro.appendChild(createMultilineFragment(mensagem));
            wrapper.appendChild(intro);
        } else {
            const intro = document.createElement('div');
            intro.classList.add('mb-2');
            intro.textContent = 'Encontrei algumas opções para você:';
            wrapper.appendChild(intro);
        }

        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('d-flex', 'flex-wrap', 'gap-3');

        produtos.slice(0, MAX_SUGGESTIONS).forEach((produto) => {
            cardsContainer.appendChild(buildProductCardElement(produto, acaoPadrao));
        });

        wrapper.appendChild(cardsContainer);

        if (produtos.length > MAX_SUGGESTIONS) {
            const note = document.createElement('small');
            note.classList.add('text-muted');
            note.textContent = `Mostrando ${MAX_SUGGESTIONS} de ${produtos.length} itens.`;
            wrapper.appendChild(note);
        }

        appendMessageElement(wrapper);
    };

    const appendBotProductCard = (produto, mensagem = '', acaoPadrao = null) => {
        const wrapper = createMessageWrapper(false);

        if (mensagem) {
            const intro = document.createElement('div');
            intro.classList.add('mb-2');
            intro.appendChild(createMultilineFragment(mensagem));
            wrapper.appendChild(intro);
        }

        wrapper.appendChild(buildProductCardElement(produto, acaoPadrao));

        appendMessageElement(wrapper);
    };

    const sendMessage = async () => {
        const message = input.value.trim();

        // Caso 7: Entrada vazia - não enviar request
        if (!message) {
            appendBotMessage('Digite algo para que eu possa ajudar.');
            return;
        }

        if (isSendingMessage) {
            return;
        }

        appendUserMessage(message);
        input.value = '';
        setLoadingState(true);

        try {
            // Obter userId se disponível (pode vir de localStorage, sessionStorage, etc.)
            const usuarioId = localStorage.getItem('usuarioId') || sessionStorage.getItem('usuarioId');
            
            const requestBody = {
                mensagemUsuario: message
            };
            
            if (usuarioId) {
                requestBody.usuarioId = parseInt(usuarioId, 10);
            }

            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Resposta inválida do servidor');
            }

            const data = await response.json();

            // Interpretar novo formato de resposta
            if (data.tipo === 'lista' && Array.isArray(data.produtos) && data.produtos.length > 0) {
                ultimaRecomendacaoProdutos = data.produtos
                    .map(p => p.id ?? p.Id)
                    .filter(Boolean);
                appendBotSuggestions(data.produtos, data.mensagem, data.acaoPadrao ?? data.acao_padrao ?? null);
            } else if (data.tipo === 'produto' && data.produtos?.length > 0) {
                ultimaRecomendacaoProdutos = data.produtos
                    .map(p => p.id ?? p.Id)
                    .filter(Boolean);
                appendBotProductCard(data.produtos[0], data.mensagem, data.acaoPadrao ?? data.acao_padrao ?? null);
            } else if (data.tipo === 'pergunta') {
                appendBotMessage(data.mensagem);
                // Opcional: transformar a pergunta em botão de resposta rápida
            } else if (data.tipo === 'texto') {
                appendBotMessage(data.mensagem);
            } else if (data.tipo === 'erro') {
                appendBotMessage(`Erro: ${data.mensagem}`);
            } else {
                // Fallback para formato antigo (array de produtos)
                if (Array.isArray(data) && data.length > 0) {
                    appendBotSuggestions(data);
                } else {
                    appendBotMessage('Não encontrei produtos com esse perfil agora. Pode tentar com outros termos ou ser um pouco mais específico?');
                }
            }
        } catch (error) {
            console.error('Erro ao consultar o chatbot:', error);
            appendBotMessage('Tive um problema ao procurar sugestões agora. Tente novamente em instantes.');
        } finally {
            setLoadingState(false);
        }
    };

    sendButton.addEventListener('click', sendMessage);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    modal.addEventListener('shown.bs.modal', () => {
        setTimeout(() => input.focus(), 150);
    });
}

document.addEventListener('sharedContentLoaded', initializeChatbot);
