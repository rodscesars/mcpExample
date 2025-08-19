# Projeto MCP - Gerenciador de Usuários com IA

Este projeto demonstra a integração entre um **MCP Server**, **API REST**, e uma **interface web com IA** para gerenciar usuários.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Servidor      │    │   MCP Server    │    │   Cliente Web   │
│   (Node + API)  │◄──►│   (TypeScript)  │◄──►│   (IA + UI)     │
│   Porta: 3000   │    │   Protocol MCP  │    │   Porta: 3001   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │   OpenAI API    │
                                               │   (GPT-3.5)     │
                                               └─────────────────┘
```

## � Pré-requisitos

- **Node.js** 18+ (recomendado LTS)
- **npm** (incluído com Node.js)
- **API Key OpenAI** válida
- **Git** (para clonar o repositório)

## �📁 Estrutura do Projeto

- **`servidor/`** - API REST para gerenciar usuários (Express.js)
- **`mcp/`** - MCP Server que conecta com a API (TypeScript)
- **`client/`** - Interface web com IA (Express + OpenAI + Frontend)

## 🚀 Início Rápido

### 1. Instalar Dependências

Instale as dependências em cada diretório:

```bash
# Instalar dependências do servidor
cd servidor
npm install

# Instalar dependências do MCP server
cd ../mcp
npm install

# Instalar dependências do cliente
cd ../client
npm install
```

### 2. Configurar API Key OpenAI

**Copie o arquivo de exemplo:**
```bash
cd client
cp .env.example .env
```

**Edite o arquivo `client/.env` com suas credenciais:**
```env
OPENAI_API_KEY=sua_api_key_aqui
PORT=3001
MCP_SERVER_PATH=../mcp
```

### 3. Compilar MCP Server

Compile o MCP server TypeScript:

```bash
cd mcp
npm run build
```

### 4. Iniciar Serviços

**Terminal 1 - Servidor API:**
```bash
cd servidor
npm start
# ou para desenvolvimento com auto-reload:
npm run dev
```

**Terminal 2 - Cliente com IA:**
```bash
cd client
npm start
# ou para desenvolvimento com auto-reload:
npm run dev
```

### 5. Usar a Interface

Acesse: `http://localhost:3001`

## 💬 Exemplos de Uso

Converse com a IA usando linguagem natural:

- 📋 **"Liste todos os usuários"**
- ➕ **"Crie um usuário chamado João Silva com email joao@email.com e idade 30"**
- 🔍 **"Busque o usuário com ID 1"**
- 🔎 **"Procure usuários com nome Maria"**
- ✏️ **"Atualize o usuário 2 com novo email: novo@email.com"**
- 🗑️ **"Delete o usuário com ID 3"**

## 🛠️ Tecnologias Utilizadas

- **Backend API:** Node.js + Express
- **MCP Server:** TypeScript + @modelcontextprotocol/sdk
- **Cliente:** Express + OpenAI API + HTML/CSS/JS
- **IA:** GPT-3.5-turbo com Function Calling
- **Comunicação:** JSON-RPC (MCP Protocol)

## 📊 Funcionalidades

### Servidor API (`servidor/`)
- ✅ CRUD completo de usuários
- ✅ Busca por nome
- ✅ Validação de dados
- ✅ CORS habilitado

### MCP Server (`mcp/`)
- ✅ Implementa protocolo MCP
- ✅ Conecta com API REST
- ✅ 6 ferramentas disponíveis
- ✅ Tratamento de erros

### Cliente IA (`client/`)
- ✅ Interface web responsiva
- ✅ Chat interativo com IA
- ✅ Function calling automático
- ✅ Status de conexão em tempo real
- ✅ Histórico de conversação

## 🔧 Solução de Problemas

### "API Key OpenAI não configurada"
- Verifique o arquivo `client/.env`
- Certifique-se que a API Key está válida

### "MCP Server desconectado"
- Execute `cd mcp && npm run build`
- Verifique se o TypeScript foi compilado

### "Erro de conexão com API de usuários"
- Certifique-se que o servidor está rodando na porta 3000
- Teste: `curl http://localhost:3000/api/users`

### Interface não carrega
- Verifique se a porta 3001 está livre
- Abra as ferramentas de desenvolvedor do navegador

