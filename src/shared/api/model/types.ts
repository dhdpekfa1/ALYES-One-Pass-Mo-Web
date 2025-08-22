import z from 'zod';

/**
 * 서버 API의 공통 응답 형식입니다.
 * - 모든 API 응답은 해당 구조를 따르며, 응답 데이터는 'result' 필드에 포함됩니다.
 */
export type TApiResponse<T> = {
  responseName: string;
  responseCode: number;
  message: string | null;
  result: T;
};

export const backendErrorSchema = z.object({
  responseName: z.string().nullable(),
  responseCode: z.number().refine(code => code < 200 || code >= 300),
  message: z.string().nullable(),
  result: z.null(),
});

/**
 * 서버 API의 공통 응답 타입을 zod 타입으로 정의합니다.
 */
export const apiResponseSchema = z.object({
  responseName: z.string(),
  responseCode: z.number(),
  message: z.string().nullable(),
});

/** 기본 정렬 타입 */
export const sortSchema = z.object({
  empty: z.boolean(),
  sorted: z.boolean(),
  unsorted: z.boolean(),
});
export type TSortList = z.infer<typeof sortSchema>;

/**
 * 페이지네이션 응답 타입
 * - content에 응답 데이터 배열이 포함됩니다.
 * TODO: 페이지네이션 구현하는데 필요 없는 데이터가 계속 응답으로 온다면 수정 요청 필요
 */
export const paginatedItemSchema = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    content: z.array(schema),
    pageable: z.object({
      offset: z.number(),
      pageNumber: z.number(),
      pageSize: z.number(),
      paged: z.boolean(),
      unpaged: z.boolean(),
      sort: sortSchema,
    }),
    totalPages: z.number(),
    totalElements: z.number(),
    last: z.boolean(),
    size: z.number(),
    number: z.number(),
    sort: sortSchema,
    numberOfElements: z.number(),
    first: z.boolean(),
    empty: z.boolean(),
  });

export type TPaginated<T> = z.infer<
  ReturnType<typeof paginatedItemSchema<T>>
>[];

/**
 * infiniteQuery에서 페이지네이션 요청 타입
 * - 페이지 크기와 정렬 방향을 포함합니다.
 * (page는 getNextPageParams 훅 내에서 구해서 요청 보내기 때문에 생략)
 */
export const infinitePaginationRequestSchema = z.object({
  size: z.number(),
  direction: z.string(),
});

export type TInfinitePaginationRequest = z.infer<
  typeof infinitePaginationRequestSchema
>;

/**
 * 기본 페이지네이션 요청 타입
 * - 페이지 번호, 페이지 크기, 정렬 방향을 포함합니다.
 */
export const paginationRequestSchema = infinitePaginationRequestSchema.extend({
  page: z.number(),
});

export type TPaginationRequest = z.infer<typeof paginationRequestSchema>;

/**
 * 쿼리 키 타입
 * - 쿼리 키는 문자열과 선택적 파라미터 객체의 배열로 구성됩니다.
 */
export type TQueryKey = [string, object | undefined];

/**
 * 무한 쿼리 스키마 / 타입
 * - 페이지네이션 응답 타입을 배열로 반환합니다.
 */
export const TInfiniteQuerySchema = <T>(schema: z.ZodSchema<T>) =>
  z.array(paginatedItemSchema(schema));

export type TInfiniteQuery<T> = z.infer<
  ReturnType<typeof TInfiniteQuerySchema<T>>
>;

export const booleanResponseSchema = apiResponseSchema.extend({
  result: z.array(z.boolean()),
});
export type TBooleanResponse = z.infer<typeof booleanResponseSchema>;

/** 삭제 api 응답 스키마 / 타입 */
export const deleteResponseSchema = apiResponseSchema.extend({
  result: z.array(z.boolean()),
});
export type TDeleteResponse = z.infer<typeof deleteResponseSchema>;
