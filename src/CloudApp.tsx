import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import App from "./App";
import { ensureWeeklyReview, normalize, seed, validData, type Data } from "./model";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const client = url && key ? createClient(url, key) : null;
const owner = "navodit.sh06@gmail.com";
type Cache = { data: Data; revision: number; dirty: boolean };
type Remote = { state: Data; revision: number };
function empty(): Data {
  const d = seed();
  return ensureWeeklyReview({ ...d, tasks: [], projects: [], explorations: [], reviewed: "", reviewChecks: Array(6).fill(false) });
}

export default function CloudApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!client);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (!client) return;
    let alive = true;
    client.auth.getSession().then(({ data, error }) => { if (alive) { setSession(data.session); setMessage(error?.message ?? ""); setReady(true); } }).catch(() => { if (alive) { setMessage("Couldn’t restore your session. Please sign in again."); setReady(true); } });
    const { data } = client.auth.onAuthStateChange((_event, next) => { setSession(next); setReady(true); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  if (!client) return <App />;
  if (!ready) return <main className="auth-page"><p>Opening your workspace…</p></main>;
  if (session?.user.email?.toLowerCase() === owner) return <Workspace key={session.user.id} session={session} />;
  return <main className="auth-page"><section className="auth-card"><span className="eyebrow">A little space for clarity</span><h1>Navodit’s GTD</h1><p>Your tasks, practices, and curiosities. Together, wherever you are.</p><form onSubmit={async e => {
    e.preventDefault(); setSending(true); setMessage("");
    try {
      const { error } = await client!.auth.signInWithOtp({ email: owner, options: { emailRedirectTo: window.location.origin } });
      setMessage(error ? error.message : "Check your email for a sign-in link. Open it on this device to continue.");
    } catch { setMessage("Couldn’t connect. Check your internet connection and try again."); }
    finally { setSending(false); }
  }}><label className="field">Your email<input type="email" value={owner} readOnly autoComplete="email" /></label><button className="primary" disabled={sending}>{sending ? "Sending…" : "Email me a sign-in link"}</button></form><p role="status">{message}</p>{session && <button onClick={() => client!.auth.signOut()}>Sign out of this account</button>}<small>This is a private workspace.</small></section></main>;
}

function Workspace({ session }: { session: Session }) {
  const cacheKey = `navodit-cloud:${new URL(url).hostname}:${session.user.id}`;
  const [box, setBox] = useState<Cache>(() => {
    try { const saved = JSON.parse(localStorage.getItem(cacheKey) ?? "null"); if (saved && validData(saved.data) && Number.isSafeInteger(saved.revision) && saved.revision >= 0) return { ...saved, data: normalize(saved.data) }; } catch { /* Start empty; never mix another account’s cache. */ }
    return { data: empty(), revision: 0, dirty: false };
  });
  const current = useRef(box);
  const active = useRef(true);
  const busy = useRef(false);
  const [status, setStatus] = useState("Connecting to your workspace…");
  const [conflict, setConflict] = useState<Remote | null>(null);
  const conflictRef = useRef<Remote | null>(null);
  function commit(next: Cache) {
    current.current = next;
    try { localStorage.setItem(cacheKey, JSON.stringify(next)); } catch { setStatus("Device storage is full. Keep this page open and export a backup."); }
    setBox(next);
  }
  const setData: Dispatch<SetStateAction<Data>> = action => {
    const prior = current.current;
    commit({ ...prior, data: typeof action === "function" ? action(prior.data) : action, dirty: true });
    setStatus(navigator.onLine ? "Changes waiting to sync" : "Offline · changes saved on this device");
  };
  async function sync() {
    if (busy.current || conflictRef.current || !active.current) return;
    if (!navigator.onLine) { setStatus("Offline · changes saved on this device"); return; }
    busy.current = true;
    try {
      const { data: remote, error } = await client!.from("navodit_workspaces").select("state,revision").eq("user_id", session.user.id).maybeSingle();
      if (error) throw error;
      if (!active.current) return;
      if (remote && !validData(remote.state)) throw new Error("Cloud data needs a newer app version. Your device copy is safe.");
      const local = current.current;
      if (remote && remote.revision !== local.revision) {
        if (!local.dirty) { commit({ data: normalize(remote.state), revision: remote.revision, dirty: false }); setStatus("Saved to cloud"); return; }
        if (JSON.stringify(remote.state) === JSON.stringify(local.data)) { commit({ ...local, revision: remote.revision, dirty: false }); setStatus("Saved to cloud"); return; }
        localStorage.setItem(`${cacheKey}:recovery`, JSON.stringify({ local, remote, date: new Date().toISOString() }));
        conflictRef.current = remote; setConflict(remote); setStatus("Changes on two devices need your choice"); return;
      }
      if (!local.dirty && remote) { setStatus("Saved to cloud"); return; }
      if (!remote && local.revision !== 0) throw new Error("Cloud workspace is unavailable. Your device copy is safe; try again later.");
      const snapshot = local;
      const revision = snapshot.revision + 1;
      const query = snapshot.revision === 0
        ? client!.from("navodit_workspaces").insert({ user_id: session.user.id, state: snapshot.data, revision })
        : client!.from("navodit_workspaces").update({ state: snapshot.data, revision }).eq("user_id", session.user.id).eq("revision", snapshot.revision);
      const result = await query.select("revision").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) { setStatus("Another device saved changes. Sync again to resolve them."); return; }
      if (!active.current) return;
      const latest = current.current;
      commit({ ...latest, revision, dirty: latest.data !== snapshot.data });
      setStatus(latest.data === snapshot.data ? "Saved to cloud" : "Changes waiting to sync");
    } catch (error) { if (active.current) setStatus(`Not synced · ${error instanceof Error ? error.message : "Check your connection and try again"}`); }
    finally { busy.current = false; }
  }
  useEffect(() => {
    active.current = true;
    void sync();
    const tick = window.setInterval(() => void sync(), 15000);
    const wake = () => void sync();
    const offline = () => setStatus("Offline · changes saved on this device");
    window.addEventListener("online", wake); window.addEventListener("focus", wake); window.addEventListener("offline", offline);
    return () => { active.current = false; clearInterval(tick); window.removeEventListener("online", wake); window.removeEventListener("focus", wake); window.removeEventListener("offline", offline); };
  }, []);
  useEffect(() => { if (!box.dirty) return; const t = setTimeout(() => void sync(), 800); return () => clearTimeout(t); }, [box]);
  function backup() {
    const blob = new Blob([JSON.stringify(current.current.data, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "navodits-gtd-device-backup.json"; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  return <><App cloud={{ data: box.data, setData, status, sync: () => void sync(), signOut: () => { if (!current.current.dirty || window.confirm("Some changes haven’t reached the cloud. They will stay on this device for your next sign-in. Sign out?")) void client!.auth.signOut({ scope: "local" }); } }} />{conflict && <div className="cloud-conflict" role="dialog" aria-modal="true" aria-labelledby="conflict-title"><section className="auth-card"><h2 id="conflict-title">Two copies of your workspace</h2><p>This device and the cloud both have changes. Download a backup before choosing the copy to keep. Your choice replaces the other copy.</p><button onClick={backup}>Download this device’s backup</button><button onClick={() => { commit({ ...current.current, revision: conflict.revision, dirty: true }); conflictRef.current = null; setConflict(null); void sync(); }}>Keep this device’s copy</button><button onClick={() => { commit({ data: normalize(conflict.state), revision: conflict.revision, dirty: false }); conflictRef.current = null; setConflict(null); setStatus("Saved to cloud"); }}>Use cloud copy</button></section></div>}</>;
}
