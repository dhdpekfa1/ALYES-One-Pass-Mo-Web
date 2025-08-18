import { useState } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router';
import { Button, Dropdown } from '@/shared/ui';
import {
  useGetLessonSearch,
  type TGetLessonTeacherResponse,
} from '@/entities/student/api';

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
];

export const VerificationPage = () => {
  const location = useLocation();
  const { studentId } = location.state;

  const today = dayjs().format('YYYY-MM-DD');
  const { data } = useGetLessonSearch(studentId, today);
  // const { mutate: postShuttleAttendance } = usePostShuttleAttendance();

  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const onPressButton = () => {
    console.log('TODO: 이벤트 구현');
    // 출석 확인 완료 시 다음 페이지(confirmation) 접근 가능
    sessionStorage.setItem('currentStep', '2');
    navigate('/confirmation');
  };

  const lessons = (data?.result ?? []) as TGetLessonTeacherResponse['result'];

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
            반갑습니다, [{lessons[0].student.name}] 학부모님!
          </p>
          <div>
            <p className='mid-5 text-grey-600'>
              [{lessons[0].student.name}] 회원의 출석 여부를 알려주세요.
            </p>
            <p className='mid-5 text-grey-600'>
              보내주신 정보는 수업 준비에 큰 도움이 됩니다.
            </p>
          </div>
        </div>

        <div className='flex flex-col p-4'>
          {/* map */}
          {lessons?.map((data, index) => (
            <div className='flex flex-col p-2.5 gap-4 bg-grey-50 rounded-[6px]'>
              <span className='mid-5 text-green-700'>수업-{index + 1}</span>
              <div className='flex gap-1 items-center'>
                <p className='title-6 text-green-600'>
                  {data.lesson.sportsName}
                </p>
                <p className='title-6 text-grey-600'>
                  {data.lesson.lessonName}
                </p>
                <span className='mid-4 text-grey-600'>월 10:00~12:00</span>
              </div>
              <Dropdown
                label='출결 선택'
                items={ATTENDANCE_STATUS.map(status => status.label)}
                selectedItem={value}
                onSelect={setValue}
              />
            </div>
          ))}
        </div>
      </div>

      <div className='button-shadow-container w-full lg:max-w-lg lg:mx-auto'>
        <Button
          title='출결 여부 전송'
          variant='primary'
          onPress={onPressButton}
          size='lg'
        />
      </div>
    </div>
  );
};
