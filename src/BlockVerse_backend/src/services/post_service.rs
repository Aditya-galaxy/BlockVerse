use candid::Principal;
use crate::models::post::Post;
use crate::storage::state::STATE;

pub struct PostService;

impl PostService {
    pub fn create_post(content: String, media_url: Option<String>) -> Result<Post, String> {
        let caller = ic_cdk::caller();

        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot create posts".to_string());
        }

        if content.trim().is_empty() && media_url.is_none() {
            return Err("Post cannot be empty".to_string());
        }

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            // Check if user exists
            if !state.users.contains_key(&caller) {
                return Err("User not found".to_string());
            }

            let post = Post::new(caller, content, media_url);
            let post_id = post.id.clone();
            
            state.posts.insert(post_id.clone(), post.clone());
            
            // Add to user's posts
            let user_posts = state.user_posts.entry(caller).or_insert_with(Vec::new);
            user_posts.push(post_id);

            // Update user's post count
            if let Some(user) = state.users.get_mut(&caller) {
                user.posts_count += 1;
            }

            Ok(post)
        })
    }

    pub fn get_post(post_id: String) -> Option<Post> {
        STATE.with(|state| {
            let state = state.borrow();
            state.posts.get(&post_id).cloned()
        })
    }

    pub fn get_user_posts(user_id: Principal) -> Vec<Post> {
        STATE.with(|state| {
            let state = state.borrow();
            
            if let Some(post_ids) = state.user_posts.get(&user_id) {
                post_ids.iter()
                    .filter_map(|id| state.posts.get(id))
                    .cloned()
                    .collect()
            } else {
                Vec::new()
            }
        })
    }

    pub fn get_feed(user_id: Principal, limit: usize, offset: usize) -> Vec<Post> {
        STATE.with(|state| {
            let state = state.borrow();
            
            // Get posts from followed users and own posts
            let mut feed_posts = Vec::new();
            
            // Add own posts
            if let Some(post_ids) = state.user_posts.get(&user_id) {
                for post_id in post_ids {
                    if let Some(post) = state.posts.get(post_id) {
                        feed_posts.push(post.clone());
                    }
                }
            }

            // Add posts from followed users
            if let Some(following) = state.user_following.get(&user_id) {
                for followed_user in following {
                    if let Some(post_ids) = state.user_posts.get(followed_user) {
                        for post_id in post_ids {
                            if let Some(post) = state.posts.get(post_id) {
                                feed_posts.push(post.clone());
                            }
                        }
                    }
                }
            }

            // Sort by creation time (newest first)
            feed_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
            
            // Apply pagination
            feed_posts.into_iter()
                .skip(offset)
                .take(limit)
                .collect()
        })
    }

    pub fn like_post(post_id: String) -> Result<(), String> {
        let caller = ic_cdk::caller();

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            match state.posts.get_mut(&post_id) {
                Some(post) => {
                    if post.add_like(caller) {
                        Ok(())
                    } else {
                        Err("Already liked this post".to_string())
                    }
                }
                None => Err("Post not found".to_string())
            }
        })
    }

    pub fn unlike_post(post_id: String) -> Result<(), String> {
        let caller = ic_cdk::caller();

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            match state.posts.get_mut(&post_id) {
                Some(post) => {
                    if post.remove_like(caller) {
                        Ok(())
                    } else {
                        Err("Haven't liked this post".to_string())
                    }
                }
                None => Err("Post not found".to_string())
            }
        })
    }

    pub fn share_post(post_id: String, comment: Option<String>) -> Result<Post, String> {
        let caller = ic_cdk::caller();

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            // Check if original post exists
            if !state.posts.contains_key(&post_id) {
                return Err("Original post not found".to_string());
            }

            let share_post = Post::new_share(caller, post_id.clone(), comment);
            let share_id = share_post.id.clone();
            
            state.posts.insert(share_id.clone(), share_post.clone());
            
            // Add to user's posts
            let user_posts = state.user_posts.entry(caller).or_insert_with(Vec::new);
            user_posts.push(share_id);

            // Update original post's share count
            if let Some(original_post) = state.posts.get_mut(&post_id) {
                original_post.shares_count += 1;
            }

            // Update user's post count
            if let Some(user) = state.users.get_mut(&caller) {
                user.posts_count += 1;
            }

            Ok(share_post)
        })
    }

    pub fn search_posts(query: String) -> Vec<Post> {
        let query = query.to_lowercase();
        
        STATE.with(|state| {
            let state = state.borrow();
            state.posts
                .values()
                .filter(|post| {
                    post.content.to_lowercase().contains(&query)
                })
                .cloned()
                .collect()
        })
    }

    pub fn get_posts_since(timestamp: u64) -> Vec<Post> {
        STATE.with(|state| {
            let state = state.borrow();
            state.posts
                .values()
                .filter(|post| post.created_at > timestamp)
                .cloned()
                .collect()
        })
    }

    pub fn remove_post(post_id: String) -> Result<(), String> {
        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            if let Some(post) = state.posts.remove(&post_id) {
                // Remove from user's posts
                if let Some(user_posts) = state.user_posts.get_mut(&post.author) {
                    user_posts.retain(|id| id != &post_id);
                }

                // Update user's post count
                if let Some(user) = state.users.get_mut(&post.author) {
                    user.posts_count = user.posts_count.saturating_sub(1);
                }

                Ok(())
            } else {
                Err("Post not found".to_string())
            }
        })
    }
}