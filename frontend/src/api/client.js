import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── AUTH & USERS ───────────────────────────────────────────

export function signup(data) {
  return api.post('/auth/signup', data).then((r) => r.data)
}

export function login(data) {
  return api.post('/auth/login', data).then((r) => r.data)
}

export function createUser(data) {
  return api.post('/users/', data).then((r) => r.data)
}

export function getUsers() {
  return api.get('/users/').then((r) => r.data)
}

export function getUser(id) {
  return api.get(`/users/${id}`).then((r) => r.data)
}

export function updateUser(id, data) {
  return api.put(`/users/${id}`, data).then((r) => r.data)
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`)
}

export function getDashboardStats(userId) {
  return api.get(`/users/${userId}/dashboard-stats`).then((r) => r.data)
}

export function getUserScores(userId) {
  return api.get(`/users/${userId}/scores`).then((r) => r.data)
}

// ─── CATEGORIES & TAGS ──────────────────────────────────────

export function getCategories(userId) {
  return api.get(`/users/${userId}/categories/`).then((r) => r.data)
}

export function createCategory(userId, data) {
  return api.post(`/users/${userId}/categories/`, data).then((r) => r.data)
}

export function updateCategory(userId, categoryId, data) {
  return api.put(`/users/${userId}/categories/${categoryId}`, data).then((r) => r.data)
}

export function deleteCategory(userId, categoryId) {
  return api.delete(`/users/${userId}/categories/${categoryId}`)
}

export function addTagToCategory(userId, categoryId, data) {
  return api.post(`/users/${userId}/categories/${categoryId}/tags`, data).then((r) => r.data)
}

// ─── ACCOUNTS & NET WORTH ───────────────────────────────────

export function getAccounts(userId) {
  return api.get(`/users/${userId}/accounts/`).then((r) => r.data)
}

export function createAccount(userId, data) {
  return api.post(`/users/${userId}/accounts/`, data).then((r) => r.data)
}

export function updateAccount(userId, accountId, data) {
  return api.put(`/users/${userId}/accounts/${accountId}`, data).then((r) => r.data)
}

export function deleteAccount(userId, accountId) {
  return api.delete(`/users/${userId}/accounts/${accountId}`)
}

export function getNetWorth(userId) {
  return api.get(`/users/${userId}/accounts/net-worth`).then((r) => r.data)
}

// ─── TRANSACTIONS & MULTI-FILTER SEARCH ─────────────────────

export function getTransactions(userId, filters = {}) {
  // Can pass object with { skip, limit, search, category, account_id, tag, transaction_type, min_amount, max_amount, start_date, end_date, days_ago }
  const params = { ...filters }
  return api.get(`/users/${userId}/transactions/`, { params }).then((r) => r.data)
}

export function createTransaction(userId, data) {
  return api.post(`/users/${userId}/transactions/`, data).then((r) => r.data)
}

export function updateTransaction(userId, txId, data) {
  return api.put(`/users/${userId}/transactions/${txId}`, data).then((r) => r.data)
}

export function deleteTransaction(userId, txId) {
  return api.delete(`/users/${userId}/transactions/${txId}`)
}

export function exportTransactionsCsv(userId, params = {}) {
  return api.get(`/users/${userId}/transactions/export/csv`, {
    params,
    responseType: 'blob',
  })
}

// ─── SUBSCRIPTIONS ──────────────────────────────────────────

export function getSubscriptions(userId) {
  return api.get(`/users/${userId}/subscriptions/`).then((r) => r.data)
}

export function createSubscription(userId, data) {
  return api.post(`/users/${userId}/subscriptions/`, data).then((r) => r.data)
}

export function updateSubscription(userId, subId, data) {
  return api.put(`/users/${userId}/subscriptions/${subId}`, data).then((r) => r.data)
}

export function deleteSubscription(userId, subId) {
  return api.delete(`/users/${userId}/subscriptions/${subId}`)
}

// ─── RECURRING TRANSACTIONS ─────────────────────────────────

export function getRecurring(userId) {
  return api.get(`/users/${userId}/recurring/`).then((r) => r.data)
}

export function createRecurring(userId, data) {
  return api.post(`/users/${userId}/recurring/`, data).then((r) => r.data)
}

export function updateRecurring(userId, recId, data) {
  return api.put(`/users/${userId}/recurring/${recId}`, data).then((r) => r.data)
}

export function deleteRecurring(userId, recId) {
  return api.delete(`/users/${userId}/recurring/${recId}`)
}

// ─── BUDGETS ────────────────────────────────────────────────

export function getBudgets(userId, monthYear = '') {
  const params = monthYear ? { month_year: monthYear } : {}
  return api.get(`/users/${userId}/budgets/`, { params }).then((r) => r.data)
}

export function createOrUpdateBudget(userId, data) {
  return api.post(`/users/${userId}/budgets/`, data).then((r) => r.data)
}

export function deleteBudget(userId, budgetId) {
  return api.delete(`/users/${userId}/budgets/${budgetId}`)
}

// ─── INVESTMENTS & DEBTS ────────────────────────────────────

export function getInvestments(userId) {
  return api.get(`/users/${userId}/investments/`).then((r) => r.data)
}

export function createInvestment(userId, data) {
  return api.post(`/users/${userId}/investments/`, data).then((r) => r.data)
}

export function updateInvestment(userId, invId, data) {
  return api.put(`/users/${userId}/investments/${invId}`, data).then((r) => r.data)
}

export function deleteInvestment(userId, invId) {
  return api.delete(`/users/${userId}/investments/${invId}`)
}

export function getDebts(userId) {
  return api.get(`/users/${userId}/debts/`).then((r) => r.data)
}

export function createDebt(userId, data) {
  return api.post(`/users/${userId}/debts/`, data).then((r) => r.data)
}

export function updateDebt(userId, debtId, data) {
  return api.put(`/users/${userId}/debts/${debtId}`, data).then((r) => r.data)
}

export function deleteDebt(userId, debtId) {
  return api.delete(`/users/${userId}/debts/${debtId}`)
}

// ─── NOTIFICATIONS ──────────────────────────────────────────

export function getNotifications(userId) {
  return api.get(`/users/${userId}/notifications/`).then((r) => r.data)
}

export function markNotificationsRead(userId) {
  return api.post(`/users/${userId}/notifications/mark-read`).then((r) => r.data)
}

// ─── GOALS & INCOMES (COMPATIBILITY) ─────────────────────────

export function getGoals(userId) {
  return api.get(`/users/${userId}/goals/`).then((r) => r.data)
}

export function createGoal(userId, data) {
  return api.post(`/users/${userId}/goals/`, data).then((r) => r.data)
}

export function updateGoal(userId, goalId, data) {
  return api.put(`/users/${userId}/goals/${goalId}`, data).then((r) => r.data)
}

export function deleteGoal(userId, goalId) {
  return api.delete(`/users/${userId}/goals/${goalId}`)
}

export function getIncomeSources(userId) {
  return api.get(`/users/${userId}/incomes/`).then((r) => r.data)
}

export function createIncomeSource(userId, data) {
  return api.post(`/users/${userId}/incomes/`, data).then((r) => r.data)
}

export function updateIncomeSource(userId, incomeId, data) {
  return api.put(`/users/${userId}/incomes/${incomeId}`, data).then((r) => r.data)
}

export function deleteIncomeSource(userId, incomeId) {
  return api.delete(`/users/${userId}/incomes/${incomeId}`)
}

// ─── CHAT & ASSISTANT ───────────────────────────────────────

export function sendChatMessage(userId, message, sessionId = null) {
  return api.post(`/users/${userId}/chat/`, { message, session_id: sessionId }).then((r) => r.data)
}

export function getChatSessions(userId) {
  return api.get(`/users/${userId}/chat/sessions`).then((r) => r.data)
}

export function getChatHistory(userId, sessionId) {
  return api.get(`/users/${userId}/chat/sessions/${sessionId}/messages`).then((r) => r.data)
}
