import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  searchUsers, 
  checkServerStatus 
} from './userService.js';

/**
 * Exemplo de uso das funções do userService
 * Este arquivo demonstra como usar as funções TypeScript diretamente
 */
async function exemploDeUso() {
  console.log('🚀 Iniciando exemplos de uso do User Service...\n');

  // 1. Verificar status do servidor
  console.log('1️⃣ Verificando status do servidor...');
  const status = await checkServerStatus();
  if (status.success) {
    console.log('✅ Servidor online!');
    console.log('📊 Resposta:', status.data);
  } else {
    console.log('❌ Servidor offline:', status.message);
    return; // Para aqui se servidor estiver offline
  }
  console.log('');

  // 2. Buscar todos os usuários
  console.log('2️⃣ Buscando todos os usuários...');
  const todosUsuarios = await getAllUsers();
  if (todosUsuarios.success) {
    console.log(`✅ Encontrados ${todosUsuarios.data.total} usuários`);
    console.log('👥 Usuários:', todosUsuarios.data.data);
  } else {
    console.log('❌ Erro ao buscar usuários:', todosUsuarios.message);
  }
  console.log('');

  // 3. Buscar usuário por ID
  console.log('3️⃣ Buscando usuário por ID (ID: 1)...');
  const usuario = await getUserById(1);
  if (usuario.success) {
    console.log('✅ Usuário encontrado:');
    console.log('👤 Dados:', usuario.data.data);
  } else {
    console.log('❌ Usuário não encontrado:', usuario.message);
  }
  console.log('');

  // 4. Criar novo usuário
  console.log('4️⃣ Criando novo usuário...');
  const novoUsuario = await createUser({
    name: 'João da Silva',
    email: 'joao@exemplo.com',
    age: 30
  });
  if (novoUsuario.success) {
    console.log('✅ Usuário criado com sucesso!');
    console.log('🆕 Novo usuário:', novoUsuario.data.data);
    
    // Guardar ID para próximos exemplos
    const idCriado = novoUsuario.data.data.id;

    // 5. Atualizar usuário recém-criado
    console.log('5️⃣ Atualizando usuário recém-criado...');
    const usuarioAtualizado = await updateUser(idCriado, {
      name: 'João da Silva Santos',
      age: 31
    });
    if (usuarioAtualizado.success) {
      console.log('✅ Usuário atualizado com sucesso!');
      console.log('🔄 Usuário atualizado:', usuarioAtualizado.data.data);
    } else {
      console.log('❌ Erro ao atualizar usuário:', usuarioAtualizado.message);
    }
    console.log('');

    // 6. Buscar usuários por critério
    console.log('6️⃣ Buscando usuários por name...');
    const usuariosBusca = await searchUsers({ name: 'João' });
    if (usuariosBusca.success) {
      console.log(`✅ Encontrados ${usuariosBusca.data.total} usuários com "João" no name`);
      console.log('🔍 Resultados:', usuariosBusca.data.data);
    } else {
      console.log('❌ Erro na busca:', usuariosBusca.message);
    }
    console.log('');

    // 7. Deletar usuário criado (limpeza)
    console.log('7️⃣ Removendo usuário criado (limpeza)...');
    const usuarioRemovido = await deleteUser(idCriado);
    if (usuarioRemovido.success) {
      console.log('✅ Usuário removido com sucesso!');
      console.log('🗑️ Usuário removido:', usuarioRemovido.data.data);
    } else {
      console.log('❌ Erro ao remover usuário:', usuarioRemovido.message);
    }
    
  } else {
    console.log('❌ Erro ao criar usuário:', novoUsuario.message);
  }
  
  console.log('\n🎉 Exemplos concluídos!');
}

// Executar exemplos
exemploDeUso().catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
