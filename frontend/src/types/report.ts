export interface DimensionScore {
  [key: string]: number
}

export interface QuestionReview {
  question_num: number
  question: string
  answer: string
  score: number
  comment: string
  highlights?: string[]
  improvements?: string[]
}

export interface InterviewStats {
  total_questions?: number
  total_duration?: number
  avg_answer_length?: number
  high_score_questions?: number
  low_score_questions?: number
}

export interface ReportData {
  overall_score: number
  pass_probability: string
  dimension_scores: DimensionScore
  question_reviews: QuestionReview[]
  strengths: string[]
  improvements: string[]
  interview_stats: InterviewStats
  final_advice: string
}

export interface InterviewData {
  id: string
  title: string
  position: string
  difficulty: string
  status: string
  score: number
  duration: number
  startedAt?: string
  completedAt?: string
  answers: AnswerData[]
  questions: string[]
  feedback: ReportData | null
}

export interface AnswerData {
  question: string
  answer: string
  score: number
  comment: string
  highlights?: string[]
  improvements?: string[]
  timestamp: string
}
