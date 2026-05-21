import { describe, expect, it } from 'vitest'
import { buildPatientsUrl, buildGlucoseUrl, classifyGlucose, classifyHbA1c } from '../api'

describe('api helper utilities', () => {
  it('builds patients query URL with filters', () => {
    expect(buildPatientsUrl(10, 25, 'john', 'Type 2')).toBe('/api/v1/patients?skip=10&limit=25&search=john&diabetes_type=Type+2')
  })

  it('builds glucose query URL with reading type', () => {
    expect(buildGlucoseUrl(7, 40, 20, 'fasting')).toBe('/api/v1/patients/7/glucose?skip=40&limit=20&reading_type=fasting')
  })

  it('classifies glucose ranges including critical low and very high', () => {
    expect(classifyGlucose(50).label).toBe('Critical Low')
    expect(classifyGlucose(260).label).toBe('Very High')
  })

  it('classifies HbA1c ranges', () => {
    expect(classifyHbA1c(5.5).label).toBe('Normal')
    expect(classifyHbA1c(9.1).label).toBe('Poorly Controlled')
  })
})
