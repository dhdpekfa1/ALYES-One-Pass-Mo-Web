import dayjs from 'dayjs';
import {
  WEEKDAYS,
  EN_DAY_TO_NUMBER_MAP,
  EN_TO_KOR_DAY_MAP,
} from '@/shared/model';
import type { TLessonScheduleDays } from '../api/model';

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

/**
 * 수업의 실제 수강일 계산
 * scheduleDay가 오늘이면 오늘 날짜, 내일이면 내일 날짜 반환
 */
export const getLessonDate = (
  scheduleDay: TLessonScheduleDays,
  todayEnum: TLessonScheduleDays,
  tomorrowEnum: TLessonScheduleDays,
  date: string,
): string => {
  if (scheduleDay === todayEnum) {
    return date;
  }
  if (scheduleDay === tomorrowEnum) {
    return dayjs(date).add(1, 'day').format('YYYY-MM-DD');
  }

  throw new Error(
    `수업일 계산 오류: scheduleDay=${scheduleDay}, todayEnum=${todayEnum}, tomorrowEnum=${tomorrowEnum}, date=${date}`,
  );
};
