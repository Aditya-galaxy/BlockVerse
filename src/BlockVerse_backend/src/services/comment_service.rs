use candid::Principal;
use crate::models::comment::Comment;
use crate::storage::state::STATE;

pub struct CommentService;

impl CommentService {
    pub fn create_comment(post_id: String, content: String) -> Result<Comment, String> {
        let caller = ic_cdk::caller();

        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot create comments".to_string());
        }

        if content.trim().is_empty() {
            return Err("Comment cannot be empty".to_string());
        }

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            // Check if post exists
            if !state.posts.contains_key(&post_id) {
                return Err("Post not found".to_string());
            }

            let comment = Comment::new(post_id.clone(), caller, content);
            let comment_id = comment.id.clone();
            
            state.comments.insert(comment_id.clone(), comment.clone());
            
            // Add to post's comments
            let post_comments = state.post_comments.entry(post_id.clone()).or_insert_with(Vec::new);
            post_comments.push(comment_id);

            // Update post's comment count
            if let Some(post) = state.posts.get_mut(&post_id) {
                post.comments_count += 1;
            }

            Ok(comment)
        })
    }

    pub fn get_post_comments(post_id: String) -> Vec<Comment> {
        STATE.with(|state| {
            let state = state.borrow();
            
            if let Some(comment_ids) = state.post_comments.get(&post_id) {
                comment_ids.iter()
                    .filter_map(|id| state.comments.get(id))
                    .cloned()
                    .collect()
            } else {
                Vec::new()
            }
        })
    }

    pub fn like_comment(comment_id: String) -> Result<(), String> {
        let caller = ic_cdk::caller();

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            match state.comments.get_mut(&comment_id) {
                Some(comment) => {
                    if comment.add_like(caller) {
                        Ok(())
                    } else {
                        Err("Already liked this comment".to_string())
                    }
                }
                None => Err("Comment not found".to_string())
            }
        })
    }
}