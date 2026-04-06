// ============================================================
// Pi Kappa News — App.jsx
// Full Supabase-wired version
// Requires: npm install @supabase/supabase-js
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──────────────────────────────────────────
// Replace these two values with your own from Supabase → Settings → API
const SUPABASE_URL = "https://zdnvajwdyxvtyraeedqq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbnZhandkeXh2dHlyYWVlZHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODI4NzAsImV4cCI6MjA5MTA1ODg3MH0.s6ymkURCK6io2FYJ4HqIqJYsxXX3qacCgvfZFSD_cu0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: upload a File object to a Supabase storage bucket.
// Returns the public URL string, or null on failure.
async function uploadFile(bucket, file) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) { console.error("Upload error:", error); return null; }
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
}

// Helper: upload a base64 data-URL (from canvas) to a bucket.
// Returns the public URL string, or null on failure.
async function uploadBase64(bucket, dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const path = `${Date.now()}.jpg`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) { console.error("Upload error:", error); return null; }
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
}

// ── Theme constants ──────────────────────────────────────────
const MAROON  = "#6B0A1A";
const MAROON2 = "#8B1A2A";
const MAROON3 = "#A52535";
const MAROON4 = "#5A0813";
const MAROON5 = "#3D0510";
const WHITE   = "#FFFFFF";

const OFFICER_ROLES = [
  { id: "president",   label: "President",                          max: 1 },
  { id: "vp",          label: "Vice President",                     max: 1 },
  { id: "nmo",         label: "NMO Officer",                        max: 1 },
  { id: "chaplain",    label: "Chaplain",                           max: 1 },
  { id: "mens_ministry", label: "Men's Ministry Director",          max: 1 },
  { id: "treasurer",   label: "Treasurer",                          max: 1 },
  { id: "historian",   label: "Historian",                          max: 1 },
  { id: "cod_fathers", label: "Cod Fathers",                        max: 2 },
  { id: "social",      label: "Social Director",                    max: 1 },
  { id: "mission",     label: "Mission Outreach Director",          max: 1 },
  { id: "intramural",  label: "Intramural Director",                max: 1 },
  { id: "creative",    label: "Creative/Merch Director",            max: 1 },
  { id: "fundraising", label: "Fundraising/Alumni Relations Director", max: 1 },
];

// ── Date helpers ─────────────────────────────────────────────
const MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
function parseDate(d) {
  const parts = (d || "").split(/[\s,]+/);
  return new Date(parseInt(parts[2]), MONTHS[parts[0]], parseInt(parts[1]));
}
function isFuture(dateStr) {
  try { const d = parseDate(dateStr); const t = new Date(); t.setHours(0,0,0,0); return d >= t; } catch { return true; }
}
function sortByDate(arr) {
  return [...arr].sort((a,b) => { try { return parseDate(a.date)-parseDate(b.date); } catch { return 0; } });
}
function initials(name) {
  return (name||"PK").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
}

