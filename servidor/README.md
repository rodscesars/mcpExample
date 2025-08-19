# Servidor de Usuários

Este é um servidor Node.js com Express que fornece uma API RESTful para gerenciar usuários.

## 🚀 Como executar

1. Instalar as dependências:
```bash
npm install
```

2. Executar o servidor:
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

O servidor será executado em `http://localhost:3000`

## 📋 Endpoints da API

### GET /
Retorna informações sobre o servidor e endpoints disponíveis.

### GET /users
Retorna todos os usuários cadastrados.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "age": 30
    },
    {
      "id": 2,
      "name": "Maria Santos",
      "email": "maria@email.com",
      "age": 25
    }
  ],
  "total": 2
}
```

### GET /users/:id
Busca um usuário específico pelo ID.

**Parâmetros:**
- `id` (number): ID do usuário

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "age": 30
  }
}
```

### POST /users
Cria um novo usuário.

**Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com",
  "age": 25
}
```

**Campos obrigatórios:** `name`, `email`

**Validações:**
- `name` e `email` são obrigatórios
- `email` deve ser único (não pode estar cadastrado para outro usuário)

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 3,
    "name": "Nome do Usuário",
    "email": "email@exemplo.com",
    "age": 25
  }
}
```

### PUT /users/:id
Atualiza um usuário existente.

**Parâmetros:**
- `id` (number): ID do usuário

**Body:**
```json
{
  "name": "Novo Nome",
  "email": "novoemail@exemplo.com",
  "age": 26
}
```

**Validações:**
- `email` deve ser único se fornecido (não pode estar cadastrado para outro usuário)

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": {
    "id": 1,
    "name": "Novo Nome",
    "email": "novoemail@exemplo.com",
    "age": 26
  }
}
```

### DELETE /users/:id
Remove um usuário.

**Parâmetros:**
- `id` (number): ID do usuário

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário removido com sucesso",
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "age": 30
  }
}
```

## 🧪 Testando a API

Você pode testar a API usando ferramentas como:
- Postman
- Insomnia
- curl
- Ou qualquer cliente HTTP

### Exemplos com curl:

```bash
# Listar usuários
curl http://localhost:3000/users

# Buscar usuário por ID
curl http://localhost:3000/users/1

# Criar novo usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste User","email":"teste@email.com","age":28}'

# Atualizar usuário
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva Atualizado"}'

# Remover usuário
curl -X DELETE http://localhost:3000/users/1
```

## ⚠️ Tratamento de Erros

A API retorna códigos de status HTTP apropriados e mensagens de erro em JSON:

**400 - Bad Request:**
```json
{
  "success": false,
  "message": "name e email são obrigatórios"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

**500 - Internal Server Error:**
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "Detalhes do erro"
}
```

## 💾 Armazenamento

Atualmente, os dados são armazenados em memória. Isso significa que os dados serão perdidos quando o servidor for reiniciado. Para um ambiente de produção, seria necessário implementar persistência com banco de dados.

## 🔧 Tecnologias utilizadas

- Node.js
- Express.js
- CORS (para permitir requisições cross-origin)
- Nodemon (para desenvolvimento)
