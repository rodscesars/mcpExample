// Tipos relacionados ao usuário
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// Tipos para criação de usuário
export interface CreateUserData {
  name: string;
  email: string;
  age?: number;
}

// Tipos para atualização de usuário
export interface UpdateUserData {
  name?: string;
  email?: string;
  age?: number;
}

// Tipos para critérios de busca
export interface SearchCriteria {
  name?: string;
  email?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  error?: string;
}

// Tipos de resposta específicas
export interface UsersListResponse {
  success: boolean;
  data: User[];
  total: number;
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  data: User;
}

// Tipos para configuração do serviço
export interface ServiceConfig {
  baseURL?: string;
  timeout?: number;
}

// Tipos para resposta de erro
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode?: number;
  serverMessage?: string;
  networkError?: boolean;
}

// Tipos para status do servidor
export interface ServerStatus {
  online: boolean;
  message: string;
  serverResponse?: any;
  error?: string;
}

// União de tipos para respostas
export type ServiceResponse<T = any> = 
  | { success: true; data: T }
  | ErrorResponse;
