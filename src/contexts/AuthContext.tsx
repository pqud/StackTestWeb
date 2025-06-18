"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType{
    token: string | null;
    setToken: (token: string ) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined > (undefined);

export function AuthProvider({ children }: {children:React.ReactNode}){
    const [token, setTokenState] = useState<string|null>(null);

    //컴포넌트 마운트 시 로컬 스토리지에서 토큰 로드
    useEffect(()=>{
        const savedToken = localStorage.getItem('authToken');
        if(savedToken){
            setTokenState(savedToken);
        }
    }, []);

    const setToken = (newToken:string)=>{
        localStorage.setItem('authToken', newToken);
        setTokenState(newToken);
    };

    const logout= () =>{
        localStorage.removeItem('authToken');
        setTokenState(null);
    }

    return (
        <AuthContext. Provider value={{
            token,
            setToken,
            logout,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext. Provider>
    );
}

export function useAuth(){
    const context = useContext (AuthContext);
    if(context ===undefined){
        throw new Error('useAuth muse be used within an AuthProvider');
    }
    return context;
}