import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";

export const ShareTournament = () => {
  const [visible, setVisible] = useState(false);

  const [selectedCity, setSelectedCity] = useState(null);
  const cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ];

  return (
    <>
      <Button
        label="Share"
        severity="secondary"
        rounded
        outlined
        icon="pi pi-share-alt"
        className="w-full"
        onClick={() => setVisible(true)}
      />
      <Dialog
        header="Share this Tournament with others"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => setVisible(false)}
      >
        <Dropdown value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities} optionLabel="name" 
          placeholder="Select a City" className="w-full md:w-14rem" />
      </Dialog>
    </>
  );
}
