import { describe, expect, test } from 'bun:test'
import { discoverFootprinterString } from '../server/footprintDiscovery.js'
import { buildFootprinterPreview } from '../server/footprints.js'

describe('discoverFootprinterString', () => {
  test('recovers a parameterized dual-row footprint', () => {
    const source = 'soic8_p1.1mm_w6.2mm_pw0.55mm_pl1.4mm'
    const result = discoverFootprinterString(
      buildFootprinterPreview(source),
      3,
    )

    expect(result.diagnostics.topology).toBe('two-sided')
    expect(result.best?.family).toBe('soic')
    expect(result.best?.copperIntersectionOverUnion).toBeGreaterThan(0.99)
    expect(result.best?.footprinterString).toContain('p1.1mm')
    expect(result.best?.footprinterString).toContain('w6.2mm')
  })

  test('uses passive pad geometry to produce a complete string', () => {
    const source = 'res_p1.3mm_pw0.55mm_ph0.7mm'
    const result = discoverFootprinterString(
      buildFootprinterPreview(source),
      2,
    )

    expect(result.best?.family).toBe('res')
    expect(result.best?.footprinterString).toBe(source)
    expect(result.best?.copperIntersectionOverUnion).toBe(1)
  })

  test('infers a BGA grid and continuous dimensions', () => {
    const source = 'bga16_grid4x4_p0.65mm_pad0.32mm'
    const result = discoverFootprinterString(
      buildFootprinterPreview(source),
      2,
    )

    expect(result.diagnostics.topology).toBe('grid')
    expect(result.best?.family).toBe('bga')
    expect(result.best?.copperIntersectionOverUnion).toBe(1)
    expect(result.best?.footprinterString).toContain('p0.65mm')
    expect(result.best?.footprinterString).toContain('pad0.32mm')
  })

  test('accounts for a center thermal pad when choosing pin count', () => {
    const source = 'qfn24_w6_h6_p0.8_pw0.3_pl0.8_thermalpad'
    const result = discoverFootprinterString(
      buildFootprinterPreview(source),
      2,
    )

    expect(result.diagnostics.topology).toBe('four-sided')
    expect(result.diagnostics.targetPadCount).toBe(25)
    expect(result.best?.family).toBe('qfn')
    expect(result.best?.footprinterString).toContain('qfn24_thermalpad')
    expect(result.best?.copperIntersectionOverUnion).toBe(1)
  })

  test('sizes an exposed thermal pad independently from the package body', () => {
    const source =
      'qfn56_w7_h7_p0.4_pw0.2_pl0.85_thermalpad3.1mmx3.1mm'
    const result = discoverFootprinterString(
      buildFootprinterPreview(source),
      2,
    )

    expect(result.diagnostics.targetPadCount).toBe(57)
    expect(result.best?.family).toBe('qfn')
    expect(result.best?.footprinterString).toContain(
      'thermalpad3.1mmx3.1mm',
    )
    expect(result.best?.copperIntersectionOverUnion).toBe(1)
  })
})
