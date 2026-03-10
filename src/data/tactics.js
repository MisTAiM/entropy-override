// ─────────────────────────────────────────────────────────────────────────────
// TACTICS REFERENCE DATA
// val fields marked null = unverified. Community can submit real numbers
// via the Data Lab tab. All submissions require admin approval.
// ─────────────────────────────────────────────────────────────────────────────

export const TACTICS_REFERENCE = [
  { name: "Cold Attack",    tier: "S",  element: "ice",      vals: [null,null,null,null], unit: "% dmg boost per attack",
    note: "Steam: 'Jin + full Ice = auto mode. Nothing moves, you shred, bosses included.' Attack Cold slows ALL enemies simultaneously." },
  { name: "Skill Cold",     tier: "S",  element: "ice",      vals: [null,null,null,null], unit: "% dmg boost on skills",
    note: "Stacks with Attack Cold. Double Cold = boosts on ALL inputs simultaneously, plus Cold stacks per skill cast." },
  { name: "Frost Burst",    tier: "A",  element: "ice",      vals: [null,null,null,null], unit: "burst dmg at max stacks",
    note: "At max Cold stacks, enemies burst for AoE. Wiki: triggers from Cold Attack OR Skill Cold accumulation. Wide radius room clear." },
  { name: "Attack Burn",    tier: "A",  element: "fire",     vals: [null,null,null,null], unit: "DoT DPS",
    note: "Catalyst for Double Tactics. Procs on every normal hit. Essential catalyst — many Doubles require Burn as base." },
  { name: "Skill Burn",     tier: "A",  element: "fire",     vals: [null,null,null,null], unit: "DoT DPS",
    note: "Higher base than Attack Burn. Core for skill-heavy chars. Catching Fire T2: +30% per burning enemy present." },
  { name: "Ring of Fire",   tier: "B+", element: "fire",     vals: [null,null,null,null], unit: "burst on Legacy use",
    note: "Mediocre alone. Storm Ring of Fire Double = full-screen AoE every dodge, hits entire screen. Transforms the tactic." },
  { name: "Fire Projectile",tier: "A",  element: "fire",     vals: [null,null,null,null], unit: "dmg × 10 projectiles",
    note: "10 projectiles per Skill cast. Focused Fire T2 = 45° cone, all hit single target at close range." },
  { name: "Fire Spirit",    tier: "A",  element: "fire",     vals: [null,null,null,null], unit: "dmg per spirit hit",
    note: "Auto-spawns, attacks whatever you hit. Fire Spirit Detonation Double = spirits explode on Burn enemies = massive AoE chaining." },
  { name: "Place Mine",     tier: "A*", element: "fire",     vals: [null,null,null,null], unit: "dmg + charge bonus",
    note: "Es only: aerial bounce naturally detonates placed mines on contact — every bounce in a combo can trigger an explosion. With Splashing Mine (Double Tactic via Hail), detonations release additional shrapnel. Low value on other chars." },
  { name: "Shadow Spike",   tier: "S",  element: "umbra",    vals: [null,null,null,null], unit: "proc dmg per attack",
    note: "Hibiki clones COPY this — every input procs 3× instead of 1×. Best slot efficiency on clone characters." },
  { name: "Blackhole",      tier: "S",  element: "umbra",    vals: [null,null,null,null], unit: "area slow (no direct dmg)",
    note: "Steam: 'Game breaking. Others don't matter.' + Electric Detox + Poison Contamination = zero-input stun lock of entire screen." },
  { name: "Light Spear",    tier: "S",  element: "light",    vals: [null,null,null,null], unit: "dmg per skill hit",
    note: "Hakumen charged Up+Skill nearly one-shots bosses with Light Spear. Universal boss damage. Flat per skill use at Legendary." },
  { name: "Chain Lightning", tier: "S", element: "light",    vals: [null,null,null,null], unit: "dmg, bounces 3 enemies",
    note: "Rachel bats trigger Attack Lightning even as Legacy = non-stop chain lightning, zero player input. Bounces to 3 enemies per proc." },
  { name: "Lightning Orb",  tier: "S",  element: "electric", vals: [null,null,null,null], unit: "dmg/hit autonomous turret",
    note: "Most character-neutral combo: Orb + Thunderbolt + Light Javelin. Persistent field turret. Anyone can run this skeleton." },
  { name: "Thunderbolt",    tier: "A",  element: "electric", vals: [null,null,null,null], unit: "chain dmg on dash",
    note: "Dash fires chain lightning to nearby enemies. Core of Thunderbolt/Orb/Spear combo that community calls 'character-neutral S-tier skeleton.'" },
];

const RARITY = ["Common","Uncommon","Rare","Legendary"];
const ELEM_COLORS = { ice:"#5BC4E8", fire:"#E84E25", umbra:"#A855F7", light:"#EDB72C", electric:"#00D9BB", blade:"#E05050" };
