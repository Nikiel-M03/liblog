import { describe, it, expect } from 'vitest'
import { supabase } from '@/services/supabase'

describe('Supabase client', () => {
  it('should export a supabase client instance', () => {
    expect(supabase).toBeDefined()
  })

  it('should have auth module', () => {
    expect(supabase.auth).toBeDefined()
  })

  it('should have from method for table access', () => {
    expect(typeof supabase.from).toBe('function')
  })

  it('should be properly initialized', () => {
    expect(supabase).toHaveProperty('auth')
    expect(supabase).toHaveProperty('from')
  })
})
