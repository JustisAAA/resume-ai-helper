import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export interface InterviewConfig {
  difficulty: string;
  keywords: string[];
  abilities: string[];
  questions: string[];
  questionCount: number;
  perQuestionTimeLimit: number; // 每题限时（秒），0=不限时
}

interface InterviewConfigModalProps {
  title?: string;
  jobTitle?: string;
  initialConfig?: Partial<InterviewConfig>;
  onConfirm: (config: InterviewConfig) => void;
  onCancel: () => void;
}

const DIFFICULTIES = [
  { value: '初级', label: '初级', desc: '适合应届生/1-2年经验' },
  { value: '中级', label: '中级', desc: '适合3-5年经验' },
  { value: '高级', label: '高级', desc: '适合5年以上经验' },
];

export default function InterviewConfigModal({
  title,
  jobTitle,
  initialConfig,
  onConfirm,
  onCancel,
}: InterviewConfigModalProps) {
  const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || '中级');
  const [keywords, setKeywords] = useState<string[]>(initialConfig?.keywords || []);
  const [abilities, setAbilities] = useState<string[]>(initialConfig?.abilities || []);
  const [questionCount, setQuestionCount] = useState(initialConfig?.questionCount || 5);
  const [perQuestionTimeLimit, setPerQuestionTimeLimit] = useState(initialConfig?.perQuestionTimeLimit || 0);

  const [keywordInput, setKeywordInput] = useState('');
  const [abilityInput, setAbilityInput] = useState('');

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.difficulty) setDifficulty(initialConfig.difficulty);
      if (initialConfig.keywords) setKeywords(initialConfig.keywords);
      if (initialConfig.abilities) setAbilities(initialConfig.abilities);
      if (initialConfig.questionCount) setQuestionCount(initialConfig.questionCount);
      if (initialConfig.perQuestionTimeLimit !== undefined) setPerQuestionTimeLimit(initialConfig.perQuestionTimeLimit);
    }
  }, [initialConfig]);

  const addTag = (
    input: string,
    setInput: (v: string) => void,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onConfirm({
      difficulty,
      keywords,
      abilities,
      questions: [] as string[],
      questionCount,
      perQuestionTimeLimit,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title || 'AI面试配置'}
            </h3>
            {jobTitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                岗位：{jobTitle}
              </p>
            )}
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-5">
          {/* 难度选择 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              面试难度
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    difficulty === d.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <div>{d.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 题目数量 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              题目数量
            </label>
            <p className="text-xs text-gray-400 mb-2">
              设置AI面试的总题目数（3-10题）
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={10}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="w-10 text-center text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {questionCount}
              </span>
            </div>
          </div>

          {/* 每题限时 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              每题作答限时
            </label>
            <p className="text-xs text-gray-400 mb-2">
              超时自动提交（0 = 不限时）
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 0, label: '不限' },
                { value: 60, label: '1分钟' },
                { value: 120, label: '2分钟' },
                { value: 180, label: '3分钟' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPerQuestionTimeLimit(opt.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    perQuestionTimeLimit === opt.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 关键词 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              考察关键词
            </label>
            <p className="text-xs text-gray-400 mb-2">
              AI面试将围绕这些关键词展开提问
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(keywordInput, setKeywordInput, keywords, setKeywords);
                  }
                }}
                placeholder="输入关键词后按回车，如：Python、微服务"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => addTag(keywordInput, setKeywordInput, keywords, setKeywords)}
                className="px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full"
                  >
                    {kw}
                    <button onClick={() => removeTag(i, keywords, setKeywords)} className="hover:text-red-500">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 考察能力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              考察能力（选填）
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={abilityInput}
                onChange={(e) => setAbilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(abilityInput, setAbilityInput, abilities, setAbilities);
                  }
                }}
                placeholder="输入能力后按回车，如：技术深度、沟通能力"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => addTag(abilityInput, setAbilityInput, abilities, setAbilities)}
                className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-100"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            {abilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {abilities.map((ab, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                    {ab}
                    <button onClick={() => removeTag(i, abilities, setAbilities)} className="hover:text-red-500">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            确认发送面试邀请
          </button>
        </div>
      </div>
    </div>
  );
}
