import { Sidebar } from "primereact/sidebar";
import PropTypes from "prop-types";

export const Notifications = ({ visible, onCloseMenu }) => {

  const custonIcons = (
    <div className="flex align-items-center justify-content-between">
      <h2>Notifications</h2>
    </div>
  );

  return (
    <>
      <Sidebar
        visible={visible}
        position="right"
        onHide={() => {onCloseMenu()}}
        icons={custonIcons}
        className="w-full md:w-20rem"
        pt={{
          header: {
            className:
              "bg-gray-900 text-white flex align-items-center justify-content-between py-2",
          },
          content: {
            className: "flex flex-column justify-content-between h-full",
          },
        }}
      >
        <div>
          
        </div>
      </Sidebar>
    </>
  );
};

Notifications.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCloseMenu: PropTypes.func.isRequired,
};
