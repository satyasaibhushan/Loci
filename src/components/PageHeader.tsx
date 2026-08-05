import { Link } from '../lib/router'

export function PageHeader({ eyebrow, title, description, meta }: {
  eyebrow: string
  title: string
  description: string
  meta?: string
}) {
  return (
    <header className="page-header">
      <Link className="back-link" to="/map">← Expedition map</Link>
      <div className="eyebrow">{eyebrow}</div>
      <div className="page-title-row">
        <h1>{title}</h1>
        {meta && <span className="hand-note">{meta}</span>}
      </div>
      <p>{description}</p>
    </header>
  )
}
