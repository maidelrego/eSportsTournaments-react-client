import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import { Avatar } from "primereact/avatar";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { useForm } from "../../../../hooks/useForm";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../../hooks";
import { useParams } from "react-router-dom";
import noLogo from "../../../../assets/img/noLogo.png";

export const LeagueGames = ({ gamesList }) => {
  console.log(gamesList);
  const { id = null } = useParams();
  const { form, handleChange } = useForm(gamesList);
  const {
    startSaveGames,
    startGetTournamentStandings,
    startGetGamesByTournament,
  } = useTourneyStore();

  const handleSave = async (gameId) => {
    const game = form.find((game) => game.id === gameId);
    game.score1 = parseInt(game.score1);
    game.score2 = parseInt(game.score2);
    delete game.id;
    delete game.logoUrl;
    delete game.createdAt;
    delete game.updatedAt;
    await startSaveGames(gameId, game);
    await startGetTournamentStandings(id);
    await startGetGamesByTournament(id);
  };

  const disable = (index) => {
    if (
      [null, ""].includes(form[index].score1) ||
      [null, ""].includes(form[index].score2)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <div className="grid mt-5">
        {form.length > 0 ? (
          form.map((game, index) => (
            <div className="col-12 md:col-6" key={index}>
              <Fieldset legend={`Fixure ${index + 1}`} className="ma-0 pa-0">
                <div className="flex justify-content-center flex-wrap">
                  <div className="flex flex-column align-items-center justify-content-center mr-3">
                    <Avatar
                      image={game.team1?.logoUrl ? game.team1.logoUrl : noLogo}
                      className="mb-2"
                      size="large"
                    />
                    <span className="text-xs xl:text-xl">
                      {game.team1?.teamName}
                    </span>
                    <span className="mt-2 text-xs xl:text-lg">
                      ({game.team1?.userName})
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap flex-row">
                      <InputText
                        type="number"
                        name="score1"
                        className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                        value={form[index].score1 || ""}
                        onChange={(e) => handleChange(e, index)}
                      />
                      <span className="flex align-items-center justify-content-center mr-2 ml-2 xl:font-bold">
                        -
                      </span>
                      <InputText
                        type="number"
                        name="score2"
                        className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                        value={form[index].score2 || ""}
                        onChange={(e) => handleChange(e, index)}
                      />
                    </div>
                    <div className="flex flex-wrap flex-row align-items-center justify-content-center">
                      <Button
                        label="Save"
                        icon="pi pi-check"
                        size="small"
                        rounded
                        disabled={disable(index)}
                        onClick={() => handleSave(game.id)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-column align-items-center justify-content-center ml-3">
                    <Avatar
                      image={game.team2?.logoUrl ? game.team2.logoUrl : noLogo}
                      className="mb-2"
                      size="large"
                    />
                    <span className="text-xs xl:text-xl">
                      {game.team2?.teamName}
                    </span>
                    <span className="mt-2 text-xs xl:text-lg">
                      ({game.team2?.userName})
                    </span>
                  </div>
                </div>
              </Fieldset>
            </div>
          ))
        ) : (
          <AppSpinner loading={true} />
        )}
      </div>
    </>
  );
};

LeagueGames.propTypes = {
  gamesList: PropTypes.array.isRequired,
};
