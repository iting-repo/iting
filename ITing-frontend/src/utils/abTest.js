/**
 * Lightweight A/B testing utility — persistent variant assignment via localStorage.
 *
 * Each "experiment" assigns a user to ONE variant (random, weighted) on first interaction
 * and remembers that assignment. The chosen variant is sent to GA4 as a custom dimension
 * so we can analyze conversion per variant.
 *
 * Usage:
 *   const variant = getVariant('exit_intent_popup', ['A', 'B', 'C']);
 *   trackEvent('experiment_exposure', { experiment: 'exit_intent_popup', variant });
 */

import { trackEvent } from './analytics';

const STORAGE_PREFIX = 'iting_ab_';

/**
 * Get the variant assigned to the current user for a given experiment.
 * If not assigned, randomly pick one of `variants` and persist it.
 *
 * @param {string} experimentName - unique experiment id (e.g. "exit_intent_popup")
 * @param {string[]} variants - list of variant names (e.g. ["A", "B", "C"])
 * @returns {string} the chosen variant
 */
export function getVariant(experimentName, variants) {
  if (!variants || variants.length === 0) return null;
  if (typeof window === 'undefined') return variants[0];

  const key = STORAGE_PREFIX + experimentName;
  let stored = localStorage.getItem(key);

  // Validate stored value (in case variants changed since assignment)
  if (stored && variants.includes(stored)) return stored;

  // Pick random variant (equal weight)
  const chosen = variants[Math.floor(Math.random() * variants.length)];
  localStorage.setItem(key, chosen);
  localStorage.setItem(`${key}_assignedAt`, new Date().toISOString());

  // Fire GA4 event on first exposure
  trackEvent('experiment_exposure', {
    experiment: experimentName,
    variant: chosen,
  });

  return chosen;
}

/**
 * Track a conversion within an experiment (e.g. user converted in variant B).
 */
export function trackVariantConversion(experimentName, conversionType) {
  const key = STORAGE_PREFIX + experimentName;
  const variant = localStorage.getItem(key);
  if (!variant) return;

  trackEvent('experiment_conversion', {
    experiment: experimentName,
    variant,
    conversion_type: conversionType,
  });
}
