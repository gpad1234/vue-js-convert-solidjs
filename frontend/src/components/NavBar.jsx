import { A } from '@solidjs/router'

export default function NavBar() {
  const handleClick = (target) => {
    try {
      window.dispatchEvent(new CustomEvent('app-refresh', { detail: { from: 'nav', target } }))
    } catch {
      // Ignore non-browser contexts.
    }
  }

  return (
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div class="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
        <A href="/" class="flex flex-col items-center text-sm text-gray-600" onClick={() => handleClick('home')}>
          <span>🏠</span>
          <span>Home</span>
        </A>

        <A href="/patients" class="flex flex-col items-center text-sm text-gray-600" onClick={() => handleClick('patients')}>
          <span>👤</span>
          <span>Patients</span>
        </A>

        <A href="/settings" class="flex flex-col items-center text-sm text-gray-600" onClick={() => handleClick('settings')}>
          <span>⚙️</span>
          <span>Settings</span>
        </A>
      </div>
    </nav>
  )
}
