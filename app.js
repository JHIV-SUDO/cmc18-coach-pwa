const EXAM = new Date("2026-11-14T09:00:00+08:00");
const START = new Date("2026-10-08T00:00:00+08:00");
const STORE_KEY = "cmc18-coach-v2";
function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
const EXAM_DATA = (typeof window!=="undefined"&&window.CMC_EXAM_DATA)||{version:1,papers:[],structures:[],opportunities:[]};

const modules = [
  "极限与连续","一元微分","一元积分","常微分方程",
  "向量与空间解析几何","多元微分","多元积分","曲线曲面积分与三大公式","无穷级数"
];
const dims = ["知识","闭卷提取","方法识别","执行稳定","证明构造"];

const initialAbility = Object.fromEntries(modules.map(m=>[m,[0,0,0,0,0]]));

const phases = [
  {name:"一元压缩",start:"2026-10-08",end:"2026-10-10",desc:"把极限、微分、积分压成 CMC 可调用工具箱，不再精雕单点。",goal:"一元核心从熟悉变成快速调用"},
  {name:"高价值覆盖",start:"2026-10-11",end:"2026-10-24",desc:"按真题分值机会覆盖 ODE、多元、空间几何、重积分、曲线曲面积分与级数。",goal:"高频14分级模块不再空白"},
  {name:"结构混练",start:"2026-10-25",end:"2026-11-03",desc:"打破章节边界，用真题结构、半卷和陌生包装训练入口识别。",goal:"陌生题快速提出有效候选工具"},
  {name:"整卷兑现",start:"2026-11-04",end:"2026-11-13",desc:"150分钟整卷、失分修复、跳题回收与稳定性。",goal:"把能力稳定兑换成卷面分"}
];

const learningBlueprint = [
  {module:"极限与连续",core:"极限语言、连续性、无穷小比较、Taylor、洛必达、夹逼与数列极限",cmc:"常规极限 → 参数反求 / 低阶抵消 / 积分定义极限 / 数列结构"},
  {module:"一元微分",core:"导数定义、可导与连续、中值定理、单调性、极值、凹凸与 Taylor",cmc:"求导计算 → 中值定理存在性 / 辅助函数构造 / 不等式 / 函数性态"},
  {module:"一元积分",core:"原函数、定积分、换元、分部积分、反常积分与积分性质",cmc:"直接积分 → 对称性 / 参数积分 / 积分估计 / 递推与性质证明"},
  {module:"常微分方程",core:"一阶方程、可降阶高阶方程、线性方程与解的结构",cmc:"标准求解 → 初边值约束 / 性质判断 / 与积分或函数方程耦合"},
  {module:"向量与空间解析几何",core:"向量、平面、直线、距离、夹角与二次曲面基础",cmc:"公式代入 → 几何约束重构 / 参数反求 / 多条件联立"},
  {module:"多元微分",core:"偏导、全微分、复合函数、隐函数、方向导数与多元极值",cmc:"局部计算 → 隐函数链式传递 / 极值 / 条件极值 / 几何意义"},
  {module:"多元积分",core:"二重与三重积分、积分区域、换序、极坐标与柱球坐标",cmc:"直接积分 → 区域重构 / 对称性 / 坐标变换 / 次序交换"},
  {module:"无穷级数",core:"数项级数、正项级数、交错级数、幂级数与函数展开",cmc:"判敛 → 参数判定 / 幂级数求和 / 展开与极限联动"},
  {module:"曲线曲面积分与三大公式",core:"曲线积分、曲面积分、Green、Gauss、Stokes 与路径无关",cmc:"直接公式 → 对称性 / 路径无关 / 积分类型互换 / 三大公式选择"}
];

const phaseFocus = {
  "一元压缩":["极限与连续","一元微分","一元积分"],
  "高价值覆盖":["常微分方程","向量与空间解析几何","多元微分","多元积分","曲线曲面积分与三大公式","无穷级数"],
  "结构混练":modules,
  "整卷兑现":modules
};

const baseTasks = {
  "一元压缩":[
    ["闭卷提取","不看资料写出极限/导数/积分的核心公式、条件与触发信号。","20m"],
    ["一元压缩","只修复会阻断真题的概念或公式，不完整重听章节。","55m"],
    ["代表技术","1000题只抽 3–4 道不同结构代表题，拒绝同模板堆量。","60m"],
    ["填空 Fast Path","做 5–8 个入口识别刺激，先报最短方法再计算。","35m"],
    ["真题大题/证明","至少 1 道 CMC 真题级综合或证明，训练跨模块启动。","60m"],
    ["延迟复测","回收昨天与 3 天前的不稳定结构。","20m"]
  ],
  "高价值覆盖":[
    ["闭卷回收","复测昨天新模块 + 旧模块关键触发器，禁止先看笔记。","20m"],
    ["高价值新模块","按赛卷机会建立框架：定义/公式/标准型/最短入口。","70m"],
    ["代表技术","做 2–4 道能覆盖主要变形的代表题，不追求刷完题库。","55m"],
    ["填空 Fast Path","10–20 秒识别入口，记录识别时间与最短合法方法。","30m"],
    ["真题大题/证明","做 1 道 14 分级真题或证明构造题，优先学拿分结构。","65m"],
    ["延迟复测","完成到期的 24h/7d 复测。","20m"]
  ],
  "结构混练":[
    ["闭卷回收","按结构而不是章节回忆触发器、标准变换和常见陷阱。","20m"],
    ["盲抽结构","混合 8–10 个题面，只判断候选工具与第一入口。","30m"],
    ["高价值专题","攻一个近期高频且仍有债务的结构。","55m"],
    ["半卷训练","连续完成填空组 + 2–3 道大题，强制跳题与回访。","100m"],
    ["证明启动","至少 1 道证明题，只看能否独立构造第一步。","25m"],
    ["延迟复测","回收 24h/7d 迁移债。","20m"]
  ],
  "整卷兑现":[
    ["限时整卷","严格 150 分钟执行正式试卷决策。","150m"],
    ["失分审计","分成覆盖、迁移、速度、证明、运算和时间决策。","35m"],
    ["定点修复","只修最近两卷重复出现且分值高的问题。","50m"],
    ["填空回收","压缩 5 个填空的入口时间与计算路径。","25m"],
    ["证明表达","复练高频辅助函数、估计、正性与等号条件。","25m"],
    ["复测","完成当天到期的结构复测。","15m"]
  ]
};

