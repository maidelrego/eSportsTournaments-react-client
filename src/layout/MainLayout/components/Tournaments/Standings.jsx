import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PropTypes from "prop-types";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { setAvatarStyle } from "../../../../helper/getStreakStyles";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import noLogo from "../../../../assets/img/noLogo.png";
import { SPORT } from "../../../../lib/formSelections";

// Full word on desktop, short word on phones (see .hide-sm / .show-sm in index.css)
const Header = ({ full, short }) => (
  <>
    <span className="hide-sm">{full}</span>
    <span className="show-sm">{short}</span>
  </>
);

Header.propTypes = {
  full: PropTypes.string.isRequired,
  short: PropTypes.string.isRequired,
};

export const Standings = ({ standings, sport }) => {
  const isBaseball = sport === SPORT.MLB;
  const hasSeeds = standings.some((row) => row.playoffSeed);

  const seedTemplate = ({ playoffSeed }) =>
    playoffSeed ? `#${playoffSeed}` : "-";

  const diffTemplate = ({ runDiff }) => (runDiff > 0 ? `+${runDiff}` : runDiff);

  const header = (
    <div className="table-header">
      <h1 className="text-color text-center m-0">Standings</h1>
    </div>
  );

  const teamNameTemplate = (rowData) => {
    return (
      <div className="flex align-items-center">
        <img
          src={rowData.team?.logoUrl ? rowData.team.logoUrl : noLogo}
          alt={rowData.team.teamName}
          className="mr-2"
          width="28"
          style={{ flexShrink: 0 }}
        />
        <div className="flex flex-column" style={{ minWidth: 0 }}>
          <span className="font-medium">{rowData.team.teamName}</span>
          <span className="text-xs text-color-secondary">{rowData.team.userName}</span>
        </div>
      </div>
    );
  };

  const streakTemplate = ({lastFiveGameResults}) => {
    return (
      <div className="flex align-items-center">
        <AvatarGroup>
          {
            lastFiveGameResults.map((result, index) =>(
              <Avatar className="mr-3" shape="circle" label={result.value} style={setAvatarStyle(result.value)} key={index} />
            ))
          }
        </AvatarGroup>
      </div>
    );
  };

  return (
    <div className="mt-3 md:mt-5">
      {standings.length > 0 ?
        <DataTable
          className="standings-table"
          value={standings}
          header={header}
          rowClassName={(row) => ({ "font-bold": hasSeeds && !!row.playoffSeed })}
        >
          {hasSeeds && <Column header="Seed" body={seedTemplate}></Column>}
          <Column header="Team" body={teamNameTemplate}></Column>
          <Column
            header={<Header full="Played" short="P" />}
            field="gamesPlayed"
            headerClassName={isBaseball ? "hide-sm" : undefined}
            bodyClassName={isBaseball ? "hide-sm" : undefined}
          ></Column>
          <Column header={<Header full="Wins" short="W" />} field="wins"></Column>
          {!isBaseball && <Column header={<Header full="Draws" short="D" />} field="draws"></Column>}
          <Column header={<Header full="Lost" short="L" />} field="losses"></Column>
          <Column
            header={isBaseball ? <Header full="Runs For" short="RF" /> : <Header full="Scored" short="GF" />}
            field="goalsScored"
            headerClassName="hide-sm"
            bodyClassName="hide-sm"
          ></Column>
          <Column
            header={isBaseball ? <Header full="Runs Against" short="RA" /> : <Header full="Against" short="GA" />}
            field="goalsConceded"
            headerClassName="hide-sm"
            bodyClassName="hide-sm"
          ></Column>
          <Column header={<Header full={isBaseball ? "Run Diff" : "Goal Diff"} short="Diff" />} body={diffTemplate}></Column>
          {!isBaseball && <Column header={<Header full="Points" short="Pts" />} field="points"></Column>}
          <Column
            header="Last 5"
            body={streakTemplate}
            headerClassName="hide-sm"
            bodyClassName="hide-sm"
          ></Column>
        </DataTable>
        : <AppSpinner loading={true} />
      }
    </div>
  );
};

Standings.propTypes = {
  standings: PropTypes.array.isRequired,
  sport: PropTypes.number,
};
