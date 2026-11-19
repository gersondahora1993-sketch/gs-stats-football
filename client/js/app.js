/* ============================================================
   GS Stats Football — Aplicacao (Frontend)
   ============================================================ */
const API = ''; // mesmo endereco (mesma origem)

let charts = {};
let modoInstalacao = null;
let ligaSelecionada = null; // id da liga selecionada para filtro

// ================= Inicializacao =================
async function init() {
  try {
    await carregarDashboard();
    await carregarLigas();
    await carregarTimes();
    await carregarJogadores();
    await carregarPartidas();
    await carregarProbabilidades();
    await preencherSelectOdds();
    montarGraficos();
    configurarFiltroLiga();
  } catch (e) {
    console.error('Erro ao iniciar:', e);
  } finally {
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => document.getElementById('loader').remove(), 400);
  }
}

// ================= Navegacao =================
const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebar');
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

function abrirMenu() { sidebar.classList.add('open'); overlay.classList.add('visible'); }
function fecharMenu() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }

btnMenu.addEventListener('click', abrirMenu);
overlay.addEventListener('click', fecharMenu);

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sec = link.dataset.section;
    irPara(sec);
    fecharMenu();
  });
});

function irPara(sec) {
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('visible'));
  document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
  const alvo = document.getElementById('section-' + sec);
  if (alvo) alvo.classList.add('visible');
  const ativo = document.querySelector('[data-section="' + sec + '"]');
  if (ativo) ativo.classList.add('active');

  if (sec === 'comparar') preencherGridOdds();
  window.scrollTo(0, 0);
}

irPara('dashboard');

// Buscas
document.getElementById('buscaTimes').addEventListener('input', (e) => {
  const t = e.target.value.toLowerCase();
  document.querySelectorAll('#tabelaTimes tbody tr').forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(t) ? '' : 'none';
  });
});
document.getElementById('buscaJogadores').addEventListener('input', (e) => {
  const t = e.target.value.toLowerCase();
  document.querySelectorAll('#tabelaJogadores tbody tr').forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(t) ? '' : 'none';
  });
});

// Atualizacao
document.getElementById('btnRefresh').addEventListener('click', () => {
  document.getElementById('btnRefresh').classList.add('rodando');
  init().then(() => document.getElementById('btnRefresh').classList.remove('rodando'));
});
document.getElementById('btnUpdateNow').addEventListener('click', async () => {
  const btn = document.getElementById('btnUpdateNow');
  const msg = document.getElementById('msgUpdate');
  btn.disabled = true;
  msg.textContent = 'Atualizando...';
  try {
    const r = await fetch(API + '/api/update', { method: 'POST' });
    const json = await r.json();
    msg.textContent = json.success ? 'Atualizado com sucesso em ' + new Date().toLocaleTimeString() : 'Erro ao atualizar';
    msg.style.color = json.success ? '#4caf50' : '#ff4444';
    await init();
  } catch (err) {
    msg.textContent = 'Erro de conexao com o servidor';
    msg.style.color = '#ff4444';
  } finally {
    btn.disabled = false;
  }
});

// ================= API helpers =================
async function get(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error('Falha ' + r.status + ' em ' + path);
  return r.json();
}

// ================= Dashboard =================
async function carregarDashboard() {
  const stats = await get('/api/dashboard/stats');
  document.getElementById('stat-times').textContent = stats.totalTimes;
  document.getElementById('stat-jogadores').textContent = stats.totalJogadores;
  document.getElementById('stat-partidas').textContent = stats.totalPartidas;
  document.getElementById('stat-atualizacao').textContent = stats.ultimaAtualizacao
    ? new Date(stats.ultimaAtualizacao).toLocaleString('pt-BR')
    : '-';
}

// Carrega ligas e preenche seletor
async function carregarLigas() {
  try {
    const ligas = await get('/api/leagues');
    const sel = document.getElementById('filtroLiga');
    if (!sel) return;
    sel.innerHTML = '<option value="">Todas as ligas</option>';
    ligas.forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = `${l.name} (${l.country})`;
      sel.appendChild(opt);
    });
    const wrap = document.querySelector('.liga-select-wrap');
    if (wrap) wrap.style.display = 'block';
  } catch (e) {
    console.error('Erro ao carregar ligas:', e);
  }
}

function configurarFiltroLiga() {
  const sel = document.getElementById('filtroLiga');
  if (!sel) return;
  sel.addEventListener('change', (e) => {
    ligaSelecionada = e.target.value || null;
    recarregarPorLiga();
  });
}

