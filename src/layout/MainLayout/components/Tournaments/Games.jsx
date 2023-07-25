import { useEffect } from "react";
import { doAPIGet, doAPIPut } from "../../../../services/api";
import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import { Avatar } from "primereact/avatar";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { useForm } from "../../../../hooks/useForm";
import { Button } from "primereact/button";

export const Games = (props) => {
  const { form, setForm, handleChange } = useForm();
  const teamsIds = props.teams.map((team) => team.id);
  const teams = props.teams;

  useEffect(() => {
    const getGames = async () => {
      doAPIGet(`/games`).then((response) => {
        const { data } = response;
        const tournamentGames = data.filter(
          (game) =>
            teamsIds.includes(game.team1) || teamsIds.includes(game.team2)
        );

        for (const t of tournamentGames) {
          t.team1 = teams.find((team) => team.id === t.team1);
          t.team2 = teams.find((team) => team.id === t.team2);
        }
        console.log(tournamentGames);
        setForm(tournamentGames);
      });
    };
    getGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = (id) => {
    const game = form.find((game) => game.id === id);
    
    game.team1 = game.team1.id;
    game.team2 = game.team2.id;
    game.score1 = parseInt(game.score1);
    game.score2 = parseInt(game.score2);
    delete game.id;
    delete game.logoUrl;
    delete game.createdAt;
    
    console.log(game);
    
    doAPIPut(`games/${id}`, game).then((response) => {
      console.log(response);
    });
  }

  console.log('FOOORM', form);

  return (
    <>
      <div className="grid mt-5">
        {form.length > 0 ? form.map((game, index) => (
          <div className="col-12 md:col-6" key={game.id}>
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
                  <Button icon="pi pi-save" severity="success" rounded text onClick={() => handleSave(game.id)} />
                </div>
                <InputText
                  type="number"
                  name="score1"
                  className="p-inputtext-sm mt-5 mb-5 w-2rem xl:w-4rem xl:mt-4 mb-4 text-center xl:text-4xl xl:font-bold"
                  value={form[index].score1}
                  onChange={(e) => handleChange(e, index)}
                  autoFocus
                />
                <span className="flex align-items-center justify-content-center mr-2 ml-2 xl:font-bold">
                  -
                </span>
                <InputText
                  type="number"
                  name="score2"
                  className="p-inputtext-sm mt-5 mb-5 w-2rem xl:w-4rem xl:mt-4 mb-4 text-center xl:text-4xl xl:font-bold"
                  value={form[index].score2}
                  onChange={(e) => handleChange(e, index)}
                  autoFocus
                />
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
  teams: PropTypes.array.isRequired,
};