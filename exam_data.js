window.CMC_EXAM_DATA = {
  version: 1,
  generatedAt: "2026-10-08",
  papers: [
    {
      id: "cmc15-nonmath-a", edition: 15, category: "非数学A", recentWeight: 1,
      sourceUrl: "https://www.cmathc.org.cn/stxz/236.html",
      sourceTier: "competition-site", scoreTotal: 100, durationMinutes: 150,
      slots: [
        {id:"15-f1",type:"fill",score:6,primary:"极限与连续",structures:["local_asymptotic"],confidence:"paper-summary"},
        {id:"15-f2",type:"fill",score:6,primary:"一元微分",structures:["derivative_structure"],confidence:"paper-summary"},
        {id:"15-f3",type:"fill",score:6,primary:"多元微分",structures:["multivariable_chain"],confidence:"paper-summary"},
        {id:"15-f4",type:"fill",score:6,primary:"无穷级数",structures:["series_compression"],confidence:"paper-summary"},
        {id:"15-f5",type:"fill",score:6,primary:"向量与空间解析几何",structures:["spatial_vectorization"],confidence:"paper-summary"},
        {id:"15-l1",type:"long",score:14,primary:"常微分方程",structures:["ode_normalization"],confidence:"paper-summary"},
        {id:"15-l2",type:"long",score:14,primary:"多元积分",structures:["region_reconstruction","spatial_vectorization"],confidence:"paper-summary"},
        {id:"15-l3",type:"long",score:14,primary:"一元积分",structures:["local_asymptotic","integral_structure"],confidence:"paper-summary"},
        {id:"15-l4",type:"long",score:14,primary:"一元积分",structures:["proof_construction","integral_structure"],confidence:"paper-summary"},
        {id:"15-l5",type:"long",score:14,primary:"无穷级数",structures:["series_compression"],confidence:"paper-summary"}
      ]
    },
    {
      id: "cmc16-nonmath-a", edition: 16, category: "非数学A", recentWeight: 1,
      sourceUrl: "https://www.cmathc.org.cn/csst/89.html",
      sourceTier: "competition-site", scoreTotal: 100, durationMinutes: 150,
      slots: [
        {id:"16-f1",type:"fill",score:6,primary:"一元积分",structures:["integral_structure"],confidence:"verified-page"},
        {id:"16-f2",type:"fill",score:6,primary:"多元积分",structures:["local_asymptotic","region_reconstruction"],confidence:"verified-page"},
        {id:"16-f3",type:"fill",score:6,primary:"多元微分",structures:["multivariable_chain"],confidence:"verified-page"},
        {id:"16-f4",type:"fill",score:6,primary:"向量与空间解析几何",structures:["spatial_vectorization"],confidence:"verified-page"},
        {id:"16-f5",type:"fill",score:6,primary:"曲线曲面积分与三大公式",structures:["symmetry_reduction"],confidence:"verified-page"},
        {id:"16-l1",type:"long",score:14,primary:"常微分方程",structures:["ode_normalization"],confidence:"paper-summary"},
        {id:"16-l2",type:"long",score:14,primary:"一元微分",structures:["derivative_structure"],confidence:"paper-summary"},
        {id:"16-l3",type:"long",score:14,primary:"曲线曲面积分与三大公式",structures:["symmetry_reduction","region_reconstruction"],confidence:"paper-summary"},
        {id:"16-l4",type:"long",score:14,primary:"一元微分",structures:["proof_construction","derivative_structure"],confidence:"paper-summary"},
        {id:"16-l5",type:"long",score:14,primary:"无穷级数",structures:["series_compression","proof_construction"],confidence:"paper-summary"}
      ]
    },
    {
      id: "cmc17-nonmath-a", edition: 17, category: "非数学A", recentWeight: 1,
      sourceUrl: "https://www.cmathc.org.cn/stxz/355.html",
      sourceTier: "competition-site", scoreTotal: 100, durationMinutes: 150,
      slots: [
        {id:"17-f1",type:"fill",score:6,primary:"极限与连续",structures:["local_asymptotic"],confidence:"verified-summary"},
        {id:"17-f2",type:"fill",score:6,primary:"向量与空间解析几何",structures:["spatial_vectorization"],confidence:"verified-summary"},
        {id:"17-f3",type:"fill",score:6,primary:"极限与连续",structures:["local_asymptotic","integral_structure"],confidence:"verified-summary"},
        {id:"17-f4",type:"fill",score:6,primary:"多元微分",structures:["multivariable_chain"],confidence:"verified-summary"},
        {id:"17-f5",type:"fill",score:6,primary:"曲线曲面积分与三大公式",structures:["symmetry_reduction"],confidence:"verified-summary"},
        {id:"17-l1",type:"long",score:14,primary:"一元微分",structures:["constraint_backsolve","integral_structure"],confidence:"verified-summary"},
        {id:"17-l2",type:"long",score:14,primary:"常微分方程",structures:["ode_normalization"],confidence:"verified-summary"},
        {id:"17-l3",type:"long",score:14,primary:"多元积分",structures:["region_reconstruction"],confidence:"verified-summary"},
        {id:"17-l4",type:"long",score:14,primary:"无穷级数",structures:["series_compression","proof_construction"],confidence:"verified-summary"},
        {id:"17-l5",type:"long",score:14,primary:"一元积分",structures:["proof_construction","integral_structure"],confidence:"verified-summary"}
      ]
    }
  ],
  structures: [
    {id:"local_asymptotic",name:"局部渐近与低阶消去",triggers:["极限","参数反求","低阶抵消","小区域"],fastPath:"先确定目标阶数，再只保留必要主项"},
    {id:"derivative_structure",name:"导数控制与中值结构",triggers:["存在ξ","单调","极值","导数约束"],fastPath:"从目标式反推辅助函数或中值定理"},
    {id:"integral_structure",name:"积分性质与变上限结构",triggers:["对称区间","变上限","积分约束","估计"],fastPath:"先查对称、换元、分部积分和微积分基本定理"},
    {id:"ode_normalization",name:"微分方程标准化",triggers:["y'","复合变量","Bernoulli","齐次"],fastPath:"先换元暴露标准型，再求解"},
    {id:"spatial_vectorization",name:"空间几何向量化",triggers:["平面","直线","垂直","投影","切平面"],fastPath:"先写法向量/方向向量，再做代数约束"},
    {id:"multivariable_chain",name:"多元链式与隐函数传播",triggers:["复合偏导","隐函数","二阶偏导"],fastPath:"先画依赖链，隐函数优先直接求导"},
    {id:"region_reconstruction",name:"积分区域重构与换坐标",triggers:["多重积分","边界曲面","换序","柱球坐标"],fastPath:"先画/写区域，再选最简坐标与次序"},
    {id:"symmetry_reduction",name:"对称降维与积分变换",triggers:["对称区间","球面","闭曲线","sin/cos互换"],fastPath:"先找对称变换，再决定 Green/Gauss/Stokes 或直接积分"},
    {id:"series_compression",name:"级数压缩与比较",triggers:["收敛性","递推","乘积项","幂级数"],fastPath:"先找比较对象、递推压缩或几何级数上界"},
    {id:"proof_construction",name:"证明与构造启动",triggers:["证明存在","不等式","正性","等号条件"],fastPath:"先明确要构造的零点/单调量/非负量"},
    {id:"constraint_backsolve",name:"多约束反推未知量",triggers:["极限+积分","初值+积分","多个条件确定函数"],fastPath:"把每个条件转成独立方程，再联立"}
  ],
  opportunities: [
    {id:"opp-ode",structureId:"ode_normalization",label:"常微分方程大题",recentFrequency:3,pointOpportunity:14,kind:"long",priorityBase:10},
    {id:"opp-series",structureId:"series_compression",label:"级数/数列高价值题",recentFrequency:3,pointOpportunity:14,kind:"long",priorityBase:10},
    {id:"opp-proof",structureId:"proof_construction",label:"证明/构造压轴",recentFrequency:3,pointOpportunity:14,kind:"long",priorityBase:10},
    {id:"opp-multi",structureId:"multivariable_chain",label:"多元微分填空",recentFrequency:3,pointOpportunity:6,kind:"fill",priorityBase:8},
    {id:"opp-space",structureId:"spatial_vectorization",label:"空间解析几何填空",recentFrequency:3,pointOpportunity:6,kind:"fill",priorityBase:8},
    {id:"opp-region",structureId:"region_reconstruction",label:"多重积分/区域重构",recentFrequency:3,pointOpportunity:14,kind:"mixed",priorityBase:9},
    {id:"opp-sym",structureId:"symmetry_reduction",label:"曲线曲面积分与对称",recentFrequency:2,pointOpportunity:10,kind:"mixed",priorityBase:8},
    {id:"opp-local",structureId:"local_asymptotic",label:"极限/Taylor/局部渐近",recentFrequency:3,pointOpportunity:6,kind:"fill",priorityBase:7},
    {id:"opp-integral",structureId:"integral_structure",label:"积分性质与变上限",recentFrequency:3,pointOpportunity:10,kind:"mixed",priorityBase:8}
  ]
};
