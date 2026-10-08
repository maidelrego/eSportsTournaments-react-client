import axios from "axios";

// Free public MLB Stats API: no key, CORS enabled. A team in MLB The Show is a real MLB club.
const MLB_API = "https://statsapi.mlb.com/api/v1";
const mlbLogo = (teamId) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
export const mlbHeadshotUrl = (playerId) =>
  `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_60,q_auto:best/v1/people/${playerId}/headshot/67/current`;

let teamsPromise = null;

const loadMlbTeams = () => {
  if (!teamsPromise) {
    teamsPromise = axios
      .get(`${MLB_API}/teams?sportId=1&activeStatus=Y`)
      .then(({ data }) =>
        data.teams
          .map((team) => ({
            id: team.id,
            name: team.name,
            abbreviation: team.abbreviation,
            logo: mlbLogo(team.id),
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      .catch((error) => {
        teamsPromise = null; // allow a retry on the next search
        throw error;
      });
  }
  return teamsPromise;
};

// Same { name, logo } shape the football search returns.
export const searchMlbTeams = async (query = "") => {
  const teams = await loadMlbTeams();
  const q = query.trim().toLowerCase();
  const filtered = q
    ? teams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
          team.abbreviation.toLowerCase() === q
    )
    : teams;
  return filtered.map(({ name, logo }) => ({ name, logo }));
};

const isPitcher = (abbreviation) => ["P", "TWP"].includes(abbreviation);

// Diamond Dynasty lineups are built from any card (current players, prospects, legends),
// so pitchers are searched across all of MLB history, not by club.
export const searchPitchers = async (query = "") => {
  const q = query.trim();
  if (q.length < 2) return [];

  const { data } = await axios.get(`${MLB_API}/people/search`, {
    params: { names: q, hydrate: "currentTeam" },
  });

  const seen = new Set();
  return (data.people ?? [])
    .filter((person) => {
      if (!isPitcher(person.primaryPosition?.abbreviation) || seen.has(person.id)) {
        return false;
      }
      seen.add(person.id);
      return true;
    })
    .map((person) => {
      const team = person.currentTeam?.name ?? "";
      return {
        id: person.id,
        name: person.fullName,
        team: person.active ? team : `${team} (retired)`.trim(),
        photo: mlbHeadshotUrl(person.id),
      };
    });
};
