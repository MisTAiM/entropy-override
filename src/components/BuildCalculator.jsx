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
  // ─── HIBIKI EXPANSIONS ───────────────────────────────────────────────────
  "es+hibiki":      { name:"SHADOW CREST",        rating:"A+", desc:"Clone ambush onto crest positions. Every crest becomes a back-attack trigger — clones materialize exactly where mines explode.", primary:"hibiki", secondary:"es",
    take:{ hibiki:["Shadow Ambush legacy — clones appear on target","Back-attack positioning bonus","3-dodge chain mobility","Clone tactic proc multiplication"], es:["Crest spatial trap network","Mine detonation on approach","Aerial bounce chain","Speed Crest dash coverage"] },
    crystal:["exhilaration","defensive-combo","giant-slayer","summon-booster","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Place Mine","Dash Phantom","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Crests define enemy positions — clones appear directly behind crest-trapped enemies. Back-attack talent activates on every clone proc near crest fields. Mine detonation forces enemies into the exact range where clones land back-attacks.",
    math:"Mine trap → enemy frozen at crest → clone back-attack: 275 × 3 clones × back-attack mult × mine 570 detonation chain. Summon Booster +45% applies to clone and mine simultaneously. Combined burst window: ~3200 in 1.5s." },

  "hibiki+noel":    { name:"SHADOW DRIVE",         rating:"A+", desc:"Noel Drive speed feeds Hibiki clone combo stacking faster than any other pairing. 9 hits/sec + 3 clone procs = Exhilaration cap in 18 seconds.", primary:"hibiki", secondary:"noel",
    take:{ hibiki:["Clone shadow spawn — 3 autonomous attackers","Back-attack bonus on all clone hits","3-dodge iframe chain","Shadow Spike proc multiplication"], noel:["Drive: 9 hits/sec rapid fire","Rapid skill rotation speed","Long-range passive bonus","Bullet Storm multi-target spray"] },
    crystal:["exhilaration","combo-surge","giant-slayer","defensive-combo","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Cold","Dash Thunderbolt","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Noel hit frequency builds combo count for both Exhilaration and Surge while clones independently contribute 3 additional hit streams. 18-second Exhilaration cap is top-5 fastest in the game. At cap: Noel Drive × 3 clone procs × 3.0× = 9× effective hit value.",
    math:"18s to Exhilaration cap: 9 hits/sec player + ~9 hits/sec clone equivalent = 18 effective hits/sec. At cap: combo × 3.0× × giant slayer 1.6 vs elite = 4.8×. Stack Straightforward +45% for 6.9× total vs elite." },

  "hibiki+rachel":  { name:"PHANTOM STORM",        rating:"A",  desc:"Clone ambush + bat swarm. Rachel familiars proc alongside clones — triple proc becomes quadruple-plus proc on every attack string.", primary:"hibiki", secondary:"rachel",
    take:{ hibiki:["Clone shadow ambush procs","Back-attack positioning talent","3-dodge chain mobility","Shadow Spike clone inheritance"], rachel:["Bat swarm — persistent autonomous attackers","Tempest Dahlia crowd pull","Wind Barrier persistent AoE field","Chain Lightning proc via bats"] },
    crystal:["resonance","summon-booster","exhilaration","not-dead-yet","giant-slayer","legacy-amplifier"],
    tactics:["Attack Chain Lightning","Skill Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Bat Swarm"],
    synergy:"Both sources are classified summon-type: clones and bats trigger Summon Booster simultaneously. Resonance +40% on all tactic procs from both sources. Tempest Dahlia pulls groups into back-attack range for all clone procs.",
    math:"Bat chain: 295×3×1.4×1.45=1800/proc. Clone shadow: 275×3×1.4×1.45=1683/proc wave. Both firing simultaneously with zero input. Legacy Amplifier on Light Spear: 490×1.5=735. Total passive autonomous DPS: ~3500+ by stage 3." },

  "hibiki+taokaka": { name:"BLITZ PHANTOM",         rating:"A+", desc:"Clone back-attacks at Taokaka rush speed. Tao 11 hits/sec establishes combo count in 15s while clones proc on every flanking opportunity.", primary:"hibiki", secondary:"taokaka",
    take:{ hibiki:["Clone shadow spawn behind targets","Back-attack talent — clones inherit the bonus","3-dodge mobility chain","Shadow Spike autonomous proc stream"], taokaka:["Rush: 10-12 hits/sec claw blitz","Infinite dodge direction changes","Speed Demon kill momentum","Ambush burst window"] },
    crystal:["exhilaration","combo-surge","defensive-combo","giant-slayer","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Taokaka rush pace + clone proc rate = 15-second Exhilaration cap. Both characters never stop moving — Defensive Combo active 90% of fight. Tao positions naturally into flanking angles, activating Hibiki back-attack talent on every rush string.",
    math:"15s Exhilaration cap: 12 hits/sec Tao + 9 clone-equivalent hits = 21 effective. At cap: straightforward 1.45 × combo 3.0 × giant slayer 1.6 = 6.96× vs elites. Tao kill chain momentum × clone back-attack burst: peak window ~4800/s." },

  "hibiki+mai":     { name:"NEEDLE SHADOW",         rating:"A",  desc:"8 needles per cast × 3 clone streams = 24 simultaneous tactic procs per Mai skill rotation with full clone overlap.", primary:"hibiki", secondary:"mai",
    take:{ hibiki:["Clone spawn — 3 independent proc streams","Back-attack positioning talent","3-dodge iframe mobility","Shadow Spike × clone multiplication"], mai:["Needle Storm: 8 projectiles per cast","Frost Spear Cold application + slow","Chain Spear follow-up multi-hit","Needle reach — procs at range"] },
    crystal:["exhilaration","resonance","giant-slayer","not-dead-yet","domination","straightforward"],
    tactics:["Attack Shadow Spike","Skill Frost Spear","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Mai needles proc Shadow Spike per needle — 8 procs per cast. Clones triple this: 24 Shadow Spike activations per combined rotation. Cold slow from Frost Spear plants enemies in back-attack range for all clone hits.",
    math:"24 Shadow Spike procs: 275×24=6600 raw per Needle+Clone rotation. × Resonance 1.4 = 9240. × Giant Slayer 1.6 vs elite = 14784 per combined rotation. Highest multi-proc ceiling of any Hibiki fusion." },

  "hibiki+hazama":  { name:"VENOM SHADOW",          rating:"A",  desc:"Chain whip reach + clone ambush. Hazama whip hits all 3-5 targets while clones simultaneously strike from behind on each.", primary:"hibiki", secondary:"hazama",
    take:{ hibiki:["Clone ambush — all 3 clones inherit chain proc","Back-attack talent on whip range","3-dodge mobility","Shadow Spike per-clone proc"], hazama:["Chain whip: 3-5 simultaneous target hits","Snake Burn DoT application","Ouroboros ring extended range","Counter God parry window"] },
    crystal:["exhilaration","resonance","giant-slayer","not-dead-yet","fire-fortune","straightforward"],
    tactics:["Attack Shadow Spike","Skill Chain Venom","Dash Shadow","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Chain whip hits 3-5 targets simultaneously — each target takes Shadow Spike from player AND from 3 clones. At 5 targets × 3 clones = 15 shadow procs per whip swing. Fire fortune aligns with Burn DoT application on every proc.",
    math:"5 targets × 3 clones × 275 Shadow Spike = 4125 per whip swing at base. × Resonance 1.4 = 5775. Burn DoT stacks on all 5 targets: 260×5=1300 passive DoT/s. Peak single swing burst: ~7000+ with full stack." },

  "hibiki+prisoner":{ name:"DEAD CELL SHADOW",      rating:"A",  desc:"Prisoner weapon variety triggers clones on every weapon type. Dead Cells roll invincibility extends Hibiki dodge chain.", primary:"hibiki", secondary:"prisoner",
    take:{ hibiki:["Clone ambush spawn","Back-attack talent bonus","3-dodge chain iframe","Shadow Spike clone inheritance"], prisoner:["Weapon variety — all types proc equally","Roll-dodge invincibility frames","Adaptive weapon picks per run","Dead Cells kill momentum"] },
    crystal:["exhilaration","phantom-step","giant-slayer","not-dead-yet","straightforward","chain-reaction"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Shadow","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Prisoner roll + Hibiki 3 dodges = 4 consecutive iframe windows. Any weapon Prisoner uses activates clone procs. Chain Reaction kill momentum from Dead Cells-style snowball complements Hibiki clone output acceleration.",
    math:"4 iframe windows = near-total invincibility rotation. Kill momentum: Chain Reaction stacks to +36% at 3 kills. Clone back-attack during roll: 275 × 3 × 1.36 = 1122 per proc during kill chain momentum." },

  // ─── RAGNA EXPANSIONS ────────────────────────────────────────────────────
  "jin+ragna":      { name:"BLOOD ICE",              rating:"A+", desc:"Blood Kain activates — enemies frozen and unable to interrupt Scythe heal. Jin freeze field is the perfect Blood Kain delivery system.", primary:"ragna", secondary:"jin",
    take:{ ragna:["Blood Scythe AoE heal on hit","Blood Kain sub-50% damage multiplier","Super armor through heavy attacks","Self-sustaining lifesteal loop"], jin:["Attack Cold slow — enemies frozen","Skill Cold +47% on all skills","Frost Burst at Cold stack peak","Ice Fortune tactic guarantee"] },
    crystal:["vital-boost","not-dead-yet","ice-fortune","mixture-enhancement","giant-slayer","straightforward"],
    tactics:["Attack Cold","Skill Blood Scythe","Dash Shadow Spike","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Cold freezes enemies in Blood Scythe range — every hit confirms a heal proc. Vital Boost doubles the HP threshold Blood Kain activates from. Ice Fortune guarantees Cold from first drop.",
    math:"Frozen enemies: 100% Scythe confirm rate. At 50% HP: Blood Kain 1.3× × Cold 1.46× × Giant Slayer 1.6 = 3.04× vs elite in blood threshold window." },

  "ragna+taokaka":  { name:"BLOOD RUSH",             rating:"A+", desc:"Taokaka rush pace keeps Ragna in blood threshold with minimal downtime. Kill speed from Tao momentum resets Blood Scythe constantly.", primary:"ragna", secondary:"taokaka",
    take:{ ragna:["Blood Scythe group heal — resets HP for Kain threshold","Blood Kain sub-50% bonus","Super armor on heavy strings"], taokaka:["Rush pace: kill momentum kills bring Blood Scythe range","Claw blitz combo sustain","Infinite dodge direction changes","Speed Demon kill chain"] },
    crystal:["exhilaration","not-dead-yet","vital-boost","mixture-enhancement","giant-slayer","chain-reaction"],
    tactics:["Attack Burn","Skill Blood Scythe","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Taokaka kill chain keeps rooms clear fast — Blood Scythe healing on grouped enemies between rooms. Chain Reaction: 3 kills → +36% on top of Blood Kain. Exhilaration via Tao hit rate stacks before Blood Kain threshold arrives.",
    math:"Kill chain: +36% (Chain Reaction) × Blood Kain 1.3 × Exhilaration 3.0 cap = 4.68× in post-kill momentum. Blood Scythe area heal: ~400 HP per cast on groups = permanent Blood Kain zone maintenance." },

  "hakumen+ragna":  { name:"VOID BLOOD",             rating:"A+", desc:"Hakumen parries — Blood Kain activates from the guaranteed sub-50% window. Magatama charges while Ragna recovers HP via Scythe.", primary:"ragna", secondary:"hakumen",
    take:{ ragna:["Blood Scythe AoE heal resets HP between Kain phases","Blood Kain sub-50% multiplier","Super armor on heavies"], hakumen:["Void Counter — intentional damage absorption to reach Kain threshold","Magatama charge during blood phase","AoE counter blast on parry","Super armor overlapping"] },
    crystal:["vital-boost","not-dead-yet","legacy-amplifier","giant-slayer","straightforward","apex-predator"],
    tactics:["Attack Light Spear","Skill Blood Scythe","Dash Shadow Spike","Legacy Magatama Counter","Summon Chain Lightning"],
    synergy:"Hakumen takes intentional hits to drop Ragna below 50% — Blood Kain activates. Magatama charges during blood phase. Apex Predator activates at full HP when Scythe heals back up. Cycling between peak Kain phase and peak Apex phase.",
    math:"Apex at full HP: 1.35×. Blood Kain at sub-50%: 1.30×. Magatama full charge: 2.0×. Cycle average: 1.5-1.7× higher than single-mode builds." },

  "hazama+ragna":   { name:"SNAKE BLOOD",            rating:"A",  desc:"Burn DoT softens targets to Blood Kain threshold. Hazama reach applies Burn at range, Ragna closes for Blood Scythe confirm.", primary:"ragna", secondary:"hazama",
    take:{ ragna:["Blood Scythe close-range AoE heal","Blood Kain sub-50% multiplier","Super armor through heavy attacks"], hazama:["Chain whip Burn DoT — applies to 3-5 targets at range","Ouroboros ring extended reach","Snake Burn stacking DoT","Counter God parry backup"] },
    crystal:["fire-fortune","not-dead-yet","vital-boost","giant-slayer","straightforward","mixture-enhancement"],
    tactics:["Attack Burn","Skill Blood Scythe","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Burn DoT from whip range brings enemies to Blood Kain threshold safely. Ragna closes when DoT confirms threshold — Blood Scythe on grouped enemies. Ring of Fire legacy does massive burst at execute range.",
    math:"Burn DoT: 260/s × 5 targets = 1300 passive. At 30% HP: Blood Kain 1.3 × straightforward 1.45 × giant slayer 1.6 = 3.0× on Scythe confirm. Ring of Fire at execute: 770 × 1.5 = 1155 burst cleanup." },

  "icey+ragna":     { name:"PIXEL BLOOD",            rating:"A",  desc:"ICEY dance patterns never drop Ragna below Scythe-heal range. Dance mobility keeps Blood Kain threshold accessible without taking lethal hits.", primary:"ragna", secondary:"icey",
    take:{ ragna:["Blood Scythe heal — dance patterns keep hitting grouped enemies","Blood Kain sub-50% window","Super armor on heavies"], icey:["Dance movement: attack patterns dodge simultaneously","Pixel Storm combo burst","Blade Dance execution window","ICEY combo hit frequency"] },
    crystal:["exhilaration","not-dead-yet","vital-boost","defensive-combo","giant-slayer","straightforward"],
    tactics:["Attack Burn","Skill Thunderbolt","Dash Shadow Spike","Legacy Blood Scythe","Summon Lightning Orb"],
    synergy:"ICEY dance = always attacking, always dodging simultaneously. Blood Scythe on dance procs = constant healing during movement. Never stationary = Defensive Combo always active. Hit frequency from dance pace hits Exhilaration cap at ~25 seconds.",
    math:"Dance hit frequency: ~8-10 hits/sec. Exhilaration cap: ~28s. At cap: 3.0× × Blood Kain 1.3 = 3.9× during blood phase. Defensive Combo -80% during dance strings." },

  // ─── JIN EXPANSIONS ──────────────────────────────────────────────────────
  "es+jin":         { name:"FROST CREST",            rating:"S",  desc:"Freeze field + crest spatial traps. Jin Cold freeze plants enemies onto crest positions — frozen targets cannot escape mine detonation.", primary:"jin",  secondary:"es",
    take:{ jin:["Attack Cold freeze — enemies locked in place","Skill Cold +47% all skills","Ice Fortune tactic guarantee","Frost Burst at max Cold stacks"], es:["Crest field — passive damage traps","Mine detonation: frozen enemies cannot dodge mines","Aerial bounce chain on frozen groups","Speed Crest mobility through frozen field"] },
    crystal:["domination","ice-fortune","giant-slayer","exhilaration","not-dead-yet","resonance"],
    tactics:["Attack Cold","Skill Cold","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Cold freeze + crest mine = guaranteed detonation. Frozen enemies sit on mines for full tick damage — mine bounce chains confirmed since targets cannot move out of bounce radius. Domination amplifies both Skill Cold and mine simultaneously.",
    math:"Mine on frozen target: 570 × bounce × 3 = 1710 confirmed. Frost Burst at max Cold: 520 AoE × Domination 1.45 × Resonance 1.4 = 1056 AoE proc. Scene control: 100%." },

  "jin+rachel":     { name:"STORM FREEZE",           rating:"A+", desc:"Frozen enemies get pulled by Tempest Dahlia then hit by Frost Burst. Jin freezes, Rachel repositions frozen enemies into optimal AoE range.", primary:"jin",  secondary:"rachel",
    take:{ jin:["Attack Cold freeze field","Skill Cold stacking slow","Ice Fortune tactic drop guarantee","Frost Burst AoE burst"], rachel:["Tempest Dahlia pull — repositions frozen enemies into clusters","Bat summon proc on all grouped enemies","Wind Barrier persistent field","Pumpkin detonation on clusters"] },
    crystal:["resonance","ice-fortune","exhilaration","not-dead-yet","giant-slayer","domination"],
    tactics:["Attack Cold","Skill Frost Burst","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Freeze field + Dahlia pull = max enemy density in Frost Burst radius. Frost Burst at max Cold stacks with enemies clustered: 520 × all targets. Ring of Fire on clustered frozen enemies: 770 burst × group size.",
    math:"Frozen cluster: 5 enemies × Frost Burst 520 × Domination 1.45 = 3770 AoE. Ring of Fire: 770 × 5 targets × Resonance 1.4 = 5390 total burst. No enemy can escape frozen + pulled position." },

  "jin+taokaka":    { name:"FROZEN RUSH",            rating:"A+", desc:"Taokaka rush in a frozen field means 100% back-attack exposure. Tao infinite dodges become infinite flanking through Cold-slowed enemies.", primary:"jin",  secondary:"taokaka",
    take:{ jin:["Cold field: enemies at 30% speed","Skill Cold +47% damage bonus","Ice Fortune guaranteed drop","Frost Burst at Cold peak"], taokaka:["Rush: flanking every frozen enemy from behind","Infinite dodge chains through frozen zones","Claw blitz against immobile targets","Combo Surge feeding Exhilaration on frozen hit streaks"] },
    crystal:["exhilaration","combo-surge","ice-fortune","giant-slayer","not-dead-yet","defensive-combo"],
    tactics:["Attack Cold","Skill Cold","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Frozen enemies at 30% speed cannot rotate to face Tao rush — 100% back-attack exposure. Tao rush builds combo at maximum rate since zero evasion from enemies. Combo Surge + Exhilaration both hit cap ~20s in frozen field.",
    math:"Frozen + Tao rush: 12 hits/sec with 100% back-attack on all hits. Exhilaration cap: 20s. At cap: 3.0 × back-attack talent × Cold 1.46 × Giant Slayer 1.6 = 7.0× vs elite. Highest Jin combo ceiling." },

  "bullet+jin":     { name:"FROST SHELL",            rating:"A",  desc:"Bullet CQC drive in a frozen field. Drive shells hit frozen enemies with no risk — sub-50% HP protected by Defensive Combo.", primary:"jin",  secondary:"bullet",
    take:{ jin:["Cold field freeze — enemies cannot interrupt Drive","Skill Cold +47% damage bonus","Ice Fortune tactic guarantee"], bullet:["Drive: 8-10 shells/sec sustained CQC","Defensive Combo protection during drive strings","Steel Shell HP sustain","Demolition Charge burst"] },
    crystal:["defensive-combo","ice-fortune","not-dead-yet","giant-slayer","straightforward","vital-boost"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Frozen enemies cannot interrupt Drive strings — Defensive Combo active 100% during CQC. Drive in frozen field = max shells landed with zero threat. Cold +47% applies to all Drive hits.",
    math:"Drive 9 hits/sec × Cold 1.46 = 1.46× sustained. Frozen: zero counterattack risk. Defensive Combo -80% during Drive = effective HP × 5 during attack strings." },

  "jin+mai":        { name:"FROST NEEDLE",           rating:"A+", desc:"Mai 8 needles each apply Cold — stack hit count triples. Cold stacks accumulate 8× faster per cast, reaching Frost Burst threshold in 2 skill uses.", primary:"jin",  secondary:"mai",
    take:{ jin:["Cold stacking: accumulates per hit","Skill Cold +47% damage","Ice Fortune guaranteed","Frost Burst AoE at stack peak"], mai:["Needle Storm: 8 hits per cast = 8× Cold stack rate","Frost Spear single-target Cold confirm","Chain Spear follow-up multi-hit","Mana-efficient skill rotation"] },
    crystal:["ice-fortune","domination","exhilaration","giant-slayer","not-dead-yet","resonance"],
    tactics:["Attack Cold","Skill Frost Spear","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"8 needles per cast = 8 Cold stack applications per Mai skill use. Cold freeze threshold reached in 2 casts instead of 8+ normal attacks. Ice Fortune guarantees Cold drop, Frost Burst ready immediately after first Mai skill cast.",
    math:"2 Mai skill casts = full Cold freeze. Frost Burst: 520 × Domination 1.45 × Resonance 1.4 = 1055 AoE. Needle ongoing: 8 procs × Cold 1.47 × Domination 1.45 = 17.1× expected vs single-hit equivalent. Fastest Cold stack build." },

  "hazama+jin":     { name:"COLD VENOM",             rating:"A",  desc:"Freeze them, chain them. Hazama whip applies DoT while frozen enemies cannot escape — perfect DoT delivery while Jin holds the field.", primary:"jin",  secondary:"hazama",
    take:{ jin:["Cold field — enemies frozen, cannot escape whip DoT","Skill Cold +47% damage","Ice Fortune guaranteed","Frost Burst AoE cleanup"], hazama:["Chain whip Burn DoT on all frozen targets","Ouroboros ring range extension","Snake Burn stacking on immobile enemies","Counter God parry if enemies break freeze"] },
    crystal:["ice-fortune","fire-fortune","not-dead-yet","giant-slayer","resonance","exhilaration"],
    tactics:["Attack Cold","Skill Burn","Dash Thunderbolt","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Frozen enemies cannot move out of whip range — guaranteed DoT stacks on all targets. Both Ice Fortune and Fire Fortune align simultaneously. Cold drops feed freeze field, Fire drops feed Burn DoT. Dual fortune alignment: unique dual-element build.",
    math:"Burn DoT on frozen × 5 targets: 260 × 5 = 1300 passive. At freeze peak: Frost Burst 520 × Resonance 1.4 = 728 AoE cleanup. Both fortunes active simultaneously." },

  "jin+prisoner":   { name:"DEAD FREEZE",            rating:"A",  desc:"Prisoner weapon variety hits frozen enemies with zero risk. Roll-dodge immunity + Jin freeze = the most defensively invincible fusion.", primary:"jin",  secondary:"prisoner",
    take:{ jin:["Cold field: total battlefield control","Skill Cold +47% all skills","Ice Fortune tactic control"], prisoner:["Any weapon type hits frozen enemies safely","Roll-dodge: invincibility on every roll","Adaptive weapon picks maximize Cold field usage","Dead Cells kill momentum on frozen rooms"] },
    crystal:["ice-fortune","not-dead-yet","defensive-combo","giant-slayer","exhilaration","chain-reaction"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Frozen field + roll invincibility = permanent safe play. Prisoner weapon rolls against frozen enemies: hit, roll, hit — no gaps. Chain Reaction on frozen room clears: kills accelerate, +36% momentum on clear.",
    math:"Frozen room: 100% hit confirmation rate. Roll invincibility: 60% uptime in aggressive play. Chain Reaction 3-kill: +36% × Giant Slayer 1.6 = 2.18× vs elite at kill momentum. Survival rating: highest of any Jin fusion." },

  // ─── KOKONOE EXPANSIONS ──────────────────────────────────────────────────
  "jin+kokonoe":    { name:"FROZEN SCIENCE",         rating:"A+", desc:"Kokonoe fires missiles from above a frozen field. Jin Cold means no enemy can close distance to Kokonoe — pure aerial artillery.", primary:"kokonoe",secondary:"jin",
    take:{ kokonoe:["Aerial position: above all ground threats","Missile Rain: 10 proj × Cold-slowed targets","Fire Projectile: frozen enemies absorb full burst","Science-type tactic procs in frozen field"], jin:["Cold field: enemies grounded and slowed","Skill Cold +47% on Kokonoe skills","Ice Fortune tactic guarantee","Frost Burst at Cold stack peak"] },
    crystal:["domination","ice-fortune","resonance","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Cold","Skill Fire Projectile","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Kokonoe aerial + Jin freeze = absolute zoning control. Fire Projectile 280 × 10 on frozen stationary targets: every projectile lands. Frost Burst at Cold peak hits full room while Kokonoe is untouched above.",
    math:"Fire Projectile on frozen: 280×10=2800 confirmed. × Domination 1.45 × Resonance 1.4 = 5684 per cast. Frost Burst 520 × Domination 1.45 × Resonance 1.4 = 1055 AoE cleanup." },

  "kokonoe+lambda": { name:"ORBITAL BLADE",          rating:"A+", desc:"Kokonoe missiles trigger Lambda sword rain from above. Swords spawn in aerial positions — the only true aerial summon combo.", primary:"kokonoe",secondary:"lambda",
    take:{ kokonoe:["Aerial position — missiles and swords both fire downward","Missile Rain: 10 projectile burst","Science-type tactic procs","Fire Spirit autonomous aerial attacker"], lambda:["Sword Rain: 4 autonomous swords — fire into aerial position","Summon Booster scales all swords","Shadow Spike per sword hit","Respawn Double permanent sword field"] },
    crystal:["resonance","summon-booster","exhilaration","giant-slayer","not-dead-yet","domination"],
    tactics:["Skill Fire Projectile","Attack Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Aerial Kokonoe + swords = maximum coverage angle. Missiles fire down while swords cover all quadrants — enemies hit from all directions simultaneously. Summon Booster +45% on all 4 swords + missile procs.",
    math:"4 swords × Summon 1.45 × Resonance 1.4 = 2312/wave. Missile 280×10×Domination 1.45 = 4060/cast. Simultaneous: ~6372 combined burst with no floor contact required." },

  "kokonoe+noel":   { name:"SCIENCE DRIVE",          rating:"A",  desc:"Noel Drive procs Kokonoe missile tactic chains. Drive hits trigger orbital responses — 9 hits/sec ground fire + missile rain overhead.", primary:"kokonoe",secondary:"noel",
    take:{ kokonoe:["Aerial bombardment: missiles rain on Drive targets","Fire Projectile: 10 projectiles on Noel skill trigger positions","Zoning — enemies focused on Noel, Kokonoe fires safely"], noel:["Drive: 9 hits/sec rapid fire","Rapid skill rotation feeds Kokonoe tactic slots","Bullet Storm multi-target engagement","Long-range passive bonus"] },
    crystal:["resonance","domination","exhilaration","giant-slayer","not-dead-yet","mana-surge"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Drive 9 hits/sec builds tactic proc rates for missile triggers. Mana Surge keeps Noel Drive rotation fast — Kokonoe skills cycle overhead. Enemies attention split between Drive fire and incoming missiles.",
    math:"Drive 9 hits/sec × Chain Lightning 3-bounce 295×3 = 7965/sec lightning. Fire Projectile overhead: 280×10×Domination 1.45 = 4060/cast. Combined: 12000+ peak DPS burst window." },

  "kokonoe+taokaka":{ name:"SCIENTIFIC CHAOS",       rating:"A",  desc:"Taokaka rushes ground level while Kokonoe bombs from above. Enemies cannot track both attack sources — perfect split attention exploitation.", primary:"kokonoe",secondary:"taokaka",
    take:{ kokonoe:["Aerial position — safe from ground chaos","Missile Rain: targeting Tao engaged enemies","Fire Spirit: flies autonomously while Tao creates ground chaos"], taokaka:["Rush: draws enemy attention entirely","Infinite dodge chains: never in missile landing zone","Claw blitz combo pace","Ambush Cat flanking draws enemies into missile targeting"] },
    crystal:["resonance","exhilaration","combo-surge","giant-slayer","not-dead-yet","straightforward"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Tao draws aggro while Kokonoe bombs. Enemies cannot track aerial attacks while managing Tao rush. Exhilaration from Tao hit rate + Kokonoe missile proc hits feed the combo counter simultaneously.",
    math:"Tao combo + Kokonoe proc combined: Exhilaration cap ~22s. At cap: Fire Projectile 280×10×Resonance 1.4 = 5684 per cast with full Exhilaration. Ground + air coverage = no dead angles." },

  "bullet+kokonoe": { name:"ARTILLERY SHELL",        rating:"A",  desc:"Bullet holds the CQC front line while Kokonoe provides aerial artillery support. Shell hits trigger overhead missile targeting.", primary:"kokonoe",secondary:"bullet",
    take:{ kokonoe:["Aerial position above Bullet CQC range","Missile Rain on Bullet engaged targets","Fire Projectile burst on clustered enemies"], bullet:["Drive shells hit grouped enemies — Kokonoe targets the same cluster","CQC front-line draws enemies to Kokonoe targeting zone","Defensive Combo protection during Drive","Demolition Charge repositions clusters"] },
    crystal:["resonance","domination","giant-slayer","not-dead-yet","defensive-combo","exhilaration"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Bullet Drive groups enemies into Kokonoe missile targeting zone. Demolition Charge clusters before Fire Projectile burst — 10 projectiles all confirmed. Defensive Combo during Drive + aerial safety = zero damage taken.",
    math:"Drive cluster + Fire Projectile: 280×10×Domination 1.45 = 4060 on clustered group. Ring of Fire legacy: 770 on same cluster. Total burst window: ~6000+ on grouped confirm." },

  // ─── ES EXPANSIONS ───────────────────────────────────────────────────────
  "es+rachel":      { name:"SPATIAL STORM",          rating:"A+", desc:"Es crests + Rachel wind. Tempest Dahlia pulls enemies onto crest positions — mines explode where enemies are repositioned, chains to bats.", primary:"es",    secondary:"rachel",
    take:{ es:["Crest field: mine positions placed pre-fight","Mine detonation: Dahlia pulls enemies to trigger positions","Aerial bounce confirms mine chains","Speed Crest dash into bat swarm range"], rachel:["Tempest Dahlia pull: moves enemies to crest positions","Bat swarm procs on mine-positioned enemies","Wind Barrier field around crest network","Chain Lightning via bat hits on crest targets"] },
    crystal:["resonance","summon-booster","not-dead-yet","giant-slayer","exhilaration","defensive-combo"],
    tactics:["Skill Place Mine","Attack Chain Lightning","Dash Thunderbolt","Legacy Light Spear","Summon Bat Swarm"],
    synergy:"Dahlia pull repositions enemies precisely onto crest-mine positions. Three sources firing on the same confirmed target: mine detonation + bat chain + Chain Lightning tactic. Summon Booster applies to bats and mine classification simultaneously.",
    math:"Mine on Dahlia-pulled target: 570 × Resonance 1.4 = 798. Bat chain on same target: 295×3×Summon 1.45×Resonance 1.4 = 1800. Chain Lightning tactic: 295×3 bounce = 885. Total on single target: ~3483 burst." },

  "es+taokaka":     { name:"CREST BLITZ",            rating:"A+", desc:"Tao rush charges through crest fields, detonating mines on every enemy she passes. Infinite dodge chain navigates crest network without self-damage.", primary:"es",    secondary:"taokaka",
    take:{ es:["Crest trap network covering full floor","Mine bounce: Tao rush detonates mines on engaged enemies","Aerial chain above Tao charges","Speed Crest dash speed matching Tao rush angle"], taokaka:["Rush charges through mine fields targeting enemies","Infinite dodge navigates crest positions","Combo Surge feeding Exhilaration during crest blitz","Kill chain from mine-assisted clears"] },
    crystal:["exhilaration","combo-surge","resonance","not-dead-yet","giant-slayer","defensive-combo"],
    tactics:["Skill Place Mine","Attack Shadow Spike","Dash Thunderbolt","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Tao rush detonates mines on every enemy she engages — control rush direction to chain mine detonations. Blackhole legacy captures room, Tao rushes through the stationary cluster triggering the full crest field simultaneously.",
    math:"Tao rush through 5 enemies in mine field: 570 × 5 mines × Resonance 1.4 = 3990. + Shadow Spike per rush hit: 275 × enemies × Resonance 1.4 = 1925. Total pass: ~5915 per rush sweep through crest field." },

  "es+noel":        { name:"DRIVE CREST",            rating:"A",  desc:"Noel Drive activates Es crest combos at 9 procs/sec. The fastest crest chain generator — Drive hits chain-activate spatial fields.", primary:"es",    secondary:"noel",
    take:{ es:["Crest field generates combo on each tactic hit","Mine detonation on Drive-engaged enemies","Speed Crest dash after Drive combos","Aerial bounce keeps Es above Drive range"], noel:["Drive: 9 hits/sec feeds Es crest combo generation","Rapid skill rotation keeps crest fields refreshed","Bullet Storm multi-target tears through crest zones","Long-range passive bonus"] },
    crystal:["domination","exhilaration","resonance","giant-slayer","not-dead-yet","mana-surge"],
    tactics:["Skill Place Mine","Attack Cold","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Drive 9 hits/sec generates crest combo count faster than any other pairing for Es. Mana Surge keeps Drive going continuously — crest chains maintain throughout. Exhilaration accumulates from Drive feed, reaching cap at ~25s.",
    math:"9 hits/sec crest combo generation. Exhilaration cap 25s. At cap: Drive × 3.0 × Domination 1.45 = 4.35× vs single-hit equivalent. Mine detonation on Drive-engaged enemy: 570 × 3 bounce per proc = 1710 burst." },

  // ─── NOEL EXPANSIONS ─────────────────────────────────────────────────────
  "noel+rachel":    { name:"RAPID STORM",            rating:"A",  desc:"Noel Drive attracts enemies, Rachel bats pick off strays. Tempest Dahlia groups enemies into Drive range — maximum efficiency.", primary:"noel",   secondary:"rachel",
    take:{ noel:["Drive: 9 hits/sec on Dahlia-grouped enemies","Rapid skill rotation","Bullet Storm AoE spray","Long-range passive bonus"], rachel:["Tempest Dahlia pull groups enemies into Drive range","Bat swarm procs on all Dahlia-pulled targets","Wind Barrier persistent field around drive zone","Pumpkin detonation on grouped Drive targets"] },
    crystal:["exhilaration","resonance","giant-slayer","not-dead-yet","defensive-combo","straightforward"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Dahlia pull positions all enemies into Drive optimal range. Drive at 9 hits/sec on grouped enemies + bat procs on same cluster. Ring of Fire on Dahlia-grouped cluster: 770 on all targets simultaneously.",
    math:"Dahlia group: 5 enemies in Drive range. Drive 9 hits/sec × 5 targets × Exhilaration 3.0 = 135 effective hits/sec at cap. Ring of Fire on group: 770 × Resonance 1.4 = 1078 per target × 5 = 5390 burst." },

  "lambda+noel":    { name:"SWORD DRIVE",            rating:"A+", desc:"Lambda swords proc on Noel Drive targets. Drive establishes hit contact, swords autonomously follow up — highest base DPS of any non-clone fusion.", primary:"noel",   secondary:"lambda",
    take:{ noel:["Drive: 9 hits/sec — establishes hit contact for swords","Rapid skill rotation keeps sword spawn rate high","Bullet Storm engages multiple targets for swords to follow"], lambda:["Sword Rain: 4 swords follow Drive target contact","Summon Booster scales all swords on Drive targets","Shadow Spike per sword hit","Respawn Double permanent sword coverage"] },
    crystal:["resonance","summon-booster","exhilaration","giant-slayer","not-dead-yet","domination"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Drive 9 hits/sec + 4 sword procs per hit = 36 sword proc events per second at peak. Summon Booster applies to all 4 swords simultaneously. Noel hit frequency is the highest in roster — Lambda swords scale directly.",
    math:"36 sword procs/sec: 275×36=9900 raw shadow proc rate. × Summon 1.45 × Resonance 1.4 = 20097 theoretical max. Actual sustained accounting for cooldowns: ~6000-8000 DPS by stage 3. Highest raw proc rate of any fusion." },

  "bullet+noel":    { name:"FIREPOWER",              rating:"A+", desc:"Double CQC gunfighters. Noel Drive + Bullet Drive = maximum combined hit rate. Both characters hit Exhilaration cap in 15 seconds.", primary:"noel",   secondary:"bullet",
    take:{ noel:["Drive: 9 hits/sec — fastest single character","Rapid-fire skill rotation","Bullet Storm: AoE spray on grouped enemies"], bullet:["Drive shells: 8-10 hits/sec — matches Noel pace","CQC: same range as Noel, both feeding combo count","Defensive Combo: both protected during drive strings","Demolition Charge AoE burst"] },
    crystal:["exhilaration","combo-surge","defensive-combo","giant-slayer","not-dead-yet","straightforward"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Combined Drive rate: 9 + 9 = 18 effective hits/sec. Exhilaration cap: 15 seconds — tied fastest with Noel+Tao. Both in Defensive Combo range during drives simultaneously. Combo Surge also caps at 15s.",
    math:"15s combo cap: 18 hits/sec. At cap: Exhilaration 3.0 × Defensive Combo -80% DMG taken × Giant Slayer 1.6 = 5.6× vs elite. Most aggressive base DPS fusion." },

  "icey+noel":      { name:"PIXEL DANCE DRIVE",      rating:"A",  desc:"ICEY dance patterns + Noel Drive = widest attack coverage. Dance sweeps ground while Drive fires forward — no dead angle at any range.", primary:"noel",   secondary:"icey",
    take:{ noel:["Drive: 9 hits/sec forward-line fire","Rapid skill rotation in dance proximity","Bullet Storm sweeps during ICEY repositions"], icey:["Dance movement: omnidirectional attack","Pixel Storm all-direction combo","Blade Dance execute burst between Drive cycles","Combo accumulation from dance pace"] },
    crystal:["exhilaration","defensive-combo","giant-slayer","not-dead-yet","straightforward","combo-surge"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Dance covers all angles, Drive covers linear corridor — zero dead angle in any direction. Both build Exhilaration simultaneously: ~20s cap. ICEY dance and Noel Drive both protected by Defensive Combo during attack animation.",
    math:"Omnidirectional + forward coverage: no positioning cost. 20s Exhilaration: 3.0× × Defensive Combo -80% = attack freely at full damage. Giant Slayer 1.6 vs elite. Combined effective: 4.8× sustained with zero positioning tax." },

  // ─── RACHEL EXPANSIONS ───────────────────────────────────────────────────
  "rachel+taokaka": { name:"WIND BEAST",             rating:"A",  desc:"Tao rush delivers enemies into Rachel wind field. Tempest Dahlia repositions Tao-exhausted enemies back into bat range.", primary:"rachel", secondary:"taokaka",
    take:{ rachel:["Tempest Dahlia: pull exhausted enemies back into bat range","Bat swarm proc on Tao rush targets","Wind Barrier field covers Tao rush corridor","Pumpkin detonation on Tao-grouped enemies"], taokaka:["Rush charges into Rachel wind field","Infinite dodge chains through bat swarm","Speed Demon kill momentum in wind field","Claw blitz on Dahlia-pulled enemies"] },
    crystal:["resonance","exhilaration","summon-booster","giant-slayer","not-dead-yet","defensive-combo"],
    tactics:["Attack Chain Lightning","Skill Thunderbolt","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Tao rush charges through bat swarm — bats proc on Tao engaged enemies simultaneously. Dahlia pulls routed enemies back into renewed Tao rush range. Ring of Fire on Dahlia-clustered Tao targets: area burst.",
    math:"Bat chain on Tao target: 295×3×Resonance 1.4×Summon 1.45=1800. + Tao claw hit: 520×Exhilaration 3.0=1560 at cap. Per Tao-engaged enemy: ~3360 combined. 5 enemies: ~16800 total burst in single rush + bat sweep." },

  "bullet+rachel":  { name:"SHELL STORM",            rating:"A",  desc:"Bullet CQC holds enemies in bat range. Bats proc on every Drive target while Bullet Demolition Charge clusters them for maximum bat coverage.", primary:"rachel", secondary:"bullet",
    take:{ rachel:["Bat swarm: procs on all Bullet Drive targets","Tempest Dahlia pull groups Drive targets","Wind Barrier around CQC zone","Chain Lightning via bats on clustered Drive targets"], bullet:["Drive holds enemies in bat range","Demolition Charge: clusters enemies for bat swarm","Defensive Combo: protected while bats proc around","CQC sustain from Steel Shell"] },
    crystal:["resonance","summon-booster","not-dead-yet","giant-slayer","exhilaration","defensive-combo"],
    tactics:["Attack Chain Lightning","Skill Thunderbolt","Dash Blade Slash","Legacy Ring of Fire","Summon Bat Swarm"],
    synergy:"Drive holds enemies in range for bat procs. Demolition Charge clusters before bat sweep. Defensive Combo during Drive = Bullet always protected while bats do autonomous damage overhead.",
    math:"Clustered bat sweep on 5 Drive targets: 295×3×5×Resonance 1.4×Summon 1.45 = 9015. Drive at same time: 9 hits/sec × Exhilaration 3.0 = sustained layer. Peak combined: ~12000/s at stage 3." },

  "naoto+rachel":   { name:"BLOOD STORM",            rating:"A",  desc:"Bats apply pressure to push enemies toward execute threshold. Naoto closes when Hunter Eye activates on bat-damaged targets.", primary:"rachel", secondary:"naoto",
    take:{ rachel:["Bat swarm: persistent pressure, drives HP to 30% for Hunter Eye","Tempest Dahlia: positions Hunter Eye targets","Wind Barrier persistent DoT field","Chain Lightning finishing burst on marked targets"], naoto:["Hunter Eye: execute burst on bat-weakened enemies","Blood Edge HP-cost execute","Fatal Blow crit in execute window","Blood Restriction long-range drain"] },
    crystal:["resonance","fatal-blow","not-dead-yet","giant-slayer","focus","summon-booster"],
    tactics:["Attack Chain Lightning","Skill Blood Edge","Dash Thunderbolt","Legacy Light Spear","Summon Bat Swarm"],
    synergy:"Bats apply sustained damage to bring enemies to 30% HP. Hunter Eye activates — Naoto closes for execute. Rachel bats cover the approach with Chain Lightning procs. Fatal Blow crit on execute: reliable crit rate via Focus.",
    math:"Bat DPS to 30% threshold: ~6 bat waves at ~1800/wave = 10800 total to activate Hunter Eye. Execute: Fatal Blow 1.75 × Focus 55% crit avg 1.41 × Hunter Eye 1.75 × Giant Slayer 1.6 = 6.89× on execute spike." },

  "icey+rachel":    { name:"STORM DANCER",           rating:"A",  desc:"ICEY dance attracts bat procs on every dance hit. Dance movement keeps ICEY in bat swarm range — autonomous damage amplifies dance DPS.", primary:"rachel", secondary:"icey",
    take:{ rachel:["Bats proc on ICEY dance targets","Tempest Dahlia repositions dance targets back into range","Wind Barrier field extends dance reach","Chain Lightning on ICEY-hit targets"], icey:["Dance: always attacking, always in bat range","Pixel Storm omnidirectional keeps enemies in bat field","Blade Dance execute uses bat-weakened targets","Dance pace drives Exhilaration accumulation"] },
    crystal:["resonance","exhilaration","summon-booster","not-dead-yet","giant-slayer","defensive-combo"],
    tactics:["Attack Chain Lightning","Skill Thunderbolt","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Dance movement = always in bat range. Bats proc on every dance-hit enemy. ICEY dance + bat autonomous DPS = two independent attack streams always active. Exhilaration from dance pace caps simultaneously with bat proc feedback.",
    math:"ICEY dance: 8-10 hits/sec × bat proc per hit: 295×3×Resonance 1.4×Summon 1.45=1800 per dance contact. Exhilaration cap ~26s from dance pace. At cap: dance 3.0× × bat proc 1800 per hit. Dance + bats: ~5400/s peak." },

  // ─── LAMBDA EXPANSIONS ───────────────────────────────────────────────────
  "lambda+ragna":   { name:"BLADE BLOOD",            rating:"A",  desc:"Lambda swords proc lifesteal through Blood Scythe inheritance. All 4 swords independently trigger Ragna Scythe ability.", primary:"lambda", secondary:"ragna",
    take:{ lambda:["Sword Rain: 4 independent swords proc per hit","Umbra Fortune for Shadow Spike confirmation","Respawn Double permanent sword field","Summon Booster scales all swords"], ragna:["Blood Scythe: procs on sword hits = autonomous healing","Blood Kain sub-50% multiplier","Super armor on heavy attacks"] },
    crystal:["resonance","summon-booster","not-dead-yet","vital-boost","giant-slayer","umbra-fortune"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Blood Scythe","Summon Sword Rain"],
    synergy:"Blood Scythe legacy procs on all 4 sword hits — autonomous healing without player casting. Sub-50% HP activates Blood Kain while swords heal back up. Umbra Fortune guarantees Shadow Spike drops for sword proc amplification.",
    math:"4 swords × Blood Scythe heal proc = 4 independent heal sources per wave. Blood Kain sub-50%: 1.3× × Summon 1.45 × Resonance 1.4 = 2.64× on swords during blood threshold." },

  "hazama+lambda":  { name:"CHAIN BLADE",            rating:"A",  desc:"Hazama chain reach extends Lambda sword strike range. Swords proc on all chain targets simultaneously — area sword coverage.", primary:"lambda", secondary:"hazama",
    take:{ lambda:["Sword Rain procs on all Hazama chain targets","Summon Booster on all swords","Shadow Spike per sword hit across chain range","Respawn Double permanent coverage"], hazama:["Chain whip: 3-5 simultaneous targets = swords proc on all","Ouroboros ring extended reach","Snake Burn DoT on all sword-targeted enemies","Counter God parry backup"] },
    crystal:["resonance","summon-booster","umbra-fortune","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Shadow Spike","Skill Chain Venom","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Chain whip hits 5 targets simultaneously — all 4 swords proc on all 5 targets simultaneously. 20 simultaneous sword procs per chain swing. Umbra Fortune guarantees Shadow Spike drops for sword scaling.",
    math:"20 sword procs per chain swing: 275×20×Resonance 1.4×Summon 1.45 = 11165 per chain+sword combined event. Hazama chain swing rate: ~1.2/sec = 13398/sec sustained. Highest non-clone AoE of any fusion." },

  "hakumen+lambda": { name:"VOID BLADE",             rating:"A+", desc:"Parry procs all 4 swords simultaneously. One parry event activates the full sword rain — Magatama charges while swords cover.", primary:"lambda", secondary:"hakumen",
    take:{ lambda:["Sword Rain: 4 swords proc on parry — simultaneous trigger","Summon Booster scales all parry-triggered swords","Shadow Spike per sword on parry proc","Respawn Double: swords ready for every parry window"], hakumen:["Void Counter parry — triggers all 4 swords","Magatama charge during sword coverage window","AoE counter blast on top of sword rain","Super armor overlapping sword protection"] },
    crystal:["legacy-amplifier","summon-booster","not-dead-yet","giant-slayer","exhilaration","resonance"],
    tactics:["Attack Light Spear","Skill Counter Blast","Dash Thunderbolt","Legacy Magatama Counter","Summon Sword Rain"],
    synergy:"Parry triggers all 4 swords instantly — counter blast + sword rain is simultaneous. Magatama charge completes during sword uptime. Legacy Amplifier on Magatama Light Spear: 490×1.5×2 = 1470 per follow-up.",
    math:"Parry burst: counter blast + 4 swords × Summon 1.45 × Resonance 1.4 × shadow spike = 4×275×1.4×1.45 = 2234 sword burst. + Magatama Light Spear 1470. Total parry window: ~3704 in 0.8s window." },

  "icey+lambda":    { name:"PIXEL BLADE",            rating:"A",  desc:"ICEY dance positions cycle sword procs with dance attack timing. Dance movement feeds swords consistent hit confirmation.", primary:"lambda", secondary:"icey",
    take:{ lambda:["Sword Rain procs on all ICEY dance contacts","Summon Booster scales swords on dance procs","Shadow Spike per dance-sword hit combination","Respawn Double: swords persistent during dance loops"], icey:["Dance: omnidirectional hit contacts for sword procs","Pixel Storm multi-target feeds sword proc rate","Blade Dance execute uses sword-weakened targets","Dance combo accumulation drives Exhilaration"] },
    crystal:["resonance","summon-booster","exhilaration","giant-slayer","not-dead-yet","defensive-combo"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Dance omnidirectional hits + swords = full coverage regardless of enemy position. Defensive Combo during dance + sword autonomous DPS = attack freely. Exhilaration from dance pace reaches cap at ~26s with sword proc feedback.",
    math:"Dance 8 hits/sec × 4 sword procs per hit: 275×4×Resonance 1.4×Summon 1.45 = 2234/dance contact. At Exhilaration 3.0 cap: 2234×3 = 6702/dance contact. Dance rate 8/sec: theoretical ceiling ~53000. Actual sustained: ~8000-10000/s." },

  // ─── MAI EXPANSIONS ──────────────────────────────────────────────────────
  "mai+ragna":      { name:"NEEDLE BLOOD",           rating:"A",  desc:"Mai needles bring enemies to Blood Kain range safely. 8 needles per cast at range = precise HP management for Blood Scythe confirm.", primary:"mai",    secondary:"ragna",
    take:{ mai:["Needle Storm: 8 procs per cast at safe range","Frost Spear Cold slow — enables Blood Kain approach","Chain Spear follow-up multi-hit"], ragna:["Blood Scythe close-range confirm on needle-weakened enemies","Blood Kain sub-50% multiplier","Super armor through close approach"] },
    crystal:["vital-boost","not-dead-yet","giant-slayer","straightforward","mixture-enhancement","ice-fortune"],
    tactics:["Attack Cold","Skill Frost Spear","Dash Shadow Spike","Legacy Blood Scythe","Summon Lightning Orb"],
    synergy:"Needles reduce enemy HP to 30-40% at range. Cold slow prevents retaliation during Ragna close approach. Blood Scythe on needle-weakened grouped enemies: confirms heal + Blood Kain threshold in one cast.",
    math:"Needle to threshold: 8 procs × Cold 1.46 × 3 casts = ~56% enemy HP removed at range. Blood Kain on close confirm: 1.3× × Giant Slayer 1.6 = 2.08×. Distance managed entirely — zero close-range risk until confirmed." },

  "hazama+mai":     { name:"VENOM NEEDLE",           rating:"A",  desc:"Mai needles at range + Hazama chain at mid-range = no safe distance for any enemy. Coverage from needle range to chain reach.", primary:"mai",    secondary:"hazama",
    take:{ mai:["Needle Storm: 8 procs from far range","Frost Spear Cold application at needle range","Multi-needle coverage: no target position is safe"], hazama:["Chain whip mid-range 3-5 target coverage","Snake Burn DoT on chain-distance enemies","Ouroboros ring repositioning after needle barrage","Counter God as defensive answer"] },
    crystal:["resonance","fire-fortune","ice-fortune","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Cold","Skill Snake Venom","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Far: Mai needles. Mid: Hazama chain. Zero gap — every enemy position covered. Ice Fortune + Fire Fortune dual-element: both drop rates enhanced. Cold slow on needle distance forces enemies into chain range where Burn DoT stacks.",
    math:"Full distance coverage: Needle 8 procs × Cold 1.46 + Chain Burn DoT × 5 targets 1300/s. Dual fortune: guaranteed Cold and Fire drops for perfect element alignment every run." },

  "bullet+mai":     { name:"CQC NEEDLE",             rating:"A",  desc:"Mai needles thin enemy HP at range while Bullet closes for Drive confirm. Optimal distance partnership — never fight at the wrong range.", primary:"mai",    secondary:"bullet",
    take:{ mai:["Needle Storm at safe range — thinning HP for Bullet CQC confirm","Frost Spear Cold slow — prepares enemies for Drive","Chain Spear after Bullet Drive pushes enemies into re-engage range"], bullet:["Drive: CQC confirm on needle-weakened targets","Demolition Charge close-range burst","Defensive Combo protection during Drive on prepared enemies","Steel Shell sustain between needle assists"] },
    crystal:["exhilaration","defensive-combo","giant-slayer","not-dead-yet","straightforward","ice-fortune"],
    tactics:["Attack Cold","Skill Frost Spear","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Needle thins HP → Cold slows → Bullet closes → Drive on softened frozen enemies. Defensive Combo during Drive covers Bullet completely. Never fight at unoptimal range — needle first, Drive second.",
    math:"Needle 8 procs × Cold 1.46 reduces enemy HP 40% pre-Drive. Drive on ~60% HP enemies: 9 hits/sec × Exhilaration 3.0 × Giant Slayer 1.6 = 4.32× sustained. Time-to-kill vs elite: 35% faster than solo Drive build." },

  "icey+mai":       { name:"DANCER NEEDLE",          rating:"A",  desc:"ICEY dance positions deliver needles from impossible angles. Dance movement repositions to Mai optimal needle range every attack cycle.", primary:"mai",    secondary:"icey",
    take:{ mai:["Needle Storm: 8 procs — dance delivery angle varies per cycle","Frost Spear Cold on dance-approached targets","Chain Spear during ICEY dance adjacency"], icey:["Dance: repositions to needle optimal range mid-animation","Pixel Storm combo after needle volleys","Blade Dance execute on needle-weakened targets","Dance pace feeds Exhilaration for needle scaling"] },
    crystal:["exhilaration","resonance","giant-slayer","not-dead-yet","ice-fortune","defensive-combo"],
    tactics:["Attack Cold","Skill Frost Spear","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Dance repositions to optimal needle range automatically — ICEY movement makes needle spacing consistent without manual positioning. Exhilaration from dance pace reaches cap at ~25s, amplifying needle burst windows.",
    math:"8 needles × dance delivery 100% range confirmation × Resonance 1.4 = 8×275×1.4 = 3080 per cast. At Exhilaration cap: 3080×3.0 = 9240 per needle volley. Dance rate: ~2 volleys/cycle = 18480 sustained at cap." },

  // ─── HAZAMA EXPANSIONS ───────────────────────────────────────────────────
  "es+hazama":      { name:"VENOM CREST",            rating:"A",  desc:"Crest positions trap enemies for Hazama whip DoT. Enemies walk onto crests, freeze, then receive full Burn DoT stack application.", primary:"hazama", secondary:"es",
    take:{ hazama:["Chain whip DoT on crest-trapped targets","Snake Burn stacks on immobile crest enemies","Ouroboros ring extended reach from crest positions"], es:["Crest traps: enemy enters crest = Hazama DoT confirm","Mine detonation on crest-entering enemies","Speed Crest positions Hazama in optimal chain range","Aerial bounce above crest field"] },
    crystal:["resonance","fire-fortune","giant-slayer","not-dead-yet","exhilaration","domination"],
    tactics:["Attack Burn","Skill Snake Venom","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Crest traps enemy → Hazama applies DoT at guaranteed range. Mine detonation on same trapped target. Enemies cannot escape crest field while taking full Burn DoT stack. Fire Fortune guarantees Burn DoT upgrade drops.",
    math:"Crest trap + chain DoT: mine 570 + Burn 260/s × crest duration. 5 enemies in crest field: 1300/s Burn passive + mine per target = 3150 burst per crest activation. Resonance 1.4 on chain procs = 1820 per chain proc on trapped target." },

  "hakumen+hazama": { name:"COUNTER VENOM",          rating:"A+", desc:"Hazama DoT softens enemies to counter range. Hakumen Void Counter then activates at precisely the right moment on DoT-weakened enemies.", primary:"hazama", secondary:"hakumen",
    take:{ hazama:["Chain Burn DoT: reduces enemy HP to counter threshold safely","Ouroboros ring repositioning after DoT application","Snake Venom long-range DoT setup"], hakumen:["Void Counter: activates on DoT-weakened enemies","Magatama charge during DoT application phase","AoE counter blast on threshold-reached enemies","Light Spear burst on counter confirm"] },
    crystal:["legacy-amplifier","resonance","not-dead-yet","giant-slayer","fatal-blow","focus"],
    tactics:["Attack Burn","Skill Counter Blast","Dash Thunderbolt","Legacy Magatama Counter","Summon Chain Lightning"],
    synergy:"Burn DoT brings enemies to ~40% HP safely. Magatama charges during DoT window. Counter triggers at 40% with full Magatama. Fatal Blow crit on counter: 55% crit rate via Focus × 1.75 crit DMG × full Magatama 2.0.",
    math:"Counter at 40% HP: Magatama 2.0 × Legacy Amp 1.5 × Fatal Blow avg 1.41 × Focus 55% crit × Giant Slayer 1.6 = 6.79× on parry spike. DoT setup takes ~8s — every 8 seconds this burst is available on a new enemy." },

  "bullet+hazama":  { name:"SHELL VENOM",            rating:"A",  desc:"Bullet CQC clusters enemies at chain DoT range. Hazama whip reaches all Drive targets simultaneously — group DoT application.", primary:"hazama", secondary:"bullet",
    take:{ hazama:["Chain whip DoT on all Drive-clustered enemies","Burn DoT stacks on all 5 Bullet CQC targets","Ouroboros repositioning after Drive engagement"], bullet:["Drive: clusters enemies at Hazama chain range","Demolition Charge pre-clusters before DoT sweep","Defensive Combo during Drive while DoT applies overhead","CQC sustain while chain DoT ticks"] },
    crystal:["fire-fortune","resonance","not-dead-yet","giant-slayer","exhilaration","defensive-combo"],
    tactics:["Attack Burn","Skill Thunderbolt","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Drive clusters enemies → Hazama chain DoT covers all simultaneously. 5 targets × 260/s Burn = 1300/s passive while Bullet Drive keeps them in range. Ring of Fire on Demolition-clustered DoT targets: maximum value.",
    math:"1300/s Burn passive on Drive-clustered group. Ring of Fire on cluster: 770 × Resonance 1.4 × 5 targets = 5390 burst. Drive 9 hits/sec × Exhilaration 3.0 cap at stage 3. Combined: ~8000/s peak." },

  "hazama+icey":    { name:"VENOM DANCER",           rating:"A",  desc:"ICEY dance delivers Hazama chain DoT from unexpected angles. Dance repositions to chain optimal range automatically.", primary:"hazama", secondary:"icey",
    take:{ hazama:["Chain DoT: applied at dance-approach range","Snake Burn on all dance-contacted enemies","Counter God parry available during dance recovery"], icey:["Dance: repositions to Hazama chain range automatically","Pixel Storm combo pace feeds Exhilaration","Blade Dance execute on DoT-threshold enemies","ICEY movement never breaks DoT optimal range"] },
    crystal:["resonance","fire-fortune","exhilaration","not-dead-yet","giant-slayer","defensive-combo"],
    tactics:["Attack Burn","Skill Snake Venom","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Dance movement naturally maintains chain range — DoT applies on every dance cycle. Fire Fortune guarantees Burn upgrade drops. Exhilaration from dance pace amplifies all Burn DoT values at combo cap.",
    math:"Dance cycle × chain DoT: Burn 260/s per dance hit × Resonance 1.4 = 364/s per target. Dance 8 hits/sec × 5 enemies = 14560/s at Exhilaration cap with 3.0× combo. Ring of Fire on dance-grouped targets: 770×1.4×5 = 5390 burst." },

  "hazama+prisoner":{ name:"DEAD VENOM",             rating:"A",  desc:"Prisoner weapon variety applies DoT on any weapon type. Hazama chain DoT stacks alongside Prisoner kill — any weapon, same DoT output.", primary:"hazama", secondary:"prisoner",
    take:{ hazama:["Chain DoT: applies regardless of Prisoner weapon type","Burn stacks on all weapon confirm kills","Ouroboros repositioning compatible with weapon switches"], prisoner:["Any weapon triggers Hazama DoT tactic procs","Roll-dodge iframe chains prevent DoT interrupt","Kill momentum with DoT ticking on remaining HP enemies","Dead Cells weapon variety pairs with DoT coverage"] },
    crystal:["fire-fortune","chain-reaction","not-dead-yet","giant-slayer","exhilaration","resonance"],
    tactics:["Attack Burn","Skill Snake Venom","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Prisoner weapon switch does not break DoT — chains continuously across weapon changes. Chain Reaction: 3 kills at DoT threshold = +36% momentum. Roll invincibility during DoT ticking = zero interrupt risk.",
    math:"DoT + kill momentum: Burn 260/s × Chain Reaction 1.36 = 354/s per target. 3-kill chain: +36% on all subsequent attacks. Fire Fortune guarantees Burn drops every run — consistent DoT output across any Prisoner weapon loadout." },

  // ─── HAKUMEN EXPANSIONS ──────────────────────────────────────────────────
  "bullet+hakumen": { name:"IRON COUNTER",           rating:"A+", desc:"Bullet CQC groups enemies — Hakumen parries the group retaliation. Drive triggers counter window, Steel Shell sustains between counters.", primary:"hakumen",secondary:"bullet",
    take:{ hakumen:["Void Counter: parries Drive retaliation hits","Magatama charge during Steel Shell sustain","AoE counter blast covers Drive-clustered enemies","Super armor overlapping with Bullet Drive armor"], bullet:["Drive attracts retaliation — feeds counter timing","Demolition Charge clusters for AoE counter","Steel Shell sustain between Hakumen counter windows","CQC: consistent enemy grouping for counter AoE"] },
    crystal:["legacy-amplifier","not-dead-yet","apex-predator","giant-slayer","exhilaration","vital-boost"],
    tactics:["Attack Light Spear","Skill Counter Blast","Dash Thunderbolt","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Drive attracts hits → counter window opens. Steel Shell sustains HP for Apex Predator full HP bonus. Demolition Charge before counter ensures maximum AoE counter coverage. Magatama charged from Steel Shell window.",
    math:"Apex Predator at full HP: 1.35×. Magatama full: 2.0×. Legacy Amp: 1.5×. Counter AoE: base × 2.0 × 1.5 × 1.35 × Giant Slayer 1.6 = 6.48× on cluster. Shell manages HP for Apex window repeatedly." },

  "hakumen+taokaka":{ name:"VOID RUSH",              rating:"A",  desc:"Taokaka charges — Hakumen parries the enemies Tao brings into proximity. Tao rush forces grouped contact, Hakumen counter catches all.", primary:"hakumen",secondary:"taokaka",
    take:{ hakumen:["Void Counter parries group retaliation from Tao rush proximity","Magatama charges during Tao kill momentum","AoE counter blast on Tao-engaged groups"], taokaka:["Rush charges force enemy contact into counter range","Infinite dodge chains after counter window","Speed Demon kill momentum — fewer counter windows needed","Claw blitz exhausts enemy HP pre-counter"] },
    crystal:["legacy-amplifier","exhilaration","not-dead-yet","giant-slayer","combo-surge","apex-predator"],
    tactics:["Attack Light Spear","Skill Thunderbolt","Dash Shadow Spike","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Tao rush brings enemies into Hakumen counter proximity involuntarily. Kill momentum from Tao pace + counter windows from Hakumen = dual-layer boss engagement. Exhilaration from Tao + Magatama burst = synchronized peak windows.",
    math:"Tao kill rate × Magatama charge: combo cap ~22s. Counter at Magatama full: 2.0 × Legacy Amp 1.5 × Apex 1.35 = 4.05×. Exhilaration peak simultaneously: 4.05 × 3.0 = 12.15× theoretical burst." },

  "hakumen+icey":   { name:"VOID DANCE",             rating:"A",  desc:"ICEY dance creates parry opportunities. Dance movement crosses enemy attack paths — Hakumen counter window activates during cross patterns.", primary:"hakumen",secondary:"icey",
    take:{ hakumen:["Void Counter activates during ICEY cross-path movements","Magatama charges during dance recovery frames","AoE counter blast catches dance-proximity enemies"], icey:["Dance cross-paths expose Hakumen to parry windows","Pixel Storm combo pace keeps Magatama charging","Blade Dance execute after Hakumen counter weakens target"] },
    crystal:["legacy-amplifier","exhilaration","not-dead-yet","giant-slayer","fatal-blow","focus"],
    tactics:["Attack Light Spear","Skill Counter Blast","Dash Thunderbolt","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Dance cross-paths are predictable attack windows — Hakumen counter timing aligns with dance pattern. Fatal Blow + Focus on counter spike: 55% crit rate with 1.75× crit DMG. Magatama charges between dance-counter windows.",
    math:"Counter during dance: Magatama 2.0 × Fatal Blow avg 1.41 × Legacy Amp 1.5 × Giant Slayer 1.6 = 6.77× on dance-counter spike. Exhilaration from dance pace: cap ~26s. Combined peak window: 6.77 × 3.0 = 20.3× absolute ceiling." },

  "hakumen+prisoner":{ name:"VOID EXILE",            rating:"A", desc:"Prisoner roll-dodge creates counter windows. Roll into attack path, Hakumen counters — guaranteed parry timing via roll animation.", primary:"hakumen",secondary:"prisoner",
    take:{ hakumen:["Void Counter: roll-dodge paths create precise counter timing","Magatama charge during roll recovery","Super armor through Prisoner heavy weapon strings"], prisoner:["Roll-dodge: invincibility creates Hakumen counter window","Weapon variety: any weapon type feeds Magatama charge","Kill momentum from Dead Cells chains — shorter counter wait","Adaptive playstyle aligns with parry-timing play"] },
    crystal:["legacy-amplifier","not-dead-yet","apex-predator","giant-slayer","chain-reaction","vital-boost"],
    tactics:["Attack Light Spear","Skill Counter Blast","Dash Blade Slash","Legacy Magatama Counter","Summon Chain Lightning"],
    synergy:"Roll invincibility creates zero-risk counter window — roll through attack, Hakumen counters the follow-through. Apex Predator at full HP preserved via roll. Chain Reaction kill momentum between counter windows.",
    math:"Roll counter: zero risk parry timing. Apex Predator 1.35 × Magatama 2.0 × Legacy Amp 1.5 × Giant Slayer 1.6 = 6.48×. Chain Reaction 3 kills +36%: 6.48×1.36 = 8.81× during kill momentum." },

  // ─── BULLET EXPANSIONS ───────────────────────────────────────────────────
  "bullet+lambda":  { name:"SHELL BLADE",            rating:"A+", desc:"Drive CQC with sword coverage. Lambda swords proc on every Drive target while Bullet holds CQC range — front-line swords.", primary:"bullet",  secondary:"lambda",
    take:{ bullet:["Drive holds enemies at sword proc range","Demolition Charge clusters enemies for sword AoE","Defensive Combo during Drive + sword rain simultaneously","CQC sustain between sword proc waves"], lambda:["Sword Rain procs on all Drive-held enemies","Summon Booster scales all swords","Shadow Spike per sword × Drive cluster","Respawn Double permanent sword coverage"] },
    crystal:["resonance","summon-booster","defensive-combo","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Drive holds enemies at sword proc range — swords proc on CQC-pinned enemies for full hit confirmation. Defensive Combo during Drive means Bullet is protected while 4 swords do autonomous damage simultaneously.",
    math:"4 swords × drive-pinned targets × Resonance 1.4 × Summon 1.45 = 2234/sword wave. Drive 9 hits/sec Exhilaration feeds: cap ~22s. At cap: Drive 3.0× + sword 2234/wave combined." },

  "bullet+naoto":   { name:"EXECUTE SHELL",          rating:"A+", desc:"Bullet Drive brings enemies to execute threshold. Naoto Hunter Eye activates on Drive-softened targets — CQC execute.", primary:"bullet",  secondary:"naoto",
    take:{ bullet:["Drive softens enemy HP to Hunter Eye threshold","Demolition Charge clusters for execute sweep","Defensive Combo: protected while executing Drive-softened targets"], naoto:["Hunter Eye executes on Drive-softened enemies","Blood Edge HP-cost burst on Drive-confirmed targets","Fatal Blow crit in execute window","Blood Restriction drain on tougher Drive-weakened enemies"] },
    crystal:["fatal-blow","focus","not-dead-yet","giant-slayer","vital-boost","blood-pact"],
    tactics:["Attack Burn","Skill Blood Edge","Dash Shadow Spike","Legacy Ring of Fire","Summon Chain Lightning"],
    synergy:"Drive softens enemies to 30% HP without risk via Defensive Combo. Hunter Eye activates — Blood Edge execute with Fatal Blow crit. Blood Pact +35% on Blood Edge HP-cost ability. Focus 55% crit rate makes execute consistent.",
    math:"Drive to 30% threshold: 9 hits/sec × ~8s. Execute: Blood Edge × Blood Pact 1.35 × Fatal Blow avg 1.41 × Hunter Eye 1.75 × Giant Slayer 1.6 = 5.34× execute spike." },

  "bullet+prisoner":{ name:"IRON EXILE",             rating:"A",  desc:"Maximum tank-and-spank. Both character defenses overlap — Steel Shell + roll invincibility = nearly immortal front-line.", primary:"bullet",  secondary:"prisoner",
    take:{ bullet:["Drive sustained attack: offense and defense merged","Steel Shell HP sustain between roll windows","Demolition Charge clusters for prisoner weapon variety","Defensive Combo: overlapping with roll timing"], prisoner:["Roll-dodge invincibility fills Steel Shell gaps","Weapon variety: any weapon type sustained alongside Drive","Kill momentum: Dead Cells kill chain supplements Drive pace","Chain Reaction: 3 kills +36% between Drive waves"] },
    crystal:["exhilaration","defensive-combo","not-dead-yet","vital-boost","giant-slayer","chain-reaction"],
    tactics:["Attack Burn","Skill Thunderbolt","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Steel Shell + roll-dodge = permanent front-line invincibility window. Drive offense overlaps with roll timing seamlessly. Chain Reaction kill chain on Demolition Charge clustered enemies: 3 kills = +36% on next Drive wave.",
    math:"Invincibility uptime: 80-90% between Shell sustain and roll timing. Chain Reaction: +36% × Exhilaration cap 3.0 = 4.08× sustained. Ring of Fire on cluster: 770×1.4 = 1078 burst cleanup. Highest survival rating of any Bullet fusion." },

  // ─── NAOTO EXPANSIONS ────────────────────────────────────────────────────
  "icey+naoto":     { name:"DANCE OF DEATH",         rating:"A+", desc:"ICEY dance brings enemies to execute threshold. Dance DPS softens HP precisely — Naoto Hunter Eye activates on dance-weakened targets.", primary:"naoto",  secondary:"icey",
    take:{ naoto:["Hunter Eye execute on dance-weakened enemies","Blood Edge HP-cost burst — dance keeps distance for approach","Fatal Blow crit in execute window","Blood Restriction drain from dance range"], icey:["Dance DPS: brings enemies to 30% HP precisely","Pixel Storm multi-target dance softens groups","Blade Dance execute initiates Hunter Eye window","Dance repositions to optimal execute approach distance"] },
    crystal:["fatal-blow","focus","exhilaration","not-dead-yet","giant-slayer","blood-pact"],
    tactics:["Attack Burn","Skill Blood Edge","Dash Shadow Spike","Legacy Ring of Fire","Summon Chain Lightning"],
    synergy:"Dance DPS brings enemy to 30% → Hunter Eye activates → Blood Edge execute. Dance pace drives Exhilaration accumulation during softening phase. At execute with full Exhilaration stack: Fatal Blow + Focus crit + Exhilaration 3.0×.",
    math:"Dance to 30% threshold: ~5s at dance pace. Execute at Exhilaration cap: Fatal Blow 1.75 × Focus avg 1.41 × Blood Pact 1.35 × Hunter Eye 1.75 × Giant Slayer 1.6 × Exhilaration 3.0 = 29.5× absolute burst ceiling. Highest execute spike in game." },

  "naoto+prisoner": { name:"EXILE BLOOD",            rating:"A",  desc:"Prisoner weapon momentum + Naoto execute. Any weapon bring enemies to Hunter Eye range — the most adaptive execute build.", primary:"naoto",  secondary:"prisoner",
    take:{ naoto:["Hunter Eye executes on any-weapon-weakened enemies","Blood Edge HP-cost execute","Fatal Blow crit in execute window","Death Touch execute loop"], prisoner:["Any weapon type brings enemies to execute threshold","Roll-dodge: invincibility during Hunter Eye approach","Kill momentum: Dead Cells kills feed execute acceleration","Adaptive weapon picks optimize for execution speed"] },
    crystal:["fatal-blow","focus","not-dead-yet","giant-slayer","chain-reaction","blood-pact"],
    tactics:["Attack Burn","Skill Blood Edge","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Prisoner weapon flexibility + Naoto execute = works in any run, any weapon pool. Roll invincibility covers Hunter Eye approach. Chain Reaction 3-kill chains keep execute momentum going room after room.",
    math:"Any-weapon softening + execute: chain reaction momentum 1.36 × Fatal Blow 1.41 × Blood Pact 1.35 × Hunter Eye 1.75 × Giant Slayer 1.6 = 5.74× per execute. Room clear rate: highest of any Naoto fusion due to weapon flexibility." },

  // ─── ICEY EXPANSIONS ─────────────────────────────────────────────────────
  "icey+jin":       { name:"FROZEN DANCE",           rating:"A+", desc:"Dance through a frozen field. Jin Cold means enemies cannot rotate or retaliate during ICEY dance patterns — zero counterattack risk.", primary:"icey",   secondary:"jin",
    take:{ jin:["Cold field: enemies frozen during dance patterns","Skill Cold +47% — ICEY dance hits scaled","Ice Fortune guaranteed","Frost Burst at Cold peak on dance-accumulated stacks"], icey:["Dance patterns: omnidirectional hits on frozen enemies","Pixel Storm blast on Cold-stacked groups","Blade Dance execute on frozen threshold enemies","Dance pace feeds Cold stack accumulation"] },
    crystal:["exhilaration","ice-fortune","defensive-combo","giant-slayer","not-dead-yet","domination"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Frozen enemies + dance patterns = 100% hit confirmation, 0% counter rate. Dance accumulates Cold stacks rapidly via omnidirectional hits. Frost Burst at stack peak during dance: 520 AoE × Domination 1.45 × full dance combo.",
    math:"Dance on frozen: 8 hits/sec × 0 counter risk. Exhilaration cap: 22s with Cold accumulation. Frost Burst at cap: 520×Domination 1.45×Exhilaration 3.0 = 2262 AoE. Defensive Combo: -80% dmg taken during dance strings." },

  "icey+hakumen":   { name:"DANCE OF VOID",          rating:"A+", desc:"ICEY dance triggers Hakumen Void Counter timing. Dance cross-patterns create parry windows — the most reliable Magatama charging method.", primary:"icey",   secondary:"hakumen",
    take:{ hakumen:["Void Counter: dance cross-pattern creates exact parry timing","Magatama full charge during dance-counter cycles","AoE blast on dance-proximity enemies"], icey:["Dance patterns: cross-paths expose counter timing predictably","Combo accumulation from dance drives Exhilaration","Blade Dance execute after Hakumen counter confirms target","Pixel Storm AoE on post-counter recovery"] },
    crystal:["legacy-amplifier","exhilaration","not-dead-yet","giant-slayer","apex-predator","combo-surge"],
    tactics:["Attack Light Spear","Skill Counter Blast","Dash Thunderbolt","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Dance cross-path = predictable parry timing. Magatama always fully charges between dance cycle parries. Apex Predator at full HP — parry recovers HP via counter. Exhilaration from dance pace caps simultaneously with Magatama.",
    math:"Dance parry cycle: every ~8s. Full Magatama counter: 2.0 × Legacy Amp 1.5 × Apex 1.35 × Giant Slayer 1.6 = 6.48× per parry. × Exhilaration 3.0 at cap = 19.44× absolute peak burst. Highest Hakumen parry efficiency." },

  "icey+prisoner":  { name:"DEAD DANCER",            rating:"A",  desc:"Two Dead Cells crossovers in one build. Dance + roll invincibility = the most movement-based anti-damage fusion in the roster.", primary:"icey",   secondary:"prisoner",
    take:{ icey:["Dance: attack patterns dodge simultaneously","Pixel Storm multi-target omnidirectional","Blade Dance execute burst","Combo accumulation from dance"], prisoner:["Roll invincibility: fills dance recovery gaps","Weapon variety: any weapon triggers dance proc compatibility","Kill momentum: Dead Cells chain supplements dance pace","Chain Reaction 3-kill on dance-weakened groups"] },
    crystal:["exhilaration","defensive-combo","not-dead-yet","chain-reaction","giant-slayer","straightforward"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Dance + roll = permanent movement-based invincibility. Never stand still, never take hits. Chain Reaction 3-kill during dance combo: +36% momentum. Both Dead Cells characters contribute Dead Cells-style kill acceleration.",
    math:"Dance + roll invincibility uptime: ~90%. Chain Reaction 3-kill: 1.36 × Exhilaration 3.0 = 4.08× during kill chain. Defensive Combo -80% for the 10% non-invincible moments. Survivability rating: 95/100." },

  // ─── PRISONER EXPANSIONS ─────────────────────────────────────────────────
  "prisoner+taokaka":{ name:"DEAD RUSH",             rating:"A+", desc:"Prisoner weapon momentum + Taokaka kill chain = two kill-momentum characters feeding each other. Best kill-chain snowball in the game.", primary:"prisoner",secondary:"taokaka",
    take:{ prisoner:["Kill momentum: any weapon feeds chain reaction","Roll-dodge invincibility fills Tao rush recovery gaps","Weapon variety triggers Tao rush-equivalent proc rate","Dead Cells-style room-clear acceleration"], taokaka:["Rush: kill chain momentum accelerates room by room","Infinite dodge chains in any weapon range","Speed Demon kill-chain bonus stacks with Chain Reaction","Claw blitz between Prisoner weapon cycles"] },
    crystal:["exhilaration","combo-surge","chain-reaction","not-dead-yet","giant-slayer","defensive-combo"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Chain Reaction + Speed Demon + Combo Surge all feed kill momentum simultaneously. First kill → 3 bonuses activate simultaneously. By room 3 you are at cap across all three systems. The ultimate kill-chain snowball.",
    math:"First kill: Chain Reaction +12% × Speed Demon momentum × Combo Surge stacking. 3 kills: Chain Reaction maxes at +36%. All three momentum systems at full: 1.36 × 3.5 surge × Exhilaration 3.0 = 14.28× theoretical combined ceiling." },

  "prisoner+hakumen":{ name:"VOID PRISONER",         rating:"A",  desc:"Roll invincibility creates guaranteed parry timing. Prisoner rolls into attack path — Hakumen counters the follow-through every time.", primary:"prisoner",secondary:"hakumen",
    take:{ hakumen:["Void Counter: roll timing creates guaranteed parry window","Magatama charge during roll + weapon switch window","AoE counter blast on weapon-confirmed enemies"], prisoner:["Roll invincibility: creates zero-risk Hakumen parry timing","Weapon variety: any weapon type initiates counter window","Kill momentum → fewer counters needed per room","Adaptive play aligns perfectly with parry mechanics"] },
    crystal:["legacy-amplifier","apex-predator","not-dead-yet","giant-slayer","vital-boost","chain-reaction"],
    tactics:["Attack Light Spear","Skill Counter Blast","Dash Blade Slash","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Roll into attack path → Hakumen counters the guaranteed retaliation. Apex Predator activates at full HP preserved by roll. Magatama always charges because roll-counter timing is mechanically consistent.",
    math:"Guaranteed counter via roll: Magatama 2.0 × Legacy Amp 1.5 × Apex 1.35 × Giant Slayer 1.6 = 6.48×. Chain Reaction 3 kills between counters: 6.48 × 1.36 = 8.81× sustained." },

  "prisoner+naoto": { name:"EXILE HUNTER",           rating:"A+", desc:"Prisoner weapon variety brings enemies to Hunter Eye range regardless of weapon pool. The most reliable execute build in any run.", primary:"prisoner",secondary:"naoto",
    take:{ naoto:["Hunter Eye: executes on any-weapon-weakened enemies","Blood Edge HP-cost execute — roll covers approach","Fatal Blow crit in execute","Death Touch loop: clear room, roll to next execute target"], prisoner:["Any weapon brings enemies to execute threshold — run-independent","Roll invincibility covers Hunter Eye approach safely","Kill chain feeds execute acceleration","Chain Reaction: kill momentum after execute confirms"] },
    crystal:["fatal-blow","focus","not-dead-yet","giant-slayer","chain-reaction","blood-pact"],
    tactics:["Attack Burn","Skill Blood Edge","Dash Shadow Spike","Legacy Ring of Fire","Summon Chain Lightning"],
    synergy:"Prisoner weapon independence + Naoto execute = works in ANY run regardless of tactic drops. Roll approach + Hunter Eye = zero-risk execute. Chain Reaction after each execute amplifies the next.",
    math:"Execute loop: Blood Edge × Blood Pact 1.35 × Fatal Blow avg 1.41 × Hunter Eye 1.75 × Giant Slayer 1.6 = 5.34× per kill. Chain Reaction post-execute: 5.34 × 1.36 = 7.26× on execute while in kill momentum." },

  "es+hibiki": { name:"SHADOW CREST", rating:"A+", desc:"Clone ambush onto crest positions. Every crest becomes a back-attack trigger — clones materialize exactly where mines explode.", primary:"hibiki", secondary:"es",
    take:{ hibiki:["Shadow Ambush legacy — clones appear on target","Back-attack positioning bonus","3-dodge chain mobility","Clone tactic proc multiplication"], es:["Crest spatial trap network","Mine detonation on approach","Aerial bounce chain","Speed Crest dash coverage"] },
    crystal:["exhilaration","defensive-combo","giant-slayer","summon-booster","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Place Mine","Dash Phantom Step","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Crests define enemy positions — clones appear directly behind crest-trapped enemies. Back-attack talent activates on every clone proc near crest fields. Mine detonation forces enemies into the exact range where clones land back-attacks.",
    math:"Mine trap + clone back-attack: 275 × 3 clones × back-attack mult + mine 570 detonation chain. Summon Booster +45% applies to clone and mine simultaneously. Combined burst window: ~3200 in 1.5s." },

  "hibiki+noel": { name:"SHADOW DRIVE", rating:"A+", desc:"Noel Drive speed feeds Hibiki clone combo stacking faster than any other pairing. 9 hits/sec + 3 clone procs = Exhilaration cap in 18 seconds.", primary:"hibiki", secondary:"noel",
    take:{ hibiki:["Clone shadow spawn — 3 autonomous attackers","Back-attack bonus on all clone hits","3-dodge iframe chain","Shadow Spike proc multiplication"], noel:["Drive: 9 hits/sec rapid fire","Rapid skill rotation speed","Long-range passive bonus","Bullet Storm multi-target spray"] },
    crystal:["exhilaration","combo-surge","giant-slayer","defensive-combo","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Cold","Dash Thunderbolt","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Noel hit frequency builds combo count while clones independently contribute 3 additional hit streams. 18-second Exhilaration cap. At cap: Noel Drive x 3 clone procs x 3.0 = 9x effective hit value.",
    math:"18s to Exhilaration cap. At cap: combo 3.0 x giant slayer 1.6 vs elite = 4.8x base. Stack Straightforward +45% for 6.9x total vs elite." },

  "hibiki+rachel": { name:"PHANTOM STORM", rating:"A", desc:"Clone ambush + bat swarm. Rachel familiars proc alongside clones — triple proc becomes quadruple-plus proc on every attack string.", primary:"hibiki", secondary:"rachel",
    take:{ hibiki:["Clone shadow ambush procs","Back-attack positioning talent","3-dodge chain mobility","Shadow Spike clone inheritance"], rachel:["Bat swarm — persistent autonomous attackers","Tempest Dahlia crowd pull","Wind Barrier persistent AoE field","Chain Lightning proc via bats"] },
    crystal:["resonance","summon-booster","exhilaration","not-dead-yet","giant-slayer","legacy-amplifier"],
    tactics:["Attack Chain Lightning","Skill Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Both sources are summon-type: clones and bats trigger Summon Booster simultaneously. Resonance +40% on all tactic procs. Tempest Dahlia pulls groups into back-attack range for all clone procs.",
    math:"Bat chain: 295x3x1.4x1.45=1800/proc. Clone shadow: 275x3x1.4x1.45=1683/proc wave. Both firing simultaneously. Total passive autonomous DPS: ~3500+ by stage 3." },

  "hibiki+taokaka": { name:"BLITZ PHANTOM", rating:"A+", desc:"Clone back-attacks at Taokaka rush speed. 11 hits/sec establishes combo in 15s while clones proc on every flanking opportunity.", primary:"hibiki", secondary:"taokaka",
    take:{ hibiki:["Clone shadow spawn behind targets","Back-attack talent — clones inherit the bonus","3-dodge mobility chain","Shadow Spike autonomous proc stream"], taokaka:["Rush: 10-12 hits/sec claw blitz","Infinite dodge direction changes","Speed Demon kill momentum","Ambush burst window"] },
    crystal:["exhilaration","combo-surge","defensive-combo","giant-slayer","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Taokaka rush pace + clone proc rate = 15-second Exhilaration cap. Both never stop moving — Defensive Combo active 90% of fight. Tao positions into flanking angles, activating Hibiki back-attack talent on every rush string.",
    math:"15s Exhilaration cap: 12 hits/sec (Tao) + 9 clone-equivalent = 21 effective. At cap: straightforward 1.45 x combo 3.0 x giant slayer 1.6 = 6.96x vs elites." },

  "hibiki+mai": { name:"NEEDLE SHADOW", rating:"A", desc:"8 needles per cast x 3 clone streams = 24 simultaneous tactic procs per Mai skill rotation with full clone overlap.", primary:"hibiki", secondary:"mai",
    take:{ hibiki:["Clone spawn — 3 independent proc streams","Back-attack positioning talent","3-dodge iframe mobility","Shadow Spike x clone multiplication"], mai:["Needle Storm: 8 projectiles per cast","Frost Spear Cold application + slow","Chain Spear follow-up multi-hit","Needle reach — procs at range"] },
    crystal:["exhilaration","resonance","giant-slayer","not-dead-yet","domination","straightforward"],
    tactics:["Attack Shadow Spike","Skill Frost Spear","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Mai needles proc Shadow Spike per needle — 8 procs per cast. Clones triple this: 24 Shadow Spike activations per rotation. Cold slow plants enemies in back-attack range for all clone hits.",
    math:"24 Shadow Spike procs: 275x24=6600 raw. x Resonance 1.4 = 9240. x Giant Slayer 1.6 vs elite = 14784. Highest multi-proc ceiling of any Hibiki fusion." },

  "hibiki+hazama": { name:"VENOM SHADOW", rating:"A", desc:"Chain whip reach + clone ambush. Hazama whip hits all 3-5 targets while clones simultaneously strike from behind on each.", primary:"hibiki", secondary:"hazama",
    take:{ hibiki:["Clone ambush — all 3 clones inherit chain proc","Back-attack talent on whip range","3-dodge mobility","Shadow Spike per-clone proc"], hazama:["Chain whip: 3-5 simultaneous target hits","Snake Burn DoT application","Ouroboros ring extended range","Counter God parry window"] },
    crystal:["exhilaration","resonance","giant-slayer","not-dead-yet","fire-fortune","straightforward"],
    tactics:["Attack Shadow Spike","Skill Chain Venom","Dash Shadow Spike","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Chain whip hits 3-5 targets simultaneously — each takes Shadow Spike from player AND from 3 clones. At 5 targets x 3 clones = 15 shadow procs per whip swing.",
    math:"5 targets x 3 clones x 275 Shadow Spike = 4125 per whip swing. x Resonance 1.4 = 5775. Burn DoT on all 5: 260x5=1300/s passive. Peak burst: ~7000+ with full stack." },

  "hibiki+kokonoe": { name:"ORBITAL SHADOW", rating:"A", desc:"Kokonoe fires missiles onto Hibiki clone positions. Clones mark targets from below while orbital bombardment confirms from above — no escape vector.", primary:"hibiki", secondary:"kokonoe",
    take:{ hibiki:["Clone spawn marks enemy positions for Kokonoe targeting","Back-attack flanking drives enemies toward missile impact zones","3-dodge mobility navigates missile grid","Shadow Spike proc from safe position"], kokonoe:["Missile Rain: targets clone-marked enemy positions","Fire Projectile 10-burst on clone-engaged clusters","Aerial safety while clones take front-line risk","Science procs on all clone-adjacent enemies"] },
    crystal:["resonance","summon-booster","domination","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Shadow Spike","Skill Fire Projectile","Dash Thunderbolt","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Clones engage at ground level — Kokonoe missiles rain on the exact same coordinates. Enemies caught between ground clone procs and aerial missile impacts. Summon Booster amplifies clone proc rate alongside missile scaling.",
    math:"Clone: 275x3xSummon 1.45 = 1196 shadow proc per wave. Overhead missile: 280x10xDomination 1.45 = 4060/cast on clone-pinned targets. Combined burst: ~5256 per coordinated window." },

  "hibiki+prisoner": { name:"DEAD CELL SHADOW", rating:"A", desc:"Prisoner weapon variety triggers clones on every weapon type. Dead Cells roll invincibility extends Hibiki dodge chain to 4+ consecutive iframes.", primary:"hibiki", secondary:"prisoner",
    take:{ hibiki:["Clone ambush spawn","Back-attack talent bonus","3-dodge chain iframe","Shadow Spike clone inheritance"], prisoner:["Weapon variety — all types proc clones equally","Roll-dodge invincibility frames","Adaptive weapon picks per run","Dead Cells kill momentum"] },
    crystal:["exhilaration","phantom-step","giant-slayer","not-dead-yet","straightforward","chain-reaction"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Prisoner roll + Hibiki 3 dodges = 4 consecutive iframe windows. Any weapon activates clone procs. Chain Reaction kill momentum complements Hibiki clone output acceleration.",
    math:"4 iframe windows = near-total invincibility rotation. Chain Reaction stacks to +36% at 3 kills. Clone back-attack during roll: 275 x 3 x 1.36 = 1122 per proc during kill chain." },

  "hibiki+icey": { name:"PIXEL PHANTOM", rating:"A+", desc:"ICEY dance pace combined with clone procs creates perpetual-motion damage. Dance attacks keep clones active, clones replicate every dance hit contact.", primary:"hibiki", secondary:"icey",
    take:{ hibiki:["3 clones replicate all ICEY dance hit contacts","Back-attack bonus on dance cross-path hits","3-dodge chain interweaves with dance patterns","Shadow Spike on every dance+clone proc stream"], icey:["Dance: omnidirectional — clones always in proc range","Pixel Storm feeds clone hit rate","Blade Dance execute window + clone burst","ICEY combo count drives Exhilaration for all clone streams"] },
    crystal:["exhilaration","defensive-combo","giant-slayer","summon-booster","not-dead-yet","straightforward"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Shadow Spike","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Dance omnidirectional hits give clones 360 degree proc opportunities. Dance pace drives Exhilaration fastest of any Hibiki fusion at ~16s cap. Defensive Combo during dance = clones attack while you take zero damage.",
    math:"Dance 8-10 hits/sec x 3 clone procs: 275x3x1.45x1.4 = 1683 per dance contact. At Exhilaration 3.0: 5049 per dance hit. Practical sustained: ~10000-12000/s by stage 3." },

  "jin+ragna": { name:"BLOOD ICE", rating:"A+", desc:"Blood Kain activates — enemies frozen unable to interrupt Scythe heal. Jin freeze field is the perfect Blood Kain delivery system.", primary:"ragna", secondary:"jin",
    take:{ ragna:["Blood Scythe AoE heal on hit","Blood Kain sub-50% damage multiplier","Super armor through heavy attacks","Self-sustaining lifesteal loop"], jin:["Attack Cold slow — enemies frozen","Skill Cold +47% on all skills","Frost Burst at Cold stack peak","Ice Fortune tactic guarantee"] },
    crystal:["vital-boost","not-dead-yet","ice-fortune","mixture-enhancement","giant-slayer","straightforward"],
    tactics:["Attack Cold","Skill Blood Scythe","Dash Shadow Spike","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Cold freezes enemies in Blood Scythe range — every hit confirms a heal proc. Vital Boost doubles the HP pool giving more room to operate in the power zone.",
    math:"Frozen: 100% Scythe confirm rate. Blood Kain 1.3 x Cold 1.46 x Giant Slayer 1.6 = 3.04x vs elite in blood threshold." },

  "kokonoe+ragna": { name:"SCIENCE BLOOD", rating:"A", desc:"Kokonoe missile fire brings enemies to Blood Kain threshold safely. Aerial missiles deplete HP to power zone — Ragna closes for Scythe confirm.", primary:"ragna", secondary:"kokonoe",
    take:{ ragna:["Blood Scythe confirms on missile-weakened enemies","Blood Kain sub-50% once missiles depleted HP safely","Super armor through approach"], kokonoe:["Missile Rain: depletes enemy HP to Kain threshold from safe range","Fire Projectile 10-burst on clustered Scythe targets","Aerial position means Ragna tanks zero aerial hits"] },
    crystal:["vital-boost","not-dead-yet","giant-slayer","straightforward","resonance","mixture-enhancement"],
    tactics:["Attack Burn","Skill Fire Projectile","Dash Shadow Spike","Legacy Blood Scythe","Summon Lightning Orb"],
    synergy:"Missiles wear down enemy HP to Blood Kain threshold without Ragna taking risk. Ragna closes — Blood Scythe group heal on missile-weakened clustered enemies.",
    math:"Missile depletion: 280x10=2800 per cast x 2 casts brings enemies to 30-40% HP. Blood Kain 1.3 x Straightforward 1.45 x Giant Slayer 1.6 = 3.02x on Scythe confirm." },

  "es+ragna": { name:"CREST BLOOD", rating:"A", desc:"Mine detonation on crest-trapped enemies brings them to Blood Kain range. Ragna closes after crest confirms threshold.", primary:"ragna", secondary:"es",
    take:{ ragna:["Blood Scythe close-range confirm on mine-weakened enemies","Blood Kain sub-50% once mines depleted HP","Super armor during close approach"], es:["Crest mines: soften enemies to Blood Kain threshold","Mine detonation on approaching enemies pre-weakens","Aerial bounce avoids Ragna ground engagement zone"] },
    crystal:["vital-boost","not-dead-yet","giant-slayer","resonance","domination","mixture-enhancement"],
    tactics:["Attack Burn","Skill Place Mine","Dash Shadow Spike","Legacy Blood Scythe","Summon Lightning Orb"],
    synergy:"Crest mines soften enemy clusters safely. Ragna closes when mines confirm threshold. Blood Scythe on mine-weakened grouped enemies: group heal + Blood Kain in one cast.",
    math:"Mine depletion: 570x3 bounce = 1710 per crest trigger. Two triggers brings enemies to Blood Kain threshold. Scythe confirm: heals ~400HP x Blood Kain 1.3 = 3.0x burst." },

  "noel+ragna": { name:"DRIVE BLOOD", rating:"A+", desc:"Noel Drive brings enemies to Blood Kain threshold in 8 seconds. Ragna closes for Scythe confirm while Drive continues hitting.", primary:"ragna", secondary:"noel",
    take:{ ragna:["Blood Scythe confirm on Drive-softened enemies","Blood Kain sub-50% once Drive depleted HP","Super armor through Drive retaliation"], noel:["Drive: 9 hits/sec depletes enemy HP to threshold fast","Rapid skill rotation feeds hit rate","Long-range passive keeps enemies engaged until threshold"] },
    crystal:["vital-boost","exhilaration","not-dead-yet","giant-slayer","straightforward","mixture-enhancement"],
    tactics:["Attack Cold","Skill Blood Scythe","Dash Shadow Spike","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Drive at 9 hits/sec reaches Blood Kain threshold in ~8 seconds. Scythe confirms group heal on Drive-clustered enemies. Exhilaration stacks from Drive hit rate — both reach peaks at same time.",
    math:"8s Drive: 72 hits. Blood Kain activates. At Blood Kain + Exhilaration overlap: 1.3 x 3.0 x Straightforward 1.45 x Giant Slayer 1.6 = 9.07x vs elite. Best dual-peak timing of any Ragna fusion." },

  "rachel+ragna": { name:"BAT BLOOD", rating:"A", desc:"Rachel bats sustain pressure to threshold — Blood Scythe heals while bats continue. Bat swarm + Scythe heal creates indefinite sustain loop.", primary:"ragna", secondary:"rachel",
    take:{ ragna:["Blood Scythe group heal — resets HP while bats cover","Blood Kain sub-50% multiplier","Super armor through bat-distracted enemy retaliation"], rachel:["Bat swarm autonomous DPS softens enemies to threshold","Tempest Dahlia groups enemies for Scythe AoE","Wind Barrier field around Scythe range"] },
    crystal:["resonance","summon-booster","not-dead-yet","vital-boost","giant-slayer","mixture-enhancement"],
    tactics:["Attack Chain Lightning","Skill Blood Scythe","Dash Shadow Spike","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Bats soften enemies to threshold autonomously — Ragna closes for Scythe group heal. Healed, Apex phase begins. Bats soften next group while Ragna recovers. Permanent Scythe heal loop with zero downtime.",
    math:"Bat DPS to threshold: ~1800/bat wave x 3 waves. Scythe heal on group: ~400HP x Blood Kain 1.3 x Resonance 1.4 x Summon 1.45 = 2.64x on Scythe in blood threshold. Loop resets every 12 seconds." },

  "ragna+taokaka": { name:"BLOOD RUSH", rating:"A+", desc:"Taokaka rush pace keeps Ragna in blood threshold. Kill speed from Tao momentum resets Blood Scythe constantly.", primary:"ragna", secondary:"taokaka",
    take:{ ragna:["Blood Scythe group heal — resets HP for Kain threshold","Blood Kain sub-50% bonus","Super armor on heavy strings"], taokaka:["Rush: kill momentum keeps Blood Scythe range constant","Claw blitz combo sustain","Infinite dodge direction changes","Speed Demon kill chain"] },
    crystal:["exhilaration","not-dead-yet","vital-boost","mixture-enhancement","giant-slayer","chain-reaction"],
    tactics:["Attack Burn","Skill Blood Scythe","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Tao kill chain keeps rooms clear fast — Scythe healing on grouped enemies between rooms. Chain Reaction: 3 kills +36% on top of Blood Kain. Exhilaration via Tao hit rate stacks before Blood Kain threshold arrives.",
    math:"Kill chain: +36% x Blood Kain 1.3 x Exhilaration 3.0 cap = 4.68x in post-kill momentum. Scythe area heal: ~400 HP per cast on groups = permanent Blood Kain zone maintenance." },

  "lambda+ragna": { name:"BLADE BLOOD", rating:"A", desc:"Lambda swords proc lifesteal through Blood Scythe inheritance. All 4 swords independently trigger Ragna Scythe heal — autonomous lifesteal machine.", primary:"ragna", secondary:"lambda",
    take:{ lambda:["Sword Rain: 4 independent swords proc per hit","Umbra Fortune for Shadow Spike confirmation","Respawn Double permanent sword field","Summon Booster scales all swords"], ragna:["Blood Scythe: procs on sword hits = autonomous healing","Blood Kain sub-50% multiplier","Super armor on heavy attacks"] },
    crystal:["resonance","summon-booster","not-dead-yet","vital-boost","giant-slayer","umbra-fortune"],
    tactics:["Attack Shadow Spike","Skill Thunderbolt","Dash Blade Slash","Legacy Blood Scythe","Summon Sword Rain"],
    synergy:"Blood Scythe legacy procs on all 4 sword hits — autonomous healing without player casting. Sub-50% HP activates Blood Kain while swords heal back up.",
    math:"4 swords x Blood Scythe heal proc = 4 independent heal sources per wave. Blood Kain sub-50%: 1.3 x Summon 1.45 x Resonance 1.4 = 2.64x on swords during blood threshold." },

  "mai+ragna": { name:"NEEDLE BLOOD", rating:"A", desc:"Mai needles bring enemies to Blood Kain range safely from distance. 8 needles per cast at range = precise HP management for Blood Scythe confirm.", primary:"ragna", secondary:"mai",
    take:{ mai:["Needle Storm: 8 procs per cast at safe range","Frost Spear Cold slow — enables Blood Kain approach","Chain Spear follow-up multi-hit"], ragna:["Blood Scythe close-range confirm on needle-weakened enemies","Blood Kain sub-50% multiplier","Super armor through close approach"] },
    crystal:["vital-boost","not-dead-yet","giant-slayer","straightforward","mixture-enhancement","ice-fortune"],
    tactics:["Attack Cold","Skill Frost Spear","Dash Shadow Spike","Legacy Blood Scythe","Summon Lightning Orb"],
    synergy:"Needles reduce enemy HP to 30-40% at range. Cold slow prevents retaliation during Ragna approach. Blood Scythe on needle-weakened grouped enemies confirms heal + Blood Kain threshold in one cast.",
    math:"Needle to threshold: 8 procs x Cold 1.46 x 3 casts = ~56% enemy HP removed at range. Blood Kain: 1.3 x Giant Slayer 1.6 = 2.08x on Scythe." },

  "hazama+ragna": { name:"SNAKE BLOOD", rating:"A", desc:"Burn DoT softens targets to Blood Kain threshold. Hazama reach applies Burn at range, Ragna closes for Blood Scythe confirm.", primary:"ragna", secondary:"hazama",
    take:{ ragna:["Blood Scythe close-range AoE heal","Blood Kain sub-50% multiplier","Super armor through heavy attacks"], hazama:["Chain whip Burn DoT — applies to 3-5 targets at range","Ouroboros ring extended reach","Snake Burn stacking DoT","Counter God parry backup"] },
    crystal:["fire-fortune","not-dead-yet","vital-boost","giant-slayer","straightforward","mixture-enhancement"],
    tactics:["Attack Burn","Skill Blood Scythe","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Burn DoT from whip range brings enemies to Blood Kain threshold safely. Ragna closes when DoT confirms threshold — Blood Scythe on grouped enemies heals back to safe zone.",
    math:"Burn DoT: 260/s x 5 targets = 1300 passive. At 30% HP: Blood Kain 1.3 x Straightforward 1.45 x Giant Slayer 1.6 = 3.0x on Scythe confirm." },

  "hakumen+ragna": { name:"VOID BLOOD", rating:"A+", desc:"Hakumen parries — Blood Kain activates from the guaranteed sub-50% window. Magatama charges while Ragna recovers HP via Scythe.", primary:"ragna", secondary:"hakumen",
    take:{ ragna:["Blood Scythe AoE heal resets HP between Kain phases","Blood Kain sub-50% multiplier","Super armor on heavies"], hakumen:["Void Counter — intentional absorption to reach Kain threshold","Magatama charge during blood phase","AoE counter blast on parry","Super armor overlapping"] },
    crystal:["vital-boost","not-dead-yet","legacy-amplifier","giant-slayer","straightforward","apex-predator"],
    tactics:["Attack Light Spear","Skill Blood Scythe","Dash Shadow Spike","Legacy Magatama Counter","Summon Chain Lightning"],
    synergy:"Hakumen takes intentional hits to drop below 50% — Blood Kain activates. Magatama charges during blood phase. Apex Predator at full HP when Scythe heals back up. Cycling between Kain and Apex phases.",
    math:"Apex at full HP: 1.35x. Blood Kain sub-50%: 1.30x. Magatama full: 2.0x. Average sustained: 1.5-1.7x higher than single-mode builds." },

  "icey+ragna": { name:"PIXEL BLOOD", rating:"A", desc:"ICEY dance patterns never drop Ragna below Scythe-heal range. Dance mobility keeps Blood Kain threshold accessible without taking lethal hits.", primary:"ragna", secondary:"icey",
    take:{ ragna:["Blood Scythe heal — dance patterns keep hitting grouped enemies","Blood Kain sub-50% window","Super armor on heavies"], icey:["Dance movement: attack patterns dodge simultaneously","Pixel Storm combo burst","Blade Dance execution window","ICEY combo hit frequency"] },
    crystal:["exhilaration","not-dead-yet","vital-boost","defensive-combo","giant-slayer","straightforward"],
    tactics:["Attack Burn","Skill Thunderbolt","Dash Shadow Spike","Legacy Blood Scythe","Summon Lightning Orb"],
    synergy:"ICEY dance = always attacking, always dodging. Blood Scythe on dance procs = constant healing during movement. Never stationary = Defensive Combo always active. Dance pace hits Exhilaration cap at ~25 seconds.",
    math:"Dance hit frequency: ~8-10 hits/sec. Exhilaration cap: ~28s. At cap: 3.0x x Blood Kain 1.3 = 3.9x during blood phase. Defensive Combo -80% during dance strings." },

  "naoto+ragna": { name:"BLOOD HUNTER", rating:"S", desc:"Double HP-cost offense. Blood Pact applies to both characters HP-cost abilities — pure execute machine.", primary:"ragna", secondary:"naoto",
    take:{ ragna:["Blood Kain sub-50% multiplier","Blood Scythe heal-on-hit","Super armor attacks"], naoto:["Hunter's Eye execute mechanic","Blood Edge HP-cost attacks","Fatal Blow crit system","Blood Restriction drain"] },
    crystal:["fatal-blow","focus","not-dead-yet","blood-pact","giant-slayer","vital-boost"],
    tactics:["Attack Burn","Skill Blood Edge","Dash Shadow Spike","Legacy Blood Scythe","Summon Chain Lightning"],
    synergy:"Blood Pact +35% on BOTH Blood Scythe and Blood Edge simultaneously. Blood Kain + Fatal Blow crit = execute phase where every hit is a critical Blood Kain crit.",
    math:"Sub-50% HP: Blood Kain 1.3 x Blood Pact 1.35 x Fatal Blow crit 1.75 x Focus 55% crit rate avg 1.41 = 2.47x expected damage in blood threshold." },

  "es+jin": { name:"FROST CREST", rating:"S", desc:"Freeze field + crest spatial traps. Jin Cold freeze plants enemies onto crest positions — frozen targets cannot escape mine detonation.", primary:"jin", secondary:"es",
    take:{ jin:["Attack Cold freeze — enemies locked in place","Skill Cold +47% all skills","Ice Fortune tactic guarantee","Frost Burst at max Cold stacks"], es:["Crest field — passive damage traps","Mine detonation: frozen enemies cannot dodge mines","Aerial bounce chain on frozen groups","Speed Crest mobility through frozen field"] },
    crystal:["domination","ice-fortune","giant-slayer","exhilaration","not-dead-yet","resonance"],
    tactics:["Attack Cold","Skill Cold","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Cold freeze + crest mine = guaranteed detonation. Frozen enemies sit on mines for full tick damage. Mine bounce chains confirmed since targets cannot move out of bounce radius.",
    math:"Mine on frozen: 570 x bounce x 3 = 1710 confirmed. Frost Burst: 520 AoE x Domination 1.45 x Resonance 1.4 = 1056 AoE proc. Scene control: 100%." },

  "jin+rachel": { name:"STORM FREEZE", rating:"A+", desc:"Frozen enemies pulled by Tempest Dahlia into Frost Burst radius. Jin freezes, Rachel repositions them into optimal AoE range.", primary:"jin", secondary:"rachel",
    take:{ jin:["Attack Cold freeze field","Skill Cold stacking slow","Ice Fortune tactic drop guarantee","Frost Burst AoE burst"], rachel:["Tempest Dahlia pull — repositions frozen enemies into clusters","Bat summon proc on all grouped enemies","Wind Barrier persistent field","Pumpkin detonation on clusters"] },
    crystal:["resonance","ice-fortune","exhilaration","not-dead-yet","giant-slayer","domination"],
    tactics:["Attack Cold","Skill Frost Burst","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Freeze field + Dahlia pull = max enemy density in Frost Burst radius. Frost Burst at max Cold stacks with enemies clustered: 520 x all targets. Ring of Fire on clustered frozen enemies: 770 burst x group size.",
    math:"Frozen cluster 5 enemies x Frost Burst 520 x Domination 1.45 = 3770 AoE. Ring of Fire: 770 x 5 targets x Resonance 1.4 = 5390 burst. No enemy can escape." },

  "jin+taokaka": { name:"FROZEN RUSH", rating:"A+", desc:"Taokaka rush in a frozen field means 100% back-attack exposure. Infinite dodges become infinite flanking through Cold-slowed enemies.", primary:"jin", secondary:"taokaka",
    take:{ jin:["Cold field: enemies at 30% speed","Skill Cold +47% damage bonus","Ice Fortune guaranteed drop","Frost Burst at Cold peak"], taokaka:["Rush: flanking every frozen enemy from behind","Infinite dodge chains through frozen zones","Claw blitz against immobile targets","Combo Surge feeding Exhilaration on frozen hit streaks"] },
    crystal:["exhilaration","combo-surge","ice-fortune","giant-slayer","not-dead-yet","defensive-combo"],
    tactics:["Attack Cold","Skill Cold","Dash Shadow Spike","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Frozen enemies at 30% speed cannot rotate to face Tao rush — 100% back-attack exposure. Tao rush builds combo at maximum rate since zero evasion. Both hit cap ~20s in frozen field.",
    math:"Frozen + Tao rush: 12 hits/sec with 100% back-attack. Exhilaration cap: 20s. At cap: 3.0 x Cold 1.46 x Giant Slayer 1.6 = 7.0x vs elite. Highest Jin combo ceiling." },

  "jin+lambda": { name:"FROST BLADE", rating:"A+", desc:"Lambda swords proc in Jin frozen field. Swords never parried or dodged by frozen enemies — 4 autonomous turrets at full efficiency.", primary:"jin", secondary:"lambda",
    take:{ jin:["Cold field: enemies frozen, cannot dodge sword procs","Skill Cold +47% on all skills","Ice Fortune guaranteed","Frost Burst cleanup at Cold peak"], lambda:["Sword Rain: 4 swords proc with 100% confirmation on frozen","Summon Booster scales all swords","Shadow Spike per sword hit on frozen enemies","Respawn Double permanent sword coverage"] },
    crystal:["ice-fortune","resonance","summon-booster","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Cold","Skill Ice Sword","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Frozen enemies cannot evade sword strikes — 100% sword hit confirmation. All 4 swords proc Summon Booster at full rate with zero miss chance. Frost Burst at Cold peak does AoE while swords provide sustained coverage.",
    math:"4 swords x frozen 100% confirmation x Resonance 1.4 x Summon 1.45 = 2234/wave guaranteed. At Exhilaration cap 3.0: 6702/wave. Zero sword proc waste." },

  "jin+mai": { name:"FROST NEEDLE", rating:"A+", desc:"Mai 8 needles each apply Cold — stack hit count triples. Cold stacks accumulate 8x faster per cast, reaching Frost Burst threshold in 2 skill uses.", primary:"jin", secondary:"mai",
    take:{ jin:["Cold stacking: accumulates per hit","Skill Cold +47% damage","Ice Fortune guaranteed","Frost Burst AoE at stack peak"], mai:["Needle Storm: 8 hits per cast = 8x Cold stack rate","Frost Spear single-target Cold confirm","Chain Spear follow-up multi-hit","Mana-efficient skill rotation"] },
    crystal:["ice-fortune","domination","exhilaration","giant-slayer","not-dead-yet","resonance"],
    tactics:["Attack Cold","Skill Frost Spear","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"8 needles per cast = 8 Cold stack applications per skill use. Freeze threshold reached in 2 casts instead of 8+ normal attacks. Ice Fortune guarantees Cold drop.",
    math:"2 Mai casts = full Cold freeze. Frost Burst: 520 x Domination 1.45 x Resonance 1.4 = 1055 AoE. Needle ongoing: 8 procs x Cold 1.47 x Domination 1.45 sustained. Fastest Cold stack build." },

  "hazama+jin": { name:"COLD VENOM", rating:"A", desc:"Freeze them, chain them. Hazama whip applies DoT while frozen enemies cannot escape — perfect DoT delivery system.", primary:"jin", secondary:"hazama",
    take:{ jin:["Cold field — enemies frozen, cannot escape whip DoT","Skill Cold +47% damage","Ice Fortune guaranteed","Frost Burst AoE cleanup"], hazama:["Chain whip Burn DoT on all frozen targets","Ouroboros ring range extension","Snake Burn stacking on immobile enemies","Counter God parry if enemies break freeze"] },
    crystal:["ice-fortune","fire-fortune","not-dead-yet","giant-slayer","resonance","exhilaration"],
    tactics:["Attack Cold","Skill Burn","Dash Thunderbolt","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Frozen enemies cannot move out of whip range — guaranteed DoT stacks on all targets. Both Ice Fortune and Fire Fortune align: dual reliable element drop rates.",
    math:"Burn DoT on frozen x 5 targets: 260 x 5 = 1300 passive. Frost Burst 520 x Resonance 1.4 = 728 AoE cleanup. Dual fortune: guaranteed Cold and Fire drops every run." },

  "hakumen+jin": { name:"ABSOLUTE ZERO", rating:"S", desc:"The ultimate control duo. Hakumen parry on frozen enemies + Magatama charge while Jin holds the freeze field.", primary:"jin", secondary:"hakumen",
    take:{ jin:["Cold field — enemies frozen in place","Skill Cold +47% on all skills","Ice Fortune drop guarantee","Frost Burst at max Cold stacks"], hakumen:["Magatama charge during freeze window","Void Counter parry","Light Spear burst 490/hit","Magatama 2x multiplier at full charge"] },
    crystal:["domination","giant-slayer","legacy-amplifier","not-dead-yet","ice-fortune","exhilaration"],
    tactics:["Attack Cold","Skill Cold","Dash Light Spear","Legacy Magatama Counter","Summon Frost Burst"],
    synergy:"Frozen enemies cannot interrupt Magatama charge. Full Magatama while enemy is frozen = charged Light Spear with no risk. Legacy Amplifier: 490 x 1.5 x 2.0 = 1470 per hit.",
    math:"Freeze hold: ~3-4s. Full Magatama charge: 2.5s. With Cold field, Magatama always reaches full charge before freeze expires. 1470/hit x Exhilaration cap = highest burst per second of any fusion." },

  "bullet+jin": { name:"FROST SHELL", rating:"A", desc:"Bullet CQC drive in a frozen field. Drive shells hit frozen enemies with no risk — Defensive Combo active throughout CQC string.", primary:"jin", secondary:"bullet",
    take:{ jin:["Cold field freeze — enemies cannot interrupt Drive","Skill Cold +47% damage bonus","Ice Fortune tactic guarantee"], bullet:["Drive: 8-10 shells/sec sustained CQC","Defensive Combo protection during drive strings","Steel Shell HP sustain","Demolition Charge burst"] },
    crystal:["defensive-combo","ice-fortune","not-dead-yet","giant-slayer","straightforward","vital-boost"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Frozen enemies cannot interrupt Drive strings — Defensive Combo active 100% during CQC. Drive in frozen field = max shells landed with zero threat.",
    math:"Drive 9 hits/sec x Cold 1.46 = 1.46x sustained. Frozen: zero counterattack risk. Defensive Combo -80% during Drive = effective HP x 5 during attack strings." },

  "jin+naoto": { name:"BLOOD FREEZE", rating:"A+", desc:"Frozen enemies cannot interrupt Hunter's Eye approach. Jin freeze field hands Naoto perfect execute timing with no counter threat.", primary:"jin", secondary:"naoto",
    take:{ jin:["Cold field: enemies frozen during Hunter's Eye approach","Skill Cold +47% on all skills","Ice Fortune guaranteed","Frost Burst on threshold-reached frozen enemies"], naoto:["Hunter's Eye execute on frozen enemies — guaranteed approach","Blood Edge HP-cost burst on frozen targets","Fatal Blow crit in frozen execute window","Blood Restriction at range before close"] },
    crystal:["fatal-blow","focus","ice-fortune","not-dead-yet","giant-slayer","blood-pact"],
    tactics:["Attack Cold","Skill Blood Edge","Dash Thunderbolt","Legacy Ice Spike","Summon Lightning Orb"],
    synergy:"Frozen enemies cannot counter Hunter's Eye approach — guaranteed execute timing every time. Blood Pact +35% on Blood Edge. Focus 55% crit rate on execute.",
    math:"Frozen execute: Blood Edge x Blood Pact 1.35 x Fatal Blow avg 1.41 x Hunter's Eye 1.75 x Giant Slayer 1.6 = 5.34x on frozen confirm." },

  "icey+jin": { name:"FROZEN DANCE", rating:"A+", desc:"Dance through a frozen field. Jin Cold means enemies cannot rotate or retaliate during ICEY dance patterns — zero counterattack risk.", primary:"jin", secondary:"icey",
    take:{ jin:["Cold field: enemies frozen during dance patterns","Skill Cold +47% — ICEY dance hits scaled","Ice Fortune guaranteed","Frost Burst at Cold peak on dance-accumulated stacks"], icey:["Dance patterns: omnidirectional hits on frozen enemies","Pixel Storm blast on Cold-stacked groups","Blade Dance execute on frozen threshold enemies","Dance pace feeds Cold stack accumulation"] },
    crystal:["exhilaration","ice-fortune","defensive-combo","giant-slayer","not-dead-yet","domination"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Shadow Spike","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Frozen enemies + dance patterns = 100% hit confirmation, 0% counter rate. Dance accumulates Cold stacks rapidly with omnidirectional hits.",
    math:"Dance on frozen: 8 hits/sec x 0 counter risk. Exhilaration cap: 22s. Frost Burst at cap: 520 x Domination 1.45 x Exhilaration 3.0 = 2262 AoE. Defensive Combo -80% dmg during strings." },

  "jin+prisoner": { name:"DEAD FREEZE", rating:"A", desc:"Prisoner weapon variety hits frozen enemies with zero risk. Roll-dodge immunity + Jin freeze = the most defensively invincible fusion.", primary:"jin", secondary:"prisoner",
    take:{ jin:["Cold field: total battlefield control","Skill Cold +47% all skills","Ice Fortune tactic control"], prisoner:["Any weapon type hits frozen enemies safely","Roll-dodge: invincibility on every roll","Adaptive weapon picks maximize Cold field usage","Dead Cells kill momentum on frozen rooms"] },
    crystal:["ice-fortune","not-dead-yet","defensive-combo","giant-slayer","exhilaration","chain-reaction"],
    tactics:["Attack Cold","Skill Thunderbolt","Dash Blade Slash","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Frozen field + roll invincibility = permanent safe play. Prisoner weapon rolls against frozen enemies: hit, roll, hit — no gaps. Chain Reaction on frozen room clears: +36% momentum.",
    math:"Frozen room: 100% hit confirmation. Roll: 60%+ uptime in aggressive play. Chain Reaction 3-kill: +36% x Giant Slayer 1.6 = 2.18x vs elite at kill momentum. Highest survivability of any Jin fusion." },

  "jin+kokonoe": { name:"FROZEN SCIENCE", rating:"A+", desc:"Kokonoe fires missiles from above a frozen field. Jin Cold means no enemy can close distance — pure aerial artillery.", primary:"kokonoe", secondary:"jin",
    take:{ kokonoe:["Aerial position: above all ground threats","Missile Rain: 10 proj x Cold-slowed targets","Fire Projectile: frozen enemies absorb full burst","Science-type tactic procs in frozen field"], jin:["Cold field: enemies grounded and slowed","Skill Cold +47% on Kokonoe skills","Ice Fortune tactic guarantee","Frost Burst at Cold stack peak"] },
    crystal:["domination","ice-fortune","resonance","giant-slayer","not-dead-yet","exhilaration"],
    tactics:["Attack Cold","Skill Fire Projectile","Dash Thunderbolt","Legacy Ice Spike","Summon Frost Burst"],
    synergy:"Kokonoe aerial + Jin freeze = absolute zoning control. Fire Projectile 280 x 10 on frozen stationary targets: every projectile lands. Frost Burst at Cold peak hits full room while Kokonoe is untouched above.",
    math:"Fire Projectile on frozen: 280x10=2800 confirmed. x Domination 1.45 x Resonance 1.4 = 5684 per cast. Aerial: takes 0 damage from grounded enemies." },

  "kokonoe+noel": { name:"SCIENCE DRIVE", rating:"A", desc:"Noel Drive procs Kokonoe missile tactic chains. Drive hits trigger orbital responses — 9 hits/sec ground fire + missile rain overhead.", primary:"kokonoe", secondary:"noel",
    take:{ kokonoe:["Aerial bombardment: missiles rain on Drive targets","Fire Projectile: 10 projectiles on Noel skill trigger positions","Zoning — enemies focused on Noel, Kokonoe fires safely"], noel:["Drive: 9 hits/sec rapid fire","Rapid skill rotation feeds Kokonoe tactic slots","Bullet Storm multi-target engagement","Long-range passive bonus"] },
    crystal:["resonance","domination","exhilaration","giant-slayer","not-dead-yet","mana-surge"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Drive 9 hits/sec builds tactic proc rates for missile triggers. Mana Surge keeps Noel Drive rotation fast. Enemies split attention between Drive fire and incoming missiles.",
    math:"Drive 9 hits/sec x Chain Lightning 3-bounce 295x3 = 7965/sec lightning. Fire Projectile overhead: 280x10xDomination 1.45 = 4060/cast. Combined: 12000+ peak DPS burst window." },

  "kokonoe+taokaka": { name:"SCIENTIFIC CHAOS", rating:"A", desc:"Taokaka rushes ground level while Kokonoe bombs from above. Enemies cannot track both attack sources.", primary:"kokonoe", secondary:"taokaka",
    take:{ kokonoe:["Aerial position — safe from Tao-level ground chaos","Missile Rain: targeting Tao engaged enemies","Fire Spirit: flies autonomously while Tao creates ground chaos"], taokaka:["Rush: draws enemy attention entirely","Infinite dodge chains: never in missile landing zone","Claw blitz combo pace","Ambush Cat flanking draws enemies into missile targeting"] },
    crystal:["resonance","exhilaration","combo-surge","giant-slayer","not-dead-yet","straightforward"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Tao draws aggro while Kokonoe bombs. Enemies cannot track aerial attacks while managing Tao rush. Exhilaration from Tao hit rate + Kokonoe missile proc hits feed the combo counter simultaneously.",
    math:"Tao combo + Kokonoe proc combined: Exhilaration cap ~22s. At cap: Tao rush 3.0x x Fire Projectile 280x10xResonance 1.4 = 5684 per cast with full Exhilaration." },

  "kokonoe+lambda": { name:"ORBITAL BLADE", rating:"A+", desc:"Kokonoe missiles trigger Lambda sword rain from above. Swords spawn in aerial positions — the only true aerial tactic-summon combo.", primary:"kokonoe", secondary:"lambda",
    take:{ kokonoe:["Aerial position — missiles and swords both fire downward","Missile Rain: 10 projectile burst","Science-type tactic procs","Fire Spirit autonomous aerial attacker"], lambda:["Sword Rain: 4 autonomous swords","Summon Booster scales all swords","Shadow Spike per sword hit","Respawn Double permanent sword field"] },
    crystal:["resonance","summon-booster","exhilaration","giant-slayer","not-dead-yet","domination"],
    tactics:["Skill Fire Projectile","Attack Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Sword Rain"],
    synergy:"Aerial Kokonoe + upward-firing swords = maximum coverage angle. Missiles fire down while swords fire up — enemies hit from both directions. Summon Booster +45% on all 4 swords + missile procs.",
    math:"4 swords x Summon 1.45 x Resonance 1.4 = 2312/wave. Missile 280x10xDomination 1.45 = 4060/cast. Simultaneous: ~6372 combined burst with no floor contact." },

  "kokonoe+mai": { name:"ORBITAL NEEDLE", rating:"A", desc:"Mai needles at ground level, Kokonoe missiles from above. Every needle hit marks a target for overhead missile confirmation.", primary:"kokonoe", secondary:"mai",
    take:{ kokonoe:["Aerial missiles confirm on needle-marked targets","Fire Projectile burst on needle-clustered groups","Safe aerial position above needle engagement range"], mai:["Needle Storm: 8 hits mark targets for Kokonoe overhead","Frost Spear Cold slow ensures missile confirmation","Chain Spear repositions after needle volleys"] },
    crystal:["resonance","domination","giant-slayer","not-dead-yet","exhilaration","ice-fortune"],
    tactics:["Skill Fire Projectile","Attack Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Needle marks target position — Kokonoe missile confirms on that exact location. Cold slow holds position between needle and missile. 8 needle procs + 10 missile procs = 18 simultaneous hit events per rotation.",
    math:"18 simultaneous hit events: (275 shadow x 8 needles) + (280 x 10 missiles) = 5000 combined. x Resonance 1.4 = 7000 per rotation." },

  "hakumen+kokonoe": { name:"SCIENCE VOID", rating:"A", desc:"Kokonoe missile softens enemies — Hakumen parries the retaliation. Magatama charges during missile application phase.", primary:"kokonoe", secondary:"hakumen",
    take:{ kokonoe:["Missile Rain depletes enemy HP to parry threshold","Fire Projectile 10-burst softens clusters before counter","Aerial safety — Kokonoe never in Hakumen parry range"], hakumen:["Void Counter: missile-softened enemies reach parry threshold","Magatama charges during missile application","AoE counter blast on missile-clustered enemies","Light Spear follow-up on counter"] },
    crystal:["legacy-amplifier","resonance","giant-slayer","not-dead-yet","exhilaration","domination"],
    tactics:["Skill Fire Projectile","Attack Light Spear","Dash Thunderbolt","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Missile softening → Magatama charges → counter when threshold reached. Aerial Kokonoe never enters Hakumen counter zone. Legacy Amplifier: 490x1.5x2.0 = 1470 per Magatama Light Spear on missile-weakened target.",
    math:"Missile to 40% HP: 280x10x2 casts = 5600. At 40%: Magatama full 2.0 x Legacy Amp 1.5 x Giant Slayer 1.6 = 4.8x counter spike." },

  "bullet+kokonoe": { name:"ARTILLERY SHELL", rating:"A", desc:"Bullet holds CQC front line while Kokonoe provides aerial artillery. Shell hits trigger overhead missile targeting.", primary:"kokonoe", secondary:"bullet",
    take:{ kokonoe:["Aerial position above Bullet CQC range","Missile Rain on Bullet engaged targets","Fire Projectile burst on clustered enemies"], bullet:["Drive shells group enemies into Kokonoe targeting zone","CQC front-line draws enemies to missile targeting","Defensive Combo protection during Drive","Demolition Charge clusters before Kokonoe burst"] },
    crystal:["resonance","domination","giant-slayer","not-dead-yet","defensive-combo","exhilaration"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Bullet Drive groups enemies into Kokonoe missile targeting zone. Demolition Charge clusters before Fire Projectile burst — 10 projectiles all confirmed. Defensive Combo during Drive + aerial safety = zero damage taken.",
    math:"Drive cluster + Fire Projectile on grouped: 280x10xDomination 1.45 = 4060. Ring of Fire: 770 on same cluster. Total burst window: ~6000+ on grouped confirm." },

  "kokonoe+naoto": { name:"SCIENCE HUNTER", rating:"A", desc:"Kokonoe missiles bring enemies to Hunter's Eye threshold from safety. Naoto executes while Kokonoe provides air cover.", primary:"kokonoe", secondary:"naoto",
    take:{ kokonoe:["Missile Rain: depletes enemy HP to Hunter's Eye threshold from range","Fire Projectile 10-burst on pre-execute clusters","Aerial safety — Naoto tanks no missile retaliation"], naoto:["Hunter's Eye: executes on missile-weakened targets","Blood Edge HP-cost burst on confirmed threshold","Fatal Blow crit on missile-defined execute window"] },
    crystal:["fatal-blow","focus","not-dead-yet","giant-slayer","resonance","blood-pact"],
    tactics:["Skill Fire Projectile","Attack Blood Edge","Dash Thunderbolt","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Missile depletion to 30% HP: safe, aerial, consistent. Hunter's Eye activates — Naoto executes. Blood Pact +35% on Blood Edge. Focus 55% crit rate makes execute reliable.",
    math:"Missile to 30%: 280x10x2 casts = 5600. Execute: Blood Edge x Blood Pact 1.35 x Fatal Blow avg 1.41 x Hunter's Eye 1.75 x Giant Slayer 1.6 = 5.34x spike." },

  "icey+kokonoe": { name:"DANCE SCIENCE", rating:"A", desc:"ICEY dance draws enemy aggro while Kokonoe bombs freely. Dance creates perfect distraction — orbital bombardment confirms on every dance-engaged target.", primary:"kokonoe", secondary:"icey",
    take:{ kokonoe:["Missiles confirm on dance-engaged enemies — zero aggro on Kokonoe","Fire Projectile on ICEY repositioning clusters","Aerial safety while dance covers all ground threats"], icey:["Dance: draws all enemy attention from Kokonoe","Pixel Storm omnidirectional creates wide missile target zone","Blade Dance execute after missile softening","ICEY combo accumulation drives Exhilaration"] },
    crystal:["resonance","exhilaration","domination","giant-slayer","not-dead-yet","defensive-combo"],
    tactics:["Skill Fire Projectile","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Dance omnidirectional patterns distract all enemies from Kokonoe missile origin. ICEY Defensive Combo + Kokonoe aerial = combined 90%+ damage avoidance. Exhilaration from dance pace feeds missile burst scaling.",
    math:"Dance distraction: 100% enemy aggro on ICEY. Kokonoe fires freely: 280x10xDomination 1.45 = 4060/cast x Exhilaration 3.0 at cap = 12180/cast." },

  "kokonoe+prisoner": { name:"EXILE SCIENCE", rating:"A", desc:"Prisoner weapon variety keeps ground pressure while Kokonoe bombs. Roll invincibility prevents any gap in ground coverage during aerial bombardment.", primary:"kokonoe", secondary:"prisoner",
    take:{ kokonoe:["Aerial missiles confirm on Prisoner-engaged targets","Fire Projectile burst on weapon-varied clusters","Science procs on all ground-level weapon contacts"], prisoner:["Any weapon keeps ground pressure while Kokonoe bombs","Roll-dodge fills gaps in Kokonoe missile coverage","Kill momentum: Dead Cells chain supplements missile depletion","Chain Reaction 3-kill between missile salvos"] },
    crystal:["resonance","domination","not-dead-yet","giant-slayer","exhilaration","chain-reaction"],
    tactics:["Skill Fire Projectile","Attack Burn","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Ground + aerial dual coverage: Prisoner any-weapon at ground, Kokonoe missiles from above. Chain Reaction 3-kill on Prisoner momentum feeds missile proc rate acceleration.",
    math:"Chain Reaction 3-kill: +36% x Kokonoe missile 280x10 = 4060x1.36 = 5522/cast during kill momentum. x Exhilaration 3.0 = 16566 theoretical missile burst." },

  "es+noel": { name:"DRIVE CREST", rating:"A", desc:"Noel Drive activates Es crest combos at 9 procs/sec. The fastest crest chain generator — Drive hits chain-activate spatial fields.", primary:"es", secondary:"noel",
    take:{ es:["Crest field generates combo on each tactic hit","Mine detonation on Drive-engaged enemies","Speed Crest dash after Drive combos","Aerial bounce keeps Es above Drive range"], noel:["Drive: 9 hits/sec feeds Es crest combo generation","Rapid skill rotation keeps crest fields refreshed","Bullet Storm multi-target tears through crest zones","Long-range passive bonus"] },
    crystal:["domination","exhilaration","resonance","giant-slayer","not-dead-yet","mana-surge"],
    tactics:["Skill Place Mine","Attack Cold","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Drive 9 hits/sec generates crest combo count faster than any other Es pairing. Mana Surge keeps Drive going continuously. Exhilaration accumulates from Drive feed, reaching cap at ~25s.",
    math:"9 hits/sec crest combo generation. Exhilaration cap 25s. At cap: Drive x 3.0 x Domination 1.45 = 4.35x effective. Mine detonation on Drive-engaged: 570 x 3 bounce = 1710 burst per proc." },

  "es+rachel": { name:"SPATIAL STORM", rating:"A+", desc:"Es crests + Rachel wind. Tempest Dahlia pulls enemies onto crest positions — mines explode where enemies are repositioned.", primary:"es", secondary:"rachel",
    take:{ es:["Crest field: mine positions placed pre-fight","Mine detonation: Dahlia pulls enemies to trigger positions","Aerial bounce confirms mine chains","Speed Crest dash into bat swarm range"], rachel:["Tempest Dahlia pull: moves enemies to crest positions","Bat swarm procs on mine-positioned enemies","Wind Barrier field around crest network","Chain Lightning via bat hits on crest targets"] },
    crystal:["resonance","summon-booster","not-dead-yet","giant-slayer","exhilaration","defensive-combo"],
    tactics:["Skill Place Mine","Attack Chain Lightning","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Dahlia pull repositions enemies precisely onto crest-mine positions. Three sources firing on the same confirmed target: mine detonation + bat chain + Chain Lightning. Summon Booster applies to bats and mine classification simultaneously.",
    math:"Mine on Dahlia-pulled target: 570 x Resonance 1.4 = 798. Bat chain on same: 295x3xSummon 1.45xResonance 1.4 = 1800. Chain Lightning: 295x3 bounce = 885. Total on single target: ~3483 burst." },

  "es+taokaka": { name:"CREST BLITZ", rating:"A+", desc:"Tao rush charges through crest fields, detonating mines on every enemy she passes. Infinite dodge navigates the crest network without triggering self-damage.", primary:"es", secondary:"taokaka",
    take:{ es:["Crest trap network covering full floor","Mine bounce: Tao rush detonates mines on engaged enemies","Aerial chain — Tao charges below aerial Es","Speed Crest dash speed matching Tao rush angle"], taokaka:["Rush charges through mine fields targeting enemies","Infinite dodge navigates crest positions","Combo Surge feeding Exhilaration during crest blitz","Kill chain from mine-assisted clears"] },
    crystal:["exhilaration","combo-surge","resonance","not-dead-yet","giant-slayer","defensive-combo"],
    tactics:["Skill Place Mine","Attack Shadow Spike","Dash Thunderbolt","Legacy Blackhole","Summon Lightning Orb"],
    synergy:"Tao rush detonates mines on every enemy she engages. Blackhole legacy captures room, Tao rushes through the stationary cluster triggering the full crest field simultaneously.",
    math:"Tao rush through 5 enemies in mine field: 570 x 5 mines x Resonance 1.4 = 3990 from crest sweep. + Shadow Spike per rush hit: 275 x enemies x Resonance 1.4 = 1925. Total: ~5915 per rush sweep." },

  "es+mai": { name:"SPATIAL NEEDLE", rating:"A", desc:"Mai needles confirm crest positions — each needle hit triggers a crest proc if landing on crest field. 8 needles per cast = 8 simultaneous crest activations.", primary:"es", secondary:"mai",
    take:{ es:["Crest field: needle hits trigger crest procs","Mine detonation confirms on needle-grouped enemies","Aerial bounce above needle engagement range","Speed Crest repositions for optimal needle coverage"], mai:["Needle Storm: 8 hits trigger 8 crest procs per cast","Frost Spear Cold holds grouped enemies in crest field","Chain Spear repositions enemies onto crest positions","Mana-efficient needle rotation refreshes crest fields"] },
    crystal:["domination","resonance","not-dead-yet","giant-slayer","exhilaration","ice-fortune"],
    tactics:["Skill Place Mine","Attack Shadow Spike","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"8 needles per cast x crest field coverage = 8 crest activations per skill use. Mine detonation on Cold-slowed needle targets. Exhilaration stacks from dual hit sources: needle + crest activations combined.",
    math:"8 crest activations: combo stacking at 8x rate vs single-hit. Exhilaration cap: ~12s with needle+crest combined rate — fastest Es fusion cap. Mine on Cold needle target: 570 x Domination 1.45 = 827 per detonation." },

  "es+hazama": { name:"VENOM CREST", rating:"A", desc:"Crest positions trap enemies for Hazama's whip DoT. Enemies walk onto crests, get trapped, then receive full Burn DoT stack application.", primary:"es", secondary:"hazama",
    take:{ hazama:["Chain whip DoT on crest-trapped targets","Snake Burn stacks on immobile crest enemies","Ouroboros ring extended reach from crest positions"], es:["Crest traps: enemy enters crest = Hazama DoT confirm","Mine detonation on crest-entering enemies","Speed Crest positions Hazama in optimal chain range","Aerial bounce above crest field"] },
    crystal:["resonance","fire-fortune","giant-slayer","not-dead-yet","exhilaration","domination"],
    tactics:["Attack Burn","Skill Place Mine","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Crest traps enemy → Hazama applies DoT at guaranteed range. Mine detonation on same trapped target. Enemies cannot escape crest field while taking full Burn DoT stack.",
    math:"Crest trap + chain DoT: mine 570 + Burn 260/s x crest duration. 5 enemies: 1300/s Burn passive + mine per target = 3150 burst per crest activation." },

  "es+hakumen": { name:"SPATIAL VOID", rating:"A+", desc:"Crest positions force enemies into parry range. Hakumen counters at predetermined crest locations — the most position-controlled counter setup.", primary:"es", secondary:"hakumen",
    take:{ es:["Crest network channels enemy movement into counter zones","Mine detonation as entry punishment before counter","Speed Crest positions Hakumen at crest-defined counter location","Aerial bounce avoids ground-level counter engagement"], hakumen:["Void Counter: positioned at crest intersection","Magatama charge during crest-channeled approach","AoE counter blast on crest-funneled enemies","Light Spear follow-up on counter"] },
    crystal:["legacy-amplifier","resonance","not-dead-yet","giant-slayer","exhilaration","domination"],
    tactics:["Skill Place Mine","Attack Light Spear","Dash Thunderbolt","Legacy Magatama Counter","Summon Lightning Orb"],
    synergy:"Crest network channels enemy movement into counter zones. Hakumen positions at crest intersection — enemies triggered by crests approach into counter range. Mine detonation pre-softens before counter fires.",
    math:"Crest-channeled counter: Magatama full 2.0 x Legacy Amp 1.5 x Giant Slayer 1.6 = 4.8x. Mine pre-detonation: 570 x Resonance 1.4 = 798 per entry. Combined: ~5600 on crest-channeled boss approach." },

  "bullet+es": { name:"SHELL CREST", rating:"A", desc:"Bullet Drive pushes enemies onto crest positions. Demolition Charge clusters exactly at crest detonation zones — mine burst on confirm.", primary:"es", secondary:"bullet",
    take:{ es:["Crest mines: Demolition Charge clusters at detonation positions","Mine detonation on Drive-pushed enemies confirms full burst","Aerial bounce above Bullet CQC range","Speed Crest repositions after Bullet Drive clusters"], bullet:["Drive pushes enemies into crest mine positions","Demolition Charge clusters at pre-set crest locations","Defensive Combo during Drive into crest field","Steel Shell sustain while mines tick"] },
    crystal:["domination","resonance","not-dead-yet","giant-slayer","defensive-combo","exhilaration"],
    tactics:["Skill Place Mine","Attack Chain Lightning","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Drive pushes enemies along predictable paths — crest mines placed at natural push endpoints. Demolition Charge clusters the group exactly on mine positions.",
    math:"Demolition cluster at crest: 570x3x5 enemies = 8550 mine burst. Ring of Fire on same cluster: 770xResonance 1.4x5 = 5390. Drive on survivors: 9 hits/sec x Exhilaration 3.0 = 27 effective hits/sec." },

  "es+naoto": { name:"CREST EXECUTE", rating:"A+", desc:"Crest mines soften enemies to Hunter's Eye threshold. Naoto executes on mine-weakened, crest-trapped targets — controlled execute setup.", primary:"es", secondary:"naoto",
    take:{ es:["Crest mines soften enemies to Hunter's Eye 30% threshold","Mine detonation pre-positions Naoto for execute approach","Speed Crest mobility covers Naoto approach after mine confirm"], naoto:["Hunter's Eye: executes on mine-weakened crest-trapped enemies","Blood Edge HP-cost burst on confirmed threshold","Fatal Blow crit in mine-defined execute window","Blood Restriction while mines soften remotely"] },
    crystal:["fatal-blow","focus","resonance","not-dead-yet","giant-slayer","blood-pact"],
    tactics:["Skill Place Mine","Attack Blood Edge","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Crest mine softening: safe, remote, consistent. Hunter's Eye activates when mines confirm threshold. Execute with Fatal Blow + Focus crit on mine-weakened target.",
    math:"Mine to 30% threshold: 570x3 bounce x 2 detonations = 3420 damage. Execute: Blood Edge x Blood Pact 1.35 x Fatal Blow avg 1.41 x Hunter's Eye 1.75 x Giant Slayer 1.6 = 5.34x spike." },

  "es+icey": { name:"DANCE CREST", rating:"A+", desc:"ICEY dance hits activate crest combos on every dance contact. Omnidirectional dance means crests are constantly triggered from all angles.", primary:"es", secondary:"icey",
    take:{ es:["Crest field: activated by ICEY omnidirectional dance hits","Mine detonation on dance-gathered enemies","Aerial bounce above dance engagement zone"], icey:["Dance omnidirectional: activates crests from any angle","Pixel Storm multi-target triggers multiple crests simultaneously","Blade Dance execute on crest-weakened targets","ICEY combo pace drives Exhilaration for crest scaling"] },
    crystal:["exhilaration","domination","resonance","not-dead-yet","giant-slayer","defensive-combo"],
    tactics:["Skill Place Mine","Attack Cold","Dash Thunderbolt","Legacy Light Spear","Summon Lightning Orb"],
    synergy:"Dance omnidirectional hits = crest activations from any angle, no positioning needed. Defensive Combo during dance = ICEY never takes damage while activating Es crests. Exhilaration accumulates from both dance hits and crest activations.",
    math:"Dance 8 hits/sec x crest activation per hit: combo stacking at 8x/sec rate. Exhilaration cap: ~16s with dance+crest combined. At cap: Dance 3.0 x Domination 1.45 = 4.35x effective." },

  "es+prisoner": { name:"EXILE CREST", rating:"A", desc:"Prisoner weapon variety triggers crest activations on any weapon type. Roll invincibility navigates crest field without self-damage risk.", primary:"es", secondary:"prisoner",
    take:{ es:["Crest field: any Prisoner weapon activates crests on hit","Mine detonation on weapon-confirmed enemies","Speed Crest pairs with roll invincibility for escape routing"], prisoner:["Any weapon activates Es crests — run-independent build","Roll-dodge: invincible during crest field navigation","Kill momentum: Dead Cells chain on crest-weakened enemies","Chain Reaction 3-kill on mine-depleted groups"] },
    crystal:["domination","resonance","not-dead-yet","giant-slayer","exhilaration","chain-reaction"],
    tactics:["Skill Place Mine","Attack Burn","Dash Thunderbolt","Legacy Ring of Fire","Summon Lightning Orb"],
    synergy:"Prisoner weapon independence: any run, any weapon pool works with Es crests. Roll navigation: crest field without self-trigger risk. Chain Reaction kill momentum on mine-weakened groups.",
    math:"Any weapon x crest activation: run-proof build. Chain Reaction 3-kill: +36% x Exhilaration 3.0 = 4.08x during crest kill chain. Mine detonation on chain-momentum kill: 570xResonance 1.4 = 798 burst cleanup." },

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
