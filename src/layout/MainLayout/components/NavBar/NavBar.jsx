import "./navBar.css";
import { Link, NavLink } from "react-router-dom";
import logo from "../../../../assets/img/logo.png";
import { useAuthStore } from "../../../../hooks/useAuthStore";
import { onLogout } from "../../../../store/auth/authSlice";

export const Navbar = () => {
  const { user , dispatch} = useAuthStore();

   const handleLogout = () => {
     dispatch(onLogout());
     localStorage.clear();
  };

  return (
    <>
      <div>
        <nav className="menu-container">
          <input type="checkbox" aria-label="Toggle menu" />
          <span></span>
          <span></span>
          <span></span>

          <Link className="menu-logo" to="/">
            <img
              src={logo}
              alt="My Awesome Website"
            />
          </Link>

          <div className="menu">
            <ul>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `nav-item nav-link ${isActive ? "active" : ""} `
                  }
                  to="/create-tourney"
                >
                  Create Tourney
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `nav-item nav-link ${isActive ? "active" : ""} `
                  }
                  to="/my-tourneys"
                >
                  My Tourneys
                </NavLink>
              </li>
            </ul>
            <ul>
              <li style={{cursor: 'pointer'}}>
                <a>
                  <i
                    className="pi pi-user mr-2"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                  {user?.fullName}
                </a>
              </li>
              <li style={{cursor: 'pointer'}}>
                <a onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};
