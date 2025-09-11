import express from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Import necessário para o ping periódico

const app = express();
app.use(express.json());

// Serve arquivos estáticos da pasta public
app.use(express.static('public'));

// Caminho do arquivo de hinos
const hinosFilePath = path.join(process.cwd(), 'hinos_teste.json');


// API de hinos - GET
app.get('/api/hino', (req, res) => {
    try {
        const data = fs.readFileSync(hinosFilePath, 'utf-8');
        const hinos = JSON.parse(data);
        res.json(hinos);
    } catch {
        res.json([]);
    }
});

// API de hinos - POST
// ... (imports e configuração anteriores permanecem iguais)
app.post('/api/hino', (req, res) => {
    // agora extraímos tom e atentem também
    const { grupo, data, nome, link, tom, atentem } = req.body;
    let hinos = [];

    try {
        const dataFile = fs.readFileSync(hinosFilePath, 'utf-8');
        hinos = JSON.parse(dataFile);
    } catch {}

    // validação simples (opcional)
    if (!grupo || !data || !nome) {
        return res.status(400).json({ message: 'Preencha grupo, data e nome do hino.' });
    }

    const novoHino = {
        grupo,
        data,
        nome,
        link: link || '',
        tom: tom || '',
        atentem: atentem || ''
    };

    hinos.push(novoHino);

    fs.writeFileSync(hinosFilePath, JSON.stringify(hinos, null, 2));
    console.log('Hino salvo:', novoHino); // ajuda no debug
    res.status(201).json({ message: `Hino do grupo ${grupo} salvo.`, hino: novoHino });
});



// API de hinos - DELETE (opcional)
app.delete('/api/hino', (req, res) => {
    fs.writeFileSync(hinosFilePath, JSON.stringify([], null, 2));
    res.json({ message: 'Tabela limpa!' });
});

// Servir index.html por padrão
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});
// Deletar hino individual pelo índice
app.delete('/api/hino/:index', (req, res) => {
  const index = parseInt(req.params.index);

  if (isNaN(index)) return res.status(400).json({ message: 'Índice inválido' });

  let hinos = [];
  try {
    const data = fs.readFileSync(hinosFilePath, 'utf-8');
    hinos = JSON.parse(data);
  } catch {}

  if (index < 0 || index >= hinos.length) {
    return res.status(404).json({ message: 'Hino não encontrado' });
  }

  const removido = hinos.splice(index, 1)[0];

  fs.writeFileSync(hinosFilePath, JSON.stringify(hinos, null, 2));
  console.log('Hino removido:', removido);
  res.json({ message: 'Hino removido com sucesso', hino: removido });
});

// Atualizar hino pelo índice
app.put('/api/hino/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { grupo, data, nome, link, tom, atentem } = req.body;

  if (isNaN(index)) return res.status(400).json({ message: 'Índice inválido' });

  let hinos = [];
  try {
    const dataFile = fs.readFileSync(hinosFilePath, 'utf-8');
    hinos = JSON.parse(dataFile);
  } catch {
    return res.status(500).json({ message: 'Erro ao ler arquivo de hinos' });
  }

  if (index < 0 || index >= hinos.length) {
    return res.status(404).json({ message: 'Hino não encontrado' });
  }

  // Atualiza apenas os campos recebidos
  hinos[index] = {
    ...hinos[index],
    grupo: grupo || hinos[index].grupo,
    data: data || hinos[index].data,
    nome: nome || hinos[index].nome,
    link: link || hinos[index].link,
    tom: tom || hinos[index].tom,
    atentem: atentem || hinos[index].atentem
  };

  try {
    fs.writeFileSync(hinosFilePath, JSON.stringify(hinos, null, 2));
    console.log('Hino atualizado:', hinos[index]);
    res.json({ message: 'Hino atualizado com sucesso', hino: hinos[index] });
  } catch {
    res.status(500).json({ message: 'Erro ao salvar hino' });
  }
});



// 🔹 Ping periódico para manter o servidor acordado


// Porta do Render ou local
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
