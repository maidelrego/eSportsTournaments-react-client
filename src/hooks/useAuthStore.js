import { useDispatch, useSelector } from "react-redux"
import { doAPIGet, doAPIPost } from "../services/api";
import { onChenking, onLogin, onLogout } from "../store/auth/authSlice";



export const useAuthStore = () => {
    
    const { authStatus, user } = useSelector( state => state.auth );
   
    const dispatch = useDispatch();

    const startLogin = async ({email, password }) =>{
        
        dispatch(onChenking());

        await doAPIPost("auth/login", {email, password }).then((res) => {
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
    const startCheckAuthToken = async () =>{
        
        const token = localStorage.getItem('token');
        if(!token) return dispatch(onLogout());

        await doAPIGet("auth/check-auth-status").then((res) => {
            if (res.status === 200) {
              const { token, ...user } = res.data;

              localStorage.setItem('token',token);
              dispatch(onLogin(user));   
         
            } else {
              localStorage.clear();
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
        dispatch,
        startCheckAuthToken
    }

}
