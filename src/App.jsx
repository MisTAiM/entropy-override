import { useState } from "react";
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
    img:"https://static.wikia.nocookie.net/blazblue/images/c/c7/Hibiki_Kohaku_%28Centralfiction%2C_Character_Select_Artwork%29.png/revision/latest",
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
    img:"https://static.wikia.nocookie.net/blazblue/images/1/16/Ragna_the_Bloodedge_%28Centralfiction%2C_Character_Select_Artwork%29.png/revision/latest",
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
    img:"https://static.wikia.nocookie.net/blazblue/images/b/ba/Jin_Kisaragi_%28Centralfiction%2C_Character_Select_Artwork%29.png/revision/latest",
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
    img:"https://static.wikia.nocookie.net/blazblue/images/c/ce/Konoe_A._Mercury_%28Centralfiction%2C_Character_Select_Artwork%29.png/revision/latest",
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
    img:"https://static.wikia.nocookie.net/blazblue/images/5/57/Es_%28Centralfiction%2C_Character_Select_Artwork%29.png/revision/latest",
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
  }
];

// SVG Logo
function Logo() {
  return (
    <svg viewBox="0 0 560 88" style={{width:"100%",maxWidth:560,height:"auto"}} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bladeG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3020"/><stop offset="100%" stopColor="#7A0A0A"/>
        </linearGradient>
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9931A"/><stop offset="100%" stopColor="#F2C94C"/>
        </linearGradient>
        <filter id="redglow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <line x1="0" y1="2" x2="560" y2="2" stroke="#C62020" strokeWidth="1.5" opacity="0.5"/>
      {/* Left blade pair */}
      <polygon points="4,6 16,6 26,82 14,82" fill="url(#bladeG)" filter="url(#redglow)"/>
      <polygon points="16,6 26,6 36,82 24,82" fill="#C62020" opacity="0.35"/>
      {/* Main title */}
      <text x="46" y="62" fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" fontWeight="900" fontSize="66" letterSpacing="5" fill="#F0EDE5">ENTROPY</text>
      {/* X */}
      <text x="374" y="62" fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" fontWeight="900" fontSize="66" fill="url(#bladeG)" filter="url(#redglow)">X</text>
      {/* OVERRIDE subtitle */}
      <text x="46" y="81" fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" fontWeight="700" fontSize="17" letterSpacing="16" fill="url(#goldG)">OVERRIDE</text>
      {/* Right accent */}
      <polygon points="530,6 542,6 552,82 540,82" fill="url(#bladeG)" opacity="0.55"/>
      {/* Version tag */}
      <text x="408" y="81" fontFamily="'Courier Prime','Courier New',monospace" fontSize="10" fill="#444" letterSpacing="1">TACTICS CODEX v4.0</text>
      <line x1="0" y1="86" x2="560" y2="86" stroke="#C62020" strokeWidth="1.5" opacity="0.5"/>
    </svg>
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
        <PolarAngleAxis dataKey="subject" tick={{fill:"#777",fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}/>
        <PolarRadiusAxis angle={90} domain={[0,100]} tick={false} axisLine={false}/>
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.22} strokeWidth={2}/>
      </RadarChart>
    </ResponsiveContainer>
  );
}

const CustomTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#0A0A0A",border:"1px solid #2A2A2A",padding:"8px 14px",fontFamily:"'Courier Prime',monospace",fontSize:12,color:"#F0EDE5"}}>
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
        <XAxis dataKey="n" tick={{fill:"#666",fontSize:9,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}} angle={-35} textAnchor="end" interval={0}/>
        <YAxis tick={{fill:"#555",fontSize:10,fontFamily:"'Courier Prime',monospace"}} width={50}/>
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
    <div style={{padding:24,textAlign:"center",color:"#444",fontSize:12,fontFamily:"'Courier Prime',monospace",lineHeight:1.8}}>
      CONTROL TACTIC<br/>Power measured by crowd control uptime, not direct damage values.
    </div>
  );
  const ec = ELEM_COLORS[tactic.element]||"#888";
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={tactic.vals.map((v,i)=>({name:RARITY[i],value:v}))} margin={{top:4,right:8,bottom:4,left:8}}>
        <CartesianGrid stroke="#181818" vertical={false}/>
        <XAxis dataKey="name" tick={{fill:"#888",fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}/>
        <YAxis tick={{fill:"#555",fontSize:10,fontFamily:"'Courier Prime',monospace"}} width={45}/>
        <Tooltip contentStyle={{background:"#0A0A0A",border:`1px solid ${ec}44`,fontFamily:"'Courier Prime',monospace",fontSize:12,color:"#F0EDE5"}}/>
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

  const char = CHARACTERS.find(c=>c.id===activeChar);
  const build = char.builds[activeBuild];

  const S = {
    wrap:{background:"#080808",minHeight:"100vh",color:"#F0EDE5",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif"},
    header:{borderBottom:"2px solid #B91C1C",padding:"18px 28px 14px",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"space-between"},
    nav:{display:"flex",gap:0,borderBottom:"1px solid #161616",padding:"0 28px",background:"#090909"},
    navBtn:(a)=>({background:"transparent",border:"none",borderBottom:a?"3px solid #B91C1C":"3px solid transparent",color:a?"#F0EDE5":"#505050",padding:"13px 26px",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",transition:"all 0.15s"}),
    main:{display:"grid",gridTemplateColumns:"272px 1fr",minHeight:"calc(100vh - 126px)"},
    sidebar:{background:"#080808",borderRight:"1px solid #141414"},
    charRow:(a,col)=>({display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:a?`${col}14`:"transparent",borderLeft:a?`3px solid ${col}`:"3px solid transparent",transition:"all 0.1s"}),
    content:{padding:"22px 26px",overflowY:"auto"},
    card:{background:"#0D0D0D",border:"1px solid #1A1A1A",padding:"18px",marginBottom:14},
    label:{fontSize:10,letterSpacing:3,color:"#4A4A4A",fontWeight:700,marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif"},
    h1:(col="#F0EDE5")=>({fontSize:21,fontWeight:900,letterSpacing:3,color:col,marginBottom:3}),
    mono:{fontFamily:"'Courier Prime','Courier New',monospace"},
    mathBox:{background:"#0B0B0B",border:"1px solid #B91C1C",borderLeft:"4px solid #B91C1C",padding:"14px 18px",fontFamily:"'Courier Prime','Courier New',monospace",fontSize:13,color:"#C9A227",lineHeight:1.9,marginBottom:14},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
    buildTabBtn:(a,col)=>({background:a?`${col}1A`:"#111",border:`2px solid ${a?col:"#1E1E1E"}`,color:a?col:"#505050",padding:"9px 20px",fontSize:13,letterSpacing:2,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",clipPath:"polygon(0 0,100% 0,94% 100%,0 100%)",transition:"all 0.15s",marginRight:6}),
    tacticElem:(col)=>({background:`${col}1A`,color:col,padding:"2px 9px",fontSize:10,fontWeight:900,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}),
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
            <div style={{fontSize:12,letterSpacing:2,color:"#666",marginBottom:14}}>{build.arch}</div>
            <div style={S.mathBox}>
              <div style={{color:"#5A5A5A",fontSize:10,letterSpacing:2,marginBottom:5}}>MATH SUMMARY</div>
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
                    <div style={{fontSize:13,color:"#E8E8E8",fontWeight:700,letterSpacing:0.5}}>{t}</div>
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
                <div key={c} style={{background:"#131313",border:"1px solid #2A2A2A",padding:"6px 14px",fontSize:12,fontWeight:700,letterSpacing:1,color:"#C9A227"}}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={S.card}>
            <div style={S.label}>EFFECTIVE DPS BREAKDOWN — LEGENDARY RARITY</div>
            <div style={{color:"#3A3A3A",fontSize:10,marginBottom:8,...S.mono}}>Source: BlazBlue Wiki base values + community play data</div>
            <DPSChart data={build.dps} color={char.color}/>
            <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:11,color:"#3A3A3A",...S.mono}}>estimates — actual varies by entropy + attack speed</div>
              <div style={{fontSize:22,fontWeight:700,color:char.color,...S.mono}}>~{build.dps[build.dps.length-1].v.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTactics = () => (
    <div style={{display:"grid",gridTemplateColumns:"250px 1fr",gap:20}}>
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
                <div style={{fontSize:12,color:"#E0E0E0",fontWeight:700}}>{t.name}</div>
                <div style={{fontSize:10,color:"#505050",...S.mono}}>{t.unit}</div>
              </div>
              <div style={{background:`${TIER_COLORS[t.tier.charAt(0)]}1A`,color:TIER_COLORS[t.tier.charAt(0)],border:`1px solid ${TIER_COLORS[t.tier.charAt(0)]}`,padding:"1px 8px",fontSize:10,fontWeight:900,flexShrink:0}}>{t.tier}</div>
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
                  <div style={{fontSize:12,color:"#666",letterSpacing:2,...S.mono,marginTop:3}}>{selectedTactic.unit}</div>
                </div>
                <div style={{background:`${TIER_COLORS[selectedTactic.tier.charAt(0)]}1A`,color:TIER_COLORS[selectedTactic.tier.charAt(0)],border:`2px solid ${TIER_COLORS[selectedTactic.tier.charAt(0)]}`,padding:"4px 18px",fontSize:20,fontWeight:900,letterSpacing:2}}>{selectedTactic.tier}</div>
              </div>
              <div style={S.label}>DAMAGE BY RARITY TIER</div>
              <RarityChart tactic={selectedTactic}/>
              {selectedTactic.vals.some(v=>v>0) && (
                <div style={{display:"flex",gap:8,marginTop:10,marginBottom:14}}>
                  {selectedTactic.vals.map((v,i)=>(
                    <div key={i} style={{flex:1,background:"#111",padding:"8px 10px",textAlign:"center",border:`1px solid ${i===3?"#C9A227":"#1A1A1A"}`}}>
                      <div style={{fontSize:10,color:"#505050",fontWeight:700,letterSpacing:1}}>{RARITY[i]}</div>
                      <div style={{fontSize:20,fontWeight:900,color:i===3?"#C9A227":"#888",...S.mono}}>{v}</div>
                      {i===3&&<div style={{fontSize:9,color:"#454545"}}>MAX</div>}
                    </div>
                  ))}
                </div>
              )}
              <div style={S.mathBox}>
                <div style={{color:"#4A4A4A",fontSize:10,letterSpacing:2,marginBottom:5}}>WHY TIER {selectedTactic.tier}</div>
                {selectedTactic.note}
              </div>
            </div>
            {selectedTactic.vals.some(v=>v>0) && (
              <div style={S.card}>
                <div style={S.label}>DAMAGE SCALING MATH — BASE 500 DPS EXAMPLE</div>
                <div style={{...S.mono,fontSize:13,lineHeight:2.2,color:"#666"}}>
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
                    <div style={{marginTop:10,color:"#666",fontSize:11}}>
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

      <div style={S.header}>
        <div style={{maxWidth:500}}><Logo/></div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,letterSpacing:3,color:"#3A3A3A",...{fontFamily:"'Courier Prime',monospace"}}}>TACTICS CODEX</div>
          <div style={{fontSize:10,color:"#2A2A2A",fontFamily:"'Courier Prime',monospace",marginTop:4}}>
            Data: BlazBlue Wiki · Steam Community · {CHARACTERS.length} characters · {TACTICS_REFERENCE.length} tactics
          </div>
        </div>
      </div>

      <div style={S.nav}>
        {[["builds","BUILD ANALYZER"],["tactics","TACTICS DATABASE"]].map(([id,lbl])=>(
          <button key={id} style={S.navBtn(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

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
                <div style={{fontSize:13,fontWeight:900,color:activeChar===c.id?c.color:"#C0C0C0",letterSpacing:0.5,lineHeight:1.2}}>{c.name}</div>
                <div style={{fontSize:9,color:"#484848",letterSpacing:1,marginTop:1}}>{c.tag}</div>
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
              <div style={{position:"absolute",bottom:8,left:14,fontWeight:900,fontSize:12,color:char.color,letterSpacing:2}}>{char.name.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>
          {tab==="builds" && renderBuilds()}
          {tab==="tactics" && renderTactics()}
        </div>
      </div>
    </div>
  );
}
