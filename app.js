/* ============================================================
   app.js — catalog, i18n rendering, checkout with agent
   generation, and the AI advisor chatbot
   ============================================================ */
"use strict";

/* ================= CATALOG DATA (language-neutral) =================
   name/desc/features come from i18n.agents[id]; prices in CZK. */
const AGENTS = [
  { id:"anna",    icon:"📅", cat:"podpora",   rating:"4,9", clients:214, rent:375, buy:7000, tag:"bestseller" },
  { id:"patrik",  icon:"💬", cat:"podpora",   rating:"4,8", clients:186, rent:425, buy:8500 },
  { id:"eliska",  icon:"📧", cat:"podpora",   rating:"4,7", clients:97,  rent:275, buy:4900 },
  { id:"sofie",   icon:"📞", cat:"podpora",   rating:"4,8", clients:132, rent:300, buy:5400, tag:"new" },
  { id:"viktor",  icon:"📲", cat:"podpora",   rating:"4,7", clients:112, rent:325, buy:5900 },
  { id:"nela",    icon:"🛍️", cat:"prodej",    rating:"4,9", clients:158, rent:275, buy:5400 },
  { id:"vojtech", icon:"📦", cat:"prodej",    rating:"4,7", clients:104, rent:425, buy:8500 },
  { id:"hugo",    icon:"🧭", cat:"prodej",    rating:"4,8", clients:88,  rent:425, buy:8500, tag:"bestseller" },
  { id:"filip",   icon:"🎯", cat:"prodej",    rating:"4,6", clients:71,  rent:300, buy:5400 },
  { id:"renata",  icon:"🏷️", cat:"prodej",    rating:"4,6", clients:59,  rent:325, buy:5900, tag:"new" },
  { id:"klara",   icon:"⭐", cat:"marketing", rating:"4,8", clients:123, rent:250, buy:4900 },
  { id:"matej",   icon:"📣", cat:"marketing", rating:"4,7", clients:89,  rent:300, buy:5400 },
  { id:"xenie",   icon:"📝", cat:"marketing", rating:"4,8", clients:76,  rent:325, buy:6400, tag:"new" },
  { id:"marek",   icon:"✉️", cat:"marketing", rating:"4,7", clients:81,  rent:300, buy:5900 },
  { id:"jonas",   icon:"🧾", cat:"finance",   rating:"4,9", clients:167, rent:375, buy:7000 },
  { id:"tereza",  icon:"🧑‍💼", cat:"finance",   rating:"4,6", clients:58,  rent:375, buy:7000 },
  { id:"adam",    icon:"📋", cat:"finance",   rating:"4,7", clients:66,  rent:325, buy:6400 },
  { id:"david",   icon:"📈", cat:"finance",   rating:"4,8", clients:92,  rent:425, buy:8500, tag:"new" },
  { id:"leona",   icon:"🎓", cat:"podpora",   rating:"4,7", clients:54,  rent:275, buy:4900 },
  { id:"simon",   icon:"🗣️", cat:"podpora",   rating:"4,8", clients:61,  rent:325, buy:5900, tag:"new" },
  { id:"richard", icon:"🍽️", cat:"prodej",    rating:"4,7", clients:73,  rent:300, buy:5400 },
  { id:"ivana",   icon:"🎁", cat:"marketing", rating:"4,8", clients:64,  rent:275, buy:4900 },
  { id:"barbora", icon:"✍️", cat:"marketing", rating:"4,6", clients:49,  rent:275, buy:4900 },
  { id:"tomas",   icon:"📊", cat:"finance",   rating:"4,7", clients:57,  rent:300, buy:5400 },
  { id:"emanuel", icon:"🎓", cat:"podpora",   rating:"4,8", clients:44,  rent:325, buy:5900 },
  { id:"lucie",   icon:"🧠", cat:"podpora",   rating:"4,7", clients:51,  rent:300, buy:5400, tag:"new" },
  { id:"stanislav",icon:"🍔", cat:"prodej",    rating:"4,6", clients:38,  rent:275, buy:4900 },
  { id:"karolina", icon:"🚗", cat:"prodej",    rating:"4,7", clients:42,  rent:325, buy:5900 },
  { id:"provaz",  icon:"🧑‍🔧", cat:"podpora",   rating:"4,8", clients:47,  rent:300, buy:5400 },
  { id:"bela",    icon:"🐾", cat:"marketing", rating:"4,7", clients:35,  rent:250, buy:4900 },
  { id:"denisa",  icon:"👗", cat:"prodej",    rating:"4,8", clients:41,  rent:300, buy:5400 },
  { id:"mirek",   icon:"🏋️", cat:"podpora",   rating:"4,6", clients:29,  rent:275, buy:4900 },
  { id:"jolana",  icon:"🏨", cat:"podpora",   rating:"4,8", clients:37,  rent:325, buy:5900, tag:"new" },
  { id:"radim",   icon:"🦷", cat:"podpora",   rating:"4,7", clients:33,  rent:300, buy:5400 },
  { id:"bohuska", icon:"💍", cat:"prodej",    rating:"4,6", clients:26,  rent:275, buy:4900 },
  { id:"kamil",   icon:"🚚", cat:"finance",   rating:"4,7", clients:31,  rent:300, buy:5400 },
  { id:"svetlana",icon:"🏫", cat:"marketing", rating:"4,8", clients:28,  rent:275, buy:4900, tag:"new" },
  { id:"vendula", icon:"💅", cat:"podpora",   rating:"4,7", clients:30,  rent:250, buy:4900 }
];

/* ================= STATE ================= */
let mode = "rent";
let filter = "all";
let sortBy = "recommended";
let currentLang = "cs";
let coAgent = null;      // agent being checked out
let coMode = "rent";     // checkout billing mode
let payMethod = "card";  // "card" | "bank"

/* ==== OWNER SETTINGS (admin) + LICENCE SERVER ==== */
const SET_DEF = { acct:"2321458741/2010", iban:"", company:"Agentor s.r.o.", email:"ahoj@agentor.cz", phone:"+420 212 345 678", dueDays:30, graceDays:3, pin:"123456" };
let OWNER = (() => {
  try { const s = JSON.parse(localStorage.getItem("agentor-owner") || "{}"); return Object.assign({}, SET_DEF, s); } catch(e){ return Object.assign({}, SET_DEF); }
})();
let coLicense = null;
function saveOwner(){
  localStorage.setItem("agentor-owner", JSON.stringify(OWNER));
  try { localStorage.setItem("agentor-owner-backup", JSON.stringify(OWNER)); } catch(e){}
}


