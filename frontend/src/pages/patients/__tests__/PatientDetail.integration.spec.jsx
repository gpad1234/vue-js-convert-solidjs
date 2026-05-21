import { render, screen, waitFor } from '@solidjs/testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { clientGetMock } = vi.hoisted(() => ({
  clientGetMock: vi.fn(),
}))

vi.mock('../../../components/Layout', () => ({
  default: (props) => <div>{props.children}</div>,
}))

vi.mock('../../../components/GlucoseChart', () => ({
  default: () => <div data-testid="glucose-chart">chart</div>,
}))

vi.mock('@solidjs/router', async () => {
  const actual = await vi.importActual('@solidjs/router')
  return {
    ...actual,
    useParams: () => ({ id: '7' }),
  }
})

vi.mock('../../../lib/api', async () => {
  const actual = await vi.importActual('../../../lib/api')
  return {
    ...actual,
    buildGlucoseUrl: vi.fn((patientId, skip, limit) => `/api/v1/patients/${patientId}/glucose?skip=${skip}&limit=${limit}`),
    default: {
      get: clientGetMock,
    },
  }
})

describe('PatientDetail integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads summary and glucose history for patient route param', async () => {
    const { default: PatientDetail } = await import('../PatientDetail')

    clientGetMock
      .mockResolvedValueOnce({
        data: {
          patient: {
            id: 7,
            first_name: 'Jane',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'Female',
            bmi: 24.5,
          },
          latest_hba1c: { value_percent: 7.2 },
          latest_glucose: { value_mgdl: 165 },
          active_medications: [{ id: 1, name: 'Metformin', dose: '500mg', frequency: 'BID' }],
          upcoming_appointments: [{ id: 11, title: 'Endocrinology Follow-up', start_datetime: '2026-06-03T10:00:00Z' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          readings: [{ id: 101, reading_type: 'fasting', reading_datetime: '2026-05-18T08:00:00Z', value_mgdl: 168 }],
          has_more: false,
        },
      })

    render(() => <PatientDetail />)

    await waitFor(() => {
      expect(clientGetMock).toHaveBeenCalledTimes(2)
    })

    expect(clientGetMock).toHaveBeenNthCalledWith(1, '/api/v1/patients/7/summary')
    expect(clientGetMock).toHaveBeenNthCalledWith(2, '/api/v1/patients/7/glucose?skip=0&limit=20')

    expect(screen.getByText('Jane Doe')).toBeTruthy()
    expect(screen.getByText('Active Medications')).toBeTruthy()
    expect(screen.getByText('Metformin')).toBeTruthy()
    expect(screen.getByText('Glucose History')).toBeTruthy()
    expect(screen.getByTestId('glucose-chart')).toBeTruthy()
  })
})
