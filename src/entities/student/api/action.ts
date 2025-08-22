import {
  type TGetLessonTeacherResponse,
  type TGetStudentFindResponse,
  type TPostShuttleAttendanceRequest,
  type TPostShuttleAttendanceResponse,
  getLessonTeacherResponseSchema,
  getStudentFindResponse,
} from '.';
import { parseData, useFetch, useGetMutation, usePost } from '@/shared/api/lib';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { TApiResponse } from '@/shared/api/model';
import { z } from 'zod';

/** 사용자 인증 */
export const useGetStudentFind = () =>
  useGetAuthMutation<
    TGetStudentFindResponse['result'],
    { name: string; phone: string }
  >('/api/student/find/name-and-phone', getStudentFindResponse.shape.result);

/** 수강 수업 조회 */
export const useGetLessonSearch = (studentId: number, time: string) => {
  const { data, isLoading, isError, isSuccess, ...rest } =
    useFetch<TGetLessonTeacherResponse>(
      `/api/lesson-student/lesson-search-plus-one-day/${studentId}`,
      { params: { studentId, time } },
      {
        staleTime: 0,
        refetchOnMount: 'always',
      },
    );
  const parsedData = parseData<TGetLessonTeacherResponse>({
    data,
    isLoading,
    isError,
    isSuccess,
    schema: getLessonTeacherResponseSchema,
  });
  return {
    ...parsedData,
    ...rest,
  };
};

/** 출석 사전 확인 등록/수정 */
export const usePostShuttleAttendance = () => {
  return usePost<TPostShuttleAttendanceResponse, TPostShuttleAttendanceRequest>(
    '/api/shuttle-attendance/pre/save',
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
