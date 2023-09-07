import { Sidebar } from "primereact/sidebar";
import PropTypes from "prop-types";
import { useAuthStore } from "../../../../hooks";
import moment from "moment";
import friendRequest from "../../../../assets/img/friendRequest.jpg";

export const Notifications = ({ visible, onCloseMenu }) => {
  const {
    myNotifications,
    startDeleteNotifications,
    startAcceptFriendRequest,
  } = useAuthStore();

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
        onHide={() => {
          onCloseMenu();
        }}
        icons={custonIcons}
        className="w-full md:w-28rem"
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
        <div className="flex flex-column mt-3">
          <span className="text-color-secondary text-center font-medium mb-5">
            You have {myNotifications.filter((i) => !i.read).length} new
            notifications
          </span>
          <ul className="list-none m-0 p-0">
            {myNotifications.map(
              (notification) => (
                (
                  <li
                    key={notification.id}
                    className="border-bottom-1 surface-border py-2"
                  >
                    <a className="flex align-items-center p-2 border-round">
                      <img
                        src={friendRequest}
                        className="mr-3"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          border: "1px solid #35b2b2",
                        }}
                      />
                      <div>
                        <span className="block text-900 mb-1">
                          {notification.message}
                        </span>
                        <p className="m-0 text-600 font-medium text-sm">
                          {moment(notification.createdAt).utc().fromNow()}
                        </p>
                        <div className="flex flex-row mt-1">
                          <button
                            onClick={() =>
                              startAcceptFriendRequest(notification.meta, notification.id)
                            }
                            aria-label="Let's see"
                            className="p-button p-component p-button-text p-2 mr-3"
                          >
                            <span className="p-button-label p-c">Accept</span>
                          </button>

                          <button
                            onClick={() =>
                              startDeleteNotifications(notification.id)
                            }
                            className="p-button p-component p-button-text text-500 p-2"
                          >
                            <span className="p-button-label p-c">Declined</span>
                          </button>
                        </div>
                      </div>
                    </a>
                  </li>
                )
              )
            )}
          </ul>
        </div>
      </Sidebar>
    </>
  );
};

Notifications.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCloseMenu: PropTypes.func.isRequired,
};
