import { useEffect, useState, useRef, useCallback } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTheme } from '../context/ThemeContext'
import { interviewAPI, Interview } from '../services/api'
import { getImageUrl } from '../utils/image'
import { answerSchema, type AnswerFormData } from '../schemas/answerSchema'
import Loading, { ButtonSpinner } from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'

export default function InterviewRoom() {
  const { id } = useParams<{ id: string }>()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answer: '' },
  })
  const watchedAnswer = watch('answer')
  // Synchronize answer state with react-hook-form
  useEffect(() => {
    setValue('answer', answer)
  }, [answer, setValue])
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; score?: number; comment?: string; highlights?: string[]; improvements?: string[] }>>([])
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showTips, setShowTips] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [userAvatar, setUserAvatar] = useState<string>('')

  // 安全提取错误信息（防止后端返回对象导致React崩溃）
  const extractErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { error?: string | object; message?: string } }; message?: string }
    if (error.response?.data?.error) {
      return typeof error.response.data.error === 'string' ? error.response.data.error : JSON.stringify(error.response.data.error)
    }
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.message) {
      return error.message
    }
    return '操作失败'
  }
  // 语音相关状态
  const [voiceMode, setVoiceMode] = useState(() => {
    // 从 localStorage 读取语音模式状态，刷新不丢失
    try {
      const saved = localStorage.getItem('interview_voice_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const processedSpeechRef = useRef<Set<string>>(new Set())
  const lastSpokenQuestionRef = useRef<string>('') // 记录上一次播放的题目，避免重复播放
  const justSubmittedRef = useRef(false) // 标志位：刚刚提交答案，避免重复播放
  const speakTextRef = useRef<((text: string) => void) | null>(null) // 保存 speakText 引用，供 useEffect 使用

  useEffect(() => { fetchInterview() }, [id])

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      if (u.avatar) setUserAvatar(u.avatar)
    } catch {}
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // 计时器
  useEffect(() => {
    if (interview?.status === 'IN_PROGRESS' && !interviewEnded) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [interview?.status, interviewEnded])

  // 自动播放当前题目（语音模式开启时）
  useEffect(() => {
    if (currentQuestion && voiceMode && !interviewEnded) {
      // 如果刚刚提交答案，跳过播放（handleSubmitAnswer 中已经播放了）
      if (justSubmittedRef.current) {
        justSubmittedRef.current = false
        return
      }
      // 避免重复播放同一题目
      if (currentQuestion === lastSpokenQuestionRef.current) {
        return
      }
      lastSpokenQuestionRef.current = currentQuestion
      // 延迟 500ms 播放，等待 UI 更新
      const timer = setTimeout(() => {
        speakTextRef.current?.(currentQuestion)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      // 如果不是语音模式或面试结束，重置 lastSpokenQuestion
      lastSpokenQuestionRef.current = ''
    }
  }, [currentQuestion, voiceMode, interviewEnded])

  // ========== 语音功能 ==========
  // 初始化语音识别
  const initRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('当前浏览器不支持语音识别');
      return null;
    }
    
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          const key = `${i}_${transcript}`;
          if (!processedSpeechRef.current.has(key)) {
            finalTranscript += transcript;
            processedSpeechRef.current.add(key);
          }
        }
      }
      if (finalTranscript) {
        setAnswer(prev => {
          const newAnswer = prev + finalTranscript;
          setValue('answer', newAnswer);
          return newAnswer;
        });
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('请允许浏览器使用麦克风');
      }
    };
    
    recognitionRef.current = recognition;
    return recognition;
  }, []);

  // 开始语音识别
  const startListening = useCallback(() => {
    const recognition = initRecognition();
    if (!recognition) {
      setError('当前浏览器不支持语音识别，请使用Chrome或Edge浏览器');
      return;
    }
    try {
      processedSpeechRef.current.clear();
      recognition.start();
      setIsListening(true);
      setError('');
    } catch (e) {
      console.error('启动语音识别失败:', e);
      setIsListening(false);
    }
  }, [initRecognition]);

  // 停止语音识别
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
      setIsListening(false);
      processedSpeechRef.current.clear();
    }
  }, []);

  // 语音合成：播放文本
  const speakText = useCallback((text: string) => {
    if (!voiceMode) return;
    // 停止当前播放
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.5;  // 加快语速，避免读太慢
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [voiceMode]);

  // 同步 speakText 到 ref，供自动播放的 useEffect 使用
  useEffect(() => {
    speakTextRef.current = speakText;
  }, [speakText]);

  // 停止语音合成
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // 切换语音模式
  const toggleVoiceMode = useCallback(() => {
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    // 持久化到 localStorage
    localStorage.setItem('interview_voice_mode', newMode ? 'true' : 'false');
    if (!newMode) {
      // 关闭语音模式时，停止所有语音活动
      stopListening();
      stopSpeaking();
    }
  }, [voiceMode, stopListening, stopSpeaking]);

  const fetchInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.getDetail(token!, id!)
      setInterview(res)

      if (res.status === 'CREATED') {
        startInterview()
      } else if (res.status === 'IN_PROGRESS') {
        const questions = res.questions || []
        const answers = res.answers || []
        setCurrentQuestion(questions[answers.length] || '')
        // 根据 startedAt 计算已用时，不信任 res.duration（后端可能返回错误的默认值）
        const startTime = res.startedAt ? new Date(res.startedAt).getTime() : Date.now()
        setElapsedTime(Math.max(0, Math.round((Date.now() - startTime) / 1000)))

        const history: Array<{ role: string; content: string; score?: number; comment?: string; highlights?: string[]; improvements?: string[] }> = []
        for (let i = 0; i < answers.length; i++) {
          history.push({ role: 'interviewer', content: questions[i] })
          history.push({
            role: 'candidate',
            content: answers[i].answer,
            score: answers[i].score,
            comment: answers[i].comment,
            highlights: answers[i].highlights || [],
            improvements: answers[i].improvements || []
          })
        }
        if (questions[answers.length]) {
          history.push({ role: 'interviewer', content: questions[answers.length] })
        }
        setChatHistory(history)
      } else {
        navigate(`/interviews/${id}/report`)
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err) || '获取面试详情失败')
    } finally {
      setLoading(false)
    }
  }

  const startInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.start(token!, id!) as unknown as { interview: Interview; firstQuestion: string; questions?: string[]; answers?: unknown[] }
      setInterview(res.interview)
      setCurrentQuestion(res.firstQuestion)
      setChatHistory([{ role: 'interviewer', content: res.firstQuestion }])
      // 语音模式：播放第一题
      if (voiceMode) {
        setTimeout(() => speakText(res.firstQuestion), 500)
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err) || '开始面试失败')
    }
  }

  const onSubmitAnswer = async (data: AnswerFormData) => {
    const userAnswer = data.answer.trim()
    stopSpeaking()
    justSubmittedRef.current = true
    setAnswer('')
    setValue('answer', '')
    setSubmitting(true)
    setError('')
    setChatHistory(prev => [...prev, { role: 'candidate', content: userAnswer }])

    // 添加 "AI 正在思考..." 指示器
    setChatHistory(prev => [...prev, { role: 'interviewer', content: '...', thinking: true }] as any)

    const token = localStorage.getItem('token')
    interviewAPI.answerStream(token!, id!, { answer: userAnswer }, {
      onDelta: (_text: string) => {
        // AI 正在流式生成，保持思考指示器
      },
      onDone: (result: any) => {
        setSubmitting(false)
        const { evaluation, nextQuestion } = result

        // 移除思考指示器，更新为实际评价
        setChatHistory(prev => {
          const newHistory = prev.filter((m: any) => !m.thinking)
          // 更新最后一条 candidate 消息的评分数据
          const lastCandIdx = newHistory.length - 1
          if (lastCandIdx >= 0 && newHistory[lastCandIdx].role === 'candidate') {
            newHistory[lastCandIdx] = {
              ...newHistory[lastCandIdx],
              score: evaluation.score,
              comment: evaluation.comment,
              highlights: evaluation.highlights || [],
              improvements: evaluation.improvements || [],
            }
          }
          return newHistory
        })

        if (nextQuestion) {
          setCurrentQuestion(nextQuestion)
          setChatHistory(prev => [...prev, { role: 'interviewer', content: nextQuestion }])
          if (voiceMode) {
            setTimeout(() => speakText(nextQuestion), 500)
          }
        } else {
          setInterviewEnded(true)
          setCurrentQuestion('')
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeout(() => navigate(`/interviews/${id}/report`), 3000)
        }
      },
      onError: (errMsg: string) => {
        setSubmitting(false)
        setError(errMsg || '提交回答失败')
        setAnswer(userAnswer)
        setValue('answer', userAnswer)
        // 移除思考指示器
        setChatHistory(prev => prev.filter((m: any) => !m.thinking))
      },
    })
  }

  const handleExit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const token = localStorage.getItem('token')
      await interviewAPI.exit(token!, id!)
    } catch (_) { /* ignore */ }
    navigate('/interviews')
  }, [id, navigate])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 总题数：根据面试难度固定（简单3/中等5/困难7）
  const DIFFICULTY_TOTAL: Record<string, number> = { EASY: 3, MEDIUM: 5, HARD: 7 };
  const totalQuestions = DIFFICULTY_TOTAL[interview?.difficulty || 'MEDIUM'] || 5;
  const answeredCount = chatHistory.filter(m => m.role === 'candidate').length
  const progressPercent = totalQuestions > 0 ? Math.min(Math.round((answeredCount / totalQuestions) * 100), 100) : 0

  // 实时提示：根据当前问题生成上下文相关提示
  const getContextualTip = (question: string): string => {
    if (!question) return '请认真阅读题目，清晰表达自己的想法。'
    if (question.includes('项目') || question.includes('经验') || question.includes('介绍')) {
      return '💡 提示：请详细描述项目经验，包括技术栈、你的角色、遇到的挑战和解决方案。'
    }
    if (question.includes('团队') || question.includes('协作') || question.includes('沟通')) {
      return '💡 提示：可以举例说明团队合作的经验，展现你的沟通和协作能力。'
    }
    if (question.includes('解决') || question.includes('难题') || question.includes('挑战')) {
      return '💡 提示：使用STAR法则：情境(Situation)→任务(Task)→行动(Action)→结果(Result)。'
    }
    if (question.includes('优点') || question.includes('优势') || question.includes('擅长')) {
      return '💡 提示：结合具体案例说明你的优势，避免空泛的描述。'
    }
    if (question.includes('缺点') || question.includes('不足') || question.includes('改进')) {
      return '💡 提示：诚实面对不足，但也要说明你正在如何改进。'
    }
    if (question.includes('职业规划') || question.includes('未来') || question.includes('目标')) {
      return '💡 提示：结合岗位和公司发展，说明你的短期和长期规划。'
    }
    return '💡 提示：先给出结论，再展开说明，让面试官快速抓住重点。'
  }

  const [currentTip, setCurrentTip] = useState(() => getContextualTip(currentQuestion))

  // 当问题变化时更新提示
  useEffect(() => {
    if (currentQuestion) {
      setCurrentTip(getContextualTip(currentQuestion))
    }
  }, [currentQuestion])

  // 面试技巧
  const interviewTips = [
    { icon: '🎯', title: '明确回答', desc: '先给出结论，再展开说明，让面试官快速抓住重点。' },
    { icon: '📝', title: 'STAR法则', desc: '情境(Situation)→任务(Task)→行动(Action)→结果(Result)，用具体案例说话。' },
    { icon: '💡', title: '展现思考', desc: '遇到难题时，说出你的思考过程，这比正确答案更重要。' },
    { icon: '🤝', title: '保持互动', desc: '适当提问、确认理解，展现你的沟通能力和情商。' },
  ]

  if (loading) return <Loading fullScreen size="md" text="加载面试..." />;
  if (error) return <ErrorAlert message={error} />;
  if (!interview) return null

  const difficultyLabel = interview.difficulty === 'EASY' ? '简单' : interview.difficulty === 'HARD' ? '困难' : '中等'
  const difficultyColor = interview.difficulty === 'EASY' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : interview.difficulty === 'HARD' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 顶部信息栏 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4 shadow-sm">
        {/* 返回按钮 */}
        <button
          onClick={handleExit}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
          title="退出面试"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        {/* 面试信息 */}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{interview.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor}`}>{difficultyLabel}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{interview.position || '通用岗位'}</span>
          </div>
        </div>

        {/* 进度和计时 */}
        <div className="flex items-center gap-4 shrink-0">
          {/* 语音模式开关 */}
          <button
            onClick={toggleVoiceMode}
            className={`p-2 rounded-lg transition-colors ${
              voiceMode
                ? isListening || isSpeaking
                  ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 animate-pulse'
                  : 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={voiceMode ? '关闭语音模式' : '开启语音模式'}
          >
            {voiceMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-14 0v-2" />
                <line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="19" x2="12" y2="23" />
                <line strokeLinecap="round" strokeLinejoin="round" x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-14 0v-2" />
                <line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="19" x2="12" y2="23" />
                <line strokeLinecap="round" strokeLinejoin="round" x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* 主题切换 */}
<ThemeToggle />


          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500 dark:text-gray-400">用时</div>
            <div className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{formatTime(elapsedTime)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">进度</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{answeredCount}/{totalQuestions}</div>
          </div>
          {/* 进度环 */}
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke={dark ? '#374151' : '#e5e7eb'} strokeWidth="3" />
              <circle cx="20" cy="20" r="16" fill="none" stroke={dark ? '#6366f1' : '#4f46e5'} strokeWidth="3"
                strokeDasharray={`${progressPercent * 1.005} 100.5`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
              {progressPercent}%
            </span>
          </div>
        </div>
      </nav>

      {/* 进度条（移动端） */}
      <div className="sm:hidden bg-white dark:bg-gray-800 px-4 pb-2">
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：面试官信息面板（桌面端） */}
        <div className="hidden lg:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col shrink-0">
          {/* 面试官形象 */}
          <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200 dark:shadow-brand-900/40 ring-4 ring-brand-100 dark:ring-brand-900/50">
              <svg className="w-10 h-10 text-white" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="16" r="9" fill="white" fillOpacity="0.95" />
                <path d="M6 44c0-9 8-16 18-16s18 7 18 16" fill="white" fillOpacity="0.95" />
                <path d="M24 28l-3 8h6l-3-8z" fill="currentColor" />
                <path d="M17 25l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI 面试官</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">专业 · 严谨 · 友好</p>
            {/* 状态指示 */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className={`w-2 h-2 rounded-full ${submitting ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{submitting ? '思考中...' : '等待回答'}</span>
            </div>
          </div>

          {/* 面试信息 */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">岗位方向</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{interview.position || '通用'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">难度</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{difficultyLabel}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">总题数</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{totalQuestions} 题</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">已回答</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{answeredCount} 题</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">用时</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{formatTime(elapsedTime)}</div>
            </div>
          </div>

          {/* 退出按钮 */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleExit}
              className="w-full px-4 py-2 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors font-medium"
            >
              退出面试
            </button>
          </div>
        </div>

        {/* 中间：聊天区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {/* 面试开始提示 */}
            {answeredCount === 0 && !interviewEnded && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-100 to-brand-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">面试开始</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  我是你的AI面试官。请认真阅读每道题目，清晰表达自己的想法。
                  <br />回答完毕后点击「发送」提交。
                </p>
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div key={index}>
                {msg.role === 'interviewer' ? (
                  <div className="flex gap-3 max-w-2xl">
                    {/* AI头像 */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      AI
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">面试官</div>
                      {(msg as any).thinking ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="text-sm text-gray-400 ml-1">AI 思考中...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 text-gray-800 dark:text-gray-200 leading-relaxed shadow-sm border border-gray-100 dark:border-gray-800 relative">
                          <span className="absolute -left-1 -top-1 text-2xl text-brand-100 font-serif select-none">"</span>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 max-w-2xl ml-auto">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium text-right">你</div>
                      <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl rounded-tr-md px-4 py-3 leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                      {msg.score !== undefined && (
                        <div className="mt-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-amber-500 text-sm">⭐</span>
                            <span className="text-xs font-bold text-amber-800">面试官评价 · {msg.score}/10分</span>
                          </div>
                          <div className="text-sm text-amber-700 leading-relaxed mb-3">{msg.comment}</div>
                          
                          {msg.highlights && msg.highlights.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-semibold text-green-700 mb-1">✅ 亮点</div>
                              <ul className="space-y-0.5">
                                {msg.highlights.map((h: string, i: number) => (
                                  <li key={i} className="text-xs text-green-600 dark:text-green-400 flex items-start gap-1">
                                    <span className="mt-0.5">•</span>
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {msg.improvements && msg.improvements.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-blue-700 mb-1">💡 可改进</div>
                              <ul className="space-y-0.5">
                                {msg.improvements.map((imp: string, i: number) => (
                                  <li key={i} className="text-xs text-blue-600 flex items-start gap-1">
                                    <span className="mt-0.5">•</span>
                                    <span>{imp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* 用户头像 */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm overflow-hidden">
                      {userAvatar ? (
                        <img src={getImageUrl(userAvatar)} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <span>我</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI思考中动画 */}
            {submitting && (
              <div className="flex gap-3 max-w-2xl">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">面试官</div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* 右侧：面试技巧面板（桌面端） */}
        <div className="hidden xl:flex w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">💡 面试技巧</h3>
            <button
              onClick={() => setShowTips(!showTips)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              {showTips ? '收起' : '展开'}
            </button>
          </div>
          {showTips && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {interviewTips.map((tip, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-brand-50 dark:bg-brand-900/30 transition-colors cursor-default group">
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">{tip.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-700 transition-colors">{tip.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.desc}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 分隔线 */}
              <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

              {/* 当前状态提示 */}
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800">
                <div className="text-sm font-semibold text-brand-800 dark:text-brand-200 mb-2">📊 当前状态</div>
                <div className="space-y-2 text-xs text-brand-700 dark:text-brand-300">
                  <div className="flex justify-between">
                    <span>已回答</span>
                    <span className="font-semibold text-brand-900 dark:text-brand-100">{answeredCount}题</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均得分</span>
                    <span className="font-semibold text-brand-900 dark:text-brand-100">
                      {answeredCount > 0
                        ? (chatHistory.filter(m => m.role === 'candidate' && m.score !== undefined).reduce((s, m) => s + (Number(m.score) || 0), 0) / answeredCount).toFixed(1)
                        : '--'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>得分率</span>
                    <span className="font-semibold text-brand-900 dark:text-brand-100">
                      {answeredCount > 0
                        ? Math.round((chatHistory.filter(m => m.role === 'candidate' && m.score !== undefined).reduce((s, m) => s + (Number(m.score) || 0), 0) / answeredCount) * 10) + '%'
                        : '--'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 实时提示栏 */}
      {!interviewEnded && currentQuestion && (
        <div className="bg-brand-50 dark:bg-brand-900/30 border-t border-brand-100 dark:border-brand-800 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-brand-700 dark:text-brand-300 leading-relaxed">{currentTip}</p>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      {!interviewEnded && currentQuestion && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          <form onSubmit={handleSubmit(onSubmitAnswer)} className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  {...register('answer')}
                  placeholder="输入你的回答... (Shift+Enter 换行)"
                  disabled={submitting}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(onSubmitAnswer)()
                    }
                  }}
                  className={`w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm leading-relaxed transition shadow-sm ${voiceMode ? 'pl-10 pr-4' : 'px-4'}`}
                  rows={3}
                />
                {/* 语音识别按钮 */}
                {voiceMode && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute bottom-2 left-3 p-1.5 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={isListening ? '停止录音' : '开始语音输入'}
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
                )}
                <div className="absolute bottom-2 right-3 text-xs text-gray-300">
                  {answer.length} 字
                </div>
              </div>
              <button
                type="submit"
                disabled={!watchedAnswer?.trim() || submitting}
                onClick={() => handleSubmit(onSubmitAnswer)()}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-medium hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md shrink-0 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <ButtonSpinner />
                    提交中
                  </>
                ) : (
                  <>
                    发送
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
            </div>
            {errors.answer && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.answer.message}</p>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>提示：按 Enter 发送，Shift+Enter 换行</span>
              <span>{submitting ? '面试官正在评估你的回答...' : '等待你的回答'}</span>
            </div>
          </form>
        </div>
      )}

      {/* 面试结束提示 */}
      {interviewEnded && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-brand-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">面试已结束！</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">正在生成你的面试报告，请稍候...</p>
            <div className="mt-4 w-48 mx-auto h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-brand-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
