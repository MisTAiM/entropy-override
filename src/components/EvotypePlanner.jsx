import React, { useState, useEffect } from "react";

// ─── PER-CHARACTER EVOTYPE DATA ───────────────────────────────────────────────
const CHAR_EVOTYPE_DATA = {
  hibiki: {
    legacyMoves: [
      { id:"shadow_ambush",    name:"Shadow Ambush",       desc:"Spawn clone that dashes behind nearest enemy and strikes. Core clone-proc engine." },
      { id:"phantom_drive",    name:"Phantom Drive",       desc:"Clone burst dash — all clones converge on target simultaneously for max back-attack density." },
      { id:"mirror_step",      name:"Mirror Step",         desc:"Hibiki mirrors the enemy's last attack, dodging it and spawning a retaliatory clone proc." },
      { id:"shadow_rend",      name:"Shadow Rend",         desc:"Charged clone strike — single high-damage back-attack with extended proc window." },
    ],
    legacyTalents: [
      { id:"way_of_assassination", name:"Way of Assassination",  desc:"+Dmg from behind. All clones inherit this bonus — triples effective back-attack rate." },
      { id:"clone_resonance",      name:"Clone Resonance",       desc:"Clones copy elemental tactic procs in addition to physical procs." },
      { id:"dodge_extension",      name:"Dodge Extension",       desc:"3-dodge chain: each dodge restores 1 charge on kill. Effectively infinite dodge uptime." },
      { id:"shadow_multiplier",    name:"Shadow Multiplier",     desc:"Clone proc rate +1 per 200 combo count. Scales directly with Exhilaration stack." },
    ],
  },
  ragna: {
    legacyMoves: [
      { id:"blood_scythe",     name:"Blood Scythe",        desc:"AoE slash — heals HP on every enemy hit. Core sustain tool for Blood Kain cycling." },
      { id:"carnage_scissors", name:"Carnage Scissors",    desc:"Multi-hit grab that deals Umbra damage and resets Blood Kain threshold timer." },
      { id:"dead_spike",       name:"Dead Spike",          desc:"Ground spike burst — hits all grounded enemies in range with Umbra damage." },
      { id:"belial_edge",      name:"Belial Edge",         desc:"Aerial multi-kick chain — good for grouping enemies before Blood Scythe confirm." },
    ],
    legacyTalents: [
      { id:"blood_kain",       name:"Blood Kain",          desc:"Sub-50% HP: activates ~30% damage multiplier on all attacks. Defines Ragna's power zone." },
      { id:"lifesteal_boost",  name:"Lifesteal Boost",     desc:"Blood Scythe heals 40% more per enemy hit. Safe-zones the Blood Kain threshold." },
      { id:"super_armor",      name:"Super Armor",         desc:"Heavy attacks become super-armored — cannot be staggered during Blood Scythe cast." },
      { id:"berserker",        name:"Berserker",           desc:"While sub-30% HP: attack speed +25% and Blood Scythe cooldown -40%." },
    ],
  },
  jin: {
    legacyMoves: [
      { id:"frost_bite",       name:"Frost Bite",          desc:"Ice slash that applies max Cold stacks instantly. Triggers Frost Burst on the same cast." },
      { id:"hishougeki",       name:"Hishougeki",          desc:"Ice projectile burst — long range Cold application, ideal for freeze-field setup." },
      { id:"sekkajin",         name:"Sekkajin",            desc:"Ice pillar rising attack — AoE freeze burst, best for room control in high entropy." },
      { id:"ice_car",          name:"Ice Car",             desc:"Dash-cancel slash — repositions to back of enemy and applies Cold on contact." },
    ],
    legacyTalents: [
      { id:"ice_fortune",      name:"Ice Fortune",         desc:"Cold Attack guaranteed from first tactic drop. Removes all early-run Cold RNG." },
      { id:"freeze_extend",    name:"Freeze Extension",    desc:"Freeze duration +2 seconds. Magatama users get full charge window on every freeze." },
      { id:"cold_mastery",     name:"Cold Mastery",        desc:"Cold stacks accumulate 50% faster. Frost Burst ready in 2 hits vs normal 4." },
      { id:"frost_resonance",  name:"Frost Resonance",     desc:"At max Cold stacks: all attacks deal +20% bonus damage until stacks expire." },
    ],
  },
  kokonoe: {
    legacyMoves: [
      { id:"missile_rain",     name:"Missile Rain",        desc:"10-projectile aerial burst — 280 × 10 at point blank range. Flagship damage tool." },
      { id:"gravity_seed",     name:"Gravity Seed",        desc:"Deployable gravity field — pulls all nearby enemies into a cluster for Fire Projectile confirms." },
      { id:"minerva_punch",    name:"Minerva Punch",       desc:"Robot arm strike — melee range but high damage, breaks Kokonoe's pure-aerial archetype." },
      { id:"barrier",          name:"Barrier",             desc:"Defensive shield — reflects projectiles and grants brief invincibility for aerial repositioning." },
    ],
    legacyTalents: [
      { id:"aerial_mastery",   name:"Aerial Mastery",      desc:"Aerial duration is unlimited — Kokonoe never descends unless player-controlled." },
      { id:"science_boost",    name:"Science Boost",       desc:"Skill damage +30%. Stacks multiplicatively with Domination crystal." },
      { id:"missile_count",    name:"Missile Count",       desc:"Missile Rain fires 14 instead of 10 projectiles per cast at Legendary." },
      { id:"skill_cooldown",   name:"Rapid Analysis",      desc:"Skill cooldown -25%. Fire Projectile rotation speed increased by one cast per fight." },
    ],
  },
  es: {
    legacyMoves: [
      { id:"code_crimson",     name:"Code: Crimson",       desc:"Crest detonation chain — triggers all placed crests simultaneously for max burst." },
      { id:"code_seal",        name:"Code: Seal",          desc:"Spatial seal locks enemy in place — guaranteed mine detonation on sealed target." },
      { id:"crest_arts",       name:"Crest Arts",          desc:"Rapid crest placement — drops 3 crests in a spread pattern in one cast." },
      { id:"es_throw",         name:"Es Throw",            desc:"Melee toss — repositions enemy directly onto existing crest positions." },
    ],
    legacyTalents: [
      { id:"crest_generation", name:"Crest Generation",    desc:"Crests regenerate 30% faster. Field is always stocked between room clears." },
      { id:"mine_amplify",     name:"Mine Amplify",        desc:"Mine detonation damage +35%. Stacks with Domination for full skill-type scaling." },
      { id:"aerial_bounce",    name:"Aerial Bounce",       desc:"Aerial attacks bounce up to 3 mines per hit instead of 1. Triples burst output." },
      { id:"spatial_mastery",  name:"Spatial Mastery",     desc:"Crest field generates combo count passively — Exhilaration stacks without attacking." },
    ],
  },
  noel: {
    legacyMoves: [
      { id:"drive_shoot",      name:"Drive: Shoot",        desc:"9 hit/sec rapid fire burst — the Drive activation that defines Noel's playstyle." },
      { id:"optic_barrel",     name:"Optic Barrel",        desc:"Long-range charged shot — high single-hit damage, ideal opener before Drive loop." },
      { id:"fenrir",           name:"Fenrir",              desc:"Full-screen charge attack — repositions while dealing damage, bypasses all positioning." },
      { id:"chamber_shot",     name:"Chamber Shot",        desc:"Multi-round burst — lower damage per bullet but 12+ hits; best Exhilaration stacker." },
    ],
    legacyTalents: [
      { id:"drive_mastery",    name:"Drive Mastery",       desc:"Drive: Shoot gains +2 hits/sec and reduced recoil. Top sustained DPS talent." },
      { id:"ammo_count",       name:"Ammo Count",          desc:"Chamber Shot fires 5 extra rounds. +5 combo count per activation." },
      { id:"rapid_reload",     name:"Rapid Reload",        desc:"Skill rotation speed +20%. Drive/Chamber Shot cycle 20% faster." },
      { id:"long_range_bonus", name:"Long Range Bonus",    desc:"+15% damage when attacking from beyond close range. Rewards Drive's natural positioning." },
    ],
  },
  rachel: {
    legacyMoves: [
      { id:"sylph",            name:"Sylph",               desc:"Bat swarm summon — deploys autonomous bat familiars that proc Chain Lightning on every hit." },
      { id:"tempest_dahlia",   name:"Tempest Dahlia",      desc:"Wind pull — repositions all enemies toward Rachel. Sets up AoE bat confirms." },
      { id:"tiny_lobelia",     name:"Tiny Lobelia",        desc:"Pumpkin detonation — AoE burst at enemy position. Scales with Resonance." },
      { id:"george_xiii",      name:"George XIII",         desc:"Persistent pumpkin familiar — stays on field and detonates on timed trigger." },
    ],
    legacyTalents: [
      { id:"bat_dominion",     name:"Bat Dominion",        desc:"Bat swarm size +2 familiars. All 5 bats proc simultaneously on any tactic hit." },
      { id:"familiar_damage",  name:"Familiar Damage",     desc:"Familiar hit damage +30%. Applies to bats, George XIII, and pumpkin detonations." },
      { id:"wind_barrier",     name:"Wind Barrier",        desc:"Persistent AoE field persists for 3 seconds after cast instead of 1." },
      { id:"tempest_range",    name:"Tempest Range",       desc:"Tempest Dahlia pull radius +50%. Catches enemies at full screen width." },
    ],
  },
  taokaka: {
    legacyMoves: [
      { id:"rolling_assault",  name:"Rolling Assault",     desc:"Rush burst — chains 5 directional slashes, each independently proc-ing tactics." },
      { id:"slashy_slashy",    name:"Slashy-Slashy",       desc:"Rapid claw flurry — 12+ hits in 1 second. Best single activation for Exhilaration." },
      { id:"good_morning",     name:"Good Morning Slash",  desc:"Overhead aerial drop — initiates combat from above, triggering ambush bonus." },
      { id:"aerial_rave",      name:"Aerial Rave",         desc:"Multi-hit aerial combo — repositions above enemies, avoiding all ground-level threats." },
    ],
    legacyTalents: [
      { id:"speed_demon",      name:"Speed Demon",         desc:"Kill momentum: each kill grants +5% attack speed, stacking up to 5× per room." },
      { id:"infinite_dodge",   name:"Infinite Dodge",      desc:"Dodge direction freely changeable mid-dodge. No recovery frame between dodges." },
      { id:"rush_extension",   name:"Rush Extension",      desc:"Rush chains can continue indefinitely as long as new enemies are in range." },
      { id:"ambush_bonus",     name:"Ambush Bonus",        desc:"+20% damage on the first hit of any new enemy engagement (ambush window)." },
    ],
  },
  lambda: {
    legacyMoves: [
      { id:"sword_summoner",   name:"Sword Summoner",      desc:"Deploys 4 autonomous sword turrets. Core build enabler — all swords proc independently." },
      { id:"crescent_saber",   name:"Crescent Saber",      desc:"Blade crescent wave — long range AoE hit that procs all sword turrets on contact." },
      { id:"calamity_sword",   name:"Calamity Sword",      desc:"Charged single-target blade — high damage, staggers enemy into sword turret range." },
      { id:"gravity_seed_l",   name:"Gravity Seed",        desc:"Pulls enemies toward sword cluster — guarantees sword turret hit rate for full Summon Booster value." },
    ],
    legacyTalents: [
      { id:"respawn_double",   name:"Respawn Double",      desc:"Sword turrets respawn immediately after destruction. Permanent sword field guaranteed." },
      { id:"sword_count",      name:"Sword Count+",        desc:"Deploys 5 swords instead of 4. +25% sword DPS and proc rate." },
      { id:"umbra_fortune",    name:"Umbra Fortune",       desc:"Umbra (Shadow Spike) tactics drop guaranteed from first crystal shop." },
      { id:"blade_resonance",  name:"Blade Resonance",     desc:"Each sword that hits the same enemy in 0.5s increases the next sword's damage by 15%." },
    ],
  },
  mai: {
    legacyMoves: [
      { id:"needle_storm",     name:"Needle Storm",        desc:"8 needles per cast — each independently procs tactics. Highest multi-proc rate of any skill." },
      { id:"frost_spear",      name:"Frost Spear",         desc:"Cold-applying spear thrust — single target freeze + slow for positional setups." },
      { id:"chain_spear",      name:"Chain Spear",         desc:"Follow-up spear chain — hits the same target 3 times, good for DoT stack application." },
      { id:"burning_spear",    name:"Burning Spear",       desc:"Fire-imbued thrust — applies Burn DoT on spear contact, stacks with Attack Burn tactic." },
    ],
    legacyTalents: [
      { id:"needle_count",     name:"Needle Count+",       desc:"Needle Storm fires 10 needles instead of 8. +2 tactic procs per cast." },
      { id:"spear_reach",      name:"Spear Reach",         desc:"All spear skills have +40% range. Frost Spear safely applies Cold from max range." },
      { id:"cold_application", name:"Cold Application",    desc:"Every needle hit applies Cold stack. Frost Burst threshold reached in 1 cast." },
      { id:"mana_efficiency",  name:"Mana Efficiency",     desc:"Needle Storm mana cost -35%. Rotates 1.5× faster with Mana Surge crystal." },
    ],
  },
  hazama: {
    legacyMoves: [
      { id:"serpent_rapture",  name:"Serpent's Infernal Rapture", desc:"Chain whip burst — hits 3-5 targets simultaneously, applying Burn DoT to all." },
      { id:"eternal_coils",    name:"Eternal Coils",       desc:"Extended chain whip loop — covers full screen width, DoT applied at maximum range." },
      { id:"hungry_coils",     name:"Hungry Coils",        desc:"Chain grab — pulls enemy into Hazama's position for guaranteed CQC follow-up." },
      { id:"jayoku",           name:"Jayoku Houtenjin",    desc:"Rising fang strike — Umbra damage burst that breaks enemy super armor states." },
    ],
    legacyTalents: [
      { id:"chain_reach",      name:"Chain Reach",         desc:"Whip range +35%. Hits 5 targets at max range vs normal 3." },
      { id:"dot_duration",     name:"DoT Duration",        desc:"Burn DoT from all sources lasts 4 seconds longer. Total DoT window nearly doubled." },
      { id:"counter_god",      name:"Counter God",         desc:"Parry window +0.3 seconds. Counter hit damage +45%." },
      { id:"venom_stack",      name:"Venom Stack",         desc:"Burn DoT can stack twice on the same target. Max Burn DoT DPS doubled." },
    ],
  },
  hakumen: {
    legacyMoves: [
      { id:"tsubaki",          name:"Tsubaki",             desc:"Counter slash — primary void counter tool. Triggers Magatama charge on successful parry." },
      { id:"renka",            name:"Renka",               desc:"Multi-hit counter chain — parry into 5-hit combo. Best Magatama charge accelerator." },
      { id:"gaiden",           name:"Gaiden",              desc:"Overhead counter slam — AoE on parry confirm, hits all enemies near the target." },
      { id:"kishuu",           name:"Kishuu",              desc:"Rush counter — forward dash parry, repositions Hakumen behind the enemy on success." },
    ],
    legacyTalents: [
      { id:"magatama_charge",  name:"Magatama Charge",     desc:"Magatama charges 40% faster. Full charge achieved in 1.5s instead of 2.5s." },
      { id:"void_mastery",     name:"Void Mastery",        desc:"Counter window +0.4s. Parry is effectively active 60% of all received attacks." },
      { id:"celestial_orders", name:"Celestial Orders",    desc:"At full Magatama: Light Spear legacy deal +50% damage. Stacks with Legacy Amplifier." },
      { id:"apex_counter",     name:"Apex Counter",        desc:"Successful counter restores Hakumen to full HP. Activates Apex Predator crystal bonus." },
    ],
  },
  bullet: {
    legacyMoves: [
      { id:"heat_the_beat",    name:"Heat the Beat",       desc:"Drive activation — engages 8-10 hit/sec CQC shell burst. Bullet's core damage engine." },
      { id:"engage_buster",    name:"Engage Buster",       desc:"Armored grab — Drive-range grapple that resets enemy position into Demolition Charge zone." },
      { id:"shoot_the_moon",   name:"Shoot the Moon",      desc:"Aerial CQC — Drive burst from above, bypasses ground defense, good for clustered groups." },
      { id:"condenser_blow",   name:"Condenser Blow",      desc:"Demolition Charge release — AoE around Bullet, hits all enemies in Drive range simultaneously." },
    ],
    legacyTalents: [
      { id:"steel_shell",      name:"Steel Shell",         desc:"Bullet gains a damage-absorbing shell every 3 kills. Effectively +3 extra HP bars." },
      { id:"drive_rate",       name:"Drive Rate",          desc:"Drive hit rate +2 hits/sec. Exhilaration cap reached 5 seconds faster." },
      { id:"cqc_mastery",      name:"CQC Mastery",         desc:"CQC damage +25%. Demolition Charge AoE +40% radius." },
      { id:"shell_burst",      name:"Shell Burst",         desc:"On kill during Drive: next Drive activation fires 2× shells for 3 seconds." },
    ],
  },
  naoto: {
    legacyMoves: [
      { id:"crimson_thrust",   name:"Crimson Thrust",      desc:"HP-cost piercing thrust — deals massive damage at cost of 20% current HP." },
      { id:"blood_spike",      name:"Blood Spike",         desc:"Ground spike burst — Umbra AoE anchored at target position. Procs Blood Pact crystal." },
      { id:"kuuga",            name:"Kuuga",               desc:"Hunter's Eye opener — dash toward enemy and apply Hunter's Eye debuff for execute window." },
      { id:"deaths_door",      name:"Death's Door",        desc:"Execute: instantly kills enemies below 15% HP. Bypasses Hunter's Eye threshold for finishers." },
    ],
    legacyTalents: [
      { id:"hunters_eye",      name:"Hunter's Eye",        desc:"Execute activates at 30% enemy HP. Blood Edge at threshold: guaranteed kill." },
      { id:"blood_edge_amp",   name:"Blood Edge Amplify",  desc:"Blood Edge damage +40%. HP cost remains the same — pure net gain on all HP-cost attacks." },
      { id:"fatal_blow",       name:"Fatal Blow",          desc:"Crit damage +75%. Paired with Focus crystal: consistent 55% crit rate." },
      { id:"death_touch",      name:"Death Touch",         desc:"Each kill while using HP-cost attacks restores 15% HP. Sustains Blood Edge loop." },
    ],
  },
  icey: {
    legacyMoves: [
      { id:"dance_attack",     name:"Dance Attack",        desc:"Omnidirectional dance pattern — hits enemies in all directions simultaneously while dodging." },
      { id:"pixel_storm",      name:"Pixel Storm",         desc:"Multi-hit burst combo — 6-8 rapid pixel strikes, each independently proc-ing tactics." },
      { id:"blade_dance",      name:"Blade Dance",         desc:"Execute dance — activates at enemy sub-40% HP for high-damage finish sequence." },
      { id:"final_strike",     name:"Final Strike",        desc:"Charged full-screen pixel blade — highest single-hit ICEY damage, ideal for boss bursts." },
    ],
    legacyTalents: [
      { id:"dance_invincibility", name:"Dance Invincibility", desc:"During Dance Attack: ICEY takes 0 damage. Full invincibility for the full animation." },
      { id:"pixel_combo",      name:"Pixel Combo",         desc:"Pixel Storm hits +4 strikes. +4 tactic procs per activation." },
      { id:"blade_threshold",  name:"Blade Threshold+",    desc:"Blade Dance activates at 50% enemy HP instead of 40%. Wider execute window." },
      { id:"dance_speed",      name:"Dance Speed",         desc:"Dance Attack animation speed +30%. Faster omnidirectional hit cycle." },
    ],
  },
  prisoner: {
    legacyMoves: [
      { id:"roll_dodge",       name:"Roll Dodge",          desc:"Full invincibility roll — dodge through any attack with 0 damage frames during roll." },
      { id:"weapon_summon",    name:"Weapon Summon",       desc:"Dead Cells weapon pull — summons 1-3 random weapon types for the room." },
      { id:"brutality_strike", name:"Brutality Strike",    desc:"3-element burst — simultaneously applies Burn, Cold, and Electric in one hit." },
      { id:"dead_cells_parry", name:"Dead Cells Parry",    desc:"Weapon parry — blocks incoming attack and counter-attacks with current weapon type." },
    ],
    legacyTalents: [
      { id:"roll_mastery",     name:"Roll Mastery",        desc:"Roll invincibility window +0.4s. Frames fully cover even the fastest enemy combos." },
      { id:"weapon_variety",   name:"Weapon Variety",      desc:"Dead Cells weapon pool +3 weapons at run start. More tactics accessible from turn 1." },
      { id:"kill_momentum",    name:"Kill Momentum",       desc:"Chain Reaction bonus triggers on 2 kills instead of 3. Momentum accelerates faster." },
      { id:"adaptability",     name:"Adaptability",        desc:"Each new weapon type equipped in a run grants +5% all damage, stacking up to 5×." },
    ],
  },
};

