import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Button, Dropdown } from '@/shared/ui';
import { formatWeekdaysKo } from '@/shared/lib';
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

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const { data } = useGetLessonSearch(studentId, today);
  const lessons = useMemo(() => data?.result ?? [], [data?.result]);
  const { defaults, submit, isPending } = useAttendance(
    studentId,
    today,
    lessons,
  );

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

  const lastResetLessonsRef = useRef<string>('');

  useEffect(() => {
    if (lessons.length > 0) {
      const lessonsJSON = JSON.stringify(lessons);
      if (lastResetLessonsRef.current !== lessonsJSON) {
        reset({ items: defaults });
        lastResetLessonsRef.current = lessonsJSON;
      }
    }
  }, [lessons, defaults, reset]);

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

  console.log(Date.now() + 60 * 1000);

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
          disabled={isPending || !lessons.length}
        />
      </div>
    </div>
  );
};
