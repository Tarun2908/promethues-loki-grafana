const {
  createLoan,
  getLoanById,
  getAllLoans,
  updateLoanStatus,
  clearLoans,
  VALID_STATUSES,
} = require('./loanStore');

beforeEach(() => {
  clearLoans();
});

describe('loanStore', () => {
  const validInput = {
    borrowerName: 'Jane Doe',
    loanAmount: 50000,
    loanTerm: 36,
  };

  describe('createLoan', () => {
    test('returns a loan with UUID id, SUBMITTED status, and timestamps', () => {
      const loan = createLoan(validInput);

      expect(loan.id).toBeDefined();
      expect(typeof loan.id).toBe('string');
      expect(loan.id.length).toBeGreaterThan(0);
      expect(loan.borrowerName).toBe('Jane Doe');
      expect(loan.loanAmount).toBe(50000);
      expect(loan.loanTerm).toBe(36);
      expect(loan.status).toBe('SUBMITTED');
      expect(loan.createdAt).toBeDefined();
      expect(loan.updatedAt).toBeDefined();
      // Timestamps should be valid ISO 8601
      expect(() => new Date(loan.createdAt)).not.toThrow();
      expect(() => new Date(loan.updatedAt)).not.toThrow();
    });

    test('assigns unique IDs to different loans', () => {
      const loan1 = createLoan(validInput);
      const loan2 = createLoan(validInput);
      expect(loan1.id).not.toBe(loan2.id);
    });
  });

  describe('getLoanById', () => {
    test('returns the loan when it exists', () => {
      const created = createLoan(validInput);
      const retrieved = getLoanById(created.id);

      expect(retrieved).toEqual(created);
    });

    test('returns undefined for a non-existent ID', () => {
      const result = getLoanById('non-existent-id');
      expect(result).toBeUndefined();
    });

    test('returns a copy, not the original reference', () => {
      const created = createLoan(validInput);
      const retrieved = getLoanById(created.id);
      retrieved.borrowerName = 'Modified';

      const retrievedAgain = getLoanById(created.id);
      expect(retrievedAgain.borrowerName).toBe('Jane Doe');
    });
  });

  describe('getAllLoans', () => {
    test('returns empty array when no loans exist', () => {
      expect(getAllLoans()).toEqual([]);
    });

    test('returns all created loans', () => {
      const loan1 = createLoan(validInput);
      const loan2 = createLoan({ ...validInput, borrowerName: 'John Smith' });

      const all = getAllLoans();
      expect(all).toHaveLength(2);

      const ids = all.map((l) => l.id);
      expect(ids).toContain(loan1.id);
      expect(ids).toContain(loan2.id);
    });
  });

  describe('updateLoanStatus', () => {
    test('updates the status and updatedAt timestamp', () => {
      const created = createLoan(validInput);
      const updated = updateLoanStatus(created.id, 'APPROVED');

      expect(updated.status).toBe('APPROVED');
      expect(updated.id).toBe(created.id);
      expect(updated.borrowerName).toBe(created.borrowerName);
      expect(updated.loanAmount).toBe(created.loanAmount);
      expect(updated.loanTerm).toBe(created.loanTerm);
    });

    test('returns undefined for a non-existent ID', () => {
      const result = updateLoanStatus('non-existent-id', 'APPROVED');
      expect(result).toBeUndefined();
    });

    test('persists the status change', () => {
      const created = createLoan(validInput);
      updateLoanStatus(created.id, 'UNDER_REVIEW');

      const retrieved = getLoanById(created.id);
      expect(retrieved.status).toBe('UNDER_REVIEW');
    });
  });

  describe('clearLoans', () => {
    test('removes all loans from the store', () => {
      createLoan(validInput);
      createLoan(validInput);
      expect(getAllLoans()).toHaveLength(2);

      clearLoans();
      expect(getAllLoans()).toHaveLength(0);
    });
  });

  describe('VALID_STATUSES', () => {
    test('exports the four valid status values', () => {
      expect(VALID_STATUSES).toEqual([
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
      ]);
    });
  });
});
