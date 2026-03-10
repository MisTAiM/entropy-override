export const CHARACTERS = [
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
        dps:[],
        radar:{burst:70,sustain:95,aoe:100,control:75,survival:80},
        crystals:["Kill Streak","Combo Counter","Crystal Resonance"],
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
        crystals:["Phase Shift","Blood Pact","Combo Counter"],
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
        crystals:["Escape Death","Phase Shift","Frost Shield"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:65,sustain:92,aoe:50,control:60,survival:78},
        crystals:["Blood Pact","Healing Elixir","Kill Streak"],
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
        crystals:["Combo Counter","Kill Streak","SP Refuel"],
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
        crystals:["Escape Death","Phase Shift","Healing Elixir"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:75,sustain:85,aoe:70,control:100,survival:90},
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
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
        crystals:["Combo Counter","Kill Streak","SP Refuel"],
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
        crystals:["Crystal Resonance","Kill Streak","Frost Shield"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:75,sustain:98,aoe:85,control:80,survival:85},
        crystals:["SP Refuel","Kill Streak","Crystal Resonance"],
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
        crystals:["Kill Streak","SP Refuel","Combo Counter"],
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
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:100,sustain:60,aoe:95,control:70,survival:65},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Frost Shield","Phase Shift","Crystal Resonance"],
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
        crystals:["Kill Streak","Combo Counter","Crystal Resonance"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:70,sustain:100,aoe:80,control:65,survival:72},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
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
        crystals:["Frost Shield","Phase Shift","Escape Death"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:78,sustain:95,aoe:88,control:75,survival:70},
        crystals:["Crystal Resonance","Kill Streak","SP Refuel"],
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
        crystals:["Frost Shield","Phase Shift","Crystal Resonance"],
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
        crystals:["Kill Streak","SP Refuel","Combo Counter"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:82,sustain:75,aoe:90,control:70,survival:72},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Phase Shift","Kill Streak","Crystal Resonance"],
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
        crystals:["Combo Counter","Kill Streak","Blood Pact"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:88,sustain:82,aoe:90,control:60,survival:72},
        crystals:["Kill Streak","SP Refuel","Crystal Resonance"],
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
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
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
        crystals:["Kill Streak","Combo Counter","Blood Pact"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:96,sustain:82,aoe:90,control:55,survival:70},
        crystals:["Kill Streak","SP Refuel","Combo Counter"],
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
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
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
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:78,sustain:78,aoe:82,control:78,survival:68},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Kill Streak","Crystal Resonance","Blood Pact"],
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
        crystals:["Phase Shift","Combo Counter","Escape Death"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:98,sustain:72,aoe:80,control:92,survival:90},
        crystals:["Combo Counter","Kill Streak","Phase Shift"],
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
        crystals:["Frost Shield","Escape Death","Crystal Resonance"],
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
        crystals:["Kill Streak","Combo Counter","Blood Pact"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:82,sustain:85,aoe:68,control:60,survival:68},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Phase Shift","Escape Death","Frost Shield"],
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
        crystals:["Kill Streak","Combo Counter","Blood Pact"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:88,sustain:78,aoe:70,control:85,survival:78},
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Crystal Resonance","Phase Shift","Frost Shield"],
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
        crystals:["Kill Streak","Blood Pact","Combo Counter"],
        mathKey:"" }
    ]
  },
  { id:"icey", name:"ICEY", tag:"PIXEL / DANCER", tier:"A", color:"#A78BFA",
    img:"/chars/icey.png",
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
        crystals:["Kill Streak","Combo Counter","SP Refuel"],
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
        crystals:["Frost Shield","Crystal Resonance","Phase Shift"],
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
        crystals:["Kill Streak","Blood Pact","Combo Counter"],
        mathKey:"" }
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
        dps:[],
        radar:{burst:82,sustain:85,aoe:85,control:75,survival:80},
        crystals:["Kill Streak","Combo Counter","Phase Shift"],
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
        crystals:["Kill Streak","Crystal Resonance","SP Refuel"],
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
        crystals:["Frost Shield","Phase Shift","Combo Counter"],
        mathKey:"" }
    ]
  }
];
