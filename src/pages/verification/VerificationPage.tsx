import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Button, Dropdown } from '@/shared/ui';
import {
  formatWeekdaysKo,
  formatEnumDay,
  filterLessonsByTodayAndTomorrow,
} from '@/shared/lib';
import { KOR_TO_EN_ATTENDANCE_STATUS_MAP as KOR_TO_STATUS } from '@/shared/model';
import { useGetLessonSearch } from '@/entities/student/api';
import { useAttendance } from '@/entities/student/model/hooks';
import {
  shuttleAttendanceFormSchema,
  type AttendanceFormValues,
} from '@/entities/student/model';

const ITEMS = Object.keys(KOR_TO_STATUS);
const STATUS_TO_KOR = Object.fromEntries(
  Object.entries(KOR_TO_STATUS).map(([kor, en]) => [en, kor]),
) as Record<string, string>;

export const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { studentId, studentName } = location.state as {
    studentId: number;
    studentName: string;
  };

  const today = dayjs().format('YYYY-MM-DD');
  const { data, isLoading } = useGetLessonSearch(studentId, today);
  const lessons = useMemo(() => data?.result ?? [], [data?.result]);

  // API에 전달한 날짜(today)를 기준으로 요일(enum)을 계산
  const baseDate = dayjs(today);
  const todayEnum = formatEnumDay(baseDate);
  const tomorrowEnum = formatEnumDay(baseDate.add(1, 'day'));
  // 시간 비교는 실제 현재 시간을 사용
  const nowHHmm = dayjs().format('HH:mm');

  // 내일은 전부 노출, 오늘은 startTime < 현재시간 제외
  const filteredLessons = useMemo(() => {
    return filterLessonsByTodayAndTomorrow(
      lessons,
      todayEnum,
      tomorrowEnum,
      nowHHmm,
    );
  }, [lessons, todayEnum, tomorrowEnum, nowHHmm]);
  const { defaults, submit, toRequest, isPending } = useAttendance(
    studentId,
    today,
    filteredLessons,
  );

  const [editEnabledMap, setEditEnabledMap] = useState<Record<number, boolean>>(
    {},
  );

  const renderEditButton = (
    index: number,
    onChange: (value: string) => void,
  ) => {
    const defaultStatus = defaults[index]?.status;
    if (!defaultStatus) return null;

    const isEditing = !!editEnabledMap[index];
    const handleToggleEdit = () => {
      setEditEnabledMap(prev => {
        const nextEnabled = !prev[index];
        // 수정 종료 시 값 원복
        if (!nextEnabled && defaultStatus) {
          onChange(defaultStatus);
        }
        return { ...prev, [index]: nextEnabled };
      });
    };

    return (
      <div>
        <Button
          title={isEditing ? '취소' : '수정'}
          variant='underline'
          size='sm'
          onPress={handleToggleEdit}
        />
      </div>
    );
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(shuttleAttendanceFormSchema),
    defaultValues: { items: [] },
  });

  const { fields } = useFieldArray({ control, name: 'items' });

  const lastResetLessonsRef = useRef<string>('');
  const [hasFormChanged, setHasFormChanged] = useState(false);

  useEffect(() => {
    if (filteredLessons.length > 0 && defaults.length > 0) {
      const lessonsJSON = JSON.stringify(filteredLessons);
      if (lastResetLessonsRef.current !== lessonsJSON) {
        reset({ items: defaults });
        lastResetLessonsRef.current = lessonsJSON;
      }
    }
  }, [filteredLessons, defaults, reset]);

  // 폼 값 변경 여부 계산 (변경 사항 없으면 전송 버튼 비활성화)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name || (name !== 'items' && !name.startsWith('items.'))) return;

      const items = (value.items ?? []).filter(
        item => item != null,
      ) as AttendanceFormValues['items'];
      if (!items || items.length === 0) {
        setHasFormChanged(false);
        return;
      }

      const { hasChanged } = toRequest(items);
      setHasFormChanged(hasChanged);
    });

    return () => subscription.unsubscribe();
  }, [watch, toRequest]);

  const onSubmit = (values: AttendanceFormValues) => {
    submit(values.items, {
      onSuccess: () => {
        sessionStorage.setItem('currentStep', '2');
        navigate('/confirmation');
      },
      onError: () => {
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

        {isLoading ? (
          <div className='flex justify-center items-center my-20'>
            <div className='w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : filteredLessons.length ? (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-4'>
            {fields.map((field, index) => {
              const lesson = filteredLessons[index];
              const hasInitialStatus = !!defaults[index]?.status;
              const isDisabled = hasInitialStatus && !editEnabledMap[index];
              return (
                <div
                  key={field.id}
                  className='flex flex-col p-2.5 gap-4 bg-grey-50 rounded-[6px] mb-4'
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
                        labelRightContent={
                          hasInitialStatus
                            ? renderEditButton(index, field.onChange)
                            : null
                        }
                        disabled={isDisabled}
                        items={ITEMS}
                        selectedItem={
                          field.value ? STATUS_TO_KOR[field.value] : ''
                        }
                        onSelect={label =>
                          field.onChange(
                            (KOR_TO_STATUS as Record<string, string>)[label],
                          )
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
          disabled={isPending || !filteredLessons.length || !hasFormChanged}
        />
      </div>
    </div>
  );
};
