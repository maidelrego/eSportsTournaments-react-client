import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { FirebaseAuth } from "./config";


const googleProvider = new GoogleAuthProvider();

export const singInWithGoogle = async () => {
   
  try {
        
    const result = await signInWithPopup(FirebaseAuth, googleProvider);
    //const credentials = GoogleAuthProvider.credentialFromResult( result ); // util para obtener los tokens
         
    const {displayName, email, photoURL, uid} =  result.user;

    return {
      ok: true,
      displayName, email, photoURL, uid
    }
 
  
  } catch (error) {
          
    return {      
      ok: false,
      errorMessage: error.message

    }

  }

}

export const registerWithUserAndPassword = async ({email,password,displayName}) => {
   
  try {
     
    const result = await createUserWithEmailAndPassword(FirebaseAuth, email, password);

    const {photoURL, uid} =  result.user;

    await updateProfile(FirebaseAuth.currentUser, { displayName })
       
    return {
      ok: true,
      photoURL, uid, email, displayName
    }


  } catch (error) {
    return {      
      ok: false,
      errorMessage: error.message

    }

  }

}
export const singInWithUserAndPassword = async ({email,password}) => {
   
  try {
     
    const result = await signInWithEmailAndPassword(FirebaseAuth, email, password);

    const {photoURL, uid, displayName} =  result.user;
       
    return {
      ok: true,
      photoURL, uid, email, displayName
    }


  } catch (error) {
    return {      
      ok: false,
      errorMessage: error.message

    }

  }

}
export const logoutFirebase = async () => {
  return await FirebaseAuth.signOut();
}