import PropTypes from "prop-types";
import { LeagueGames } from "./LeagueGames";
import { KnokoutGames } from "./KnokoutGames";

export const Games = ({ gamesList, tournamentType, sport, canEdit }) => {
  return (
    <>
      {
        tournamentType === 1 ? (
          <LeagueGames gamesList={gamesList} sport={sport} canEdit={canEdit} />
        ) : (
          <KnokoutGames gamesList={gamesList} sport={sport} canEdit={canEdit} />
        )
      }
    </>
  );
};

Games.propTypes = {
  gamesList: PropTypes.array.isRequired,
  tournamentType: PropTypes.number.isRequired,
  sport: PropTypes.number,
  canEdit: PropTypes.bool,
};
