import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [authClient, setAuthClient] = useState(null);
    const [actor, setActor] = useState(null);
    const [principal, setPrincipal] = useState(null);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const client = await AuthClient.create();
            setAuthClient(client);

            if (await client.isAuthenticated()) {
                const identity = client.getIdentity();
                const userPrincipal = identity.getPrincipal();

                await setupActor(identity);
                setPrincipal(userPrincipal);
                setIsAuthenticated(true);

                // Fetch user data
                await fetchUserData(userPrincipal);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            toast.error('Authentication initialization failed');
        } finally {
            setIsLoading(false);
        }
    };

    const setupActor = async (identity) => {
        const agent = new HttpAgent({
            identity,
            host: process.env.NODE_ENV === 'production'
                ? 'https://ic0.app'
                : 'http://localhost:8000'
        });

        if (process.env.NODE_ENV !== 'production') {
            await agent.fetchRootKey();
        }

        // Create actor with the backend canister
        const canisterId = process.env.REACT_APP_CANISTER_ID || 'your-canister-id';
        const actorInstance = Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });

        setActor(actorInstance);
        return actorInstance;
    };

    const login = async () => {
        try {
            setIsLoading(true);
            const client = authClient || await AuthClient.create();

            await client.login({
                identityProvider: process.env.NODE_ENV === 'production'
                    ? 'https://identity.ic0.app'
                    : `http://localhost:8000/?canisterId=${process.env.REACT_APP_INTERNET_IDENTITY_CANISTER_ID}`,
                onSuccess: async () => {
                    const identity = client.getIdentity();
                    const userPrincipal = identity.getPrincipal();

                    await setupActor(identity);
                    setPrincipal(userPrincipal);
                    setIsAuthenticated(true);

                    // Check if user exists, if not create one
                    await initializeUser(userPrincipal);

                    toast.success('Successfully logged in!');
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (authClient) {
                await authClient.logout();
            }
            setIsAuthenticated(false);
            setUser(null);
            setActor(null);
            setPrincipal(null);
            toast.success('Successfully logged out');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        }
    };

    const fetchUserData = async (userPrincipal) => {
        try {
            if (actor) {
                const userData = await actor.get_user(userPrincipal);
                if (userData && userData.length > 0) {
                    setUser(userData[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const initializeUser = async (userPrincipal) => {
        try {
            if (actor) {
                const existingUser = await actor.get_user(userPrincipal);

                if (!existingUser || existingUser.length === 0) {
                    // Create new user with default data
                    const username = `user_${userPrincipal.toText().slice(-8)}`;
                    const newUser = await actor.create_user(
                        username,
                        'Welcome to BlockVerse!',
                        ''
                    );
                    setUser(newUser);
                } else {
                    setUser(existingUser[0]);
                }
            }
        } catch (error) {
            console.error('Error initializing user:', error);
        }
    };

    const value = {
        isAuthenticated,
        isLoading,
        user,
        actor,
        principal,
        login,
        logout,
        setUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// IDL Factory (simplified - you would generate this from your Candid file)
const idlFactory = ({ IDL }) => {
    const User = IDL.Record({
        'id': IDL.Principal,
        'username': IDL.Text,
        'bio': IDL.Text,
        'avatar_url': IDL.Text,
        'followers_count': IDL.Nat64,
        'following_count': IDL.Nat64,
        'posts_count': IDL.Nat64,
        'balance': IDL.Nat64,
        'created_at': IDL.Nat64,
        'updated_at': IDL.Nat64,
    });

    const Post = IDL.Record({
        'id': IDL.Text,
        'author': IDL.Principal,
        'content': IDL.Text,
        'media_url': IDL.Opt(IDL.Text),
        'likes_count': IDL.Nat64,
        'comments_count': IDL.Nat64,
        'shares_count': IDL.Nat64,
        'is_shared': IDL.Bool,
        'original_post_id': IDL.Opt(IDL.Text),
        'share_comment': IDL.Opt(IDL.Text),
        'created_at': IDL.Nat64,
        'updated_at': IDL.Nat64,
    });

    const Comment = IDL.Record({
        'id': IDL.Text,
        'post_id': IDL.Text,
        'author': IDL.Principal,
        'content': IDL.Text,
        'likes_count': IDL.Nat64,
        'created_at': IDL.Nat64,
    });

    return IDL.Service({
        'create_user': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Variant({ 'Ok': User, 'Err': IDL.Text })], []),
        'get_user': IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
        'create_post': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Variant({ 'Ok': Post, 'Err': IDL.Text })], []),
        'get_feed': IDL.Func([IDL.Principal, IDL.Nat64, IDL.Nat64], [IDL.Vec(Post)], ['query']),
        'like_post': IDL.Func([IDL.Text], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
        'create_comment': IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ 'Ok': Comment, 'Err': IDL.Text })], []),
        'follow_user': IDL.Func([IDL.Principal], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
        'tip_user': IDL.Func([IDL.Principal, IDL.Nat64], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
    });
};

export default AuthContext;