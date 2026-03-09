import React, { useState, useRef, useCallback } from "react";

// ─── DEFAULT TIER RANKINGS ─────────────────────────────────────────────────────
// Characters: based on build ceiling, consistency, and Omega entropy viability
const DEFAULT_CHARS = {
  S:  ["hibiki","jin","hakumen","ragna","naoto"],
  "A+":[  "taokaka","noel","es","bullet","kokonoe"],
  A:  ["lambda","rachel","hazama","mai"],
  "B+":["icey","prisoner"],
  B:  [],
  C:  [],
};

// Tactics: ranked by universal applicability + peak multiplier at Legendary
const DEFAULT_TACTICS = {
  S:  ["atk-cold","sk-cold","sum-orb","leg-blackhole","sk-proj"],
  "A+":["atk-shadow","leg-ring","atk-thunder","sk-spear","dash-thunder"],
  A:  ["sum-chain","atk-burn","sk-burn","leg-icespike","sk-spirit"],
  "B+":["dash-shadow","dash-blade","sk-mine","sum-frost"],
  B:  [],
  C:  [],
};

// Crystals: ranked by consistent impact across all chars and entropy levels
const DEFAULT_CRYSTALS = {
  S:  ["exhilaration","not-dead-yet","giant-slayer","defensive-combo","resonance"],
  "A+":["straightforward","domination","fatal-blow","focus","summon-booster","legacy-amplifier"],
  A:  ["vital-boost","blood-pact","apex-predator","chain-reaction","phantom-step","ice-fortune"],
  "B+":["lethal-momentum","predator","combo-surge","hunters-mark","fire-fortune","umbra-fortune"],
  B:  ["mana-surge","mixture-enhancement","indestructible","damage-shield","combo-extender","overcharge"],
  C:  ["point-surge","store-regen","second-wind","iron-will","adrenaline","recovery-field","light-fortune","electric-fortune"],
};

// ─── ITEM METADATA ─────────────────────────────────────────────────────────────
const CHAR_META = {
  hibiki:   { name:"Hibiki Kohaku",   tag:"SHADOW / CLONE",   color:"#7B8FE4", note:"Clone x3 tactic procs. Best autonomous DPS source in the game." },
  ragna:    { name:"Ragna",           tag:"BLOOD / LIFESTEAL",color:"#D93025", note:"Blood Kain sub-50% = +30% all damage. Self-sustaining at skill." },
  jin:      { name:"Jin Kisaragi",    tag:"ICE / CONTROL",    color:"#4EA8D8", note:"Double Cold stack + Freeze hold. Best setup character." },
  kokonoe:  { name:"Kokonoe",         tag:"AERIAL / SCIENCE", color:"#E8714A", note:"Aerial immunity to ground threats. Missile Rain 10-proj burst." },
  es:       { name:"Es",              tag:"CREST / TRAP",     color:"#E878A0", note:"Crest field + aerial bounce = 3+ mine detonations per hit." },
  noel:     { name:"Noel Vermillion", tag:"DRIVE / RAPID",    color:"#60A5FA", note:"Drive: 9 hits/sec. Fastest practical Exhilaration stacker." },
  rachel:   { name:"Rachel Alucard",  tag:"BAT / SUMMON",     color:"#D8B4FE", note:"Bats proc Chain Lightning autonomously. Zero floor DPS." },
  taokaka:  { name:"Taokaka",         tag:"RUSH / SPEED",     color:"#FCD34D", note:"11 hits/sec rush. Fastest Exhilaration cap in the roster." },
  lambda:   { name:"Lambda-11",       tag:"SWORD / TURRET",   color:"#6EE7B7", note:"4 autonomous sword turrets copy all tactic procs independently." },
  mai:      { name:"Mai Natsume",     tag:"NEEDLE / RANGE",   color:"#FB923C", note:"8 needle procs per cast. Highest multi-proc rate of any skill." },
  hazama:   { name:"Hazama",          tag:"CHAIN / DoT",      color:"#86EFAC", note:"Chain whip hits 3-5 targets simultaneously every swing." },
  hakumen:  { name:"Hakumen",         tag:"COUNTER / VOID",   color:"#F1F5F9", note:"Magatama x2 multiplier. DEATH SENTENCE with Naoto is S+ ceiling." },
  bullet:   { name:"Bullet",          tag:"CQC / DRIVE",      color:"#F97316", note:"Steel Shell: 3 extra HP bars per room. Safest aggressive char." },
  naoto:    { name:"Naoto Kurogane",  tag:"EXECUTE / BLOOD",  color:"#F87171", note:"Hunter's Eye at 30% HP. Fatal Blow + Focus = consistent crit execute." },
  icey:     { name:"ICEY",            tag:"DANCE / PIXEL",    color:"#A78BFA", note:"Dance Attack = full invincibility + omnidirectional offense." },
  prisoner: { name:"The Prisoner",    tag:"WEAPON / ADAPT",   color:"#94A3B8", note:"Weapon variety enables any tactic build. Most run-consistent char." },
};

