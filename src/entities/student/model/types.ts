import z from 'zod';
import {
  shuttleAttendanceStatusEnumSchema,
  shuttleUsageEnumSchema,
} from '@/shared/api/model';
import { nameField, phoneField } from '@/shared/model';

/** 로그인 폼 */
export const loginSchema = z.object({
  name: nameField,
  phone: phoneField,
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/** 출석 확인 단일 항목 */
export const shuttleAttendanceItemSchema = z.object({
  id: z.number().optional(),
  type: shuttleUsageEnumSchema,
  studentId: z.number(),
  lessonId: z.number(),
  lessonStudentId: z.number(),
  lessonScheduleId: z.number(),
  lessonStudentDetailId: z.number(),
  time: z.string(),
  status: shuttleAttendanceStatusEnumSchema.optional(),
  boardingOrder: z.number(),
});
export type TShuttleAttendanceItem = z.infer<
  typeof shuttleAttendanceItemSchema
>;

/** 출석 확인 폼 */
export const shuttleAttendanceFormSchema = z.object({
  items: z.array(shuttleAttendanceItemSchema).min(1),
});
export type AttendanceFormValues = z.infer<typeof shuttleAttendanceFormSchema>;