let state = loadState();
let focusInterval = null;

function freshState(){
  return {
    ability: JSON.parse(JSON.stringify(initialAbility)),
    tasks:{},
    reflections:{},
    errors:[],
    mocks:[],
    problems:[],
    concepts:[],
    methods:[],
    relations:[],
    retests:[],
    coachSessions:[],
    recommendations:[],
    fastPathAttempts:[],
    debriefs:[],
    conceptRecallResults:{},
    focusDays:{},
    parking:[],
    lastUpdated:new Date().toISOString()
  };
}
function loadState(){
  const base=freshState();
  let local=base;
  const saved = localStorage.getItem(STORE_KEY);
  if(saved){
    try{
      const parsed=JSON.parse(saved);
      local={
        ...base,
        ...parsed,
        ability:{...base.ability,...(parsed.ability||{})},
        debriefs:parsed.debriefs||[],
        focusDays:parsed.focusDays||{},
        parking:parsed.parking||[]
      };
    }catch(e){}
  }
  const coachRaw=(typeof window!=="undefined"&&window.CMC_COACH_DATA)||{};
  return CMCLogic.mergeCoachData(local,coachRaw);
}
function save(){state.lastUpdated=new Date().toISOString();const localState=CMCLogic.localStateForPersistence(state);localStorage.setItem(STORE_KEY,JSON.stringify(localState));}
function keyDate(d=new Date()){return d.toLocaleDateString("en-CA",{timeZone:"Asia/Shanghai"});}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function daysLeft(){
  const now=new Date();
  return Math.max(0,Math.ceil((EXAM-now)/(1000*60*60*24)));
}
function getPhase(date=new Date()){
  const k=keyDate(date);
  return phases.find(p=>k>=p.start&&k<=p.end) || (date<START?phases[0]:phases[3]);
}
function daysBetween(a,b){return Math.floor((new Date(b+"T00:00:00+08:00")-new Date(a+"T00:00:00+08:00"))/86400000)}

function renderCountdown(){
  document.getElementById("countdownDays").textContent=daysLeft();
}
function renderPhase(){
  const p=getPhase();
  const total=daysBetween(p.start,p.end)+1;
  const used=clamp(daysBetween(p.start,keyDate())+1,0,total);
  const pct=Math.round(used/total*100);
  document.getElementById("phaseName").textContent=p.name;
  document.getElementById("phaseDesc").textContent=p.desc+" 阶段出口："+p.goal+"。";
  document.getElementById("phasePct").textContent=pct+"%";
  document.querySelector(".ring").style.setProperty("--deg",(pct*3.6)+"deg");

  const timeline=document.getElementById("phaseTimeline");
  timeline.innerHTML=phases.map(x=>`
    <div class="phase ${x.name===p.name?"current":""}">
      <span>${x.start.slice(5)} → ${x.end.slice(5)}</span>
      <h4>${x.name}</h4>
      <p>${x.desc}</p>
    </div>`).join("");
}

