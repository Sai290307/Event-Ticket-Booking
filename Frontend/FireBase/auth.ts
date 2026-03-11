import { auth } from "./FireBase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export const docreateUserWithEmailAndPassword = async (email:string, password:string) =>{
    return createUserWithEmailAndPassword(auth,email,password)
}

export const dosignInWithEmailAndPassword = async (email:string, password:string) =>{
    return signInWithEmailAndPassword(auth,email,password)
}

export const doSignInWithGoogle = async () =>{
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth,provider);

    return result;
}

export const doSignOut = () =>{
    return auth.signOut();
}
