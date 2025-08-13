import { Dropdown } from '@/shared/ui';
import { useState } from 'react';

export const LoginPage = () => {
  const [value, setValue] = useState('');
  return (
    <div>
      <div className='mr-200 mt-10 ml-10'>
        <Dropdown
          items={['A', 'B', 'C']}
          selectedItem={value}
          placeholder='선택'
          onSelect={v => setValue(v)}
          hasError={false}
          errorMessage='필수 선택입니다.'
          description='선택해주세요.'
        />
      </div>
    </div>
  );
};
