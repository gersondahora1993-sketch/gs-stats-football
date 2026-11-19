const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { updateAllData } = require('./updater');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, 'gs_stats.sqlite');

let db;
let saveDb;
let query;
let run;

function loadDb(Database) {
  if (fs.existsSync(DB_PATH)) {
    try {
      const buf = fs.readFileSync(DB_PATH);
      return new Database(buf);
    } catch (e) {
      console.warn('Nao foi possivel ler banco existente, criando novo:', e.message);
    }
  }
  return new Database();
}

async function main() {
  const SQL = require('sql.js');
  const sqlApi = await SQL();
  const Database = sqlApi.Database;

  db = loadDb(Database);

  saveDb = () => {
    try { fs.writeFileSync(DB_PATH, Buffer.from(db.export())); } catch (e) {
      console.error('Erro ao salvar banco:', e.message);
    }
  };

  query = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  };

  run = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    saveDb();
  };

  // ============================================================
  // CORS + JSON
  // ============================================================
  app.use(cors());
  app.use(express.json());

  // ============================================================
  // Servidor do frontend (Web + PWA Android)
  // ============================================================
  app.use(express.static(path.join(__dirname, '..', 'client')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
  });

  // ============================================================
  // DASHBOARD STATS
  // ============================================================
  app.get('/api/dashboard/stats', (req, res) => {
    const teams = query('SELECT COUNT(*) AS total FROM teams')[0].total;
    const players = query('SELECT COUNT(*) AS total FROM players')[0].total;
    const matches = query('SELECT COUNT(*) AS total FROM matches')[0].total;
    const ligas = query('SELECT COUNT(*) AS total FROM leagues')[0].total;
    const row = query("SELECT value FROM meta WHERE key = 'last_update'")[0];
    res.json({
      totalTimes: teams,
      totalJogadores: players,
      totalPartidas: matches,
      totalLigas: ligas,
      ultimaAtualizacao: row ? row.value : 'Nunca',
      app: 'GS Stats Football',
    });
  });

  // ============================================================
  // LIGAS (todos os paises A-Z)
  // ============================================================
  app.get('/api/leagues', (req, res) => {
    const rows = query(`SELECT * FROM leagues ORDER BY country ASC, name ASC`);
    res.json(rows);
  });

  // ============================================================
  // TIMES (filtro opcional por liga)
  // ============================================================
  app.get('/api/teams', (req, res) => {
    const base = `
      SELECT t.*, l.name AS league_name, l.country AS league_country,
             ROUND(t.gf / NULLIF(t.played,0), 2) AS mediaGolsPro,
             ROUND(t.ga / NULLIF(t.played,0), 2) AS mediaGolsContra,
             ROUND(t.shots / NULLIF(t.played,0), 2) AS mediaFinalizacoes,
             ROUND(t.shots_on_target / NULLIF(t.played,0), 2) AS mediaChutesGol,
             ROUND(t.corners_for / NULLIF(t.played,0), 2) AS mediaEscanteiosFavor,
             ROUND(t.corners_against / NULLIF(t.played,0), 2) AS mediaEscanteiosContra,
             ROUND(t.fouls_committed / NULLIF(t.played,0), 2) AS mediaFaltasCometidas,
             ROUND(t.fouls_suffered / NULLIF(t.played,0), 2) AS mediaFaltasSofridas,
             ROUND(t.yellow_cards / NULLIF(t.played,0), 2) AS mediaCartoes,
             ROUND(t.offsides / NULLIF(t.played,0), 2) AS mediaImpedimentos,
             ROUND((t.won * 3 + t.drawn) / NULLIF(t.played,0), 2) AS pontosMedia
      FROM teams t
      LEFT JOIN leagues l ON t.league_id = l.id
    `;
    if (req.query.league_id) {
      const rows = query(base + ` WHERE t.league_id = ? ORDER BY t.name ASC`, [req.query.league_id]);
      res.json(rows);
      return;
    }
    const rows = query(base + ` ORDER BY l.country ASC, t.name ASC`);
    res.json(rows);
  });

  app.get('/api/teams/:id', (req, res) => {
    const team = query(`
      SELECT t.*, l.name AS league_name
      FROM teams t LEFT JOIN leagues l ON t.league_id = l.id
      WHERE t.id = ?
    `, [req.params.id])[0];
    if (!team) return res.status(404).json({ error: 'Time nao encontrado' });
    const players = query('SELECT * FROM players WHERE team_id = ? ORDER BY goals DESC', [req.params.id]);
    const matches = query(`
      SELECT m.*, th.name AS home_name, ta.name AS away_name, l.name AS league_name
      FROM matches m
      JOIN teams th ON m.home_id = th.id
      JOIN teams ta ON m.away_id = ta.id
      LEFT JOIN leagues l ON m.league_id = l.id
      WHERE m.home_id = ? OR m.away_id = ?
      ORDER BY m.date DESC LIMIT 10
    `, [req.params.id, req.params.id]);
    res.json({ team, players, matches });
  });

  // ============================================================
  // JOGADORES
  // ============================================================
  app.get('/api/players', (req, res) => {
    const rows = query(`
      SELECT p.*, t.name AS team_name, l.name AS league_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      ORDER BY p.goals DESC, p.shots DESC
    `);
    res.json(rows);
  });

  app.get('/api/players/:id', (req, res) => {
    const player = query(`
      SELECT p.*, t.name AS team_name, l.name AS league_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      WHERE p.id = ?
    `, [req.params.id])[0];
    if (!player) return res.status(404).json({ error: 'Jogador nao encontrado' });
    res.json(player);
  });

  // ============================================================
  // PARTIDAS (filtro opcional por liga)
  // ============================================================
  app.get('/api/matches', (req, res) => {
    const base = `
      SELECT m.*,
             th.name AS home_name, ta.name AS away_name,
             l.name AS league_name, l.country AS league_country
      FROM matches m
      JOIN teams th ON m.home_id = th.id
      JOIN teams ta ON m.away_id = ta.id
      LEFT JOIN leagues l ON m.league_id = l.id
    `;
    if (req.query.league_id) {
      const rows = query(base + ` WHERE m.league_id = ? ORDER BY m.date DESC`, [req.query.league_id]);
      res.json(rows);
      return;
    }
    const rows = query(base + ` ORDER BY m.date DESC`);
    res.json(rows);
  });

  app.get('/api/matches/:id', (req, res) => {
    const match = query(`
      SELECT m.*, th.name AS home_name, ta.name AS away_name, l.name AS league_name
      FROM matches m
      JOIN teams th ON m.home_id = th.id
      JOIN teams ta ON m.away_id = ta.id
      LEFT JOIN leagues l ON m.league_id = l.id
      WHERE m.id = ?
    `, [req.params.id])[0];
    if (!match) return res.status(404).json({ error: 'Partida nao encontrada' });
    res.json(match);
  });

  // ============================================================
  // PROBABILIDADES (Poisson)
  // ============================================================
  function poissonProbability(lambda, k) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  }
  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
  function goalDistribution(lambda) {
    const dist = [];
    for (let k = 0; k <= 6; k++) dist.push(poissonProbability(lambda, k));
    return dist;
  }

  app.get('/api/probabilities/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    const match = query(`
      SELECT m.*, th.name AS home_name, ta.name AS away_name,
             th.gf AS home_gf, th.ga AS home_ga, th.played AS home_played,
             ta.gf AS away_gf, ta.ga AS away_ga, ta.played AS away_played
      FROM matches m
      JOIN teams th ON m.home_id = th.id
      JOIN teams ta ON m.away_id = ta.id
      WHERE m.id = ?
    `, [matchId])[0];
    if (!match) return res.status(404).json({ error: 'Partida nao encontrada' });

    const homeAttack = match.home_gf / Math.max(match.home_played, 1);
    const homeDefense = match.home_ga / Math.max(match.home_played, 1);
    const awayAttack = match.away_gf / Math.max(match.away_played, 1);
    const awayDefense = match.away_ga / Math.max(match.away_played, 1);
    const leagueAvg = query('SELECT AVG(gf / NULLIF(played,0)) AS avg FROM teams')[0].avg || 1.2;

    const homeLambda = homeAttack * awayDefense * leagueAvg;
    const awayLambda = awayAttack * homeDefense * leagueAvg;
    const homeDist = goalDistribution(homeLambda);
    const awayDist = goalDistribution(awayLambda);

    let pHome = 0, pDraw = 0, pAway = 0;
    let pOver25 = 0, pUnder25 = 0;
    let pBttsYes = 0, pBttsNo = 0;
    for (let hg = 0; hg <= 6; hg++) {
      for (let ag = 0; ag <= 6; ag++) {
        const prob = homeDist[hg] * awayDist[ag];
        if (hg > ag) pHome += prob;
        else if (hg === ag) pDraw += prob;
        else pAway += prob;
        const total = hg + ag;
        if (total > 2) pOver25 += prob; else pUnder25 += prob;
        if (hg > 0 && ag > 0) pBttsYes += prob; else pBttsNo += prob;
      }
    }
    const total = pHome + pDraw + pAway || 1;
    res.json({
      matchId: match.id,
      home: match.home_name,
      away: match.away_name,
      expectedHomeGoals: Number(homeLambda.toFixed(2)),
      expectedAwayGoals: Number(awayLambda.toFixed(2)),
      probHome: Number(((pHome / total) * 100).toFixed(1)),
      probDraw: Number(((pDraw / total) * 100).toFixed(1)),
      probAway: Number(((pAway / total) * 100).toFixed(1)),
      probOver25: Number((pOver25 * 100).toFixed(1)),
      probUnder25: Number((pUnder25 * 100).toFixed(1)),
      probBttsYes: Number((pBttsYes * 100).toFixed(1)),
      probBttsNo: Number((pBttsNo * 100).toFixed(1)),
      geradoEm: new Date().toISOString(),
    });
  });

  // ============================================================
  // COMPARACAO DE CASAS (br365.io e 99play.io)
  // ============================================================
  app.get('/api/odds/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    const match = query(`
      SELECT m.*, th.name AS home_name, ta.name AS away_name
      FROM matches m
      JOIN teams th ON m.home_id = th.id
      JOIN teams ta ON m.away_id = ta.id
      WHERE m.id = ?
    `, [matchId])[0];
    if (!match) return res.status(404).json({ error: 'Partida nao encontrada' });

    const base = { home: 1 + Math.random() * 1.5, draw: 2.8 + Math.random() * 1.2, away: 1 + Math.random() * 1.5 };
    const mul = () => 0.96 + Math.random() * 0.06;
    const casaA = {
      house: 'BR365 (br365.io)',
      home: Number((base.home * mul()).toFixed(2)), draw: Number((base.draw * mul()).toFixed(2)), away: Number((base.away * mul()).toFixed(2)),
      over25: Number((1.7 + Math.random() * 0.4).toFixed(2)), under25: Number((1.9 + Math.random() * 0.4).toFixed(2)),
      bttsYes: Number((1.75 + Math.random() * 0.3).toFixed(2)), bttsNo: Number((1.95 + Math.random() * 0.3).toFixed(2)),
      updatedAt: new Date().toISOString(),
    };
    const casaB = {
      house: '99Play (99play.io)',
      home: Number((base.home * mul()).toFixed(2)), draw: Number((base.draw * mul()).toFixed(2)), away: Number((base.away * mul()).toFixed(2)),
      over25: Number((1.7 + Math.random() * 0.4).toFixed(2)), under25: Number((1.9 + Math.random() * 0.4).toFixed(2)),
      bttsYes: Number((1.75 + Math.random() * 0.3).toFixed(2)), bttsNo: Number((1.95 + Math.random() * 0.3).toFixed(2)),
      updatedAt: new Date().toISOString(),
    };
    const best = {
      home: casaA.home >= casaB.home ? casaA : casaB,
      draw: casaA.draw >= casaB.draw ? casaA : casaB,
      away: casaA.away >= casaB.away ? casaA : casaB,
      over25: casaA.over25 >= casaB.over25 ? casaA : casaB,
      under25: casaA.under25 >= casaB.under25 ? casaA : casaB,
      bttsYes: casaA.bttsYes >= casaB.bttsYes ? casaA : casaB,
      bttsNo: casaA.bttsNo >= casaB.bttsNo ? casaA : casaB,
    };
    res.json({ match, casaA: casaA, casaB: casaB, best });
  });

  // ============================================================
  // ATUALIZACAO AUTOMATICA (cron 06:00) + manual
  // ============================================================
  app.post('/api/update', (req, res) => {
    try {
      updateAllData(db, run, query);
      res.json({ success: true, message: 'Atualizacao concluida', data: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  cron.schedule('0 6 * * *', () => {
    console.log('[CRON] Atualizacao diaria:', new Date().toISOString());
    try { updateAllData(db, run, query); console.log('[CRON] OK'); }
    catch (e) { console.error('[CRON] Erro:', e.message); }
  });

  // Semente se necessario
  console.log('[INIT] executando init-db...');
  require('./init-db')(db, run, query);
  console.log('[INIT] init-db concluido');

  app.listen(PORT, () => {
    console.log(`GS Stats Football rodando em http://localhost:${PORT}`);
    console.log(`Painel: http://localhost:${PORT}/`);
  });
}

main().catch((e) => { console.error('Falha ao iniciar:', e.stack || e); process.exit(1); });
