const { leagues } = require('./leagues-data');

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = function initDb(db, run, query) {
  // Tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS leagues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      code TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      season TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      logo TEXT,
      league_id TEXT,
      played INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      drawn INTEGER DEFAULT 0,
      lost INTEGER DEFAULT 0,
      gf INTEGER DEFAULT 0,
      ga INTEGER DEFAULT 0,
      shots INTEGER DEFAULT 0,
      shots_on_target INTEGER DEFAULT 0,
      corners_for INTEGER DEFAULT 0,
      corners_against INTEGER DEFAULT 0,
      fouls_committed INTEGER DEFAULT 0,
      fouls_suffered INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      offsides INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      form TEXT DEFAULT '',
      FOREIGN KEY(league_id) REFERENCES leagues(id)
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      position TEXT,
      number INTEGER,
      matches INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      shots INTEGER DEFAULT 0,
      shots_on_target INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      fouls_committed INTEGER DEFAULT 0,
      fouls_suffered INTEGER DEFAULT 0,
      offsides INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      FOREIGN KEY(team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      home_id TEXT NOT NULL,
      away_id TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      home_shots INTEGER DEFAULT 0,
      away_shots INTEGER DEFAULT 0,
      home_shots_on_target INTEGER DEFAULT 0,
      away_shots_on_target INTEGER DEFAULT 0,
      home_corners INTEGER DEFAULT 0,
      away_corners INTEGER DEFAULT 0,
      home_fouls INTEGER DEFAULT 0,
      away_fouls INTEGER DEFAULT 0,
      home_yellow INTEGER DEFAULT 0,
      away_yellow INTEGER DEFAULT 0,
      home_red INTEGER DEFAULT 0,
      away_red INTEGER DEFAULT 0,
      home_offsides INTEGER DEFAULT 0,
      away_offsides INTEGER DEFAULT 0,
      date TEXT,
      status TEXT DEFAULT 'scheduled',
      league TEXT DEFAULT 'Brasileirao',
      league_id TEXT,
      FOREIGN KEY(home_id) REFERENCES teams(id),
      FOREIGN KEY(away_id) REFERENCES teams(id),
      FOREIGN KEY(league_id) REFERENCES leagues(id)
    );
  `);

  // Popular ligas se tabela vazia
  const leagueCount = query('SELECT COUNT(*) AS c FROM leagues')[0].c;
  if (leagueCount === 0) {
    const insertLeague = db.prepare(
      `INSERT INTO leagues (id, name, country, code, level, season) VALUES (?,?,?,?,?,?)`
    );
    leagues.forEach((l) => {
      insertLeague.bind([uuidv4(), l.name, l.country, l.code, l.level, l.season]);
      insertLeague.step();
      insertLeague.reset();
    });
    insertLeague.free();
  }

  // Pegar id da Série A do Brasil para associar times existentes
  const brasileirao = query("SELECT id FROM leagues WHERE country = 'Brasil' AND name = 'Premier League' LIMIT 1")[0];

  // Se nao houver times, cria semente gratuita (times brasileiros de exemplo)
  const count = query('SELECT COUNT(*) AS c FROM teams')[0].c;
  if (count === 0) {
    const teams = [
      { name: 'Palmeiras', short: 'PAL' },
      { name: 'Flamengo', short: 'FLM' },
      { name: 'Corinthians', short: 'COR' },
      { name: 'Sao Paulo', short: 'SPA' },
      { name: 'Internacional', short: 'INT' },
      { name: 'Atletico-MG', short: 'CAM' },
      { name: 'Atletico-PR', short: 'CAP' },
      { name: 'Botafogo', short: 'BOT' },
      { name: 'Gremio', short: 'GRE' },
      { name: 'Cruzeiro', short: 'CRU' },
      { name: 'Santos', short: 'SAN' },
      { name: 'Vasco', short: 'VAS' },
      { name: 'Bahia', short: 'BAH' },
      { name: 'Fortaleza', short: 'FOR' },
      { name: 'Fluminense', short: 'FLU' },
      { name: 'Goias', short: 'GOI' },
    ];

    const insertTeam = db.prepare(
      `INSERT INTO teams (id, name, short_name, logo, league_id, played, won, drawn, lost, gf, ga, shots, shots_on_target,
        corners_for, corners_against, fouls_committed, fouls_suffered, yellow_cards, red_cards, offsides, points, form)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );

    const teamsIds = [];
    teams.forEach((t) => {
      const id = uuidv4();
      teamsIds.push(id);
      const played = 20;
      const won = Math.floor(Math.random() * 10) + 5;
      const drawn = Math.floor(Math.random() * 6);
      const lost = played - won - drawn;
      const gf = Math.floor(Math.random() * 35) + 20;
      const ga = Math.floor(Math.random() * 30) + 15;
      const shots = Math.floor(Math.random() * 250) + 180;
      const shotsOT = Math.floor(shots * (0.35 + Math.random() * 0.15));
      const cornersFor = Math.floor(Math.random() * 110) + 60;
      const cornersAgainst = Math.floor(Math.random() * 110) + 50;
      const foulsC = Math.floor(Math.random() * 220) + 150;
      const foulsS = Math.floor(Math.random() * 220) + 140;
      const yellow = Math.floor(Math.random() * 70) + 30;
      const red = Math.floor(Math.random() * 6);
      const offsides = Math.floor(Math.random() * 60) + 20;
      const points = won * 3 + drawn;

      insertTeam.bind([
        id, t.name, t.short, '', brasileirao ? brasileirao.id : null,
        played, won, drawn, lost, gf, ga, shots, shotsOT,
        cornersFor, cornersAgainst, foulsC, foulsS, yellow, red, offsides, points,
        'WWLDW',
      ]);
      insertTeam.step();
      insertTeam.reset();
    });
    insertTeam.free();

    // Jogadores por time
    const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];
    const firstNames = [
      'Carlos', 'Joao', 'Pedro', 'Lucas', 'Mateus', 'Gabriel', 'Felipe', 'Thiago',
      'Ricardo', 'Andre', 'Bruno', 'Gustavo', 'Vinicius', 'Rodrigo', 'Marcelo',
      'Leonardo', 'Fabio', 'Diego', 'Renato',
    ];
    const lastNames = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Carvalho',
      'Almeida', 'Gomes', 'Ribeiro', 'Martins', 'Alves', 'Pinto', 'Cunha', 'Dias',
    ];

    const insertPlayer = db.prepare(
      `INSERT INTO players (id, team_id, name, position, number, matches, goals, assists, shots,
        shots_on_target, yellow_cards, red_cards, fouls_committed, fouls_suffered, offsides, minutes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );

    teamsIds.forEach((teamId) => {
      const squadSize = 22;
      for (let i = 0; i < squadSize; i++) {
        const pos = positions[Math.floor(Math.random() * positions.length)];
        const matches = Math.floor(Math.random() * 25) + 5;
        const goals = pos === 'Atacante' ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 5);
        const assists = Math.floor(Math.random() * 8);
        const shots = Math.floor(Math.random() * 90) + 10;
        const shotsOT = Math.floor(shots * (0.3 + Math.random() * 0.2));
        const yellow = Math.floor(Math.random() * 8);
        const red = Math.floor(Math.random() * 2);
        const foulsC = Math.floor(Math.random() * 30);
        const foulsS = Math.floor(Math.random() * 30);
        const offsides = pos === 'Atacante' ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 5);
        const minutes = matches * 90;

        insertPlayer.bind([
          uuidv4(), teamId,
          `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          pos, i + 1, matches, goals, assists, shots, shotsOT, yellow, red, foulsC, foulsS, offsides, minutes,
        ]);
        insertPlayer.step();
        insertPlayer.reset();
      }
    });
    insertPlayer.free();

    // Partidas entre os times (rodada simulada)
    const insertMatch = db.prepare(
      `INSERT INTO matches (id, home_id, away_id, home_score, away_score, home_shots, away_shots,
        home_shots_on_target, away_shots_on_target, home_corners, away_corners,
        home_fouls, away_fouls, home_yellow, away_yellow, home_red, away_red,
        home_offsides, away_offsides, date, status, league, league_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );

    const now = new Date();
    for (let i = 0; i < 40; i++) {
      const h = teamsIds[Math.floor(Math.random() * teamsIds.length)];
      let a = teamsIds[Math.floor(Math.random() * teamsIds.length)];
      while (a === h) a = teamsIds[Math.floor(Math.random() * teamsIds.length)];
      const hs = Math.floor(Math.random() * 4);
      const as = Math.floor(Math.random() * 4);
      const d = new Date(now);
      d.setDate(now.getDate() - Math.floor(Math.random() * 30));
      insertMatch.bind([
        uuidv4(), h, a, hs, as,
        Math.floor(Math.random() * 20) + 5, Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 8) + 1, Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 20) + 5, Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 5), Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 2), Math.floor(Math.random() * 2),
        Math.floor(Math.random() * 5), Math.floor(Math.random() * 5),
        d.toISOString(), 'finished', 'Brasileirao', brasileirao ? brasileirao.id : null,
      ]);
      insertMatch.step();
      insertMatch.reset();
    }

    // Partidas futuras proximas
    for (let i = 0; i < 10; i++) {
      const h = teamsIds[Math.floor(Math.random() * teamsIds.length)];
      let a = teamsIds[Math.floor(Math.random() * teamsIds.length)];
      while (a === h) a = teamsIds[Math.floor(Math.random() * teamsIds.length)];
      const d = new Date(now);
      d.setDate(now.getDate() + 1 + i);
      insertMatch.bind([
        uuidv4(), h, a, null, null,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        d.toISOString(), 'scheduled', 'Brasileirao', brasileirao ? brasileirao.id : null,
      ]);
      insertMatch.step();
      insertMatch.reset();
    }
    insertMatch.free();

    run("INSERT OR REPLACE INTO meta (key, value) VALUES ('last_update', ?)", [new Date().toISOString()]);
    console.log('Banco inicializado com dados de exemplo (gratuito).');
  }
};
