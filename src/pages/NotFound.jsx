import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/ui.jsx'

export default function NotFound() {
  usePageMeta('Page not found')

  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">404 · Lost in the film</p>
        <h1 className="not-found__title">This page doesn't exist.</h1>
        <p className="not-found__lead">
          The link may be old, or the page moved. Head back to the start.
        </p>
        <Link className="cta" to="/">
          <span className="cta__label">Back home</span>
        </Link>
      </div>
    </section>
  )
}