/* ================= HELPERS ================= */
const T  = () => I18N[currentLang];
const $  = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const czk = n => n.toLocaleString(T().locale);
/* money(): formátuje cenu v měně aktuálního jazyka — cs/ua → CZK, en/de → EUR (převod 25 Kč/€) */
const EUR_RATE = 25;
function money(n){
  const t = T();
  if (t.cur === "EUR"){
    const v = Math.round(n / EUR_RATE);            // zaokrouhlení na celé euro
    return v.toLocaleString(t.locale) + " €";
  }
  return n.toLocaleString(t.locale) + " Kč";
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

function fmtRating(r){
  return Number(r.replace(",", ".")).toLocaleString(T().locale, { minimumFractionDigits: 1 });
}
function stars(r){
  const v = Math.round(parseFloat(r.replace(",", ".")));
  return "★".repeat(v) + "☆".repeat(5 - v);
}

/* ================= I18N APPLY ================= */
function applyStaticTexts(){
  const t = T();
  document.documentElement.lang = t.code;
  document.title = t.meta.title;
  document.querySelector('meta[name="description"]').setAttribute("content", t.meta.description);

  const eyebrow = document.querySelector('[data-i18n="eyebrow"]');
  if (eyebrow) eyebrow.textContent = t.ui.eyebrow;
  $("[data-i18n=navAgents]").textContent = t.ui.navAgents;
  $("[data-i18n=navHow]").textContent    = t.ui.navHow;
  $("[data-i18n=navPricing]").textContent= t.ui.navPricing;
  $("[data-i18n=navFaq]").textContent    = t.ui.navFaq;
  $("[data-i18n=ctaNav]").textContent    = t.ui.ctaNav;
  $("[data-i18n=ctaHeader]").textContent = t.ui.ctaHeader;

  $("#heroTitle").textContent  = ""; // guard, set below via innerHTML
  $("#heroTitle").innerHTML    = t.ui.heroTitle;
  $("#heroLead").textContent   = t.ui.heroLead;
  $("#heroCta1").textContent   = t.ui.heroCta1;
  $("#heroCta2").textContent   = t.ui.heroCta2;
  $("#check1").textContent     = t.ui.check1;
  $("#check2").textContent     = t.ui.check2;
  $("#check3").textContent     = t.ui.check3;

  $("#chatName").textContent   = t.chat.name;
  $("#chatOnline").textContent = t.chat.online;
  $("#chatU1").childNodes[0].textContent = t.chat.u1;
  $("#chatB1").childNodes[0].textContent = t.chat.b1;
  $("#chatU2").childNodes[0].textContent = t.chat.u2;
  $("#chatB2").childNodes[0].textContent = t.chat.b2;
  $("#chatFootLabel").textContent = t.chat.footLabel;
  $("#chatFootValue").textContent = t.chat.footValue;

  $$("#statsGrid .stat").forEach((el, i) => {
    el.querySelector("b").textContent = t.stats[i].b;
    el.querySelector("span").textContent = t.stats[i].label;
  });

  $("#catTag").textContent = t.ui.catTag;
  $("#catTitle").textContent = t.ui.catTitle;
  $("#catSub").textContent = t.ui.catSub;
  $("#howTag").textContent = t.ui.howTag;
  $("#howTitle").textContent = t.ui.howTitle;
  $("#howSub").textContent = t.ui.howSub;
  $("#priceTag").textContent = t.ui.priceTag;
  $("#priceTitle").textContent = t.ui.priceTitle;
  $("#priceSub").textContent = t.ui.priceSub;
  $("#faqTag").textContent = t.ui.faqTag;
  $("#faqTitle").textContent = t.ui.faqTitle;
  $("#ctaH2").textContent = t.ui.ctaH2;
  $("#ctaP").textContent = t.ui.ctaP;
  $("#ctaBtn").textContent = t.ui.ctaBtn;

  $("#sortLabel").textContent = t.ui.sortLabel;
  const chips = $$("#chips .chip");
  const cats = ["all", "podpora", "prodej", "finance", "marketing"];
  chips.forEach((chip, i) => { chip.textContent = i === 0 ? t.ui.allChip : t.categories[cats[i]]; });

  $$("#stepsGrid .step").forEach((el, i) => {
    el.querySelector("h3").textContent = t.steps[i].t;
    el.querySelector("p").textContent  = t.steps[i].p;
  });

  const p = t.plans;
  const setPlan = (key, d) => {
    const el = $(`#plan-${key}`);
    el.querySelector("h3").textContent = d.name;
    el.querySelector(".for").textContent = d.for;
    const amount = el.querySelector(".amount");
    const per = el.querySelector(".per");
    if (key === "custom"){
      amount.textContent = d.amount;
      per.textContent = d.per;
    } else {
      amount.innerHTML = `${mode === "rent" ? d.amountRent : d.amountBuy} <small>${mode === "rent" ? d.suffixRent : d.suffixBuy}</small>`;
      per.textContent = mode === "rent" ? d.perRent : d.perBuy;
    }
    const liSpans = el.querySelectorAll("ul li span.txt");
    d.features.forEach((f, i) => { if (liSpans[i]) liSpans[i].textContent = f; });
    const btn = el.querySelector(".btn");
    btn.textContent = d.cta;
    if (d.ctaType === "modal") btn.setAttribute("data-open-checkout", "");
    else btn.removeAttribute("data-open-checkout");
    if (d.ctaType === "chat") btn.setAttribute("data-open-chat", "");
    else btn.removeAttribute("data-open-chat");
  };
  setPlan("start", p.start);
  setPlan("business", p.business);
  setPlan("custom", p.custom);
  $("#planNote").textContent = t.ui.planNote;

  $("#footTagline").textContent = t.ui.footTagline;
  $("#footServices").textContent = t.ui.footServices;
  $("#footCompany").textContent = t.ui.footCompany;
  $("#footContact").textContent = t.ui.footContact;
  $$("#footServicesList a")[0].textContent = t.ui.fCat;
  $$("#footServicesList a")[1].textContent = t.ui.fRent;
  $$("#footServicesList a")[2].textContent = t.ui.fBuy;
  $$("#footServicesList a")[3].textContent = t.ui.fCustom;
  $$("#footCompanyList a")[0].textContent = t.ui.fHow;
  $$("#footCompanyList a")[1].textContent = t.ui.fFaq;
  $$("#footCompanyList a")[2].textContent = t.ui.fContact;
  $("#footCity").textContent = t.ui.fCity;
  $("#footHours").textContent = t.ui.fHours;
  $("#footBottom").textContent = t.ui.footBottom;
  $("#footLegal").textContent = t.ui.footLegal;

  /* guide section */
  $("[data-i18n=navGuide]").textContent = t.ui.navGuideLabel || t.ui.guideTag;
  $("#guideTag").textContent = t.ui.guideTag;
  $("#guideTitle").textContent = t.ui.guideTitle;
  $("#guideSub").textContent = t.ui.guideSub;
  const gs = $$("#guideSteps .gstep");
  t.ui.steps.forEach((s, i) => {
    if (!gs[i]) return;
    gs[i].querySelector("h3").textContent = s.t;
    gs[i].querySelector("p").textContent = s.p;
  });
  $("#code1Title").textContent = t.ui.code1Title;
  $("#code2Title").textContent = t.ui.code2Title;
  $("#code3Title").textContent = t.ui.code3Title;
  $("#code1").textContent = t.ui.code1;
  $("#code2").textContent = t.ui.code2;
  $("#code3").textContent = t.ui.code3;
  const tipSpans = $$("#guideTips span");
  t.ui.guideTips.forEach((tip, i) => {
    if (tipSpans[i]) tipSpans[i].lastChild.textContent = " " + tip;
  });
  $$(".copy").forEach(b => { b.textContent = t.ui.btnCopy; });

  /* checkout modal */
  $("#coTitle").textContent = t.ui.coTitle;
  $("#coPlanTitle").textContent = t.ui.coPlanTitle;
  $("#coRentName").textContent = t.ui.coRentName;
  $("#coRentDesc").textContent = t.ui.coRentDesc;
  $("#coBuyName").textContent = t.ui.coBuyName;
  $("#coBuyDesc").textContent = t.ui.coBuyDesc;
  $("#coTotalLabel").textContent = t.ui.coTotal;
  $("#coVatNote").textContent = t.ui.coVatNote;
  $("#coContinue").textContent = t.ui.coContinue;
  $("#coBack1").textContent = t.ui.coBack;
  $("#coDataSub").textContent = t.ui.coDataSub;
  $("#coCompanyLbl").textContent = t.ui.coCompany;
  $("#coCompany").placeholder = t.ui.coCompanyPh;
  $("#coNameLbl").textContent = t.ui.coName;
  $("#coName").placeholder = t.ui.coNamePh;
  $("#coEmailLbl").textContent = t.ui.coEmail;
  $("#coEmail").placeholder = t.ui.coEmailPh;
  $("#coPayNote").textContent = t.ui.coPayNote;
  $("#coPayBtn").textContent = t.ui.coPayBtn;
  $("#coPayTitleLbl").textContent = t.ui.coPayTitle;
  $("#pmCardLbl").textContent = t.ui.pmCard;
  $("#pmCardDesc").textContent = t.ui.pmCardDesc;
  $("#pmBankLbl").textContent = t.ui.pmBank;
  $("#pmBankDesc").textContent = t.ui.pmBankDesc;
  $("#cardNumLbl").textContent = t.ui.cardNum;
  $("#cardNum").placeholder = t.ui.cardNumPh;
  $("#cardExpLbl").textContent = t.ui.cardExp;
  $("#cardExp").placeholder = t.ui.cardExpPh;
  $("#cardCvcLbl").textContent = t.ui.cardCvc;
  $("#cardCvc").placeholder = t.ui.cardCvcPh;
  $("#cardNameLbl").textContent = t.ui.cardName;
  $("#cardName").placeholder = t.ui.cardNamePh;
  $("#cardNum").previousElementSibling && ($("#cardNumErr") && 0);
  $("#secureNote").textContent = t.ui.secureNote;
  $("#coBack2").textContent = t.ui.coBack;
  $("#coConfirmPay").textContent = t.ui.payNow || t.ui.coPayTitle;
  $("#procTitle").textContent = t.ui.processingTitle;
  $("#procText").textContent = t.ui.processingText;
  $("#paidTitle").textContent = t.ui.paidTitle;
  $("#paidBadge").textContent = t.ui.paidBadge;
  $("#rcOrder").textContent = t.ui.rcOrder;
  $("#rcAgent").textContent = t.ui.rcAgent;
  $("#rcLicence").textContent = t.ui.rcLicence;
  $("#rcTotal").textContent = t.ui.rcTotal;
  $("#buildNowBtn").textContent = t.ui.buildNow;
  $("#coBuildingLbl").textContent = t.ui.coBuilding;
  $("#coDoneTitle").textContent = t.ui.coDoneTitle;
  $("#coDoneText").textContent = t.ui.coDoneText;
  $("#coDownload").textContent = t.ui.coDownload;
  $("#coDlHint").textContent = t.ui.coDlHint;

  /* chat widget */
  $("#advisorName").textContent = t.advisor.name;
  $("#advisorStatus").textContent = t.advisor.status;
  $("#advisorInput").placeholder = t.advisor.ph;
  $("#advisorDisclaimer").textContent = t.advisor.disclaimer;
  $("#rnTitle").textContent = t.ui.rnTitle;
  $("#rnAgentLbl").textContent = t.ui.rnAgentLbl;
  $("#rnValidLbl").textContent = t.ui.rnValidLbl;
  $("#rnPriceLbl").textContent = t.ui.rnPriceLbl;
  $("#rnDoneText").textContent = t.ui.rnDoneText;
  $("#rnPay").textContent = t.ui.rnPay;
  $("#rnCancel").textContent = t.ui.rnCancel;

  const quickWrap = $("#advisorQuick");
  quickWrap.innerHTML = t.advisor.quick.map(q => `<button type="button">${esc(q)}</button>`).join("");
}

/* ================= CATALOG RENDER ================= */
function priceHTML(a){
  return mode === "rent"
    ? `<b>${money(a.rent)}</b><small>${T().ui.rentLabel}</small>`
    : `<b>${money(a.buy)}</b><small>${T().ui.buyLabel}</small>`;
}
function tagHTML(a){
  if (!a.tag) return "";
  const label = a.tag === "bestseller" ? T().ui.tagBestseller : T().ui.tagNew;
  return `<span class="flag">${label}</span>`;
}
function renderAgents(){
  const grid = $("#agentsGrid");
  let list = AGENTS.filter(a => filter === "all" || a.cat === filter);
  if (sortBy === "priceAsc")  list = [...list].sort((x,y) => x[mode] - y[mode]);
  if (sortBy === "priceDesc") list = [...list].sort((x,y) => y[mode] - x[mode]);
  if (sortBy === "name")      list = [...list].sort((x,y) => T().agents[x.id].name.localeCompare(T().agents[y.id].name, T().locale));

  if (!list.length){ grid.innerHTML = `<div class="empty">${T().ui.empty}</div>`; return; }

  grid.innerHTML = list.map(a => {
    const tr = T().agents[a.id];
    return `
    <article class="agent">
      ${tagHTML(a)}
      <div class="agent-icon" aria-hidden="true">${a.icon}</div>
      <h3>${esc(tr.name)}</h3>
      <div class="cat">${T().categories[a.cat]}</div>
      <p class="desc">${esc(tr.desc)}</p>
      <ul>${tr.features.map(f => `
        <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>${esc(f)}</span></li>`).join("")}
      </ul>
      <div class="agent-meta">
        <span class="stars" aria-hidden="true">${stars(a.rating)}</span>
        <span>${fmtRating(a.rating)} · ${a.clients} ${T().ui.usedBy}</span>
      </div>
      <div class="agent-price">
        <div class="price">${priceHTML(a)}</div>
        <button class="btn btn-primary" data-agent="${a.id}" data-open-checkout>${T().ui.quoteBtn}</button>
      </div>
    </article>`;
  }).join("");
}

/* ================= FAQ ================= */
function renderFaq(){
  $("#faqList").innerHTML = T().faq.map(item => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false">
        <span>${esc(item.q)}</span>
        <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="faq-a"><p>${esc(item.a)}</p></div>
    </div>`).join("");
}

/* ================= MODE / LANG ================= */
function setMode(m){
  mode = m;
  $("#modeRent").classList.toggle("active", m === "rent");
  $("#modeRent").setAttribute("aria-pressed", m === "rent");
  $("#modeBuy").classList.toggle("active", m === "buy");
  $("#modeBuy").setAttribute("aria-pressed", m === "buy");
  renderAgents();
  applyStaticTexts();
}
function setLang(code){
  if (!I18N[code]) return;
  currentLang = code;
  localStorage.setItem("agentor-lang", code);
  $("#langLabel").textContent = T().langName;
  $("#langFlag").textContent = T().flag;
  $$("#langMenu button").forEach(b => b.classList.toggle("active", b.dataset.lang === code));
  const sortSel = $("#sortSelect");
  const keep = sortSel.selectedIndex;
  Array.from(sortSel.options).forEach((o, i) => { o.textContent = T().sort[i]; });
  sortSel.selectedIndex = keep;
  applyStaticTexts();
  renderAgents();
  renderFaq();
  if (advState.history.length) renderAdvHistory();
}

/* ================= CHECKOUT ================= */
function openCheckout(agentId){
  coAgent = AGENTS.find(a => a.id === agentId) || AGENTS[0];
  coMode = mode;
  const t = T();
  $("#coSummaryIcon").textContent = coAgent.icon;
  $("#coSummaryName").textContent = t.agents[coAgent.id].name;
  $("#coSummaryCat").textContent = t.categories[coAgent.cat];
  $("#coPayIcon").textContent = coAgent.icon;
  coLicense = null;
  $("#coPaySummary").textContent = t.agents[coAgent.id].name;
  updateCheckoutUI();
  setCoStep(1);
  showCoPane("co-pane-plan");
  $("#coModal").classList.add("open");
  document.body.style.overflow = "hidden";
}
function coPrice(){ return coMode === "rent" ? coAgent.rent : coAgent.buy; }
function updateCheckoutUI(){
  const t = T();
  $("#coRentPrice").textContent = money(coAgent.rent);
  $("#coRentPer").textContent = t.ui.coSuffixRent;
  $("#coBuyPrice").textContent = money(coAgent.buy);
  $("#coBuyPer").textContent = t.ui.coSuffixBuy;
  $("#coRentRadio").classList.toggle("selected", coMode === "rent");
  $("#coBuyRadio").classList.toggle("selected", coMode === "buy");
  $("#coRentInput").checked = coMode === "rent";
  $("#coBuyInput").checked = coMode === "buy";
  $("#coTotalVal").textContent = money(coPrice());
  $("#coTotalVal2").textContent = money(coPrice());
  $("#coPayAmount").textContent = money(coPrice());
  $("#coPayPer").textContent = coMode === "rent" ? t.ui.coSuffixRent : t.ui.coSuffixBuy;
  $("#coTotalPer").textContent = coMode === "rent" ? t.ui.coSuffixRent : t.ui.coSuffixBuy;
  const eurNote = $("#eurNote");
  const eurVal = Math.round(coPrice() / EUR_RATE);
  const eurStr = eurVal.toLocaleString("de-DE") + " €";
  const czkStr = coPrice().toLocaleString("cs-CZ") + " Kč";
  eurNote.style.display = "";
  eurNote.textContent = (t.ui.eurNote || "").replace("{other}", t.cur === "EUR" ? czkStr : eurStr);
}
function setCoStep(n){
  [1,2,3,4].forEach(i => {
    const el = $(`#coStep${i}`);
    if (el) el.classList.toggle("on", i <= n);
  });
}
/* ================= PAYMENT ================= */
function luhnValid(num){
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0, dbl = false;
  for (let i = digits.length - 1; i >= 0; i--){
    let d = +digits[i];
    if (dbl){ d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  return sum % 10 === 0;
}
function formatCard(v){
  const d = v.replace(/\D/g, "").slice(0, 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}
function formatExp(v){
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}
function validatePayForm(){
  let ok = true;
  if (payMethod === "card"){
    const num = $("#cardNum").value;
    const exp = $("#cardExp").value;
    const cvc = $("#cardCvc").value.trim();
    const nm  = $("#cardName").value.trim();
    const numOk = luhnValid(num);
    const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
    const cvcOk = /^\d{3,4}$/.test(cvc);
    const nmOk  = nm.length > 1;
    $("#cardNum").style.borderColor = numOk ? "" : "#dc2626";
    $("#cardExp").style.borderColor = expOk ? "" : "#dc2626";
    $("#cardCvc").style.borderColor = cvcOk ? "" : "#dc2626";
    $("#cardName").style.borderColor = nmOk ? "" : "#dc2626";
    if (!numOk || !expOk || !cvcOk || !nmOk) ok = false;
  }
  return ok;
}
function genOrderNumber(){
  const d = new Date();
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `AG-${d.getFullYear()}-${rnd}`;
}
function startProcessing(){
  setCoStep(4);
  showCoPane("co-pane-processing");
  setTimeout(() => {
    const t = T();
    $("#rcOrderVal").textContent = genOrderNumber();
    $("#rcAgentVal").textContent = t.agents[coAgent.id].name;
    $("#rcLicenceVal").textContent = coMode === "rent" ? t.ui.rcLicenceRent : t.ui.rcLicenceBuy;
    $("#rcTotalVal").textContent = money(coPrice());
    coLicense = createLicence(coMode);
    logRentPayment(coLicense);
    if (coMode === "rent" && payMethod === "card") saveCardToken();
    $("#rcKeyRow").style.display = "";
    $("#rcKeyVal").textContent = coLicense.key;
    $("#rcValidRow").style.display = coMode === "rent" ? "" : "none";
    if (coMode === "rent"){
      $("#rcValid").textContent = (T().ui.rcValid || "").replace("{date}", fmtDate(coLicense.validUntil));
      $("#rcAutoRow").style.display = "";
      $("#rcAutoText").textContent = (T().ui.autoRenewLabel || "").replace("{price}", money(coAgent.rent));
      $("#coAutoRenew").checked = coLicense.autoRenew !== false;
    } else {
      $("#rcAutoRow").style.display = "none";
    }
    renderLicTable();
    showCoPane("co-pane-receipt");

  }, 2200);
}

/* ================= LICENCES ================= */
function loadLicences(){ try { return JSON.parse(localStorage.getItem("agentor-licenses") || "[]"); } catch(e){ return []; } }
function saveLicences(l){ localStorage.setItem("agentor-licenses", JSON.stringify(l)); }
function licenseKey(){ const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase(); return "AG-" + seg() + "-" + seg() + "-" + seg(); }
function renewDays(){ return Math.max(1, parseInt(OWNER.dueDays, 10) || 30); }
function graceDays(){ const g = parseInt(OWNER.graceDays, 10); return isNaN(g) ? 3 : Math.max(0, g); }
function licStatus(l){
  if (l.revoked) return "off";
  if (l.mode === "buy") return "ok";
  if (Date.now() > (l.graceUntil || l.validUntil)) return "off";
  if (Date.now() > l.validUntil) return "grace";
  return "ok";
}
/* ==== PLATEBNÍ LEDGER + ULOŽENÉ KARTY ==== */
function loadLedger(){ try { return JSON.parse(localStorage.getItem("agentor-payments") || "[]"); } catch(e){ return []; } }
function saveLedger(l){ localStorage.setItem("agentor-payments", JSON.stringify(l)); }
function payRef(){ const d = new Date(); return "PAY-" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000); }
function logRentPayment(lic, opts){
  opts = opts || {};
  const e = {
    ref: payRef(),
    ts: Date.now(),
    licKey: lic.key,
    agent: lic.agent,
    client: lic.company || lic.client || "—",
    method: opts.method || (payMethod === "bank" ? "bank" : "card"),
    amount: coPrice(),
    currency: "CZK",
    status: opts.status || "paid",
    type: opts.type || (lic.mode === "rent" ? "rent" : "buy")
  };
  const all = loadLedger(); all.push(e); saveLedger(all);
  return e;
}
/* tokenizace karty — ukládáme jen značku, poslední 4 číslice a expiraci (plná čísla se nikdy neukládají) */
function saveCardToken(){
  const num = ($("#cardNum").value || "").replace(/\D/g, "");
  if (num.length < 12) return;
  const brand = num.startsWith("4") ? "VISA" : num.startsWith("5") ? "Mastercard" : "Karta";
  localStorage.setItem("agentor-card", JSON.stringify({ brand, last4: num.slice(-4), exp: $("#cardExp").value || "" }));
}
function savedCard(){ try { return JSON.parse(localStorage.getItem("agentor-card") || "null"); } catch(e){ return null; } }
/* serverová simulace: den před výročím dobije uložená karta a prodlouží licence */
function runBillingCycle(){
  const card = savedCard();
  if (!card) return 0;
  const now = Date.now();
  let charged = 0;
  const all = loadLicences();
  let changed = false;
  all.forEach(l => {
    if (l.mode !== "rent" || l.revoked || !l.autoRenew) return;
    const cycle = renewDays() * 86400000;
    let next = l.validUntil || 0;
    let guard = 0;
    while (next - now < 86400000 && guard++ < 60){   // den před výročím (nebo po něm) → dobít
      const amt = (AGENTS.find(a => a.id === l.agent) || AGENTS[0]).rent;
      logRentPayment(l, { method: "card-auto", type: "rent", status: "paid" });
      next += cycle;
      l.validUntil = next;
      l.graceUntil = next + graceDays() * 86400000;
      charged++;
      changed = true;
    }
  });
  if (changed){ saveLicences(all); renderLicTable(); renderPayTable(); }
  return charged;
}
function startBillingEngine(){
  runBillingCycle();
  setInterval(runBillingCycle, 3600000);
}

function createLicence(licMode){
  const l = {
    key: licenseKey(),
    agent: coAgent.id,
    mode: licMode,
    company: ($("#coCompany").value || "").trim(),
    client: ($("#coName").value || "").trim() || "—",
    email: ($("#coEmail").value || "").trim(),
    created: Date.now()
  };
  if (licMode === "rent"){
    l.validUntil = Date.now() + renewDays() * 86400000;
    l.graceUntil = l.validUntil + graceDays() * 86400000;
    l.autoRenew = true;
  }
  const all = loadLicences(); all.push(l); saveLicences(all);
  return l;
}
function renewLicence(key){
  const all = loadLicences(); const l = all.find(x => x.key === key);
  if (!l) return;    l.revoked = false;
  if (l.mode === "rent"){
    l.autoRenew = l.autoRenew !== false;
    const base = Math.max(Date.now(), l.validUntil || Date.now());
    l.validUntil = base + renewDays() * 86400000;
    l.graceUntil = l.validUntil + graceDays() * 86400000;
  }
  saveLicences(all); renderLicTable();
}
function revokeLicence(key){
  const all = loadLicences(); const l = all.find(x => x.key === key);
  if (l){ l.revoked = true; saveLicences(all); renderLicTable(); }
}
function adminT(){ return I18N.cs.admin || (I18N.cs.ui && I18N.cs.ui.admin); }
function fmtDate(ms){ try { return new Date(ms).toLocaleDateString(T().locale); } catch(e){ return "—"; } }
function renderLicTable(){
  const t = adminT(); const rows = $("#licRows"); if (!rows) return;
  const list = loadLicences().slice().reverse();
  if (!list.length){ rows.innerHTML = '<tr><td colspan="7" class="lic-empty">' + t.admLicEmpty + '</td></tr>'; return; }
  rows.innerHTML = list.map(l => {
    const st = licStatus(l);
    const stLbl = st === "ok" ? t.admStatusOk : st === "grace" ? t.admStatusGrace : t.admStatusOff;
    const modeLbl = l.mode === "buy" ? t.admModeBuy : t.admModeRent;
    const valid = l.mode === "buy" ? "∞" : fmtDate(l.validUntil);
    const client = esc(l.company || l.client || t.admClientAnon);
    const agentName = esc(T().agents[l.agent] ? T().agents[l.agent].name : l.agent);
    const actions = l.mode === "buy" && !l.revoked
      ? '<button class="btn btn-ghost" data-revoke="' + l.key + '">' + t.admBtnRevoke + '</button>'
      : '<button class="btn btn-ghost" data-renew="' + l.key + '">' + (st === "ok" ? t.admBtnRenew : t.admBtnRestore) + '</button>' + (l.mode === "rent" ? ' <button class="btn btn-ghost" data-revoke="' + l.key + '">' + t.admBtnRevoke + '</button>' : '');
    return '<tr><td class="mono">' + l.key + '</td><td>' + agentName + '</td><td>' + client + '</td><td>' + modeLbl + '</td><td>' + valid + '</td><td><span class="lic-status ' + st + '">' + stLbl + '</span></td><td>' + actions + '</td></tr>';
  }).join("");
}
function renderPayTable(){
  const t = adminT(); const rows = $("#payRows"); if (!rows) return;
  const list = loadLedger().slice().reverse();
  if (!list.length){ rows.innerHTML = '<tr><td colspan="7" class="lic-empty">' + (t.payEmpty || "—") + '</td></tr>'; return; }
  rows.innerHTML = list.map(e => {
    const what = e.type === "buy" ? t.admTypeBuy : e.type === "renewal" ? (t.payTypeRenewal || "Obnova") : (t.payTypeRent || "Pronájem");
    const method = e.method === "card-auto" ? (t.payAutoCard || "Karta (auto)") : e.method === "card" ? (t.payCard || "Karta") : (t.payBank || "Převod");
    const status = e.status === "failed" ? '<span class="lic-status off">' + (t.payFailed || "Selhalo") + '</span>' : '<span class="lic-status ok">' + (t.payOk || "Zaplaceno") + "</span>";
    const agentName = esc(T().agents[e.agent] ? T().agents[e.agent].name : e.agent);
    const d = new Date(e.ts);
    const dateStr = d.toLocaleDateString(T().locale) + " " + d.toLocaleTimeString(T().locale, { hour: "2-digit", minute: "2-digit" });
    const client = esc(e.client || "—");
    return '<tr><td>' + dateStr + '</td><td>' + agentName + ' · ' + what + '</td><td class="mono">' + e.licKey + '</td><td>' + client + '</td><td>' + method + '</td><td><b>' + czk(e.amount) + '</b></td><td>' + status + '</td></tr>';
  }).join("");
}
function renderAdminHow(){
  const t = adminT(); const wrap = $("#admHowList"); if (!wrap) return;
  wrap.innerHTML = (t.admHow || []).map((s, i) => '<div><b>' + (i + 1) + '. ' + esc(s.t) + '</b><p style="margin:4px 0 0;font-size:13.5px;color:var(--muted);line-height:1.6">' + esc(s.p) + '</p></div>').join("");
}
/* ==== SELF-SERVICE RENEWAL ==== */
let rnLic = null;
function openRenewal(key){
  const l = loadLicences().find(x => x.key === key);
  if (!l){ return; }
  rnLic = l;
  const t = T();
  const a = T().agents[l.agent] || { name: l.agent };
  $("#rnAgentVal").textContent = a.name;
  $("#rnValidVal").textContent = l.mode === "buy" ? "∞" : fmtDate(l.validUntil);
  $("#rnPriceVal").textContent = money((AGENTS.find(x => x.id === l.agent) || AGENTS[0]).rent);
  $("#rnSub").textContent = l.key;
  $("#rnDone").style.display = "none";
  $("#rnPay").style.display = "";
  $("#rnModal").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeRenewal(){ $("#rnModal").classList.remove("open"); document.body.style.overflow = ""; rnLic = null; }
function payRenewal(){
  if (!rnLic) return;
  const card = savedCard();
  const method = card ? "card-auto" : "bank";
  logRentPayment(rnLic, { method, type: "renewal" });
  renewLicence(rnLic.key);
  const l = loadLicences().find(x => x.key === rnLic.key);
  $("#rnValidVal").textContent = l.mode === "buy" ? "∞" : fmtDate(l.validUntil);
  $("#rnDone").style.display = "";
  $("#rnPay").style.display = "";
  renderLicTable(); renderPayTable();
}

function applyOwner(){
  const acct = (OWNER.acct || "").trim();
  $("#bankAcct").textContent = acct ? acct.split("/").join(" / ") : "—";
  $("#bankName").textContent = OWNER.company || SET_DEF.company;
  const ib = $("#bankIban");
  if (OWNER.iban){ ib.textContent = "IBAN: " + OWNER.iban; ib.style.display = ""; } else { ib.style.display = "none"; }
  const em = $("#footerEmail");
  em.textContent = OWNER.email || SET_DEF.email; em.href = "mailto:" + (OWNER.email || SET_DEF.email);
  const ph = $("#footerPhone");
  ph.textContent = OWNER.phone || SET_DEF.phone; ph.href = "tel:" + (OWNER.phone || SET_DEF.phone).replace(/\s+/g, "");
}
function fillAdminForm(){
  $("#admCompany").value = OWNER.company || "";
  $("#admAcctNum").value = OWNER.acct || "";
  $("#admIban").value = OWNER.iban || "";
  $("#admEmail").value = OWNER.email || "";
  $("#admPhone").value = OWNER.phone || "";
  $("#admDueDays").value = OWNER.dueDays;
  $("#admGraceDays").value = OWNER.graceDays;
}
function saveAdmin(){
  const email = $("#admEmail").value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ $("#admEmail").style.borderColor = "#dc2626"; return; }
  $("#admEmail").style.borderColor = "";
  const newPin = $("#admPinNew").value.trim();
  if (newPin && !/^\d{4,6}$/.test(newPin)){ $("#admPinNew").style.borderColor = "#dc2626"; return; }
  $("#admPinNew").style.borderColor = "";
  OWNER.company = $("#admCompany").value.trim();
  OWNER.acct = $("#admAcctNum").value.trim();
  OWNER.iban = $("#admIban").value.trim();
  OWNER.email = email;
  OWNER.phone = $("#admPhone").value.trim();
  OWNER.dueDays = Math.max(1, parseInt($("#admDueDays").value, 10) || 30);
  OWNER.graceDays = Math.max(0, parseInt($("#admGraceDays").value, 10) || 0);
  if (newPin) OWNER.pin = newPin;
  saveOwner();
  applyOwner(); renderLicTable();
  $("#admSaved").classList.add("show");
  setTimeout(() => $("#admSaved").classList.remove("show"), 2200);
}
function showAdmin(){
  sessionStorage.setItem("agentor-admin", "1");
  $("#adm-pane-pin").classList.remove("active");
  $("#admTabs").style.display = "";
  $$("#admTabs button").forEach((b, i) => b.classList.toggle("on", i === 0));
  $("#adm-pane-settings").classList.add("active");
  $("#adminFoot").style.display = "";
  fillAdminForm(); renderLicTable(); renderPayTable(); renderAdminHow();
}
function openAdmin(){
  $("#adminScrim").classList.add("open");
  document.body.style.overflow = "hidden";
  if (sessionStorage.getItem("agentor-admin") === "1") showAdmin();
  else setTimeout(() => $("#admPin").focus(), 60);
}
function closeAdmin(){
  $("#adminScrim").classList.remove("open");
  document.body.style.overflow = "";
  if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
}
function lockAdmin(){
  sessionStorage.removeItem("agentor-admin");
  $("#adm-pane-settings").classList.remove("active");
  $("#adm-pane-lic").classList.remove("active");
  $("#adm-pane-how").classList.remove("active");
  $("#admTabs").style.display = "none";
  $("#adminFoot").style.display = "none";
  $("#adm-pane-pin").classList.add("active");
  $("#admPin").value = ""; $("#admPinErr").classList.remove("show");
}
function tryUnlock(){
  if ($("#admPin").value === OWNER.pin) showAdmin();
  else { $("#admPinErr").classList.add("show"); $("#admPin").value = ""; }
}


function showCoPane(id){
  $$(".co-pane").forEach(p => p.classList.remove("active"));
  $(`#${id}`).classList.add("active");
}

function closeCheckout(){
  coLicense = null;
  $("#coModal").classList.remove("open");
  document.body.style.overflow = "";
  $("#coForm") && ($("#coForm").reset());
  $("#coErrName").style.display = "none";
  $("#coErrEmail").style.display = "none";
}

/* Builds a standalone, working chat-agent HTML file for download */
function buildAgentFile(lic){
  lic = lic || coLicense || createLicence(coMode);
  const t = T();
  const a = t.agents[coAgent.id];
  const meta = AGENTS.find(x => x.id === coAgent.id);
  const company = ($("#coCompany").value || "").trim() || (currentLang === "cs" ? "Vaše firma" : currentLang === "de" ? "Ihre Firma" : currentLang === "ua" ? "Ваша фірма" : "Your company");
  const langNames = { cs:"čeština", en:"English", de:"Deutsch", ua:"українська" };
  const greetingByLang = {
    cs: `Dobrý den! Jsem AI agent společnosti ${company}. Rád vám pomohu — napište mi, co potřebujete.`,
    en: `Hello! I'm the AI agent of ${company}. How can I help you today?`,
    de: `Guten Tag! Ich bin der KI-Agent von ${company}. Wie kann ich Ihnen helfen?`,
    ua: `Добрий день! Я ШІ-агент компанії ${company}. Чим можу допомогти?`
  };
  const featList = a.features.map(f => `<li>${esc(f)}</li>`).join("");
  const replyByLang = {
    cs: "Děkuji za zprávu! Jdem na to — váš požadavek jsem zaznamenal a předám ho týmu firmy. (Toto je demo verze agenta — v ostrém provozu je napojen na znalostní bázi firmy, e-shop i kalendář.)",
    en: "Thanks for your message! Consider it done — I noted your request and will pass it to the team. (This is a demo agent — in production it connects to the company's knowledge base, e-shop and calendar.)",
    de: "Danke für Ihre Nachricht! Erledigt — Ihre Anfrage ist notiert und geht an das Team. (Dies ist ein Demo-Agent — im Betrieb ist er mit der Wissensbasis, dem Shop und dem Kalender verbunden.)",
    ua: "Дякую за повідомлення! Зроблено — ваш запит записано та передано команді. (Це демо-агент — у робочому режимі він підключений до бази знань, магазину та календаря.)"
  };
  const ownerForFile = { email: OWNER.email || "", phone: OWNER.phone || "" };
  const LICT = { banner: t.ui.licBanner, expiredTitle: t.ui.licExpiredTitle, expiredText: t.ui.licExpiredText, expiredContact: t.ui.licExpiredContact, renewBtn: t.ui.licRenewBtn };

  const html = `<!DOCTYPE html>
<html lang="${t.code}">
<head>
<meta charset="UTF-8">
<title>Agentor — ${esc(a.name)} (${esc(company)})</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f6f8fb;color:#0f172a}
  .wrap{max-width:560px;margin:32px auto;padding:0 16px}
  .head{background:linear-gradient(120deg,#0b1526,#0f5f57);color:#fff;border-radius:16px;padding:20px 22px}
  .head h1{margin:0 0 6px;font-size:20px}
  .head p{margin:0;opacity:.85;font-size:14px}
  #chat{background:#fff;border:1px solid #e3e8f0;border-radius:16px;margin-top:16px;padding:14px;height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
  .m{max-width:82%;padding:9px 13px;border-radius:13px;font-size:14px;line-height:1.45}
  .bot{background:#f1f5f9;align-self:flex-start;border-bottom-left-radius:4px}
  .usr{background:#0b1526;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
  form{display:flex;gap:8px;margin-top:12px}
  input{flex:1;padding:11px 13px;border:1px solid #e3e8f0;border-radius:10px;font-size:14px}
  button{padding:11px 18px;border:none;border-radius:10px;background:#0d9488;color:#fff;font-weight:600;cursor:pointer}
  ul.feat{margin:14px 0 0;padding-left:18px;font-size:13.5px;color:#5b6b84}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <h1>${meta.icon} ${esc(a.name)}</h1>
    <p>${esc(company)} · Agentor marketplace · ${langNames[t.code]}</p>
  </div>
  <div id="chat"></div>
  <form id="f"><input id="i" autocomplete="off" placeholder="${t.advisor.ph}"><button>➤</button></form>
  <ul class="feat"><strong>${esc(a.name)} — ${esc(a.desc)}</strong>${featList}</ul>
</div>
<script>
  var LIC_KEY=${JSON.stringify(lic.key)},
      LIC_EXP=${lic.mode === "rent" ? JSON.stringify(new Date(lic.validUntil).toISOString()) : "null"},
      LIC_MODE=${JSON.stringify(lic.mode)},
      LIC_OWNER=${JSON.stringify(ownerForFile)},
      LICT=${JSON.stringify(LICT)};
  (function(){

    var GREETING=${JSON.stringify(greetingByLang[t.code])};
    var REPLY=${JSON.stringify(replyByLang[t.code])};
    var chat=document.getElementById('chat'), input=document.getElementById('i');
    var LICT = window.LICT || {};
    var LIC_OWNER = window.LIC_OWNER || {};
    var LIC_MODE = window.LIC_MODE || 'rent';
    var LIC_EXP = window.LIC_EXP || null;
    (function banner(){
      var exp = LIC_EXP ? new Date(LIC_EXP) : null;
      if (LIC_MODE !== 'buy' && exp && !isNaN(exp.getTime()) && new Date() < exp){
        var b = document.createElement('div');
        b.className = 'lic-banner';
        b.textContent = String(LICT.banner || '').replace('{date}', exp.toLocaleDateString());
        var w = document.querySelector('.wrap');
        if (w) w.parentNode.insertBefore(b, w);
      }
    })();

    function add(cls,txt){var d=document.createElement('div');d.className='m '+cls;d.textContent=txt;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
    add('bot',GREETING);
    document.getElementById('f').addEventListener('submit',function(e){
      e.preventDefault();
      var v=input.value.trim(); if(!v) return;
      add('usr',v); input.value='';
      setTimeout(function(){ add('bot', REPLY); }, 500);
    });
    (function licenseWatch(){
      var exp = LIC_EXP ? new Date(LIC_EXP) : null;
      function lock(){
        document.documentElement.innerHTML = '<div style="position:fixed;inset:0;background:linear-gradient(160deg,#0b1526,#12303c);display:flex;align-items:center;justify-content:center;font-family:Arial,Helvetica,sans-serif;padding:24px;z-index:99999"><div style="max-width:460px;text-align:center;color:#fff;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:34px 30px"><div style="font-size:40px;margin-bottom:12px">🔒</div><h1 style="font-size:20px;margin:0 0 10px">' + (LICT.expiredTitle || 'Agent deactivated') + '</h1><p style="font-size:14px;line-height:1.65;opacity:.85;margin:0 0 18px">' + (LICT.expiredText || '') + '</p><div style="font-size:13.5px;line-height:1.7;opacity:.95">' + (LICT.expiredContact || 'Contact:') + '<br><a href="mailto:' + (LIC_OWNER.email || '') + '" style="color:#5eead4;font-weight:600">' + (LIC_OWNER.email || '') + '</a>' + (LIC_OWNER.phone ? '<br><a href="tel:' + LIC_OWNER.phone + '" style="color:#5eead4;font-weight:600">' + LIC_OWNER.phone + '</a>' : '')+'</div><a href="https://agentor.cz/#obnova=' + (LIC_KEY || '') + '" style="display:inline-block;margin-top:20px;padding:11px 22px;border-radius:10px;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;font-size:14px">' + (LICT.renewBtn || 'Renew licence') + '</a></div></div>';
      }
      if (LIC_MODE !== 'buy' && exp && !isNaN(exp.getTime()) && new Date() > exp) lock();
      setInterval(function(){ if (LIC_MODE !== 'buy' && exp && !isNaN(exp.getTime()) && new Date() > exp) lock(); }, 3600000);
    })();
  })();
<\/script>
</body>
</html>`;
  return html;
}
function downloadAgent(){
  const lic = coLicense || createLicence(coMode);
  if (!coLicense) coLicense = lic;
  const blob = new Blob([buildAgentFile(lic)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `agentor-${coAgent.id}-${coMode}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function runBuildSequence(){
  const t = T();
  const log = $("#coLog");
  log.innerHTML = "";
  const company = ($("#coCompany").value || "").trim();
  const msgs = t.ui.coBuildMsgs.map(m => m.replace("{company}", company || (t.code === "cs" ? "vaší firmě" : t.code === "de" ? "Ihrer Firma" : t.code === "ua" ? "вашій фірмі" : "your company")));
  showCoPane("co-pane-build");
  msgs.forEach((m, i) => {
    setTimeout(() => {
      const d = document.createElement("div");
      d.className = i === msgs.length - 1 ? "ok" : "";
      d.textContent = m;
      log.appendChild(d);
    }, i * 550);
  });
  setTimeout(() => {
    $("#coFinalName").textContent = T().agents[coAgent.id].name;
    $("#coFinalCat").textContent = T().categories[coAgent.cat];
    $("#coDownload").setAttribute("data-license", coLicense ? coLicense.key : "");

    showCoPane("co-pane-done");
  }, msgs.length * 550 + 500);
}

/* ================= AI ADVISOR CHATBOT ================= */
const advState = { history: [] };

function advPush(cls, text, key){
  const body = $("#advisorBody");
  const d = document.createElement("div");
  d.className = `msg ${cls}`;
  d.textContent = text;
  body.appendChild(d);
  body.scrollTop = body.scrollHeight;
  advState.history.push({ cls, text, key: key || null });
}
/* text bot zprávy podle klíče v aktuálním jazyce (g = uvítání, fb = fallback, a:N = N-tá odpověď poradce) */
function advTextForKey(key){
  const t = T();
  if (key === "g") return t.advisor.greeting;
  if (key === "fb") return t.advisor.fallback;
  if (key && key.indexOf("a:") === 0){
    const entry = t.advisor.answers[+key.slice(2)];
    if (entry) return entry.a;
  }
  return "";
}
/* při změně jazyka přeloží celou historii chatu (zprávy zákazníka zůstávají) */
function renderAdvHistory(){
  const body = $("#advisorBody");
  body.innerHTML = "";
  advState.history.forEach(h => {
    const d = document.createElement("div");
    d.className = `msg ${h.cls}`;
    d.textContent = h.key ? advTextForKey(h.key) : h.text;
    if (h.key) h.text = d.textContent;
    body.appendChild(d);
  });
  if (advState.ctaAgent) advCta(true, advState.ctaAgent);
  body.scrollTop = body.scrollHeight;
}
function advTyping(on){
  const body = $("#advisorBody");
  let el = $("#advTyping");
  if (on){
    if (el) return;
    el = document.createElement("div");
    el.className = "chat-typing"; el.id = "advTyping";
    el.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  } else if (el) el.remove();
}
function advCta(on, agentId){
  advState.ctaAgent = on ? (agentId || advState.ctaAgent || "anna") : null;
  let el = $("#advCtaBtn");
  if (on){
    if (el) return;
    el = document.createElement("button");
    el.className = "btn btn-accent"; el.id = "advCtaBtn";
    el.style.alignSelf = "center";
    el.style.margin = "4px 0";
    el.textContent = T().advisor.cta;
    if (agentId) el.dataset.agent = agentId;
    el.addEventListener("click", () => {
      closeChat();
      openCheckout(el.dataset.agent || "anna");
    });
    $("#advisorBody").appendChild(el);
    $("#advisorBody").scrollTop = $("#advisorBody").scrollHeight;
  } else if (el) el.remove();
}

function advAnswer(text){
  const t = T();
  const q = text.toLowerCase();
  let best = null, bestScore = 0, bestIdx = -1;
  t.advisor.answers.forEach((entry, i) => {
    let score = 0;
    for (const kw of entry.k){ if (q.includes(kw)) score += kw.length; }
    if (score > bestScore){ bestScore = score; best = entry; bestIdx = i; }
  });
  const agentId = (best || { r: "anna" }).r;
  const isFb = !best;
  setTimeout(() => {
    advTyping(false);
    const tt = T();   // aktuální jazyk v momentě odpovědi (mohl se mezitím přepnout)
    const txt = isFb ? tt.advisor.fallback : (tt.advisor.answers[bestIdx] || { a: tt.advisor.fallback }).a;
    advPush("bot", txt, isFb ? "fb" : "a:" + bestIdx);
    advCta(true, agentId);
  }, 700 + Math.random() * 500);
}

function advSend(text){
  if (!text.trim()) return;
  advPush("user", text.trim());
  advCta(false);
  advTyping(true);
  advAnswer(text);
}

function openChat(){
  $("#chatPanel").classList.add("open");
  $("#chatFab").style.display = "none";
  if (!advState.history.length){
    advTyping(true);
    setTimeout(() => {
      advTyping(false);
      advPush("bot", T().advisor.greeting, "g");
    }, 600);
  }
  setTimeout(() => $("#advisorInput").focus(), 80);
}
function closeChat(){
  $("#chatPanel").classList.remove("open");
  $("#chatFab").style.display = "";
}

/* ================= EVENTS + INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  /* language menu */
  $("#langBtn").addEventListener("click", e => {
    e.stopPropagation();
    $("#lang").classList.toggle("open");
    $("#langBtn").setAttribute("aria-expanded", $("#lang").classList.contains("open"));
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("#lang")) $("#lang").classList.remove("open");
  });
  $$("#langMenu button").forEach(b => b.addEventListener("click", () => {
    setLang(b.dataset.lang);
    $("#lang").classList.remove("open");
  }));

  /* chips + sort + mode */
  $("#chips").addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    $$("#chips .chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    renderAgents();
  });
  $("#sortSelect").addEventListener("change", e => { sortBy = e.target.value; renderAgents(); });
  $("#modeRent").addEventListener("click", () => setMode("rent"));
  $("#modeBuy").addEventListener("click", () => setMode("buy"));

  /* FAQ (delegated) */
  $("#faqList").addEventListener("click", e => {
    const q = e.target.closest(".faq-q");
    if (!q) return;
    const item = q.parentElement, answer = item.querySelector(".faq-a");
    const open = item.classList.toggle("open");
    q.setAttribute("aria-expanded", open);
    answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0";
  });

  /* global openers */
  document.addEventListener("click", e => {
    const co = e.target.closest("[data-open-checkout]");
    if (co){ e.preventDefault(); openCheckout(co.dataset.agent); return; }
    const ch = e.target.closest("[data-open-chat]");
    if (ch){ e.preventDefault(); closeCheckout(); openChat(); return; }
    if (e.target.closest("[data-close-checkout]")) closeCheckout();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && $("#coModal").classList.contains("open")) closeCheckout();
  });

  /* checkout interactions */
  $("#coRentRadio").addEventListener("click", () => { coMode = "rent"; updateCheckoutUI(); });
  $("#coBuyRadio").addEventListener("click", () => { coMode = "buy"; updateCheckoutUI(); });
  $("#coContinue").addEventListener("click", () => {
    setCoStep(2);
    showCoPane("co-pane-data");
  });
  $("#coPayBtn").addEventListener("click", () => {
    const name = $("#coName").value.trim();
    const email = $("#coEmail").value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    $("#coErrName").style.display = name ? "none" : "block";
    $("#coErrEmail").style.display = emailOk ? "none" : "block";
    if (!name || !emailOk) return;
    setCoStep(3);
    showCoPane("co-pane-pay");
  });
  $("#coBack1").addEventListener("click", () => {
    setCoStep(1);
    showCoPane("co-pane-plan");
  });
  /* payment methods */
  $("#pmCardBox").addEventListener("click", () => {
    payMethod = "card";
    $("#pmCardBox").classList.add("selected");
    $("#pmBankBox").classList.remove("selected");
    $("#cardFields").style.display = "";
    $("#bankFields").style.display = "none";
  });
  $("#pmBankBox").addEventListener("click", () => {
    payMethod = "bank";
    $("#pmBankBox").classList.add("selected");
    $("#pmCardBox").classList.remove("selected");
    $("#bankFields").style.display = "";
    $("#cardFields").style.display = "none";
  });
  /* live card formatting */
  $("#cardNum").addEventListener("input", e => {
    e.target.value = formatCard(e.target.value);
    e.target.style.borderColor = "";
    $("#cardIco").textContent = cardBrand(e.target.value);
  });
  $("#cardExp").addEventListener("input", e => {
    e.target.value = formatExp(e.target.value);
    e.target.style.borderColor = "";
  });
  $("#cardCvc").addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.style.borderColor = "";
  });
  $("#cardName").addEventListener("input", e => { e.target.style.borderColor = ""; });
  $("#coBack2").addEventListener("click", () => {
    setCoStep(3);
    showCoPane("co-pane-data");
  });
  $("#coConfirmPay").addEventListener("click", () => {
    if (!validatePayForm()) return;
    startProcessing();
  });
  $("#coAutoRenew").addEventListener("change", e => {
    if (!coLicense) return;
    coLicense.autoRenew = e.target.checked;
    const all = loadLicences(); const l = all.find(x => x.key === coLicense.key);
    if (l){ l.autoRenew = e.target.checked; saveLicences(all); }
  });
  $("#rnPay").addEventListener("click", payRenewal);
  $("#rnCancel").addEventListener("click", closeRenewal);
  document.addEventListener("click", e => { if (e.target.closest("[data-close-renewal]")) closeRenewal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#rnModal").classList.contains("open")) closeRenewal(); });
  window.addEventListener("hashchange", () => {
    const m = location.hash.match(/^#obnova=([A-Z0-9\-]+)/);
    if (m) openRenewal(m[1]);
  });
  if (/^#obnova=/.test(location.hash)) setTimeout(() => openRenewal(location.hash.split("=")[1]), 300);
  $("#buildNowBtn").addEventListener("click", () => {
    runBuildSequence();
  });
  $("#coDownload").addEventListener("click", downloadAgent);

  /* chat widget */
  $("#chatFab").addEventListener("click", openChat);
  $("#chatClose").addEventListener("click", closeChat);
  $("#advisorForm").addEventListener("submit", e => {
    e.preventDefault();
    advSend($("#advisorInput").value);
    $("#advisorInput").value = "";
  });
  $("#advisorQuick").addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") advSend(e.target.textContent);
  });

  /* owner admin */
  $("#admClose").addEventListener("click", closeAdmin);
  $("#admLock").addEventListener("click", lockAdmin);
  $("#admPin").addEventListener("input", () => $("#admPinErr").classList.remove("show"));
  $("#admPin").addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
  $("#admSave").addEventListener("click", saveAdmin);
  $$("#admTabs button").forEach((b, i) => b.addEventListener("click", () => {
    $$("#admTabs button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    ["adm-pane-settings", "adm-pane-lic", "adm-pane-pay", "adm-pane-how"].forEach((id, j) => $("#" + id).classList.toggle("active", i === j));
  }));
  $("#licRows").addEventListener("click", e => {
    const rn = e.target.closest("[data-renew]");
    const rv = e.target.closest("[data-revoke]");
    if (rn) renewLicence(rn.dataset.renew);
    if (rv) revokeLicence(rv.dataset.revoke);
  });
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")){ e.preventDefault(); openAdmin(); }
  });
  if (location.hash === "#admin") setTimeout(openAdmin, 300);
  window.addEventListener("hashchange", () => {
    if (location.hash === "#admin") openAdmin();
    else if ($("#adminScrim").classList.contains("open")) closeAdmin();
  });

  /* header + mobile menu */
  const topbar = $("#topbar");
  window.addEventListener("scroll", () => topbar.classList.toggle("scrolled", window.scrollY > 8), { passive: true });
  const burger = $("#hamburger"), mobileMenu = $("#mobileMenu");
  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  mobileMenu.addEventListener("click", e => {
    if (e.target.tagName === "A"){
      mobileMenu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* copy buttons in guide */
  document.addEventListener("click", e => {
    const btn = e.target.closest(".copy");
    if (!btn) return;
    const code = $(`#${btn.dataset.copy}`).textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(
      () => { btn.textContent = T().ui.btnCopied; setTimeout(() => { btn.textContent = T().ui.btnCopy; }, 1600); },
      () => {}
    );
  });

  /* init */
  startBillingEngine();
  applyOwner();
  fillAdminForm();

  const saved = localStorage.getItem("agentor-lang");
  setLang(saved && I18N[saved] ? saved : "cs");
});
