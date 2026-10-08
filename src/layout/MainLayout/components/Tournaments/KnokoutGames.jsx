import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import { Avatar } from "primereact/avatar";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { useForm } from "../../../../hooks/useForm";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../../hooks";
import { useParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { getKnokoutStages } from "../../../../helper/getKnokoutStages";
import { useEffect } from "react";
import noLogo from "../../../../assets/img/noLogo.png";
import { SPORT } from "../../../../lib/formSelections";
import { PitcherPicker } from "./PitcherPicker";

export const KnokoutGames = ({ gamesList, sport, canEdit = true }) => {
  const { id = null } = useParams();
  const { form, handleChange, setForm } = useForm(gamesList);
  const {
    startSaveGames,
    startGetTournamentStandings,
    startGetGamesByTournament,
  } = useTourneyStore();

  // Re-sync the inputs only when scores or teams change, not when just a pitcher was picked
  // (that would wipe scores typed into other games that are not saved yet).
  const gamesSignature = JSON.stringify(
    gamesList.map((game) => [game.id, game.score1, game.score2, game.team1?.id, game.team2?.id])
  );

  useEffect(() => {
    setForm(gamesList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesSignature]);

  const arrayOfRounds = [
    ...new Set(form.map((game) => game.tournamentRoundText)),
  ];

  const handleSave = async (gameId) => {
    const game = form.find((game) => game.id === gameId);
    // do not mutate `game`: it is the state the inputs and the pitcher pickers render from
    await startSaveGames(gameId, {
      score1: parseInt(game.score1),
      score2: parseInt(game.score2),
    });
    await startGetTournamentStandings(id);
    await startGetGamesByTournament(id);
  };

  const disable = (index) => {
    if (
      [null, ""].includes(form[index].score1) ||
      [null, ""].includes(form[index].score2) ||
      Number(form[index].score1) === Number(form[index].score2)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <div className="grid mt-5">
        <div className="col-12">
          <Accordion multiple activeIndex={[0]}>
            {arrayOfRounds.map((round, index) => (
              <AccordionTab
                header={getKnokoutStages(round, arrayOfRounds.length)}
                key={index}
                className="mt-5"
              >
                <div className="grid mt-2">
                  {form.length > 0 ? (
                    form.map(
                      (game, index) =>
                        game.tournamentRoundText === round && (
                          <div className="col-12 md:col-6" key={index}>
                            <Fieldset
                              legend={`Fixure ${index + 1}`}
                              className="ma-0 pa-0"
                            >
                              <div className="flex justify-content-center flex-wrap">
                                <div className="flex flex-column align-items-center justify-content-center mr-3">
                                  <Avatar
                                    image={
                                      game.team1?.logoUrl
                                        ? game.team1?.logoUrl
                                        : noLogo
                                    }
                                    className="mb-2"
                                    size="large"
                                  />
                                  <span className="text-xs xl:text-xl">
                                    {game.team1?.teamName}
                                  </span>
                                  <span className="mt-2 text-xs xl:text-lg">
                                    ({game.team1?.userName})
                                  </span>
                                  {sport === SPORT.MLB && game.team1 && (
                                    <PitcherPicker
                                      gameId={game.id}
                                      side={1}
                                      disabled={!canEdit}
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="flex flex-wrap flex-row">
                                    <InputText
                                      type="number"
                                      name="score1"
                                      keyfilter={/[0-9]/}
                                      className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                                      value={form[index].score1 + ''  || ""}
                                      onChange={(e) => handleChange(e, index)}
                                    />
                                    <span className="flex align-items-center justify-content-center mr-2 ml-2 xl:font-bold">
                                      -
                                    </span>
                                    <InputText
                                      type="number"
                                      name="score2"
                                      keyfilter={/[0-9]/}
                                      className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                                      value={form[index].score2 + '' || ""}
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
                                    image={
                                      game.team2?.logoUrl
                                        ? game.team2?.logoUrl
                                        : noLogo
                                    }
                                    className="mb-2"
                                    size="large"
                                  />
                                  <span className="text-xs xl:text-xl">
                                    {game.team2?.teamName}
                                  </span>
                                  <span className="mt-2 text-xs xl:text-lg">
                                    ({game.team2?.userName})
                                  </span>
                                  {sport === SPORT.MLB && game.team2 && (
                                    <PitcherPicker
                                      gameId={game.id}
                                      side={2}
                                      disabled={!canEdit}
                                    />
                                  )}
                                </div>
                              </div>
                            </Fieldset>
                          </div>
                        )
                    )
                  ) : (
                    <AppSpinner loading={true} />
                  )}
                </div>
              </AccordionTab>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
};

KnokoutGames.propTypes = {
  gamesList: PropTypes.array.isRequired,
  sport: PropTypes.number,
  canEdit: PropTypes.bool,
};