async function recarregarPorLiga() {
  await Promise.all([carregarTimes(), carregarPartidas(), carregarProbabilidades(), preencherSelectOdds()]);
  montarGraficos();
}

// ================= Times =================
async function carregarTimes() {
  const qs = ligaSelecionada ? '?league_id=' + encodeURIComponent(ligaSelecionada) : '';
  const times = await get('/api/teams' + qs);
  const corpo = document.getElementById('corpoTimes');
  corpo.innerHTML = '';
  times.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="nome-time">${t.name}</span></td>
      <td>${t.league_name || '-'}</td>
      <td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td>
      <td>${t.gf}</td><td>${t.ga}</td>
      <td>${t.shots}</td><td>${t.shots_on_target}</td>
      <td>${t.corners_for}</td><td>${t.corners_against}</td>
      <td>${t.fouls_committed}</td><td>${t.fouls_suffered}</td>
      <td>${t.yellow_cards}</td><td>${t.offsides}</td>
      <td><b>${t.points}</b></td>
    `;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => verDetalhesTime(t.id));
    corpo.appendChild(tr);
  });
}

function verDetalhesTime(id) {
  location.hash = 'time-' + id;
  irPara('times');
}

// ================= Jogadores =================
async function carregarJogadores() {
  const qs = ligaSelecionada ? '?league_id=' + encodeURIComponent(ligaSelecionada) : '';
  const players = await get('/api/players' + qs);
  const corpo = document.getElementById('corpoJogadores');
  corpo.innerHTML = '';
  players.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="nome-jogador">${p.name}</span></td>
      <td>${p.team_name}</td><td>${p.league_name || '-'}</td><td>${p.position}</td>
      <td>${p.matches}</td><td>${p.goals}</td><td>${p.assists}</td>
      <td>${p.shots}</td><td>${p.shots_on_target}</td>
      <td>${p.yellow_cards}</td><td>${p.fouls_committed}</td>
      <td>${p.fouls_suffered}</td><td>${p.offsides}</td><td>${p.minutes}</td>
    `;
    corpo.appendChild(tr);
  });
}

// ================= Partidas =================
async function carregarPartidas() {
  const qs = ligaSelecionada ? '?league_id=' + encodeURIComponent(ligaSelecionada) : '';
  const matches = await get('/api/matches' + qs);
  const corpo = document.getElementById('corpoPartidas');
  corpo.innerHTML = '';
  matches.forEach((m) => {
    const placar = m.home_score === null ? '—' : `${m.home_score} x ${m.away_score}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="nome-time">${m.home_name}</span></td>
      <td><b>${placar}</b></td>
      <td><span class="nome-time">${m.away_name}</span></td>
      <td>${m.home_shots}</td><td>${m.away_shots}</td>
      <td>${m.home_corners}</td><td>${m.away_corners}</td>
      <td>${m.home_yellow}</td><td>${m.away_yellow}</td>
      <td>${new Date(m.date).toLocaleDateString('pt-BR')}</td>
      <td><span style="color:${m.status === 'finished' ? '#4caf50' : '#ffd700'}">${m.status === 'finished' ? 'Finalizada' : 'Agendada'}</span></td>
    `;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      irPara('probabilidades');
      setTimeout(() => {
        const sel = document.getElementById('selectOddsMatch');
        sel.value = m.id;
        preencherGridOdds();
      }, 100);
    });
    corpo.appendChild(tr);
  });
}

