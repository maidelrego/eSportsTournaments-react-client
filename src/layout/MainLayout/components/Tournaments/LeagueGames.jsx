import PropTypes from "prop-types";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { useTourneyStore } from "../../../../hooks";
import { useParams } from "react-router-dom";
import { SPORT } from "../../../../lib/formSelections";
import { GameCard } from "./GameCard";

export const LeagueGames = ({ gamesList, sport, canEdit = true }) => {
  const { id = null } = useParams();
  const { startGetTournamentStandings, startGetGamesByTournament } = useTourneyStore();

  const refresh = async () => {
    await startGetTournamentStandings(id);
    await startGetGamesByTournament(id);
  };

  if (gamesList.length === 0) {
    return (
      <div className="grid mt-5">
        <AppSpinner loading={true} />
      </div>
    );
  }

  return (
    <div className="grid mt-3">
      {gamesList.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          legend={`Fixture ${index + 1}`}
          sport={sport}
          canEdit={canEdit}
          // football leagues allow draws, baseball games always have a winner
          allowTie={sport !== SPORT.MLB}
          onSaved={refresh}
        />
      ))}
    </div>
  );
};

LeagueGames.propTypes = {
  gamesList: PropTypes.array.isRequired,
  sport: PropTypes.number,
  canEdit: PropTypes.bool,
};
