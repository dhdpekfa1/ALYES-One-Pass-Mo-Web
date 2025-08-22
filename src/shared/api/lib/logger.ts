import { type AxiosRequestConfig } from 'axios';

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error';
type TopicColor = 'blue' | 'green' | 'yellow' | 'red';

type StyledConsoleArgs = {
  topic?: string;
  title?: string;
  data: unknown;
  topicColor?: TopicColor;
  method?: ConsoleMethod;
  errors?: unknown;
};

interface ApiLoggerArgs extends Pick<StyledConsoleArgs, 'method'> {
  status: string | number;
  reqData?: AxiosRequestConfig;
  resData: unknown;
}

/**
 * 스타일이 적용된 콘솔 로그를 출력합니다.
 */
export function styledConsole({
  topic,
  title,
  data,
  topicColor = 'blue',
  method = 'log',
  errors,
}: StyledConsoleArgs): void {
  const colors = {
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  };

  console[method](
    `%c${topic ?? 'LOG'}%c ${title ?? ''}`,
    `background: ${colors[topicColor]}; color: white; padding: 2px 6px; border-radius: 4px;`,
    'color: inherit; margin-left: 6px;',
    data ?? '',
    errors ? `\n${errors}` : '',
  );
}

/**
 * API 요청/응답 로그를 출력합니다.
 */
export const apiLogger = (params: ApiLoggerArgs): void => {
  const { status, reqData, resData, method = 'log' } = params;

  // 로그 출력 제외(회원가입 시 이메일 인증 확인 요청에서 404는 정상 흐름)
  const isExcluded404 =
    typeof status === 'number' &&
    status === 404 &&
    reqData?.url?.includes('/auth/mail/validation');
  if (isExcluded404) {
    return;
  }

  const isError = typeof status === 'number' && status >= 400;
  const topicColor = isError ? 'red' : 'green';

  styledConsole({
    topic: 'API',
    title: `${reqData?.method?.toUpperCase() ?? 'REQ'} ${status}`,
    data: {
      request: {
        url: reqData?.url,
        params: reqData?.params,
        data: reqData?.data,
      },
      response: resData,
    },
    topicColor,
    method,
    errors: isError ? resData : undefined,
  });
};
