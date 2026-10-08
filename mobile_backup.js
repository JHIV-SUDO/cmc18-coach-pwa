/* Portable browser-only CMC18 backup. No network calls or automatic sync. */
(function(){
  "use strict";
  const KEY="cmc18-coach-v2";
  const COLLECTIONS=["problems","concepts","methods","relations","retests","coachSessions","recommendations"];
  const STATE_KEYS=[
    "ability","tasks","reflections","errors","mocks","problems","concepts","methods",
    "relations","retests","coachSessions","recommendations","fastPathAttempts","debriefs",
    "conceptRecallResults","focusDays","parking","lastUpdated","coachVersion"
  ];
  function readLocal(storage){
    try{
      const raw=storage.getItem(KEY);
      const obj=raw?JSON.parse(raw):{};
      return obj&&typeof obj==="object"&&!Array.isArray(obj)?obj:{};
    }catch(_){return {};}
  }
  function mergeRecords(local,coach){
    const result=[],index=new Map();
    for(const source of [local,coach]){
      for(const raw of Array.isArray(source)?source:[]){
        if(!raw||typeof raw!=="object"||Array.isArray(raw)) continue;
        const copy={...raw};
        delete copy._coachOwned;
        const id=copy.id===undefined||copy.id===null?null:String(copy.id);
        if(id!==null&&index.has(id)) result[index.get(id)]={...result[index.get(id)],...copy};
        else{
          if(id!==null) index.set(id,result.length);
          result.push(copy);
        }
      }
    }
    return result;
  }
  function createBackup(storage,coach){
    const state=readLocal(storage);
    const coachData=coach&&typeof coach==="object"?coach:{};
    const merged={...state};
    for(const k of COLLECTIONS) merged[k]=mergeRecords(state[k],coachData[k]);
    return {format:"cmc18-portable-backup",version:1,createdAt:new Date().toISOString(),state:merged};
  }
  function applyBackup(storage,input){
    if(!input||input.format!=="cmc18-portable-backup"||input.version!==1||
       !input.state||typeof input.state!=="object"||Array.isArray(input.state))
      throw new Error("不是受支持的 CMC18 备份");
    const out={};
    for(const k of STATE_KEYS) if(Object.prototype.hasOwnProperty.call(input.state,k)) out[k]=input.state[k];
    const arrKeys=[...COLLECTIONS,"errors","mocks","fastPathAttempts","debriefs","parking"];
    for(const k of arrKeys) if(k in out&&!Array.isArray(out[k])) throw new Error("备份数据结构不合法: "+k);
    for(const k of COLLECTIONS) out[k]=mergeRecords(out[k],[]);
    for(const k of ["tasks","ability","focusDays","conceptRecallResults"]){
      if(k in out&&(!out[k]||typeof out[k]!=="object"||Array.isArray(out[k])))
        throw new Error("备份数据结构不合法: "+k);
    }
    const prior=storage.getItem(KEY);
    if(prior!==null) storage.setItem(KEY+"-before-import",prior);
    storage.setItem(KEY,JSON.stringify(out));
    return true;
  }
  const api={createBackup,applyBackup,storageKey:KEY};
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(typeof window!=="undefined") window.CMC18PortableBackup=api;
  if(typeof window==="undefined"||typeof document==="undefined") return;
  function openDialog(){
    if(document.getElementById("cmc18-backup-dialog")) return;
    const shade=document.createElement("div");
    shade.id="cmc18-backup-dialog";
    shade.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(10,25,44,.55);padding:12px;display:grid;place-items:center";
    const panel=document.createElement("section");
    panel.setAttribute("role","dialog");
    panel.setAttribute("aria-modal","true");
    panel.setAttribute("aria-label","CMC18 学习数据备份迁移");
    panel.style.cssText="background:#fff;color:#172033;border-radius:16px;padding:18px;width:min(100%,430px);max-height:85vh;overflow:auto;font:14px/1.6 system-ui";
    panel.innerHTML='<h3 style="margin:0 0 12px">学习数据备份 / 迁移</h3>'+
      '<p>此功能不会自动同步。备份含教练诊断，请妥善保管。</p>'+
      '<p>导入会替换当前浏览器数据，并保存一份临时回滚状态。</p>'+
      '<div style="display:grid;gap:12px">'+
      '<button type="button" id="cmc18-export">导出学习数据 JSON</button>'+
      '<label>导入备份 JSON<input type="file" id="cmc18-import" accept=".json,application/json" style="display:block;width:100%;font-size:16px;margin-top:8px"></label>'+
      '<button type="button" id="cmc18-close">关闭</button></div>'+
      '<p id="cmc18-backup-status" role="status" style="font-size:13px;color:#566678"></p>';
    for(const btn of panel.querySelectorAll("button"))
      btn.style.cssText="min-height:44px;border:1px solid #c9d4dc;border-radius:10px;background:#eef7f3;padding:10px;font:600 15px system-ui;cursor:pointer";
    shade.appendChild(panel);document.body.appendChild(shade);
    panel.querySelector("#cmc18-close").onclick=()=>shade.remove();
    panel.querySelector("#cmc18-export").onclick=()=>{
      try{
        const obj=createBackup(window.localStorage,window.CMC_COACH_DATA);
        const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"});
        const url=URL.createObjectURL(blob);
        const anchor=document.createElement("a");
        anchor.href=url;anchor.download="CMC18_学习备份_"+new Date().toISOString().slice(0,10)+".json";
        document.body.appendChild(anchor);anchor.click();anchor.remove();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
      }catch(error){panel.querySelector("#cmc18-backup-status").textContent="导出失败："+error.message;}
    };
    panel.querySelector("#cmc18-import").onchange=async e=>{
      const file=e.target.files&&e.target.files[0];if(!file) return;
      if(file.size>3*1024*1024){panel.querySelector("#cmc18-backup-status").textContent="文件超过 3 MB，拒绝导入";return;}
      try{
        const obj=JSON.parse(await file.text());
        if(!window.confirm("导入将覆盖此浏览器的学习状态，是否继续？")) return;
        applyBackup(window.localStorage,obj);
        window.location.reload();
      }catch(error){panel.querySelector("#cmc18-backup-status").textContent="导入失败："+error.message;}
    };
  }
  function addUI(){
    if(document.getElementById("cmc18-backup-mobile")) return;
    const more=document.getElementById("mobileMoreMenu");
    const sidebar=document.querySelector(".sidebar-footer");
    for(const pair of [[more,"cmc18-backup-mobile"],[sidebar,"cmc18-backup-desktop"]]){
      const parent=pair[0];if(!parent) continue;
      const button=document.createElement("button");
      button.type="button";button.id=pair[1];
      button.textContent="备份 / 迁移";
      button.className=parent===more?"mobile-nav-btn secondary":"small-btn";
      button.style.cssText="min-height:44px;padding:9px;border:1px solid #c9d4dc;border-radius:10px;background:#eef7f3;color:#19324d;font-size:14px;font-weight:700";
      button.addEventListener("click",openDialog);
      parent.appendChild(button);
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",addUI,{once:true});
  else addUI();
})();

