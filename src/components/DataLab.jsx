import { useState } from "react";
import { DATA_CATEGORIES, useCommunityData, getApprovedEntries } from "../hooks/useCommunityData.js";

const S = {
  wrap:    { background:"#080808", minHeight:"100vh", padding:"24px 20px 60px", boxSizing:"border-box" },
  header:  { borderBottom:"1px solid #1A1A1A", paddingBottom:20, marginBottom:28 },
  title:   { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:"clamp(28px,5vw,44px)", color:"#F0EDE5", letterSpacing:3, lineHeight:1 },
  sub:     { fontFamily:"'Courier Prime',monospace", fontSize:11, color:"#444", letterSpacing:2, marginTop:6 },
  notice:  { background:"#0D0D0D", border:"1px solid #2A1A1A", padding:"14px 18px", marginBottom:28, fontFamily:"'Courier Prime',monospace", fontSize:11, lineHeight:1.7, color:"#666" },
  noticeRed: { color:"#B91C1C", fontWeight:700 },
  grid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12, marginBottom:32 },
  catCard: (active) => ({
    background: active ? "#120808" : "#0A0A0A",
    border:`1px solid ${active ? "#B91C1C" : "#1A1A1A"}`,
    padding:"14px 16px", cursor:"pointer",
    transition:"border-color 0.15s",
  }),
  catTitle: { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, color:"#F0EDE5", letterSpacing:1, marginBottom:4 },
  catDesc:  { fontFamily:"'Courier Prime',monospace", fontSize:10, color:"#555", lineHeight:1.5 },
  form:    { background:"#0A0A0A", border:"1px solid #1E1E1E", padding:"20px 22px", marginBottom:32 },
  formTitle: { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, color:"#B91C1C", letterSpacing:2, marginBottom:16 },
  fieldRow: { marginBottom:14 },
  label:   { fontFamily:"'Courier Prime',monospace", fontSize:10, color:"#888", letterSpacing:1.5, marginBottom:5, display:"block" },
  input:   { width:"100%", background:"#060606", border:"1px solid #222", color:"#F0EDE5", fontFamily:"'Courier Prime',monospace", fontSize:12, padding:"9px 11px", boxSizing:"border-box", outline:"none" },
  textarea: { width:"100%", background:"#060606", border:"1px solid #222", color:"#F0EDE5", fontFamily:"'Courier Prime',monospace", fontSize:12, padding:"9px 11px", boxSizing:"border-box", outline:"none", resize:"vertical", minHeight:80 },
  select:  { width:"100%", background:"#060606", border:"1px solid #222", color:"#F0EDE5", fontFamily:"'Courier Prime',monospace", fontSize:12, padding:"9px 11px", boxSizing:"border-box", outline:"none" },
  metaRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 },
  metaFull:{ marginBottom:14 },
  divider: { borderTop:"1px solid #141414", margin:"18px 0" },
  submitBtn: { background:"#B91C1C", color:"#F0EDE5", border:"none", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, letterSpacing:2, padding:"11px 28px", cursor:"pointer" },
  successBox: { background:"#051005", border:"1px solid #1A3A1A", padding:"14px 16px", fontFamily:"'Courier Prime',monospace", fontSize:11, color:"#4ADE80", lineHeight:1.7, marginBottom:24 },
  approvedSection: { marginTop:32 },
  appHeader: { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, color:"#C9A227", letterSpacing:2, marginBottom:14, borderBottom:"1px solid #1A1A1A", paddingBottom:8 },
  appCard:  { background:"#0A0A0A", border:"1px solid #1C1C0A", padding:"14px 16px", marginBottom:10 },
  appCat:   { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:11, letterSpacing:2, color:"#C9A227", marginBottom:4 },
  appDetail: { fontFamily:"'Courier Prime',monospace", fontSize:11, color:"#888", lineHeight:1.6 },
  appNote:  { fontFamily:"'Courier Prime',monospace", fontSize:10, color:"#555", marginTop:6, borderTop:"1px solid #131313", paddingTop:6 },
  emptyNote: { fontFamily:"'Courier Prime',monospace", fontSize:11, color:"#333", padding:"20px 0", textAlign:"center" },
  badge:   (c) => ({ display:"inline-block", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:9, letterSpacing:1.5, padding:"2px 7px", background:c+"22", color:c, marginBottom:4 }),
};

const ELEM_COL = { ice:"#5BC4E8", fire:"#E84E25", umbra:"#A855F7", light:"#EDB72C", electric:"#00D9BB" };

