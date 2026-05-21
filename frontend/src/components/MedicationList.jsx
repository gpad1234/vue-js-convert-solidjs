import { For } from 'solid-js'

export default function MedicationList(props) {
  return (
    <div>
      {props.medications.length === 0 ? (
        <div class="text-sm text-gray-500">No active medications</div>
      ) : (
        <ul class="space-y-2">
          <For each={props.medications}>
            {(m) => (
              <li class="card">
                <div class="flex justify-between">
                  <div>
                    <p class="font-semibold">{m.name}</p>
                    <p class="text-xs text-gray-500">{m.dose} • {m.frequency}</p>
                  </div>
                  <div class="text-xs text-gray-400">{m.status || ''}</div>
                </div>
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  )
}
