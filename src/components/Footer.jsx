export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">
          HayzenTech<span className="nav__brand-sup">*</span>
        </span>
        <span className="footer__copy">© {year} HayzenTech Solutions · Full-stack web & app development</span>
        <a className="footer__top" href="#top">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
