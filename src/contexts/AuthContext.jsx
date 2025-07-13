// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import  supabase  from "../supabaseClient.jsx"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To indicate initial session loading

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
            }
            setUser(session?.user || null);
            setLoading(false);
        };

        fetchSession();

        // Listen for auth state changes (login, logout, token refresh)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            setLoading(false);
            console.log('Auth state changed:', event, session);
        });

        // Cleanup the listener on component unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const signInWithOAuth = async (provider) => {
        // Supabase will redirect to the OAuth provider, then back to your specified URL
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/dashboard', // Redirect to dashboard after successful OAuth
            },
        });
        return { data, error };
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithOAuth, supabase }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);