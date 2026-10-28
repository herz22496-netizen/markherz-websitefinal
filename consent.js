/* Consentement aux témoins, markherz.ca (Loi 25).
   Rien ne se charge avant un oui : Google Analytics 4 et le pixel Meta attendent le clic « Accepter ».
   Les identifiants viennent de window.MH_TRACK = {ga, px}, injecté par gen.py seulement s'ils existent.
   Choix gardé dans localStorage « mh_consent » = {v, ok, t} ; redemandé après 6 mois ou si V change. */
(function () {
  var T = window.MH_TRACK || {};
  if (!T.ga && !T.px) return;
  var V = 1, KEY = "mh_consent", MAX = 182 * 864e5;
  var en = (document.documentElement.lang || "fr").slice(0, 2) === "en";
  var L = en
    ? { txt: "This site uses cookies (Google Analytics, Meta) to measure visits and improve ads, only if you agree.",
        ok: "Accept", no: "Refuse", more: "Privacy policy", href: "/en/privacy/" }
    : { txt: "Ce site utilise des témoins (Google Analytics, Meta) pour mesurer les visites et améliorer la publicité, seulement si vous acceptez.",
        ok: "Accepter", no: "Refuser", more: "Politique de confidentialité", href: "/confidentialite/" };

  var lire = function () {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && c.v === V && Date.now() - c.t < MAX) return c;
    } catch (e) {}
    return null;
  };
  var ecrire = function (ok) { try { localStorage.setItem(KEY, JSON.stringify({ v: V, ok: ok, t: Date.now() })); } catch (e) {} };

  var charge = false;
  var charger = function () {
    if (charge) return; charge = true;
    if (T.ga) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      gtag("consent", "default", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
      gtag("js", new Date());
      gtag("config", T.ga);
      var s = document.createElement("script"); s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(T.ga);
      document.head.appendChild(s);
    }
    if (T.px) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", T.px);
      fbq("track", "PageView");
    }
  };

  // Retrait du consentement : on efface les témoins posés puis on recharge, pour que plus rien ne tourne.
  var effacer = function () {
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (/^(_ga|_gid|_gat|_fbp|_fbc)/.test(n)) {
        ["", "; domain=.markherz.ca", "; domain=www.markherz.ca"].forEach(function (d) {
          document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  };

  // Conversions : envoyées seulement si le visiteur a accepté.
  window.mhTrack = function (nom, info) {
    if (!charge) return;
    if (nom === "booking") {
      if (window.gtag) gtag("event", "generate_lead", { method: "cal" });
      if (window.fbq) fbq("track", "Schedule");
    } else if (nom === "contact") {
      if (window.gtag) gtag("event", "contact", { method: info || "" });
      if (window.fbq) fbq("track", "Contact");
    }
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (a) window.mhTrack("contact", a.getAttribute("href").slice(0, 3) === "tel" ? "tel" : "email");
  });

  var css = "#mh-consent{position:fixed;left:0;right:0;bottom:0;z-index:80;background:var(--paper,#fff);color:var(--ink,#0a0a0a);border-top:var(--rule,1px solid #0a0a0a);font-family:var(--font,sans-serif);padding:16px max(16px,env(safe-area-inset-left)) calc(16px + env(safe-area-inset-bottom,0px))}" +
    "#mh-consent .mhc{max-width:1320px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:12px 24px}" +
    "#mh-consent p{flex:1 1 320px;margin:0;font-size:15px;line-height:1.45}" +
    "#mh-consent p a{color:inherit}" +
    "#mh-consent .mhc__b{display:flex;gap:12px;flex:0 0 auto}" +
    "#mh-consent button{min-height:48px;min-width:120px;padding:0 20px;border:var(--rule,1px solid #0a0a0a);background:var(--paper,#fff);color:var(--ink,#0a0a0a);font:800 12px/1 var(--font,sans-serif);letter-spacing:.14em;text-transform:uppercase;cursor:pointer}" +
    "#mh-consent button:hover{background:var(--signal,#e3dccb)}" +
    "@media(max-width:560px){#mh-consent .mhc__b{width:100%}#mh-consent button{flex:1}}";

  var banniere = function () {
    if (document.getElementById("mh-consent")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement("div");
    d.id = "mh-consent"; d.setAttribute("role", "dialog"); d.setAttribute("aria-live", "polite");
    d.setAttribute("aria-label", en ? "Cookie consent" : "Consentement aux témoins");
    d.innerHTML = '<div class="mhc"><p>' + L.txt + ' <a href="' + L.href + '">' + L.more + '</a></p>' +
      '<div class="mhc__b"><button type="button" data-r="0">' + L.no + '</button><button type="button" data-r="1">' + L.ok + '</button></div></div>';
    d.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var ok = b.getAttribute("data-r") === "1", avant = lire();
      ecrire(ok); d.remove();
      if (ok) charger();
      else if (charge || (avant && avant.ok)) { effacer(); location.reload(); }
    });
    document.body.appendChild(d);
  };

  // Lien « Paramètres des témoins » du pied de page.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-mh-consent]");
    if (a) { e.preventDefault(); banniere(); }
  });

  var c = lire();
  if (c && c.ok) charger();
  else if (!c) {
    if (document.body) banniere(); else document.addEventListener("DOMContentLoaded", banniere);
  }
})();
