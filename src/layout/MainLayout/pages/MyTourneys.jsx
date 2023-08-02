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
import { Chip } from 'primereact/chip';


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
              <span className="text-2xl md:text-4xl align-items-center flex text-900 font-medium">
                {item.tournamentName}
              </span>
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
              <div className="flex flex-column justify-content-center border-bottom-1 surface-border pb-3 pt-3">
                <span className="text-color text-lg font-bold mb-2">
                  Winner: <span className="text-orange-500">In progress...</span>
                </span>
                <span className="text-color text-lg  font-bold mb-2">
                
                  Type:<Chip className="ml-2" style={{ height: '30px' }} label={translateFormSelection(item.type, 'tournamentTypeOptions')} />
                </span>
                <span className="text-color text-lg  font-bold mb-2">
                  Games played: <Chip className="ml-2" style={{ height: '30px' }} label='4/7'/>
                </span>
                <span className="text-color font-bold mb-2">
                  Players:<Chip className="ml-2" style={{ height: '30px' }} label={item.teams.length}/>
                </span>
                <span className="text-color text-lg  font-bold mb-2">
                
                  Created on:<Chip className="ml-2" style={{ height: '30px' }} label={moment(item.createdAt).format('MM/DD/YYYY hh:mm A')}/>
                </span>
              </div>
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
                <ShareTournament />
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
