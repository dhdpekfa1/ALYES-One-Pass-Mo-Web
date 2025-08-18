import z from 'zod';
import {
  shuttleAttendanceStatusEnumSchema,
  shuttleUsageEnumSchema,
} from '@/shared/api/model';
import { nameField, phoneField } from './';

export const loginSchema = z.object({
  name: nameField,
  phone: phoneField,
});
export type LoginForValues = z.infer<typeof loginSchema>;

export const shuttleAttendanceSchema = z.array(
  z.object({
    id: z.number().nullable(),
    type: shuttleUsageEnumSchema,
    lessonId: z.number(),
    lessonStudentId: z.number(),
    lessonScheduleId: z.number(),
    lessonStudentDetailId: z.number(),
    time: z.string(),
    status: shuttleAttendanceStatusEnumSchema,
    boardingOrder: z.number(),
  }),
);
