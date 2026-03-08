export const DEFAULTS = {
  accentColor:"#B91C1C", goldColor:"#C9A227", bgColor:"#080808",
  cardBg:"#0D0D0D", textColor:"#F0EDE5", fontScale:100,
  sidebarWidth:272, animSpeed:"normal", compactMode:false,
  borderRadius:0, customCSS:"",
  logoTitle:"ENTROPY", logoSub:"OVERRIDE // TACTICS CODEX",
  showStatusDot:true, showBrandRule:true,
  defaultTab:"home", navHeight:44,
  showDPS:true, showRadar:true, showMath:true, showTips:true,
  showSynergies:true, showMechanics:true, showTalent:true,
  showLegacy:true, showTierBadge:true, showElementBadge:true,
  showCharArtwork:true, showStatsBar:true, showFeatureCards:true,
  showRosterGrid:true,
  hiddenChars:[],
  defaultChar:"hibiki", defaultBuild:0,
  maintenanceMode:false,
  maintenanceMsg:"Site under maintenance. Check back soon.",
  changelogText:"",
};

export function getSettings() {
  try {
    const raw = localStorage.getItem("eo-settings");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

export function saveSettings(partial) {
  const next = { ...getSettings(), ...partial };
  localStorage.setItem("eo-settings", JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("eo-settings", { detail: next }));
  return next;
}

export function resetSettings(keys) {
  const current = getSettings();
  const next = { ...current };
  (keys || Object.keys(DEFAULTS)).forEach(k => { next[k] = DEFAULTS[k]; });
  localStorage.setItem("eo-settings", JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("eo-settings", { detail: next }));
  return next;
}
