import React, { useState, useEffect } from "react";
import MindCrystals from "./components/MindCrystals.jsx";
import BuildCalculator from "./components/BuildCalculator.jsx";
import EvotypePlanner from "./components/EvotypePlanner.jsx";
import TierList from "./components/TierList.jsx";
import DataLab from "./components/DataLab.jsx";

function useIsMobile() {
  const [mob, setMob] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}
import { getSettings } from "./hooks/useSettings";
import CharacterGuide from "./components/CharacterGuide";
import AdminPanel from "./components/AdminPanel";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, CartesianGrid
} from "recharts";

const TACTICS_REFERENCE = [
  { name: "Cold Attack", tier: "S", element: "ice", vals: [null,null,null,null], unit: "% dmg boost per attack", note: "Steam: 'Jin + full Ice = auto mode. Nothing moves, you shred, bosses included.' Attack Cold slows ALL enemies simultaneously." },
  { name: "Skill Cold", tier: "S", element: "ice", vals: [null,null,null,null], unit: "% dmg boost on skills", note: "Stacks with Attack Cold. Double Cold = 46-47% on ALL inputs, plus 2 stacks of Cold per skill cast." },
  { name: "Frost Burst", tier: "A", element: "ice", vals: [null,null,null,null], unit: "burst dmg at max stacks", note: "At max Cold stacks, enemies burst for AoE. Wiki: triggers from Cold Attack OR Skill Cold accumulation. Wide radius room clear." },
  { name: "Attack Burn", tier: "A", element: "fire", vals: [null,null,null,null], unit: "DoT DPS", note: "Catalyst for Double Tactics. Procs on every normal hit. Essential catalyst — many Doubles require Burn as base." },
  { name: "Skill Burn", tier: "A", element: "fire", vals: [null,null,null,null], unit: "DoT DPS", note: "Higher base than Attack Burn. Core for skill-heavy chars. Catching Fire T2: +30% per burning enemy present." },
  { name: "Ring of Fire", tier: "B+", element: "fire", vals: [null,null,null,null], unit: "burst on Legacy use", note: "Mediocre alone. Storm Ring of Fire Double = full-screen AoE every dodge, hits entire screen. Transforms the tactic." },
  { name: "Fire Projectile", tier: "A", element: "fire", vals: [null,null,null,null], unit: "dmg × 10 projectiles", note: "10 projectiles × 280 = 2800 burst per Skill cast when all land (close range). Focused Fire T2 = 45° cone, all hit single target." },
  { name: "Fire Spirit", tier: "A", element: "fire", vals: [null,null,null,null], unit: "dmg per spirit hit", note: "Auto-spawns, attacks whatever you hit. Fire Spirit Detonation Double = spirits explode on Burn enemies = massive AoE chaining." },
  { name: "Place Mine", tier: "A*", element: "fire", vals: [null,null,null,null], unit: "dmg + charge bonus", note: "Es only: aerial bounce naturally detonates placed mines on contact. With Splashing Mine Double, detonations add shrapnel hits. Exact values unverified — see Data Lab." },
  { name: "Shadow Spike", tier: "S", element: "umbra", vals: [null,null,null,null], unit: "proc dmg per attack", note: "Hibiki clones COPY this — every input procs 3× instead of 1×. 275 × 3 clones = 825 per normal attack. Best slot efficiency." },
  { name: "Blackhole", tier: "S", element: "umbra", vals: [0,0,0,0], unit: "area slow (no direct dmg)", note: "Steam: 'Game breaking. Others don't matter.' + Electric Detox + Poison Contamination = zero-input stun lock of entire screen." },
  { name: "Light Spear", tier: "S", element: "light", vals: [null,null,null,null], unit: "dmg per skill hit", note: "Hakumen charged Up+Skill nearly one-shots bosses with Light Spear. Universal boss damage. 490 flat per skill use at Legendary." },
  { name: "Chain Lightning", tier: "S", element: "light", vals: [null,null,null,null], unit: "dmg, bounces 3 enemies", note: "Rachel bats trigger Attack Lightning even as Legacy = non-stop chain lightning, zero player input. 295 × 3 enemies = 885 per proc." },
  { name: "Lightning Orb", tier: "S", element: "electric", vals: [null,null,null,null], unit: "dmg/hit autonomous turret", note: "Most character-neutral combo: Orb + Thunderbolt + Light Javelin. Persistent field turret. Anyone can run this skeleton." },
  { name: "Thunderbolt", tier: "A", element: "electric", vals: [null,null,null,null], unit: "chain dmg on dash", note: "Dash fires chain lightning to nearby enemies. Core of Thunderbolt/Orb/Spear combo that community calls 'character-neutral S-tier skeleton.'" },
];

const RARITY = ["Common","Uncommon","Rare","Legendary"];
const RARITY_COLORS = ["#9CA3AF","#4ADE80","#60A5FA","#C9A227"];
const ELEM_COLORS = { ice:"#5BC4E8", fire:"#E84E25", umbra:"#A855F7", light:"#EDB72C", electric:"#00D9BB", blade:"#E05050" };

