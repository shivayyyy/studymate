import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

interface AuthContextType {
    session: any | null;
    user: any | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { isLoaded: isUserLoaded, user } = useUser();
    const { isLoaded: isAuthLoaded, sessionId } = useClerkAuth();
    const { signOut: clerkSignOut } = useClerk();

    const loading = !isUserLoaded || !isAuthLoaded;

    const signOut = async () => {
        await clerkSignOut();
    };

    // Supabase returns user.email and user.id. Clerk returns user.id and user.primaryEmailAddress.
    const proxyUser = user ? { 
        ...user, 
        id: user.id, 
        email: user.primaryEmailAddress?.emailAddress 
    } : null;

    // Construct a mock session to maintain compatibility
    const session = sessionId ? { access_token: sessionId, user: proxyUser } : null;

    return (
        <AuthContext.Provider value={{ session, user: proxyUser, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