// ── CSS ──────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@300;400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Source Sans 3',sans-serif;background:${MAROON5};color:${WHITE};min-height:100vh;}
  .app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;background:${MAROON5};position:relative;}
  .header{background:${MAROON};padding:14px 16px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${MAROON2};position:sticky;top:0;z-index:100;}
  .header-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:${WHITE};letter-spacing:.5px;}
  .header-sub{font-size:10px;color:rgba(255,255,255,.6);letter-spacing:2px;text-transform:uppercase;margin-top:1px;}
  .avatar-btn{width:36px;height:36px;border-radius:50%;background:${MAROON2};border:2px solid rgba(255,255,255,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;}
  .avatar-btn img{width:100%;height:100%;object-fit:cover;}
  .avatar-initials{font-size:13px;font-weight:700;color:${WHITE};}
  .content{flex:1;overflow-y:auto;padding-bottom:80px;}
  .tabs{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;display:flex;background:${MAROON4};border-top:1px solid ${MAROON2};z-index:100;}
  .tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 2px 10px;cursor:pointer;gap:3px;border:none;background:transparent;transition:background .15s;}
  .tab.active{background:${MAROON};}
  .tab:hover:not(.active){background:${MAROON2};}
  .tab-icon{font-size:18px;line-height:1;}
  .tab-label{font-size:9px;color:rgba(255,255,255,.75);text-align:center;letter-spacing:.3px;line-height:1.1;}
  .tab.active .tab-label{color:${WHITE};font-weight:700;}
  .section-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5);padding:14px 16px 6px;font-weight:600;}
  .card{background:${MAROON};border-radius:12px;margin:0 12px 12px;padding:14px;border:1px solid ${MAROON2};}
  .dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 12px 0;}
  .dash-cube{background:${MAROON};border-radius:14px;padding:12px;border:1px solid ${MAROON2};min-height:130px;cursor:pointer;transition:transform .15s,background .15s;}
  .dash-cube:hover{background:${MAROON2};transform:scale(1.01);}
  .dash-cube.wide{grid-column:1/-1;min-height:90px;}
  .cube-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.5);font-weight:600;margin-bottom:8px;}
  .cube-content{font-size:13px;color:rgba(255,255,255,.85);line-height:1.5;}
  .cube-pike-week{font-size:20px;font-family:'Playfair Display',serif;font-weight:700;color:${WHITE};margin-top:4px;}
  .media-grid-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:8px;border-radius:8px;overflow:hidden;}
  .media-mini{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:10px;color:rgba(255,255,255,.5);}
  .carp-scroll{display:flex;gap:10px;padding:10px 12px;overflow-x:auto;scrollbar-width:none;}
  .carp-scroll::-webkit-scrollbar{display:none;}
  .carp-chip{min-width:110px;height:130px;border-radius:12px;overflow:hidden;position:relative;cursor:pointer;flex-shrink:0;border:2px solid ${MAROON2};}
  .carp-chip-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;}
  .carp-chip-overlay{position:absolute;inset:0;background:rgba(59,5,16,.65);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;}
  .carp-chip-date{font-size:12px;font-weight:700;color:${WHITE};text-align:center;font-family:'Playfair Display',serif;line-height:1.3;}
  .carp-chip-label{font-size:9px;color:rgba(255,255,255,.7);letter-spacing:1px;text-transform:uppercase;margin-top:3px;}
  .news-item{background:${MAROON};margin:0 12px 10px;border-radius:12px;border:1px solid ${MAROON2};overflow:hidden;cursor:pointer;}
  .news-img{width:100%;height:120px;object-fit:cover;display:block;}
  .news-body{padding:12px;}
  .news-type-badge{display:inline-block;background:${MAROON3};color:${WHITE};font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:20px;margin-bottom:6px;font-weight:600;}
  .news-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:${WHITE};margin-bottom:4px;line-height:1.3;}
  .news-meta{font-size:12px;color:rgba(255,255,255,.5);}
  .media-upload-btn{margin:12px;background:${MAROON2};border:2px dashed ${MAROON3};border-radius:12px;padding:18px;text-align:center;cursor:pointer;color:rgba(255,255,255,.7);font-size:14px;transition:background .15s;}
  .media-upload-btn:hover{background:${MAROON3};}
  .media-feed-item{background:${MAROON};margin:0 12px 12px;border-radius:12px;border:1px solid ${MAROON2};overflow:hidden;}
  .media-feed-img{width:100%;aspect-ratio:4/3;background:${MAROON2};display:flex;align-items:center;justify-content:center;font-size:48px;}
  .media-feed-img img{width:100%;height:100%;object-fit:cover;}
  .media-feed-meta{padding:12px;}
  .media-meta-row{font-size:13px;color:rgba(255,255,255,.7);margin-bottom:3px;}
  .media-meta-row span{color:${WHITE};font-weight:600;}
  .event-item{background:${MAROON};margin:0 12px 10px;border-radius:12px;border:1px solid ${MAROON2};padding:14px;display:flex;gap:12px;}
  .event-date-badge{min-width:48px;background:${MAROON3};border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 6px;}
  .event-date-month{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.7);font-weight:600;}
  .event-date-day{font-size:22px;font-family:'Playfair Display',serif;font-weight:700;color:${WHITE};line-height:1;}
  .event-title{font-size:15px;font-weight:700;color:${WHITE};margin-bottom:3px;}
  .event-time{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:4px;}
  .event-desc{font-size:13px;color:rgba(255,255,255,.75);line-height:1.4;}
  .mandatory-badge{display:inline-block;background:#8B1A1A;color:${WHITE};font-size:10px;padding:1px 6px;border-radius:4px;margin-left:6px;font-weight:700;}
  .prayer-item{background:${MAROON};margin:0 12px 10px;border-radius:12px;border:1px solid ${MAROON2};padding:14px;}
  .prayer-pike{font-size:14px;font-weight:700;color:${WHITE};margin-bottom:2px;}
  .prayer-text{font-size:14px;color:rgba(255,255,255,.8);line-height:1.5;margin-bottom:10px;}
  .prayer-actions{display:flex;align-items:center;gap:12px;}
  .prayer-like-btn{background:${MAROON3};border:none;border-radius:20px;padding:4px 12px;color:${WHITE};font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px;}
  .prayer-reply-toggle{font-size:12px;cursor:pointer;background:none;border:none;color:rgba(255,255,255,.6);}
  .prayer-replies{margin-top:10px;border-top:1px solid ${MAROON2};padding-top:10px;display:flex;flex-direction:column;gap:8px;}
  .prayer-reply{background:${MAROON2};border-radius:8px;padding:8px 10px;font-size:13px;color:rgba(255,255,255,.8);}
  .prayer-reply strong{color:${WHITE};}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;flex-direction:column;}
  .overlay-card{background:${MAROON4};flex:1;margin-top:60px;border-radius:20px 20px 0 0;overflow-y:auto;}
  .overlay-header{background:${MAROON};padding:16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${MAROON2};border-radius:20px 20px 0 0;}
  .overlay-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:${WHITE};}
  .overlay-close{background:${MAROON2};border:none;border-radius:50%;width:30px;height:30px;color:${WHITE};font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
  .carp-section{margin:0 12px 14px;background:${MAROON};border-radius:12px;padding:14px;border:1px solid ${MAROON2};}
  .carp-section-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:${WHITE};}
  .carp-section-sub{font-size:11px;color:rgba(255,255,255,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;margin-top:1px;}
  .carp-section-body{font-size:14px;color:rgba(255,255,255,.82);line-height:1.65;white-space:pre-line;}
  .carp-authors{font-size:13px;color:rgba(255,255,255,.6);font-style:italic;padding:0 12px 20px;}
  .btn{background:${MAROON2};border:1px solid ${MAROON3};border-radius:8px;color:${WHITE};font-size:14px;font-family:'Source Sans 3',sans-serif;padding:10px 16px;cursor:pointer;width:100%;margin-bottom:10px;font-weight:600;transition:background .15s;}
  .btn:hover{background:${MAROON3};}
  .btn.primary{background:${MAROON3};border-color:${MAROON};}
  .btn:disabled{opacity:.5;cursor:not-allowed;}
  .input{background:${MAROON2};border:1px solid ${MAROON3};border-radius:8px;color:${WHITE};font-size:14px;font-family:'Source Sans 3',sans-serif;padding:10px 12px;width:100%;margin-bottom:10px;outline:none;}
  .input::placeholder{color:rgba(255,255,255,.35);}
  .input:focus{border-color:rgba(255,255,255,.4);}
  .label{font-size:12px;color:rgba(255,255,255,.6);margin-bottom:4px;font-weight:600;letter-spacing:.5px;}
  .field{margin-bottom:12px;}
  .onboard{position:fixed;inset:0;background:${MAROON5};z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;}
  .onboard-logo{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;color:${WHITE};text-align:center;margin-bottom:4px;}
  .onboard-sub{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:40px;}
  .onboard-question{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:${WHITE};text-align:center;margin-bottom:24px;}
  .onboard-card{background:${MAROON};border-radius:16px;padding:24px;width:100%;border:1px solid ${MAROON2};}
  .role-list{display:flex;flex-direction:column;gap:8px;max-height:50vh;overflow-y:auto;}
  .role-opt{background:${MAROON2};border:1px solid ${MAROON3};border-radius:8px;padding:12px 14px;cursor:pointer;font-size:14px;color:${WHITE};display:flex;justify-content:space-between;align-items:center;transition:background .15s;}
  .role-opt:hover{background:${MAROON3};}
  .role-opt.selected{background:${MAROON3};border-color:rgba(255,255,255,.4);}
  .role-full{opacity:.4;cursor:not-allowed;}
  .account-page{padding:20px 12px;}
  .account-avatar-area{display:flex;flex-direction:column;align-items:center;margin-bottom:24px;}
  .account-avatar{width:90px;height:90px;border-radius:50%;background:${MAROON2};border:3px solid ${MAROON3};display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:${WHITE};cursor:pointer;overflow:hidden;margin-bottom:10px;font-family:'Playfair Display',serif;}
  .account-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:${WHITE};}
  .account-role{font-size:13px;color:rgba(255,255,255,.55);margin-top:2px;}
  .settings-section{background:${MAROON};border-radius:12px;border:1px solid ${MAROON2};overflow:hidden;margin-bottom:14px;}
  .settings-row{padding:13px 16px;border-bottom:1px solid ${MAROON2};display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
  .settings-row:last-child{border-bottom:none;}
  .settings-row-label{font-size:14px;color:${WHITE};}
  .settings-row-arrow{color:rgba(255,255,255,.35);font-size:14px;}
  .settings-header{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.4);font-weight:600;padding:10px 16px 4px;}
  .modal-wrap{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:300;display:flex;align-items:flex-end;}
  .modal{background:${MAROON4};border-radius:20px 20px 0 0;padding:20px 16px 32px;width:100%;max-height:85vh;overflow-y:auto;}
  .modal-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:${WHITE};margin-bottom:16px;}
  .modal-close{position:absolute;top:16px;right:16px;background:${MAROON2};border:none;border-radius:50%;width:28px;height:28px;color:${WHITE};font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
  select.input option{background:${MAROON4};color:${WHITE};}
  textarea.input{resize:vertical;min-height:80px;}
  .verse-text{font-size:13px;font-style:italic;color:rgba(255,255,255,.8);line-height:1.55;}
  .post-placeholder{text-align:center;padding:40px 20px;color:rgba(255,255,255,.4);font-size:14px;}
  .spinner{display:flex;justify-content:center;padding:30px;color:rgba(255,255,255,.4);font-size:13px;}
  .error-banner{background:#501313;color:#F09595;font-size:13px;padding:10px 16px;margin:8px 12px;border-radius:8px;}
`;

const TABS = [
  { id:"dashboard", label:"Dashboard", icon:"🏠" },
  { id:"news",      label:"News",      icon:"📰" },
  { id:"media",     label:"Media",     icon:"📸" },
  { id:"events",    label:"Events",    icon:"📅" },
  { id:"prayer",    label:"Prayer",    icon:"🙏" },
  { id:"account",   label:"Account",   icon:"👤" },
];

// ── Avatar Drag-to-Crop ──────────────────────────────────────
function AvatarCropper({ src, onSave, onCancel }) {
  const canvasRef = useRef();
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPt, setStartPt] = useState(null);
  const [startOff, setStartOff] = useState(null);
  const imgRef = useRef(new Image());
  const SIZE = 260;

  useEffect(() => { imgRef.current.onload = () => draw(); imgRef.current.src = src; }, [src]);
  useEffect(() => { draw(); }, [offset, scale]);

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    ctx.clearRect(0,0,SIZE,SIZE);
    ctx.save(); ctx.beginPath(); ctx.arc(SIZE/2,SIZE/2,SIZE/2,0,Math.PI*2); ctx.clip();
    const w = img.naturalWidth*scale, h = img.naturalHeight*scale;
    ctx.drawImage(img, SIZE/2-w/2+offset.x, SIZE/2-h/2+offset.y, w, h);
    ctx.restore();
    ctx.beginPath(); ctx.arc(SIZE/2,SIZE/2,SIZE/2,0,Math.PI*2);
    ctx.strokeStyle="rgba(255,255,255,.5)"; ctx.lineWidth=2; ctx.stroke();
  }

  function getPos(e) {
    const touch = e.touches ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: touch.clientX-rect.left, y: touch.clientY-rect.top };
  }
  function onDown(e) { e.preventDefault(); setDragging(true); setStartPt(getPos(e)); setStartOff({...offset}); }
  function onMove(e) { if (!dragging) return; e.preventDefault(); const p=getPos(e); setOffset({x:startOff.x+p.x-startPt.x,y:startOff.y+p.y-startPt.y}); }
  function onUp() { setDragging(false); }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24}}>
      <div style={{color:WHITE,fontSize:16,fontWeight:700,marginBottom:4}}>Drag to adjust photo</div>
      <canvas ref={canvasRef} width={SIZE} height={SIZE}
        style={{borderRadius:"50%",cursor:"grab",touchAction:"none",border:"3px solid rgba(255,255,255,.3)"}}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
      <div style={{display:"flex",alignItems:"center",gap:10,width:"100%",maxWidth:SIZE}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Zoom</span>
        <input type="range" min="0.3" max="3" step="0.01" value={scale}
          onChange={e => { setScale(parseFloat(e.target.value)); draw(); }} style={{flex:1}} />
      </div>
      <div style={{display:"flex",gap:10,width:"100%",maxWidth:SIZE}}>
        <button className="btn" style={{flex:1,marginBottom:0}} onClick={onCancel}>Cancel</button>
        <button className="btn primary" style={{flex:1,marginBottom:0}} onClick={() => onSave(canvasRef.current.toDataURL("image/jpeg",.9))}>Save Photo</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Main App
// ════════════════════════════════════════════════════════════
export default function App() {
  // Onboarding state
  const [onboarded,    setOnboarded]    = useState(false);
  const [onboardStep,  setOnboardStep]  = useState("name");
  const [pikeName,     setPikeName]     = useState("");
  const [isOfficer,    setIsOfficer]    = useState(false);
  const [officerRole,  setOfficerRole]  = useState(null);
  const [takenRoles,   setTakenRoles]   = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);  // local preview / public URL
  const [cropSrc,      setCropSrc]      = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const profileFileRef = useRef();

  // App data
  const [tab,       setTab]       = useState("dashboard");
  const [carpList,  setCarpList]  = useState([]);
  const [newsList,  setNewsList]  = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [prayerList,setPrayerList]= useState([]);

  // UI state
  const [viewCarp,           setViewCarp]           = useState(null);
  const [viewNews,           setViewNews]            = useState(null);
  const [showPostModal,      setShowPostModal]       = useState(false);
  const [showPrayerModal,    setShowPrayerModal]     = useState(false);
  const [showEventModal,     setShowEventModal]      = useState(false);
  const [showRoleChangeModal,setShowRoleChangeModal] = useState(false);
  const [roleChangeNotified, setRoleChangeNotified]  = useState(false);

  // ── LOAD DATA on mount ──────────────────────────────────
  useEffect(() => {
    if (!onboarded) return; // wait until user has set their name
    loadCarpChronicles();
    loadNewsPosts();
    loadMedia();
    loadEvents();
    loadPrayers();
    loadTakenRoles();
  }, [onboarded]);

  // ── SUPABASE FETCH: Carp Chronicles ─────────────────────
  async function loadCarpChronicles() {
    const { data, error } = await supabase
      .from("carp_chronicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    // Map DB columns → app shape
    setCarpList((data || []).map(mapCarp));
  }

  function mapCarp(row) {
    return {
      id:          row.id,
      type:        "carp",
      date:        row.date,
      weekLabel:   row.week_label,
      coverImage:  row.cover_image,
      authors:     row.authors || [],
      sections: {
        dailyCatch:          { title:"The Daily Catch",          subtitle:"Upcoming Events & Dates",       content: row.daily_catch          || "" },
        hookOfWisdom:        { title:"Hook of Wisdom",           subtitle:"Weekly Bible Verse",            content: row.hook_of_wisdom        || "", verse: row.hook_of_wisdom || "" },
        makingWaves:         { title:"Making Waves",             subtitle:"Highlights & Wins of the Week", content: row.making_waves          || "", pikeOfWeek: row.pike_of_week || "" },
        schoolOfBrotherhood: { title:"School of Brotherhood",    subtitle:"Updates & Announcements",       content: row.school_of_brotherhood || "" },
        finalCastOff:        { title:"Final Cast-Off",                                                     content: row.final_cast_off        || "" },
      },
    };
  }

  // ── SUPABASE INSERT: Carp Chronicle ──────────────────────
  async function insertCarp(form, imageUrl) {
    const { error } = await supabase.from("carp_chronicles").insert({
      date:                form.date        || new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
      week_label:          form.weekLabel   || "New",
      cover_image:         imageUrl         || null,
      authors:             [form.officerName || pikeName],
      daily_catch:         form.dailyCatch          || null,
      hook_of_wisdom:      form.hookOfWisdom        || null,
      pike_of_week:        form.pikeOfWeek          || null,
      making_waves:        form.makingWaves         || null,
      school_of_brotherhood: form.schoolOfBrotherhood || null,
      final_cast_off:      form.finalCastOff        || null,
    });
    if (error) { console.error(error); alert("Error saving Carp Chronicle: " + error.message); return; }
    await loadCarpChronicles();
  }

  // ── SUPABASE FETCH: News Posts ───────────────────────────
  async function loadNewsPosts() {
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    setNewsList((data || []).map(row => ({
      id:          row.id,
      type:        row.type,
      title:       row.title,
      officerName: row.officer_name,
      description: row.description,
      image:       row.image_url || null,
      date:        new Date(row.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
    })));
  }

  // ── SUPABASE INSERT: News Post ───────────────────────────
  async function insertNewsPost(form, imageUrl) {
    const { error } = await supabase.from("news_posts").insert({
      type:         form.newsType === "announcement" ? "announcement" : "general",
      title:        form.title,
      officer_name: form.officerName || pikeName,
      description:  form.description,
      image_url:    imageUrl || null,
    });
    if (error) { console.error(error); alert("Error saving post: " + error.message); return; }
    await loadNewsPosts();
  }

  // ── SUPABASE FETCH: Media ────────────────────────────────
  async function loadMedia() {
    const { data, error } = await supabase
      .from("media_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    setMediaList((data || []).map(row => ({
      id:          row.id,
      uploadedBy:  row.uploaded_by,
      eventName:   row.event_name,
      description: row.description,
      image:       row.image_url || null,
    })));
  }

  // ── SUPABASE INSERT: Media Upload ────────────────────────
  // imageFile = raw File object from <input type="file">
  async function insertMedia(form, imageFile) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadFile("media", imageFile);
      if (!imageUrl) { alert("Image upload failed. Please try again."); return; }
    }
    const { error } = await supabase.from("media_posts").insert({
      uploaded_by:  form.uploadedBy,
      event_name:   form.eventName,
      description:  form.description,
      image_url:    imageUrl,
    });
    if (error) { console.error(error); alert("Error saving media: " + error.message); return; }
    await loadMedia();
  }

  // ── SUPABASE FETCH: Events ───────────────────────────────
  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) { console.error(error); return; }
    const mapped = (data || []).map(row => ({
      id:          row.id,
      title:       row.title,
      date:        row.date,
      time:        row.time,
      location:    row.location,
      description: row.description,
      mandatory:   row.mandatory,
    }));
    setEventList(sortByDate(mapped.filter(e => isFuture(e.date))));
  }

  // ── SUPABASE INSERT: Event ───────────────────────────────
  async function insertEvent(form) {
    const { error } = await supabase.from("events").insert({
      title:       form.title,
      date:        form.date,
      time:        form.time,
      location:    form.location,
      description: form.description,
      mandatory:   form.mandatory,
    });
    if (error) { console.error(error); alert("Error saving event: " + error.message); return; }
    await loadEvents();
  }

  // ── SUPABASE FETCH: Prayer Requests ─────────────────────
  async function loadPrayers() {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    setPrayerList((data || []).map(row => ({
      id:          row.id,
      pikeName:    row.pike_name,
      request:     row.request,
      avatar:      row.avatar_url || null,
      likes:       row.likes || 0,
      replies:     [],          // replies table is optional — add later if desired
      showReplies: false,
      date:        new Date(row.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
    })));
  }

  // ── SUPABASE INSERT: Prayer Request ─────────────────────
  async function insertPrayer(req) {
    const { error } = await supabase.from("prayer_requests").insert({
      pike_name:  pikeName,
      request:    req,
      avatar_url: profilePhoto || null,
      likes:      0,
    });
    if (error) { console.error(error); alert("Error saving prayer request: " + error.message); return; }
    await loadPrayers();
    setShowPrayerModal(false);
  }

  // ── SUPABASE UPDATE: Prayer Like ─────────────────────────
  async function likePrayer(id) {
    const item = prayerList.find(p => p.id === id);
    if (!item) return;
    const { error } = await supabase
      .from("prayer_requests")
      .update({ likes: item.likes + 1 })
      .eq("id", id);
    if (error) { console.error(error); return; }
    setPrayerList(p => p.map(x => x.id === id ? {...x, likes: x.likes+1} : x));
  }

  // ── SUPABASE FETCH: Taken Officer Roles ─────────────────
  async function loadTakenRoles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("officer_role")
      .not("officer_role", "is", null);
    if (error) { console.error(error); return; }
    const counts = {};
    (data || []).forEach(row => { counts[row.officer_role] = (counts[row.officer_role] || 0) + 1; });
    setTakenRoles(counts);
  }

  // ── SUPABASE UPSERT: Profile (save onboarding info) ─────
  // We use localStorage to remember the user's "session" ID
  // so they don't have to re-enter their name every visit.
  async function saveProfile(pName, isOff, role) {
    let profileId = localStorage.getItem("pk_profile_id");
    const payload = {
      pike_name:    pName,
      is_officer:   isOff,
      officer_role: role?.id || null,
      avatar_url:   null,
    };
    if (profileId) {
      // Update existing profile
      await supabase.from("profiles").update(payload).eq("id", profileId);
    } else {
      // Insert new profile and save id locally
      const { data } = await supabase.from("profiles").insert(payload).select("id").single();
      if (data?.id) localStorage.setItem("pk_profile_id", data.id);
    }
  }

  // ── SUPABASE UPDATE: Avatar URL after upload ─────────────
  async function saveAvatarUrl(url) {
    const profileId = localStorage.getItem("pk_profile_id");
    if (!profileId) return;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", profileId);
  }

  // ── Profile photo: crop → upload → save ─────────────────
  async function handleCropSave(dataUrl) {
    setCropSrc(null);
    setProfilePhoto(dataUrl); // show locally immediately
    setUploading(true);
    const url = await uploadBase64("avatars", dataUrl);
    setUploading(false);
    if (url) {
      setProfilePhoto(url);
      await saveAvatarUrl(url);
    }
  }

  function handleProfileFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ── Onboarding complete ──────────────────────────────────
  async function finishOnboarding(pName, isOff, role) {
    setOnboarded(true);
    await saveProfile(pName, isOff, role);
  }

  // ── Officer role change ──────────────────────────────────
  async function requestRoleChange(role) {
    if (!roleChangeNotified) {
      alert("The Historian has been notified of your role change request. Tap the role again once approved.");
      setRoleChangeNotified(true);
    } else {
      setOfficerRole(role);
      setShowRoleChangeModal(false);
      setRoleChangeNotified(false);
      const profileId = localStorage.getItem("pk_profile_id");
      if (profileId) await supabase.from("profiles").update({ officer_role: role.id }).eq("id", profileId);
    }
  }

  // ── submitPost: handles carp vs news ────────────────────
  async function submitPost(form, imageFile) {
    setUploading(true);
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadFile("media", imageFile);
    }
    if (form.newsType === "carp") {
      await insertCarp(form, imageUrl);
    } else {
      await insertNewsPost(form, imageUrl);
    }
    setUploading(false);
    setShowPostModal(false);
  }

  // ── addEvent ─────────────────────────────────────────────
  async function addEvent(form) {
    setUploading(true);
    await insertEvent(form);
    setUploading(false);
    setShowEventModal(false);
  }

  // ── Load profile from localStorage on first render ───────
  useEffect(() => {
    const pid = localStorage.getItem("pk_profile_id");
    if (!pid) return;
    supabase.from("profiles").select("*").eq("id", pid).single().then(({ data }) => {
      if (!data) return;
      setPikeName(data.pike_name || "");
      setIsOfficer(data.is_officer || false);
      if (data.officer_role) {
        const role = OFFICER_ROLES.find(r => r.id === data.officer_role);
        if (role) setOfficerRole(role);
      }
      if (data.avatar_url) setProfilePhoto(data.avatar_url);
      setOnboarded(true);
    });
  }, []);

  const canPost = isOfficer && !!officerRole;
  const latestCarp = carpList[0];
  const verseOfWeek = latestCarp?.sections?.hookOfWisdom?.verse || "";
  const pikeOfWeek  = latestCarp?.sections?.makingWaves?.pikeOfWeek || "";

  // ── Onboarding UI ────────────────────────────────────────
  if (!onboarded) {
    return (
      <>
        <style>{css}</style>
        <div className="onboard">
          <div className="onboard-logo">Pi Kappa News</div>
          <div className="onboard-sub">Pi Kappa Fraternity</div>

          {onboardStep === "name" && (
            <>
              <div className="onboard-question">Which Pike are you?</div>
              <div className="onboard-card">
                <div className="field">
                  <div className="label">Your Pike Name</div>
                  <input className="input" placeholder="e.g. Pike Thomas" value={pikeName}
                    onChange={e => setPikeName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && pikeName.trim() && setOnboardStep("officer_q")} />
                </div>
                <button className="btn primary" onClick={() => pikeName.trim() && setOnboardStep("officer_q")}>Continue</button>
              </div>
            </>
          )}

          {onboardStep === "officer_q" && (
            <>
              <div className="onboard-question">Welcome, {pikeName}!</div>
              <div className="onboard-card">
                <div style={{fontSize:14,color:"rgba(255,255,255,.7)",marginBottom:16,textAlign:"center"}}>Are you an officer in Pi Kappa?</div>
                <button className="btn primary" onClick={() => { setIsOfficer(true); setOnboardStep("officer_role"); }}>Yes, I am an officer</button>
                <button className="btn" onClick={() => { setIsOfficer(false); finishOnboarding(pikeName, false, null); }}>No, continue as member</button>
              </div>
            </>
          )}

          {onboardStep === "officer_role" && (
            <>
              <div className="onboard-question">Select your role</div>
              <div className="onboard-card">
                <div className="role-list">
                  {OFFICER_ROLES.map(role => {
                    const count = takenRoles[role.id] || 0;
                    const full  = count >= role.max;
                    return (
                      <div key={role.id} className={"role-opt" + (full ? " role-full" : "")}
                        onClick={() => { if (full) return; setOfficerRole(role); finishOnboarding(pikeName, true, role); }}>
                        <span>{role.label}</span>
                        {full && <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Filled</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // ── Main App UI ──────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div>
            <div className="header-title">Pi Kappa News</div>
            <div className="header-sub">Pi Kappa Fraternity</div>
          </div>
          <div className="avatar-btn" onClick={() => profileFileRef.current?.click()}>
            {profilePhoto
              ? <img src={profilePhoto} alt="profile" />
              : <span className="avatar-initials">{initials(pikeName)}</span>}
          </div>
        </div>

        {/* Tab content */}
        <div className="content">
          {tab === "dashboard" && (
            <DashboardTab carpList={carpList} newsList={newsList} mediaList={mediaList}
              prayerList={prayerList} verseOfWeek={verseOfWeek} pikeOfWeek={pikeOfWeek}
              onCarpClick={setViewCarp} onTabSwitch={setTab} />
          )}
          {tab === "news" && (
            <NewsTab carpList={carpList} newsList={newsList} canPost={canPost}
              onCarpClick={setViewCarp} onNewsClick={setViewNews} onPost={() => setShowPostModal(true)} />
          )}
          {tab === "media" && (
            <MediaTab mediaList={mediaList} pikeName={pikeName} onUpload={insertMedia} />
          )}
          {tab === "events" && (
            <EventsTab eventList={eventList} canPost={canPost} onAddEvent={() => setShowEventModal(true)} />
          )}
          {tab === "prayer" && (
            <PrayerTab prayerList={prayerList} onLike={likePrayer}
              onToggleReplies={id => setPrayerList(p => p.map(x => x.id===id ? {...x, showReplies:!x.showReplies} : x))}
              onAdd={() => setShowPrayerModal(true)} />
          )}
          {tab === "account" && (
            <AccountTab pikeName={pikeName} officerRole={officerRole} isOfficer={isOfficer}
              profilePhoto={profilePhoto} uploading={uploading}
              onPhotoClick={() => profileFileRef.current?.click()}
              onRoleChangeRequest={() => setShowRoleChangeModal(true)}
              onSignOut={() => {
                localStorage.removeItem("pk_profile_id");
                setOnboarded(false); setOnboardStep("name"); setPikeName("");
                setIsOfficer(false); setOfficerRole(null); setProfilePhoto(null); setTab("dashboard");
              }} />
          )}
        </div>

        {/* Hidden file input for profile photo */}
        <input type="file" accept="image/*" ref={profileFileRef} style={{display:"none"}} onChange={handleProfileFileChange} />

        {/* Tab bar */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={"tab"+(tab===t.id?" active":"")} onClick={() => setTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Overlays & modals */}
        {viewCarp  && <CarpOverlay  carp={viewCarp}  onClose={() => setViewCarp(null)}  />}
        {viewNews  && <NewsOverlay  item={viewNews}  onClose={() => setViewNews(null)}  />}
        {showPostModal   && <PostModal   onClose={() => setShowPostModal(false)}   onSubmit={submitPost}  pikeName={pikeName} officerRole={officerRole} uploading={uploading} />}
        {showPrayerModal && <PrayerModal onClose={() => setShowPrayerModal(false)} onSubmit={insertPrayer} pikeName={pikeName} />}
        {showEventModal  && <EventModal  onClose={() => setShowEventModal(false)}  onSubmit={addEvent}   officerRole={officerRole} pikeName={pikeName} uploading={uploading} />}
        {showRoleChangeModal && <RoleChangeModal takenRoles={takenRoles} currentRole={officerRole} onClose={() => setShowRoleChangeModal(false)} onSelect={requestRoleChange} notified={roleChangeNotified} />}
        {cropSrc && <AvatarCropper src={cropSrc} onSave={handleCropSave} onCancel={() => setCropSrc(null)} />}
        {uploading && <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:MAROON3,color:WHITE,fontSize:13,padding:"6px 16px",borderRadius:20,zIndex:400}}>Uploading…</div>}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// Tab Components
// ════════════════════════════════════════════════════════════

function DashboardTab({ carpList, newsList, mediaList, prayerList, verseOfWeek, pikeOfWeek, onCarpClick, onTabSwitch }) {
  const latestCarp    = carpList[0];
  const announcements = newsList.filter(n => n.type === "announcement").slice(0, 2);
  return (
    <div>
      <div className="section-title">Dashboard</div>
      <div className="dash-grid">

        {/* Carp Chronicles cube */}
        <div className="dash-cube" onClick={() => latestCarp && onCarpClick(latestCarp)}>
          <div className="cube-label">Carp Chronicles</div>
          {latestCarp
            ? <>
                <div className="cube-content" style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700}}>{latestCarp.date}</div>
                <div className="cube-content" style={{marginTop:6,fontSize:12,color:"rgba(255,255,255,.55)"}}>Tap to read latest</div>
              </>
            : <div className="cube-content" style={{color:"rgba(255,255,255,.3)",fontSize:12}}>No chronicle yet</div>}
        </div>

        {/* Media cube */}
        <div className="dash-cube" onClick={() => onTabSwitch("media")}>
          <div className="cube-label">Media</div>
          {mediaList.length === 0
            ? <div className="cube-content" style={{color:"rgba(255,255,255,.3)",fontSize:12,marginTop:8}}>No media yet</div>
            : <div className="media-grid-mini">
                {mediaList.slice(0,9).map(m => (
                  <div key={m.id} className="media-mini" style={{background:MAROON2}}>
                    {m.image ? <img src={m.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : null}
                  </div>
                ))}
              </div>}
        </div>

        {/* Verse of the Week */}
        <div className="dash-cube" style={{minHeight:100}}>
          <div className="cube-label">Verse of the Week</div>
          {verseOfWeek
            ? <div className="verse-text">{verseOfWeek.slice(0,120)}{verseOfWeek.length>120?"…":""}</div>
            : <div className="cube-content" style={{color:"rgba(255,255,255,.3)",fontSize:12}}>From Carp Chronicles</div>}
        </div>

        {/* Pike of the Week */}
        <div className="dash-cube" style={{minHeight:100}}>
          <div className="cube-label">Pike of the Week</div>
          {pikeOfWeek
            ? <div className="cube-pike-week">{pikeOfWeek}</div>
            : <div className="cube-content" style={{color:"rgba(255,255,255,.3)",fontSize:12}}>From Carp Chronicles</div>}
        </div>

        {/* Announcements */}
        <div className="dash-cube wide" onClick={() => onTabSwitch("news")}>
          <div className="cube-label">Announcements</div>
          {announcements.length > 0
            ? announcements.map(a => (
                <div key={a.id} style={{marginBottom:6}}>
                  <div style={{fontSize:13,fontWeight:700,color:WHITE}}>{a.title}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>{a.date}</div>
                </div>
              ))
            : <div className="cube-content" style={{color:"rgba(255,255,255,.3)",fontSize:12}}>No announcements yet</div>}
        </div>

        {/* Prayer Requests */}
        <div className="dash-cube wide" onClick={() => onTabSwitch("prayer")}>
          <div className="cube-label">Prayer Requests</div>
          {prayerList.length === 0
            ? <div className="cube-content" style={{color:"rgba(255,255,255,.3)",fontSize:12}}>No requests yet</div>
            : prayerList.slice(0,2).map(p => (
                <div key={p.id} style={{marginBottom:5}}>
                  <span style={{fontSize:13,color:WHITE,fontWeight:600}}>{p.pikeName}</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,.55)"}}> has posted a prayer request</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

function NewsTab({ carpList, newsList, canPost, onCarpClick, onNewsClick, onPost }) {
  const generalNews   = newsList.filter(n => n.type === "general");
  const announcements = newsList.filter(n => n.type === "announcement");
  return (
    <div>
      {canPost && (
        <div style={{padding:"10px 12px 0"}}>
          <button className="btn primary" onClick={onPost}>+ Post News / Announcement</button>
        </div>
      )}
      <div className="section-title">Carp Chronicles</div>
      <div className="carp-scroll">
        {carpList.length === 0 && <div style={{color:"rgba(255,255,255,.35)",fontSize:13,padding:"8px 4px"}}>No chronicles yet</div>}
        {carpList.map(c => (
          <div key={c.id} className="carp-chip" onClick={() => onCarpClick(c)}>
            <div className="carp-chip-bg" style={{background: c.coverImage ? "transparent" : MAROON2}}>
              {c.coverImage ? <img src={c.coverImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontSize:30}}>🎣</span>}
            </div>
            <div className="carp-chip-overlay">
              <div className="carp-chip-date">{c.weekLabel || c.date?.split(",")[0]}</div>
              <div className="carp-chip-label">Carp Chronicles</div>
            </div>
          </div>
        ))}
      </div>

      {announcements.length > 0 && (
        <>
          <div className="section-title">Announcements</div>
          {announcements.map(n => <NewsCard key={n.id} item={n} onClick={() => onNewsClick(n)} />)}
        </>
      )}

      <div className="section-title">General News</div>
      {generalNews.length > 0
        ? generalNews.map(n => <NewsCard key={n.id} item={n} onClick={() => onNewsClick(n)} />)
        : <div className="post-placeholder">No general news yet</div>}
    </div>
  );
}

function NewsCard({ item, onClick }) {
  return (
    <div className="news-item" onClick={onClick}>
      {item.image && <img className="news-img" src={item.image} alt="" />}
      <div className="news-body">
        <span className="news-type-badge">{item.type === "announcement" ? "Announcement" : "General News"}</span>
        <div className="news-title">{item.title}</div>
        <div className="news-meta">{item.officerName} · {item.date}</div>
      </div>
    </div>
  );
}

// MediaTab — uses raw File object for upload so Supabase gets the actual file
function MediaTab({ mediaList, pikeName, onUpload }) {
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ uploadedBy: pikeName, eventName: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [busy,      setBusy]      = useState(false);
  const fileRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!form.eventName) return;
    setBusy(true);
    await onUpload(form, imageFile);
    setBusy(false);
    setForm({ uploadedBy: pikeName, eventName: "", description: "" });
    setImageFile(null); setPreview(null);
    setShowForm(false);
  }

  return (
    <div>
      <div className="media-upload-btn" onClick={() => setShowForm(s => !s)}>
        {showForm ? "✕ Cancel" : "＋ Upload Media"}
      </div>
      {showForm && (
        <div className="card">
          <div className="modal-title" style={{fontSize:15}}>Upload Media</div>
          <div className="field"><div className="label">Uploaded By</div>
            <input className="input" value={form.uploadedBy} onChange={e => setForm(f=>({...f,uploadedBy:e.target.value}))} /></div>
          <div className="field"><div className="label">Event Name</div>
            <input className="input" placeholder="e.g. Sing Song 2026" value={form.eventName} onChange={e => setForm(f=>({...f,eventName:e.target.value}))} /></div>
          <div className="field"><div className="label">Description of Event</div>
            <textarea className="input" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="What's happening in this photo?" /></div>
          <div className="field">
            <div className="label">Photo / Video</div>
            <input type="file" accept="image/*,video/*" ref={fileRef} style={{display:"none"}} onChange={handleFile} />
            <button className="btn" onClick={() => fileRef.current?.click()}>{imageFile ? "✓ File selected" : "Choose File"}</button>
            {preview && <img src={preview} alt="preview" style={{width:"100%",borderRadius:8,marginTop:8,objectFit:"cover",maxHeight:180}} />}
          </div>
          <button className="btn primary" disabled={busy} onClick={handleSubmit}>{busy ? "Uploading…" : "Upload"}</button>
        </div>
      )}

      {mediaList.length === 0 && !showForm && <div className="post-placeholder">No media uploaded yet. Be the first!</div>}
      {mediaList.map(m => (
        <div key={m.id} className="media-feed-item">
          <div className="media-feed-img">
            {m.image ? <img src={m.image} alt="" /> : null}
          </div>
          <div className="media-feed-meta">
            <div className="media-meta-row">Uploaded by: <span>{m.uploadedBy}</span></div>
            <div className="media-meta-row">Event name: <span>{m.eventName}</span></div>
            <div className="media-meta-row">Description: <span>{m.description}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventsTab({ eventList, canPost, onAddEvent }) {
  return (
    <div>
      {canPost && (
        <div style={{padding:"10px 12px 0"}}>
          <button className="btn primary" onClick={onAddEvent}>+ Add Event to Calendar</button>
        </div>
      )}
      <div className="section-title">Upcoming Events — Pi Kappa Calendar</div>
      {eventList.length === 0 && <div className="post-placeholder">No upcoming events</div>}
      {eventList.map(ev => {
        const parts = (ev.date||"").split(/[\s,]+/);
        return (
          <div key={ev.id} className="event-item">
            <div className="event-date-badge">
              <div className="event-date-month">{parts[0]}</div>
              <div className="event-date-day">{parts[1]}</div>
            </div>
            <div style={{flex:1}}>
              <div className="event-title">{ev.title}{ev.mandatory && <span className="mandatory-badge">Mandatory</span>}</div>
              <div className="event-time">{ev.time} · {ev.location}</div>
              <div className="event-desc">{ev.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PrayerTab({ prayerList, onLike, onToggleReplies, onAdd }) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 12px 0"}}>
        <div className="section-title" style={{padding:0}}>Prayer Requests</div>
        <button style={{background:MAROON3,border:"none",borderRadius:"50%",width:32,height:32,color:WHITE,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onAdd}>+</button>
      </div>
      <div style={{height:10}} />
      {prayerList.length === 0 && <div className="post-placeholder">No prayer requests yet. Tap + to share one with your brothers.</div>}
      {prayerList.map(p => (
        <div key={p.id} className="prayer-item">
          <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:MAROON3,border:"2px solid "+MAROON2,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:WHITE,fontFamily:"'Playfair Display',serif"}}>
              {p.avatar ? <img src={p.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : initials(p.pikeName)}
            </div>
            <div style={{flex:1}}>
              <div className="prayer-pike">{p.pikeName} <span style={{fontWeight:400,fontSize:12,color:"rgba(255,255,255,.45)"}}>· {p.date}</span></div>
              <div className="prayer-text">{p.request}</div>
            </div>
          </div>
          <div className="prayer-actions">
            <button className="prayer-like-btn" onClick={() => onLike(p.id)}>🙏 {p.likes}</button>
            {p.replies.length > 0 && (
              <button className="prayer-reply-toggle" onClick={() => onToggleReplies(p.id)}>
                {p.showReplies ? "Hide replies" : `${p.replies.length} repl${p.replies.length===1?"y":"ies"}`}
              </button>
            )}
          </div>
          {p.showReplies && p.replies.length > 0 && (
            <div className="prayer-replies">
              {p.replies.map((r,i) => <div key={i} className="prayer-reply"><strong>{r.pike}:</strong> {r.text}</div>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AccountTab({ pikeName, officerRole, isOfficer, profilePhoto, uploading, onPhotoClick, onRoleChangeRequest, onSignOut }) {
  const [notifOn,        setNotifOn]        = useState(true);
  const [showAbout,      setShowAbout]      = useState(false);
  const [showHelp,       setShowHelp]       = useState(false);
  const [showPrivacy,    setShowPrivacy]    = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);

  return (
    <div className="account-page">
      {/* Sub-modals */}
      {showAbout && (
        <div className="modal-wrap" onClick={() => setShowAbout(false)}>
          <div className="modal" style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAbout(false)}>✕</button>
            <div className="modal-title">About Pi Kappa News</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.8)",lineHeight:1.7}}>Pi Kappa News is the official app for Pi Kappa Fraternity, keeping brothers connected through news, events, media, and prayer.<br/><br/>Version 1.0.0 · Built for Pi Kappa Brothers</div>
          </div>
        </div>
      )}
      {showHelp && (
        <div className="modal-wrap" onClick={() => setShowHelp(false)}>
          <div className="modal" style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHelp(false)}>✕</button>
            <div className="modal-title">Help & FAQ</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.8)",lineHeight:1.8}}>
              <strong style={{color:WHITE}}>How do I post news?</strong><br/>Only officers can post. Select your officer role on setup or change it in Account.<br/><br/>
              <strong style={{color:WHITE}}>How do I upload media?</strong><br/>Any member can upload to the Media tab using the + Upload Media button.<br/><br/>
              <strong style={{color:WHITE}}>How do I change my profile photo?</strong><br/>Tap your avatar at the top of the Account tab or in the top-right header.<br/><br/>
              <strong style={{color:WHITE}}>Who can add events?</strong><br/>Officers can add events to the Pi Kappa Calendar from the Events tab.
            </div>
          </div>
        </div>
      )}
      {showPrivacy && (
        <div className="modal-wrap" onClick={() => setShowPrivacy(false)}>
          <div className="modal" style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPrivacy(false)}>✕</button>
            <div className="modal-title">Privacy</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.8)",lineHeight:1.7}}>Pi Kappa News is a private, members-only platform. Your information is only visible to verified Pi Kappa members. Profile photos and Pike names are shown to other members within the app.</div>
          </div>
        </div>
      )}
      {showAppearance && (
        <div className="modal-wrap" onClick={() => setShowAppearance(false)}>
          <div className="modal" style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAppearance(false)}>✕</button>
            <div className="modal-title">App Appearance</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.75)",marginBottom:16}}>Pi Kappa News uses the official maroon color theme. Additional themes coming soon.</div>
            <div style={{background:MAROON,borderRadius:10,padding:"12px 14px",border:"2px solid rgba(255,255,255,.3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:WHITE,fontSize:14,fontWeight:600}}>Pi Kappa Maroon</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="account-avatar-area">
        <div className="account-avatar" onClick={onPhotoClick}>
          {profilePhoto
            ? <img src={profilePhoto} alt="profile" style={{width:"100%",height:"100%",objectFit:"cover"}} />
            : initials(pikeName)}
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:6,cursor:"pointer"}} onClick={onPhotoClick}>
          {uploading ? "Uploading…" : "Tap to change photo"}
        </div>
        <div className="account-name">{pikeName || "Pike"}</div>
        <div className="account-role">{isOfficer && officerRole ? officerRole.label : "Member"}</div>
      </div>

      {isOfficer && (
        <>
          <div className="settings-header">Officer</div>
          <div className="settings-section">
            <div className="settings-row" onClick={onRoleChangeRequest}>
              <span className="settings-row-label">Officer Role: {officerRole?.label || "None"}</span>
              <span className="settings-row-arrow">›</span>
            </div>
          </div>
        </>
      )}

      <div className="settings-header">Account</div>
      <div className="settings-section">
        <div className="settings-row" onClick={onPhotoClick}>
          <span className="settings-row-label">Change Profile Photo</span>
          <span className="settings-row-arrow">›</span>
        </div>
        <div className="settings-row" style={{cursor:"default"}}>
          <span className="settings-row-label">Pike Name</span>
          <span style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>{pikeName}</span>
        </div>
      </div>

      <div className="settings-header">Settings</div>
      <div className="settings-section">
        <div className="settings-row" onClick={() => setNotifOn(n => !n)}>
          <span className="settings-row-label">Notifications</span>
          <div style={{width:40,height:22,borderRadius:11,background:notifOn?MAROON3:MAROON2,border:"1px solid "+MAROON3,position:"relative",transition:"background .2s",cursor:"pointer"}}>
            <div style={{position:"absolute",top:2,left:notifOn?20:2,width:16,height:16,borderRadius:"50%",background:WHITE,transition:"left .2s"}} />
          </div>
        </div>
        <div className="settings-row" onClick={() => setShowPrivacy(true)}><span className="settings-row-label">Privacy</span><span className="settings-row-arrow">›</span></div>
        <div className="settings-row" onClick={() => setShowAppearance(true)}><span className="settings-row-label">App Appearance</span><span className="settings-row-arrow">›</span></div>
        <div className="settings-row" onClick={() => setShowAbout(true)}><span className="settings-row-label">About Pi Kappa News</span><span className="settings-row-arrow">›</span></div>
      </div>

      <div className="settings-header">Support</div>
      <div className="settings-section">
        <div className="settings-row" onClick={() => setShowHelp(true)}><span className="settings-row-label">Help & FAQ</span><span className="settings-row-arrow">›</span></div>
        <div className="settings-row" onClick={onSignOut}><span className="settings-row-label" style={{color:"#F09595"}}>Sign Out</span></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Overlays
// ════════════════════════════════════════════════════════════

function CarpOverlay({ carp, onClose }) {
  const sections = carp.sections;
  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="overlay-card">
        <div className="overlay-header">
          <div>
            <div className="overlay-title">Carp Chronicles</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:2}}>{carp.date}</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </div>
        {carp.coverImage
          ? <img src={carp.coverImage} alt="" style={{width:"100%",height:180,objectFit:"cover"}} />
          : <div style={{width:"100%",height:100,background:MAROON2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🎣</div>}
        <div style={{height:16}} />
        {Object.entries(sections).map(([key,s]) => s.content ? (
          <div key={key} className="carp-section">
            <div className="carp-section-title">{s.title}</div>
            {s.subtitle && <div className="carp-section-sub">{s.subtitle}</div>}
            <div className="carp-section-body">{s.content}</div>
          </div>
        ) : null)}
        <div className="carp-authors">— {carp.authors?.join(" & ")}</div>
      </div>
    </div>
  );
}

function NewsOverlay({ item, onClose }) {
  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="overlay-card">
        <div className="overlay-header">
          <div className="overlay-title">{item.title}</div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </div>
        {item.image && <img src={item.image} alt="" style={{width:"100%",height:200,objectFit:"cover"}} />}
        <div style={{padding:"14px 12px"}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:6}}>Officer Name: <span style={{color:WHITE}}>{item.officerName}</span></div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:12}}>Title: <span style={{color:WHITE}}>{item.title}</span></div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.82)",lineHeight:1.65}}>{item.description}</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Modals
// ════════════════════════════════════════════════════════════

function PostModal({ onClose, onSubmit, pikeName, officerRole, uploading }) {
  const [newsType, setNewsType] = useState("general");
  const [form, setForm] = useState({
    title:"", officerName: officerRole?.label||pikeName, description:"",
    date:"", weekLabel:"", dailyCatch:"", hookOfWisdom:"", makingWaves:"",
    pikeOfWeek:"", schoolOfBrotherhood:"", finalCastOff:"",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const fileRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0]; if (!f) return;
    setImageFile(f); setPreview(URL.createObjectURL(f));
  }

  return (
    <div className="modal-wrap" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{position:"relative"}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Post to News</div>
        <div className="field">
          <div className="label">Post Type</div>
          <select className="input" value={newsType} onChange={e => setNewsType(e.target.value)}>
            <option value="carp">Carp Chronicles</option>
            <option value="general">General Club News</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        {newsType === "carp" ? (
          <>
            <div className="field"><div className="label">Chronicle Date (e.g. March 30th, 2026)</div><input className="input" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
            <div className="field"><div className="label">Week Label (e.g. Mar 30)</div><input className="input" value={form.weekLabel} onChange={e=>setForm(f=>({...f,weekLabel:e.target.value}))} /></div>
            <div className="field">
              <div className="label">Cover Image</div>
              <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleFile} />
              <button className="btn" onClick={() => fileRef.current?.click()}>{imageFile ? "✓ Image selected" : "Choose Cover Image"}</button>
              {preview && <img src={preview} alt="" style={{width:"100%",borderRadius:8,marginTop:8,objectFit:"cover",maxHeight:140}} />}
            </div>
            <div className="field"><div className="label">The Daily Catch (Upcoming Events)</div><textarea className="input" value={form.dailyCatch} onChange={e=>setForm(f=>({...f,dailyCatch:e.target.value}))} placeholder="List upcoming events and dates…" /></div>
            <div className="field"><div className="label">Hook of Wisdom (Bible Verse)</div><textarea className="input" value={form.hookOfWisdom} onChange={e=>setForm(f=>({...f,hookOfWisdom:e.target.value}))} placeholder="Weekly Bible verse…" /></div>
            <div className="field"><div className="label">Making Waves (Highlights)</div><textarea className="input" value={form.makingWaves} onChange={e=>setForm(f=>({...f,makingWaves:e.target.value}))} placeholder="Highlights and wins of the week…" /></div>
            <div className="field"><div className="label">Pike of the Week Name</div><input className="input" value={form.pikeOfWeek} onChange={e=>setForm(f=>({...f,pikeOfWeek:e.target.value}))} placeholder="e.g. Thomas Risner" /></div>
            <div className="field"><div className="label">School of Brotherhood (Updates)</div><textarea className="input" value={form.schoolOfBrotherhood} onChange={e=>setForm(f=>({...f,schoolOfBrotherhood:e.target.value}))} placeholder="Club updates and announcements…" /></div>
            <div className="field"><div className="label">Final Cast-Off</div><textarea className="input" value={form.finalCastOff} onChange={e=>setForm(f=>({...f,finalCastOff:e.target.value}))} placeholder="Closing message…" /></div>
            <div className="field"><div className="label">Your Pike Name(s) for Byline</div><input className="input" value={form.officerName} onChange={e=>setForm(f=>({...f,officerName:e.target.value}))} placeholder="e.g. Pike Chappa Time & Pike Macho" /></div>
          </>
        ) : (
          <>
            <div className="field"><div className="label">Title of Event</div><input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
            <div className="field"><div className="label">Officer Name</div><input className="input" value={form.officerName} onChange={e=>setForm(f=>({...f,officerName:e.target.value}))} /></div>
            <div className="field"><div className="label">Description of Event</div><textarea className="input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
            <div className="field">
              <div className="label">Cover Photo (optional)</div>
              <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleFile} />
              <button className="btn" onClick={() => fileRef.current?.click()}>{imageFile ? "✓ Image selected" : "Choose Photo"}</button>
              {preview && <img src={preview} alt="" style={{width:"100%",borderRadius:8,marginTop:8,objectFit:"cover",maxHeight:140}} />}
            </div>
          </>
        )}
        <button className="btn primary" disabled={uploading} onClick={() => onSubmit({...form, newsType}, imageFile)}>
          {uploading ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
}

function PrayerModal({ onClose, onSubmit, pikeName }) {
  const [req, setReq] = useState("");
  return (
    <div className="modal-wrap" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{position:"relative"}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Submit Prayer Request</div>
        <div className="field"><div className="label">Pike Name</div><input className="input" value={pikeName} readOnly /></div>
        <div className="field"><div className="label">What can we pray about for you?</div>
          <textarea className="input" style={{minHeight:100}} value={req} onChange={e=>setReq(e.target.value)} placeholder="Share your prayer request with your brothers…" /></div>
        <button className="btn primary" onClick={() => req.trim() && onSubmit(req)}>Submit</button>
      </div>
    </div>
  );
}

function EventModal({ onClose, onSubmit, uploading }) {
  const [form, setForm] = useState({ title:"", date:"", time:"", location:"", description:"", mandatory:false });
  return (
    <div className="modal-wrap" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{position:"relative"}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Add Event to Calendar</div>
        <div className="field"><div className="label">Event Title</div><input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
        <div className="field"><div className="label">Date (e.g. Apr 15, 2026)</div><input className="input" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
        <div className="field"><div className="label">Time</div><input className="input" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} placeholder="e.g. 7:00 PM" /></div>
        <div className="field"><div className="label">Location</div><input className="input" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} /></div>
        <div className="field"><div className="label">Description</div><textarea className="input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
        <div className="field" style={{display:"flex",alignItems:"center",gap:10}}>
          <input type="checkbox" id="mandatory" checked={form.mandatory} onChange={e=>setForm(f=>({...f,mandatory:e.target.checked}))} />
          <label htmlFor="mandatory" style={{color:WHITE,fontSize:14}}>Mandatory event</label>
        </div>
        <button className="btn primary" disabled={uploading} onClick={() => form.title && form.date && onSubmit(form)}>
          {uploading ? "Saving…" : "Add to Calendar"}
        </button>
      </div>
    </div>
  );
}

function RoleChangeModal({ takenRoles, currentRole, onClose, onSelect, notified }) {
  return (
    <div className="modal-wrap" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{position:"relative"}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Change Officer Role</div>
        {!notified
          ? <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginBottom:16}}>Select a new role. The Historian will be notified before the change takes effect.</div>
          : <div style={{fontSize:13,color:"#FAC775",marginBottom:16,background:"#412402",borderRadius:8,padding:"10px 12px"}}>⏳ Awaiting Historian approval. Tap a role again to finalize once approved.</div>}
        <div className="role-list">
          {OFFICER_ROLES.map(role => {
            const count    = takenRoles[role.id] || 0;
            const isCurrent = currentRole?.id === role.id;
            const full     = count >= role.max && !isCurrent;
            return (
              <div key={role.id} className={"role-opt"+(isCurrent?" selected":"")+(full?" role-full":"")} onClick={() => !full && onSelect(role)}>
                <span>{role.label}</span>
                {isCurrent && <span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>Current</span>}
                {full && !isCurrent && <span style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>Filled</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}