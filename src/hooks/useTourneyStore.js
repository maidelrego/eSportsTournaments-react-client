import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { onResetState, onSetGames, initGamesById, onSetStandings, onPushNumberOfTeams, onResetGamesList, onResetStandings } from "../store/tourney/tourneySlice";
import { doAPIDelete, doAPIGet, doAPIPost, doAPIPut } from "../services/api";
import { setErrorToast, setLoading, setSuccessToast } from "../store/ui/uiSlice";
import { useNavigate } from "react-router-dom";
import { restartTournamentData } from "../helper/restartTournamentData";
 
export const useTourneyStore = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    dispatch(setLoading(true));
    await doAPIPost("tournaments",data).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(onResetState())
        dispatch(setSuccessToast('Tournament created successfully!'));
        if (!restart) {
          navigate('/my-tourneys');
        }  
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast('Something went wrong, check logs'));
      }  
    });
  }

  const startDeleteTourney = async( id ) => {
    dispatch(setLoading(true));
    await doAPIDelete(`tournaments/${id}`).then((res) => {
      if (res.status === 200) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast('Tournament deleted successfully!'));   
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast('Something went wrong, check logs'));
      }
    });
  }

  const startGetGamesByTournament = async( id ) => {
    dispatch(setLoading(true));
    await doAPIGet(`/games/tournament/${id}`).then((res) => {
      if (res.status === 200) {
        dispatch(setLoading(false));
        dispatch(onSetGames(res.data))
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast('Something went wrong, check logs'));
      }
    });
  }

  const startGetTournamentStandings = async ( id ) => {
    dispatch(setLoading(true));
    doAPIGet(`/tournaments/standings/${id}`).then((res) => {
      if (res.status === 200) {
        dispatch(onSetStandings(res.data))
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast('Something went wrong, check logs'));
      }
    });
  }

  const startSaveGames = async( id, game ) => {
    dispatch(setLoading(true));
    await doAPIPut(`games/${id}`,game).then((res) => {
      if (res.status === 200) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast('Game saved successfully!')); 
        dispatch(initGamesById(res.data));
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
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
    dispatch(setLoading(true));
    await doAPIPost('tournaments/join', token).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast('Tournament joined successfully!'));
        navigate('/my-tourneys');
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
      }
    });
  }

  const startRestartTourney = async (tournament) => {
    dispatch(setLoading(true));
    

    const data = await restartTournamentData(tournament);

    console.log(data);

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