// ================= Probabilidades (Poisson) =================
async function carregarProbabilidades() {
  const qs = ligaSelecionada ? '?league_id=' + encodeURIComponent(ligaSelecionada) : '';
  const matches = await get('/api/matches' + qs);
  const lista = document.getElementById('listaProbabilidades');
  lista.innerHTML = '';

  const futuras = matches.filter((m) => m.status !== 'finished');
  if (futuras.length === 0) {
    lista.innerHTML = '<p style="color:#888;padding:20px;">Nenhuma partida agendada para probabilidade.</p>';
    return;
  }

  for (const m of futuras) {
    try {
      const prob = await get('/api/probabilities/' + m.id);
      const card = document.createElement('div');
      card.className = 'prob-card';
      const melhor = prob.probHome >= prob.probAway ? (prob.probHome >= prob.probDraw ? 'casa' : 'empate') : (prob.probAway >= prob.probDraw ? 'fora' : 'empate');
      card.innerHTML = `
        <div class="prob-time casa">${prob.home}</div>
        <div class="prob-centro">
          <div class="prob-placar">${prob.expectedHomeGoals.toFixed(1)} x ${prob.expectedAwayGoals.toFixed(1)} xG</div>
          <div class="prob-x">1 X 2</div>
          <div class="prob-row">
            <div class="prob-pill ${melhor === 'casa' ? 'destaque' : ''}">${prob.probHome}% Vitoria</div>
            <div class="prob-pill ${melhor === 'empate' ? 'destaque' : ''}">${prob.probDraw}% Empate</div>
            <div class="prob-pill ${melhor === 'fora' ? 'destaque' : ''}">${prob.probAway}% Vitoria</div>
          </div>
          <div class="prob-row" style="margin-top:6px;">
            <div class="prob-pill">${prob.probOver25}% Mais de 2.5</div>
            <div class="prob-pill">${prob.probBttsYes}% Ambas marcam</div>
          </div>
        </div>
        <div class="prob-time fora">${prob.away}</div>
      `;
      card.addEventListener('click', () => {
        const sel = document.getElementById('selectOddsMatch');
        sel.value = m.id;
        irPara('comparar');
        preencherGridOdds();
      });
      lista.appendChild(card);
    } catch (e) {
      console.error('Erro probabilidade ' + m.id, e);
    }
  }
}

// ================= Odds comparacao 2 casas =================
async function preencherSelectOdds() {
  const qs = ligaSelecionada ? '?league_id=' + encodeURIComponent(ligaSelecionada) : '';
  const matches = await get('/api/matches' + qs);
  const sel = document.getElementById('selectOddsMatch');
  sel.innerHTML = '<option value="">Escolha uma partida</option>';
  matches.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.home_name} x ${m.away_name} - ${new Date(m.date).toLocaleDateString('pt-BR')}`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    if (sel.value) preencherGridOdds();
  });
}

async function preencherGridOdds() {
  const sel = document.getElementById('selectOddsMatch');
  if (!sel.value) return;
  const grid = document.getElementById('oddsGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;color:#888;padding:16px;">Carregando odds...</div>';

  try {
    const data = await get('/api/odds/' + sel.value);
    const { casaA, casaB, best, match } = data;
    grid.innerHTML = '';

    const mercados = [
      { chave: 'home', label: 'Vitoria ' + match.home_name, casaA: casaA.home, casaB: casaB.home, best: best.home },
      { chave: 'draw', label: 'Empate', casaA: casaA.draw, casaB: casaB.draw, best: best.draw },
      { chave: 'away', label: 'Vitoria ' + match.away_name, casaA: casaA.away, casaB: casaB.away, best: best.away },
      { chave: 'over25', label: 'Mais de 2.5 gols', casaA: casaA.over25, casaB: casaB.over25, best: best.over25 },
      { chave: 'under25', label: 'Menos de 2.5 gols', casaA: casaA.under25, casaB: casaB.under25, best: best.under25 },
      { chave: 'bttsYes', label: 'Ambas marcam (Sim)', casaA: casaA.bttsYes, casaB: casaB.bttsYes, best: best.bttsYes },
      { chave: 'bttsNo', label: 'Ambas marcam (Nao)', casaA: casaA.bttsNo, casaB: casaB.bttsNo, best: best.bttsNo },
    ];

    mercados.forEach((mk) => {
      const ehCasaA = mk.best.house === casaA.house;
      const card = document.createElement('div');
      card.className = 'odd-card ' + (mk.best === (ehCasaA ? casaA : casaB) ? 'best' : '');
      card.innerHTML = `
        <span class="odd-casa">${ehCasaA ? casaA.house : casaB.house} (melhor)</span>
        <div class="odd-valor">${mk.best[mk.chave]}</div>
        <div class="odd-mercado">${mk.label}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">BR365: ${mk.casaA} | 99Play: ${mk.casaB}</div>
        <div class="odd-atualizado">Atualizado: ${new Date(mk.best.updatedAt).toLocaleString('pt-BR')}</div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:#ff4444;padding:16px;">Erro ao carregar odds. Verifique o servidor.</div>';
    console.error(e);
  }
}

