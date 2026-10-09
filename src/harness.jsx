// TEMPORARY visual harness (deleted after use): renders real pages with mock redux data, no login.
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "./theme.css";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";
import { onLogin, onSetMyTournaments, onSetNotifications, onSetPendingFriendRequests } from "./store/auth/authSlice";
import { onSetGames, onSetStandings, onSetSeries, onFormChange, onPushNumberOfTeams } from "./store/tourney/tourneySlice";
import { MainLayout } from "./layout/MainLayout/routes/MainLayoutRoutes";
import { Login } from "./auth/pages/Login";
import { Register } from "./auth/pages/Register";
import { ForgotPassoword } from "./auth/pages/ForgotPassoword";
import { ResetPassword } from "./auth/pages/ResetPassword";
import { AppSpinner } from "./ui/components/AppSpinner";

const params = new URLSearchParams(location.search);
const page = params.get("page");
const path = params.get("path") || "/";
const tid = Number(params.get("t") || 1);

const logo = (n) => `https://www.mlbstatic.com/team-logos/${110 + n}.svg`;
const names = ["Real Madrid", "FC Barcelona", "Manchester City", "Liverpool", "Paris Saint-Germain", "Bayern Munich", "Juventus", "Arsenal"];
const players = ["Maydel", "Carlos", "Alejandro", "Yoandry", "Roberto", "Luis", "Pedro", "Daniel"];
const team = (id, i) => ({ id, userName: players[i], teamName: names[i], logoUrl: logo(i + 1) });
const mk = (n, base) => Array.from({ length: n }, (_, i) => team(base + i, i));

const league = (teamsArr, mlb) => {
  const games = []; let id = 1;
  for (let i = 0; i < teamsArr.length; i++) for (let j = i + 1; j < teamsArr.length; j++) {
    [[i, j], [j, i]].forEach(([a, b]) => {
      const played = id % 3 !== 0;
      games.push({ id: id++, seriesId: null, team1: teamsArr[a], team2: teamsArr[b], score1: played ? (id % 5) + 1 : null, score2: played ? (id % 3) : null,
        pitcher1Name: mlb && played ? "Gerrit Cole" : null, pitcher2Name: mlb && played ? "Zack Wheeler" : null, tournamentRoundText: null });
    });
  }
  return games;
};
const knockout = (teamsArr) => {
  const g = (id, round, t1, t2, s1, s2, next, place) => ({ id, seriesId: null, tournamentRoundText: String(round), team1: t1, team2: t2, score1: s1, score2: s2, nextMatchId: next, nextMatchPlace: place, createdAt: new Date().toISOString() });
  return [
    g(7, 3, teamsArr[0], teamsArr[2], null, null, null, null),
    g(6, 2, teamsArr[2], teamsArr[4], 3, 1, 7, "away"), g(5, 2, teamsArr[0], teamsArr[1], 2, 0, 7, "home"),
    g(4, 1, teamsArr[6], teamsArr[7], 1, 2, 6, "away"), g(3, 1, teamsArr[4], teamsArr[5], 0, 3, 6, "home"),
    g(2, 1, teamsArr[2], teamsArr[3], 4, 1, 5, "away"), g(1, 1, teamsArr[0], teamsArr[1], 2, 0, 5, "home"),
  ];
};
const standingsOf = (teamsArr, games, seeds) => teamsArr.map((t, i) => ({
  teamId: t.id, team: t, gamesPlayed: 6, wins: 5 - i, draws: 1, losses: i, goalsScored: 20 - i, goalsConceded: 8 + i, runDiff: 12 - 2 * i,
  points: 3 * (5 - i) + 1, playoffSeed: seeds && i < seeds ? i + 1 : null,
  lastFiveGameResults: ["W", "W", "D", "L", "W"].map((v) => ({ value: v, playedAt: null })),
}));

const T4 = mk(4, 100), T8 = mk(8, 200), T5 = mk(5, 300);
const tourneys = [
  { id: 1, tournamentName: "Friday FIFA League with a long name", type: 1, sport: 1, uniqueId: "11111111-aaaa", teams: T4, sharedAdmins: [], sharedGuests: [], gamesPlayed: 8, gamesTotal: 12, status: "In progress.......", createdAt: new Date().toISOString() },
  { id: 2, tournamentName: "FIFA Cup", type: 2, sport: 1, uniqueId: "22222222-aaaa", teams: T8, sharedAdmins: [], sharedGuests: [], gamesPlayed: 6, gamesTotal: 7, status: "In progress.......", createdAt: new Date().toISOString() },
  { id: 3, tournamentName: "MLB League", type: 1, sport: 2, uniqueId: "33333333-aaaa", teams: T4, sharedAdmins: [], sharedGuests: [], gamesPlayed: 8, gamesTotal: 12, status: "In progress.......", createdAt: new Date().toISOString() },
  { id: 4, tournamentName: "MLB Season 2026", type: 3, sport: 2, uniqueId: "44444444-aaaa", teams: T5, playoffTeams: 5, bestOf: 3, sharedAdmins: [], sharedGuests: [], gamesPlayed: 8, gamesTotal: 10, status: "In progress.......", createdAt: new Date().toISOString() },
];

