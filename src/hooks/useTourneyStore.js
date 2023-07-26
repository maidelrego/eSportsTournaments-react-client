import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { onResetState } from "../store/tourney/tourneySlice";
import { doAPIDelete, doAPIPost } from "../services/api";
import { setErrorToast, setLoading, setSuccessToast } from "../store/ui/uiSlice";
import { useNavigate } from "react-router-dom";

export const useTourneyStore = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tournamentName, sport, type, players, games, teams } =
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

  const startSaveTourney = async( data ) => {
    dispatch(setLoading(true));
    await doAPIPost("tournaments",data).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(onResetState())
        dispatch(setSuccessToast('Tournament created successfully!'));
        navigate('/my-tourneys');   
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

  return {
    //properties
    tournamentName,
    sport,  
    type,
    players,
    games,
    teams,
    //methods
    startSearchTeam,
    dispatch,
    startSaveTourney,
    startDeleteTourney
  };
};
