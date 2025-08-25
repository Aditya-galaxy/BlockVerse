import { AuthClient } from '@dfinity/auth-client';

export const authService = {
  async createAuthClient() {
    return await AuthClient.create({
      idleOptions: {
        idleTimeout: 1000 * 60 * 30, // 30 minutes
        disableDefaultIdleCallback: true,
      },
    });
  },

  async login(authClient) {
    return new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: process.env.REACT_APP_II_URL || 'https://identity.ic0.app/#authorize',
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: resolve,
        onError: reject,
      });
    });
  },

  async logout(authClient) {
    await authClient.logout();
  },

  async isAuthenticated(authClient) {
    return await authClient.isAuthenticated();
  },

  getIdentity(authClient) {
    return authClient.getIdentity();
  },
};