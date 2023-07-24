import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { onResetState, onSetfilteredCountries } from "../store/tourney/tourneySlice";
import { doAPIPost } from "../services/api";
import { setErrorToast, setLoading, setSuccessToast } from "../store/ui/uiSlice";

export const useTourneyStore = () => {
  const dispatch = useDispatch();
  const { filteredCountries, tourneyTypeOptions, sportTypeOptions, name, sport, type, players, games } =
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

    dispatch(onSetfilteredCountries(teamsArray));
  };

  const startSaveTourney = async( data ) => {
    dispatch(setLoading(true));
    await doAPIPost("tournaments",data).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(onResetState())
        dispatch(setSuccessToast('Tournament created successfully!'));   
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast('Something went wrong, check logs'));
      }  
    });
  }

  return {
    //properties
    filteredCountries,
    tourneyTypeOptions,
    sportTypeOptions,
    name,
    sport,  
    type,
    players,
    games,

    //methods
    startSearchTeam,
    dispatch,
    startSaveTourney
  };
};