const CHARACTERS = [
  { id:"hibiki", name:"Hibiki Kohaku", tag:"SHADOW / CLONE", tier:"S", color:"#7B8FE4",
    img:"/chars/hibiki.png",
    talent:"Way of Assassination — all attacks deal bonus damage when hitting enemies from behind. Clones inherit this bonus.",
    legacySkill:"Shadow Ambush — spawns a clone that dashes behind the nearest enemy and strikes, dealing Umbra damage.",
    mechanics:[
      "Clones mirror ALL tactic procs — Shadow Spike, Thunderbolt, and elemental effects each trigger ×3",
      "Back-attack positioning doubles Shadow Spike proc value when combined with Way of Assassination",
      "Dodge has 3 charges — chain dodges cancel recovery frames entirely, enabling nearly limitless mobility",
      "Clones despawn after a set duration or after taking enough hits — prioritize kill speed over tanking"
    ],
    synergies:[
      "Jin (dodge slow field = free back-attacks)",
      "Noel (Evotype boosts ranged damage for clone turrets)",
      "Hakumen (AoE counter covers clone reset downtime)"
    ],
    tips:[
      "Always reposition behind enemies after summoning clones — the damage bonus stacks with clone procs",
      "Shadow Spike + 3 clones = 4 total procs per normal attack. At Legendary: 275 × 4 = 1100 per hit",
      "Dodge-cancel heavy normals to maintain clone uptime without taking hits"
    ],
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
        dps:[],
        radar:{burst:70,sustain:95,aoe:100,control:75,survival:80},
        crystals:["exhilaration", "defensive-combo", "giant-slayer", "summon-booster", "not-dead-yet", "straightforward"],
        crystalMath:"",
        morpheus:"The combo math here breaks the game. 3 clones + you hitting = 4 simultaneous combo counters. By stage 2 you're already at Exhilaration cap. At that point you're running 1500 effective attack × giant slayer × shadow spike proc loop. This isn't a build — it's a win condition on loop. Summon Booster over Resonance because clones are classified as summons — that's the sleeper pick most guides miss.",
        mathKey:"" },
      { id:"shadow_blade", name:"SHADOW BLADE", arch:"Precision Burst", rating:88,
        tactics:["Attack Shadow Spike (Umbra)","Skill Cold (Ice)","Dash Blade Slash (Blade)","Legacy Light Spear (Light)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Nov 2024 patch: Hibiki 'back attacks now grant damage increase — attacks no longer force enemies to turn'",
          "Shadow Spike on normals + back-attack talent = double-proc window on every repositioned attack",
          "Skill Cold: +47% on every skill at Legendary. Cold stacks slow enemies into back-attack territory",
          "Light Spear: 490 per legacy hit — massive boss damage on a 0-investment slot",
          "Ice Spike Respawn Double: autonomous turrets firing while you maintain back-attack positioning"
        ],
        dps:[],
        radar:{burst:90,sustain:65,aoe:40,control:70,survival:70},
        crystals:["straightforward", "domination", "giant-slayer", "phantom-step", "not-dead-yet", "legacy-amplifier"],
        crystalMath:"",
        morpheus:"The back-attack positioning this build requires is the hardest part — Phantom Step invincibility frames ARE the build. Without them you eat damage repositioning. With them you're untouchable. Legacy Amplifier on Light Spear is 245 free damage per use with zero skill investment. That's your burst window on bosses while clones cover you.",
        mathKey:"" },
      { id:"phantom_step", name:"PHANTOM STEP", arch:"Evasion Tank", rating:82,
        tactics:["Attack Cold (Ice)","Skill Thunderbolt (Light)","Dash Shadow (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "3× dodge potential + iframe on Dash Shadow Tactic = near-total invincibility rotation",
          "Blackhole legacy: full-screen area slow on every legacy cast — nothing can close distance",
          "Cold Attack: 46% dmg boost WHILE simultaneously reducing enemy speed to ~30% normal",
          "Steam: 'Hibiki is evasion tank — get 3 dodges and you zip through everything'",
          "Lightning Orb turret runs autonomously — full DPS maintained while focusing on dodge timing"
        ],
        dps:[],
        radar:{burst:50,sustain:80,aoe:65,control:100,survival:95},
        crystals:["phantom-step", "defensive-combo", "not-dead-yet", "indestructible", "giant-slayer", "exhilaration"],
        crystalMath:"",
        morpheus:"This is the build for learning high entropy without dying constantly. The math: 86% mitigation means you need 7× more hits to die vs naked runs. Giant Slayer keeps kill speed competitive so you're not slogging. This isn't a tank build — it's a dodge-chain DPS build that happens to be unkillable when played correctly.",
        mathKey:"" }
    ]
  },
  { id:"ragna", name:"Ragna the Bloodedge", tag:"MELEE / LIFESTEAL", tier:"B", color:"#D93025",
    img:"/chars/ragna.png",
    talent:"Blood Kain — HP falls below ~50% triggers a temporary multiplier on all damage output. The lower your HP, the more damage you deal.",
    legacySkill:"Blood Scythe Strike — unleashes a wide AoE Scythe wave that consumes HP but restores it for every enemy hit.",
    mechanics:[
      "Blood Scythe costs 27% HP per cast but heals on hit — net positive when hitting 3+ enemies",
      "Blood Kain activates at sub-50% HP — designed to be played in that range, not avoided",
      "Heavy Strike potential gives Blood Scythe super armor — cast through enemy attacks freely",
      "Invincibility frames on Blood Scythe activation can be used to absorb boss attacks"
    ],
    synergies:[
      "Kokonoe (zoning covers Ragna's melee-only blind spots)",
      "Hakumen (AoE counter = safety net during Blood Scythe recovery)",
      "Es (Crest generation sustains Ragna during low HP windows)"
    ],
    tips:[
      "Let your HP hover near 50% on purpose — this is Ragna's optimal combat state, not an emergency",
      "Pair Cold Attack to slow enemies into Blood Scythe range — every hit heals, so more hits = more HP",
      "Avoid max HP builds — more HP means Blood Kain activates less often"
    ],
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
        dps:[],
        radar:{burst:65,sustain:92,aoe:50,control:60,survival:78},
        crystals:["vital-boost", "not-dead-yet", "mixture-enhancement", "straightforward", "giant-slayer", "blood-pact"],
        crystalMath:"",
        morpheus:"Blood Kain activating at sub-50% is not a bug — it's the entire design. Vital Boost lets you sit at 50% of a much bigger pool, so the actual HP value is the same as a baseline full bar. You're not playing it wrong when you're low — that's the power state. Blood Pact is S-tier on Ragna specifically because it's the only character with a built-in HP-cost damage mechanic.",
        mathKey:"" },
      { id:"inferno", name:"INFERNO GOD", arch:"Max Burst / Glass", rating:78,
        tactics:["Attack Fire Spirit (Fire)","Skill Burn (Fire)","Dash Blade (Blade)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Full Fire tree enables Double Tactics: Fire Spirit Detonation = spirits explode on Burn enemies",
          "Fire Projectile focused: 280 × 10 = 2800 burst per skill cast when Focused Fire T2 narrows spread",
          "Fire Spirit: 190 per hit, spawns automatically, procs on every normal hit — passive DPS floor",
          "'All potentials enhancing Heavy Strike: wide AoE, breaks super armor, restores HP without HP cost'",
          "Ring of Fire at Legendary: 770 burst per Blood Scythe cast. Blood Scythe IS the legacy trigger"
        ],
        dps:[],
        radar:{burst:95,sustain:55,aoe:75,control:30,survival:50},
        crystals:["straightforward", "domination", "giant-slayer", "predator", "not-dead-yet", "chain-reaction"],
        crystalMath:"",
        morpheus:"5.1× is the theoretical ceiling — real number is closer to 3.5× in normal gameplay because you don't maintain all buffs simultaneously. But even 3.5× is insane. This build has no safety — it's designed to kill everything before it kills you. At entropy 60+ without Not Dead Yet you WILL die once per run. Accept it. The kill speed is worth it.",
        mathKey:"" },
      { id:"immortal", name:"IMMORTAL BRAWLER", arch:"Tank / Beginner-Proof", rating:80,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Shadow (Umbra)","Legacy Thunderbolt (Light)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Steam: 'Get 3 dashes + Heavy Strike heal + Cold = you cannot die. Ragna for beginners'",
          "Cold Attack: 46% damage boost + slowed enemies = safe Blood Scythe setup windows",
          "Light Spear: 490 per skill hit — consistent boss damage with no HP cost whatsoever",
          "Heavy Strike heals on hit once upgraded — self-sustaining loop, no management required",
          "Ice Spike Respawn Double: permanent auto-turrets attack while you focus on movement"
        ],
        dps:[],
        radar:{burst:55,sustain:72,aoe:60,control:88,survival:97},
        crystals:["not-dead-yet", "indestructible", "vital-boost", "mixture-enhancement", "second-wind", "giant-slayer"],
        crystalMath:"",
        morpheus:"This is the beginner-proof formula. You literally cannot die unless you make 8 separate mistakes in a row. The math on Second Wind alone is mental — that's a full heal EVERY stage meaning you're always topped off going into boss fights. Use this to learn Blood Kain timing. Once you understand the sub-50% power state, swap Indestructible for Domination.",
        mathKey:"" }
    ]
  },
  { id:"jin", name:"Jin Kisaragi", tag:"ICE / SWORD", tier:"S", color:"#4EA8D8",
    img:"/chars/jin.png",
    talent:"Frost Dodge — perfect dodge creates a lingering slow field that persists for 2 seconds, reducing all enemy speed in range by ~60%.",
    legacySkill:"Frost Coffin — encases all on-screen enemies in ice briefly, dealing Ice damage and stopping all movement.",
    mechanics:[
      "Ice stacks from normals and skills stack to 5 — at max, the next hit does bonus burst damage",
      "Frost Dodge field stacks with Ice tactics — enemies inside the field take full Cold Attack bonus",
      "Aerial normals have lower recovery than grounded — use jump-attacks to maintain ice stack pressure",
      "Dodge timing window is generous — focus on perfect dodges over raw evasion to generate slow fields"
    ],
    synergies:[
      "Hibiki (clones maintain Ice stacks in background while Jin repositions)",
      "Kokonoe (missiles maintain stacks from range)",
      "Rachel (wind control corrals enemies into Frost Dodge field)"
    ],
    tips:[
      "Frost Dodge + Cold Attack = enemies at ~30% speed. At this point, landing full ice stack combos is trivial",
      "Chain perfect dodges to maintain overlapping slow fields — near-permanent area slow on bosses",
      "Ice spike summons hold ice stacks on an enemy while you target others"
    ],
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
        dps:[],
        radar:{burst:75,sustain:85,aoe:70,control:100,survival:90},
        crystals:["domination", "giant-slayer", "ice-fortune", "mana-surge", "not-dead-yet", "lethal-momentum"],
        crystalMath:"",
        morpheus:"Ice Fortune is criminally underrated. The slot efficiency of converting the entire tactic pool into ice drops means you're not praying for Cold Attack to show up — it shows. At stage 2 you lock in double Cold. At stage 3 you upgrade to Freeze. By Omega Space nothing moves and everything dies fast. Mana Surge is mandatory because Jin's skill rotation eats MP like crazy.",
        mathKey:"" },
      { id:"lightning_parry", name:"LIGHTNING PARRY", arch:"Counter / Transcendence", rating:89,
        tactics:["Skill Light Spear (Light)","Attack Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Jin parry grants super armor + amplification — uninterruptible Light Spear = 490 unblockable dmg",
          "Chain Lightning bounces: 295 × 3 enemies = 885 per proc. At Jin's speed: ~1770 chain DPS alone",
          "Steam: 'Lightning > full Ice on Transcendence — don't need freeze when you can counter everything'",
          "Blackhole legacy creates setup window: everything frozen = clean parry on-demand vs bosses",
          "Full Light tree enables Lightning combo Doubles — Thunderbolt + Orb + Spear = triple slot synergy"
        ],
        dps:[],
        radar:{burst:88,sustain:70,aoe:85,control:80,survival:75},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "legacy-amplifier", "phantom-step"],
        crystalMath:"",
        morpheus:"The parry build has a skill ceiling but the math rewards it massively. That 3.15× spike happens in a single counter-punish window — for bosses with readable telegraphs, that's almost half their health. Phantom Step removes the risk because you can safely approach for bait positions without eating the attack. Most guides skip Legacy Amplifier here — don't.",
        mathKey:"" },
      { id:"blizzard_storm", name:"BLIZZARD STORM", arch:"AoE / Stage Speed", rating:87,
        tactics:["Attack Cold (Ice)","Skill Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Hybrid: Ice slow + Fire Spirit AoE = room clears in <1 second at high rarity",
          "Fire Spirit auto-attacks ALL Cold-slowed enemies simultaneously — more targets = more spirit procs",
          "Frost Burst clears entire rooms on max-stack trigger: zero positioning required",
          "Steam: 'Endless Ice Spikes + Shadow Ice Spikes = ice spirit turret shooting spikes automatically'",
          "Best Jin build for stage completion speed — significantly reduces run time vs boss kill optimization"
        ],
        dps:[],
        radar:{burst:65,sustain:90,aoe:97,control:85,survival:80},
        crystals:["straightforward", "giant-slayer", "ice-fortune", "exhilaration", "defensive-combo", "not-dead-yet"],
        crystalMath:"",
        morpheus:"This is the fastest stage clear in the Jin kit. Exhilaration rewards the constant contact that Blizzard style demands. Ice Fortune + Defensive Combo is the secret synergy — you're in the middle of frozen enemies, immune to 80% of their damage, accumulating combo stacks that feed Exhilaration. This is my recommended Jin build if you want to fly through runs.",
        mathKey:"" }
    ]
  },
  { id:"kokonoe", name:"Kokonoe Mercury", tag:"ZONING / SCIENCE", tier:"A", color:"#E8714A",
    img:"/chars/kokonoe.png",
    talent:"Missile Barrage — summon fires additional homing missiles passively after using skills, scaling with Summon potential upgrades.",
    legacySkill:"Gravity Trap — drops a gravitational device that pulls all nearby enemies to its center while dealing persistent damage.",
    mechanics:[
      "Missiles and lasers are independent damage sources — both benefit from Tactic procs simultaneously",
      "Laser has the highest single-target DPS in the game — prioritize Skill tactics for laser scaling",
      "Summon potential tree buffs missile count and homing ability — more missiles = exponentially more proc opportunities",
      "Kokonoe's hitbox is small — dodge is easier to time, enabling consistent Frost Dodge or similar combos from Evotypes"
    ],
    synergies:[
      "Jin (Frost Dodge slow corrals enemies into missile cluster)",
      "Es (Crest fields hold enemies still for laser)",
      "Blackhole legacy (gravitational pull concentrates enemies for missile AoE)"
    ],
    tips:[
      "Kokonoe's DPS ceiling is the highest in the roster — do not cap yourself by using attack-trigger tactics instead of skill-trigger",
      "Gravity Trap legacy + missile barrage = enemies cluster and take 5× missile hits before escaping",
      "Focus the Summon potential tree to missiles — each upgrade exponentially increases passive damage"
    ],
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
        dps:[],
        radar:{burst:75,sustain:98,aoe:85,control:80,survival:85},
        crystals:["resonance", "summon-booster", "giant-slayer", "not-dead-yet", "exhilaration", "domination"],
        crystalMath:"",
        morpheus:"17,070 per full missile cast is not an exaggeration — that's the math at max Exhilaration + both tactic amplifiers. In practice you're looking at 8-12k because enemies die before Exhilaration caps. Aerial positioning removes ALL risk — Kokonoe takes zero damage from ground-level attacks. Giant Slayer is mandatory because boss fights are where this DPS curve matters most.",
        mathKey:"" },
      { id:"missile_queen", name:"MISSILE QUEEN", arch:"Burst / Set-and-Forget", rating:90,
        tactics:["Skill Fire Projectile (Fire)","Attack Burn (Fire)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Fire Projectile: 10 × 280 = 2800 burst per skill cast when Focused Fire T2 narrows spread to single target",
          "Steam: 'Focus on missiles or lasers — both wreck entire screens. Satellite laser just tracks automatically'",
          "Attack Burn: 260 DoT/s passive on every target normals hit — zero-thought sustained DPS floor",
          "Light Spear: 490 per legacy hit — boss burst on a separate slot, never competes",
          "Community: 'Kokonoe satellite laser: set it and forget it — best set-and-forget in the game'"
        ],
        dps:[],
        radar:{burst:95,sustain:80,aoe:92,control:55,survival:70},
        crystals:["resonance", "domination", "giant-slayer", "lethal-momentum", "not-dead-yet", "fire-fortune"],
        crystalMath:"",
        morpheus:"Fire Fortune is the unlock key for this build. Getting Ring of Fire Double without Fortune is luck — with it you're nearly guaranteed it by stage 3. That Double transforms Ring of Fire from mediocre to full-screen AoE every dodge. Combined with Missile Queen's natural aerial advantage, you're dealing damage in every direction simultaneously.",
        mathKey:"" },
      { id:"dot_master", name:"DOT MASTER", arch:"Triple DoT Stack", rating:86,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Blade (Blade)","Legacy Ring of Fire (Fire)","Summon Fire Spirit (Fire)"],
        reasoning:[
          "Full Fire DoT: Skill Burn (360/s) + Attack Burn via Double (260/s) + Fire Spirit (190/hit) = 3 concurrent sources",
          "Catching Fire T2: for each burning enemy, next Burn deals +30% more damage — scales with pack size",
          "Fire Spirit Detonation Double: spirits explode when hitting Burned enemies = massive AoE chain reaction",
          "Ring of Fire at Legendary: 770 burst per legacy. Storm Ring of Fire Double = proc on every dodge",
          "Pure attrition engine — once 3 DoT sources running, even bosses melt as passive background damage"
        ],
        dps:[],
        radar:{burst:65,sustain:100,aoe:80,control:40,survival:72},
        crystals:["resonance", "giant-slayer", "not-dead-yet", "exhilaration", "fire-fortune", "straightforward"],
        crystalMath:"",
        morpheus:"DoT builds feel slow until you realize three simultaneous DoT stacks at Resonance-amplified values are running 24/7 with zero action from you. At Exhilaration cap with all three active: roughly 2,200 passive DPS before you touch a button. Bosses and elites are burning while you reposition. Giant Slayer makes this viable at entropy 70+ where boss HP pools get thick.",
        mathKey:"" }
    ]
  },
  { id:"es", name:"Es", tag:"CREST / SPATIAL", tier:"A", color:"#E878A0",
    img:"/chars/es.png",
    talent:"Crest Resonance — placing multiple Crests near each other causes them to resonate, dealing bonus damage when enemies pass through the field.",
    legacySkill:"Sealing Formation — places 4 Crests in a formation around the player that activate simultaneously on the next hit.",
    mechanics:[
      "Crests are placed by skills and remain on the field until triggered or expired — up to 8 active at once",
      "Aerial Crest skills have wider placement radius — use air combos to cover more terrain",
      "Crest Resonance damage is separate from the base Crest — it does not share the same cooldown",
      "Es can make enemies airborne — juggled enemies cannot attack and take bonus aerial hit damage"
    ],
    synergies:[
      "Kokonoe (Gravity Trap clusters enemies into Crest fields)",
      "Rachel (Wind control pushes enemies through multiple Crest lines)",
      "Hibiki (Shadow Clone triggers Crests independently of Es's attacks)"
    ],
    tips:[
      "Pre-place Crests before engaging elites — walk into combat with the trap already set",
      "Light Spear as Legacy fires into Crest clusters — each spear hit that passes through a Crest triggers it",
      "Aerial build Es stays airborne above Crest fields, raining hits down to trigger them safely"
    ],
    builds:[
      { id:"mine_bouncer", name:"MINE BOUNCER", arch:"Es-Exclusive / Highest Burst", rating:93,
        tactics:["Summon Mine (Fire)","Attack Cold (Ice)","Skill Burn (Fire)","Dash Shadow Spike (Umbra)","Legacy Thunderbolt (Light)"],
        reasoning:[
          "Steam: 'Es mines are REALLY overpowered — explode any enemies under you when going for bounces'",
          "Es aerial dive-combo: 3 bounces per string. Each bounce triggers mine detonation below",
          "Mine + Splashing Mine Double: detonations add shrapnel hits per community reports — exact count unverified",
          "Multiple bounces per aerial string, each triggers a detonation — Es-exclusive, other characters cannot reliably do this",
          "Cold Attack 46% boost on normals between bounces adds sustained damage on top of burst"
        ],
        dps:[],
        radar:{burst:100,sustain:60,aoe:95,control:70,survival:65},
        crystals:["domination", "lethal-momentum", "giant-slayer", "not-dead-yet", "exhilaration", "mana-surge"],
        crystalMath:"",
        morpheus:"This is the Es build that exploits the mine-bounce mechanic most guides gloss over. The dev note literally says Es can bounce mines off aerial hits — that's not a feature, that's a guaranteed 2480+ burst window every combo string. Domination is mandatory here because mines are skill-type. Lethal Momentum resets on every mine cast. You're looking at permanent ATK buff uptime with 3+ mine casts per fight.",
        mathKey:"" },
      { id:"crest_field", name:"CREST FIELD", arch:"Trap / Consistent", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Crest (Ice)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Double Cold: Attack Cold (46%) + Skill Cold (47%) on every input — enemies frozen at max stacks",
          "Crests placed at chokepoints detonate when enemies approach — guaranteed hit, no timing required",
          "Frozen enemies hit by Crest: zero movement speed = every crest detonation confirms full damage",
          "Lightning Orb as autonomous turret: DPS maintained while managing crest placement strategy",
          "Consistent at every entropy level — doesn't rely on aerial timing mastery like Mine Bouncer"
        ],
        dps:[],
        radar:{burst:80,sustain:75,aoe:80,control:95,survival:80},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "exhilaration", "defensive-combo"],
        crystalMath:"",
        morpheus:"Crest Field is deceptive — it looks like a setup build but it's actually a sustained DPS machine once crests are placed. Defensive Combo synergy is underrated here: crests trigger your combo counter passively, meaning you're protected even during repositioning windows. Resonance on crest hits is the math that makes this viable at high entropy.",
        mathKey:"" },
      { id:"speed_crest", name:"SPEED CREST", arch:"Mobility + Explosion", rating:88,
        tactics:["Attack Cold (Ice)","Skill Fire Spirit (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Mine (Fire)"],
        reasoning:[
          "Taokaka Evotype on Es = extreme mobility to drop mines mid-movement while maintaining crest chains",
          "Ring of Fire: 770 burst on legacy while dashing into crest detonation sequences",
          "Fire Spirit procs on every Cold-slowed enemy dashed through — movement procs DPS",
          "Steam: 'Es + Taokaka Evotype = mobility into detonation loops' — recommended community Evotype",
          "Mine + Fire Spirit interaction: mine explosion triggers Spirit Detonation Double on burning enemies"
        ],
        dps:[],
        radar:{burst:88,sustain:70,aoe:90,control:65,survival:72},
        crystals:["phantom-step", "domination", "giant-slayer", "not-dead-yet", "mixture-enhancement", "exhilaration"],
        crystalMath:"",
        morpheus:"Speed Crest is the highest skill expression Es build. Phantom Step is the enabler — you're dashing between crest placements, each dash is invincible, you're never actually in damage range. The movement pattern requires practice but once you have it the build is borderline unfair. Exhilaration rewards the constant movement — you're always accumulating.",
        mathKey:"" }
    ]
  },
  { id:"noel", name:"Noel Vermillion", tag:"RAPID / DRIVE", tier:"A", color:"#60A5FA",
    img:"/chars/noel.png",
    talent:"Drive Shot — attacking from maximum range triggers an additional Bloom hit that deals bonus damage. The farther you are, the more it adds.",
    legacySkill:"Bloom — fires a rapid burst of Bloom bullets in a spread pattern that each apply tactic procs on hit.",
    mechanics:[
      "Hold Attack (charged X) builds Drive gauge — release at full charge for a single high-damage hit that ignores many resistances",
      "Air combo (5-hit chain) can bypass most boss attack patterns — each hit applies elemental stacks",
      "Drive Shot range bonus means kiting backwards while attacking is always the correct positioning",
      "Bloom legacy fires multiple projectiles — each can independently proc Attack tactics like Cold Attack or Shadow Spike"
    ],
    synergies:[
      "Hakumen (counter skill buys time to maintain max-range positioning)",
      "Jin (Frost field keeps enemies at manageable range for Drive Shot bonus)",
      "Lambda (Blade tactics complement Noel's rapid multi-hit pattern)"
    ],
    tips:[
      "Never let enemies close distance — Drive Shot bonus only activates at max range",
      "Charged hold attack is free damage — no MP cost, high value. Work it into every combo cycle",
      "Bloom legacy fires spread pattern — position so multiple bullets hit the same target"
    ],
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
        dps:[],
        radar:{burst:70,sustain:100,aoe:80,control:65,survival:72},
        crystals:["straightforward", "defensive-combo", "giant-slayer", "exhilaration", "not-dead-yet", "combo-surge"],
        crystalMath:"",
        morpheus:"Noel is the king of Exhilaration and Combo Surge stacking because her attack frequency is the highest in the roster. The combo math: 8 hits/sec × 40s = 320 hits = 32 Exhilaration stacks (cap 40). You hit Exhilaration cap in 40 seconds of sustained combat. Defensive Combo means those 40 seconds are spent completely protected. This is the safest high-DPS setup in the game.",
        mathKey:"" },
      { id:"artillery_queen", name:"ARTILLERY QUEEN", arch:"Zoner / Mid-Range", rating:85,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Noel Drive: optimal spacing at mid-range where all projectile skills hit max hitboxes",
          "Skill Burn: 360/s DoT stacks with every Drive B skill cast — Noel casts 2-3 skills per combo",
          "Fire Spirit tracks targets automatically — pairs with Noel's aggressive forward pressure",
          "Ring of Fire: 770 burst on legacy. Noel mobility options allow safe legacy windows on bosses",
          "Shadow Spike: 275 proc on every normal — Drive A normals become burst damage tools"
        ],
        dps:[],
        radar:{burst:80,sustain:88,aoe:72,control:55,survival:68},
        crystals:["domination", "resonance", "giant-slayer", "not-dead-yet", "lethal-momentum", "mana-surge"],
        crystalMath:"",
        morpheus:"The long-range passive on Noel is her most underutilized mechanic. Most players play her like a melee brawler. This build forces correct positioning and the damage ceiling is dramatically higher. Lethal Momentum uptime is near-100% if you're skill-spamming from range — the ATK buff applies to both skills AND ranged normals. Mana Surge is mandatory to maintain the skill frequency.",
        mathKey:"" },
      { id:"frost_dancer", name:"FROST DANCER", arch:"Mobility / Untouchable", rating:82,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow (Umbra)","Legacy Blackhole (Umbra)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Double Cold on Noel's attack rate: max cold stacks reached in ~2 sec vs 5+ sec on other characters",
          "Dash Shadow: dodge becomes invisible burst — Noel 3-dash kit means triple invisible procs",
          "Blackhole legacy: Noel repositions mid-cast — full-screen slow while staying mobile",
          "Ice Spike Respawn turrets: auto-fire from multiple angles, no upkeep while Noel kites",
          "Frost Burst auto-clears rooms from rapid Cold stack accumulation — no stopping to cast AoE"
        ],
        dps:[],
        radar:{burst:55,sustain:80,aoe:75,control:95,survival:90},
        crystals:["phantom-step", "defensive-combo", "not-dead-yet", "giant-slayer", "ice-fortune", "exhilaration"],
        crystalMath:"",
        morpheus:"Frost Dancer is what Noel looks like when you play her right at high entropy. Phantom Step iframe chains into Cold-slowed enemies into Defensive Combo protection. The rhythm: dash (invincible) → attack in Cold-slowed enemies (protected) → dash again. You're never actually hit. Exhilaration just keeps climbing because you never stop attacking. Ice Fortune is the piece most guides skip.",
        mathKey:"" }
    ]
  },
  { id:"rachel", name:"Rachel Alucard", tag:"ZONING / WIND", tier:"A", color:"#D8B4FE",
    img:"/chars/rachel.png",
    talent:"Wind Control — Rachel's attacks generate Wind stacks on enemies. At 5 stacks, a burst of wind launches them airborne.",
    legacySkill:"Tempest Dahlia — fires a horizontal wind wave that gathers all enemies in its path toward the center of the screen.",
    mechanics:[
      "Sylph (wind familiar) attacks independently and generates its own Wind stacks — passive stack generation at all times",
      "Tempest Dahlia legacy gathers enemies from across the entire screen — best setup tool in the game",
      "George XIII (frog familiar) fires projectiles that apply elemental tactics on hit from the summon slot",
      "Rachel's mobility is low — use Tempest Dahlia to bring enemies to you rather than chasing"
    ],
    synergies:[
      "Kokonoe (missiles carpet-bomb the clustered enemies after Tempest Dahlia)",
      "Es (Crests placed mid-screen get triggered by gathered enemy cluster)",
      "Jin (Frost Dodge slows the gathered cluster for free stacks)"
    ],
    tips:[
      "Use Tempest Dahlia to group all enemies before using AoE skills — position right then burst",
      "Sylph uptime is more important than Rachel's direct attacks — always re-summon on cooldown",
      "Rachel thrives on high-enemy-count stages where Tempest Dahlia's gathering effect is most impactful"
    ],
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
        dps:[],
        radar:{burst:78,sustain:95,aoe:88,control:75,survival:70},
        crystals:["resonance", "summon-booster", "legacy-amplifier", "giant-slayer", "not-dead-yet", "exhilaration"],
        crystalMath:"",
        morpheus:"2,694 damage per bat lightning proc with zero player input is the Rachel passive DPS fantasy fully realized. The math compounds beyond what most guides account for: Resonance × Summon Booster × Legacy Amplifier is a triple multiplicative stack. No other character has three separate passive amplifiers that all apply to the same auto-attack source. Legacy Amplifier is the hidden S-tier pick for Rachel specifically.",
        mathKey:"" },
      { id:"wind_barrier", name:"WIND BARRIER", arch:"Trap / Control Field", rating:84,
        tactics:["Attack Cold (Ice)","Skill Frost Burst (Ice)","Dash Shadow Spike (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Rachel wind pushes enemies INTO Cold stacks faster — forced repositioning accelerates max-stack timing",
          "Frost Burst on max Cold: Rachel's wind clusters enemies = AoE burst hits clustered group simultaneously",
          "Blackhole + wind: double-layer CC — pull into Blackhole while wind pin + Cold slow active",
          "Shadow Spike: 275 per normal on a character that normals from safe range = sustained shadow DPS",
          "Lightning Orb field: Rachel places it at chokepoint, wind herds enemies through the turret"
        ],
        dps:[],
        radar:{burst:72,sustain:78,aoe:95,control:98,survival:75},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "indestructible", "exhilaration"],
        crystalMath:"",
        morpheus:"Wind Barrier is the tanky Rachel build and it needs Indestructible to function at entropy 70+. Her HP pool is too low to tank without it. With Indestructible + the wind field keeping enemies at bay, you take 30% less damage from everything that gets through. Resonance × Domination on field ticks is subtle — the field fires constantly, so those multipliers apply to a continuous DPS stream.",
        mathKey:"" },
      { id:"pumpkin_artillery", name:"PUMPKIN ARTILLERY", arch:"Long Range / Screen Control", rating:80,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Pumpkin bomb travels full screen — Skill Burn at 360/s stacks remotely on enemies across the stage",
          "Fire Spirit attacks whatever Rachel's pumpkin last hit — remote DoT application",
          "Ring of Fire: 770 burst on legacy. Rachel can trigger from full-screen safe distance",
          "Thunderbolt dash: Rachel wind-dash fires chain to nearest enemy = free DPS on repositions",
          "Orb turret covers Rachel's melee blind spot — pumpkin player never needs to close distance"
        ],
        dps:[],
        radar:{burst:82,sustain:75,aoe:80,control:70,survival:80},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "lethal-momentum", "fire-fortune"],
        crystalMath:"",
        morpheus:"Fire Fortune unlocking Ring of Fire Double transforms this build from interesting to broken. Without it you're hoping — with it by stage 3 you have Ring of Fire on every pumpkin detonation, hitting the entire screen. Rachel's unique positioning (floating, out of reach) combined with full-screen bombing is legitimately unfair on non-boss enemies. Lethal Momentum means each bomb resets your ATK buff.",
        mathKey:"" }
    ]
  },
  { id:"taokaka", name:"Taokaka", tag:"RUSH / BEAST", tier:"B", color:"#FCD34D",
    img:"/chars/taokaka.png",
    talent:"Combo Rush — each consecutive hit on the same enemy increases Taokaka's attack speed by 3% up to 10 stacks (30% total speed boost).",
    legacySkill:"Claw Assault — Taokaka dashes across the screen clawing through every enemy in her path, dealing multi-hit Blade damage.",
    mechanics:[
      "Dash distance is among the longest in the roster — use it aggressively to reposition mid-combo without losing momentum",
      "Combo Rush stacks reset if Taokaka stops attacking for more than 1 second — maintain pressure",
      "Aerial normals have faster recovery than ground normals — stay airborne during extended combo chains",
      "Taokaka's dodge has shortest recovery in the roster — mash dodge during boss patterns freely"
    ],
    synergies:[
      "Hibiki (Shadow Clone extends combo chains with additional hits)",
      "Noel (Bloom hits maintain combo momentum between Taokaka's gaps)",
      "Bullet (CQC damage bonus synergizes with Taokaka's close-range dash pattern)"
    ],
    tips:[
      "Prioritize Combo Rush maintenance — 30% attack speed translates to 30% more tactic procs per second",
      "Dash through enemies rather than around them — Claw Assault legacy activates in-dash",
      "Fire tactics suit Taokaka best — high hit frequency ignites burn stacks rapidly"
    ],
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
        dps:[],
        radar:{burst:82,sustain:75,aoe:90,control:70,survival:72},
        crystals:["exhilaration", "defensive-combo", "combo-surge", "giant-slayer", "not-dead-yet", "compliment-of-death"],
        crystalMath:"",
        morpheus:"10.5× damage multiplier is the Taokaka ceiling and it's actually achievable because of her raw hit rate. 33 seconds to Exhilaration cap — that's stage 2 early. By the time you hit bosses you're at max stacks. Compliment of Death at 12 hits/sec means you're healing every 1.7 seconds — effectively infinite sustain during combo chains. This build does not have a weakness when played correctly.",
        mathKey:"" },
      { id:"speed_demon", name:"SPEED DEMON", arch:"Hit-and-Run / Entropy Rush", rating:82,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold Attack: 46% on Taokaka's high-frequency hits. Stacks Cold in 1-2 sec vs slower characters' 5+ sec",
          "Light Spear: 490 per skill hit — Taokaka jump-cancel skills keep this proccing on repositions",
          "Ring of Fire: 770 burst on legacy. Taokaka's speed means legacy windows are safe vs any boss",
          "Thunderbolt: each of Taokaka's 4+ dashes fires chain to nearest enemy = passive 1300 chain DPS",
          "Lightning Orb: place, dash past enemies, let turret hit from behind while Taokaka attacks front"
        ],
        dps:[],
        radar:{burst:75,sustain:82,aoe:70,control:72,survival:78},
        crystals:["phantom-step", "exhilaration", "defensive-combo", "giant-slayer", "not-dead-yet", "chain-reaction"],
        crystalMath:"",
        morpheus:"Speed Demon is the entropy-rushing build. Chain Reaction synergy with Taokaka's kill speed is perfect — you're never NOT killing things fast enough to maintain stacks. Phantom Step lets you take the aggressive line every time without punishment. The loop: dodge in (invincible) → burst kill → Chain Reaction stacks → next fight with higher damage → repeat. Fastest stage clear in the game.",
        mathKey:"" },
      { id:"ambush_cat", name:"AMBUSH CAT", arch:"Surprise Burst / Flanker", rating:78,
        tactics:["Attack Cold (Ice)","Skill Burn (Fire)","Dash Shadow Spike (Umbra)","Legacy Blackhole (Umbra)","Summon Fire Spirit (Fire)"],
        reasoning:[
          "Dash Shadow Spike: Taokaka's dash IS a claw attack — every single dash procs 275 shadow damage",
          "Combined: 4 dashes/sec × 275 = 1100 shadow DPS just from moving",
          "Burn: 260 DoT/s on everything Taokaka's normals touch — always active given aggression playstyle",
          "Blackhole: forces all enemies into Taokaka's claw range — no chasing required",
          "Fire Spirit: auto-attacks, follows Taokaka's movement — forward pressure DPS with zero slot attention"
        ],
        dps:[],
        radar:{burst:88,sustain:68,aoe:65,control:80,survival:65},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "predator", "legacy-amplifier"],
        crystalMath:"",
        morpheus:"Predator is slept on for Taokaka because everyone just stacks raw damage, but the execute window math is dramatic. 1286 per legacy hit at execute range is a finisher, not a chip. The strategy: Straightforward + Domination gets enemies to 30% HP fast, then Predator + Legacy nuke closes the window. For bosses this means the final phase is extremely fast.",
        mathKey:"" }
    ]
  },
  { id:"lambda", name:"Lambda-11", tag:"BLADE / SWORDS", tier:"A", color:"#6EE7B7",
    img:"/chars/lambda.png",
    talent:"Aerial Advantage — Lambda deals increased damage while airborne. All aerial attacks have bonus hit stun, keeping enemies in juggle state longer.",
    legacySkill:"Sword Summoning — summons a ring of 8 spectral swords that orbit Lambda briefly then fire outward in all directions.",
    mechanics:[
      "Blade Summon (circle button) spawns orbiting swords that individually proc Attack tactics on each orbit pass",
      "Aerial attacks apply Aerial Advantage bonus — jump before every attack for maximum damage",
      "Sword Summoning legacy + Shadow Spike = 8 procs per cast at 275 each = 2200 burst from one button",
      "Lambda lacks horizontal mobility compared to other S-tier picks — compensate with vertical positioning"
    ],
    synergies:[
      "Es (Crest juggle keeps enemies airborne for Aerial Advantage duration)",
      "Noel (Drive Shot range bonus on Lambda's Blade projectiles)",
      "Hibiki (Clone shadow dashes maintain blade procs from multiple positions)"
    ],
    tips:[
      "Never fight on the ground — Lambda's entire kit scales off aerial positioning",
      "Sword Summoning legacy covers 360° — use it when surrounded rather than trying to dodge out",
      "Blade tactics with Lambda's summon: each orbiting sword counts as an independent hit for proc purposes"
    ],
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
        dps:[],
        radar:{burst:88,sustain:82,aoe:90,control:60,survival:72},
        crystals:["resonance", "exhilaration", "giant-slayer", "not-dead-yet", "summon-booster", "defensive-combo"],
        crystalMath:"",
        morpheus:"4 active swords × Resonance × Summon Booster is multiplicative, not additive. The community undersells this — Sword Rain at full Double upgrade is generating more autonomous DPS than most characters' active attacks. Exhilaration reward is also autonomous here: swords maintain your combo count while you reposition. Defensive Combo during your own attacks while swords do the heavy lifting = low-risk, high-reward.",
        mathKey:"" },
      { id:"cold_blades", name:"COLD BLADES", arch:"Freeze / Control", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Double Cold: Lambda swords count as attacks — each sword hit procs Cold, double-stacking fast",
          "Frost Burst: Lambda's sword spread means AoE hits the entire enemy group simultaneously",
          "Shadow Spike: 275 per sword hit — multi-sword combos mean 3-4 Shadow Spike procs per animation",
          "Ice Spike Respawn turrets: self-maintaining turret field that combines with Lambda's own sword field",
          "Frozen enemies with sword turrets active: entire screen of auto-damage from turrets and swords"
        ],
        dps:[],
        radar:{burst:70,sustain:88,aoe:88,control:95,survival:85},
        crystals:["resonance", "domination", "ice-fortune", "giant-slayer", "not-dead-yet", "exhilaration"],
        crystalMath:"",
        morpheus:"Cold Blades is Lambda's safest build because frozen enemies can't threaten you. Ice Fortune means Cold Attack shows guaranteed — no praying. The Resonance on Frost Burst is where this goes from strong to abusive: 728 AoE every time Cold stacks cap on a frozen group. In dense waves you're proc-ing Frost Burst on multiple enemies simultaneously.",
        mathKey:"" },
      { id:"umbra_blades", name:"UMBRA BLADES", arch:"Shadow Burst", rating:82,
        tactics:["Attack Shadow Spike (Umbra)","Skill Light Spear (Light)","Dash Shadow (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Shadow Spike × multi-hit swords: 275 × 3 sword hits = 825 shadow per cast, constant",
          "Blackhole legacy: Lambda places sword turrets inside Blackhole radius = auto-hit on everything pulled in",
          "Light Spear: 490 per skill — each Lambda skill cast is both swords AND spear, compounding",
          "Dash Shadow: every lambda reposition procs 275 shadow independently of sword hits",
          "Steam: 'Lambda sword summons are honestly free DPS — set them and they keep firing forever'"
        ],
        dps:[],
        radar:{burst:90,sustain:72,aoe:80,control:85,survival:70},
        crystals:["resonance", "summon-booster", "giant-slayer", "not-dead-yet", "exhilaration", "umbra-fortune"],
        crystalMath:"",
        morpheus:"6,708 per sword attack wave at Exhilaration cap is the math that makes Umbra Blades the highest ceiling Lambda build. Umbra Fortune is the key — without it getting Shadow Spike early is RNG. With it you're in a dedicated Umbra tactic loop by stage 2. Resonance × Summon Booster on sword Shadow Spike procs is a triple-dip that most guides don't calculate.",
        mathKey:"" }
    ]
  },
  { id:"mai", name:"Mai Natsume", tag:"SPEAR / NEEDLE", tier:"A", color:"#FB923C",
    img:"/chars/mai.png",
    talent:"Needle Precision — charged attacks always critical hit. Critical hits deal 150% of normal damage and apply elemental effects at double the rate.",
    legacySkill:"Tempest Throw — Mai throws multiple spears in a spreading fan formation that cover a wide horizontal area.",
    mechanics:[
      "Charge input: hold attack button to charge — releases automatically at max charge or on button release",
      "Spear throw skill covers a longer range than most normals — use it to apply elemental stacks from safety",
      "Needle Precision means charged attacks proc elemental tactics at double rate — Burn stacks hit 5 in half the time",
      "Mai generates tornadoes from specific skill chains — tornado persists on field and applies continuous tactic procs"
    ],
    synergies:[
      "Kokonoe (missile saturation covers Mai's charge downtime)",
      "Rachel (Tempest Dahlia groups enemies for Tempest Throw fan coverage)",
      "Jin (Ice stacks set up for Needle Precision crit chain)"
    ],
    tips:[
      "Never use quick attacks — always charge. The crit bonus + double elemental rate means uncharged hits are always suboptimal",
      "Tempest Throw + AoE Burn = massive DoT spread across fan range from a single legacy cast",
      "Tornado generation chains — learn the specific skill order that triggers them for your main builds"
    ],
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
        dps:[],
        radar:{burst:96,sustain:82,aoe:90,control:55,survival:70},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "exhilaration", "mana-surge"],
        crystalMath:"",
        morpheus:"8 needles per cast × Domination × Resonance is the correct math most guides miss — people calculate flat skill damage but not per-projectile. At 3248 per cast with 4 additional casts from Mana Surge: you're getting roughly 3248 × 7 = 22,736 needle damage per fight just from skills. That's before Exhilaration. This build stacks faster than any other Mai build.",
        mathKey:"" },
      { id:"frost_spear", name:"FROST SPEAR", arch:"Slow + Burst Combo", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Mai spear hits from full screen — Cold Attack procs on every hit, building stacks across the room",
          "Double Cold: 46%+47% on all spear throws regardless of range — unmatched safe damage boosting",
          "Frost Burst: when enemy has max stacks, Mai's spear from across stage triggers AoE burst safely",
          "Shadow Spike: 275 per spear hit — each throw procs shadow damage on every hit",
          "Ice Spike turrets: Mai never needs to close distance — turrets defend close range while she throws"
        ],
        dps:[],
        radar:{burst:75,sustain:88,aoe:85,control:92,survival:88},
        crystals:["domination", "ice-fortune", "giant-slayer", "not-dead-yet", "lethal-momentum", "exhilaration"],
        crystalMath:"",
        morpheus:"The Lethal Momentum uptime on Mai Spear is the key insight. Spear skills trigger it, then Cold slows enemies so they can't escape the buff window. You're hitting frozen enemies during your ATK buff with Domination applied. That's three multipliers on every spear hit in the window. Exhilaration climbs because Cold-slowed enemies stay in contact range — you're always hitting.",
        mathKey:"" },
      { id:"chain_spear", name:"CHAIN SPEAR", arch:"Multi-Hit Chain", rating:81,
        tactics:["Skill Chain Lightning (Light)","Attack Cold (Ice)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Chain Lightning: Mai spear hits multiple enemies = guaranteed bounce to 3 targets every throw",
          "295 × 3 enemies × Mai's throw rate = near-constant full-room chain lightning clearing",
          "Cold: 46% on spear hits + chain lightning area slowing = enemies don't reach Mai",
          "Blackhole: Mai throws spear INTO Blackhole center — chain lightning jumps to all pulled enemies",
          "Lightning Orb at midfield: covers mid-range gap between full-screen spear range and melee"
        ],
        dps:[],
        radar:{burst:72,sustain:88,aoe:92,control:80,survival:82},
        crystals:["resonance", "exhilaration", "giant-slayer", "not-dead-yet", "defensive-combo", "straightforward"],
        crystalMath:"",
        morpheus:"5250 per chain at Exhilaration cap with 5 ticks of Resonance is what Chain Spear actually does when properly built. The Defensive Combo pickup here is smart — during the chain animation you're locked into attack, Defensive Combo protects you for the entire cast. Giant Slayer: boss fights are where multi-hit chains truly shine since each hit counts separately toward elite damage bonus.",
        mathKey:"" }
    ]
  },
  { id:"hazama", name:"Hazama", tag:"CHAIN / COUNTER", tier:"B", color:"#86EFAC",
    img:"/chars/hazama.png",
    talent:"Ouroboros Counter — perfectly timed block converts incoming damage into a counter-strike chain, dealing damage proportional to the attack blocked.",
    legacySkill:"Chain Snare — fires a chain that hooks an enemy and holds them in place for 2 seconds, stunning them for guaranteed follow-up hits.",
    mechanics:[
      "Counter timing window is generous compared to Hakumen — can be held slightly longer before releasing",
      "Chain Snare locks a single enemy — use it on elites or bosses during their attack windup",
      "Ouroboros Counter damage scales with the ENEMY'S attack value — block strong hits to deal stronger counters",
      "Hazama's normal attack chain ends with a wide-range chain sweep — prioritize reaching the final hit in combos"
    ],
    synergies:[
      "Hakumen (counter stacking — both characters' counter skills can be cycled for near-continuous counter coverage)",
      "Noel (Bloom fills Hazama's damage gap while he waits for counter windows)",
      "Lambda (Sword Summoning covers the time between Hazama's counter opportunities)"
    ],
    tips:[
      "Block intentionally on hard hitting enemies — Ouroboros Counter on a boss heavy attack is your highest damage window",
      "Chain Snare + Shadow Spike = 2 seconds of free hits on a locked enemy. Cast every other proc in that window",
      "Hazama's mid-tier status is entirely playstyle dependent — counter mains outperform his rating; dashers underperform it"
    ],
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
        dps:[],
        radar:{burst:78,sustain:78,aoe:82,control:78,survival:68},
        crystals:["resonance", "exhilaration", "giant-slayer", "not-dead-yet", "umbra-fortune", "straightforward"],
        crystalMath:"",
        morpheus:"Umbra Fortune is mandatory for Hazama — Shadow Spike procs on chain whip are his power state, not nice-to-have. Without it you're spending stages hoping for Shadow Spike. With it you're in guaranteed Umbra loops by stage 2. The chain range means each whip extension hitting 3-5 enemies all proc Shadow Spike individually. At Exhilaration cap this is the highest sustained AoE in Hazama's kit.",
        mathKey:"" },
      { id:"snake_burn", name:"SNAKE BURN", arch:"DoT / Attrition", rating:78,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Skill Burn: 360/s on every Hazama skill. Ouroboros skill-chain = DoT stacks mid-whip animation",
          "Fire Spirit: auto-attacks everything Hazama's chain tagged — remote DoT application post-hit",
          "Ring of Fire: Hazama's Ouroboros pull draws enemies into Ring of Fire 770 burst radius",
          "Shadow Spike on dash: Hazama counter-dash 275 proc on every repositioning movement",
          "Lightning Orb at center: Hazama's chain traps enemies at mid-range near turret field"
        ],
        dps:[],
        radar:{burst:72,sustain:88,aoe:75,control:70,survival:65},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "fire-fortune", "exhilaration"],
        crystalMath:"",
        morpheus:"6,579 passive DoT on 3 targets simultaneously is Hazama's attrition fantasy. Fire Fortune guarantees the full Burn stack early. The play style is set-and-let: apply Burn to every enemy, reposition, let DoT handle cleanup. Domination + Resonance on Burn is the correct multiplier stack — most players only run one or the other and leave half the DPS on the table.",
        mathKey:"" },
      { id:"counter_god", name:"COUNTER GOD", arch:"Parry / Punish", rating:80,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Hazama counter is core mechanic: Thunderbolt on counter-dash = parry fires chain lightning",
          "Each successful counter: full Lightning chain + Cold stacking from the counter-attack follow-up",
          "Light Spear: 490 per skill after parry window — uninterruptible punish combo",
          "Blackhole on legacy: Hazama draws enemy in post-counter for extended punish window",
          "Cold Attack: 46% on all counter follow-up attacks — every parry becomes a 1.46× damage window"
        ],
        dps:[],
        radar:{burst:85,sustain:65,aoe:62,control:85,survival:80},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "phantom-step", "legacy-amplifier"],
        crystalMath:"",
        morpheus:"Counter God Hazama is the hardest build to play and the most satisfying. Phantom Step removes the only weakness — approaching parry range. Legacy Amplifier on a counter legacy is the synergy: your parry triggers the legacy hit for 735 × 3.15× multiplier. That's a 2315 spike damage window on every successful parry. At Entropy 80+ where timing is tight, this build rewards mastery.",
        mathKey:"" }
    ]
  },
  { id:"hakumen", name:"Hakumen", tag:"VOID / COUNTER", tier:"S", color:"#F1F5F9",
    img:"/chars/hakumen.png",
    talent:"Void Counter — any successful counter or block activates a brief period of super armor, making Hakumen immune to stagger during the counter animation.",
    legacySkill:"Suzaku — Hakumen performs a wide rising counter-slash that hits all enemies in a large radius, dealing extreme Light damage.",
    mechanics:[
      "Hakumen's counter has the largest input window in the game — he is the best character for learning boss patterns",
      "Super armor during counter means you can absorb multiple hits simultaneously and still activate the counter-strike",
      "Light Spear tactics perfectly complement counter builds — Suzaku legacy activates Light procs on all hit enemies",
      "Charged heavy attack hits a massive AoE zone — covers most of the screen, ideal for clearing enemy clusters"
    ],
    synergies:[
      "Ragna (Blood Scythe during Hakumen counter window = both deal massive damage in same frame)",
      "Kokonoe (missiles apply Light stacks between Hakumen's slow counter-timing windows)",
      "Jin (Frost field freezes enemies, trivializing Hakumen counter timing)"
    ],
    tips:[
      "Never rush. Hakumen is a read-based character — wait for enemy attack animation, then counter",
      "Void Counter super armor means you can trade hits during the counter itself — don't dodge, block",
      "Light Spear + Suzaku = every legacy cast spreads Light Spear procs to all on-screen enemies simultaneously"
    ],
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
        dps:[],
        radar:{burst:98,sustain:72,aoe:80,control:92,survival:90},
        crystals:["straightforward", "giant-slayer", "not-dead-yet", "legacy-amplifier", "phantom-step", "domination"],
        crystalMath:"",
        morpheus:"3300 per charged hit on a boss is genuinely one of the highest single-hit numbers in the game. Hakumen's Magatama multiplier is rarely factored in — at full charge it's approximately a 2× internal multiplier before any crystal buffs. Legacy Amplifier on HIS OWN Light Spear legacy is the hidden interaction: take Hakumen as legacy on Hakumen. 735 per hit, full Magatama = absurd.",
        mathKey:"" },
      { id:"magatama_field", name:"MAGATAMA FIELD", arch:"Attrition / Unstoppable", rating:88,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Double Cold: Hakumen's heavy hits stack Cold in 2-3 hits despite slower rate — per-hit Cold value maxes",
          "Frost Burst: Hakumen's tank build — AoE burst on demand from Cold stacks, no positioning",
          "Shadow Spike on dash counter: 275 on Hakumen's counter-dash = Shadow Spike + parry damage",
          "Lightning Orb: 245 DPS turret autonomously maintains damage during Hakumen's long attack animations",
          "Hakumen naturally survives everything — Cold+Orb means DPS runs even during recovery frames"
        ],
        dps:[],
        radar:{burst:70,sustain:92,aoe:88,control:96,survival:95},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "indestructible", "exhilaration"],
        crystalMath:"",
        morpheus:"Magatama Field is Hakumen's autopilot mode and it's surprisingly viable at high entropy because Indestructible covers his slow-character weakness. The field generates Exhilaration stacks autonomously — you don't need to be actively hitting. At cap the field is doing 420 × 3 = 1260 DPS continuously with zero input. Resonance is what makes this work — without it the field DPS is underwhelming.",
        mathKey:"" },
      { id:"infinity_sword", name:"INFINITY SWORD", arch:"Burst / One-Shot Window", rating:84,
        tactics:["Skill Light Spear (Light)","Attack Shadow Spike (Umbra)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Hakumen One-Eyed King magatama charge: full bar = fully invincible for 3 sec + multiplied skill",
          "Light Spear on charged skill during invincible frame = 490 uncontested flat damage",
          "Shadow Spike on every Hakumen normal: 275 per hit × slow-but-heavy normal = sustained shadow floor",
          "Ring of Fire: Hakumen's One-Eyed King becomes Ring trigger — 770 burst guaranteed every cast",
          "Steam: 'Hakumen is pure power fantasy when built correctly — one charged skill does boss phase skip'"
        ],
        dps:[],
        radar:{burst:100,sustain:60,aoe:70,control:78,survival:82},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "apex-predator", "lethal-momentum"],
        crystalMath:"",
        morpheus:"2020 on the first charged hit before Magatama multiplier is applied is a one-shot condition for most non-boss enemies. The opening burst strategy: heal to full between stages (Second Wind), enter fight with Apex Predator active, immediately skill-use for Lethal Momentum, charge Light Spear. That's a 2020+ first hit that removes the threat before it starts. High-risk if you take any damage first.",
        mathKey:"" }
    ]
  },
  { id:"bullet", name:"Bullet", tag:"SHELL / CQC", tier:"B", color:"#F97316",
    img:"/chars/bullet.png",
    talent:"Shell Load — Bullet's specials load additional shell charges. At max charge, the next special deals 200% damage with added screen shake effect.",
    legacySkill:"Inferno Divider — Bullet performs a high-speed spinning dive kick that deals massive CQC Fire damage in a vertical column.",
    mechanics:[
      "Shell gauge fills passively and from hits — manage it to ensure max-charge specials align with elite/boss spawn timing",
      "CQC range requirement means Bullet must be in melee — prioritize survival through aggression, not evasion",
      "Inferno Divider legacy is a vertical attack — effective against aerial enemies and as a launcher into juggle combos",
      "Bullet's dash is shorter than most — compensate with aggression timing rather than distance-based repositioning"
    ],
    synergies:[
      "Taokaka (Combo Rush attack speed synergizes with Bullet's high hit frequency CQC range)",
      "Hazama (Chain Snare locks enemies in melee range for Bullet's optimal engagement zone)",
      "Ragna (Blood Scythe AoE covers Bullet's limited range during shell loading downtime)"
    ],
    tips:[
      "Shell Load max charge + Fire Double Tactic = one shot potential on most non-boss enemies",
      "Inferno Divider can hit airborne enemies — use it as an anti-air launcher then continue with ground combos",
      "Stay in melee at all times — Bullet is statistically worse the farther she is from her target"
    ],
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
        dps:[],
        radar:{burst:82,sustain:85,aoe:68,control:60,survival:68},
        crystals:["straightforward", "exhilaration", "defensive-combo", "giant-slayer", "not-dead-yet", "combo-surge"],
        crystalMath:"",
        morpheus:"24.6× is absurd and yes it's real math. The caveat: you need 40+ seconds of sustained combat at close range to reach it. Against bosses that's very achievable — Defensive Combo keeps you safe, Exhilaration keeps stacking, Giant Slayer makes elites a non-issue. The trade is you have to commit. Bullet doesn't have range so this build plays to her only strength: face-to-face at full send.",
        mathKey:"" },
      { id:"steel_shell", name:"STEEL SHELL", arch:"Sustain / Counter-Damage", rating:79,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Shadow Spike (Umbra)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold Attack: 46% on Bullet's heavy normals. Slow + heavy = safe CQC extension windows",
          "Light Spear: 490 per skill. Bullet's grab-skills are unblockable — Light Spear during grab = confirmed",
          "Shadow Spike on dash: 275 per closing dash — Bullet's approach is always offensively valued",
          "Blackhole: Bullet draws all enemies into CQC range — Blackhole IS Bullet's ideal state",
          "Lightning Orb: covers Bullet's only weakness (full-screen ranged) — turret handles what Bullet can't"
        ],
        dps:[],
        radar:{burst:72,sustain:80,aoe:60,control:82,survival:78},
        crystals:["not-dead-yet", "indestructible", "vital-boost", "mixture-enhancement", "second-wind", "giant-slayer"],
        crystalMath:"",
        morpheus:"Steel Shell is Bullet for people who refuse to die. 9× effective HP is not theoretical — that's the actual number of times you can survive if every resource procs optimally. Against entropy 60-70 where one-shots start happening, this is the correct response. Once you're comfortable surviving, swap Second Wind for Exhilaration and start stacking damage on top of the survivability base.",
        mathKey:"" },
      { id:"demolition_round", name:"DEMOLITION ROUND", arch:"Burst Damage / All-In", rating:76,
        tactics:["Attack Shadow Spike (Umbra)","Skill Chain Lightning (Light)","Dash Thunderbolt (Light)","Legacy Light Spear (Light)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Shadow Spike: 275 per Bullet normal. Bullet's combo strings hit 3-4 times = 825-1100 shadow per combo",
          "Chain Lightning from Bullet's CQC position: guaranteed 3-target bounce at melee range every time",
          "Light Spear on legacy: 490 burst during Bullet's invincible super = fully uncontested hit",
          "Thunderbolt: approach dash fires lightning — every single engagement opens with chain lightning",
          "Highest raw burst combo of any Bullet build — but fragile, requires good heat management"
        ],
        dps:[],
        radar:{burst:95,sustain:55,aoe:75,control:65,survival:60},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "predator", "chain-reaction"],
        crystalMath:"",
        morpheus:"Same 5.1× ceiling as Ragna Inferno, same strategy: accept you die occasionally in exchange for kill speed that ends fights before damage matters. Demolition Round is Bullet's glass cannon and it requires the same mentality — keep Not Dead Yet as your only insurance, dump everything else into damage. At entropy 50-60 this is the fastest boss kill time in Bullet's kit.",
        mathKey:"" }
    ]
  },
  { id:"naoto", name:"Naoto Kurogane", tag:"BLOOD / HUNTER", tier:"S", color:"#F87171",
    img:"/chars/naoto.png",
    talent:"Blood Weapon Charge — all of Naoto's attacks can be empowered by holding the attack button. Charged attacks deal 180-250% base damage and apply bonus elemental stacks.",
    legacySkill:"Bloodline Annihilation — Naoto unleashes a full-screen blood wave in both directions, hitting all enemies and applying bleed stacks that deal damage over time.",
    mechanics:[
      "Dash into an attack immediately: charging dashes builds Blood Weapon charge faster than standing",
      "Bleed stacks from Bloodline Annihilation stack with Fire Burn — two DoT sources running simultaneously",
      "Naoto's charged attack animation has lower recovery than Ragna's Blood Scythe — safer burst window",
      "X-exclusive character — only available in Entropy Effect X update content"
    ],
    synergies:[
      "Hazama (Chain Snare locks enemies while Naoto charges Blood Weapon for free)",
      "Mai (Needle Precision crit rate stacks with Naoto's Charge mechanic for guaranteed crits)",
      "Hibiki (Shadow Clone procs Bloodline Annihilation legacy's proc count ×3)"
    ],
    tips:[
      "Always dash before attacking — the momentum from dash-cancel into charge attack is Naoto's highest damage combo",
      "Bloodline Annihilation hits both sides — position centrally before casting to hit maximum targets",
      "Naoto is the recommended beginner character in X — his charged attack mechanic teaches fundamentals applicable to every character"
    ],
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
        dps:[],
        radar:{burst:88,sustain:78,aoe:70,control:85,survival:78},
        crystals:["fatal-blow", "focus", "giant-slayer", "not-dead-yet", "straightforward", "hunters-mark"],
        crystalMath:"",
        morpheus:"The correct crit math is expected value, not peak value. At 55% crit rate + 75% crit dmg, every hit averages 1.41× — that's not a crit build anymore, that's just a universal +41% to all damage expressed through crits. Hunter's Mark on top makes every boss fight a +83% effective damage scenario. This is actually more consistent than stacking Straightforward/Domination because it applies to ALL damage sources simultaneously.",
        mathKey:"" },
      { id:"blood_restriction", name:"BLOOD RESTRICTION", arch:"Lockdown / Drain", rating:89,
        tactics:["Attack Cold (Ice)","Skill Burn (Fire)","Dash Chain Lightning (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold: 46% on Naoto's fast normals. Stacks fast from high attack rate — max stacks in ~2 sec",
          "Burn: 260/s DoT stacks on every hit + Restriction Drive skill = DoT everywhere, fast",
          "Chain Lightning on dash: Naoto's mobility is high — each reposition fires chain to 3 enemies",
          "Blackhole + Restriction Drive: double-lock — Naoto's own Drive + Blackhole = full stun loop",
          "Steam: 'Naoto Restriction builds are oppressive — enemies just can't function against him'"
        ],
        dps:[],
        radar:{burst:72,sustain:92,aoe:80,control:98,survival:82},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "blood-pact", "vital-boost"],
        crystalMath:"",
        morpheus:"Blood Pact is Naoto-specific in a way it isn't for anyone else — he has multiple HP-cost attacks in his kit, not just one. Blood Restriction build treats HP as a damage resource explicitly. Vital Boost lets you spend HP more aggressively before reaching danger range. The math: more HP = more Blood Edge casts = more Blood Pact procs = more damage. Counterintuitive but accurate.",
        mathKey:"" },
      { id:"death_touch", name:"DEATH TOUCH", arch:"Single-Target / Boss Killer", rating:86,
        tactics:["Skill Light Spear (Light)","Attack Shadow Spike (Umbra)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Naoto's Drive increases damage vs singular target — all single-target tactics synergize",
          "Light Spear: 490 per skill × Naoto fast-cast rate = highest Spear DPS of any character",
          "Shadow Spike: 275 per normal × Naoto's rapid combo rate = ~825 shadow DPS floor minimum",
          "Ring of Fire: 770 burst per legacy. Drive activation is legacy-adjacent — timing is natural",
          "Thunderbolt: Naoto's approach dash = free chain lightning on every boss engage"
        ],
        dps:[],
        radar:{burst:92,sustain:75,aoe:65,control:72,survival:75},
        crystals:["fatal-blow", "focus", "giant-slayer", "not-dead-yet", "predator", "chain-reaction"],
        crystalMath:"",
        morpheus:"5.37× on elite enemies in execute phase is the highest expected-value damage multiplier in Naoto's kit. Death Touch is designed around the execute fantasy — you don't need to deal with full-HP tanking because crits + Predator + Chain Reaction close fights before they reach the sustained-damage phase. Focus + Fatal Blow builds hit this ceiling faster than any raw-damage stack. This is my recommended Naoto build for high entropy.",
        mathKey:"" }
    ]
  },
  { id:"icey", name:"ICEY", tag:"PIXEL / DANCER", tier:"A", color:"#A78BFA",
    img:"/chars/icey.png",
    talent:"Pixel Perfect — ICEY's dash has the shortest iframe window in the game, but landing a kill within 0.5s of a dash grants a brief invincibility buff.",
    legacySkill:"EX Mode — ICEY temporarily enters a powered state, increasing all damage by 30% and dash speed by 50% for 5 seconds.",
    mechanics:[
      "Unique crossover character with gameplay closer to her home game — attacks are faster and chain more fluidly than BlazBlue cast",
      "EX Mode legacy stacks multiplicatively with elemental tactic bonuses — activate it during maximum tactic saturation for peak DPS",
      "ICEY's aerial combos chain indefinitely with proper timing — airborne juggle is her strongest sustained DPS pattern",
      "Her normal attack chain has the fastest animation frames on cancel — maximizes tactic proc frequency"
    ],
    synergies:[
      "Lambda (Aerial Advantage + ICEY aerial combo = both characters' bonuses active simultaneously)",
      "Noel (Drive Shot range adds to ICEY's normally close-range kit)",
      "Naoto (Blood Weapon charge fills during ICEY's fast attack chains)"
    ],
    tips:[
      "EX Mode + Shadow Spike at Legendary = 275 × 30% EX bonus per proc during EX window",
      "Cancel every normal into a dash — Pixel Perfect kill-dash chain is ICEY's primary sustain mechanic",
      "ICEY is the most beginner-accessible character for players unfamiliar with BlazBlue — her patterns are more forgiving"
    ],
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
        dps:[],
        radar:{burst:85,sustain:88,aoe:85,control:68,survival:75},
        crystals:["exhilaration", "defensive-combo", "combo-surge", "giant-slayer", "not-dead-yet", "straightforward"],
        crystalMath:"",
        morpheus:"ICEY is the character that reaches Exhilaration cap fastest after Taokaka. 33 seconds is stage 1 boss fight length. By stage 2 you're at cap. The dance movement mechanic means Defensive Combo is effectively permanent — you're always attacking, always moving, always protected. Combo Surge on top of Exhilaration is the stack that no other build description fully accounts for: 10.5× is real.",
        mathKey:"" },
      { id:"frozen_dance", name:"FROZEN DANCE", arch:"AoE Clear / Speed Run", rating:85,
        tactics:["Attack Cold (Ice)","Skill Cold (Ice)","Dash Shadow Spike (Umbra)","Legacy Frost Burst (Ice)","Summon Ice Spike (Ice)"],
        reasoning:[
          "Double Cold on ICEY's high hit-rate: max Cold stacks in under 2 sec during dance combo",
          "Frost Burst: ICEY's AoE dance hits entire screen on trigger — all frozen enemies burst simultaneously",
          "Shadow Spike on dance dashes: ICEY's dance moves trigger Shadow Spike independently",
          "Ice Spike Respawn turrets: auto-fire fills DPS gaps between dance combo sequences",
          "Best ICEY build for stage-speed clearing — frozen enemies never interrupt dance flow"
        ],
        dps:[],
        radar:{burst:72,sustain:88,aoe:95,control:90,survival:82},
        crystals:["exhilaration", "ice-fortune", "giant-slayer", "not-dead-yet", "defensive-combo", "domination"],
        crystalMath:"",
        morpheus:"Ice Fortune is the enabler here — ICEY's natural mobility means she applies Cold stacks faster than any character. Frozen enemies are slowed to the point where you can dance through them freely. Defensive Combo protects during those dance contacts. At 6.35× ceiling with consistent Cold stack application, this is the easiest ICEY build to maintain at high entropy because frozen enemies can't punish you.",
        mathKey:"" },
      { id:"blade_dance", name:"BLADE DANCE", arch:"Raw Power / Finisher", rating:82,
        tactics:["Attack Shadow Spike (Umbra)","Skill Burn (Fire)","Dash Thunderbolt (Light)","Legacy Ring of Fire (Fire)","Summon Fire Spirit (Fire)"],
        reasoning:[
          "Shadow Spike: ICEY's rapid dance combos hit 5-6× per sequence = 275 × 5 = 1375 burst per dance",
          "Burn: 360/s on skills. ICEY skill-chains mid-dance constantly = perpetual DoT stack",
          "Ring of Fire: 770 burst per legacy. ICEY trigger window during super-dash = safe legacy",
          "Fire Spirit follows ICEY's target — auto-attacks carry between dance repositions",
          "Thunderbolt on dash: every dance step between sequences fires chain lightning"
        ],
        dps:[],
        radar:{burst:95,sustain:72,aoe:78,control:60,survival:68},
        crystals:["straightforward", "domination", "giant-slayer", "not-dead-yet", "predator", "lethal-momentum"],
        crystalMath:"",
        morpheus:"5.34× in execute window is the cleanest burst ceiling in ICEY's kit. Blade Dance is straightforward (pun intended) — three damage multipliers, a finisher, and Not Dead Yet as your only safety. The skill frequency means Lethal Momentum is always active if you're playing correctly. Predator converts the final 30% of every boss HP bar into a dramatically faster kill. Simple, effective, high ceiling.",
        mathKey:"" }
    ]
  },
  { id:"prisoner", name:"The Prisoner", tag:"DEAD CELLS / BRUTAL", tier:"A", color:"#94A3B8",
    img:"/chars/prisoner.png",
    talent:"Dead Cells Arsenal — The Prisoner carries over one bonus weapon effect from the previous room as a passive buff. Each room cleared can change the active effect.",
    legacySkill:"Brutality Surge — channels Dead Cells energy to instantly apply Burn, Bleed, and Ice stacks simultaneously to all visible enemies.",
    mechanics:[
      "Unique Dead Cells crossover character — mechanics are intentionally asymmetric to BlazBlue cast",
      "Dead Cells Arsenal bonus changes each room — prioritize rooms with damage-type bonuses matching your tactic build",
      "Brutality Surge applies three elemental stacks at once — enables triple-element tactic builds that other characters cannot achieve",
      "The Prisoner has no fixed skill tree upgrades — potentials are drawn from a randomized Dead Cells loot table each run"
    ],
    synergies:[
      "Rachel (Tempest Dahlia clusters enemies for Brutality Surge multi-stack application)",
      "Kokonoe (missile saturation during Dead Cells Arsenal offensive buff windows)",
      "Es (Crest fields hold enemies for Brutality Surge's triple elemental application)"
    ],
    tips:[
      "Brutality Surge is the only ability in the game that applies three elements simultaneously — build your entire tactic set around all three",
      "Monitor which Dead Cells Arsenal effect is active each room — adjust your engagement range accordingly",
      "The Prisoner is highest-skill-ceiling character in X — mastery requires Dead Cells knowledge AND BlazBlue mechanics"
    ],
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
        dps:[],
        radar:{burst:82,sustain:85,aoe:85,control:75,survival:80},
        crystals:["exhilaration", "straightforward", "giant-slayer", "not-dead-yet", "chain-reaction", "defensive-combo"],
        crystalMath:"",
        morpheus:"9.47× vs elite enemies is the highest normalized multiplier in The Prisoner's kit. Chain Reaction synergy with his mobile kill-chain playstyle is perfect — he's already designed to kill things fast and move on. Defensive Combo during his melee strings keeps him protected between movements. Exhilaration is the payoff for maintaining that constant aggression. This is the Dead Cells feeling replicated mechanically.",
        mathKey:"" },
      { id:"bloodlust_run", name:"BLOODLUST RUN", arch:"DoT / Attrition Machine", rating:86,
        tactics:["Skill Burn (Fire)","Attack Fire Spirit (Fire)","Dash Shadow Spike (Umbra)","Legacy Ring of Fire (Fire)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Burn: 360/s DoT stacks with Prisoner's high-damage skills. Each hit counts from any weapon",
          "Fire Spirit: auto-attacks after every weapon hit — Prisoner weapon variety means spirits fire constantly",
          "Shadow Spike on roll: Prisoner's roll-dodge fires Shadow Spike = 275 per every evasion",
          "Ring of Fire: 770 burst on every legacy. Prisoner's skill timing is flexible = frequent legacy windows",
          "Steam: 'Prisoner DoT build: you set it up and it runs itself — true to Dead Cells auto-build style'"
        ],
        dps:[],
        radar:{burst:80,sustain:92,aoe:78,control:65,survival:75},
        crystals:["resonance", "domination", "giant-slayer", "not-dead-yet", "fire-fortune", "exhilaration"],
        crystalMath:"",
        morpheus:"6,579 passive DoT with The Prisoner still actively attacking is the attrition variant of his kit. Fire Fortune unlocks the full burn stack reliably — critical for a character who relies on tactic availability. The Prisoner's mobility means he's never stuck in range of burning enemies — apply DoT, move to next target, everything dies behind you. Domination + Resonance on Burn is the correct compound stack.",
        mathKey:"" },
      { id:"brutalist_melee", name:"BRUTALIST MELEE", arch:"Heavy / Boss Wrecker", rating:83,
        tactics:["Attack Cold (Ice)","Skill Light Spear (Light)","Dash Thunderbolt (Light)","Legacy Blackhole (Umbra)","Summon Lightning Orb (Electric)"],
        reasoning:[
          "Cold Attack: 46% on Prisoner's melee hits. Heavy melee weapons stack Cold in ~3 hits",
          "Light Spear: 490 per skill — Prisoner's charged heavy skills are slow but unblockable",
          "Blackhole: traps boss mid-arena — Prisoner closes distance for full heavy combo confirm",
          "Thunderbolt on roll: Prisoner's roll-in approach fires chain lightning before melee contact",
          "Lightning Orb: covers Prisoner's gap between heavy swings — fills animation downtime with DPS"
        ],
        dps:[],
        radar:{burst:78,sustain:78,aoe:68,control:88,survival:80},
        crystals:["straightforward","domination","giant-slayer","not-dead-yet","phantom-step","hunters-mark"],
        crystalMath:"",
        morpheus:"Hunter's Mark on The Prisoner is underexplored. 4.37× on marked elites applies to EVERY damage source simultaneously — attacks, tactic procs, legacy hits, all get the 30% bonus. Phantom Step makes the mobile approach risk-free. Strong, safe, consistent — no complicated mechanics required.",
        mathKey:"" }
    ]
  }
];


