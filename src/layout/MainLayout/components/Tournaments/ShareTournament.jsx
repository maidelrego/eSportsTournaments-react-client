import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useTourneyStore } from "../../../../hooks";
import PropTypes from "prop-types";

export const ShareTournament = ({ uniqueId }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [link, setLink] = useState('');
  const [toolTipValue, setToolTipValue] = useState('Copy to clipboard');

  const { startGenerateJWT } = useTourneyStore();

  const generateLink = async () => {
    if (!uniqueId || !accessType) return;
    setLoading(true);
    const JWT = await startGenerateJWT({ uniqueId, accessType })
    setLink(JWT);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setToolTipValue('Copied!');
  };

  useEffect(() => {
    if (!visible) {
      setLink('');
      setAccessType(null);
    }
  }, [visible]);

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
        header="Share this tournament with others"
        visible={visible}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        onHide={() => setVisible(false)}
      >
        <div className="grid">
          <div className="col-12">
            <div className="surface-0 p-4 shadow-2 border-round">
              <div className="flex justify-content-between align-items-center flex-wrap mb-3">
                <div className="flex flex-column align-items-start">
                  <Dropdown
                    placeholder="Select a role"
                    options={[
                      { label: "Shared Admin", value: "sharedAdmins" },
                      { label: "Guest", value: "guest" },
                    ]}
                    className="w-auto md:w-15rem"
                    value={accessType}
                    onChange={(e) => setAccessType(e.value)}
                  />
                </div>
                <div>
                  <Button
                    icon="pi pi-link"
                    rounded
                    text
                    tooltip="Generate link"
                    tooltipOptions={{ position: "top" }}
                    loading={loading}
                    onClick={() => generateLink()}
                    disabled={!uniqueId || !accessType}
                  />
                  <Button
                    icon="pi pi-copy"
                    rounded
                    text
                    tooltip={toolTipValue}
                    tooltipOptions={{ position: "top" }}
                    disabled={!link}
                    onClick={() => copyToClipboard()}
                  />
                </div>
              </div>
              <InputTextarea
                readOnly
                value={link}
                className="w-full border-dashed border-2 border-300"
                style={{ height: "12rem" }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

ShareTournament.propTypes = {
  uniqueId: PropTypes.string.isRequired,
};
