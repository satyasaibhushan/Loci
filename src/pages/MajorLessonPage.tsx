import { useState } from 'react'
import { useNavigate } from '../lib/router'
import { PageHeader } from '../components/PageHeader'
import { MAJOR_SOUNDS, ignoredMajorSounds, pairToSound } from '../data/majorSystem'
import { useProgress } from '../contexts/ProgressContext'

export function MajorLessonPage() {
  const { completeQuest, progress } = useProgress()
  const navigate = useNavigate()
  const [active, setActive] = useState('0')
  const completed = progress.completedQuests.includes('major-foundations')

  const finish = () => {
    completeQuest('major-foundations')
    navigate('/quest/major-drill')
  }

  return (
    <div className="lesson-page narrow-page page-enter">
      <PageHeader eyebrow="Shared path · Level 1" title="The Major Cipher" description="Ten sound families turn abstract digits into words, people and images. Learn the sound—not the spelling." meta="10 symbols" />

      <section className="lesson-principle">
        <span className="principle-number">01</span>
        <div><h2>Consonant sounds carry the code.</h2><p>{ignoredMajorSounds}</p></div>
        <div className="cipher-example"><b>14</b><i>becomes</i><strong>{pairToSound('14')}</strong></div>
      </section>

      <section className="sound-board" aria-label="Major System sound chart">
        {MAJOR_SOUNDS.map((sound) => (
          <button type="button" key={sound.digit} className={active === sound.digit ? 'active' : ''} onClick={() => setActive(sound.digit)}>
            <span>{sound.digit}</span><b>{sound.anchor}</b><small>{sound.hint}</small>
          </button>
        ))}
      </section>

      <section className="rule-strip">
        <div><b>Vowels are mortar.</b><span>Add them freely to make words.</span></div>
        <div><b>Listen, don’t spell.</b><span>“Phone” begins with F: it codes 8.</span></div>
        <div><b>Concrete wins.</b><span>Choose images you can see and touch.</span></div>
      </section>

      <footer className="lesson-footer">
        <p>{completed ? 'Foundation recorded. Revisit whenever the sounds feel uncertain.' : 'Read the chart aloud once. Reflex comes in the next trial.'}</p>
        <button className="primary-button" type="button" onClick={finish}>{completed ? 'Continue to the drill' : 'I understand the cipher'} <span>→</span></button>
      </footer>
    </div>
  )
}
