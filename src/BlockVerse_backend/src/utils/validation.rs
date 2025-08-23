pub fn is_valid_username(username: &str) -> bool {
    if username.is_empty() || username.len() > 20 {
        return false;
    }

    // Check if username contains only alphanumeric characters and underscores
    username.chars().all(|c| c.is_alphanumeric() || c == '_')
}

pub fn is_valid_content(content: &str) -> bool {
    !content.trim().is_empty() && content.len() <= 280
}

pub fn sanitize_content(content: &str) -> String {
    content.trim().to_string()
}