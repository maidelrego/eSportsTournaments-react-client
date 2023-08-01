import PropTypes from "prop-types";
import { LeagueGames } from "./LeagueGames";
import { KnokoutGames } from "./KnokoutGames";

export const Games = ({ gamesList, tournamentType }) => {
  
  
  return (
    <>
      {
        tournamentType === 1 ? (
          <LeagueGames gamesList={gamesList} />
        ) : (
          <KnokoutGames gamesList={gamesList} />
        )
      }
    </>
  );
};

Games.propTypes = {
  gamesList: PropTypes.array.isRequired,
  tournamentType: PropTypes.number.isRequired,
};
