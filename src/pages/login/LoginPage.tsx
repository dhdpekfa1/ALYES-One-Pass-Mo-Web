import { Button, LabelInput } from '@/shared/ui';
import { useNavigate } from 'react-router';

export const LoginPage = () => {
  const navigate = useNavigate();

  const onPressButton = () => {
    console.log('TODO: 이벤트 구현');
    navigate('/verification');
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
            [학원명] 수업 출석 사전 확인 페이지입니다.
          </p>
          <p className='mid-5 text-grey-600'>
            회원 이름과 학부모 전화번호를 입력해 학원 회원 인증을 진행해주세요.
          </p>
        </div>

        <div className='mt-4 flex flex-col gap-4  p-4'>
          <LabelInput
            label='회원 이름'
            placeholder='회원 이름을 입력해주세요.'
            size='md'
          />
          <LabelInput
            label='학부모 전화 번호'
            placeholder='학부모 전화 번호를 입력해주세요.'
            size='md'
          />
        </div>
      </div>

      <div className='button-shadow-container w-full lg:max-w-lg lg:mx-auto'>
        <Button
          title='확인'
          variant='primary'
          onPress={onPressButton}
          size='lg'
        />
      </div>
    </div>
  );
};
