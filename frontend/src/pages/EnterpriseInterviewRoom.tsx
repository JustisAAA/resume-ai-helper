import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewAPI, Interview } from '../services/api'
import { useToast } from '../components/Toast'
import AIInterviewerAvatar from '../components/AIInterviewerAvatar'
import { ButtonSpinner } from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'

/** 动画消息组件 — 渐入上滑 */
function ChatBubble({ role, content, index }: { role: string; content: string; index: number }) {
  return (
    <div
      className={`flex ${role === 'candidate' ? 'justify-end' : 'justify-start'}`}
      style={{
        animation: `fadeInUp 0.4s ${index * 0.05}s both ease-out`
      }}
    >
      {/* 面试官头像 */}
      {role === 'interviewer' && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0 mr-2.5 shadow-sm">
          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
          role === 'candidate'
            ? 'bg-brand-600 text-white rounded-br-md shadow-md'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

/** AI思考中动画气泡 */
function ThinkingBubble() {
  return (
    <div
      className="flex justify-start"
      style={{ animation: 'fadeInUp 0.3s ease-out both' }}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0 mr-2.5 shadow-sm">
        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

/** 进度条组件 */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
        {current} / {total}
      </span>
      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** 计时器组件 */
function Timer({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

export default function EnterpriseInterviewRoom() {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; id: number }>>([])
  const [msgIdCounter, setMsgIdCounter] = useState(0)
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [showEnding, setShowEnding] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const processedSpeechRef = useRef<Set<string>>(new Set())
  const [perQuestionTimeLimit, setPerQuestionTimeLimit] = useState(0) // 每题限时（秒）
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0) // 当前题的倒计时
  const chatEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleSubmitRef = useRef<() => void>(() => {})
  const initRef = useRef(false)
  const navigate = useNavigate()

  const addMsg = (role: string, content: string) => {
    const id = msgIdCounter
    setMsgIdCounter(c => c + 1)
    setChatHistory(prev => [...prev, { role, content, id }])
    return id
  }

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // 总计时器
  useEffect(() => {
    if (!interviewEnded && !showEnding && interview?.status === 'IN_PROGRESS') {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [interviewEnded, showEnding, interview])

  // 每题倒计时：检测到新面试官消息时重置
  const lastInterviewerMsgIdRef = useRef<number>(-1)
  useEffect(() => {
    if (!perQuestionTimeLimit || perQuestionTimeLimit <= 0) return
    if (interviewEnded || showEnding || aiThinking) return

    // 找到最后一条面试官消息
    const lastInterviewer = [...chatHistory].reverse().find(m => m.role === 'interviewer')
    if (!lastInterviewer || lastInterviewer.id === lastInterviewerMsgIdRef.current) return

    lastInterviewerMsgIdRef.current = lastInterviewer.id
    setQuestionTimeLeft(perQuestionTimeLimit)

    // 启动倒计时
    if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          if (questionTimerRef.current) clearInterval(questionTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (questionTimerRef.current) clearInterval(questionTimerRef.current) }
  }, [chatHistory, perQuestionTimeLimit, interviewEnded, showEnding, aiThinking])

  // 超时自动提交
  useEffect(() => {
    if (questionTimeLeft === 0 && perQuestionTimeLimit > 0 && !aiThinking && !interviewEnded && !showEnding && !submitting) {
      handleSubmitRef.current()
    }
  }, [questionTimeLeft, perQuestionTimeLimit, aiThinking, interviewEnded, showEnding, submitting])

  // ========== 语音输入 ==========
  const initRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return null
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript
          const key = `${i}_${transcript}`
          if (!processedSpeechRef.current.has(key)) {
            finalTranscript += transcript
            processedSpeechRef.current.add(key)
          }
        }
      }
      if (finalTranscript) {
        setAnswer(prev => prev + finalTranscript)
      }
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
      setIsListening(false)
    }
    recognitionRef.current = recognition
    return recognition
  }

  const startListening = () => {
    const recognition = initRecognition()
    if (!recognition) {
      showToast('当前浏览器不支持语音识别，请使用Chrome或Edge浏览器', 'error')
      return
    }
    try {
      processedSpeechRef.current.clear()
      recognition.start()
      setIsListening(true)
    } catch (e) { /* ignore */ }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
      setIsListening(false)
    }
  }

  // 加载面试
  const fetchInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.getDetail(token!, id!)
      setInterview(res)

      const qConfig = (res as any).questions
      if (qConfig && typeof qConfig === 'object' && !Array.isArray(qConfig) && qConfig.config) {
        if (qConfig.config.questionCount) setTotalQuestions(qConfig.config.questionCount)
        if (qConfig.config.perQuestionTimeLimit) setPerQuestionTimeLimit(qConfig.config.perQuestionTimeLimit)
      }

      if (res.status === 'CREATED') {
        startInterview()
      } else if (res.status === 'IN_PROGRESS') {
        const questions = res.questions || []
        const answers = res.answers || []
        const startTime = res.startedAt ? new Date(res.startedAt).getTime() : Date.now()
        setElapsedTime(Math.max(0, Math.round((Date.now() - startTime) / 1000)))
        const history: Array<{ role: string; content: string; id: number }> = []
        let counter = 0
        for (let i = 0; i < answers.length; i++) {
          history.push({ role: 'interviewer', content: questions[i], id: counter++ })
          history.push({ role: 'candidate', content: answers[i].answer, id: counter++ })
        }
        if (questions[answers.length]) {
          history.push({ role: 'interviewer', content: questions[answers.length], id: counter++ })
        }
        setChatHistory(history)
        setMsgIdCounter(counter)
        setQuestionCount(answers.length)
      } else if (res.status === 'COMPLETED') {
        setInterviewEnded(true)
        setShowEnding(true)
        setQuestionCount((res.answers || []).length)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (!initRef.current) { initRef.current = true; fetchInterview() } }, [])

  // 自动滚动
  useEffect(() => { scrollToBottom() }, [chatHistory, aiThinking])

  const startInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.start(token!, id!) as any
      setInterview(res.interview)
      addMsg('interviewer', res.firstQuestion)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || '开始面试失败')
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return

    const userAnswer = answer.trim()
    setSubmitting(true)
    setAnswer('')

    // 乐观更新：答案立即显示
    addMsg('candidate', userAnswer)

    // AI思考中状态
    setAiThinking(true)

    const token = localStorage.getItem('token')
    interviewAPI.answerStream(token!, id!, { answer: userAnswer }, {
      onDelta: (_text: string) => {
        // 流式文本到达，AI正在工作中（保持思考动画）
      },
      onDone: (result: any) => {
        setAiThinking(false)
        setSubmitting(false)

        const qType = result.questionType || 'next_question'

        if (result.nextQuestion && result.nextQuestion !== '面试结束') {
          if (qType !== 'follow_up') {
            setQuestionCount(q => q + 1)
          }
          setTimeout(() => {
            addMsg('interviewer', result.nextQuestion)
          }, 200)
        } else {
          setQuestionCount(q => q + 1)
          setShowEnding(true)
          setTimeout(() => {
            setInterviewEnded(true)
          }, 600)
        }

        if (result.interview) setInterview(result.interview)
      },
      onError: (errMsg: string) => {
        setAiThinking(false)
        setSubmitting(false)
        showToast(errMsg || '提交失败', 'error')
      },
    })
  }

  // 同步 handleSubmit 到 ref，确保 timeout 闭包始终使用最新版本
  handleSubmitRef.current = handleSubmit

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">正在准备面试环境...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorAlert message={error} />
      </div>
    )
  }

  const isInProgress = !interviewEnded && !showEnding

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 注入 keyframes 动画 */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes endingAppear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ========== 顶部状态栏 ========== */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* 左侧：状态 */}
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              interviewEnded
                ? 'bg-gray-400'
                : showEnding
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-brand-500 animate-pulse'
            }`} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {interviewEnded ? '面试已结束' : showEnding ? '即将结束...' : '面试进行中'}
            </span>
          </div>

          {/* 右侧：进度 + 倒计时 + 总计时 */}
          <div className="flex items-center gap-4">
            <ProgressBar
              current={Math.min(questionCount, totalQuestions)}
              total={totalQuestions}
            />
            {perQuestionTimeLimit > 0 && isInProgress && (
              <div className={`flex items-center gap-1.5 ${
                questionTimeLeft <= 30 ? 'text-red-500' : 'text-amber-500'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-mono font-semibold">
                  {String(Math.floor(questionTimeLeft / 60)).padStart(2, '0')}:{String(questionTimeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Timer seconds={elapsedTime} />
            </div>
          </div>
        </div>
      </div>

      {/* ========== 聊天区域 ========== */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 面试开始提示 */}
          <div
            className="bg-gradient-to-r from-brand-50 to-brand-50 dark:from-brand-900/20 dark:to-brand-900/20 border border-brand-100 dark:border-brand-800/50 rounded-2xl p-4 text-center"
            style={{ animation: 'fadeInUp 0.5s ease-out both' }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">AI 企业面试</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              这是企业定制的正式面试，请认真作答。回答完成后自动进入下一题。
            </p>
          </div>

          {/* AI面试官虚拟形象 */}
          <AIInterviewerAvatar
            state={
              interviewEnded || showEnding ? 'ended' :
              aiThinking ? 'thinking' :
              'idle'
            }
          />

          {/* 聊天消息 */}
          {chatHistory.map((msg, i) => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} index={i} />
          ))}

          {/* AI思考中 */}
          {aiThinking && <ThinkingBubble />}

          {/* 面试结束卡片 */}
          {showEnding && (
            <div
              className="bg-gradient-to-br from-brand-50 to-brand-50 dark:from-brand-900/20 dark:to-brand-900/20 border-2 border-brand-200 dark:border-brand-800 rounded-2xl p-8 text-center"
              style={{
                animation: `endingAppear 0.5s ${aiThinking ? '0.3s' : '0s'} ease-out both`
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-700 dark:text-brand-400 mb-2">
                面试已完成
              </h3>
              <p className="text-brand-600 dark:text-brand-500 text-sm mb-1">
                您的回答已被完整记录
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                企业HR将在评估后与您联系，请耐心等待通知
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
                <Timer seconds={elapsedTime} />
                <span>·</span>
                <span>共 {questionCount} 道题</span>
              </div>
              <button
                onClick={() => navigate('/enterprise-interviews')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                返回企业面试
              </button>
              {/* 无条件跳转备用按钮：React Router 导航失败时使用 */}
              <button
                onClick={() => { window.location.href = '/enterprise-interviews'; }}
                className="px-6 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors mt-2"
              >
                强制返回
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ========== 底部输入区 ========== */}
      {isInProgress && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/60 dark:border-gray-800/60 px-4 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder={aiThinking ? 'AI面试官正在思考...' : '输入你的回答...（Enter 发送，Shift+Enter 换行）'}
              rows={2}
              disabled={submitting}
              className="w-full px-4 py-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
            />
            {/* 语音输入按钮 */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={submitting}
              className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isListening ? '停止录音' : '语音输入'}
            >
              {isListening ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="19" x2="12" y2="23" />
                  <line strokeLinecap="round" strokeLinejoin="round" x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-40 shrink-0 self-end"
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <ButtonSpinner />
                  发送中
                </span>
              ) : '发送'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
