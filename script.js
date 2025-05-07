// 各模式时长（秒）：吸气、屏息、呼气、屏息（无屏息可填0）
const modes = {
    box:      [4, 4, 4, 4],      // 方形呼吸：4-4-4-4
    478:      [4, 7, 8, 0],      // 4-7-8 呼吸法
    resonance:[5.5, 0, 5.5, 0],  // 共振呼吸：5.5-0-5.5-0
    diaphragm:[4, 0, 4, 0]       // 深腹式呼吸（自定义，默认4-0-4-0）
  };
  
  let intervalIds = [];
  let running = false;
  
  const circle         = document.getElementById('circle');
  const modeSelect     = document.getElementById('mode');
  const startBtn       = document.getElementById('startBtn');
  const stopBtn        = document.getElementById('stopBtn');
  const customInputs   = document.getElementById('customInputs');
  const inhaleInput    = document.getElementById('inhaleInput');
  const hold1Input     = document.getElementById('hold1Input');
  const exhaleInput    = document.getElementById('exhaleInput');
  const hold2Input     = document.getElementById('hold2Input');
  
  // 初始化：默认模式为共振呼吸，自定义输入框隐藏
  modeSelect.value = 'resonance';
  customInputs.style.display = 'none';
  
  // 深腹式默认值调整为吸4秒、呼4秒
  inhaleInput.value = 4;
  hold1Input.value  = 0;
  exhaleInput.value = 4;
  hold2Input.value  = 0;
  
  // 辅助：清除所有定时器
  function clearAllTimeouts() {
    intervalIds.forEach(id => clearTimeout(id));
    intervalIds = [];
  }
  
  // 停止呼吸动画，冻结当前大小，并切换按钮状态
  function stopBreathing() {
    running = false;
    clearAllTimeouts();
  
    // 锁定当前位置
    const rect = circle.getBoundingClientRect();
    circle.style.transition = 'none';
    circle.style.width  = `${rect.width}px`;
    circle.style.height = `${rect.height}px`;
  
    // 按钮：重新开始
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    startBtn.textContent = '重新开始';
  }
  
  // 模式切换时处理：停止动画，重置圆圈，并更新按钮与自定义输入
  modeSelect.addEventListener('change', () => {
    // 1. 停掉旧动画
    if (running) stopBreathing();
  
    // 2. 重置小圆
    clearAllTimeouts();
    circle.style.transition = 'none';
    circle.style.width = '100px';
    circle.style.height = '100px';
  
    // 3. 恢复动画开启时的 transition（下一次 start 时生效）
    setTimeout(() => circle.style.transition = '', 0);

      // —— 在这里加上这一行 神腹式呼吸自定义——  
  customInputs.style.display = modeSelect.value === 'diaphragm' ? 'block' : 'none';
  
    // 4. 按钮改回“开始”
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    startBtn.textContent = '开始';
  });
  
  // 开始/重新开始按钮逻辑
  startBtn.addEventListener('click', () => {
    if (running) return;
  
    // 立即重置圆圈到小，等待下次动画
    circle.style.transition = 'none';
    circle.style.width  = '100px';
    circle.style.height = '100px';
  
    // 恢复过渡效果
    circle.style.transition = '';
    running = true;
  
    // 更新按钮状态
    startBtn.disabled = true;
    stopBtn.disabled  = false;
    startBtn.textContent = '开始';
  
    // 获取呼吸节奏
    let times;
    if (modeSelect.value === 'diaphragm') {
      times = [
        parseFloat(inhaleInput.value),
        parseFloat(hold1Input.value),
        parseFloat(exhaleInput.value),
        parseFloat(hold2Input.value)
      ];
    } else {
      times = modes[modeSelect.value];
    }
  
    // 从小圆开始，即 startIdx = 0
    runBreathing(times, 0);
  });
  
  // 停止按钮绑定
  stopBtn.addEventListener('click', stopBreathing);
  
  // 核心呼吸函数，支持指定起始阶段
  function runBreathing([inhale, hold1, exhale, hold2], startIdx = 0) {
    const sequence = [
      { action: 'inhale', duration: inhale },
      { action: 'hold',   duration: hold1 },
      { action: 'exhale', duration: exhale },
      { action: 'hold',   duration: hold2 }
    ];
    let idx = startIdx;
  
    function next() {
      if (!running) return;
      const { action, duration } = sequence[idx];
  
      // 动态设置动画时长
      circle.style.transition = `width ${duration}s, height ${duration}s`;
      if (action === 'inhale') {
        circle.style.width  = '200px';
        circle.style.height = '200px';
      } else if (action === 'exhale') {
        circle.style.width  = '100px';
        circle.style.height = '100px';
      }
  
      const id = setTimeout(() => {
        idx = (idx + 1) % sequence.length;
        next();
      }, duration * 1000);
      intervalIds.push(id);
    }
  
    next();
  }
  