const TACTIC_META = {
  "atk-cold":    { name:"Attack Cold",     slot:"ATK",  elem:"ice",      color:"#60B8D4", note:"+46% ATK damage. Slows all enemies hit. Universal S-pick." },
  "atk-shadow":  { name:"Shadow Spike",    slot:"ATK",  elem:"umbra",    color:"#A855F7", note:"275/hit proc. Hibiki clones = 275×3=825/attack." },
  "atk-burn":    { name:"Attack Burn",     slot:"ATK",  elem:"fire",     color:"#E53935", note:"260 DoT/s per hit. Multi-target stacks independently." },
  "atk-thunder": { name:"Chain Lightning", slot:"ATK",  elem:"electric", color:"#22C55E", note:"295 × 3 enemies. Best AoE ATK tactic in game." },
  "sk-cold":     { name:"Skill Cold",      slot:"SKILL",elem:"ice",      color:"#60B8D4", note:"+47% all skill damage. Pairs with ATK Cold for double stack." },
  "sk-burn":     { name:"Skill Burn",      slot:"SKILL",elem:"fire",     color:"#E53935", note:"360 DoT/s. Higher rate than ATK Burn." },
  "sk-spear":    { name:"Light Spear",     slot:"SKILL",elem:"light",    color:"#EAB308", note:"490 flat/skill. Universal boss damage slot." },
  "sk-proj":     { name:"Fire Projectile", slot:"SKILL",elem:"fire",     color:"#E53935", note:"280×10 projectiles. 2800/cast at close range." },
  "sk-mine":     { name:"Place Mine",      slot:"SKILL",elem:"fire",     color:"#E53935", note:"570/mine. Es aerial bounce = 3 mines per string." },
  "sk-spirit":   { name:"Fire Spirit",     slot:"SKILL",elem:"fire",     color:"#E53935", note:"190/hit autonomous spirit follows target." },
  "dash-thunder":{ name:"Thunderbolt",     slot:"DASH", elem:"light",    color:"#EAB308", note:"325 chain on dash. Pairs with Orb for DPS baseline." },
  "dash-shadow": { name:"Dash Shadow",     slot:"DASH", elem:"umbra",    color:"#A855F7", note:"200 on every dodge. Best on high-dodge chars." },
  "dash-blade":  { name:"Blade Slash",     slot:"DASH", elem:"blade",    color:"#94A3B8", note:"220 physical on dash. Reliable no-element filler." },
  "leg-spear":   { name:"Light Spear",     slot:"LEG",  elem:"light",    color:"#EAB308", note:"490/hit legacy. Hakumen: +Magatama ×2 = 1470." },
  "leg-blackhole":{ name:"Blackhole",      slot:"LEG",  elem:"umbra",    color:"#A855F7", note:"Full-screen CC. Zero damage but S-tier room control." },
  "leg-ring":    { name:"Ring of Fire",    slot:"LEG",  elem:"fire",     color:"#E53935", note:"770 burst. Double upgrade = full-screen AoE." },
  "leg-icespike":{ name:"Ice Spike",       slot:"LEG",  elem:"ice",      color:"#60B8D4", note:"350 turret. Respawn Double = permanent auto-turrets." },
  "sum-orb":     { name:"Lightning Orb",   slot:"SUM",  elem:"electric", color:"#22C55E", note:"245 DPS persistent field. Character-neutral S-tier." },
  "sum-chain":   { name:"Chain Lightning", slot:"SUM",  elem:"light",    color:"#EAB308", note:"295×3 bounce summon. Rachel bats proc this." },
  "sum-frost":   { name:"Frost Burst",     slot:"SUM",  elem:"ice",      color:"#60B8D4", note:"520 AoE at max Cold stacks. Wide room clear." },
};

