import { z } from 'zod';
import { styledConsole } from '@/shared/api/lib/logger';
import { backendErrorSchema } from '@/shared/api/model';

interface IParseDataProps<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  schema: z.ZodSchema;
}

type TParsedQueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess?: boolean;
};

export const parseData = <T>({
  data,
  isLoading,
  isError,
  isSuccess,
  schema,
}: IParseDataProps<T>): TParsedQueryResult<T> => {
  // 로딩 상태이거나 에러일 때 데이터를 빈 배열로 반환
  if (isLoading || isError) {
    return { data: undefined, isLoading, isError };
  }
  const error = backendErrorSchema.safeParse(data);
  if (error.success) {
    return { data: undefined, isLoading, isError: true };
  }

  // api 요청 성공했고 데이터가 있을 떄만 zod 파싱
  if (isSuccess && data) {
    const parsedData = schema.safeParse(data);
    // 파싱 에러 발생 시 콘솔 출력 후 빈 배열로 반환
    if (!parsedData.success) {
      styledConsole({
        topic: 'ZOD',
        title: '데이터 파싱 에러',
        data: parsedData.error,
        topicColor: 'red',
        method: 'error',
      });
      return { data: undefined, isLoading, isError: true };
    }

    // 파싱 성공 시 데이터 반환
    return {
      data: parsedData.data as T,
      isLoading,
      isError,
      isSuccess,
    };
  }
  // 기본 값 반환
  return { data: undefined, isLoading, isError };
};
