use candid::Principal;
use crate::models::user::User;
use crate::storage::state::STATE;
use crate::utils::validation;

pub struct UserService;

impl UserService {
    pub fn create_user(username: String, bio: String, avatar_url: String) -> Result<User, String> {
        let caller = ic_cdk::caller();
        
        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot create profiles".to_string());
        }

        if !validation::is_valid_username(&username) {
            return Err("Invalid username format".to_string());
        }

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            if state.users.contains_key(&caller) {
                return Err("User already exists".to_string());
            }

            // Check if username is already taken
            for user in state.users.values() {
                if user.username.to_lowercase() == username.to_lowercase() {
                    return Err("Username already taken".to_string());
                }
            }

            let user = User::new(caller, username, bio, avatar_url);
            state.users.insert(caller, user.clone());
            Ok(user)
        })
    }

    pub fn get_user(user_id: Principal) -> Option<User> {
        STATE.with(|state| {
            let state = state.borrow();
            state.users.get(&user_id).cloned()
        })
    }

    pub fn update_user(bio: String, avatar_url: String) -> Result<User, String> {
        let caller = ic_cdk::caller();

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            match state.users.get_mut(&caller) {
                Some(user) => {
                    user.update(bio, avatar_url);
                    Ok(user.clone())
                }
                None => Err("User not found".to_string())
            }
        })
    }

    pub fn follow_user(user_to_follow: Principal) -> Result<(), String> {
        let caller = ic_cdk::caller();

        if caller == user_to_follow {
            return Err("Cannot follow yourself".to_string());
        }

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            // Check if both users exist
            if !state.users.contains_key(&caller) || !state.users.contains_key(&user_to_follow) {
                return Err("One or both users not found".to_string());
            }

            // Add to following list
            let following = state.user_following.entry(caller).or_insert_with(Vec::new);
            if !following.contains(&user_to_follow) {
                following.push(user_to_follow);
                
                // Add to followers list
                let followers = state.user_followers.entry(user_to_follow).or_insert_with(Vec::new);
                followers.push(caller);

                // Update counts
                if let Some(user) = state.users.get_mut(&caller) {
                    user.following_count += 1;
                }
                if let Some(user) = state.users.get_mut(&user_to_follow) {
                    user.followers_count += 1;
                }
            }

            Ok(())
        })
    }

    pub fn unfollow_user(user_to_unfollow: Principal) -> Result<(), String> {
        let caller = ic_cdk::caller();

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            // Remove from following list
            if let Some(following) = state.user_following.get_mut(&caller) {
                if let Some(pos) = following.iter().position(|&x| x == user_to_unfollow) {
                    following.remove(pos);
                    
                    // Remove from followers list
                    if let Some(followers) = state.user_followers.get_mut(&user_to_unfollow) {
                        if let Some(pos) = followers.iter().position(|&x| x == caller) {
                            followers.remove(pos);
                        }
                    }

                    // Update counts
                    if let Some(user) = state.users.get_mut(&caller) {
                        user.following_count = user.following_count.saturating_sub(1);
                    }
                    if let Some(user) = state.users.get_mut(&user_to_unfollow) {
                        user.followers_count = user.followers_count.saturating_sub(1);
                    }
                }
            }

            Ok(())
        })
    }

    pub fn get_user_followers(user_id: Principal) -> Vec<Principal> {
        STATE.with(|state| {
            let state = state.borrow();
            state.user_followers.get(&user_id).cloned().unwrap_or_default()
        })
    }

    pub fn get_user_following(user_id: Principal) -> Vec<Principal> {
        STATE.with(|state| {
            let state = state.borrow();
            state.user_following.get(&user_id).cloned().unwrap_or_default()
        })
    }

    pub fn search_users(query: String) -> Vec<User> {
        let query = query.to_lowercase();
        
        STATE.with(|state| {
            let state = state.borrow();
            state.users
                .values()
                .filter(|user| {
                    user.username.to_lowercase().contains(&query) ||
                    user.bio.to_lowercase().contains(&query)
                })
                .cloned()
                .collect()
        })
    }
}