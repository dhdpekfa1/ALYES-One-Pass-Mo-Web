import type { AxiosRequestConfig } from 'axios';

/**
 * Axios 요청 시 전달하는 데이터에 따라 헤더의 Content-Type을 자동으로 설정하거나 제거하는 유틸 함수
 * - FormData일 경우 Content-Type 제거 → Axios가 자동 설정
 * - 일반 객체면 JSON 전송이므로 명시적으로 Content-Type 설정
 *
 * @param data - 서버로 보낼 데이터 (FormData 또는 일반 객체)
 * @param config - Axios 요청 설정 객체 (headers 포함 가능)
 * @returns AxiosRequestConfig - 최종 설정된 config 객체
 */
export const getFinalConfig = <D>(
  data: D,
  config?: AxiosRequestConfig,
): AxiosRequestConfig => {
  const isFormData =
    typeof FormData !== 'undefined' && data instanceof FormData;

  const headers = {
    ...(config?.headers || {}),
  };

  // FormData일 경우 Content-Type 제거 (자동 처리됨)
  if (isFormData) {
    delete headers['Content-Type'];
  }

  // 데이터가 존재할 때만 application/json 명시
  if (!isFormData && data !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // 데이터도 없고 FormData도 아닐 경우 Content-Type 제거 (헤더 전송 ex: refreshToken)
  if (!isFormData && data === undefined) {
    delete headers['Content-Type'];
  }

  return {
    ...config,
    headers,
  };
};
