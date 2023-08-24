// import "./navBar.css";
import logo from "../../../../assets/img/logo.png";
import { useAuthStore } from "../../../../hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { Badge } from "primereact/badge";
import { Profile } from "./Profile";
import { Notifications } from "./Notifications";

export const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [notificationsMenu, setNotificationsMenu] = useState(false);
  const { user, startGetConnectedClients, myNotifications } = useAuthStore();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const linkIsActive = (path) => {
    return location.pathname === path ? "bg-gray-800" : "";
  };

  const doNavigation = (path) => {
    navigate(path);
    setMobileMenu(false);
  };

  const toggleMobileProfile = () => {
    setMobileMenu((prevVisible) => !prevVisible);
    startGetConnectedClients();
  };

  const toggleProfile = () => {
    setProfileMenu((prevVisible) => !prevVisible);
    startGetConnectedClients();
  };

  const closeProfile = () => {
    setProfileMenu(false);
  };

  const toggleNotifications = () => {
    setNotificationsMenu((prevVisible) => !prevVisible);
  };

  const closeNotificationsMenu = () => {
    setNotificationsMenu(false);
  };

  return (
    <>
      <div
        className="bg-gray-900 py-3 px-6 shadow-2 flex align-items-center justify-content-between relative lg:static border-bottom-1 border-gray-800"
        style={{ minHeight: "84px" }}
      >
        <img src={logo} alt="logo" height="60" className="mr-0 logo lg:mr-6" />
        <a
          onClick={() => toggleMobileProfile()}
          className="p-ripple cursor-pointer block lg:hidden text-700"
        >
          <i className="pi pi-bars text-4xl"></i>
        </a>
        <div
          ref={menuRef}
          className={`menu bg-gray-900 align-items-center flex-grow-1 justify-content-between ${
            mobileMenu ? "" : "hidden"
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
              <li className="border-gray-800 lg:border-top-none mr-3">
                <a
                  onClick={() => toggleNotifications()}
                  className="p-ripple flex px-6 p-3 lg:px-3 lg:pt-3 align-items-center hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full"
                >
                  <i
                    className="pi pi-bell p-overlay-badge text-white"
                    style={{ fontSize: "1.7rem" }}
                  >
                    {
                      myNotifications.filter(i => !i.read).length > 0 && (
                        <Badge value={myNotifications.filter(i => !i.read).length} style={{ fontSize: "13px" }}></Badge>
                      )
                    }
                  </i>
                  <div className="text-white font-medium ml-2 block lg:hidden">
                    Notifications
                  </div>
                </a>
              </li>
              <li className="border-gray-800 lg:border-top-none">
                <a
                  onClick={() => toggleProfile()}
                  className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 w-full"
                >
                  <img
                    src={user.avatar}
                    alt="roma-layout"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #fff",
                    }}
                    className="border-circle"
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
      <Profile visible={profileMenu} onCloseMenu={closeProfile} />
      <Notifications
        visible={notificationsMenu}
        onCloseMenu={closeNotificationsMenu}
      />
    </>
  );
};
