import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { spawn } from 'child_process';

// Configurar ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Classe para gerenciar conexão com MCP Server
class MCPClient {
  constructor() {
    this.mcpProcess = null;
    this.isConnected = false;
  }

  async startMCPServer() {
    try {
      const mcpPath = process.env.MCP_SERVER_PATH || '../mcp';
      
      this.mcpProcess = spawn('node', ['dist/main.js'], {
        cwd: mcpPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.mcpProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        // Filtrar apenas logs de dados JSON-RPC para evitar spam
        if (output.includes('"jsonrpc"') || output.includes('"result"')) {
          console.log('MCP Response:', output);
        }
      });

      this.mcpProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        // Distinguir entre mensagens informativas e erros reais
        if (output.includes('🚀') || output.includes('📡') || output.includes('🔧')) {
          console.log('MCP Info:', output);
        } else if (output.includes('Error') || output.includes('erro') || output.includes('Erro')) {
          console.error('MCP Error:', output);
        } else {
          console.log('MCP Debug:', output);
        }
      });

      this.isConnected = true;
      console.log('MCP Server iniciado com sucesso');
      
      return true;
    } catch (error) {
      console.error('Erro ao iniciar MCP Server:', error);
      return false;
    }
  }

  async sendRequest(method, params = {}) {
    if (!this.isConnected || !this.mcpProcess) {
      throw new Error('MCP Server não está conectado');
    }

    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      };

      const timeout = setTimeout(() => {
        reject(new Error('Timeout na comunicação com MCP Server'));
      }, 10000);

      let buffer = '';
      
      const dataHandler = (data) => {
        buffer += data.toString();
        
        // Procurar por linhas JSON completas
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Manter a última linha incompleta no buffer
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line.trim());
              if (response.jsonrpc === '2.0' && response.id === request.id) {
                clearTimeout(timeout);
                this.mcpProcess.stdout.removeListener('data', dataHandler);
                resolve(response);
                return;
              }
            } catch (error) {
              // Ignora linhas que não são JSON válido (logs, etc)
              continue;
            }
          }
        }
      };

      this.mcpProcess.stdout.on('data', dataHandler);
      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  stop() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.isConnected = false;
    }
  }
}

const mcpClient = new MCPClient();

// Função para criar ferramentas OpenAI baseadas no MCP
const createOpenAITools = () => {
  return [
    {
      type: "function",
      function: {
        name: "get_all_users",
        description: "Busca todos os usuários cadastrados na API",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function", 
      function: {
        name: "get_user_by_id",
        description: "Busca um usuário específico pelo ID",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID do usuário a ser buscado"
            }
          },
          required: ["id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_user",
        description: "Cria um novo usuário",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome do usuário"
            },
            email: {
              type: "string",
              description: "Email do usuário"
            },
            age: {
              type: "number",
              description: "Idade do usuário"
            }
          },
          required: ["name", "email", "age"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "update_user",
        description: "Atualiza dados de um usuário existente",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID do usuário a ser atualizado"
            },
            name: {
              type: "string",
              description: "Novo nome do usuário"
            },
            email: {
              type: "string",
              description: "Novo email do usuário"
            },
            age: {
              type: "number",
              description: "Nova idade do usuário"
            }
          },
          required: ["id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "delete_user",
        description: "Remove um usuário pelo ID",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID do usuário a ser removido"
            }
          },
          required: ["id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "search_users",
        description: "Busca usuários por nome",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome ou parte do nome para buscar"
            }
          },
          required: ["name"]
        }
      }
    }
  ];
};

