import Contact from '../components/Contact.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function ContactPage() {
  usePageMeta(
    'Contact',
    'Start a project with HayzenTech Solutions — send an inquiry via WhatsApp or email, reply within one business day.',
  )
  return <Contact />
}
