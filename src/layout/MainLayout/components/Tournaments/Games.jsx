import { useEffect, useState } from "react";
import { doAPIGet } from "../../../../services/api";
import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import { Avatar } from "primereact/avatar";

export const Games = (props) => {
  const [games, setGames] = useState([]);
  const [score1, setScore1] = useState("0");
  const [score2, setScore2] = useState("0");
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
        setGames(tournamentGames);
      });
    };
    getGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="grid mt-5">
        {games.map((game, index) => (
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
                </div>
                <InputText
                  type="number"
                  className="p-inputtext-sm mt-5 mb-5 w-2rem xl:w-4rem xl:mt-4 mb-4 text-center xl:text-4xl xl:font-bold"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  autoFocus
                />
                <span className="flex align-items-center justify-content-center mr-2 ml-2 xl:font-bold">
                  -
                </span>
                <InputText
                  type="number"
                  className="p-inputtext-sm mt-5 mb-5 w-2rem xl:w-4rem xl:mt-4 mb-4 text-center xl:text-4xl xl:font-bold"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
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
        ))}
      </div>
    </>
  );
};

Games.propTypes = {
  teams: PropTypes.array.isRequired,
};
