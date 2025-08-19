class MCPInterface {
    constructor() {
        this.conversation = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkStatus();
        
        // Verificar status a cada 30 segundos
        setInterval(() => this.checkStatus(), 30000);
    }

    bindEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');

        // Enviar mensagem com Enter
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Botão enviar
        sendButton.addEventListener('click', () => this.sendMessage());

        // Botões de sugestão
        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                messageInput.value = message;
                this.sendMessage();
            });
        });
    }

    async checkStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            this.updateStatusUI(status);
            
            // Habilitar interface se tudo estiver conectado
            const isReady = status.mcpConnected && status.openaiConfigured;
            this.setInterfaceEnabled(isReady);
            
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            this.updateStatusUI({ 
                server: 'Erro', 
                mcpConnected: false, 
                openaiConfigured: false 
            });
            this.setInterfaceEnabled(false);
        }
    }

    updateStatusUI(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const statusElement = document.getElementById('status');

        if (status.mcpConnected && status.openaiConfigured) {
            statusElement.className = 'status connected';
            statusText.textContent = 'Conectado e pronto';
        } else if (!status.openaiConfigured) {
            statusElement.className = 'status disconnected';
            statusText.textContent = 'API Key OpenAI não configurada';
        } else if (!status.mcpConnected) {
            statusElement.className = 'status disconnected';
            statusText.textContent = 'MCP Server desconectado';
        } else {
            statusElement.className = 'status checking';
            statusText.textContent = 'Verificando conexão...';
        }
    }

    setInterfaceEnabled(enabled) {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');

        messageInput.disabled = !enabled;
        sendButton.disabled = !enabled;
        
        suggestionButtons.forEach(btn => {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        });

        if (enabled && !this.hasWelcomeMessage) {
            this.addMessage('assistant', 
                '✅ Sistema conectado! Agora você pode interagir comigo para gerenciar usuários.'
            );
            this.hasWelcomeMessage = true;
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || this.isLoading) return;

        // Adicionar mensagem do usuário
        this.addMessage('user', message);
        this.conversation.push({ role: 'user', content: message });

        // Limpar input e mostrar loading
        messageInput.value = '';
        this.setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversation: this.conversation
                })
            });

            const data = await response.json();

            if (data.error) {
                this.addMessage('assistant', `❌ Erro: ${data.response || data.error}`, true);
            } else {
                // Adicionar resposta do assistente
                this.addMessage('assistant', data.response);
                this.conversation.push({ role: 'assistant', content: data.response });

                // Mostrar detalhes da função se foi executada
                if (data.functionCalled) {
                    this.addFunctionCallInfo(data.functionCalled, data.functionArgs, data.functionResult);
                }
            }

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.addMessage('assistant', '❌ Erro de comunicação com o servidor. Tente novamente.', true);
        }

        this.setLoading(false);
    }

    addMessage(sender, content, isError = false) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (sender === 'assistant') {
            const prefix = isError ? '🤖 Assistente (Erro):' : '🤖 Assistente:';
            contentDiv.innerHTML = `<strong>${prefix}</strong> ${this.formatMessage(content)}`;
        } else {
            contentDiv.innerHTML = `<strong>👤 Você:</strong> ${this.formatMessage(content)}`;
        }

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // Scroll para baixo
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addFunctionCallInfo(functionName, args, result) {
        const chatMessages = document.getElementById('chatMessages');
        const infoDiv = document.createElement('div');
        infoDiv.className = 'function-call';

        infoDiv.innerHTML = `
            <strong>🔧 Função executada:</strong> ${functionName}<br>
            <strong>📥 Parâmetros:</strong> ${JSON.stringify(args, null, 2)}<br>
            <strong>📤 Resultado:</strong> ${JSON.stringify(result, null, 2)}
        `;

        chatMessages.appendChild(infoDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(message) {
        // Converter quebras de linha em <br>
        message = message.replace(/\n/g, '<br>');
        
        // Destacar texto entre asteriscos como negrito
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Destacar listas
        message = message.replace(/^- (.*$)/gim, '• $1');
        
        return message;
    }

    setLoading(loading) {
        this.isLoading = loading;
        const sendButton = document.getElementById('sendButton');
        const sendButtonText = document.getElementById('sendButtonText');
        const sendButtonSpinner = document.getElementById('sendButtonSpinner');
        const messageInput = document.getElementById('messageInput');

        if (loading) {
            sendButton.disabled = true;
            messageInput.disabled = true;
            sendButtonText.style.display = 'none';
            sendButtonSpinner.style.display = 'inline';
            
            // Adicionar mensagem temporária de carregamento
            this.addMessage('assistant', '💭 Processando sua solicitação...');
        } else {
            sendButton.disabled = false;
            messageInput.disabled = false;
            sendButtonText.style.display = 'inline';
            sendButtonSpinner.style.display = 'none';
            messageInput.focus();
            
            // Remover mensagem de carregamento
            const chatMessages = document.getElementById('chatMessages');
            const messages = chatMessages.querySelectorAll('.message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.textContent.includes('💭 Processando')) {
                lastMessage.remove();
            }
        }
    }
}

// Inicializar a interface quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new MCPInterface();
});
