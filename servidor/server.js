const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simulando um banco de dados em memória
let users = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    age: 30
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    age: 25
  }
];

let nextId = 3;

// Rotas

// GET - Buscar todos os usuários
app.get('/users', (req, res) => {
  try {
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET - Buscar usuário por ID
app.get('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST - Criar novo usuário
app.post('/users', (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    // Validação básica
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'name e email são obrigatórios'
      });
    }
    
    // Verificar se email já existe
    const emailExists = users.find(u => u.email === email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }
    
    const newUser = {
      id: nextId++,
      name,
      email,
      age: age || null
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT - Atualizar usuário
app.put('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, age } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se email já existe em outro usuário
    if (email) {
      const emailExists = users.find(u => u.email === email && u.id !== userId);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado para outro usuário'
        });
      }
    }
    
    // Atualizar dados
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (age !== undefined) users[userIndex].age = age;
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: users[userIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// DELETE - Remover usuário
app.delete('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Usuário removido com sucesso',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor de usuários funcionando!',
    endpoints: {
      'GET /users': 'Listar todos os usuários',
      'GET /users/:id': 'Buscar usuário por ID',
      'POST /users': 'Criar novo usuário',
      'PUT /users/:id': 'Atualizar usuário',
      'DELETE /users/:id': 'Remover usuário'
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação disponível em http://localhost:${PORT}`);
});

module.exports = app;
