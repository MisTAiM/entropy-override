import { useState, useRef } from "react";
import { getSettings, saveSettings, resetSettings } from "../hooks/useSettings";

const mono   = "'Courier Prime','Courier New',monospace";
const barlow = "'Barlow Condensed','Arial Narrow',sans-serif";

const S = {
  overlay: { position:"fixed",inset:0,overflow:"auto",background:"rgba(0,0,0,0.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)" },
  box: { background:"#060606",border:"1px solid #1E1E1E",boxShadow:"0 0 80px rgba(185,28,28,0.15)",width:"880px",maxWidth:"96vw",maxHeight:"90vh",display:"flex",flexDirection:"column",position:"relative",fontFamily:mono,color:"#F0EDE5",overflow:"hidden" },
  topBar: { height:"3px",background:"linear-gradient(90deg,#B91C1C 0%,#C9A227 50%,#B91C1C 100%)",flexShrink:0 },
  header: { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px 14px",borderBottom:"1px solid #141414",flexShrink:0 },
  body: { display:"flex",flex:1,overflow:"hidden" },
  sidebar: { width:"min(160px,30vw)",background:"#040404",borderRight:"1px solid #141414",flexShrink:0,overflowY:"auto",padding:"12px 0" },
  content: { flex:1,overflowY:"auto",padding:"16px 14px",minWidth:0,wordBreak:"break-word" },
  label: { fontSize:"9px",letterSpacing:"3px",color:"#444",display:"block",marginBottom:"7px",fontFamily:barlow,fontWeight:700,textTransform:"uppercase" },
  input: { width:"100%",background:"#0C0C0C",border:"1px solid #1E1E1E",borderBottom:"1px solid #2A2A2A",color:"#F0EDE5",padding:"8px 10px",fontSize:"12px",fontFamily:mono,outline:"none",boxSizing:"border-box" },
  textarea: { width:"100%",background:"#0C0C0C",border:"1px solid #1E1E1E",color:"#F0EDE5",padding:"10px",fontSize:"11px",fontFamily:mono,outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:"72px" },
  btn: (v="primary",sm=false)=>({ background:v==="primary"?"#B91C1C":v==="green"?"#166534":v==="danger"?"#7F1D1D":"#111", border:v==="primary"||v==="green"||v==="danger"?"none":"1px solid #222", color:"#F0EDE5", padding:sm?"5px 12px":"9px 20px", cursor:"pointer",fontFamily:barlow,fontSize:sm?"9px":"10px",letterSpacing:"3px",fontWeight:900,transition:"opacity 0.15s",whiteSpace:"nowrap" }),
  row: { marginBottom:16 },
  sep: { borderTop:"1px solid #141414",margin:"20px 0" },
  chip: (on)=>({ display:"inline-block",padding:"4px 10px",background:on?"#B91C1C22":"#111",border:`1px solid ${on?"#B91C1C":"#222"}`,color:on?"#F0EDE5":"#555",fontSize:"9px",letterSpacing:"2px",fontWeight:900,cursor:"pointer",fontFamily:barlow,userSelect:"none",transition:"all 0.12s" }),
  swatch: (color,selected)=>({ width:22,height:22,background:color,cursor:"pointer",border:`2px solid ${selected?"#F0EDE5":"transparent"}`,flexShrink:0 }),
};

function SectionTitle({children}) {
  return <div style={{fontSize:"9px",letterSpacing:"4px",color:"#B91C1C",fontWeight:900,fontFamily:barlow,marginBottom:14,paddingBottom:8,borderBottom:"1px solid #141414"}}>{children}</div>;
}
function Lbl({children}) { return <label style={S.label}>{children}</label>; }
function Row({label,children,hint}) {
  return <div style={S.row}>{label&&<Lbl>{label}</Lbl>}{children}{hint&&<div style={{fontSize:"9px",color:"#2A2A2A",marginTop:4,fontFamily:barlow,letterSpacing:1}}>{hint}</div>}</div>;
}
function Slider({label,value,min,max,unit="",step=1,onChange}) {
  return (
    <div style={S.row}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><Lbl>{label}</Lbl><span style={{fontSize:"11px",color:"#B91C1C",fontFamily:mono,fontWeight:700}}>{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:"#B91C1C",cursor:"pointer"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"#2A2A2A",fontFamily:mono,marginTop:2}}><span>{min}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );
}
function Toggle({label,value,onChange,hint}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div><div style={{fontSize:"9px",letterSpacing:"2px",color:"#888",fontFamily:barlow,fontWeight:700}}>{label}</div>{hint&&<div style={{fontSize:"9px",color:"#2A2A2A",fontFamily:barlow,letterSpacing:1,marginTop:1}}>{hint}</div>}</div>
      <div onClick={()=>onChange(!value)} style={{width:36,height:20,background:value?"#B91C1C":"#151515",border:`1px solid ${value?"#B91C1C":"#252525"}`,borderRadius:10,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0,marginLeft:12}}>
        <div style={{position:"absolute",top:2,left:value?16:2,width:14,height:14,background:"#F0EDE5",borderRadius:"50%",transition:"left 0.2s"}}/>
      </div>
    </div>
  );
}
function ColorRow({label,value,onChange,presets=[]}) {
  return (
    <div style={S.row}>
      <Lbl>{label}</Lbl>
      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
        {presets.map(p=><div key={p} style={S.swatch(p,value===p)} onClick={()=>onChange(p)} title={p}/>)}
        <input type="color" value={value} onChange={e=>onChange(e.target.value)} style={{width:22,height:22,border:"none",background:"none",cursor:"pointer",padding:0,flexShrink:0}}/>
        <input style={{...S.input,flex:1,minWidth:80,fontSize:"11px",padding:"5px 8px"}} value={value} onChange={e=>onChange(e.target.value)} spellCheck={false}/>
      </div>
    </div>
  );
}
function Toast({msg}) {
  if(!msg) return null;
  return <div style={{position:"fixed",bottom:28,right:28,background:"#0D0D0D",border:"1px solid #B91C1C",padding:"9px 20px",fontFamily:barlow,fontSize:"9px",letterSpacing:"3px",color:"#F0EDE5",zIndex:10000,boxShadow:"0 0 20px rgba(185,28,28,0.3)"}}>{msg}</div>;
}

