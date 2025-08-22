import z from 'zod';

/** 요일 enum 타입 */
export const lessonScheduleDaysEnumSchema = z.enum([
  'MON',
  'TUE',
  'WED',
  'TUR',
  'FRI',
  'SAT',
  'SUN',
]);
export type TLessonScheduleDays = z.infer<typeof lessonScheduleDaysEnumSchema>;

/** 학생 enum 타입 */
export const studentTypeEnumSchema = z.enum(['TEMP', 'REGULAR']);
export type TStudentType = z.infer<typeof studentTypeEnumSchema>;

/** 학생 관계 enum 타입 */
export const studentRelationEnumSchema = z.enum(['MOM', 'FATHER', 'ETC']);
export type TStudentRelation = z.infer<typeof studentRelationEnumSchema>;

/** 학생 상태 enum 타입 */
export const studentStatusEnumSchema = z.enum(['ACTIVE', 'QUIT', 'IDLE']);
export type TStudentStatus = z.infer<typeof studentStatusEnumSchema>;

/** 수강 학생 상태 enum 타입 */
export const lessonStudentStatusEnumSchema = z.enum(['ACTIVE', 'INACTIVE']);
export type TLessonStudentStatus = z.infer<
  typeof lessonStudentStatusEnumSchema
>;

/** 셔틀 사용 여부 enum 타입 */
export const shuttleUsageEnumSchema = z.enum([
  'BOARDING',
  'DROP',
  'BOTH',
  'NONE',
]);
export type TShuttleUsage = z.infer<typeof shuttleUsageEnumSchema>;

/** 셔틀 출결 상태 enum 타입 */
export const shuttleAttendanceStatusEnumSchema = z.enum([
  'WILL_ATTENDANCE',
  'ATTENDANCE',
  'WILL_ABSENT',
  'ABSENT',
]);
export type TShuttleAttendanceStatusEnum = z.infer<
  typeof shuttleAttendanceStatusEnumSchema
>;

/** 학생 수강료 enum 타입 */
export const studentPayMethodTypeEnumSchema = z.enum(['TEAM', 'MANUAL']);
export type TStudentPayMethodType = z.infer<
  typeof studentPayMethodTypeEnumSchema
>;

/** 사용자 기본 타입 */
export const userSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number(),
  studentType: studentTypeEnumSchema,
  name: z.string(),
  birth: z.string(),
  gender: z.string(),
  profileImg: z.string(),
  memo: z.string(),
  studentRelation: studentRelationEnumSchema,
  phone: z.string(),
  organizationId: z.number(),
  status: studentStatusEnumSchema,
});
export type TUser = z.infer<typeof userSchema>;

/** 단일 수강 항목 */
export const lessonItemSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number().optional(),
  sportsName: z.string(),
  lessonName: z.string(),
  organizationId: z.number(),
  memberId: z.number().optional(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  studentCapacity: z.number(),
  price: z.number(),
  memo: z.string(),
});
export type TLesson = z.infer<typeof lessonItemSchema>;

/** 수업 스케줄 */
export const lessonScheduleSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number(),
  lessonId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  scheduleDay: lessonScheduleDaysEnumSchema,
});
export type TLessonSchedule = z.infer<typeof lessonScheduleSchema>;

/** 학생 기본 타입 */
export const studentSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number().optional(),
  studentType: studentTypeEnumSchema,
  name: z.string(),
  birth: z.string(),
  gender: z.string(),
  profileImg: z.string(),
  memo: z.string(),
  studentRelation: studentRelationEnumSchema,
  phone: z.string(),
  organizationId: z.number(),
  status: studentStatusEnumSchema,
});

/** 수강 학생 기본 타입 */
export const lessonStudentSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number(),
  lessonId: z.number(),
  studentId: z.number(),
  status: lessonStudentStatusEnumSchema,
  day: lessonScheduleDaysEnumSchema.optional(),
  statusTime: z.string().optional().nullable(),
});
export type TLessonStudent = z.infer<typeof lessonStudentSchema>;

/** 학생 셔틀 타입 */
export const studentShuttleSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number().optional(),
  studentId: z.number().optional(),
  lessonStudentId: z.number().optional(),
  lessonScheduleId: z.number().optional(),
  shuttleUsage: shuttleUsageEnumSchema.optional(),
  boardingAddress: z.string().nullable().optional(),
  boardingAddressDetail: z.string().nullable().optional(),
  dropAddress: z.string().nullable().optional(),
  dropAddressDetail: z.string().nullable().optional(),
  boardingTime: z.string().nullable().optional(),
  dropTime: z.string().nullable().optional(),
  studentPayMethodType: studentPayMethodTypeEnumSchema.optional(),
});
export type TStudentShuttle = z.infer<typeof studentShuttleSchema>;

/** 셔틀 출석 정보 타입 */
export const shuttleAttendance = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number(),
  type: shuttleUsageEnumSchema,
  lessonId: z.number(),
  studentId: z.number(),
  lessonStudentId: z.number(),
  lessonScheduleId: z.number(),
  lessonStudentDetailId: z.number(),
  time: z.string(),
  status: shuttleAttendanceStatusEnumSchema,
  boardingOrder: z.number(),
});
export type TShuttleAttendances = z.infer<typeof shuttleAttendance>;
