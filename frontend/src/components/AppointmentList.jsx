import { For } from 'solid-js'
import { formatDate } from '../lib/api'

export default function AppointmentList(props) {
  return (
    <div>
      {props.appointments.length === 0 ? (
        <div class="text-sm text-gray-500">No upcoming appointments</div>
      ) : (
        <ul class="space-y-2">
          <For each={props.appointments}>
            {(a) => (
              <li class="card">
                <div class="flex justify-between">
                  <div>
                    <p class="font-semibold">{a.title || a.type || 'Appointment'}</p>
                    <p class="text-xs text-gray-500">{formatDate(a.start_datetime)}</p>
                  </div>
                  <div class="text-xs text-gray-400">{a.location || ''}</div>
                </div>
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  )
}
