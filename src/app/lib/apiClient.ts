import axios, { AxiosError } from 'axios';
import { apiLogger, styledConsole } from '@/shared/api/lib';

const isDev = process.env.NODE_ENV === 'development';
const API_URL = isDev ? '' : import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터 (Request Interceptor)
 * - 요청이 전송되기 전에 실행됩니다.
 * - 인증 토큰 추가와 같은 요청 전 처리 로직을 이곳에 작성합니다.
 * - 현재는 개발 환경에서 API 요청 정보를 로깅하는 기능을 포함합니다.
 * - 추후 구현시 이쪽에서 작성합니다.
 */
apiClient.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    Promise.reject(error);
  },
);

/**
 * 응답 인터셉터 (Response Interceptor)
 * - 서버로부터 응답이 도착한 후 실행됩니다.
 * - 응답 데이터를 전처리하거나 로깅하는 데 사용됩니다.
 */
apiClient.interceptors.response.use(
  res => {
    const { status, config: reqData, data: resData } = res;
    if (isDev) {
      apiLogger({ status, reqData, resData });
    }
    return res;
  },
  async (error: AxiosError) => {
    try {
      const { response: res, config: reqData } = error || {};

      if (!res?.status) {
        throw new Error('response status is not exist');
      }

      const { status } = res;

      if (status === 401) {
        styledConsole({
          topic: 'AUTH',
          title: '401 Unauthorized - 인증 실패',
          data: res.data,
          topicColor: 'yellow',
          method: 'warn',
        });
        // 예: 토큰 만료 시 로그아웃 처리 등
      }

      if (status === 404) {
        styledConsole({
          topic: 'AUTH',
          title: '404 Not Found - 인증 실패',
          data: res.data,
          topicColor: 'yellow',
          method: 'warn',
        });
        // 예: 토큰 만료 시 로그아웃 처리 등
      }

      if (status === 444) {
        styledConsole({
          topic: 'TOKEN',
          title: '444 Invalid Token - 토큰 문제',
          data: res.data,
          topicColor: 'red',
          method: 'error',
        });
        // 예: 토큰 재발급 로직 등
      }

      if (status === 500) {
        styledConsole({
          topic: 'SERVER',
          title: '500 Internal Server Error',
          data: res.data,
          topicColor: 'red',
          method: 'error',
        });
        // 예: 사용자에게 오류 모달 또는 재시도 안내
      }

      if (isDev) {
        apiLogger({ status, reqData, resData: error, method: 'error' });
      }

      return Promise.reject(error);
    } catch (e) {
      styledConsole({
        method: 'error',
        topic: 'UN_HANDLED',
        title: 'axios-interceptor',
        data: e,
      });

      return Promise.reject(error || e);
    }
  },
);

export default apiClient;
