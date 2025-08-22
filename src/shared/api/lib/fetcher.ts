import { type AxiosRequestConfig } from 'axios';
import { getFinalConfig, apiClient } from '.';

/**
 * GET 요청 함수
 * @param url 요청할 URL
 * @param config Axios 설정 (옵션)
 * @returns result 데이터
 */
export const getApi = async <T>(
  url: string,
  config?: object & { params?: object },
): Promise<T> => {
  const finalConfig =
    config && 'params' in config ? config : { params: config };
  const res = await apiClient.get<T>(url, finalConfig);
  return res.data;
};

/**
 * POST 요청 함수
 * @param url 요청할 URL
 * @param data 서버에 전송할 데이터
 * @param config Axios 설정 (옵션)
 * @returns result 데이터
 */
export const postApi = async <T, D = unknown>(
  url: string,
  data: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const finalConfig = getFinalConfig(data, config);
  const res = await apiClient.post<T>(url, data, finalConfig);
  return res.data;
};

/**
 * PUT 요청 함수
 * @param url 요청할 URL
 * @param data 서버에 전송할 데이터
 * @param config Axios 설정 (옵션)
 * @returns result 데이터
 */
export const putApi = async <T, D = unknown>(
  url: string,
  data: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const finalConfig = getFinalConfig(data, config);
  const res = await apiClient.put<T>(url, data, finalConfig);
  return res.data;
};

/**
 * DELETE 요청 함수
 * @param url 요청할 URL
 * @param config Axios 설정 (옵션)
 * @returns result 데이터
 */
export const deleteApi = async <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
};
