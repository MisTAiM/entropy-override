import React, { useState, useRef } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const DEFAULT_CHARS = [
  { id:"hibiki",   name:"Hibiki",   img:"/chars/hibiki.png",   color:"#7B8FE4", note:"Clone proc tripling + back-attack = S-tier ceiling. All 3 clones inherit every tactic proc simultaneously. Highest Exhilaration rate in roster." },
  { id:"ragna",    name:"Ragna",    img:"/chars/ragna.png",    color:"#D93025", note:"Blood Kain sub-50% is the strongest single threshold multiplier. Blood Scythe group heal sustains indefinitely — self-funding HP loop." },
  { id:"jin",      name:"Jin",      img:"/chars/jin.png",      color:"#4EA8D8", note:"Double Cold stack = permanent slow field. Best partner enabler. Every archetype benefits from Cold control — Magatama, Drive, Clone all love frozen targets." },
  { id:"kokonoe",  name:"Kokonoe",  img:"/chars/kokonoe.png",  color:"#E8714A", note:"Aerial safety is uniquely unkillable positioning. Missile Rain 10 proj = 2800 per cast at close range. Never on the ground = never in danger." },
  { id:"es",       name:"Es",       img:"/chars/es.png",       color:"#E878A0", note:"Mine bounce from aerial: 3+ detonations per string. Crest field generates autonomous Exhilaration stacks without active input." },
  { id:"noel",     name:"Noel",     img:"/chars/noel.png",     color:"#60A5FA", note:"Drive 9 hits/sec = fastest solo Exhilaration stacker. Universal partner — compatible with every fusion in the game." },
  { id:"rachel",   name:"Rachel",   img:"/chars/rachel.png",   color:"#D8B4FE", note:"Bat Chain Lightning is fully autonomous DPS. Best summon-type passive in the game — Summon Booster turns her into a hands-free S-tier." },
  { id:"taokaka",  name:"Taokaka",  img:"/chars/taokaka.png",  color:"#FCD34D", note:"Infinite dodge + 11 hits/sec = Exhilaration cap in 20s. Fastest kill chain speed in the roster. Speed Demon makes each room faster than the last." },
  { id:"lambda",   name:"Lambda",   img:"/chars/lambda.png",   color:"#6EE7B7", note:"4 autonomous swords copy tactic procs independently. Respawn Double = permanent field with zero upkeep. Summon Booster turns 4 swords into a second character." },
  { id:"mai",      name:"Mai",      img:"/chars/mai.png",      color:"#FB923C", note:"8 needles per cast = finest HP management tool in the game. 32 sword proc events when fused with Lambda. Most precise threshold management." },
  { id:"hazama",   name:"Hazama",   img:"/chars/hazama.png",   color:"#86EFAC", note:"Chain whip hits 3-5 targets simultaneously. Strongest passive damage dealer — DoT attrition engine. 1300+/s passive with zero player input on grouped enemies." },
  { id:"hakumen",  name:"Hakumen",  img:"/chars/hakumen.png",  color:"#F1F5F9", note:"Magatama × 2 + Legacy Amplifier = highest single-hit burst in roster. Counter timing is learnable — once mastered, the highest damage ceiling of any char." },
  { id:"bullet",   name:"Bullet",   img:"/chars/bullet.png",   color:"#F97316", note:"Steel Shell adds 3 effective HP bars. Drive + Defensive Combo = safest CQC archetype. Survives entropy 70+ with correct crystal picks." },
  { id:"naoto",    name:"Naoto",    img:"/chars/naoto.png",    color:"#F87171", note:"Hunter's Eye execute at 30% — Blood Pact × Fatal Blow × Focus crit = highest burst multiplier stack. 7.4× peak execute spike." },
  { id:"icey",     name:"ICEY",     img:"/chars/icey.png",     color:"#A78BFA", note:"Dance invincibility = 0 damage during attack animation. Full offensive + full defensive simultaneously. No other char achieves both." },
  { id:"prisoner", name:"Prisoner", img:"/chars/prisoner.png", color:"#94A3B8", note:"Weapon variety means no bad runs — any weapon triggers all tactic procs equally. Roll invincibility covers all gaps. Best run-consistency of any char." },
];

