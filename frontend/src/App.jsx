import { Router, Route } from '@solidjs/router'
import Dashboard from './pages/Dashboard'
import PatientsIndex from './pages/patients/Index'
import PatientDetail from './pages/patients/PatientDetail'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Router>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={PatientsIndex} />
      <Route path="/patients/:id" component={PatientDetail} />
      <Route path="/settings" component={Settings} />
    </Router>
  )
}
