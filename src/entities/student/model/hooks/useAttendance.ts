import { useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { useToast } from '@/shared/model/hooks';
import type { AttendanceFormValues } from '@/entities/student/model';
import type { TShuttleAttendanceItem } from '@/entities/student/model/types';
import { formatEnumDay, getLessonDate } from '@/shared/lib';
import {
  type TPostShuttleAttendanceRequest,
  type TGetLessonTeacherResponse,
  usePostShuttleAttendance,
} from '@/entities/student/api';
import type {
  TLessonScheduleDays,
  TShuttleAttendanceStatusEnum,
  TShuttleUsage,
} from '@/shared/api/model';

type LessonItem = TGetLessonTeacherResponse['result'][number];

const BOARDING_ORDER_DEFAULT = 999;

const ensureIds = (lesson: LessonItem) => {
  const lessonId = lesson.lesson.id;
  const lessonScheduleId = lesson.lessonSchedule.id;
  // lessonStudentEvent의 경우 lessonStudent, lessonStudentDetail 정보가 없는 상태 -> 0으로 요청
  const lessonStudentId = lesson.lessonStudent?.id ?? 0;
  const lessonStudentDetailId = lesson.lessonStudentDetail?.id ?? 0;
  if (
    lessonId == null ||
    lessonStudentId == null ||
    lessonScheduleId == null ||
    lessonStudentDetailId == null
  )
    return null;
  return {
    lessonId,
    lessonStudentId,
    lessonScheduleId,
    lessonStudentDetailId,
  } as const;
};

const getLastShuttle = (lesson: LessonItem) =>
  (lesson.shuttleAttendance?.length ?? 0) > 0
    ? lesson.shuttleAttendance![lesson.shuttleAttendance!.length - 1]
    : undefined;

const buildItem = (
  lesson: LessonItem,
  ids: ReturnType<typeof ensureIds>,
  todayDate: string,
  todayEnum: TLessonScheduleDays,
  tomorrowEnum: TLessonScheduleDays,
  studentId: number,
  status: TShuttleAttendanceStatusEnum | undefined,
  existedId?: number,
  overrideType?: TShuttleUsage,
): TShuttleAttendanceItem => {
  if (!ids) {
    throw new Error('수업 정보가 올바르지 않습니다.');
  }

  const lessonDate = getLessonDate(
    lesson.lessonSchedule.scheduleDay,
    todayEnum,
    tomorrowEnum,
    todayDate,
  );

  const base = {
    type: overrideType ?? lesson.lessonStudentDetail?.shuttleUsage ?? 'NONE',
    studentId,
    lessonId: ids.lessonId,
    lessonStudentId: ids.lessonStudentId,
    lessonScheduleId: ids.lessonScheduleId,
    lessonStudentDetailId: ids.lessonStudentDetailId,
    time: lessonDate,
    boardingOrder: BOARDING_ORDER_DEFAULT,
    ...(status ? { status } : {}),
  } satisfies Omit<TShuttleAttendanceItem, 'id'>;

  return existedId != null ? { id: existedId, ...base } : { ...base };
};

export const useAttendance = (
  studentId: number,
  date: string, // YYYY-MM-DD
  lessons: LessonItem[],
) => {
  const { toast } = useToast();
  const { mutate, isPending, isError, isSuccess, data } =
    usePostShuttleAttendance();

  const todayEnum = formatEnumDay(dayjs(date));
  const tomorrowEnum = formatEnumDay(dayjs(date).add(1, 'day'));

  const defaults = useMemo<AttendanceFormValues['items']>(() => {
    return lessons.flatMap(lesson => {
      const existed = getLastShuttle(lesson);
      const ids = ensureIds(lesson);
      if (!ids) return [];
      return [
        buildItem(
          lesson,
          ids,
          date,
          todayEnum,
          tomorrowEnum,
          studentId,
          existed?.status ?? undefined,
          existed?.id,
        ),
      ];
    });
  }, [lessons, studentId, date, todayEnum, tomorrowEnum]);

  const toRequest = useCallback(
    (
      formItems: AttendanceFormValues['items'],
    ): {
      payload: TPostShuttleAttendanceRequest;
      hasChanged: boolean;
    } => {
      let hasChanged = false;
      const payload: TPostShuttleAttendanceRequest = [];

      lessons.forEach((lesson, index) => {
        const ids = ensureIds(lesson);
        if (!ids) return;

        const chosen = formItems?.[index]?.status;
        const latest = getLastShuttle(lesson);
        const latestStatus = latest?.status;

        const isNew = !latestStatus && !!chosen;
        const isUpdated = !!latestStatus && !!chosen && chosen !== latestStatus;

        // 새로 입력/수정되지 않은 항목은 API 요청에서 제외
        if (!isNew && !isUpdated) {
          return;
        }

        hasChanged = true;
        const effective = chosen!;

        payload.push(
          buildItem(
            lesson,
            ids,
            date,
            todayEnum,
            tomorrowEnum,
            studentId,
            effective,
            latest?.id ?? undefined,
          ),
        );
      });

      return { payload, hasChanged };
    },
    [lessons, studentId, date, todayEnum, tomorrowEnum],
  );

  const submit = (
    formItems: AttendanceFormValues['items'],
    options?: Parameters<typeof mutate>[1],
  ) => {
    const { payload, hasChanged } = toRequest(formItems);
    if (!hasChanged || payload.length === 0) {
      toast({
        title: '변경 사항이 없습니다.',
        description: '이미 등록된 출결 상태입니다.',
      });
      return;
    }

    mutate(payload, {
      onSuccess: (data, variables, context) => {
        toast({
          title: '전송 성공',
          description: '출결 사전 확인을 전송했습니다.',
        });

        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        toast({
          variant: 'destructive',
          title: '출결 사전 확인 전송에 실패했습니다.',
          description: '다시 시도해주세요.',
        });
        options?.onError?.(error, variables, context);
      },
      ...options,
    });
  };

  return { defaults, toRequest, submit, isPending, isError, isSuccess, data };
};
