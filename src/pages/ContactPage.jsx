import Contact from '../components/Contact.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function ContactPage() {
  usePageMeta(
    'Contact',
    'Start a project with HayzenTech Solutions — send an inquiry via WhatsApp or email. We reply within one business day. Full-stack web & mobile app development.',
    '/contact',
  )
  return <Contact />
}
