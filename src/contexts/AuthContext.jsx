import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from "../supabaseClient.jsx"; 

const AuthContext = createContext(undefined); // Explicitly pass undefined as the default value

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(null); // NEW: State to store the access token
    const [loading, setLoading] = useState(true); // To indicate initial session loading

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
            }
            setUser(session?.user || null);
            setAuthToken(session?.access_token || null); // NEW: Set the access token
            setLoading(false);
        };

        fetchSession();

        // Listen for auth state changes (login, logout, token refresh)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            setAuthToken(session?.access_token || null); // NEW: Update access token on state change
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
        // No need to manually set user/authToken here, onAuthStateChange will handle it
        return { data, error };
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        // No need to manually set user/authToken here, onAuthStateChange will handle it
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        // No need to manually clear user/authToken here, onAuthStateChange will handle it
        return { error };
    };

    const signInWithOAuth = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/dashboard',
            },
        });
        return { data, error };
    };

    return (
        <AuthContext.Provider value={{ user, loading, authToken, signIn, signUp, signOut, signInWithOAuth, supabase }}> {/* NEW: authToken added to value */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    // Add a check to ensure the context is not undefined
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
