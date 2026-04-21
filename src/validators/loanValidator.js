const { VALID_STATUSES } = require('../models/loanStore');

/**
 * Validate a loan creation request body.
 * @param {object} body - The request body
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateLoanCreation(body) {
  const errors = [];

  if (body == null || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] };
  }

  // borrowerName: required, non-empty string, trimmed
  if (body.borrowerName == null || typeof body.borrowerName !== 'string') {
    errors.push('borrowerName is required and must be a string');
  } else if (body.borrowerName.trim().length === 0) {
    errors.push('borrowerName must not be empty');
  }

  // loanAmount: required, positive number (> 0)
  if (body.loanAmount == null || typeof body.loanAmount !== 'number') {
    errors.push('loanAmount is required and must be a number');
  } else if (!Number.isFinite(body.loanAmount) || body.loanAmount <= 0) {
    errors.push('loanAmount must be a positive number');
  }

  // loanTerm: required, positive integer (> 0)
  if (body.loanTerm == null || typeof body.loanTerm !== 'number') {
    errors.push('loanTerm is required and must be a number');
  } else if (!Number.isInteger(body.loanTerm) || body.loanTerm <= 0) {
    errors.push('loanTerm must be a positive integer');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a status update request body.
 * @param {object} body - The request body
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateStatusUpdate(body) {
  const errors = [];

  if (body == null || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] };
  }

  if (body.status == null || !VALID_STATUSES.includes(body.status)) {
    errors.push(
      `status must be one of: ${VALID_STATUSES.join(', ')}`
    );
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateLoanCreation, validateStatusUpdate };
