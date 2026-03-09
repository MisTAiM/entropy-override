import React, { useState, useRef } from "react";

const DEFAULT_CHARS = [
  { id:"hibiki",   name:"Hibiki",   img:"/chars/hibiki.png",   color:"#7B8FE4", note:"Clone proc tripling + back-attack = S-tier ceiling. All 3 clones inherit every tactic proc. Highest Exhilaration rate in roster." },
  { id:"ragna",    name:"Ragna",    img:"/chars/ragna.png",    color:"#D93025", note:"Blood Kain sub-50% is the strongest single threshold multiplier. Scythe group heal sustains indefinitely." },
  { id:"jin",      name:"Jin",      img:"/chars/jin.png",      color:"#4EA8D8", note:"Double Cold stack = permanent slow field. Best partner enabler in the game — every archetype benefits." },
  { id:"kokonoe",  name:"Kokonoe",  img:"/chars/kokonoe.png",  color:"#E8714A", note:"Aerial safety = uniquely unkillable. Missile Rain 10 proj = 2800 per cast. Never on the ground = never in danger." },
  { id:"es",       name:"Es",       img:"/chars/es.png",       color:"#E878A0", note:"Mine bounce from aerial: 3+ detonations per string. Crest field generates autonomous Exhilaration stacks." },
  { id:"noel",     name:"Noel",     img:"/chars/noel.png",     color:"#60A5FA", note:"Drive 9 hits/sec = fastest solo Exhilaration stacker. Universal — compatible with every fusion." },
  { id:"rachel",   name:"Rachel",   img:"/chars/rachel.png",   color:"#D8B4FE", note:"Bat Chain Lightning is fully autonomous DPS. Best summon-type passive — Summon Booster makes her S-tier." },
  { id:"taokaka",  name:"Taokaka",  img:"/chars/taokaka.png",  color:"#FCD34D", note:"Infinite dodge + 11 hits/sec = Exhilaration cap in 20s. Fastest kill chain speed in the roster." },
  { id:"lambda",   name:"Lambda",   img:"/chars/lambda.png",   color:"#6EE7B7", note:"4 autonomous swords copy tactic procs independently. Respawn Double = permanent field with zero upkeep." },
  { id:"mai",      name:"Mai",      img:"/chars/mai.png",      color:"#FB923C", note:"8 needles per cast = finest HP management. 32 sword proc events when fused with Lambda." },
  { id:"hazama",   name:"Hazama",   img:"/chars/hazama.png",   color:"#86EFAC", note:"Chain whip hits 3-5 targets simultaneously. Strongest passive damage dealer — 1300+/s passive on groups." },
  { id:"hakumen",  name:"Hakumen",  img:"/chars/hakumen.png",  color:"#F1F5F9", note:"Magatama × 2 + Legacy Amplifier = highest single-hit burst in roster. Counter timing = free damage on any fight." },
  { id:"bullet",   name:"Bullet",   img:"/chars/bullet.png",   color:"#F97316", note:"Steel Shell adds 3 effective HP bars. Drive + Defensive Combo = safest CQC archetype at high entropy." },
  { id:"naoto",    name:"Naoto",    img:"/chars/naoto.png",    color:"#F87171", note:"Hunter's Eye execute — Blood Pact × Fatal Blow × Focus crit = 7.4× peak execute spike." },
  { id:"icey",     name:"ICEY",     img:"/chars/icey.png",     color:"#A78BFA", note:"Dance invincibility = 0 damage during attack animation. Full offensive + full defensive simultaneously." },
  { id:"prisoner", name:"Prisoner", img:"/chars/prisoner.png", color:"#94A3B8", note:"Weapon variety means no bad runs. Roll invincibility covers all gaps. Best run-consistency of any char." },
];

