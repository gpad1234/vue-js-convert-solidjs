import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { clientGetMock } = vi.hoisted(() => ({
  clientGetMock: vi.fn(),
}))

vi.mock('../../../components/Layout', () => ({
  default: (props) => <div>{props.children}</div>,
}))

vi.mock('../../../components/PatientCard', () => ({
  default: (props) => <div data-testid="patient-card">{props.patient.first_name} {props.patient.last_name}</div>,
}))

vi.mock('../../../lib/api', async () => {
  const actual = await vi.importActual('../../../lib/api')
  return {
    ...actual,
    default: {
      get: clientGetMock,
    },
  }
})

const byNormalizedText = (text) => (_, node) => {
  const normalized = node?.textContent?.replace(/\s+/g, ' ').trim()
  return normalized === text
}

describe('PatientsIndex integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads initial patient list', async () => {
    const { default: PatientsIndex } = await import('../Index')

    clientGetMock.mockResolvedValueOnce({
      data: {
        patients: [{ id: 1, first_name: 'Alice', last_name: 'Smith' }],
        has_more: true,
      },
    })

    render(() => <PatientsIndex />)

    await waitFor(() => {
      expect(clientGetMock).toHaveBeenCalledWith('/api/v1/patients?skip=0&limit=10')
    })

    expect(await screen.findByText(byNormalizedText('Alice Smith'))).toBeTruthy()
    expect(screen.getByText('Load More')).toBeTruthy()
  })

  it('loads more patients when load-more is clicked', async () => {
    const { default: PatientsIndex } = await import('../Index')

    clientGetMock
      .mockResolvedValueOnce({
        data: {
          patients: [{ id: 1, first_name: 'Alice', last_name: 'Smith' }],
          has_more: true,
        },
      })
      .mockResolvedValueOnce({
        data: {
          patients: [{ id: 2, first_name: 'Bob', last_name: 'Jones' }],
          has_more: false,
        },
      })

    render(() => <PatientsIndex />)

    expect(await screen.findByText(byNormalizedText('Alice Smith'))).toBeTruthy()
    await fireEvent.click(screen.getByText('Load More'))

    await waitFor(() => {
      expect(clientGetMock).toHaveBeenNthCalledWith(2, '/api/v1/patients?skip=10&limit=10')
    })

    expect(await screen.findByText(byNormalizedText('Bob Jones'))).toBeTruthy()
  })

  it('applies debounced search query to API request', async () => {
    vi.useFakeTimers()
    const { default: PatientsIndex } = await import('../Index')

    clientGetMock
      .mockResolvedValueOnce({ data: { patients: [], has_more: false } })
      .mockResolvedValueOnce({ data: { patients: [{ id: 3, first_name: 'John', last_name: 'Doe' }], has_more: false } })

    render(() => <PatientsIndex />)

    await waitFor(() => {
      expect(clientGetMock).toHaveBeenCalledTimes(1)
    })

    await fireEvent.input(screen.getByPlaceholderText('Search patients by name...'), {
      target: { value: 'john' },
    })

    await vi.advanceTimersByTimeAsync(300)

    await waitFor(() => {
      expect(clientGetMock).toHaveBeenNthCalledWith(2, '/api/v1/patients?skip=0&limit=10&search=john')
    })

    expect(await screen.findByText(byNormalizedText('John Doe'))).toBeTruthy()
  })
})
