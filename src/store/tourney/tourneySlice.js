import { createSlice } from '@reduxjs/toolkit';

export const tourneySlice = createSlice({
    name: 'tourney',
    initialState: {
        name: '',
        type: '',
        players: 2,
        games: 1,
        filteredCountries: [],
        teams: [],
        typeOptions : [
            { name: "League", code: 1 },
            { name: "Cup", code: 2 },
          ],
    },
    reducers: {
        onCreateTourney: (state, /* action */ ) => {
            state.counter += 1;
        },
        onSetfilteredCountries: (state, { payload } ) => {
            state.filteredCountries = payload
        },
        onSetName: (state, { payload } ) => {
            state.name = payload
        },
        onSetType: (state, { payload } ) => {
            state.type = payload
        },
        onAddPlayer: ( state ) => {
            state.players = state.players + 1
        },
        onAddGame: ( state ) => {
            state.games =  state.games + 1
        },
        onRemovePlayer: ( state ) => {
            state.players = state.players - 1
        },
        onRemoveGame: ( state ) => {
            state.games =  state.games - 1
        },
    }
});
// Action creators are generated for each case reducer function
export const { 
    onSetfilteredCountries,
    onAddGame,
    onAddPlayer,
    onRemoveGame,
    onRemovePlayer,
    onSetType
 } = tourneySlice.actions;