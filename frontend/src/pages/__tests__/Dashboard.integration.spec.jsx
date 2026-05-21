import { render, screen, waitFor } from '@solidjs/testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchDashboardMock } = vi.hoisted(() => ({
  fetchDashboardMock: vi.fn(),
}))

vi.mock('../../components/Layout', () => ({
  default: (props) => <div>{props.children}</div>,
}))

vi.mock('../../components/StatCard', () => ({
  default: (props) => (
    <div data-testid="stat-card">
      <span>{props.label}</span>
      <span>{String(props.value)}</span>
    </div>
  ),
}))

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual('../../lib/api')
  return {
    ...actual,
    apiBaseUrl: 'http://localhost:8000',
    fetchDashboard: fetchDashboardMock,
  }
})

describe('Dashboard integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and renders dashboard stats from API', async () => {
    const { default: Dashboard } = await import('../Dashboard')

    fetchDashboardMock.mockResolvedValueOnce({
      total_patients: 42,
      avg_hba1c_last_30_days: 7.14,
      high_hba1c_count: 9,
      active_medications_count: 33,
    })

    render(() => <Dashboard />)

    expect(await screen.findByText('Total Patients')).toBeTruthy()
    expect(screen.getByText('42')).toBeTruthy()
    expect(screen.getByText('Avg HbA1c (30d)')).toBeTruthy()
    expect(screen.getByText('7.1%')).toBeTruthy()
  })

  it('shows a backend hint on dashboard load failure', async () => {
    const { default: Dashboard } = await import('../Dashboard')

    fetchDashboardMock.mockRejectedValueOnce(new Error('network down'))

    render(() => <Dashboard />)

    expect(await screen.findByText('Failed to load dashboard')).toBeTruthy()
    expect(screen.getByText('Ensure backend is running at http://localhost:8000')).toBeTruthy()
  })
})