// ── TABS ─────────────────────────────────────────────────────────────────────

function AppearanceTab({cfg,set}) {
  return (
    <div>
      <SectionTitle>ACCENT COLORS</SectionTitle>
      <ColorRow label="PRIMARY ACCENT" value={cfg.accentColor} onChange={v=>set({accentColor:v})}
        presets={["#B91C1C","#DC2626","#EF4444","#7C3AED","#2563EB","#059669","#D97706","#EC4899"]}/>
      <ColorRow label="SECONDARY / GOLD" value={cfg.goldColor} onChange={v=>set({goldColor:v})}
        presets={["#C9A227","#D97706","#EAB308","#F59E0B","#B45309","#FBBF24"]}/>

      <div style={S.sep}/>
      <SectionTitle>BACKGROUND & TEXT</SectionTitle>
      <ColorRow label="APP BACKGROUND" value={cfg.bgColor} onChange={v=>set({bgColor:v})}
        presets={["#080808","#050505","#0D0D0D","#0A0A0A","#111111","#06080F","#07100A"]}/>
      <ColorRow label="CARD BACKGROUND" value={cfg.cardBg} onChange={v=>set({cardBg:v})}
        presets={["#0D0D0D","#111111","#0F0F0F","#141414","#090909"]}/>
      <ColorRow label="TEXT COLOR" value={cfg.textColor} onChange={v=>set({textColor:v})}
        presets={["#F0EDE5","#FFFFFF","#E5E5E5","#D4D4D4","#F5F3EF"]}/>

      <div style={S.sep}/>
      <SectionTitle>TYPOGRAPHY & LAYOUT</SectionTitle>
      <Slider label="FONT SCALE" value={cfg.fontScale} min={80} max={130} unit="%" onChange={v=>set({fontScale:v})}/>
      <Slider label="SIDEBAR WIDTH" value={cfg.sidebarWidth} min={180} max={420} unit="px" onChange={v=>set({sidebarWidth:v})}/>
      <Slider label="NAV HEIGHT" value={cfg.navHeight} min={32} max={72} unit="px" onChange={v=>set({navHeight:v})}/>
      <Slider label="CARD BORDER RADIUS" value={cfg.borderRadius} min={0} max={12} unit="px" onChange={v=>set({borderRadius:v})}/>
      <Slider label="CARD PADDING" value={cfg.cardPadding||20} min={10} max={40} unit="px" onChange={v=>set({cardPadding:v})}/>

      <div style={S.sep}/>
      <SectionTitle>BEHAVIOR</SectionTitle>
      <Row label="ANIMATION SPEED">
        <div style={{display:"flex",gap:6}}>{["none","slow","normal","fast"].map(s=><span key={s} style={S.chip(cfg.animSpeed===s)} onClick={()=>set({animSpeed:s})}>{s.toUpperCase()}</span>)}</div>
      </Row>
      <Toggle label="COMPACT MODE" hint="Reduces padding throughout the app" value={!!cfg.compactMode} onChange={v=>set({compactMode:v})}/>
      <Toggle label="SHOW SCROLLBAR" value={cfg.showScrollbar!==false} onChange={v=>set({showScrollbar:v})}/>

      <div style={S.sep}/>
      <SectionTitle>CUSTOM CSS INJECTION</SectionTitle>
      <Row hint="Injected globally — override any style">
        <textarea style={S.textarea} rows={5} value={cfg.customCSS||""} onChange={e=>set({customCSS:e.target.value})} placeholder="/* e.g. .home-hero { height: 500px !important; } */"/>
      </Row>
    </div>
  );
}

