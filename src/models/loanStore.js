const crypto = require('crypto');

const VALID_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

/** @type {Map<string, object>} */
const loans = new Map();

/**
 * Create a new loan application.
 * Assigns a UUID v4, sets status to SUBMITTED, and sets timestamps.
 * @param {{ borrowerName: string, loanAmount: number, loanTerm: number }} data
 * @returns {object} The created loan application
 */
function createLoan(data) {
  const now = new Date().toISOString();
  const loan = {
    id: crypto.randomUUID(),
    borrowerName: data.borrowerName,
    loanAmount: data.loanAmount,
    loanTerm: data.loanTerm,
    status: 'SUBMITTED',
    createdAt: now,
    updatedAt: now,
  };
  loans.set(loan.id, loan);
  return { ...loan };
}

/**
 * Retrieve a loan application by its unique identifier.
 * @param {string} id
 * @returns {object|undefined} The loan application, or undefined if not found
 */
function getLoanById(id) {
  const loan = loans.get(id);
  return loan ? { ...loan } : undefined;
}

/**
 * List all loan applications.
 * @returns {object[]} Array of all loan applications
 */
function getAllLoans() {
  return Array.from(loans.values()).map((loan) => ({ ...loan }));
}

/**
 * Update the status of an existing loan application.
 * @param {string} id
 * @param {string} status - One of SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
 * @returns {object|undefined} The updated loan application, or undefined if not found
 */
function updateLoanStatus(id, status) {
  const loan = loans.get(id);
  if (!loan) {
    return undefined;
  }
  loan.status = status;
  loan.updatedAt = new Date().toISOString();
  loans.set(id, loan);
  return { ...loan };
}

/**
 * Clear all loans from the store. Used for test cleanup.
 */
function clearLoans() {
  loans.clear();
}

module.exports = {
  VALID_STATUSES,
  createLoan,
  getLoanById,
  getAllLoans,
  updateLoanStatus,
  clearLoans,
};
