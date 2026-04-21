const express = require('express');
const { createLoan, getLoanById, getAllLoans, updateLoanStatus } = require('../models/loanStore');
const { validateLoanCreation, validateStatusUpdate } = require('../validators/loanValidator');

const router = express.Router();

/**
 * POST /api/loans — Submit a new loan application.
 * Returns 201 with the created loan, or 400 on validation failure.
 */
router.post('/', (req, res) => {
  const { valid, errors } = validateLoanCreation(req.body);
  if (!valid) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid loan application data',
      details: errors,
    });
  }

  const loan = createLoan({
    borrowerName: req.body.borrowerName,
    loanAmount: req.body.loanAmount,
    loanTerm: req.body.loanTerm,
  });

  return res.status(201).json(loan);
});

/**
 * GET /api/loans — List all loan applications.
 * Returns 200 with an array of loans.
 */
router.get('/', (_req, res) => {
  const loans = getAllLoans();
  return res.status(200).json(loans);
});

/**
 * GET /api/loans/:id — Retrieve a loan application by ID.
 * Returns 200 with the loan, or 404 if not found.
 */
router.get('/:id', (req, res) => {
  const loan = getLoanById(req.params.id);
  if (!loan) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Loan application not found',
    });
  }
  return res.status(200).json(loan);
});

/**
 * PATCH /api/loans/:id/status — Update the status of a loan application.
 * Returns 200 with the updated loan, 404 if not found, or 400 on validation failure.
 */
router.patch('/:id/status', (req, res) => {
  const { valid, errors } = validateStatusUpdate(req.body);
  if (!valid) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid status update',
      details: errors,
    });
  }

  const loan = updateLoanStatus(req.params.id, req.body.status);
  if (!loan) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Loan application not found',
    });
  }

  return res.status(200).json(loan);
});

module.exports = router;
