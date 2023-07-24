import { createSlice } from "@reduxjs/toolkit";
import { tournamentTypeOptions, sportTypeOptions } from "../../lib/formSelections";

export const tourneySlice = createSlice({
  name: "tourney",
  initialState: {
    name: "",
    type: null,
    sport: null,
    players: 2,
    games: 1,
    filteredCountries: [],
    teams: [],
    tourneyTypeOptions: tournamentTypeOptions,
    sportTypeOptions: sportTypeOptions
  },
  reducers: {
    onCreateTourney: (state /* action */) => {
      state.counter += 1;
    },
    onSetfilteredCountries: (state, { payload }) => {
      state.filteredCountries = payload;
    },
    onSetName: (state, { payload }) => {
      state.name = payload;
    },
    onSetType: (state, { payload }) => {
      state.type = payload;
    },
    onSetSport: (state, { payload }) => {
      state.sport = payload;
    },
    onAddPlayer: (state) => {
      state.players = state.players + 1;
    },
    onAddGame: (state) => {
      state.games = state.games + 1;
    },
    onRemovePlayer: (state) => {
      state.players = state.players - 1;
    },
    onRemoveGame: (state) => {
      state.games = state.games - 1;
    },
    onResetState: (state) => {
      state.name = "";
      state.type = null;
      state.sport = null;
      state.players = 2;
      state.games = 1;
    },
  },
});
// Action creators are generated for each case reducer function
export const {
  onSetfilteredCountries,
  onAddGame,
  onAddPlayer,
  onRemoveGame,
  onRemovePlayer,
  onSetType,
  onSetSport,
  onResetState
} = tourneySlice.actions;
