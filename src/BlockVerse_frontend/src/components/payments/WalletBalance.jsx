import React, { useState, useEffect } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const WalletBalance = () => {
    const { actor, user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBalance();
    }, [actor, user]);

    const loadBalance = async () => {
        if (!actor || !user) return;

        try {
            const userBalance = await actor.get_user_balance(user.id);
            setBalance(userBalance);
        } catch (error) {
            console.error('Error loading balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBalance = (amount) => {
        return (amount / 100000000).toFixed(2); // Convert from e8s to ICP
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Loading...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-2">
            <Wallet className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">
                {formatBalance(balance)} ICP
            </span>
            <button className="ml-2 text-green-400 hover:text-green-300 transition-colors">
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};

export default WalletBalance;