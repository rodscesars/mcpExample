#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  checkServerStatus
} from './userService.js';

// Criar instância do servidor MCP
const server = new Server(
  {
    name: 'user-api-client',
    version: '1.0.0',
  }
);

// Definir as ferramentas disponíveis
const tools: Tool[] = [
  {
    name: 'get_all_users',
    description: 'Busca todos os usuários cadastrados na API',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_user_by_id',
    description: 'Busca um usuário específico pelo ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID do usuário a ser buscado',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_user',
    description: 'Cria um novo usuário',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'name do usuário',
        },
        email: {
          type: 'string',
          description: 'Email do usuário',
        },
        age: {
          type: 'number',
          description: 'age do usuário (opcional)',
        },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'update_user',
    description: 'Atualiza um usuário existente',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID do usuário a ser atualizado',
        },
        name: {
          type: 'string',
          description: 'Novo name do usuário (opcional)',
        },
        email: {
          type: 'string',
          description: 'Novo email do usuário (opcional)',
        },
        age: {
          type: 'number',
          description: 'Nova age do usuário (opcional)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_user',
    description: 'Remove um usuário',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID do usuário a ser removido',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_users',
    description: 'Busca usuários por critérios (name ou email)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'name ou parte do name para buscar (opcional)',
        },
        email: {
          type: 'string',
          description: 'Email ou parte do email para buscar (opcional)',
        },
      },
      required: [],
    },
  },
  {
    name: 'check_server_status',
    description: 'Verifica se o servidor da API está online',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// Handler para listar ferramentas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handler para chamar ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_all_users': {
        const result = await getAllUsers();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_user_by_id': {
        const { id } = args as { id: number };
        const result = await getUserById(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_user': {
        const { name, email, age } = args as { name: string; email: string; age?: number };
        const result = await createUser({ name, email, age });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_user': {
        const { id, name, email, age } = args as { 
          id: number; 
          name?: string; 
          email?: string; 
          age?: number 
        };
        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (age !== undefined) updateData.age = age;
        
        const result = await updateUser(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_user': {
        const { id } = args as { id: number };
        const result = await deleteUser(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_users': {
        const { name, email } = args as { name?: string; email?: string };
        const criteria: any = {};
        if (name) criteria.name = name;
        if (email) criteria.email = email;
        
        const result = await searchUsers(criteria);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'check_server_status': {
        const result = await checkServerStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erro ao executar ${name}: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

// Função principal para iniciar o servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log para stderr (não interfere com o protocolo MCP)
  console.error('🚀 Servidor MCP User API Client iniciado');
  console.error('📡 Conectado via stdio');
  console.error('🔧 Ferramentas disponíveis:', tools.map(t => t.name).join(', '));
}

// Iniciar o servidor
main().catch((error) => {
  console.error('❌ Erro ao iniciar servidor MCP:', error);
  process.exit(1);
});
