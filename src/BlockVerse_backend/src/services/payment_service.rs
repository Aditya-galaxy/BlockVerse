use candid::Principal;
use crate::storage::state::STATE;

pub struct PaymentService;

impl PaymentService {
    pub fn tip_user(user_id: Principal, amount: u64) -> Result<(), String> {
        let caller = ic_cdk::caller();

        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot send tips".to_string());
        }

        if amount == 0 {
            return Err("Tip amount must be greater than 0".to_string());
        }

        if caller == user_id {
            return Err("Cannot tip yourself".to_string());
        }

        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            // Check if both users exist
            if !state.users.contains_key(&caller) || !state.users.contains_key(&user_id) {
                return Err("One or both users not found".to_string());
            }

            // Check if sender has enough balance
            let sender_balance = state.users.get(&caller).unwrap().balance;
            if sender_balance < amount {
                return Err("Insufficient balance".to_string());
            }

            // Transfer the tip
            if let Some(sender) = state.users.get_mut(&caller) {
                sender.balance -= amount;
            }
            
            if let Some(recipient) = state.users.get_mut(&user_id) {
                recipient.balance += amount;
            }

            // Record the transaction
            let transaction = Transaction {
                id: format!("tip_{}_{}", caller.to_text(), ic_cdk::api::time()),
                from: caller,
                to: user_id,
                amount,
                transaction_type: TransactionType::Tip,
                timestamp: ic_cdk::api::time(),
            };

            state.transactions.push(transaction);

            Ok(())
        })
    }

    pub fn get_user_balance(user_id: Principal) -> u64 {
        STATE.with(|state| {
            let state = state.borrow();
            state.users.get(&user_id).map(|user| user.balance).unwrap_or(0)
        })
    }

    pub fn add_balance(user_id: Principal, amount: u64) -> Result<(), String> {
        STATE.with(|state| {
            let mut state = state.borrow_mut();
            
            if let Some(user) = state.users.get_mut(&user_id) {
                user.balance += amount;
                Ok(())
            } else {
                Err("User not found".to_string())
            }
        })
    }
}

#[derive(Clone, Debug)]
pub struct Transaction {
    pub id: String,
    pub from: Principal,
    pub to: Principal,
    pub amount: u64,
    pub transaction_type: TransactionType,
    pub timestamp: u64,
}

#[derive(Clone, Debug)]
pub enum TransactionType {
    Tip,
    Reward,
}