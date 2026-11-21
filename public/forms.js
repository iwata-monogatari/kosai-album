(() => {
  "use strict";
  const form = document.getElementById("iw-form");
  if (!form) return;
  const edit = document.getElementById("iw-edit");
  const confirm = document.getElementById("iw-confirm");
  const finish = document.getElementById("iw-finish");
  const error = form.querySelector("[data-error]");
  const submit = form.querySelector("[data-send]");
  const back = form.querySelector("[data-back]");
  const challenge = form.querySelector("[data-challenge]");
  const challengeStatus = form.querySelector("[data-challenge-status]");
  const fileInput = form.elements.file;
  const preview = form.querySelector("[data-preview]");
  const zipPreview = form.querySelector("[data-zip-preview]");
  const proof = preview?.querySelector("img");
  const note = form.elements.note;
  const kindLabels = { photo: "写真・ZIPを寄稿する", consult: "写真・大量データの受け取りを相談する", contact: "お問い合わせ" };
  const isZip = file => !!file && (/\.zip$/i.test(file.name) || ["application/zip", "application/x-zip-compressed"].includes(file.type));
  const rightsLabels = { self: "自分が撮影した", family: "家族や別の方が撮影した", unknown: "分からない" };
  let selectedFileUrl = "";
  let imageCheck = Promise.resolve();
  let requestKey = "";
  let token = "";
  let widget = null;
  let loadingChallenge = false;
  let sending = false;
  let stage = "edit";

  const value = name => String(form.elements.namedItem(name)?.value || "").trim();
  const kind = () => value("kind");
  function clearError() {
    error.textContent = "";
    error.hidden = true;
  }
  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    error.focus();
  }
  function selectStage(next) {
    stage = next;
    edit.hidden = next !== "edit";
    confirm.hidden = next !== "confirm";
    finish.hidden = next !== "finish";
    const panel = next === "edit" ? edit : next === "confirm" ? confirm : finish;
    panel.querySelector("h2").focus();
  }
  function refreshKind() {
    const type = kind();
    for (const group of form.querySelectorAll("[data-for]")) {
      const active = group.dataset.for === type;
      group.hidden = !active;
      for (const field of group.querySelectorAll("input,select,textarea")) field.disabled = !active;
    }
    note.required = type !== "photo";
    form.querySelector("[data-note-label]").textContent =
      type === "photo" ? "運営担当者だけに伝えること（任意）" :
      type === "consult" ? "相談内容（必須・非公開）" : "お問い合わせ内容（必須）";
    clearError();
  }
  function clearPreview() {
    if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    selectedFileUrl = "";
    if (preview) preview.hidden = true;
    if (zipPreview) { zipPreview.hidden = true; zipPreview.textContent = ""; }
    if (proof) proof.removeAttribute("src");
  }
  async function checkPreview() {
    clearPreview();
    if (!fileInput) return;
    fileInput.setCustomValidity("");
    const file = fileInput.files[0];
    if (!file) return;
    let message = "";
    if (isZip(file)) {
      if (file.size === 0 || file.size > 20 * 1024 * 1024) message = "ZIPは空ではない20 MiB以下のファイルを選んでください。大容量の場合は受け取りをご相談ください。";
      else {
        const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
        if (fileInput.files[0] !== file) return;
        if (header.length !== 4 || header[0] !== 80 || header[1] !== 75 || header[2] !== 3 || header[3] !== 4) message = "ZIPファイルを確認できません。パスワードなしの通常のZIPをお選びください。";
        else if (zipPreview) {
          zipPreview.textContent = "ZIPでまとめて送ります：" + file.name + "（" + (file.size / 1024 / 1024).toFixed(1) + " MiB）。内容は非公開で受け付け、掲載前に写真ごとに確認します。";
          zipPreview.hidden = false;
        }
      }
      if (message) { fileInput.setCustomValidity(message); if (kind() === "photo") showError(message); }
      return;
    }
    if (file.size === 0 || file.size > 10 * 1024 * 1024) message = "写真は空ではない10 MiB以下のファイルを選んでください。";
    else if (file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) message = "JPEG・PNG・WebPの写真を選ぶか、画像なしでご相談ください。";
    if (!message) {
      const url = URL.createObjectURL(file);
      selectedFileUrl = url;
      proof.src = url;
      try {
        await proof.decode();
        if (selectedFileUrl !== url) return;
        if (proof.naturalWidth * proof.naturalHeight > 40000000) message = "4,000万画素以下に縮小した写真を選ぶか、画像なしでご相談ください。";
        else preview.hidden = false;
      } catch {
        if (selectedFileUrl !== url) return;
        message = "この画像を読み込めませんでした。別の画像を選ぶか、画像なしでご相談ください。";
      }
    }
    if (message) {
      clearPreview();
      fileInput.setCustomValidity(message);
      if (kind() === "photo") showError(message);
    }
  }
  if (fileInput) fileInput.addEventListener("change", () => { imageCheck = checkPreview(); });
  for (const radio of form.querySelectorAll('[name="kind"][type="radio"]')) radio.addEventListener("change", refreshKind);
  form.addEventListener("input", event => {
    if (!edit.contains(event.target)) return;
    clearError();
    requestKey = "";
  });
  if (kind() === "contact") {
    const target = (new URLSearchParams(location.search).get("photo") || "").slice(0, 250);
    if (target) form.elements.photoId.value = target;
  }
  if (new URLSearchParams(location.search).get("kind") === "consult") {
    const radio = form.querySelector('[name="kind"][value="consult"]');
    if (radio) radio.checked = true;
  }
  refreshKind();
  for (const link of document.querySelectorAll('[data-intake-kind="consult"]')) {
    link.addEventListener("click", event => {
      const radio = form.querySelector('[name="kind"][value="consult"]');
      if (!radio) return;
      event.preventDefault();
      radio.checked = true;
      requestKey = "";
      refreshKind();
      selectStage("edit");
      form.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  function makeKey() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
  }
  function buildPayload() {
    const type = kind();
    const remarks = [];
    if (type === "photo") {
      if (value("displayName")) remarks.push("希望する公開名：" + value("displayName"));
      if (value("memory")) remarks.push("提供者の記憶（掲載は版確認後）：" + value("memory"));
    }
    if (type === "contact") {
      remarks.push("ご用件：" + value("purpose"));
      if (value("photoId")) remarks.push("対象の写真：" + value("photoId"));
    }
    if (value("note")) remarks.push("非公開の連絡事項：" + value("note"));
    const payload = new FormData();
    payload.set("kind", type);
    payload.set("email", value("email"));
    payload.set("title", type === "photo" ? value("title") : type === "contact" ? value("purpose") : "写真についての相談");
    payload.set("place", value("place"));
    payload.set("dateLabel", value("dateLabel"));
    payload.set("note", remarks.join("\n\n"));
    payload.set("rights", type === "photo" ? value("rights") : "unknown");
    payload.set("consent", form.elements.consent.checked ? "1" : "");
    payload.set("requestKey", requestKey);
    payload.set("cf-turnstile-response", token);
    if (type === "photo" && fileInput.files[0]) payload.set("file", fileInput.files[0]);
    return payload;
  }
  function populateSummary() {
    const summary = form.querySelector("[data-summary]");
    summary.replaceChildren();
    const type = kind();
    const details = [
      ["送信内容", kindLabels[type]], ["返信先（非公開）", value("email")],
      ["ご用件", value("purpose")], ["対象の写真", value("photoId")],
      [type === "photo" && isZip(fileInput.files[0]) ? "まとめて送るZIP" : "写真", type === "photo" ? fileInput.files[0]?.name : ""],
      ["撮影した方との関係", type === "photo" ? rightsLabels[value("rights")] : ""],
      ["写真の題名", type === "photo" ? value("title") : ""],
      ["撮影場所", value("place")], ["撮影年代", value("dateLabel")],
      ["覚えていること", type === "photo" ? value("memory") : ""],
      ["希望する掲載名", type === "photo" ? value("displayName") || "掲載前に相談" : ""],
      ["相談内容・非公開メモ", value("note")]
    ];
    for (const [name, data] of details) {
      if (!data) continue;
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = name;
      dd.textContent = data;
      summary.append(dt, dd);
    }
    if (type === "photo" && selectedFileUrl) {
      const thumb = document.createElement("img");
      thumb.src = selectedFileUrl;
      thumb.alt = "送信する写真の見本";
      thumb.style.cssText = "max-height:16rem;max-width:100%;width:auto;object-fit:contain";
      const dd = document.createElement("dd");
      const dt = document.createElement("dt");
      dt.textContent = "送信する写真";
      dd.append(thumb);
      summary.append(dt, dd);
    }
  }

  function tokenMessage(message) {
    token = "";
    submit.disabled = true;
    challengeStatus.textContent = message;
  }
  function renderChallenge() {
    loadingChallenge = false;
    if (stage !== "confirm" || !window.turnstile) return;
    if (widget !== null) {
      window.turnstile.reset(widget);
      return;
    }
    widget = window.turnstile.render(challenge, {
      sitekey: form.dataset.siteKey, action: "submit", language: "ja",
      size: challenge.clientWidth < 300 ? "compact" : "flexible",
      callback: response => {
        token = response;
        submit.disabled = sending || stage !== "confirm";
        challengeStatus.textContent = "送信できます。";
      },
      "expired-callback": () => tokenMessage("確認の有効時間が過ぎました。再確認が完了すると送信できます。"),
      "error-callback": () => {
        tokenMessage("送信前の確認を完了できませんでした。通信環境をご確認のうえ、入力に戻り、もう一度お試しください。");
        return true;
      }
    });
  }
  function startChallenge() {
    tokenMessage("送信前の確認を行っています。");
    if (window.turnstile) {
      renderChallenge();
      return;
    }
    if (loadingChallenge) return;
    loadingChallenge = true;
    window.kosaiTurnstileReady = renderChallenge;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=kosaiTurnstileReady";
    script.async = true;
    script.addEventListener("error", () => {
      loadingChallenge = false;
      tokenMessage("送信前の確認を読み込めませんでした。入力内容を保ったまま、入力に戻って再度お試しください。");
      script.remove();
    });
    document.head.append(script);
  }
  back.addEventListener("click", () => {
    if (sending) return;
    clearError();
    token = "";
    if (widget !== null && window.turnstile) {
      window.turnstile.remove(widget);
      widget = null;
    }
    selectStage("edit");
  });
  async function send() {
    if (sending || !token) return;
    clearError();
    sending = true;
    submit.disabled = true;
    back.disabled = true;
    submit.textContent = "送信しています…";
    try {
      const reply = await fetch(form.action, { method: "POST", body: buildPayload(), credentials: "same-origin", cache: "no-store" });
      const data = await reply.json().catch(() => ({}));
      if (!reply.ok || typeof data.id !== "string" || !data.id) {
        const serverMessage = typeof data.error === "string" && data.error.length < 220 && /[ぁ-んァ-ヶ一-龠]/.test(data.error) ? data.error : "";
        const reasons = {
          409: "受付処理中、または同じ受付キーで内容が変わっています。",
          413: "ファイルの容量が上限を超えています。ZIPを分けるか、大容量データの受け取りをご相談ください。",
          415: "対応する形式の画像を選んでください。",
          422: "入力内容または画像をご確認ください。",
          429: "受付が混み合っています。少し時間をおいてください。"
        };
        throw new Error(serverMessage || reasons[reply.status] || "受付番号を確認できませんでした。");
      }
      token = "";
      form.querySelector("[data-receipt]").textContent = data.id;
      form.reset();
      clearPreview();
      form.querySelector("[data-summary]").replaceChildren();
      selectStage("finish");
      if (widget !== null && window.turnstile) window.turnstile.remove(widget);
    } catch (e) {
      const text = e instanceof TypeError ? "通信が途切れました。" : e.message;
      showError(text + " 入力内容はこの画面に残っています。内容を修正するか、再確認後に同じ画面から送信してください。");
      startChallenge();
    } finally {
      sending = false;
      back.disabled = false;
      submit.disabled = !token;
      submit.textContent = "この内容で送信する";
    }
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (stage === "confirm") {
      await send();
      return;
    }
    if (stage !== "edit") return;
    await imageCheck;
    if (!form.reportValidity()) return;
    clearError();
    if (!requestKey) requestKey = makeKey();
    populateSummary();
    selectStage("confirm");
    startChallenge();
  });
})();
