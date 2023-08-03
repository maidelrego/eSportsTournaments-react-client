import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTourneyStore } from '../../../hooks';


export const JoinTourney = () => {
  const [tournamentToken, setTournamentToken] = useState('');
  const { startJoinTournament } = useTourneyStore();

  const join = () => {
    startJoinTournament({
      token: tournamentToken
    })
  }

  return (
    <div>
      <h1 className="text-color text-center">Join Tournament</h1>
      <div className='grid'>
        <div className='col-12'>
          <div className="surface-0 p-4 shadow-2 border-round">
            <InputTextarea
              onChange={(e) => setTournamentToken(e.target.value)}
              value={tournamentToken}
              className="w-full border-dashed border-2 border-300"
              style={{ height: "12rem" }}
            />
            <div className="flex justify-content-end mt-4">
              <Button
                label="Join"
                icon="pi pi-external-link"
                rounded
                onClick={() => join()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
