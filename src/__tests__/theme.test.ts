import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Theme CSS unit tests
 * Validates: Requirements 9.1, 9.8
 *
 * Tests that the D&D theme CSS file contains expected custom properties
 * and provides graceful fallbacks for textures and fonts.
 */

const themeCss = readFileSync(resolve(__dirname, '../assets/theme.css'), 'utf-8')

describe('D&D Theme CSS Custom Properties (Req 9.1)', () => {
  it('defines color custom properties on :root', () => {
    expect(themeCss).toContain('--color-parchment:')
    expect(themeCss).toContain('--color-parchment-dark:')
    expect(themeCss).toContain('--color-wood-dark:')
    expect(themeCss).toContain('--color-wood-medium:')
    expect(themeCss).toContain('--color-gold:')
    expect(themeCss).toContain('--color-gold-light:')
    expect(themeCss).toContain('--color-red-deep:')
    expect(themeCss).toContain('--color-ink:')
    expect(themeCss).toContain('--color-candlelight:')
    expect(themeCss).toContain('--color-shadow:')
  })

  it('defines font-family custom properties on :root', () => {
    expect(themeCss).toContain('--font-heading:')
    expect(themeCss).toContain('--font-body:')
    expect(themeCss).toContain('--font-ui:')
  })

  it('defines border and shadow custom properties on :root', () => {
    expect(themeCss).toContain('--border-wood:')
    expect(themeCss).toContain('--border-gold:')
    expect(themeCss).toContain('--shadow-panel:')
    expect(themeCss).toContain('--shadow-glow:')
  })

  it('defines texture custom properties on :root', () => {
    expect(themeCss).toContain('--texture-parchment:')
    expect(themeCss).toContain('--texture-leather:')
    expect(themeCss).toContain('--texture-wood:')
  })

  it('font stacks include medieval/fantasy font names with serif fallbacks', () => {
    expect(themeCss).toMatch(/--font-heading:.*MedievalSharp.*serif/)
    expect(themeCss).toMatch(/--font-body:.*Crimson Text.*serif/)
    expect(themeCss).toMatch(/--font-ui:.*Lora.*serif/)
  })
})

describe('Theme fallback handling (Req 9.8)', () => {
  it('body has a solid background-color fallback before texture image', () => {
    // The body should set background-color (solid fallback) before background-image (texture)
    expect(themeCss).toMatch(/body[\s\S]*?background-color:\s*var\(--color-wood-dark\)/)
    expect(themeCss).toMatch(/body[\s\S]*?background-image:\s*var\(--texture-wood\)/)
  })

  it('parchment panel class has solid color fallback before texture', () => {
    expect(themeCss).toMatch(/\.panel-parchment[\s\S]*?background-color:\s*var\(--color-parchment\)/)
    expect(themeCss).toMatch(/\.panel-parchment[\s\S]*?background-image:\s*var\(--texture-parchment\)/)
  })
})