const DEFAULT_TACTICS = [
  { id:"t-shadow",    name:"Shadow Spike",    slot:"Atk",  elem:"umbra",    val:"275/hit",    note:"S-tier on clone chars — Hibiki triple procs. Universal on any build. Never a bad pick." },
  { id:"t-atkcold",   name:"Attack Cold",     slot:"Atk",  elem:"ice",      val:"+46% ATK",   note:"Permanent +46% attack = strongest flat ATK multiplier. Enables Frost Burst chain." },
  { id:"t-burn",      name:"Attack Burn",     slot:"Atk",  elem:"fire",     val:"260 DoT/s",  note:"260/s stacking DoT per hit. Hazama chain whip applies to 3-5 simultaneously = 1300 passive." },
  { id:"t-chainlit",  name:"Chain Lightning", slot:"Atk",  elem:"electric", val:"295×3",      note:"295 × 3 enemies per proc. Rachel bats proc this autonomously — hands-free AoE coverage." },
  { id:"t-skcold",    name:"Skill Cold",      slot:"Sk",   elem:"ice",      val:"+47% Sk",    note:"47% on all skills at Legendary. Jin double-stack with Attack Cold = strongest tactic pairing." },
  { id:"t-skburn",    name:"Skill Burn",      slot:"Sk",   elem:"fire",     val:"360 DoT/s",  note:"Higher DoT rate than Attack Burn. Mai needle volleys stack this very fast." },
  { id:"t-lightsp",   name:"Light Spear",     slot:"Sk",   elem:"light",    val:"490/hit",    note:"490 flat on skill use. Legacy Amplifier: 735. Hakumen Magatama multiplies further." },
  { id:"t-fireproj",  name:"Fire Projectile", slot:"Sk",   elem:"fire",     val:"280×10",     note:"2800 at point blank. Kokonoe aerial fires all 10 into one target. Best burst Skill tactic." },
  { id:"t-mine",      name:"Place Mine",      slot:"Sk",   elem:"fire",     val:"570/mine",   note:"Es exclusive — aerial bounce triggers 3+ mines per string. Low value on other chars." },
  { id:"t-spirit",    name:"Fire Spirit",     slot:"Sk",   elem:"fire",     val:"190/hit",    note:"Autonomous spirit. Decent passive filler — lower priority than Fire Projectile." },
  { id:"t-thunderb",  name:"Thunderbolt",     slot:"Dash", elem:"light",    val:"325/dash",   note:"Movement becomes offense. Clone chars triple-proc every dodge. Best Dash tactic." },
  { id:"t-dashshdw",  name:"Dash Shadow",     slot:"Dash", elem:"umbra",    val:"200/dodge",  note:"200 on every dodge. Lower than Thunderbolt. Good when Thunderbolt conflicts." },
  { id:"t-bladeslsh", name:"Blade Slash",     slot:"Dash", elem:"blade",    val:"220/dash",   note:"Physical proc on dash. No element synergy. Filler only." },
  { id:"t-lightsp2",  name:"Light Spear",     slot:"Leg",  elem:"light",    val:"490/hit",    note:"490 on legacy use. Legacy Amplifier: 735. With Hakumen Magatama: 1470 per hit." },
  { id:"t-blackhole", name:"Blackhole",       slot:"Leg",  elem:"umbra",    val:"Full CC",    note:"Full-screen slow on legacy. Enables every other tactic to confirm. S-tier utility." },
  { id:"t-ringfire",  name:"Ring of Fire",    slot:"Leg",  elem:"fire",     val:"770 burst",  note:"770 AoE burst. Ring of Fire Double = full-screen clear. Best damage Legacy tactic." },
  { id:"t-icespike",  name:"Ice Spike",       slot:"Leg",  elem:"ice",      val:"350 turret", note:"Respawn Double makes it permanent auto-turret. Best passive Legacy field option." },
  { id:"t-orb",       name:"Lightning Orb",   slot:"Sum",  elem:"electric", val:"245 DPS",    note:"Persistent autonomous turret. Character-neutral. Best Summon tactic — never wrong." },
  { id:"t-chainlit2", name:"Chain Lightning", slot:"Sum",  elem:"light",    val:"295×3",      note:"295 × 3 bounce per proc in Summon slot. Rachel bats proc this autonomously." },
  { id:"t-frostbst",  name:"Frost Burst",     slot:"Sum",  elem:"ice",      val:"520 AoE",    note:"520 AoE at max Cold stacks. Jin reaches max stacks in 2 hits. Best room-clear on Cold builds." },
];

