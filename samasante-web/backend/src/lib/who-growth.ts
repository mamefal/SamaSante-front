import { logger } from './logger.js'

/**
 * WHO Growth Standards Service
 * Simplified implementation based on WHO LMS parameters (L, M, S)
 * for Weight-for-Age (Z-scores)
 * Reference: https://www.who.int/toolkits/child-growth-standards/standards
 */

interface LMSParams {
    L: number // Box-Cox power
    M: number // Median
    S: number // Coefficient of variation
}

// Compact Weight-for-Age (WFA) LMS for Boys (0-24 months) - subset for sample
const WFA_BOYS: Record<number, LMSParams> = {
    0: { L: 0.3487, M: 3.3464, S: 0.14602 },
    1: { L: 0.2035, M: 4.4709, S: 0.13381 },
    3: { L: -0.0436, M: 6.4024, S: 0.11715 },
    6: { L: -0.1610, M: 7.8978, S: 0.10842 },
    9: { L: -0.1983, M: 8.9329, S: 0.10526 },
    12: { L: -0.2117, M: 9.6763, S: 0.10435 },
    18: { L: -0.2198, M: 10.9231, S: 0.10515 },
    24: { L: -0.2227, M: 12.1521, S: 0.10729 }
}

// Compact Weight-for-Age (WFA) LMS for Girls (0-24 months) - subset for sample
const WFA_GIRLS: Record<number, LMSParams> = {
    0: { L: 0.4355, M: 3.2321, S: 0.14171 },
    1: { L: 0.3121, M: 4.1707, S: 0.13115 },
    3: { L: 0.1017, M: 5.8459, S: 0.11690 },
    6: { L: -0.0195, M: 7.2819, S: 0.11025 },
    9: { L: -0.0611, M: 8.2435, S: 0.10825 },
    12: { L: -0.0775, M: 8.9482, S: 0.10813 },
    18: { L: -0.0911, M: 10.1541, S: 0.11009 },
    24: { L: -0.0971, M: 11.4750, S: 0.11339 }
}

/**
 * Calculate Z-Score using WHO LMS formula
 * Z = [ ( (Y/M)^L ) - 1 ] / (L * S)
 */
export function calculateZScore(value: number, lms: LMSParams): number {
    const { L, M, S } = lms
    if (L === 0) return Math.log(value / M) / S
    return (Math.pow(value / M, L) - 1) / (L * S)
}

/**
 * Error Function (erf) approximation
 */
export function erf(x: number): number {
    // constants
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    // Save the sign of x
    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)

    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x))

    return sign * y
}

/**
 * Convert Z-Score to Percentile
 */
export function zScoreToPercentile(z: number): number {
    const p = (1 + erf(z / Math.sqrt(2))) / 2
    return Math.round(p * 100)
}

export function getWeightForAgePercentile(ageInMonths: number, weight: number, gender: 'male' | 'female' = 'male'): number {
    try {
        const table = gender === 'male' ? WFA_BOYS : WFA_GIRLS

        // Find closest age entry
        const entries = Object.keys(table).map(Number).sort((a, b) => a - b)
        let closestAge: number = entries[0] ?? 0
        for (const age of entries) {
            if (ageInMonths >= age) closestAge = age
            else break
        }

        const lms = (table as any)[closestAge] as LMSParams
        if (!lms) return 50 // Default to middle

        const z = calculateZScore(weight, lms)
        return zScoreToPercentile(z)
    } catch (error) {
        logger.error(`Error calculating growth percentile: ${error}`)
        return 50
    }
}
