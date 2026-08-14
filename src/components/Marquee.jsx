import { MARQUEE } from '../content.js'

export default function Marquee() {
  // Two copies so the CSS translateX(-50%) loop is seamless.
  const items = [...MARQUEE, ...MARQUEE]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {items.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