const CRYSTAL_META = {
  "straightforward":   { name:"Straightforward",    cat:"DMG",  color:"#E53935", note:"+45% ATK DMG (Asc). Stacks multiplicatively with Domination." },
  "domination":        { name:"Domination",          cat:"DMG",  color:"#E53935", note:"+45% Skill DMG (Asc). Kokonoe/Es best-in-slot always." },
  "giant-slayer":      { name:"Giant Slayer",        cat:"DMG",  color:"#E53935", note:"+60% vs Elites (Asc). Every boss fight is +60%." },
  "combo-surge":       { name:"Combo Surge",         cat:"DMG",  color:"#E53935", note:"+5%/10 combos cap 250%. Faster cap than Exhilaration." },
  "lethal-momentum":   { name:"Lethal Momentum",     cat:"DMG",  color:"#E53935", note:"+45% ATK 6s after skill. High uptime on skill-heavy builds." },
  "predator":          { name:"Predator",            cat:"DMG",  color:"#E53935", note:"+75% vs sub-30% HP. Execution window spike." },
  "not-dead-yet":      { name:"Not Dead Yet",        cat:"SURV", color:"#F59E0B", note:"Cheat death once + 70% HP bonus. Run insurance." },
  "indestructible":    { name:"Indestructible",      cat:"SURV", color:"#F59E0B", note:"-30% DMG recv. Safe but competes with DMG slots." },
  "defensive-combo":   { name:"Defensive Combo",     cat:"SURV", color:"#F59E0B", note:"-80% DMG recv in combo. Attack IS the defense." },
  "vital-boost":       { name:"Vital Boost",         cat:"SURV", color:"#F59E0B", note:"+100% Max HP (Asc). Doubles Blood Scythe heal ceiling." },
  "compliment-of-death":{ name:"Compliment of Death",cat:"SURV", color:"#F59E0B", note:"Heal 15%/20 combo. Passive sustain during Exhilaration." },
  "second-wind":       { name:"Second Wind",         cat:"SURV", color:"#F59E0B", note:"Full heal on room entry below 100%. Passive regen." },
  "store-regen":       { name:"Commerce Healing",    cat:"SURV", color:"#F59E0B", note:"Heal on shop buy. Economically dependent." },
  "mana-surge":        { name:"Mana Surge",          cat:"ECO",  color:"#60A5FA", note:"+80MP (Asc). Enables extra skill cast per rotation." },
  "mixture-enhancement":{ name:"Mixture Enhancement",cat:"ECO",  color:"#60A5FA", note:"+3 potions + 35% effect. Safety net for high entropy." },
  "point-surge":       { name:"Point Surge",         cat:"ECO",  color:"#60A5FA", note:"+45% Exchange Pts. Gambling economy, not DPS." },
  "ice-fortune":       { name:"Ice Fortune",         cat:"ECO",  color:"#60B8D4", note:"Cold tactic guaranteed. Removes all ice RNG from run." },
  "fire-fortune":      { name:"Fire Fortune",        cat:"ECO",  color:"#E84E25", note:"Fire tactic guaranteed. Critical for Burn/DoT builds." },
  "umbra-fortune":     { name:"Umbra Fortune",       cat:"ECO",  color:"#A855F7", note:"Umbra tactic guaranteed. Shadow Spike lock-in." },
  "light-fortune":     { name:"Light Fortune",       cat:"ECO",  color:"#EDB72C", note:"Light tactic guaranteed. Light Spear/Thunderbolt builds." },
  "electric-fortune":  { name:"Electric Fortune",    cat:"ECO",  color:"#22C55E", note:"Electric guaranteed. Orb/Chain Lightning builds." },
  "exhilaration":      { name:"Exhilaration",        cat:"UTIL", color:"#C9A227", note:"+5%/10 combo ALL DMG cap 250%. Best universal DPS scaler." },
  "focus":             { name:"Focus",               cat:"UTIL", color:"#C9A227", note:"+25% crit rate (Asc). Pairs with Fatal Blow for execute." },
  "fatal-blow":        { name:"Fatal Blow",          cat:"UTIL", color:"#C9A227", note:"+75% crit DMG (Asc). Naoto execute window x1.75." },
  "resonance":         { name:"Resonance",           cat:"UTIL", color:"#C9A227", note:"+40% tactic DMG (Asc). Multiplies ALL tactic procs." },
  "recovery-field":    { name:"Recovery Field",      cat:"DEF",  color:"#4ADE80", note:"HP on elite kill. Inconsistent — RNG elite rate." },
  "damage-shield":     { name:"Damage Shield",       cat:"DEF",  color:"#4ADE80", note:"150 absorb/hit (Asc). Thin protection vs Omega enemies." },
  "adrenaline":        { name:"Adrenaline",          cat:"DEF",  color:"#4ADE80", note:"+30% speed <50% HP. Mobility at low HP = high risk." },
  "iron-will":         { name:"Iron Will",           cat:"DEF",  color:"#4ADE80", note:"Super armor <40% HP (Asc). Niche. Not reliable." },
  "phantom-step":      { name:"Phantom Step",        cat:"ADV",  color:"#A78BFA", note:"Dash iframes. Repositioning chars = full invincibility." },
  "combo-extender":    { name:"Combo Extender",      cat:"ADV",  color:"#A78BFA", note:"+60% combo timer. Exhilaration stacks decay slower." },
  "legacy-amplifier":  { name:"Legacy Amplifier",    cat:"ADV",  color:"#A78BFA", note:"+50% Legacy DMG. Hakumen x2 Magatama x1.5 = x3." },
  "summon-booster":    { name:"Summon Booster",      cat:"ADV",  color:"#A78BFA", note:"+45% summon DMG. Lambda/Rachel/Hibiki best-in-slot." },
  "overcharge":        { name:"Overcharge",          cat:"ADV",  color:"#A78BFA", note:"+40% SP gain (Asc). Skill rotation chars only." },
  "hunters-mark":      { name:"Hunter's Mark",       cat:"ADV",  color:"#A78BFA", note:"+30% DMG on marked target from ALL sources." },
  "blood-pact":        { name:"Blood Pact",          cat:"ADV",  color:"#A78BFA", note:"+35% HP-cost ability DMG. Ragna+Naoto S-tier specific." },
  "apex-predator":     { name:"Apex Predator",       cat:"ADV",  color:"#A78BFA", note:"+35% at full HP. Counter chars restore HP — consistent." },
  "chain-reaction":    { name:"Chain Reaction",      cat:"ADV",  color:"#A78BFA", note:"+12%/kill×3 (Asc). Kill chain rooms = 36% sustained." },
};

