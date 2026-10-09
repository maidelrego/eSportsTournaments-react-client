import PropTypes from "prop-types";
import { LeagueGames } from "./LeagueGames";
import { KnokoutGames } from "./KnokoutGames";
import { TYPE } from "../../../../lib/formSelections";

export const Games = ({ gamesList, tournamentType, sport, canEdit }) => {
  return (
    <>
      {
        tournamentType === TYPE.LEAGUE ? (
          <LeagueGames gamesList={gamesList} sport={sport} canEdit={canEdit} />
        ) : tournamentType === TYPE.SEASON ? (
          // regular season only: the playoff series live in the Playoffs tab
          <LeagueGames
            gamesList={gamesList.filter((game) => !game.seriesId)}
            sport={sport}
            canEdit={canEdit}
          />
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
