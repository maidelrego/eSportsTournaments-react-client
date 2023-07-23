import { useEffect } from "react";
import { Card } from "primereact/card";
import { useAuthStore } from "../../../hooks";

export const MyTourneys = () => {
  const { myTournaments, startGetMyTournaments } = useAuthStore()

  

  useEffect(() => {
    startGetMyTournaments()
  }, []);

  return (
    <>
      <h1>My Tourneys</h1>
      <div className="grid mt-5">
        {myTournaments.map((item) => (
          <div className="mr-2 col" key={item.id}>
            <Card title={item.name} className="card p-fluid">
              
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};
