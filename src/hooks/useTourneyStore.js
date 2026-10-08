import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { onResetState, onSetGames, onSetGamePitcher, onSetStandings, onPushNumberOfTeams, onResetGamesList, onResetStandings } from "../store/tourney/tourneySlice";
import { supabase } from "../services/supabase";
import { mapGame, mapStanding } from "../services/mappers";
import { searchMlbTeams } from "../services/mlbApi";
import { useNavigate } from "react-router-dom";
import { restartTournamentData } from "../helper/restartTournamentData";
import { useUIStore } from "./useUIStore";
import { SPORT } from "../lib/formSelections";

export const useTourneyStore = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    startLoading,
    startErrorToast,
    startSuccessToast,
  } = useUIStore();
  const { tournamentName, sport, type, numberOfTeams, players, games, teams, gamesList, standings } =
    useSelector((state) => state.tourney);

  const searchFootballTeams = async (query) => {
    const headers = {
      "x-rapidapi-key": import.meta.env.VITE_FOOTBALL_API_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io",
    };

    const teams = await axios.get(
      `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(query)}`,
      { headers }
    );

    return teams.data.response.map((team) => ({
      name: team.team.name,
      logo: team.team.logo,
    }));
  };

  const startSearchTeam = async (query, selectedSport = SPORT.FIFA) => {
    try {
      return selectedSport === SPORT.MLB
        ? await searchMlbTeams(query)
        : await searchFootballTeams(query);
    } catch (error) {
      console.error("Team search failed", error);
      startErrorToast("Could not load teams, try again");
      return [];
    }
  };

  const startSaveTourney = async( data, restart = false ) => {
    startLoading(true);
    const { error } = await supabase.rpc("create_tournament", {
      p_name: data.tournamentName,
      p_type: data.type,
      p_sport: data.sport,
      p_teams: data.teams,
    });
    startLoading(false);

    if (error) return startErrorToast(error.message);

    dispatch(onResetState());
    startSuccessToast('Tournament saved successfully!');
    if (!restart) {
      navigate('/my-tourneys');
    }
  }

  const startDeleteTourney = async( id ) => {
    startLoading(true);
    const { data, error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", id)
      .select("id");
    startLoading(false);

    if (error) return startErrorToast(error.message);
    if (!data.length) return startErrorToast("You are not allowed to delete this tournament");
    startSuccessToast('Tournament deleted successfully!');
  }

  const startGetGamesByTournament = async( id ) => {
    startLoading(true);
    const { data, error } = await supabase
      .from("games")
      .select("*, team1:teams!team1_id(*), team2:teams!team2_id(*)")
      .eq("tournament_id", id)
      .order("id", { ascending: false });
    startLoading(false);

    if (error) return startErrorToast(error.message);
    dispatch(onSetGames(data.map(mapGame)));
  }

  const startGetTournamentStandings = async ( id ) => {
    startLoading(true);
    const { data, error } = await supabase.rpc("get_tournament_standings", {
      p_tournament_id: id,
    });
    startLoading(false);

    if (error) return startErrorToast(error.message);
    dispatch(onSetStandings(data.map(mapStanding)));
  }

  const startSaveGames = async( id, game ) => {
    startLoading(true);
    const { error } = await supabase.rpc("save_game_result", {
      p_game_id: id,
      p_score1: game.score1,
      p_score2: game.score2,
    });
    startLoading(false);

    if (error) return startErrorToast(error.message);
    startSuccessToast('Game saved successfully!');
  }

  // side: 1 = team1 (home), 2 = team2 (away). A blank name clears the pitcher.
  const startSetGamePitcher = async (gameId, side, name, pitcherId = null) => {
    const { data, error } = await supabase.rpc("set_game_pitchers", {
      p_game_id: gameId,
      p_side: side,
      p_pitcher_name: name,
      p_pitcher_id: pitcherId,
    });

    if (error) {
      startErrorToast(error.message);
      return false;
    }
    dispatch(
      onSetGamePitcher({
        id: gameId,
        side,
        name: data[`pitcher${side}_name`],
        pitcherId: data[`pitcher${side}_id`],
      })
    );
    return true;
  }

  const setKnokoutTeams = (number) => {
    switch (number) {
    case 1:
      dispatch(onPushNumberOfTeams(16)); 
      break;
    case 2:
      dispatch(onPushNumberOfTeams(8)); 
      break;
    case 3:
      dispatch(onPushNumberOfTeams(4));
      break;
    }
  }

  const startGenerateJWT = async ({ uniqueId, accessType }) => {
    const { data, error } = await supabase.rpc("create_tournament_invite", {
      p_unique_id: uniqueId,
      p_access_type: accessType,
    });
    if (error) {
      startErrorToast(error.message);
      return;
    }
    return data;
  }

  const startJoinTournament = async ({ token }) => {
    startLoading(true);
    const { error } = await supabase.rpc("join_tournament", {
      p_token: token.trim(),
    });
    startLoading(false);

    if (error) {
      // Postgres code 22P02 = the pasted text is not a valid uuid
      return startErrorToast(error.code === "22P02" ? "Invalid or expired invitation." : error.message);
    }
    startSuccessToast('Tournament joined successfully');
    navigate('/my-tourneys');
  }

  const startRestartTourney = async (tournament) => {
    startLoading(true);
    const data = await restartTournamentData(tournament);
    return await startSaveTourney(data, true);
  }

  return {
    //properties
    tournamentName,
    sport,  
    type,
    numberOfTeams,
    players,
    games,
    teams,
    gamesList,
    standings,
    //methods
    startSearchTeam,
    dispatch,
    startSaveTourney,
    startDeleteTourney,
    startGetGamesByTournament,
    startSaveGames,
    startSetGamePitcher,
    startGetTournamentStandings,
    setKnokoutTeams,
    startGenerateJWT,
    startJoinTournament,
    startRestartTourney,
    onResetGamesList,
    onResetStandings
  };
};
