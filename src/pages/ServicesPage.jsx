import Services from '../components/Services.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function ServicesPage() {
  usePageMeta(
    'Services',
    'Full-stack web & app development services — SaaS platforms, e-commerce, Flutter apps, APIs and redesigns.',
  )
  return <Services />
}
