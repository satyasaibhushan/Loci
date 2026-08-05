import { Navigate } from '../lib/router'
import { Logo } from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'

function GoogleIcon() {
  return <span className="google-g" aria-hidden="true">G</span>
}

export function LandingPage() {
  const { user, loading, error, firebaseConfigured, signInWithGoogle, enterDemo } = useAuth()
  if (user) return <Navigate to="/map" replace />

  return (
    <main className="landing-page">
      <div className="landing-compass" aria-hidden="true"><span>N</span><i /><b>✦</b></div>
      <section className="landing-copy">
        <Logo />
        <div className="landing-kicker">A school for impossible memory</div>
        <h1>What looks like talent<br />is usually a <em>map.</em></h1>
        <p>
          Build a mnemonic language, make it reflexive, then use it to conquer
          one hundred digits of π or a freshly shuffled deck.
        </p>
        <div className="landing-actions">
          <button className="primary-button google-button" type="button" disabled={loading} onClick={() => void signInWithGoogle()}>
            <GoogleIcon /> Continue with Google
          </button>
          {(!firebaseConfigured || import.meta.env.DEV) && (
            <button className="text-button" type="button" onClick={enterDemo}>Preview this expedition locally →</button>
          )}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!firebaseConfigured && <p className="config-note">Google sign-in activates when Firebase values are added. Local preview is fully functional.</p>}
      </section>

      <section className="landing-map" aria-label="Loci campaign preview">
        <div className="map-caption">Expedition 01 · The foundations</div>
        <div className="preview-path" aria-hidden="true">
          <div className="preview-node done"><span>Ⅰ</span><b>Major cipher</b></div>
          <div className="preview-line" />
          <div className="preview-node"><span>Ⅱ</span><b>PAO codex</b></div>
          <div className="preview-split">
            <div className="preview-node pi"><span>π</span><b>100 digits</b></div>
            <div className="preview-node cards"><span>♠</span><b>52 cards</b></div>
          </div>
        </div>
        <blockquote>“The palace is yours.<br />We train the path.”</blockquote>
      </section>
    </main>
  )
}
