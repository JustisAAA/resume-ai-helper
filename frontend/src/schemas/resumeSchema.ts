import { z } from 'zod'

export const resumeSchema = z.object({
  title: z.string().min(1, '请输入简历标题').max(100, '标题不能超过100个字符').optional(),
})

export type ResumeFormData = z.infer<typeof resumeSchema>
