import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/BlockVerse_backend';

const canisterId = process.env.REACT_APP_BLOCKVERSE_BACKEND_CANISTER_ID;

export const createActor = (identity) => {
  const agent = new HttpAgent({ 
    host: process.env.REACT_APP_IC_HOST || 'https://ic0.app',
    identity 
  });

  // Fetch root key for local development
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};

export const api = {
  // User methods
  async createUser(actor, username, bio, avatarUrl) {
    return await actor.create_user(username, bio, avatarUrl);
  },

  async getUser(actor, userId) {
    return await actor.get_user(userId);
  },

  async updateUser(actor, bio, avatarUrl) {
    return await actor.update_user(bio, avatarUrl);
  },

  async followUser(actor, userId) {
    return await actor.follow_user(userId);
  },

  async unfollowUser(actor, userId) {
    return await actor.unfollow_user(userId);
  },

  // Post methods
  async createPost(actor, content, mediaUrl) {
    return await actor.create_post(content, mediaUrl);
  },

  async getPost(actor, postId) {
    return await actor.get_post(postId);
  },

  async getUserPosts(actor, userId) {
    return await actor.get_user_posts(userId);
  },

  async getFeed(actor, userId, limit, offset) {
    return await actor.get_feed(userId, limit, offset);
  },

  async likePost(actor, postId) {
    return await actor.like_post(postId);
  },

  async unlikePost(actor, postId) {
    return await actor.unlike_post(postId);
  },

  // Comment methods
  async createComment(actor, postId, content) {
    return await actor.create_comment(postId, content);
  },

  async getPostComments(actor, postId) {
    return await actor.get_post_comments(postId);
  },

  // Payment methods
  async tipUser(actor, userId, amount) {
    return await actor.tip_user(userId, amount);
  },

  async getUserBalance(actor, userId) {
    return await actor.get_user_balance(userId);
  },

  // Search methods
  async searchUsers(actor, query) {
    return await actor.search_users(query);
  },

  async searchPosts(actor, query) {
    return await actor.search_posts(query);
  }
};