function FieldInput({ field, value, onChange }) {
  if (field.type === "select") return (
    <select style={S.select} value={value || ""} onChange={e => onChange(field.id, e.target.value)}>
      <option value="">— select —</option>
      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (field.type === "textarea") return (
    <textarea style={S.textarea} value={value || ""} onChange={e => onChange(field.id, e.target.value)} placeholder={field.placeholder || ""} />
  );
  return (
    <input style={S.input} type={field.type === "number" ? "number" : "text"} value={value || ""} onChange={e => onChange(field.id, e.target.value)} placeholder={field.placeholder || ""} />
  );
}

export default function DataLab({ mob = false }) {
  const { submit } = useCommunityData();
  const [selectedCat, setSelectedCat] = useState(null);
  const [formData, setFormData]       = useState({});
  const [meta, setMeta]               = useState({ username: "", source: "", sourceType: "in-game measurement" });
  const [submitted, setSubmitted]     = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const approved = getApprovedEntries();

  const cat = DATA_CATEGORIES.find(c => c.id === selectedCat);

  function handleField(id, val) { setFormData(p => ({ ...p, [id]: val })); }
  function handleMeta(id, val)  { setMeta(p => ({ ...p, [id]: val })); }

  function handleSubmit() {
    if (!cat) return;
    const missing = cat.fields.filter(f => !formData[f.id]);
    if (missing.length) { alert("Fill all required fields: " + missing.map(f => f.label).join(", ")); return; }
    if (!meta.username.trim()) { alert("Username required."); return; }
    if (!meta.source.trim())   { alert("Source link or description required."); return; }
    const id = submit({
      category:    cat.id,
      categoryLabel: cat.label,
      data:        { ...formData },
      meta:        { ...meta },
    });
    setSubmittedId(id);
    setSubmitted(true);
    setFormData({});
  }

  function resetForm() {
    setSubmitted(false);
    setSubmittedId(null);
    setFormData({});
    setSelectedCat(null);
  }

  return (
    <div style={S.wrap}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.title}>DATA LAB</div>
        <div style={S.sub}>COMMUNITY VERIFICATION SYSTEM // SUBMIT TRUTH, ADMIN APPROVES</div>
      </div>

      {/* ── Notice ── */}
      <div style={S.notice}>
        <span style={S.noticeRed}>⚠ ALL UNVERIFIED DATA IS STRIPPED FROM THIS APP.</span>{"  "}
        Every tactic damage value, DPS number, and mechanic claim requires a real source.<br />
        Submit your findings below. Each entry goes into a <span style={{color:"#888"}}>pending queue</span> and must be approved by the admin before it appears anywhere in the app.<br />
        <span style={{color:"#444"}}>Required: your username · a source (video timestamp, screenshot link, or detailed test description) · the exact value.</span>
      </div>

      {submitted ? (
        /* ── Success ── */
        <div>
          <div style={S.successBox}>
            ✓ SUBMISSION RECEIVED<br />
            ID: {submittedId}<br />
            Your entry is in the pending queue. The admin will review it before it appears in the app.<br />
            Thank you for contributing real data.
          </div>
          <button style={S.submitBtn} onClick={resetForm}>SUBMIT ANOTHER</button>
        </div>
      ) : (
        <>
          {/* ── Category Select ── */}
          <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:"#555", letterSpacing:2, marginBottom:12 }}>
            SELECT SUBMISSION TYPE
          </div>
          <div style={S.grid}>
            {DATA_CATEGORIES.map(c => (
              <div key={c.id} style={S.catCard(selectedCat === c.id)} onClick={() => { setSelectedCat(c.id); setFormData({}); }}>
                <div style={S.catTitle}>{c.label}</div>
                <div style={S.catDesc}>{c.description}</div>
              </div>
            ))}
          </div>

          {/* ── Form ── */}
          {cat && (
            <div style={S.form}>
              <div style={S.formTitle}>{cat.label.toUpperCase()}</div>

              {cat.fields.map(field => (
                <div key={field.id} style={S.fieldRow}>
                  <label style={S.label}>{field.label.toUpperCase()}</label>
                  <FieldInput field={field} value={formData[field.id]} onChange={handleField} />
                </div>
              ))}

              <div style={S.divider} />
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:"#555", letterSpacing:2, marginBottom:10 }}>
                YOUR DETAILS — REQUIRED FOR REVIEW
              </div>

              <div style={mob ? {} : S.metaRow}>
                <div style={mob ? S.fieldRow : {}}>
                  <label style={S.label}>YOUR USERNAME</label>
                  <input style={S.input} value={meta.username} onChange={e => handleMeta("username", e.target.value)} placeholder="e.g. Morpheus / FuryMain / anonymous" />
                </div>
                <div style={mob ? S.fieldRow : {}}>
                  <label style={S.label}>HOW DID YOU MEASURE THIS?</label>
                  <select style={S.select} value={meta.sourceType} onChange={e => handleMeta("sourceType", e.target.value)}>
                    <option value="in-game measurement">In-game measurement (damage numbers on)</option>
                    <option value="video timestamp">Video / stream (with timestamp)</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="repeated testing">Repeated testing across runs</option>
                    <option value="wiki / patch notes">Wiki or official patch notes</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={S.metaFull}>
                <label style={S.label}>SOURCE LINK OR DESCRIPTION (REQUIRED)</label>
                <textarea style={{...S.textarea, minHeight:60}}
                  value={meta.source}
                  onChange={e => handleMeta("source", e.target.value)}
                  placeholder="Paste a YouTube link with timestamp, an Imgur screenshot, or describe exactly how you tested this (e.g. 'Equip Shadow Spike Legendary, enable damage numbers, hit training dummy 20× and average the values')"
                />
              </div>

              <button style={S.submitBtn} onClick={handleSubmit}>SUBMIT FOR REVIEW</button>
            </div>
          )}
        </>
      )}

      {/* ── Approved Entries ── */}
      <div style={S.approvedSection}>
        <div style={S.appHeader}>✓ APPROVED COMMUNITY DATA ({approved.length})</div>
        {approved.length === 0 ? (
          <div style={S.emptyNote}>No approved entries yet. Be the first to submit verified data.</div>
        ) : (
          approved.map(e => (
            <div key={e.id} style={S.appCard}>
              <div style={S.badge("#C9A227")}>{e.categoryLabel}</div>
              <div style={S.appDetail}>
                {Object.entries(e.data).map(([k, v]) => (
                  <div key={k}><span style={{color:"#555"}}>{k}: </span>{v}</div>
                ))}
              </div>
              <div style={S.appNote}>
                Submitted by <span style={{color:"#888"}}>{e.meta?.username || "unknown"}</span>
                {"  ·  "}{e.meta?.sourceType}
                {e.adminNote ? <>{"  ·  "}<span style={{color:"#4ADE80"}}>Admin: {e.adminNote}</span></> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