const TACTICS_FOR_EVOTYPE = [
  { id:"atk-cold",     slot:"Attack",  name:"Attack Cold",       elem:"ice",      desc:"+46% atk dmg. Slows enemies." },
  { id:"atk-shadow",   slot:"Attack",  name:"Shadow Spike",      elem:"umbra",    desc:"275/hit. Best on clone chars." },
  { id:"atk-burn",     slot:"Attack",  name:"Attack Burn",       elem:"fire",     desc:"260 DoT/s. Multi-target." },
  { id:"atk-thunder",  slot:"Attack",  name:"Chain Lightning",   elem:"electric", desc:"295 × 3 bounce/proc." },
  { id:"sk-cold",      slot:"Skill",   name:"Skill Cold",        elem:"ice",      desc:"+47% all skill damage." },
  { id:"sk-burn",      slot:"Skill",   name:"Skill Burn",        elem:"fire",     desc:"360 DoT/s on skill cast." },
  { id:"sk-spear",     slot:"Skill",   name:"Light Spear",       elem:"light",    desc:"490 flat/skill use." },
  { id:"sk-proj",      slot:"Skill",   name:"Fire Projectile",   elem:"fire",     desc:"280 × 10 projectiles." },
  { id:"sk-mine",      slot:"Skill",   name:"Place Mine",        elem:"fire",     desc:"570/mine. Es aerial: 3 mines." },
  { id:"sk-spirit",    slot:"Skill",   name:"Fire Spirit",       elem:"fire",     desc:"190/hit autonomous spirit." },
  { id:"dash-thunder", slot:"Dash",    name:"Thunderbolt",       elem:"light",    desc:"325 on dash." },
  { id:"dash-shadow",  slot:"Dash",    name:"Dash Shadow",       elem:"umbra",    desc:"200 on every dodge." },
  { id:"dash-blade",   slot:"Dash",    name:"Blade Slash",       elem:"blade",    desc:"220 physical on dash." },
  { id:"leg-spear",    slot:"Legacy",  name:"Light Spear",       elem:"light",    desc:"490/hit. Hakumen: +Magatama." },
  { id:"leg-blackhole",slot:"Legacy",  name:"Blackhole",         elem:"umbra",    desc:"Full-screen CC. S-tier control." },
  { id:"leg-ring",     slot:"Legacy",  name:"Ring of Fire",      elem:"fire",     desc:"770 burst. Wide AoE." },
  { id:"leg-icespike", slot:"Legacy",  name:"Ice Spike",         elem:"ice",      desc:"350 turret. Respawn Double = permanent." },
  { id:"sum-orb",      slot:"Summon",  name:"Lightning Orb",     elem:"electric", desc:"245 DPS field turret." },
  { id:"sum-chain",    slot:"Summon",  name:"Chain Lightning",   elem:"light",    desc:"295 × 3 bounce summon." },
  { id:"sum-frost",    slot:"Summon",  name:"Frost Burst",       elem:"ice",      desc:"520 AoE at max Cold stacks." },
];

