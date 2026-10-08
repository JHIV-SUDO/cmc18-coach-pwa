(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  root.CMCLogic=api;
})(typeof self!=="undefined"?self:this,function(){
  const ORDER={"不会":0,"正在形成":1,"可独立调用":2};
  const COACH_KEYS=["problems","concepts","methods","relations","retests","coachSessions","recommendations"];

  function effectiveMastery(record){
    const status=record&&record.status in ORDER?record.status:"不会";
    if(status==="可独立调用" && !record.recallPassed) return "正在形成";
    return status;
  }

  function reviewCompleteness(review){
    const keys=["surface","structure","conditions","trap","turningPoint","variant","trigger"];
    return keys.reduce((n,k)=>n+(review&&String(review[k]||"").trim()?1:0),0);
  }

  function shouldForceMathStart(focusDays,dateKey){
    return !(focusDays&&focusDays[dateKey]&&focusDays[dateKey].started);
  }

  function addParkingItem(items,text){
    const clean=String(text||"").trim();
    if(!clean) return items.slice();
    return items.concat([{id:String(Date.now())+Math.random().toString(16).slice(2),text:clean,done:false}]);
  }

  function rankConcepts(concepts){
    return concepts.slice().sort((a,b)=>{
      const aa=ORDER[effectiveMastery(a)]??0;
      const bb=ORDER[effectiveMastery(b)]??0;
      return aa-bb;
    });
  }

  const COACH_CONCEPT_ORDER={unknown:0,forming:1,independently_callable:2};

  function hasIndependentEvidence(concept){
    if(concept&&concept.recallPassed===true) return true;
    const evidence=concept&&Array.isArray(concept.recallEvidence)?concept.recallEvidence:[];
    return evidence.some(e=>e&&e.result==="passed"&&(e.type==="closed_book"||e.type==="transfer"));
  }

  function effectiveCoachConceptState(concept){
    const legacy={"不会":"unknown","正在形成":"forming","可独立调用":"independently_callable"};
    let state=concept&&concept.masteryState;
    if(!(state in COACH_CONCEPT_ORDER)) state=legacy[concept&&concept.status]||"unknown";
    if(state==="independently_callable"&&!hasIndependentEvidence(concept)) return "forming";
    return state;
  }

  function rankCoachConcepts(concepts){
    return (Array.isArray(concepts)?concepts:[]).slice().sort((a,b)=>
      (COACH_CONCEPT_ORDER[effectiveCoachConceptState(a)]??0)-
      (COACH_CONCEPT_ORDER[effectiveCoachConceptState(b)]??0)
    );
  }

  function dedupeById(items){
    const ordered=[];
    const index=new Map();
    for(const raw of Array.isArray(items)?items:[]){
      const item=raw&&typeof raw==="object"?{...raw}:raw;
      if(item&&item.id!=null){
        const id=String(item.id);
        if(index.has(id)) ordered[index.get(id)]=item;
        else { index.set(id,ordered.length); ordered.push(item); }
      }else ordered.push(item);
    }
    return ordered;
  }

  function normalizeCoachData(raw){
    const src=raw&&typeof raw==="object"?raw:{};
    const out={version:1};
    for(const key of COACH_KEYS) out[key]=dedupeById(src[key]);
    return out;
  }

  function mergeCollection(localItems,coachItems){
    const out=[];
    const index=new Map();
    for(const item of Array.isArray(localItems)?localItems:[]){
      const clone=item&&typeof item==="object"?{...item}:item;
      if(clone&&clone.id!=null){index.set(String(clone.id),out.length);}
      out.push(clone);
    }
    for(const item of Array.isArray(coachItems)?coachItems:[]){
      const clone=item&&typeof item==="object"?{...item,_coachOwned:true}:item;
      if(clone&&clone.id!=null&&index.has(String(clone.id))){
        const i=index.get(String(clone.id));
        out[i]={...(out[i]||{}),...clone,_coachOwned:true};
      }else{
        if(clone&&clone.id!=null) index.set(String(clone.id),out.length);
        out.push(clone);
      }
    }
    return dedupeById(out);
  }

  function mergeCoachData(localState,coachData){
    const local=localState&&typeof localState==="object"?localState:{};
    const coach=normalizeCoachData(coachData);
    const merged={...local,coachVersion:coach.version};
    for(const key of COACH_KEYS) merged[key]=mergeCollection(local[key],coach[key]);
    return merged;
  }

  function localStateForPersistence(runtimeState){
    const src=runtimeState&&typeof runtimeState==="object"?runtimeState:{};
    const out={...src};
    for(const key of COACH_KEYS){
      out[key]=(Array.isArray(src[key])?src[key]:[])
        .filter(item=>!(item&&typeof item==="object"&&item._coachOwned))
        .map(item=>{
          if(!(item&&typeof item==="object")) return item;
          const clone={...item};
          delete clone._coachOwned;
          return clone;
        });
    }
    return out;
  }

  function problemTransferState(problem,retests,todayKey){
    const p=problem||{};
    if(p.deepDebrief===false||p.requiresDeepDebrief===false){
      return {status:"not_required",reason:"routine"};
    }
    const today=todayKey||new Date().toISOString().slice(0,10);
    const related=(Array.isArray(retests)?retests:[]).filter(r=>
      r&&(r.problemId===p.id||r.targetId===p.id||r.targetProblemId===p.id)
    );
    const passed=related.some(r=>{
      const result=r.status||r.result;
      return result==="passed";
    });
    if(p.transferStatus==="verified"||passed){
      return {status:"verified",reason:"delayed_transfer_evidence"};
    }
    const overdue=related.some(r=>{
      const result=r.status||r.result;
      const due=r.dueDate||r.nextRetestDate||r.date;
      return result!=="passed"&&due&&due<=today;
    });
    if(overdue) return {status:"overdue",reason:"retest_overdue"};
    return {status:"debt",reason:"no_independent_transfer_evidence"};
  }

  function buildStructureIndex(coachData){
    const data=coachData||{};
    const problems=Array.isArray(data.problems)?data.problems:[];
    const relations=Array.isArray(data.relations)?data.relations:[];
    const groups=new Map();

    function normalizeLabel(v){
      return String(v||"").trim().replace(/\s+/g," ").toLowerCase();
    }
    function relationFor(problemId,type){
      return relations.find(r=>r&&r.fromId===problemId&&r.type===type);
    }
    function add(key,label,p){
      if(!groups.has(key)){
        groups.set(key,{key,label,problems:[],modules:[],errorTypes:[],concepts:[],methods:[]});
      }
      const g=groups.get(key);
      g.problems.push(p);
      if(p.module&&!g.modules.includes(p.module)) g.modules.push(p.module);
      if(p.errorType&&!g.errorTypes.includes(p.errorType)) g.errorTypes.push(p.errorType);
      for(const c of Array.isArray(p.concepts)?p.concepts:[]) if(!g.concepts.includes(c)) g.concepts.push(c);
      for(const m of Array.isArray(p.methods)?p.methods:[]) if(!g.methods.includes(m)) g.methods.push(m);
    }

    for(const p of problems){
      const sr=relationFor(p.id,"problem_structure");
      const mr=relationFor(p.id,"problem_method");
      if(sr){
        add(sr.toId||"unclassified",sr.label||sr.toId||"待归类",p);
      }else if(p.structureId){
        add(String(p.structureId),p.structure||String(p.structureId),p);
      }else if(p.structure&&String(p.structure).trim()){
        add("structure:"+normalizeLabel(p.structure),String(p.structure).trim(),p);
      }else if(mr){
        add(mr.toId||"unclassified",mr.label||mr.toId||"待归类",p);
      }else{
        add("unclassified","待归类",p);
      }
    }
    return [...groups.values()];
  }

  function normalizeExamData(raw){
    const src=raw&&typeof raw==="object"?raw:{};
    return {
      version:1,
      papers:dedupeById(src.papers),
      structures:dedupeById(src.structures),
      opportunities:dedupeById(src.opportunities)
    };
  }

  function structureModuleMap(examData){
    const data=normalizeExamData(examData);
    const tally=new Map();
    for(const paper of data.papers){
      const w=Number(paper.recentWeight||1);
      for(const slot of Array.isArray(paper.slots)?paper.slots:[]){
        for(const sid of Array.isArray(slot.structures)?slot.structures:[]){
          if(!tally.has(sid)) tally.set(sid,new Map());
          const byModule=tally.get(sid);
          const module=slot.primary||"未分类";
          byModule.set(module,(byModule.get(module)||0)+Number(slot.score||0)*w);
        }
      }
    }
    const out={};
    for(const [sid,mods] of tally){
      out[sid]=[...mods.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||"未分类";
    }
    return out;
  }

  function averageAbility(ability,module){
    const arr=ability&&Array.isArray(ability[module])?ability[module]:[];
    if(!arr.length) return 0;
    return arr.reduce((a,b)=>a+Number(b||0),0)/arr.length;
  }

  function computeExamDebts(context){
    const ctx=context||{};
    const exam=normalizeExamData(ctx.examData);
    const modulesByStructure=structureModuleMap(exam);
    const problems=Array.isArray(ctx.problems)?ctx.problems:[];
    const retests=Array.isArray(ctx.retests)?ctx.retests:[];
    const attempts=Array.isArray(ctx.fastPathAttempts)?ctx.fastPathAttempts:[];
    const today=ctx.todayKey||new Date().toISOString().slice(0,10);
    const debts={coverage:[],transfer:[],speed:[],proof:[]};

    for(const opp of exam.opportunities){
      const sid=opp.structureId;
      const module=modulesByStructure[sid]||opp.module||"未分类";
      const common={
        structureId:sid,
        label:opp.label||sid,
        module,
        recentFrequency:Number(opp.recentFrequency||1),
        scoreOpportunity:Number(opp.pointOpportunity||0),
        priorityBase:Number(opp.priorityBase||0),
        kind:opp.kind||"mixed"
      };
      const avg=averageAbility(ctx.ability,module);
      if(avg<4){
        debts.coverage.push({...common,severity:4-avg});
      }

      const related=problems.filter(p=>
        p&&(p.structureId===sid||(Array.isArray(p.structures)&&p.structures.includes(sid)))
      );
      if(related.length&&related.some(p=>problemTransferState(p,retests,today).status!=="verified")){
        debts.transfer.push({...common,severity:1});
      }

      if(opp.kind==="fill"){
        const xs=attempts.filter(a=>a&&a.structureId===sid);
        const last=xs[xs.length-1];
        if(last&&last.correct===true&&(Number(last.recognitionSeconds||0)>20||Number(last.solveSeconds||0)>180)){
          debts.speed.push({...common,severity:1,recognitionSeconds:Number(last.recognitionSeconds||0),solveSeconds:Number(last.solveSeconds||0)});
        }
      }

      const proofLike=sid==="proof_construction"||/证明|构造/.test(String(opp.label||""));
      if(proofLike){
        const dim=ctx.ability&&Array.isArray(ctx.ability[module])?Number(ctx.ability[module][4]||0):0;
        const proofFailure=related.some(p=>p.errorType==="证明链断裂"||p.errorType==="proof_chain_failure");
        if(dim<4||proofFailure) debts.proof.push({...common,severity:Math.max(1,4-dim)});
      }
    }
    return debts;
  }

  function buildExamMatrix(examData){
    const data=normalizeExamData(examData);
    const structures=data.structures.map(s=>({id:s.id,name:s.name||s.id}));
    return structures.map(s=>({
      ...s,
      editions:data.papers.map(p=>({
        edition:p.edition,
        present:(Array.isArray(p.slots)?p.slots:[]).some(slot=>Array.isArray(slot.structures)&&slot.structures.includes(s.id))
      }))
    }));
  }

  function rankExamDrivenActions(context){
    const debts=computeExamDebts(context);
    const actions=[];
    for(const d of debts.coverage){
      actions.push({
        type:"coverage_debt",id:d.structureId,label:"覆盖债："+d.label,
        score:40+d.scoreOpportunity*2+d.recentFrequency*4+d.priorityBase,
        reasons:["recent_exam_frequency","coverage_gap","score_opportunity"]
      });
    }
    for(const d of debts.speed){
      actions.push({
        type:"speed_debt",id:d.structureId,label:"速度债："+d.label,
        score:45+d.scoreOpportunity*2+d.recentFrequency*4,
        reasons:["fill_fast_path","slow_recognition"]
      });
    }
    for(const d of debts.proof){
      actions.push({
        type:"proof_debt",id:d.structureId,label:"证明债："+d.label,
        score:48+d.scoreOpportunity*2+d.recentFrequency*4,
        reasons:["proof_startup","recent_exam_frequency"]
      });
    }
    return actions.sort((a,b)=>b.score-a.score);
  }

  function rankNextActions(context){
    const ctx=context||{};
    const today=ctx.todayKey||new Date().toISOString().slice(0,10);
    const problems=Array.isArray(ctx.problems)?ctx.problems:[];
    const concepts=Array.isArray(ctx.concepts)?ctx.concepts:[];
    const retests=Array.isArray(ctx.retests)?ctx.retests:[];
    const actions=rankExamDrivenActions(ctx);
    const byProblem=new Map(problems.map(p=>[p.id,p]));

    for(const r of retests){
      if(!r||((r.status||r.result)==="passed")) continue;
      const pid=r.problemId||r.targetProblemId||r.targetId;
      const p=byProblem.get(pid)||{};
      const due=r.dueDate||r.date||r.nextRetestDate;
      const overdue=!!(due&&due<=today);
      const exam=Number(p.examValue||5);
      actions.push({
        type:"retest",id:r.id||pid,label:"复测："+(p.title||pid||"待复测题"),
        score:30+exam*5+(overdue?40:15),
        reasons:[overdue?"overdue":"scheduled_retest",exam>=8?"high_exam_value":"retention_risk"].filter(Boolean)
      });
    }

    for(const p of problems){
      const t=problemTransferState(p,retests,today);
      if(t.status==="debt"||t.status==="overdue"){
        const exam=Number(p.examValue||5);
        actions.push({
          type:"transfer_debt",id:p.id,label:"迁移验证："+(p.title||p.id),
          score:exam*7+(t.status==="overdue"?20:10),
          reasons:["unverified_transfer",exam>=8?"high_exam_value":"transfer_leverage"]
        });
      }
    }

    for(const c of concepts){
      const s=effectiveCoachConceptState(c);
      const score=s==="unknown"?48:(s==="forming"?34:5);
      actions.push({
        type:"concept",id:c.id,label:"概念去雾："+(c.name||c.id),
        score,reasons:[s==="unknown"?"concept_unknown":(s==="forming"?"concept_forming":"concept_stable")]
      });
    }

    const methodStats=new Map();
    for(const p of problems){
      if(p.errorType!=="方法识别失败"&&p.errorType!=="method_recognition_failure") continue;
      for(const m of Array.isArray(p.methods)?p.methods:[]){
        const row=methodStats.get(m)||{count:0,maxExam:0};
        row.count+=1; row.maxExam=Math.max(row.maxExam,Number(p.examValue||5));
        methodStats.set(m,row);
      }
    }
    for(const [m,row] of methodStats){
      actions.push({
        type:"method_recognition",id:m,label:"方法识别专项："+m,
        score:42+row.count*16+row.maxExam*3,
        reasons:[row.count>=2?"repeated_recognition_failure":"recognition_failure","known_but_not_triggered"]
      });
    }

    actions.push({
      type:"phase_progression",id:String(ctx.phase||"current"),label:(ctx.phase||"当前阶段")+"主线推进",
      score:25,reasons:["phase_progression"]
    });

    return actions.sort((a,b)=>b.score-a.score);
  }

  function learningStage(module,concepts,problems,retests){
    const cs=(Array.isArray(concepts)?concepts:[]).filter(c=>c&&c.module===module);
    const ps=(Array.isArray(problems)?problems:[]).filter(p=>p&&p.module===module);
    if(!cs.length&&!ps.length) return "未建立框架";
    if(!cs.length||cs.some(c=>effectiveCoachConceptState(c)!=="independently_callable")) return "正在理解";
    const competitionReady=ps.some(p=>
      Number(p.examValue||0)>=7 &&
      problemTransferState(p,retests||[]).status==="verified"
    );
    return competitionReady?"可竞赛调用":"可基础调用";
  }

  function eveningOralState(coachSessions,dateKey){
    const sessions=(Array.isArray(coachSessions)?coachSessions:[])
      .filter(s=>s&&s.type==="evening_oral"&&s.date===dateKey);
    if(!sessions.length){
      return {status:"not_started",findings:[],tomorrowFirstTask:"",session:null};
    }
    const latest=sessions[sessions.length-1];
    return {
      status:latest.status||"in_progress",
      findings:Array.isArray(latest.findings)?latest.findings:[],
      tomorrowFirstTask:latest.tomorrowFirstTask||"",
      session:latest
    };
  }

  return {
    effectiveMastery,reviewCompleteness,shouldForceMathStart,addParkingItem,rankConcepts,
    effectiveCoachConceptState,rankCoachConcepts,
    normalizeCoachData,mergeCoachData,localStateForPersistence,problemTransferState,buildStructureIndex,rankNextActions,
    normalizeExamData,computeExamDebts,buildExamMatrix,rankExamDrivenActions,
    learningStage,eveningOralState
  };
});
