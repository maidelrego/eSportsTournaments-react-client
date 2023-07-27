import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PropTypes from "prop-types";
import { AppSpinner } from "../../../../ui/components/AppSpinner";

export const Standings = ({ standings }) => {
  console.log(standings);

  const header = (
    <div className="table-header">
      <h1 className="text-color text-center">Standings</h1>
    </div>
  );

  const teamNameTemplate = (rowData) => {
    return (
      <div className="flex align-items-center">
        <img
          src={rowData.team.logoUrl}
          alt={rowData.team.teamName}
          className="mr-2"
          width="30"
        />
        <span className="mr-2">{rowData.team.teamName} - ({rowData.team.userName})</span>
      </div>
    );
  }

  const streakTemplate = (rowData) => {
    return (
      <div className="flex align-items-center">
        <span className={`badge ${rowData.streak === "W" ? "badge-success" : "badge-danger"} mr-2`}>{rowData.streak}</span>
        <span>{rowData.streakCount}</span>
      </div>
    );
  }

  return (
    <div className="mt-5">
      {standings.length > 0 ? 
        <DataTable value={standings} header={header}>
          <Column header="Team" body={teamNameTemplate}></Column>
          <Column header="Played" field="gamesPlayed"></Column>
          <Column header="Wins" field="wins"></Column>
          <Column header="Draws" field="draws"></Column>
          <Column header="Lost" field="losses"></Column>
          <Column header="Scored" field="goalsScored"></Column>
          <Column header="Against" field="goalsConceded"></Column>
          <Column header="Points" field="points"></Column>
          <Column header="Streak" body={streakTemplate}></Column>
        </DataTable>
        : <AppSpinner loading={true} />
      }
    </div>
  );
};

Standings.propTypes = {
  standings: PropTypes.array.isRequired,
};
