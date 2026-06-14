const { execSync } = require('child_process');
const port = process.argv[2] || 3002;

try {
  // Windows: 查找占用端口的进程并杀掉
  const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  
  if (result) {
    const lines = result.split('\n').filter(line => line.includes('LISTENING'));
    const pids = new Set();
    
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) pids.add(match[1]);
    });
    
    pids.forEach(pid => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`✅ 已杀掉进程 PID: ${pid} (端口 ${port})`);
      } catch (e) {
        // 忽略错误
      }
    });
  }
} catch (error) {
  // 没找到进程，忽略
}

console.log(`🧹 端口 ${port} 已清理，开始启动...`);