const TIER_ROWS = ["S","A+","A","B+","B","C"];
const TIER_COLORS = { S:"#E53935", "A+":"#F97316", A:"#EAB308", "B+":"#22C55E", B:"#60A5FA", C:"#A855F7" };
const TIER_BG     = { S:"#1A0505", "A+":"#1A0B00", A:"#141000", "B+":"#071408", B:"#05101A", C:"#100514" };
const STORAGE_KEYS = { chars:"eo-tier-chars-v1", tactics:"eo-tier-tactics-v1", crystals:"eo-tier-crystals-v1" };

function loadTiers(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return JSON.parse(JSON.stringify(defaults));
}
function saveTiers(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Item chip ─────────────────────────────────────────────────────────────────
function ItemChip({ id, type, isDragging, onDragStart, onDragEnd, selected, onClick }) {
  const meta = type === "chars" ? CHAR_META[id] : type === "tactics" ? TACTIC_META[id] : CRYSTAL_META[id];
  if (!meta) return null;
  const color = meta.color;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(id)}
      title={meta.name + "\n" + meta.note}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        cursor:"grab", userSelect:"none",
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? "scale(0.95)" : "scale(1)",
        transition:"transform 0.1s, opacity 0.1s",
        outline: selected ? `2px solid ${color}` : "none",
        outlineOffset: 2,
        borderRadius: 2,
        padding:"3px",
      }}
    >
      {type === "chars" ? (
        <div style={{
          width: 48, height: 62,
          overflow:"hidden",
          clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)",
          background:"#111",
          flexShrink:0,
          boxShadow:`0 0 8px ${color}44`,
          border:`1px solid ${color}33`,
        }}>
          <img
            src={`/chars/${id}.png`} alt={meta.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }}
            onError={e => {
              e.target.style.display = "none";
              e.target.parentElement.style.background = color + "22";
            }}
          />
        </div>
      ) : (
        <div style={{
          width: 46, height: 46,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:`${color}15`,
          border:`1px solid ${color}44`,
          clipPath:"polygon(12% 0,88% 0,100% 12%,100% 88%,88% 100%,12% 100%,0 88%,0 12%)",
          flexShrink:0,
          boxShadow:`0 0 6px ${color}33`,
          position:"relative",
        }}>
          <span style={{ fontSize:10, fontWeight:900, color, letterSpacing:0.5, fontFamily:"'Barlow Condensed',sans-serif", textAlign:"center", lineHeight:1, padding:"0 2px" }}>
            {type === "tactics"
              ? (TACTIC_META[id]?.slot || "?")
              : (CRYSTAL_META[id]?.cat || "?")}
          </span>
        </div>
      )}
      <div style={{
        fontSize: 8, fontWeight:700, color:"#686868", letterSpacing:0.4,
        textAlign:"center", lineHeight:1.1,
        maxWidth: 52, overflow:"hidden",
        whiteSpace:"nowrap", textOverflow:"ellipsis",
        fontFamily:"'Barlow Condensed',sans-serif",
      }}>
        {meta.name.split(" ").slice(0,2).join(" ").toUpperCase()}
      </div>
    </div>
  );
}

