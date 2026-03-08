import { useState } from "react";

const mono = "'Courier Prime','Courier New',monospace";
const barlow = "'Barlow Condensed','Arial Narrow',sans-serif";

const S = {
  overlay: {
    position:"fixed", top:0, left:0, right:0, bottom:0,
    background:"rgba(0,0,0,0.88)", zIndex:9999,
    display:"flex", alignItems:"center", justifyContent:"center",
    backdropFilter:"blur(4px)",
  },
  box: {
    background:"#080808", border:"1px solid #B91C1C",
    boxShadow:"0 0 60px rgba(185,28,28,0.2), inset 0 0 40px rgba(0,0,0,0.8)",
    padding:"32px 36px", minWidth:"380px", position:"relative",
    fontFamily: mono, color:"#F0EDE5",
  },
  topBar: {
    position:"absolute", top:0, left:0, right:0, height:"2px",
    background:"linear-gradient(90deg,#B91C1C,#C9A227,#B91C1C)",
  },
  corner: (t,r,b,l) => ({
    position:"absolute", width:8, height:8,
    top:t, right:r, bottom:b, left:l,
    borderColor:"#B91C1C",
    borderStyle:"solid",
    borderWidth: t!=null?"1px 1px 0 0": b!=null?"0 0 1px 1px": "0",
  }),
  label: { fontSize:"10px", letterSpacing:"3px", color:"#555", display:"block", marginBottom:"8px", fontFamily:barlow, fontWeight:700 },
  input: {
    width:"100%", background:"#0D0D0D", border:"1px solid #252525",
    borderBottom:"1px solid #3A3A3A",
    color:"#F0EDE5", padding:"10px 12px", fontSize:"13px",
    fontFamily: mono, outline:"none", boxSizing:"border-box",
    transition:"border-color 0.15s",
  },
  btn: (variant="primary") => ({
    background: variant==="primary" ? "#B91C1C" : variant==="dark" ? "#111" : "#1A1A1A",
    border: variant==="primary" ? "none" : "1px solid #2A2A2A",
    color: variant==="primary" ? "#fff" : "#888",
    padding:"10px 24px", cursor:"pointer", fontFamily: barlow,
    fontSize:"11px", letterSpacing:"3px", fontWeight:900,
    transition:"all 0.15s",
  }),
  slider: { width:"100%", accentColor:"#B91C1C", cursor:"pointer" },
};

function LoginForm({ onLogin }) {
  const [user, setUser] = useState("");
  const [pw,   setPw]   = useState("");
  const [err,  setErr]  = useState("");

  const attempt = () => {
    if (user.toLowerCase() === "morpheus" && pw === "8193") {
      onLogin();
    } else {
      setErr("ACCESS DENIED");
      setTimeout(() => setErr(""), 1800);
    }
  };

  return (
    <div>
      <div style={{fontSize:9,letterSpacing:4,color:"#333",marginBottom:24,fontFamily:barlow}}>
        AUTHORIZED PERSONNEL ONLY
      </div>
      <label style={S.label}>USERNAME</label>
      <input style={{...S.input, marginBottom:16}}
        value={user} onChange={e=>setUser(e.target.value)} autoFocus
        onFocus={e=>e.target.style.borderBottomColor="#B91C1C"}
        onBlur={e=>e.target.style.borderBottomColor="#3A3A3A"}
      />
      <label style={S.label}>PASSWORD</label>
      <input style={{...S.input, marginBottom:20}} type="password"
        value={pw} onChange={e=>setPw(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&attempt()}
        onFocus={e=>e.target.style.borderBottomColor="#B91C1C"}
        onBlur={e=>e.target.style.borderBottomColor="#3A3A3A"}
      />
      {err && (
        <div style={{color:"#EF4444",fontSize:10,letterSpacing:3,marginBottom:14,fontFamily:barlow,fontWeight:900}}>
          {err}
        </div>
      )}
      <button style={S.btn("primary")} onClick={attempt}>AUTHENTICATE</button>
    </div>
  );
}

function ImageSection({ imgSrc, setImgSrc }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState("");

  const handleUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Not an image file."); return; }
    if (file.size > 8 * 1024 * 1024)    { setErr("Max 8MB."); return; }
    setUploading(true); setErr("");
    const reader = new FileReader();
    reader.onload  = ev => { setImgSrc(ev.target.result); setUploading(false); };
    reader.onerror = ()  => { setErr("Read failed."); setUploading(false); };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{marginBottom:24}}>
      <label style={S.label}>BANNER IMAGE</label>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <label style={{
          ...S.btn("dark"), display:"inline-block", cursor:"pointer",
          opacity: uploading ? 0.5 : 1,
        }}>
          {uploading ? "LOADING…" : "UPLOAD FILE"}
          <input type="file" accept="image/*" style={{display:"none"}}
            onChange={handleUpload} disabled={uploading}/>
        </label>
        <button style={S.btn("dark")} onClick={()=>{
          setImgSrc("/banner.png");
          localStorage.removeItem("bannerImg");
        }}>RESET</button>
        {imgSrc !== "/banner.png" && !uploading && (
          <span style={{fontSize:9,letterSpacing:2,color:"#22C55E",fontFamily:barlow,fontWeight:900}}>CUSTOM</span>
        )}
      </div>
      {err && <div style={{color:"#EF4444",fontSize:10,marginTop:8,letterSpacing:1}}>{err}</div>}
    </div>
  );
}

