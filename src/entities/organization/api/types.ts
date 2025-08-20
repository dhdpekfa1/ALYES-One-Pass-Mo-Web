import z from 'zod';
import { apiResponseSchema } from '@/shared/api/model';

/** organization 기본 조직 타입 */
export const organizationSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number(),
  name: z.string(),
  representClassName: z.string(),
  address: z.string(),
  addressDetail: z.string(),
  phone: z.string(),
});
export type TOrganization = z.infer<typeof organizationSchema>;

/** 조직 상세 api 응답 스키마 / 타입 */
export const getOrganizationResponseSchema = apiResponseSchema.extend({
  result: z.array(organizationSchema),
});
export type TGetOrganizationResponse = z.infer<
  typeof getOrganizationResponseSchema
>;
