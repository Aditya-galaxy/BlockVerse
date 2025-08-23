import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const TipButton = ({ userId }) => {
    const { actor, user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const predefinedAmounts = [1, 5, 10, 25, 50, 100];

    const handleTip = async () => {
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (userId === user?.id) {
            toast.error('You cannot tip yourself');
            return;
        }

        try {
            setIsLoading(true);
            const result = await actor.tip_user(userId, parseInt(amount));

            if ('Ok' in result) {
                toast.success(`Successfully tipped ${amount} ICP!`);
                setShowModal(false);
                setAmount('');
            } else {
                toast.error(result.Err);
            }
        } catch (error) {
            console.error('Error sending tip:', error);
            toast.error('Failed to send tip');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Tip</span>
            </button>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Send Tip"
                size="sm"
            >
                <div className="space-y-6">
                    <p className="text-gray-300">
                        Send a tip to support this creator
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount (ICP)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                            min="0"
                            step="0.1"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-300 mb-3">Quick amounts:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {predefinedAmounts.map((preAmount) => (
                                <button
                                    key={preAmount}
                                    onClick={() => setAmount(preAmount.toString())}
                                    className={`px-3 py-2 rounded-lg border transition-colors ${amount === preAmount.toString()
                                        ? 'bg-purple-600 border-purple-500 text-white'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {preAmount} ICP
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleTip}
                            disabled={isLoading || !amount || amount <= 0}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <DollarSign className="w-4 h-4" />
                                    <span>Send Tip</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default TipButton;