function SliderRow({ label, value, min, max, unit, onChange }) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <label style={S.label}>{label}</label>
        <span style={{fontSize:11,color:"#B91C1C",fontFamily:mono,fontWeight:700}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={S.slider}
      />
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:9,color:"#333",fontFamily:mono}}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function AdminPanel({ show, onClose }) {
  const [authed,    setAuthed]  = useState(() => sessionStorage.getItem("adminAuth") === "1");
  const [posY,      setPosY]    = useState(() => parseFloat(localStorage.getItem("bannerPosY") ?? "50"));
  const [height,    setHeight]  = useState(() => parseFloat(localStorage.getItem("bannerH")    ?? "120"));
  const [imgSrc,    setImgSrc]  = useState(() => localStorage.getItem("bannerImg") || "/banner.png");

  const login = () => {
    sessionStorage.setItem("adminAuth","1");
    setAuthed(true);
  };
  const logout = () => {
    sessionStorage.removeItem("adminAuth");
    setAuthed(false);
  };
  const save = () => {
    localStorage.setItem("bannerPosY", posY);
    localStorage.setItem("bannerH",    height);
    if (imgSrc !== "/banner.png") localStorage.setItem("bannerImg", imgSrc);
    else localStorage.removeItem("bannerImg");
    onClose({ posY, height, imgSrc });
  };

  if (!show) return null;

  return (
    <div style={S.overlay} onClick={e=>{ if(e.target===e.currentTarget) onClose(null); }}>
      <div style={S.box}>
        <div style={S.topBar}/>
        {/* Corner decorations */}
        <div style={{...S.corner(4,4,null,null), borderWidth:"1px 1px 0 0"}}/>
        <div style={{...S.corner(4,null,null,4), borderWidth:"1px 0 0 1px"}}/>
        <div style={{...S.corner(null,4,4,null), borderWidth:"0 1px 1px 0"}}/>
        <div style={{...S.corner(null,null,4,4), borderWidth:"0 0 1px 1px"}}/>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div>
            <div style={{fontSize:14,letterSpacing:4,color:"#B91C1C",fontWeight:900,fontFamily:barlow}}>ADMIN PANEL</div>
            <div style={{fontSize:9,letterSpacing:3,color:"#333",marginTop:2,fontFamily:barlow}}>ENTROPY OVERRIDE v4.0</div>
          </div>
          {authed && (
            <button style={S.btn("dark")} onClick={logout}>LOGOUT</button>
          )}
        </div>

        {!authed ? (
          <LoginForm onLogin={login}/>
        ) : (
          <div>
            <ImageSection imgSrc={imgSrc} setImgSrc={setImgSrc}/>
            <div style={{borderTop:"1px solid #151515",marginBottom:22}}/>
            <SliderRow label="BANNER HEIGHT" value={height} min={60} max={300} unit="px" onChange={setHeight}/>
            <SliderRow label="VERTICAL CROP" value={posY}   min={0}  max={100} unit="%" onChange={setPosY}/>
            <div style={{borderTop:"1px solid #151515",margin:"4px 0 20px"}}/>
            <div style={{display:"flex",gap:10}}>
              <button style={S.btn("primary")} onClick={save}>SAVE CHANGES</button>
              <button style={S.btn("dark")} onClick={()=>onClose(null)}>CANCEL</button>
            </div>
            <div style={{marginTop:12,fontSize:9,color:"#2A2A2A",letterSpacing:2,fontFamily:barlow}}>
              CLICK BANNER 5× TO REOPEN
            </div>
          </div>
        )}
      </div>
    </div>
  );
}