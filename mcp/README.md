# 🚀 MCP TypeScript - Servidor de API de Usuários

Este é um **servidor MCP (Model Context Protocol)** escrito em TypeScript que funciona como uma ponte entre clientes MCP (como assistentes de IA) e uma API REST de usuários. O projeto demonstra como criar um servidor MCP que expõe operações CRUD para gerenciamento de usuários.

## 📋 O que é MCP?

O **Model Context Protocol (MCP)** é um protocolo que permite que aplicações de IA se conectem e utilizem ferramentas externas de forma padronizada. Este projeto funciona como um "adaptador" que traduz comandos MCP em chamadas HTTP para uma API de usuários.

## 🏗️ Arquitetura do Projeto

```
src/
├── types.ts          # 📝 Definições de tipos TypeScript (interfaces)
├── userService.ts    # 🌐 Funções que fazem chamadas HTTP para a API
└── main.ts          # 🖥️ Servidor MCP que expõe as ferramentas
```

### **Como funciona:**
1. Cliente MCP → Envia comando ao servidor
2. Servidor MCP → Traduz comando em função TypeScript
3. Função → Faz requisição HTTP para API de usuários
4. API → Retorna dados
5. Servidor MCP → Formata resposta e envia de volta

## 🚀 Como executar

### Pré-requisitos
- **Node.js 22.18.0 LTS** (recomendado usar nvm)
- **NPM**
- **API de usuários rodando em `http://localhost:3000`**

### 1. Configurar Node.js (recomendado)
```bash
# Se você usa nvm:
nvm use
# ou manualmente:
nvm install 22.18.0 && nvm use 22.18.0
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar em desenvolvimento (recomendado)
```bash
npm run mcp:dev
```

### Ou compilar e executar
```bash
# Compilar TypeScript
npm run build

# Executar servidor MCP compilado
npm run mcp
```

### Testando as funções diretamente
Para testar as funções TypeScript sem usar MCP:
```bash
npm run dev
# ou para executar o exemplo compilado
npm start
```

**💡 Dica:** O servidor MCP roda em modo stdio (entrada/saída padrão) e aguarda comandos de clientes MCP.

## 🔧 Ferramentas MCP Disponíveis

O servidor expõe as seguintes ferramentas que podem ser chamadas por clientes MCP:

### `get_all_users`
📋 **Descrição:** Busca todos os usuários cadastrados na API  
⚙️ **Parâmetros:** Nenhum

### `get_user_by_id`
🔍 **Descrição:** Busca um usuário específico pelo ID  
⚙️ **Parâmetros:** 
- `id` (number) - ID do usuário

### `create_user`
➕ **Descrição:** Cria um novo usuário  
⚙️ **Parâmetros:** 
- `name` (string) - Nome do usuário
- `email` (string) - Email do usuário  
- `age` (number, opcional) - Idade do usuário

### `update_user`
✏️ **Descrição:** Atualiza um usuário existente  
⚙️ **Parâmetros:** 
- `id` (number) - ID do usuário
- `name` (string, opcional) - Novo nome
- `email` (string, opcional) - Novo email
- `age` (number, opcional) - Nova idade

### `delete_user`
🗑️ **Descrição:** Remove um usuário  
⚙️ **Parâmetros:** 
- `id` (number) - ID do usuário

### `search_users`
🔎 **Descrição:** Busca usuários por critérios  
⚙️ **Parâmetros:** 
- `name` (string, opcional) - Nome ou parte do nome
- `email` (string, opcional) - Email ou parte do email

### `check_server_status`
💡 **Descrição:** Verifica se o servidor da API está online  
⚙️ **Parâmetros:** Nenhum

## 📋 Configuração MCP

Para usar este servidor em um cliente MCP (como Claude Desktop), use a configuração já incluída no projeto:

**Arquivo de configuração MCP (mcp-config.json):**
```json
{
  "mcpServers": {
    "user-api-client": {
      "command": "node",
      "args": ["dist/main.js"],
      "cwd": "."
    }
  }
}
```

**💡 Importante:** 
- Substitua o caminho `cwd` pelo caminho absoluto para este diretório em seu sistema
- Certifique-se de que o projeto foi compilado (`npm run build`) antes de usar
- O arquivo `mcp-config.json` já está incluído no projeto como exemplo

## 🎯 Entendendo TypeScript no Projeto

### **Types (Tipos)**
O TypeScript usa "interfaces" para definir a estrutura dos dados:

```typescript
// Define como um usuário deve ser estruturado
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;  // ? = opcional
}
```

### **Service Functions (Funções de Serviço)**
As funções fazem requisições HTTP e retornam resultados tipados:

```typescript
// Função tipada que retorna um tipo específico
export async function getAllUsers(): Promise<ServiceResponse<UsersListResponse>> {
  // ... lógica da função
}
```

### **MCP Server (Servidor MCP)**
O servidor traduz comandos MCP em chamadas de função:

```typescript
// Quando recebe comando "get_all_users"
case 'get_all_users': {
  const result = await getAllUsers();  // Chama função tipada
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}
```

## 📁 Estrutura Detalhada dos Arquivos

### `src/types.ts` - Definições de Tipos
Define todas as interfaces TypeScript usadas no projeto:
- `User` - Estrutura de um usuário
- `CreateUserData` - Dados para criar usuário
- `UpdateUserData` - Dados para atualizar usuário
- `ServiceResponse<T>` - Resposta padronizada das funções
- `ErrorResponse` - Estrutura de erro

### `src/userService.ts` - Serviços da API
Contém todas as funções que fazem chamadas HTTP:
- Configuração do Axios (cliente HTTP)
- Interceptors para logging
- Tratamento de erros
- Funções CRUD (Create, Read, Update, Delete)

### `src/main.ts` - Servidor MCP
Implementa o servidor MCP:
- Define ferramentas disponíveis
- Mapeia comandos MCP para funções
- Gerencia comunicação via stdio

### `src/example.ts` - Exemplo de Uso
Demonstra como usar as funções TypeScript diretamente:
- Testa todas as operações CRUD
- Mostra tratamento de erros
- Exemplo prático de uso dos tipos

## 🔧 Funções Principais do userService.ts

### `getAllUsers()`
```typescript
// Busca todos os usuários
const result = await getAllUsers();
if (result.success) {
  console.log('Usuários:', result.data.data);
} else {
  console.log('Erro:', result.message);
}
```

### `getUserById(id: number)`
```typescript
// Busca usuário por ID
const result = await getUserById(1);
if (result.success) {
  console.log('Usuário encontrado:', result.data.data);
}
```

### `createUser(userData: CreateUserData)`
```typescript
// Cria novo usuário
const result = await createUser({
  name: 'João Silva',
  email: 'joao@email.com',
  age: 30
});
```

### `updateUser(id: number, userData: UpdateUserData)`
```typescript
// Atualiza usuário existente
const result = await updateUser(1, {
  name: 'João Silva Santos',
  age: 31
});
```

### `deleteUser(id: number)`
```typescript
// Remove usuário
const result = await deleteUser(1);
```

### `searchUsers(criteria: SearchCriteria)`
```typescript
// Busca usuários por critério
const result = await searchUsers({
  name: 'João'
});
```

### `checkServerStatus()`
```typescript
// Verifica status do servidor
const result = await checkServerStatus();
if (result.success) {
  console.log('Servidor online');
}
```

## 📝 Conceitos TypeScript Importantes

### **1. Interfaces e Tipos**
```typescript
// Interface define a estrutura de um objeto
interface User {
  id: number;        // obrigatório
  name: string;      // obrigatório  
  email: string;     // obrigatório
  age?: number;      // opcional (?)
}
```

### **2. Generics (Tipos Genéricos)**
```typescript
// ServiceResponse pode trabalhar com qualquer tipo T
ServiceResponse<User>           // Para um usuário
ServiceResponse<User[]>         // Para lista de usuários
ServiceResponse<ServerStatus>   // Para status do servidor
```

### **3. Union Types (Tipos de União)**
```typescript
// Pode ser sucesso OU erro
type ServiceResponse<T> = 
  | { success: true; data: T }     // Sucesso
  | { success: false; error: string }  // Erro
