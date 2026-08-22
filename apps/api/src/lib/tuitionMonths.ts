import type { ITuitionMonth, PaymentStatus } from '@dt-academy/types';
import {
  MONTHLY_TUITION_ETB,
  MONTH_NAMES,
  isCurrentMonth,
  monthHasPassed,
  tuitionPenaltyEtb,
} from '@dt-academy/types';

export type PaymentMonthRow = {
  month: number;
  coveredMonths?: string | null;
  status: PaymentStatus;
  referencePNR: string;
};

export function monthsCovered(p: PaymentMonthRow): number[] {
  const extra = (p.coveredMonths ?? '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => n >= 1 && n <= 12);
  if (extra.length) return extra;
  return p.month >= 1 ? [p.month] : [];
}

export function buildTuitionMonths(year: number, payments: PaymentMonthRow[]): ITuitionMonth[] {
  const active = payments.filter((p) => p.status !== 'REJECTED');
  return MONTH_NAMES.map((label, i) => {
    const month = i + 1;
    const covering = active.filter((p) => monthsCovered(p).includes(month));
    const match = covering.find((p) => p.status === 'VERIFIED') ?? covering.find((p) => p.status === 'PENDING');
    let status: ITuitionMonth['status'] = 'UPCOMING';
    if (match?.status === 'VERIFIED') status = 'PAID';
    else if (match?.status === 'PENDING') status = 'PENDING';
    else if (monthHasPassed(year, month) || isCurrentMonth(year, month)) status = 'UNPAID';

    const unpaid = status === 'UNPAID' || status === 'PENDING';
    const penaltyEtb =
      unpaid && (monthHasPassed(year, month) || isCurrentMonth(year, month)) ? tuitionPenaltyEtb(year, month) : 0;

    return {
      year,
      month,
      label: `${label} ${year}`,
      status,
      penaltyEtb,
      baseEtb: MONTHLY_TUITION_ETB,
      totalDueEtb: MONTHLY_TUITION_ETB + penaltyEtb,
      referencePNR: match?.referencePNR,
    };
  });
}
