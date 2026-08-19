export const DUMMY_ACCOUNT_ID = "acc_dummy_001";

export interface DummyTransaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  accountId: string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
}

export const dummyTransactions: DummyTransaction[] = [
  // ========== JULY 2026 ==========
  { id: "txn_j01", description: "Monthly Salary", amount: 442000, type: "INCOME", category: "Salary", date: "2026-07-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_j02", description: "Freelance Web App", amount: 153000, type: "INCOME", category: "Freelance", date: "2026-07-10", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j03", description: "Stock Dividends", amount: 28900, type: "INCOME", category: "Investments", date: "2026-07-15", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_j04", description: "Netflix Subscription", amount: 1359, type: "EXPENSE", category: "Entertainment", date: "2026-07-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_j05", description: "Spotify Premium", amount: 934, type: "EXPENSE", category: "Entertainment", date: "2026-07-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_j06", description: "Adobe Creative Cloud", amount: 4674, type: "EXPENSE", category: "Entertainment", date: "2026-07-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_j07", description: "Gym Membership", amount: 4249, type: "EXPENSE", category: "Personal Care", date: "2026-07-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_j08", description: "Electric Bill", amount: 12096, type: "EXPENSE", category: "Utilities", date: "2026-07-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j09", description: "Internet Bill", amount: 6799, type: "EXPENSE", category: "Utilities", date: "2026-07-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_j10", description: "Phone Bill", amount: 3825, type: "EXPENSE", category: "Utilities", date: "2026-07-06", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_j11", description: "Whole Foods Market", amount: 13296, type: "EXPENSE", category: "Groceries", date: "2026-07-07", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j12", description: "Trader Joes", amount: 7423, type: "EXPENSE", category: "Groceries", date: "2026-07-14", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j13", description: "Starbucks", amount: 1058, type: "EXPENSE", category: "Food", date: "2026-07-08", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j14", description: "Chipotle", amount: 1211, type: "EXPENSE", category: "Food", date: "2026-07-12", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j15", description: "Door Dash Order", amount: 3638, type: "EXPENSE", category: "Food", date: "2026-07-18", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_j16", description: "Uber Ride", amount: 1998, type: "EXPENSE", category: "Transportation", date: "2026-07-09", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j17", description: "Gas Station", amount: 4144, type: "EXPENSE", category: "Transportation", date: "2026-07-11", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j18", description: "Gas Station", amount: 4429, type: "EXPENSE", category: "Transportation", date: "2026-07-25", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_j19", description: "Amazon Purchase", amount: 5779, type: "EXPENSE", category: "Shopping", date: "2026-07-13", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_j20", description: "Target", amount: 2938, type: "EXPENSE", category: "Shopping", date: "2026-07-20", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_j21", description: "Pharmacy", amount: 2423, type: "EXPENSE", category: "Healthcare", date: "2026-07-16", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_j22", description: "Rent Payment", amount: 119000, type: "EXPENSE", category: "Housing", date: "2026-07-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  // ========== AUGUST 2026 ==========
  { id: "txn_a01", description: "Monthly Salary", amount: 442000, type: "INCOME", category: "Salary", date: "2026-08-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_a02", description: "Freelance Logo Design", amount: 80750, type: "INCOME", category: "Freelance", date: "2026-08-05", status: "PENDING", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a03", description: "Investment Dividends", amount: 27200, type: "INCOME", category: "Investments", date: "2026-08-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_a04", description: "Netflix Subscription", amount: 1359, type: "EXPENSE", category: "Entertainment", date: "2026-08-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_a05", description: "Spotify Premium", amount: 934, type: "EXPENSE", category: "Entertainment", date: "2026-08-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_a06", description: "Adobe Creative Cloud", amount: 4674, type: "EXPENSE", category: "Entertainment", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_a07", description: "Gym Membership", amount: 4249, type: "EXPENSE", category: "Personal Care", date: "2026-08-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_a08", description: "Electric Bill", amount: 14093, type: "EXPENSE", category: "Utilities", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a09", description: "Internet Bill", amount: 6799, type: "EXPENSE", category: "Utilities", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_a10", description: "Phone Bill", amount: 3825, type: "EXPENSE", category: "Utilities", date: "2026-08-06", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_a11", description: "Whole Foods Market", amount: 16129, type: "EXPENSE", category: "Groceries", date: "2026-08-02", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a12", description: "Whole Foods Market", amount: 3842, type: "EXPENSE", category: "Groceries", date: "2026-08-04", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a13", description: "Starbucks", amount: 1343, type: "EXPENSE", category: "Food", date: "2026-08-04", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a14", description: "Starbucks", amount: 956, type: "EXPENSE", category: "Food", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a15", description: "Uber Eats", amount: 4786, type: "EXPENSE", category: "Food", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a16", description: "Restaurant Dinner", amount: 7013, type: "EXPENSE", category: "Food", date: "2026-08-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_a17", description: "Uber Ride", amount: 1594, type: "EXPENSE", category: "Transportation", date: "2026-08-02", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a18", description: "Gas Station", amount: 4352, type: "EXPENSE", category: "Transportation", date: "2026-08-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_a19", description: "Amazon Purchase", amount: 19974, type: "EXPENSE", category: "Shopping", date: "2026-08-04", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_a20", description: "Target", amount: 5731, type: "EXPENSE", category: "Shopping", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_a21", description: "Pharmacy", amount: 2754, type: "EXPENSE", category: "Healthcare", date: "2026-08-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  { id: "txn_a22", description: "Rent Payment", amount: 119000, type: "EXPENSE", category: "Housing", date: "2026-08-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_a23", description: "Online Course Platform", amount: 2549, type: "EXPENSE", category: "Education", date: "2026-08-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_a24", description: "Car Insurance", amount: 10200, type: "EXPENSE", category: "Insurance", date: "2026-08-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  { id: "txn_a25", description: "Payment Failed - Rent", amount: 119000, type: "EXPENSE", category: "Housing", date: "2026-08-01", status: "FAILED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },

  // ========== JUNE 2026 (for trends) ==========
  { id: "txn_jn01", description: "Monthly Salary", amount: 442000, type: "INCOME", category: "Salary", date: "2026-06-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_jn02", description: "Freelance Consulting", amount: 187000, type: "INCOME", category: "Freelance", date: "2026-06-15", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_jn03", description: "Netflix Subscription", amount: 1359, type: "EXPENSE", category: "Entertainment", date: "2026-06-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_jn04", description: "Spotify Premium", amount: 934, type: "EXPENSE", category: "Entertainment", date: "2026-06-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_jn05", description: "Rent Payment", amount: 119000, type: "EXPENSE", category: "Housing", date: "2026-06-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_jn06", description: "Whole Foods Market", amount: 11441, type: "EXPENSE", category: "Groceries", date: "2026-06-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_jn07", description: "Electric Bill", amount: 10073, type: "EXPENSE", category: "Utilities", date: "2026-06-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_jn08", description: "Amazon Purchase", amount: 16149, type: "EXPENSE", category: "Shopping", date: "2026-06-10", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_jn09", description: "Uber Ride", amount: 2754, type: "EXPENSE", category: "Transportation", date: "2026-06-12", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_jn10", description: "Gym Membership", amount: 4249, type: "EXPENSE", category: "Personal Care", date: "2026-06-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },

  // ========== MAY 2026 (for trends) ==========
  { id: "txn_m01", description: "Monthly Salary", amount: 425000, type: "INCOME", category: "Salary", date: "2026-05-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_m02", description: "Freelance Design", amount: 127500, type: "INCOME", category: "Freelance", date: "2026-05-20", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_m03", description: "Netflix Subscription", amount: 1359, type: "EXPENSE", category: "Entertainment", date: "2026-05-03", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_m04", description: "Rent Payment", amount: 119000, type: "EXPENSE", category: "Housing", date: "2026-05-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_m05", description: "Whole Foods Market", amount: 9546, type: "EXPENSE", category: "Groceries", date: "2026-05-06", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_m06", description: "Electric Bill", amount: 8364, type: "EXPENSE", category: "Utilities", date: "2026-05-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: false },
  { id: "txn_m07", description: "Adobe Creative Cloud", amount: 4674, type: "EXPENSE", category: "Entertainment", date: "2026-05-05", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
  { id: "txn_m08", description: "Gym Membership", amount: 4249, type: "EXPENSE", category: "Personal Care", date: "2026-05-01", status: "COMPLETED", accountId: DUMMY_ACCOUNT_ID, isRecurring: true, recurringInterval: "MONTHLY" },
];

export const dummyAccount = {
  id: DUMMY_ACCOUNT_ID,
  name: "Main Savings",
  type: "SAVINGS",
  balance: 715743,
  currency: "INR",
  isDefault: true,
};

export const dummyAccounts = [dummyAccount];

export const dummyBudgets = [
  { category: "Entertainment", spent: 6967, limit: 12750 },
  { category: "Groceries", spent: 19971, limit: 34000 },
  { category: "Food", spent: 14136, limit: 17000 },
  { category: "Utilities", spent: 24717, limit: 29750 },
  { category: "Transportation", spent: 8041, limit: 12750 },
  { category: "Shopping", spent: 25705, limit: 25500 },
  { category: "Housing", spent: 119000, limit: 127500 },
  { category: "Healthcare", spent: 5177, limit: 17000 },
];
