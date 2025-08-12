export const NotFoundPage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-300 mb-4'>404</h1>
        <p className='text-xl text-gray-600 mb-8'>페이지를 찾을 수 없습니다</p>
        <a
          href='/'
          className='inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
};
