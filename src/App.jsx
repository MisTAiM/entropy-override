import { useState } from "react";
import CharacterGuide from "./components/CharacterGuide";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, CartesianGrid
} from "recharts";

const TACTICS_REFERENCE = [
  { name: "Cold Attack", tier: "S", element: "ice", vals: [29,34,40,46], unit: "% dmg boost per attack", note: "Steam: 'Jin + full Ice = auto mode. Nothing moves, you shred, bosses included.' Attack Cold slows ALL enemies simultaneously." },
  { name: "Skill Cold", tier: "S", element: "ice", vals: [30,35,41,47], unit: "% dmg boost on skills", note: "Stacks with Attack Cold. Double Cold = 46-47% on ALL inputs, plus 2 stacks of Cold per skill cast." },
  { name: "Frost Burst", tier: "A", element: "ice", vals: [320,385,450,520], unit: "burst dmg at max stacks", note: "At max Cold stacks, enemies burst for AoE. Wiki: triggers from Cold Attack OR Skill Cold accumulation. Wide radius room clear." },
  { name: "Attack Burn", tier: "A", element: "fire", vals: [160,190,220,260], unit: "DoT DPS", note: "Catalyst for Double Tactics. Procs on every normal hit. Essential catalyst — many Doubles require Burn as base." },
  { name: "Skill Burn", tier: "A", element: "fire", vals: [220,270,310,360], unit: "DoT DPS", note: "Higher base than Attack Burn. Core for skill-heavy chars. Catching Fire T2: +30% per burning enemy present." },
  { name: "Ring of Fire", tier: "B+", element: "fire", vals: [480,580,670,770], unit: "burst on Legacy use", note: "Mediocre alone. Storm Ring of Fire Double = full-screen AoE every dodge, hits entire screen. Transforms the tactic." },
  { name: "Fire Projectile", tier: "A", element: "fire", vals: [170,210,240,280], unit: "dmg × 10 projectiles", note: "10 projectiles × 280 = 2800 burst per Skill cast when all land (close range). Focused Fire T2 = 45° cone, all hit single target." },
  { name: "Fire Spirit", tier: "A", element: "fire", vals: [120,140,170,190], unit: "dmg per spirit hit", note: "Auto-spawns, attacks whatever you hit. Fire Spirit Detonation Double = spirits explode on Burn enemies = massive AoE chaining." },
  { name: "Place Mine", tier: "A*", element: "fire", vals: [360,430,500,570], unit: "dmg +10%/sec charge", note: "Es only: aerial bounce triggers 3+ mines per combo string. Splashing Mine T2 adds 6 shrapnel × 460. One combo = 9990 burst." },
  { name: "Shadow Spike", tier: "S", element: "umbra", vals: [170,200,235,275], unit: "proc dmg per attack", note: "Hibiki clones COPY this — every input procs 3× instead of 1×. 275 × 3 clones = 825 per normal attack. Best slot efficiency." },
  { name: "Blackhole", tier: "S", element: "umbra", vals: [0,0,0,0], unit: "area slow (no direct dmg)", note: "Steam: 'Game breaking. Others don't matter.' + Electric Detox + Poison Contamination = zero-input stun lock of entire screen." },
  { name: "Light Spear", tier: "S", element: "light", vals: [300,360,420,490], unit: "dmg per skill hit", note: "Hakumen charged Up+Skill nearly one-shots bosses with Light Spear. Universal boss damage. 490 flat per skill use at Legendary." },
  { name: "Chain Lightning", tier: "S", element: "light", vals: [180,215,250,295], unit: "dmg, bounces 3 enemies", note: "Rachel bats trigger Attack Lightning even as Legacy = non-stop chain lightning, zero player input. 295 × 3 enemies = 885 per proc." },
  { name: "Lightning Orb", tier: "S", element: "electric", vals: [150,180,210,245], unit: "dmg/hit autonomous turret", note: "Most character-neutral combo: Orb + Thunderbolt + Light Javelin. Persistent field turret. Anyone can run this skeleton." },
  { name: "Thunderbolt", tier: "A", element: "electric", vals: [200,240,280,325], unit: "chain dmg on dash", note: "Dash fires chain lightning to nearby enemies. Core of Thunderbolt/Orb/Spear combo that community calls 'character-neutral S-tier skeleton.'" },
];

const RARITY = ["Common","Uncommon","Rare","Legendary"];
const ELEM_COLORS = { ice:"#5BC4E8", fire:"#E84E25", umbra:"#A855F7", light:"#EDB72C", electric:"#00D9BB", blade:"#E05050" };

