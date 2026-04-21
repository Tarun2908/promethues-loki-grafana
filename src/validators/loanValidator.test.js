const { validateLoanCreation, validateStatusUpdate } = require('./loanValidator');

describe('validateLoanCreation', () => {
  it('returns valid for a correct payload', () => {
    const result = validateLoanCreation({
      borrowerName: 'Alice',
      loanAmount: 10000,
      loanTerm: 12,
    });
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('trims borrowerName but rejects whitespace-only', () => {
    const result = validateLoanCreation({
      borrowerName: '   ',
      loanAmount: 5000,
      loanTerm: 6,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('borrowerName must not be empty');
  });

  it('rejects missing borrowerName', () => {
    const result = validateLoanCreation({ loanAmount: 5000, loanTerm: 6 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('borrowerName is required and must be a string');
  });

  it('rejects non-string borrowerName', () => {
    const result = validateLoanCreation({ borrowerName: 123, loanAmount: 5000, loanTerm: 6 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('borrowerName is required and must be a string');
  });

  it('rejects zero loanAmount', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: 0, loanTerm: 12 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanAmount must be a positive number');
  });

  it('rejects negative loanAmount', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: -100, loanTerm: 12 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanAmount must be a positive number');
  });

  it('rejects non-number loanAmount', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: 'abc', loanTerm: 12 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanAmount is required and must be a number');
  });

  it('rejects NaN loanAmount', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: NaN, loanTerm: 12 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanAmount must be a positive number');
  });

  it('rejects Infinity loanAmount', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: Infinity, loanTerm: 12 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanAmount must be a positive number');
  });

  it('rejects non-integer loanTerm', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: 5000, loanTerm: 6.5 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanTerm must be a positive integer');
  });

  it('rejects zero loanTerm', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: 5000, loanTerm: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanTerm must be a positive integer');
  });

  it('rejects negative loanTerm', () => {
    const result = validateLoanCreation({ borrowerName: 'Bob', loanAmount: 5000, loanTerm: -3 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('loanTerm must be a positive integer');
  });

  it('collects multiple errors at once', () => {
    const result = validateLoanCreation({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(3);
  });

  it('rejects null body', () => {
    const result = validateLoanCreation(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Request body is required');
  });

  it('rejects undefined body', () => {
    const result = validateLoanCreation(undefined);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Request body is required');
  });
});

describe('validateStatusUpdate', () => {
  it.each(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])(
    'accepts valid status %s',
    (status) => {
      const result = validateStatusUpdate({ status });
      expect(result).toEqual({ valid: true, errors: [] });
    }
  );

  it('rejects an invalid status value', () => {
    const result = validateStatusUpdate({ status: 'INVALID' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/status must be one of/);
  });

  it('rejects missing status', () => {
    const result = validateStatusUpdate({});
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/status must be one of/);
  });

  it('rejects null body', () => {
    const result = validateStatusUpdate(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Request body is required');
  });
});