// ================= Graficos (Chart.js) =================
function montarGraficos() {
  const qs = ligaSelecionada ? '?league_id=' + encodeURIComponent(ligaSelecionada) : '';
  Promise.all([get('/api/teams' + qs), get('/api/matches' + qs)]).then(([times, matches]) => {
    destruirGraficos();

    // Grafico 1: Gols pro x contra (top 8 times)
    const top8 = [...times].sort((a, b) => b.gf - a.gf).slice(0, 8);
    const ctx1 = document.getElementById('chartGols');
    if (ctx1) {
      charts.gols = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: top8.map((t) => t.name),
          datasets: [
            {
              label: 'Gols marcados (GM)',
              data: top8.map((t) => t.gf),
              backgroundColor: 'rgba(255, 59, 59, 0.85)',
              borderColor: '#ff3b3b',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Gols sofridos (GS)',
              data: top8.map((t) => t.ga),
              backgroundColor: 'rgba(128, 0, 0, 0.7)',
              borderColor: '#800000',
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#fff', font: { family: 'Rajdhani' } } }, title: { display: true, text: 'Gols marcados x sofridos', color: '#ffd700', font: { family: 'Archivo', size: 16, weight: '800' } } },
          scales: {
            x: { ticks: { color: '#ccc' }, grid: { color: '#1a1a1a' } },
            y: { ticks: { color: '#ccc' }, grid: { color: '#1a1a1a' }, beginAtZero: true },
          },
        },
      });
    }

    // Grafico 2: Medias da liga
    const medias = {
      'Gols por partida': Number(((times.reduce((s, t) => s + t.gf, 0) / times.reduce((s, t) => s + t.played, 0) || 0) * 2).toFixed(2)),
      'Finalizacoes': Number(((times.reduce((s, t) => s + t.shots, 0) / times.reduce((s, t) => s + t.played, 0) || 0)).toFixed(1)),
      'Chutes a gol': Number(((times.reduce((s, t) => s + t.shots_on_target, 0) / times.reduce((s, t) => s + t.played, 0) || 0)).toFixed(1)),
      'Escanteios a favor': Number(((times.reduce((s, t) => s + t.corners_for, 0) / times.reduce((s, t) => s + t.played, 0) || 0)).toFixed(1)),
      'Cartoes amarelos': Number(((times.reduce((s, t) => s + t.yellow_cards, 0) / times.reduce((s, t) => s + t.played, 0) || 0)).toFixed(1)),
      'Impedimentos': Number(((times.reduce((s, t) => s + t.offsides, 0) / times.reduce((s, t) => s + t.played, 0) || 0)).toFixed(1)),
    };
    const ctx2 = document.getElementById('chartMercados');
    if (ctx2) {
      charts.mercados = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: Object.keys(medias),
          datasets: [{
            label: 'Media por time / partida',
            data: Object.values(medias),
            backgroundColor: ['#ff3b3b','#ff6b6b','#ff8787','#ffd700','#b30000','#800000'],
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Medias da liga por partida', color: '#ffd700', font: { family: 'Archivo', size: 16, weight: '800' } } },
          scales: {
            y: { ticks: { color: '#ccc' }, grid: { color: '#1a1a1a' }, beginAtZero: true },
            x: { ticks: { color: '#ccc', font: { size: 12 } }, grid: { color: '#1a1a1a' } },
          },
        },
      });
    }

    // Grafico 3: Aproveitamento dos times (barra horizontal)
    const aproveitamento = [...times]
      .map((t) => ({ name: t.name, pct: t.played ? Math.round(((t.won * 3 + t.drawn) / (t.played * 3)) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8)
      .reverse();
    const ctx3 = document.getElementById('chartForma');
    if (ctx3) {
      charts.forma = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: aproveitamento.map((a) => a.name),
          datasets: [{
            label: 'Aproveitamento (%)',
            data: aproveitamento.map((a) => a.pct),
            backgroundColor: aproveitamento.map((a) => (a.pct >= 60 ? '#ff3b3b' : a.pct >= 40 ? '#ffd700' : '#800000')),
            borderRadius: 6,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Aproveitamento dos times', color: '#ffd700', font: { family: 'Archivo', size: 16, weight: '800' } } },
          scales: {
            x: { ticks: { color: '#ccc' }, grid: { color: '#1a1a1a' }, beginAtZero: true, max: 100 },
            y: { ticks: { color: '#ccc' }, grid: { color: '#1a1a1a' } },
          },
        },
      });
    }
  }).catch((e) => console.error('Erro graficos', e));
}

function destruirGraficos() {
  Object.values(charts).forEach((c) => { try { c.destroy(); } catch (_) {} });
  charts = {};
}

// ================= PWA install =================
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  modoInstalacao = e;
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Instalar GS Stats Football';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '1000';
  btn.addEventListener('click', async () => {
    await modoInstalacao.prompt();
    const res = await modoInstalacao.userChoice;
    if (res.outcome === 'accepted') console.log('PWA instalado');
    modoInstalacao = null;
    btn.remove();
  });
  document.body.appendChild(btn);
});

// Inicia
init();
