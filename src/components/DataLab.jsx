import { useState } from "react";
import { DATA_CATEGORIES, useCommunityData, getApprovedEntries } from "../hooks/useCommunityData.js";

const mono   = "'Courier Prime','Courier New',monospace";
const barlow = "'Barlow Condensed','Arial Narrow',sans-serif";

const S = {
  header:    { borderBottom:"1px solid #1A1A1A", paddingBottom:16, marginBottom:24 },
  title:     { fontFamily:barlow, fontWeight:900, fontSize:"clamp(24px,5vw,40px)", color:"#F0EDE5", letterSpacing:3, lineHeight:1 },
  sub:       { fontFamily:mono, fontSize:10, color:"#444", letterSpacing:2, marginTop:5 },
  notice:    { background:"#0D0D0D", border:"1px solid #2A1A1A", padding:"12px 14px", marginBottom:24, fontFamily:mono, fontSize:11, lineHeight:1.7, color:"#666" },
  noticeRed: { color:"#B91C1C", fontWeight:700 },
  catTitle:  { fontFamily:barlow, fontWeight:900, fontSize:14, color:"#F0EDE5", letterSpacing:1, marginBottom:4 },
  catDesc:   { fontFamily:mono, fontSize:10, color:"#555", lineHeight:1.5 },
  formTitle: { fontFamily:barlow, fontWeight:900, fontSize:16, color:"#B91C1C", letterSpacing:2, marginBottom:14 },
  label:     { fontFamily:mono, fontSize:10, color:"#888", letterSpacing:1.5, marginBottom:4, display:"block" },
  input:     { width:"100%", background:"#060606", border:"1px solid #222", color:"#F0EDE5", fontFamily:mono, fontSize:12, padding:"8px 10px", boxSizing:"border-box", outline:"none" },
  textarea:  { width:"100%", background:"#060606", border:"1px solid #222", color:"#F0EDE5", fontFamily:mono, fontSize:12, padding:"8px 10px", boxSizing:"border-box", outline:"none", resize:"vertical", minHeight:72 },
  select:    { width:"100%", background:"#060606", border:"1px solid #222", color:"#F0EDE5", fontFamily:mono, fontSize:12, padding:"8px 10px", boxSizing:"border-box", outline:"none" },
  divider:   { borderTop:"1px solid #141414", margin:"16px 0" },
  submitBtn: { background:"#B91C1C", color:"#F0EDE5", border:"none", fontFamily:barlow, fontWeight:900, fontSize:14, letterSpacing:2, padding:"10px 24px", cursor:"pointer" },
  successBox:{ background:"#051005", border:"1px solid #1A3A1A", padding:"14px 16px", fontFamily:mono, fontSize:11, color:"#4ADE80", lineHeight:1.7, marginBottom:20 },
  appHeader: { fontFamily:barlow, fontWeight:900, fontSize:16, color:"#C9A227", letterSpacing:2, marginBottom:12, borderBottom:"1px solid #1A1A1A", paddingBottom:8 },
  appCard:   { background:"#0A0A0A", border:"1px solid #1C1C0A", padding:"12px 14px", marginBottom:8 },
  appDetail: { fontFamily:mono, fontSize:11, color:"#888", lineHeight:1.6 },
  appNote:   { fontFamily:mono, fontSize:10, color:"#555", marginTop:6, borderTop:"1px solid #131313", paddingTop:6 },
  emptyNote: { fontFamily:mono, fontSize:11, color:"#333", padding:"20px 0", textAlign:"center" },
};

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
  const [meta, setMeta]               = useState({ username:"", source:"", sourceType:"in-game measurement" });
  const [submitted, setSubmitted]     = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const approved = getApprovedEntries();
  const cat = DATA_CATEGORIES.find(c => c.id === selectedCat);

  const pad = mob ? "16px 14px 60px" : "22px 24px 60px";

  function handleField(id, val) { setFormData(p => ({ ...p, [id]: val })); }
  function handleMeta(id, val)  { setMeta(p => ({ ...p, [id]: val })); }

  function handleSubmit() {
    if (!cat) return;
    const missing = cat.fields.filter(f => !formData[f.id]);
    if (missing.length) { alert("Fill all required fields: " + missing.map(f => f.label).join(", ")); return; }
    if (!meta.username.trim()) { alert("Username required."); return; }
    if (!meta.source.trim())   { alert("Source link or description required."); return; }
    const id = submit({ category:cat.id, categoryLabel:cat.label, data:{...formData}, meta:{...meta} });
    setSubmittedId(id);
    setSubmitted(true);
    setFormData({});
  }

  function resetForm() {
    setSubmitted(false); setSubmittedId(null); setFormData({}); setSelectedCat(null);
  }

  return (
    <div style={{ background:"#080808", padding:pad, boxSizing:"border-box", minHeight:"100%" }}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.title}>DATA LAB</div>
        <div style={S.sub}>COMMUNITY VERIFICATION // SUBMIT TRUTH · ADMIN APPROVES</div>
      </div>

      {/* ── Notice ── */}
      <div style={S.notice}>
        <span style={S.noticeRed}>⚠ ALL UNVERIFIED NUMBERS ARE STRIPPED FROM THIS APP.</span>
        {" "}Every tactic value, DPS figure, and mechanic claim requires a real source.<br/>
        Submit your findings below. Nothing appears in the app until the admin approves it.<br/>
        <span style={{color:"#444"}}>Required: username · source (video timestamp / screenshot / test description) · the exact value.</span>
      </div>

      {submitted ? (
        <div>
          <div style={S.successBox}>
            ✓ SUBMISSION RECEIVED — ID: {submittedId}<br/>
            In the pending queue. Admin reviews before it goes live.
          </div>
          <button style={S.submitBtn} onClick={resetForm}>SUBMIT ANOTHER</button>
        </div>
      ) : (
        <>
          {/* ── Category grid ── */}
          <div style={{ fontFamily:mono, fontSize:10, color:"#555", letterSpacing:2, marginBottom:10 }}>SELECT SUBMISSION TYPE</div>
          <div style={{
            display:"grid",
            gridTemplateColumns: mob ? "1fr 1fr" : "repeat(auto-fill,minmax(240px,1fr))",
            gap:8, marginBottom:28
          }}>
            {DATA_CATEGORIES.map(c => (
              <div key={c.id}
                style={{ background:selectedCat===c.id?"#120808":"#0A0A0A", border:`1px solid ${selectedCat===c.id?"#B91C1C":"#1A1A1A"}`, padding:mob?"10px 10px":"12px 14px", cursor:"pointer", transition:"border-color 0.15s" }}
                onClick={() => { setSelectedCat(c.id); setFormData({}); }}>
                <div style={{...S.catTitle, fontSize:mob?12:14}}>{c.label}</div>
                {!mob && <div style={S.catDesc}>{c.description}</div>}
              </div>
            ))}
          </div>

          {/* ── Form ── */}
          {cat && (
            <div style={{ background:"#0A0A0A", border:"1px solid #1E1E1E", padding:mob?"14px 14px":"18px 20px", marginBottom:28 }}>
              <div style={S.formTitle}>{cat.label.toUpperCase()}</div>

              {cat.fields.map(field => (
                <div key={field.id} style={{ marginBottom:12 }}>
                  <label style={S.label}>{field.label.toUpperCase()}</label>
                  <FieldInput field={field} value={formData[field.id]} onChange={handleField} />
                </div>
              ))}

              <div style={S.divider}/>
              <div style={{ fontFamily:mono, fontSize:10, color:"#555", letterSpacing:2, marginBottom:10 }}>YOUR DETAILS — REQUIRED</div>

              {/* Username + method — stack on mobile */}
              <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:10, marginBottom:10 }}>
                <div>
                  <label style={S.label}>YOUR USERNAME</label>
                  <input style={S.input} value={meta.username} onChange={e=>handleMeta("username",e.target.value)} placeholder="e.g. Morpheus / anonymous"/>
                </div>
                <div>
                  <label style={S.label}>HOW DID YOU MEASURE THIS?</label>
                  <select style={S.select} value={meta.sourceType} onChange={e=>handleMeta("sourceType",e.target.value)}>
                    <option value="in-game measurement">In-game (damage numbers on)</option>
                    <option value="video timestamp">Video / stream (with timestamp)</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="repeated testing">Repeated testing across runs</option>
                    <option value="wiki / patch notes">Wiki or official patch notes</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={S.label}>SOURCE LINK OR DESCRIPTION (REQUIRED)</label>
                <textarea style={{...S.textarea, minHeight:56}}
                  value={meta.source} onChange={e=>handleMeta("source",e.target.value)}
                  placeholder="YouTube link with timestamp, Imgur screenshot, or describe exactly how you tested this"/>
              </div>

              <button style={S.submitBtn} onClick={handleSubmit}>SUBMIT FOR REVIEW</button>
            </div>
          )}
        </>
      )}

      {/* ── Approved public entries ── */}
      <div style={{ marginTop:28 }}>
        <div style={S.appHeader}>✓ APPROVED COMMUNITY DATA ({approved.length})</div>
        {approved.length === 0 ? (
          <div style={S.emptyNote}>No approved entries yet. Be the first to submit verified data.</div>
        ) : (
          approved.map(e => (
            <div key={e.id} style={S.appCard}>
              <div style={{ fontFamily:barlow, fontWeight:900, fontSize:11, letterSpacing:2, color:"#C9A227", marginBottom:6 }}>{e.categoryLabel}</div>
              <div style={S.appDetail}>
                {Object.entries(e.data).map(([k,v]) => (
                  <div key={k}><span style={{color:"#555"}}>{k}: </span>{v}</div>
                ))}
              </div>
              <div style={S.appNote}>
                by <span style={{color:"#888"}}>{e.meta?.username||"unknown"}</span>
                {"  ·  "}{e.meta?.sourceType}
                {e.adminNote && <>{" · "}<span style={{color:"#4ADE80"}}>Admin: {e.adminNote}</span></>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
