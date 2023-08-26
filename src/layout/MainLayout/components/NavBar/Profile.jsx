import { useState, useRef, useEffect } from "react";
import { Inplace, InplaceDisplay, InplaceContent } from "primereact/inplace";
import PropTypes from "prop-types";
import { Message } from "primereact/message";
import { Avatar } from "primereact/avatar";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { notificationsStatus, onLogout } from "../../../../store/auth/authSlice";
import { useAuthStore } from "../../../../hooks";

export const Profile = ({ visible, onCloseMenu }) => {
  const [searchFriend, setSearchFriend] = useState('');
  const [friendRequestState, setFriendRequestState] = useState({
    status: '',
    msg: ''
  });

  const {
    user,
    friends,
    dispatch,
    startDisconnectToGeneral,
    startUpdateProfile,
    startSendGenericRequest,
    imageUpload,
  } = useAuthStore();
  const [fullName, setFullName] = useState(user.fullName);
  const fileUpload = useRef(null);

  const handleLogout = () => {
    dispatch(onLogout());
    localStorage.clear();
    startDisconnectToGeneral();
  };

  const updateProfile = () => {
    startUpdateProfile({ fullName: fullName });
  };

  const profileUpload = async (e) => {
    await imageUpload(e.files[0]);
    fileUpload.current.clear();
  };

  const sendFriendRequest = async () => {
    const state = await startSendGenericRequest(searchFriend, notificationsStatus.friend_request);
    setFriendRequestState(state);
  }

  // Reset the search friend state
  useEffect(() => {
    setFriendRequestState({});
  }, [searchFriend]);

  const custonIcons = (
    <div className="flex align-items-center justify-content-between">
      <h2>Profile</h2>
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
        <div>
          <TabView
            pt={{
              nav: {
                className: "flex align-items-center justify-content-center",
              },
            }}
          >
            <TabPanel header="Friends" leftIcon="pi pi-users mr-2">
              <ul className="list-none p-0 m-0 mt-3">
                {friends?.map((friend) => (
                  <li className="py-2" key={friend.id}>
                    <a className="p-ripple flex align-items-center p-2 cursor-pointer border-round hover:surface-200 transition-colors transition-duration-150">
                      <img
                        src={friend.avatar}
                        className="mr-3 flex-shrink-0 p-overlay-badge"
                        alt="sport-shoe"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          border: "1px solid #35b2b2",
                        }}
                      />
                      <div>
                        <span className="block text-900 mb-1">
                          {friend.fullName}
                        </span>
                        <p className="m-0 text-600 font-medium text-sm">
                          {friend.nickname}
                        </p>
                      </div>
                      <div
                        className={`ml-auto border-circle w-1rem h-1rem m-2 ${
                          friend.online ? "bg-green-500" : "bg-gray-500"
                        }`}
                      ></div>
                    </a>
                  </li>
                ))}
              </ul>
            </TabPanel>
            <TabPanel header="Add Friends" leftIcon="pi pi-users mr-2">
              <div className="flex flex-column justify-content-between h-full">
                <span className="p-input-icon-left mt-3">
                  <i className="pi pi-search" />
                  <InputText
                    name="searchFriend"
                    value={searchFriend}
                    onChange={(e) => setSearchFriend(e.target.value)}
                    placeholder="You can add friends with their nickname"
                    className="w-full"
                    pt={{
                      root: { className: "border-primary-400" },
                    }}
                  />
                </span>
                {
                  friendRequestState.status === 'success' ? <Message severity="success" text={friendRequestState.msg} className="mt-2" /> : null
                }
                {
                  friendRequestState.status === 'error' ? <Message severity="error" text={friendRequestState.msg} className="mt-2" /> : null
                }
                
                <div className="mt-3">
                  <Button
                    label="Send Friend Request"
                    className="w-full"
                    icon="pi pi-send"
                    onClick={() => sendFriendRequest()}
                  />
                </div>

                <div className="mt-3">
                  <h3 className="text-900">Friend Requests</h3>
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Settings" leftIcon="pi pi-cog mr-2">
              <div className="flex align-items-center justify-content-between flex-column mt-3">
                <Avatar
                  image={user.avatar}
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    border: "1px solid #35b2b2",
                  }}
                  shape="circle"
                  className="mt-3 py-2 px-2"
                />

                <Inplace
                  closable
                  closeIcon="pi pi-check"
                  onClose={() => updateProfile()}
                  className="mt-3 mb-2"
                >
                  <InplaceDisplay>
                    <Button
                      label={fullName}
                      iconPos="right"
                      icon="pi pi-user-edit"
                    />
                  </InplaceDisplay>
                  <InplaceContent>
                    <InputText
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoFocus
                    />
                  </InplaceContent>
                </Inplace>
                <p className="m-0 text-600 font-medium text-sm">
                  {user?.nickname}
                </p>
                <div className="mt-5">
                  <FileUpload
                    mode="basic"
                    name="image"
                    customUpload={true}
                    uploadHandler={(e) => profileUpload(e)}
                    ref={fileUpload}
                    accept="image/*"
                    maxFileSize={311000}
                    chooseLabel="Upload Avatar"
                    auto
                  />
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
        <div className="py-4 border-top-1 surface-border flex">
          <Button
            onClick={() => {
              handleLogout();
            }}
            label="Logout"
            className="w-full"
            icon="pi pi-power-off"
          />
        </div>
      </Sidebar>
    </>
  );
};

Profile.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCloseMenu: PropTypes.func.isRequired,
};
