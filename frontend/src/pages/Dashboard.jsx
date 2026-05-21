import { createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import { fetchDashboard, apiBaseUrl } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = createSignal(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal(null)

  const avgHbA1c = createMemo(() => {
    const value = stats()?.avg_hba1c_last_30_days
    return value == null ? 'N/A' : `${value.toFixed(1)}%`
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setStats(await fetchDashboard())
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    window.addEventListener('app-refresh', load)
    load()
  })

  onCleanup(() => {
    window.removeEventListener('app-refresh', load)
  })

  return (
    <Layout title="Dashboard">
      {loading() && <div class="p-4">Loading...</div>}

      {!loading() && error() && (
        <div class="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p class="text-red-700 font-semibold text-sm">Failed to load dashboard</p>
          <p class="text-red-500 text-xs mt-1">Ensure backend is running at {apiBaseUrl}</p>
        </div>
      )}

      {!loading() && !error() && (
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <StatCard label="Total Patients" value={stats()?.total_patients} icon="👥" to="/patients" />
            <StatCard label="Avg HbA1c (30d)" value={avgHbA1c()} icon="🩺" />
            <StatCard label="HbA1c > 9%" value={stats()?.high_hba1c_count} icon="📈" />
            <StatCard label="Active Meds" value={stats()?.active_medications_count} icon="💊" />
          </div>
        </div>
      )}
    </Layout>
  )
}
