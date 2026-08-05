export interface MajorSound {
  digit: string
  sounds: string[]
  anchor: string
  hint: string
}

export const MAJOR_SOUNDS: MajorSound[] = [
  { digit: '0', sounds: ['S', 'Z', 'soft C'], anchor: 'S/Z', hint: 'Zero starts with Z.' },
  { digit: '1', sounds: ['T', 'D', 'TH'], anchor: 'T/D', hint: 'One downstroke in T or D.' },
  { digit: '2', sounds: ['N'], anchor: 'N', hint: 'N has two downstrokes.' },
  { digit: '3', sounds: ['M'], anchor: 'M', hint: 'M has three downstrokes.' },
  { digit: '4', sounds: ['R'], anchor: 'R', hint: 'Four ends in an R sound.' },
  { digit: '5', sounds: ['L'], anchor: 'L', hint: 'Roman fifty is L.' },
  { digit: '6', sounds: ['J', 'SH', 'CH', 'soft G'], anchor: 'J/SH', hint: 'A script J curls like a six.' },
  { digit: '7', sounds: ['K', 'hard G', 'Q', 'hard C'], anchor: 'K/G', hint: 'A seven can be drawn with two Ks.' },
  { digit: '8', sounds: ['F', 'V'], anchor: 'F/V', hint: 'A handwritten f has two loops.' },
  { digit: '9', sounds: ['P', 'B'], anchor: 'P/B', hint: 'A P or b mirrors a nine.' },
]

export const PRIMARY_SOUND: Record<string, string> = Object.fromEntries(
  MAJOR_SOUNDS.map(({ digit, sounds }) => [digit, sounds[0]]),
)

export const ignoredMajorSounds = 'Vowels plus W, H and Y carry no number. Double sounds count once.'

export function pairToSound(code: string): string {
  return code
    .padStart(2, '0')
    .slice(-2)
    .split('')
    .map((digit) => PRIMARY_SOUND[digit])
    .join(' · ')
}
