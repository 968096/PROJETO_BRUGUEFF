const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para atualizar arquivos SCSS
app.post('/api/update-scss', (req, res) => {
  const { content, filePath } = req.body;
  
  if (!content || !filePath) {
    return res.status(400).json({ error: 'Conteúdo e caminho do arquivo são obrigatórios' });
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
    
    res.json({ success: true, message: 'Arquivo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error);
    res.status(500).json({ error: `Erro ao atualizar arquivo: ${error.message}` });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 