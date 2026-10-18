/**
 * Decides whether a bill title is about health.
 *
 * Congress.gov's bill list endpoint does not return the policy area, so we
 * classify on the title. Terms are matched as whole words: a plain substring
 * check let "intergovernmental" match "mental" and "casualty" match "cast",
 * which put Department of Defense procurement bills on the health page.
 */

export const HEALTH_TERMS = [
  'health', 'healthcare', 'health care', 'medicare', 'medicaid', 'hospital', 'medical',
  'prescription drug', 'pharmacy', 'pharmaceutical', 'opioid', 'fentanyl',
  'nursing', 'physician', 'patient', 'affordable care', 'maternal',
  'reproductive', 'telehealth', 'disease', 'pandemic', 'vaccine', 'cancer',
  'diabetes', 'clinical', 'nurse', 'substance use', 'substance abuse',
  'addiction', 'emergency medical', 'hospice', 'mental health', 'suicide',
  'drug pricing', 'insulin', 'dental', 'organ donation', 'alzheimer', 'autism',
  // Nutrition and food programs are health policy for the families they reach.
  'wic', 'nutrition', 'women, infants, and children', 'supplemental nutrition',
  'school meals', 'food assistance', 'hunger', 'public health', 'behavioral health',
  "children's health insurance", 'home health', 'long-term care', 'caregiver',
];

export const EXCLUDE_TERMS = [
  'terrorism', 'terrorist', 'property and casualty', 'casualty insurance',
  'flood insurance', 'crop insurance', 'deposit insurance', 'title insurance',
  'reinsurance', 'firearm', 'tax-exempt bond',
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds a case-insensitive regex that matches any term as a whole word, with an optional plural "s". */
export function wordPattern(terms: string[]): RegExp {
  return new RegExp(`\\b(?:${terms.map(escapeRegExp).join('|')})s?\\b`, 'i');
}

const healthPattern = wordPattern(HEALTH_TERMS);
const excludePattern = wordPattern(EXCLUDE_TERMS);

export function isHealthBill(title: string | null | undefined): boolean {
  if (!title) return false;
  if (excludePattern.test(title)) return false;
  return healthPattern.test(title);
}
