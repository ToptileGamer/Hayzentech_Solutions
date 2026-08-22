import Services from '../components/Services.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function ServicesPage() {
  usePageMeta(
    'Services',
    'Full-stack web & app development services from HayzenTech Solutions — SaaS platforms, e-commerce stores, Flutter mobile apps, REST & GraphQL APIs, landing pages and redesigns.',
    '/services',
  )
  return <Services />
}
