import { Button, LabelInput } from '@/shared/ui';
import { useNavigate } from 'react-router';
import { useGetStudentFind } from '@/entities/student/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginForValues, loginSchema } from '@/entities/student/model';
import { useToast } from '@/shared/model/hooks';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForValues>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useGetStudentFind();

  const onSubmit = (data: LoginForValues) => {
    mutate(
      {
        name: data.name.trim(),
        phone: data.phone.trim(),
      },
      {
        onSuccess: data => {
          if (
            !data ||
            !data.result ||
            !data.result ||
            data.result.length === 0
          ) {
            toast({
              variant: 'destructive',
              title: '인증 실패',
              description: '일치하는 학생 정보를 찾을 수 없습니다.',
            });
            return;
          }

          toast({
            title: '인증 성공',
            description: '학생 정보를 확인했습니다.',
          });
          navigate('/verification', {
            state: { studentId: data.result[0].id },
          });
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '인증 실패',
            description: '일치하는 학생 정보를 찾을 수 없습니다.',
          });
          setError('root', {
            type: 'manual',
            message:
              '일치하는 학생 정보를 찾을 수 없습니다. 다시 확인해주세요.',
          });
        },
      },
    );
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='mt-4 flex flex-col gap-4 p-4'
        >
          <div className='flex flex-col gap-1'>
            <LabelInput
              label='회원 이름'
              placeholder='회원 이름을 입력해주세요.'
              size='md'
              {...register('name')}
            />
            {errors.name && (
              <span className='text-red-500 text-sm'>
                {errors.name.message}
              </span>
            )}
          </div>

          <div className='flex flex-col gap-1'>
            <LabelInput
              label='학부모 전화 번호'
              placeholder='학부모 전화 번호를 입력해주세요.'
              size='md'
              {...register('phone')}
            />
            {errors.phone && (
              <span className='text-red-500 text-sm'>
                {errors.phone.message}
              </span>
            )}
          </div>

          {errors.root && (
            <div className='text-red-500 text-sm text-center'>
              {errors.root.message}
            </div>
          )}
        </form>
      </div>

      <div className='button-shadow-container w-full lg:max-w-lg lg:mx-auto'>
        <Button
          title={isPending ? '확인 중...' : '확인'}
          variant='primary'
          onPress={handleSubmit(onSubmit)}
          size='lg'
          disabled={isPending}
        />
      </div>
    </div>
  );
};
