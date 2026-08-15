import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z.object({
  name: z.string().min(1, '请输入姓名').max(50, '姓名不能超过50个字符'),
  email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位').max(50, '密码不能超过50个字符'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