const DEFAULT_TACTICS = [
  { id:"t-shadow",    name:"Shadow Spike",    slot:"Attack",  elem:"umbra",    val:"275/hit",    note:"S-tier on clone chars — Hibiki triple procs. Universal on any build. Never a bad pick. Always chooses itself." },
  { id:"t-atkcold",   name:"Attack Cold",     slot:"Attack",  elem:"ice",      val:"+46% ATK",   note:"Permanent +46% attack is the strongest flat multiplier in Attack slot. Enables Frost Burst. Best Attack tactic in the game." },
  { id:"t-burn",      name:"Attack Burn",     slot:"Attack",  elem:"fire",     val:"260 DoT/s",  note:"260/s stacking DoT per hit on multiple targets. Hazama chain whip applies to 3-5 simultaneously = 1300 passive/s." },
  { id:"t-chainlit",  name:"Chain Lightning", slot:"Attack",  elem:"electric", val:"295×3",      note:"295 × 3 enemies per proc. Rachel bats proc this autonomously — hands-free AoE coverage on any enemy group." },
  { id:"t-skcold",    name:"Skill Cold",      slot:"Skill",   elem:"ice",      val:"+47% Skill",  note:"47% on all skills at Legendary. Jin double-stack with Attack Cold = strongest tactic pairing in the game." },
  { id:"t-skburn",    name:"Skill Burn",      slot:"Skill",   elem:"fire",     val:"360 DoT/s",  note:"Higher DoT rate than Attack Burn. Mai needle volleys stack this fast. Good on skill-heavy rotations." },
  { id:"t-lightsp",   name:"Light Spear",     slot:"Skill",   elem:"light",    val:"490/hit",    note:"490 flat on skill use. Legacy Amplifier makes it 735. Hakumen Magatama multiplies further. Universal boss damage." },
  { id:"t-fireproj",  name:"Fire Projectile", slot:"Skill",   elem:"fire",     val:"280×10",     note:"2800 at point blank. Kokonoe aerial fires all 10 into one target. Best burst Skill tactic in the game." },
  { id:"t-mine",      name:"Place Mine",      slot:"Skill",   elem:"fire",     val:"570/mine",   note:"Es exclusive — aerial bounce triggers 3+ mines per string = 1710 burst. Nearly worthless on other characters." },
  { id:"t-spirit",    name:"Fire Spirit",     slot:"Skill",   elem:"fire",     val:"190/hit",    note:"Autonomous spirit. Decent passive filler — lower priority than Field Turret and Fire Projectile in Skill slot." },
  { id:"t-thunderb",  name:"Thunderbolt",     slot:"Dash",    elem:"light",    val:"325/dash",   note:"Movement becomes offense. Clone chars triple-proc on every dodge. Best Dash tactic — movement slot that's never wasted." },
  { id:"t-dashshdw",  name:"Dash Shadow",     slot:"Dash",    elem:"umbra",    val:"200/dodge",  note:"200 on every dodge. Lower than Thunderbolt. Best on high-dodge chars when Thunderbolt is already in Attack slot." },
  { id:"t-bladeslsh", name:"Blade Slash",     slot:"Dash",    elem:"blade",    val:"220/dash",   note:"Physical proc on dash. No element synergy. Filler when no element-specific dash available. Rarely optimal." },
  { id:"t-lightsp2",  name:"Light Spear",     slot:"Legacy",  elem:"light",    val:"490/hit",    note:"490 on legacy use. Legacy Amplifier: 735. Hakumen Magatama × Legacy Amp = 1470 per hit. S-tier Legacy slot." },
  { id:"t-blackhole", name:"Blackhole",       slot:"Legacy",  elem:"umbra",    val:"Full CC",    note:"Full-screen slow on legacy. Enables every other tactic to confirm safely. Zero direct damage — S-tier utility." },
  { id:"t-ringfire",  name:"Ring of Fire",    slot:"Legacy",  elem:"fire",     val:"770 burst",  note:"770 AoE burst on legacy. Ring of Fire Double = full-screen clear. Best pure-damage Legacy tactic." },
  { id:"t-icespike",  name:"Ice Spike",       slot:"Legacy",  elem:"ice",      val:"350 turret", note:"Respawn Double makes it a permanent auto-turret. Set and forget — best passive Legacy field option." },
  { id:"t-orb",       name:"Lightning Orb",   slot:"Summon",  elem:"electric", val:"245 DPS",    note:"Persistent autonomous field turret. Character-neutral and stackable. Best Summon tactic — never a wrong pick." },
  { id:"t-chainlit2", name:"Chain Lightning", slot:"Summon",  elem:"light",    val:"295×3",      note:"295 × 3 bounce per proc in Summon slot. Rachel bats proc this autonomously. Doubles chain lightning density." },
  { id:"t-frostbst",  name:"Frost Burst",     slot:"Summon",  elem:"ice",      val:"520 AoE",    note:"520 AoE at max Cold stacks. Jin reaches max stacks in 2 hits. Best room-clear Summon tactic on Cold builds." },
];

