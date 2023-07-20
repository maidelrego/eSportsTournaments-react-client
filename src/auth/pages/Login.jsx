import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const Login = () => {

  const navigate = useNavigate();
  const { login } = useContext(AuthContext)

  const onLogin = () => {
    const lastPath = localStorage.getItem('lastPath') || '/';
    login('Jorge');
    console.log('Login');
    navigate(lastPath, { replace: true });
  }

  return (
    <>
     <div className="container mt-5">
      <h1>Login</h1>
      <hr />

      <button onClick={() => onLogin()} >Login</button>

     </div>
    </>
  )
}
