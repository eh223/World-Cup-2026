// 2026 FIFA World Cup predictor data.
// Groups/fixtures based on the Wikipedia 2026 FIFA World Cup page checked 6 June 2026.
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

const PLAYER_CHOICES = [
  'Kylian Mbappé','Harry Kane','Lionel Messi','Cristiano Ronaldo','Erling Haaland','Vinícius Júnior','Jude Bellingham','Jamal Musiala',
  'Lamine Yamal','Raphinha','Lautaro Martínez','Álvaro Morata','Mohamed Salah','Robert Lewandowski','Other player - add in bonus notes'
];

const BONUS_QUESTIONS = [
  'Who will win the tournament?',
  'Who will be runner-up?',
  'Who will finish third?',
  'Which team will be the biggest surprise?',
  'Which team will be the biggest disappointment?',
  'Who will be top goalscorer?',
  'How many goals will be scored in the final?',
  'Will there be a penalty shootout in the final?',
  'Which team will receive the most cards?',
  'Tie-breaker: total goals in the tournament?'
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
