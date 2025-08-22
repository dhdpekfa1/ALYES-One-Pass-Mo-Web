import { Navigate, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrgId, useToast } from '@/shared/model/hooks';
import { formatPhoneNumber, removeHyphens } from '@/shared/lib';
import { Button, LabelInput } from '@/shared/ui';
import { useGetStudentFind } from '@/entities/student/api';
import { type LoginFormValues, loginSchema } from '@/entities/student/model';
import { useGetOrganization } from '@/entities/organization/api/action';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const orgId = useOrgId();

  const {
    data: orgData,
    isLoading: isOrgLoading,
    isError: isOrgError,
  } = useGetOrganization(orgId ?? undefined);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: '', phone: '' },
  });

  const { mutate, isPending } = useGetStudentFind();

  const onSubmit = (formData: LoginFormValues) => {
    mutate(
      {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      },
      {
        onSuccess: res => {
          if (!res || !res.result || res.result.length === 0) {
            toast({
              variant: 'destructive',
              title: '해당 정보로 등록된 회원이 없습니다.',
              description: '회원 이름과 학부모 전화번호를 다시 입력해주세요.',
            });
            return;
          }

          // 인증 성공 시 다음 페이지(verification) 접근 가능
          sessionStorage.setItem('currentStep', '1');
          sessionStorage.setItem(
            'loginExpiresAt',
            String(Date.now() + 30 * 60 * 1000),
          );

          toast({
            title: '인증 성공',
            description: '학생 정보를 확인했습니다.',
          });
          navigate('/verification', {
            state: {
              studentId: res.result[0].id,
              studentName: res.result[0].name,
            },
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

  // orgId 확인 및 로딩/에러 처리
  if (!orgId) {
    return <Navigate to='/404' replace />;
  }
  if (isOrgLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900' />
      </div>
    );
  }
  if (isOrgError || !orgData?.result) {
    return <Navigate to='/404' replace />;
  }

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
            [{orgData.result[0].name}] 수업 출석 사전 확인 페이지입니다.
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
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <LabelInput
                  label='회원 이름'
                  placeholder='회원 이름을 입력해주세요.'
                  size='md'
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputMode='text'
                  hasError={!!errors.name}
                  errorMessage={errors.name?.message}
                />
              )}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Controller
              name='phone'
              control={control}
              rules={{
                required: '전화번호를 입력해주세요.',
                validate: v =>
                  v.length === 10 || v.length === 11 || '10~11자리 숫자만 입력',
              }}
              render={({ field }) => (
                <LabelInput
                  label='학부모 전화 번호'
                  placeholder='학부모 전화 번호를 입력해주세요.'
                  size='md'
                  value={formatPhoneNumber(field.value)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const raw = e.target.value;
                    field.onChange(removeHyphens(raw));
                  }}
                  onBlur={field.onBlur}
                  inputMode='numeric'
                  autoComplete='tel'
                  maxLength={13}
                  hasError={!!errors.phone}
                  errorMessage={errors.phone?.message}
                />
              )}
            />
          </div>
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
