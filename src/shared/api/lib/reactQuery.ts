import {
  useInfiniteQuery,
  useMutation,
  usePrefetchQuery,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type {
  GetNextPageParamFunction,
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';
import { deleteApi, getApi, postApi, putApi } from './fetcher';
import type { TApiResponse, TQueryKey } from '../model';

/**
 * 기본 fetcher 함수
 * 쿼리 키와 params를 분리해 데이터를 가져오는 함수
 */
export const fetcher = async <T>(
  queryKey: TQueryKey,
): Promise<TApiResponse<T>> => {
  const [url, params] = queryKey;
  return getApi<TApiResponse<T>>(url, params);
};

/**
 * 데이터를 가져오고 싶을 때 사용 (기본 useQuery)
 * @param url
 * @param params
 * @param config
 * @returns
 */
export const useFetch = <T>(
  url: string | null,
  params?: object,
  config?: Omit<
    UseQueryOptions<TApiResponse<T>, Error, T, TQueryKey>,
    'queryKey'
  > & { queryKey?: TQueryKey },
) => {
  const queryKey: TQueryKey = config?.queryKey ?? [url!, params];
  const enabled = config?.enabled ?? !!url;

  return useQuery<TApiResponse<T>, Error, T, TQueryKey>({
    queryKey,
    queryFn: () => fetcher<T>(queryKey),
    enabled,
    ...config,
  });
};

/**
 * 데이터를 미리 가져오고 싶을 때 사용하지만 return 값은 없음 (useSuspenseQuery 사용 시 사용)
 * 보통 사용자 경험을 위해 prefetch 할 때 사용
 * @param url
 * @param params
 * @param config
 * @returns
 */
export const usePrefetch = <T>(url: string | null, params?: object) => {
  const queryKey: TQueryKey = [url!, params];
  return usePrefetchQuery<TApiResponse<T>, Error, TApiResponse<T>, TQueryKey>({
    queryKey,
    queryFn: () => fetcher<T>(queryKey),
  });
};

/**
 * 데이터를 미리 가져오고 싶을 때 사용 (useSuspenseQuery)
 * UI 렌더링 일시 중단 및 로딩/에러 처리
 * @param url
 * @param params
 * @param config
 * @returns
 */
export const useSuspenseFetch = <T>(
  url: string | null,
  params?: object,
  config?: UseSuspenseQueryOptions<TApiResponse<T>, Error, T, TQueryKey>,
) => {
  const queryKey: TQueryKey = [url!, params];
  return useSuspenseQuery<TApiResponse<T>, Error, T, TQueryKey>({
    queryKey,
    queryFn: () => fetcher<T>(queryKey),
    ...config,
  });
};

/**
 * 여러 요청을 한번에 보내고 결과를 배열로 반환
 * @param requests
 * @param config
 * @returns
 */
export const useFetchAll = <T>(
  requests: { url: string; params?: object }[],
  config?: UseQueryOptions<
    TApiResponse<T>[],
    Error,
    TApiResponse<T>[],
    TQueryKey[]
  >,
) => {
  const queries = requests.map(({ url, params }) => ({
    queryKey: [url, params] as TQueryKey,
    queryFn: () => fetcher<TApiResponse<T>>([url, params]),
  }));
  const results = useQueries({
    queries,
    ...config,
  });
  return results.map(result => result.data);
};

/**
 * 데이터를 더 불러오고 싶을 때 사용 (페이지네이션이나 무한 스크롤 등)
 */
export const useLoadMore = <TPage, TParams extends object>(
  url: string,
  params: TParams | undefined,
  config: Omit<
    UseInfiniteQueryOptions<TPage, Error, InfiniteData<TPage, unknown>>,
    'queryKey' | 'queryFn'
  > & {
    initialPageParam: number;
    getNextPageParam: GetNextPageParamFunction<number, TPage>;
  },
) => {
  const queryKey: TQueryKey = [url, params];

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      fetcher([
        url,
        {
          params: {
            ...params,
            page: pageParam,
          },
        },
      ]) as TPage,
    ...config,
  });
};

/**
 * 데이터 변화를 위한 mutation 함수
 */
const useGenericMutation = <T, D>(
  func: (data: D) => Promise<TApiResponse<T>>,
  url: string,
  params?: object,
  updater?: ((oldData: T, newData: D) => T) | undefined,
) => {
  const queryClient = useQueryClient();
  const queryKey = [url, params];
  return useMutation<TApiResponse<T>, Error, D>({
    mutationFn: func,
    onMutate: async (data: D) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>([url, params]);
      queryClient.setQueryData<T>([url, params], oldData =>
        updater ? updater(oldData!, data) : (data as unknown as T),
      );

      return previousData;
    },
    onError: (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(queryKey, context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

/**
 * 데이터 생성을 위한 mutation 함수
 */
export const usePost = <T, D>(
  url: string,
  params?: object,
  updater?: (oldData: T, newData: D) => T,
  headers?: object,
) => {
  return useGenericMutation<T, D>(
    data => postApi<TApiResponse<T>, D>(url, data, headers),
    url,
    params,
    updater,
  );
};

/**
 * 데이터 삭제를 위한 mutation 함수
 */
export const useDelete = <T>(
  url: string,
  params?: object,
  headers?: object,
) => {
  const queryClient = useQueryClient();
  return useMutation<TApiResponse<T>, Error, string | number>({
    mutationFn: id => deleteApi(`${url}/${id}`, { ...headers, params }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [url, params] });
    },
  });
};

/**
 * 데이터 수정을 위한 mutation 함수
 */
export const usePut = <T, D>(
  url: string,
  params?: object,
  updater?: (oldData: T, newData: D) => T,
  headers?: object,
) => {
  return useGenericMutation<T, D>(
    data => putApi<TApiResponse<T>, D>(url, data, headers),
    url,
    params,
    updater,
  );
};

/**
 * 특정 동작(예: 버튼 클릭 등) 이후 GET 요청을 보내기 위한 mutation 함수
 */
export const useGetMutation = <T, D extends object>(
  url: string,
  options?: UseMutationOptions<TApiResponse<T>, Error, D>,
) => {
  return useMutation<TApiResponse<T>, Error, D>({
    mutationFn: (params: D) => {
      return getApi<TApiResponse<T>>(url, params);
    },
    retry: false,
    ...options,
  });
};

/**
 * 여러 쿼리를 한번에 무효화
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  return (queryKeys: [string, object | undefined][]) =>
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
};
