/**
 * GS Stats Football - Lista abrangente de ligas/campeonatos do mundo (A a Z)
 * Dados gratuitos e de exemplo. Estrutura pronta para receber dados de API real.
 */
const leagues = [
  // A
  { name: 'Primeira División', country: 'Argentina', code: 'AR', level: 1, season: '2025' },
  { name: 'Primera B Nacional', country: 'Argentina', code: 'AR', level: 2, season: '2025' },
  { name: 'Bundesliga', country: 'Áustria', code: 'AT', level: 1, season: '2025/26' },
  { name: '2. Liga', country: 'Áustria', code: 'AT', level: 2, season: '2025/26' },
  { name: 'Premyer Liqası', country: 'Azerbaijão', code: 'AZ', level: 1, season: '2025/26' },

  // B
  { name: 'Jupiler Pro League', country: 'Bélgica', code: 'BE', level: 1, season: '2025/26' },
  { name: 'Proximus League', country: 'Bélgica', code: 'BE', level: 2, season: '2025/26' },
  { name: 'Premier League', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Série B', country: 'Brasil', code: 'BR', level: 2, season: '2025' },
  { name: 'Série C', country: 'Brasil', code: 'BR', level: 3, season: '2025' },
  { name: 'Série D', country: 'Brasil', code: 'BR', level: 4, season: '2025' },
  { name: 'Campeonato Estadual', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Premiership', country: 'Bulgária', code: 'BG', level: 1, season: '2025/26' },

  // C
  { name: 'Primera División', country: 'Chile', code: 'CL', level: 1, season: '2025' },
  { name: 'Primera B', country: 'Chile', code: 'CL', level: 2, season: '2025' },
  { name: 'Superliga', country: 'China', code: 'CN', level: 1, season: '2025' },
  { name: 'Liga 1', country: 'Colômbia', code: 'CO', level: 1, season: '2025' },
  { name: 'Liga II', country: 'Colômbia', code: 'CO', level: 2, season: '2025' },
  { name: 'First Football League', country: 'Croácia', code: 'HR', level: 1, season: '2025/26' },
  { name: 'Cyprus First Division', country: 'Chipre', code: 'CY', level: 1, season: '2025/26' },
  { name: 'Czech First League', country: 'República Tcheca', code: 'CZ', level: 1, season: '2025/26' },

  // D
  { name: 'Danish Superliga', country: 'Dinamarca', code: 'DK', level: 1, season: '2025/26' },
  { name: '1. Division', country: 'Dinamarca', code: 'DK', level: 2, season: '2025/26' },
  { name: 'Eredivisie', country: 'Holanda', code: 'NL', level: 1, season: '2025/26' },
  { name: 'Eerste Divisie', country: 'Holanda', code: 'NL', level: 2, season: '2025/26' },

  // E
  { name: 'Premier League', country: 'Escócia', code: 'SCO', level: 1, season: '2025/26' },
  { name: 'Championship', country: 'Escócia', code: 'SCO', level: 2, season: '2025/26' },
  { name: 'LaLiga', country: 'Espanha', code: 'ES', level: 1, season: '2025/26' },
  { name: 'LaLiga 2', country: 'Espanha', code: 'ES', level: 2, season: '2025/26' },
  { name: 'Primeira División RFEF', country: 'Espanha', code: 'ES', level: 3, season: '2025/26' },
  { name: 'Ekstraklasa', country: 'Estónia', code: 'EE', level: 1, season: '2025' },

  // F
  { name: 'Veikkausliiga', country: 'Finlândia', code: 'FI', level: 1, season: '2025' },
  { name: 'Ykkösliiga', country: 'Finlândia', code: 'FI', level: 2, season: '2025' },
  { name: 'Ligue 1', country: 'França', code: 'FR', level: 1, season: '2025/26' },
  { name: 'Ligue 2', country: 'França', code: 'FR', level: 2, season: '2025/26' },
  { name: 'National', country: 'França', code: 'FR', level: 3, season: '2025/26' },

  // G
  { name: 'Bundesliga', country: 'Alemanha', code: 'DE', level: 1, season: '2025/26' },
  { name: '2. Bundesliga', country: 'Alemanha', code: 'DE', level: 2, season: '2025/26' },
  { name: '3. Liga', country: 'Alemanha', code: 'DE', level: 3, season: '2025/26' },
  { name: 'Super League', country: 'Grécia', code: 'GR', level: 1, season: '2025/26' },
  { name: 'Super League 2', country: 'Grécia', code: 'GR', level: 2, season: '2025/26' },

  // H
  { name: 'Primeira Liga', country: 'Hungria', code: 'HU', level: 1, season: '2025/26' },

  // I
  { name: 'Serie A', country: 'Irlanda', code: 'IE', level: 1, season: '2025' },
  { name: 'Serie A', country: 'Islândia', code: 'IS', level: 1, season: '2025' },
  { name: 'Serie A', country: 'Israel', code: 'IL', level: 1, season: '2025/26' },
  { name: 'Serie A', country: 'Itália', code: 'IT', level: 1, season: '2025/26' },
  { name: 'Serie B', country: 'Itália', code: 'IT', level: 2, season: '2025/26' },
  { name: 'Serie C', country: 'Itália', code: 'IT', level: 3, season: '2025/26' },

  // J
  { name: 'J1 League', country: 'Japão', code: 'JP', level: 1, season: '2025' },
  { name: 'J2 League', country: 'Japão', code: 'JP', level: 2, season: '2025' },
  { name: 'J3 League', country: 'Japão', code: 'JP', level: 3, season: '2025' },
  { name: 'Qatar Stars League', country: 'Jordânia', code: 'JO', level: 1, season: '2025/26' },

  // L
  { name: 'Premier League', country: 'Cazaquistão', code: 'KZ', level: 1, season: '2025' },
  { name: 'K League 1', country: 'Coreia do Sul', code: 'KR', level: 1, season: '2025' },
  { name: 'K League 2', country: 'Coreia do Sul', code: 'KR', level: 2, season: '2025' },
  { name: 'Premiership', country: 'Kuwait', code: 'KW', level: 1, season: '2025/26' },
  { name: 'Premier League', country: 'Líbano', code: 'LB', level: 1, season: '2025/26' },
  { name: 'Superliga', country: 'Letônia', code: 'LV', level: 1, season: '2025' },
  { name: 'Ligue 1', country: 'Luxemburgo', code: 'LU', level: 1, season: '2025/26' },

  // M
  { name: 'Primeira División', country: 'México', code: 'MX', level: 1, season: '2025/26' },
  { name: 'Liga de Expansión MX', country: 'México', code: 'MX', level: 2, season: '2025/26' },
  { name: 'Premier League', country: 'Malásia', code: 'MY', level: 1, season: '2025' },
  { name: 'Premier Division', country: 'Malta', code: 'MT', level: 1, season: '2025/26' },
  { name: 'Primera División', country: 'Marrocos', code: 'MA', level: 1, season: '2025/26' },

  // N
  { name: 'Premiership', country: 'Irlanda do Norte', code: 'IE', level: 1, season: '2025/26' },
  { name: 'Eliteserien', country: 'Noruega', code: 'NO', level: 1, season: '2025' },
  { name: 'OBOS-ligaen', country: 'Noruega', code: 'NO', level: 2, season: '2025' },

  // O
  { name: 'Primeira Liga', country: 'Portugal', code: 'PT', level: 1, season: '2025/26' },
  { name: 'Liga Portugal 2', country: 'Portugal', code: 'PT', level: 2, season: '2025/26' },

  // P
  { name: 'Super League', country: 'Países Baixos', code: 'NL', level: 1, season: '2025/26' },
  { name: 'Campeonato Paulista', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Campeonato Carioca', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Campeonato Mineiro', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Campeonato Gaúcho', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Campeonato Baiano', country: 'Brasil', code: 'BR', level: 1, season: '2025' },
  { name: 'Campeonato Pernambucano', country: 'Brasil', code: 'BR', level: 1, season: '2025' },

  // Q
  { name: 'Qatar Stars League', country: 'Catar', code: 'QA', level: 1, season: '2025/26' },

  // R
  { name: 'Premier League', country: 'República Tcheca', code: 'CZ', level: 1, season: '2025/26' },
  { name: 'Premier Division', country: 'Reprezentacja', code: 'PL', level: 1, season: '2025/26' },
  { name: 'Premier League', country: 'Romênia', code: 'RO', level: 1, season: '2025/26' },
  { name: 'Liga 2', country: 'Romênia', code: 'RO', level: 2, season: '2025/26' },
  { name: 'Premier League', country: 'Rússia', code: 'RU', level: 1, season: '2025/26' },

  // S
  { name: 'Premiership', country: 'Escócia', code: 'SCO', level: 1, season: '2025/26' },
  { name: 'Série A', country: 'Sérvia', code: 'RS', level: 1, season: '2025/26' },
  { name: 'Prva Liga', country: 'Sérvia', code: 'RS', level: 2, season: '2025/26' },
  { name: 'Superliga', country: 'Suécia', code: 'SE', level: 1, season: '2025' },
  { name: 'Superettan', country: 'Suécia', code: 'SE', level: 2, season: '2025' },
  { name: 'Super League', country: 'Suíça', code: 'CH', level: 1, season: '2025/26' },
  { name: 'Challenge League', country: 'Suíça', code: 'CH', level: 2, season: '2025/26' },
  { name: 'Saudi Pro League', country: 'Arábia Saudita', code: 'SA', level: 1, season: '2025/26' },
  { name: 'First Division League', country: 'Arábia Saudita', code: 'SA', level: 2, season: '2025/26' },
  { name: 'Primera División', country: 'Senegal', code: 'SN', level: 1, season: '2024/25' },

  // T
  { name: 'Premier League', country: 'Tailândia', code: 'TH', level: 1, season: '2025/26' },
  { name: 'Süper Lig', country: 'Turquia', code: 'TR', level: 1, season: '2025/26' },
  { name: '1. Lig', country: 'Turquia', code: 'TR', level: 2, season: '2025/26' },

  // U
  { name: 'Premier League', country: 'Ucrânia', code: 'UA', level: 1, season: '2025/26' },
  { name: 'Premier League', country: 'Uruguai', code: 'UY', level: 1, season: '2025' },
  { name: 'Segunda División', country: 'Uruguai', code: 'UY', level: 2, season: '2025' },

  // V
  { name: 'Vietnamese League', country: 'Vietnã', code: 'VN', level: 1, season: '2025' },

  // W
  { name: 'Premiership', country: 'País de Gales', code: 'WL', level: 1, season: '2025/26' },

  // X
  { name: 'Superliga', country: 'Chipre do Norte', code: 'XC', level: 1, season: '2025/26' },

  // Y
  { name: 'Yemen League', country: 'Iêmen', code: 'YE', level: 1, season: '2025/26' },

  // Z
  { name: 'Zambian Premier League', country: 'Zâmbia', code: 'ZM', level: 1, season: '2025' },
  { name: 'Premier Soccer League', country: 'Zimbábue', code: 'ZW', level: 1, season: '2025' },
];

module.exports = { leagues };
