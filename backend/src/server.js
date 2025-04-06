const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Função para verificar autenticação no GitHub
async function verifyGitHubAuth(username, password) {
  try {
    // Se não houver username ou password, retorna falso
    if (!username || !password) {
      return false;
    }
    
    // Criar token de autenticação básica
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Fazer requisição para a API do GitHub para verificar as credenciais
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'Portfolio-Config-App'
      }
    });
    
    // Se a requisição for bem-sucedida, o usuário está autenticado
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error.message);
    return false;
  }
}

// Rota para atualizar arquivos SCSS
app.post('/api/update-scss', async (req, res) => {
  const { content, filePath, githubUser, password } = req.body;
  
  if (!content || !filePath) {
    return res.status(400).json({ error: 'Conteúdo e caminho do arquivo são obrigatórios' });
  }
  
  // Verificar autenticação se fornecida
  if (githubUser && password) {
    try {
      const isAuthenticated = await verifyGitHubAuth(githubUser, password);
      
      if (!isAuthenticated) {
        return res.status(401).json({ error: 'Autenticação falhou. Verifique suas credenciais.' });
      }
      
      console.log('Usuário autenticado com sucesso:', githubUser);
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return res.status(500).json({ error: 'Erro ao verificar autenticação' });
    }
  }
  
  try {
    // Caminho absoluto para o arquivo
    const absolutePath = path.resolve(__dirname, '../../frontend', filePath);
    
    // Garantir que o diretório exista
    const directory = path.dirname(absolutePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Escrever conteúdo no arquivo
    fs.writeFileSync(absolutePath, content);
    
    // Atualizar o styles.scss para importar o arquivo de variáveis, se não existir
    const stylesPath = path.resolve(__dirname, '../../frontend/src/styles.scss');
    let stylesContent = '';
    
    if (fs.existsSync(stylesPath)) {
      stylesContent = fs.readFileSync(stylesPath, 'utf8');
      
      // Verificar se a importação já existe
      if (!stylesContent.includes('@import')) {
        // Adicionar importação no topo do arquivo
        stylesContent = `@import './styles/variables';\n\n${stylesContent}`;
        fs.writeFileSync(stylesPath, stylesContent);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Arquivo atualizado com sucesso',
      user: githubUser ? githubUser : 'anônimo'
    });
  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error);
    res.status(500).json({ error: `Erro ao atualizar arquivo: ${error.message}` });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 