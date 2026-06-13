type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'ended'

interface Props {
  state: AvatarState
  statusText?: string
}

export default function AIInterviewerAvatar({ state, statusText }: Props) {
  const defaultText = {
    idle: '等待回答...',
    listening: '正在聆听...',
    thinking: '思考中...',
    speaking: '正在提问...',
    ended: '面试已完成',
  }[state]

  const label = statusText || defaultText

  return (
    <div
      className="flex flex-col items-center py-4"
      style={{ animation: 'avatarFadeIn 0.6s ease-out both' }}
    >
      <style>{`
        @keyframes avatarFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes avatarBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes avatarThinking {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.15); }
        }
        @keyframes avatarSpeak {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.04); }
        }
        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.4), 0 0 40px rgba(139,92,246,0.2); }
        }
        @keyframes eyelidBlink {
          0%, 90%, 100% { opacity: 0; }
          95% { opacity: 1; }
        }
        @keyframes mouthSpeak {
          0%, 100% { r: 5; }
          30% { r: 7; }
          60% { r: 4; }
        }
        @keyframes pupilLook {
          0%, 100% { transform: translateX(0); }
          33% { transform: translateX(2px); }
          66% { transform: translateX(-2px); }
        }
      `}</style>

      <style>{`
        .avatar-container {
          animation: ${
            state === 'thinking' ? 'avatarThinking 1.5s ease-in-out infinite, avatarGlow 2s ease-in-out infinite' :
            state === 'speaking' ? 'avatarSpeak 2s ease-in-out infinite' :
            state === 'ended' ? 'avatarGlow 3s ease-in-out infinite' :
            'avatarBreath 4s ease-in-out infinite'
          };
        }
        .avatar-eyelid {
          animation: eyelidBlink 4s ease-in-out infinite;
        }
        .avatar-eyelid.fast {
          animation: eyelidBlink 1.5s ease-in-out infinite;
        }
        .avatar-mouth {
          animation: ${state === 'speaking' ? 'mouthSpeak 0.6s ease-in-out infinite' : 'none'};
        }
        .avatar-pupil {
          animation: ${state === 'thinking' ? 'pupilLook 1s ease-in-out infinite' : 'pupilLook 4s ease-in-out infinite'};
        }
      `}</style>

      {/* 头像容器 */}
      <div className="avatar-container relative rounded-full p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-16 h-16">
            {/* 面部底色 */}
            <circle cx="50" cy="50" r="48" fill="url(#faceGrad)" />

            {/* 左眼 */}
            <ellipse cx="35" cy="42" rx="8" ry="9" fill="white" stroke="#4B5563" strokeWidth="1.5" />
            <circle className="avatar-pupil" cx="37" cy="43" r="4" fill="#1F2937" />
            <circle cx="38" cy="41" r="1.5" fill="white" />
            {/* 左眼眼皮 */}
            <rect className={`avatar-eyelid ${state === 'thinking' ? 'fast' : ''}`} x="26" y="33" width="19" height="18" rx="9" fill="url(#faceGrad)" />

            {/* 右眼 */}
            <ellipse cx="65" cy="42" rx="8" ry="9" fill="white" stroke="#4B5563" strokeWidth="1.5" />
            <circle className="avatar-pupil" cx="67" cy="43" r="4" fill="#1F2937" />
            <circle cx="68" cy="41" r="1.5" fill="white" />
            {/* 右眼眼皮 */}
            <rect className={`avatar-eyelid ${state === 'thinking' ? 'fast' : ''}`} x="56" y="33" width="19" height="18" rx="9" fill="url(#faceGrad)" />

            {/* 眉毛 */}
            <path d="M28 33 Q35 28 42 33" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
            <path d="M58 33 Q65 28 72 33" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />

            {/* 鼻子 */}
            <path d="M50 45 L48 53 Q50 55 52 53 Z" fill="#E5D0C0" stroke="#9CA3AF" strokeWidth="0.8" />

            {/* 嘴巴 */}
            <svg x="0" y="0" width="100" height="100">
              {state === 'ended' ? (
                // 微笑
                <path d="M38 64 Q50 74 62 64" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
              ) : state === 'speaking' ? (
                // 说话：椭圆嘴
                <ellipse cx="50" cy="65" rx="6" ry="5" fill="#4B5563" className="avatar-mouth" />
              ) : state === 'thinking' ? (
                // 思考：抿嘴
                <path d="M40 63 L60 63" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
              ) : (
                // 默认：微张嘴
                <ellipse cx="50" cy="63" rx="5" ry="2.5" fill="#6B7280" />
              )}
            </svg>

            {/* 眼镜框（可选专业感） */}
            <rect x="28" y="33" width="19" height="16" rx="5" fill="none" stroke="#6366F1" strokeWidth="1.2" opacity="0.4" />
            <rect x="54" y="33" width="19" height="16" rx="5" fill="none" stroke="#6366F1" strokeWidth="1.2" opacity="0.4" />
            <line x1="47" y1="41" x2="54" y2="41" stroke="#6366F1" strokeWidth="1.2" opacity="0.4" />

            {/* 渐变定义 */}
            <defs>
              <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* 状态指示灯 */}
        {state !== 'ended' && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
            state === 'thinking' ? 'bg-amber-400 animate-pulse' :
            state === 'speaking' ? 'bg-brand-400' :
            state === 'listening' ? 'bg-blue-400 animate-pulse' :
            'bg-gray-300'
          }`} />
        )}
      </div>

      {/* 状态文字 */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        {state === 'thinking' && (
          <span className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}
