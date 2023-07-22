import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { onSetfilteredCountries } from "../store/tourney/tourneySlice";
import { doAPIPost } from "../services/api";


export const useTourneyStore = () => {
  
    const dispatch = useDispatch();
    const { 
        filteredCountries,
        typeOptions,
        name,
        type,
        players,
        games,

     } = useSelector( state => state.tourney );
 
    const startSearchTeam = async ( query ) => {
            
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
    }

    // const startSaveTourney = async( data ) => {
       
    //     await doAPIPost("/", { email, password }).then((res) => {
    //         if (res.status === 201) {
    //           const { token, ...user } = res.data;
    //           delete user.password;
    //           localStorage.setItem("tourneyForgeToken", token);
    //           dispatch(onLogin(user));
    //         } else {
    //           dispatch(onLogout(res.message));
    //         }
    //       });
    // }
  
  
  
    return {

      //properties
      filteredCountries,
      typeOptions,
      name,
      type,
      players,
      games,

      //methods
      startSearchTeam,
      dispatch

    }
}
