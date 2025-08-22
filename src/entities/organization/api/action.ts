import { parseData, useFetch } from '@/shared/api/lib';
import {
  getOrganizationResponseSchema,
  type TGetOrganizationResponse,
} from './types';

/** 조직 상세 조회  */
export const useGetOrganization = (id?: string) => {
  const { data, isLoading, isError, isSuccess, ...rest } =
    useFetch<TGetOrganizationResponse>(
      `/api/organization/${id}`,
      {},
      { enabled: !!id },
    );
  const parsedData = parseData<TGetOrganizationResponse>({
    data,
    isLoading,
    isError,
    isSuccess,
    schema: getOrganizationResponseSchema,
  });
  return {
    ...parsedData,
    ...rest,
  };
};