function BrandTab({cfg,set}) {
  return (
    <div>
      <SectionTitle>LOGOTYPE TEXT</SectionTitle>
      <Row label="MAIN TITLE (top line)"><input style={S.input} value={cfg.logoTitle||"ENTROPY"} onChange={e=>set({logoTitle:e.target.value})} maxLength={20}/></Row>
      <Row label="SUBTITLE / TAGLINE"><input style={S.input} value={cfg.logoSub||"OVERRIDE // TACTICS CODEX"} onChange={e=>set({logoSub:e.target.value})} maxLength={60}/></Row>

      <div style={S.sep}/>
      <SectionTitle>BRAND BAR ELEMENTS</SectionTitle>
      <Toggle label="BLINK STATUS DOT" hint="Green active indicator" value={cfg.showStatusDot!==false} onChange={v=>set({showStatusDot:v})}/>
      <Toggle label="CENTER RULE + GAME TITLE" value={cfg.showBrandRule!==false} onChange={v=>set({showBrandRule:v})}/>
      <Toggle label="GRADIENT TOP BORDER" value={cfg.showTopBorder!==false} onChange={v=>set({showTopBorder:v})}/>
      <Toggle label="LEFT ACCENT PILLAR" value={cfg.showLeftPillar!==false} onChange={v=>set({showLeftPillar:v})}/>

      <div style={S.sep}/>
      <SectionTitle>NAVIGATION</SectionTitle>
      <Row label="DEFAULT LANDING TAB">
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["home","HOME"],["builds","BUILDS"],["tactics","TACTICS"],["guide","GUIDE"]].map(([id,lbl])=>(
            <span key={id} style={S.chip(cfg.defaultTab===id)} onClick={()=>set({defaultTab:id})}>{lbl}</span>
          ))}
        </div>
      </Row>
      <Toggle label="SHOW NAV LABELS" hint="Hide text, keep nav bar" value={cfg.showNavLabels!==false} onChange={v=>set({showNavLabels:v})}/>

      <div style={S.sep}/>
      <SectionTitle>DEFAULT SELECTIONS</SectionTitle>
      <Row label="DEFAULT CHARACTER">
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {["hibiki","ragna","jin","kokonoe","es","noel","rachel","taokaka","lambda","mai","hazama","hakumen","bullet","naoto","icey","prisoner"].map(id=>(
            <span key={id} style={{...S.chip(cfg.defaultChar===id),marginBottom:4}} onClick={()=>set({defaultChar:id})}>{id.toUpperCase()}</span>
          ))}
        </div>
      </Row>
      <Row label="DEFAULT BUILD TAB">
        <div style={{display:"flex",gap:6}}>
          {["0","1","2"].map(i=><span key={i} style={S.chip(String(cfg.defaultBuild)===i)} onClick={()=>set({defaultBuild:Number(i)})}>BUILD {Number(i)+1}</span>)}
        </div>
      </Row>
    </div>
  );
}

