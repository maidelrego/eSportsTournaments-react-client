import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { onResetState, onSetGames, initGamesById, onSetStandings, onPushNumberOfTeams, onResetGamesList, onResetStandings } from "../store/tourney/tourneySlice";
import { doAPIDelete, doAPIGet, doAPIPost, doAPIPut } from "../services/api";
import { useNavigate } from "react-router-dom";
import { restartTournamentData } from "../helper/restartTournamentData";
import { useUIStore } from "./useUIStore";
 
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

  const startSearchTeam = async (query) => {
    const headers = {
      "x-rapidapi-key": "4ada01814adea2bb727b810423982de7",
      "x-rapidapi-host": "v3.football.api-sports.io",
    };

    const teams = await axios.get(
      `https://v3.football.api-sports.io/teams?search=${query}`,
      { headers }
    );

    const teamsArray = teams.data.response.map((team) => {
      return {
        name: team.team.name,
        logo: team.team.logo,
      };
    });

    return teamsArray;
  };

  const startSaveTourney = async( data, restart = false ) => {
    startLoading(true);
    await doAPIPost("tournaments",data).then((res) => {
      if (res.status === 201) {
        startLoading(false);
        dispatch(onResetState())
        startSuccessToast('Tournament saved successfully!');
        if (!restart) {
          navigate('/my-tourneys');
        }  
      } else {
        startLoading(false);
        startErrorToast('Something went wrong, check logs');
      }  
    });
  }

  const startDeleteTourney = async( id ) => {
    startLoading(true);
    await doAPIDelete(`tournaments/${id}`).then((res) => {
      if (res.status === 200) {
        startLoading(false);
        startSuccessToast('Tournament deleted successfully!');   
      } else {
        startLoading(false);
        startErrorToast('Something went wrong, check logs');
      }
    });
  }

  const startGetGamesByTournament = async( id ) => {
    startLoading(true);
    await doAPIGet(`/games/tournament/${id}`).then((res) => {
      if (res.status === 200) {
        startLoading(false);
        dispatch(onSetGames(res.data))
      } else {
        startLoading(false);
        startErrorToast('Something went wrong, check logs');
      }
    });
  }

  const startGetTournamentStandings = async ( id ) => {
    startLoading(true);
    doAPIGet(`/tournaments/standings/${id}`).then((res) => {
      if (res.status === 200) {
        dispatch(onSetStandings(res.data))
        startLoading(false);
      } else {
        startLoading(true);
        startErrorToast('Something went wrong, check logs');
      }
    });
  }

  const startSaveGames = async( id, game ) => {
    startLoading(true);
    await doAPIPut(`games/${id}`,game).then((res) => {
      if (res.status === 200) {
        startLoading(false);
        startSuccessToast('Game saved successfully!'); 
        dispatch(initGamesById(res.data));
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
      }
    });
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

  const startGenerateJWT = async (data) => {
    const res = await doAPIPost("tournaments/generateJWT", data)
    if (!res.data) return
    return res.data
  }

  const startJoinTournament = async (token) => {
    startLoading(true);
    await doAPIPost('tournaments/join', token).then((res) => {
      if (res.status === 201) {
        startLoading(false);
        startSuccessToast('Tournament joined successfully'); 
        navigate('/my-tourneys');
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
      }
    });
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
    startGetTournamentStandings,
    setKnokoutTeams,
    startGenerateJWT,
    startJoinTournament,
    startRestartTourney,
    onResetGamesList,
    onResetStandings
  };
};
