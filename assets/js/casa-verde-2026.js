(function () {
  "use strict";

  var LANG = (document.documentElement.lang || "ro").slice(0, 2);
  var SOURCE = "casa-verde-2026";
  var FEATURES = (document.body.getAttribute("data-features") || "").split(/\s+/);

  function on(name) {
    return FEATURES.indexOf(name) !== -1;
  }

  var STR = {
    hu: {
      thousands: "\u00a0",
      lei: "lej",
      idle: "Válaszolj mind az 5 kérdésre ({n}/5), és megmondjuk, mire számíthatsz.",
      ok: "Jó hír: a válaszaid alapján valószínűleg megfelelsz a fő feltételeknek. A végleges jogosultságot az AFM bírálja el.",
      maybe: "Néhány pontnál bizonytalan vagy, ez nem jelent kizárást. Hívj vagy írj, és közösen tisztázzuk, mit kell rendezni.",
      minKwh: "A jogosultsághoz legalább 10 kWh tárolókapacitás szükséges.",
      noFin: "Add meg a kért támogatás összegét.",
      finCapped: "A támogatás nem haladhatja meg a projekt értékének 75%-át, és a 15 000 lejt sem. {own} lej önerőnél a maximum {max} lej, a számítás ezt az összeget használja.",
      capMissing: "Még {n} kWh hiányzik a 15 kWh-hoz, vagyis a maximális kapacitáspontszámhoz.",
      priorTip: "Korábbi tárolós támogatás miatt 0 pont jár a 25-ből.",
      ownFull: "Az önerő-pontszám maximális.",
      ownA: "Csökkentsd a támogatást {x} lejre, és tartsd meg a jelenlegi önerőt.",
      ownB: "Vagy tartsd meg a {fin} lej támogatást, és emeld az önerőt {x} lejre.",
      ownHalf: "Emeld az önerőt legalább {x} lejre (a projekt értékének fele), így a támogatás nem lesz nagyobb az önerőnél, és megkapod a maximális 35 pontot.",
      full: "Ezzel a tervvel a maximális 100 pontot éred el!",
      overCap: "A projekt értéke ({v} lej) meghaladja a {kwh} kWh-ra számolt elszámolható felső határt ({c} lej). A felette lévő összeg nem elszámolható, saját forrásból fizetendő.",
      mailSubject: "Casa Verde akkumulátor 2026 ajánlatkérés",
      mailBody: "Üdvözlöm!\n\nAjánlatot kérek a kiválasztott energiatároló rendszerre.\nModell: {model}\nTípus: {type}\nKapacitás: {kwh} kWh\nTájékoztató példaár: {price} lej\nÖnerő: {own} lej\nBecsült AFM-támogatás: {fin} lej\nBecsült pontszám: {score}/100\n\nNév:\nTelefonszám:\nTelepülés:\n"
    },
    ro: {
      thousands: ".",
      lei: "lei",
      idle: "Răspunde la toate cele 5 întrebări ({n}/5) și îți spunem la ce te poți aștepta.",
      ok: "Veste bună: după răspunsurile tale, probabil îndeplinești condițiile principale. Eligibilitatea finală este stabilită de AFM.",
      maybe: "Ești nesigur la unele puncte, dar asta nu înseamnă excludere. Sună-ne sau scrie-ne și clarificăm împreună ce trebuie rezolvat.",
      minKwh: "Pentru eligibilitate este necesară o capacitate de minimum 10 kWh.",
      noFin: "Introdu suma finanțării solicitate.",
      finCapped: "Finanțarea nu poate depăși 75% din valoarea proiectului și nici 15.000 lei. La o contribuție proprie de {own} lei, maximul admis este {max} lei, iar calculul folosește această sumă.",
      capMissing: "Îți mai lipsesc {n} kWh pentru a ajunge la 15 kWh și la punctajul maxim pentru capacitate.",
      priorTip: "Ai primit deja finanțare pentru stocare: 0 din 25 de puncte la acest criteriu.",
      ownFull: "Punctajul pentru contribuția proprie este maxim.",
      ownA: "Reduci finanțarea AFM la {x} lei, păstrând contribuția actuală.",
      ownB: "Sau păstrezi finanțarea de {fin} lei și crești contribuția proprie la {x} lei.",
      ownHalf: "Crește contribuția proprie la cel puțin {x} lei (jumătate din valoarea proiectului): finanțarea AFM nu mai depășește contribuția și primești maximul de 35 de puncte.",
      full: "Cu acest plan obții punctajul maxim de 100 de puncte!",
      overCap: "Valoarea proiectului ({v} lei) depășește plafonul eligibil calculat pentru {kwh} kWh ({c} lei). Suma care depășește plafonul nu este eligibilă și se suportă din surse proprii.",
      mailSubject: "Casa Verde Baterii 2026 - cerere de ofertă",
      mailBody: "Bună ziua!\n\nDoresc o ofertă pentru sistemul de stocare selectat.\nModel exemplu: {model}\nTip exemplu: {type}\nCapacitate: {kwh} kWh\nPreț exemplu, necomercial: {price} lei\nContribuție proprie: {own} lei\nFinanțare AFM estimată: {fin} lei\nPunctaj estimat: {score}/100\n\nNume:\nTelefon:\nLocalitate:\n"
    }
  };
  var T = STR[LANG] || STR.ro;
  var batteryOptions = document.querySelectorAll("[data-battery-option]");
  var selectedBattery = null;
  var selectedBatteryIndex = -1;
  var batteryImages = document.querySelectorAll(".battery-art img");
  for (var imageIndex = 0; imageIndex < batteryImages.length; imageIndex++) {
    batteryImages[imageIndex].addEventListener("error", function () { this.hidden = true; });
  }

  function fmt(value, decimals) {
    var n = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    var parts = n.toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, T.thousands);
    if (decimals) {
      parts[1] = parts[1].replace(/0+$/, "");
      if (!parts[1]) parts.pop();
    }
    return parts.join(",");
  }

  function fill(text, values) {
    return text.replace(/\{(\w+)\}/g, function (_, key) {
      return values[key];
    });
  }

  function num(input) {
    var v = parseFloat(String(input.value).replace(",", "."));
    return isFinite(v) && v > 0 ? v : 0;
  }

  /* Solar-Flux links carry the selected battery and current estimate. */
  var fluxState = null;
  function updateFluxLinks() {
    if (!on("flux")) return;
    var links = document.querySelectorAll("a[data-flux]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!a.dataset.fluxBase) a.dataset.fluxBase = a.getAttribute("href");
      var url = new URL(a.dataset.fluxBase, window.location.href);
      url.searchParams.set("lang", LANG);
      url.searchParams.set("source", SOURCE);
      if (fluxState) {
        url.searchParams.set("battery_kwh", fluxState.kwh);
        url.searchParams.set("own_contribution", fluxState.own);
        url.searchParams.set("financing_amount", fluxState.financing);
        url.searchParams.set("estimated_score", fluxState.score.toFixed(2));
      }
      if (selectedBattery) {
        var bType = selectedBattery.getAttribute("data-type") || "";
        var bPrice = Number(selectedBattery.getAttribute("data-price")) || 0;
        var bKwh = Number(selectedBattery.getAttribute("data-kwh")) || 0;
        var ipMatch = bType.match(/IP\s?(\d+)/i);
        url.searchParams.set("battery_model", selectedBattery.getAttribute("data-model"));
        url.searchParams.set("battery_type", bType);
        url.searchParams.set("battery_ip", ipMatch ? ipMatch[1] : "");
        url.searchParams.set("battery_kwh_nominal", String(bKwh));
        url.searchParams.set("battery_price_demo", String(bPrice));
        if (bKwh > 0) url.searchParams.set("battery_price_per_kwh", String(Math.round(bPrice / bKwh)));
      }
      var prior = document.querySelector("[data-prior-funding]");
      var anyPrior = false;
      var priors = document.querySelectorAll("[data-prior-funding]");
      for (var pk = 0; pk < priors.length; pk++) if (priors[pk].checked) anyPrior = true;
      url.searchParams.set("prior_battery_funding", anyPrior ? "1" : "0");
      if (prior) url.searchParams.set("page", LANG === "hu" ? "hu" : "ro");
      a.href = url.toString();
    }
  }

  /* Points calculator */
  var calc = on("calculator") ? document.getElementById("calc") : null;
  if (calc) {
    var inKwh = document.getElementById("calc-kwh");
    var inFin = document.getElementById("calc-fin");
    var inOwn = document.getElementById("calc-own");
    var ownValue = document.querySelector("[data-own-value]");
    var ownMax = document.querySelector("[data-own-max]");
    var ownMin = document.querySelector("[data-own-min]");
    var ownShare = document.querySelector("[data-own-share]");
    var selectedModel = document.querySelector("[data-selected-model]");
    var selectedType = document.querySelector("[data-selected-type]");
    var selectedPrice = document.querySelector("[data-selected-price]");
    var batteryScore = document.querySelector("[data-battery-score]");
    var tips = document.getElementById("calc-tips");
    var mailLinks = document.querySelectorAll("a[data-mailto]");
    var mailBases = [];
    for (var ml = 0; ml < mailLinks.length; ml++) mailBases.push(mailLinks[ml].getAttribute("href"));
    var out = {};
    var outs = calc.querySelectorAll("[data-out]");
    for (var o = 0; o < outs.length; o++) out[outs[o].getAttribute("data-out")] = outs[o];
    var bars = calc.querySelectorAll("[data-bar]");
    var priorBoxes = document.querySelectorAll("[data-prior-funding]");

    var addTip = function (text, cls) {
      var li = document.createElement("li");
      li.textContent = text;
      if (cls) li.className = cls;
      tips.appendChild(li);
    };

    var recalc = function () {
      var kwh = num(inKwh);
      var own = num(inOwn);
      if (selectedBattery) {
        var productPrice = Number(selectedBattery.getAttribute("data-price")) || 0;
        var requested = Math.max(0, Math.min(15000, productPrice * 0.75, productPrice - own));
        inFin.value = Math.floor(requested);
      }
      var fin = num(inFin);
      tips.innerHTML = "";

      var finMax = Math.min(15000, own * 3);
      var finEff = Math.min(fin, finMax);
      /* Ordin MMAP 2.314/2026 (MO 953/16.11.2026), art. 19 */
      var capPts = kwh >= 10 ? Math.min(40, 4 * kwh - 20) : 0;
      var ownPts = finEff > 0 ? Math.max(10, Math.min(35, 37.5 * own / finEff - 2.5)) : 0;
      var prior = false;
      for (var pb = 0; pb < priorBoxes.length; pb++) if (priorBoxes[pb].checked) prior = true;
      var priorPts = prior ? 0 : 25;
      var total = capPts + ownPts + priorPts;
      var project = own + finEff;
      var maxEligible = 1500 * kwh;

      out.score.textContent = fmt(total, 2);
      out.cap.textContent = fmt(capPts, 2);
      out.own.textContent = fmt(ownPts, 2);
      if (out.prior) out.prior.textContent = fmt(priorPts, 0);
      out.project.textContent = fmt(project, 0) + " " + T.lei;
      out.fin.textContent = fmt(finEff, 0) + " " + T.lei;
      out.max.textContent = fmt(maxEligible, 0) + " " + T.lei;
      out.share.textContent = project > 0 ? fmt(Math.floor((own / project) * 1000) / 10, 1) + "%" : "–";
      if (ownValue) ownValue.textContent = fmt(own, 0) + " " + T.lei;
      if (ownShare && selectedBattery) {
        var selectedPriceForShare = Number(selectedBattery.getAttribute("data-price")) || 0;
        ownShare.textContent = selectedPriceForShare > 0 ? fmt(Math.floor((own / selectedPriceForShare) * 1000) / 10, 1) + "%" : "–";
      }
      if (batteryScore) batteryScore.textContent = fmt(total, 2);

      for (var b = 0; b < bars.length; b++) {
        var kind = bars[b].getAttribute("data-bar");
        var val = kind === "total" ? total : kind === "cap" ? capPts : kind === "prior" ? priorPts : ownPts;
        var maxPts = kind === "total" ? 100 : kind === "cap" ? 40 : kind === "prior" ? 25 : 35;
        var pct = val / maxPts * 100;
        bars[b].style.width = Math.min(100, pct) + "%";
      }

      if (prior) addTip(T.priorTip, "is-warn");
      if (kwh > 0 && kwh < 10) addTip(T.minKwh, "is-warn");
      if (fin <= 0) addTip(T.noFin, "is-warn");
      if (fin > finMax && own > 0) addTip(fill(T.finCapped, { own: fmt(own, 0), max: fmt(finMax, 0) }), "is-warn");
      if (kwh >= 10 && project > maxEligible) {
        addTip(fill(T.overCap, { v: fmt(project, 0), kwh: fmt(kwh, 1), c: fmt(maxEligible, 0) }), "is-warn");
      }

      if (total >= 99.95) {
        addTip(T.full, "is-good");
      } else {
        if (kwh < 15) addTip(fill(T.capMissing, { n: fmt(15 - kwh, 1) }));
        if (finEff > 0 && own < finEff && selectedBattery) {
          var halfPrice = Number(selectedBattery.getAttribute("data-price")) || 0;
          addTip(fill(T.ownHalf, { x: fmt(Math.ceil(Math.max(halfPrice / 2, halfPrice - 15000) / 10) * 10, 0) }));
        } else if (finEff > 0 && own < finEff) {
          addTip(fill(T.ownA, { x: fmt(Math.floor(own), 0) }));
          addTip(fill(T.ownB, { fin: fmt(finEff, 0), x: fmt(Math.ceil(finEff), 0) }));
        } else if (finEff > 0) {
          addTip(T.ownFull, "is-good");
        }
      }

      fluxState = { kwh: kwh, own: own, financing: finEff, score: total };
      updateFluxLinks();

      if (mailLinks.length) {
        var model = selectedBattery ? selectedBattery.getAttribute("data-model") : "";
        var type = selectedBattery ? selectedBattery.getAttribute("data-type") : "";
        var price = selectedBattery ? fmt(Number(selectedBattery.getAttribute("data-price")) || 0, 0) : "";
        var body = fill(T.mailBody, { model: model, type: type, price: price, kwh: fmt(kwh, 1), own: fmt(own, 0), fin: fmt(finEff, 0), score: fmt(total, 2) });
        for (var ml = 0; ml < mailLinks.length; ml++) {
          mailLinks[ml].href = mailBases[ml].split("?")[0] + "?subject=" + encodeURIComponent(T.mailSubject) + "&body=" + encodeURIComponent(body);
        }
      }
    };

    var batteryStage = document.querySelector("[data-battery-stage]");
    var stepDistance = function () {
      if (!batteryStage) return 225;
      if (batteryStage.clientWidth < 500) return 116;
      if (batteryStage.clientWidth < 760) return 190;
      return 225;
    };
    var renderBatteryPositions = function (fraction) {
      var radiusX = batteryStage ? Math.min(batteryStage.clientWidth * 0.39, 390) : 260;
      var arcLift = batteryStage ? Math.min(batteryStage.clientHeight * 0.09, 58) : 48;
      for (var i = 0; i < batteryOptions.length; i++) {
        var offset = i - selectedBatteryIndex + fraction;
        while (offset > batteryOptions.length / 2) offset -= batteryOptions.length;
        while (offset < -batteryOptions.length / 2) offset += batteryOptions.length;
        var angle = offset * Math.PI * 2 / batteryOptions.length;
        var depth = Math.cos(angle);
        batteryOptions[i].style.setProperty("--card-x", (Math.sin(angle) * radiusX) + "px");
        batteryOptions[i].style.setProperty("--card-y", (32 - (1 - depth) * arcLift) + "px");
        batteryOptions[i].style.setProperty("--card-depth", (depth * 115) + "px");
        batteryOptions[i].style.setProperty("--card-scale", String(0.66 + (depth + 1) * 0.17));
        batteryOptions[i].style.setProperty("--card-z", String(10 + Math.round(depth * 10)));
      }
    };

    var setBattery = function (index) {
      if (!batteryOptions.length) return;
      selectedBatteryIndex = (index + batteryOptions.length) % batteryOptions.length;
      selectedBattery = batteryOptions[selectedBatteryIndex];
      for (var i = 0; i < batteryOptions.length; i++) {
        batteryOptions[i].classList.toggle("is-active", i === selectedBatteryIndex);
        batteryOptions[i].setAttribute("aria-pressed", String(i === selectedBatteryIndex));
      }
      renderBatteryPositions(0);
      if (mobileRow && mobileRow.matches && typeof centerBattery === "function") centerBattery(selectedBatteryIndex);
      if (selectedModel) selectedModel.textContent = selectedBattery.getAttribute("data-model");
      if (selectedType) selectedType.textContent = selectedBattery.getAttribute("data-type");
      if (selectedPrice) selectedPrice.textContent = fmt(Number(selectedBattery.getAttribute("data-price")) || 0, 0) + " " + T.lei;

      if (inKwh && inOwn) {
        var price = Number(selectedBattery.getAttribute("data-price")) || 0;
        var minimumOwn = Math.ceil(Math.max(price * 0.25, price - 15000) / 10) * 10;
        var maximumOwn = Math.floor(price / 10) * 10;
        inKwh.value = selectedBattery.getAttribute("data-kwh");
        inOwn.min = minimumOwn;
        inOwn.max = maximumOwn;
        inOwn.value = minimumOwn;
        if (ownMin) ownMin.textContent = fmt(minimumOwn, 0) + " " + T.lei + " · 25%";
        if (ownMax) ownMax.textContent = fmt(maximumOwn, 0) + " " + T.lei + " · 100%";
      }
      recalc();
      updateFluxLinks();
    };

    var initialBattery = 0;
    for (var bi = 0; bi < batteryOptions.length; bi++) {
      if (batteryOptions[bi].classList.contains("is-active")) initialBattery = bi;
      batteryOptions[bi].addEventListener("click", function (event) {
        setBattery(Array.prototype.indexOf.call(batteryOptions, event.currentTarget));
      });
    }
    var mobileRow = window.matchMedia("(max-width:599px)");
    var batteryRing = batteryStage ? batteryStage.querySelector(".battery-ring") : null;
    var centerBattery = function (i) {
      if (!batteryRing || !batteryOptions[i]) return;
      var el = batteryOptions[i];
      batteryRing.scrollTo({ left: el.offsetLeft - (batteryRing.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
    };
    if (mobileRow.matches && batteryRing && batteryOptions.length) {
      // plain swipe row: the card nearest the centre becomes the selected one
      var rowTimer = null;
      batteryRing.addEventListener("scroll", function () {
        clearTimeout(rowTimer);
        rowTimer = setTimeout(function () {
          var mid = batteryRing.scrollLeft + batteryRing.clientWidth / 2;
          var best = 0, bestD = Infinity;
          for (var k = 0; k < batteryOptions.length; k++) {
            var d = Math.abs(batteryOptions[k].offsetLeft + batteryOptions[k].offsetWidth / 2 - mid);
            if (d < bestD) { bestD = d; best = k; }
          }
          if (best !== selectedBatteryIndex) setBattery(best);
        }, 160);
      }, { passive: true });
    }
    if (batteryOptions.length) setBattery(initialBattery);
    if (mobileRow.matches && batteryOptions.length) window.setTimeout(function () { centerBattery(selectedBatteryIndex); }, 80);
    var relayoutBattery = function () {
      if (!batteryOptions.length) return;
      renderBatteryPositions(0);
      if (mobileRow.matches) centerBattery(selectedBatteryIndex);
    };
    window.addEventListener("load", relayoutBattery);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayoutBattery);
    var relayoutTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(relayoutTimer);
      relayoutTimer = setTimeout(relayoutBattery, 120);
    });

    var dragStart = null;
    var suppressBatteryClick = false;
    if (batteryStage && batteryOptions.length) {
      batteryStage.addEventListener("dragstart", function (event) { event.preventDefault(); });
      batteryStage.addEventListener("pointerdown", function (event) {
        if (mobileRow.matches) return;
        dragStart = { x: event.clientX };
        batteryStage.classList.add("is-dragging");
        batteryStage.setPointerCapture(event.pointerId);
      });
      batteryStage.addEventListener("pointermove", function (event) {
        if (!dragStart) return;
        var delta = event.clientX - dragStart.x;
        if (Math.abs(delta) > Math.max(18, stepDistance() * 0.12)) suppressBatteryClick = true;
        renderBatteryPositions(delta / stepDistance());
      });
      batteryStage.addEventListener("pointerup", function (event) {
        if (!dragStart) return;
        var delta = event.clientX - dragStart.x;
        dragStart = null;
        batteryStage.classList.remove("is-dragging");
        var dragThreshold = Math.max(18, stepDistance() * 0.12);
        var dragSteps = Math.max(1, Math.round(Math.abs(delta) / stepDistance()));
        var movement = Math.abs(delta) < dragThreshold ? 0 : (delta < 0 ? dragSteps : -dragSteps);
        if (movement) suppressBatteryClick = true;
        setBattery(selectedBatteryIndex + movement);
        window.setTimeout(function () { suppressBatteryClick = false; }, 500);
      });
      batteryStage.addEventListener("pointercancel", function () {
        dragStart = null;
        batteryStage.classList.remove("is-dragging");
        renderBatteryPositions(0);
      });
      batteryStage.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") { event.preventDefault(); setBattery(selectedBatteryIndex + 1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); setBattery(selectedBatteryIndex - 1); }
      });
      var previous = document.querySelector("[data-battery-prev]");
      var next = document.querySelector("[data-battery-next]");
      if (previous) previous.addEventListener("click", function () { setBattery(selectedBatteryIndex - 1); });
      if (next) next.addEventListener("click", function () { setBattery(selectedBatteryIndex + 1); });
    }

    calc.addEventListener("input", function () {
      recalc();
    });
    inOwn.addEventListener("input", function () {
      recalc();
    });
    calc.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    var presets = calc.querySelectorAll("[data-preset]");
    var applyPreset = function (btn) {
      inKwh.value = btn.getAttribute("data-kwh");
      inFin.value = btn.getAttribute("data-fin");
      inOwn.value = btn.getAttribute("data-own");
      for (var bi = 0; bi < batteryOptions.length; bi++) {
        if (Number(batteryOptions[bi].getAttribute("data-kwh")) === Number(inKwh.value)) {
          setBattery(bi);
          inOwn.value = Math.max(Number(inOwn.min), Math.min(Number(inOwn.max), Number(btn.getAttribute("data-own"))));
          break;
        }
      }
      for (var p = 0; p < presets.length; p++) presets[p].setAttribute("aria-pressed", String(presets[p] === btn));
      recalc();
    };
    for (var p = 0; p < presets.length; p++) {
      presets[p].addEventListener("click", function (event) {
        applyPreset(event.currentTarget);
      });
    }
    for (var pbi = 0; pbi < priorBoxes.length; pbi++) priorBoxes[pbi].addEventListener("change", recalc);
    recalc();
  }

  for (var bo = 0; bo < batteryOptions.length; bo++) {
    batteryOptions[bo].addEventListener("click", function (event) {
      if (!suppressBatteryClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  /* Eligibility quick check */
  var check = on("eligibility") ? document.getElementById("eligibility") : null;
  if (check) {
    var result = document.getElementById("check-result");
    var evaluate = function () {
      var groups = check.querySelectorAll("fieldset");
      var answered = 0;
      var yes = 0;
      for (var g = 0; g < groups.length; g++) {
        var picked = groups[g].querySelector("input:checked");
        if (picked) {
          answered++;
          if (picked.value === "1") yes++;
        }
      }
      var state = "idle";
      var text = fill(T.idle, { n: answered });
      if (answered === groups.length) {
        state = yes === groups.length ? "ok" : "maybe";
        text = T[state];
      }
      result.setAttribute("data-state", state);
      result.textContent = text;
    };
    check.addEventListener("change", evaluate);
    evaluate();
  }

  /* Countdown */
  var cd = on("countdown") ? document.querySelector(".countdown") : null;
  if (cd) {
    var start = Date.parse(cd.getAttribute("data-start"));
    var end = Date.parse(cd.getAttribute("data-end"));
    var title = cd.querySelector(".countdown-title");
    var cells = {
      d: cd.querySelector("[data-cd='d']"),
      h: cd.querySelector("[data-cd='h']"),
      m: cd.querySelector("[data-cd='m']"),
      s: cd.querySelector("[data-cd='s']")
    };
    var two = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    var tick = function () {
      var now = Date.now();
      var target = now < start ? start : end;
      if (now >= end) {
        cd.hidden = true;
        return false;
      }
      title.textContent = cd.getAttribute(now < start ? "data-t-before" : "data-t-during");
      var left = Math.max(0, Math.floor((target - now) / 1000));
      cells.d.textContent = Math.floor(left / 86400);
      cells.h.textContent = two(Math.floor((left % 86400) / 3600));
      cells.m.textContent = two(Math.floor((left % 3600) / 60));
      cells.s.textContent = two(left % 60);
      cd.hidden = false;
      return true;
    };
    if (tick()) {
      var timer = setInterval(function () {
        if (!tick()) clearInterval(timer);
      }, 1000);
    }
  }

  updateFluxLinks();
  /* Portfolio carousel: endless loop. Cards are cloned once at the end; when the
     scroll position passes one full set, it jumps back by one set (same content, no visible jump). */
  var refCarousels = document.querySelectorAll("[data-carousel]");
  for (var rc = 0; rc < refCarousels.length; rc++) {
    (function (root) {
      var track = root.querySelector("[data-carousel-track]");
      if (!track) return;
      var originals = track.querySelectorAll(".ref-card");
      var count = originals.length;
      if (!count) return;
      for (var k = 0; k < count; k++) {
        var clone = originals[k].cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
      var setWidth = function () {
        var all = track.querySelectorAll(".ref-card");
        return all[count].offsetLeft - all[0].offsetLeft;
      };
      var stepWidth = function () {
        return track.querySelector(".ref-card").getBoundingClientRect().width + 18;
      };
      var wrap = function () {
        var sw = setWidth();
        if (track.scrollLeft >= sw) track.scrollLeft -= sw;
        else if (track.scrollLeft < 1) track.scrollLeft += sw;
      };
      var timer = null;
      track.addEventListener("scroll", function () {
        clearTimeout(timer);
        timer = setTimeout(wrap, 160);
      }, { passive: true });
      var stepBy = function (dir) {
        var sw = setWidth();
        if (dir > 0 && track.scrollLeft >= sw) track.scrollLeft -= sw;
        if (dir < 0 && track.scrollLeft < stepWidth()) track.scrollLeft += sw;
        track.scrollBy({ left: dir * stepWidth(), behavior: "smooth" });
      };
      var prevBtn = root.querySelector("[data-carousel-prev]");
      var nextBtn = root.querySelector("[data-carousel-next]");
      if (prevBtn) prevBtn.addEventListener("click", function () { stepBy(-1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { stepBy(1); });
    })(refCarousels[rc]);
  }
})();