const ELEM_COLORS = {
  ice:"#60B8D4", fire:"#E53935", umbra:"#A855F7",
  light:"#EAB308", electric:"#22C55E", blade:"#94A3B8",
};

const CHAR_COLORS = {
  hibiki:"#7B8FE4", ragna:"#D93025", jin:"#4EA8D8", kokonoe:"#E8714A",
  es:"#E878A0", noel:"#60A5FA", rachel:"#D8B4FE", taokaka:"#FCD34D",
  lambda:"#6EE7B7", mai:"#FB923C", hazama:"#86EFAC", hakumen:"#F1F5F9",
  bullet:"#F97316", naoto:"#F87171", icey:"#A78BFA", prisoner:"#94A3B8",
};

const CHAR_NAMES = {
  hibiki:"Hibiki Kohaku", ragna:"Ragna the Bloodedge", jin:"Jin Kisaragi",
  kokonoe:"Kokonoe Mercury", es:"Es", noel:"Noel Vermillion",
  rachel:"Rachel Alucard", taokaka:"Taokaka", lambda:"Lambda-11",
  mai:"Mai Natsume", hazama:"Hazama", hakumen:"Hakumen",
  bullet:"Bullet", naoto:"Naoto Kurogane", icey:"ICEY", prisoner:"The Prisoner",
};

