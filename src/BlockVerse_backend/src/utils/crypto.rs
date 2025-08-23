use sha2::{Digest, Sha256};

pub fn hash_string(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn generate_id(prefix: &str, data: &str) -> String {
    let timestamp = ic_cdk::api::time();
    let combined = format!("{}_{}_{}", prefix, data, timestamp);
    hash_string(&combined)
}