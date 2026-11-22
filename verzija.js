// Podaci o verzijama iz GitHub Releases (SP-VOJVODIC/public).
// Koriste ga index.html u public i na sp-vojvodic.github.io.
// Za preuzimanje se nudi samo zadnja verzija (azuriranje je kumulativno);
// istorija prikazuje samo novosti, bez paketa.
(function () {
  function el(id) { return document.getElementById(id); }
  function postavi(id, tekst) { var e = el(id); if (e) e.textContent = tekst; }

  // tag 26.11.22.1.904 / naziv "Knjigovodstvo 26.11.22.1-904" -> "26.11.22.1" + baza 904
  function verzija(rel) {
    var m = /(\d+\.\d+\.\d+\.\d+)[.-](\d+)/.exec((rel.name || "") + " " + (rel.tag_name || ""));
    return m ? { program: m[1], baza: m[2] } : { program: rel.tag_name || "", baza: "" };
  }
  function datum(rel) {
    return rel.published_at ? new Date(rel.published_at).toLocaleDateString("sr-Latn-BA") : "";
  }
  function stavke(rel) {
    return (rel.body || "").split(/\r?\n/).map(function (red) {
      var t = red.replace(/^\s*[-*]\s+/, "").trim();
      return t !== red.trim() ? t : "";
    }).filter(function (t) { return t; });
  }
  function lista(stavkeNiz) {
    var ul = document.createElement("ul");
    stavkeNiz.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    return ul;
  }

  fetch("https://api.github.com/repos/SP-VOJVODIC/public/releases?per_page=100", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (releases) {
      releases = releases.filter(function (r) { return !r.draft && !r.prerelease; });
      if (!releases.length) throw new Error("nema verzija");
      var zadnja = releases[0];

      var v = verzija(zadnja), d = datum(zadnja);
      postavi("latest-version", v.program || "Dostupno");
      postavi("latest-date", (d ? "Objavljeno " + d : "") + (v.baza ? (d ? " · " : "") + "baza " + v.baza : ""));

      (zadnja.assets || []).forEach(function (a) {
        if (/\.upg$/i.test(a.name)) {
          ["btn-download", "link-download"].forEach(function (id) { if (el(id)) el(id).href = a.browser_download_url; });
        }
        if (/^Novosti.*\.pdf$/i.test(a.name) && el("latest-novosti")) el("latest-novosti").href = a.browser_download_url;
      });

      var ul = el("notes"), s = stavke(zadnja);
      if (ul && s.length) {
        s.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
        if (el("notes-section")) el("notes-section").hidden = false;
      }

      var ist = el("istorija-lista");
      if (ist) {
        releases.forEach(function (rel, i) {
          var st = stavke(rel);
          if (!st.length) return;
          var rv = verzija(rel), rd = datum(rel);
          var det = document.createElement("details");
          if (i === 0) det.open = true;
          var sum = document.createElement("summary");
          sum.textContent = "Verzija " + (rv.program || rel.tag_name) + (rv.baza ? " (baza " + rv.baza + ")" : "") + (rd ? " – " + rd : "");
          det.appendChild(sum);
          det.appendChild(lista(st));
          ist.appendChild(det);
        });
        if (ist.children.length && el("istorija")) el("istorija").hidden = false;
      }
    })
    .catch(function () {
      postavi("latest-version", "Nedostupno");
      postavi("latest-date", "Podaci o verziji trenutno nisu dostupni.");
    });
})();
