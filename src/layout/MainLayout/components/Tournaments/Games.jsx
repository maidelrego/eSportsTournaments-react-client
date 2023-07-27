import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import { Avatar } from "primereact/avatar";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { useForm } from "../../../../hooks/useForm";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../../hooks";

export const Games = ({gamesList}) => {
  const { form, handleChange } = useForm(gamesList);
  const { startSaveGames } = useTourneyStore();

  const handleSave = (id) => {
    const game = form.find((game) => game.id === id);

    game.score1 = parseInt(game.score1);
    game.score2 = parseInt(game.score2);
    delete game.id;
    delete game.logoUrl;
    delete game.createdAt;
   
    startSaveGames(id, game);
  }

  return (
    <>
      <div className="grid mt-5">
        {form.length > 0 ? form.map((game, index) => (
          <div className="col-12 md:col-6" key={index}>
            <Fieldset legend={`Fixure ${index + 1}`} className="ma-0 pa-0">
              <div className="flex justify-content-center flex-wrap">
                <div className="flex flex-column align-items-center justify-content-center mr-3">
                  <Avatar
                    image={game.team1.logoUrl}
                    className="mb-2"
                    size="large"
                  />
                  <span className="text-xs xl:text-xl">
                    {game.team1.teamName}
                  </span>
                  <span className="mt-2 text-xs xl:text-lg">
                    ({game.team1.userName})
                  </span>
                 
                </div>
                <div>
                  <div className="flex flex-wrap flex-row">
                    <InputText
                      type="number"
                      name="score1"
                      className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                      value={form[index].score1}
                      onChange={(e) => handleChange(e, index)}
                    />
                    <span className="flex align-items-center justify-content-center mr-2 ml-2 xl:font-bold">
                  -
                    </span>
                    <InputText
                      type="number"
                      name="score2"
                      className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                      value={form[index].score2}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div className="flex flex-wrap flex-row align-items-center justify-content-center">
                    <Button label="Save" icon="pi pi-check" size="small" rounded onClick={() => handleSave(game.id)} />
                  </div>
                </div>
                
                <div className="flex flex-column align-items-center justify-content-center ml-3">
                  <Avatar
                    image={game.team2.logoUrl}
                    className="mb-2"
                    size="large"
                  />
                  <span className="text-xs xl:text-xl">
                    {game.team2.teamName}
                  </span>
                  <span className="mt-2 text-xs xl:text-lg">
                    ({game.team2.userName})
                  </span>
                  {/* <Button icon="pi pi-save" severity="success" rounded text onClick={() => handleSave(game.id)} /> */}
                </div>
              </div>
            </Fieldset>
          </div>
        )) : <AppSpinner loading={true} />
        }
      </div>
    </>
  );
};

Games.propTypes = {
  gamesList: PropTypes.array.isRequired,
};