const DEFAULT_CRYSTALS = [
  { id:"c-exhil",    name:"Exhilaration",     cat:"UTILITY",  col:"#C9A227", note:"ALL damage scales with combo count — universal multiplier, caps at 250%. Goes in every serious build. No exceptions." },
  { id:"c-defcombo", name:"Defensive Combo",  cat:"SURVIVAL", col:"#F59E0B", note:"-80% damage received during attack strings. You're attacking almost always = nearly permanent damage reduction. Best survival crystal." },
  { id:"c-notdead",  name:"Not Dead Yet",     cat:"SURVIVAL", col:"#F59E0B", note:"Cheat death once + 70% HP restore. Most impactful single pick at entropy 70+. Run it every time — safety net for anything." },
  { id:"c-resonance",name:"Resonance",        cat:"UTILITY",  col:"#C9A227", note:"+40% tactic damage at Legendary. Multiplicative with all tactic sources simultaneously. Mandatory on any summon or multi-tactic build." },
  { id:"c-giant",    name:"Giant Slayer",     cat:"DAMAGE",   col:"#E53935", note:"+60% vs elites and bosses. Goes in every build that faces elites. No reason to leave this out — always worth the slot." },
  { id:"c-summon",   name:"Summon Booster",   cat:"ADVANCED", col:"#A78BFA", note:"+45% summon tactic damage. Rachel bats + Lambda swords + Hibiki clones all classified summon-type. Stacks multiplicatively with Resonance." },
  { id:"c-fatal",    name:"Fatal Blow",       cat:"UTILITY",  col:"#C9A227", note:"+75% crit damage at Legendary. Paired with Focus: 55% crit rate × 1.75 = consistent 1.41× expected multiplier. Both or neither." },
  { id:"c-focus",    name:"Focus",            cat:"UTILITY",  col:"#C9A227", note:"+25% crit rate at Legendary. Pair with Fatal Blow. One without the other is half the value — always stack them together." },
  { id:"c-legamp",   name:"Legacy Amplifier", cat:"ADVANCED", col:"#A78BFA", note:"+50% legacy damage. Hakumen Magatama × Legacy Amp × Light Spear = highest single-hit burst in game. Skip without a legacy focus." },
  { id:"c-straight", name:"Straightforward",  cat:"DAMAGE",   col:"#E53935", note:"+45% attack damage. Pure flat multiplier — always solid, never exceptional. Best filler when you need ATK scaling." },
  { id:"c-domain",   name:"Domination",       cat:"DAMAGE",   col:"#E53935", note:"+45% skill damage. Mirror of Straightforward for skill-heavy builds. Same tier, swap depending on primary damage source." },
  { id:"c-icef",     name:"Ice Fortune",      cat:"ECONOMY",  col:"#60B8D4", note:"Guarantees Cold Attack drop from first shop. Removes all Cold RNG — run on any Jin or Cold-dependent build." },
  { id:"c-chain",    name:"Chain Reaction",   cat:"ADVANCED", col:"#A78BFA", note:"+36% on 3 kills in 10s. Taokaka and Prisoner trigger this almost every room. Solid mid-tier — skip on slow killers." },
  { id:"c-combosrg", name:"Combo Surge",      cat:"DAMAGE",   col:"#E53935", note:"+5% ATK per 10 combo up to 250%. Similar to Exhilaration but ATK-only. Stack with Exhil on fast attackers for double scaling." },
  { id:"c-bloodpact",name:"Blood Pact",       cat:"ADVANCED", col:"#A78BFA", note:"+35% HP-cost ability damage. Naoto-exclusive value at full potential. Skip on all other characters." },
  { id:"c-apex",     name:"Apex Predator",    cat:"ADVANCED", col:"#A78BFA", note:"+35% at full HP. Hakumen counter restores HP making this consistent in his kit. Situational everywhere else." },
  { id:"c-vital",    name:"Vital Boost",      cat:"SURVIVAL", col:"#F59E0B", note:"+100% max HP. Doubles Blood Scythe heal effectiveness on Ragna. Situational elsewhere — skip unless running HP-cost builds." },
  { id:"c-phantom",  name:"Phantom Step",     cat:"ADVANCED", col:"#A78BFA", note:"Iframes on dash. Hibiki back-attack repositioning loves it. Skip on stationary or turret builds." },
  { id:"c-hunters",  name:"Hunter's Mark",    cat:"ADVANCED", col:"#A78BFA", note:"+30% from ALL sources on marked target — attacks, tactics, legacy, summons simultaneously. Underrated when combined with high-proc builds." },
  { id:"c-firef",    name:"Fire Fortune",     cat:"ECONOMY",  col:"#E84E25", note:"Guarantees Burn tactic drop. Good on Hazama/Mai fire builds. Skip if not running a fire tactic as a primary anchor." },
  { id:"c-umbraf",   name:"Umbra Fortune",    cat:"ECONOMY",  col:"#A855F7", note:"Guarantees Shadow Spike drop. Good on Hibiki/Lambda. Skip without a clear umbra tactic anchor in the build plan." },
  { id:"c-lethal",   name:"Lethal Momentum",  cat:"DAMAGE",   col:"#E53935", note:"After skill: +45% ATK for 6s. High uptime on skill-heavy builds. Outclassed by Straightforward in most cases." },
  { id:"c-predator", name:"Predator",         cat:"DAMAGE",   col:"#E53935", note:"+75% vs low HP enemies. Only real synergy is Naoto execute window. Wide miss on everyone else — skip unless Naoto." },
  { id:"c-mana",     name:"Mana Surge",       cat:"ECONOMY",  col:"#60A5FA", note:"+80 max MP. Mai needle rotation only. Skip everywhere else — the MP increase rarely matters outside needle spam." },
  { id:"c-indestr",  name:"Indestructible",   cat:"SURVIVAL", col:"#F59E0B", note:"-30% damage received always. Worse than Defensive Combo in active combat — run it only if you struggle to stay in combo strings." },
  { id:"c-secondwind",name:"Second Wind",     cat:"SURVIVAL", col:"#F59E0B", note:"Full heal on room entry below full HP. Entropy 70+ safety net when Not Dead Yet is unavailable." },
];

