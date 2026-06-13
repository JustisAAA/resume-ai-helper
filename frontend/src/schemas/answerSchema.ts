import { z } from 'zod'

export const answerSchema = z.object({
  answer: z.string().min(1, '请输入回答内容').max(5000, '回答内容不能超过5000个字符'),
})

export type AnswerFormData = z.infer<typeof answerSchema>
