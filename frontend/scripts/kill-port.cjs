const { execSync } = require('child_process');
const port = process.argv[2] || 5173;

try {
  // Windows: 使用 netstat 查找占用端口的进程
  const result = execSync(`netstat -ano | findstr :${port}`, { 
    encoding: 'utf8', 
    stdio: ['pipe', 'pipe', 'ignore'],
    shell: true  // 重要：需要 shell: true 才能使用管道 |
  });
  
  if (result) {
    const lines = result.split('\n').filter(line => line.includes('LISTEN'));
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    });
    
    pids.forEach(pid => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore', shell: true });
        console.log(`✅ 已杀掉进程 PID: ${pid} (端口 ${port})`);
      } catch (e) {
        // 忽略错误
      }
    });
  }
} catch (error) {
  // 没找到进程或命令失败，忽略
}

console.log(`🧹 端口 ${port} 已清理，开始启动...`);
