import { useEffect, useRef } from "react";
import { useAuthStore } from "../../../hooks";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { ShareTournament } from "../components/Tournaments";
import { useTourneyStore } from "../../../hooks";

export const MyTourneys = () => {
  const { myTournaments, startGetMyTournaments } = useAuthStore();
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
          startGetMyTournaments()
        })
      },
    });
  };

  return (
    <>
      <h1 className="text-color text-center">My Tourneys</h1>
      <div className="grid mt-5">
        {myTournaments.map((item) => (
          <div className="col-12 md:col-4" key={item.id}>
            <div className="surface-card shadow-2 border-round p-3">
              <div className="flex justify-content-around surface-border pb-3">
                <span className="text-xl align-items-center flex text-900 font-medium">
                  {item.tournamentName}
                </span>

                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  rounded
                  text
                  size="large"
                  onClick={() => confirm2(item.id)}
                />
              </div>
              <div className="flex justify-content-center border-bottom-1 surface-border pb-3">
                <Tag rounded className="w-4rem mr-3 h-2rem">
                  EA FC
                </Tag>
                <Tag rounded className="w-4rem mr-3 h-2rem">
                  League
                </Tag>
                <Tag rounded className="w-4rem h-2rem">
                  4 Teams
                </Tag>
              </div>
              <div className="flex justify-content-between pt-3">
                <Button
                  label="View"
                  icon="pi pi pi-search"
                  outlined
                  rounded
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
