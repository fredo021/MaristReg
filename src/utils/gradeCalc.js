export function getAgeAsOfJan1(dob) {
  if (!dob) return null
  const birth = new Date(dob + 'T00:00:00')
  const year = new Date().getFullYear()
  const jan1 = new Date(year, 0, 1)
  let age = year - birth.getFullYear()
  const m = jan1.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && jan1.getDate() < birth.getDate())) age--
  return age
}

export function calculateGrade(dob, gender) {
  const age = getAgeAsOfJan1(dob)
  if (age === null || !gender) return ''
  if (age < 12) return 'Under 12s'
  const f = gender === 'Female'
  const o = gender === 'Other'
  if (age < 14) return o ? 'Under 14s' : f ? 'Under 14 Girls' : 'Under 14 Boys'
  if (age < 16) return o ? 'Under 16s' : f ? 'Under 16 Girls' : 'Under 16 Boys'
  if (age < 18) return o ? 'Under 18s' : f ? 'Under 18 Women' : 'Under 18 Men'
  if (age < 21) return o ? 'Under 21s' : f ? 'Under 21 Women' : 'Under 21 Men'
  return o ? 'Senior' : f ? 'Senior Women' : 'Senior Men'
}
