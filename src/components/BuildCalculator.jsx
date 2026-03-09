import React, { useState, useMemo } from "react";

// ─── CALC CONSTANTS ────────────────────────────────────────────────────────
const ENTROPY_BREAKPOINTS = [
  { range:[0,29],   label:"NOVICE",       mult:1.0,  enemyHP:100  },
  { range:[30,49],  label:"HARDENED",     mult:1.15, enemyHP:180  },
  { range:[50,69],  label:"TRANSCENDENT", mult:1.35, enemyHP:300  },
  { range:[70,89],  label:"NIGHTMARE",    mult:1.55, enemyHP:500  },
  { range:[90,100], label:"OMEGA",        mult:1.80, enemyHP:850  },
];

const TACTIC_CATALOG = [
  { id:"atk-shadow",    slot:"Attack",  elem:"umbra",    name:"Shadow Spike",     baseVal:275, scaling:"per hit", desc:"Best on clone chars. Procs per attack." },
  { id:"atk-cold",      slot:"Attack",  elem:"ice",      name:"Attack Cold",      baseVal:0,   scaling:"% dmg",   desc:"+46% atk damage at Legendary. Slows enemies.", pct:0.46 },
  { id:"atk-burn",      slot:"Attack",  elem:"fire",     name:"Attack Burn",      baseVal:260, scaling:"DoT/s",   desc:"DoT per hit. Stacks on multiple targets." },
  { id:"atk-thunder",   slot:"Attack",  elem:"electric", name:"Chain Lightning",  baseVal:295, scaling:"per proc",desc:"Bounces to 3 enemies × 295 per bounce." },
  { id:"sk-cold",       slot:"Skill",   elem:"ice",      name:"Skill Cold",       baseVal:0,   scaling:"% dmg",   desc:"+47% on all skill damage at Legendary.", pct:0.47 },
  { id:"sk-burn",       slot:"Skill",   elem:"fire",     name:"Skill Burn",       baseVal:360, scaling:"DoT/s",   desc:"Higher DoT than Attack Burn. Skill cast triggers." },
  { id:"sk-spear",      slot:"Skill",   elem:"light",    name:"Light Spear",      baseVal:490, scaling:"per use", desc:"490 flat per skill use. Universal boss damage." },
  { id:"sk-proj",       slot:"Skill",   elem:"fire",     name:"Fire Projectile",  baseVal:280, scaling:"×10 proj",desc:"280 × 10 projectiles = 2800 per cast at close range." },
  { id:"sk-spirit",     slot:"Skill",   elem:"fire",     name:"Fire Spirit",      baseVal:190, scaling:"per hit", desc:"Autonomous spirit attacks what you hit." },
  { id:"sk-mine",       slot:"Skill",   elem:"fire",     name:"Place Mine",       baseVal:570, scaling:"per mine",desc:"Es exclusive: aerial bounce triggers 3+ mines." },
  { id:"dash-thunder",  slot:"Dash",    elem:"light",    name:"Thunderbolt",      baseVal:325, scaling:"on dash", desc:"Chain dmg on dash. Pairs with Orb skeleton." },
  { id:"dash-shadow",   slot:"Dash",    elem:"umbra",    name:"Dash Shadow",      baseVal:200, scaling:"on dodge",desc:"Proc on every dodge. Stacks with dodge-heavy chars." },
  { id:"dash-blade",    slot:"Dash",    elem:"blade",    name:"Blade Slash",      baseVal:220, scaling:"on dash", desc:"Physical blade proc on every dash movement." },
  { id:"leg-spear",     slot:"Legacy",  elem:"light",    name:"Light Spear",      baseVal:490, scaling:"per hit", desc:"490 on legacy use. Hakumen: add Magatama × 2." },
  { id:"leg-blackhole", slot:"Legacy",  elem:"umbra",    name:"Blackhole",        baseVal:0,   scaling:"CC",      desc:"Full-screen area slow. Zero direct damage but S-tier CC." },
  { id:"leg-ring",      slot:"Legacy",  elem:"fire",     name:"Ring of Fire",     baseVal:770, scaling:"burst",   desc:"770 burst on legacy. Ring of Fire Double = full screen." },
  { id:"leg-icespike",  slot:"Legacy",  elem:"ice",      name:"Ice Spike",        baseVal:350, scaling:"turret",  desc:"Respawn Double: permanent auto-turrets." },
  { id:"sum-orb",       slot:"Summon",  elem:"electric", name:"Lightning Orb",    baseVal:245, scaling:"DPS",     desc:"Persistent field turret. Character-neutral S-tier." },
  { id:"sum-chain",     slot:"Summon",  elem:"light",    name:"Chain Lightning",  baseVal:295, scaling:"bounce×3",desc:"295 × 3 enemies per proc. Rachel bats proc this." },
  { id:"sum-frost",     slot:"Summon",  elem:"ice",      name:"Frost Burst",      baseVal:520, scaling:"burst",   desc:"At max Cold stacks = AoE burst. Wide room clear." },
];

const CRYSTAL_EFFECTS = {
  "straightforward":  { atk:0.45, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:null },
  "domination":       { atk:0,    skill:0.45, elite:0,    combo:0,    survival:0, tactic:0,   special:null },
  "giant-slayer":     { atk:0,    skill:0,    elite:0.60, combo:0,    survival:0, tactic:0,   special:null },
  "exhilaration":     { atk:0,    skill:0,    elite:0,    combo:2.0,  survival:0, tactic:0,   special:"exhil" },
  "combo-surge":      { atk:0,    skill:0,    elite:0,    combo:2.5,  survival:0, tactic:0,   special:"surge" },
  "lethal-momentum":  { atk:0.45, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"lm" },
  "predator":         { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"pred" },
  "resonance":        { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0.40,special:null },
  "summon-booster":   { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0.45,special:"summon" },
  "legacy-amplifier": { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0.50,special:"legacy" },
  "not-dead-yet":     { atk:0,    skill:0,    elite:0,    combo:0,    survival:1, tactic:0,   special:null },
  "indestructible":   { atk:0,    skill:0,    elite:0,    combo:0,    survival:0.30, tactic:0,special:null },
  "defensive-combo":  { atk:0,    skill:0,    elite:0,    combo:0,    survival:0.80, tactic:0,special:null },
  "vital-boost":      { atk:0,    skill:0,    elite:0,    combo:0,    survival:0.15, tactic:0,special:null },
  "fatal-blow":       { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"crit" },
  "focus":            { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"crit" },
  "hunters-mark":     { atk:0.30, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:null },
  "blood-pact":       { atk:0.35, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"hp-cost" },
  "apex-predator":    { atk:0.35, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"apex" },
  "chain-reaction":   { atk:0.36, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:null },
  "mana-surge":       { atk:0,    skill:0.15, elite:0,    combo:0,    survival:0, tactic:0,   special:"mp" },
  "phantom-step":     { atk:0,    skill:0,    elite:0,    combo:0,    survival:0.5,tactic:0,  special:null },
  "second-wind":      { atk:0,    skill:0,    elite:0,    combo:0,    survival:0.5,tactic:0,  special:null },
  "mixture-enhancement":{ atk:0, skill:0,    elite:0,    combo:0,    survival:0.4,tactic:0,  special:null },
  "overcharge":       { atk:0,    skill:0.25, elite:0,    combo:0,    survival:0, tactic:0,   special:null },
  "predator":         { atk:0.75, skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"pred" },
  "ice-fortune":      { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"fortune-ice" },
  "fire-fortune":     { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"fortune-fire" },
  "umbra-fortune":    { atk:0,    skill:0,    elite:0,    combo:0,    survival:0, tactic:0,   special:"fortune-umbra" },
};

const CHAR_BASE_ATK = {
  hibiki:480, ragna:550, jin:460, kokonoe:420, es:430,
  noel:390, rachel:380, taokaka:520, lambda:470, mai:440,
  hazama:430, hakumen:580, bullet:560, naoto:500, icey:510, prisoner:490,
};

const CHAR_ATTACK_SPEED = {
  hibiki:1.2, ragna:0.9, jin:0.9, kokonoe:0.7, es:0.8,
  noel:1.3,  rachel:0.7, taokaka:1.4, lambda:0.8, mai:0.9,
  hazama:1.0, hakumen:0.7, bullet:1.1, naoto:1.0, icey:1.3, prisoner:0.95,
};

