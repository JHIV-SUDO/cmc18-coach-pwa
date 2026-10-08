/* Android PWA install/offline readiness. No analytics, network API or state sync. */
(function(){
  "use strict";
  function classifyRuntime(env){
    if(!env.secure) return {mode:"lan",message:"当前为普通 HTTP 网页：不能保证安装为离线 PWA。"};
    if(env.standalone) return {mode:"installed",message:"已以应用窗口运行。"};
    return {mode:"secure",message:"安全站点已就绪，可检查离线缓存并安装到主屏幕。"};
  }
  if(typeof module!=="undefined"&&module.exports) module.exports={classifyRuntime};
  if(typeof window==="undefined"||typeof document==="undefined") return;
  let installEvent=null;
  let lastStatus="初始化中";
  const inApp=()=>window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches||!!window.navigator.standalone;
  function mode(){
    return classifyRuntime({secure:!!window.isSecureContext,standalone:inApp()});
  }
  async function cacheInfo(){
    if(!window.isSecureContext||!("serviceWorker" in navigator))return false;
    if(!("caches" in window))return false;
    try {
      const names=await caches.keys();
      return names.some(x=>x.startsWith("cmc18-coach-v"));
    }catch(_){return false;}
  }
  async function statusText(){
    const m=mode();
    if(m.mode==="lan")return "局域网网页模式。需要保持电脑开机；不能靠此地址离线安装。";
    const cached=await cacheInfo();
    const offline=!navigator.onLine;
    const worker=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
    const prefix=m.mode==="installed"?"已安装":"HTTPS / 安全站点";
    if(cached&&worker) return prefix+" · 离线资源就绪 · "+(offline?"当前离线":"当前在线");
    if(cached) return prefix+" · 资源已缓存，刷新后再确认离线控制";
    return prefix+" · 正在准备离线资源，请保持联网并刷新";
  }
  async function update(){
    const status=document.getElementById("cmc18-offline-status");
    lastStatus=await statusText();
    if(status)status.textContent=lastStatus;
    const button=document.getElementById("cmc18-install-action");
    if(button){
      button.hidden=mode().mode==="lan"||inApp();
      button.textContent=installEvent?"安装到手机":"查看安装方法";
    }
  }
  function addButton(parent,id){
    if(!parent||document.getElementById(id))return;
    const button=document.createElement("button");
    button.type="button";button.id=id;
    button.className=parent.id==="mobileMoreMenu"?"mobile-nav-btn secondary":"small-btn";
    button.textContent="安装 / 离线状态";
    button.style.cssText="min-height:44px;padding:9px;border:1px solid #c9d4dc;border-radius:10px;background:#e9f4f8;color:#19324d;font-size:14px;font-weight:700";
    button.addEventListener("click",openDialog);
    parent.appendChild(button);
  }
  async function openDialog(){
    const existing=document.getElementById("cmc18-install-dialog");
    if(existing){existing.querySelector("#cmc18-install-close").focus();return;}
    const shade=document.createElement("div");shade.id="cmc18-install-dialog";
    shade.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(10,25,44,.6);padding:12px;display:grid;place-items:center";
    const panel=document.createElement("section");
    panel.setAttribute("role","dialog");
    panel.setAttribute("aria-modal","true");
    panel.setAttribute("aria-label","离线使用与安装");
    panel.style.cssText="background:#fff;color:#172033;border-radius:16px;padding:18px;width:min(100%,430px);max-height:85vh;overflow:auto;font:14px/1.6 system-ui";
    panel.innerHTML='<h3 style="margin:0 0 12px">安装与离线准备</h3>'+
      '<p id="cmc18-offline-status" role="status">正在检查缓存状态...</p>'+
      '<p style="color:#55677c">在可信 HTTPS 站点首次联网打开，等离线缓存准备好后，再通过 Chrome 菜单安装应用。之后可在断网时启动已经缓存的页面。</p>'+
      '<p style="color:#55677c">学习数据只保存在当前浏览器/已安装应用中。换网址、清除站点数据或卸载应用可能丢失记录，请先使用“备份 / 迁移”导出。</p>'+
      '<div style="display:grid;gap:9px"><button type="button" id="cmc18-install-action">查看安装方法</button>'+
      '<button type="button" id="cmc18-persist-action">请求保护本机存储</button>'+
      '<button type="button" id="cmc18-install-refresh">重新检测状态</button>'+
      '<button type="button" id="cmc18-install-close">关闭</button></div>'+
      '<p id="cmc18-install-hint" role="status" style="font-size:12px;color:#566678"></p>';
    for(const btn of panel.querySelectorAll("button")){
      btn.style.cssText="min-height:44px;border:1px solid #ccd7dc;border-radius:11px;background:#eef7f3;padding:10px;font:600 15px system-ui;cursor:pointer";
    }
    shade.append(panel);document.body.append(shade);
    const hint=panel.querySelector("#cmc18-install-hint");
    panel.querySelector("#cmc18-install-close").onclick=()=>shade.remove();
    panel.querySelector("#cmc18-install-refresh").onclick=update;
    panel.querySelector("#cmc18-install-action").onclick=async()=>{
      if(installEvent){
        const e=installEvent;installEvent=null;
        try{await e.prompt();const choice=await e.userChoice;hint.textContent=choice&&choice.outcome==="accepted"?"安装请求已接受，等待系统完成。":"已取消安装，可稍后从浏览器菜单安装。";}
        catch(_){hint.textContent="当前浏览器无法弹出安装提示，请尝试 Chrome 菜单。";}
        update();
      }else{
        hint.textContent="安卓 Chrome 右上角 ⋮ →「安装应用」或「添加到主屏幕」。若菜单没有安装入口，请先确认 HTTPS 和离线缓存状态。";
      }
    };
    panel.querySelector("#cmc18-persist-action").onclick=async()=>{
      if(!navigator.storage||!navigator.storage.persist){hint.textContent="当前浏览器不支持存储持久化请求。请定期导出备份。";return;}
      try{
        const ok=await navigator.storage.persist();
        hint.textContent=ok?"浏览器已允许持久化存储；仍建议定期备份。":"浏览器未授予持久化存储；请定期手动备份。";
      }catch(_){hint.textContent="存储授权检查失败，请定期手动备份。";}
    };
    update();
  }
  function init(){
    addButton(document.getElementById("mobileMoreMenu"),"cmc18-install-mobile");
    addButton(document.querySelector(".sidebar-footer"),"cmc18-install-desktop");
    window.addEventListener("online",update);
    window.addEventListener("offline",update);
    window.addEventListener("appinstalled",()=>{installEvent=null;update();});
    window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installEvent=event;update();});
    if(navigator.serviceWorker)navigator.serviceWorker.addEventListener("controllerchange",update);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();

