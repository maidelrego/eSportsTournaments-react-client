import { Navigate, useLocation } from "react-router-dom";
import { FifaTable } from "../components/Tournaments/FifaTable";
import { TabView, TabPanel } from "primereact/tabview";
import { TeamCard } from "../components/Teams/TeamCard";

export const Tournament = () => {
  const { state } = useLocation();
  const { teams } = state

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
          <h1 className="text-center text-color">Tournament: {state.name}</h1>
        </div>
        <div className="col-12 mt-5">
          <TabView>
            <TabPanel rightIcon="pi pi-table mr-2" header="Standings" headerTemplate={tab1HeaderTemplate}>
              <FifaTable />
            </TabPanel>
            <TabPanel rightIcon="pi pi-calendar mr-2" header="Calendar" headerTemplate={tab1HeaderTemplate}>
              <h1>Second Page</h1>
            </TabPanel>
            <TabPanel rightIcon="pi pi-users mr-2" header="Teams" headerTemplate={tab1HeaderTemplate}>
              <TeamCard teams={teams} />
            </TabPanel>
          </TabView>
        </div>
        <div className="col-12">
          
        </div>
      </div>
    </>
  );
};
