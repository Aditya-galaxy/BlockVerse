use candid::Principal;
use std::cell::RefCell;
use std::collections::HashMap;
use crate::models::{user::User, post::Post, comment::Comment};
use crate::services::payment_service::Transaction;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::new(State::default());
}

#[derive(Default)]
pub struct State {
    pub users: HashMap<Principal, User>,
    pub posts: HashMap<String, Post>,
    pub comments: HashMap<String, Comment>,
    pub user_posts: HashMap<Principal, Vec<String>>,
    pub user_followers: HashMap<Principal, Vec<Principal>>,
    pub user_following: HashMap<Principal, Vec<Principal>>,
    pub post_comments: HashMap<String, Vec<String>>,
    pub transactions: Vec<Transaction>,
    pub admin: Principal,
}