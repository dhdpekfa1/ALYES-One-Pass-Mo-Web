export const EN_DAY_TO_NUMBER_MAP: { [key: string]: number } = {
  MON: 0,
  TUE: 1,
  WED: 2,
  TUR: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6,
};

export const EN_TO_KOR_DAY_MAP: Record<string, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  TUR: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

export const KOR_TO_EN_ATTENDANCE_STATUS_MAP = {
  출석: 'WILL_ATTENDANCE',
  결석: 'WILL_ABSENT',
} as const;
