use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use std::collections::HashSet;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub author: Principal,
    pub content: String,
    pub likes: HashSet<Principal>,
    pub likes_count: u64,
    pub created_at: u64,
}

impl Comment {
    pub fn new(post_id: String, author: Principal, content: String) -> Self {
        let now = ic_cdk::api::time();
        let id = format!("comment_{}_{}_{}", post_id, author.to_text(), now);
        
        Self {
            id,
            post_id,
            author,
            content,
            likes: HashSet::new(),
            likes_count: 0,
            created_at: now,
        }
    }

    pub fn add_like(&mut self, user_id: Principal) -> bool {
        if self.likes.insert(user_id) {
            self.likes_count += 1;
            true
        } else {
            false
        }
    }

    pub fn remove_like(&mut self, user_id: Principal) -> bool {
        if self.likes.remove(&user_id) {
            self.likes_count = self.likes_count.saturating_sub(1);
            true
        } else {
            false
        }
    }
}