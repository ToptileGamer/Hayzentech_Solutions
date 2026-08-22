import Process from '../components/Process.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function ProcessPage() {
  usePageMeta(
    'Process',
    'How a project gets built at HayzenTech Solutions — discover, design, build, launch and beyond, with weekly builds and honest updates.',
    '/process',
  )
  return <Process />
}