// Função para executar chamadas MCP
async function executeMCPFunction(functionName, args) {
  try {
    console.log(`🔧 Executando função: ${functionName} com argumentos:`, args);
    
    const result = await mcpClient.sendRequest('tools/call', {
      name: functionName,
      arguments: args
    });
    
    // Verificar se houve erro na resposta
    if (result.error) {
      throw new Error(`MCP Error: ${result.error.message || result.error}`);
    }
    
    // Retornar o conteúdo da resposta
    if (result.result && result.result.content) {
      // Se o conteúdo é um array com texto
      if (Array.isArray(result.result.content) && result.result.content[0]?.text) {
        try {
          // Tentar parsear o texto como JSON
          const data = JSON.parse(result.result.content[0].text);
          console.log(`✅ Função ${functionName} executada com sucesso`);
          return data;
        } catch (e) {
          // Se não conseguir parsear, retornar o texto como está
          console.log(`✅ Função ${functionName} executada (resposta em texto)`);
          return result.result.content[0].text;
        }
      }
      return result.result.content;
    }
    
    return result.result || result;
  } catch (error) {
    console.error(`❌ Erro ao executar função ${functionName}:`, error.message);
    throw error;
  }
}

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para chat com IA
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    console.log(`💬 Nova mensagem recebida: "${message}"`);

    // Preparar o contexto da conversa
    const messages = [
      {
        role: 'system',
        content: `Você é um assistente inteligente que ajuda usuários a gerenciar uma API de usuários. 
        SUAS ÚNICAS CAPACIDADES SÃO:
        - Listar todos os usuários (get_all_users)
        - Buscar usuário por ID (get_user_by_id)
        - Criar novos usuários (create_user)
        - Atualizar usuários existentes (update_user)
        - Deletar usuários (delete_user)
        - Buscar usuários por nome (search_users)

        REGRAS CRÍTICAS:
        1. NUNCA responda sobre assuntos que não sejam relacionados ao gerenciamento de usuários
        2. SEMPRE use as funções quando o usuário solicitar uma operação específica
        3. Se o usuário perguntar sobre outros tópicos, redirecione educadamente
        
        Sempre seja claro e direto nas suas respostas. Quando o usuário pedir para fazer alguma operação,
        use as funções disponíveis para executar a ação solicitada.`
      },
      ...conversation,
      {
        role: 'user',
        content: message
      }
    ];

    // Chamar OpenAI com tool calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      tools: createOpenAITools(),
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const assistantMessage = completion.choices[0].message;

    // Se a IA decidiu chamar uma função
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log(`🤖 IA decidiu chamar função: ${functionName}`);

      try {
        // Executar a função via MCP
        const mcpResult = await executeMCPFunction(functionName, functionArgs);
        
        console.log(`🎯 Gerando resposta final para o usuário...`);
        
        // Gerar resposta final baseada no resultado
        const finalCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            ...messages,
            assistantMessage,
            {
              role: 'tool',
              content: JSON.stringify(mcpResult),
              tool_call_id: toolCall.id
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const finalResponse = finalCompletion.choices[0].message;

        console.log(`✅ Resposta enviada ao usuário`);

        res.json({
          response: finalResponse.content,
          functionCalled: functionName,
          functionArgs: functionArgs,
          functionResult: mcpResult
        });

      } catch (mcpError) {
        console.error(`❌ Erro durante execução:`, mcpError.message);
        res.json({
          response: `Erro ao executar a operação: ${mcpError.message}`,
          error: true
        });
      }
    } else {
      // Resposta normal sem tool calling
      console.log(`💭 IA respondeu diretamente (sem ferramenta)`);
      res.json({
        response: assistantMessage.content
      });
    }

  } catch (error) {
    console.error('Erro na API de chat:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para verificar status
app.get('/api/status', (req, res) => {
  res.json({
    server: 'Cliente MCP rodando',
    mcpConnected: mcpClient.isConnected,
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Inicializar servidor
app.listen(PORT, async () => {
  console.log(`Interface disponível em: http://localhost:${PORT}`);
  
  // Tentar conectar ao MCP Server
  await mcpClient.startMCPServer();
});

// Cleanup no encerramento
process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  mcpClient.stop();
  process.exit(0);
});
