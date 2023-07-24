import { useEffect } from "react";
import { useAuthStore } from "../../../hooks";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

export const MyTourneys = () => {
  const { myTournaments, startGetMyTournaments } = useAuthStore()
  

  useEffect(() => {
    startGetMyTournaments()
  }, []);

  return (
    <>
      <h1 className="text-color text-center">My Tourneys</h1>
      <div className="grid mt-5">
        {myTournaments.map((item) => (
          <div className="mr-2 col-12 md:col-4" key={item.id}>
            <div className="surface-card shadow-2 border-round p-3 tourneyCard">
              <div className="flex flex-column align-items-center border-bottom-1 surface-border pb-3">
                <span className="text-xl text-900 font-medium mb-2">{item.name}</span>
                <span className="text-600 font-medium mb-2">FIFA</span>
                <Tag rounded>League</Tag>
              </div>
              <div className="flex justify-content-between pt-3">
                <Button label="View" icon="pi pi pi-search" outlined rounded className="w-full mr-2" />
                <Button label="Share" rounded outlined icon="pi pi-share-alt" className="w-full"/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
