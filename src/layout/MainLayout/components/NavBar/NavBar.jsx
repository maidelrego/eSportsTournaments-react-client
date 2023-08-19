// import "./navBar.css";
import logo from "../../../../assets/img/logo.png";
import { useAuthStore } from "../../../../hooks";
import { onLogout } from "../../../../store/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { useRef, useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";

export const Navbar = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { user, dispatch } = useAuthStore();

  const handleLogout = () => {
    dispatch(onLogout());
    localStorage.clear();
  };

  const menuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const linkIsActive = (path) => {
    return location.pathname === path ? "bg-gray-800" : "";
  };

  const doNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  const toggleMenu = () => {
    setMenuVisible((prevVisible) => !prevVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const custonIcons = (
    <div className="flex align-items-center justify-content-between">
      <h2>Profile</h2>
    </div>
  );

  return (
    <>
      <div
        className="bg-gray-900 py-3 px-6 shadow-2 flex align-items-center justify-content-between relative lg:static border-bottom-1 border-gray-800"
        style={{ minHeight: "84px" }}
      >
        <img src={logo} alt="logo" height="60" className="mr-0 logo lg:mr-6" />
        <a
          onClick={() => toggleMenu()}
          className="p-ripple cursor-pointer block lg:hidden text-700"
        >
          <i className="pi pi-bars text-4xl"></i>
        </a>
        <div
          ref={menuRef}
          className={`menu bg-gray-900 align-items-center flex-grow-1 justify-content-between ${
            menuVisible ? "" : "hidden"
          } lg:flex absolute lg:static w-full left-0 top-100 px-6 lg:px-0 z-5 shadow-2 lg:shadow-none`}
        >
          <section></section>
          <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer">
            <li className="mr-2">
              <a
                onClick={() => doNavigation("/")}
                className={`${linkIsActive(
                  "/"
                )} flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full`}
              >
                <i
                  className="pi pi-home mr-2"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="text-lg">Home</span>
              </a>
            </li>
            <li className="mr-2">
              <a
                onClick={() => doNavigation("/create-tourney")}
                className={`${linkIsActive(
                  "/create-tourney"
                )} flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full`}
              >
                <i
                  className="pi pi-fw pi-plus mr-2"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="text-lg">Create Tourney</span>
              </a>
            </li>
            <li className="mr-2">
              <a
                onClick={() => doNavigation("/join-tourney")}
                className={`${linkIsActive(
                  "/join-tourney"
                )} flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full`}
              >
                <i
                  className="pi pi-sign-in mr-2"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="text-lg">Join Tourney</span>
              </a>
            </li>
            <li className="mr-2">
              <a
                onClick={() => doNavigation("/my-tourneys")}
                className={`${linkIsActive(
                  "/my-tourneys"
                )} flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full`}
              >
                <i
                  className="pi pi-calendar mr-2"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="text-lg">My Tourneys</span>
              </a>
            </li>
            <li className="mr-2">
              <a
                onClick={() => doNavigation("/contact-us")}
                className={`${linkIsActive(
                  "/contact-us"
                )} flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full`}
              >
                <i
                  className="pi pi-envelope mr-2"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="text-lg">Contact Us</span>
              </a>
            </li>
          </ul>
          <div className="flex justify-content-between lg:block border-top-1 lg:border-top-none surface-border py-3 lg:py-0 mt-3 lg:mt-0">
            <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
              <li className="border-gray-800 lg:border-top-none">
                <a
                  onClick={() => setVisible(true)}
                  className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full"
                >
                  <Avatar
                    image="https://cdn.vuetifyjs.com/images/john.jpg"
                    style={{ width: "40px", height: "40px" }}
                    shape="circle"
                  />
                  <div className="text-white font-medium ml-2 block lg:hidden">
                    {user?.fullName}
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Sidebar
        visible={visible}
        position="right"
        onHide={() => setVisible(false)}
        icons={custonIcons}
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
                className: "flex align-items-center justify-content-between",
              },
            }}
          >
            <TabPanel header="Settings" leftIcon="pi pi-cog mr-2">
              <div className="flex align-items-center justify-content-between flex-column mt-3">
                <Avatar
                  image="https://cdn.vuetifyjs.com/images/john.jpg"
                  style={{ width: "80px", height: "80px" }}
                  shape="circle"
                  className="mt-3"
                />
                <span className="mt-3 mb-2 text-xl font-bold">
                  {user?.fullName}
                </span>
                <p className="m-0 text-600 font-medium text-sm">{user?.nickname}</p>
                <div className="mt-5">
                  <FileUpload
                    mode="basic"
                    name="demo[]"
                    url="/api/upload"
                    accept="image/*"
                    maxFileSize={1000000}
                    chooseLabel="Upload Avatar"
                    auto
                  />
                </div>
              </div>
              
            </TabPanel>
            <TabPanel header="Friends" leftIcon="pi pi-users mr-2">
              <h2 className="text-center">Coming Soon....</h2>
              {/* <ul className="list-none p-0 m-0 mt-3">
                <li className="py-2">
                  <a className="p-ripple flex align-items-center p-2 cursor-pointer border-round hover:surface-200 transition-colors transition-duration-150">
                    <img
                      src="https://blocks.primereact.org/demo/images/blocks/products/skateboard.png"
                      className="mr-3 flex-shrink-0 p-overlay-badge"
                      alt="sport-shoe"
                      style={{ width: "60px", height: "60px" }}
                    />
                    <div>
                      <span className="block text-900 mb-1">Rafete</span>
                      <p className="m-0 text-600 font-medium text-sm">#47122</p>
                    </div>
                    <div className="ml-auto border-circle w-1rem h-1rem m-2 bg-green-500"></div>
                  </a>
                </li>
                <li className="py-2">
                  <a className="p-ripple flex align-items-center p-2 cursor-pointer border-round hover:surface-200 transition-colors transition-duration-150">
                    <img
                      src="https://blocks.primereact.org/demo/images/blocks/products/juice.png"
                      className="mr-3 flex-shrink-0 p-overlay-badge"
                      alt="sport-shoe"
                      style={{ width: "60px", height: "60px" }}
                    />
                    <div>
                      <span className="block text-900 mb-1">Alex</span>
                      <p className="m-0 text-600 font-medium text-sm">#47122</p>
                    </div>
                    <div className="ml-auto border-circle w-1rem h-1rem m-2 surface-600"></div>
                  </a>
                </li>
                <li className="py-2">
                  <a className="p-ripple flex align-items-center p-2 cursor-pointer border-round hover:surface-200 transition-colors transition-duration-150">
                    <img
                      src="https://blocks.primereact.org/demo/images/blocks/products/skateboard.png"
                      className="mr-3 flex-shrink-0 p-overlay-badge"
                      alt="sport-shoe"
                      style={{ width: "60px", height: "60px" }}
                    />
                    <div>
                      <span className="block text-900 mb-1">Harry</span>
                      <p className="m-0 text-600 font-medium text-sm">#47122</p>
                    </div>
                    <div className="ml-auto border-circle w-1rem h-1rem m-2 surface-600"></div>
                  </a>
                </li>
                <li className="py-2">
                  <a className="p-ripple flex align-items-center p-2 cursor-pointer border-round hover:surface-200 transition-colors transition-duration-150">
                    <img
                      src="https://blocks.primereact.org/demo/images/blocks/products/skateboard.png"
                      className="mr-3 flex-shrink-0 p-overlay-badge"
                      alt="sport-shoe"
                      style={{ width: "60px", height: "60px" }}
                    />
                    <div>
                      <span className="block text-900 mb-1">Michel</span>
                      <p className="m-0 text-600 font-medium text-sm">#47122</p>
                    </div>
                    <div className="ml-auto border-circle w-1rem h-1rem m-2 bg-green-500"></div>
                  </a>
                </li>
              </ul> */}
            </TabPanel>
          </TabView>
        </div>
        <div className="mx-4 py-4 border-top-1 surface-border flex">
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
