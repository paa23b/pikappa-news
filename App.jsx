import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zdnvajwdyxvtyraeedqq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbnZhand5eHZ0eXJhZWVkcXEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NTQ4Mjg3MCwiZXhwIjoyMDkxMDU4ODcwfQ.s6ymkURCK6io2FYJ4HqlqJYsxXX3qaCgvfZFSD_cu0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MAROON = "#6B0A1A";
const MAROON2 = "#8B1A2A";
const MAROON3 = "#A52535";
const MAROON4 = "#5A0813";
const MAROON5 = "#3D0510";
const WHITE = "#FFFFFF";

const OFFICER_ROLES = [
  { id: "president", label: "President", max: 1 },
  { id: "vp", label: "Vice President", max: 1 },
  { id: "nmo", label: "NMO Officer", max: 1 },
  { id: "chaplain", label: "Chaplain", max: 1 },
  { id: "mens_ministry", label: "Men's Ministry Director", max: 1 },
  { id: "treasurer", label: "Treasurer", max: 1 },
  { id: "historian", label: "Historian", max: 1 },
  { id: "cod_fathers", label: "Cod Fathers", max: 2 },
  { id: "social", label: "Social Director", max: 1 },
  { id: "mission", label: "Mission Outreach Director", max: 1 },
  { id: "intramural", label: "Intramural Director", max: 1 },
  { id: "creative", label: "Creative/Merch Director", max: 1 },
  { id: "fundraising", label: "Fundraising/Alumni Relations Director", max: 1 },
];

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "news", label: "News", icon: "📰" },
  { id: "media", label: "Media", icon: "📸" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "prayer", label: "Prayer", icon: "🙏" },
  { id: "account", label: "Account", icon: "👤" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@300;400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Source Sans 3', sans-serif; background: ${MAROON5}; color: ${WHITE}; min-height: 100vh; }
  .app { display: flex; flex-direction: column; min-height: 100vh; max-width: 480px; margin: 0 auto; background: ${MAROON5}; position: relative; }
  .header { background: ${MAROON}; padding: 14px 16px 10px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${MAROON2}; position: sticky; top: 0; z-index: 100; }
  .header-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: ${WHITE}; letter-spacing: 0.5px; }
  .header-sub { font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 2px; text-transform: uppercase; margin-top: 1px; }
  .avatar-btn { width: 36px; height: 36px; border-radius: 50%; background: ${MAROON2}; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-initials { font-size: 13px; font-weight: 700; color: ${WHITE}; }
  .content { flex: 1; overflow-y: auto; padding-bottom: 80px; }
  .tabs { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; display: flex; background: ${MAROON4}; border-top: 1px solid ${MAROON2}; z-index: 100; }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 2px 10px; cursor: pointer; gap: 3px; border: none; background: transparent; transition: background 0.15s; }
  .tab.active { background: ${MAROON}; }
  .tab:hover:not(.active) { background: ${MAROON2}; }
  .tab-icon { font-size: 18px; line-height: 1; }
  .tab-label { font-size: 9px; color: rgba(255,255,255,0.75); text-align: center; letter-spacing: 0.3px; line-height: 1.1; }
  .tab.active .tab-label { color: ${WHITE}; font-weight: 700; }
  .section-title { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.5); padding: 14px 16px 6px; font-weight: 600; }
  .card { background: ${MAROON}; border-radius: 12px; margin: 0 12px 12px; padding: 14px; border: 1px solid ${MAROON2}; }
  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px 12px 0; }
  .dash-cube { background: ${MAROON}; border-radius: 14px; padding: 12px; border: 1px solid ${MAROON2}; min-height: 130px; cursor: pointer; transition: transform 0.15s, background 0.15s; }
  .dash-cube:hover { background: ${MAROON2}; transform: scale(1.01); }
  .dash-cube.wide { grid-column: 1/-1; min-height: 90px; }
  .cube-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 600; margin-bottom: 8px; }
  .cube-content { font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.5; }
  .cube-pike-week { font-size: 20px; font-family: 'Playfair Display', serif; font-weight: 700; color: ${WHITE}; margin-top: 4px; }
  .carp-scroll { display: flex; gap: 10px; padding: 10px 12px; overflow-x: auto; scrollbar-width: none; }
  .carp-scroll::-webkit-scrollbar { display: none; }
  .carp-chip { min-width: 110px; height: 130px; border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; flex-shrink: 0; border: 2px solid ${MAROON2}; }
  .carp-chip-bg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .carp-chip-overlay { position: absolute; inset: 0; background: rgba(59,5,16,0.65); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; }
  .carp-chip-date { font-size: 12px; font-weight: 700; color: ${WHITE}; text-align: center; font-family: 'Playfair Display', serif; line-height: 1.3; }
  .carp-chip-label { font-size: 9px; color: rgba(255,255,255,0.7); letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; }
  .news-item { background: ${MAROON}; margin: 0 12px 10px; border-radius: 12px; border: 1px solid ${MAROON2}; overflow: hidden; cursor: pointer; }
  .news-img { width: 100%; height: 120px; background: ${MAROON2}; display: flex; align-items: center; justify-content: center; font-size: 32px; }
  .news-body { padding: 12px; }
  .news-type-badge { display: inline-block; background: ${MAROON3}; color: ${WHITE}; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; margin-bottom: 6px; font-weight: 600; }
  .news-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: ${WHITE}; margin-bottom: 4px; line-height: 1.3; }
  .news-meta { font-size: 12px; color: rgba(255,255,255,0.5); }
  .media-upload-btn { margin: 12px; background: ${MAROON2}; border: 2px dashed ${MAROON3}; border-radius: 12px; padding: 18px; text-align: center; cursor: pointer; color: rgba(255,255,255,0.7); font-size: 14px; transition: background 0.15s; }
  .media-upload-btn:hover { background: ${MAROON3}; }
  .media-feed-item { background: ${MAROON}; margin: 0 12px 12px; border-radius: 12px; border: 1px solid ${MAROON2}; overflow: hidden; }
  .media-feed-img { width: 100%; aspect-ratio: 4/3; background: ${MAROON2}; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .media-feed-meta { padding: 12px; }
  .media-meta-row { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 3px; }
  .media-meta-row span { color: ${WHITE}; font-weight: 600; }
  .event-item { background: ${MAROON}; margin: 0 12px 10px; border-radius: 12px; border: 1px solid ${MAROON2}; padding: 14px; display: flex; gap: 12px; }
  .event-date-badge { min-width: 48px; background: ${MAROON3}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 6px; }
  .event-date-month { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.7); font-weight: 600; }
  .event-date-day { font-size: 22px; font-family: 'Playfair Display', serif; font-weight: 700; color: ${WHITE}; line-height: 1; }
  .event-title { font-size: 15px; font-weight: 700; color: ${WHITE}; margin-bottom: 3px; }
  .event-time { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
  .event-desc { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.4; }
  .mandatory-badge { display: inline-block; background: #8B1A1A; color: ${WHITE}; font-size: 10px; padding: 1px 6px; border-radius: 4px; margin-left: 6px; font-weight: 700; }
  .prayer-item { background: ${MAROON}; margin: 0 12px 10px; border-radius: 12px; border: 1px solid ${MAROON2}; padding: 14px; }
  .prayer-pike { font-size: 14px; font-weight: 700; color: ${WHITE}; margin-bottom: 6px; }
  .prayer-text { font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.5; margin-bottom: 10px; }
  .prayer-actions { display: flex; align-items: center; gap: 12px; }
  .prayer-like-btn { background: ${MAROON3}; border: none; border-radius: 20px; padding: 4px 12px; color: ${WHITE}; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; display: flex; flex-direction: column; }
  .overlay-card { background: ${MAROON4}; flex: 1; margin-top: 60px; border-radius: 20px 20px 0 0; overflow-y: auto; }
  .overlay-header { background: ${MAROON}; padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${MAROON2}; border-radius: 20px 20px 0 0; }
  .overlay-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: ${WHITE}; }
  .overlay-close { background: ${MAROON2}; border: none; border-radius: 50%; width: 30px; height: 30px; color: ${WHITE}; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .carp-section { margin: 0 12px 14px; background: ${MAROON}; border-radius: 12px; padding: 14px; border: 1px solid ${MAROON2}; }
  .carp-section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: ${WHITE}; }
  .carp-section-sub { font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; margin-top: 1px; }
  .carp-section-body { font-size: 14px; color: rgba(255,255,255,0.82); line-height: 1.65; white-space: pre-line; }
  .carp-authors { font-size: 13px; color: rgba(255,255,255,0.6); font-style: italic; padding: 0 12px 20px; }
  .btn { background: ${MAROON2}; border: 1px solid ${MAROON3}; border-radius: 8px; color: ${WHITE}; font-size: 14px; font-family: 'Source Sans 3', sans-serif; padding: 10px 16px; cursor: pointer; width: 100%; margin-bottom: 10px; font-weight: 600; transition: background 0.15s; }
  .btn:hover { background: ${MAROON3}; }
  .btn.primary { background: ${MAROON3}; border-color: ${MAROON}; }
  .input { background: ${MAROON2}; border: 1px solid ${MAROON3}; border-radius: 8px; color: ${WHITE}; font-size: 14px; font-family: 'Source Sans 3', sans-serif; padding: 10px 12px; width: 100%; margin-bottom: 10px; outline: none; }
  .input::placeholder { color: rgba(255,255,255,0.35); }
  .input:focus { border-color: rgba(255,255,255,0.4); }
  .label { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px; font-weight: 600; letter-spacing: 0.5px; }
  .field { margin-bottom: 12px; }
  .onboard { position: fixed; inset: 0; background: ${MAROON5}; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; }
  .onboard-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; color: ${WHITE}; text-align: center; margin-bottom: 4px; }
  .onboard-sub { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 40px; }
  .onboard-question { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: ${WHITE}; text-align: center; margin-bottom: 24px; }
  .onboard-card { background: ${MAROON}; border-radius: 16px; padding: 24px; width: 100%; border: 1px solid ${MAROON2}; }
  .role-list { display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow-y: auto; }
  .role-opt { background: ${MAROON2}; border: 1px solid ${MAROON3}; border-radius: 8px; padding: 12px 14px; cursor: pointer; font-size: 14px; color: ${WHITE}; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s; }
  .role-opt:hover { background: ${MAROON3}; }
  .role-opt.selected { background: ${MAROON3}; border-color: rgba(255,255,255,0.4); }
  .role-full { opacity: 0.4; cursor: not-allowed; }
  .account-page { padding: 20px 12px; }
  .account-avatar-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; }
  .account-avatar { width: 90px; height: 90px; border-radius: 50%; background: ${MAROON2}; border: 3px solid ${MAROON3}; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: ${WHITE}; cursor: pointer; overflow: hidden; margin-bottom: 10px; font-family: 'Playfair Display', serif; }
  .account-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: ${WHITE}; }
  .account-role { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 2px; }
  .settings-section { background: ${MAROON}; border-radius: 12px; border: 1px solid ${MAROON2}; overflow: hidden; margin-bottom: 14px; }
  .settings-row { padding: 13px 16px; border-bottom: 1px solid ${MAROON2}; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
  .settings-row:last-child { border-bottom: none; }
  .settings-row-label { font-size: 14px; color: ${WHITE}; }
  .settings-row-arrow { color: rgba(255,255,255,0.35); font-size: 14px; }
  .settings-header { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 600; padding: 10px 16px 4px; }
  .modal-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 300; display: flex; align-items: flex-end; }
  .modal { background: ${MAROON4}; border-radius: 20px 20px 0 0; padding: 20px 16px 32px; width: 100%; max-height: 85vh; overflow-y: auto; position: relative; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: ${WHITE}; margin-bottom: 16px; }
  .modal-close { position: absolute; top: 16px; right: 16px; background: ${MAROON2}; border: none; border-radius: 50%; width: 28px; height: 28px; color: ${WHITE}; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  select.input option { background: ${MAROON4}; color: ${WHITE}; }
  textarea.input { resize: vertical; min-height: 80px; }
  .post-placeholder { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.4); font-size: 14px; }
  .loading { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.4); font-size: 14px; }
  .verse-text { font-size: 13px; font-style: italic; color: rgba(255,255,255,0.8); line-height: 1.55; }
