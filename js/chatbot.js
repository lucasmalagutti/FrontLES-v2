const CHATBOT_API_URL = 'https://localhost:7280/api/Chatbot/sugerir';
const MAX_SUGGESTIONS = 5;

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

    const appendBotSuggestions = (produtos, mensagem = '') => {
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

        const list = document.createElement('ul');
        list.classList.add('chat-suggestion-list');

        produtos.slice(0, MAX_SUGGESTIONS).forEach((produto) => {
            const item = document.createElement('li');
            const nome = produto?.nome ?? produto?.Nome ?? 'Produto';
            const precoFormatado = formatCurrency(produto?.preco ?? produto?.Preco);
            const categoriaValor = produto?.categoria ?? produto?.Categoria;
            const categoria = categoriaValor ? ` (${categoriaValor})` : '';

            let texto = nome;
            if (precoFormatado) {
                texto += ` - ${precoFormatado}`;
            }
            texto += categoria;

            item.textContent = texto;
            
            // Se tiver linkProduto, tornar clicável
            if (produto?.linkProduto || produto?.LinkProduto) {
                item.style.cursor = 'pointer';
                item.style.textDecoration = 'underline';
                item.style.color = '#007bff';
                item.addEventListener('click', () => {
                    const link = produto?.linkProduto ?? produto?.LinkProduto;
                    if (link) {
                        window.location.href = link;
                    }
                });
            }
            
            list.appendChild(item);
        });

        wrapper.appendChild(list);

        if (produtos.length > MAX_SUGGESTIONS) {
            const note = document.createElement('small');
            note.classList.add('text-muted');
            note.textContent = `Mostrando ${MAX_SUGGESTIONS} de ${produtos.length} itens.`;
            wrapper.appendChild(note);
        }

        appendMessageElement(wrapper);
    };

    const appendBotProductCard = (produto, mensagem = '') => {
        const wrapper = createMessageWrapper(false);

        if (mensagem) {
            const intro = document.createElement('div');
            intro.classList.add('mb-2');
            intro.appendChild(createMultilineFragment(mensagem));
            wrapper.appendChild(intro);
        }

        const card = document.createElement('div');
        card.classList.add('card', 'mt-2');
        card.style.maxWidth = '300px';

        if (produto?.imagemUrl || produto?.ImagemUrl) {
            const img = document.createElement('img');
            img.src = produto?.imagemUrl ?? produto?.ImagemUrl;
            img.classList.add('card-img-top');
            img.style.maxHeight = '200px';
            img.style.objectFit = 'cover';
            card.appendChild(img);
        }

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const title = document.createElement('h6');
        title.classList.add('card-title');
        title.textContent = produto?.nome ?? produto?.Nome ?? 'Produto';
        cardBody.appendChild(title);

        if (produto?.preco || produto?.Preco) {
            const price = document.createElement('p');
            price.classList.add('card-text');
            price.textContent = formatCurrency(produto?.preco ?? produto?.Preco);
            cardBody.appendChild(price);
        }

        if (produto?.linkProduto || produto?.LinkProduto) {
            const link = document.createElement('a');
            link.href = produto?.linkProduto ?? produto?.LinkProduto;
            link.classList.add('btn', 'btn-primary', 'btn-sm');
            link.textContent = 'Ver produto';
            cardBody.appendChild(link);
        }

        card.appendChild(cardBody);
        wrapper.appendChild(card);

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
                ultimaRecomendacaoProdutos = data.produtos.map(p => p.id);
                appendBotSuggestions(data.produtos, data.mensagem);
            } else if (data.tipo === 'produto' && data.produtos?.length > 0) {
                ultimaRecomendacaoProdutos = data.produtos.map(p => p.id);
                appendBotProductCard(data.produtos[0], data.mensagem);
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
