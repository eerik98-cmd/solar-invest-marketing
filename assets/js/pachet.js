/* Pachet: baterie + schimbare invertor (#pachet). Calculul urmează regulile AFM din preview v132. */
(function () {
  var root = document.getElementById("pachet");
  if (!root) return;
  var LANG = document.documentElement.lang === "hu" ? "hu" : "ro";
  var nf = new Intl.NumberFormat(LANG === "hu" ? "hu-HU" : "ro-RO", { maximumFractionDigits: 0 });
  function fmt(n) { return nf.format(n) + " lei"; }
  function q(k) { return root.querySelector('[data-pk="' + k + '"]'); }
  var rows = Array.prototype.slice.call(root.querySelectorAll("tbody tr"));
  var btns = root.querySelectorAll(".pk-phase button");
  var active = rows[0];

  function update() {
    var d = active.dataset;
    var pkg = +d.total, batt = +d.batt, kwh = +d.kwh;
    var S = Math.min(Math.round(pkg / 2), Math.round(0.75 * batt), 15000);
    var prior = q("prior").checked;
    var score = Math.min(40, 4 * kwh - 20) + 35 + (prior ? 0 : 25);
    q("name").textContent = d.name;
    q("type").textContent = d.type;
    q("price").textContent = fmt(pkg);
    q("elig").textContent = fmt(batt);
    q("sup").textContent = fmt(S);
    q("battown").textContent = fmt(batt - S);
    q("nonelig").textContent = fmt(pkg - batt);
    q("own").textContent = fmt(pkg - S);
    q("score").textContent = score;
    root.querySelector(".pk-ring").style.background = "conic-gradient(var(--green) 0 " + score + "%,#dfe8d6 0)";
    var a = q("cta");
    if (!a.dataset.base) a.dataset.base = a.getAttribute("href");
    var u = new URL(a.dataset.base, window.location.href);
    u.searchParams.set("lang", LANG);
    u.searchParams.set("source", "casa-verde-2026");
    var model = (d.name.match(/SE-F\d+ Lite-O/) || [""])[0];
    u.searchParams.set("package", d.name);
    u.searchParams.set("package_price", pkg);
    u.searchParams.set("package_financing", S);
    u.searchParams.set("phase", d.phase);
    u.searchParams.set("inverter_kw", d.inv);
    u.searchParams.set("battery_model", "Deye " + model);
    u.searchParams.set("battery_type", "IP 21 · interior");
    u.searchParams.set("battery_kwh", kwh);
    u.searchParams.set("battery_kwh_nominal", kwh);
    u.searchParams.set("own_contribution", pkg - S);
    u.searchParams.set("financing_amount", S);
    u.searchParams.set("estimated_score", score);
    u.searchParams.set("prior_battery_funding", prior ? "1" : "0");
    a.href = u.toString();
  }

  function select(r) {
    active = r;
    rows.forEach(function (x) { x.classList.toggle("is-active", x === r); });
    update();
  }
  function showPhase(p) {
    btns.forEach(function (b) {
      var on = b.dataset.phase === p;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    rows.forEach(function (r) { r.hidden = r.dataset.phase !== p; });
    select(rows.filter(function (r) { return r.dataset.phase === p; })[0]);
  }
  btns.forEach(function (b) { b.addEventListener("click", function () { showPhase(b.dataset.phase); }); });
  rows.forEach(function (r) {
    r.addEventListener("click", function () { select(r); });
    r.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(r); } });
  });
  q("prior").addEventListener("change", update);
  showPhase("mono");
})();
