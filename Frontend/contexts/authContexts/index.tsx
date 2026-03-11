"use client"

import { createContext, useContext, useEffect, useState } from "react";
import {auth} from "../../FireBase/FireBase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext<{
    currentUser: any;
    userLoggedIn: boolean;
    isLoading: boolean;
} | null>(null);

export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider({children}){
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setuserLoggedIn] = useState(false);
    const[isLoading,setisLoading] = useState(true);

    const initializeUser = (user) => {
        if (user) {
            setCurrentUser(user);
            setuserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setuserLoggedIn(false);
        }
        setisLoading(false);
    };

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    },[])

    const value = {
        currentUser,
        userLoggedIn,
        isLoading
    }
    return(
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
};