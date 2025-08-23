import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const EditProfile = ({ user, onClose, onUpdate }) => {
    const { actor } = useAuth();
    const [bio, setBio] = useState(user.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const result = await actor.update_user(bio.trim(), avatarUrl.trim());

            if ('Ok' in result) {
                onUpdate(result.Ok);
                onClose();
                toast.success('Profile updated successfully!');
            } else {
                toast.error(result.Err);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Edit Profile"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                        rows={4}
                        maxLength={160}
                    />
                    <p className="text-gray-400 text-sm mt-1">
                        {160 - bio.length} characters remaining
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Avatar URL
                    </label>
                    <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                        Leave empty to use default avatar
                    </p>
                </div>

                {avatarUrl && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Preview
                        </label>
                        <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full border border-gray-600"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfile;