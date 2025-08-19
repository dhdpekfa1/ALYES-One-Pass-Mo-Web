import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Button, Dropdown } from '@/shared/ui';
import { formatWeekdaysKo } from '@/shared/lib';
import { useToast } from '@/shared/model/hooks';
import {
  useGetLessonSearch,
  usePostShuttleAttendance,
} from '@/entities/student/api';
import type { TPostShuttleAttendanceRequest } from '@/entities/student/api';
import {
  shuttleAttendanceFormSchema,
  type AttendanceFormValues,
} from '@/entities/student/model';

/**
 * shuttleAttendance가 빈 배열일 경우  id: null - 생성
 * shuttleAttendance가 있을 경우      해당 id 값 - 수정
 *
 * status: 출석 - WILL_ATTENDANCE, 결석 - WILL_ABSENT ✔️
 * boardingOrder: 999 고정 사용
 */

const ATTENDANCE_STATUS = [
  { label: '출석', value: 'WILL_ATTENDANCE' },
  { label: '결석', value: 'WILL_ABSENT' },
] as const;

const labelFromValue = (v?: string) =>
  ATTENDANCE_STATUS.find(s => s.value === v)?.label ?? '';
const valueFromLabel = (label: string) =>
  ATTENDANCE_STATUS.find(s => s.label === label)?.value ?? undefined;

