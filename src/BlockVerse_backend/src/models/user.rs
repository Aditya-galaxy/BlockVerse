use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct User {
    pub id: Principal,
    pub username: String,
    pub bio: String,
    pub avatar_url: String,
    pub followers_count: u64,
    pub following_count: u64,
    pub posts_count: u64,
    pub balance: u64,
    pub created_at: u64,
    pub updated_at: u64,
}

impl User {
    pub fn new(id: Principal, username: String, bio: String, avatar_url: String) -> Self {
        let now = ic_cdk::api::time();
        Self {
            id,
            username,
            bio,
            avatar_url,
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            balance: 0,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update(&mut self, bio: String, avatar_url: String) {
        self.bio = bio;
        self.avatar_url = avatar_url;
        self.updated_at = ic_cdk::api::time();
    }
}