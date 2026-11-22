// Podaci o zadnjoj verziji iz GitHub Releases (SP-VOJVODIC/public).
// Koriste ga index.html u public i na sp-vojvodic.github.io.
(function () {
  function el(id) { return document.getElementById(id); }
  function postavi(id, tekst) { var e = el(id); if (e) e.textContent = tekst; }

  // tag 26.11.22.1.904 / naziv "Knjigovodstvo 26.11.22.1-904" -> "26.11.22.1" + baza 904
  function verzija(rel) {
    var m = /(\d+\.\d+\.\d+\.\d+)[.-](\d+)/.exec((rel.name || "") + " " + (rel.tag_name || ""));
    return m ? { program: m[1], baza: m[2] } : { program: rel.tag_name || "Dostupno", baza: "" };
  }

  fetch("https://api.github.com/repos/SP-VOJVODIC/public/releases/latest", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (rel) {
      var v = verzija(rel);
      postavi("latest-version", v.program);
      var d = rel.published_at ? new Date(rel.published_at).toLocaleDateString("sr-Latn-BA") : "";
      postavi("latest-date", (d ? "Objavljeno " + d : "") + (v.baza ? (d ? " · " : "") + "baza " + v.baza : ""));

      (rel.assets || []).forEach(function (a) {
        if (/\.upg$/i.test(a.name) && el("btn-download")) el("btn-download").href = a.browser_download_url;
        if (/^Novosti.*\.pdf$/i.test(a.name) && el("latest-novosti")) el("latest-novosti").href = a.browser_download_url;
      });

      var ul = el("notes");
      if (ul && rel.body) {
        rel.body.split(/\r?\n/).forEach(function (red) {
          var t = red.replace(/^\s*[-*]\s+/, "").trim();
          if (t && t !== red.trim()) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); }
        });
        if (ul.children.length && el("notes-section")) el("notes-section").hidden = false;
      }
    })
    .catch(function () {
      postavi("latest-version", "Pogledaj verzije");
      postavi("latest-date", "Podaci o verziji trenutno nisu dostupni.");
    });
})();
