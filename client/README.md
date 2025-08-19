# Interface Cliente MCP

Esta é uma interface web para interagir com o MCP Server através de IA (OpenAI).

## Configuração

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie `.env.example` para `.env`
   - Adicione sua API Key do OpenAI no arquivo `.env`:
     ```
     OPENAI_API_KEY=sua_api_key_aqui
     PORT=3001
     MCP_SERVER_PATH=/caminho/para/seu/mcp
     ```

3. **Certificar que o MCP Server está compilado:**
   ```bash
   cd ../mcp
   npm run build
   ```

4. **Iniciar o servidor de usuários (backend):**
   ```bash
   cd ../servidor
   npm start
   ```

5. **Iniciar o cliente (em outro terminal):**
   ```bash
   cd ../client
   npm start
   # ou para desenvolvimento com auto-reload:
   npm run dev
   ```

6. **Abrir no navegador:**
   - Acesse: `http://localhost:3001`

## Como usar

1. **Verificar conexão:** O status no topo da página deve mostrar "Conectado e pronto"

2. **Interagir com a IA:** Digite comandos naturais como:
   - "Liste todos os usuários"
   - "Crie um usuário chamado João Silva com email joao@email.com e idade 30"
   - "Busque o usuário com ID 1"
   - "Procure usuários com nome Maria"
   - "Atualize o usuário 2 com novo email: novo@email.com"
   - "Delete o usuário com ID 3"

3. **Usar botões de sugestão:** Clique nos botões de exemplo para testar rapidamente

## Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com auto-reload
- `npm run build` - Comando de build (placeholder)

## Funcionalidades

- ✅ Chat interativo com IA
- ✅ Conexão automática com MCP Server
- ✅ Function calling para operações CRUD
- ✅ Interface responsiva
- ✅ Status de conexão em tempo real
- ✅ Histórico de conversação
- ✅ Botões de sugestão

## Estrutura

```
client/
├── main.js           # Servidor Express com integração OpenAI + MCP  
├── package.json      # Dependências e scripts
├── .env.example      # Exemplo de configuração
└── public/
    ├── index.html    # Interface web
    ├── styles.css    # Estilos
    └── script.js     # JavaScript do frontend
```

## Requisitos

- Node.js 16+
- API Key do OpenAI  
- MCP Server funcionando
- Servidor de usuários rodando na porta 3000

## Ordem de Inicialização

1. **Servidor de usuários** (`../servidor`) na porta 3000
2. **MCP Server** (`../mcp`) compilado com `npm run build`
3. **Cliente** (este diretório) na porta 3001

## Troubleshooting

1. **"API Key OpenAI não configurada"**
   - Verifique se o arquivo `.env` existe e contém `OPENAI_API_KEY=sua_key`

2. **"MCP Server desconectado"**
   - Verifique se o MCP Server foi compilado (`npm run build` no diretório mcp)
   - Verifique se o caminho em `MCP_SERVER_PATH` está correto

3. **Erro de conexão com API de usuários**
   - Certifique-se que o servidor Node.js está rodando na porta 3000
   - Verifique se a URL da API está correta no MCP Server
