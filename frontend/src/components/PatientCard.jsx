import { A } from '@solidjs/router'

export default function PatientCard(props) {
  const patient = () => props.patient || {}
  const initials = () => `${patient().first_name ? patient().first_name[0] : ''}${patient().last_name ? patient().last_name[0] : ''}`

  return (
    <A href={`/patients/${patient().id}`} class="block">
      <div class="card flex items-center gap-3">
        <div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span class="font-bold">{initials()}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-gray-800">{patient().first_name} {patient().last_name}</p>
              <p class="text-xs text-gray-400">{patient().gender} · {patient().age || ''}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">{patient().latest_hba1c ? `${patient().latest_hba1c.value_percent.toFixed(1)}%` : '—'}</p>
              <p class="text-xs text-gray-400">HbA1c</p>
            </div>
          </div>
        </div>
      </div>
    </A>
  )
}
