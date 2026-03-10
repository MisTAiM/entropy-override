// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY DATA SYSTEM
// Users submit verified game numbers → admin approves → data populates the app
// ─────────────────────────────────────────────────────────────────────────────

const PENDING_KEY  = "eo-community-pending-v1";
const APPROVED_KEY = "eo-community-approved-v1";

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};
const save = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// ── FIELD CATEGORIES ──────────────────────────────────────────────────────────
// Each category describes what kind of data can be submitted
export const DATA_CATEGORIES = [
  {
    id: "tactic-val",
    label: "Tactic Damage Value",
    description: "Base damage number for a tactic at a specific rarity (Common / Uncommon / Rare / Legendary)",
    fields: [
      { id: "tactic",  label: "Tactic Name",   type: "select", options: [
        "Cold Attack","Skill Cold","Frost Burst","Attack Burn","Skill Burn",
        "Ring of Fire","Fire Projectile","Fire Spirit","Place Mine",
        "Shadow Spike","Blackhole","Light Spear","Chain Lightning",
        "Lightning Orb","Thunderbolt"
      ]},
      { id: "rarity",  label: "Rarity Tier",   type: "select", options: ["Common","Uncommon","Rare","Legendary"] },
      { id: "value",   label: "Damage Value",  type: "number", placeholder: "e.g. 275" },
      { id: "unit",    label: "Unit",          type: "select", options: [
        "flat damage per hit", "% damage boost", "DoT per second",
        "burst damage", "DPS", "damage per second (turret)", "other"
      ]},
    ]
  },
  {
    id: "character-mechanic",
    label: "Character Mechanic",
    description: "How a specific character interacts with a tactic, mechanic, or system",
    fields: [
      { id: "character", label: "Character",    type: "select", options: [
        "Hibiki","Ragna","Jin","Kokonoe","Es","Noel","Rachel","Taokaka",
        "Lambda","Mai","Hazama","Hakumen","Bullet","Naoto","ICEY","The Prisoner"
      ]},
      { id: "mechanic", label: "Mechanic Name", type: "text", placeholder: "e.g. Mine Bounce, Clone Proc, Blood Kain threshold" },
      { id: "value",    label: "Measured Value (if any)", type: "text", placeholder: "e.g. 3 procs per aerial string, or N/A" },
      { id: "detail",   label: "How it works",  type: "textarea", placeholder: "Describe the mechanic in detail" },
    ]
  },
  {
    id: "crystal-stat",
    label: "Mind Crystal Stat",
    description: "Exact percentage or value for a Mind Crystal effect",
    fields: [
      { id: "crystal",  label: "Crystal Name",  type: "select", options: [
        "Straightforward","Domination","Giant Slayer","Combo Surge","Lethal Momentum",
        "Predator","Not Dead Yet","Indestructible","Defensive Combo","Vital Boost",
        "Compliment of Death","Second Wind","Commerce Healing","Mana Surge",
        "Mixture Enhancement","Point Surge","Exhilaration","Focus","Fatal Blow",
        "Resonance","Compliment of Death","Damage Shield","Adrenaline","Iron Will",
        "Phantom Step","Combo Extender","Legacy Amplifier","Summon Booster",
        "Overcharge","Hunter's Mark","Blood Pact","Apex Predator","Chain Reaction"
      ]},
      { id: "tier",     label: "Base or Ascended", type: "select", options: ["Base","Ascended"] },
      { id: "value",    label: "Effect Value",   type: "text", placeholder: "e.g. +45% ATK" },
    ]
  },
  {
    id: "build-combo",
    label: "Build Combo / DPS Measurement",
    description: "Actual in-game DPS or burst measurement from a specific build",
    fields: [
      { id: "character", label: "Character",    type: "select", options: [
        "Hibiki","Ragna","Jin","Kokonoe","Es","Noel","Rachel","Taokaka",
        "Lambda","Mai","Hazama","Hakumen","Bullet","Naoto","ICEY","The Prisoner"
      ]},
      { id: "buildName", label: "Build / Tactic Setup", type: "text", placeholder: "e.g. Shadow Spike + Clone Army at Legendary" },
      { id: "value",     label: "Measured DPS or Burst", type: "number", placeholder: "e.g. 2400" },
      { id: "conditions",label: "Conditions",  type: "textarea", placeholder: "Entropy level, crystals equipped, how you measured it" },
    ]
  },
  {
    id: "general-correction",
    label: "General Correction",
    description: "Anything in the app that is wrong — mechanic description, tier placement, tactic interaction, etc.",
    fields: [
      { id: "location",  label: "Where in the app", type: "text", placeholder: "e.g. Es — Mine Bouncer build notes" },
      { id: "current",   label: "What it says now",  type: "textarea", placeholder: "Quote what the app currently shows" },
      { id: "correct",   label: "What it should say", type: "textarea", placeholder: "The correct information" },
    ]
  },
];

// ── SUBMISSION API ─────────────────────────────────────────────────────────────
export function submitCommunityEntry(entry) {
  const pending = load(PENDING_KEY);
  const newEntry = {
    id:        Date.now() + "_" + Math.random().toString(36).slice(2,7),
    timestamp: new Date().toISOString(),
    status:    "pending",
    ...entry,
  };
  pending.push(newEntry);
  save(PENDING_KEY, pending);
  return newEntry.id;
}

export function getPendingEntries() {
  return load(PENDING_KEY).filter(e => e.status === "pending");
}

export function getApprovedEntries() {
  return load(APPROVED_KEY);
}

export function getAllPending() {
  return load(PENDING_KEY);
}

export function approveEntry(id, adminNote = "") {
  const pending  = load(PENDING_KEY);
  const approved = load(APPROVED_KEY);
  const idx = pending.findIndex(e => e.id === id);
  if (idx === -1) return false;
  const entry = { ...pending[idx], status: "approved", adminNote, approvedAt: new Date().toISOString() };
  pending.splice(idx, 1);
  approved.push(entry);
  save(PENDING_KEY, pending);
  save(APPROVED_KEY, approved);
  return true;
}

export function rejectEntry(id, reason = "") {
  const pending = load(PENDING_KEY);
  const idx = pending.findIndex(e => e.id === id);
  if (idx === -1) return false;
  pending[idx] = { ...pending[idx], status: "rejected", rejectReason: reason };
  save(PENDING_KEY, pending);
  return true;
}

export function deleteApproved(id) {
  const approved = load(APPROVED_KEY).filter(e => e.id !== id);
  save(APPROVED_KEY, approved);
}

export function clearRejected() {
  const pending = load(PENDING_KEY).filter(e => e.status !== "rejected");
  save(PENDING_KEY, pending);
}

// ── REACT HOOK ─────────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

export function useCommunityData() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  return {
    pending:  getAllPending(),
    approved: getApprovedEntries(),
    pendingCount: getPendingEntries().length,
    submit: (entry) => { submitCommunityEntry(entry); refresh(); },
    approve: (id, note) => { approveEntry(id, note); refresh(); },
    reject: (id, reason) => { rejectEntry(id, reason); refresh(); },
    deleteApproved: (id) => { deleteApproved(id); refresh(); },
    clearRejected: () => { clearRejected(); refresh(); },
  };
}