// ── Info panel ────────────────────────────────────────────────────────────────
function InfoPanel({ id, type }) {
  if (!id) return (
    <div style={{ padding:"24px 20px", color:"#2A2A2A", fontSize:11, letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", textAlign:"center" }}>
      CLICK ANY ITEM FOR DETAILS
    </div>
  );
  const meta = type === "chars" ? CHAR_META[id] : type === "tactics" ? TACTIC_META[id] : CRYSTAL_META[id];
  const color = meta?.color || "#888";
  return (
    <div style={{ padding:"16px 18px" }}>
      {type === "chars" && (
        <div style={{ width:"100%", height:120, overflow:"hidden", marginBottom:12, clipPath:"polygon(0 0,100% 0,96% 100%,0 100%)", background:"#0A0A0A", border:`1px solid ${color}22` }}>
          <img src={`/chars/${id}.png`} alt={id} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", filter:"brightness(0.8) saturate(0.9)" }} onError={e=>{e.target.style.display="none"}}/>
        </div>
      )}
      <div style={{ fontSize:16, fontWeight:900, color, letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:3 }}>{meta?.name?.toUpperCase()}</div>
      <div style={{ fontSize:9, letterSpacing:3, color:"#444", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:10 }}>
        {type === "chars" ? meta?.tag : type === "tactics" ? `${meta?.slot} SLOT · ${meta?.elem?.toUpperCase()}` : `${meta?.cat} CLASS`}
      </div>
      <div style={{ fontSize:11, color:"#888", lineHeight:1.6, fontFamily:"'Courier Prime',monospace", borderLeft:`2px solid ${color}55`, paddingLeft:10 }}>
        {meta?.note}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TierList({ mob = false }) {
  const [mode, setMode] = useState("chars"); // chars | tactics | crystals
  const [tiers, setTiers] = useState({
    chars:   loadTiers(STORAGE_KEYS.chars,   DEFAULT_CHARS),
    tactics: loadTiers(STORAGE_KEYS.tactics, DEFAULT_TACTICS),
    crystals:loadTiers(STORAGE_KEYS.crystals,DEFAULT_CRYSTALS),
  });
  const [dragging, setDragging] = useState(null); // { id, fromTier }
  const [dragOver, setDragOver] = useState(null); // tier row being hovered
  const [selected, setSelected] = useState(null);
  const [copied, setCopied]     = useState(false);
  const dragCounter = useRef({});

  const current = tiers[mode];

  // ── Drag handlers ───────────────────────────────────────────────────────────
  function handleDragStart(e, id) {
    let fromTier = null;
    TIER_ROWS.forEach(t => { if ((current[t]||[]).includes(id)) fromTier = t; });
    setDragging({ id, fromTier });
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() { setDragging(null); setDragOver(null); }

  function handleDragEnter(e, tier) {
    e.preventDefault();
    dragCounter.current[tier] = (dragCounter.current[tier] || 0) + 1;
    setDragOver(tier);
  }

  function handleDragLeave(e, tier) {
    dragCounter.current[tier] = Math.max(0, (dragCounter.current[tier] || 1) - 1);
    if (dragCounter.current[tier] === 0) setDragOver(null);
  }

  function handleDrop(e, toTier) {
    e.preventDefault();
    dragCounter.current = {};
    if (!dragging) return;
    const { id, fromTier } = dragging;
    if (fromTier === toTier) { setDragging(null); setDragOver(null); return; }

    const next = JSON.parse(JSON.stringify(current));
    if (fromTier) next[fromTier] = (next[fromTier]||[]).filter(x => x !== id);
    if (!next[toTier]) next[toTier] = [];
    if (!next[toTier].includes(id)) next[toTier].push(id);

    const updated = { ...tiers, [mode]: next };
    setTiers(updated);
    saveTiers(STORAGE_KEYS[mode], next);
    setDragging(null); setDragOver(null);
  }

  function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }

  function handleClick(id) {
    setSelected(prev => prev === id ? null : id);
  }

  function handleReset() {
    const defaults = mode === "chars" ? DEFAULT_CHARS : mode === "tactics" ? DEFAULT_TACTICS : DEFAULT_CRYSTALS;
    const fresh = JSON.parse(JSON.stringify(defaults));
    setTiers(t => ({ ...t, [mode]: fresh }));
    saveTiers(STORAGE_KEYS[mode], fresh);
    setSelected(null);
  }

  function handleCopyText() {
    const lines = [`ENTROPY OVERRIDE — ${mode.toUpperCase()} TIER LIST`, ""];
    TIER_ROWS.forEach(t => {
      const items = (current[t]||[]);
      if (items.length === 0) return;
      const meta = mode === "chars" ? CHAR_META : mode === "tactics" ? TACTIC_META : CRYSTAL_META;
      const names = items.map(id => meta[id]?.name || id).join(", ");
      lines.push(`${t.padEnd(3)} | ${names}`);
    });
    const text = lines.join("\n");
    try { navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea"); el.value = text;
      document.body.appendChild(el); el.select(); document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const S = {
    wrap:     { display:"flex", flexDirection:"column", height:"100%", background:"#050505", overflow:"hidden" },
    topBar:   { display:"flex", alignItems:"center", borderBottom:"1px solid #111", background:"#060606", flexShrink:0, padding:"0 16px", gap:0 },
    modeBtn:  (a) => ({
      padding: mob ? "10px 12px" : "12px 22px",
      fontSize: mob ? 10 : 11,
      letterSpacing: mob ? 2 : 3,
      fontWeight:900,
      fontFamily:"'Barlow Condensed',sans-serif",
      background: a ? "#0D0D0D" : "transparent",
      border:"none",
      borderBottom: a ? "2px solid #B91C1C" : "2px solid transparent",
      color: a ? "#F0EDE5" : "#363636",
      cursor:"pointer",
      transition:"all 0.15s",
    }),
    actionBtn:(col) => ({
      marginLeft:"auto", padding:"6px 14px", fontSize:10, letterSpacing:2, fontWeight:700,
      fontFamily:"'Barlow Condensed',sans-serif", cursor:"pointer",
      background:"transparent", border:`1px solid ${col}`,
      color:col, transition:"all 0.12s",
    }),
    body:     { display:"flex", flex:1, overflow:"hidden", flexDirection: mob ? "column" : "row" },
    tiersWrap:{ flex:1, overflowY:"auto", padding: mob ? "10px 8px" : "14px 16px", display:"flex", flexDirection:"column", gap:6 },
    row:      (tier, over) => ({
      display:"flex", alignItems:"stretch",
      background: over ? `${TIER_BG[tier]}AA` : TIER_BG[tier],
      border:`1px solid ${over ? TIER_COLORS[tier]+"66" : "#111"}`,
      outline: over ? `1px solid ${TIER_COLORS[tier]}44` : "none",
      transition:"all 0.12s", minHeight:80,
    }),
    rowLabel: (tier) => ({
      width: mob ? 36 : 52, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:`${TIER_COLORS[tier]}18`,
      borderRight:`2px solid ${TIER_COLORS[tier]}55`,
      fontSize: mob ? 16 : 20,
      fontWeight:900, color:TIER_COLORS[tier],
      fontFamily:"'Barlow Condensed',sans-serif",
      letterSpacing: mob ? 0 : 1,
      userSelect:"none",
    }),
    rowItems: { display:"flex", flexWrap:"wrap", gap:6, padding:"8px 10px", flex:1, alignContent:"flex-start", alignItems:"flex-start" },
    dropZone: (over) => ({ flex:1, minHeight:64, display:"flex", alignItems:"center", justifyContent: "flex-start" }),
    info:     { width: mob ? "100%" : 200, flexShrink:0, borderLeft:"1px solid #0E0E0E", overflowY:"auto", background:"#060606" },
    emptyHint:{ fontSize:9, letterSpacing:2, color:"#1A1A1A", fontFamily:"'Barlow Condensed',sans-serif", padding:"0 10px", alignSelf:"center" },
  };

  const allMeta = mode === "chars" ? CHAR_META : mode === "tactics" ? TACTIC_META : CRYSTAL_META;
  const allIds  = Object.keys(allMeta);
  // collect all placed IDs
  const placed  = new Set(TIER_ROWS.flatMap(t => current[t]||[]));
  const unplaced = allIds.filter(id => !placed.has(id));

  return (
    <div style={S.wrap}>
      {/* Top bar */}
      <div style={S.topBar}>
        {[["chars","CHARACTERS"],["tactics","TACTICS"],["crystals","CRYSTALS"]].map(([id,lbl])=>(
          <button key={id} style={S.modeBtn(mode===id)} onClick={()=>{setMode(id); setSelected(null);}}>
            {lbl}
          </button>
        ))}
        <button style={{ ...S.actionBtn("#C9A227"), marginLeft:"auto" }} onClick={handleCopyText}>
          {copied ? "✓ COPIED" : "EXPORT TEXT"}
        </button>
        <button style={{ ...S.actionBtn("#B91C1C"), marginLeft:8 }} onClick={handleReset}>
          RESET
        </button>
      </div>

      <div style={S.body}>
        {/* Tier grid */}
        <div style={S.tiersWrap}>
          {/* Unplaced pool (only show if items not yet in tiers) */}
          {unplaced.length > 0 && (
            <div style={{ ...S.row("B", false), borderStyle:"dashed", opacity:0.7 }}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, "__pool__")}
              onDragEnter={e => handleDragEnter(e, "__pool__")}
              onDragLeave={e => handleDragLeave(e, "__pool__")}
            >
              <div style={{ ...S.rowLabel("B"), width: mob?36:52, fontSize: mob?9:10, letterSpacing:1, background:"#111", borderRight:"2px solid #1E1E1E", color:"#333" }}>
                {mob ? "?" : "POOL"}
              </div>
              <div style={S.rowItems}>
                {unplaced.map(id => (
                  <ItemChip key={id} id={id} type={mode}
                    isDragging={dragging?.id === id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    selected={selected === id}
                    onClick={handleClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tier rows */}
          {TIER_ROWS.map(tier => {
            const items = current[tier]||[];
            const over  = dragOver === tier;
            return (
              <div key={tier} style={S.row(tier, over)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, tier)}
                onDragEnter={e => handleDragEnter(e, tier)}
                onDragLeave={e => handleDragLeave(e, tier)}
              >
                <div style={S.rowLabel(tier)}>{tier}</div>
                <div style={S.rowItems}>
                  {items.map(id => (
                    <ItemChip key={id} id={id} type={mode}
                      isDragging={dragging?.id === id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      selected={selected === id}
                      onClick={handleClick}
                    />
                  ))}
                  {items.length === 0 && !over && (
                    <div style={S.emptyHint}>DROP HERE</div>
                  )}
                  {over && (
                    <div style={{ ...S.emptyHint, color: TIER_COLORS[tier]+"88", border:`1px dashed ${TIER_COLORS[tier]}44`, padding:"4px 12px", borderRadius:2 }}>
                      PLACE IN {tier}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer hint */}
          <div style={{ fontSize:9, color:"#1E1E1E", letterSpacing:2, textAlign:"center", padding:"10px 0 4px", fontFamily:"'Barlow Condensed',sans-serif" }}>
            DRAG TO RERANK · CLICK TO INSPECT · EXPORT COPIES TEXT · RESET RESTORES MORPHEUS DEFAULTS
          </div>
        </div>

        {/* Info panel — desktop sidebar / mobile bottom strip */}
        {!mob && (
          <div style={S.info}>
            <div style={{ fontSize:9, letterSpacing:3, color:"#282828", padding:"12px 18px 0", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700 }}>
              {mode.toUpperCase()} DETAIL
            </div>
            <InfoPanel id={selected} type={mode}/>
          </div>
        )}
      </div>

      {/* Mobile detail bar at bottom */}
      {mob && selected && (
        <div style={{ borderTop:"1px solid #111", background:"#060606", padding:"12px 16px", flexShrink:0 }}>
          <InfoPanel id={selected} type={mode}/>
        </div>
      )}
    </div>
  );
}
