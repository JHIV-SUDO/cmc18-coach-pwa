/* CMC18 offline lesson + practice library. Progress is local and self-reported. */
(function(){
"use strict";
const BANK=typeof window!=="undefined"?window.CMC_CONTENT_BANK:null;
const KEY="cmc18-content-progress-v1";
if(!BANK||typeof document==="undefined")return;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const modules=BANK.modules;
const progress=(()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}catch(_){return {}}})();
let selected="integral",mode="question",query="";
const root=document.getElementById("libraryBody");
if(!root)return;
const nQuestions=modules.reduce((s,g)=>s+g.questions.length,0);
const nConcepts=modules.reduce((s,g)=>s+g.concepts.length,0);
const levels={基础:"基础",进阶:"进阶",竞赛变式:"竞赛变式"};
const statusText={independent:"独立做对",hinted:"提示后做对",retry:"需要复测"};
function overview(){
 const done=Object.values(progress).filter(x=>x&&x.status==="independent").length;
 const touched=Object.keys(progress).filter(k=>progress[k]&&progress[k].status).length;
 return `<div class="library-overview"><div><strong>${nConcepts}</strong><small>核心知识卡</small></div>
 <div><strong>${nQuestions}</strong><small>原创练习题</small></div>
 <div><strong>${done}</strong><small>自报独立完成</small></div>
 <div><strong>${touched}</strong><small>已记录练习</small></div></div>`;
}
function controls(){
 return `<div class="library-filters">
 <label>知识模块<select id="libraryModule">${modules.map(m=>`<option value="${esc(m.id)}" ${m.id===selected?"selected":""}>${esc(m.name)}</option>`).join("")}<option value="all" ${selected==="all"?"selected":""}>全部九模块</option></select></label>
 <label>搜索知识点或题目<input id="librarySearch" type="search" value="${esc(query)}" placeholder="例如：积分中值 / Taylor / Green" autocomplete="off"/></label></div>
 <div class="library-tabs" role="group" aria-label="学习内容切换">
 <button type="button" data-library-mode="question" class="${mode==="question"?"selected":""}" aria-pressed="${mode==="question"}">练习题</button>
 <button type="button" data-library-mode="concept" class="${mode==="concept"?"selected":""}" aria-pressed="${mode==="concept"}">知识讲解</button></div>`;
}
function match(text){
 const q=query.trim().toLocaleLowerCase();
 return !q||text.toLocaleLowerCase().includes(q);
}
function cards(){
 const chosen=modules.filter(m=>selected==="all"||m.id===selected);
 const items=[];
 for(const mod of chosen){
   if(mode==="question"){
    for(const q of mod.questions){
      if(!match([mod.name,q.prompt,q.tag,q.level,q.solution].join(" ")))continue;
      const status=progress[q.id]?.status||"";
      items.push(`<article class="library-card library-question" data-question="${esc(q.id)}">
       <div class="library-meta"><span>${esc(mod.name)}</span><span>${esc(q.level)}</span><span>${esc(q.tag)}</span></div>
       <div class="library-question-title">题目 ${esc(q.id)} ${status?`<span class="library-mark">${esc(statusText[status]||status)}</span>`:""}</div>
       <p class="library-math">${esc(q.prompt)}</p>
       <div class="library-actions"><button type="button" data-action="hint">显示提示</button>
       <button type="button" data-action="solution">查看解析</button></div>
       <div class="library-reveal" data-reveal="hint" hidden><strong>解题入口</strong><p>${esc(q.hint)}</p></div>
       <div class="library-reveal" data-reveal="solution" hidden><strong>答案：${esc(q.answer)}</strong><p>${esc(q.solution)}</p></div>
       <div class="library-evaluate" role="group" aria-label="做题结果">
       <span>做完后记录：</span>
       <button type="button" data-rate="independent" ${status==="independent"?'aria-pressed="true"':""}>独立做对</button>
       <button type="button" data-rate="hinted" ${status==="hinted"?'aria-pressed="true"':""}>提示后做对</button>
       <button type="button" data-rate="retry" ${status==="retry"?'aria-pressed="true"':""}>需要复测</button></div>
      </article>`);
    }
   }else{
    for(const c of mod.concepts){
      if(!match([mod.name,c.name,c.core,c.trigger,c.conditions,c.pitfall,c.example].join(" ")))continue;
      items.push(`<article class="library-card library-concept">
       <div class="library-meta"><span>${esc(mod.name)}</span><span>知识点 ${esc(c.id)}</span></div>
       <h3>${esc(c.name)}</h3>
       <div class="library-fact"><strong>核心内容</strong><p>${esc(c.core)}</p></div>
       <div class="library-fact"><strong>使用条件</strong><p>${esc(c.conditions)}</p></div>
       <div class="library-fact"><strong>题目触发信号</strong><p>${esc(c.trigger)}</p></div>
       <div class="library-fact"><strong>常见误区</strong><p>${esc(c.pitfall)}</p></div>
       <div class="library-fact"><strong>例子</strong><p class="library-math">${esc(c.example)}</p></div>
      </article>`);
    }
   }
 }
 return items.length?items.join(""):'<div class="empty">没有匹配内容。尝试清除搜索词或切换其他知识模块。</div>';
}
function render(resetControls=false){
 root.innerHTML=overview()+controls()+'<p class="library-caption">本题库为原创竞赛风格训练，不是历届 CMC 真题原文。做对状态由你自己确认，不能替代闭卷迁移复测。</p>'+
  '<div id="libraryCards" class="library-cards">'+cards()+'</div>';
 attach();
}
function attach(){
 root.querySelector("#libraryModule").addEventListener("change",e=>{selected=e.target.value;render();});
 root.querySelector("#librarySearch").addEventListener("input",e=>{
  query=e.target.value;
  // Updating only cards keeps the search cursor and keyboard stable on Android.
  root.querySelector("#libraryCards").innerHTML=cards();
 });
 for(const button of root.querySelectorAll("[data-library-mode]")){
  button.addEventListener("click",()=>{mode=button.dataset.libraryMode;render();});
 }
}
root.addEventListener("click",event=>{
 const button=event.target.closest("button");
 if(!button)return;
 const article=button.closest("[data-question]");
 if(!article)return;
 const action=button.dataset.action;
 if(action){
  const target=article.querySelector(`[data-reveal="${action}"]`);
  if(!target)return;
  target.hidden=!target.hidden;
  button.setAttribute("aria-expanded",String(!target.hidden));
  button.textContent=(action==="hint"?"提示":"解析")+(target.hidden?"：显示":"：收起");
 }
 const rate=button.dataset.rate;
 if(rate){
  const id=article.dataset.question;
  progress[id]={status:rate,updatedAt:new Date().toISOString()};
  localStorage.setItem(KEY,JSON.stringify(progress));
  article.querySelectorAll("[data-rate]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.rate===rate)));
  const mark=article.querySelector(".library-mark");
  if(mark)mark.textContent=statusText[rate];
  else article.querySelector(".library-question-title").insertAdjacentHTML("beforeend",` <span class="library-mark">${esc(statusText[rate])}</span>`);
  const boxes=root.querySelectorAll(".library-overview strong");
  if(boxes.length===4){
   boxes[2].textContent=Object.values(progress).filter(v=>v&&v.status==="independent").length;
   boxes[3].textContent=Object.values(progress).filter(v=>v&&v.status).length;
  }
 }
});
render();
})();

