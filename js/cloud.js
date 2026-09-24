/* N PROJECT Cloud Sync (Supabase) */
(() => {
  "use strict";
  const SUPABASE_URL = "https://unpxyadahrbfexpscxem.supabase.co";
  const SUPABASE_KEY = "sb_publishable_39NfQhEcRazdG8ka2vGqXA_7JRQkFKQ";
  const TABLE = "n_project_user_data";
  const KEYS = ["n-project-data", "nProjectLifeOS", "n-project-memories", "n-project-memory-albums"];
  let client = null, user = null, syncEnabled = false, syncTimer = null, syncing = false;
  const originalSet = localStorage.setItem.bind(localStorage);
  const originalRemove = localStorage.removeItem.bind(localStorage);

  function snapshot() {
    const result = {};
    KEYS.forEach(key => { const value = localStorage.getItem(key); if (value !== null) result[key] = value; });
    return result;
  }
  function restore(data) {
    KEYS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(data || {}, key) && typeof data[key] === "string") originalSet(key, data[key]);
    });
  }
  function status(message, bad = false) {
    const el = document.getElementById("np-cloud-status");
    if (el) { el.textContent = message; el.style.color = bad ? "#ff8b8b" : "#8ee6b4"; }
  }
  async function push() {
    if (!client || !user || !syncEnabled || syncing) return;
    syncing = true;
    try {
      const { error } = await client.from(TABLE).upsert({ user_id: user.id, app_data: snapshot(), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      status("Cloud tersinkronisasi · " + new Date().toLocaleTimeString());
    } catch (e) { status("Gagal sync: " + (e.message || "periksa koneksi"), true); }
    finally { syncing = false; }
  }
  function schedulePush() {
    if (!syncEnabled) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(push, 900);
  }
  localStorage.setItem = function(key, value) { originalSet(key, value); if (KEYS.includes(String(key))) schedulePush(); };
  localStorage.removeItem = function(key) { originalRemove(key); if (KEYS.includes(String(key))) schedulePush(); };

  function makePanel() {
    if (document.getElementById("np-cloud-panel")) return;
    const style = document.createElement("style");
    style.textContent = `#np-cloud-panel{position:fixed;z-index:99999;right:12px;bottom:82px;width:min(340px,calc(100vw - 24px));background:#17191f;color:#f4f5f7;border:1px solid #383d48;border-radius:16px;padding:16px;box-shadow:0 12px 40px #0008;font:14px/1.45 system-ui,sans-serif}#np-cloud-panel h3{margin:0 0 8px;font-size:16px}#np-cloud-panel p{margin:6px 0 12px;color:#b9bfcb}#np-cloud-panel input{box-sizing:border-box;width:100%;margin:5px 0;padding:10px;border:1px solid #454b58;border-radius:8px;background:#0f1116;color:#fff}#np-cloud-panel button{border:0;border-radius:8px;padding:10px 12px;margin:5px 4px 0 0;background:#3ecf8e;color:#10251b;font-weight:650}#np-cloud-panel button.secondary{background:#303642;color:#f5f6fa}#np-cloud-status{font-size:12px;min-height:18px;margin-top:8px}#np-cloud-choices{display:none;margin-top:8px}`;
    document.head.appendChild(style);
    const panel = document.createElement("section"); panel.id = "np-cloud-panel";
    panel.innerHTML = `<h3>☁️ N PROJECT Cloud</h3><p>Masuk atau daftar akun untuk menyimpan data aplikasi ke cloud.</p><form id="np-cloud-auth"><input id="np-cloud-email" type="email" autocomplete="email" placeholder="Email" required><input id="np-cloud-password" type="password" autocomplete="current-password" minlength="6" placeholder="Password (min. 6 karakter)" required><button type="submit">Masuk</button><button type="button" class="secondary" id="np-cloud-signup">Daftar</button></form><div id="np-cloud-choices"><p id="np-cloud-choice-text"></p><button type="button" id="np-cloud-use-local">Upload data perangkat</button><button type="button" class="secondary" id="np-cloud-use-cloud">Pulihkan data cloud</button></div><div><button type="button" class="secondary" id="np-cloud-refresh" style="display:none">Ambil data cloud</button><button type="button" class="secondary" id="np-cloud-logout" style="display:none">Keluar</button></div><div id="np-cloud-status" role="status">Belum masuk</div>`;
    document.body.appendChild(panel);
    document.getElementById("np-cloud-auth").addEventListener("submit", async ev => { ev.preventDefault(); await authenticate(false); });
    document.getElementById("np-cloud-signup").addEventListener("click", () => authenticate(true));
    document.getElementById("np-cloud-use-local").addEventListener("click", async () => { syncEnabled = true; await push(); showSignedIn(); });
    document.getElementById("np-cloud-use-cloud").addEventListener("click", async () => { await pull(true); syncEnabled = true; showSignedIn(); });
    document.getElementById("np-cloud-refresh").addEventListener("click", () => pull(true));
    document.getElementById("np-cloud-logout").addEventListener("click", async () => { syncEnabled = false; user = null; await client.auth.signOut(); document.getElementById("np-cloud-auth").style.display = "block"; document.getElementById("np-cloud-choices").style.display = "none"; document.getElementById("np-cloud-refresh").style.display = "none"; document.getElementById("np-cloud-logout").style.display = "none"; status("Sudah keluar dari akun cloud"); });
  }
  async function authenticate(signup) {
    const email = document.getElementById("np-cloud-email").value.trim();
    const password = document.getElementById("np-cloud-password").value;
    status(signup ? "Mendaftarkan akun…" : "Sedang masuk…");
    try {
      const result = signup ? await client.auth.signUp({ email, password }) : await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (signup && !result.data.session) { status("Pendaftaran diterima. Cek email untuk verifikasi, lalu masuk."); return; }
      user = result.data.user;
      await afterLogin();
    } catch (e) { status(e.message || "Autentikasi gagal", true); }
  }
  async function afterLogin() {
    const { data, error } = await client.from(TABLE).select("app_data,updated_at").eq("user_id", user.id).maybeSingle();
    if (error) { status("Tidak bisa membaca data cloud: " + error.message, true); return; }
    document.getElementById("np-cloud-auth").style.display = "none";
    document.getElementById("np-cloud-logout").style.display = "inline-block";
    if (!data) {
      document.getElementById("np-cloud-choices").style.display = "block";
      document.getElementById("np-cloud-choice-text").textContent = "Belum ada data cloud untuk akun ini. Upload data perangkat ini untuk memulai sinkronisasi.";
      document.getElementById("np-cloud-use-cloud").style.display = "none";
      status("Masuk berhasil · belum ada data cloud");
    } else {
      document.getElementById("np-cloud-choices").style.display = "block";
      document.getElementById("np-cloud-choice-text").textContent = "Data cloud ditemukan (pembaruan " + new Date(data.updated_at).toLocaleString() + "). Pilih sumber data. Pilihan akan menggantikan nilai lokal untuk empat kunci N PROJECT.";
      document.getElementById("np-cloud-use-cloud").style.display = "inline-block";
      status("Masuk berhasil · pilih cara sinkronisasi");
    }
  }
  async function pull(showMessage) {
    if (!client || !user) return;
    try {
      const { data, error } = await client.from(TABLE).select("app_data,updated_at").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) { status("Belum ada salinan cloud", true); return; }
      restore(data.app_data);
      if (showMessage) status("Data cloud dipulihkan · muat ulang halaman untuk memperbarui tampilan");
    } catch (e) { status("Gagal mengambil cloud: " + e.message, true); }
  }
  function showSignedIn() {
    document.getElementById("np-cloud-choices").style.display = "none";
    document.getElementById("np-cloud-refresh").style.display = "inline-block";
    document.getElementById("np-cloud-logout").style.display = "inline-block";
    status("Sinkronisasi aktif untuk akun ini");
  }
  async function init() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") { makePanel(); status("SDK Supabase gagal dimuat. Periksa koneksi internet.", true); return; }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    makePanel();
    const { data } = await client.auth.getSession();
    if (data.session) { user = data.session.user; await afterLogin(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
