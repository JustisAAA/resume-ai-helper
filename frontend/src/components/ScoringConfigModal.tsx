import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ScoringConfigModalProps {
  onConfirm: (config: any) => void;
  onCancel: () => void;
}

const ScoringConfigModal: React.FC<ScoringConfigModalProps> = ({ onConfirm, onCancel }) => {
  const [scoringPoints, setScoringPoints] = useState<string[]>(['']);
  const [keyPoints, setKeyPoints] = useState('');
  const [criteria, setCriteria] = useState('');
  const [passScore, setPassScore] = useState(70);
  const [excellentScore, setExcellentScore] = useState(85);
  const [formError, setFormError] = useState('');

  const addPoint = () => setScoringPoints([...scoringPoints, '']);
  const removePoint = (i: number) => {
    if (scoringPoints.length <= 1) return;
    setScoringPoints(scoringPoints.filter((_, idx) => idx !== i));
  };
  const updatePoint = (i: number, val: string) => {
    const next = [...scoringPoints];
    next[i] = val;
    setScoringPoints(next);
  };

  const handleSubmit = () => {
    setFormError('');
    const validPoints = scoringPoints.filter(p => p.trim() !== '');
    if (validPoints.length === 0) {
      setFormError('请至少添加一个得分点');
      return;
    }
    if (passScore >= excellentScore) {
      setFormError('及格分必须小于优秀分');
      return;
    }
    onConfirm({
      scoringPoints: validPoints,
      keyPoints: keyPoints.trim(),
      criteria: criteria.trim(),
      passScore,
      excellentScore,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🎯 AI简历分析配置
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-5">
          {/* 校验错误提示 */}
          {formError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}
          {/* 得分点设置 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              得分点设置 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">添加你想让AI打分的维度，如"Python熟练度"、"项目经验"</p>
            <div className="space-y-2">
              {scoringPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={e => updatePoint(i, e.target.value)}
                    placeholder={`得分点 ${i + 1}，例如：Python熟练度`}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removePoint(i)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={scoringPoints.length <= 1}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addPoint}
              className="mt-2 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
            >
              <PlusIcon className="w-3.5 h-3.5" /> 添加得分点
            </button>
          </div>

          {/* 考察要点 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              考察要点（选填）
            </label>
            <textarea
              value={keyPoints}
              onChange={e => setKeyPoints(e.target.value)}
              placeholder="例如：重点看候选人项目中用到的技术栈是否匹配、是否有独立解决问题的能力"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* 评分标准 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              评分标准说明（选填）
            </label>
            <textarea
              value={criteria}
              onChange={e => setCriteria(e.target.value)}
              placeholder="例如：我们要找一位能独立负责微服务开发的后端工程师，最好有分布式系统经验"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* 及格分 / 优秀分 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                及格分 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={passScore}
                  onChange={e => setPassScore(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="w-10 text-sm font-bold text-indigo-600 dark:text-indigo-400">{passScore}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                优秀分 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={excellentScore}
                  onChange={e => setExcellentScore(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="w-10 text-sm font-bold text-purple-600 dark:text-purple-400">{excellentScore}</span>
              </div>
            </div>
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
            开始AI分析
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringConfigModal;
