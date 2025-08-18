import z from 'zod';
import { NAME_REGEX, PHONE_REGEX } from './';
import { shuttleAttendanceStatusEnumSchema } from '@/shared/api/model';

export const nameField = z
  .string({
    error: '정확한 이름을 입력해주세요.',
  })
  .min(2, '정확한 이름을 입력해주세요.')
  .regex(NAME_REGEX, '정확한 이름을 입력해주세요.');

export const phoneField = z
  .string({ error: '정확한 휴대전화번호를 입력해주세요.' })
  .nonempty('정확한 휴대전화번호를 입력해주세요.')
  .transform(val => val.replace(/-/g, ''))
  .pipe(
    z
      .string()
      .min(10, '정확한 휴대전화번호를 입력해주세요.')
      .max(11, '정확한 휴대전화번호를 입력해주세요.')
      .regex(PHONE_REGEX, '정확한 휴대전화번호를 입력해주세요.'),
  );

export const loginSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해주세요.')
    .regex(/^[0-9-]+$/, '올바른 전화번호 형식을 입력해주세요.'),
});
export type LoginForValues = z.infer<typeof loginSchema>;

export const shuttleAttendanceSchema = z.array(
  z.object({
    id: z.number().nullable(),
    type: shuttleAttendanceStatusEnumSchema,
  }),
);
