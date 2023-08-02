// import "./navBar.css";
import logo from "../../../../assets/img/logo.png";
import { useAuthStore } from "../../../../hooks";
import { onLogout } from "../../../../store/auth/authSlice";
import { Menubar } from "primereact/menubar";
import { useNavigate, useLocation } from 'react-router-dom'

export const Navbar = () => {
  const { user , dispatch} = useAuthStore();

  const handleLogout = () => {
    dispatch(onLogout());
    localStorage.clear();
  };

  const navigate = useNavigate();
  const location = useLocation();
  const linkIsActive = (path) => {
    return location.pathname === path ? "activeLinkClass" : "";
  }

  const start = <img src={logo} alt="logo" height="60" className="mr-5 logo" />

  const items = [
    {
      label: 'Create Tourney',
      icon: 'pi pi-fw pi-plus',
      command: () => navigate('/create-tourney'),
      className: `mr-3 ${linkIsActive('/create-tourney')}`  
    },
    {
      label: 'Join Tourney',
      icon: 'pi pi-sign-in',
      command: () => navigate('/join-tourney'),
      className: `mr-3 ${linkIsActive('/join-tourney')}`
    },
    {
      label: 'My Tourneys',
      icon: 'pi pi-calendar',
      command: () => navigate('/my-tourneys'),
      className: `mr-3 ${linkIsActive('/my-tourneys')}`
    },
    {
      label: 'Contact Us',
      icon: 'pi pi-envelope',
      command: () => navigate('/contact-us'),
      className: `mr-3 ${linkIsActive('/contact-us')}`
    },
    {
      label: user?.fullName,
      icon: 'pi pi-fw pi-user',
      className: 'mr-3'
    },
    {
      label: 'Logout',
      icon: 'pi pi-fw pi-power-off',
      command: () => handleLogout()
    }
  ]

  return (
    <>
      <Menubar className="menuBar" model={items} start={start}/>
    </>
  );
};
