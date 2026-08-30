import Team from '../components/Team.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function TeamPage() {
  usePageMeta(
    'Team',
    'Meet the HayzenTech Solutions team — a small, senior group of full-stack, mobile and frontend engineers who design, build and ship your product end to end.',
    '/team',
  )
  return <Team />
}