```

### **4. Async/Await com Tipos**
```typescript
// Função assíncrona que retorna uma Promise tipada
async function getAllUsers(): Promise<ServiceResponse<UsersListResponse>> {
  // ... implementação
}
```

## 🌐 Configuração da API

**URL Base:** `http://localhost:3000`  
**Timeout:** 5000ms  
**Headers:** `Content-Type: application/json`

Para alterar a configuração, edite as constantes em `userService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000';
const API_TIMEOUT = 5000;
```

## ⚡ Scripts NPM Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `npm run build` | `tsc` | Compila TypeScript para JavaScript |
| `npm run mcp` | `node dist/main.js` | Executa servidor MCP compilado |
| `npm run mcp:dev` | `tsx src/main.ts` | Executa servidor MCP em desenvolvimento (recomendado) |
| `npm run dev` | `tsx src/example.ts` | Executa exemplo de uso das funções |
| `npm start` | `node dist/example.js` | Executa exemplo compilado |
| `npm run watch` | `tsc --watch` | Compila em modo watch (auto-recompila) |

> 📝 **Tecnologia:** Este projeto usa `tsx` em vez de `ts-node` para melhor performance e compatibilidade com ES modules modernos.

## 🚨 Tratamento de Erros

O projeto implementa tratamento robusto de erros:

### **Tipos de Erro:**
- **Erro de Rede:** Servidor inacessível
- **Erro HTTP:** Status 4xx/5xx 
- **Erro de Validação:** Dados inválidos
- **Timeout:** Requisição demorou muito

### **Exemplo de Resposta de Erro:**
```typescript
{
  success: false,
  message: "Erro ao buscar usuário com ID 999",
  error: "User not found",
  statusCode: 404,
  serverMessage: "Usuário não encontrado"
}
```

## 🔍 Debugging e Logs

O projeto inclui logs automáticos para facilitar o debugging:

```typescript
// Logs de requisição
🚀 Fazendo requisição: GET /users
✅ Resposta recebida: 200 - OK

// Logs de erro
❌ Erro na resposta: 404 Not Found
```


