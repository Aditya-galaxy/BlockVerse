use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use std::collections::HashSet;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Post {
    pub id: String,
    pub author: Principal,
    pub content: String,
    pub media_url: Option<String>,
    pub likes: HashSet<Principal>,
    pub likes_count: u64,
    pub comments_count: u64,
    pub shares_count: u64,
    pub is_shared: bool,
    pub original_post_id: Option<String>,
    pub share_comment: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Post {
    pub fn new(author: Principal, content: String, media_url: Option<String>) -> Self {
        let now = ic_cdk::api::time();
        let id = format!("{}_{}", author.to_text(), now);
        
        Self {
            id,
            author,
            content,
            media_url,
            likes: HashSet::new(),
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            is_shared: false,
            original_post_id: None,
            share_comment: None,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn new_share(author: Principal, original_post_id: String, comment: Option<String>) -> Self {
        let now = ic_cdk::api::time();
        let id = format!("share_{}_{}", author.to_text(), now);
        
        Self {
            id,
            author,
            content: String::new(),
            media_url: None,
            likes: HashSet::new(),
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            is_shared: true,
            original_post_id: Some(original_post_id),
            share_comment: comment,
            created_at: now,
            updated_at: now,
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