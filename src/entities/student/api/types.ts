import z from 'zod';
import {
  apiResponseSchema,
  lessonStudentSchema,
  studentShuttleSchema,
  lessonItemSchema,
  studentSchema,
  userSchema,
  shuttleAttendance,
  lessonScheduleSchema,
} from '@/shared/api/model';

/** 사용자 확인 응답 스키마/타입  */
export const getStudentFindResponse = apiResponseSchema.extend({
  result: z.array(userSchema),
});
export type TGetStudentFindResponse = z.infer<typeof getStudentFindResponse>;

/** 수강 수업 조회 응답 스키마/타입 */
export const getLessonTeacherResponseSchema = apiResponseSchema.extend({
  result: z.array(
    z.object({
      lesson: lessonItemSchema,
      student: studentSchema,
      lessonStudent: lessonStudentSchema,
      lessonStudentDetail: studentShuttleSchema,
      shuttleAttendance: z.array(shuttleAttendance),
      lessonSchedule: lessonScheduleSchema,
    }),
  ),
});
export type TGetLessonTeacherResponse = z.infer<
  typeof getLessonTeacherResponseSchema
>;

/** 출석 사전 확인 등록/수정 요청 스키마/타입 */
export const postShuttleAttendanceRequestSchema = z.array(
  shuttleAttendance
    .omit({
      createdDate: true,
      modifiedDate: true,
    })
    .extend({
      id: shuttleAttendance.shape.id.nullable().optional(),
    }),
);
export type TPostShuttleAttendanceRequest = z.infer<
  typeof postShuttleAttendanceRequestSchema
>;

/** 출석 사전 확인 등록/수정 응답 스키마/타입 */
export const postShuttleAttendanceResponseSchema = apiResponseSchema.extend({
  result: z.array(shuttleAttendance),
});
export type TPostShuttleAttendanceResponse = z.infer<
  typeof postShuttleAttendanceResponseSchema
>;
