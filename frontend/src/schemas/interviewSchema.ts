import { z } from 'zod'

export const interviewSchema = z.object({
  resumeId: z.string().min(1, '请选择简历'),
  position: z.string().min(1, '请输入目标岗位').max(100, '岗位名称不能超过100个字符'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    error: '请选择面试难度',
  }),
})

export type InterviewFormData = z.infer<typeof interviewSchema>