function ContentTab({cfg,set}) {
  const sections = [
    ["showDPS",         "DPS CHART",               "Bar chart — Build Analyzer"],
    ["showRadar",       "RADAR / PROFILE CHART",   "Spider chart per build"],
    ["showMath",        "MATH SUMMARY BOX",         "DPS formula in build header"],
    ["showTalent",      "EVOTYPE TALENT CARD",      "Talent + Legacy skill card"],
    ["showLegacy",      "LEGACY SKILL",             "Legacy line inside talent card"],
    ["showSynergies",   "EVOTYPE SYNERGY CARDS",    "Top 3 synergy cards per char"],
    ["showMechanics",   "KEY MECHANICS GRID",       "4 mechanics per character"],
    ["showTips",        "MORPHEUS TIPS",            "3 tips per build"],
    ["showTierBadge",   "TIER BADGES (SIDEBAR)",    "S/A/B badge in sidebar list"],
    ["showCharArtwork", "CHAR ARTWORK (SIDEBAR)",   "Portrait at sidebar bottom"],
    ["showStatsBar",    "HOMEPAGE STATS BAR",       "163/16/48/38 stats strip"],
    ["showFeatureCards","HOMEPAGE FEATURE CARDS",   "7 tool cards on home page"],
    ["showRosterGrid",  "HOMEPAGE ROSTER GRID",     "16-char portrait grid on home"],
    ["showNavLabels",   "NAV LABELS",               "Hide text shows icon only"],
    ["showElementBadge","ELEMENT BADGES (TACTICS)", "Element tags on tactics list"],
  ];
  return (
    <div>
      <SectionTitle>SECTION VISIBILITY</SectionTitle>
      <div style={{fontSize:"9px",color:"#2A2A2A",fontFamily:barlow,letterSpacing:1,marginBottom:16}}>TOGGLE WHICH SECTIONS RENDER THROUGHOUT THE APP</div>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        <button style={S.btn("dark",true)} onClick={()=>set(Object.fromEntries(sections.map(([k])=>[k,true])))}>SHOW ALL</button>
        <button style={S.btn("dark",true)} onClick={()=>set(Object.fromEntries(sections.map(([k])=>[k,false])))}>HIDE ALL</button>
      </div>
      {sections.map(([key,label,hint])=>(
        <Toggle key={key} label={label} hint={hint} value={cfg[key]!==false} onChange={v=>set({[key]:v})}/>
      ))}
    </div>
  );
}