const TIER_META = [
  { id:"S",  label:"S",  color:"#E53935", desc:"Run-defining. Build your playstyle around this." },
  { id:"A+", label:"A+", color:"#F97316", desc:"Excellent. Works in every run, strong with almost anything." },
  { id:"A",  label:"A",  color:"#EAB308", desc:"Solid. Good pick in most situations." },
  { id:"B+", label:"B+", color:"#22C55E", desc:"Situational. Strong in the right comp." },
  { id:"B",  label:"B",  color:"#60A5FA", desc:"Niche. Has a specific use case — skip otherwise." },
  { id:"C",  label:"C",  color:"#555",    desc:"Skip. Outclassed by better options." },
];

const ELEM_COLORS = {
  ice:"#60B8D4", fire:"#E84E25", umbra:"#A855F7",
  light:"#EAB308", electric:"#22C55E", blade:"#94A3B8",
};

const STORAGE_KEY = "eo-tierlist-v3";

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const DEFAULT_PLACEMENTS = {
  chars: {
    S:    ["hibiki","jin","taokaka","noel"],
    "A+": ["ragna","es","kokonoe","hakumen","lambda"],
    A:    ["rachel","naoto","icey","hazama","mai"],
    "B+": ["bullet","prisoner"],
    B:    [], C: [], unranked: [],
  },
  tactics: {
    S:    ["t-shadow","t-atkcold","t-skcold","t-orb","t-blackhole"],
    "A+": ["t-lightsp","t-chainlit","t-thunderb","t-fireproj","t-lightsp2"],
    A:    ["t-burn","t-ringfire","t-icespike","t-frostbst"],
    "B+": ["t-skburn","t-mine","t-chainlit2","t-dashshdw"],
    B:    ["t-spirit","t-bladeslsh"], C: [], unranked: [],
  },
  crystals: {
    S:    ["c-exhil","c-defcombo","c-notdead","c-resonance","c-giant"],
    "A+": ["c-summon","c-fatal","c-focus","c-legamp"],
    A:    ["c-straight","c-domain","c-chain","c-combosrg","c-icef"],
    "B+": ["c-vital","c-phantom","c-hunters","c-bloodpact","c-apex","c-firef","c-umbraf"],
    B:    ["c-lethal","c-predator","c-indestr","c-secondwind","c-mana"],
    C:    [], unranked: [],
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.chars && parsed.tactics && parsed.crystals) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PLACEMENTS));
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ item, type, isDragging, onDragStart, onDragEnd, mob }) {
  const [showTip, setShowTip] = useState(false);
  const sz = mob ? 36 : 44;

  const color = type === "chars" ? item.color
    : type === "tactics" ? (ELEM_COLORS[item.elem] || "#888")
    : item.col;

  const inner = type === "chars" ? (
    <div style={{ width:sz, height:Math.round(sz*1.3), overflow:"hidden", clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)", background:"#111", border:`1px solid ${color}55`, flexShrink:0 }}>
      <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", filter:"brightness(0.85) saturate(0.8)" }} onError={e=>{e.target.style.display="none"}}/>
    </div>
  ) : (
    <div style={{ width:sz, height:sz, display:"flex", alignItems:"center", justifyContent:"center", background:`${color}14`, border:`1px solid ${color}44`, clipPath: type==="tactics"?"polygon(0 0,100% 0,94% 100%,0 100%)":undefined, padding:"0 3px", boxSizing:"border-box" }}>
      <div style={{ fontSize:mob?7:8, fontWeight:900, color, textAlign:"center", lineHeight:1.2, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.3, wordBreak:"break-word" }}>
        {type === "tactics" ? `[${item.slot}]\n${item.name}` : item.name}
      </div>
    </div>
  );

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed="move"; onDragStart(item.id); }}
      onDragEnd={onDragEnd}
      onClick={() => setShowTip(p => !p)}
      style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"grab", userSelect:"none", opacity: isDragging ? 0.3 : 1, flexShrink:0 }}
    >
      {inner}
      <div style={{ fontSize: mob?7:8, color, fontWeight:700, letterSpacing:0.3, fontFamily:"'Barlow Condensed',sans-serif", maxWidth:sz+8, textAlign:"center", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", lineHeight:1.1 }}>
        {item.name}
      </div>
      {showTip && item.note && (
        <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"#0D0D0D", border:"1px solid #2A2A2A", padding:"10px 12px", width:240, zIndex:9999, fontSize:10, color:"#A8A09A", lineHeight:1.55, boxShadow:"0 6px 30px #000C", pointerEvents:"none" }}>
          <div style={{ fontSize:10, fontWeight:900, color, letterSpacing:1, marginBottom:5, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.name}</div>
          {type==="tactics" && <div style={{ fontSize:9, color:"#444", letterSpacing:1, marginBottom:4, fontFamily:"'Barlow Condensed',sans-serif" }}>[{item.slot}] {item.val}</div>}
          {item.note}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TierList({ cfg={}, mob=false }) {
  const [activeType, setActiveType] = useState("chars");
  const [state, setState] = useState(loadState);
  const [tierNotes, setTierNotes] = useState({});
  const [dragging, setDragging] = useState(null); // item id string
  const [copied, setCopied] = useState(false);
  const dragTarget = useRef(null);

  const ALL = { chars: DEFAULT_CHARS, tactics: DEFAULT_TACTICS, crystals: DEFAULT_CRYSTALS };
  const items = state[activeType] || {};
  const allItems = ALL[activeType];

  function getItem(id) { return allItems.find(i => i.id === id); }

  function move(itemId, toTier) {
    setState(prev => {
      const next = { ...prev, [activeType]: { ...prev[activeType] } };
      const d = next[activeType];
      // Remove from all tiers
      for (const key of [...TIER_META.map(t=>t.id), "unranked"]) {
        if (d[key]) d[key] = d[key].filter(x => x !== itemId);
      }
      if (!d[toTier]) d[toTier] = [];
      d[toTier] = [...d[toTier], itemId];
      saveState(next);
      return next;
    });
  }

  function handleReset() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_PLACEMENTS));
    setState(fresh);
    saveState(fresh);
  }

  function handleShare() {
    const typeLabel = activeType === "chars" ? "CHARACTERS" : activeType === "tactics" ? "TACTICS" : "CRYSTALS";
    const lines = [`╔══ ENTROPY OVERRIDE — ${typeLabel} TIER LIST ══╗`, ""];
    for (const t of TIER_META) {
      const ids = items[t.id] || [];
      if (!ids.length) continue;
      const names = ids.map(id => getItem(id)?.name || id).join("  •  ");
      lines.push(`[ ${t.label} ]  ${names}`);
      if (tierNotes[t.id]) lines.push(`       ↳ ${tierNotes[t.id]}`);
    }
    const unranked = items.unranked || [];
    if (unranked.length) lines.push(`\n[ — ]  ${unranked.map(id=>getItem(id)?.name||id).join("  •  ")}`);
    lines.push("", "entropy-override.vercel.app");
    const text = lines.join("\n");
    try { navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el);
      el.select(); document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const TYPE_COLORS = { chars:"#7B8FE4", tactics:"#EAB308", crystals:"#C9A227" };
  const ac = TYPE_COLORS[activeType];

  const S = {
    wrap:    { display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", background:"#060606" },
    topBar:  { display:"flex", alignItems:"center", borderBottom:"1px solid #111", flexShrink:0, background:"#040404" },
    typeBtn: (a, c) => ({ background:a?`${c}14`:"transparent", border:"none", borderBottom:a?`2px solid ${c}`:"2px solid transparent", color:a?c:"#383838", padding: mob?"10px 12px":"12px 20px", fontSize: mob?10:12, letterSpacing:3, fontWeight:900, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", transition:"all 0.1s", flexShrink:0 }),
    actions: { marginLeft:"auto", display:"flex", gap:6, padding:"0 12px", alignItems:"center" },
    actBtn:  (c) => ({ background:`${c}12`, border:`1px solid ${c}44`, color:c, padding: mob?"5px 8px":"6px 14px", fontSize:10, letterSpacing:2, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap" }),
    body:    { flex:1, overflowY:"auto" },
    row:     (over, tc) => ({ display:"flex", alignItems:"stretch", borderBottom:"1px solid #0D0D0D", minHeight: mob?66:78, background: over?`${tc}07`:"transparent", transition:"background 0.1s" }),
    tierLbl: (c) => ({ width: mob?38:54, flexShrink:0, background:`${c}1A`, borderRight:`3px solid ${c}`, display:"flex", alignItems:"center", justifyContent:"center" }),
    tierTxt: (c) => ({ fontSize: mob?22:28, fontWeight:900, color:c, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1 }),
    pool:    { display:"flex", flexWrap:"wrap", flex:1, gap: mob?5:7, padding: mob?"6px 8px":"8px 12px", alignItems:"center", alignContent:"center" },
    noteCol: { width:170, flexShrink:0, borderLeft:"1px solid #0D0D0D", padding:"6px 10px", display:"flex", alignItems:"center" },
    noteTA:  { background:"transparent", border:"none", outline:"none", color:"#3A3A3A", fontSize:10, lineHeight:1.4, resize:"none", width:"100%", fontFamily:"'Courier Prime',monospace", cursor:"text" },
    unranked:{ borderTop:"2px solid #111", background:"#030303", padding: mob?"8px":"10px 16px", minHeight:64 },
    hdr:     { fontSize:9, letterSpacing:3, color:"#252525", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:6 },
  };

  return (
    <div style={S.wrap}>
      {/* Tab bar */}
      <div style={S.topBar}>
        {[["chars","CHARACTERS"],["tactics","TACTICS"],["crystals","CRYSTALS"]].map(([id,lbl])=>(
          <button key={id} style={S.typeBtn(activeType===id, TYPE_COLORS[id])} onClick={()=>setActiveType(id)}>{lbl}</button>
        ))}
        <div style={S.actions}>
          <button style={S.actBtn(copied?"#22C55E":"#555")} onClick={handleShare}>
            {copied?"COPIED!":"COPY LIST"}
          </button>
          <button style={S.actBtn("#E53935")} onClick={handleReset}>RESET</button>
        </div>
      </div>

      {/* Column header */}
      {!mob && (
        <div style={{ display:"flex", borderBottom:"1px solid #0A0A0A", flexShrink:0 }}>
          <div style={{ width:54, flexShrink:0, background:"#030303", borderRight:"1px solid #0A0A0A", padding:"4px 0", textAlign:"center", fontSize:9, color:"#222", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>TIER</div>
          <div style={{ flex:1, padding:"4px 12px", fontSize:9, color:"#222", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>DRAG TO REARRANGE — CLICK FOR MORPHEUS NOTES</div>
          <div style={{ width:170, flexShrink:0, borderLeft:"1px solid #0A0A0A", padding:"4px 10px", fontSize:9, color:"#222", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>YOUR TIER NOTES</div>
        </div>
      )}

      {/* Tier rows */}
      <div style={S.body}>
        {TIER_META.map(tier => {
          const [over, setOver] = useState(false);
          const rowItems = (items[tier.id]||[]).map(id=>getItem(id)).filter(Boolean);
          return (
            <div key={tier.id}
              style={S.row(over, tier.color)}
              onDragOver={e=>{ e.preventDefault(); setOver(true); dragTarget.current=tier.id; }}
              onDragLeave={()=>setOver(false)}
              onDrop={e=>{ e.preventDefault(); setOver(false); if(dragging) move(dragging, tier.id); setDragging(null); }}
            >
              <div style={S.tierLbl(tier.color)}>
                <span style={S.tierTxt(tier.color)}>{tier.label}</span>
              </div>
              <div style={S.pool}>
                {rowItems.map(item=>(
                  <ItemCard key={item.id} item={item} type={activeType}
                    isDragging={dragging===item.id}
                    onDragStart={id=>setDragging(id)}
                    onDragEnd={()=>setDragging(null)}
                    mob={mob}/>
                ))}
                {rowItems.length===0 && (
                  <div style={{ fontSize:9, color:"#1A1A1A", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", pointerEvents:"none" }}>DROP HERE</div>
                )}
              </div>
              {!mob && (
                <div style={S.noteCol}>
                  <textarea
                    style={S.noteTA}
                    placeholder={tier.desc}
                    value={tierNotes[tier.id]||""}
                    onChange={e=>setTierNotes(p=>({...p,[tier.id]:e.target.value}))}
                    rows={3}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Unranked pool */}
        {(()=>{
          const [over, setOver] = useState(false);
          const unranked = (items.unranked||[]).map(id=>getItem(id)).filter(Boolean);
          return (
            <div style={{ ...S.unranked, background: over?"#0A0A0A":"#030303", transition:"background 0.1s" }}
              onDragOver={e=>{ e.preventDefault(); setOver(true); }}
              onDragLeave={()=>setOver(false)}
              onDrop={e=>{ e.preventDefault(); setOver(false); if(dragging) move(dragging,"unranked"); setDragging(null); }}
            >
              <div style={S.hdr}>UNRANKED — {unranked.length} ITEM{unranked.length!==1?"S":""}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap: mob?5:7 }}>
                {unranked.map(item=>(
                  <ItemCard key={item.id} item={item} type={activeType}
                    isDragging={dragging===item.id}
                    onDragStart={id=>setDragging(id)}
                    onDragEnd={()=>setDragging(null)}
                    mob={mob}/>
                ))}
                {unranked.length===0 && (
                  <div style={{ fontSize:10, color:"#1A1A1A", letterSpacing:1, fontFamily:"'Barlow Condensed',sans-serif" }}>ALL RANKED ✓</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
