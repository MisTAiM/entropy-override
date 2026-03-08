export default function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:36,height:36,background:"#B91C1C",clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <div style={{width:16,height:16,background:"#080808",clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)"}}/>
      </div>
      <div>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:4,color:"#F0EDE5",lineHeight:1}}>ENTROPY<span style={{color:"#B91C1C"}}> OVERRIDE</span></div>
        <div style={{fontSize:9,letterSpacing:5,color:"#3A3A3A",fontFamily:"'Courier Prime',monospace"}}>TACTICS CODEX // BBEE X</div>
      </div>
    </div>
  );
}