const DEFAULT_CRYSTALS = [
  { id:"c-exhil",    name:"Exhilaration",    cat:"UTIL",  col:"#C9A227", note:"ALL damage scales with combo — universal multiplier caps at 250%. Goes in every serious build." },
  { id:"c-defcombo", name:"Def. Combo",      cat:"SURV",  col:"#F59E0B", note:"-80% damage during attack strings. Nearly permanent damage reduction. Best survival crystal." },
  { id:"c-notdead",  name:"Not Dead Yet",    cat:"SURV",  col:"#F59E0B", note:"Cheat death once + 70% HP restore. Most impactful single pick at high entropy." },
  { id:"c-resonance",name:"Resonance",       cat:"UTIL",  col:"#C9A227", note:"+40% tactic damage at Legendary. Multiplicative with all sources. Mandatory on summon builds." },
  { id:"c-giant",    name:"Giant Slayer",    cat:"DMG",   col:"#E53935", note:"+60% vs elites and bosses. Goes in every build — no reason to ever leave this out." },
  { id:"c-summon",   name:"Summon Boost",    cat:"ADV",   col:"#A78BFA", note:"+45% summon tactic damage. Rachel bats + Lambda swords + Hibiki clones all summon-type." },
  { id:"c-fatal",    name:"Fatal Blow",      cat:"UTIL",  col:"#C9A227", note:"+75% crit damage. With Focus: 55% crit rate × 1.75 = 1.41× consistent multiplier." },
  { id:"c-focus",    name:"Focus",           cat:"UTIL",  col:"#C9A227", note:"+25% crit rate. Pair with Fatal Blow always — one without the other is half the value." },
  { id:"c-legamp",   name:"Legacy Amp",      cat:"ADV",   col:"#A78BFA", note:"+50% legacy damage. Hakumen Magatama × Legacy Amp = highest single-hit burst in the game." },
  { id:"c-straight", name:"Straightforward", cat:"DMG",   col:"#E53935", note:"+45% attack damage. Solid flat multiplier — best filler when you need ATK scaling." },
  { id:"c-domain",   name:"Domination",      cat:"DMG",   col:"#E53935", note:"+45% skill damage. Mirror of Straightforward — swap depending on primary damage source." },
  { id:"c-icef",     name:"Ice Fortune",     cat:"ECO",   col:"#60B8D4", note:"Guarantees Cold Attack from first shop. Removes all Cold RNG — mandatory on Jin builds." },
  { id:"c-chain",    name:"Chain Reaction",  cat:"ADV",   col:"#A78BFA", note:"+36% on 3 kills in 10s. Taokaka and Prisoner trigger this almost every room." },
  { id:"c-combosrg", name:"Combo Surge",     cat:"DMG",   col:"#E53935", note:"+5% ATK per 10 combo. Stack with Exhilaration on fast attackers for double combo scaling." },
  { id:"c-bloodpact",name:"Blood Pact",      cat:"ADV",   col:"#A78BFA", note:"+35% HP-cost ability damage. Naoto-exclusive value. Skip on all other characters." },
  { id:"c-apex",     name:"Apex Predator",   cat:"ADV",   col:"#A78BFA", note:"+35% at full HP. Hakumen counter restores HP — consistent in his kit, situational elsewhere." },
  { id:"c-vital",    name:"Vital Boost",     cat:"SURV",  col:"#F59E0B", note:"+100% max HP. Doubles Blood Scythe heal on Ragna. Situational otherwise." },
  { id:"c-phantom",  name:"Phantom Step",    cat:"ADV",   col:"#A78BFA", note:"Iframes on dash. Hibiki back-attack repositioning loves it. Skip on stationary builds." },
  { id:"c-hunters",  name:"Hunter's Mark",   cat:"ADV",   col:"#A78BFA", note:"+30% from ALL sources on marked target. Underrated when combined with high-proc builds." },
  { id:"c-firef",    name:"Fire Fortune",    cat:"ECO",   col:"#E84E25", note:"Guarantees Burn tactic. Good on Hazama/Mai fire builds. Skip without fire anchor." },
  { id:"c-umbraf",   name:"Umbra Fortune",   cat:"ECO",   col:"#A855F7", note:"Guarantees Shadow Spike drop. Good on Hibiki/Lambda. Skip without umbra anchor." },
  { id:"c-lethal",   name:"Lethal Momentum", cat:"DMG",   col:"#E53935", note:"After skill: +45% ATK for 6s. Outclassed by Straightforward in most cases." },
  { id:"c-predator", name:"Predator",        cat:"DMG",   col:"#E53935", note:"+75% vs low HP enemies. Naoto execute window only. Wide miss everywhere else." },
  { id:"c-mana",     name:"Mana Surge",      cat:"ECO",   col:"#60A5FA", note:"+80 max MP. Mai needle rotation only. Skip everywhere else." },
  { id:"c-indestr",  name:"Indestructible",  cat:"SURV",  col:"#F59E0B", note:"-30% damage received always. Worse than Defensive Combo — run it only if you can't stay in combo." },
  { id:"c-secondwind",name:"Second Wind",    cat:"SURV",  col:"#F59E0B", note:"Full heal on room entry below full HP. Entropy 70+ safety net." },
];

