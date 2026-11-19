# GS Stats Football

Sistema completo e **gratuito** de análise e probabilidades de futebol para **Web e Android (PWA)**.

Dashboard com fundo **vermelho e preto**, estatísticas de **times e jogadores**, gráficos, probabilidades (modelo Poisson), comparação de odds de **2 casas de apostas** (BR365 e 99Play) e **atualização automática diária**.

Sites de referência integrados: **www.br365.io** e **www.99play.io**.

---

## Ligas e campeonatos (todos os países A a Z)

O banco inclui **104 ligas de mais de 60 países**, organizadas de A a Z, entre elas:

- **América do Sul:** Brasil (Série A, B, C, D + estaduais), Argentina, Chile, Colômbia, Uruguai, Paraguai, Equador, Peru, Bolívia, Venezuela
- **Europa:** Inglaterra, Espanha, Alemanha, Itália, França, Portugal, Holanda, Escócia, Bélgica, Turquia, Rússia, Ucrânia, Polônia, Suécia, Dinamarca, Noruega, Suíça, Áustria, Grécia, Chéquia, Romênia, Sérvia, Croácia, Bulgária, Chipre, Finlândia, Islândia, Irlanda, Irlanda do Norte, País de Gales, Luxemburgo, Malta, Letônia, Estônia
- **Ásia/Meio-Oriente:** Arábia Saudita, Catar, Emirados, Japão, Coreia do Sul, China, Tailândia, Vietnã, Malásia, Índia, Irã, Iraque, Jordânia, Kuwait, Líbano, Omã, Iêmen
- **África:** Egito, Marrocos, Tunísia, Senegal, Nigéria, Gana, Camarões, Costa do Marfim, Zâmbia, Zimbábue
- **Oceania:** Austrália, Nova Zelândia
- **América do Norte/Central:** México, EUA, Canadá, Costa Rica, Panamá, Jamaica, etc.

Você pode **filtrar times, partidas, probabilidades e odds por liga** através do seletor no topo do painel.


## O que o sistema analisa

### Times
- Partidas (J), Vitórias (V), Empates (E), Derrotas (D)
- Gols marcados (GM) e gols sofridos (GS)
- **Finalizações** (chutes)
- **Chutes a gol** (finalizações no alvo)
- **Escanteios a favor** e **escanteios contra**
- **Faltas cometidas** e **faltas sofridas**
- **Cartões amarelos** (time) e vermelhos
- **Impedimentos por jogo**
- Média por jogo de cada estatística
- Pontuação e forma (últimos 5 jogos)

### Jogadores
- Nome, time, posição, número
- Partidas, gols, assistências
- Finalizações e chutes a gol
- Cartões amarelos (por jogador)
- Faltas cometidas e sofridas
- Impedimentos
- Minutos jogados

### Partidas
- Placar, finalizações de cada time, escanteios, cartões, data e status

### Probabilidades (modelo Poisson gratuito)
- Vitória mandante / Empate / Vitória visitante
- Gols esperados (xG) de cada time
- Mais de 2.5 gols / Menos de 2.5 gols
- Ambas marcam (Sim / Não)

### Comparador de 2 casas (melhores entradas)
- Odds de **BR365 (br365.io)** vs **99Play (99play.io)**
- Escolhe automaticamente a **melhor odd** de cada mercado entre as duas casas

---

## Telas (Dashboard)

1. **Dashboard** — cartões de estatísticas gerais + 3 gráficos (gols marcados x sofridos, médias da liga, aproveitamento dos times)
2. **Times** — tabela completa com todas as estatísticas
3. **Jogadores** — tabela completa de atletas
4. **Partidas** — resultados e estatísticas por jogo
5. **Probabilidades** — previsões Poisson para partidas agendadas
6. **Comparar casas** — melhores odds entre BR365 e 99Play
7. **Atualização** — forçar atualização manual + info da PWA

---

## Instalação e execução (gratuito, sem servidor externo)

Requisitos: **Node.js** instalado.

```bash
# 1. Acesse a pasta do servidor
cd gs-stats-football/server

# 2. Instale as dependências (apenas pacotes JS puro, sem compilação nativa)
npm install

# 3. Inicie o servidor
npm start
```

O sistema ficará disponível em: **http://localhost:3000**

Banco de dados: **SQLite** (arquivo único `gs_stats.sqlite`, sem necessidade de instalar banco separado).

---

## Atualização automática (todos os dias)

O servidor inclui um `node-cron` que roda **todos os dias às 06:00** atualizando:
- Estatísticas de times a partir das partidas
- Estatísticas de jogadores
- Inserção de novas partidas agendadas

Você também pode forçar a atualização a qualquer momento pelo painel (botão "Forçar atualização agora") ou chamando `POST /api/update`.

---

## Instalar no Android (PWA)

O frontend é uma **Progressive Web App**:

1. Abra **http://localhost:3000** no Chrome do Android (ou hospede em qualquer servidor/web).
2. Toque no menu do Chrome (três pontos) → **"Adicionar à tela de início"** ou aceite o aviso de "Instalar GS Stats Football".
3. O app abre em tela cheia, com ícone vermelho/preto "GS", e funciona offline para os assets já carregados.

---

## Observação sobre as odds (casas de apostas)

As odds de **BR365 (br365.io)** e **99Play (99play.io)** estão **simuladas** no código (`server/index.js`, rota `/api/odds/:matchId`) porque não há chave de API pública disponível neste pacote.

Para usar **odds reais**, substitua a função de geração de odds por chamadas às APIs oficiais:
- `https://www.br365.io/api`
- `https://www.99play.io/api`

O restante do sistema (estatísticas, probabilidades, gráficos, PWA) continua funcionando gratuitamente com os dados do banco.

---

## Estrutura do projeto

```
gs-stats-football/
├── server/
│   ├── index.js         # Express + rotas API + cron + servidor de arquivos
│   ├── init-db.js       # Criação do banco SQLite e dados de exemplo
│   ├── updater.js       # Atualização automática diária
│   ├── package.json
│   └── gs_stats.sqlite  # banco gerado automaticamente
└── client/              # Frontend (Web + PWA)
    ├── index.html
    ├── css/style.css    # tema vermelho e preto, responsivo
    ├── js/app.js        # gráficos Chart.js, navegação, odds, PWA
    ├── manifest.json
    ├── sw.js            # service worker (offline)
    └── icons/           # ícones SVG (192x192, 512x512)
```

---

## Licença

Uso livre e gratuito. Desenvolvido para análise esportiva e comparativo de entradas entre casas de apostas.
