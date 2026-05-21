import { For, createEffect, createSignal, onCleanup } from 'solid-js'
import Layout from '../../components/Layout'
import PatientCard from '../../components/PatientCard'
import LoadMoreButton from '../../components/LoadMoreButton'
import { buildPatientsUrl } from '../../lib/api'
import client from '../../lib/api'

const PAGE_SIZE = 10
const diabetesTypes = ['Type 1', 'Type 2', 'LADA', 'Gestational', 'Prediabetes', 'Other']

export default function PatientsIndex() {
  const [patients, setPatients] = createSignal([])
  const [skip, setSkip] = createSignal(0)
  const [hasMore, setHasMore] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal(null)
  const [search, setSearch] = createSignal('')
  const [debouncedSearch, setDebouncedSearch] = createSignal('')
  const [typeFilter, setTypeFilter] = createSignal('')

  createEffect(() => {
    const value = search()
    const timer = setTimeout(() => setDebouncedSearch(value), 300)
    onCleanup(() => clearTimeout(timer))
  })

  const fetchPatients = async (currentSkip) => {
    setLoading(true)
    setError(null)
    try {
      const url = buildPatientsUrl(currentSkip, PAGE_SIZE, debouncedSearch(), typeFilter())
      const res = await client.get(url)
      const data = res.data || res
      setPatients(currentSkip === 0 ? data.patients : [...patients(), ...data.patients])
      setHasMore(data.has_more)
      setSkip(currentSkip + PAGE_SIZE)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  createEffect(() => {
    debouncedSearch()
    typeFilter()
    setPatients([])
    setSkip(0)
    setHasMore(false)
    setError(null)
    fetchPatients(0)
  })

  return (
    <Layout title="Patients">
      <div class="p-4 space-y-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            type="search"
            placeholder="Search patients by name..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
          />
          {search() && (
            <button onClick={() => setSearch('')} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
          )}
        </div>

        <select
          value={typeFilter()}
          onChange={(e) => setTypeFilter(e.currentTarget.value)}
          class="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-sm"
        >
          <option value="">All Diabetes Types</option>
          <For each={diabetesTypes}>{(t) => <option value={t}>{t}</option>}</For>
        </select>

        {error() && (
          <div class="p-3 bg-red-50 rounded-xl border border-red-200">
            <p class="text-red-700 text-sm">Failed to load patients: {error()}</p>
          </div>
        )}

        {!loading() && patients().length === 0 && !error() && (
          <div class="text-center py-12">
            <p class="text-gray-400 text-4xl mb-2">🔍</p>
            <p class="text-gray-500 font-medium">No patients found</p>
          </div>
        )}

        <For each={patients()}>{(p) => <PatientCard patient={p} />}</For>

        {loading() && patients().length === 0 && (
          <div class="space-y-3">
            <div class="card animate-pulse"></div>
            <div class="card animate-pulse"></div>
            <div class="card animate-pulse"></div>
            <div class="card animate-pulse"></div>
          </div>
        )}

        <LoadMoreButton isLoading={loading() && patients().length > 0} hasMore={hasMore()} onClick={() => fetchPatients(skip())} />
      </div>
    </Layout>
  )
}