const TIER_META = [
  { id:"S",  label:"S",  color:"#E53935", desc:"Run-defining. Build around this." },
  { id:"A+", label:"A+", color:"#F97316", desc:"Excellent. Works in every run." },
  { id:"A",  label:"A",  color:"#EAB308", desc:"Solid. Good in most situations." },
  { id:"B+", label:"B+", color:"#22C55E", desc:"Situational. Strong in the right comp." },
  { id:"B",  label:"B",  color:"#60A5FA", desc:"Niche. Specific use case only." },
  { id:"C",  label:"C",  color:"#555",    desc:"Skip. Outclassed by better options." },
];

const ELEM_COLORS = {
  ice:"#60B8D4", fire:"#E84E25", umbra:"#A855F7",
  light:"#EAB308", electric:"#22C55E", blade:"#94A3B8",
};

const STORAGE_KEY = "eo-tierlist-v3";

const DEFAULT_PLACEMENTS = {
  chars: {
    S:["hibiki","jin","taokaka","noel"], "A+":["ragna","es","kokonoe","hakumen","lambda"],
    A:["rachel","naoto","icey","hazama","mai"], "B+":["bullet","prisoner"], B:[], C:[], unranked:[],
  },
  tactics: {
    S:["t-shadow","t-atkcold","t-skcold","t-orb","t-blackhole"],
    "A+":["t-lightsp","t-chainlit","t-thunderb","t-fireproj","t-lightsp2"],
    A:["t-burn","t-ringfire","t-icespike","t-frostbst"],
    "B+":["t-skburn","t-mine","t-chainlit2","t-dashshdw"], B:["t-spirit","t-bladeslsh"], C:[], unranked:[],
  },
  crystals: {
    S:["c-exhil","c-defcombo","c-notdead","c-resonance","c-giant"],
    "A+":["c-summon","c-fatal","c-focus","c-legamp"],
    A:["c-straight","c-domain","c-chain","c-combosrg","c-icef"],
    "B+":["c-vital","c-phantom","c-hunters","c-bloodpact","c-apex","c-firef","c-umbraf"],
    B:["c-lethal","c-predator","c-indestr","c-secondwind","c-mana"], C:[], unranked:[],
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const p = JSON.parse(raw); if (p?.chars && p?.tactics && p?.crystals) return p; }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PLACEMENTS));
}
function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ item, type, isDragging, onDragStart, onDragEnd, mob }) {
  const [showTip, setShowTip] = useState(false);
  const sz = mob ? 34 : 42;
  const color = type === "chars" ? item.color : type === "tactics" ? (ELEM_COLORS[item.elem] || "#888") : item.col;

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart(item.id); }}
      onDragEnd={onDragEnd}
      onClick={() => setShowTip(p => !p)}
      style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"grab", userSelect:"none", opacity: isDragging ? 0.25 : 1, flexShrink:0 }}
    >
      {type === "chars" ? (
        <div style={{ width:sz, height:Math.round(sz*1.3), overflow:"hidden", clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)", background:"#111", border:`1px solid ${color}55` }}>
          <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", filter:"brightness(0.85) saturate(0.75)" }} onError={e=>{e.target.style.display="none"}}/>
        </div>
      ) : (
        <div style={{ width:sz, height:sz, display:"flex", alignItems:"center", justifyContent:"center", background:`${color}14`, border:`1px solid ${color}55`, clipPath: type==="tactics"?"polygon(0 0,100% 0,94% 100%,0 100%)":undefined, padding:"0 3px", boxSizing:"border-box" }}>
          <div style={{ fontSize:mob?6:7, fontWeight:900, color, textAlign:"center", lineHeight:1.2, fontFamily:"'Barlow Condensed',sans-serif", wordBreak:"break-word", letterSpacing:0.2 }}>
            {type==="tactics" ? `[${item.slot}] ${item.name}` : item.name}
          </div>
        </div>
      )}
      <div style={{ fontSize:mob?6:7, color, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", maxWidth:sz+6, textAlign:"center", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", lineHeight:1 }}>
        {item.name}
      </div>
      {showTip && item.note && (
        <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"#0D0D0D", border:"1px solid #2A2A2A", padding:"10px 12px", width:230, zIndex:9999, fontSize:10, color:"#A8A09A", lineHeight:1.55, boxShadow:"0 6px 30px #000D", pointerEvents:"none" }}>
          <div style={{ fontSize:10, fontWeight:900, color, letterSpacing:1, marginBottom:4, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.name}</div>
          {type==="tactics" && <div style={{ fontSize:9, color:"#444", letterSpacing:1, marginBottom:3, fontFamily:"'Barlow Condensed',sans-serif" }}>[{item.slot}]  {item.val}</div>}
          {item.note}
        </div>
      )}
    </div>
  );
}