export const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { studentId, studentName } = location.state as {
    studentId: number;
    studentName: string;
  };
  const { mutate: postShuttleAttendance, isPending } =
    usePostShuttleAttendance();

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const { data } = useGetLessonSearch(studentId, today);
  const lessons = useMemo(() => data?.result ?? [], [data?.result]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(shuttleAttendanceFormSchema),
    defaultValues: { items: [] },
  });

  const { fields } = useFieldArray({ control, name: 'items' });

  const bootKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lessons.length) return;
    const key = `${studentId}-${today}`;
    if (bootKeyRef.current === key) return;

    const defaults: AttendanceFormValues['items'] = lessons.flatMap(lesson => {
      const existed = lesson.shuttleAttendance?.[0];

      const lessonId = lesson.lessonStudent?.lessonId ?? lesson.lesson?.id;
      const lessonStudentId = lesson.lessonStudent?.id;
      const lessonScheduleId = lesson.lessonSchedule?.id;
      const lessonStudentDetailId = lesson.lessonStudentDetail?.id;

      if (
        lessonId == null ||
        lessonStudentId == null ||
        lessonScheduleId == null ||
        lessonStudentDetailId == null
      ) {
        return [];
      }

      return [
        {
          id: existed?.id ?? null,
          type: lesson.lessonStudentDetail?.shuttleUsage ?? 'NONE',
          studentId,
          lessonId,
          lessonStudentId,
          lessonScheduleId,
          lessonStudentDetailId,
          time: today,
          status: existed?.status,
          boardingOrder: 999,
        },
      ];
    });

    reset({ items: defaults });
    bootKeyRef.current = key;
  }, [lessons, reset, studentId, today]);

  const onSubmit = (values: AttendanceFormValues) => {
    const baseItems: AttendanceFormValues['items'] = lessons.flatMap(
      (lesson, index) => {
        const existed = lesson.shuttleAttendance?.[0];
        const lessonId = lesson.lessonStudent?.lessonId ?? lesson.lesson?.id;
        const lessonStudentId = lesson.lessonStudent?.id;
        const lessonScheduleId = lesson.lessonSchedule?.id;
        const lessonStudentDetailId = lesson.lessonStudentDetail?.id;
        if (
          lessonId == null ||
          lessonStudentId == null ||
          lessonScheduleId == null ||
          lessonStudentDetailId == null
        )
          return [];

        return [
          {
            id: existed?.id ?? null,
            type: lesson.lessonStudentDetail?.shuttleUsage ?? 'NONE',
            studentId,
            lessonId,
            lessonStudentId,
            lessonScheduleId,
            lessonStudentDetailId,
            time: today,
            status: values.items?.[index]?.status ?? existed?.status,
            boardingOrder: 999,
          },
        ];
      },
    );

    const hasUnselected = baseItems.some(item => !item.status);
    if (hasUnselected) {
      toast({
        variant: 'destructive',
        title: '모든 수업을 선택해주세요',
        description: '각 수업의 출결 상태를 모두 선택해주세요.',
      });
      return;
    }

    const payload = baseItems.map(item => ({
      id: item.id ?? null,
      type: item.type,
      studentId: item.studentId,
      lessonId: item.lessonId,
      lessonStudentId: item.lessonStudentId,
      lessonScheduleId: item.lessonScheduleId,
      lessonStudentDetailId: item.lessonStudentDetailId,
      time: item.time,
      status: item.status!,
      boardingOrder: 999,
    })) as TPostShuttleAttendanceRequest;
    postShuttleAttendance(payload, {
      onSuccess: () => {
        toast({
          title: '전송 성공',
          description: '출결 사전 확인을 전송했습니다.',
        });
        sessionStorage.setItem('currentStep', '2');
        navigate('/confirmation');
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: '출결 사전 확인 전송에 실패했습니다.',
          description: '다시 시도해주세요.',
        });
        return;
      },
    });
  };

  return (
    <div className='min-h-dvh w-full flex flex-col justify-between lg:justify-center'>
      <div className='w-full sm:max-w-xl lg:max-w-lg lg:mx-auto'>
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex gap-2 items-end'>
            <h1 className='italic text-green-500 text-4xl font-black'>
              ONE-pass
            </h1>
            <span className='mid-5 text-grey-600 lg:hidden'>
              출석 사전 확인
            </span>
          </div>
          <p className='title-6 text-grey-800'>
            반갑습니다, [{studentName}] 학부모님!
          </p>
          <div>
            <p className='mid-5 text-grey-600'>
              [{studentName}] 회원의 출석 여부를 알려주세요.
            </p>
            <p className='mid-5 text-grey-600'>
              보내주신 정보는 수업 준비에 큰 도움이 됩니다.
            </p>
          </div>
        </div>

        {lessons.length ? (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-4'>
            {fields.map((field, index) => {
              const lesson = lessons[index];
              return (
                <div
                  key={field.id}
                  className='flex flex-col p-2.5 gap-4 bg-grey-50 rounded-[6px]'
                >
                  <span className='mid-5 text-green-700'>수업-{index + 1}</span>

                  <div className='flex gap-1 items-center'>
                    <p className='title-6 text-green-600'>
                      {lesson.lesson.sportsName ?? lesson.lesson.lessonName}
                    </p>
                    <p className='title-6 text-grey-600'>
                      {lesson.lesson.lessonName}
                    </p>
                    <span className='mid-4 text-grey-600'>
                      {formatWeekdaysKo([lesson.lessonSchedule.scheduleDay])}{' '}
                      {lesson.lessonSchedule.startTime} ~{' '}
                      {lesson.lessonSchedule.endTime}
                    </span>
                  </div>

                  {/* status 바인딩 */}
                  <Controller
                    control={control}
                    name={`items.${index}.status`}
                    rules={{ required: '출결을 선택해주세요.' }}
                    render={({ field }) => (
                      <Dropdown
                        label='출결 선택'
                        items={ATTENDANCE_STATUS.map(s => s.label)}
                        selectedItem={labelFromValue(field.value)}
                        onSelect={label =>
                          field.onChange(valueFromLabel(label))
                        }
                      />
                    )}
                  />
                  {errors.items?.[index]?.status && (
                    <span className='text-red-500 text-sm'>
                      {errors.items[index]?.status?.message as string}
                    </span>
                  )}
                </div>
              );
            })}
          </form>
        ) : (
          <p className='title-5 text-grey-600 text-center my-20'>
            다음 날 수강하는 수업이 없습니다.
          </p>
        )}
      </div>

      <div className='button-shadow-container w-full lg:max-w-lg lg:mx-auto'>
        <Button
          title={isPending ? '전송 중...' : '출결 여부 전송'}
          variant='primary'
          size='lg'
          onPress={handleSubmit(onSubmit)}
          disabled={isPending || !lessons.length}
        />
      </div>
    </div>
  );
};
