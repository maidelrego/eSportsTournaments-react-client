import { useEffect, useRef } from "react";
import { useAuthStore } from "../../../hooks";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { ShareTournament } from "../components/Tournaments";
import { useTourneyStore } from "../../../hooks";
import moment from "moment";
import { translateFormSelection } from "../../../helper/translateFormSelections";

export const MyTourneys = () => {
  const { myTournaments, startGetMyTournaments } = useAuthStore();
  console.log(myTournaments);
  const { startDeleteTourney } = useTourneyStore();
  const navigate = useNavigate();

  const handleViewTournament = (id, data) => {
    navigate(`/my-tourneys/${id}`, { state: data });
  };

  useEffect(() => {
    startGetMyTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toast = useRef(null);

  const confirm2 = (tournamentId) => {
    confirmDialog({
      message: "Do you want to delete this Tournament?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept() {
        startDeleteTourney(tournamentId).then(() => {
          startGetMyTournaments();
        });
      },
    });
  };

  return (
    <>
      <h1 className="text-color text-center">My Tourneys</h1>
      <div className="grid mt-5">
        {myTournaments.map((item) => (
          <div className="col-12 md:col-4" key={item.id}>
            <div className="bg-primary text-color p-3 flex justify-content-between align-items-center flex-wrap">
              <div className="flex flex-column align-items-start">
                <span style={{color: '#2c3e50' }} className="text-2xl md:text-4xl font-medium mb-1">
                  {item.tournamentName}
                </span>
                <span className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm">
                  {item.type === 1 ? 'Guest' : 'Host'}
                </span>
              </div>
              <div>
                <Button
                  icon="pi pi-refresh"
                  severity="secondary"
                  size="small"
                  className="mr-3"
                  style={{ width: "20px", height: "30px" }}
                />
                <Button
                  icon="pi pi-trash"
                  severity="secondary"
                  size="small"
                  style={{ width: "20px", height: "30px" }}
                  onClick={() => confirm2(item.id)}
                />
              </div>
            </div>
            <div className="surface-card shadow-2 p-3">
              <ul className="list-none m-0 p-0 border-bottom-1 surface-border mb-3">
                <li className="px-0 py-2 flex justify-content-between align-items-center border-bottom-1 surface-border">
                  <span className="text-600 font-medium text-sm">Winner</span>
                  <span className="text-900 font-medium text-sm">
                    In progress...
                  </span>
                </li>
                <li className="px-0 py-2 flex justify-content-between align-items-center border-bottom-1 surface-border">
                  <span className="text-600 font-medium text-sm">Type</span>
                  <span className="text-900 font-medium text-sm">
                    {translateFormSelection(item.type, "tournamentTypeOptions")}
                  </span>
                </li>
                <li className="px-0 py-2 flex justify-content-between align-items-center border-bottom-1 surface-border">
                  <span className="text-600 font-medium text-sm">
                    Games played
                  </span>
                  <span className="text-900 font-medium text-sm">
                    {item.gamesPlayed} / {item.gamesTotal}
                  </span>
                </li>
                <li className="px-0 py-2 flex justify-content-between align-items-center border-bottom-1 surface-border">
                  <span className="text-600 font-medium text-sm">Players</span>
                  <span className="text-900 font-medium text-sm">
                    {item.teams.length}
                  </span>
                </li>
                <li className="px-0 py-2 flex justify-content-between align-items-center">
                  <span className="text-600 font-medium text-sm">
                    Created On
                  </span>
                  <span className="text-900 font-medium text-sm">
                    {moment(item.createdAt).format("MM/DD/YYYY hh:mm A")}
                  </span>
                </li>
              </ul>
              <div className="flex justify-content-between pt-3">
                <Button
                  label="View"
                  icon="pi pi pi-search"
                  severity="secondary"
                  rounded
                  outlined
                  className="w-full mr-2"
                  onClick={() => handleViewTournament(item.id, item)}
                />
                <ShareTournament uniqueId={item.uniqueId}/>
              </div>
            </div>
          </div>
        ))}
        <Toast ref={toast} />
        <ConfirmDialog />
      </div>
    </>
  );
};
