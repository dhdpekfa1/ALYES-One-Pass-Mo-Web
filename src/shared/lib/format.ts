import dayjs from 'dayjs';
import {
  WEEKDAYS,
  EN_DAY_TO_NUMBER_MAP,
  EN_TO_KOR_DAY_MAP,
} from '@/shared/model';

/** MON -> 월 */
export const formatWeekdaysKo = (days: string[]): string => {
  const sortedDays = days.sort(
    (a, b) => EN_DAY_TO_NUMBER_MAP[a] - EN_DAY_TO_NUMBER_MAP[b],
  );
  return sortedDays.map(d => EN_TO_KOR_DAY_MAP[d] ?? d).join(', ');
};

/** 01012345678 -> 010-1234-5678 */
export const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) {
    return '';
  }
  const formatted = phoneNumber.replace(/\D/g, '');
  const match = formatted.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return formatted;
};

/** 010-1234-5678 -> 01012345678 */
export const removeHyphens = (value?: string) => {
  if (!value) {
    return '';
  }
  return value.replace(/-/g, '');
};

/** Dayjs -> enum(MON, TUE, WED, TUR, FRI, SAT, SUN) */
export const formatEnumDay = (dayJs: dayjs.Dayjs) => {
  const idx = dayJs.day();
  return WEEKDAYS[idx];
};

/**
 * 오늘/내일 수업 필터링
 * 내일 수업은 모두 표시, 오늘 수업은 startTime이 현재 시간 이후인 것만 표시
 */
export const filterLessonsByTodayAndTomorrow = <
  T extends {
    lessonSchedule: { scheduleDay: string; startTime: string };
  },
>(
  lessons: T[],
  todayEnum: string,
  tomorrowEnum: string,
  nowHHmm: string,
): T[] => {
  return lessons.filter(lesson => {
    const { scheduleDay, startTime } = lesson.lessonSchedule;
    return (
      scheduleDay === tomorrowEnum ||
      (scheduleDay === todayEnum && startTime >= nowHHmm)
    );
  });
};
