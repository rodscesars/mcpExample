import axios, { AxiosError } from 'axios';
import {
  User,
  CreateUserData,
  UpdateUserData,
  SearchCriteria,
  ServiceResponse,
  UsersListResponse,
  UserResponse,
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  ServerStatus,
  ErrorResponse
} from './types';

// Configuração base da API
const API_BASE_URL = 'http://localhost:3000';
const API_TIMEOUT = 5000;

// Instância do axios configurada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptors para logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Fazendo requisição: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Resposta recebida: ${response.status} - ${response.statusText}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.statusText);
    return Promise.reject(error);
  }
);

/**
 * Manipula erros de forma consistente
 */
function handleError(error: AxiosError, message: string): ErrorResponse {
  const errorResponse: ErrorResponse = {
    success: false,
    message: message,
    error: error.message
  };

  if (error.response) {
    // Erro de resposta HTTP
    errorResponse.statusCode = error.response.status;
    errorResponse.serverMessage = (error.response.data as any)?.message || 'Erro no servidor';
  } else if (error.request) {
    // Erro de rede
    errorResponse.networkError = true;
    errorResponse.message = 'Erro de conexão com o servidor';
  }

  return errorResponse;
}

/**
 * Busca todos os usuários
 */
export async function getAllUsers(): Promise<ServiceResponse<UsersListResponse>> {
  try {
    const response = await api.get<UsersListResponse>('/users');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error as AxiosError, 'Erro ao buscar usuários');
  }
}

/**
 * Busca um usuário pelo ID
 */
export async function getUserById(id: number): Promise<ServiceResponse<UserResponse>> {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID do usuário é obrigatório e deve ser um número');
    }

    const response = await api.get<UserResponse>(`/users/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error as AxiosError, `Erro ao buscar usuário com ID ${id}`);
  }
}

/**
 * Cria um novo usuário
 */
export async function createUser(userData: CreateUserData): Promise<ServiceResponse<CreateUserResponse>> {
  try {
    if (!userData.name || !userData.email) {
      throw new Error('Name e email são obrigatórios');
    }

    const response = await api.post<CreateUserResponse>('/users', userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error as AxiosError, 'Erro ao criar usuário');
  }
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(id: number, userData: UpdateUserData): Promise<ServiceResponse<UpdateUserResponse>> {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID do usuário é obrigatório e deve ser um número');
    }

    if (!userData || Object.keys(userData).length === 0) {
      throw new Error('Dados para atualização são obrigatórios');
    }

    const response = await api.put<UpdateUserResponse>(`/users/${id}`, userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error as AxiosError, `Erro ao atualizar usuário com ID ${id}`);
  }
}

/**
 * Remove um usuário
 */
export async function deleteUser(id: number): Promise<ServiceResponse<DeleteUserResponse>> {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID do usuário é obrigatório e deve ser um número');
    }

    const response = await api.delete<DeleteUserResponse>(`/users/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error as AxiosError, `Erro ao remover usuário com ID ${id}`);
  }
}

/**
 * Busca usuários por critérios (filtro local)
 */
export async function searchUsers(criteria: SearchCriteria = {}): Promise<ServiceResponse<UsersListResponse>> {
  try {
    const allUsersResponse = await getAllUsers();
    
    if (!allUsersResponse.success) {
      return allUsersResponse;
    }

    let users: User[] = allUsersResponse.data.data || [];

    // Filtrar por name se fornecido
    if (criteria.name) {
      users = users.filter((user: User) => 
        user.name.toLowerCase().includes(criteria.name!.toLowerCase())
      );
    }

    // Filtrar por email se fornecido
    if (criteria.email) {
      users = users.filter((user: User) => 
        user.email.toLowerCase().includes(criteria.email!.toLowerCase())
      );
    }

    return {
      success: true,
      data: {
        success: true,
        data: users,
        total: users.length
      }
    };
  } catch (error) {
    return handleError(error as AxiosError, 'Erro ao buscar usuários com critérios');
  }
}

/**
 * Verifica se o servidor está online
 */
export async function checkServerStatus(): Promise<ServiceResponse<ServerStatus>> {
  try {
    const response = await api.get('/');
    return {
      success: true,
      data: {
        online: true,
        message: 'Servidor online',
        serverResponse: response.data
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Servidor offline ou inacessível',
      error: (error as Error).message,
      statusCode: (error as AxiosError).response?.status,
      networkError: true
    };
  }
}
