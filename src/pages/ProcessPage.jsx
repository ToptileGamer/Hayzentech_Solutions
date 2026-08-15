import Process from '../components/Process.jsx'
import { usePageMeta } from '../components/ui.jsx'

export default function ProcessPage() {
  usePageMeta(
    'Process',
    'How a project gets built — discover, design, build, launch and beyond, with weekly builds and honest updates.',
  )
  return <Process />
}
