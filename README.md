# BlockVerse

A fully on-chain social media platform built on the Internet Computer Protocol (ICP) that ensures user data sovereignty, censorship resistance, and integrates microtransactions for content creators.

## 🌟 Features
- Decentralized Identity: User authentication via Internet Identity
- On-Chain Data Storage: All posts, comments, and user data stored on-chain
- Microtransactions: Tip creators with ICP tokens
- Censorship Resistant: No central authority can remove content
- Data Sovereignty: Users own their data completely
- Real-time Updates: Live feed updates using WebSocket connections
- Media Support: Image and video uploads stored on-chain
- Social Features: Follow, like, comment, share functionality

## 🏗️ Architecture

```
BlockVerse/
├── backend/                    # Rust Canister Backend
│   ├── src/
│   │   ├── lib.rs             # Main canister entry point
│   │   ├── models/            # Data models
│   │   │   ├── mod.rs
│   │   │   ├── user.rs        # User model
│   │   │   ├── post.rs        # Post model
│   │   │   └── comment.rs     # Comment model
│   │   ├── services/          # Business logic
│   │   │   ├── mod.rs
│   │   │   ├── user_service.rs
│   │   │   ├── post_service.rs
│   │   │   ├── comment_service.rs
│   │   │   └── payment_service.rs
│   │   ├── storage/           # State management
│   │   │   ├── mod.rs
│   │   │   └── state.rs
│   │   └── utils/             # Utility functions
│   │       ├── mod.rs
│   │       ├── crypto.rs
│   │       └── validation.rs
│   ├── Cargo.toml
│   └── dfx.json
├── frontend/                   # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Reusable components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── auth/          # Authentication components
│   │   │   │   ├── LoginButton.jsx
│   │   │   │   └── AuthGuard.jsx
│   │   │   ├── feed/          # Feed related components
│   │   │   │   ├── Feed.jsx
│   │   │   │   ├── PostCard.jsx
│   │   │   │   ├── CreatePost.jsx
│   │   │   │   └── PostDetails.jsx
│   │   │   ├── profile/       # Profile components
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   ├── EditProfile.jsx
│   │   │   │   └── FollowButton.jsx
│   │   │   └── payments/      # Payment components
│   │   │       ├── TipButton.jsx
│   │   │       └── WalletBalance.jsx
│   │   ├── services/          # API services
│   │   │   ├── api.js         # Main API service
│   │   │   ├── auth.js        # Authentication service
│   │   │   └── payments.js    # Payment service
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── usePosts.js
│   │   │   └── useWebSocket.js
│   │   ├── context/           # React context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/             # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── formatters.js
│   │   ├── styles/            # CSS styles
│   │   │   ├── globals.css
│   │   │   ├── components.css
│   │   │   └── themes.css
│   │   ├── App.jsx            # Main App component
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── webpack.config.js
├── .gitignore
├── README.md
└── deploy.sh                  # Deployment script
```

To learn more before you start working with `BlockVerse`, see the following documentation available online:

- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister Development Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid Introduction](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd BlockVerse/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
