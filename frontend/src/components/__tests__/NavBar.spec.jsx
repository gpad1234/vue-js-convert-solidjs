import { render, fireEvent, screen } from '@solidjs/testing-library'
import { Router, Route } from '@solidjs/router'
import NavBar from '../NavBar'
import { describe, it, expect, vi } from 'vitest'

describe('NavBar', () => {
  it('dispatches app-refresh event when patients link clicked', async () => {
    render(() => (
      <Router>
        <Route path="/" component={NavBar} />
      </Router>
    ))
    const spy = vi.spyOn(window, 'dispatchEvent')
    await fireEvent.click(screen.getByText('Patients'))

    expect(spy).toHaveBeenCalled()
    const calledWith = spy.mock.calls[0][0]
    expect(calledWith.type).toBe('app-refresh')
  })
})