const CHARS_ORDER = ["hibiki","ragna","jin","kokonoe","es","noel","rachel","taokaka","lambda","mai","hazama","hakumen","bullet","naoto","icey","prisoner"];

const STORAGE_KEY = "eo-evotypes-v2";

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveSaved(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

function copyToClipboard(text) {
  try { navigator.clipboard.writeText(text); } catch {
    const el = document.createElement("textarea");
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand("copy");
    document.body.removeChild(el);
  }
}

function formatExport(evo) {
  const t1 = TACTICS_FOR_EVOTYPE.find(t => t.id === evo.tactic1);
  const t2 = TACTICS_FOR_EVOTYPE.find(t => t.id === evo.tactic2);
  const charData = CHAR_EVOTYPE_DATA[evo.char];
  const lm = charData?.legacyMoves.find(m => m.id === evo.legacyMove);
  const lt = charData?.legacyTalents.find(t => t.id === evo.legacyTalent);
  return [
    `╔══ EVOTYPE: ${evo.name || "(unnamed)"} ══╗`,
    `  Character  : ${CHAR_NAMES[evo.char]}`,
    `  Legacy Move: ${lm ? lm.name : "—"}${lm ? `  — ${lm.desc}` : ""}`,
    `  Talent     : ${lt ? lt.name : "—"}${lt ? `  — ${lt.desc}` : ""}`,
    `  Tactic 1   : [${t1 ? t1.slot : "?"}] ${t1 ? t1.name : "—"}${t1 ? `  (${t1.desc})` : ""}`,
    `  Tactic 2   : [${t2 ? t2.slot : "?"}] ${t2 ? t2.name : "—"}${t2 ? `  (${t2.desc})` : ""}`,
    evo.notes ? `  Strategy   : ${evo.notes}` : null,
    `╚${"═".repeat(Math.max(36, (evo.name || "").length + 18))}╝`,
  ].filter(Boolean).join("\n");
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function EvotypePlanner({ cfg = {}, mob = false }) {
  const [char, setChar] = useState("hibiki");
  const [legacyMove, setLegacyMove] = useState("");
  const [legacyTalent, setLegacyTalent] = useState("");
  const [tactic1, setTactic1] = useState("");
  const [tactic2, setTactic2] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(loadSaved);
  const [copied, setCopied] = useState(null);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const color = CHAR_COLORS[char];
  const charData = CHAR_EVOTYPE_DATA[char];

  // Reset move/talent when char changes
  useEffect(() => {
    setLegacyMove("");
    setLegacyTalent("");
  }, [char]);

  function handleSave() {
    if (!legacyMove || !legacyTalent || !tactic1 || !tactic2) return;
    const entry = {
      id: editId || `evo_${Date.now()}`,
      char, legacyMove, legacyTalent, tactic1, tactic2,
      name: name.trim() || `${CHAR_NAMES[char].split(" ")[0]} Evotype`,
      notes: notes.trim(),
      created: editId ? (saved.find(s=>s.id===editId)?.created || Date.now()) : Date.now(),
    };
    const next = editId
      ? saved.map(s => s.id === editId ? entry : s)
      : [entry, ...saved];
    setSaved(next);
    saveSaved(next);
    setEditId(null);
    setName(""); setNotes(""); setLegacyMove(""); setLegacyTalent("");
    setTactic1(""); setTactic2("");
  }

  function handleLoad(evo) {
    setChar(evo.char);
    setTimeout(() => {
      setLegacyMove(evo.legacyMove);
      setLegacyTalent(evo.legacyTalent);
      setTactic1(evo.tactic1); setTactic2(evo.tactic2);
      setName(evo.name); setNotes(evo.notes || "");
      setEditId(evo.id);
      window.scrollTo(0, 0);
    }, 20);
  }

  function handleDelete(id) {
    const next = saved.filter(s => s.id !== id);
    setSaved(next); saveSaved(next); setConfirmDelete(null);
    if (editId === id) { setEditId(null); setName(""); setNotes(""); }
  }

  function handleCopy(evo) {
    copyToClipboard(formatExport(evo));
    setCopied(evo.id);
    setTimeout(() => setCopied(null), 1800);
  }

  function handleCancelEdit() {
    setEditId(null); setName(""); setNotes("");
    setLegacyMove(""); setLegacyTalent(""); setTactic1(""); setTactic2("");
  }

  const canSave = legacyMove && legacyTalent && tactic1 && tactic2 && tactic1 !== tactic2;

  // ── Styles ──
  const S = {
    wrap:   { display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", background:"#060606" },
    charStrip: { display:"flex", overflowX:"auto", borderBottom:"1px solid #131313", background:"#040404", flexShrink:0, WebkitOverflowScrolling:"touch", scrollbarWidth:"none" },
    charBtn: (a,c) => ({ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", padding:"8px 10px", cursor:"pointer", borderBottom: a?`2px solid ${c}`:"2px solid transparent", background: a?`${c}14`:"transparent", transition:"all 0.12s", minWidth:58 }),
    body:   { display:"flex", flex:1, overflow:"hidden", flexDirection: mob?"column":"row" },
    panel:  { width: mob?"100%":340, flexShrink:0, borderRight:"1px solid #111", overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:14 },
    main:   { flex:1, overflowY:"auto", padding: mob?"12px":"20px 24px" },
    label:  { fontSize:10, letterSpacing:3, color:"#484848", fontWeight:700, marginBottom:5, fontFamily:"'Barlow Condensed',sans-serif" },
    input:  { background:"#0C0C0C", border:"1px solid #1E1E1E", color:"#E8E5DD", padding:"9px 12px", fontSize:13, width:"100%", boxSizing:"border-box", outline:"none", fontFamily:"'Courier Prime',monospace", letterSpacing:0.5 },
    select: { background:"#0C0C0C", border:"1px solid #1E1E1E", color:"#E8E5DD", padding:"9px 12px", fontSize:12, width:"100%", boxSizing:"border-box", outline:"none", cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1 },
    btn:    (c,dis) => ({ background: dis?"#111":`${c}18`, border:`1px solid ${dis?"#1E1E1E":c}`, color:dis?"#333":c, padding:"10px 0", fontSize:12, letterSpacing:3, fontWeight:900, cursor:dis?"not-allowed":"pointer", width:"100%", fontFamily:"'Barlow Condensed',sans-serif", transition:"all 0.15s", clipPath:"polygon(0 0,100% 0,96% 100%,0 100%)" }),
    cancelBtn: { background:"#111", border:"1px solid #2A2A2A", color:"#555", padding:"8px 0", fontSize:11, letterSpacing:2, fontWeight:700, cursor:"pointer", width:"100%", fontFamily:"'Barlow Condensed',sans-serif", marginTop:4 },
    card:   (c) => ({ background:"#080808", border:`1px solid ${c}28`, padding:"14px 16px", marginBottom:12, position:"relative" }),
    cardTitle: (c) => ({ fontSize:15, fontWeight:900, letterSpacing:2, color:c, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:6 }),
    cardRow:{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:4 },
    tag:    (c) => ({ background:`${c}18`, border:`1px solid ${c}44`, color:c, fontSize:10, letterSpacing:2, fontWeight:700, padding:"2px 8px", fontFamily:"'Barlow Condensed',sans-serif" }),
    cardNote:{ fontSize:11, color:"#555", marginTop:6, fontStyle:"italic", lineHeight:1.4 },
    cardActions:{ display:"flex", gap:6, marginTop:10 },
    actionBtn:(c,active) => ({ background: active?`${c}22`:"#101010", border:`1px solid ${active?c:"#2A2A2A"}`, color:active?c:"#555", padding:"5px 12px", fontSize:10, letterSpacing:2, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif" }),
    divider:{ borderTop:"1px solid #111", margin:"4px 0" },
    sectionTitle: { fontSize:10, letterSpacing:4, color:"#333", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:12 },
    emptyState: { textAlign:"center", padding:"60px 20px", color:"#2A2A2A" },
    editBanner: (c) => ({ background:`${c}0E`, border:`1px solid ${c}33`, padding:"8px 12px", fontSize:11, color:c, letterSpacing:2, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:4 }),
  };

  const selectedLM = charData?.legacyMoves.find(m => m.id === legacyMove);
  const selectedLT = charData?.legacyTalents.find(t => t.id === legacyTalent);
  const selectedT1 = TACTICS_FOR_EVOTYPE.find(t => t.id === tactic1);
  const selectedT2 = TACTICS_FOR_EVOTYPE.find(t => t.id === tactic2);

  return (
    <div style={S.wrap}>
      {/* Character strip */}
      <div style={S.charStrip}>
        {CHARS_ORDER.map(id => (
          <div key={id} style={S.charBtn(char===id, CHAR_COLORS[id])} onClick={()=>setChar(id)}>
            <img src={`/chars/${id}.png`} alt={id} style={{ width:32, height:42, objectFit:"cover", objectPosition:"top center", clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)", filter:char===id?"none":"brightness(0.35)", transition:"filter 0.12s" }} onError={e=>{e.target.style.display="none"}}/>
            <div style={{ fontSize:8, fontWeight:900, letterSpacing:0.5, color:char===id?CHAR_COLORS[id]:"#2E2E2E", marginTop:3, fontFamily:"'Barlow Condensed',sans-serif", textAlign:"center" }}>
              {CHAR_NAMES[id].split(" ")[0].toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div style={S.body}>
        {/* ── LEFT PANEL: Builder ── */}
        <div style={S.panel}>
          {/* Header */}
          <div>
            <div style={{ fontSize:18, fontWeight:900, letterSpacing:3, color, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1.1 }}>
              {editId ? "EDITING EVOTYPE" : "NEW EVOTYPE"}
            </div>
            <div style={{ fontSize:10, letterSpacing:2, color:"#383838", marginTop:3 }}>
              {CHAR_NAMES[char].toUpperCase()}
            </div>
          </div>

          {editId && (
            <div style={S.editBanner(color)}>⟳ EDITING SAVED LOADOUT</div>
          )}

          {/* Name */}
          <div>
            <div style={S.label}>EVOTYPE NAME</div>
            <input style={S.input} placeholder="e.g. FROZEN ASSASSIN" value={name} onChange={e=>setName(e.target.value)} maxLength={40}/>
          </div>

          {/* Legacy Move */}
          <div>
            <div style={S.label}>LEGACY MOVE</div>
            <select style={S.select} value={legacyMove} onChange={e=>setLegacyMove(e.target.value)}>
              <option value="">— Select legacy move —</option>
              {charData?.legacyMoves.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {selectedLM && (
              <div style={{ fontSize:11, color:"#555", marginTop:5, lineHeight:1.4, fontStyle:"italic" }}>
                {selectedLM.desc}
              </div>
            )}
          </div>

          {/* Legacy Talent */}
          <div>
            <div style={S.label}>LEGACY TALENT</div>
            <select style={S.select} value={legacyTalent} onChange={e=>setLegacyTalent(e.target.value)}>
              <option value="">— Select legacy talent —</option>
              {charData?.legacyTalents.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedLT && (
              <div style={{ fontSize:11, color:"#555", marginTop:5, lineHeight:1.4, fontStyle:"italic" }}>
                {selectedLT.desc}
              </div>
            )}
          </div>

          <div style={S.divider}/>

          {/* Tactic 1 */}
          <div>
            <div style={S.label}>TACTIC SLOT 1</div>
            <select style={S.select} value={tactic1} onChange={e=>setTactic1(e.target.value)}>
              <option value="">— Select tactic —</option>
              {["Attack","Skill","Dash","Legacy","Summon"].map(slot => (
                <optgroup key={slot} label={`── ${slot} ──`}>
                  {TACTICS_FOR_EVOTYPE.filter(t=>t.slot===slot && t.id!==tactic2).map(t=>(
                    <option key={t.id} value={t.id}>[{t.slot}] {t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedT1 && (
              <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:5 }}>
                <span style={{ ...S.tag(ELEM_COLORS[selectedT1.elem]||"#888") }}>{selectedT1.elem.toUpperCase()}</span>
                <span style={{ fontSize:11, color:"#555" }}>{selectedT1.desc}</span>
              </div>
            )}
          </div>

          {/* Tactic 2 */}
          <div>
            <div style={S.label}>TACTIC SLOT 2</div>
            <select style={S.select} value={tactic2} onChange={e=>setTactic2(e.target.value)}>
              <option value="">— Select tactic —</option>
              {["Attack","Skill","Dash","Legacy","Summon"].map(slot => (
                <optgroup key={slot} label={`── ${slot} ──`}>
                  {TACTICS_FOR_EVOTYPE.filter(t=>t.slot===slot && t.id!==tactic1).map(t=>(
                    <option key={t.id} value={t.id}>[{t.slot}] {t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedT2 && (
              <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:5 }}>
                <span style={{ ...S.tag(ELEM_COLORS[selectedT2.elem]||"#888") }}>{selectedT2.elem.toUpperCase()}</span>
                <span style={{ fontSize:11, color:"#555" }}>{selectedT2.desc}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={S.label}>STRATEGY NOTES (OPTIONAL)</div>
            <textarea style={{ ...S.input, resize:"vertical", minHeight:72, lineHeight:1.5 }}
              placeholder="Run strategy, crystal notes, boss priority..."
              value={notes} onChange={e=>setNotes(e.target.value)} maxLength={400}/>
          </div>

          {/* Save button */}
          <div>
            {!canSave && (
              <div style={{ fontSize:10, color:"#333", letterSpacing:1, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif" }}>
                {!legacyMove||!legacyTalent ? "↑ SELECT LEGACY MOVE + TALENT" : !tactic1||!tactic2 ? "↑ SELECT BOTH TACTIC SLOTS" : tactic1===tactic2 ? "TACTIC SLOTS MUST BE DIFFERENT" : ""}
              </div>
            )}
            <button style={S.btn(color, !canSave)} onClick={handleSave} disabled={!canSave}>
              {editId ? "UPDATE EVOTYPE" : "SAVE EVOTYPE"}
            </button>
            {editId && (
              <button style={S.cancelBtn} onClick={handleCancelEdit}>CANCEL EDIT</button>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Saved loadouts ── */}
        <div style={S.main}>
          <div style={{ ...S.sectionTitle, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span>SAVED EVOTYPES — {saved.length} LOADOUT{saved.length!==1?"S":""}</span>
            {saved.length > 0 && (
              <span style={{ fontSize:10, color:"#2A2A2A" }}>CLICK LOAD TO EDIT</span>
            )}
          </div>

          {saved.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize:40, marginBottom:12 }}>⬡</div>
              <div style={{ fontSize:14, letterSpacing:3, fontFamily:"'Barlow Condensed',sans-serif" }}>NO EVOTYPES SAVED</div>
              <div style={{ fontSize:11, marginTop:8, color:"#222" }}>Build your loadout on the left and save it</div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns: mob?"1fr":"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
              {saved.map(evo => {
                const ec = CHAR_COLORS[evo.char];
                const lm = CHAR_EVOTYPE_DATA[evo.char]?.legacyMoves.find(m=>m.id===evo.legacyMove);
                const lt = CHAR_EVOTYPE_DATA[evo.char]?.legacyTalents.find(t=>t.id===evo.legacyTalent);
                const t1 = TACTICS_FOR_EVOTYPE.find(t=>t.id===evo.tactic1);
                const t2 = TACTICS_FOR_EVOTYPE.find(t=>t.id===evo.tactic2);
                const isEditing = editId === evo.id;
                return (
                  <div key={evo.id} style={{ ...S.card(ec), outline: isEditing?`1px solid ${ec}55`:"none" }}>
                    {isEditing && (
                      <div style={{ fontSize:9, letterSpacing:3, color:ec, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif" }}>
                        ● CURRENTLY EDITING
                      </div>
                    )}

                    {/* Card header */}
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                      <img src={`/chars/${evo.char}.png`} alt={evo.char} style={{ width:36, height:48, objectFit:"cover", objectPosition:"top center", clipPath:"polygon(0 0,100% 0,88% 100%,0 100%)", flexShrink:0, filter:"brightness(0.85)" }} onError={e=>{e.target.style.display="none"}}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={S.cardTitle(ec)}>{evo.name}</div>
                        <div style={{ fontSize:10, color:"#444", letterSpacing:1, fontFamily:"'Barlow Condensed',sans-serif" }}>
                          {CHAR_NAMES[evo.char].toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Legacy Move */}
                    <div style={{ marginBottom:6 }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:"#333", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:3 }}>LEGACY MOVE</div>
                      <div style={{ fontSize:12, color:ec, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.5 }}>
                        {lm ? lm.name : "—"}
                      </div>
                      {lm && <div style={{ fontSize:10, color:"#444", marginTop:2, lineHeight:1.3 }}>{lm.desc}</div>}
                    </div>

                    {/* Legacy Talent */}
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:"#333", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:3 }}>LEGACY TALENT</div>
                      <div style={{ fontSize:12, color:"#B0A899", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.5 }}>
                        {lt ? lt.name : "—"}
                      </div>
                      {lt && <div style={{ fontSize:10, color:"#444", marginTop:2, lineHeight:1.3 }}>{lt.desc}</div>}
                    </div>

                    {/* Tactics */}
                    <div style={{ marginBottom:6 }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:"#333", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:4 }}>TACTIC SLOTS</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        {[t1,t2].map((t,i) => t ? (
                          <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
                            <span style={{ fontSize:9, letterSpacing:1, color:"#444", fontFamily:"'Barlow Condensed',sans-serif", minWidth:44 }}>SLOT {i+1}</span>
                            <span style={S.tag(ELEM_COLORS[t.elem]||"#888")}>{t.elem.toUpperCase()}</span>
                            <span style={{ fontSize:11, color:"#C0B8B0", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.5 }}>{t.name}</span>
                          </div>
                        ) : null)}
                      </div>
                    </div>

                    {/* Notes */}
                    {evo.notes && (
                      <div style={{ ...S.cardNote, borderTop:"1px solid #111", paddingTop:6, marginTop:4 }}>
                        "{evo.notes}"
                      </div>
                    )}

                    {/* Actions */}
                    <div style={S.cardActions}>
                      <button style={S.actionBtn(ec, isEditing)} onClick={()=>handleLoad(evo)}>
                        {isEditing ? "EDITING" : "LOAD"}
                      </button>
                      <button style={S.actionBtn("#22C55E", copied===evo.id)} onClick={()=>handleCopy(evo)}>
                        {copied===evo.id ? "COPIED!" : "EXPORT"}
                      </button>
                      {confirmDelete===evo.id ? (
                        <>
                          <button style={S.actionBtn("#E53935",true)} onClick={()=>handleDelete(evo.id)}>CONFIRM</button>
                          <button style={S.actionBtn("#555",false)} onClick={()=>setConfirmDelete(null)}>CANCEL</button>
                        </>
                      ) : (
                        <button style={S.actionBtn("#E53935",false)} onClick={()=>setConfirmDelete(evo.id)}>DELETE</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
