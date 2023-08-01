import { Navigate, useLocation, useParams } from "react-router-dom";
import { Standings } from "../components/Tournaments";
import { TabView, TabPanel } from "primereact/tabview";
import { TeamCard } from "../components/Teams/TeamCard";
import { Games } from "../components/Tournaments/Games";
import { useTourneyStore } from "../../../hooks";
import { useEffect } from "react";
import { SingleElimination } from "../components/Tournaments/SingleEliminationBracket";
import { generateEliminationStructure } from "../../../helper/generateEliminationStructure";

export const Tournament = () => {
  const { state } = useLocation();
  const { teams } = state
  const { id = null } = useParams();
  const { startGetGamesByTournament, startGetTournamentStandings, gamesList, standings } = useTourneyStore();

  useEffect(() => {
    startGetGamesByTournament(id)
    startGetTournamentStandings(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  
  if (!state) {
    return <Navigate to={"/my-tourneys"} />;
  }

  const tab1HeaderTemplate = (options) => {
    return (
      <button type="button" onClick={options.onClick} className={options.className}>
        {options.rightIconElement}
        {options.titleElement}
      </button>
    );
  };

  return (
    <>
      <div className="grid">
        <div className="col-12">
          <h1 className="text-center text-color">Tournament: {state.tournamentName}</h1>
        </div>
        <div className="col-12 mt-5">
          <TabView>
            <TabPanel rightIcon="pi pi-table mr-2" header="Standings" headerTemplate={tab1HeaderTemplate}>
              <Standings standings={standings} />
            </TabPanel>
            <TabPanel rightIcon="pi pi-calendar mr-2" header="Calendar" headerTemplate={tab1HeaderTemplate}>
              <Games gamesList={gamesList} tournamentType={state.type} />
            </TabPanel>
            <TabPanel rightIcon="pi pi-users mr-2" header="Teams" headerTemplate={tab1HeaderTemplate}>
              <TeamCard teams={teams} />
            </TabPanel>
            {
              state.type === 2 && (
                <TabPanel rightIcon="pi pi-users mr-2" header="Brackets" headerTemplate={tab1HeaderTemplate}>
                  <SingleElimination simpleSmallBracket={generateEliminationStructure(gamesList)} />;
                </TabPanel>
              )
            }
           
          </TabView>
        </div>
        <div className="col-12">
          
        </div>
      </div>
    </>
  );
};
