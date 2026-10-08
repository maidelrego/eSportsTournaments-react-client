import PropTypes from "prop-types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import noLogo from "../../../../assets/img/noLogo.png";
import { mlbHeadshotUrl } from "../../../../services/mlbApi";

// Starters logged per team, in the order the games were last updated.
const buildRotation = (games, teams) => {
  const ordered = [...games].sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt) || a.id - b.id
  );

  return teams.map((team) => {
    const starts = [];
    ordered.forEach((game) => {
      [1, 2].forEach((side) => {
        const name = game[`pitcher${side}Name`];
        if (game[`team${side}`]?.id === team.id && name) {
          const id = game[`pitcher${side}Id`];
          starts.push({ key: id ?? name.toLowerCase(), name, id });
        }
      });
    });

    const byPitcher = new Map();
    starts.forEach((start, index) => {
      const row = byPitcher.get(start.key) ?? { ...start, starts: 0 };
      row.starts += 1;
      row.lastIndex = index;
      byPitcher.set(start.key, row);
    });

    const rows = [...byPitcher.values()]
      .map((row) => ({ ...row, gamesSince: starts.length - 1 - row.lastIndex }))
      .sort((a, b) => a.gamesSince - b.gamesSince || a.name.localeCompare(b.name));

    return { team, total: starts.length, rows };
  });
};

const lastStartTemplate = ({ gamesSince }) => {
  if (gamesSince === 0) return "Latest start";
  return gamesSince === 1 ? "1 game ago" : `${gamesSince} games ago`;
};

const pitcherTemplate = ({ name, id }) => (
  <div className="flex align-items-center">
    {id && (
      <Avatar
        shape="circle"
        className="mr-2"
        image={mlbHeadshotUrl(id)}
      />
    )}
    <span>{name}</span>
  </div>
);

export const Rotation = ({ games, teams }) => {
  const rotation = buildRotation(games, teams);

  return (
    <div className="mt-5">
      <h1 className="text-color text-center">Rotation</h1>
      <p className="text-center text-color-secondary mt-0">
        Starting pitchers logged in the Calendar tab. The most recently used
        pitcher is on top.
      </p>
      <div className="grid">
        {rotation.map(({ team, total, rows }) => (
          <div className="col-12 md:col-6" key={team.id}>
            <div className="flex align-items-center mb-2">
              <img
                src={team.logoUrl || noLogo}
                alt={team.teamName}
                className="mr-2"
                width="30"
              />
              <span className="font-bold text-lg">
                {team.teamName} ({team.userName})
              </span>
              <span className="ml-auto text-color-secondary text-sm">
                {total} {total === 1 ? "start" : "starts"} logged
              </span>
            </div>
            {rows.length > 0 ? (
              <DataTable value={rows} size="small">
                <Column header="Pitcher" body={pitcherTemplate}></Column>
                <Column header="Starts" field="starts"></Column>
                <Column header="Last start" body={lastStartTemplate}></Column>
              </DataTable>
            ) : (
              <span className="text-color-secondary">No starters logged yet</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

Rotation.propTypes = {
  games: PropTypes.array.isRequired,
  teams: PropTypes.array.isRequired,
};
