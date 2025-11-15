const CHATBOT_API_URL = 'https://localhost:7280/api/Chatbot/sugerir';
const MAX_SUGGESTIONS = 5;

let isInitialized = false;
let isSendingMessage = false;

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

    const appendBotSuggestions = (produtos) => {
        const wrapper = createMessageWrapper(false);

        const intro = document.createElement('span');
        intro.textContent = 'Encontrei algumas opções para você:';
        wrapper.appendChild(intro);

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
            list.appendChild(item);
        });

        wrapper.appendChild(list);

        if (produtos.length > MAX_SUGGESTIONS) {
            const note = document.createElement('small');
            note.classList.add('text-muted');
            note.textContent = `Mostrando ${MAX_SUGGESTIONS} de ${produtos.length} itens. Ajuste os termos para refinar sua busca.`;
            wrapper.appendChild(note);
        }

        appendMessageElement(wrapper);
    };

    const sendMessage = async () => {
        const message = input.value.trim();

        if (!message || isSendingMessage) {
            return;
        }

        appendUserMessage(message);
        input.value = '';
        setLoadingState(true);

        try {
            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({ mensagemUsuario: message })
            });

            if (!response.ok) {
                throw new Error('Resposta inválida do servidor');
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                appendBotSuggestions(data);
            } else {
                appendBotMessage('Não encontrei produtos com esse perfil agora. Pode tentar com outros termos ou ser um pouco mais específico?');
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

