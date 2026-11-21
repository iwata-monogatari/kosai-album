(function () {
  if (window.location.hostname !== 'kosaialb.atawi.link') return;
  if (window.__fujigaokaAnalyticsLoaded) return;
  var IGNORE_KEY = "fujigaokaAnalyticsIgnore";
  var INTERNAL_KEY = "fujigaokaAnalyticsInternal";
  var currentScript = document.currentScript || findCurrentScript();
  var siteId = currentScript ? currentScript.getAttribute("data-site") : "";
  if (!siteId) return;

  window.__fujigaokaAnalyticsLoaded = true;
  var endpointBase = 'https://fujigaoka-analytics-worker.hiroyukio0122.workers.dev';
  var path = window.location.pathname;
  var publicUrl = window.location.origin + path;
  var referringOrigin = '';
  try {
    var ref = new URL(document.referrer);
    if (ref.protocol === 'https:' || ref.protocol === 'http:') referringOrigin = ref.origin;
  } catch (_) {}

  applyIgnoreCommand();
  applyInternalCommand();
  if (shouldIgnoreCurrentPage()) return;
  var internalContext = internalTrackingContext();

  // The album normally sends no Referer. These public links send only its origin.
  // The fragment stays in the browser; only a validated public path can enter a PV.
  function isPublicSource(value) {
    return ['/', '/photos/', '/features/kosai-station/', '/library/', '/about/', '/usage/', '/privacy/'].includes(value) ||
      /^\/photos\/[\w-]+\/$/.test(value);
  }
  var viewReferrer = referringOrigin;
  if (isPublicSource(path)) {
    document.querySelectorAll('a[href="/creator/"]').forEach(function (link) {
      link.referrerPolicy = 'origin';
      link.hash = 'album-from=' + encodeURIComponent(path);
    });
  } else if (path === '/creator/' && window.location.hash.indexOf('#album-from=') === 0) {
    var sourcePath = new URLSearchParams(window.location.hash.slice(1)).get('album-from');
    var navigation = window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType('navigation')[0];
    if (referringOrigin === window.location.origin && isPublicSource(sourcePath) &&
        (!navigation || navigation.type === 'navigate')) {
      viewReferrer = referringOrigin + sourcePath;
    }
    try { window.history.replaceState(window.history.state, '', path + window.location.search); } catch (_) {}
  }

  function collectVisiblePage() { send("/api/collect", withInternalContext({
    site_id: siteId,
    path: path,
    url: publicUrl,
    title: document.title || "",
    referrer: viewReferrer
  })); }
  if (siteId === 'atawi-temple' && document.visibilityState === 'hidden') {
    document.addEventListener('visibilitychange', function onVisible() {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', onVisible);
      collectVisiblePage();
    });
  } else collectVisiblePage();

  window.fgaTrack = function (eventName, extra) {
    if (!eventName) return;
    var payload = {
      site_id: siteId,
      path: path,
      url: publicUrl,
      referrer: referringOrigin,
      event_name: String(eventName)
    };

    if (extra && typeof extra === "object") {
      Object.keys(extra).forEach(function (key) {
        if (payload[key] === undefined) payload[key] = extra[key];
      });
    }

    send("/api/click", withInternalContext(payload));
  };

  document.addEventListener("click", function (event) {
    var target = event.target;
    while (target && target !== document) {
      if (target.matches && target.matches("[data-track-click]")) {
        var eventName = target.getAttribute("data-track-click");
        if (eventName) {
          send("/api/click", withInternalContext({
            site_id: siteId,
            path: path,
            url: publicUrl,
            referrer: referringOrigin,
            event_name: eventName
          }));
        }
        return;
      }
      if (target.matches && target.matches("a[href]")) {
        var inlineHandler = target.getAttribute("onclick") || "";
        var autoEvent = inlineHandler.indexOf("trackEvent") === -1 ? eventNameForLink(target.getAttribute("href")) : "";
        if (autoEvent) {
          window.fgaTrack(autoEvent);
        }
        return;
      }
      target = target.parentNode;
    }
  }, true);

  document.addEventListener("auxclick", function (event) {
    if (event.button !== 1 || path !== "/creator/") return;
    var link = event.target.closest && event.target.closest("a[href]");
    var name = link && creatorDestination(link.href);
    if (name) window.fgaTrack(name);
  }, true);

  var autoFormStarted = false;
  document.addEventListener("focusin", trackFormStartFromControl, true);
  document.addEventListener("change", trackFormStartFromControl, true);

  function trackFormStartFromControl(event) {
    if (autoFormStarted) return;
    if (typeof window.trackEvent === "function") return;
    var target = event.target;
    if (!target || !target.matches) return;
    if (!target.matches("input, select, textarea")) return;
    if (!isLeadFormControl(target)) return;
    autoFormStarted = true;
    window.fgaTrack("form_start");
  }

  function isLeadFormControl(target) {
    if (target.closest && target.closest(".apply-box")) return true;
    var id = target.id || "";
    return id === "addr" || id === "mail" || id === "rel";
  }

  function eventNameForLink(href) {
    if (path === "/creator/") {
      var name = creatorDestination(href);
      if (name) return name;
    }
    var value = String(href || "").toLowerCase();
    if (value.indexOf("tel:") === 0) return "tel_click";
    if (value.indexOf("mailto:") === 0) return "mail_click";
    if (value.indexOf("line.me/") !== -1 || value.indexOf("lin.ee/") !== -1) return "line_click";
    return "";
  }

  function creatorDestination(href) {
    try {
      switch (new URL(href, publicUrl).origin) {
        case "https://oishi-hiroyuki.org": return "creator_official";
        case "https://kosai.enshu-lifehack.com": return "creator_lifehack";
        case "https://fudosan.atawi.link": return "creator_fudosan";
      }
    } catch (_) {}
    return "";
  }

  function send(endpoint, payload) {
    var url = endpointBase + endpoint;
    var body = JSON.stringify(payload);

    if (window.fetch) {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        mode: "cors",
        credentials: "omit",
        keepalive: true
      }).catch(sendBeaconFallback);
      return;
    }

    sendBeaconFallback();

    function sendBeaconFallback() {
      if (!navigator.sendBeacon) return;
      var blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    }
  }

  function findCurrentScript() {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1] || null;
  }

  function withInternalContext(payload) {
    if (internalContext.isInternal) {
      payload.is_internal = true;
      payload.internal_reason = internalContext.reason || "internal";
    }
    return payload;
  }

  function applyIgnoreCommand() {
    var params = new URLSearchParams(window.location.search);
    var value = params.get("fga_ignore") || params.get("fujigaoka_analytics_ignore");
    if (value === "1" || value === "true") setIgnoredBrowser(true);
    if (value === "0" || value === "false") setIgnoredBrowser(false);
  }

  function applyInternalCommand() {
    var params = new URLSearchParams(window.location.search);
    var value = params.get("fga_internal") || params.get("fujigaoka_analytics_internal") || params.get("atawi_internal");
    if (value === "1" || value === "true") setInternalBrowser(true);
    if (value === "0" || value === "false") setInternalBrowser(false);
  }

  function shouldIgnoreCurrentPage() {
    return isIgnoredBrowser() ||
      isAutomationBrowser() ||
      isPreviewHost(window.location.hostname) ||
      isInternalCheckUrl(window.location.href);
  }

  function isAutomationBrowser() {
    var userAgent = window.navigator ? window.navigator.userAgent || "" : "";
    return Boolean(window.navigator && window.navigator.webdriver) ||
      /HeadlessChrome|Playwright|Puppeteer|Codex|ChatGPT|OpenAI|OAI-SearchBot/i.test(userAgent);
  }

  function isPreviewHost(hostname) {
    var host = String(hostname || "").toLowerCase();
    return host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.slice(-6) === ".local" ||
      host.slice(-10) === ".pages.dev" ||
      host.slice(-12) === ".workers.dev";
  }

  function isInternalCheckUrl(urlText) {
    try {
      var params = new URL(urlText).searchParams;
      return params.has("check") || params.has("codex_chrome_check") || hasCodexParam(params);
    } catch (_) {
      return false;
    }
  }

  function hasCodexParam(params) {
    var found = false;
    params.forEach(function (_, key) {
      if (key.indexOf("codex_") === 0) found = true;
    });
    return found;
  }

  function internalTrackingContext() {
    var reason = internalReasonFromUrl(window.location.href);
    if (reason) return { isInternal: true, reason: reason };
    if (isInternalBrowser()) return { isInternal: true, reason: "internal_cookie" };
    return { isInternal: false, reason: "" };
  }

  function internalReasonFromUrl(urlText) {
    try {
      var params = new URL(urlText).searchParams;
      if (hasTruthyParam(params, "preview")) return "preview";
      if (hasTruthyParam(params, "admin_check")) return "admin_check";
      if (hasTruthyParam(params, "internal_check")) return "internal_check";
      if (hasTruthyParam(params, "fga_internal")) return "internal_param";
      if (hasTruthyParam(params, "fujigaoka_analytics_internal")) return "internal_param";
      if (hasTruthyParam(params, "atawi_internal")) return "internal_param";
    } catch (_) {}
    return "";
  }

  function hasTruthyParam(params, key) {
    if (!params.has(key)) return false;
    var value = params.get(key);
    return value === "" || value === "1" || value === "true" || value === "yes";
  }

  function isIgnoredBrowser() {
    try {
      if (window.localStorage && window.localStorage.getItem(IGNORE_KEY) === "1") return true;
    } catch (_) {}
    return document.cookie.split(";").some(function (part) {
      return part.trim() === IGNORE_KEY + "=1";
    });
  }

  function isInternalBrowser() {
    try {
      if (window.localStorage && window.localStorage.getItem(INTERNAL_KEY) === "1") return true;
    } catch (_) {}
    return document.cookie.split(";").some(function (part) {
      return part.trim() === INTERNAL_KEY + "=1";
    });
  }

  function setIgnoredBrowser(enabled) {
    try {
      if (window.localStorage) {
        if (enabled) window.localStorage.setItem(IGNORE_KEY, "1");
        else window.localStorage.removeItem(IGNORE_KEY);
      }
    } catch (_) {}

    document.cookie = IGNORE_KEY + "=" + (enabled ? "1" : "") +
      "; path=/; max-age=" + (enabled ? "31536000" : "0") + "; SameSite=Lax";
  }

  function setInternalBrowser(enabled) {
    try {
      if (window.localStorage) {
        if (enabled) window.localStorage.setItem(INTERNAL_KEY, "1");
        else window.localStorage.removeItem(INTERNAL_KEY);
      }
    } catch (_) {}

    document.cookie = INTERNAL_KEY + "=" + (enabled ? "1" : "") +
      "; path=/; max-age=" + (enabled ? "31536000" : "0") + "; SameSite=Lax";
  }
})();
