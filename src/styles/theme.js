export const TIER_COLORS = { S:"#E53935", A:"#FF8F00", B:"#1976D2", C:"#757575" };
export const ELEM_COLORS = {
  Ice:"#60B8D4", Fire:"#E53935", Umbra:"#A855F7",
  Light:"#EAB308", Electric:"#22C55E"
};

export const getStyles = (theme = {}) => ({
  wrap:   { background:"#080808", minHeight:"100vh", color:"#F0EDE5", fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif" },
  header: { borderBottom:"2px solid #B91C1C", padding:"18px 28px 14px", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"space-between" },
  nav:    { display:"flex", gap:0, borderBottom:"1px solid #161616", padding:"0 28px", background:"#090909" },
  navBtn: (active) => ({ background:"transparent", border:"none", borderBottom:active?"3px solid #B91C1C":"3px solid transparent", color:active?"#F0EDE5":"#505050", padding:"14px 28px", fontSize:15, letterSpacing:3, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif", transition:"all 0.15s" }),
  main:   { display:"flex", height:"calc(100vh - 108px)" },
  sidebar:{ width:210, borderRight:"1px solid #111", overflowY:"auto", flexShrink:0, background:"#090909" },
  content:{ flex:1, overflowY:"auto", padding:26 },
  charRow:(active, color) => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 13px", cursor:"pointer", borderLeft:active?`3px solid ${color}`:"3px solid transparent", background:active?"#111":"transparent", transition:"all 0.1s" }),
  card:   { background:"#0D0D0D", border:"1px solid #1A1A1A", padding:"20px", marginBottom:14 },
  label:  { fontSize:12, letterSpacing:3, color:"#4A4A4A", fontWeight:700, marginBottom:10, fontFamily:"'Barlow Condensed',sans-serif" },
  g2:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3:     { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 },
  buildTabBtn: (active, col) => ({ background:active?`${col}1A`:"#111", border:`2px solid ${active?col:"#1E1E1E"}`, color:active?col:"#505050", padding:"10px 22px", fontSize:14, letterSpacing:2, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif", clipPath:"polygon(0 0,100% 0,94% 100%,0 100%)", transition:"all 0.15s", marginRight:6 }),
  statRow:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #111" },
});
