import { Button } from '@/shared/ui';
import { useNavigate } from 'react-router';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const storedOrgId = sessionStorage.getItem('orgId');

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-300 mb-4'>404</h1>
        <p className='text-xl text-gray-600 mb-8'>페이지를 찾을 수 없습니다</p>
        {storedOrgId && (
          <Button
            title='홈으로 돌아가기'
            variant='primary'
            size='lg'
            onPress={() => navigate(`/?orgId=${storedOrgId}`)}
          />
        )}
      </div>
    </div>
  );
};