`;

function initials(name) {
  return (name || "PK").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState("name");
  const [pikeName, setPikeName] = useState("");
  const [isOfficer, setIsOfficer] = useState(false);
  const [officerRole, setOfficerRole] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [carpList, setCarpList] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [prayerList, setPrayerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewCarp, setViewCarp] = useState(null);
  const [viewNews, setViewNews] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const profileFileRef = useRef();
  const [cropSrc, setCropSrc] = useState(null);

  const canPost = isOfficer && officerRole;

  // ── Fetch all data on load ──────────────────────────────────────────
  useEffect(() => {
    fetchCarp();
    fetchNews();
    fetchMedia();
    fetchEvents();
    fetchPrayers();
  }, []);

  async function fetchCarp() {
    const { data, error } = await supabase
      .from("Carp Chronicles Catch Log")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCarpList(data);
  }

  async function fetchNews() {
    const { data, error } = await supabase
      .from("News Posts Table")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setNewsList(data);
  }

  async function fetchMedia() {
    const { data, error } = await supabase
      .from("Media Uploads Tracking")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMediaList(data);
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("Events Management Table")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setEventList(data);
  }

  async function fetchPrayers() {
    const { data, error } = await supabase
      .from("Prayer Requests Table")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPrayerList(data);
  }

  // ── Onboarding: save profile to Supabase ───────────────────────────
  async function handleOnboardName() {
    if (!pikeName.trim()) return;
    setOnboardStep("officer_q");
  }

  async function handleOfficerChoice(choice) {
    if (choice === "yes") {
      setIsOfficer(true);
      setOnboardStep("officer_role");
    } else {
      await saveProfile(false, null);
    }
  }

  async function handleRoleSelect(role) {
    setOfficerRole(role);
    await saveProfile(true, role.label);
  }

  async function saveProfile(officer, roleLabel) {
    setLoading(true);
    const { data, error } = await supabase
      .from("Profiles Member Data Table")
      .insert([{
        pike_name: pikeName,
        is_officer: officer,
        officer_role: roleLabel || null,
        avatar_url: null,
      }])
      .select()
      .single();
    if (!error && data) {
      setProfileId(data.id);
      setIsOfficer(officer);
      if (roleLabel) {
        const found = OFFICER_ROLES.find(r => r.label === roleLabel);
        if (found) setOfficerRole(found);
      }
    }
    setLoading(false);
    setOnboarded(true);
  }

  // ── Profile photo upload ────────────────────────────────────────────
  function handleProfilePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleAvatarSave(dataUrl) {
    setProfilePhoto(dataUrl);
    setCropSrc(null);
    if (!profileId) return;
    // Upload to Supabase Storage then save URL
    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `avatars/${profileId}.jpg`;
    const { error: uploadError } = await supabase.storage
  .from("avatars")
  .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
      await supabase
        .from("Profiles Member Data Table")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", profileId);
    }
  }

  // ── Add prayer ──────────────────────────────────────────────────────
  async function addPrayer(request) {
    const { data, error } = await supabase
      .from("Prayer Requests Table")
      .insert([{ pike_name: pikeName, request, avatar_url: profilePhoto || null, likes: 0 }])
      .select()
      .single();
    if (!error && data) setPrayerList(p => [data, ...p]);
    setShowPrayerModal(false);
  }

  // ── Like prayer ─────────────────────────────────────────────────────
  async function togglePrayerLike(id) {
    const prayer = prayerList.find(p => p.id === id);
    if (!prayer) return;
    const newLikes = (prayer.likes || 0) + 1;
    await supabase.from("Prayer Requests Table").update({ likes: newLikes }).eq("id", id);
    setPrayerList(p => p.map(x => x.id === id ? { ...x, likes: newLikes } : x));
  }

  // ── Add event ───────────────────────────────────────────────────────
  async function addEvent(ev) {
    const { data, error } = await supabase
      .from("Events Management Table")
      .insert([ev])
      .select()
      .single();
    if (!error && data) setEventList(e => [data, ...e]);
    setShowEventModal(false);
  }

  // ── Submit news/carp post ───────────────────────────────────────────
  async function submitPost(formData) {
    if (formData.newsType === "carp") {
      const { data, error } = await supabase
        .from("Carp Chronicles Catch Log")
        .insert([{
          date: formData.date,
          week_label: formData.weekLabel,
          cover_image: formData.image || null,
          authors: formData.officerName || pikeName,
          daily_catch: formData.dailyCatch,
          hook_of_wisdom: formData.hookOfWisdom,
          pike_of_week: formData.pikeOfWeek,
          making_waves: formData.makingWaves,
          school_of_brotherhood: formData.schoolOfBrotherhood,
          final_cast_off: formData.finalCastOff,
        }])
        .select()
        .single();
      if (!error && data) setCarpList(c => [data, ...c]);
    } else {
      const { data, error } = await supabase
        .from("News Posts Table")
        .insert([{
          type: formData.newsType,
          title: formData.title,
          officer_name: formData.officerName || pikeName,
          description: formData.description,
          image_url: formData.image || null,
        }])
        .select()
        .single();
      if (!error && data) setNewsList(n => [data, ...n]);
    }
    setShowPostModal(false);
  }

  // ── Upload media ────────────────────────────────────────────────────
  async function handleMediaUpload(item) {
    const { data, error } = await supabase
      .from("Media Uploads Tracking")
      .insert([{
        uploaded_by: item.uploadedBy,
        event_name: item.eventName,
        description: item.description,
        image_url: item.image || null,
      }])
      .select()
      .single();
    if (!error && data) setMediaList(m => [data, ...m]);
  }

  // ── Sign out ────────────────────────────────────────────────────────
  function handleSignOut() {
    setOnboarded(false);
    setOnboardStep("name");
    setPikeName("");
    setIsOfficer(false);
    setOfficerRole(null);
    setProfilePhoto(null);
    setProfileId(null);
    setTab("dashboard");
  }

  const latestCarp = carpList[0];
  const verseOfWeek = latestCarp?.hook_of_wisdom || "";
  const pikeOfWeek = latestCarp?.pike_of_week || "";

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
                  <input className="input" placeholder="e.g. Pike Thomas" value={pikeName} onChange={e => setPikeName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleOnboardName()} />
                </div>
                <button className="btn primary" onClick={handleOnboardName}>Continue</button>
              </div>
            </>
          )}
          {onboardStep === "officer_q" && (
            <>
              <div className="onboard-question">Welcome, {pikeName}!</div>
              <div className="onboard-card">
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, textAlign: "center" }}>Are you an officer in Pi Kappa?</div>
                <button className="btn primary" onClick={() => handleOfficerChoice("yes")}>Yes, I am an officer</button>
                <button className="btn" onClick={() => handleOfficerChoice("no")}>No, continue as member</button>
              </div>
            </>
          )}
          {onboardStep === "officer_role" && (
            <>
              <div className="onboard-question">Select your role</div>
              <div className="onboard-card">
                <div className="role-list">
                  {OFFICER_ROLES.map(role => (
                    <div key={role.id} className="role-opt" onClick={() => handleRoleSelect(role)}>
                      <span>{role.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {loading && <div style={{ marginTop: 16, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Saving...</div>}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="header-title">Pi Kappa News</div>
            <div className="header-sub">Pi Kappa Fraternity</div>
          </div>
          <div className="avatar-btn" onClick={() => profileFileRef.current?.click()}>
            {profilePhoto ? <img src={profilePhoto} alt="profile" /> : <span className="avatar-initials">{initials(pikeName)}</span>}
          </div>
        </div>

        <div className="content">
          {tab === "dashboard" && <DashboardTab carpList={carpList} newsList={newsList} mediaList={mediaList} prayerList={prayerList} verseOfWeek={verseOfWeek} pikeOfWeek={pikeOfWeek} onCarpClick={setViewCarp} onTabSwitch={setTab} />}
          {tab === "news" && <NewsTab carpList={carpList} newsList={newsList} canPost={canPost} onCarpClick={setViewCarp} onNewsClick={setViewNews} onPost={() => setShowPostModal(true)} />}
          {tab === "media" && <MediaTab mediaList={mediaList} pikeName={pikeName} onUpload={handleMediaUpload} />}
          {tab === "events" && <EventsTab eventList={eventList} canPost={canPost} onAddEvent={() => setShowEventModal(true)} />}
          {tab === "prayer" && <PrayerTab prayerList={prayerList} onLike={togglePrayerLike} onAdd={() => setShowPrayerModal(true)} />}
          {tab === "account" && <AccountTab pikeName={pikeName} officerRole={officerRole} isOfficer={isOfficer} profilePhoto={profilePhoto} onPhotoClick={() => profileFileRef.current?.click()} onSignOut={handleSignOut} />}
        </div>

        <input type="file" accept="image/*" ref={profileFileRef} style={{ display: "none" }} onChange={handleProfilePhoto} />

        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        {viewCarp && <CarpOverlay carp={viewCarp} onClose={() => setViewCarp(null)} />}
        {viewNews && <NewsOverlay item={viewNews} onClose={() => setViewNews(null)} />}
        {showPostModal && <PostModal onClose={() => setShowPostModal(false)} onSubmit={submitPost} pikeName={pikeName} officerRole={officerRole} />}
        {showPrayerModal && <PrayerModal onClose={() => setShowPrayerModal(false)} onSubmit={addPrayer} pikeName={pikeName} />}
        {showEventModal && <EventModal onClose={() => setShowEventModal(false)} onSubmit={addEvent} />}
        {cropSrc && <AvatarCropper src={cropSrc} onSave={handleAvatarSave} onCancel={() => setCropSrc(null)} />}
      </div>
    </>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────
function DashboardTab({ carpList, newsList, mediaList, prayerList, verseOfWeek, pikeOfWeek, onCarpClick, onTabSwitch }) {
  const latestCarp = carpList[0];
  const announcements = newsList.filter(n => n.type === "announcement").slice(0, 2);
  return (
    <div>
      <div className="section-title">Dashboard</div>
      <div className="dash-grid">
        {latestCarp && (
          <div className="dash-cube" onClick={() => onCarpClick(latestCarp)}>
            <div className="cube-label">Carp Chronicles</div>
            <div className="cube-content" style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700 }}>{latestCarp.date}</div>
            <div className="cube-content" style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Tap to read latest</div>
          </div>
        )}
        <div className="dash-cube" onClick={() => onTabSwitch("media")}>
          <div className="cube-label">Media</div>
          {mediaList.length === 0
            ? <div className="cube-content" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8 }}>No media yet</div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 8, borderRadius: 8, overflow: "hidden" }}>
                {mediaList.slice(0, 9).map(m => (
                  <div key={m.id} style={{ aspectRatio: 1, background: "#8B1A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {m.image_url ? <img src={m.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 14 }}>🐟</span>}
                  </div>
                ))}
              </div>}
        </div>
        <div className="dash-cube">
          <div className="cube-label">Verse of the Week</div>
          {verseOfWeek
            ? <div className="verse-text">{verseOfWeek.slice(0, 100)}{verseOfWeek.length > 100 ? "…" : ""}</div>
            : <div className="cube-content" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>From the Carp Chronicles</div>}
        </div>
        <div className="dash-cube">
          <div className="cube-label">Pike of the Week</div>
          {pikeOfWeek
            ? <div className="cube-pike-week">{pikeOfWeek}</div>
            : <div className="cube-content" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Announced in Carp Chronicles</div>}
        </div>
        <div className="dash-cube wide" onClick={() => onTabSwitch("news")}>
          <div className="cube-label">Announcements</div>
          {announcements.length > 0 ? announcements.map(a => (
            <div key={a.id} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{a.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{a.officer_name}</div>
            </div>
          )) : <div className="cube-content" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>No announcements yet</div>}
        </div>
        <div className="dash-cube wide" onClick={() => onTabSwitch("prayer")}>
          <div className="cube-label">Prayer Requests</div>
          {prayerList.length === 0
            ? <div className="cube-content" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>No prayer requests yet</div>
            : prayerList.slice(0, 2).map(p => (
              <div key={p.id} style={{ marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 600 }}>{p.pike_name}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}> has posted a prayer request</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── News Tab ───────────────────────────────────────────────────────────
function NewsTab({ carpList, newsList, canPost, onCarpClick, onNewsClick, onPost }) {
  const generalNews = newsList.filter(n => n.type === "general");
  const announcements = newsList.filter(n => n.type === "announcement");
  return (
    <div>
      {canPost && (
        <div style={{ padding: "10px 12px 0" }}>
          <button className="btn primary" onClick={onPost}>+ Post News / Announcement</button>
        </div>
      )}
      <div className="section-title">Carp Chronicles</div>
      <div className="carp-scroll">
        {carpList.map(c => (
          <div key={c.id} className="carp-chip" onClick={() => onCarpClick(c)}>
            <div className="carp-chip-bg" style={{ background: "#8B1A2A" }}>
              {c.cover_image ? <img src={c.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>🎣</span>}
            </div>
            <div className="carp-chip-overlay">
              <div className="carp-chip-date">{c.week_label || c.date}</div>
              <div className="carp-chip-label">Carp Chronicles</div>
            </div>
          </div>
        ))}
        {carpList.length === 0 && <div className="post-placeholder">No Carp Chronicles yet</div>}
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
      {item.image_url && <div className="news-img"><img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
      <div className="news-body">
        <span className="news-type-badge">{item.type === "announcement" ? "Announcement" : "General News"}</span>
        <div className="news-title">{item.title}</div>
        <div className="news-meta">{item.officer_name}</div>
      </div>
    </div>
  );
}

// ── Media Tab ──────────────────────────────────────────────────────────
function MediaTab({ mediaList, pikeName, onUpload }) {
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ uploadedBy: pikeName, eventName: "", description: "", image: null });
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!form.eventName) return;
    await onUpload(form);
    setForm({ uploadedBy: pikeName, eventName: "", description: "", image: null });
    setShowUpload(false);
  }

  return (
    <div>
      <div className="media-upload-btn" onClick={() => setShowUpload(s => !s)}>
        {showUpload ? "✕ Cancel" : "＋ Upload Media"}
      </div>
      {showUpload && (
        <div className="card">
          <div className="modal-title" style={{ fontSize: 15 }}>Upload Media</div>
          <div className="field"><div className="label">Uploaded By</div><input className="input" value={form.uploadedBy} onChange={e => setForm(f => ({ ...f, uploadedBy: e.target.value }))} /></div>
          <div className="field"><div className="label">Event Name</div><input className="input" placeholder="e.g. Sing Song 2026" value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} /></div>
          <div className="field"><div className="label">Description</div><textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="field">
            <div className="label">Photo/Video</div>
            <input type="file" accept="image/*,video/*" ref={fileRef} style={{ display: "none" }} onChange={handleFile} />
            <button className="btn" onClick={() => fileRef.current?.click()}>{form.image ? "✓ File selected" : "Choose File"}</button>
          </div>
          <button className="btn primary" onClick={handleSubmit}>Upload</button>
        </div>
      )}
      {mediaList.map(m => (
        <div key={m.id} className="media-feed-item">
          <div className="media-feed-img">
            {m.image_url ? <img src={m.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>🐟</span>}
          </div>
          <div className="media-feed-meta">
            <div className="media-meta-row">Uploaded by: <span>{m.uploaded_by}</span></div>
            <div className="media-meta-row">Event: <span>{m.event_name}</span></div>
            <div className="media-meta-row">Description: <span>{m.description}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Events Tab ─────────────────────────────────────────────────────────
function EventsTab({ eventList, canPost, onAddEvent }) {
  return (
    <div>
      {canPost && (
        <div style={{ padding: "10px 12px 0" }}>
          <button className="btn primary" onClick={onAddEvent}>+ Add Event to Calendar</button>
        </div>
      )}
      <div className="section-title">Upcoming Events</div>
      {eventList.map(ev => {
        const dateParts = (ev.date || "").split(" ");
        return (
          <div key={ev.id} className="event-item">
            <div className="event-date-badge">
              <div className="event-date-month">{dateParts[0]}</div>
              <div className="event-date-day">{dateParts[1]?.replace(",", "")}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="event-title">
                {ev.title}
                {ev.mandatory && <span className="mandatory-badge">Mandatory</span>}
              </div>
              <div className="event-time">{ev.time} · {ev.location}</div>
              <div className="event-desc">{ev.description}</div>
            </div>
          </div>
        );
      })}
      {eventList.length === 0 && <div className="post-placeholder">No upcoming events</div>}
    </div>
  );
}

// ── Prayer Tab ─────────────────────────────────────────────────────────
function PrayerTab({ prayerList, onLike, onAdd }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 0" }}>
        <div className="section-title" style={{ padding: 0 }}>Prayer Requests</div>
        <button style={{ background: "#A52535", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#FFFFFF", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onAdd}>+</button>
      </div>
      <div style={{ height: 10 }} />
      {prayerList.length === 0 && <div className="post-placeholder">No prayer requests yet. Tap + to share one.</div>}
      {prayerList.map(p => (
        <div key={p.id} className="prayer-item">
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#A52535", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(p.pike_name)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="prayer-pike">{p.pike_name}</div>
              <div className="prayer-text">{p.request}</div>
            </div>
          </div>
          <div className="prayer-actions">
            <button className="prayer-like-btn" onClick={() => onLike(p.id)}>🙏 {p.likes || 0}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Account Tab ────────────────────────────────────────────────────────
function AccountTab({ pikeName, officerRole, isOfficer, profilePhoto, onPhotoClick, onSignOut }) {
  const [notifOn, setNotifOn] = useState(true);
  return (
    <div className="account-page">
      <div className="account-avatar-area">
        <div className="account-avatar" onClick={onPhotoClick}>
          {profilePhoto ? <img src={profilePhoto} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(pikeName)}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6, cursor: "pointer" }} onClick={onPhotoClick}>Tap to change photo</div>
        <div className="account-name">{pikeName || "Pike"}</div>
        <div className="account-role">{isOfficer && officerRole ? officerRole.label : "Member"}</div>
      </div>
      <div className="settings-header">Settings</div>
      <div className="settings-section">
        <div className="settings-row" onClick={() => setNotifOn(n => !n)}>
          <span className="settings-row-label">Notifications</span>
          <div style={{ width: 40, height: 22, borderRadius: 11, background: notifOn ? "#A52535" : "#8B1A2A", position: "relative", transition: "background 0.2s", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 2, left: notifOn ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", transition: "left 0.2s" }} />
          </div>
        </div>
        <div className="settings-row" onClick={onSignOut}>
          <span className="settings-row-label" style={{ color: "#F09595" }}>Sign Out</span>
        </div>
      </div>
    </div>
  );
}

// ── Overlays ───────────────────────────────────────────────────────────
function CarpOverlay({ carp, onClose }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="overlay-card">
        <div className="overlay-header">
          <div>
            <div className="overlay-title">Carp Chronicles</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{carp.date}</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </div>
        {carp.cover_image
          ? <img src={carp.cover_image} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />
          : <div style={{ width: "100%", height: 100, background: "#8B1A2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎣</div>}
        <div style={{ height: 16 }} />
        {carp.daily_catch && <CarpSection title="The Daily Catch" sub="Upcoming Events & Dates" body={carp.daily_catch} />}
        {carp.hook_of_wisdom && <CarpSection title="Hook of Wisdom" sub="Weekly Bible Verse" body={carp.hook_of_wisdom} />}
        {carp.making_waves && <CarpSection title="Making Waves" sub="Highlights & Wins of the Week" body={carp.making_waves} />}
        {carp.school_of_brotherhood && <CarpSection title="School of Brotherhood" sub="Updates & Announcements" body={carp.school_of_brotherhood} />}
        {carp.final_cast_off && <CarpSection title="Final Cast-Off" body={carp.final_cast_off} />}
        <div className="carp-authors">— {carp.authors}</div>
      </div>
    </div>
  );
}

function CarpSection({ title, sub, body }) {
  return (
    <div className="carp-section">
      <div className="carp-section-title">{title}</div>
      {sub && <div className="carp-section-sub">{sub}</div>}
      <div className="carp-section-body">{body}</div>
    </div>
  );
}

function NewsOverlay({ item, onClose }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="overlay-card">
        <div className="overlay-header">
          <div className="overlay-title">{item.title}</div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </div>
        {item.image_url && <img src={item.image_url} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />}
        <div style={{ padding: "14px 12px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Posted by: <span style={{ color: "#FFFFFF" }}>{item.officer_name}</span></div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>{item.description}</div>
        </div>
      </div>
    </div>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────
function PostModal({ onClose, onSubmit, pikeName, officerRole }) {
  const [newsType, setNewsType] = useState("general");
  const [form, setForm] = useState({ title: "", officerName: officerRole?.label || pikeName, description: "", image: null, date: "", weekLabel: "", dailyCatch: "", hookOfWisdom: "", makingWaves: "", pikeOfWeek: "", schoolOfBrotherhood: "", finalCastOff: "" });
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-wrap" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
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
            <div className="field"><div className="label">Chronicle Date</div><input className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="field"><div className="label">Week Label (e.g. Mar 30)</div><input className="input" value={form.weekLabel} onChange={e => setForm(f => ({ ...f, weekLabel: e.target.value }))} /></div>
            <div className="field"><div className="label">Cover Image</div><input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleFile} /><button className="btn" onClick={() => fileRef.current?.click()}>{form.image ? "✓ Selected" : "Choose Image"}</button></div>
            <div className="field"><div className="label">The Daily Catch</div><textarea className="input" value={form.dailyCatch} onChange={e => setForm(f => ({ ...f, dailyCatch: e.target.value }))} /></div>
            <div className="field"><div className="label">Hook of Wisdom</div><textarea className="input" value={form.hookOfWisdom} onChange={e => setForm(f => ({ ...f, hookOfWisdom: e.target.value }))} /></div>
            <div className="field"><div className="label">Making Waves</div><textarea className="input" value={form.makingWaves} onChange={e => setForm(f => ({ ...f, makingWaves: e.target.value }))} /></div>
            <div className="field"><div className="label">Pike of the Week</div><input className="input" value={form.pikeOfWeek} onChange={e => setForm(f => ({ ...f, pikeOfWeek: e.target.value }))} /></div>
            <div className="field"><div className="label">School of Brotherhood</div><textarea className="input" value={form.schoolOfBrotherhood} onChange={e => setForm(f => ({ ...f, schoolOfBrotherhood: e.target.value }))} /></div>
            <div className="field"><div className="label">Final Cast-Off</div><textarea className="input" value={form.finalCastOff} onChange={e => setForm(f => ({ ...f, finalCastOff: e.target.value }))} /></div>
            <div className="field"><div className="label">Author(s)</div><input className="input" value={form.officerName} onChange={e => setForm(f => ({ ...f, officerName: e.target.value }))} /></div>
          </>
        ) : (
          <>
            <div className="field"><div className="label">Title</div><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="field"><div className="label">Officer Name</div><input className="input" value={form.officerName} onChange={e => setForm(f => ({ ...f, officerName: e.target.value }))} /></div>
            <div className="field"><div className="label">Description</div><textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="field"><div className="label">Cover Photo</div><input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleFile} /><button className="btn" onClick={() => fileRef.current?.click()}>{form.image ? "✓ Selected" : "Choose Photo"}</button></div>
          </>
        )}
        <button className="btn primary" onClick={() => onSubmit({ ...form, newsType })}>Publish</button>
      </div>
    </div>
  );
}

function PrayerModal({ onClose, onSubmit, pikeName }) {
  const [req, setReq] = useState("");
  return (
    <div className="modal-wrap" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Submit Prayer Request</div>
        <div className="field"><div className="label">Pike Name</div><input className="input" value={pikeName} readOnly /></div>
        <div className="field"><div className="label">Prayer Request</div><textarea className="input" style={{ minHeight: 100 }} value={req} onChange={e => setReq(e.target.value)} placeholder="Share your prayer request with your brothers..." /></div>
        <button className="btn primary" onClick={() => req.trim() && onSubmit(req)}>Submit</button>
      </div>
    </div>
  );
}

function EventModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "", description: "", mandatory: false });
  return (
    <div className="modal-wrap" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Add Event to Calendar</div>
        <div className="field"><div className="label">Event Title</div><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div className="field"><div className="label">Date (e.g. Apr 15, 2026)</div><input className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
        <div className="field"><div className="label">Time</div><input className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="e.g. 7:00 PM" /></div>
        <div className="field"><div className="label">Location</div><input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
        <div className="field"><div className="label">Description</div><textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div className="field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="mandatory" checked={form.mandatory} onChange={e => setForm(f => ({ ...f, mandatory: e.target.checked }))} />
          <label htmlFor="mandatory" style={{ color: "#FFFFFF", fontSize: 14 }}>Mandatory event</label>
        </div>
        <button className="btn primary" onClick={() => form.title && form.date && onSubmit(form)}>Add to Calendar</button>
      </div>
    </div>
  );
}

// ── Avatar Cropper ─────────────────────────────────────────────────────
function AvatarCropper({ src, onSave, onCancel }) {
  const canvasRef = useRef();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPt, setStartPt] = useState(null);
  const [startOffset, setStartOffset] = useState(null);
  const imgRef = useRef(new Image());
  const SIZE = 260;

  useEffect(() => { imgRef.current.onload = () => draw(); imgRef.current.src = src; }, [src]);
  useEffect(() => { draw(); }, [offset, scale]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, SIZE / 2 - w / 2 + offset.x, SIZE / 2 - h / 2 + offset.y, w, h);
    ctx.restore();
  }

  function getPos(e) {
    const touch = e.touches ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function onDown(e) { e.preventDefault(); setDragging(true); setStartPt(getPos(e)); setStartOffset({ ...offset }); }
  function onMove(e) { if (!dragging) return; e.preventDefault(); const p = getPos(e); setOffset({ x: startOffset.x + p.x - startPt.x, y: startOffset.y + p.y - startPt.y }); }
  function onUp() { setDragging(false); }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>Drag to adjust photo</div>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{ borderRadius: "50%", cursor: "grab", touchAction: "none", border: "3px solid rgba(255,255,255,0.3)" }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: SIZE }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Zoom</span>
        <input type="range" min="0.3" max="3" step="0.01" value={scale} onChange={e => { setScale(parseFloat(e.target.value)); draw(); }} style={{ flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: SIZE }}>
        <button className="btn" style={{ flex: 1, marginBottom: 0 }} onClick={onCancel}>Cancel</button>
        <button className="btn primary" style={{ flex: 1, marginBottom: 0 }} onClick={() => onSave(canvasRef.current.toDataURL("image/jpeg", 0.9))}>Save Photo</button>
      </div>
    </div>
  );
}