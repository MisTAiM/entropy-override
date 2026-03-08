export const TACTICS_REFERENCE = [
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
