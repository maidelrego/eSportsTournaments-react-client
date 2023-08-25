import { Sidebar } from "primereact/sidebar";
import PropTypes from "prop-types";
import { useAuthStore } from "../../../../hooks";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useRef, createRef } from "react";
import { Badge } from "primereact/badge";
import moment from 'moment'

export const Notifications = ({ visible, onCloseMenu }) => {
  const { myNotifications, startMarkNotificationAsRead, startDeleteNotifications } = useAuthStore();
  const elementsRef = useRef(myNotifications.map(() => createRef()));

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
            {myNotifications.map((notification, index) => (
              console.log(notification),
              <li key={notification.id}>
                <a>
                  <div className="border-2 border-round surface-border mb-3 p-3">
                    <div className="flex justify-content-between align-items-center">
                      <div>
                        {!notification.read ? (
                          <Badge
                            style={{
                              width: "15px",
                              height: "15px",
                              minWidth: "15px",
                              marginRight: "20px",
                            }}
                          ></Badge>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="flex flex-column">
                        <span className="font-semibold">
                          {notification.message}
                        </span>
                        <span className="text-color-secondary mt-0">
                          { moment(notification.createdAt).fromNow() }
                        </span>
                        <div className="flex flex-row mt-3">
                          <button
                            aria-label="Let's see"
                            className="p-button p-component p-button-text p-2 mr-3"
                          >
                            <span className="p-button-label p-c">Accept</span>
                          </button>
                          <button
                            onClick={() => startDeleteNotifications(notification.id)}
                            className="p-button p-component p-button-text text-500 p-2"
                          >
                            <span className="p-button-label p-c">Declined</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <Menu
                          model={[
                            {
                              label: "Options",
                              items: [
                                {
                                  command: () => {
                                    startMarkNotificationAsRead(notification.id);
                                  },
                                  template: (item, options) => {
                                    return (
                                      <div
                                        onClick={(e) => options.onClick(e)}
                                        className="flex flex-row align-items-center justify-content-start hover:bg-gray-200 cursor-pointer transition-colors transition-duration-150"
                                      >
                                        <div className="py-3 px-3 ml-2">
                                          <span>
                                            <i className="pi pi-check-circle text-color-secondary"></i>
                                          </span>
                                          <span className="ml-3">
                                            Mark as read
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  },
                                },
                                {
                                  command: () => {
                                    startDeleteNotifications(notification.id);
                                  },
                                  template: (item, options) => {
                                    return (
                                      <div
                                        onClick={(e) => options.onClick(e)}
                                        className="flex flex-row align-items-center justify-content-start hover:bg-gray-200 cursor-pointer transition-colors transition-duration-150"
                                      >
                                        <div className="py-3 px-3 ml-2">
                                          <span>
                                            <i className="pi pi-trash text-color-secondary"></i>
                                          </span>
                                          <span className="ml-3">Delete</span>
                                        </div>
                                      </div>
                                    );
                                  },
                                },
                              ],
                            },
                          ]}
                          popup
                          ref={elementsRef.current[index]}
                          id="popup_menu_left"
                          pt={{
                            root: {
                              className: "bg-white",
                            },
                            submenuHeader: {
                              className: "bg-white",
                            },
                          }}
                        />
                        <Button
                          icon="pi pi-ellipsis-v"
                          rounded
                          text
                          className="mr-2"
                          onClick={(event) =>
                            elementsRef.current[index].current.toggle(event)
                          }
                          aria-controls="popup_menu_left"
                          aria-haspopup
                          size="large"
                        />
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
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