function moduleAverage(m){
  const arr=state.ability[m]||[0,0,0,0,0];
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function rankedWeakness(){
  const focus=new Set(phaseFocus[getPhase().name]);
  return modules.map(m=>({m,avg:moduleAverage(m),focus:focus.has(m)}))
    .sort((a,b)=>{
      if(a.focus!==b.focus) return a.focus?-1:1;
      return a.avg-b.avg;
    });
}
function renderWeakness(){
  const list=rankedWeakness().slice(0,5);
  document.getElementById("weaknessList").innerHTML=list.map(x=>`
    <div class="weak-row">
      <strong>${x.m}</strong>
      <div class="bar"><i style="width:${x.avg*10}%"></i></div>
      <small>${x.avg.toFixed(1)}</small>
    </div>`).join("");
}

function weakestDimension(module){
  const scores=state.ability[module];
  let idx=0;
  scores.forEach((v,i)=>{if(v<scores[idx])idx=i});
  return {name:dims[idx],score:scores[idx]};
}
function renderNextMove(){
  const phase=getPhase().name;
  const actions=CMCLogic.rankNextActions({
    todayKey:keyDate(),
    phase,
    problems:state.problems,
    concepts:state.concepts,
    retests:state.retests,
    mocks:state.mocks,
    ability:state.ability,
    examData:EXAM_DATA,
    fastPathAttempts:state.fastPathAttempts
  });
  const top=actions[0];
  const reasonText={
    overdue:"复测已经逾期",
    scheduled_retest:"已进入复测窗口",
    high_exam_value:"CMC 考场价值高",
    retention_risk:"存在遗忘风险",
    unverified_transfer:"还没有独立迁移证据",
    transfer_leverage:"迁移杠杆高",
    concept_unknown:"概念仍处于未知状态",
    concept_forming:"概念还在形成中",
    concept_stable:"概念已经稳定",
    repeated_recognition_failure:"方法识别失败反复出现",
    recognition_failure:"方法识别失败",
    known_but_not_triggered:"会方法但不会被题目触发",
    phase_progression:"当前阶段主线",
    recent_exam_frequency:"近三届重复出现",
    coverage_gap:"高价值覆盖缺口",
    score_opportunity:"分值机会高",
    fill_fast_path:"填空短路训练",
    slow_recognition:"入口识别偏慢",
    proof_startup:"证明启动能力不足"
  };
  const chips=(top.reasons||[]).slice(0,4).map(r=>`<span class="tag">${reasonText[r]||r}</span>`).join(" ");
  document.getElementById("nextMove").innerHTML=`
    <div class="next-action-title">${top.label}</div>
    <div class="button-row">${chips}</div>
    <p class="muted">系统只给一个最高价值动作。完成它以后，再根据新的表现重排下一步。</p>`;
}

function todayFocus(){
  const p=getPhase();
  const candidates=phaseFocus[p.name]||modules;
  if(p.name==="高价值覆盖"){
    const debts=CMCLogic.computeExamDebts(examContext()).coverage.slice().sort((a,b)=>
      (b.scoreOpportunity*b.recentFrequency+b.priorityBase)-(a.scoreOpportunity*a.recentFrequency+a.priorityBase)
    );
    if(debts[0]&&debts[0].module) return debts[0].module;
  }
  if(p.name==="一元压缩"||p.name==="高价值覆盖"){
    const day=Math.max(0,daysBetween(p.start,keyDate()));
    return candidates[day%candidates.length];
  }
  return rankedWeakness()[0].m;
}
function ensureTodayTasks(){
  const k=keyDate();
  if(!state.tasks[k]){
    state.tasks[k]=baseTasks[getPhase().name].map((x,i)=>({id:i,title:x[0],desc:x[1],time:x[2],done:false}));
    save();
  }
}
function renderEveningOral(){
  const k=keyDate();
  const oral=CMCLogic.eveningOralState(state.coachSessions,k);
  const labels={not_started:"未开始",in_progress:"进行中",completed:"已完成"};
  const badge=document.getElementById("eveningOralBadge");
  const box=document.getElementById("eveningOralStatus");
  if(!badge||!box) return;
  badge.textContent=labels[oral.status]||oral.status;
  badge.className="mastery "+(oral.status==="completed"?"mastery-independently_callable":oral.status==="in_progress"?"mastery-forming":"mastery-unknown");
  const findings=oral.findings.length
    ? oral.findings.map(x=>`<li>${x}</li>`).join("")
    : "<li>今晚口试尚未产生诊断记录。</li>";
  box.innerHTML=`
    <div class="oral-panel">
      <span>今晚状态</span>
      <strong>${labels[oral.status]||oral.status}</strong>
    </div>
    <div class="oral-panel">
      <span>教师诊断</span>
      <ul>${findings}</ul>
    </div>
    <div class="oral-panel">
      <span>明日第一任务</span>
      <strong>${oral.tomorrowFirstTask||"今晚口试结束后由我决定"}</strong>
    </div>`;
}

function renderToday(){
  ensureTodayTasks();
  const k=keyDate();
  const focus=todayFocus();
  document.getElementById("todayHeadline").textContent=`今日主攻：${focus}`;
  const box=document.getElementById("todayTasks");
  box.innerHTML=state.tasks[k].map(t=>`
    <label class="task ${t.done?"done":""}">
      <input type="checkbox" data-task="${t.id}" ${t.done?"checked":""}>
      <div><div class="task-title">${t.title}</div><div class="task-desc">${t.desc}</div></div>
      <div class="task-time">${t.time}</div>
    </label>`).join("");
  box.querySelectorAll("[data-task]").forEach(el=>el.addEventListener("change",e=>{
    const task=state.tasks[k].find(t=>t.id===Number(e.target.dataset.task));
    task.done=e.target.checked;save();renderToday();renderDashboardMetrics();
  }));
  renderEveningOral();
}

function renderDashboardMetrics(){
  ensureTodayTasks();
  const tasks=state.tasks[keyDate()];
  const done=tasks.filter(t=>t.done).length;
  document.getElementById("todayRate").textContent=Math.round(done/tasks.length*100)+"%";
  const due=state.errors.filter(e=>!e.passed && e.reviewDate && e.reviewDate<=keyDate()).length;
  document.getElementById("reviewCount").textContent=due;
  const latest=state.mocks.slice().sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
  document.getElementById("latestMock").textContent=latest?latest.score:"--";
}

function formatClock(totalSeconds){
  const s=Math.max(0,totalSeconds);
  const mm=String(Math.floor(s/60)).padStart(2,"0");
  const ss=String(s%60).padStart(2,"0");
  return mm+":"+ss;
}
function updateFocusTimer(){
  const k=keyDate();
  const day=state.focusDays[k]||{};
  const timer=document.getElementById("focusTimer");
  if(!timer) return;
  if(!day.started||!day.startTime){
    timer.textContent="10:00";
    return;
  }
  const elapsed=Math.floor((Date.now()-day.startTime)/1000);
  const remain=600-elapsed;
  timer.textContent=formatClock(remain);
  if(remain<=0){
    if(!day.completed){
      state.focusDays[k]={...day,completed:true};
      save();
    }
    document.getElementById("focusStatus").innerHTML="<strong>启动完成。</strong>现在直接进入今日训练，不处理停车场里的论文任务。";
    if(focusInterval){clearInterval(focusInterval);focusInterval=null;}
  }
}
function renderFocus(){
  const k=keyDate();
  const day=state.focusDays[k]||{};
  const status=document.getElementById("focusStatus");
  const startBtn=document.getElementById("startMath");
  startBtn.disabled=!!day.started;
  startBtn.textContent=day.completed?"今日启动已完成":(day.started?"数学启动计时中":"开始 10 分钟数学启动");
  if(day.completed){
    status.innerHTML="<strong>今日数学启动已完成。</strong>论文停车场在数学核心任务完成前保持封存。";
  }else if(day.started){
    status.innerHTML="<strong>计时中。</strong>纸笔闭卷，先把会什么和不会什么暴露出来。";
  }else{
    status.innerHTML="<strong>还没启动。</strong>不要先打开论文。点击上面的按钮，把今天第一块高质量注意力交给数学。";
  }
  updateFocusTimer();
  if(day.started&&!day.completed&&!focusInterval){
    focusInterval=setInterval(updateFocusTimer,1000);
  }

  const active=state.parking.filter(x=>!x.done);
  const box=document.getElementById("parkingList");
  if(!active.length){
    box.innerHTML='<div class="empty">没有待处理论文干扰。想到论文任务时只记下来，不切走。</div>';
  }else{
    box.innerHTML=active.map(x=>`
      <div class="log-item">
        <div><h4>${escapeHTML(x.text)}</h4><p>已停车 · 数学核心训练完成后再处理</p></div>
        <button class="small-btn" data-park-done="${x.id}">已处理</button>
      </div>`).join("");
    box.querySelectorAll("[data-park-done]").forEach(b=>b.addEventListener("click",()=>{
      const item=state.parking.find(x=>x.id===b.dataset.parkDone);
      if(item)item.done=true;
      save();renderFocus();
    }));
  }
}

function renderConcepts(){
  const box=document.getElementById("conceptList");
  const ranked=CMCLogic.rankCoachConcepts(state.concepts);
  const labels={unknown:"不会",forming:"正在形成",independently_callable:"可独立调用"};
  const localLabels={independent:"独立通过",hint:"需要提示",failed:"未通过"};
  if(!ranked.length){
    box.innerHTML='<div class="empty">目前没有教练标记的概念雾区。做题时一旦暴露“好像懂但说不清”，我会自动把它送进这里。</div>';
    return;
  }
  box.innerHTML=ranked.map(c=>{
    const effective=CMCLogic.effectiveCoachConceptState(c);
    const motivation=c.motivation||c.problem||"待教练补充";
    const formal=c.formalStatement||c.formal||"待教练补充";
    const conditionRoles=c.conditionRoles||c.necessity||"待教练补充";
    const counterexamples=Array.isArray(c.counterexamples)?c.counterexamples.join("；"):(c.counterexamples||c.counterexample||"待教练补充");
    const triggers=Array.isArray(c.triggerSignals)?c.triggerSignals.join("；"):(c.triggerSignals||c.trigger||"待教练补充");
    const linked=Array.isArray(c.linkedProblems)?c.linkedProblems.join("、"):"";
    const local=state.conceptRecallResults&&state.conceptRecallResults[c.id];
    return `<details class="concept-card">
      <summary>
        <div><strong>${c.name||"未命名概念"}</strong><span class="tag">${c.type||"概念"}</span></div>
        <span class="mastery mastery-${effective}">${labels[effective]}</span>
      </summary>
      <div class="concept-body">
        <p><b>为什么被标记：</b>${c.flagReason||"做题过程中暴露出理解或调用不稳定"}</p>
        <p><b>它解决什么问题：</b>${motivation}</p>
        <p><b>直觉 / 图像：</b>${c.intuition||"待教练补充"}</p>
        <p><b>正式表达：</b>${formal}</p>
        <p><b>条件为什么需要：</b>${conditionRoles}</p>
        <p><b>反例：</b>${counterexamples}</p>
        <p><b>什么时候该想到它：</b>${triggers}</p>
        ${c.derivation?`<p><b>如何重建：</b>${c.derivation}</p>`:""}
        ${linked?`<p><b>关联题目：</b>${linked}</p>`:""}
        <p><b>下一次复测：</b>${c.nextRetestDate||"由教练根据后续训练安排"}</p>
        <p><b>本地复测记录：</b>${local?localLabels[local.result]+" · "+local.date:"尚未提交"}</p>
        <div class="button-row">
          <button class="small-btn" data-concept-result="${c.id}" data-result="independent">独立通过</button>
          <button class="small-btn" data-concept-result="${c.id}" data-result="hint">需要提示</button>
          <button class="small-btn" data-concept-result="${c.id}" data-result="failed">未通过</button>
        </div>
      </div>
    </details>`;
  }).join("");
  box.querySelectorAll("[data-concept-result]").forEach(b=>b.addEventListener("click",()=>{
    state.conceptRecallResults=state.conceptRecallResults||{};
    state.conceptRecallResults[b.dataset.conceptResult]={result:b.dataset.result,date:keyDate()};
    save();renderConcepts();
  }));
}

function renderDebriefs(){
  const inbox=document.getElementById("coachInbox");
  const debtBox=document.getElementById("transferDebtList");
  const problems=(state.problems||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  const statusLabels={verified:"迁移已验证",debt:"待迁移验证",overdue:"复测逾期",not_required:"例行题"};
  const outcomeLabels={independent:"独立完成",after_cue:"提示信号后完成",after_hint:"方法提示后完成",partial_solution:"看部分解答后完成",full_explanation:"看完整解答后理解"};
  const retestFor=p=>(state.retests||[]).filter(r=>r&&(r.problemId===p.id||r.targetId===p.id||r.targetProblemId===p.id))
    .sort((a,b)=>String(a.dueDate||a.date||"").localeCompare(String(b.dueDate||b.date||"")))[0];

  if(!problems.length){
    inbox.innerHTML='<div class="empty">还没有教练导入的题目。你下一次把练习题发给我并完成互动后，我会自动把拆解写到这里。</div>';
    debtBox.innerHTML='<div class="empty">当前没有迁移债务。</div>';
    return;
  }

  inbox.innerHTML=problems.map(p=>{
    const transfer=CMCLogic.problemTransferState(p,state.retests,keyDate());
    const concepts=Array.isArray(p.concepts)?p.concepts.join("、"):"";
    const methods=Array.isArray(p.methods)?p.methods.join("、"):"";
    const triggers=Array.isArray(p.triggerSignals)?p.triggerSignals.join("；"):(p.triggerSignals||"");
    const retest=retestFor(p);
    const due=p.nextRetestDate||(retest&&(retest.dueDate||retest.date))||"待安排";
    const badgeClass=transfer.status==="verified"?"mastery-independently_callable":(transfer.status==="overdue"?"mastery-unknown":"mastery-forming");
    return `<details class="concept-card">
      <summary>
        <div><strong>${p.title||"未命名题目"}</strong><span class="tag">${p.module||"待归类"}</span></div>
        <span class="mastery ${badgeClass}">${statusLabels[transfer.status]}</span>
      </summary>
      <div class="concept-body">
        <p><b>来源：</b>${p.source||"未记录"} ｜ <b>作答：</b>${outcomeLabels[p.userOutcome]||p.userOutcome||"未记录"}</p>
        <p><b>数学难度：</b>${p.difficulty??"待评估"} ｜ <b>考场价值：</b>${p.examValue??"待评估"}</p>
        <p><b>表面题型：</b>${p.surface||"例行题未做深拆解"}</p>
        <p><b>底层结构：</b>${p.structure||"待教练补充"}</p>
        <p><b>条件作用：</b>${p.conditions||"待教练补充"}</p>
        <p><b>诱导陷阱：</b>${p.trap||"待教练补充"}</p>
        <p><b>决定性转折：</b>${p.turningPoint||"待教练补充"}</p>
        <p><b>保持核心的变式：</b>${p.variantPattern||"待教练补充"}</p>
        <p><b>迁移触发信号：</b>${triggers||"待教练补充"}</p>
        ${concepts?`<p><b>概念：</b>${concepts}</p>`:""}
        ${methods?`<p><b>方法：</b>${methods}</p>`:""}
        <p><b>下一次复测：</b>${due}</p>
        ${p.coachNote?`<p><b>教练备注：</b>${p.coachNote}</p>`:""}
      </div>
    </details>`;
  }).join("");

  const debts=problems.map(p=>({p,t:CMCLogic.problemTransferState(p,state.retests,keyDate())}))
    .filter(x=>x.t.status==="debt"||x.t.status==="overdue")
    .sort((a,b)=>{
      if(a.t.status!==b.t.status) return a.t.status==="overdue"?-1:1;
      return Number(b.p.examValue||0)-Number(a.p.examValue||0);
    });
  debtBox.innerHTML=debts.length?debts.map(({p,t})=>{
    const retest=retestFor(p);
    const due=p.nextRetestDate||(retest&&(retest.dueDate||retest.date))||"待安排";
    return `<div class="log-item">
      <div>
        <h4>${p.title||"未命名题目"}</h4>
        <p>${p.structure||p.surface||"待归类"} · 考场价值 ${p.examValue??"?"}</p>
        <p>${t.status==="overdue"?"复测已经逾期":"还没有独立迁移证据"} · 下一次复测：${due}</p>
      </div>
      <span class="mastery ${t.status==="overdue"?"mastery-unknown":"mastery-forming"}">${statusLabels[t.status]}</span>
    </div>`;
  }).join(""):'<div class="empty">当前没有未解决的迁移债务。</div>';
}

function examContext(){
  return {
    examData:EXAM_DATA,
    ability:state.ability,
    problems:state.problems,
    retests:state.retests,
    fastPathAttempts:state.fastPathAttempts||[],
    todayKey:keyDate()
  };
}

function renderExamMap(){
  const debts=CMCLogic.computeExamDebts(examContext());
  const countMap={coverageDebtCount:debts.coverage.length,transferDebtCount:debts.transfer.length,speedDebtCount:debts.speed.length,proofDebtCount:debts.proof.length};
  for(const [id,value] of Object.entries(countMap)){const el=document.getElementById(id);if(el)el.textContent=value;}

  const matrix=CMCLogic.buildExamMatrix(EXAM_DATA);
  const editions=(EXAM_DATA.papers||[]).map(p=>p.edition);
  const matrixBox=document.getElementById("examMatrix");
  if(matrixBox){
    matrixBox.innerHTML=matrix.length?`<table class="exam-matrix"><thead><tr><th>底层结构</th>${editions.map(e=>`<th>${e}A</th>`).join("")}</tr></thead><tbody>${matrix.map(row=>`<tr><td><strong>${row.name}</strong></td>${row.editions.map(e=>`<td class="${e.present?"hit":""}">${e.present?"✓":"·"}</td>`).join("")}</tr>`).join("")}</tbody></table>`:`<div class="empty">暂无赛卷元数据。</div>`;
  }

  const sets={
    coverage:new Set(debts.coverage.map(x=>x.structureId)),
    transfer:new Set(debts.transfer.map(x=>x.structureId)),
    speed:new Set(debts.speed.map(x=>x.structureId)),
    proof:new Set(debts.proof.map(x=>x.structureId))
  };
  const structures=new Map((EXAM_DATA.structures||[]).map(s=>[s.id,s]));
  const oppBox=document.getElementById("examOpportunities");
  if(oppBox){
    oppBox.innerHTML=(EXAM_DATA.opportunities||[]).slice().sort((a,b)=>(b.recentFrequency*b.pointOpportunity+b.priorityBase)-(a.recentFrequency*a.pointOpportunity+a.priorityBase)).map(o=>{
      const s=structures.get(o.structureId)||{};
      const tags=[sets.coverage.has(o.structureId)?"覆盖债":"",sets.transfer.has(o.structureId)?"迁移债":"",sets.speed.has(o.structureId)?"速度债":"",sets.proof.has(o.structureId)?"证明债":""].filter(Boolean);
      return `<article class="opportunity-card"><div class="opportunity-head"><strong>${o.label}</strong><span>${o.recentFrequency}/3 届</span></div><div class="opportunity-score">${o.pointOpportunity}<small> 分级机会</small></div><p>${s.fastPath||"从真题结构反推最短入口。"}</p><div class="button-row">${tags.length?tags.map(t=>`<span class="tag debt-tag">${t}</span>`).join(""):`<span class="tag stable-tag">当前无显著债务</span>`}</div></article>`;
    }).join("");
  }

  const log=document.getElementById("fastPathLog");
  if(log){
    const xs=(state.fastPathAttempts||[]).slice().reverse().slice(0,8);
    log.innerHTML=xs.length?xs.map(a=>{
      const s=structures.get(a.structureId)||{};
      const fast=Number(a.recognitionSeconds||0)<=20&&Number(a.solveSeconds||0)<=180&&a.correct===true;
      return `<div class="log-item"><div><h4>${escapeHTML(s.name||a.structureId)}</h4><p>入口 ${escapeHTML(a.recognitionSeconds)}s · 完整 ${escapeHTML(a.solveSeconds)}s · ${a.correct?"正确":"错误"}</p><p>${escapeHTML(a.methodChosen||"未记方法")}${a.note?" · "+escapeHTML(a.note):""}</p></div><span class="mastery ${fast?"mastery-independently_callable":"mastery-forming"}">${fast?"短路达标":"仍需压缩"}</span></div>`;
    }).join(""):`<div class="empty">还没有 Fast Path 记录。以后填空训练会在这里沉淀“看到什么 → 第一入口是什么”。</div>`;
  }

  const select=document.getElementById("fastPathStructure");
  if(select&&!select.options.length){select.innerHTML=(EXAM_DATA.structures||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join("");}
}
function renderLearning(){
  const box=document.getElementById("learningModules");
  const stages=learningBlueprint.map(x=>({
    ...x,
    stage:CMCLogic.learningStage(x.module,state.concepts,state.problems,state.retests)
  }));
  const next=stages.find(x=>x.stage!=="可竞赛调用");
  const stageClass={"未建立框架":"unknown","正在理解":"forming","可基础调用":"basic","可竞赛调用":"independently_callable"};
  box.innerHTML=stages.map(x=>`
    <details class="learning-module ${next&&next.module===x.module?"learning-current":""}" ${next&&next.module===x.module?"open":""}>
      <summary>
        <div>
          <strong>${x.module}</strong>
          ${next&&next.module===x.module?'<span class="tag">当前优先</span>':""}
        </div>
        <span class="mastery mastery-${stageClass[x.stage]}">${x.stage}</span>
      </summary>
      <div class="concept-body">
        <p><b>先搭框架：</b>${x.core}</p>
        <p><b>CMC 化方向：</b>${x.cmc}</p>
        <div class="learning-mini-flow">
          <span>① 我讲知识框架</span><span>② 你闭卷复述</span><span>③ 基础检查</span>
          <span>④ 1000题代表题</span><span>⑤ CMC化变式</span><span>⑥ 真题迁移</span>
        </div>
        <p class="muted">${x.stage==="未建立框架"?"练习门暂不开。先在当前聊天由我带你建立这一模块的知识地图。":x.stage==="正在理解"?"优先消灭概念雾区，不增加大量新题。":x.stage==="可基础调用"?"可以进入代表题与 CMC 化变式，但仍需迁移证据。":"该模块已具备竞赛调用证据，转入保持与混合训练。"}</p>
      </div>
    </details>
  `).join("");
}

function renderStructureBank(){
  const box=document.getElementById("structureBank");
  const groups=CMCLogic.buildStructureIndex({
    problems:state.problems,concepts:state.concepts,methods:state.methods,relations:state.relations
  });
  if(!groups.length){
    box.innerHTML='<div class="empty">还没有足够题目形成结构库。完成几道题后，我会把不同外观但同一骨架的题压到一起。</div>';
    return;
  }
  box.innerHTML=groups.sort((a,b)=>b.problems.length-a.problems.length).map(g=>{
    const hinted=g.problems.filter(p=>Number(p.hintCount||0)>0).length;
    return `<details class="concept-card">
      <summary>
        <div><strong>${g.label}</strong><span class="tag">${g.problems.length} 题</span></div>
        <span class="muted">${g.modules.join(" / ")||"待归类"}</span>
      </summary>
      <div class="concept-body">
        <p><b>关联题目：</b>${g.problems.map(p=>p.title||p.id).join("；")}</p>
        <p><b>提示依赖：</b>${hinted}/${g.problems.length} 题曾需要提示</p>
        <p><b>常见错因：</b>${g.errorTypes.join("；")||"暂无"}</p>
        <p><b>关联概念：</b>${g.concepts.join("；")||"暂无"}</p>
        <p><b>常用方法：</b>${g.methods.join("；")||"暂无"}</p>
      </div>
    </details>`;
  }).join("");
}

function renderAbility(){
  const wrap=document.getElementById("abilityTable");
  wrap.innerHTML=`<table>
    <thead><tr><th>模块</th>${dims.map(d=>`<th>${d}</th>`).join("")}<th>均值</th></tr></thead>
    <tbody>${modules.map(m=>`<tr><td><strong>${m}</strong></td>
      ${state.ability[m].map((v,i)=>`<td><div class="score-control">
        <input type="range" min="0" max="10" step="1" value="${v}" data-module="${m}" data-dim="${i}">
        <span class="score-pill">${v}</span></div></td>`).join("")}
      <td><strong>${moduleAverage(m).toFixed(1)}</strong></td></tr>`).join("")}
    </tbody></table>`;
  wrap.querySelectorAll("input[type=range]").forEach(el=>el.addEventListener("input",e=>{
    const m=e.target.dataset.module, i=Number(e.target.dataset.dim);
    state.ability[m][i]=Number(e.target.value);
    save();renderAbility();renderWeakness();renderNextMove();
  }));
}

function renderErrors(){
  const types=["知识缺失","公式提取失败","方法识别失败","关键转化没想到","运算不稳","证明链断裂","速度不足"];
  const counts=Object.fromEntries(types.map(t=>[t,0]));
  state.errors.forEach(e=>counts[e.type]=(counts[e.type]||0)+1);
  const max=Math.max(1,...Object.values(counts));
  document.getElementById("errorStats").innerHTML=types.map(t=>`
    <div class="stat-row"><span>${t}</span><div class="stat-bar"><i style="width:${counts[t]/max*100}%"></i></div><b>${counts[t]}</b></div>`).join("");
  const log=document.getElementById("errorLog");
  if(!state.errors.length){log.innerHTML='<div class="empty">还没有错题。真正的训练数据从第一道错题开始。</div>';return}
  log.innerHTML=state.errors.slice().reverse().map(e=>`
    <div class="log-item">
      <div><h4>${escapeHTML(e.title)}</h4>
        <p>${escapeHTML(e.module)} · <span class="tag">${escapeHTML(e.type)}</span></p>
        <p>触发信号：${escapeHTML(e.signal||"未填")} ｜ 第一入口：${escapeHTML(e.entry||"未填")}</p>
        <p>复测：${e.reviewDate||"未安排"} ${e.passed?"· 已通过":""}</p>
      </div>
      <button class="small-btn" data-pass="${escapeHTML(e.id)}">${e.passed?"取消通过":"标记通过"}</button>
    </div>`).join("");
  log.querySelectorAll("[data-pass]").forEach(b=>b.addEventListener("click",()=>{
    const e=state.errors.find(x=>x.id===b.dataset.pass);e.passed=!e.passed;save();renderErrors();renderReview();renderDashboardMetrics();
  }));
}

function renderReview(){
  const due=state.errors.filter(e=>!e.passed&&e.reviewDate&&e.reviewDate<=keyDate()).sort((a,b)=>a.reviewDate.localeCompare(b.reviewDate));
  const q=document.getElementById("reviewQueue");
  if(!due.length){q.innerHTML='<div class="empty">今天没有到期复测。不要主动翻答案，等系统把题重新送回来。</div>';return}
  q.innerHTML=due.map(e=>`<div class="log-item">
    <div><h4>${escapeHTML(e.title)}</h4><p>${escapeHTML(e.module)} · ${escapeHTML(e.type)}</p><p>先回忆触发信号，再独立重做。原入口：${escapeHTML(e.entry||"未填")}</p></div>
    <button class="small-btn" data-review-pass="${escapeHTML(e.id)}">独立通过</button>
  </div>`).join("");
  q.querySelectorAll("[data-review-pass]").forEach(b=>b.addEventListener("click",()=>{
    const e=state.errors.find(x=>x.id===b.dataset.reviewPass);e.passed=true;save();renderReview();renderErrors();renderDashboardMetrics();
  }));
}

function renderMocks(){
  const sorted=state.mocks.slice().sort((a,b)=>a.date.localeCompare(b.date));
  const chart=document.getElementById("mockChart");
  if(!sorted.length) chart.innerHTML='<div class="empty" style="width:100%">第一次整卷后，这里才开始有意义。</div>';
  else chart.innerHTML=sorted.slice(-8).map(m=>`
    <div class="bar-col"><b>${escapeHTML(m.score)}</b><i style="height:${Math.max(4,Math.min(100,Number(m.score)||0))}%"></i><span>${escapeHTML(m.date.slice(5))}<br>${escapeHTML(m.name)}</span></div>`).join("");
  const log=document.getElementById("mockLog");
  if(!sorted.length){log.innerHTML='<div class="empty">暂无模考记录。</div>';return}
  log.innerHTML=sorted.slice().reverse().map(m=>`
    <div class="log-item"><div><h4>${escapeHTML(m.name)} · ${escapeHTML(m.score)}分</h4>
    <p>${escapeHTML(m.date)} · ${m.timed==="yes"?"150分钟内":"超时"}</p><p>${escapeHTML(m.note||"未填写复盘")}</p></div></div>`).join("");
}

function setupForms(){
  document.getElementById("errorModule").innerHTML=modules.map(m=>`<option>${m}</option>`).join("");
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  document.getElementById("errorReviewDate").value=keyDate(tomorrow);
  document.getElementById("mockDate").value=keyDate();
  const fastSelect=document.getElementById("fastPathStructure");
  if(fastSelect) fastSelect.innerHTML=(EXAM_DATA.structures||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join("");

  document.getElementById("errorForm").addEventListener("submit",e=>{
    e.preventDefault();
    state.errors.push({
      id:Date.now().toString(),
      title:document.getElementById("errorTitle").value,
      module:document.getElementById("errorModule").value,
      type:document.getElementById("errorType").value,
      signal:document.getElementById("errorSignal").value,
      entry:document.getElementById("errorEntry").value,
      reviewDate:document.getElementById("errorReviewDate").value,
      passed:false
    });
    save();e.target.reset();document.getElementById("errorReviewDate").value=keyDate(tomorrow);
    renderErrors();renderReview();renderDashboardMetrics();
  });

  document.getElementById("mockForm").addEventListener("submit",e=>{
    e.preventDefault();
    state.mocks.push({
      date:document.getElementById("mockDate").value,
      name:document.getElementById("mockName").value,
      score:Number(document.getElementById("mockScore").value),
      timed:document.getElementById("mockTimed").value,
      note:document.getElementById("mockNote").value
    });
    save();e.target.reset();document.getElementById("mockDate").value=keyDate();
    renderMocks();renderDashboardMetrics();
  });

  const fastForm=document.getElementById("fastPathForm");
  if(fastForm) fastForm.addEventListener("submit",e=>{
    e.preventDefault();
    const recognition=clamp(Number(document.getElementById("fastPathRecognition").value||0),0,600);
    const solve=clamp(Number(document.getElementById("fastPathSolve").value||0),0,1800);
    state.fastPathAttempts=state.fastPathAttempts||[];
    state.fastPathAttempts.push({
      id:"fp-"+Date.now(),
      date:keyDate(),
      structureId:document.getElementById("fastPathStructure").value,
      recognitionSeconds:recognition,
      solveSeconds:solve,
      correct:document.getElementById("fastPathCorrect").value==="yes",
      methodChosen:document.getElementById("fastPathMethod").value.trim(),
      note:document.getElementById("fastPathNote").value.trim()
    });
    save();
    fastForm.reset();
    renderExamMap();
    renderNextMove();
  });

  document.getElementById("parkingForm").addEventListener("submit",e=>{
    e.preventDefault();
    state.parking=CMCLogic.addParkingItem(state.parking,document.getElementById("parkingInput").value);
    document.getElementById("parkingInput").value="";
    save();renderFocus();
  });

  document.getElementById("startMath").addEventListener("click",()=>{
    const k=keyDate();
    if(!state.focusDays[k]||!state.focusDays[k].started){
      state.focusDays[k]={started:true,startTime:Date.now(),completed:false};
      save();renderFocus();
    }
  });

  document.getElementById("resetToday").addEventListener("click",()=>{
    delete state.tasks[keyDate()];save();renderToday();renderDashboardMetrics();
  });
}

function setupNavigation(){
  const titleMap={dashboard:"总览",learning:"学习区",library:"知识与题库",exam:"赛卷地图",today:"今日训练",focus:"专注启动",concepts:"概念去雾",debrief:"出题人复盘",map:"能力地图",errors:"错因诊断",review:"复测队列",mock:"模考趋势"};
  function show(id){
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
    document.querySelectorAll(".mobile-nav-btn[data-mobile-view]").forEach(b=>b.classList.toggle("active",b.dataset.mobileView===id));
    const more=document.getElementById("mobileMoreMenu"); if(more) more.hidden=true;
    document.getElementById("viewTitle").textContent=titleMap[id]||"CMC18";
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
  document.querySelectorAll(".mobile-nav-btn[data-mobile-view]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.mobileView)));
  const moreBtn=document.querySelector("[data-mobile-more]");
  const moreMenu=document.getElementById("mobileMoreMenu");
  if(moreBtn&&moreMenu) moreBtn.addEventListener("click",()=>{moreMenu.hidden=!moreMenu.hidden;moreBtn.classList.toggle("active",!moreMenu.hidden);});
  document.querySelectorAll("[data-view-target]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.viewTarget)));
}

function registerServiceWorker(){
  if("serviceWorker" in navigator && (location.protocol==="http:"||location.protocol==="https:")){
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  }
}

function init(){
  registerServiceWorker();
  setupNavigation();setupForms();
  renderCountdown();renderPhase();renderLearning();renderExamMap();renderToday();renderFocus();renderConcepts();renderDebriefs();renderStructureBank();renderAbility();
  renderWeakness();renderNextMove();renderErrors();renderReview();renderMocks();renderDashboardMetrics();
  if(CMCLogic.shouldForceMathStart(state.focusDays,keyDate())){
    const focusButton=document.querySelector('[data-view="focus"]');
    if(focusButton)focusButton.click();
  }
}
init();