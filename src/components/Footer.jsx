import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Link className="footer__brand" to="/">
          HayzenTech Solutions
        </Link>
        <span className="footer__copy">© {year} HayzenTech Solutions · Full-stack web & app development</span>
        <button
          className="footer__top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
