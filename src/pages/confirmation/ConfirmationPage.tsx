import { Button } from '@/shared/ui';

import { useNavigate } from 'react-router';
import { CircleOkSvg } from '@/shared/assets/icons';

export const ConfirmationPage = () => {
  const navigate = useNavigate();

  const onPressButton = () => {
    console.log('TODO: 이벤트 구현');
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className='min-h-dvh w-full flex flex-col justify-between lg:justify-center'>
      <div className='max-lg:flex-1 w-full flex items-center justify-center p-4'>
        <div className='flex flex-col gap-6 items-center justify-center'>
          <div className='flex flex-col items-center'>
            <h1 className='italic text-green-500 text-4xl font-black'>
              ONE-pass
            </h1>
            <span className='mid-5 text-grey-600 xl:hidden'>
              출석 사전 확인
            </span>
          </div>
          <div className='flex w-[66px] h-[66px] items-center justify-center bg-green-300 rounded-full'>
            <CircleOkSvg width={50} height={50} className='text-green-500' />
          </div>
          <p className='title-6 text-grey-800'>
            전송이 정상적으로 완료되었습니다.
          </p>
          <div>
            <p className='mid-5 text-grey-600 text-center'>
              출석 여부 변경을 하고 싶은 경우에는
            </p>
            <p className='mid-5 text-grey-600 text-center'>
              출석 여부 응답 다시하기 버튼을 클릭해주세요.
            </p>
          </div>
        </div>
      </div>

      <div className='button-shadow-container w-full lg:max-w-lg lg:mx-auto'>
        <Button
          title='출석 여부 응답 다시 하기'
          variant='primary'
          onPress={onPressButton}
          size='lg'
        />
      </div>
    </div>
  );
};
