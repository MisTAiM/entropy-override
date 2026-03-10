import React, { useState } from "react";

// ─── CRYSTAL DATA ────────────────────────────────────────────────────────────
// All 38 confirmed mind crystals with verified effects from community research
const CRYSTALS = [
  // ── DAMAGE ──
  {
    id:"straightforward",
    name:"Straightforward",
    category:"DAMAGE",
    color:"#E53935",
    icon:"⚔",
    effect:"Attack DMG +30%",
    ascended:"Attack DMG +45%",
    tier:"S",
    desc:"Core universal damage buff. Works on all attack types. Stack-mandatory for any DPS build.",
    builds:["All Damage","Attack Build","Hybrid"],
    chars:["ragna","hibiki","naoto","hakumen","taokaka","bullet"],
  },
  {
    id:"domination",
    name:"Domination",
    category:"DAMAGE",
    color:"#E53935",
    icon:"🔱",
    effect:"Skill DMG +30%",
    ascended:"Skill DMG +45%",
    tier:"S",
    desc:"Primary skill damage amplifier. Essential for any build centered on SP skills or rapid skill usage.",
    builds:["Skill Build","Noel Drive","Es Crest","Jin Ice"],
    chars:["noel","jin","es","kokonoe","rachel","lambda"],
  },
  {
    id:"giant-slayer",
    name:"Giant Slayer",
    category:"DAMAGE",
    color:"#E53935",
    icon:"🗡",
    effect:"Elite enemy DMG +40%",
    ascended:"Elite enemy DMG +60%",
    tier:"S",
    desc:"Massive damage spike vs. Elite and Boss enemies. Near-mandatory at Entropy 50+. Accelerates all boss kill windows significantly.",
    builds:["All Damage","Boss Kill","High Entropy"],
    chars:["ragna","hakumen","naoto","hibiki","bullet"],
  },
  {
    id:"combo-surge",
    name:"Combo Surge",
    category:"DAMAGE",
    color:"#E53935",
    icon:"⚡",
    effect:"Per 10 combo hits, ATK +4% (cap 200%)",
    ascended:"Per 10 combo hits, ATK +5% (cap 250%)",
    tier:"A",
    desc:"Scales exponentially in sustained fights. Pairs with Exhilaration for insane late-run damage. Requires staying in combat — punishes defensive play.",
    builds:["Combo Build","Attack Build"],
    chars:["taokaka","noel","hibiki","mai","bullet"],
  },
  {
    id:"lethal-momentum",
    name:"Lethal Momentum",
    category:"DAMAGE",
    color:"#E53935",
    icon:"💢",
    effect:"On Skill activation, ATK +30% for 5s",
    ascended:"On Skill activation, ATK +45% for 6s",
    tier:"A",
    desc:"Strong burst window tied to skill use. Synergizes perfectly with Domination — double-dipping on skill windows. Best with frequent skill casters.",
    builds:["Skill Build","Burst Build"],
    chars:["noel","jin","es","kokonoe"],
  },
  {
    id:"predator",
    name:"Predator",
    category:"DAMAGE",
    color:"#E53935",
    icon:"🔥",
    effect:"Damage vs. low HP enemies +50%",
    ascended:"Damage vs. low HP enemies +75%",
    tier:"B",
    desc:"Excellent for finishing — stacks with other damage multipliers when enemies are below ~30% HP. Weak on sustained or tanky fights unless paired with burst.",
    builds:["Burst Build","Attack Build"],
    chars:["ragna","naoto","hakumen"],
  },

  // ── SURVIVAL ──
  {
    id:"not-dead-yet",
    name:"Not Dead Yet",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"🛡",
    effect:"1× cheat death, restore 50% HP",
    ascended:"1× cheat death, restore 70% HP",
    tier:"S",
    desc:"The most important safety crystal in the game. One free death + massive heal. Priority unlock for all entropy levels. Cannot be substituted when learning new Entropy tiers.",
    builds:["All Builds","High Entropy","Aggressive"],
    chars:["ragna","naoto","bullet","hakumen","taokaka"],
  },
  {
    id:"indestructible",
    name:"Indestructible",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"🔒",
    effect:"Damage received -20%",
    ascended:"Damage received -30%",
    tier:"A",
    desc:"Flat damage reduction applied before all other mitigation. Crucial at Entropy 80+. Pairs with Defensive Combo for near-invincibility windows.",
    builds:["Tank Build","High Entropy","Defensive"],
    chars:["hakumen","ragna","bullet","naoto"],
  },
  {
    id:"defensive-combo",
    name:"Defensive Combo",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"🛡",
    effect:"Damage received -70% during combo",
    ascended:"Damage received -80% during combo",
    tier:"S",
    desc:"Enormous damage reduction while actively attacking. Rewards aggressive, combo-focused play. Synergizes with Combo Surge — you're protected AND scaling damage simultaneously.",
    builds:["Combo Build","Aggressive","Hybrid"],
    chars:["taokaka","noel","hibiki","mai","es"],
  },
  {
    id:"vital-boost",
    name:"Vital Boost",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"❤",
    effect:"Max HP +80%",
    ascended:"Max HP +100%",
    tier:"A",
    desc:"Effectively doubles your health pool. Makes Black Market life trading much less punishing. Essential for the 9-lives strategy at the Black Market.",
    builds:["Tank Build","Black Market","High Entropy"],
    chars:["ragna","bullet","naoto","prisoner"],
  },
  {
    id:"compliment-of-death",
    name:"Compliment of Death",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"💚",
    effect:"Heal 10% max HP per 20 combo hits",
    ascended:"Heal 15% max HP per 20 combo hits",
    tier:"A",
    desc:"Sustain machine in long fights. Completely nullifies chip damage when comboing. Works best with characters that have fast, safe combo strings.",
    builds:["Sustain Build","Combo Build"],
    chars:["taokaka","noel","hibiki","mai"],
  },
  {
    id:"second-wind",
    name:"Second Wind",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"🌀",
    effect:"Upon entering a space at <100% HP, restore to 100% HP",
    ascended:"Upon entering a space at <100% HP, restore to 100% HP (strengthened)",
    tier:"A",
    desc:"Free full heal between stages. Completely trivializes HP management. Near-mandatory for aggressive players who can't avoid taking chip damage.",
    builds:["Aggressive","All Builds"],
    chars:["ragna","naoto","bullet","taokaka"],
  },
  {
    id:"store-regen",
    name:"Commerce Healing",
    category:"SURVIVAL",
    color:"#F59E0B",
    icon:"💊",
    effect:"Recover HP when purchasing at shop",
    ascended:"Recover more HP when purchasing at shop",
    tier:"B",
    desc:"Converts Exchange Points into HP. Strong if you plan to spend heavily in shops. Pairs well with the Exchange Point farming builds.",
    builds:["Economy Build"],
    chars:["kokonoe","rachel","lambda"],
  },

  // ── ECONOMY / RESOURCES ──
  {
    id:"mana-surge",
    name:"Mana Surge",
    category:"ECONOMY",
    color:"#60A5FA",
    icon:"💧",
    effect:"Max MP +50",
    ascended:"Max MP +80",
    tier:"B",
    desc:"Larger MP pool = more skill uses per fight. Critical for MP-heavy characters that rely on constant SP casts. Enables skill spam loops.",
    builds:["Skill Build","MP Build"],
    chars:["noel","jin","kokonoe","es","rachel"],
  },
  {
    id:"mixture-enhancement",
    name:"Mixture Enhancement",
    category:"ECONOMY",
    color:"#60A5FA",
    icon:"⚗",
    effect:"HP Mixture count +2, effect +20%",
    ascended:"HP Mixture count +3, effect +35%",
    tier:"A",
    desc:"More potions AND they heal more. Effectively adds 2-3 recovery windows per run. Top 5 most impactful survivability crystals, especially for aggressive players.",
    builds:["All Builds","Sustain Build"],
    chars:["ragna","bullet","naoto","prisoner"],
  },
  {
    id:"point-surge",
    name:"Point Surge",
    category:"ECONOMY",
    color:"#60A5FA",
    icon:"💠",
    effect:"Exchange Points gained +30%",
    ascended:"Exchange Points gained +45%",
    tier:"B",
    desc:"More currency for shops and upgrades. Enables buying more tactics, skills, and reinforcements per run. Strong in runs aiming for multiple shop stops.",
    builds:["Economy Build","Shop Build"],
    chars:["kokonoe","rachel","lambda"],
  },
  {
    id:"ice-fortune",
    name:"Ice Fortune",
    category:"ECONOMY",
    color:"#60B8D4",
    icon:"❄",
    effect:"Ice Tactic drop rate increased",
    ascended:"Ice Tactic drop rate greatly increased",
    tier:"B",
    desc:"Steers your tactic pool toward Ice element. Use when building Cold/Freeze-focused runs with Jin, Hibiki Ice, or Lambda blade builds.",
    builds:["Ice Build"],
    chars:["jin","hibiki","lambda"],
  },
  {
    id:"fire-fortune",
    name:"Fire Fortune",
    category:"ECONOMY",
    color:"#E53935",
    icon:"🔥",
    effect:"Fire Tactic drop rate increased",
    ascended:"Fire Tactic drop rate greatly increased",
    tier:"B",
    desc:"Biases tactic offerings toward Fire element. Use for Burn/Ignite builds on Ragna, Kokonoe, or Noel Fire-type runs.",
    builds:["Fire Build"],
    chars:["ragna","kokonoe","noel"],
  },
  {
    id:"umbra-fortune",
    name:"Umbra Fortune",
    category:"ECONOMY",
    color:"#A855F7",
    icon:"🌑",
    effect:"Umbra Tactic drop rate increased",
    ascended:"Umbra Tactic drop rate greatly increased",
    tier:"B",
    desc:"Steers toward Shadow/Umbra tactics. Optimal for Hazama Chain builds or Hibiki Shadow Strike runs.",
    builds:["Umbra Build"],
    chars:["hazama","hibiki","naoto"],
  },
  {
    id:"light-fortune",
    name:"Light Fortune",
    category:"ECONOMY",
    color:"#EAB308",
    icon:"✨",
    effect:"Light Tactic drop rate increased",
    ascended:"Light Tactic drop rate greatly increased",
    tier:"B",
    desc:"Steers toward Light-element tactics. Use for Hakumen Light Spear setups or Es/Rachel light builds.",
    builds:["Light Build"],
    chars:["hakumen","es","rachel"],
  },
  {
    id:"electric-fortune",
    name:"Electric Fortune",
    category:"ECONOMY",
    color:"#22C55E",
    icon:"⚡",
    effect:"Electric Tactic drop rate increased",
    ascended:"Electric Tactic drop rate greatly increased",
    tier:"B",
    desc:"Biases toward Electric tactics. Essential for Chain Lightning and Lightning Orb-focused builds on Noel or Mai.",
    builds:["Electric Build"],
    chars:["noel","mai","lambda"],
  },

  // ── OFFENSIVE UTILITY ──
  {
    id:"exhilaration",
    name:"Exhilaration",
    category:"UTILITY",
    color:"#C9A227",
    icon:"🌟",
    effect:"Per 10 combo, DMG +4% (cap 200%)",
    ascended:"Per 10 combo, DMG +5% (cap 250%)",
    tier:"S",
    desc:"All-damage scaling that rewards sustained combat. Unlike Combo Surge (attack only), this buffs ALL damage including tactic/skill/summon. Top 3 best crystals in the game at max stacks.",
    builds:["All Damage","Combo Build","High Entropy"],
    chars:["taokaka","noel","hibiki","mai","es"],
  },
  {
    id:"focus",
    name:"Focus",
    category:"UTILITY",
    color:"#C9A227",
    icon:"🎯",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:["naoto"],
  },
  {
    id:"fatal-blow",
    name:"Fatal Blow",
    category:"UTILITY",
    color:"#C9A227",
    icon:"💀",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:["naoto"],
  },
  {
    id:"resonance",
    name:"Resonance",
    category:"UTILITY",
    color:"#C9A227",
    icon:"🔊",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },

  // ── DEFENSIVE UTILITY ──
  {
    id:"recovery-field",
    name:"Recovery Field",
    category:"DEFENSE",
    color:"#4ADE80",
    icon:"💚",
    effect:"Recover HP after killing Elite enemies",
    ascended:"Recover more HP after killing Elite enemies",
    tier:"B",
    desc:"Sustain tied to Elite kills. Strongest in Entropy runs with frequent Elite spawns. Pairs with Giant Slayer — kill Elites faster, heal more.",
    builds:["Sustain Build","High Entropy"],
    chars:["ragna","naoto","bullet"],
  },
  {
    id:"damage-shield",
    name:"Damage Shield",
    category:"DEFENSE",
    color:"#4ADE80",
    icon:"🔰",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"adrenaline",
    name:"Adrenaline",
    category:"DEFENSE",
    color:"#4ADE80",
    icon:"⚡",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"iron-will",
    name:"Iron Will",
    category:"DEFENSE",
    color:"#4ADE80",
    icon:"🏋",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },

  // ── ADVANCED / NICHE ──
  {
    id:"phantom-step",
    name:"Phantom Step",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"👻",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"combo-extender",
    name:"Combo Extender",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"🔗",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"legacy-amplifier",
    name:"Legacy Amplifier",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"📡",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"summon-booster",
    name:"Summon Booster",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"🐉",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"overcharge",
    name:"Overcharge",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"⚡",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"hunters-mark",
    name:"Hunter's Mark",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"🎯",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"blood-pact",
    name:"Blood Pact",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"🩸",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"apex-predator",
    name:"Apex Predator",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"👑",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
  {
    id:"chain-reaction",
    name:"Chain Reaction",
    category:"ADVANCED",
    color:"#A78BFA",
    icon:"⛓",
    effect:"[ EFFECT UNVERIFIED — needs in-game confirmation ]",
    ascended:"[ ASCENDED UNVERIFIED ]",
    tier:"?",
    desc:"Effect not yet verified. Submit confirmed data via Data Lab.",
    builds:[],
    chars:[],
  },
];

// ─── RECOMMENDED LOADOUTS (per character build) ──────────────────────────────
const LOADOUTS = {
  "S-TIER DAMAGE (High Entropy 80+)": {
    color:"#E53935",
    desc:"Maximum DPS setup for skilled players who can dodge consistently. Abandon survivability for raw kill speed.",
    crystals:["straightforward","domination","giant-slayer","exhilaration","not-dead-yet","lethal-momentum"],
    notes:"Giant Slayer + Straightforward + Domination forms the core triple damage stack. Exhilaration scales with sustained combat. Not Dead Yet is your only safety net — don't slot anything else survivability-wise unless you're dying repeatedly.",
  },
  "COMBO MACHINE": {
    color:"#C9A227",
    desc:"Centers around maintaining high combo counts for Exhilaration and Defensive Combo's damage reduction synergy.",
    crystals:["exhilaration","defensive-combo","combo-surge","compliment-of-death","not-dead-yet","giant-slayer"],
    notes:"Defensive Combo keeps you protected while you build Exhilaration stacks. Compliment of Death sustains HP during extended combo chains. Best on Taokaka, Noel, and Hibiki.",
  },
  "TANK / SUSTAIN": {
    color:"#4ADE80",
    desc:"Built for surviving high Entropy levels. Sacrifices some damage for consistency and longevity.",
    crystals:["not-dead-yet","indestructible","vital-boost","mixture-enhancement","second-wind","giant-slayer"],
    notes:"Vital Boost + Mixture Enhancement + Second Wind creates three layers of HP recovery. Indestructible flat-reduces all incoming damage. Giant Slayer ensures boss fights don't drag too long. Works on all characters but excels on Bullet and Naoto.",
  },
  "SKILL BURST (Noel/Jin/Es)": {
    color:"#60A5FA",
    desc:"Skill-centric setup maximizing SP frequency and skill damage multipliers.",
    crystals:["domination","lethal-momentum","mana-surge","overcharge","giant-slayer","not-dead-yet"],
    notes:"Domination + Lethal Momentum creates a massive skill damage window every cast. Mana Surge + Overcharge enables near-continuous skill loops. Best on Noel (Drive), Jin (Skill spam), and Es (Crest generation).",
  },
  "TACTIC / SUMMON ZONER (Kokonoe/Rachel/Lambda)": {
    color:"#A78BFA",
    desc:"Tactic and summon-focused setup for characters who deal damage primarily through abilities rather than direct attacks.",
    crystals:["resonance","summon-booster","giant-slayer","domination","not-dead-yet","exhilaration"],
    notes:"Resonance + Summon Booster stacks multiplicatively for massive tactic/summon damage. Exhilaration buffs ALL damage including summons. Best on Kokonoe missiles, Rachel wind/summons, and Lambda blade setups.",
  },
  "CRIT SPECIALIST (Naoto)": {
    color:"#F87171",
    desc:"Full critical hit build designed around Naoto's Blood Edge and crit potential stacking.",
    crystals:["fatal-blow","focus","giant-slayer","straightforward","not-dead-yet","chain-reaction"],
    notes:"Focus + Fatal Blow: maximized crit stats. Naoto's potentials natively boost crit rate, making Fatal Blow's +75% multiplier devastating. Chain Reaction snowballs through packs into bosses at full stacks.",
  },
  "BEGINNER STARTER": {
    color:"#94A3B8",
    desc:"Safe, effective crystals for new players learning the game. Prioritizes survivability while still enabling wins.",
    crystals:["not-dead-yet","mixture-enhancement","second-wind","giant-slayer","straightforward","defensive-combo"],
    notes:"Not Dead Yet + Mixture Enhancement + Second Wind creates a triple safety net. Giant Slayer handles Elite/Boss difficulty spikes. Defensive Combo teaches you the value of staying aggressive. Replace Defensive Combo with Domination or Exhilaration once comfortable.",
  },
};

const CATEGORIES = ["ALL","DAMAGE","SURVIVAL","ECONOMY","UTILITY","DEFENSE","ADVANCED"];
const TIERS = {S:"#E53935",A:"#FF8F00",B:"#1976D2"};

// ─── CRYSTAL ICON RENDERER ─────────────────────────────────────────────────
function CrystalIcon({ crystal, size=48 }) {
  const colors = {
    DAMAGE:"#E53935", SURVIVAL:"#F59E0B", ECONOMY:"#60A5FA",
    UTILITY:"#C9A227", DEFENSE:"#4ADE80", ADVANCED:"#A78BFA",
  };
  const c = colors[crystal.category] || "#888";
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" style={{flexShrink:0}}>
      <defs>
        <linearGradient id={`cg-${crystal.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.3"/>
        </linearGradient>
        <filter id={`glow-${crystal.id}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      {/* Hexagon crystal shape */}
      <polygon points="24,3 41,13 41,35 24,45 7,35 7,13"
        fill={`url(#cg-${crystal.id})`}
        stroke={c} strokeWidth="1.5" opacity="0.9"/>
      {/* Inner highlight */}
      <polygon points="24,8 37,15 37,33 24,40 11,33 11,15"
        fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
      {/* Tier indicator dot */}
      <circle cx="38" cy="10" r="5" fill={TIERS[crystal.tier] || "#888"} stroke="#000" strokeWidth="0.5"/>
      <text x="38" y="14" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="900"
        fontFamily="'Barlow Condensed',sans-serif">{crystal.tier}</text>
      {/* Center glyph */}
      <text x="24" y="29" textAnchor="middle" fontSize="16" fill="#fff"
        filter={`url(#glow-${crystal.id})`}>{crystal.icon}</text>
    </svg>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function MindCrystals({ cfg={}, mob=false }) {
  const [view, setView] = useState("crystals"); // "crystals" | "loadouts"
  const [cat, setCat] = useState("ALL");
  const [sel, setSel] = useState(null);
  const [activeLoadout, setActiveLoadout] = useState(null);

  const S = {
    wrap:{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden", background:"#070707" },
    topBar:{ display:"flex", gap:0, borderBottom:"1px solid #141414", background:"#050505", flexShrink:0, alignItems:"stretch", flexWrap:"wrap" },
    tab:(a)=>({ background:"transparent", border:"none", borderBottom:a?"2px solid #B91C1C":"2px solid transparent", color:a?"#F0EDE5":"#3A3A3A", padding:mob?"8px 12px":"10px 20px", fontSize:mob?10:12, letterSpacing:mob?2:3, fontWeight:900, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", transition:"all 0.12s", textTransform:"uppercase", whiteSpace:"nowrap" }),
    catBtn:(a)=>({ background:a?"#1A0A0A":"transparent", border:"none", borderBottom:a?"2px solid #B91C1C":"2px solid transparent", color:a?"#C0C0C0":"#3A3A3A", padding:mob?"6px 10px":"8px 14px", fontSize:mob?9:10, letterSpacing:mob?1:2, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", transition:"all 0.12s", textTransform:"uppercase", whiteSpace:"nowrap" }),
    body:{ display:"flex", flex:1, overflow:"hidden", flexDirection:mob?"column":"row" },
    grid:{ flex:1, overflowY:"auto", padding:mob?"10px":"16px 20px", display:"grid", gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(160px,1fr))", gap:mob?8:12 },
    card:{ background:"#0D0D0D", border:"1px solid #1A1A1A", padding:mob?"10px 8px":"14px 12px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.12s", borderRadius:0 },
    cardActive:{ border:"1px solid #B91C1C", background:"#130808" },
    detail:{ width:mob?"100%":"340px", borderLeft:mob?"none":"1px solid #141414", borderTop:mob?"1px solid #141414":"none", maxHeight:mob?"52vh":"none", overflowY:"auto", background:"#080808", flexShrink:0 },
    label:{ fontSize:10, letterSpacing:3, color:"#3A3A3A", fontWeight:700, marginBottom:8, fontFamily:"'Barlow Condensed',sans-serif" },
    h2:{ fontSize:mob?14:18, fontWeight:900, letterSpacing:mob?1:2, color:"#F0EDE5", fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1.1 },
    effectBox:{ background:"#0B0B0B", border:"1px solid #1A1A1A", borderLeft:"3px solid #B91C1C", padding:mob?"8px 10px":"10px 14px", fontFamily:"'Courier Prime',monospace", fontSize:mob?11:13, color:"#C9A227", marginBottom:8, wordBreak:"break-word" },
    tag:(col)=>({ display:"inline-flex", alignItems:"center", background:`${col}1A`, color:col, border:`1px solid ${col}40`, padding:"2px 8px", fontSize:10, fontWeight:900, letterSpacing:1, fontFamily:"'Barlow Condensed',sans-serif", marginRight:4, marginBottom:4 }),
    loadoutCard:(col)=>({ background:"#0D0D0D", border:`1px solid ${col}33`, padding:"14px 16px", marginBottom:12, cursor:"pointer", transition:"all 0.12s" }),
    loadoutActive:(col)=>({ background:`${col}0D`, border:`1px solid ${col}`, padding:"14px 16px", marginBottom:12, cursor:"pointer" }),
    slot:{ width:mob?36:44, height:mob?36:44, border:"2px solid #2A2A2A", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.12s" },
    slotFilled:(col)=>({ width:mob?36:44, height:mob?36:44, border:`2px solid ${col}`, background:`${col}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer" }),
  };

  const filtered = cat === "ALL" ? CRYSTALS : CRYSTALS.filter(c=>c.category===cat);
  const selCrystal = CRYSTALS.find(c=>c.id===sel);

  const catColors = { DAMAGE:"#E53935", SURVIVAL:"#F59E0B", ECONOMY:"#60A5FA", UTILITY:"#C9A227", DEFENSE:"#4ADE80", ADVANCED:"#A78BFA" };

  return (
    <div style={S.wrap}>
      {/* TOP BAR */}
      <div style={S.topBar}>
        <button style={S.tab(view==="crystals")} onClick={()=>setView("crystals")}>ALL CRYSTALS</button>
        <button style={S.tab(view==="loadouts")} onClick={()=>setView("loadouts")}>LOADOUT GUIDE</button>
        <div style={{flex:1}}/>
        {!mob && <div style={{display:"flex",alignItems:"center",padding:"0 12px",fontSize:10,color:"#2A2A2A",letterSpacing:2}}>6 SLOTS MAX • {CRYSTALS.length} TOTAL</div>}
      </div>

      {/* CATEGORY FILTER (crystals view) */}
      {view==="crystals" && (
        <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #0F0F0F",background:"#040404",flexShrink:0,WebkitOverflowScrolling:"touch"}}>
          {CATEGORIES.map(c=>(
            <button key={c} style={S.catBtn(cat===c)} onClick={()=>{setCat(c);setSel(null);}}>
              {c}{c!=="ALL" && <span style={{color:catColors[c],marginLeft:4}}>●</span>}
            </button>
          ))}
        </div>
      )}

      {/* CRYSTALS VIEW */}
      {view==="crystals" && (
        <div style={S.body}>
          {/* GRID */}
          <div style={S.grid}>
            {filtered.map(cr=>(
              <div key={cr.id}
                style={{...S.card,...(sel===cr.id?S.cardActive:{})}}
                onClick={()=>setSel(sel===cr.id?null:cr.id)}
              >
                <CrystalIcon crystal={cr} size={mob?40:48}/>
                <div style={{fontSize:mob?8:11,fontWeight:900,letterSpacing:mob?0:1,color:sel===cr.id?"#F0EDE5":"#8A8A8A",textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%"}}>
                  {cr.name}
                </div>
                <div style={{fontSize:9,color:catColors[cr.category]||"#444",letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase"}}>
                  {cr.category}
                </div>
              </div>
            ))}
          </div>

          {/* DETAIL PANEL */}
          {selCrystal && (
            <div style={S.detail}>
              <div style={{padding:"16px 16px 12px",borderBottom:"1px solid #141414",display:"flex",alignItems:"center",gap:12}}>
                <CrystalIcon crystal={selCrystal} size={56}/>
                <div>
                  <div style={{fontSize:10,letterSpacing:3,color:catColors[selCrystal.category],marginBottom:3}}>{selCrystal.category}</div>
                  <div style={S.h2}>{selCrystal.name}</div>
                  <div style={{display:"flex",gap:6,marginTop:4}}>
                    <span style={{...S.tag(TIERS[selCrystal.tier]),fontSize:11}}>TIER {selCrystal.tier}</span>
                    <span style={{...S.tag(catColors[selCrystal.category]||"#888"),fontSize:10}}>5 SHARDS</span>
                  </div>
                </div>
              </div>

              <div style={{padding:"14px 16px"}}>
                <div style={S.label}>BASE EFFECT</div>
                <div style={S.effectBox}>{selCrystal.effect}</div>

                <div style={S.label}>ASCENDED</div>
                <div style={{...S.effectBox,borderColor:"#C9A227",color:"#C9A227",marginBottom:14}}>{selCrystal.ascended} <span style={{color:"#4A4A4A",fontSize:11}}>(max AP)</span></div>

                <div style={S.label}>TACTICAL ANALYSIS</div>
                <div style={{fontSize:13,color:"#888",lineHeight:1.7,marginBottom:14,fontFamily:"'Courier Prime',monospace"}}>{selCrystal.desc}</div>

                <div style={S.label}>SYNERGY BUILDS</div>
                <div style={{display:"flex",flexWrap:"wrap",marginBottom:14}}>
                  {selCrystal.builds.map(b=>(
                    <span key={b} style={S.tag("#B91C1C")}>{b}</span>
                  ))}
                </div>

                <div style={S.label}>BEST CHARACTERS</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {selCrystal.chars.map(cid=>{
                    const colorMap = { hibiki:"#7B8FE4",ragna:"#D93025",jin:"#4EA8D8",kokonoe:"#E8714A",es:"#E878A0",noel:"#60A5FA",rachel:"#D8B4FE",taokaka:"#FCD34D",lambda:"#6EE7B7",mai:"#FB923C",hazama:"#86EFAC",hakumen:"#F1F5F9",bullet:"#F97316",naoto:"#F87171",icey:"#A78BFA",prisoner:"#94A3B8" };
                    const nameMap = { hibiki:"Hibiki",ragna:"Ragna",jin:"Jin",kokonoe:"Kokonoe",es:"Es",noel:"Noel",rachel:"Rachel",taokaka:"Taokaka",lambda:"Lambda",mai:"Mai",hazama:"Hazama",hakumen:"Hakumen",bullet:"Bullet",naoto:"Naoto",icey:"ICEY",prisoner:"Prisoner" };
                    return <span key={cid} style={S.tag(colorMap[cid]||"#888")}>{nameMap[cid]||cid}</span>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOADOUTS VIEW */}
      {view==="loadouts" && (
        <div style={{flex:1,overflowY:"auto",padding:mob?"10px":"20px 24px"}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,letterSpacing:3,color:"#3A3A3A",fontWeight:700,marginBottom:4}}>RECOMMENDED CRYSTAL SETUPS</div>
            <div style={{fontSize:12,color:"#484848",fontFamily:"'Courier Prime',monospace",letterSpacing:1}}>
              Select a loadout to see the 6-crystal setup and strategic breakdown. All crystals assume max Ascension level.
            </div>
          </div>

          {Object.entries(LOADOUTS).map(([name, ld])=>{
            const isActive = activeLoadout === name;
            return (
              <div key={name} style={isActive?S.loadoutActive(ld.color):S.loadoutCard(ld.color)}
                onClick={()=>setActiveLoadout(isActive?null:name)}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:isActive?12:0}}>
                  <div>
                    <div style={{fontSize:mob?12:14,fontWeight:900,letterSpacing:mob?1:2,color:ld.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{name}</div>
                    {!isActive && <div style={{fontSize:mob?9:11,color:"#484848",marginTop:3,fontFamily:"'Courier Prime',monospace"}}>{ld.desc.slice(0,mob?50:70)}...</div>}
                  </div>
                  <div style={{color:"#3A3A3A",fontSize:18,fontWeight:900}}>{isActive?"▲":"▼"}</div>
                </div>

                {isActive && (
                  <>
                    <div style={{fontSize:12,color:"#787878",marginBottom:14,fontFamily:"'Courier Prime',monospace",lineHeight:1.6}}>{ld.desc}</div>

                    {/* Crystal slots */}
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:10,letterSpacing:3,color:"#3A3A3A",fontWeight:700,marginBottom:8}}>6 CRYSTAL LOADOUT</div>
                      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(6,1fr)",gap:mob?8:6}}>
                        {ld.crystals.map((cid,i)=>{
                          const cr = CRYSTALS.find(c=>c.id===cid);
                          if(!cr) return <div key={i} style={S.slot}><span style={{color:"#2A2A2A",fontSize:10}}>?</span></div>;
                          return (
                            <div key={cid} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}
                              onClick={e=>{e.stopPropagation();setView("crystals");setSel(cid);}}>
                              <div style={S.slotFilled(cr.color)}>
                                <CrystalIcon crystal={cr} size={mob?30:36}/>
                              </div>
                              <div style={{fontSize:mob?7:8,color:"#686868",letterSpacing:0.5,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1.1,maxWidth:50}}>
                                {cr.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{background:"#0A0A0A",border:"1px solid #1A1A1A",borderLeft:`3px solid ${ld.color}`,padding:"10px 14px"}}>
                      <div style={{fontSize:10,letterSpacing:3,color:"#3A3A3A",fontWeight:700,marginBottom:6}}>STRATEGY NOTES</div>
                      <div style={{fontSize:mob?10:12,color:"#888",lineHeight:1.6,fontFamily:"'Courier Prime',monospace",wordBreak:"break-word"}}>{ld.notes}</div>
                    </div>

                    {/* Individual crystal effects */}
                    <div style={{marginTop:12}}>
                      <div style={{fontSize:10,letterSpacing:3,color:"#3A3A3A",fontWeight:700,marginBottom:8}}>SLOT BREAKDOWN</div>
                      {ld.crystals.map(cid=>{
                        const cr = CRYSTALS.find(c=>c.id===cid);
                        if(!cr) return null;
                        const cc = catColors[cr.category]||"#888";
                        return (
                          <div key={cid} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8,padding:"8px 10px",background:"#080808",borderLeft:`2px solid ${cc}`}}>
                            <CrystalIcon crystal={cr} size={32}/>
                            <div>
                              <div style={{fontSize:mob?10:12,fontWeight:900,color:"#C0C0C0",letterSpacing:mob?0:1,fontFamily:"'Barlow Condensed',sans-serif"}}>{cr.name}</div>
                              <div style={{fontSize:mob?9:11,color:cc,fontFamily:"'Courier Prime',monospace",wordBreak:"break-word"}}>{cr.ascended}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