const CHAR_CLONE_MULTI = { hibiki:3, lambda:2 };

const CHAR_SPECIAL = {
  hibiki: "Clones copy ALL tactic procs (×3 multiplier on Shadow Spike, Thunderbolt)",
  ragna:  "Blood Kain: sub-50% HP activates ~30% damage bonus. Blood Scythe heals on hit.",
  jin:    "Freeze synergy: Cold Attack + Skill Cold = permanent slow field + 46/47% double stack",
  kokonoe:"Aerial positioning removes ground-attack risk. Missile skill hits 10 projectiles.",
  es:     "Mine bounce: aerial attacks trigger 3+ mines per string. Crest field combo uptime.",
  noel:   "Drive: 8-10 hits/sec. Fastest Exhilaration stacker after Taokaka.",
  rachel: "Bat Legacy procs Chain Lightning autonomously — zero input DPS.",
  taokaka:"Infinite dodge potential. 10-12 hits/sec = fastest Exhilaration cap in roster.",
  lambda: "Sword Rain: up to 4 autonomous swords copy tactic procs independently.",
  mai:    "Multi-projectile needles: each needle counted separately for tactic procs.",
  hazama: "Chain whip reaches 3-5 targets simultaneously — AoE on every normal attack.",
  hakumen:"Magatama: full charge = ~2× internal skill multiplier before crystal buffs.",
  bullet: "CQC driver: combos naturally. Excellent Defensive Combo uptime.",
  naoto:  "Blood Edge: HP-cost attacks. Blood Pact synergy unique to kit.",
  icey:   "Dance movement = always attacking, always in Defensive Combo protection.",
  prisoner:"Weapon variety: any weapon triggers all tactic procs equally.",
};

