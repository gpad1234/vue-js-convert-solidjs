import { createEffect, onCleanup, onMount } from 'solid-js'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler, annotationPlugin)

function classify(value) {
  if (value < 70) return 'Low'
  if (value <= 180) return 'Target'
  return 'High'
}

export default function GlucoseChart(props) {
  let canvasRef
  let chartInstance

  const buildConfig = (readings) => ({
    type: 'line',
    data: {
      labels: readings.map((r) => new Date(r.reading_datetime).toLocaleString()),
      datasets: [
        {
          label: 'Glucose (mg/dL)',
          data: readings.map((r) => Math.round(r.value_mgdl)),
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20,184,166,0.08)',
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: false } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.label ?? '',
            label: (context) => {
              const num = Number(context.formattedValue)
              return `${context.formattedValue} mg/dL - ${classify(num)}`
            },
          },
        },
        annotation: {
          annotations: {
            targetBand: {
              type: 'box',
              yMin: 70,
              yMax: 180,
              backgroundColor: 'rgba(34,197,94,0.06)',
              borderWidth: 0,
            },
            lowLine: {
              type: 'line',
              yMin: 70,
              yMax: 70,
              borderColor: 'rgba(59,130,246,0.6)',
              borderWidth: 1,
              label: { content: '70 mg/dL', enabled: true, position: 'start' },
            },
            highLine: {
              type: 'line',
              yMin: 180,
              yMax: 180,
              borderColor: 'rgba(244,63,94,0.6)',
              borderWidth: 1,
              label: { content: '180 mg/dL', enabled: true, position: 'end' },
            },
          },
        },
      },
    },
  })

  onMount(() => {
    if (!canvasRef) return
    chartInstance = new Chart(canvasRef.getContext('2d'), buildConfig(props.readings || []))
  })

  createEffect(() => {
    const readings = props.readings || []
    if (!chartInstance) return
    chartInstance.data.labels = readings.map((r) => new Date(r.reading_datetime).toLocaleString())
    chartInstance.data.datasets[0].data = readings.map((r) => Math.round(r.value_mgdl))
    chartInstance.update()
  })

  onCleanup(() => {
    if (chartInstance) chartInstance.destroy()
  })

  return (
    <div class="w-full h-64">
      <canvas ref={canvasRef} aria-label="Glucose chart"></canvas>
    </div>
  )
}