// ── CRYSTAL DATA REFERENCE (mirrors MindCrystals.jsx for build display) ──────
const CRYSTAL_DATA = {
  "straightforward":  {name:"Straightforward",  cat:"DAMAGE",   col:"#E53935", icon:"⚔",  base:"ATK DMG +30%",   asc:"ATK DMG +45%"},
  "domination":       {name:"Domination",        cat:"DAMAGE",   col:"#E53935", icon:"🔱", base:"Skill DMG +30%", asc:"Skill DMG +45%"},
  "giant-slayer":     {name:"Giant Slayer",       cat:"DAMAGE",   col:"#E53935", icon:"🗡", base:"Elite DMG +40%", asc:"Elite DMG +60%"},
  "combo-surge":      {name:"Combo Surge",        cat:"DAMAGE",   col:"#E53935", icon:"⚡", base:"+4% ATK/10 combo (cap 200%)", asc:"+5% ATK/10 combo (cap 250%)"},
  "lethal-momentum":  {name:"Lethal Momentum",    cat:"DAMAGE",   col:"#E53935", icon:"💢", base:"On Skill: ATK +30% 5s", asc:"On Skill: ATK +45% 6s"},
  "predator":         {name:"Predator",           cat:"DAMAGE",   col:"#E53935", icon:"🔥", base:"vs low HP enemies +50%", asc:"vs low HP enemies +75%"},
  "not-dead-yet":     {name:"Not Dead Yet",       cat:"SURVIVAL", col:"#F59E0B", icon:"🛡", base:"1× cheat death, +50% HP", asc:"1× cheat death, +70% HP"},
  "indestructible":   {name:"Indestructible",     cat:"SURVIVAL", col:"#F59E0B", icon:"🔒", base:"DMG recv -20%",   asc:"DMG recv -30%"},
  "defensive-combo":  {name:"Defensive Combo",    cat:"SURVIVAL", col:"#F59E0B", icon:"🛡", base:"DMG recv -70% in combo", asc:"DMG recv -80% in combo"},
  "vital-boost":      {name:"Vital Boost",        cat:"SURVIVAL", col:"#F59E0B", icon:"❤", base:"Max HP +80%",     asc:"Max HP +100%"},
  "compliment-of-death":{name:"Compliment of Death",cat:"SURVIVAL",col:"#F59E0B",icon:"💚",base:"Heal 10% HP / 20 combo", asc:"Heal 15% HP / 20 combo"},
  "second-wind":      {name:"Second Wind",        cat:"SURVIVAL", col:"#F59E0B", icon:"🌀", base:"Enter space <100% HP → full heal", asc:"(strengthened)"},
  "store-regen":      {name:"Commerce Healing",   cat:"SURVIVAL", col:"#F59E0B", icon:"💊", base:"Heal on shop purchase", asc:"Heal more on purchase"},
  "mana-surge":       {name:"Mana Surge",         cat:"ECONOMY",  col:"#60A5FA", icon:"💧", base:"Max MP +50",      asc:"Max MP +80"},
  "mixture-enhancement":{name:"Mixture Enhancement",cat:"ECONOMY",col:"#60A5FA",icon:"⚗", base:"HP Mixture +2, effect +20%", asc:"HP Mixture +3, effect +35%"},
  "point-surge":      {name:"Point Surge",        cat:"ECONOMY",  col:"#60A5FA", icon:"💠", base:"Exchange Points +30%", asc:"Exchange Points +45%"},
  "ice-fortune":      {name:"Ice Fortune",        cat:"ECONOMY",  col:"#60B8D4", icon:"❄", base:"Ice Tactic drop rate ↑", asc:"greatly ↑"},
  "fire-fortune":     {name:"Fire Fortune",       cat:"ECONOMY",  col:"#E84E25", icon:"🔥", base:"Fire Tactic drop rate ↑", asc:"greatly ↑"},
  "umbra-fortune":    {name:"Umbra Fortune",      cat:"ECONOMY",  col:"#A855F7", icon:"🌑", base:"Umbra Tactic drop rate ↑", asc:"greatly ↑"},
  "light-fortune":    {name:"Light Fortune",      cat:"ECONOMY",  col:"#EDB72C", icon:"✨", base:"Light Tactic drop rate ↑", asc:"greatly ↑"},
  "electric-fortune": {name:"Electric Fortune",   cat:"ECONOMY",  col:"#22C55E", icon:"⚡", base:"Electric Tactic drop rate ↑", asc:"greatly ↑"},
  "exhilaration":     {name:"Exhilaration",       cat:"UTILITY",  col:"#C9A227", icon:"🌟", base:"+4% ALL DMG/10 combo (cap 200%)", asc:"+5% ALL DMG/10 combo (cap 250%)"},
  "focus":            {name:"Focus",              cat:"UTILITY",  col:"#C9A227", icon:"🎯", base:"Crit Rate +15%",  asc:"Crit Rate +25%"},
  "fatal-blow":       {name:"Fatal Blow",         cat:"UTILITY",  col:"#C9A227", icon:"💀", base:"Crit DMG +50%",   asc:"Crit DMG +75%"},
  "resonance":        {name:"Resonance",          cat:"UTILITY",  col:"#C9A227", icon:"🔊", base:"Tactic DMG +25%", asc:"Tactic DMG +40%"},
  "recovery-field":   {name:"Recovery Field",     cat:"DEFENSE",  col:"#4ADE80", icon:"💚", base:"HP on Elite kill", asc:"More HP on Elite kill"},
  "damage-shield":    {name:"Damage Shield",      cat:"DEFENSE",  col:"#4ADE80", icon:"🔰", base:"Absorb 100 DMG/hit (recharges)", asc:"Absorb 150 DMG/hit"},
  "adrenaline":       {name:"Adrenaline",         cat:"DEFENSE",  col:"#4ADE80", icon:"⚡", base:"Speed +20% at <50% HP", asc:"Speed +30% at <50% HP"},
  "iron-will":        {name:"Iron Will",          cat:"DEFENSE",  col:"#4ADE80", icon:"🏋", base:"Super armor at <30% HP", asc:"Super armor at <40% HP"},
  "phantom-step":     {name:"Phantom Step",       cat:"ADVANCED", col:"#A78BFA", icon:"👻", base:"Dash = brief invincibility", asc:"More iframes on dash"},
  "combo-extender":   {name:"Combo Extender",     cat:"ADVANCED", col:"#A78BFA", icon:"🔗", base:"Combo timer +40%", asc:"Combo timer +60%"},
  "legacy-amplifier": {name:"Legacy Amplifier",   cat:"ADVANCED", col:"#A78BFA", icon:"📡", base:"Legacy Skill DMG +35%", asc:"Legacy Skill DMG +50%"},
  "summon-booster":   {name:"Summon Booster",     cat:"ADVANCED", col:"#A78BFA", icon:"🐉", base:"Summon Tactic DMG +30%", asc:"Summon Tactic DMG +45%"},
  "overcharge":       {name:"Overcharge",         cat:"ADVANCED", col:"#A78BFA", icon:"⚡", base:"SP gain rate +25%", asc:"SP gain rate +40%"},
  "hunters-mark":     {name:"Hunter's Mark",      cat:"ADVANCED", col:"#A78BFA", icon:"🎯", base:"Marked enemy takes +20% DMG", asc:"Marked enemy takes +30% DMG"},
  "blood-pact":       {name:"Blood Pact",         cat:"ADVANCED", col:"#A78BFA", icon:"🩸", base:"HP-cost abilities +20% DMG", asc:"HP-cost abilities +35% DMG"},
  "apex-predator":    {name:"Apex Predator",      cat:"ADVANCED", col:"#A78BFA", icon:"👑", base:"At full HP, all DMG +25%", asc:"At full HP, all DMG +35%"},
  "chain-reaction":   {name:"Chain Reaction",     cat:"ADVANCED", col:"#A78BFA", icon:"⛓", base:"Kill → +10% DMG 8s (×3)", asc:"Kill → +12% DMG 10s (×3)"},
};

