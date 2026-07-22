/**
 * 账号封禁事件
 *
 * 当后端返回 403 + banned:true 时，axios 拦截器会调用 setBanned(true)
 * App.tsx 监听到事件后，全屏显示"此账号已封禁"页面
 */

let banned = false;
const listeners: Array<() => void> = [];

export function setBanned(value: boolean) {
  if (banned === value) return;
  banned = value;
  if (value) {
    // 清除本地登录态
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('hrToken');
      localStorage.removeItem('hrUser');
    } catch {}
  }
  // 通知所有监听器
  listeners.forEach(fn => fn());
}

export function isBanned(): boolean {
  return banned;
}

export function subscribeBanned(fn: () => void): () => void {
  listeners.push(fn);
  // 返回取消订阅函数
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
