/**
 * Offline Cache & Storage Engine with Online Sync Queue
 */

const STORAGE_KEYS = {
  OFFLINE_TRANSACTIONS: 'finassist_offline_tx_queue',
  DASHBOARD_CACHE: 'finassist_dashboard_cache',
  CATEGORIES_CACHE: 'finassist_categories_cache',
  ACCOUNTS_CACHE: 'finassist_accounts_cache',
}

export function saveOfflineTransaction(txData) {
  try {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_TRANSACTIONS) || '[]')
    queue.push({
      ...txData,
      _offline_id: `offline_${Date.now()}`,
      created_at: new Date().toISOString()
    })
    localStorage.setItem(STORAGE_KEYS.OFFLINE_TRANSACTIONS, JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to cache offline transaction', err)
  }
}

export function getOfflineTransactionsQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_TRANSACTIONS) || '[]')
  } catch {
    return []
  }
}

export function clearOfflineTransaction(offlineId) {
  try {
    const queue = getOfflineTransactionsQueue().filter(t => t._offline_id !== offlineId)
    localStorage.setItem(STORAGE_KEYS.OFFLINE_TRANSACTIONS, JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to clear item from sync queue', err)
  }
}

export function cacheDashboardData(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_CACHE, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    // Ignore storage quota limits
  }
}

export function getCachedDashboardData() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CACHE)
    if (cached) {
      return JSON.parse(cached).data
    }
  } catch {}
  return null
}
