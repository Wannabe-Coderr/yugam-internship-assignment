import { describe, expect, it } from 'vitest'
import {
  validateProfileEmail,
  validateProfileMobileNumber,
  validateProfileName,
  validateProfilePassword,
  validateProfileUsername,
  validateRegistrationEmail,
  validateRegistrationName,
  validateRegistrationPassword,
} from './validation'

describe('validation helpers', () => {
  describe('Name', () => {
    it.each([
      ['Atul', ''],
      ['Atul Kumar', ''],
    ])('accepts %s', (value) => {
      expect(validateRegistrationName(value)).toBe('')
      expect(validateProfileName(value)).toBe('')
    })

    it.each(['Atul123', 'Atul@', ''])('rejects %s', (value) => {
      expect(validateRegistrationName(value)).not.toBe('')
      expect(validateProfileName(value)).not.toBe('')
    })
  })

  describe('Password', () => {
    it.each([['atul1234']])('accepts %s', (value) => {
      expect(validateRegistrationPassword(value)).toBe('')
      expect(validateProfilePassword(value)).toBe('')
    })

    it.each(['12345678', 'abcdefgh', ''])('rejects %s', (value) => {
      expect(validateRegistrationPassword(value)).not.toBe('')
      expect(validateProfilePassword(value)).not.toBe('')
    })
  })

  describe('Mobile Number', () => {
    it.each(['9876543210'])('accepts %s', (value) => {
      expect(validateProfileMobileNumber(value)).toBe('')
    })

    it.each(['987654321', '98765432101', '98765abc10'])('rejects %s', (value) => {
      expect(validateProfileMobileNumber(value)).not.toBe('')
    })
  })

  describe('Username', () => {
    it.each(['atul123', 'atul_123', 'atul.123', 'atul-123'])('accepts %s', (value) => {
      expect(validateProfileUsername(value)).toBe('')
    })

    it.each(['atul__123', 'atul@123', 'atul 123', ''])('rejects %s', (value) => {
      expect(validateProfileUsername(value)).not.toBe('')
    })
  })

  describe('Email', () => {
    it.each(['atul@example.com'])('accepts %s', (value) => {
      expect(validateRegistrationEmail(value)).toBe('')
      expect(validateProfileEmail(value)).toBe('')
    })

    it.each(['atul.example.com', 'atul@', ''])('rejects %s', (value) => {
      expect(validateRegistrationEmail(value)).not.toBe('')
      expect(validateProfileEmail(value)).not.toBe('')
    })
  })
})
