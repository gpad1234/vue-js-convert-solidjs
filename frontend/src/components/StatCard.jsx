import { A } from '@solidjs/router'

function CardInner(props) {
  return (
    <div class="card text-center cursor-pointer" role="button">
      <div class="text-2xl">{props.icon}</div>
      <p class="stat-number mt-1 font-semibold">{props.value}</p>
      <p class="text-xs text-gray-500 mt-0.5">{props.label}</p>
    </div>
  )
}

export default function StatCard(props) {
  return props.to ? (
    <A href={props.to} class="block">
      <CardInner {...props} />
    </A>
  ) : (
    <div class="block">
      <CardInner {...props} />
    </div>
  )
}
