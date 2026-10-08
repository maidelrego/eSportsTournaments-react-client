import { Navigate, useLocation, useParams } from "react-router-dom";
import { Standings } from "../components/Tournaments";
import { TabView, TabPanel } from "primereact/tabview";
import { Games } from "../components/Tournaments/Games";
import { useTourneyStore } from "../../../hooks";
import { useEffect } from "react";
import { SingleElimination } from "../components/Tournaments/SingleEliminationBracket";
import { generateEliminationStructure } from "../../../helper/generateEliminationStructure";
import { Rotation } from "../components/Tournaments/Rotation";
import { permission } from "../../../helper/getRoles";
import { SPORT } from "../../../lib/formSelections";
import { useSelector } from "react-redux";

export const Tournament = () => {
  const { id = null } = useParams();
  const { state } = useLocation();
  const { user } = useSelector((store) => store.auth);
  const { startGetGamesByTournament, startGetTournamentStandings, gamesList, standings, dispatch, onResetGamesList, onResetStandings } = useTourneyStore();
  
  useEffect(() => {
    if (!state) return;
    startGetGamesByTournament(id)
    startGetTournamentStandings(id)
    
    return () => {
      dispatch(onResetGamesList())
      dispatch(onResetStandings())
    }
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
              <Standings standings={standings} sport={state.sport} />
            </TabPanel>
            <TabPanel rightIcon="pi pi-calendar mr-2" header="Calendar" headerTemplate={tab1HeaderTemplate}>
              <Games
                gamesList={gamesList}
                tournamentType={state.type}
                sport={state.sport}
                canEdit={permission(state.sharedAdmins ?? [], state.sharedGuests ?? [], user.id)}
              />
            </TabPanel>
            {
              state.sport === SPORT.MLB && (
                <TabPanel rightIcon="pi pi-users mr-2" header="Rotation" headerTemplate={tab1HeaderTemplate}>
                  <Rotation games={gamesList} teams={state.teams ?? []} />
                </TabPanel>
              )
            }
            {
              state.type === 2 && (
                <TabPanel rightIcon="pi pi-sitemap mr-2" header="Bracket" headerTemplate={tab1HeaderTemplate}>
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
