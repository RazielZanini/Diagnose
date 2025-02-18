const express = require('express');
const fs = require('fs');
const DecisionTree = require('decision-tree');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'data', 'symptoms.txt');

// Garantir que a pasta de dados exista
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Função para carregar dados do arquivo
function loadTrainingData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao carregar os dados do arquivo:", error);
        return [];
    }
}

// Função para salvar dados no arquivo
function saveTrainingData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}

let trainingData = loadTrainingData();

const className = "disease";

const features = [
    "dores_cabeca",
    "dores_peito",
    "dores_olhos",
    "nariz_escorrendo",
    "dores_estomago",
    "tosse",
    "espirros",
    "dor_garganta",
    "palpitacoes",
    "solucos",
    "diarreia",
    "nausea",
    "dormencia",
    "insonia",
    "desmaio",
    "perda_olfato"
];

function trainDecisionTree() {
    if (trainingData.length === 0) return null;
    return new DecisionTree(trainingData, className, features);
}

let dt = trainDecisionTree();

app.get('/api/symptoms', (req, res) => {
    res.json(trainingData);
});

// Rota para atualizar a tabela de treinamento completa
// O corpo da requisição deve ser um array de objetos, cada um com os 16 sintomas e a propriedade "disease"
// {\n  "dores_cabeca": "Forte",\n  "dores_peito": "Médio", ... ,\n  "perda_olfato": "Irrelevante",\n  "disease": "Doença A"\n}
app.post('/api/symptoms', (req, res) => {
    trainingData = req.body;
    saveTrainingData(trainingData);
    dt = trainDecisionTree();
    res.json({ message: 'Dados atualizados com sucesso!' });
});

app.put('/api/symptoms/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    let data = loadTrainingData();

    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Registro não encontrado" });
    }

    data[index] = { ...data[index], ...updates };

    saveTrainingData(data);

    res.json({ message: "Sintomas atualizados com sucesso!", updated: data[index] });
});

app.post('/api/add-symptom', (req, res) => {
    const { id, symptom, level } = req.body;

    if (!id || !symptom || !level) {
        return res.status(400).json({ error: "ID, sintoma e nível são obrigatórios" });
    }

    const diseaseIndex = trainingData.findIndex((d) => d.id === id);
    
    if (diseaseIndex === -1) {
        return res.status(404).json({ error: "Doença não encontrada" });
    }

    trainingData[diseaseIndex][symptom] = level;
    
    saveTrainingData(trainingData);
    
    res.json({ message: "Sintoma adicionado com sucesso!", updatedDisease: trainingData[diseaseIndex] });
});

app.get('/api/disease/:id', (req, res) => {
    const { id } = req.params;

    const disease = trainingData.find((d) => d.id === id);

    if (!disease) {
        return res.status(404).json({ error: "Doença não encontrada" });
    }

    res.json(disease);
});

// Rota para diagnosticar com base nos sintomas informados
// O corpo da requisição deve ser um objeto com as 16 chaves e os valores "Irrelevante", "Médio" ou "Forte"
// { "dores_cabeca": "Forte", "dores_peito": "Médio", ... }
app.post('/api/diagnose', (req, res) => {
    if (!dt) return res.status(500).json({ error: 'Árvore de decisão não treinada. Insira dados de treinamento.' });
    try {
        const result = dt.predict(req.body);
        res.json({ diagnosis: result });
    } catch (error) {
        console.error("Erro no diagnóstico:", error);
        res.status(500).json({ error: 'Erro ao realizar diagnóstico' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