const CHARACTERS = [
  { id:"hibiki", name:"Hibiki Kohaku", tag:"SHADOW / CLONE", tier:"S", color:"#7B8FE4",
    img:"/chars/hibiki.png",
    builds:[
      { id:"clone_army", name:"CLONE ARMY", arch:"AoE Dominance", rating:97,
        tactics:["Attack Shadow Spike (Umbra)","Skill Lightning Orb (Electric)","Dash Thunderbolt (Light)","Legacy Ice Spike (Ice)","Summon Chain Lightning (Light)"],
        reasoning:[
          "Hibiki clones INHERIT Shadow Spike — every normal attack procs ×3 instead of ×1 (825 dmg vs 275)",
          "Lightning Orb stays on field as autonomous turret — 245 DPS with zero attention paid",
          "Thunderbolt on dash: movement becomes offense. Clones also copy this — triple proc per dodge",
          "Ice Spike Respawn Double = permanent auto-turrets from just one slot, requiring no upkeep",
          "Chain Lightning summon bounces to 3 enemies: 295 × 3 = 885 per proc passively"
        ],
        dps:[{n:"Base Attack",v:500},{n:"+ Shadow Spike",v:775},{n:"× Clone Multi",v:1550},{n:"+ Orb Turret",v:1795},{n:"+ Thunderbolt",v:2195}],
        radar:{burst:70,sustain:95,aoe:100,control:75,survival:80},
        crystals:["Kill Streak","Combo Counter","Crystal Resonance"],
        mathKey:"Shadow Spike at Legendary: 275 × 3 clones = 825 proc per normal attack. At ~3 attacks/sec = 2475 shadow proc DPS alone before base attack. Thunderbolt on each of 3 clone dashes adds ~975/sec. This build has no skill floor — it runs itself." },
      { id:"shadow_blade", name:"SHADOW BLADE", arch:"Precision Burst", rating:88,
        tactics:["Attack Shadow Spike (Umbra)","Skill Cold (Ice)","Dash Blade Slash (Blade)","Legacy Light Spear (Light)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Nov 2024 patch: Hibiki 'back attacks now grant damage increase — attacks no longer force enemies to turn'",
          "Shadow Spike on normals + back-attack talent = double-proc window on every repositioned attack",
          "Skill Cold: +47% on every skill at Legendary. Cold stacks slow enemies into back-attack territory",
          "Light Spear: 490 per legacy hit — massive boss damage on a 0-investment slot",
          "Ice Spike Respawn Double: autonomous turrets firing while you maintain back-attack positioning"
        ],
        dps:[{n:"Base Skills",v:600},{n:"+ Skill Cold (47%)",v:882},{n:"+ Shadow Spike",v:1157},{n:"+ Light Spear",v:1647},{n:"+ Back-Atk Talent",v:2050}],
        radar:{burst:90,sustain:65,aoe:40,control:70,survival:70},
        crystals:["Phase Shift","Blood Pact","Combo Counter"],
        mathKey:"Skill Cold at Legendary: base 600 → 882 (47% up). Back-attack talent adds an additional multiplier to shadow spike procs. Combined: each repositioned attack does approx 3.4× what the base game intends. Patch note confirms this is now the intended Hibiki power state." },
      { id:"phantom_step", name:"PHANTOM STEP", arch:"Evasion Tank", rating:82,
        tactics:["Attack Cold (Ice)","Skill Thunderbolt (Light)","Dash Shadow (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "3× dodge potential + iframe on Dash Shadow Tactic = near-total invincibility rotation",
          "Blackhole legacy: full-screen area slow on every legacy cast — nothing can close distance",
          "Cold Attack: 46% dmg boost WHILE simultaneously reducing enemy speed to ~30% normal",
          "Steam: 'Hibiki is evasion tank — get 3 dodges and you zip through everything'",
          "Lightning Orb turret runs autonomously — full DPS maintained while focusing on dodge timing"
        ],
        dps:[{n:"Base Attack",v:500},{n:"+ Cold (46%)",v:730},{n:"+ Thunderbolt",v:980},{n:"+ Dash Shadow",v:1200},{n:"+ Orb Turret",v:1445}],
        radar:{burst:50,sustain:80,aoe:65,control:100,survival:95},
        crystals:["Escape Death","Phase Shift","Frost Shield"],
        mathKey:"Cold Attack: 500 → 730 base. Blackhole freezes enemies = 0 incoming damage windows. Effective DPS formula: not just +46% dealt, but also (attacks avoided × avg incoming damage) added back as 'effective' gain. On Transcendence mode, this approach outperforms pure damage builds by survival alone." }
    ]
  },
  { id:"ragna", name:"Ragna the Bloodedge", tag:"MELEE / LIFESTEAL", tier:"B", color:"#D93025",
    img:"/chars/ragna.png",
    builds:[
      { id:"bloodletting", name:"BLOODLETTING", arch:"Risk-Reward / Sustain", rating:85,
        tactics:["Attack Cold (Ice)","Skill Burn (Fire)","Dash Thunderbolt (Light)","Legacy Shadow Spike (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Blood Kain activates at ~50% HP — this is Ragna's power state, not a weakness",
          "Cold Attack slows enemies = more Blood Scythe hits land = net positive HP differential per fight",
          "Skill Burn: 360 DoT/s stacks while Blood Scythe heals — damage continues during recovery frames",
          "Steam: 'I assume ~50% HP always: potentials award less healing at high HP, more at low HP — it balances'",
          "Lightning Orb runs autonomously during Blood Scythe long animation = no DPS lost while channeling"
        ],
        dps:[{n:"Base Attack",v:500},{n:"+ Cold (46%)",v:730},{n:"+ Burn DoT",v:1090},{n:"+ Blood Kain",v:1635},{n:"+ Orb Turret",v:1880}],
        radar:{burst:65,sustain:92,aoe:50,control:60,survival:78},
        crystals:["Blood Pact","Healing Elixir","Kill Streak"],
        mathKey:"Blood Kain multiplier at ~50% HP (est. ×1.5): 1090 × 1.5 = 1635. This is why Ragna exceeds his B-tier label when played correctly — the multiplier scales EVERYTHING, not just base hits. The HP-cost mechanics become self-funding once Cold slows enemies into predictable hit windows." },
      { id:"inferno", name:"INFERNO GOD", arch:"Max Burst / Glass", rating:78,
        tactics:["Attack Fire Spirit (Fire)","Skill Burn (Fire)","Dash Blade (Blade)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Full Fire tree enables Double Tactics: Fire Spirit Detonation = spirits explode on Burn enemies",
          "Fire Projectile focused: 280 × 10 = 2800 burst per skill cast when Focused Fire T2 narrows spread",
          "Fire Spirit: 190 per hit, spawns automatically, procs on every normal hit — passive DPS floor",
          "'All potentials enhancing Heavy Strike: wide AoE, breaks super armor, restores HP without HP cost'",
          "Ring of Fire at Legendary: 770 burst per Blood Scythe cast. Blood Scythe IS the legacy trigger"
        ],
        dps:[{n:"Base Attack",v:500},{n:"+ Fire Spirit",v:690},{n:"+ Burn DoT",v:1050},{n:"+ Blood Kain low HP",v:1575},{n:"+ Ring of Fire cycle",v:2345}],
        radar:{burst:95,sustain:55,aoe:75,control:30,survival:50},
        crystals:["Combo Counter","Kill Streak","SP Refuel"],
        mathKey:"Ring of Fire burst: 770 per use at ~1 cast per 3 sec = 257 burst DPS added. Fire Spirit: 190 × 3 avg spirits = 570 concurrent passive. Combined with Blood Kain at 50% HP multiplier: peak burst window reaches ~2345 estimated. Highest ceiling Ragna build — also highest floor." },
      { id:"immortal", name:"IMMORTAL BRAWLER", arch:"Tank / Beginner-Proof", rating:80,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Shadow (Umbra)","Legacy Thunderbolt (Light)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Steam: 'Get 3 dashes + Heavy Strike heal + Cold = you cannot die. Ragna for beginners'",
          "Cold Attack: 46% damage boost + slowed enemies = safe Blood Scythe setup windows",
          "Light Spear: 490 per skill hit — consistent boss damage with no HP cost whatsoever",
          "Heavy Strike heals on hit once upgraded — self-sustaining loop, no management required",
          "Ice Spike Respawn Double: permanent auto-turrets attack while you focus on movement"
        ],
        dps:[{n:"Base Attack",v:500},{n:"+ Cold (46%)",v:730},{n:"+ Light Spear",v:1220},{n:"+ Thunderbolt",v:1470},{n:"+ Ice Spike Turret",v:1670}],
        radar:{burst:55,sustain:72,aoe:60,control:88,survival:97},
        crystals:["Escape Death","Phase Shift","Healing Elixir"],
        mathKey:"Cold Attack: 500 → 730. Light Spear adds flat 490 per skill use — not competing with Attack slot. Heavy Strike heals per hit once upgraded: each of those 730-dmg normals also heals HP. Mathematically self-sustaining. Survivability index: effectively infinite on normal entropy." }
    ]
  },
  { id:"jin", name:"Jin Kisaragi", tag:"ICE / SWORD", tier:"S", color:"#4EA8D8",
    img:"/chars/jin.png",
    builds:[
      { id:"freeze_god", name:"FREEZE GOD", arch:"Control / Auto Mode", rating:98,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Ice Spike (Double)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Steam forums (2025): 'Jin + Ice = auto mode. Nothing moves and you shred them, bosses included'",
          "Attack Cold (46%) + Skill Cold (47%) = EVERY input gets ~46-47% boost simultaneously",
          "Frost Burst triggers at max Cold stacks: massive AoE clear, wide radius, no positioning needed",
          "Ice Spike Respawn Double = permanent turrets from one slot — setup once, runs all run",
          "Shadow Ice Spikes Double: every dash fires ice spikes — movement and offense become the same action"
        ],
        dps:[{n:"Base DPS",v:550},{n:"+ Cold Attack (46%)",v:803},{n:"+ Skill Cold (47%)",v:1180},{n:"+ Frost Burst AoE",v:1550},{n:"+ Ice Spike Turrets",v:1890}],
        radar:{burst:75,sustain:85,aoe:70,control:100,survival:90},
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
        mathKey:"Double Cold: 550 base → 803 normals (×1.46) → 1180 skills (×1.47). Enemy movement at max stacks ≈ 15% normal speed. Frost Burst AoE hits ALL slowed enemies simultaneously. Effective DPS multiplied not just by the % boosts — but by the additional hits landed while enemies can't dodge. True effective DPS: ~3.4× base." },
      { id:"lightning_parry", name:"LIGHTNING PARRY", arch:"Counter / Transcendence", rating:89,
        tactics:["Skill Light Spear (Light)","Attack Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Jin parry grants super armor + amplification — uninterruptible Light Spear = 490 unblockable dmg",
          "Chain Lightning bounces: 295 × 3 enemies = 885 per proc. At Jin's speed: ~1770 chain DPS alone",
          "Steam: 'Lightning > full Ice on Transcendence — don't need freeze when you can counter everything'",
          "Blackhole legacy creates setup window: everything frozen = clean parry on-demand vs bosses",
          "Full Light tree enables Lightning combo Doubles — Thunderbolt + Orb + Spear = triple slot synergy"
        ],
        dps:[{n:"Base Skills",v:550},{n:"+ Light Spear",v:1040},{n:"+ Chain Lightning",v:1925},{n:"+ Blackhole ctrl",v:2175},{n:"+ Orb Turret",v:2420}],
        radar:{burst:88,sustain:70,aoe:85,control:80,survival:75},
        crystals:["Combo Counter","Kill Streak","SP Refuel"],
        mathKey:"Chain Lightning at Legendary: 295 × 3 targets = 885 per proc. Jin attack speed ~2/sec = 1770 chain DPS alone. Light Spear adds 490 per skill use on different slot — no competition. Blackhole: 0 incoming damage windows during boss fights. Combined: 2420 estimated DPS with boss kill surety." },
      { id:"blizzard_storm", name:"BLIZZARD STORM", arch:"AoE / Stage Speed", rating:87,
        tactics:["Attack Cold (Ice)","Skill Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Hybrid: Ice slow + Fire Spirit AoE = room clears in <1 second at high rarity",
          "Fire Spirit auto-attacks ALL Cold-slowed enemies simultaneously — more targets = more spirit procs",
          "Frost Burst clears entire rooms on max-stack trigger: zero positioning required",
          "Steam: 'Endless Ice Spikes + Shadow Ice Spikes = ice spirit turret shooting spikes automatically'",
          "Best Jin build for stage completion speed — significantly reduces run time vs boss kill optimization"
        ],
        dps:[{n:"Base DPS",v:550},{n:"+ Cold (46%)",v:803},{n:"+ Fire Spirit ×3",v:1373},{n:"+ Frost Burst AoE",v:1773},{n:"+ Ice Spike ×4",v:2533}],
        radar:{burst:65,sustain:90,aoe:97,control:85,survival:80},
        crystals:["Crystal Resonance","Kill Streak","Frost Shield"],
        mathKey:"Fire Spirit on 3 slowed targets: 190 × 3 = 570 passive DPS. Frost Burst radius at max Ice stacks hits all simultaneously — estimated 400 AoE per trigger, once every ~4 sec = 100 sustained AoE DPS. Ice Spike turrets: 4 × ~120 = 480 turret DPS. Total: 2533 — with highest room-clear speed of any Jin build." }
    ]
  },
  { id:"kokonoe", name:"Kokonoe Mercury", tag:"ZONING / SCIENCE", tier:"A", color:"#E8714A",
    img:"/chars/kokonoe.png",
    builds:[
      { id:"aerial_bomber", name:"AERIAL BOMBER", arch:"Aerial DoT / Untouchable", rating:94,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Steam: 'Teleport, set traps, detonate, melt Susano'o while remaining airborne. Tons of fun AND works'",
          "Kokonoe special = teleport/dodge mid-air = never touched by ground-based attacks",
          "Skill Burn: 360 DoT/s on every skill. Kokonoe has near-zero skill cooldown gap",
          "Steam: 'Kokonoe DPS is higher than ALL other characters' — reaches entire screen easier than Hakumen",
          "Blackhole freezes all mid-air = Fire Spirits and Orb attack completely stationary targets"
        ],
        dps:[{n:"Base DPS aerial",v:600},{n:"+ Skill Burn 360/s",v:960},{n:"+ Fire Spirit",v:1150},{n:"+ Orb Turret",v:1395},{n:"+ Blackhole amp",v:1700}],
        radar:{burst:75,sustain:98,aoe:85,control:80,survival:85},
        crystals:["SP Refuel","Kill Streak","Crystal Resonance"],
        mathKey:"Skill Burn at 360 DoT/s: Kokonoe casts skills near-continuously = constant 360 DPS on every enemy hit, stacking. Fire Spirit: 190/hit × 3 concurrent spirits = 570 passive DPS alongside. Combined sustained damage: ~1700 DPS maintained indefinitely while airborne and functionally invincible." },
      { id:"missile_queen", name:"MISSILE QUEEN", arch:"Burst / Set-and-Forget", rating:90,
        tactics:["Skill Fire Projectile (Fire)","Attack Burn (Fire)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Fire Projectile: 10 × 280 = 2800 burst per skill cast when Focused Fire T2 narrows spread to single target",
          "Steam: 'Focus on missiles or lasers — both wreck entire screens. Satellite laser just tracks automatically'",
          "Attack Burn: 260 DoT/s passive on every target normals hit — zero-thought sustained DPS floor",
          "Light Spear: 490 per legacy hit — boss burst on a separate slot, never competes",
          "Community: 'Kokonoe satellite laser: set it and forget it — best set-and-forget in the game'"
        ],
        dps:[{n:"Base DPS",v:600},{n:"+ Fire Proj 10×280",v:2800},{n:"+ Burn DoT 260/s",v:3060},{n:"+ Light Spear",v:3550},{n:"+ Orb Turret",v:3795}],
        radar:{burst:95,sustain:80,aoe:92,control:55,survival:70},
        crystals:["Kill Streak","SP Refuel","Combo Counter"],
        mathKey:"Fire Projectile at Legendary with Focused Fire T2: all 10 projectiles in 45° cone on single boss = 10 × 280 = 2800 BURST per cast. Burn DoT: 260/s passive floor. At ~1 skill every 1.5 sec = 1867 burst DPS from projectiles alone. This is Kokonoe's highest raw damage ceiling." },
      { id:"dot_master", name:"DOT MASTER", arch:"Triple DoT Stack", rating:86,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Blade (Blade)","Legacy Ring of Fire (Fire)","Summon Fire Spirit (Fire)"],
        reasoning:[
          "Full Fire DoT: Skill Burn (360/s) + Attack Burn via Double (260/s) + Fire Spirit (190/hit) = 3 concurrent sources",
          "Catching Fire T2: for each burning enemy, next Burn deals +30% more damage — scales with pack size",
          "Fire Spirit Detonation Double: spirits explode when hitting Burned enemies = massive AoE chain reaction",
          "Ring of Fire at Legendary: 770 burst per legacy. Storm Ring of Fire Double = proc on every dodge",
          "Pure attrition engine — once 3 DoT sources running, even bosses melt as passive background damage"
        ],
        dps:[{n:"Base DPS",v:600},{n:"+ Skill Burn",v:960},{n:"+ Fire Spirit ×3",v:1530},{n:"+ Ring of Fire",v:2300},{n:"+ Catching Fire amp",v:2760}],
        radar:{burst:65,sustain:100,aoe:80,control:40,survival:72},
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
        mathKey:"Three simultaneous DoTs: 360 (Skill) + 260 (Attack) + 570 (Spirit ×3) = 1190 sustained DoT/s base. Catching Fire T2 at 5 burning enemies: × 1.3 = 1547 sustained DoT. That's DoT alone — before base attack damage. This build has the highest sustained DPS floor of all Kokonoe builds." }
    ]
  },
  { id:"es", name:"Es", tag:"CREST / SPATIAL", tier:"A", color:"#E878A0",
    img:"/chars/es.png",
    builds:[
      { id:"mine_bouncer", name:"MINE BOUNCER", arch:"Es-Exclusive / Highest Burst", rating:93,
        tactics:["Summon Mine (Fire)","Attack Cold (Ice)","Skill Burn (Fire)","Dash Shadow Spike (Umbra)","Legacy Thunderbolt (Light)"],
        reasoning:[
          "Steam: 'Es mines are REALLY overpowered — explode any enemies under you when going for bounces'",
          "Es aerial dive-combo: 3 bounces per string. Each bounce triggers mine detonation below",
          "Mine + Splashing Mine T2: 570 base + 6 shrapnel × 460 = 3330 total per detonation",
          "3 bounces × 3330 = 9990 burst from one aerial combo string — highest single-combo burst in game",
          "Cold Attack 46% boost on normals between bounces adds sustained damage on top of burst"
        ],
        dps:[{n:"Base Aerial",v:480},{n:"+ Mine per bounce",v:3810},{n:"× 3 bounces burst",v:9990},{n:"+ Cold (46%)",v:11187},{n:"+ Burn+Shadow",v:11660}],
        radar:{burst:100,sustain:60,aoe:95,control:70,survival:65},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Mine + Splashing Mine T2 per detonation: 570 + (6 × 460) = 3330. Es aerial: 3 bounces = 3 detonations = 9990 total in one combo string. This is the highest documented single-combo burst number in BBEE X, period. Cold Attack adds 46% to normals between bounces for sustained floor." },
      { id:"crest_field", name:"CREST FIELD", arch:"Trap / Consistent", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Crest (Ice)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Double Cold: Attack Cold (46%) + Skill Cold (47%) on every input — enemies frozen at max stacks",
          "Crests placed at chokepoints detonate when enemies approach — guaranteed hit, no timing required",
          "Frozen enemies hit by Crest: zero movement speed = every crest detonation confirms full damage",
          "Lightning Orb as autonomous turret: DPS maintained while managing crest placement strategy",
          "Consistent at every entropy level — doesn't rely on aerial timing mastery like Mine Bouncer"
        ],
        dps:[{n:"Base DPS",v:480},{n:"+ Cold Atk (46%)",v:701},{n:"+ Skill Cold (47%)",v:1030},{n:"+ Crest Burst",v:1480},{n:"+ Orb Turret",v:1725}],
        radar:{burst:80,sustain:75,aoe:80,control:95,survival:80},
        crystals:["Frost Shield","Phase Shift","Crystal Resonance"],
        mathKey:"Double Cold at Legendary: 480 → 701 normals, 47% on skills. Frozen enemies = 0 movement. Every placed crest confirms hit on approach. Orb turret: 245 DPS autonomous. Reliable 1725 sustained DPS with highest control rating of any Es build." },
      { id:"speed_crest", name:"SPEED CREST", arch:"Mobility + Explosion", rating:88,
        tactics:["Attack Cold (Ice)","Skill Fire Spirit (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Mine (Fire)"],
        reasoning:[
          "Taokaka Evotype on Es = extreme mobility to drop mines mid-movement while maintaining crest chains",
          "Ring of Fire: 770 burst on legacy while dashing into crest detonation sequences",
          "Fire Spirit procs on every Cold-slowed enemy dashed through — movement procs DPS",
          "Steam: 'Es + Taokaka Evotype = mobility into detonation loops' — recommended community Evotype",
          "Mine + Fire Spirit interaction: mine explosion triggers Spirit Detonation Double on burning enemies"
        ],
        dps:[{n:"Base DPS",v:480},{n:"+ Mine + Crest",v:1050},{n:"+ Cold (46%)",v:1533},{n:"+ Ring of Fire",v:2303},{n:"+ Fire Spirit",v:2493}],
        radar:{burst:88,sustain:70,aoe:90,control:65,survival:72},
        crystals:["Kill Streak","Combo Counter","Crystal Resonance"],
        mathKey:"Taokaka speed: 2+ mine placements per second possible during combat. Fire Spirit Detonation on Burning enemies: chain explosions from Mine DoT. Ring of Fire burst: 770 every ~8 sec = 96 DPS average. Total active build: ~2493 DPS with highest mobility of any Es build." }
    ]
  },
  { id:"noel", name:"Noel Vermillion", tag:"RAPID / DRIVE", tier:"A", color:"#60A5FA",
    img:"/chars/noel.png",
    builds:[
      { id:"bullet_storm", name:"BULLET STORM", arch:"Rapid Fire / DPS Machine", rating:91,
        tactics:["Attack Cold (Ice)","Skill Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Noel Drive: fastest attack speed in roster — more hits per second = more Cold procs per second",
          "Cold Attack (46%) on rapid normals: 46% on 5+ hits/sec = massive sustained DPS multiplier",
          "Chain Lightning: 295 per proc × Noel attack rate = effectively continuous chain lightning field",
          "Thunderbolt on each dash: Noel mobility-attacks are offense, each dash fires chain lightning",
          "Lightning Orb autonomous: 245 DPS with zero input while Noel fires continuously"
        ],
        dps:[{n:"Base DPS",v:580},{n:"+ Cold (46%)",v:847},{n:"+ Chain Lightning",v:1732},{n:"+ Thunderbolt dash",v:2057},{n:"+ Orb Turret",v:2302}],
        radar:{burst:70,sustain:100,aoe:80,control:65,survival:72},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Noel has highest attack rate of all characters — ~5 hits/sec base. Cold Attack at 46%: 580 → 847 per sec. Chain Lightning at 295/proc × 5 hits/sec = 1475 chain DPS alone. That's before base attack. Combined: 2302 sustained DPS with zero ceiling on attack speed scaling." },
      { id:"artillery_queen", name:"ARTILLERY QUEEN", arch:"Zoner / Mid-Range", rating:85,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Noel Drive: optimal spacing at mid-range where all projectile skills hit max hitboxes",
          "Skill Burn: 360/s DoT stacks with every Drive B skill cast — Noel casts 2-3 skills per combo",
          "Fire Spirit tracks targets automatically — pairs with Noel's aggressive forward pressure",
          "Ring of Fire: 770 burst on legacy. Noel mobility options allow safe legacy windows on bosses",
          "Shadow Spike: 275 proc on every normal — Drive A normals become burst damage tools"
        ],
        dps:[{n:"Base DPS",v:580},{n:"+ Burn DoT",v:940},{n:"+ Fire Spirit",v:1510},{n:"+ Shadow Spike",v:1785},{n:"+ Ring of Fire cycle",v:2130}],
        radar:{burst:80,sustain:88,aoe:72,control:55,survival:68},
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
        mathKey:"Drive B skills spam at 360 DoT/s each stack. Fire Spirit on 3 targets: 190×3 = 570 passive. Shadow Spike 275 per Drive A hit × 3/sec = 825 shadow DPS. Ring burst: 770 ÷ 8 sec = 96 avg. Combined: ~2130 DPS with Noel's highest sustained boss damage." },
      { id:"frost_dancer", name:"FROST DANCER", arch:"Mobility / Untouchable", rating:82,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow (Umbra)","Legacy Blackhole (Umbra)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Double Cold on Noel's attack rate: max cold stacks reached in ~2 sec vs 5+ sec on other characters",
          "Dash Shadow: dodge becomes invisible burst — Noel 3-dash kit means triple invisible procs",
          "Blackhole legacy: Noel repositions mid-cast — full-screen slow while staying mobile",
          "Ice Spike Respawn turrets: auto-fire from multiple angles, no upkeep while Noel kites",
          "Frost Burst auto-clears rooms from rapid Cold stack accumulation — no stopping to cast AoE"
        ],
        dps:[{n:"Base DPS",v:580},{n:"+ Cold Atk (46%)",v:847},{n:"+ Skill Cold (47%)",v:1245},{n:"+ Blackhole ctrl",v:1495},{n:"+ Ice Spike Turrets",v:1745}],
        radar:{burst:55,sustain:80,aoe:75,control:95,survival:90},
        crystals:["Frost Shield","Phase Shift","Escape Death"],
        mathKey:"Noel stacks Cold faster than any character — 5 hits/sec means max stacks in ~2 sec always. Double Cold: 580 → 847 normals, 1245 skills. Blackhole: zero incoming damage window every ~12 sec. Effective survivability: 95 — highest of all Noel builds by far." }
    ]
  },
  { id:"rachel", name:"Rachel Alucard", tag:"ZONING / WIND", tier:"A", color:"#D8B4FE",
    img:"/chars/rachel.png",
    builds:[
      { id:"bat_swarm", name:"BAT SWARM", arch:"Legacy Spam / Passive DPS", rating:88,
        tactics:["Attack Chain Lightning (Light)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Chain Lightning (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Steam (2025): 'Rachel bats trigger Attack Lightning even as Legacy = non-stop chain lightning, zero player input'",
          "Bats as legacy: fire continuously without consuming skill slot — Chain Lightning procs on every bat hit",
          "Chain Lightning at 295 × 3 enemies: Rachel's multi-bat spread means simultaneous multi-target procs",
          "Light Spear: 490 per active skill — stacks on top of passive bat lightning chain",
          "Thunderbolt on dash: Rachel wind-dash becomes offense, chains into bat spread"
        ],
        dps:[{n:"Base Bat DPS",v:520},{n:"+ Chain Lightning",v:1405},{n:"+ Light Spear skills",v:1895},{n:"+ Thunderbolt dash",v:2195},{n:"+ Orb Turret",v:2440}],
        radar:{burst:78,sustain:95,aoe:88,control:75,survival:70},
        crystals:["Crystal Resonance","Kill Streak","SP Refuel"],
        mathKey:"Bats as legacy: continuous proc stream. Chain Lightning × 3 targets per bat hit = 295 × 3 = 885 per bat-hit proc. Rachel fires ~2 bats/sec = 1770 chain DPS from legacy alone — zero active input. Light Spear adds 490 per skill on top. Combined: ~2440 DPS while effectively afk." },
      { id:"wind_barrier", name:"WIND BARRIER", arch:"Trap / Control Field", rating:84,
        tactics:["Attack Cold (Ice)","Skill Frost Burst (Ice)","Dash Shadow Spike (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Rachel wind pushes enemies INTO Cold stacks faster — forced repositioning accelerates max-stack timing",
          "Frost Burst on max Cold: Rachel's wind clusters enemies = AoE burst hits clustered group simultaneously",
          "Blackhole + wind: double-layer CC — pull into Blackhole while wind pin + Cold slow active",
          "Shadow Spike: 275 per normal on a character that normals from safe range = sustained shadow DPS",
          "Lightning Orb field: Rachel places it at chokepoint, wind herds enemies through the turret"
        ],
        dps:[{n:"Base DPS",v:520},{n:"+ Cold (46%)",v:759},{n:"+ Frost Burst AoE",v:1209},{n:"+ Shadow Spike",v:1484},{n:"+ Orb Turret",v:1730}],
        radar:{burst:72,sustain:78,aoe:95,control:98,survival:75},
        crystals:["Frost Shield","Phase Shift","Crystal Resonance"],
        mathKey:"Wind mechanic clusters enemies: Frost Burst hits 5+ enemies clustered = 520 × 5 in burst window. Blackhole + Cold: functional 0-movement for 4-6 sec. Highest control rating of any Rachel build at 98 — functionally reduces all incoming damage to near-zero during windows." },
      { id:"pumpkin_artillery", name:"PUMPKIN ARTILLERY", arch:"Long Range / Screen Control", rating:80,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Pumpkin bomb travels full screen — Skill Burn at 360/s stacks remotely on enemies across the stage",
          "Fire Spirit attacks whatever Rachel's pumpkin last hit — remote DoT application",
          "Ring of Fire: 770 burst on legacy. Rachel can trigger from full-screen safe distance",
          "Thunderbolt dash: Rachel wind-dash fires chain to nearest enemy = free DPS on repositions",
          "Orb turret covers Rachel's melee blind spot — pumpkin player never needs to close distance"
        ],
        dps:[{n:"Base DPS",v:520},{n:"+ Burn DoT",v:880},{n:"+ Fire Spirit",v:1450},{n:"+ Ring of Fire cycle",v:2220},{n:"+ Thunderbolt dash",v:2470}],
        radar:{burst:82,sustain:75,aoe:80,control:70,survival:80},
        crystals:["Kill Streak","SP Refuel","Combo Counter"],
        mathKey:"Pumpkin range = full screen. Burn at 360/s: applied across stage with zero risk. Fire Spirit 190 × 3 = 570 remote passive. Ring of Fire 770 per legacy from safe range. Combined: 2470 DPS while maintaining maximum distance from all enemies." }
    ]
  },
  { id:"taokaka", name:"Taokaka", tag:"RUSH / BEAST", tier:"B", color:"#FCD34D",
    img:"/chars/taokaka.png",
    builds:[
      { id:"claw_blitz", name:"CLAW BLITZ", arch:"Hyper-Aggression / Speed", rating:86,
        tactics:["Attack Shadow Spike (Umbra)","Skill Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Taokaka: fastest movement speed and highest dash count — more dashes = more Thunderbolt procs",
          "Shadow Spike: 275 per normal. Taokaka's claw combos hit 4-6 times per string = 1100-1650 shadow burst",
          "Chain Lightning: bounce clears groups Taokaka dashes through — movement is AoE clearing",
          "Blackhole: stops multi-enemy groups Taokaka kites into. Best used on group before full claw string",
          "Steam: 'Taokaka Evotype is standard on Es for speed — on Taokaka herself it enables mine-speed'",
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Shadow Spike",v:835},{n:"+ Chain Lightning",v:1720},{n:"+ Thunderbolt × dashes",v:2170},{n:"+ Blackhole ctrl",v:2420}],
        radar:{burst:82,sustain:75,aoe:90,control:70,survival:72},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Taokaka 4-hit claw string: Shadow Spike × 4 = 275 × 4 = 1100 shadow burst per combo. At ~2 combos/sec = 2200 shadow DPS alone. Thunderbolt on fastest dash count in game: ~4 dashes/sec = 325 × 4 = 1300 Thunderbolt DPS. Combined peak: ~2420 with zero setup requirement." },
      { id:"speed_demon", name:"SPEED DEMON", arch:"Hit-and-Run / Entropy Rush", rating:82,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold Attack: 46% on Taokaka's high-frequency hits. Stacks Cold in 1-2 sec vs slower characters' 5+ sec",
          "Light Spear: 490 per skill hit — Taokaka jump-cancel skills keep this proccing on repositions",
          "Ring of Fire: 770 burst on legacy. Taokaka's speed means legacy windows are safe vs any boss",
          "Thunderbolt: each of Taokaka's 4+ dashes fires chain to nearest enemy = passive 1300 chain DPS",
          "Lightning Orb: place, dash past enemies, let turret hit from behind while Taokaka attacks front"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Cold (46%)",v:818},{n:"+ Light Spear",v:1308},{n:"+ Thunderbolt dashes",v:1958},{n:"+ Orb Turret",v:2208}],
        radar:{burst:75,sustain:82,aoe:70,control:72,survival:78},
        crystals:["Phase Shift","Kill Streak","Crystal Resonance"],
        mathKey:"Cold stacks in 1-2 sec on Taokaka: 560 → 818. Thunderbolt on 4 dashes/sec: 325 × 4 = 1300 chain DPS. Light Spear 490 per skill, ~1 per 2 sec = 245 avg. Combined: 2208 DPS with run-speed stage clear significantly faster than other B-tier builds." },
      { id:"ambush_cat", name:"AMBUSH CAT", arch:"Surprise Burst / Flanker", rating:78,
        tactics:["Attack Cold (Ice)","Skill Burn (Fire)","Dash Shadow Spike (Umbra)","Legacy Blackhole (Umbra)","Summon Fire Spirit (Fire)"],
        reasoning:[
          "Dash Shadow Spike: Taokaka's dash IS a claw attack — every single dash procs 275 shadow damage",
          "Combined: 4 dashes/sec × 275 = 1100 shadow DPS just from moving",
          "Burn: 260 DoT/s on everything Taokaka's normals touch — always active given aggression playstyle",
          "Blackhole: forces all enemies into Taokaka's claw range — no chasing required",
          "Fire Spirit: auto-attacks, follows Taokaka's movement — forward pressure DPS with zero slot attention"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Cold (46%)",v:818},{n:"+ Dash Shadow ×4",v:1918},{n:"+ Burn DoT",v:2178},{n:"+ Fire Spirit",v:2368}],
        radar:{burst:88,sustain:68,aoe:65,control:80,survival:65},
        crystals:["Combo Counter","Kill Streak","Blood Pact"],
        mathKey:"Dash Shadow on Taokaka: 4 dashes/sec × 275 = 1100 shadow DPS from movement alone. Cold Attack: 560 → 818 normals. Burn DoT: 260 passive floor. Fire Spirit: 190/hit × 2 spirits = 380 passive. Peak burst from full claw string + 4 dashes: ~2368 DPS. Unique to Taokaka — no other character generates this much DPS from dashes." }
    ]
  },
  { id:"lambda", name:"Lambda-11", tag:"BLADE / SWORDS", tier:"A", color:"#6EE7B7",
    img:"/chars/lambda.png",
    builds:[
      { id:"sword_rain", name:"SWORD RAIN", arch:"Multi-Hit / Turret Hybrid", rating:89,
        tactics:["Skill Light Spear (Light)","Attack Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Lambda sword specials: multi-hit by nature — each sword counts as separate hit for Chain Lightning procs",
          "Full Light tree: Chain Lightning + Thunderbolt + Orb + Spear = 4-slot synergy, rare in any character",
          "Light Spear on both skill and legacy slots: 490 × 2 sources = 980 flat damage per combo rotation",
          "Chain Lightning 295 × 3: Lambda sword spread = bounce to 3 targets guaranteed, every cast",
          "Steam: 'Lambda sword turrets: just place and they attack — entire screen from one summon'"
        ],
        dps:[{n:"Base DPS",v:570},{n:"+ Light Spear ×2",v:1550},{n:"+ Chain Lightning",v:2435},{n:"+ Thunderbolt",v:2760},{n:"+ Orb Turret",v:3005}],
        radar:{burst:88,sustain:82,aoe:90,control:60,survival:72},
        crystals:["Kill Streak","SP Refuel","Crystal Resonance"],
        mathKey:"Two Light Spear sources (Skill + Legacy): 490 × 2 = 980 flat per rotation. Chain Lightning 295 × 3: Lambda multi-sword = all 3 bounces guaranteed. At Lambda's skill rate: ~1560 chain DPS. Thunderbolt per dash: 325. Orb: 245. Total: ~3005 DPS — highest ceiling of all Lambda builds." },
      { id:"cold_blades", name:"COLD BLADES", arch:"Freeze / Control", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Double Cold: Lambda swords count as attacks — each sword hit procs Cold, double-stacking fast",
          "Frost Burst: Lambda's sword spread means AoE hits the entire enemy group simultaneously",
          "Shadow Spike: 275 per sword hit — multi-sword combos mean 3-4 Shadow Spike procs per animation",
          "Ice Spike Respawn turrets: self-maintaining turret field that combines with Lambda's own sword field",
          "Frozen enemies with sword turrets active: entire screen of auto-damage from turrets and swords"
        ],
        dps:[{n:"Base DPS",v:570},{n:"+ Cold Attack (46%)",v:833},{n:"+ Skill Cold (47%)",v:1225},{n:"+ Shadow Spike",v:1775},{n:"+ Ice Spikes + Frost",v:2095}],
        radar:{burst:70,sustain:88,aoe:88,control:95,survival:85},
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
        mathKey:"Lambda multi-sword = 3 hits per cast = 3 Cold procs per cast. Max stacks in ~2 sec. Double Cold: 570 → 833 → 1225. Shadow Spike × 3 swords = 825 per skill cast. Frost Burst when stacked clears entire room. Control rating: 95 — enemies functionally unable to act." },
      { id:"umbra_blades", name:"UMBRA BLADES", arch:"Shadow Burst", rating:82,
        tactics:["Attack Shadow Spike (Umbra)","Skill Light Spear (Light)","Dash Shadow (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Shadow Spike × multi-hit swords: 275 × 3 sword hits = 825 shadow per cast, constant",
          "Blackhole legacy: Lambda places sword turrets inside Blackhole radius = auto-hit on everything pulled in",
          "Light Spear: 490 per skill — each Lambda skill cast is both swords AND spear, compounding",
          "Dash Shadow: every lambda reposition procs 275 shadow independently of sword hits",
          "Steam: 'Lambda sword summons are honestly free DPS — set them and they keep firing forever'"
        ],
        dps:[{n:"Base DPS",v:570},{n:"+ Shadow Spike ×3",v:1395},{n:"+ Light Spear",v:1885},{n:"+ Blackhole pull",v:2135},{n:"+ Orb Turret",v:2380}],
        radar:{burst:90,sustain:72,aoe:80,control:85,survival:70},
        crystals:["Kill Streak","Combo Counter","Blood Pact"],
        mathKey:"Shadow Spike × Lambda 3-sword: 275 × 3 = 825 per cast. At 1.5 casts/sec = 1238 shadow DPS. Light Spear 490 per skill separately. Blackhole draws enemies into active sword field — all sword turrets confirm hits. Combined: 2380 DPS with highest boss burst pressure of any Lambda build." }
    ]
  },
  { id:"mai", name:"Mai Natsume", tag:"SPEAR / NEEDLE", tier:"A", color:"#FB923C",
    img:"/chars/mai.png",
    builds:[
      { id:"needle_storm", name:"NEEDLE STORM", arch:"Projectile / Long Range", rating:87,
        tactics:["Skill Fire Projectile (Fire)","Attack Burn (Fire)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Mai's spear throw: highest range in game, hits entire screen. Fire Projectile stacks on ALL spear hits",
          "Focused Fire T2: 10 projectiles in 45° cone all hit single target at close range = 2800 burst per throw",
          "Burn DoT: 260/s on every target thrown spear hits — Mai throws constantly, stacks everywhere",
          "Light Spear: 490 per active skill — Mai jump-cancel skills keep this active at all times",
          "Thunderbolt on dash: spear player repositions constantly — every movement fires chain lightning"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Fire Proj 10×280",v:2800},{n:"+ Burn DoT",v:3060},{n:"+ Light Spear",v:3550},{n:"+ Thunderbolt dash",v:3875}],
        radar:{burst:96,sustain:82,aoe:90,control:55,survival:70},
        crystals:["Kill Streak","SP Refuel","Combo Counter"],
        mathKey:"Mai spear: full-screen reach. Focused Fire T2 at close range: 10 × 280 = 2800 burst per skill cast. At 1 throw/1.5 sec = 1867 burst DPS. Burn 260/s passive on everything hit. Light Spear adds 490 per skill on same cast = triple damage per throw at close range. Peak: 3875 DPS." },
      { id:"frost_spear", name:"FROST SPEAR", arch:"Slow + Burst Combo", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Mai spear hits from full screen — Cold Attack procs on every hit, building stacks across the room",
          "Double Cold: 46%+47% on all spear throws regardless of range — unmatched safe damage boosting",
          "Frost Burst: when enemy has max stacks, Mai's spear from across stage triggers AoE burst safely",
          "Shadow Spike: 275 per spear hit — each throw procs shadow damage on every hit",
          "Ice Spike turrets: Mai never needs to close distance — turrets defend close range while she throws"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Cold Atk (46%)",v:818},{n:"+ Skill Cold (47%)",v:1202},{n:"+ Shadow Spike",v:1477},{n:"+ Frost Burst AoE",v:1827}],
        radar:{burst:75,sustain:88,aoe:85,control:92,survival:88},
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
        mathKey:"Full-screen Cold application: stacks from range = safest Cold build. Double Cold: 560 → 818 → 1202. Shadow Spike per throw: 275 independent DPS. Frost Burst AoE at max stacks: hits entire room from safe throw range. Highest survivability Mai build at 88." },
      { id:"chain_spear", name:"CHAIN SPEAR", arch:"Multi-Hit Chain", rating:81,
        tactics:["Skill Chain Lightning (Light)","Attack Cold (Ice)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Chain Lightning: Mai spear hits multiple enemies = guaranteed bounce to 3 targets every throw",
          "295 × 3 enemies × Mai's throw rate = near-constant full-room chain lightning clearing",
          "Cold: 46% on spear hits + chain lightning area slowing = enemies don't reach Mai",
          "Blackhole: Mai throws spear INTO Blackhole center — chain lightning jumps to all pulled enemies",
          "Lightning Orb at midfield: covers mid-range gap between full-screen spear range and melee"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Chain Lightning",v:1445},{n:"+ Cold (46%)",v:1710},{n:"+ Thunderbolt",v:2035},{n:"+ Orb Turret",v:2280}],
        radar:{burst:72,sustain:88,aoe:92,control:80,survival:82},
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
        mathKey:"Chain Lightning from spear: 295 × 3 = 885 per throw. At 1.5 throws/sec = 1328 chain DPS from range. Cold adds 46% to spear base. Blackhole concentrates enemies into spear kill zone — all chain lightning bounces guaranteed. Combined: 2280 DPS with full-screen coverage." }
    ]
  },
  { id:"hazama", name:"Hazama", tag:"CHAIN / COUNTER", tier:"B", color:"#86EFAC",
    img:"/chars/hazama.png",
    builds:[
      { id:"chain_venom", name:"CHAIN VENOM", arch:"Whip / Zoning", rating:83,
        tactics:["Attack Shadow Spike (Umbra)","Skill Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Hazama chain: hits from mid-range repeatedly. Shadow Spike 275 per chain hit = 275 × chain multihit",
          "Chain Lightning: Hazama's chain spread to multiple enemies = guaranteed 3-target bounce every cast",
          "Blackhole synergy: Hazama Ouroboros (chain) can reposition INTO Blackhole center for whip-trap combos",
          "Thunderbolt: Hazama's counter-dash fires chain lightning — counter-attack becomes full offense",
          "Steam: 'Hazama counter + Ouroboros chain = hit confirm into full combo, high ceiling skill builds'"
        ],
        dps:[{n:"Base DPS",v:530},{n:"+ Shadow Spike chain",v:805},{n:"+ Chain Lightning",v:1690},{n:"+ Thunderbolt",v:2015},{n:"+ Orb Turret",v:2260}],
        radar:{burst:78,sustain:78,aoe:82,control:78,survival:68},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Hazama chain hits 2-3× per animation: Shadow Spike × 3 = 825 per chain use. Chain Lightning: 295 × 3 targets guaranteed via chain spread = 885 per proc. Thunderbolt on counter-dash: 325. Combined: 2260 DPS with skill-ceiling reward for Ouroboros users." },
      { id:"snake_burn", name:"SNAKE BURN", arch:"DoT / Attrition", rating:78,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Skill Burn: 360/s on every Hazama skill. Ouroboros skill-chain = DoT stacks mid-whip animation",
          "Fire Spirit: auto-attacks everything Hazama's chain tagged — remote DoT application post-hit",
          "Ring of Fire: Hazama's Ouroboros pull draws enemies into Ring of Fire 770 burst radius",
          "Shadow Spike on dash: Hazama counter-dash 275 proc on every repositioning movement",
          "Lightning Orb at center: Hazama's chain traps enemies at mid-range near turret field"
        ],
        dps:[{n:"Base DPS",v:530},{n:"+ Burn DoT",v:890},{n:"+ Fire Spirit",v:1460},{n:"+ Shadow Spike dash",v:1735},{n:"+ Ring of Fire",v:2080}],
        radar:{burst:72,sustain:88,aoe:75,control:70,survival:65},
        crystals:["Kill Streak","Crystal Resonance","Blood Pact"],
        mathKey:"Burn at 360/s: Hazama's chain combos stack DoT remotely. Fire Spirit 190 × 3 = 570 passive following chain targets. Ring of Fire: Ouroboros pull sets up 770 burst on every boss. Combined: 2080 sustained DPS with Hazama's highest DoT uptime." },
      { id:"counter_god", name:"COUNTER GOD", arch:"Parry / Punish", rating:80,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Hazama counter is core mechanic: Thunderbolt on counter-dash = parry fires chain lightning",
          "Each successful counter: full Lightning chain + Cold stacking from the counter-attack follow-up",
          "Light Spear: 490 per skill after parry window — uninterruptible punish combo",
          "Blackhole on legacy: Hazama draws enemy in post-counter for extended punish window",
          "Cold Attack: 46% on all counter follow-up attacks — every parry becomes a 1.46× damage window"
        ],
        dps:[{n:"Base DPS",v:530},{n:"+ Cold (46%)",v:774},{n:"+ Light Spear",v:1264},{n:"+ Thunderbolt counter",v:1589},{n:"+ Blackhole ctrl",v:1839}],
        radar:{burst:85,sustain:65,aoe:62,control:85,survival:80},
        crystals:["Phase Shift","Combo Counter","Escape Death"],
        mathKey:"Hazama counter procs Thunderbolt: 325 per counter-dodge. Cold on all follow-up attacks: 46% multiplier post-parry. Light Spear 490 per skill = fully uninterruptible after successful parry. Best vs boss fights: 80 survival rating via counter windows negating most boss attacks." }
    ]
  },
  { id:"hakumen", name:"Hakumen", tag:"VOID / COUNTER", tier:"S", color:"#F1F5F9",
    img:"/chars/hakumen.png",
    builds:[
      { id:"void_counter", name:"VOID COUNTER", arch:"Counter God / Absolute", rating:96,
        tactics:["Skill Light Spear (Light)","Attack Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Steam: 'Hakumen charged Up+Skill nearly one-shots bosses with Light Spear. Universal boss damage'",
          "Hakumen counter magatama: every parry generates magatama, powering charged skill = free Light Spear",
          "Chain Lightning: Hakumen's slow attack speed is offset — each hit procs massive 295×3 = 885 chain",
          "Blackhole + Hakumen: full screen slow → charged counter = guaranteed hit, cannot miss",
          "Steam: 'Hakumen becomes an unkillable murder machine the moment you figure out counter timing'"
        ],
        dps:[{n:"Base DPS",v:550},{n:"+ Light Spear charge",v:1490},{n:"+ Chain Lightning",v:2375},{n:"+ Thunderbolt parry",v:2700},{n:"+ Orb Turret",v:2945}],
        radar:{burst:98,sustain:72,aoe:80,control:92,survival:90},
        crystals:["Combo Counter","Kill Streak","Phase Shift"],
        mathKey:"Hakumen charged Up+Skill at Legendary Light Spear: 490 flat added to charged skill = near-one-shot on most bosses. Chain Lightning × 3: 885 per hit. Hakumen's slow speed means each hit is calculated — 2-3 hits land before boss recovery = 2660 burst per engagement. Magatama economy: effectively free charged skills every 3-4 parries." },
      { id:"magatama_field", name:"MAGATAMA FIELD", arch:"Attrition / Unstoppable", rating:88,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Double Cold: Hakumen's heavy hits stack Cold in 2-3 hits despite slower rate — per-hit Cold value maxes",
          "Frost Burst: Hakumen's tank build — AoE burst on demand from Cold stacks, no positioning",
          "Shadow Spike on dash counter: 275 on Hakumen's counter-dash = Shadow Spike + parry damage",
          "Lightning Orb: 245 DPS turret autonomously maintains damage during Hakumen's long attack animations",
          "Hakumen naturally survives everything — Cold+Orb means DPS runs even during recovery frames"
        ],
        dps:[{n:"Base DPS",v:550},{n:"+ Cold Atk (46%)",v:803},{n:"+ Skill Cold (47%)",v:1181},{n:"+ Frost Burst",v:1681},{n:"+ Shadow Spike + Orb",v:2201}],
        radar:{burst:70,sustain:92,aoe:88,control:96,survival:95},
        crystals:["Frost Shield","Escape Death","Crystal Resonance"],
        mathKey:"Hakumen's heavy hits: even at 1.5 hits/sec, Cold stacks within 3 sec from high per-hit value. Double Cold: 550 → 803 → 1181. Frost Burst: 520 AoE. Orb: 245 autonomous. Shadow Spike on counter-dash: 275 per parry. Total: 2201 DPS with Hakumen's highest survival rating of 95." },
      { id:"infinity_sword", name:"INFINITY SWORD", arch:"Burst / One-Shot Window", rating:84,
        tactics:["Skill Light Spear (Light)","Attack Shadow Spike (Umbra)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Hakumen One-Eyed King magatama charge: full bar = fully invincible for 3 sec + multiplied skill",
          "Light Spear on charged skill during invincible frame = 490 uncontested flat damage",
          "Shadow Spike on every Hakumen normal: 275 per hit × slow-but-heavy normal = sustained shadow floor",
          "Ring of Fire: Hakumen's One-Eyed King becomes Ring trigger — 770 burst guaranteed every cast",
          "Steam: 'Hakumen is pure power fantasy when built correctly — one charged skill does boss phase skip'"
        ],
        dps:[{n:"Base DPS",v:550},{n:"+ Shadow Spike",v:825},{n:"+ Light Spear charge",v:1765},{n:"+ Thunderbolt",v:2090},{n:"+ Ring of Fire",v:2480}],
        radar:{burst:100,sustain:60,aoe:70,control:78,survival:82},
        crystals:["Kill Streak","Combo Counter","Blood Pact"],
        mathKey:"One-Eyed King full bar: 3 sec invincibility + skill multiplier. Light Spear during invincible window: 490 fully uncontested per cast. Ring of Fire trigger per OEK: 770 burst. Combined burst window: 490 + 770 = 1260 guaranteed burst per OEK activation (approx every 8 sec). Burst rating: 100 — no other build has this ceiling." }
    ]
  },
  { id:"bullet", name:"Bullet", tag:"SHELL / CQC", tier:"B", color:"#F97316",
    img:"/chars/bullet.png",
    builds:[
      { id:"heat_seeker", name:"HEAT SEEKER", arch:"Close Range / Overwhelm", rating:82,
        tactics:["Attack Fire Spirit (Fire)","Skill Burn (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Bullet CQC: melee-range grappler — Fire Spirit matches exactly, auto-attacks in melee hitbox range",
          "Skill Burn: 360/s on every grab-skill. Bullet grabs count as skills = constant DoT stack",
          "Thunderbolt: Bullet's dash-forward IS an attack setup — every approach fires chain lightning",
          "Ring of Fire: 770 burst per legacy. Bullet's heat gauge charges legacy faster = more Ring procs",
          "Steam: 'Bullet works best when built aggression — heat gauge + DoT = she never stops dealing damage'"
        ],
        dps:[{n:"Base DPS",v:540},{n:"+ Burn DoT",v:900},{n:"+ Fire Spirit",v:1470},{n:"+ Thunderbolt dash",v:1795},{n:"+ Ring of Fire",v:2305}],
        radar:{burst:82,sustain:85,aoe:68,control:60,survival:68},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Skill Burn at 360/s: grab-skills stack DoT same as any skill. Fire Spirit: 190 × 3 in melee range = 570. Thunderbolt on approach dash: 325 per engage. Ring of Fire: 770 per heat legacy. Combined: 2305 DPS with Bullet's highest burst ceiling and aggressive uptime." },
      { id:"steel_shell", name:"STEEL SHELL", arch:"Sustain / Counter-Damage", rating:79,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Shadow Spike (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold Attack: 46% on Bullet's heavy normals. Slow + heavy = safe CQC extension windows",
          "Light Spear: 490 per skill. Bullet's grab-skills are unblockable — Light Spear during grab = confirmed",
          "Shadow Spike on dash: 275 per closing dash — Bullet's approach is always offensively valued",
          "Blackhole: Bullet draws all enemies into CQC range — Blackhole IS Bullet's ideal state",
          "Lightning Orb: covers Bullet's only weakness (full-screen ranged) — turret handles what Bullet can't"
        ],
        dps:[{n:"Base DPS",v:540},{n:"+ Cold (46%)",v:788},{n:"+ Light Spear grab",v:1278},{n:"+ Shadow Spike",v:1553},{n:"+ Orb Turret",v:1798}],
        radar:{burst:72,sustain:80,aoe:60,control:82,survival:78},
        crystals:["Phase Shift","Escape Death","Frost Shield"],
        mathKey:"Light Spear on grab (unblockable): 490 confirmed per grab skill. Cold: 46% on all normals between grabs. Shadow Spike: 275 per approach dash. Orb turret covers full-screen gap. Combined: 1798 DPS — lower ceiling than Heat Seeker but 78 survival vs 68, better for high-entropy runs." },
      { id:"demolition_round", name:"DEMOLITION ROUND", arch:"Burst Damage / All-In", rating:76,
        tactics:["Attack Shadow Spike (Umbra)","Skill Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Shadow Spike: 275 per Bullet normal. Bullet's combo strings hit 3-4 times = 825-1100 shadow per combo",
          "Chain Lightning from Bullet's CQC position: guaranteed 3-target bounce at melee range every time",
          "Light Spear on legacy: 490 burst during Bullet's invincible super = fully uncontested hit",
          "Thunderbolt: approach dash fires lightning — every single engagement opens with chain lightning",
          "Highest raw burst combo of any Bullet build — but fragile, requires good heat management"
        ],
        dps:[{n:"Base DPS",v:540},{n:"+ Shadow Spike ×4",v:1640},{n:"+ Chain Lightning",v:2525},{n:"+ Thunderbolt",v:2850},{n:"+ Light Spear legacy",v:3015}],
        radar:{burst:95,sustain:55,aoe:75,control:65,survival:60},
        crystals:["Kill Streak","Combo Counter","Blood Pact"],
        mathKey:"Shadow Spike × 4-hit combo: 275 × 4 = 1100 shadow burst per string. At 2 combos/sec = 2200 shadow DPS. Chain Lightning 295 × 3 at melee range = 885 per proc. Light Spear legacy: 490 uncontested. Peak burst window: ~3015 DPS — Bullet's highest ceiling, lowest floor." }
    ]
  },
  { id:"naoto", name:"Naoto Kurogane", tag:"BLOOD / HUNTER", tier:"S", color:"#F87171",
    img:"/chars/naoto.png",
    builds:[
      { id:"hunters_eye", name:"HUNTER'S EYE", arch:"Execute / Life Force", rating:93,
        tactics:["Attack Shadow Spike (Umbra)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Naoto X-exclusive: Hunter's Eye mechanic — sees enemy life force values, amplified at low enemy HP",
          "Shadow Spike: 275 per normal. Naoto's rapid sword normals = near-continuous shadow procs",
          "Light Spear: 490 per skill. Naoto's skill kit is fast-cast — Light Spear fires at high rate",
          "Blackhole: Naoto Restriction Drive traps enemy — Blackhole compounds existing lockdown",
          "Hunter's Eye passive: confirmed damage multiplier on weakened enemies — finish builds shine here"
        ],
        dps:[{n:"Base DPS",v:580},{n:"+ Shadow Spike",v:855},{n:"+ Light Spear",v:1345},{n:"+ Thunderbolt",v:1670},{n:"+ Hunter's Eye amp",v:2195}],
        radar:{burst:88,sustain:78,aoe:70,control:85,survival:78},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Hunter's Eye damage amp on sub-50% HP enemies (est ×1.3): 1670 → 2170 in execute window. Shadow Spike at Naoto's attack rate: ~3/sec × 275 = 825 shadow DPS. Light Spear: 490 per fast-cast skill. Combined: 2195 DPS with multiplier peak at boss phase transitions." },
      { id:"blood_restriction", name:"BLOOD RESTRICTION", arch:"Lockdown / Drain", rating:89,
        tactics:["Attack Cold (Ice)","Skill Burn (Fire)","Dash Chain Lightning (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold: 46% on Naoto's fast normals. Stacks fast from high attack rate — max stacks in ~2 sec",
          "Burn: 260/s DoT stacks on every hit + Restriction Drive skill = DoT everywhere, fast",
          "Chain Lightning on dash: Naoto's mobility is high — each reposition fires chain to 3 enemies",
          "Blackhole + Restriction Drive: double-lock — Naoto's own Drive + Blackhole = full stun loop",
          "Steam: 'Naoto Restriction builds are oppressive — enemies just can't function against him'"
        ],
        dps:[{n:"Base DPS",v:580},{n:"+ Cold (46%)",v:847},{n:"+ Burn DoT",v:1107},{n:"+ Chain Lightning",v:1992},{n:"+ Blackhole ctrl",v:2242}],
        radar:{burst:72,sustain:92,aoe:80,control:98,survival:82},
        crystals:["Crystal Resonance","Phase Shift","Frost Shield"],
        mathKey:"Cold at high attack rate: max stacks in ~2 sec (like Noel-tier speed). Burn 260/s stacks on Restriction Drive. Chain Lightning on mobile dash: 295 × 3 × 2 dashes/sec = 1770 chain DPS. Blackhole + Drive: 98 control rating — highest of all Naoto builds." },
      { id:"death_touch", name:"DEATH TOUCH", arch:"Single-Target / Boss Killer", rating:86,
        tactics:["Skill Light Spear (Light)","Attack Shadow Spike (Umbra)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Naoto's Drive increases damage vs singular target — all single-target tactics synergize",
          "Light Spear: 490 per skill × Naoto fast-cast rate = highest Spear DPS of any character",
          "Shadow Spike: 275 per normal × Naoto's rapid combo rate = ~825 shadow DPS floor minimum",
          "Ring of Fire: 770 burst per legacy. Drive activation is legacy-adjacent — timing is natural",
          "Thunderbolt: Naoto's approach dash = free chain lightning on every boss engage"
        ],
        dps:[{n:"Base DPS",v:580},{n:"+ Shadow Spike",v:855},{n:"+ Light Spear fast-cast",v:1835},{n:"+ Thunderbolt",v:2160},{n:"+ Ring of Fire",v:2710}],
        radar:{burst:92,sustain:75,aoe:65,control:72,survival:75},
        crystals:["Kill Streak","Blood Pact","Combo Counter"],
        mathKey:"Naoto fast-cast: Light Spear at 1 skill/sec = 490 DPS from one slot alone. Shadow Spike: 3 normals/sec × 275 = 825 shadow. Drive single-target amp (est ×1.2 on boss): 2160 → 2592 in Drive window. Ring of Fire: 770 per legacy. Total boss DPS: ~2710, highest Naoto ceiling." }
    ]
  },
  { id:"icey", name:"ICEY", tag:"PIXEL / DANCER", tier:"A", color:"#A78BFA",
    img:"/chars/icey.jpg",
    builds:[
      { id:"pixel_storm", name:"PIXEL STORM", arch:"Mobile / DPS Dancer", rating:88,
        tactics:["Attack Chain Lightning (Light)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "ICEY: combo-based fighter with fluid sword dance movement — full Light tree matches aerial mobility",
          "Chain Lightning: ICEY's rapid hit combos = chain procs fire on every connected hit of dance combo",
          "Light Spear: 490 per skill. ICEY skills mid-dance are fast — highest Spear proc rate of any agile char",
          "Thunderbolt: ICEY's dashes ARE her combat — each dance reposition fires chain to nearest enemy",
          "Steam (Cross-IP char): 'ICEY just HITS — don't overthink the build, she does damage naturally'"
        ],
        dps:[{n:"Base DPS",v:570},{n:"+ Chain Lightning",v:1455},{n:"+ Light Spear",v:1945},{n:"+ Thunderbolt dance",v:2270},{n:"+ Orb Turret",v:2515}],
        radar:{burst:85,sustain:88,aoe:85,control:68,survival:75},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
        mathKey:"Chain Lightning × ICEY rapid dance hits: 295 × 3 per hit at ~2.5 hits/sec = 2213 chain DPS peak. Light Spear adds 490 per skill mid-dance. Thunderbolt per reposition: 325. Combined: 2515 DPS — ICEY's highest sustained DPS build, rewarding fluid play." },
      { id:"frozen_dance", name:"FROZEN DANCE", arch:"AoE Clear / Speed Run", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Double Cold on ICEY's high hit-rate: max Cold stacks in under 2 sec during dance combo",
          "Frost Burst: ICEY's AoE dance hits entire screen on trigger — all frozen enemies burst simultaneously",
          "Shadow Spike on dance dashes: ICEY's dance moves trigger Shadow Spike independently",
          "Ice Spike Respawn turrets: auto-fire fills DPS gaps between dance combo sequences",
          "Best ICEY build for stage-speed clearing — frozen enemies never interrupt dance flow"
        ],
        dps:[{n:"Base DPS",v:570},{n:"+ Cold Atk (46%)",v:832},{n:"+ Skill Cold (47%)",v:1223},{n:"+ Frost Burst AoE",v:1743},{n:"+ Shadow Spike + Ice",v:2193}],
        radar:{burst:72,sustain:88,aoe:95,control:90,survival:82},
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
        mathKey:"ICEY high hit-rate: Cold stacks in ~1.5 sec. Double Cold: 570 → 832 → 1223. Frost Burst: AoE clears entire stage during max-stack trigger. Shadow Spike per dance dash: 275 × 3 dashes = 825 burst. Combined: 2193 DPS with 95 AoE rating — best room clear in game." },
      { id:"blade_dance", name:"BLADE DANCE", arch:"Raw Power / Finisher", rating:82,
        tactics:["Attack Shadow Spike (Umbra)","Skill Burn (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Fire Spirit (Fire)"],
        reasoning:[
          "Shadow Spike: ICEY's rapid dance combos hit 5-6× per sequence = 275 × 5 = 1375 burst per dance",
          "Burn: 360/s on skills. ICEY skill-chains mid-dance constantly = perpetual DoT stack",
          "Ring of Fire: 770 burst per legacy. ICEY trigger window during super-dash = safe legacy",
          "Fire Spirit follows ICEY's target — auto-attacks carry between dance repositions",
          "Thunderbolt on dash: every dance step between sequences fires chain lightning"
        ],
        dps:[{n:"Base DPS",v:570},{n:"+ Shadow Spike ×5",v:1945},{n:"+ Burn DoT",v:2305},{n:"+ Ring of Fire",v:2915},{n:"+ Thunderbolt",v:3240}],
        radar:{burst:95,sustain:72,aoe:78,control:60,survival:68},
        crystals:["Kill Streak","Blood Pact","Combo Counter"],
        mathKey:"Shadow Spike × 5-hit dance sequence: 275 × 5 = 1375 burst per full dance. At 1.5 sequences/sec = 2063 shadow DPS. Burn 360/s passive stacking. Ring of Fire 770 burst per legacy = 96 avg DPS. Thunderbolt per step: 325. Peak: 3240 DPS — ICEY's highest raw burst ceiling." }
    ]
  },
  { id:"prisoner", name:"The Prisoner", tag:"DEAD CELLS / BRUTAL", tier:"A", color:"#94A3B8",
    img:"/chars/prisoner.png",
    builds:[
      { id:"beheaded_run", name:"BEHEADED RUN", arch:"Roguelike / Adaptive", rating:90,
        tactics:["Attack Shadow Spike (Umbra)","Skill Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "The Prisoner (Dead Cells crossover): natural roguelike synergy with BBEE's run structure",
          "Shadow Spike: weapon-agnostic — Prisoner's any-weapon kit means 275 per every hit regardless",
          "Chain Lightning: Prisoner rolls through enemy clusters = guaranteed 3-target bounce on each roll",
          "Blackhole: Prisoner's mobility means Blackhole is a trap tool, not defensive — place and roll away",
          "Steam: 'Prisoner brings Dead Cells energy — just run everything, adapt, don't stop moving'"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Shadow Spike",v:835},{n:"+ Chain Lightning",v:1720},{n:"+ Thunderbolt roll",v:2045},{n:"+ Orb Turret",v:2290}],
        radar:{burst:82,sustain:85,aoe:85,control:75,survival:80},
        crystals:["Kill Streak","Combo Counter","Phase Shift"],
        mathKey:"Prisoner's weapon flexibility: Shadow Spike works on ANY weapon type, highest build flexibility. Chain Lightning: rolls through clusters = 295 × 3 = 885 per roll engage. Thunderbolt per roll-dash: 325. Combined: 2290 DPS — reliable on any weapon the Prisoner picks up mid-run." },
      { id:"bloodlust_run", name:"BLOODLUST RUN", arch:"DoT / Attrition Machine", rating:86,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Burn: 360/s DoT stacks with Prisoner's high-damage skills. Each hit counts from any weapon",
          "Fire Spirit: auto-attacks after every weapon hit — Prisoner weapon variety means spirits fire constantly",
          "Shadow Spike on roll: Prisoner's roll-dodge fires Shadow Spike = 275 per every evasion",
          "Ring of Fire: 770 burst on every legacy. Prisoner's skill timing is flexible = frequent legacy windows",
          "Steam: 'Prisoner DoT build: you set it up and it runs itself — true to Dead Cells auto-build style'"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Burn DoT",v:920},{n:"+ Fire Spirit",v:1490},{n:"+ Shadow Spike roll",v:1765},{n:"+ Ring of Fire",v:2305}],
        radar:{burst:80,sustain:92,aoe:78,control:65,survival:75},
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
        mathKey:"Burn 360/s: stacks from any weapon type Prisoner uses. Fire Spirit: follows weapon attacks = 570 passive DPS (3 spirits). Shadow Spike per roll: 275 × 3 rolls/sec = 825 roll DPS. Ring of Fire: 770 burst per legacy (frequent on Prisoner). Combined: 2305 DPS with highest Prisoner sustain." },
      { id:"brutalist_melee", name:"BRUTALIST MELEE", arch:"Heavy / Boss Wrecker", rating:83,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold Attack: 46% on Prisoner's melee hits. Heavy melee weapons stack Cold in ~3 hits",
          "Light Spear: 490 per skill — Prisoner's charged heavy skills are slow but unblockable",
          "Blackhole: traps boss mid-arena — Prisoner closes distance for full heavy combo confirm",
          "Thunderbolt on roll: Prisoner's roll-in approach fires chain lightning before melee contact",
          "Lightning Orb: covers Prisoner's gap between heavy swings — fills animation downtime with DPS"
        ],
        dps:[{n:"Base DPS",v:560},{n:"+ Cold (46%)",v:818},{n:"+ Light Spear",v:1308},{n:"+ Thunderbolt",v:1633},{n:"+ Blackhole + Orb",v:2128}],
        radar:{burst:78,sustain:78,aoe:68,control:88,survival:80},
        crystals:["Frost Shield","Phase Shift","Combo Counter"],
        mathKey:"Cold on heavy melee: each heavy hit has 3× Cold stack value of normal hits — max stacks in 3 swings. Light Spear on charged skill: 490 unblockable per use. Blackhole confirms melee range. Lightning Orb: 245 DPS during animation. Combined: 2128 DPS — Prisoner's most reliable boss-kill build." }
    ]
  }
];

// Animated Full-Width Banner
function Banner() {
  return (
    <div style={{position:"relative",width:"100%",overflow:"hidden",background:"#080808",borderBottom:"2px solid #B91C1C"}}>
      <style>{`
        @keyframes scanline {
          0%   { transform: translateX(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes xPulse {
          0%, 100% { filter: drop-shadow(0 0 4px #B91C1C) drop-shadow(0 0 12px #7A0A0A); opacity: 1; }
          50%       { filter: drop-shadow(0 0 10px #FF3020) drop-shadow(0 0 28px #B91C1C); opacity: 0.85; }
        }
        @keyframes bladeShimmer {
          0%, 100% { opacity: 0.9; }
          40%       { opacity: 0.5; }
          60%       { opacity: 1; }
        }
        @keyframes goldPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        @keyframes glitchH {
          0%,94%,100% { transform: translateX(0); }
          95%  { transform: translateX(-3px); }
          97%  { transform: translateX(4px); }
          99%  { transform: translateX(-1px); }
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          50%  { transform: translateY(-8px) translateX(4px); opacity: 1; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
        }
        @keyframes borderPulse {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        .entropy-x  { animation: xPulse 3s ease-in-out infinite; }
        .blade-left { animation: bladeShimmer 4s ease-in-out infinite; }
        .blade-right{ animation: bladeShimmer 4s ease-in-out infinite 0.8s; }
        .gold-text  { animation: goldPulse 5s ease-in-out infinite; }
        .entropy-word { animation: glitchH 8s steps(1) infinite; }
        .scan-bar   { animation: scanline 6s linear infinite 1.5s; }
        .top-border { animation: borderPulse 3s ease-in-out infinite; }
        .bot-border { animation: borderPulse 3s ease-in-out infinite 1.5s; }
      `}</style>

      <svg viewBox="0 0 1200 88" preserveAspectRatio="xMidYMid meet"
        style={{width:"100%",height:"auto",display:"block",minHeight:60}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bladeG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3020"/><stop offset="100%" stopColor="#7A0A0A"/>
          </linearGradient>
          <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9931A"/><stop offset="100%" stopColor="#F2C94C"/>
          </linearGradient>
          <linearGradient id="bgFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B91C1C" stopOpacity="0.08"/>
            <stop offset="40%" stopColor="#B91C1C" stopOpacity="0"/>
            <stop offset="60%" stopColor="#B91C1C" stopOpacity="0"/>
            <stop offset="100%" stopColor="#B91C1C" stopOpacity="0.06"/>
          </linearGradient>
          <filter id="redglow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="strongglow">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="bannerClip"><rect x="0" y="0" width="1200" height="88"/></clipPath>
        </defs>

        {/* Background vignette */}
        <rect x="0" y="0" width="1200" height="88" fill="url(#bgFade)"/>

        {/* Animated scan bar */}
        <rect className="scan-bar" x="0" y="0" width="120" height="88"
          fill="url(#bgFade)" opacity="0.4" clipPath="url(#bannerClip)"/>

        {/* Top border line */}
        <line className="top-border" x1="0" y1="2" x2="1200" y2="2" stroke="#C62020" strokeWidth="1.5"/>

        {/* ── LEFT BLADES ── */}
        <g className="blade-left">
          <polygon points="8,6 20,6 30,82 18,82" fill="url(#bladeG)" filter="url(#redglow)"/>
          <polygon points="20,6 30,6 40,82 28,82" fill="#C62020" opacity="0.35"/>
          {/* Tiny accent blade */}
          <polygon points="42,6 48,6 54,82 48,82" fill="#B91C1C" opacity="0.2"/>
        </g>

        {/* ── MAIN TITLE ── */}
        <g className="entropy-word">
          <text x="62" y="63"
            fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
            fontWeight="900" fontSize="68" letterSpacing="5" fill="#F0EDE5">ENTROPY</text>
        </g>

        {/* ── X ── */}
        <g className="entropy-x">
          <text x="402" y="63"
            fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
            fontWeight="900" fontSize="68" fill="url(#bladeG)" filter="url(#strongglow)">X</text>
        </g>

        {/* ── OVERRIDE subtitle ── */}
        <g className="gold-text">
          <text x="62" y="82"
            fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
            fontWeight="700" fontSize="17" letterSpacing="16" fill="url(#goldG)">OVERRIDE</text>
        </g>

        {/* ── CENTER DIVIDER TICK ── */}
        <line x1="600" y1="6" x2="600" y2="82" stroke="#1A1A1A" strokeWidth="1" opacity="0.5"/>

        {/* ── RIGHT SIDE INFO ── */}
        <text x="640" y="42"
          fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
          fontWeight="700" fontSize="13" letterSpacing="4" fill="#2A2A2A">TACTICS CODEX</text>
        <text x="640" y="60"
          fontFamily="'Courier Prime','Courier New',monospace"
          fontSize="11" fill="#222" letterSpacing="1">16 CHARACTERS · 48 BUILDS · 15 TACTICS</text>
        <text x="640" y="76"
          fontFamily="'Courier Prime','Courier New',monospace"
          fontSize="10" fill="#1A1A1A" letterSpacing="1">BlazBlue Entropy Effect X — v4.0</text>

        {/* Particle dots (animated at different delays) */}
        <circle cx="580" cy="20" r="1.5" fill="#B91C1C" opacity="0.4" style={{animation:"particleDrift 4s ease-in-out infinite"}}/>
        <circle cx="590" cy="68" r="1" fill="#C9A227" opacity="0.3" style={{animation:"particleDrift 5s ease-in-out infinite 1s"}}/>
        <circle cx="570" cy="44" r="1" fill="#B91C1C" opacity="0.25" style={{animation:"particleDrift 6s ease-in-out infinite 2s"}}/>

        {/* ── RIGHT BLADES ── */}
        <g className="blade-right">
          <polygon points="1148,6 1160,6 1170,82 1158,82" fill="url(#bladeG)" opacity="0.6"/>
          <polygon points="1160,6 1170,6 1180,82 1168,82" fill="url(#bladeG)" filter="url(#redglow)" opacity="0.8"/>
          <polygon points="1180,6 1188,6 1194,82 1186,82" fill="#C62020" opacity="0.25"/>
        </g>

        {/* Bottom border line */}
        <line className="bot-border" x1="0" y1="86" x2="1200" y2="86" stroke="#C62020" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

const RADAR_AXES = ["burst","sustain","aoe","control","survival"];
const RADAR_LABELS = {burst:"BURST",sustain:"SUSTAIN",aoe:"AoE",control:"CONTROL",survival:"SURVIVE"};
const TIER_COLORS = {S:"#E53935",A:"#FF8F00",B:"#1976D2",C:"#757575"};

function BuildRadar({radar, color}) {
  const data = RADAR_AXES.map(k=>({subject:RADAR_LABELS[k],value:radar[k],fullMark:100}));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{top:8,right:28,bottom:8,left:28}}>
        <PolarGrid stroke="#252525"/>
        <PolarAngleAxis dataKey="subject" tick={{fill:"#777",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}/>
        <PolarRadiusAxis angle={90} domain={[0,100]} tick={false} axisLine={false}/>
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.22} strokeWidth={2}/>
      </RadarChart>
    </ResponsiveContainer>
  );
}

const CustomTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#0A0A0A",border:"1px solid #2A2A2A",padding:"8px 14px",fontFamily:"'Courier Prime',monospace",fontSize:14,color:"#F0EDE5"}}>
      <div style={{color:"#C9A227",fontWeight:700,marginBottom:2}}>{payload[0]?.payload?.n || label}</div>
      <div>{(payload[0]?.value||0).toLocaleString()} est. DPS</div>
    </div>
  );
};

function DPSChart({data,color}) {
  return (
    <ResponsiveContainer width="100%" height={175}>
      <BarChart data={data} margin={{top:4,right:8,bottom:28,left:8}}>
        <CartesianGrid stroke="#181818" vertical={false}/>
        <XAxis dataKey="n" tick={{fill:"#666",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}} angle={-35} textAnchor="end" interval={0}/>
        <YAxis tick={{fill:"#555", fontSize:12,fontFamily:"'Courier Prime',monospace"}} width={50}/>
        <Tooltip content={<CustomTip/>}/>
        <Bar dataKey="v" radius={[2,2,0,0]} maxBarSize={44}>
          {data.map((_,i)=>(
            <Cell key={i} fill={i===data.length-1?color:`${color}${Math.round(45+i*35).toString(16).padStart(2,'0')}`}/>
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RarityChart({tactic}) {
  if(!tactic||tactic.vals.every(v=>v===0)) return (
    <div style={{padding:24,textAlign:"center",color:"#444",fontSize:14,fontFamily:"'Courier Prime',monospace",lineHeight:1.8}}>
      CONTROL TACTIC<br/>Power measured by crowd control uptime, not direct damage values.
    </div>
  );
  const ec = ELEM_COLORS[tactic.element]||"#888";
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={tactic.vals.map((v,i)=>({name:RARITY[i],value:v}))} margin={{top:4,right:8,bottom:4,left:8}}>
        <CartesianGrid stroke="#181818" vertical={false}/>
        <XAxis dataKey="name" tick={{fill:"#888",fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}/>
        <YAxis tick={{fill:"#555", fontSize:12,fontFamily:"'Courier Prime',monospace"}} width={45}/>
        <Tooltip contentStyle={{background:"#0A0A0A",border:`1px solid ${ec}44`,fontFamily:"'Courier Prime',monospace",fontSize:14,color:"#F0EDE5"}}/>
        <Bar dataKey="value" fill={ec} radius={[2,2,0,0]} maxBarSize={50}/>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function App() {
  const [activeChar, setActiveChar] = useState(CHARACTERS[0].id);
  const [activeBuild, setActiveBuild] = useState(0);
  const [tab, setTab] = useState("builds");
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [guideBuild, setGuideBuild] = useState(0);

  const char = CHARACTERS.find(c=>c.id===activeChar);
  const build = char.builds[activeBuild];

  const S = {
    wrap:{background:"#080808",minHeight:"100vh",color:"#F0EDE5",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif"},
    header:{borderBottom:"2px solid #B91C1C",padding:"18px 28px 14px",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"space-between"},
    nav:{display:"flex",gap:0,borderBottom:"1px solid #161616",padding:"0 28px",background:"#090909"},
    navBtn:(a)=>({background:"transparent",border:"none",borderBottom:a?"3px solid #B91C1C":"3px solid transparent",color:a?"#F0EDE5":"#505050",padding:"14px 28px",fontSize:15,letterSpacing:3,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",transition:"all 0.15s"}),
    main:{display:"grid",gridTemplateColumns:"272px 1fr",minHeight:"calc(100vh - 126px)"},
    sidebar:{background:"#080808",borderRight:"1px solid #141414"},
    charRow:(a,col)=>({display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:a?`${col}14`:"transparent",borderLeft:a?`3px solid ${col}`:"3px solid transparent",transition:"all 0.1s"}),
    content:{padding:"22px 26px",overflowY:"auto"},
    card:{background:"#0D0D0D",border:"1px solid #1A1A1A",padding:"20px",marginBottom:14},
    label:{fontSize:12,letterSpacing:3,color:"#4A4A4A",fontWeight:700,marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif"},
    h1:(col="#F0EDE5")=>({fontSize:22,fontWeight:900,letterSpacing:3,color:col,marginBottom:3}),
    mono:{fontFamily:"'Courier Prime','Courier New',monospace"},
    mathBox:{background:"#0B0B0B",border:"1px solid #B91C1C",borderLeft:"4px solid #B91C1C",padding:"14px 18px",fontFamily:"'Courier Prime','Courier New',monospace",fontSize:14,color:"#C9A227",lineHeight:2,marginBottom:14},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
    buildTabBtn:(a,col)=>({background:a?`${col}1A`:"#111",border:`2px solid ${a?col:"#1E1E1E"}`,color:a?col:"#505050",padding:"10px 22px",fontSize:14,letterSpacing:2,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",clipPath:"polygon(0 0,100% 0,94% 100%,0 100%)",transition:"all 0.15s",marginRight:6}),
    tacticElem:(col)=>({background:`${col}1A`,color:col,padding:"3px 10px",fontSize:12,fontWeight:900,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}),
    ratingBadge:(v)=>({display:"inline-block",background:v>=90?"#0F2710":v>=80?"#211D00":"#1F0A0A",border:`2px solid ${v>=90?"#22C55E":v>=80?"#EAB308":"#EF4444"}`,color:v>=90?"#22C55E":v>=80?"#EAB308":"#EF4444",padding:"3px 14px",fontSize:18,fontWeight:900,letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif"}),
  };

  const renderBuilds = () => (
    <div>
      <div style={{display:"flex",marginBottom:20}}>
        {char.builds.map((b,i)=>(
          <button key={b.id} style={S.buildTabBtn(activeBuild===i,char.color)} onClick={()=>setActiveBuild(i)}>
            {b.name}
          </button>
        ))}
      </div>

      <div style={{...S.card,borderColor:char.color+"33",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
              <div style={S.h1(char.color)}>{build.name}</div>
              <div style={S.ratingBadge(build.rating)}>{build.rating}</div>
            </div>
            <div style={{fontSize:14,letterSpacing:2,color:"#666",marginBottom:14}}>{build.arch}</div>
            <div style={S.mathBox}>
              <div style={{color:"#5A5A5A",fontSize:12,letterSpacing:2,marginBottom:5}}>MATH SUMMARY</div>
              {build.mathKey}
            </div>
          </div>
          <div style={{width:190,flexShrink:0}}>
            <div style={S.label}>BUILD PROFILE</div>
            <BuildRadar radar={build.radar} color={char.color}/>
          </div>
        </div>
      </div>

      <div style={S.g2}>
        <div>
          <div style={S.card}>
            <div style={S.label}>TACTICS (5 SLOTS)</div>
            {build.tactics.map((t,i)=>{
              const elem = t.includes("Ice")?"ice":t.includes("Fire")?"fire":t.includes("Umbra")?"umbra":t.includes("Light")?"light":t.includes("Electric")?"electric":"blade";
              const ec = ELEM_COLORS[elem];
              return (
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"9px 11px",marginBottom:5,background:"#111",borderLeft:`3px solid ${ec}`}}>
                  <div style={S.tacticElem(ec)}>{elem.toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:14,color:"#E8E8E8",fontWeight:700,letterSpacing:0.5}}>{t}</div>
                    <div style={{fontSize:11,color:"#525252",marginTop:2,lineHeight:1.5}}>{build.reasoning[i]}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={S.card}>
            <div style={S.label}>RECOMMENDED MIND CRYSTALS</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {build.crystals.map(c=>(
                <div key={c} style={{background:"#131313",border:"1px solid #2A2A2A",padding:"6px 14px",fontSize:13,fontWeight:700,letterSpacing:1,color:"#C9A227"}}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={S.card}>
            <div style={S.label}>EFFECTIVE DPS BREAKDOWN — LEGENDARY RARITY</div>
            <div style={{color:"#3A3A3A",fontSize:12,marginBottom:8,...S.mono}}>Source: BlazBlue Wiki base values + community play data</div>
            <DPSChart data={build.dps} color={char.color}/>
            <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,color:"#3A3A3A",...S.mono}}>estimates — actual varies by entropy + attack speed</div>
              <div style={{fontSize:22,fontWeight:700,color:char.color,...S.mono}}>~{build.dps[build.dps.length-1].v.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTactics = () => (
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:24,maxWidth:1400,margin:"0 auto"}}>
      <div>
        <div style={S.label}>SELECT TACTIC</div>
        {TACTICS_REFERENCE.map(t=>{
          const ec=ELEM_COLORS[t.element]||"#888";
          const a=selectedTactic?.name===t.name;
          return (
            <div key={t.name} onClick={()=>setSelectedTactic(t)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",marginBottom:3,cursor:"pointer",background:a?"#131313":"transparent",borderLeft:`3px solid ${a?ec:"#181818"}`,transition:"all 0.1s"}}>
              <div style={S.tacticElem(ec)}>{t.element.toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,color:"#E0E0E0",fontWeight:700}}>{t.name}</div>
                <div style={{fontSize:12,color:"#505050",...S.mono}}>{t.unit}</div>
              </div>
              <div style={{background:`${TIER_COLORS[t.tier.charAt(0)]}1A`,color:TIER_COLORS[t.tier.charAt(0)],border:`1px solid ${TIER_COLORS[t.tier.charAt(0)]}`,padding:"2px 8px",fontSize:12,fontWeight:900,flexShrink:0}}>{t.tier}</div>
            </div>
          );
        })}
      </div>
      <div>
        {selectedTactic ? (
          <>
            <div style={{...S.card,borderColor:`${ELEM_COLORS[selectedTactic.element]}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={S.h1(ELEM_COLORS[selectedTactic.element]||"#F0EDE5")}>{selectedTactic.name}</div>
                  <div style={{fontSize:14,color:"#666",letterSpacing:2,...S.mono,marginTop:3}}>{selectedTactic.unit}</div>
                </div>
                <div style={{background:`${TIER_COLORS[selectedTactic.tier.charAt(0)]}1A`,color:TIER_COLORS[selectedTactic.tier.charAt(0)],border:`2px solid ${TIER_COLORS[selectedTactic.tier.charAt(0)]}`,padding:"4px 18px",fontSize:20,fontWeight:900,letterSpacing:2}}>{selectedTactic.tier}</div>
              </div>
              <div style={S.label}>DAMAGE BY RARITY TIER</div>
              <RarityChart tactic={selectedTactic}/>
              {selectedTactic.vals.some(v=>v>0) && (
                <div style={{display:"flex",gap:8,marginTop:10,marginBottom:14}}>
                  {selectedTactic.vals.map((v,i)=>(
                    <div key={i} style={{flex:1,background:"#111",padding:"8px 10px",textAlign:"center",border:`1px solid ${i===3?"#C9A227":"#1A1A1A"}`}}>
                      <div style={{fontSize:12,color:"#505050",fontWeight:700,letterSpacing:1}}>{RARITY[i]}</div>
                      <div style={{fontSize:20,fontWeight:900,color:i===3?"#C9A227":"#888",...S.mono}}>{v}</div>
                      {i===3&&<div style={{fontSize:9,color:"#454545"}}>MAX</div>}
                    </div>
                  ))}
                </div>
              )}
              <div style={S.mathBox}>
                <div style={{color:"#4A4A4A",fontSize:12,letterSpacing:2,marginBottom:5}}>WHY TIER {selectedTactic.tier}</div>
                {selectedTactic.note}
              </div>
            </div>
            {selectedTactic.vals.some(v=>v>0) && (
              <div style={S.card}>
                <div style={S.label}>DAMAGE SCALING MATH — BASE 500 DPS EXAMPLE</div>
                <div style={{... S.mono,fontSize:14,lineHeight:2.2,color:"#666"}}>
                  {selectedTactic.vals.map((v,i)=>{
                    const isPct=selectedTactic.unit.includes("%");
                    const result=isPct?Math.round(500*(1+v/100)):v;
                    return (
                      <div key={i} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #181818",paddingBottom:2}}>
                        <span style={{color:i===3?"#C9A227":"#555"}}>{RARITY[i]}</span>
                        <span>{isPct?`500 × (1 + ${v}%) =`:`${v} ${selectedTactic.unit}`}</span>
                        {isPct&&<span style={{color:i===3?"#F0EDE5":"#777",fontWeight:700}}>{result} effective</span>}
                      </div>
                    );
                  })}
                  {selectedTactic.unit.includes("%") && (
                    <div style={{marginTop:10,color:"#666",fontSize:13}}>
                      Legendary over Common gain: +{selectedTactic.vals[3]-selectedTactic.vals[0]}% — equivalent to{" "}
                      <span style={{color:"#C9A227"}}>{Math.round(500*(selectedTactic.vals[3]-selectedTactic.vals[0])/100)} extra DPS</span> on a 500-base character
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#252525",fontSize:16,letterSpacing:3,fontWeight:700}}>
            ← SELECT A TACTIC TO VIEW ANALYSIS
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={S.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Courier+Prime:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080808;}
        button{font-family:inherit;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#080808;}
        ::-webkit-scrollbar-thumb{background:#B91C1C;}
        button:hover{opacity:0.85;}
      `}</style>

      <Banner />

      <div style={S.nav}>
        {[["builds","BUILD ANALYZER"],["tactics","TACTICS DATABASE"],["guide","CHARACTER GUIDE"]].map(([id,lbl])=>(
          <button key={id} style={S.navBtn(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {tab === "tactics" ? (
        <div style={{...S.content, height:"calc(100vh - 108px)", overflowY:"auto"}}>
          {renderTactics()}
        </div>
      ) : (
      <div style={S.main}>
        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={{padding:"12px 14px 8px",fontSize:10,letterSpacing:3,color:"#3A3A3A",fontWeight:700}}>CHARACTER SELECT</div>
          {CHARACTERS.map(c=>(
            <div key={c.id} style={S.charRow(activeChar===c.id,c.color)}
              onClick={()=>{setActiveChar(c.id);setActiveBuild(0);}}>
              <div style={{width:38,height:50,overflow:"hidden",flexShrink:0,clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)"}}>
                <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center"}} onError={e=>{e.target.style.display="none"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:900,color:activeChar===c.id?c.color:"#C0C0C0",letterSpacing:0.5,lineHeight:1.2}}>{c.name}</div>
                <div style={{fontSize:11,color:"#484848",letterSpacing:1,marginTop:1}}>{c.tag}</div>
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  <span style={{background:`${TIER_COLORS[c.tier]}1A`,color:TIER_COLORS[c.tier],border:`1px solid ${TIER_COLORS[c.tier]}`,padding:"0 6px",fontSize:10,fontWeight:900}}>TIER {c.tier}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Bottom character artwork */}
          <div style={{borderTop:"1px solid #111",marginTop:8}}>
            <div style={{position:"relative",overflow:"hidden",height:180}}>
              <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:"contrast(1.05) saturate(0.88)",opacity:0.8}} onError={e=>{e.target.style.display="none"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:72,background:"linear-gradient(transparent,#080808 88%)"}}/>
              <div style={{position:"absolute",bottom:8,left:14,fontWeight:900,fontSize:14,color:char.color,letterSpacing:2}}>{char.name.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>
          {tab==="builds" && renderBuilds()}
          {tab==="guide" && <CharacterGuide char={char} />}
        </div>
      </div>
      )}
    </div>
  );
}
