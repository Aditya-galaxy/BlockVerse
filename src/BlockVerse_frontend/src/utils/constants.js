export const APP_CONFIG = {
  APP_NAME: 'BlockVerse',
  APP_DESCRIPTION: 'Decentralized Social Media on Internet Computer',
  MAX_POST_LENGTH: 280,
  MAX_COMMENT_LENGTH: 200,
  MAX_BIO_LENGTH: 160,
  POSTS_PER_PAGE: 10,
  MAX_MEDIA_SIZE: 10 * 1024 * 1024, // 10MB
};

export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  POST: '/post',
  SEARCH: '/search',
  SETTINGS: '/settings',
  WALLET: '/wallet',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const POST_TYPES = {
  ORIGINAL: 'original',
  SHARED: 'shared',
  COMMENT: 'comment',
};