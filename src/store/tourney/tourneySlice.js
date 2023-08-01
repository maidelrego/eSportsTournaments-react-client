import { createSlice } from "@reduxjs/toolkit";


export const tourneySlice = createSlice({
  name: "tourney",
  initialState: {
    tournamentName: "",
    type: null,
    numberOfTeams: null,
    sport: null,
    players: 2,
    games: 1,
    gamesList: [],
    standings: [],
    teams: [
      {
        playerName: "",
        teamName: "",
        logoUrl: "",
      },
      {
        playerName: "",
        teamName: "",
        logoUrl: "",
      },
    ],
  },
  reducers: {
    onFormChange: (state, { payload }) => {
      const { name, value, index } = payload;

      if (index === undefined) {
        state[name] = value;
        return;
      } else {
        state.teams[index][name] =  value.name ? value.name : value,
        state.teams[index].logoUrl = value.logo;
      }
    },
    onPushNumberOfTeams: (state, { payload }) => {
      state.teams = [];
      for (let i = 0; i < payload; i++) {
        state.teams.push({
          playerName: "",
          teamName: "",
          logoUrl: "",
        });
      }
      state.players = payload;
    },
    onIncrementTeams: (state, { payload }) => {
      state.teams.push(payload);
    },
    onDecrementTeams: (state) => {
      state.teams.pop();
    },
    onAddPlayer: (state) => {
      state.players = state.players + 1;
    },
    onRemovePlayer: (state) => {
      state.players = state.players - 1;
    },
    onAddGame: (state) => {
      state.games = state.games + 1;
    },
    onRemoveGame: (state) => {
      state.games = state.games - 1;
    },
    onSetGames: (state, {payload}) => {
      state.gamesList = payload;
    },
    onSetStandings: (state, {payload}) => {
      state.standings = payload;
    },
    initGamesById: (state, {payload}) => {
      const index = state.gamesList.findIndex(game => game.id === payload.id);

      if (index === -1) {
        console.log('GAME NOT FOUND TO SET BY ID', payload)
      }
      state.gamesList[index] = payload;
    },
    onResetState: (state) => {
      state.tournamentName = "";
      state.type = null;
      state.sport = null;
      state.players = 2;
      state.games = 1;
      state.teams = [
        {
          playerName: "",
          teamName: "",
          logoUrl: "",
        },
        {
          playerName: "",
          teamName: "",
          logoUrl: "",
        },
      ];
    },
  },
});
// Action creators are generated for each case reducer function
export const {
  onFormChange,
  onDecrementTeams,
  onIncrementTeams,
  onAddGame,
  onAddPlayer,
  onRemoveGame,
  onRemovePlayer,
  onResetState,
  onSetGames,
  initGamesById,
  onSetStandings,
  onPushNumberOfTeams,
} = tourneySlice.actions;
