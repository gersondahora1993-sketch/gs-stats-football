/**
 * Atualizacao automatica diaria do GS Stats Football.
 * Sem custo: usa dados baseados no proprio banco.
 * Estrutura preparada para APIs reais (br365.io, 99play.io, API-Football).
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateTeamStats(db, run, teamId) {
  const matches = db.prepare(
    `SELECT * FROM matches WHERE (home_id = ? OR away_id = ?) AND status = 'finished'`,
  );
  matches.bind([teamId, teamId]);

  const cols = matches.getColumnNames();
  const rows = [];
  while (matches.step()) rows.push(matches.getAsObject());
  matches.free();

  let played = 0, won = 0, drawn = 0, lost = 0;
  let gf = 0, ga = 0, shots = 0, shotsOT = 0;
  let cornersFor = 0, cornersAgainst = 0;
  let foulsC = 0, foulsS = 0, yellow = 0, red = 0, offsides = 0;

  rows.forEach((m) => {
    const isHome = m.home_id === teamId;
    const myScore = isHome ? m.home_score : m.away_score;
    const oppScore = isHome ? m.away_score : m.home_score;

    played++;
    if (myScore > oppScore) won++;
    else if (myScore === oppScore) drawn++;
    else lost++;

    gf += myScore;
    ga += oppScore;
    shots += isHome ? m.home_shots : m.away_shots;
    shotsOT += isHome ? m.home_shots_on_target : m.away_shots_on_target;
    cornersFor += isHome ? m.home_corners : m.away_corners;
    cornersAgainst += isHome ? m.away_corners : m.home_corners;
    foulsC += isHome ? m.home_fouls : m.away_fouls;
    foulsS += isHome ? m.away_fouls : m.home_fouls;
    yellow += isHome ? m.home_yellow : m.away_yellow;
    red += isHome ? m.home_red : m.away_red;
    offsides += isHome ? m.home_offsides : m.away_offsides;
  });

  const points = won * 3 + drawn;
  const form = rows
    .slice(-5)
    .map((m) => {
      const isHome = m.home_id === teamId;
      const myScore = isHome ? m.home_score : m.away_score;
      const oppScore = isHome ? m.away_score : m.home_score;
      return myScore > oppScore ? 'W' : myScore === oppScore ? 'D' : 'L';
    })
    .join('');

  run(
    `UPDATE teams SET played=?, won=?, drawn=?, lost=?, gf=?, ga=?, shots=?,
      shots_on_target=?, corners_for=?, corners_against=?, fouls_committed=?,
      fouls_suffered=?, yellow_cards=?, red_cards=?, offsides=?, points=?, form=?
      WHERE id = ?`,
    [played, won, drawn, lost, gf, ga, shots, shotsOT, cornersFor, cornersAgainst,
     foulsC, foulsS, yellow, red, offsides, points, form, teamId],
  );

  return { played, gf, ga };
}

function updatePlayerStats(db, run, playerId, teamId) {
  const matches = db.prepare(
    `SELECT * FROM matches WHERE (home_id = ? OR away_id = ?) AND status = 'finished'`,
  );
  matches.bind([teamId, teamId]);
  const cols = matches.getColumnNames();
  const rows = [];
  while (matches.step()) rows.push(matches.getAsObject());
  matches.free();

  const matchesPlayed = rows.length;
  const team = db.prepare('SELECT * FROM teams WHERE id = ?');
  team.bind([teamId]);
  team.step();
  const t = team.getAsObject();
  team.free();

  const goals = randInt(0, Math.max(1, Math.floor((t && t.gf ? t.gf : 0) / 22)));
  const assists = randInt(0, 6);
  const shots = randInt(5, 60);
  const shotsOT = randInt(1, Math.floor(shots / 2));
  const yellow = randInt(0, 5);
  const red = randInt(0, 1);
  const foulsC = randInt(0, 20);
  const foulsS = randInt(0, 20);
  const offsides = randInt(0, 8);
  const minutes = matchesPlayed * 90;

  run(
    `UPDATE players SET matches=?, goals=?, assists=?, shots=?, shots_on_target=?,
      yellow_cards=?, red_cards=?, fouls_committed=?, fouls_suffered=?, offsides=?, minutes=?
      WHERE id = ?`,
    [matchesPlayed, goals, assists, shots, shotsOT, yellow, red, foulsC, foulsS, offsides, minutes, playerId],
  );
}

async function updateAllData(db, run, query) {
  console.log('[UPDATER] Atualizando estatisticas de times e jogadores...');

  const brasileiraoRow = query("SELECT id FROM leagues WHERE country = 'Brasil' AND name = 'Premier League' LIMIT 1");
  const brasileiraoId = brasileiraoRow.length ? brasileiraoRow[0].id : null;

  const teams = query('SELECT id FROM teams');
  teams.forEach((t) => updateTeamStats(db, run, t.id));

  const players = query('SELECT id, team_id FROM players');
  players.forEach((p) => updatePlayerStats(db, run, p.id, p.team_id));

  // Adiciona partidas futuras proximas
  const now = new Date();
  const allTeams = query('SELECT id FROM teams');
  const insertMatch = db.prepare(
    `INSERT INTO matches (id, home_id, away_id, home_score, away_score, home_shots, away_shots,
      home_shots_on_target, away_shots_on_target, home_corners, away_corners,
      home_fouls, away_fouls, home_yellow, away_yellow, home_red, away_red,
      home_offsides, away_offsides, date, status, league)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`
  );
  for (let i = 0; i < 3; i++) {
    const h = allTeams[randInt(0, allTeams.length - 1)].id;
    let a = allTeams[randInt(0, allTeams.length - 1)].id;
    while (a === h) a = allTeams[randInt(0, allTeams.length - 1)].id;
    const d = new Date(now);
    d.setDate(now.getDate() + 1 + i);
    insertMatch.bind([
      require('crypto').randomUUID(), h, a, null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      d.toISOString(), 'scheduled', 'Brasileirao', brasileiraoId,
    ]);
    insertMatch.step();
    insertMatch.reset();
  }
  insertMatch.free();

  run("INSERT OR REPLACE INTO meta (key, value) VALUES ('last_update', ?)", [new Date().toISOString()]);
  console.log('[UPDATER] Atualizacao concluida em', new Date().toISOString());
}

module.exports = { updateAllData };
