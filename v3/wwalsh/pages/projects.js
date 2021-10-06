import Landing from '../components/landing'
import '../styles/index.module.scss'
import Resume from '../components/resume'

export default function Home() {
  return (
    <div className="app">
      <Landing />
      <Resume />
    </div>
  )
}
