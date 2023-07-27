import { createSlice } from "@reduxjs/toolkit";


export const tourneySlice = createSlice({
  name: "tourney",
  initialState: {
    tournamentName: "",
    type: null,
    sport: null,
    players: 2,
    games: 1,
    gamesList: [],
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
  onSetGames
} = tourneySlice.actions;
