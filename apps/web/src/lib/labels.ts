export function gradeLabel(level: number): string {
  if (level === 0) return 'KG';
  if (level === 9) return 'Prep';
  return `Grade ${level}`;
}

export function methodLabel(method: string): string {
  if (method === 'CASH') return 'Cash at office';
  if (method === 'BANK_TRANSFER') return 'Bank transfer';
  if (method === 'TELEBIRR') return 'Telebirr';
  if (method === 'MPESA') return 'M-Pesa';
  return method;
}
