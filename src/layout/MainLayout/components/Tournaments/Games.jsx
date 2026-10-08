import PropTypes from "prop-types";
import { LeagueGames } from "./LeagueGames";
import { KnokoutGames } from "./KnokoutGames";

export const Games = ({ gamesList, tournamentType, sport }) => {
  return (
    <>
      {
        tournamentType === 1 ? (
          <LeagueGames gamesList={gamesList} sport={sport} />
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
  sport: PropTypes.number,
};
