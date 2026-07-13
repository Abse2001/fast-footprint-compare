import { expect, test } from 'bun:test'
import { fp } from '@tscircuit/footprinter'
import type { AnyCircuitElement } from 'circuit-json'
import { circuitJsonToFootprinter } from 'circuit-json-to-footprinter'

test('uses the library to preserve the C2040 thermal pad size', () => {
  const circuitJson = fp
    .string('qfn56_w7_h7_p0.4_pw0.2_pl0.85_thermalpad3.1mmx3.1mm')
    .circuitJson() as AnyCircuitElement[]
  const result = circuitJsonToFootprinter(circuitJson, {
    maxCandidates: 2,
    sourceHints: ['C2040 QFN-56 exposed pad'],
  })

  expect(result.best?.footprinterString).toContain(
    'thermalpad3.1mmx3.1mm',
  )
  expect(result.best?.copperIntersectionOverUnion).toBe(1)
})