function CharactersTab({cfg,set}) {
  const CHARS = [
    {id:"hibiki",name:"Hibiki Kohaku",color:"#7B8FE4"},{id:"ragna",name:"Ragna the Bloodedge",color:"#D93025"},
    {id:"jin",name:"Jin Kisaragi",color:"#4EA8D8"},{id:"kokonoe",name:"Kokonoe Mercury",color:"#E8714A"},
    {id:"es",name:"Es",color:"#E878A0"},{id:"noel",name:"Noel Vermillion",color:"#60A5FA"},
    {id:"rachel",name:"Rachel Alucard",color:"#D8B4FE"},{id:"taokaka",name:"Taokaka",color:"#FCD34D"},
    {id:"lambda",name:"Lambda-11",color:"#6EE7B7"},{id:"mai",name:"Mai Natsume",color:"#FB923C"},
    {id:"hazama",name:"Hazama",color:"#86EFAC"},{id:"hakumen",name:"Hakumen",color:"#F1F5F9"},
    {id:"bullet",name:"Bullet",color:"#F97316"},{id:"naoto",name:"Naoto Kurogane",color:"#F87171"},
    {id:"icey",name:"ICEY",color:"#A78BFA"},{id:"prisoner",name:"The Prisoner",color:"#94A3B8"},
  ];
  const hidden = cfg.hiddenChars||[];
  const toggle = id => set({hiddenChars: hidden.includes(id)?hidden.filter(x=>x!==id):[...hidden,id]});
  return (
    <div>
      <SectionTitle>ROSTER VISIBILITY</SectionTitle>
      <div style={{fontSize:"9px",color:"#2A2A2A",fontFamily:barlow,letterSpacing:1,marginBottom:12}}>HIDDEN CHARS REMOVED FROM SIDEBAR, ROSTER GRID, AND HOMEPAGE</div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <button style={S.btn("dark",true)} onClick={()=>set({hiddenChars:[]})}>SHOW ALL</button>
        <button style={S.btn("dark",true)} onClick={()=>set({hiddenChars:CHARS.map(c=>c.id)})}>HIDE ALL</button>
        <span style={{fontSize:"9px",color:"#333",fontFamily:barlow,letterSpacing:1,alignSelf:"center"}}>{hidden.length} HIDDEN</span>
      </div>
      {CHARS.map(c=>{
        const vis=!hidden.includes(c.id);
        return (
          <div key={c.id} onClick={()=>toggle(c.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",marginBottom:3,background:vis?"#0D0D0D":"#080808",border:`1px solid ${vis?c.color+"33":"#141414"}`,cursor:"pointer",transition:"all 0.12s"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:vis?c.color:"#252525",flexShrink:0,transition:"background 0.12s"}}/>
            <div style={{flex:1,fontSize:"10px",fontWeight:900,letterSpacing:1,color:vis?c.color:"#2A2A2A",fontFamily:barlow}}>{c.name.toUpperCase()}</div>
            <div style={{fontSize:"9px",letterSpacing:2,color:vis?"#22C55E":"#333",fontFamily:barlow,fontWeight:700}}>{vis?"VISIBLE":"HIDDEN"}</div>
          </div>
        );
      })}
    </div>
  );
}

function SystemTab({cfg,set,toast}) {
  const [newPw,setNewPw]=useState("");
  const [conf,setConf]=useState("");
  const [pwErr,setPwErr]=useState("");
  const fileRef=useRef();

  const exportCfg=()=>{
    const blob=new Blob([JSON.stringify(cfg,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="entropy-override-settings.json";
    a.click();
  };
  const importCfg=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{const d=JSON.parse(ev.target.result);set(d);toast("SETTINGS IMPORTED");}
      catch{toast("INVALID JSON");}
    };
    reader.readAsText(file);
  };
  const changePw=()=>{
    if(newPw.length<3){setPwErr("MIN 3 CHARS");return;}
    if(newPw!==conf){setPwErr("MISMATCH");return;}
    localStorage.setItem("eo-admin-pw",newPw);
    setPwErr("");setNewPw("");setConf("");
    toast("PASSWORD UPDATED");
  };

  return (
    <div>
      <SectionTitle>MAINTENANCE MODE</SectionTitle>
      <Toggle label="ENABLE MAINTENANCE MODE" hint="Shows a blocking overlay to all visitors" value={!!cfg.maintenanceMode} onChange={v=>set({maintenanceMode:v})}/>
      <Row label="MAINTENANCE MESSAGE"><input style={S.input} value={cfg.maintenanceMsg||""} onChange={e=>set({maintenanceMsg:e.target.value})}/></Row>

      <div style={S.sep}/>
      <SectionTitle>INTERNAL NOTES / CHANGELOG</SectionTitle>
      <Row hint="Not visible to users — personal log"><textarea style={S.textarea} rows={4} value={cfg.changelogText||""} onChange={e=>set({changelogText:e.target.value})} placeholder={"v4.1 — updated hibiki builds\nv4.0 — initial release"}/></Row>

      <div style={S.sep}/>
      <SectionTitle>DATA MANAGEMENT</SectionTitle>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <button style={S.btn("green",true)} onClick={exportCfg}>EXPORT JSON</button>
        <label style={{...S.btn("dark",true),cursor:"pointer"}}>
          IMPORT JSON
          <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={importCfg}/>
        </label>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button style={S.btn("dark",true)} onClick={()=>{resetSettings(["accentColor","goldColor","bgColor","cardBg","textColor","fontScale","sidebarWidth","navHeight","animSpeed","compactMode","borderRadius","cardPadding","customCSS","showScrollbar"]);toast("APPEARANCE RESET");}}>RESET APPEARANCE</button>
        <button style={S.btn("dark",true)} onClick={()=>{resetSettings(["showDPS","showRadar","showMath","showTips","showSynergies","showMechanics","showTalent","showLegacy","showTierBadge","showElementBadge","showCharArtwork","showStatsBar","showFeatureCards","showRosterGrid","hiddenChars"]);toast("CONTENT RESET");}}>RESET CONTENT</button>
        <button style={{...S.btn("dark",true),color:"#EF4444",borderColor:"#EF444422"}} onClick={()=>{if(!window.confirm("Reset ALL settings?"))return;resetSettings();toast("ALL SETTINGS RESET");}}>RESET ALL</button>
      </div>

      <div style={S.sep}/>
      <SectionTitle>CHANGE PASSWORD</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Row label="NEW PASSWORD"><input style={S.input} type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} autoComplete="new-password"/></Row>
        <Row label="CONFIRM"><input style={S.input} type="password" value={conf} onChange={e=>setConf(e.target.value)} onKeyDown={e=>e.key==="Enter"&&changePw()}/></Row>
      </div>
      {pwErr&&<div style={{color:"#EF4444",fontSize:"9px",letterSpacing:2,fontFamily:barlow,marginBottom:8,fontWeight:700}}>{pwErr}</div>}
      <button style={S.btn("primary",true)} onClick={changePw}>UPDATE PASSWORD</button>

      <div style={S.sep}/>
      <SectionTitle>SESSION INFO</SectionTitle>
      <div style={{fontSize:"10px",color:"#2A2A2A",fontFamily:mono,lineHeight:2.2}}>
        <div>SESSION: {new Date().toLocaleTimeString()}</div>
        <div>SETTINGS KEYS: {Object.keys(cfg).length}</div>
        <div>HIDDEN CHARS: {(cfg.hiddenChars||[]).length} / 16</div>
        <div>CUSTOM CSS: {cfg.customCSS?`${cfg.customCSS.length} chars`:"none"}</div>
        <div>ADMIN PW: {localStorage.getItem("eo-admin-pw")?"CUSTOM SET":"DEFAULT (8193)"}</div>
        <div>COMPACT MODE: {cfg.compactMode?"ON":"OFF"}</div>
        <div>DEFAULT TAB: {cfg.defaultTab||"home"}</div>
      </div>
    </div>
  );
}

function LoginForm({onLogin}) {
  const [user,setUser]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const attempt=()=>{
    const customPw=localStorage.getItem("eo-admin-pw")||"8193";
    if(user.toLowerCase()==="morpheus"&&pw===customPw){onLogin();}
    else{setErr("ACCESS DENIED");setTimeout(()=>setErr(""),1800);}
  };
  return (
    <div style={{padding:"40px 48px",maxWidth:400}}>
      <div style={{fontSize:"9px",letterSpacing:4,color:"#2A2A2A",marginBottom:28,fontFamily:barlow}}>AUTHORIZED PERSONNEL ONLY</div>
      <Row label="USERNAME"><input style={S.input} value={user} onChange={e=>setUser(e.target.value)} autoFocus onFocus={e=>e.target.style.borderBottomColor="#B91C1C"} onBlur={e=>e.target.style.borderBottomColor="#2A2A2A"}/></Row>
      <Row label="PASSWORD"><input style={{...S.input}} type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} onFocus={e=>e.target.style.borderBottomColor="#B91C1C"} onBlur={e=>e.target.style.borderBottomColor="#2A2A2A"}/></Row>
      {err&&<div style={{color:"#EF4444",fontSize:"9px",letterSpacing:3,margin:"8px 0 12px",fontFamily:barlow,fontWeight:900}}>{err}</div>}
      <div style={{marginTop:16}}><button style={S.btn("primary")} onClick={attempt}>AUTHENTICATE</button></div>
    </div>
  );
}

const TABS=[
  {id:"appearance",label:"APPEARANCE"},
  {id:"brand",label:"BRAND & NAV"},
  {id:"content",label:"CONTENT"},
  {id:"characters",label:"CHARACTERS"},
  {id:"system",label:"SYSTEM"},
];

export default function AdminPanel({show,onClose}) {
  const [authed,setAuthed]=useState(()=>sessionStorage.getItem("adminAuth")==="1");
  const [activeTab,setActiveTab]=useState("appearance");
  const [cfg,setCfg]=useState(()=>getSettings());
  const [toastMsg,setToast]=useState("");
  const [dirty,setDirty]=useState(false);

  const toast=msg=>{setToast(msg);setTimeout(()=>setToast(""),2200);};
  const set=partial=>{setCfg(prev=>({...prev,...partial}));setDirty(true);};
  const login=()=>{sessionStorage.setItem("adminAuth","1");setAuthed(true);};
  const logout=()=>{sessionStorage.removeItem("adminAuth");setAuthed(false);};
  const save=()=>{saveSettings(cfg);setDirty(false);toast("✓ SAVED — CHANGES APPLIED");setCfg(getSettings());};
  const discard=()=>{setCfg(getSettings());setDirty(false);onClose();};

  if(!show) return null;
  return (
    <>
      <style>{`.ap-tab:hover{background:#0F0F0F!important;color:#777!important}.ap-tab.on{background:#111!important;color:#F0EDE5!important;border-left:2px solid #B91C1C!important}`}</style>
      <div style={S.overlay} onClick={e=>{if(e.target===e.currentTarget)discard();}}>
        <div style={S.box}>
          <div style={S.topBar}/>
          <div style={S.header}>
            <div>
              <div style={{fontSize:"13px",letterSpacing:"4px",color:"#B91C1C",fontWeight:900,fontFamily:barlow}}>ADMIN PANEL</div>
              <div style={{fontSize:"9px",letterSpacing:"2px",color:"#2A2A2A",marginTop:2,fontFamily:barlow}}>ENTROPY OVERRIDE — MORPHEUS ACCESS</div>
            </div>
            {authed&&(
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {dirty&&<span style={{fontSize:"9px",color:"#C9A227",letterSpacing:2,fontFamily:barlow,fontWeight:700}}>● UNSAVED</span>}
                <button style={S.btn("primary",true)} onClick={save}>SAVE ALL</button>
                <button style={S.btn("dark",true)} onClick={discard}>CLOSE</button>
                <button style={{...S.btn("dark",true),color:"#444"}} onClick={logout}>LOGOUT</button>
              </div>
            )}
          </div>

          {!authed?(
            <LoginForm onLogin={login}/>
          ):(
            <div style={S.body}>
              <div style={S.sidebar}>
                {TABS.map(t=>(
                  <button key={t.id} className={`ap-tab${activeTab===t.id?" on":""}`} onClick={()=>setActiveTab(t.id)}
                    style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",borderLeft:"2px solid transparent",color:"#2A2A2A",padding:"11px 16px",fontSize:"9px",letterSpacing:"3px",fontWeight:900,cursor:"pointer",fontFamily:barlow}}>
                    {t.label}
                  </button>
                ))}
                <div style={{borderTop:"1px solid #141414",margin:"12px 0"}}/>
                <div style={{padding:"0 14px",fontSize:"9px",color:"#1A1A1A",fontFamily:barlow,letterSpacing:1,lineHeight:2.2}}>
                  <div>CLICK BANNER</div><div>5× TO OPEN</div>
                </div>
              </div>
              <div style={S.content}>
                {activeTab==="appearance" &&<AppearanceTab cfg={cfg} set={set}/>}
                {activeTab==="brand"      &&<BrandTab      cfg={cfg} set={set}/>}
                {activeTab==="content"    &&<ContentTab    cfg={cfg} set={set}/>}
                {activeTab==="characters" &&<CharactersTab cfg={cfg} set={set}/>}
                {activeTab==="system"     &&<SystemTab     cfg={cfg} set={set} toast={toast}/>}
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast msg={toastMsg}/>
    </>
  );
}
