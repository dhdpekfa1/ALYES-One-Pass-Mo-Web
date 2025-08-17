import type { TGetStudentFind } from '.';
import { parseData, useGetMutation } from '@/shared/api/lib';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { TApiResponse } from '@/shared/api/model';
import { z } from 'zod';

/** 사용자 인증 - mutation 방식 */
export const useGetStudentFind = (
  options?: UseMutationOptions<
    TApiResponse<TGetStudentFind>,
    Error,
    { name: string; phone: string }
  >,
) => {
  return useGetAuthMutation<TGetStudentFind, { name: string; phone: string }>(
    `/api/student/find/name-and-phone`,
    {} as z.ZodSchema<TGetStudentFind>, // 실제 스키마가 있다면 그것을 사용하세요
    options,
  );
};

export const useGetAuthMutation = <TParsed, TRequest extends object>(
  url: string,
  schema: z.ZodSchema<TParsed>,
  options?: UseMutationOptions<TApiResponse<TParsed>, Error, TRequest>,
) => {
  const { mutate, data, isPending, isError, isSuccess, ...rest } =
    useGetMutation<TParsed, TRequest>(url, {
      retry: false,
      ...options,
    });

  const parsedData = parseData<TParsed>({
    data: data?.result,
    isLoading: isPending,
    isError,
    isSuccess,
    schema,
  });

  return {
    mutate,
    ...parsedData,
    isPending,
    isError,
    isSuccess,
    ...rest,
  };
};