const user = { id: "00000000-0000-0000-0000-0000000000a1", fullName: "Maydel Rego", nickname: "maydelrego1234", avatar: "https://ui-avatars.com/api/?name=Maydel+Rego&background=0D8ABC&color=fff&size=128&rounded=true", friends: [
  { id: "f1", fullName: "Carlos Perez", nickname: "carlosperez4321", avatar: "https://ui-avatars.com/api/?name=Carlos+Perez&rounded=true", online: true },
  { id: "f2", fullName: "Alejandro Diaz", nickname: "alejandrodiaz1111", avatar: "https://ui-avatars.com/api/?name=Alejandro+Diaz&rounded=true", online: false } ] };
store.dispatch(onLogin(user));
store.dispatch(onSetMyTournaments(tourneys));
store.dispatch(onSetNotifications([
  { id: 1, type: "friend_request", read: false, createdAt: new Date().toISOString(), meta: 5, sender: { fullName: "Luis Gomez" } },
  { id: 2, type: "friend_request", read: false, createdAt: new Date().toISOString(), meta: 6, sender: { fullName: "Pedro Ruiz" } } ]));
store.dispatch(onSetPendingFriendRequests([{ id: 9, receiver: { fullName: "Daniel Soto", avatar: "https://ui-avatars.com/api/?name=Daniel+Soto&rounded=true" } }]));

if (params.get("form") === "season") {
  store.dispatch(onFormChange({ name: "tournamentName", value: "My Season" }));
  store.dispatch(onFormChange({ name: "sport", value: 2 }));
  store.dispatch(onFormChange({ name: "type", value: 3 }));
  store.dispatch(onPushNumberOfTeams(5));
  store.dispatch(onFormChange({ name: "teamName", value: { name: "New York Yankees", logo: logo(7) }, index: 0 }));
  store.dispatch(onFormChange({ name: "playerName", value: "Maydel", index: 0 }));
}
const tournament = tourneys.find((t) => t.id === tid);
if (tid === 1) { const gm = league(T4, false); store.dispatch(onSetGames(gm)); store.dispatch(onSetStandings(standingsOf(T4, gm))); }
if (tid === 2) { const gm = knockout(T8); store.dispatch(onSetGames(gm)); store.dispatch(onSetStandings(standingsOf(T8, gm))); }
if (tid === 3) { const gm = league(T4, true); store.dispatch(onSetGames(gm)); store.dispatch(onSetStandings(standingsOf(T4, gm))); }
if (tid === 4) {
  const gm = league(T5, true).filter((_, i) => i % 2 === 0).map((x) => ({ ...x, seriesId: null }));
  const series = [
    { id: 1, round: 1, slot: 1, bestOf: 3, team1: T5[3], team2: T5[4], seed1: 4, seed2: 5, wins1: 1, wins2: 2, winnerId: T5[4].id, nextSeriesId: 3 },
    { id: 2, round: 2, slot: 1, bestOf: 3, team1: T5[1], team2: T5[2], seed1: 2, seed2: 3, wins1: 1, wins2: 0, winnerId: null, nextSeriesId: 4 },
    { id: 3, round: 2, slot: 0, bestOf: 3, team1: T5[0], team2: T5[4], seed1: 1, seed2: 5, wins1: 0, wins2: 0, winnerId: null, nextSeriesId: 4 },
    { id: 4, round: 3, slot: 0, bestOf: 3, team1: null, team2: null, seed1: null, seed2: null, wins1: 0, wins2: 0, winnerId: null, nextSeriesId: null } ];
  const sg = [
    { id: 101, seriesId: 1, gameNumber: 1, team1: T5[3], team2: T5[4], score1: 5, score2: 2 }, { id: 102, seriesId: 1, gameNumber: 2, team1: T5[3], team2: T5[4], score1: 1, score2: 3 }, { id: 103, seriesId: 1, gameNumber: 3, team1: T5[3], team2: T5[4], score1: 2, score2: 6 },
    { id: 104, seriesId: 2, gameNumber: 1, team1: T5[1], team2: T5[2], score1: 4, score2: 1, pitcher1Name: "Gerrit Cole", pitcher2Name: "Zack Wheeler" }, { id: 105, seriesId: 2, gameNumber: 2, team1: T5[1], team2: T5[2], score1: null, score2: null },
    { id: 106, seriesId: 3, gameNumber: 1, team1: T5[0], team2: T5[4], score1: null, score2: null } ];
  store.dispatch(onSetGames([...gm, ...sg])); store.dispatch(onSetSeries(series));
  store.dispatch(onSetStandings(standingsOf(T5, gm, 5)));
}

const Loading = () => { const { loading } = useSelector((s) => s.ui); return loading ? <AppSpinner loading={loading} /> : null; };
const entry = { pathname: path, state: tournament };

const authPage = { login: <Login />, register: <Register />, forgot: <ForgotPassoword />, reset: <ResetPassword /> }[page];

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <MemoryRouter initialEntries={[entry]}>
      <PrimeReactProvider>
        {authPage ?? (<Routes><Route path="/*" element={<MainLayout />} /></Routes>)}
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      </PrimeReactProvider>
    </MemoryRouter>
  </Provider>
);

window.__overflow = () => {
  const vw = document.documentElement.clientWidth; const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) { if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowX)) { clipped = true; break; } p = p.parentElement; }
      if (!clipped) out.push(`${el.tagName}.${String(el.className?.baseVal ?? el.className).split(" ").slice(0, 3).join(".")} L${Math.round(r.left)} R${Math.round(r.right)}`.slice(0, 80));
    }
  });
  return { vw, scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, count: out.length, first: out.slice(0, 8) };
};
