export const PI_DIGITS =
  '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'

export function chunkDigits(digits: string, size = 6): string[] {
  return digits.match(new RegExp(`.{1,${size}}`, 'g')) ?? []
}