// ─── FUSION COMBINATIONS ────────────────────────────────────────────────────
const FUSION_DATA = {
  "hibiki+ragna":   { name:"BLOODSHADOW PHANTOM",   rating:"S", desc:"Clone Ambush + Blood Kain. Clones inherit lifesteal — the most self-sustaining assassin in the roster.", primary:"hibiki", secondary:"ragna",   take:{ hibiki:["Shadow Ambush legacy","3-dodge chain","Back-attack positioning","Clone tactic inheritance"], ragna:["Blood Kain sub-50% multiplier","Blood Scythe AoE + heal","Super armor on heavy attacks"] }, crystal:["exhilaration","defensive-combo","not-dead-yet","vital-boost","straightforward","giant-slayer"], tactics:["Attack Shadow Spike","Skill Cold","Dash Shadow","Legacy Blood Scythe","Summon Lightning Orb"], synergy:"Blood Kain activates at sub-50% — clones maintain combo count independently, keeping Exhilaration cap while you focus on positioning. Shadow Spike + clones + Blood Kain peak: 275 × 3 × 1.3 = 1072 per normal attack at Blood Kain threshold.", math:"Shadow Spike × clone multi × Blood Kain = 1072 per hit at sub-50% HP. Blood Scythe legacy heals per enemy hit — 3+ hit rooms restore to safe HP range in one cast." },
  "hibiki+jin":     { name:"FROZEN ASSASSIN",        rating:"S", desc:"Clones in a slowed field. Jin's Cold permanently plants enemies in back-attack range for Hibiki.", primary:"hibiki", secondary:"jin",     take:{ hibiki:["Shadow Ambush clone spawn","Back-attack talent bonus","3-dodge mobility","Clone tactic proc inheritance"], jin:["Attack Cold slow field","Skill Cold +47% bonus","Frost Burst AoE proc","Ice Fortune stack guarantee"] }, crystal:["exhilaration","ice-fortune","defensive-combo","giant-slayer","not-dead-yet","straightforward"], tactics:["Attack Cold","Skill Cold","Dash Shadow Spike","Legacy Ice Spike","Summon Frost Burst"], synergy:"Ice Fortune guarantees Cold Attack by stage 2. Cold-slowed enemies cannot turn — every clone attack becomes a back-attack. Back-attack talent applies to all 3 clone proc streams simultaneously.", math:"Cold: 3 clones × back-attack bonus × Exhilaration cap = highest Hibiki DPS ceiling. Frozen enemies: 0 repositioning needed, 100% back-attack uptime." },
  "hibiki+hakumen": { name:"VOID PHANTOM",            rating:"A+",desc:"Hakumen's void counter + clone ambush. One perfect parry triggers clone shadow procs.", primary:"hibiki", secondary:"hakumen", take:{ hibiki:["Clone shadow spawn","Back-attack positioning","3-dodge chain","Shadow Spike proc inheritance"], hakumen:["Void Counter — parry on incoming attacks","Magatama charge multiplier","AoE counter blast","Light Spear legacy 490/hit"] }, crystal:["straightforward","legacy-amplifier","not-dead-yet","phantom-step","giant-slayer","exhilaration"], tactics:["Attack Shadow Spike","Skill Counter Blast","Dash Phantom","Legacy Light Spear","Summon Lightning Orb"], synergy:"Parry window procs clone shadow ambush on all three clone positions simultaneously. Legacy Amplifier on Light Spear + Magatama: 490 × 1.5 × 2 = 1470 per charged hit as parry follow-up.", math:"Counter spike window: base × 1.45 (Straight) × 1.45 (Dom) × 1.5 (Leg Amp) × 2 (Magatama) = 6.3× on parry punish at full Magatama stack." },
  "ragna+naoto":    { name:"BLOOD HUNTER",            rating:"S", desc:"Double HP-cost offense. Blood Pact applies to both characters' HP-cost abilities — pure execute machine.", primary:"ragna",  secondary:"naoto",   take:{ ragna:["Blood Kain sub-50% multiplier","Blood Scythe heal-on-hit","Super armor attacks"], naoto:["Hunter's Eye execute mechanic","Blood Edge HP-cost attacks","Fatal Blow crit system","Blood Restriction drain"] }, crystal:["fatal-blow","focus","not-dead-yet","blood-pact","giant-slayer","vital-boost"], tactics:["Attack Burn","Skill Blood Edge","Dash Shadow Spike","Legacy Blood Scythe","Summon Chain Lightning"], synergy:"Blood Pact +35% on BOTH Blood Scythe (Ragna) and Blood Edge (Naoto) simultaneously. Blood Kain sub-50% + Fatal Blow crit = execute phase where every hit is a critical Blood Kain crit.", math:"Sub-50% HP: Blood Kain 1.3× × Blood Pact 1.35× × Fatal Blow crit 1.75× × Focus 55% crit rate average = 1.3 × 1.35 × 1.41 = 2.47× expected damage in blood threshold." },
  "ragna+bullet":   { name:"IRON BLOOD",              rating:"A+",desc:"CQC lifesteal + shell burst. Blood Scythe area heal on groups, Bullet's drive sustains between heals.", primary:"ragna",  secondary:"bullet",  take:{ ragna:["Blood Scythe AoE heal","Blood Kain sub-50% multiplier","Super armor through attacks"], bullet:["Drive: 8-10 hits/sec sustained attack","CQC shell burst","Defensive Combo protection","Demolition charge"] }, crystal:["exhilaration","defensive-combo","not-dead-yet","vital-boost","giant-slayer","straightforward"], tactics:["Attack Burn","Skill Blood Scythe","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"], synergy:"Bullet's drive hit rate feeds Exhilaration fast. Blood Scythe acts as reset — every room clear from Scythe restores HP for next fight. Blackhole legacy traps groups for Blood Scythe confirms.", math:"Drive at 9 hits/sec × Exhilaration stacking = cap in 44s. At cap: drive × 3.0 × Blood Kain 1.3 = 3.9× effective multiplier during blood threshold." },
  "jin+noel":       { name:"GLACIER STORM",            rating:"S", desc:"Freeze everything, rapid-fire through it. Noel's drive frequency hits Cold-frozen enemies that can't retaliate.", primary:"jin",    secondary:"noel",    take:{ jin:["Attack Cold + Skill Cold double stack","Ice Fortune tactic control","Frost Burst AoE proc","Freeze mechanic on all enemies"], noel:["Drive: 8-10 hits/sec","Long-range passive bonus","Rapid skill rotation","Bullet Storm speed"] }, crystal:["exhilaration","ice-fortune","defensive-combo","giant-slayer","not-dead-yet","straightforward"], tactics:["Attack Cold","Skill Cold","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"], synergy:"Cold slows enemies to 30% speed — Noel's rapid-fire is never threatened. Ice Fortune guarantees Cold Attack at stage 2. Noel's hit frequency reaches Exhilaration cap in 33 seconds on frozen enemies.", math:"Cold field: enemies at 30% speed. Noel Drive: 9 hits/sec × no repositioning cost × Exhilaration 200% cap = pure DPS accumulation with zero mobility tax." },
  "jin+hakumen":    { name:"ABSOLUTE ZERO",             rating:"S", desc:"The ultimate control duo. Hakumen's parry on frozen enemies + Magatama charge while Jin holds the freeze.", primary:"jin",    secondary:"hakumen", take:{ jin:["Cold field — enemies frozen in place","Skill Cold +47% on all skills","Ice Fortune drop guarantee","Frost Burst at max Cold stacks"], hakumen:["Magatama charge during freeze window","Void Counter parry","Light Spear burst 490/hit","Magatama × 2 multiplier at full charge"] }, crystal:["domination","giant-slayer","legacy-amplifier","not-dead-yet","ice-fortune","exhilaration"], tactics:["Attack Cold","Skill Cold","Dash Light Spear","Legacy Magatama Counter","Summon Frost Burst"], synergy:"Frozen enemies cannot interrupt Magatama charge. Full Magatama while enemy is frozen = charged Light Spear with no risk. Legacy Amplifier on Magatama Light Spear: 490 × 1.5 × 2.0 (Magatama) = 1470 per hit.", math:"Freeze hold duration: ~3-4s. Full Magatama charge: 2.5s. With Cold field, Magatama always reaches full charge before freeze expires. 1470/hit × Exhilaration cap = highest burst per second in any fusion." },
  "kokonoe+rachel": { name:"SCIENCE WITCH",             rating:"A+",desc:"Remote zoning + familiar swarm. Kokonoe's aerial bombing + Rachel's bat lightning = zero floor contact needed.", primary:"kokonoe",secondary:"rachel", take:{ kokonoe:["Aerial positioning — immune to ground attacks","Missile Rain: 10 projectiles per cast","Fire Projectile skill burst","Zoning: enemies can never close distance"], rachel:["Bat summon procs Chain Lightning autonomously","Wind Barrier field damage","Pumpkin detonation burst","Summon Booster on all familiars"] }, crystal:["resonance","summon-booster","legacy-amplifier","giant-slayer","not-dead-yet","exhilaration"], tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"], synergy:"Both characters' primary damage is ranged/summon-based — Resonance + Summon Booster stack on ALL sources simultaneously. Legacy Amplifier on Ring of Fire: 770 × 1.5 = 1155 burst per legacy. Zero floor contact = zero damage taken.", math:"Fire Projectile: 280 × 10 × Resonance 1.4 × Summon 1.45 = 5684 per cast. Bat Lightning: 295 × 3 × Resonance 1.4 × Summon 1.45 = 1801 per proc. Both firing simultaneously." },
  "kokonoe+es":     { name:"TECHNO SPATIAL",            rating:"A", desc:"Mine field from orbit. Kokonoe's aerial + Es's spatial crests = stage covered, enemies walking into death.", primary:"kokonoe",secondary:"es",     take:{ kokonoe:["Aerial mobility — above mine detonation radius","Missile fire triggers crest positions","Science-type tactic procs","Fire Projectile crest activators"], es:["Crest field placement — passive damage traps","Mine bounce: 3+ detonations per aerial string","Spatial crest hit combos","Crest generation passive"] }, crystal:["domination","resonance","giant-slayer","not-dead-yet","exhilaration","lethal-momentum"], tactics:["Skill Place Mine","Attack Fire Projectile","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"], synergy:"Kokonoe's aerial position triggers mine bounce from above — 3+ mines per skill cast. Crests placed before flight convert ground space into trap field while Kokonoe fires from above. Domination amplifies both mine (skill) and crest (skill) sources.", math:"Mine bounce from aerial: 570 × 3 mines × Domination 1.45 = 2479 per aerial cast. Crest field passive: tactic procs on every crest hit × Resonance 1.4. Combined: aerial bomber + mine/crest ground death zone." },
  "es+lambda":      { name:"SPATIAL BLADE",             rating:"A+",desc:"Crest field into sword rain. Sword turrets proc on crest positions — every crest becomes an autonomous DPS node.", primary:"es",     secondary:"lambda",  take:{ es:["Crest spatial placement — passive hit fields","Mine detonation on approach","Crest combo generation","Aerial bounce triggers"], lambda:["Sword Rain: 4 autonomous swords","Summon Booster scales all swords","Shadow Spike on sword procs","Respawn Double: permanent sword field"] }, crystal:["resonance","summon-booster","exhilaration","giant-slayer","not-dead-yet","defensive-combo"], tactics:["Skill Ice Sword","Attack Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"], synergy:"Lambda's sword rain hits Es's crests, triggering combo count for Exhilaration without player input. Summon Booster applies to both Lambda's swords AND Es's mine detonations (classified as summon-type). Fully autonomous DPS engine.", math:"4 swords × Shadow Spike × Resonance 1.4 × Summon 1.45 = 4 × 275 × 1.4 × 1.45 = 2233/attack wave. Crest passive adds combo stacking — Exhilaration cap reached autonomously by stage 2." },
  "noel+taokaka":   { name:"BULLET BEAST",              rating:"A+",desc:"Fastest combo stack in the game. Combined hit rates cap Exhilaration before stage 1 is clear.", primary:"noel",   secondary:"taokaka", take:{ noel:["Drive: 8-10 hits/sec","Rapid-fire bullet pattern","Long-range passive bonus","Bullet Storm sustained attack"], taokaka:["Rush speed: 10-12 hits/sec","Infinite dodge direction changes","Claw blitz attack chains","Combo Surge stacking"] }, crystal:["exhilaration","combo-surge","defensive-combo","giant-slayer","not-dead-yet","straightforward"], tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"], synergy:"Dual hit-rate stack: Noel Drive 9 hits/sec + Taokaka Rush 11 hits/sec combined = Exhilaration cap in ~22 seconds in this fusion context. Combo Surge caps simultaneously. Peak multiplier: 3.0 × 3.5 = 10.5× before any other buffs.", math:"22-second Exhilaration cap: the earliest of any fusion pairing. At stage 1 boss: already at full stacks. 10.5× base × giant slayer 1.6 vs elite = 16.8× effective vs bosses from stage 2 onward." },
  "hakumen+naoto":  { name:"DEATH SENTENCE",            rating:"S", desc:"Parry into execute. Hakumen counters, Naoto's Hunter's Eye closes the HP window that was opened.", primary:"hakumen",secondary:"naoto",  take:{ hakumen:["Void Counter — parry anything","Magatama multiplier at full charge","AoE counter blast","Super armor through heavy attacks"], naoto:["Hunter's Eye execute threshold +75%","Blood Edge HP-cost burst","Fatal Blow crit damage","Death Touch execute loop"] }, crystal:["fatal-blow","focus","giant-slayer","not-dead-yet","legacy-amplifier","apex-predator"], tactics:["Attack Light Spear","Skill Counter Blast","Dash Thunderbolt","Legacy Magatama Counter","Summon Chain Lightning"], synergy:"Counter brings enemies to 70-80% HP. Hunter's Eye doesn't activate yet. Second counter brings to 30%. Hunter's Eye + Predator + full Magatama: single execute window closes the fight.", math:"Full execute window: Magatama 2.0 × Predator 1.75 × Fatal Blow avg 1.41 × Apex Predator 1.35 (full HP on parry) × Giant Slayer 1.6 = 11.9× damage multiplier in execute phase." },
  "rachel+lambda":  { name:"SWARM FIELD",                rating:"A+",desc:"Bat summons + autonomous sword turrets. Entirely hands-free DPS that scales off Summon Booster alone.", primary:"rachel", secondary:"lambda",  take:{ rachel:["Bat swarm: procs Chain Lightning on every bat","Wind Barrier persistent field damage","Tempest Dahlia control","Aerial positioning above ground threats"], lambda:["Sword Rain: 4 turrets firing independently","Summon Booster scales all","Umbra Fortune for Shadow Spike on swords","Respawn Double permanent field"] }, crystal:["resonance","summon-booster","legacy-amplifier","not-dead-yet","exhilaration","giant-slayer"], tactics:["Attack Chain Lightning","Skill Sword Rain","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"], synergy:"Three simultaneous autonomous sources: bats, swords, lightning orb. All classified as summon-type — Summon Booster +45% applies to all three simultaneously. Resonance +40% on all tactic procs from all three.", math:"Bat chain: 295 × 3 × 1.4 × 1.45 = 1800/proc. Sword shadow: 275 × 4 × 1.4 × 1.45 = 2233/wave. Orb: 245 × 1.4 × 1.45 = 498/hit. All simultaneously with zero player input." },
  "taokaka+bullet": { name:"FERAL ROUND",                rating:"A", desc:"Peak aggression. Two highest-hit-rate characters combined into a combo-stacking machine.", primary:"taokaka",secondary:"bullet", take:{ taokaka:["Infinite dodge chains — all directional","Claw Rush: 10-12 hits/sec","Combo Surge aggressive scaling","Ambush flanking speed"], bullet:["Drive shell burst: 8-10 hits/sec","CQC demolition charge","Defensive Combo during attack strings","Steel Shell sustain"] }, crystal:["exhilaration","combo-surge","defensive-combo","not-dead-yet","giant-slayer","straightforward"], tactics:["Attack Cold","Skill Fire Spirit","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"], synergy:"Taokaka's dodge chains feed combo count while Bullet's drive maintains attack contact. Defensive Combo protects during both. Combined hit rate: highest of any non-clone fusion.", math:"Combined hit rate: ~20 effective hits/sec in sustained combat. Exhilaration cap: 20 seconds. Combo Surge cap: simultaneous. 10.5× base before giant slayer — applied from stage 1." },
  "hazama+naoto":   { name:"VENOM HUNTER",               rating:"A", desc:"DoT from range, execute up close. Set Burn DoT, let it tick, close for the blood execute.", primary:"hazama", secondary:"naoto",  take:{ hazama:["Chain whip: reaches 3-5 targets","Snake Burn DoT application","Ouroboros ring mobility","Counter God parry window"], naoto:["Hunter's Eye: execute threshold","Blood Edge burst damage","Blood Restriction drain loop","Fatal Blow crit in execute"] }, crystal:["resonance","fatal-blow","not-dead-yet","fire-fortune","giant-slayer","exhilaration"], tactics:["Attack Burn","Skill Snake Venom","Dash Shadow Spike","Legacy Blood Edge","Summon Chain Lightning"], synergy:"Burn DoT from chain whip range, then Hunter's Eye activates at 30%. At execute range: Blood Edge + Fatal Blow + Giant Slayer stacks apply simultaneously. Enemy burns to 30%, you dash in for guaranteed crit execute.", math:"Burn DoT: 731/sec × 3 targets (chain reach) = 2193 passive. At 30% HP: Blood Edge × Fatal Blow crit avg 1.41 × Giant Slayer 1.6 × Hunter's Eye 1.75 = 3.94× execute spike." },
  "mai+lambda":     { name:"NEEDLE BLADE",                rating:"A+",desc:"Highest multi-hit proc rate. Mai's 8 needles per cast + Lambda's 4 swords = 12 simultaneous tactic procs.", primary:"mai",    secondary:"lambda",  take:{ mai:["Needle Storm: 8 projectiles per cast","Frost Spear Cold application","Chain Spear multi-hit","Mana Surge-friendly skill frequency"], lambda:["Sword Rain: 4 independent turrets","Summon Booster on all swords","Shadow Spike per sword proc","Umbra Fortune for Shadow Spike lock-in"] }, crystal:["resonance","summon-booster","giant-slayer","not-dead-yet","exhilaration","domination"], tactics:["Attack Shadow Spike","Skill Ice Sword","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"], synergy:"8 needle procs + 4 sword procs = 12 simultaneous Shadow Spike activations per combined rotation. Each proc amplified by Resonance × Summon Booster where applicable.", math:"12 simultaneous procs: 275 × 12 × Resonance 1.4 (on swords) = 4620 from one needle+sword combined rotation. At Exhilaration cap: 4620 × 3 = 13,860 per full rotation. Highest multi-proc ceiling in the game." },
  "icey+taokaka":   { name:"DANCER OF CHAOS",             rating:"A+",desc:"Two of the fastest movers fused. Dance patterns chain into Taokaka rush, always in motion, always attacking.", primary:"icey",   secondary:"taokaka", take:{ icey:["Dance movement: attack patterns dodge attacks","Pixel Storm speed","Blade Dance burst window","ICEY Exhilaration accumulation at dance pace"], taokaka:["Infinite dodge direction changes","Claw Rush 10-12 hits/sec","Speed Demon kill-chain","Ambush Cat execute burst"] }, crystal:["exhilaration","combo-surge","defensive-combo","giant-slayer","not-dead-yet","phantom-step"], tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"], synergy:"ICEY dance + Taokaka rush = movement never stops. Exhilaration accumulates during both movement phases. Combo Surge stacks in parallel. Defensive Combo covers both — always in attack animation, always protected.", math:"Movement DPS: never stationary = Defensive Combo always active. Combined hit rate: ~22 hits/sec at peak. Exhilaration + Combo Surge cap at 19 seconds. 10.5× peak with zero survivability compromise." },
  "prisoner+ragna": { name:"DEAD BLOOD",                  rating:"A+",desc:"Roguelite lifesteal meets BBEE mechanics. Prisoner's weapon variety + Ragna's Blood Scythe sustain.", primary:"prisoner",secondary:"ragna",  take:{ prisoner:["Weapon variety: all weapon procs equal","Roll-dodge invincibility","Adaptive playstyle — any weapon works","Dead Cells-style kill momentum"], ragna:["Blood Scythe AoE heal","Blood Kain sub-50% multiplier","Super armor through heavy attacks","Self-sustaining lifesteal loop"] }, crystal:["exhilaration","straightforward","giant-slayer","not-dead-yet","chain-reaction","vital-boost"], tactics:["Attack Burn","Skill Blood Scythe","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"], synergy:"Prisoner weapon variety + Blood Scythe: any weapon type confirms Blood Scythe heal on hit. Chain Reaction kill chains from Prisoner's mobility into Blood Kain threshold activation. Vital Boost doubles the HP pool the sub-50% threshold operates on.", math:"Chain Reaction 3 kills → +36%. Blood Kain sub-50%: +30%. Combined during kill chain: base × 1.36 × 1.30 = 1.77× during momentum. Blood Scythe group heal resets this per room for infinite momentum." },
};

// ─── CALC ENGINE ─────────────────────────────────────────────────────────────
function calcDPS(charId, tactics, crystals, entropy, comboSec=60) {
  const baseAtk = CHAR_BASE_ATK[charId] || 450;
  const atkSpeed = CHAR_ATTACK_SPEED[charId] || 1.0;
  const cloneMulti = CHAR_CLONE_MULTI[charId] || 1;
  const entropyData = ENTROPY_BREAKPOINTS.find(e => entropy >= e.range[0] && entropy <= e.range[1]) || ENTROPY_BREAKPOINTS[0];

  // Crystal multipliers
  let atkBonus = 1, skillBonus = 1, eliteBonus = 1, tacticBonus = 1, survivalScore = 0;
  let comboScaling = 0, hasExhil = false, hasSurge = false, hasFortune = null;
  let hasCrit = false, critRate = 0.1, critDmg = 1.5;

  for(const cid of crystals) {
    const fx = CRYSTAL_EFFECTS[cid];
    if(!fx) continue;
    if(fx.atk > 0)      atkBonus  += fx.atk;
    if(fx.skill > 0)    skillBonus += fx.skill;
    if(fx.elite > 0)    eliteBonus += fx.elite;
    if(fx.tactic > 0)   tacticBonus += fx.tactic;
    if(fx.survival > 0) survivalScore += fx.survival;
    if(fx.special === "exhil")  hasExhil = true;
    if(fx.special === "surge")  hasSurge = true;
    if(fx.special === "crit")   hasCrit = true;
    if(fx.special === "fortune-ice")   hasFortune = "ice";
    if(fx.special === "fortune-fire")  hasFortune = "fire";
    if(fx.special === "fortune-umbra") hasFortune = "umbra";
    if(cid === "focus")    critRate += 0.25;
    if(cid === "fatal-blow") critDmg  += 0.75;
  }

  // Combo scaling
  const exhilMult = hasExhil ? 3.0 : 1;
  const surgeMult = hasSurge ? 3.5 : 1;
  const comboMult = Math.max(exhilMult, surgeMult);

  // Crit average multiplier
  const critAvgMult = hasCrit ? (critRate * critDmg + (1 - critRate) * 1.0) : 1;

  // Tactic DPS
  let tacticDPS = 0;
  const slotMap = {};
  for(const t of tactics) {
    const td = TACTIC_CATALOG.find(tc => tc.id === t);
    if(!td) continue;
    slotMap[td.slot] = td;
    let tVal = td.baseVal;
    // fortune bonus: +20% if matching element
    if(hasFortune && hasFortune === td.elem) tVal *= 1.20;
    // proc scaling
    tVal *= tacticBonus;
    if(td.slot === "Skill") tVal *= skillBonus;
    if(td.scaling === "% dmg") { 
      tVal = baseAtk * atkSpeed * (td.pct || 0);
    }
    tVal *= cloneMulti; // clones copy procs
    if(td.slot === "Attack" || td.slot === "Dash") tVal *= atkSpeed;
    tacticDPS += tVal;
  }

  // Base attack DPS
  const baseAtkDPS = baseAtk * atkSpeed * atkBonus * comboMult * critAvgMult;

  // Entropy scaling
  const entropyMult = entropyData.mult;

  // Final numbers
  const rawDPS = (baseAtkDPS + tacticDPS) * entropyMult;
  const eliteDPS = rawDPS * eliteBonus;

  // Survivability score (0–100)
  const survPct = Math.min(100, Math.round(survivalScore * 33));

  // Synergies detected
  const syns = [];
  const elements = tactics.map(t => TACTIC_CATALOG.find(tc=>tc.id===t)?.elem).filter(Boolean);
  const elemCounts = {};
  elements.forEach(e => elemCounts[e] = (elemCounts[e]||0)+1);
  const domElem = Object.entries(elemCounts).sort((a,b)=>b[1]-a[1])[0];
  if(domElem && domElem[1] >= 2) syns.push({ type:"ELEMENT FOCUS", label:`${domElem[0].toUpperCase()} × ${domElem[1]}`, color:"#60B8D4", msg:"Dual element concentration — Double Tactic upgrades become accessible." });
  if(hasFortune && domElem && hasFortune === domElem[0]) syns.push({ type:"FORTUNE LOCK", label:`${hasFortune.toUpperCase()} FORTUNE`, color:"#C9A227", msg:"Fortune crystal aligns with dominant tactic element. +20% on matching drops." });
  if(hasExhil && hasSurge) syns.push({ type:"COMBO BEAST", label:"EXHILARATION + SURGE", color:"#E53935", msg:`Peak multiplier: ${exhilMult}× × ${surgeMult}× = ${(exhilMult*surgeMult).toFixed(1)}× combined at max stacks.` });
  if(hasCrit) syns.push({ type:"CRIT BUILD", label:`${Math.round(critRate*100)}% CRIT / ${Math.round(critDmg*100)}% CRIT DMG`, color:"#F97316", msg:`Expected crit value: ${critAvgMult.toFixed(2)}× average on all hits.` });
  if(cloneMulti > 1) syns.push({ type:"CLONE MULTI", label:`×${cloneMulti} PROC CLONE`, color:"#7B8FE4", msg:"Clone character detected — tactic procs multiply automatically." });
  if(crystals.includes("resonance") && crystals.includes("summon-booster")) syns.push({ type:"TACTIC STACK", label:"RESONANCE + SUMMON", color:"#A78BFA", msg:`Tactic bonus: ${tacticBonus.toFixed(2)}× on all procs. Stacks multiplicatively.` });

  // Warnings
  const warns = [];
  if(!crystals.includes("not-dead-yet") && survPct < 40) warns.push("⚠ No death safety — extremely fragile at Entropy 50+. Add Not Dead Yet.");
  if(crystals.length < 6) warns.push(`⚠ Only ${crystals.length}/6 crystal slots filled — leaving raw power on the table.`);
  if(tactics.length < 5) warns.push(`⚠ Only ${tactics.length}/5 tactic slots assigned.`);
  if(!slotMap["Legacy"]) warns.push("⚠ No Legacy tactic assigned — free 490+ DPS slot unused.");
  if(!slotMap["Summon"]) warns.push("⚠ No Summon tactic — autonomous DPS source missing.");
  if(atkBonus < 1.3 && skillBonus < 1.3 && tacticBonus < 1.3) warns.push("⚠ No primary damage amplifier crystal. Add Straightforward, Domination, or Resonance.");

  return {
    baseAtkDPS: Math.round(baseAtkDPS),
    tacticDPS: Math.round(tacticDPS),
    rawDPS: Math.round(rawDPS),
    eliteDPS: Math.round(eliteDPS),
    survPct,
    atkBonus: atkBonus.toFixed(2),
    skillBonus: skillBonus.toFixed(2),
    tacticBonus: tacticBonus.toFixed(2),
    comboMult: comboMult.toFixed(1),
    eliteBonus: eliteBonus.toFixed(2),
    critAvgMult: critAvgMult.toFixed(2),
    entropyMult: entropyMult.toFixed(2),
    syns, warns,
    entropyLabel: entropyData.label,
  };
}

// ─── SLOT COLORS ─────────────────────────────────────────────────────────────
const SLOT_COLORS = { Attack:"#E53935", Skill:"#A855F7", Dash:"#22C55E", Legacy:"#C9A227", Summon:"#60A5FA" };
const ELEM_COLORS = { ice:"#60B8D4", fire:"#E84E25", umbra:"#A855F7", light:"#EDB72C", electric:"#22D9BB", blade:"#E05050" };
const TIER_COLORS = { S:"#E53935", A:"#FF8F00", "A+":"#FF6600", B:"#1976D2" };

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function BuildCalculator({ cfg={}, mob=false, characters=[] }) {
  const [mode, setMode]           = useState("calc"); // "calc" | "fusion"
  const [selChar, setSelChar]     = useState(characters[0]?.id || "hibiki");
  const [selTactics, setSelTactics] = useState([]);
  const [selCrystals, setSelCrystals] = useState([]);
  const [entropy, setEntropy]     = useState(50);
  const [fusionA, setFusionA]     = useState("hibiki");
  const [fusionB, setFusionB]     = useState("jin");
  const [showFusion, setShowFusion] = useState(false);
  const [expanded, setExpanded]   = useState({});

  const char = characters.find(c=>c.id===selChar) || characters[0];
  const result = useMemo(() => calcDPS(selChar, selTactics, selCrystals, entropy), [selChar, selTactics, selCrystals, entropy]);

  const fusionKey = [fusionA, fusionB].sort().join("+");
  const fusion = FUSION_DATA[fusionKey];
  const charA  = characters.find(c=>c.id===fusionA);
  const charB  = characters.find(c=>c.id===fusionB);

  const S = {
    wrap:  { display:"flex", flexDirection:"column", flex:1, overflow:"hidden", background:"#060606" },
    topBar:{ display:"flex", borderBottom:"1px solid #141414", background:"#050505", flexShrink:0, overflowX:"auto", WebkitOverflowScrolling:"touch" },
    tab:   (a)=>({ background:"transparent", border:"none", borderBottom:a?"2px solid #B91C1C":"2px solid transparent", color:a?"#F0EDE5":"#3A3A3A", padding:mob?"8px 14px":"10px 24px", fontSize:mob?10:12, letterSpacing:mob?2:3, fontWeight:900, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap" }),
    body:  { flex:1, overflowY:"auto", padding:mob?"10px":"20px 24px", wordBreak:"break-word", overflowWrap:"break-word" },
    card:  { background:"#0D0D0D", border:"1px solid #1A1A1A", padding:mob?"10px":"16px 20px", marginBottom:10, minWidth:0 },
    lbl:   { fontSize:9, letterSpacing:3, color:"#3A3A3A", fontWeight:700, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif" },
    val:   (col="#F0EDE5")=>({ fontSize:mob?18:26, fontWeight:900, color:col, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1, lineHeight:1 }),
    mono:  { fontFamily:"'Courier Prime',monospace" },
    tag:   (col)=>({ display:"inline-flex", background:`${col}18`, color:col, border:`1px solid ${col}44`, padding:"2px 8px", fontSize:9, fontWeight:900, letterSpacing:1, fontFamily:"'Barlow Condensed',sans-serif", marginRight:4, marginBottom:4 }),
    row:   { display:"flex", gap:mob?8:12, flexWrap:"wrap", alignItems:"center", marginBottom:8 },
    g2:    { display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:mob?8:12 },
    g3:    { display:"grid", gridTemplateColumns:mob?"1fr 1fr":"repeat(3,1fr)", gap:mob?6:10 },
    sBtn:  (a,col)=>({ background:a?`${col}22`:"#111", border:`1px solid ${a?col:"#1A1A1A"}`, color:a?col:"#4A4A4A", padding:mob?"5px 8px":"7px 12px", fontSize:mob?9:11, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1, transition:"all 0.1s" }),
    sliderWrap: { display:"flex", alignItems:"center", gap:10 },
    slider: { flex:1, accentColor:"#B91C1C", cursor:"pointer" },
    infoBox:(col)=>({ background:`${col}0D`, border:`1px solid ${col}44`, borderLeft:`3px solid ${col}`, padding:mob?"8px 10px":"10px 14px", marginBottom:8 }),
    fusionCard:(col)=>({ background:`${col}08`, border:`2px solid ${col}`, padding:mob?"12px":"18px 22px", marginBottom:10 }),
  };

  const toggleTactic = (id) => setSelTactics(p => p.includes(id) ? p.filter(x=>x!==id) : p.length >= 5 ? p : [...p,id]);
  const toggleCrystal = (id) => setSelCrystals(p => p.includes(id) ? p.filter(x=>x!==id) : p.length >= 6 ? p : [...p,id]);

  const DPSMeter = ({ label, value, max=5000, color="#B91C1C" }) => {
    const pct = Math.min(100, (value/max)*100);
    return (
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <div style={{fontSize:mob?9:10,letterSpacing:2,color:"#4A4A4A",fontFamily:"'Barlow Condensed',sans-serif"}}>{label}</div>
          <div style={{fontSize:mob?12:14,fontWeight:900,color,fontFamily:"'Barlow Condensed',sans-serif"}}>{value.toLocaleString()}</div>
        </div>
        <div style={{height:4,background:"#1A1A1A",position:"relative"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg, ${color}88, ${color})`,transition:"width 0.3s"}}/>
        </div>
      </div>
    );
  };

  const charSpecial = CHAR_SPECIAL[selChar];

  const renderCalc = () => (
    <div style={S.body}>
      <div style={S.g2}>
        {/* LEFT COLUMN */}
        <div>
          {/* Character Select */}
          <div style={S.card}>
            <div style={S.lbl}>SELECT CHARACTER</div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${mob?4:8},1fr)`,gap:4}}>
              {characters.map(c=>(
                <div key={c.id} onClick={()=>setSelChar(c.id)} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 4px",background:selChar===c.id?`${c.color}18`:"#0A0A0A",border:`1px solid ${selChar===c.id?c.color:"#1A1A1A"}`,transition:"all 0.1s"}}>
                  <div style={{width:mob?26:32,height:mob?34:42,overflow:"hidden",flexShrink:0}}>
                    <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:selChar===c.id?"none":"brightness(0.4) saturate(0.5)"}} onError={e=>{e.target.style.display="none"}}/>
                  </div>
                  <div style={{fontSize:mob?7:8,fontWeight:900,color:selChar===c.id?c.color:"#3A3A3A",letterSpacing:0,textAlign:"center",lineHeight:1.1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:"100%"}}>{c.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            {charSpecial && (
              <div style={{...S.infoBox(char?.color||"#888"), marginTop:8, marginBottom:0, fontSize:mob?9:10, color:"#B0B0B0", ...S.mono, lineHeight:1.7}}>
                <span style={{color:char?.color,fontWeight:900,letterSpacing:1}}>⚡ SPECIAL: </span>{charSpecial}
              </div>
            )}
          </div>

          {/* Entropy Slider */}
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={S.lbl}>ENTROPY LEVEL</div>
              <div style={{...S.val("#B91C1C"), fontSize:mob?20:28}}>{entropy}</div>
            </div>
            <div style={S.sliderWrap}>
              <div style={{fontSize:9,color:"#3A3A3A",letterSpacing:1}}>0</div>
              <input type="range" min={0} max={100} value={entropy} onChange={e=>setEntropy(+e.target.value)} style={S.slider}/>
              <div style={{fontSize:9,color:"#3A3A3A",letterSpacing:1}}>100+</div>
            </div>
            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:8}}>
              <span style={{...S.tag("#B91C1C"), fontSize:10}}>{result.entropyLabel}</span>
              <span style={{...S.mono, fontSize:mob?10:11, color:"#444"}}>×{result.entropyMult} enemy scaling</span>
            </div>
          </div>

          {/* Tactic Selection */}
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={S.lbl}>TACTICS ({selTactics.length}/5 SLOTS)</div>
              {selTactics.length > 0 && <button onClick={()=>setSelTactics([])} style={{...S.sBtn(false,"#B91C1C"),fontSize:8,padding:"3px 6px"}}>CLEAR</button>}
            </div>
            {["Attack","Skill","Dash","Legacy","Summon"].map(slot=>(
              <div key={slot} style={{marginBottom:8}}>
                <div style={{fontSize:8,color:SLOT_COLORS[slot],letterSpacing:2,marginBottom:4,fontWeight:700}}>── {slot.toUpperCase()}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {TACTIC_CATALOG.filter(t=>t.slot===slot).map(t=>{
                    const active = selTactics.includes(t.id);
                    const ec = ELEM_COLORS[t.elem] || "#888";
                    return (
                      <button key={t.id} onClick={()=>toggleTactic(t.id)}
                        title={t.desc}
                        style={{...S.sBtn(active, ec), display:"flex",alignItems:"center",gap:4}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:active?ec:"#2A2A2A",flexShrink:0}}/>
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Crystal Selection */}
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={S.lbl}>CRYSTALS ({selCrystals.length}/6 SLOTS)</div>
              {selCrystals.length > 0 && <button onClick={()=>setSelCrystals([])} style={{...S.sBtn(false,"#B91C1C"),fontSize:8,padding:"3px 6px"}}>CLEAR</button>}
            </div>
            {[
              { cat:"DAMAGE",   col:"#E53935", ids:["straightforward","domination","giant-slayer","combo-surge","lethal-momentum","predator"] },
              { cat:"SURVIVAL", col:"#F59E0B", ids:["not-dead-yet","indestructible","defensive-combo","vital-boost","second-wind","mixture-enhancement"] },
              { cat:"ECONOMY",  col:"#60A5FA", ids:["mana-surge","ice-fortune","fire-fortune","umbra-fortune","overcharge"] },
              { cat:"UTILITY",  col:"#C9A227", ids:["exhilaration","combo-surge","fatal-blow","focus","resonance"] },
              { cat:"ADVANCED", col:"#A78BFA", ids:["phantom-step","legacy-amplifier","summon-booster","hunters-mark","blood-pact","apex-predator","chain-reaction"] },
            ].map(group=>(
              <div key={group.cat} style={{marginBottom:8}}>
                <div style={{fontSize:8,color:group.col,letterSpacing:2,marginBottom:4,fontWeight:700}}>── {group.cat}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {group.ids.map(id=>{
                    const active = selCrystals.includes(id);
                    return <button key={id} onClick={()=>toggleCrystal(id)} style={S.sBtn(active, group.col)}>{id.replace(/-/g," ").toUpperCase()}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — LIVE RESULTS */}
        <div>
          {/* Main DPS readout */}
          <div style={{...S.card, borderColor:`${char?.color||"#B91C1C"}44`}}>
            <div style={S.lbl}>CALCULATED OUTPUT — LEGENDARY RARITY</div>
            <DPSMeter label="BASE ATTACK DPS" value={result.baseAtkDPS} max={4000} color={char?.color||"#B91C1C"}/>
            <DPSMeter label="TACTIC DPS" value={result.tacticDPS} max={4000} color="#C9A227"/>
            <DPSMeter label="TOTAL vs NORMAL" value={result.rawDPS} max={8000} color="#F0EDE5"/>
            <DPSMeter label="TOTAL vs ELITE/BOSS" value={result.eliteDPS} max={12000} color="#E53935"/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
              <div style={{...S.val("#E53935"),fontSize:mob?28:40}}>~{result.eliteDPS.toLocaleString()}</div>
            </div>
            <div style={{fontSize:9,color:"#2A2A2A",...S.mono,textAlign:"right",marginTop:2}}>vs elite at entropy {entropy} — estimates, actual varies</div>
          </div>

          {/* Multiplier breakdown */}
          <div style={S.card}>
            <div style={S.lbl}>MULTIPLIER STACK</div>
            {[
              { label:"ATK BONUS",      val:result.atkBonus,     col:"#E53935" },
              { label:"SKILL BONUS",    val:result.skillBonus,   col:"#A855F7" },
              { label:"TACTIC BONUS",   val:result.tacticBonus,  col:"#C9A227" },
              { label:"COMBO SCALE",    val:result.comboMult,    col:"#22C55E" },
              { label:"CRIT AVERAGE",   val:result.critAvgMult,  col:"#F97316" },
              { label:"ELITE BONUS",    val:result.eliteBonus,   col:"#60B8D4" },
              { label:"ENTROPY SCALE",  val:result.entropyMult,  col:"#B91C1C" },
            ].map(m=>(
              <div key={m.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #111"}}>
                <div style={{fontSize:mob?9:10,color:"#3A3A3A",letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.label}</div>
                <div style={{...S.mono,fontSize:mob?12:14,fontWeight:700,color:+m.val>1?m.col:"#2A2A2A"}}>×{m.val}</div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",marginTop:4}}>
              <div style={{fontSize:mob?10:11,color:"#F0EDE5",letterSpacing:2,fontWeight:700}}>TOTAL MULTIPLIER</div>
              <div style={{...S.mono,fontSize:mob?16:20,fontWeight:900,color:"#B91C1C"}}>
                ×{(+result.atkBonus * +result.comboMult * +result.critAvgMult * +result.eliteBonus * +result.entropyMult).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Survival Score */}
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={S.lbl}>SURVIVAL RATING</div>
              <div style={{...S.val(result.survPct>=60?"#22C55E":result.survPct>=30?"#EAB308":"#E53935"), fontSize:mob?16:22}}>{result.survPct}/100</div>
            </div>
            <div style={{height:6,background:"#1A1A1A"}}>
              <div style={{height:"100%",width:`${result.survPct}%`,background:result.survPct>=60?"#22C55E":result.survPct>=30?"#EAB308":"#E53935",transition:"width 0.3s"}}/>
            </div>
            {result.survPct < 40 && <div style={{fontSize:mob?9:10,color:"#E53935",...S.mono,marginTop:6}}>FRAGILE — add survivability crystals for Entropy 50+</div>}
          </div>

          {/* Synergies */}
          {result.syns.length > 0 && (
            <div style={S.card}>
              <div style={S.lbl}>SYNERGIES DETECTED</div>
              {result.syns.map((s,i)=>(
                <div key={i} style={{...S.infoBox(s.color), marginBottom:6}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <span style={{...S.tag(s.color), marginRight:0, marginBottom:0}}>{s.type}</span>
                    <span style={{fontSize:mob?9:11,color:s.color,fontWeight:700}}>{s.label}</span>
                  </div>
                  <div style={{fontSize:mob?9:10,color:"#888",...S.mono,lineHeight:1.6}}>{s.msg}</div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {result.warns.length > 0 && (
            <div style={S.card}>
              <div style={S.lbl}>BUILD WARNINGS</div>
              {result.warns.map((w,i)=>(
                <div key={i} style={{...S.infoBox("#EAB308"), marginBottom:5, fontSize:mob?9:10, color:"#C0A030",...S.mono, lineHeight:1.5}}>{w}</div>
              ))}
            </div>
          )}

          {/* Character builds quick-load */}
          {char?.builds && (
            <div style={S.card}>
              <div style={S.lbl}>QUICK LOAD — {char.name.toUpperCase()} BUILDS</div>
              {char.builds.map((b,i)=>(
                <button key={b.id} onClick={()=>{
                  const ids = TACTIC_CATALOG.filter(t=>b.tactics?.some(bt=>bt.toLowerCase().includes(t.name.toLowerCase().split(" ")[0]))).map(t=>t.id).slice(0,5);
                  setSelTactics(ids);
                  setSelCrystals(b.crystals?.slice(0,6)||[]);
                }} style={{...S.sBtn(false,char.color),display:"block",width:"100%",textAlign:"left",marginBottom:5,padding:"8px 12px"}}>
                  <span style={{color:char.color,fontWeight:900,marginRight:8}}>{b.name}</span>
                  <span style={{color:"#444",fontSize:mob?8:9}}>{b.arch} · {b.rating}/100</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFusion = () => {
    const fusionKey = [fusionA, fusionB].sort().join("+");
    const fusion = FUSION_DATA[fusionKey];
    const charA = characters.find(c=>c.id===fusionA);
    const charB = characters.find(c=>c.id===fusionB);

    return (
    <div style={S.body}>
      <div style={{...S.card, marginBottom:12}}>
        <div style={S.lbl}>FUSION LAB — SELECT TWO CHARACTERS TO COMBINE</div>
        <div style={{fontSize:mob?10:11,color:"#444",...S.mono,marginBottom:12}}>Pick any two characters. The Fusion Lab analyzes their kits and generates an optimal combined Evotype — abilities from each, unified build, and full math breakdown.</div>

        <div style={S.g2}>
          <div>
            <div style={{fontSize:8,color:"#B91C1C",letterSpacing:2,marginBottom:6,fontWeight:700}}>── PRIMARY CHARACTER</div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${mob?4:8},1fr)`,gap:3}}>
              {characters.map(c=>(
                <div key={c.id} onClick={()=>{setFusionA(c.id);setShowFusion(false);}} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",padding:"5px 3px",background:fusionA===c.id?`${c.color}22`:"#0A0A0A",border:`1px solid ${fusionA===c.id?c.color:"#141414"}`,transition:"all 0.1s",opacity:fusionB===c.id?0.3:1}}>
                  <div style={{width:mob?22:28,height:mob?28:36,overflow:"hidden"}}>
                    <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:fusionA===c.id?"none":"brightness(0.3)"}} onError={e=>{e.target.style.display="none"}}/>
                  </div>
                  <div style={{fontSize:mob?6:7,color:fusionA===c.id?c.color:"#2A2A2A",fontWeight:900,textAlign:"center",marginTop:2,lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%"}}>{c.name.split(" ")[0].toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:8,color:"#60A5FA",letterSpacing:2,marginBottom:6,fontWeight:700}}>── SECONDARY CHARACTER</div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${mob?4:8},1fr)`,gap:3}}>
              {characters.map(c=>(
                <div key={c.id} onClick={()=>{setFusionB(c.id);setShowFusion(false);}} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",padding:"5px 3px",background:fusionB===c.id?`${c.color}22`:"#0A0A0A",border:`1px solid ${fusionB===c.id?c.color:"#141414"}`,transition:"all 0.1s",opacity:fusionA===c.id?0.3:1}}>
                  <div style={{width:mob?22:28,height:mob?28:36,overflow:"hidden"}}>
                    <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:fusionB===c.id?"none":"brightness(0.3)"}} onError={e=>{e.target.style.display="none"}}/>
                  </div>
                  <div style={{fontSize:mob?6:7,color:fusionB===c.id?c.color:"#2A2A2A",fontWeight:900,textAlign:"center",marginTop:2,lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%"}}>{c.name.split(" ")[0].toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12,flexWrap:"wrap"}}>
          {charA && charB && (
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
              <div style={{fontWeight:900,fontSize:mob?13:16,color:charA.color,letterSpacing:1}}>{charA.name.toUpperCase()}</div>
              <div style={{fontSize:14,color:"#444"}}>⊕</div>
              <div style={{fontWeight:900,fontSize:mob?13:16,color:charB.color,letterSpacing:1}}>{charB.name.toUpperCase()}</div>
            </div>
          )}
          <button onClick={()=>setShowFusion(true)} disabled={fusionA===fusionB} style={{background:fusionA===fusionB?"#0D0D0D":"#1A0000",border:`2px solid ${fusionA===fusionB?"#1A1A1A":"#B91C1C"}`,color:fusionA===fusionB?"#2A2A2A":"#F0EDE5",padding:mob?"8px 16px":"10px 28px",fontSize:mob?11:13,letterSpacing:3,fontWeight:900,cursor:fusionA===fusionB?"not-allowed":"pointer",fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.15s"}}>
            {fusionA===fusionB ? "SELECT DIFFERENT CHARACTERS" : "⚡ GENERATE FUSION"}
          </button>
        </div>
      </div>

      {showFusion && fusion && charA && charB && (
        <div>
          {/* FUSION HEADER */}
          <div style={{...S.fusionCard(`${charA.color}`), marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:mob?10:20,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <div style={{width:mob?40:64,height:mob?52:84,overflow:"hidden",clipPath:"polygon(0 0,100% 0,85% 100%,0 100%)"}}>
                  <img src={charA.img} alt={charA.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center"}} onError={e=>{e.target.style.display="none"}}/>
                </div>
                <div style={{fontSize:mob?18:14,color:"#3A3A3A",alignSelf:"center",fontWeight:900}}>⊕</div>
                <div style={{width:mob?40:64,height:mob?52:84,overflow:"hidden",clipPath:"polygon(15% 0,100% 0,100% 100%,0 100%)"}}>
                  <img src={charB.img} alt={charB.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center"}} onError={e=>{e.target.style.display="none"}}/>
                </div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:9,letterSpacing:3,color:charA.color,marginBottom:4,fontWeight:700}}>FUSION EVOTYPE</div>
                <div style={{fontSize:mob?22:32,fontWeight:900,letterSpacing:mob?1:2,color:"#F0EDE5",lineHeight:1.05,marginBottom:6}}>{fusion.name}</div>
                <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{...S.tag(TIER_COLORS[fusion.rating]||"#888"),fontSize:11}}>TIER {fusion.rating}</span>
                  <span style={{...S.tag(charA.color)}}>{charA.name.toUpperCase()}</span>
                  <span style={{...S.tag(charB.color)}}>{charB.name.toUpperCase()}</span>
                </div>
                <div style={{fontSize:mob?11:13,color:"#A0A0A0",lineHeight:1.7,...S.mono}}>{fusion.desc}</div>
              </div>
            </div>
          </div>

          <div style={S.g2}>
            {/* ABILITIES TO TAKE */}
            <div>
              <div style={{...S.card, borderColor:charA.color+"44"}}>
                <div style={{...S.lbl, color:charA.color}}>FROM {charA.name.toUpperCase()}</div>
                {(fusion.take[charA.id]||[]).map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:"#0A0A0A",borderLeft:`2px solid ${charA.color}`,marginBottom:5}}>
                    <div style={{color:charA.color,fontWeight:900,fontSize:10,flexShrink:0,letterSpacing:1}}>↳</div>
                    <div style={{fontSize:mob?10:11,color:"#C0C0C0",lineHeight:1.5}}>{a}</div>
                  </div>
                ))}
              </div>
              <div style={{...S.card, borderColor:charB.color+"44"}}>
                <div style={{...S.lbl, color:charB.color}}>FROM {charB.name.toUpperCase()}</div>
                {(fusion.take[charB.id]||[]).map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:"#0A0A0A",borderLeft:`2px solid ${charB.color}`,marginBottom:5}}>
                    <div style={{color:charB.color,fontWeight:900,fontSize:10,flexShrink:0,letterSpacing:1}}>↳</div>
                    <div style={{fontSize:mob?10:11,color:"#C0C0C0",lineHeight:1.5}}>{a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FUSION BUILD */}
            <div>
              <div style={S.card}>
                <div style={S.lbl}>FUSION TACTIC LOADOUT</div>
                {fusion.tactics.map((t,i)=>{
                  const slot = ["Attack","Skill","Dash","Legacy","Summon"][i];
                  const sc = SLOT_COLORS[slot]||"#888";
                  return (
                    <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:"#111",borderLeft:`3px solid ${sc}`,marginBottom:5,alignItems:"flex-start"}}>
                      <div style={{fontSize:mob?8:9,fontWeight:900,color:sc,letterSpacing:1,flexShrink:0,paddingTop:2}}>{slot.toUpperCase()}</div>
                      <div style={{fontSize:mob?11:13,color:"#E0E0E0",fontWeight:700}}>{t}</div>
                    </div>
                  );
                })}
              </div>

              <div style={S.card}>
                <div style={S.lbl}>FUSION CRYSTAL LOADOUT</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
                  {fusion.crystal.map(cid=>{
                    const catMap = { "straightforward":"DAMAGE","domination":"DAMAGE","giant-slayer":"DAMAGE","combo-surge":"DAMAGE","lethal-momentum":"DAMAGE","predator":"DAMAGE","not-dead-yet":"SURVIVAL","indestructible":"SURVIVAL","defensive-combo":"SURVIVAL","vital-boost":"SURVIVAL","second-wind":"SURVIVAL","exhilaration":"UTILITY","resonance":"UTILITY","fatal-blow":"UTILITY","focus":"UTILITY","summon-booster":"ADVANCED","legacy-amplifier":"ADVANCED","phantom-step":"ADVANCED","chain-reaction":"ADVANCED","hunters-mark":"ADVANCED","blood-pact":"ADVANCED","apex-predator":"ADVANCED","mana-surge":"ECONOMY","ice-fortune":"ECONOMY","fire-fortune":"ECONOMY","umbra-fortune":"ECONOMY" };
                    const catCol = { DAMAGE:"#E53935", SURVIVAL:"#F59E0B", ECONOMY:"#60A5FA", UTILITY:"#C9A227", ADVANCED:"#A78BFA" };
                    const cat = catMap[cid]||"UTILITY";
                    const col = catCol[cat]||"#888";
                    return (
                      <div key={cid} style={{background:`${col}10`,border:`1px solid ${col}44`,padding:"6px 8px",textAlign:"center"}}>
                        <div style={{fontSize:mob?8:9,color:col,fontWeight:900,letterSpacing:1,lineHeight:1.2}}>{cid.replace(/-/g," ").toUpperCase()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{...S.card,borderColor:`${charA.color}44`}}>
                <div style={S.lbl}>FUSION SYNERGY</div>
                <div style={{fontSize:mob?10:12,color:"#888",lineHeight:1.7,...S.mono,marginBottom:10}}>{fusion.synergy}</div>
                <div style={{...S.infoBox("#C9A227")}}>
                  <div style={{fontSize:8,letterSpacing:3,color:"#C9A227",fontWeight:700,marginBottom:4}}>MORPHEUS — FUSION MATH</div>
                  <div style={{fontSize:mob?10:11,color:"#B0B080",lineHeight:1.7,...S.mono}}>{fusion.math}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFusion && !fusion && (
        <div style={{...S.card, textAlign:"center", padding:mob?24:40}}>
          <div style={{fontSize:mob?14:20,fontWeight:900,color:"#3A3A3A",letterSpacing:2,marginBottom:8}}>FUSION DATA NOT YET CATALOGUED</div>
          <div style={{fontSize:mob?10:12,color:"#2A2A2A",...S.mono}}>
            {charA?.name} + {charB?.name} pairing not yet analyzed.<br/>
            This fusion would combine: {charA?.tag} × {charB?.tag}
          </div>
        </div>
      )}
    </div>
  );};

  return (
    <div style={S.wrap}>
      <div style={S.topBar}>
        <button style={S.tab(mode==="calc")} onClick={()=>setMode("calc")}>⚡ BUILD CALCULATOR</button>
        <button style={S.tab(mode==="fusion")} onClick={()=>setMode("fusion")}>⊕ FUSION LAB</button>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",padding:"0 12px",fontSize:9,color:"#2A2A2A",letterSpacing:2,whiteSpace:"nowrap"}}>ENTROPY OVERRIDE // CALCULATOR</div>
      </div>
      {mode==="calc" ? renderCalc() : renderFusion()}
    </div>
  );
}
