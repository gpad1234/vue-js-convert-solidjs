import { For, createMemo, createSignal, onMount } from 'solid-js'
import { useParams } from '@solidjs/router'
import Layout from '../../components/Layout'
import PatientDetailSkeleton from '../../components/PatientDetailSkeleton'
import MedicationList from '../../components/MedicationList'
import AppointmentList from '../../components/AppointmentList'
import LoadMoreButton from '../../components/LoadMoreButton'
import GlucoseChart from '../../components/GlucoseChart'
import HbA1cBadge from '../../components/HbA1cBadge'
import { buildGlucoseUrl, classifyGlucose, formatDateTime, calculateAge } from '../../lib/api'
import client from '../../lib/api'

export default function PatientDetail() {
  const params = useParams()
  const id = () => params.id

  const [summary, setSummary] = createSignal(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal(null)

  const [glucoseReadings, setGlucoseReadings] = createSignal([])
  const [glucoseSkip, setGlucoseSkip] = createSignal(0)
  const [glucoseHasMore, setGlucoseHasMore] = createSignal(false)
  const [glucoseLoading, setGlucoseLoading] = createSignal(false)

  const patient = createMemo(() => summary()?.patient || {})
  const patientTitle = createMemo(() => (summary() ? `${summary().patient.first_name} ${summary().patient.last_name}` : 'Patient'))
  const initials = createMemo(() => `${patient().first_name ? patient().first_name[0] : ''}${patient().last_name ? patient().last_name[0] : ''}`)
  const age = createMemo(() => (patient().date_of_birth ? calculateAge(patient().date_of_birth) : ''))

  const loadSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await client.get(`/api/v1/patients/${id()}/summary`)
      setSummary(res.data || res)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchGlucose = async (currentSkip) => {
    setGlucoseLoading(true)
    try {
      const url = buildGlucoseUrl(id(), currentSkip, 20)
      const res = await client.get(url)
      const data = res.data || res
      setGlucoseReadings(currentSkip === 0 ? data.readings : [...glucoseReadings(), ...data.readings])
      setGlucoseHasMore(data.has_more)
      setGlucoseSkip(currentSkip + 20)
    } catch (err) {
      console.error(err)
    } finally {
      setGlucoseLoading(false)
    }
  }

  onMount(async () => {
    if (!id()) return
    await loadSummary()
    fetchGlucose(0)
  })

  return (
    <Layout title={patientTitle()}>
      {(loading() || !id()) && (
        <div class="p-4">
          <PatientDetailSkeleton />
        </div>
      )}

      {!loading() && error() && (
        <div class="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p class="text-red-700 font-semibold">Patient not found</p>
          <p class="text-red-500 text-sm mt-1">Patient #{id()} could not be loaded.</p>
        </div>
      )}

      {!loading() && !error() && (
        <div class="space-y-4 pb-4">
          <div class="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-4 pb-6">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-lg">{initials()}</span>
              </div>
              <div>
                <h1 class="text-white font-bold text-lg leading-tight">{patient().first_name} {patient().last_name}</h1>
                <p class="text-primary-100 text-sm">
                  {age()} yrs · {patient().gender} {patient().bmi ? `· BMI ${patient().bmi}` : ''}
                </p>
              </div>
            </div>
          </div>

          <section class="px-4">
            <h2 class="section-title mb-3">Latest Readings</h2>
            <div class="grid grid-cols-2 gap-3">
              <div class="card text-center">
                <p class="text-xs text-gray-500 mb-1">HbA1c</p>
                {summary()?.latest_hba1c ? <HbA1cBadge value={summary().latest_hba1c.value_percent} size="lg" /> : <span class="text-gray-300 text-lg">—</span>}
              </div>
              <div class="card text-center">
                <p class="text-xs text-gray-500 mb-1">Glucose</p>
                {summary()?.latest_glucose ? (
                  <span class="stat-number">
                    {Math.round(summary().latest_glucose.value_mgdl)}
                    <span class="text-xs text-gray-400 ml-0.5">mg/dL</span>
                  </span>
                ) : (
                  <span class="text-gray-300 text-lg">—</span>
                )}
              </div>
            </div>
          </section>

          <section class="px-4">
            <h2 class="section-title mb-3">Active Medications</h2>
            <MedicationList medications={summary()?.active_medications || []} />
          </section>

          <section class="px-4">
            <h2 class="section-title mb-3">Upcoming Appointments</h2>
            <AppointmentList appointments={summary()?.upcoming_appointments || []} />
          </section>

          <section class="px-4">
            <h2 class="section-title mb-3">Glucose History</h2>
            {glucoseReadings().length > 0 && (
              <div class="card mb-3 overflow-hidden">
                <p class="text-xs text-gray-400 mb-2">Last {glucoseReadings().length} readings</p>
                <GlucoseChart readings={glucoseReadings()} />
              </div>
            )}

            <div class="space-y-2">
              <For each={glucoseReadings()}>
                {(r) => (
                  <div class="card flex items-center justify-between py-2.5">
                    <div>
                      <p class="text-sm text-gray-700">{r.reading_type}</p>
                      <p class="text-xs text-gray-400">{formatDateTime(r.reading_datetime)}</p>
                    </div>
                    <div class="text-right">
                      <span class="font-bold text-lg" style={{ color: classifyGlucose(r.value_mgdl).color }}>{Math.round(r.value_mgdl)}</span>
                      <span class="text-xs text-gray-400 ml-0.5">mg/dL</span>
                      <p class="text-xs" style={{ color: classifyGlucose(r.value_mgdl).color }}>{classifyGlucose(r.value_mgdl).label}</p>
                    </div>
                  </div>
                )}
              </For>
            </div>

            <LoadMoreButton
              isLoading={glucoseLoading()}
              hasMore={glucoseHasMore()}
              onClick={() => fetchGlucose(glucoseSkip())}
              label="Load More Readings"
            />
          </section>
        </div>
      )}
    </Layout>
  )
}
