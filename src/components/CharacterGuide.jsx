import { useState } from "react";
import { CHAR_GUIDES } from "../levelingData";
import { TIER_COLORS, getStyles } from "../styles/theme";

const DIFF_COLORS = { Beginner:"#22C55E", Intermediate:"#EAB308", Advanced:"#EF4444" };

export default function CharacterGuide({ char }) {
  const [guideBuild, setGuideBuild] = useState(0);
  const S = getStyles();

  const guide = CHAR_GUIDES[char.id];
  if (!guide) return (
    <div style={{...S.card, color:"#555", textAlign:"center", padding:48}}>
      <div style={{fontSize:22, letterSpacing:3}}>GUIDE COMING SOON</div>
      <div style={{fontSize:14, marginTop:10, fontFamily:"'Courier Prime',monospace"}}>Data not yet catalogued for {char.name}</div>
    </div>
  );

  const buildKeys = Object.keys(guide.builds);
  const buildKey = buildKeys[guideBuild] || buildKeys[0];
  const gb = guide.builds[buildKey];
  const bdata = char.builds[guideBuild] || char.builds[0];
  const dc = DIFF_COLORS[guide.difficulty] || "#888";

  const PHASE_COLORS = ["#22C55E","#EAB308","#F97316","#B91C1C"];

  return (
    <div>
      {/* ── CHARACTER OVERVIEW ── */}
      <div style={{...S.card, borderColor: char.color+"44", marginBottom:20}}>
        <div style={{display:"flex", alignItems:"flex-start", gap:22}}>
          <div style={{width:88,height:110,overflow:"hidden",flexShrink:0,clipPath:"polygon(0 0,100% 0,85% 100%,0 100%)"}}>
            <img src={char.img} alt={char.name}
              style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center"}}
              onError={e=>{e.target.style.display="none"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,flexWrap:"wrap"}}>
              <div style={{fontSize:26,fontWeight:900,color:char.color,letterSpacing:2}}>{char.name.toUpperCase()}</div>
              <div style={{background:`${dc}1A`,color:dc,border:`1px solid ${dc}`,padding:"3px 12px",fontSize:12,fontWeight:900,letterSpacing:1}}>
                {guide.difficulty.toUpperCase()}
              </div>
              <div style={{background:`${TIER_COLORS[char.tier]}1A`,color:TIER_COLORS[char.tier],border:`1px solid ${TIER_COLORS[char.tier]}`,padding:"3px 12px",fontSize:12,fontWeight:900,letterSpacing:1}}>
                TIER {char.tier}
              </div>
            </div>
            <div style={{fontSize:15,color:"#B0B0B0",lineHeight:1.75,marginBottom:14}}>{guide.overview}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:11,letterSpacing:2,color:"#22C55E",fontWeight:700,marginBottom:6}}>STRENGTHS</div>
                {guide.strengths.map((s,i)=>(
                  <div key={i} style={{fontSize:13,color:"#888",marginBottom:5,paddingLeft:12,borderLeft:"2px solid #22C55E33",lineHeight:1.5}}>+ {s}</div>
                ))}
              </div>
              <div>
                <div style={{fontSize:11,letterSpacing:2,color:"#EF4444",fontWeight:700,marginBottom:6}}>WEAKNESSES</div>
                {guide.weaknesses.map((w,i)=>(
                  <div key={i} style={{fontSize:13,color:"#888",marginBottom:5,paddingLeft:12,borderLeft:"2px solid #EF444433",lineHeight:1.5}}>- {w}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BUILD SELECT ── */}
      <div style={{display:"flex",marginBottom:20,flexWrap:"wrap",gap:4}}>
        {char.builds.map((b,i)=>(
          <button key={b.id} style={S.buildTabBtn(guideBuild===i, char.color)} onClick={()=>setGuideBuild(i)}>
            {b.name}
          </button>
        ))}
      </div>

      {gb && (
        <div>
          {/* ── EVOTYPE ── */}
          <div style={{...S.card, borderColor:"#C9A22744", marginBottom:16}}>
            <div style={S.label}>RECOMMENDED EVOTYPE</div>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <div style={{background:"#C9A22722",border:"1px solid #C9A227",padding:"6px 18px",fontSize:16,fontWeight:900,color:"#C9A227",letterSpacing:1,whiteSpace:"nowrap",flexShrink:0}}>
                {gb.evotype}
              </div>
              <div style={{fontSize:14,color:"#888",lineHeight:1.7}}>{gb.evotypeNote}</div>
            </div>
          </div>

          {/* ── LEGACY + POTENTIALS + DOUBLES ── */}
          <div style={S.g3}>
            <div style={S.card}>
              <div style={S.label}>LEGACY PICKS</div>
              {gb.legacy.map((l,i)=>(
                <div key={i} style={{padding:"10px 12px",background:"#111",borderLeft:"3px solid #C9A227",marginBottom:8}}>
                  <div style={{fontSize:13,color:"#C9A227",fontWeight:900,letterSpacing:1,marginBottom:4}}>SLOT {i+1} — {l.name}</div>
                  <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{l.reason}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.label}>POTENTIAL PRIORITY</div>
              {gb.potentials.map((p,i)=>(
                <div key={i} style={{padding:"10px 12px",background:"#111",borderLeft:"3px solid #7B8FE4",marginBottom:8}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <span style={{background:"#7B8FE433",color:"#7B8FE4",padding:"2px 8px",fontSize:11,fontWeight:900}}>#{i+1}</span>
                    <span style={{fontSize:13,color:"#E8E8E8",fontWeight:700}}>{p.p}</span>
                  </div>
                  <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{p.reason}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.label}>DOUBLE TACTIC TARGETS</div>
              {gb.doubles.map((d,i)=>(
                <div key={i} style={{padding:"10px 12px",background:"#111",borderLeft:"3px solid #A855F7",marginBottom:8}}>
                  <div style={{fontSize:13,color:"#E8E8E8",fontWeight:700,marginBottom:4}}>{d.name}</div>
                  <div style={{fontSize:12,color:"#A855F7",letterSpacing:1,marginBottom:4}}>REQ: {d.req}</div>
                  <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{d.effect}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LEVELING PHASES ── */}
          <div style={{...S.card, marginTop:16}}>
            <div style={S.label}>LEVELING PATH — {bdata ? bdata.name : buildKey.replace(/_/g,' ').toUpperCase()}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {gb.phases.map((ph,i)=>{
                const pc = PHASE_COLORS[i] || "#666";
                return (
                  <div key={i} style={{background:"#0A0A0A",border:`1px solid ${pc}33`,padding:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                      <div style={{background:`${pc}22`,color:pc,padding:"3px 12px",fontSize:12,fontWeight:900,letterSpacing:1}}>
                        ENTROPY {ph.range}
                      </div>
                      <div style={{fontSize:12,color:pc,fontWeight:700,letterSpacing:1}}>{ph.label}</div>
                    </div>
                    <div style={{fontSize:14,color:"#C9A227",fontWeight:700,marginBottom:10,fontFamily:"'Courier Prime',monospace",lineHeight:1.5}}>
                      ▶ {ph.focus}
                    </div>
                    {ph.steps.map((step,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                        <div style={{color:pc,fontSize:13,fontWeight:700,flexShrink:0,marginTop:1}}>{j+1}.</div>
                        <div style={{fontSize:13,color:"#999",lineHeight:1.6}}>{step}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
