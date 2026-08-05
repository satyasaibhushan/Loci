import { Link } from '../lib/router'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="logo-mark" to="/map" aria-label="Loci expedition map">
      <span className="logo-glyph" aria-hidden="true">L<span /></span>
      {!compact && <span className="logo-word">Loci<small>Your mind is the map</small></span>}
    </Link>
  )
}