function CrystalSlot({id, size=44, mob=false}) {
  const d = CRYSTAL_DATA[id];
  if(!d) return (
    <div style={{width:size,height:size,border:"2px solid #1A1A1A",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#2A2A2A",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textAlign:"center",padding:2}}>?</div>
  );
  return (
    <div title={`${d.name}: ${d.asc}`} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"default"}}>
      <svg width={size} height={size} viewBox="0 0 48 48" style={{flexShrink:0}}>
        <defs>
          <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={d.col} stopOpacity="0.85"/>
            <stop offset="100%" stopColor={d.col} stopOpacity="0.25"/>
          </linearGradient>
        </defs>
        <polygon points="24,3 41,13 41,35 24,45 7,35 7,13" fill={`url(#bg-${id})`} stroke={d.col} strokeWidth="1.5" opacity="0.95"/>
        <polygon points="24,8 37,15 37,33 24,40 11,33 11,15" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.25"/>
        <text x="24" y="29" textAnchor="middle" fontSize="16" fill="#fff">{d.icon}</text>
      </svg>
      <div style={{fontSize:mob?7:8,fontWeight:700,color:"#686868",letterSpacing:0.5,textAlign:"center",lineHeight:1.1,maxWidth:mob?42:52,fontFamily:"'Barlow Condensed',sans-serif",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{d.name}</div>
      <div style={{fontSize:mob?7:8,color:d.col,letterSpacing:0,textAlign:"center",lineHeight:1,maxWidth:mob?42:52,fontFamily:"'Courier Prime',monospace",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{d.base}</div>
    </div>
  );
}

function BuildCrystalPanel({build, char, mob=false}) {
  const [showMorpheus, setShowMorpheus] = React.useState(false);
  const S = {
    card:{background:"#0D0D0D",border:"1px solid #1A1A1A",padding:mob?"12px":"20px",marginBottom:14},
    label:{fontSize:mob?9:10,letterSpacing:mob?2:3,color:"#4A4A4A",fontWeight:700,marginBottom:mob?6:10,fontFamily:"'Barlow Condensed',sans-serif"},
    mathBox:{background:"#0B0B0B",border:"1px solid #1A1A1A",borderLeft:"3px solid #B91C1C",padding:mob?"8px 10px":"12px 14px",fontFamily:"'Courier Prime',monospace",fontSize:mob?10:12,color:"#C9A227",lineHeight:1.6,marginBottom:8,wordBreak:"break-word",overflowWrap:"break-word"},
    morBtn:{background:"transparent",border:"1px solid #B91C1C",color:"#B91C1C",padding:mob?"5px 10px":"6px 16px",fontSize:mob?9:11,letterSpacing:mob?1:3,fontWeight:900,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.12s",width:mob?"100%":"auto"},
    morBox:{background:"#0F0000",border:"1px solid #B91C1C",borderLeft:"4px solid #B91C1C",padding:mob?"8px 10px":"12px 14px",fontFamily:"'Courier Prime',monospace",fontSize:mob?10:12,color:"#D0D0D0",lineHeight:1.6,marginTop:8,wordBreak:"break-word",overflowWrap:"break-word"},
  };
  return (
    <div style={S.card}>
      <div style={S.label}>RECOMMENDED MIND CRYSTALS — ASCENDED</div>
      {/* 6 crystal slots */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${mob?3:6},1fr)`,gap:mob?6:10,marginBottom:14}}>
        {(build.crystals||[]).map(id=>(<CrystalSlot key={id} id={id} size={mob?36:44} mob={mob}/>))}
      </div>
      {/* Crystal math */}
      {build.crystalMath && (
        <>
          <div style={S.label}>CRYSTAL MATH — REAL DATA</div>
          <div style={S.mathBox}>{build.crystalMath}</div>
        </>
      )}
      {/* Morpheus analysis toggle */}
      {build.morpheus && (
        <>
          <button style={S.morBtn} onClick={()=>setShowMorpheus(p=>!p)}>
            {showMorpheus ? "▲ MORPHEUS ANALYSIS" : "▼ MORPHEUS ANALYSIS"}
          </button>
          {showMorpheus && (
            <div style={S.morBox}>
              <div style={{fontSize:9,letterSpacing:3,color:"#B91C1C",marginBottom:6,fontWeight:900}}>// MORPHEUS — BEYOND THE MATH</div>
              {build.morpheus}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HomePage({setTab, cfg={}, mob=false}) {
  const [hovered, setHovered] = useState(null);
  const tiers = {S:"#E53935", A:"#FF8F00", B:"#1976D2"};

  const features = [
    {
      id:"builds",
      label:"BUILD ANALYZER",
      desc:"48 curated builds across all 16 characters. Full DPS math, radar profiles, tactic loadouts, crystal synergy breakdowns, and Morpheus analysis per build.",
      stat:"48 BUILDS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="2" y="18" width="6" height="12" fill="#B91C1C" opacity="0.9"/><rect x="10" y="12" width="6" height="18" fill="#C9A227" opacity="0.9"/><rect x="18" y="6" width="6" height="24" fill="#B91C1C" opacity="0.7"/><rect x="26" y="2" width="4" height="28" fill="#C9A227" opacity="0.5"/><polyline points="5,18 13,12 21,6 28,2" stroke="#F0EDE5" strokeWidth="1.5" fill="none" strokeDasharray="2 2"/></svg>),
    },
    {
      id:"tactics",
      label:"TACTICS DATABASE",
      desc:"20 tactics across 5 elements with rarity scaling charts, damage math, element coverage analysis, and tier justifications per slot.",
      stat:"20 TACTICS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#B91C1C" strokeWidth="1.5" fill="none"/><circle cx="16" cy="16" r="8" stroke="#C9A227" strokeWidth="1" fill="none" opacity="0.6"/><circle cx="16" cy="16" r="3" fill="#B91C1C"/><line x1="16" y1="3" x2="16" y2="8" stroke="#B91C1C" strokeWidth="1.5"/><line x1="16" y1="24" x2="16" y2="29" stroke="#B91C1C" strokeWidth="1.5"/><line x1="3" y1="16" x2="8" y2="16" stroke="#B91C1C" strokeWidth="1.5"/><line x1="24" y1="16" x2="29" y2="16" stroke="#B91C1C" strokeWidth="1.5"/></svg>),
    },
    {
      id:"guide",
      label:"CHARACTER GUIDE",
      desc:"Full leveling paths per build, core mechanics, talent breakdowns, Evotype synergy notes, and Morpheus personal tips for all 16 characters.",
      stat:"16 CHARS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="2" width="20" height="26" rx="1" stroke="#C9A227" strokeWidth="1.5" fill="none"/><rect x="6" y="6" width="10" height="1.5" fill="#B91C1C" opacity="0.8"/><rect x="6" y="10" width="14" height="1" fill="#555"/><rect x="6" y="13" width="14" height="1" fill="#555"/><rect x="6" y="16" width="10" height="1" fill="#555"/><rect x="6" y="19" width="12" height="1" fill="#555"/><path d="M22 20 L30 16 L22 12 Z" fill="#C9A227" opacity="0.9"/></svg>),
    },
    {
      id:"crystals",
      label:"MIND CRYSTALS",
      desc:"All 38 crystals catalogued with base vs ascended stats, category breakdowns, damage math, and build recommendations per crystal.",
      stat:"38 CRYSTALS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><polygon points="16,2 28,10 28,22 16,30 4,22 4,10" stroke="#C9A227" strokeWidth="1.5" fill="none"/><polygon points="16,7 23,12 23,20 16,25 9,20 9,12" stroke="#B91C1C" strokeWidth="1" fill="none" opacity="0.5"/><circle cx="16" cy="16" r="3" fill="#C9A227" opacity="0.8"/></svg>),
    },
    {
      id:"calc",
      label:"FUSION LAB",
      desc:"163 character fusion combinations — every possible pairing covered. Legacy move picker, Evotype builder, Fusion Lab with full synergy math and crystal recommendations.",
      stat:"163 FUSIONS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="10" cy="10" r="6" stroke="#B91C1C" strokeWidth="1.5" fill="none"/><circle cx="22" cy="22" r="6" stroke="#C9A227" strokeWidth="1.5" fill="none"/><path d="M14 14 L18 18" stroke="#F0EDE5" strokeWidth="1.5" strokeDasharray="2 2"/><circle cx="10" cy="10" r="2" fill="#B91C1C" opacity="0.7"/><circle cx="22" cy="22" r="2" fill="#C9A227" opacity="0.7"/></svg>),
    },
    {
      id:"evotype",
      label:"EVOTYPE PLANNER",
      desc:"Build and save Evotype loadouts per character. Legacy move + talent picker, 2-tactic slot builder, strategy notes, and clipboard export for sharing.",
      stat:"16 × 4 BUILDS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="18" rx="1" stroke="#A78BFA" strokeWidth="1.5" fill="none"/><rect x="4" y="8" width="24" height="6" fill="#A78BFA" opacity="0.15"/><line x1="9" y1="11" x2="23" y2="11" stroke="#A78BFA" strokeWidth="1" opacity="0.6"/><rect x="8" y="18" width="7" height="4" rx="0.5" stroke="#A78BFA" strokeWidth="1" fill="none" opacity="0.6"/><rect x="17" y="18" width="7" height="4" rx="0.5" stroke="#C9A227" strokeWidth="1" fill="none" opacity="0.6"/><path d="M16 6 L16 8" stroke="#A78BFA" strokeWidth="1.5"/><circle cx="16" cy="5" r="2" fill="#A78BFA" opacity="0.7"/></svg>),
    },
    {
      id:"tier",
      label:"TIER LIST",
      desc:"Interactive drag-and-drop tier lists for characters, tactics, and crystals. Pre-loaded with Morpheus rankings. Save your own, add notes per tier, export to Discord.",
      stat:"S → C TIERS",
      icon:(<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="2" y="4" width="28" height="6" rx="0.5" fill="#E53935" opacity="0.2" stroke="#E53935" strokeWidth="1"/><rect x="2" y="13" width="28" height="5" rx="0.5" fill="#F97316" opacity="0.15" stroke="#F97316" strokeWidth="1"/><rect x="2" y="21" width="28" height="5" rx="0.5" fill="#EAB308" opacity="0.1" stroke="#EAB308" strokeWidth="1"/><text x="6" y="9" fill="#E53935" fontSize="5" fontWeight="900" fontFamily="sans-serif">S</text><text x="6" y="17" fill="#F97316" fontSize="5" fontWeight="900" fontFamily="sans-serif">A+</text><text x="6" y="25" fill="#EAB308" fontSize="5" fontWeight="900" fontFamily="sans-serif">A</text></svg>),
    },
  ];

  const stats = [
    {val:"163", label:"FUSION COMBOS"},
    {val:"16",  label:"CHARACTERS"},
    {val:"48",  label:"BUILDS"},
    {val:"38",  label:"CRYSTALS"},
  ];

  return (
    <div style={{flex:1, overflowY:"auto", overflowX:"hidden", background:"#080808"}}>
      <style>{`
        @keyframes homeSlideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes statCount {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scanH {
          0%   { transform:translateY(-100%); }
          100% { transform:translateY(800%); }
        }
        @keyframes pulseRed {
          0%,100% { box-shadow: 0 0 0 0 rgba(185,28,28,0); }
          50%     { box-shadow: 0 0 24px 4px rgba(185,28,28,0.35); }
        }
        @keyframes borderGlow {
          0%,100% { opacity:0.4; }
          50%     { opacity:1; }
        }
        @keyframes charReveal {
          from { opacity:0; transform:scale(0.96) translateY(10px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        .home-hero    { animation: homeSlideUp 0.6s ease both; }
        .home-stats   { animation: homeSlideUp 0.6s ease 0.15s both; }
        .home-feat    { animation: homeSlideUp 0.6s ease 0.3s both; }
        .home-roster  { animation: homeSlideUp 0.6s ease 0.45s both; }
        .feat-card:hover { transform: translateY(-3px); border-color: rgba(185,28,28,0.6) !important; }
        .feat-card { transition: transform 0.18s ease, border-color 0.18s ease; }
        .char-card:hover .char-img { transform: scale(1.06); filter: brightness(1.1) saturate(1.1); }
        .char-card:hover .char-name { color: var(--char-color) !important; }
        .char-img { transition: transform 0.22s ease, filter 0.22s ease; }
        .char-card { cursor: pointer; }
        .enter-btn:hover { background: #B91C1C !important; color: #fff !important; }
        .enter-btn { transition: background 0.15s ease, color 0.15s ease; }
      `}</style>

      {/* ── HERO ── */}
      <div className="home-hero" style={{position:"relative",overflow:"hidden",height:mob?200:360,background:"#030303",display:"flex"}}>

        {/* Character portrait strip — left 55%, stacked 4 tall */}
        <div style={{position:"absolute",inset:0,display:"flex",gap:0}}>
          {/* 8 portrait columns, each clipped diagonally */}
          {[
            {img:"/chars/naoto.png",  col:"#F87171"},
            {img:"/chars/hakumen.png",col:"#F1F5F9"},
            {img:"/chars/jin.png",    col:"#4EA8D8"},
            {img:"/chars/es.png",     col:"#E878A0"},
            {img:"/chars/hibiki.png", col:"#7B8FE4"},
            {img:"/chars/ragna.png",  col:"#D93025"},
            {img:"/chars/noel.png",   col:"#60A5FA"},
            {img:"/chars/kokonoe.png",col:"#E8714A"},
          ].map((c,i)=>(
            <div key={i} style={{
              flex:1,
              clipPath:`polygon(${i===0?0:8}% 0%, 100% 0%, ${i===7?100:92}% 100%, 0% 100%)`,
              position:"relative",overflow:"hidden",
              marginLeft: i>0 ? "-2%" : 0,
            }}>
              <img src={c.img} alt="" style={{
                width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",
                display:"block",
                filter:"brightness(0.28) saturate(0.6)",
                transition:"filter 0.3s",
              }}/>
              {/* Thin color accent at bottom */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:"2px",background:c.col,opacity:0.5}}/>
            </div>
          ))}
        </div>

        {/* Progressive overlay — dark left, fades right where text lives */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg, rgba(3,3,3,0.15) 0%, rgba(3,3,3,0.5) 42%, rgba(3,3,3,0.92) 62%, #030303 100%)"}}/>
        {/* Top fade */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:80,background:"linear-gradient(#030303,transparent)"}}/>
        {/* Bottom fade */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:100,background:"linear-gradient(transparent,#080808)"}}/>

        {/* Vertical divider line */}
        <div style={{position:"absolute",left:"58%",top:0,bottom:0,width:"1px",
          background:"linear-gradient(to bottom,transparent 5%,rgba(185,28,28,0.4) 30%,rgba(201,162,39,0.3) 70%,transparent 95%)"}}/>

        {/* ── TEXT BLOCK — right side ── */}
        <div style={{
          position:"absolute",right:0,top:0,bottom:0,
          width:mob?"65%":"46%",
          display:"flex",flexDirection:"column",justifyContent:"center",
          padding:mob?"0 16px 16px 16px":"0 52px 24px 32px",
        }}>
          {/* Eyebrow */}
          <div style={{
            fontSize:9,letterSpacing:5,color:"#B91C1C",fontWeight:900,
            fontFamily:"'Barlow Condensed',sans-serif",
            marginBottom:16,
            display:"flex",alignItems:"center",gap:10,
          }}>
            <div style={{width:20,height:"1px",background:"#B91C1C"}}/>
            BLAZBLUE ENTROPY EFFECT X
            <div style={{width:20,height:"1px",background:"#B91C1C"}}/>
          </div>

          {/* Main title */}
          <div style={{
            fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",
            fontWeight:900,
            lineHeight:0.88,
            letterSpacing:"1px",
            marginBottom:20,
          }}>
            <div style={{fontSize:mob?"clamp(28px,7vw,42px)":"clamp(52px,5.5vw,80px)",color:"#F7F3EE",display:"block"}}>TACTICS</div>
            <div style={{
              fontSize:mob?"clamp(28px,7vw,42px)":"clamp(52px,5.5vw,80px)",
              color:"#B91C1C",
              display:"block",
              WebkitTextStroke:"1px rgba(255,80,40,0.4)",
              textShadow:"0 0 40px rgba(185,28,28,0.5)",
            }}>CODEX</div>
          </div>

          {/* Descriptor */}
          <div style={{
            fontSize:11,letterSpacing:3,color:"#3A3A3A",
            fontFamily:"'Courier Prime',monospace",
            marginBottom:28,
          }}>THE DEFINITIVE BUILD REFERENCE — V5.0</div>


        </div>
      </div>
      {/* ── STATS BAR ── */}
      {cfg.showStatsBar!==false ? <div className="home-stats" style={{
        display:"flex", alignItems:"stretch",
        borderTop:"2px solid #B91C1C", borderBottom:"1px solid #161616",
        background:"#0A0A0A", overflowX:"auto", overflowY:"hidden",
      }}>
        {stats.map((s,i)=>(
          <div key={s.label} style={{
            flex:1, padding:"18px 0", textAlign:"center",
            borderRight: i < stats.length-1 ? "1px solid #1A1A1A" : "none",
          }}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"clamp(28px,3vw,44px)",color:"#B91C1C",lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:10,letterSpacing:3,color:"#444",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{s.label}</div>
          </div>
        ))}
      </div> : null}

      {/* ── FEATURE CARDS ── */}
      {cfg.showFeatureCards !== false && <div className="home-feat" style={{padding:"40px 40px 0"}}>
        <div style={{fontSize:11,letterSpacing:4,color:"#3A3A3A",fontWeight:900,marginBottom:20,fontFamily:"'Barlow Condensed',sans-serif"}}>TOOLS</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:mob?8:14}}>
          {features.map(f=>(
            <div key={f.id} className="feat-card" onClick={()=>setTab(f.id)}
              style={{
                background:"#0D0D0D", border:"1px solid #1E1E1E",
                padding:mob?"14px":"24px 24px 22px", position:"relative", overflow:"hidden",
                cursor:"pointer",
              }}>
              {/* Top accent line */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,#B91C1C,transparent)"}}/>
              {/* Diagonal corner cut */}
              <div style={{position:"absolute",top:0,right:0,width:0,height:0,borderStyle:"solid",borderWidth:"0 28px 28px 0",borderColor:`transparent #080808 transparent transparent`}}/>

              <div style={{marginBottom:16}}>{f.icon}</div>
              <div style={{fontSize:13,letterSpacing:3,color:"#B91C1C",fontWeight:900,marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif"}}>{f.stat}</div>
              <div style={{fontSize:18,fontWeight:900,color:"#F0EDE5",letterSpacing:1,marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif"}}>{f.label}</div>
              <div style={{fontSize:12,color:"#555",lineHeight:1.7,fontFamily:"'Courier Prime',monospace"}}>{f.desc}</div>
              <div className="enter-btn" style={{
                display:"inline-block",marginTop:18,padding:"7px 20px",
                border:"1px solid #2A2A2A", background:"transparent",
                fontSize:10,letterSpacing:3,color:"#444",fontWeight:700,
                fontFamily:"'Barlow Condensed',sans-serif",
              }}>ENTER</div>
            </div>
          ))}
        </div>
      </div>}

      {/* ── CHARACTER ROSTER ── */}
      {cfg.showRosterGrid !== false && <div className="home-roster" style={{padding:"40px 40px 48px"}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24}}>
          <div style={{fontSize:11,letterSpacing:4,color:"#3A3A3A",fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif"}}>PROTOTYPE ROSTER</div>
          <div style={{flex:1,height:"1px",background:"#1A1A1A"}}/>
          <div style={{fontSize:10,letterSpacing:2,color:"#2A2A2A",fontFamily:"'Courier Prime',monospace"}}>16 PLAYABLE</div>
        </div>
        <div className="home-roster-grid" style={{display:"grid",gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(8,1fr)",gap:mob?4:8}}>
          {CHARACTERS.map((c,i)=>(
            <div key={c.id} className="char-card" onClick={()=>setTab("builds")}
              style={{"--char-color":c.color, animationDelay:`${i*0.04}s`}}
            >
              {/* Portrait */}
              <div style={{position:"relative",overflow:"hidden",aspectRatio:"3/4",background:"#0D0D0D",border:"1px solid #1A1A1A"}}>
                <img className="char-img" src={c.img} alt={c.name}
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",display:"block"}}
                  onError={e=>{e.target.style.display="none"}}
                />
                {/* Gradient overlay */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"linear-gradient(transparent,rgba(0,0,0,0.92))"}}/>
                {/* Tier badge */}
                <div style={{
                  position:"absolute",top:6,right:6,
                  background:tiers[c.tier]+"22",color:tiers[c.tier],
                  border:`1px solid ${tiers[c.tier]}`,
                  fontSize:9,fontWeight:900,padding:"2px 6px",letterSpacing:1,
                  fontFamily:"'Barlow Condensed',sans-serif",
                }}>{c.tier}</div>
                {/* Name */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 8px 7px"}}>
                  <div className="char-name" style={{
                    fontSize:10,fontWeight:900,letterSpacing:0.5,
                    color:"#D0D0D0",lineHeight:1.2,
                    fontFamily:"'Barlow Condensed',sans-serif",
                    transition:"color 0.15s",
                  }}>{c.name.toUpperCase()}</div>
                  <div style={{fontSize:8,color:"#3A3A3A",letterSpacing:1,marginTop:2,fontFamily:"'Courier Prime',monospace"}}>{c.tag}</div>
                </div>
                {/* Left accent bar on hover handled via CSS */}
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:"2px",background:c.color,opacity:0.7}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom call to action */}
        <div style={{
          marginTop:32, padding:"22px 28px",
          background:"#0A0A0A", border:"1px solid #1A1A1A",
          borderLeft:"3px solid #B91C1C",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,letterSpacing:2,color:"#F0EDE5"}}>READY TO BUILD?</div>
            <div style={{fontSize:11,color:"#444",letterSpacing:2,marginTop:4,fontFamily:"'Courier Prime',monospace"}}>SELECT A CHARACTER AND LOAD A BUILD PROFILE</div>
          </div>
          <button className="enter-btn" onClick={()=>setTab("builds")} style={{
            background:"#B91C1C",border:"none",color:"#fff",
            padding:"12px 32px",fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:900,fontSize:13,letterSpacing:3,cursor:"pointer",
          }}>OPEN BUILD ANALYZER</button>
        </div>
      </div>}
    </div>
  );
}

// ── Top Zone: Brand Bar + HUD Nav ─────────────────────────────────────────────
function Banner() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [clicks,    setClicks]   = useState(0);
  const [cfg,       setBannerCfg] = useState(() => getSettings());
  const clickTimer = useState(null);

  // Stay in sync with AdminPanel saves
  useEffect(() => {
    const h = (e) => setBannerCfg(e.detail || getSettings());
    window.addEventListener("eo-settings", h);
    return () => window.removeEventListener("eo-settings", h);
  }, []);

  const handleBannerClick = () => {
    const next = clicks + 1;
    setClicks(next);
    clearTimeout(clickTimer[0]);
    clickTimer[0] = setTimeout(() => setClicks(0), 1500);
    if (next >= 5) { setShowAdmin(true); setClicks(0); }
  };

  const accent = cfg.accentColor || "#B91C1C";
  const logoTitle = cfg.logoTitle || "ENTROPY";
  const logoSub   = cfg.logoSub   || "OVERRIDE // TACTICS CODEX";

  return (
    <>
      <style>{`
        .eo-brand-bar {
          position: relative; display: flex; align-items: stretch;
          background: #050505; overflow: hidden; cursor: default; user-select: none;
        }
        .eo-brand-bar::before {
          content: ""; position: absolute; inset: 0;
          background: repeating-linear-gradient(-55deg,transparent 0px,transparent 18px,rgba(255,255,255,0.012) 18px,rgba(255,255,255,0.012) 19px);
          pointer-events: none;
        }
        .eo-brand-fill { flex:1; display:flex; align-items:center; padding:0 24px; gap:16px; }
        .eo-brand-rule { flex:1; height:1px; background:linear-gradient(to right,#1A1A1A 0%,transparent 100%); }
        .eo-brand-tag  { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:3px; color:#282828; white-space:nowrap; }
        .eo-brand-meta { display:flex; align-items:center; padding:0 20px; border-left:1px solid #1A1A1A; gap:20px; }
        .eo-status-dot { width:6px; height:6px; border-radius:50%; background:#22C55E; animation:eo-blink 2s ease-in-out infinite; }
        .eo-status-label { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:2px; color:#333; }
        @keyframes eo-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>

      <div className="eo-brand-bar" onClick={handleBannerClick}
        style={{
          height: window.innerWidth < 768 ? "50px" : "64px",
          borderBottom: cfg.showTopBorder !== false ? `3px solid ${accent}` : "none",
          boxShadow: cfg.showTopBorder !== false ? `0 3px 0 0 rgba(201,162,39,0.35)` : "none",
        }}>

        {cfg.showLeftPillar !== false &&
          <div style={{width:4, background:accent, flexShrink:0}}/>}

        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 20px 0 14px",borderRight:"1px solid #1A1A1A",minWidth:window.innerWidth<768?140:210}}>
          <span style={{fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",fontWeight:900,fontSize:window.innerWidth<768?16:22,letterSpacing:window.innerWidth<768?3:5,color:"#F0EDE5",lineHeight:1,textTransform:"uppercase"}}>
            {logoTitle}
          </span>
          <span style={{fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",fontWeight:700,fontSize:10,letterSpacing:4,color:accent,marginTop:3,textTransform:"uppercase"}}>
            {logoSub}
          </span>
        </div>

        {cfg.showBrandRule !== false && (
          <div className="eo-brand-fill">
            <div className="eo-brand-rule"/>
            <span className="eo-brand-tag">BLAZBLUE ENTROPY EFFECT X</span>
            <div className="eo-brand-rule" style={{background:"linear-gradient(to left,#1A1A1A 0%,transparent 100%)"}}/>
          </div>
        )}

        <div className="eo-brand-meta">
          {cfg.showStatusDot !== false && (
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div className="eo-status-dot"/>
              <span className="eo-status-label">ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      <AdminPanel show={showAdmin} onClose={() => setShowAdmin(false)}/>
    </>
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

function DPSChart({data,color,mob=false}) {
  return (
    <ResponsiveContainer width="100%" height={mob?130:175}>
      <BarChart data={data} margin={{top:4,right:mob?4:8,bottom:mob?20:28,left:mob?-10:8}}>
        <CartesianGrid stroke="#181818" vertical={false}/>
        <XAxis dataKey="n" tick={{fill:"#555",fontSize:mob?8:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}} angle={mob?-45:-35} textAnchor="end" interval={0}/>
        <YAxis tick={{fill:"#444",fontSize:mob?8:11,fontFamily:"'Courier Prime',monospace"}} width={mob?36:50}/>
        <Tooltip content={<CustomTip/>}/>
        <Bar dataKey="v" radius={[2,2,0,0]} maxBarSize={mob?28:44}>
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
  const [cfg, setCfg] = useState(() => getSettings());
  const mob = useIsMobile();
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  useEffect(() => {
    const handler = (e) => setCfg(e.detail || getSettings());
    window.addEventListener("eo-settings", handler);
    return () => window.removeEventListener("eo-settings", handler);
  }, []);

  const visibleChars = CHARACTERS.filter(c => !(cfg.hiddenChars||[]).includes(c.id));
  const [activeChar, setActiveChar] = useState(() => getSettings().defaultChar || CHARACTERS[0].id);
  const [activeBuild, setActiveBuild] = useState(() => getSettings().defaultBuild || 0);
  const [tab, setTab] = useState(() => getSettings().defaultTab || "home");
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [guideBuild, setGuideBuild] = useState(0);

  const char = CHARACTERS.find(c=>c.id===activeChar);
  const build = char.builds[activeBuild];

  const S = {
    wrap:{background:cfg.bgColor||"#080808",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",color:cfg.textColor||"#F0EDE5",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",fontSize:`${cfg.fontScale||100}%`},
    header:{borderBottom:"2px solid #B91C1C",padding:"18px 28px 14px",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"space-between"},
    nav:{display:"flex",gap:0,background:"#060606",borderBottom:"2px solid #1A1A1A",padding:mob?"0 4px":"0 20px",alignItems:"stretch",height:`${cfg.navHeight||44}px`,overflowX:"auto",flexShrink:0,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"},
    navBtn:(a)=>({
      position:"relative",
      background:"transparent",
      border:"none",
      borderBottom: a ? "3px solid #B91C1C" : "3px solid transparent",
      borderTop: a ? "3px solid transparent" : "none",
      color: a ? "#F0EDE5" : "#3A3A3A",
      padding:"0 26px",
      fontSize:12,
      letterSpacing:4,
      fontWeight:900,
      cursor:"pointer",
      fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",
      transition:"color 0.12s, border-color 0.12s",
      textTransform:"uppercase",
      height:"100%",
      outline:"none",
      whiteSpace:"nowrap",
    }),
    main:{display:mob?"flex":"grid",flexDirection:mob?"column":undefined,gridTemplateColumns:mob?undefined:`${cfg.sidebarWidth||272}px 1fr`,flex:1,overflow:"hidden"},
    sidebar:{background:"#080808",borderRight:"1px solid #141414",overflowY:"auto"},
    charRow:(a,col)=>({display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:a?`${col}14`:"transparent",borderLeft:a?`3px solid ${col}`:"3px solid transparent",transition:"all 0.1s"}),
    content:{padding:mob?"12px 10px":"22px 26px",overflowY:"auto",flex:1,minWidth:0},
    card:{background:cfg.cardBg||"#0D0D0D",border:"1px solid #1A1A1A",padding:mob?"12px":(`${cfg.cardPadding||20}px`),marginBottom:10,borderRadius:`${cfg.borderRadius||0}px`,minWidth:0,overflow:"hidden"},
    label:{fontSize:12,letterSpacing:3,color:"#4A4A4A",fontWeight:700,marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif"},
    h1:(col="#F0EDE5")=>({fontSize:mob?16:22,fontWeight:900,letterSpacing:mob?1:3,color:col,marginBottom:3}),
    mono:{fontFamily:"'Courier Prime','Courier New',monospace"},
    mathBox:{background:"#0B0B0B",border:"1px solid #B91C1C",borderLeft:"4px solid #B91C1C",padding:mob?"10px 12px":"14px 18px",fontFamily:"'Courier Prime','Courier New',monospace",fontSize:mob?11:14,color:"#C9A227",lineHeight:mob?1.6:2,marginBottom:10,wordBreak:"break-word",overflowWrap:"break-word"},
    g2:{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?10:16},
    buildTabBtn:(a,col)=>({background:a?`${col}1A`:"#111",border:`2px solid ${a?col:"#1E1E1E"}`,color:a?col:"#505050",padding:mob?"8px 12px":"10px 22px",fontSize:mob?11:14,letterSpacing:2,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",clipPath:mob?undefined:"polygon(0 0,100% 0,94% 100%,0 100%)",transition:"all 0.15s",marginRight:mob?4:6}),
    tacticElem:(col)=>({background:`${col}1A`,color:col,padding:mob?"2px 6px":"3px 10px",fontSize:mob?9:12,fontWeight:900,letterSpacing:mob?0:1,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}),
    ratingBadge:(v)=>({display:"inline-block",background:v>=90?"#0F2710":v>=80?"#211D00":"#1F0A0A",border:`2px solid ${v>=90?"#22C55E":v>=80?"#EAB308":"#EF4444"}`,color:v>=90?"#22C55E":v>=80?"#EAB308":"#EF4444",padding:mob?"2px 8px":"3px 14px",fontSize:mob?14:18,fontWeight:900,letterSpacing:mob?1:2,fontFamily:"'Barlow Condensed',sans-serif"}),
  };

  const renderBuilds = () => (
    <div className="eo-content-wrap">
      <div style={{display:"flex",flexWrap:"nowrap",gap:0,marginBottom:mob?10:20,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:mob?4:0}}>
        {char.builds.map((b,i)=>(
          <button key={b.id} style={S.buildTabBtn(activeBuild===i,char.color)} onClick={()=>setActiveBuild(i)}>
            {b.name}
          </button>
        ))}
      </div>

      <div style={{...S.card,borderColor:char.color+"33",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:mob?8:20,flexDirection:mob?"column":"row"}}>
          <div style={{flex:1,minWidth:0,width:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:mob?6:12,marginBottom:6,flexWrap:"wrap"}}>
              <div style={S.h1(char.color)}>{build.name}</div>
              <div style={S.ratingBadge(build.rating)}>{build.rating}</div>
            </div>
            <div style={{fontSize:mob?11:14,letterSpacing:mob?1:2,color:"#666",marginBottom:mob?8:14}}>{build.arch}</div>
            {cfg.showMath !== false && <div style={S.mathBox}>
              <div style={{color:"#5A5A5A",fontSize:12,letterSpacing:2,marginBottom:5}}>MATH SUMMARY</div>
              {build.mathKey}
            </div>}
          </div>
          {!mob && <div style={{width:190,flexShrink:0}}>
            <div style={S.label}>BUILD PROFILE</div>
            {cfg.showRadar!==false && <BuildRadar radar={build.radar} color={char.color}/>}
          </div>}
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
                    <div style={{fontSize:mob?12:14,color:"#E8E8E8",fontWeight:700,letterSpacing:0.5,wordBreak:"break-word"}}>{t}</div>
                    <div style={{fontSize:mob?10:11,color:"#525252",marginTop:2,lineHeight:1.5,wordBreak:"break-word"}}>{build.reasoning[i]}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <BuildCrystalPanel build={build} char={char} mob={mob}/>
        </div>
        <div>
          <div style={S.card}>
            <div style={S.label}>EFFECTIVE DPS BREAKDOWN — LEGENDARY RARITY</div>
            <div style={{color:"#3A3A3A",fontSize:mob?10:12,marginBottom:8,...S.mono}}>Source: BlazBlue Wiki base values + community play data</div>
            {cfg.showDPS!==false && <DPSChart data={build.dps} color={char.color} mob={mob}/>}
            <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
              <div style={{fontSize:mob?10:13,color:"#3A3A3A",...S.mono}}>estimates — actual varies</div>
              <div style={{fontSize:mob?18:22,fontWeight:700,color:char.color,...S.mono}}>~{build.dps[build.dps.length-1].v.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEW SECTIONS ── */}
      {(cfg.showTalent !== false || cfg.showSynergies !== false) && <div style={S.g2}>
        {/* TALENT + LEGACY SKILL */}
        {cfg.showTalent !== false && <div style={{...S.card, borderColor: char.color+"33"}}>
          <div style={S.label}>EVOTYPE TALENT</div>
          <div style={{display:"flex", alignItems:"flex-start", gap:12, marginBottom:18}}>
            <div style={{background:char.color+"22", border:`2px solid ${char.color}`, padding:mob?"4px 8px":"6px 14px", fontSize:mob?9:11, fontWeight:900, letterSpacing:mob?1:2, color:char.color, flexShrink:0, alignSelf:"flex-start"}}>TALENT</div>
            <div style={{fontSize:mob?11:13, color:"#D0D0D0", lineHeight:1.65, wordBreak:"break-word"}}>{char.talent}</div>
          </div>
          {cfg.showLegacy !== false && <>
            <div style={S.label}>LEGACY SKILL</div>
            <div style={{display:"flex", alignItems:"flex-start", gap:12}}>
              <div style={{background:"#C9A22722", border:"2px solid #C9A227", padding:mob?"4px 8px":"6px 14px", fontSize:mob?9:11, fontWeight:900, letterSpacing:mob?1:2, color:"#C9A227", flexShrink:0, alignSelf:"flex-start"}}>LEGACY</div>
              <div style={{fontSize:mob?11:13, color:"#D0D0D0", lineHeight:1.65, wordBreak:"break-word"}}>{char.legacySkill}</div>
            </div>
          </>}
        </div>}

        {/* BEST SYNERGY EVOTYPES */}
        {cfg.showSynergies !== false && <div style={S.card}>
          <div style={S.label}>BEST EVOTYPE SYNERGIES</div>
          {char.synergies.map((s,i)=>{
            const name = s.split(" (")[0].replace(/[()]/g,"").trim();
            const reason = s.includes("(") ? s.substring(s.indexOf("(")+1, s.lastIndexOf(")")) : s;
            return (
              <div key={i} style={{display:"flex", alignItems:"flex-start", gap:10, padding:"9px 12px", marginBottom:5, background:"#111", borderLeft:`3px solid ${char.color}`}}>
                <div style={{fontSize:11, fontWeight:900, letterSpacing:1, color:char.color, flexShrink:0, paddingTop:2}}>#{i+1}</div>
                <div>
                  <div style={{fontSize:mob?11:13, color:"#E0E0E0", fontWeight:700}}>{name}</div>
                  <div style={{fontSize:mob?10:11, color:"#555", lineHeight:1.5, wordBreak:"break-word"}}>{reason}</div>
                </div>
              </div>
            );
          })}
        </div>}
      </div>}

      {/* KEY MECHANICS */}
      {cfg.showMechanics !== false && <div style={S.card}>
        <div style={S.label}>KEY MECHANICS</div>
        <div style={{display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:8}}>
          {char.mechanics.map((m,i)=>(
            <div key={i} style={{display:"flex", gap:10, padding:"10px 13px", background:"#0D0D0D", border:"1px solid #1A1A1A", borderLeft:`3px solid ${char.color}44`}}>
              <div style={{fontSize:mob?14:18, color:char.color, fontWeight:900, flexShrink:0, lineHeight:1}}>{i+1}</div>
              <div style={{fontSize:mob?10:12, color:"#B0B0B0", lineHeight:1.65, wordBreak:"break-word"}}>{m}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* PRO TIPS */}
      {cfg.showTips !== false && <div style={S.card}>
        <div style={S.label}>MORPHEUS\'S TIPS</div>
        {char.tips.map((t,i)=>(
          <div key={i} style={{display:"flex", gap:12, padding:"9px 13px", marginBottom:6, background:"#0B0B0B", borderLeft:"3px solid #C9A227"}}>
            <div style={{color:"#C9A227", fontWeight:900, fontSize:13, flexShrink:0}}>TIP {i+1}</div>
            <div style={{fontSize:mob?10:12, color:"#C0B070", lineHeight:1.65, wordBreak:"break-word"}}>{t}</div>
          </div>
        ))}
      </div>}
    </div>
  );

  const renderTactics = () => (
    <div style={{display:"flex",flexDirection:mob?"column":"row",width:"100%",overflow:"hidden",flex:1}}>
      <div style={{overflowY:"auto",borderRight:mob?"none":"1px solid #161616",borderBottom:mob?"1px solid #141414":"none",width:mob?"100%":280,maxHeight:mob?"38vh":"none",flexShrink:0,paddingRight:16,paddingLeft:4,paddingTop:4}}>
        <div style={{...S.label,paddingLeft:8}}>SELECT TACTIC</div>
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
      <div style={{overflowY:"auto",paddingLeft:mob?6:24,paddingTop:4,paddingRight:mob?6:4,flex:1,minWidth:0,wordBreak:"break-word"}}>
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
                    <div key={i} style={{flex:1,background:"#111",padding:"8px 10px",textAlign:"center",border:`1px solid ${RARITY_COLORS[i]}44`}}>
                      <div style={{fontSize:12,color:RARITY_COLORS[i],fontWeight:700,letterSpacing:1}}>{RARITY[i]}</div>
                      <div style={{fontSize:20,fontWeight:900,color:RARITY_COLORS[i],...S.mono}}>{v}</div>
                      {i===3&&<div style={{fontSize:9,color:"#C9A227",letterSpacing:1}}>MAX</div>}
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
                        <span style={{color:RARITY_COLORS[i]}}>{RARITY[i]}</span>
                        <span>{isPct?`500 × (1 + ${v}%) =`:`${v} ${selectedTactic.unit}`}</span>
                        {isPct&&<span style={{color:RARITY_COLORS[i],fontWeight:700}}>{result} effective</span>}
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
    <>
    <style>{`
  .eo-nav-btn:hover { color: #C0C0C0 !important; }
  .eo-nav-btn.active { color: #F0EDE5 !important; }
  ${cfg.customCSS||""}
  ${cfg.showScrollbar===false ? "::-webkit-scrollbar{display:none!important}" : ""}
`}</style>
      {cfg.maintenanceMode && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:8888,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
          <div style={{fontSize:36,fontWeight:900,letterSpacing:6,color:"#B91C1C",fontFamily:"'Barlow Condensed',sans-serif"}}>MAINTENANCE MODE</div>
          <div style={{fontSize:14,color:"#555",fontFamily:"'Courier Prime',monospace",letterSpacing:2}}>{cfg.maintenanceMsg||"Site under maintenance."}</div>
        </div>
      )}
      <div style={S.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Courier+Prime:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{overflow:hidden;max-width:100vw;}
        body{background:#080808;}
        button{font-family:inherit;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#080808;}
        ::-webkit-scrollbar-thumb{background:#B91C1C;}
        .eo-nav-no-scroll::-webkit-scrollbar{display:none!important;}
        button:hover{opacity:0.85;}
        /* prevent horizontal overflow everywhere */
        .eo-content-wrap * { max-width:100%; word-break:break-word; overflow-wrap:break-word; }
        .eo-content-wrap img { max-width:100%; height:auto; }
        /* ── MOBILE ── */
        /* hide nav scrollbar globally */
        .eo-nav-wrap::-webkit-scrollbar { display: none !important; }
        @media (max-width: 767px) {
          .eo-brand-logotype-top { font-size: 16px !important; letter-spacing: 3px !important; }
          .eo-brand-fill { display: none !important; }
          .eo-meta-div  { display: none !important; }
          .eo-brand-bar { height: 50px !important; }
          .eo-mob-char-strip { display: flex !important; }
          .home-hero { height: 160px !important; }
          .home-feat  > div { grid-template-columns: 1fr !important; }
          .home-roster-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .build-tactic-row { flex-wrap: wrap !important; }
          .recharts-wrapper { overflow: hidden !important; }
          /* stop any full-width text overflow */
          .eo-content-wrap { overflow-x: hidden !important; }
          /* nav: hide scrollbar on mobile */
          nav, [class*="nav"] { scrollbar-width: none !important; }
        }
      `}</style>

      <Banner />

      <div className="eo-nav-wrap" style={S.nav}>
        {(mob
          ? [["home","HOME","⌂"],["builds","BUILDS","▣"],["tactics","TACTICS","◎"],["guide","GUIDE","✦"],["crystals","CRYSTALS","◆"],["calc","CALC","⊕"],["evotype","EVOTYPE","⊞"],["tier","TIERS","≡"],["datalab","LAB","⊛"]]
          : [["home","HOME","⌂"],["builds","BUILD ANALYZER","▣"],["tactics","TACTICS DATABASE","◎"],["guide","CHARACTER GUIDE","✦"],["crystals","MIND CRYSTALS","◆"],["calc","CALCULATOR","⊕"],["evotype","EVOTYPE PLANNER","⊞"],["tier","TIER LIST","≡"],["datalab","DATA LAB","⊛"]]
        ).map(([id,lbl,icon])=>(
          <button key={id} className={`eo-nav-btn${tab===id?" active":""}`} style={{
            ...S.navBtn(tab===id),
            padding: mob ? "0 6px" : "0 26px",
            fontSize: mob ? 9 : 12,
            letterSpacing: mob ? 1 : 4,
            flexShrink: 0,
            textAlign:"center",
          }} onClick={()=>setTab(id)}>{cfg.showNavLabels === false ? icon : lbl}</button>
        ))}
      </div>

      {tab === "home" ? (
        <HomePage setTab={setTab} cfg={cfg} mob={mob}/>
      ) : tab === "crystals" ? (
        <MindCrystals cfg={cfg} mob={mob}/>
      ) : tab === "calc" ? (
        <BuildCalculator cfg={cfg} mob={mob} characters={visibleChars}/>
      ) : tab === "evotype" ? (
        <EvotypePlanner cfg={cfg} mob={mob}/>
      ) : tab === "tier" ? (
        <div style={{flex:1,overflow:"hidden"}}><TierList cfg={cfg} mob={mob}/></div>
      ) : tab === "datalab" ? (
        <div style={{flex:1,overflowY:"auto"}}><DataLab mob={mob}/></div>
      ) : tab === "tactics" ? (
        <div style={{flex:1, display:"flex", overflow:"hidden", flexDirection: mob ? "column" : "row"}}>
          {renderTactics()}
        </div>
      ) : mob ? (
        /* ── MOBILE: stacked char strip + content ── */
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Horizontal char strip */}
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #141414",background:"#040404",flexShrink:0,WebkitOverflowScrolling:"touch"}}>
            {visibleChars.map(c=>(
              <div key={c.id} onClick={()=>{setActiveChar(c.id);setActiveBuild(0);}}
                style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 10px",cursor:"pointer",borderBottom:activeChar===c.id?`2px solid ${c.color}`:"2px solid transparent",background:activeChar===c.id?`${c.color}14`:"transparent",transition:"all 0.12s",minWidth:64}}>
                <div style={{width:32,height:42,overflow:"hidden",clipPath:"polygon(0 0,100% 0,85% 100%,0 100%)",flexShrink:0}}>
                  <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:activeChar===c.id?"none":"brightness(0.45)"}} onError={e=>{e.target.style.display="none"}}/>
                </div>
                <div style={{fontSize:8,fontWeight:900,letterSpacing:0.5,color:activeChar===c.id?c.color:"#3A3A3A",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",textAlign:"center",lineHeight:1.1,maxWidth:56,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                  {c.name.split(" ")[0].toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          {/* Mobile content — full width */}
          <div className="eo-content-wrap" style={{...S.content,padding:"10px 10px"}}>
            {tab==="builds" && renderBuilds()}
            {tab==="guide" && <CharacterGuide char={char} mob={mob}/>}
          </div>
        </div>
      ) : (
      <div style={S.main}>
        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={{padding:"12px 14px 8px",fontSize:10,letterSpacing:3,color:"#3A3A3A",fontWeight:700}}>CHARACTER SELECT</div>
          {visibleChars.map(c=>(
            <div key={c.id} style={S.charRow(activeChar===c.id,c.color)}
              onClick={()=>{setActiveChar(c.id);setActiveBuild(0);}}>
              <div style={{width:38,height:50,overflow:"hidden",flexShrink:0,clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)"}}>
                <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center"}} onError={e=>{e.target.style.display="none"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:900,color:activeChar===c.id?c.color:"#C0C0C0",letterSpacing:0.5,lineHeight:1.2}}>{c.name}</div>
                <div style={{fontSize:11,color:"#484848",letterSpacing:1,marginTop:1}}>{c.tag}</div>
                {cfg.showTierBadge !== false && <div style={{display:"flex",gap:6,marginTop:4}}>
                  <span style={{background:`${TIER_COLORS[c.tier]}1A`,color:TIER_COLORS[c.tier],border:`1px solid ${TIER_COLORS[c.tier]}`,padding:"0 6px",fontSize:10,fontWeight:900}}>TIER {c.tier}</span>
                </div>}
              </div>
            </div>
          ))}
          {/* Bottom character artwork */}
          {cfg.showCharArtwork !== false && <div style={{borderTop:"1px solid #111",marginTop:8}}>
            <div style={{position:"relative",overflow:"hidden",height:180}}>
              <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:"contrast(1.05) saturate(0.88)",opacity:0.8}} onError={e=>{e.target.style.display="none"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:72,background:"linear-gradient(transparent,#080808 88%)"}}/>
              <div style={{position:"absolute",bottom:8,left:14,fontWeight:900,fontSize:14,color:char.color,letterSpacing:2}}>{char.name.toUpperCase()}</div>
            </div>
          </div>}
        </div>

        {/* CONTENT */}
        <div className="eo-content-wrap" style={S.content}>
          {tab==="builds" && renderBuilds()}
          {tab==="guide" && <CharacterGuide char={char} mob={mob}/>}
        </div>
      </div>
      )}
    </div>
    </>
  );
}
