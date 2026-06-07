// 2026 FIFA World Cup predictor data.
// Replace teams, players and questions here if needed.
const GROUPS = {
  A: ['Mexico','South Africa','South Korea','Czech Republic'],
  B: ['Canada','Bosnia and Herzegovina','Qatar','Switzerland'],
  C: ['Brazil','Morocco','Haiti','Scotland'],
  D: ['United States','Paraguay','Australia','Turkey'],
  E: ['Germany','Curaçao','Ivory Coast','Ecuador'],
  F: ['Netherlands','Japan','Sweden','Tunisia'],
  G: ['Belgium','Egypt','Iran','New Zealand'],
  H: ['Spain','Cape Verde','Saudi Arabia','Uruguay'],
  I: ['France','Senegal','Iraq','Norway'],
  J: ['Argentina','Algeria','Austria','Jordan'],
  K: ['Portugal','DR Congo','Uzbekistan','Colombia'],
  L: ['England','Croatia','Ghana','Panama']
};

const PLAYER_TIERS = {
  elite: [
    'Haaland (Norway)',
    'Havertz (Germany)',
    'Kane (England)',
    'Mbappe (France)',
    'Messi (Argentina)',
    'Raphinha (Brazil)',
    'Ronaldo (Portugal)',
    'Yamal (Spain)'
  ],
  tier1: [
    'Alvarez (Argentina)',
    'De Ketelaere (Belgium)',
    'Dembele (France)',
    'Depay (Netherlands)',
    'Doku (Belgium)',
    'Fernandes (Portugal)',
    'Gakpo (Netherlands)',
    'Musiala (Germany)',
    'Oyarzabal (Spain)',
    'Vinicius Junior (Brazil)'
  ],
  tier2: [
    'Arnautovic (Austria)',
    'Balogun (USA)',
    'Diaz (Columbia)',
    'Embolo (Switzerland)',
    'Gyokeres (Sweden)',
    'Jimenez (Mexico)',
    'Nunez (Uruguay)',
    'Salah (Egypt)',
    'Son Heung-min (South Korea)',
    'Ueda (Japan)'
  ],
  tier3: [
    'Ali (Qatar)',
    'Amoura (Algeria)',
    'Aubemeyang (Gabon)',
    'Chris Wood (New Zealand)',
    'David (Canada)',
    'Hussein (Iraq)',
    'McTominay (Scotland)',
    'Miguelito (Bolivia)',
    'Olwan (Jordan)',
    'Valencia (Ecuador)'
  ]
};


const TEAM_FLAGS = {
  'Mexico':'🇲🇽', 'South Africa':'🇿🇦', 'South Korea':'🇰🇷', 'Czech Republic':'🇨🇿',
  'Canada':'🇨🇦', 'Bosnia and Herzegovina':'🇧🇦', 'Qatar':'🇶🇦', 'Switzerland':'🇨🇭',
  'Brazil':'🇧🇷', 'Morocco':'🇲🇦', 'Haiti':'🇭🇹', 'Scotland':'🏴',
  'United States':'🇺🇸', 'Paraguay':'🇵🇾', 'Australia':'🇦🇺', 'Turkey':'🇹🇷',
  'Germany':'🇩🇪', 'Curaçao':'🇨🇼', 'Ivory Coast':'🇨🇮', 'Ecuador':'🇪🇨',
  'Netherlands':'🇳🇱', 'Japan':'🇯🇵', 'Sweden':'🇸🇪', 'Tunisia':'🇹🇳',
  'Belgium':'🇧🇪', 'Egypt':'🇪🇬', 'Iran':'🇮🇷', 'New Zealand':'🇳🇿',
  'Spain':'🇪🇸', 'Cape Verde':'🇨🇻', 'Saudi Arabia':'🇸🇦', 'Uruguay':'🇺🇾',
  'France':'🇫🇷', 'Senegal':'🇸🇳', 'Iraq':'🇮🇶', 'Norway':'🇳🇴',
  'Argentina':'🇦🇷', 'Algeria':'🇩🇿', 'Austria':'🇦🇹', 'Jordan':'🇯🇴',
  'Portugal':'🇵🇹', 'DR Congo':'🇨🇩', 'Uzbekistan':'🇺🇿', 'Colombia':'🇨🇴',
  'England':'🏴', 'Croatia':'🇭🇷', 'Ghana':'🇬🇭', 'Panama':'🇵🇦'
};

const BONUS_QUESTIONS = [
  {
    id: 'first_knocked_out',
    label: 'First big team to get knocked out',
    type: 'select',
    options: ['Argentina','Brazil','England','France','Germany','Netherlands','Portugal','Spain']
  },
  {
    id: 'minnow_furthest',
    label: 'Minnow to get furthest',
    type: 'select',
    options: ['Cape Verde','Curacao','Haiti','Iraq','Jordan','Panama','Qatar','Uzbekistan']
  },
  {
    id: 'red_card_team',
    label: 'Name a team to get a red card',
    type: 'select',
    optionsFrom: 'teams'
  },
  {
    id: 'england_penalty_miss',
    label: 'England player to miss a penalty',
    type: 'text',
    placeholder: 'Enter player name'
  },
  {
    id: 'golden_glove',
    label: 'Golden Glove',
    type: 'text',
    placeholder: 'Enter goalkeeper name'
  },
  {
    id: 'elite_striker_fewest_goals',
    label: 'Elite striker with fewest goals',
    type: 'select',
    optionsFrom: 'elite'
  },
  {
    id: 'average_goals_per_game',
    label: 'Average goals per game',
    type: 'number',
    step: '0.01',
    min: '0',
    placeholder: 'Two decimal places e.g. 1.84'
  },
  {
    id: 'trump_truthsocial_posts',
    label: 'How many TruthSocial posts will Trump do during the World Cup disparaging the England football team?',
    type: 'number',
    step: '1',
    min: '0',
    placeholder: 'Enter a number'
  }
];

function buildGroupMatches() {
  const pairings = [[0,1],[2,3],[3,1],[0,2],[3,0],[1,2]];
  const matches = [];
  for (const [group, teams] of Object.entries(GROUPS)) {
    pairings.forEach(([a,b], idx) => matches.push({
      id: `${group}${idx + 1}`,
      group,
      home: teams[a],
      away: teams[b]
    }));
  }
  return matches;
}

const MATCHES = buildGroupMatches();
const ALL_TEAMS = Object.values(GROUPS).flat();