// ─── TIER ROW (own component so useState is legal) ────────────────────────────
function TierRow({ tier, rowItemIds, allItems, type, draggingId, onDragStart, onDragEnd, onDrop, mob, noteVal, onNoteChange }) {
  const [over, setOver] = useState(false);
  const rowItems = rowItemIds.map(id => allItems.find(i => i.id === id)).filter(Boolean);

  return (
    <div
      style={{ display:"flex", alignItems:"stretch", borderBottom:"1px solid #0D0D0D", minHeight:mob?64:76, background: over?`${tier.color}07`:"transparent", transition:"background 0.1s" }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDrop(tier.id); }}
    >
      <div style={{ width:mob?38:52, flexShrink:0, background:`${tier.color}1A`, borderRight:`3px solid ${tier.color}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:mob?22:28, fontWeight:900, color:tier.color, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1 }}>{tier.label}</span>
      </div>
      <div style={{ flex:1, display:"flex", flexWrap:"wrap", gap:mob?5:7, padding:mob?"6px 8px":"8px 12px", alignItems:"center", alignContent:"center" }}>
        {rowItems.map(item => (
          <ItemCard key={item.id} item={item} type={type}
            isDragging={draggingId === item.id}
            onDragStart={onDragStart} onDragEnd={onDragEnd} mob={mob} />
        ))}
        {rowItems.length === 0 && (
          <div style={{ fontSize:9, color:"#1A1A1A", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", pointerEvents:"none" }}>DROP HERE</div>
        )}
      </div>
      {!mob && (
        <div style={{ width:168, flexShrink:0, borderLeft:"1px solid #0D0D0D", padding:"6px 10px", display:"flex", alignItems:"center" }}>
          <textarea
            style={{ background:"transparent", border:"none", outline:"none", color:"#3A3A3A", fontSize:10, lineHeight:1.4, resize:"none", width:"100%", fontFamily:"'Courier Prime',monospace", cursor:"text" }}
            placeholder={tier.desc}
            value={noteVal || ""}
            onChange={e => onNoteChange(tier.id, e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  );
}

// ─── UNRANKED POOL (own component) ────────────────────────────────────────────
function UnrankedPool({ ids, allItems, type, draggingId, onDragStart, onDragEnd, onDrop, mob }) {
  const [over, setOver] = useState(false);
  const items = ids.map(id => allItems.find(i => i.id === id)).filter(Boolean);
  return (
    <div
      style={{ borderTop:"2px solid #131313", background: over?"#0A0A0A":"#030303", padding:mob?"8px":"10px 16px", minHeight:60, transition:"background 0.1s" }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDrop("unranked"); }}
    >
      <div style={{ fontSize:9, letterSpacing:3, color:"#222", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:6 }}>
        UNRANKED — {items.length} ITEM{items.length!==1?"S":""}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:mob?5:7 }}>
        {items.map(item => (
          <ItemCard key={item.id} item={item} type={type}
            isDragging={draggingId === item.id}
            onDragStart={onDragStart} onDragEnd={onDragEnd} mob={mob} />
        ))}
        {items.length === 0 && (
          <div style={{ fontSize:10, color:"#181818", letterSpacing:1, fontFamily:"'Barlow Condensed',sans-serif" }}>ALL RANKED ✓</div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function TierList({ cfg={}, mob=false }) {
  const [activeType, setActiveType] = useState("chars");
  const [state, setState] = useState(loadState);
  const [tierNotes, setTierNotes] = useState({});
  const [dragging, setDragging] = useState(null);
  const [copied, setCopied] = useState(false);

  const ALL = { chars:DEFAULT_CHARS, tactics:DEFAULT_TACTICS, crystals:DEFAULT_CRYSTALS };
  const allItems = ALL[activeType];
  const items = state[activeType] || {};

  function move(itemId, toTier) {
    setState(prev => {
      const next = { ...prev, [activeType]: { ...prev[activeType] } };
      const d = next[activeType];
      for (const k of [...TIER_META.map(t=>t.id),"unranked"]) {
        if (d[k]) d[k] = d[k].filter(x => x !== itemId);
      }
      if (!d[toTier]) d[toTier] = [];
      d[toTier] = [...d[toTier], itemId];
      saveState(next);
      return next;
    });
  }

  function handleReset() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_PLACEMENTS));
    setState(fresh); saveState(fresh);
  }

  function handleShare() {
    const lbl = activeType==="chars"?"CHARACTERS":activeType==="tactics"?"TACTICS":"CRYSTALS";
    const lines = [`╔══ ENTROPY OVERRIDE — ${lbl} TIER LIST ══╗`,""];
    for (const t of TIER_META) {
      const ids = items[t.id]||[];
      if (!ids.length) continue;
      lines.push(`[ ${t.label} ]  ${ids.map(id=>allItems.find(i=>i.id===id)?.name||id).join("  •  ")}`);
      if (tierNotes[t.id]) lines.push(`       ↳ ${tierNotes[t.id]}`);
    }
    const unranked = items.unranked||[];
    if (unranked.length) lines.push(`\n[ — ]  ${unranked.map(id=>allItems.find(i=>i.id===id)?.name||id).join("  •  ")}`);
    lines.push("","entropy-override.vercel.app");
    const text = lines.join("\n");
    try { navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea"); el.value=text;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }

  const TYPE_COLORS = { chars:"#7B8FE4", tactics:"#EAB308", crystals:"#C9A227" };
  const ac = TYPE_COLORS[activeType];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", background:"#060606" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", alignItems:"center", borderBottom:"1px solid #111", flexShrink:0, background:"#040404" }}>
        {[["chars","CHARACTERS"],["tactics","TACTICS"],["crystals","CRYSTALS"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setActiveType(id)} style={{
            background: activeType===id?`${TYPE_COLORS[id]}14`:"transparent",
            border:"none", borderBottom: activeType===id?`2px solid ${TYPE_COLORS[id]}`:"2px solid transparent",
            color: activeType===id?TYPE_COLORS[id]:"#383838",
            padding:mob?"10px 12px":"12px 20px", fontSize:mob?10:12, letterSpacing:3,
            fontWeight:900, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", transition:"all 0.1s", flexShrink:0,
          }}>{lbl}</button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, padding:"0 12px", alignItems:"center" }}>
          <button onClick={handleShare} style={{ background:`${copied?"#22C55E":"#555"}12`, border:`1px solid ${copied?"#22C55E":"#555"}44`, color:copied?"#22C55E":"#555", padding:mob?"5px 8px":"6px 14px", fontSize:10, letterSpacing:2, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif" }}>
            {copied?"COPIED!":"COPY LIST"}
          </button>
          <button onClick={handleReset} style={{ background:"#E5393514", border:"1px solid #E5393544", color:"#E53935", padding:mob?"5px 8px":"6px 14px", fontSize:10, letterSpacing:2, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif" }}>
            RESET
          </button>
        </div>
      </div>

      {/* Column headers */}
      {!mob && (
        <div style={{ display:"flex", borderBottom:"1px solid #0A0A0A", flexShrink:0 }}>
          <div style={{ width:52, flexShrink:0, background:"#030303", borderRight:"1px solid #0A0A0A", padding:"4px 0", textAlign:"center", fontSize:9, color:"#222", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>TIER</div>
          <div style={{ flex:1, padding:"4px 12px", fontSize:9, color:"#222", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>DRAG TO REARRANGE — CLICK ITEM FOR MORPHEUS NOTES</div>
          <div style={{ width:168, flexShrink:0, borderLeft:"1px solid #0A0A0A", padding:"4px 10px", fontSize:9, color:"#222", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>YOUR TIER NOTES</div>
        </div>
      )}

      {/* Tier rows + unranked pool */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {TIER_META.map(tier => (
          <TierRow
            key={tier.id}
            tier={tier}
            rowItemIds={items[tier.id]||[]}
            allItems={allItems}
            type={activeType}
            draggingId={dragging}
            onDragStart={id => setDragging(id)}
            onDragEnd={() => setDragging(null)}
            onDrop={toTier => { if (dragging) { move(dragging, toTier); setDragging(null); } }}
            mob={mob}
            noteVal={tierNotes[tier.id]}
            onNoteChange={(id,val) => setTierNotes(p=>({...p,[id]:val}))}
          />
        ))}
        <UnrankedPool
          ids={items.unranked||[]}
          allItems={allItems}
          type={activeType}
          draggingId={dragging}
          onDragStart={id => setDragging(id)}
          onDragEnd={() => setDragging(null)}
          onDrop={toTier => { if (dragging) { move(dragging, toTier); setDragging(null); } }}
          mob={mob}
        />
      </div>
    </div>
  );
}
