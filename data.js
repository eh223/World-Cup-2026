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
  elite: ['Elite Player 1','Elite Player 2','Elite Player 3','Elite Player 4','Elite Player 5','Elite Player 6','Elite Player 7','Elite Player 8','Elite Player 9','Elite Player 10','Elite Player 11','Elite Player 12'],
  tier1: ['Tier 1 Player 1','Tier 1 Player 2','Tier 1 Player 3','Tier 1 Player 4','Tier 1 Player 5','Tier 1 Player 6','Tier 1 Player 7','Tier 1 Player 8','Tier 1 Player 9','Tier 1 Player 10','Tier 1 Player 11','Tier 1 Player 12'],
  tier2: ['Tier 2 Player 1','Tier 2 Player 2','Tier 2 Player 3','Tier 2 Player 4','Tier 2 Player 5','Tier 2 Player 6','Tier 2 Player 7','Tier 2 Player 8','Tier 2 Player 9','Tier 2 Player 10','Tier 2 Player 11','Tier 2 Player 12'],
  tier3: ['Tier 3 Player 1','Tier 3 Player 2','Tier 3 Player 3','Tier 3 Player 4','Tier 3 Player 5','Tier 3 Player 6','Tier 3 Player 7','Tier 3 Player 8','Tier 3 Player 9','Tier 3 Player 10','Tier 3 Player 11','Tier 3 Player 12']
};

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
