import { useDispatch, useSelector } from "react-redux"
import { doAPIPost } from "../services/api";
import { onLogin, onLogout } from "../store/auth/authSlice";



export const useAuthStore = () => {
    
    const { authStatus, user } = useSelector( state => state.auth );
   
    const dispatch = useDispatch();

    const startLogin = async ({email, password }) =>{
         
        doAPIPost("auth/login", {email, password }).then((res) => {
            if (res.status === 201) {
              const { token, ...user } = res.data;
              delete user.password;  
              localStorage.setItem('token',token);
              dispatch(onLogin(user));   
         
            } else {
               dispatch(onLogout(res.message))
 
            }
          });
    }





    return {
            
        //properties
        authStatus,
        user,

        //methods
        startLogin,
        dispatch
    }

}
