use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use std::collections::HashMap;

mod models;
mod services;
mod storage;
mod utils;

use models::{user::User, post::Post, comment::Comment};
use services::{
    user_service::UserService,
    post_service::PostService,
    comment_service::CommentService,
    payment_service::PaymentService,
};
use storage::state::{State, STATE};

#[derive(CandidType, Deserialize)]
pub struct InitArgs {
    pub admin: Principal,
}

#[init]
fn init(args: InitArgs) {
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        state.admin = args.admin;
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| {
        let state = state.borrow();
        ic_cdk::storage::stable_save((
            &state.users,
            &state.posts,
            &state.comments,
            &state.user_posts,
            &state.user_followers,
            &state.admin,
        )).expect("Failed to save state before upgrade");
    });
}

#[post_upgrade]
fn post_upgrade() {
    let (users, posts, comments, user_posts, user_followers, admin): (
        HashMap<Principal, User>,
        HashMap<String, Post>,
        HashMap<String, Comment>,
        HashMap<Principal, Vec<String>>,
        HashMap<Principal, Vec<Principal>>,
        Principal,
    ) = ic_cdk::storage::stable_restore().expect("Failed to restore state after upgrade");

    STATE.with(|state| {
        let mut state = state.borrow_mut();
        state.users = users;
        state.posts = posts;
        state.comments = comments;
        state.user_posts = user_posts;
        state.user_followers = user_followers;
        state.admin = admin;
    });
}

// User Management
#[update]
fn create_user(username: String, bio: String, avatar_url: String) -> Result<User, String> {
    UserService::create_user(username, bio, avatar_url)
}

#[query]
fn get_user(user_id: Principal) -> Option<User> {
    UserService::get_user(user_id)
}

#[update]
fn update_user(bio: String, avatar_url: String) -> Result<User, String> {
    UserService::update_user(bio, avatar_url)
}

#[update]
fn follow_user(user_to_follow: Principal) -> Result<(), String> {
    UserService::follow_user(user_to_follow)
}

#[update]
fn unfollow_user(user_to_unfollow: Principal) -> Result<(), String> {
    UserService::unfollow_user(user_to_unfollow)
}

#[query]
fn get_user_followers(user_id: Principal) -> Vec<Principal> {
    UserService::get_user_followers(user_id)
}

#[query]
fn get_user_following(user_id: Principal) -> Vec<Principal> {
    UserService::get_user_following(user_id)
}

// Post Management
#[update]
fn create_post(content: String, media_url: Option<String>) -> Result<Post, String> {
    PostService::create_post(content, media_url)
}

#[query]
fn get_post(post_id: String) -> Option<Post> {
    PostService::get_post(post_id)
}

#[query]
fn get_user_posts(user_id: Principal) -> Vec<Post> {
    PostService::get_user_posts(user_id)
}

#[query]
fn get_feed(user_id: Principal, limit: usize, offset: usize) -> Vec<Post> {
    PostService::get_feed(user_id, limit, offset)
}

#[update]
fn like_post(post_id: String) -> Result<(), String> {
    PostService::like_post(post_id)
}

#[update]
fn unlike_post(post_id: String) -> Result<(), String> {
    PostService::unlike_post(post_id)
}

#[update]
fn share_post(post_id: String, comment: Option<String>) -> Result<Post, String> {
    PostService::share_post(post_id, comment)
}

// Comment Management
#[update]
fn create_comment(post_id: String, content: String) -> Result<Comment, String> {
    CommentService::create_comment(post_id, content)
}

#[query]
fn get_post_comments(post_id: String) -> Vec<Comment> {
    CommentService::get_post_comments(post_id)
}

#[update]
fn like_comment(comment_id: String) -> Result<(), String> {
    CommentService::like_comment(comment_id)
}

// Payment System
#[update]
fn tip_user(user_id: Principal, amount: u64) -> Result<(), String> {
    PaymentService::tip_user(user_id, amount)
}

#[query]
fn get_user_balance(user_id: Principal) -> u64 {
    PaymentService::get_user_balance(user_id)
}

// Search and Discovery
#[query]
fn search_users(query: String) -> Vec<User> {
    UserService::search_users(query)
}

#[query]
fn search_posts(query: String) -> Vec<Post> {
    PostService::search_posts(query)
}

// Admin Functions
#[update]
fn remove_post(post_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    STATE.with(|state| {
        let state = state.borrow();
        if caller != state.admin {
            return Err("Unauthorized: Only admin can remove posts".to_string());
        }
        PostService::remove_post(post_id)
    })
}

// WebSocket-like functionality for real-time updates
#[query]
fn get_latest_posts(timestamp: u64) -> Vec<Post> {
    PostService::get_posts_since(timestamp)
}

// Candid export
candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}