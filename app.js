/* ==========
  Lesson 1.1 Interactive Page
  - localStorage persistence
  - sidebar navigation + search
  - flashcards, steppers, tickets, quiz, exam
========== */

const LS = {
  theme: "l11_theme",
  focus: "l11_focus",
  complete: "l11_complete",
  notes: "l11_notes",
  steps: "l11_steps_done",
  glossary: "l11_glossary_done",
  ex2: "l11_ex2",
  ex3: "l11_ex3",
  rewrite: "l11_rewrite",
  ex5: "l11_ex5",
  ticketAttempts: "l11_ticket_attempts",
  quizAnswers: "l11_quiz_answers",
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(LS.theme, theme);
}
function getTheme() {
  return localStorage.getItem(LS.theme) || "dark";
}

function toast(msg) {
  // tiny non-blocking toast
  let t = document.createElement("div");
  t.style.position = "fixed";
  t.style.right = "14px";
  t.style.bottom = "14px";
  t.style.zIndex = 9999;
  t.style.padding = "10px 12px";
  t.style.borderRadius = "14px";
  t.style.border = "1px solid rgba(255,255,255,.18)";
  t.style.background = "rgba(0,0,0,.55)";
  t.style.color = "white";
  t.style.fontWeight = "800";
  t.style.backdropFilter = "blur(8px)";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .25s ease"; }, 1400);
  setTimeout(() => t.remove(), 1750);
}

/* ==========
  Sidebar Sections
========== */
const sections = [
  { id: "overview", title: "Lesson Overview", mini: "Objectives" },
  { id: "theory", title: "Theoretical Foundation", mini: "Concepts" },
  { id: "lab", title: "Lab Setup", mini: "Light setup" },
  { id: "exercises", title: "Hands-On Activities", mini: "Practice" },
  { id: "tickets", title: "Job Scenario Tickets", mini: "Real-world" },
  { id: "check", title: "Knowledge Check", mini: "Quiz" },
  { id: "exam", title: "Lesson Exam", mini: "Assessment" },
];

function buildNav() {
  const nav = $("#nav");
  nav.innerHTML = "";
  for (const s of sections) {
    const btn = document.createElement("button");
    btn.className = "navBtn";
    btn.innerHTML = `<span>${s.title}</span><span class="mini">${s.mini}</span>`;
    btn.addEventListener("click", () => {
      document.getElementById(s.id).scrollIntoView({ behavior: "smooth", block: "start" });
      $("#crumbs").textContent = s.title;
    });
    nav.appendChild(btn);
  }
}

/* ==========
  Search within lesson
========== */
function applySearch(query) {
  const q = query.trim().toLowerCase();
  const blocks = $$(".searchable");
  let shown = 0;

  blocks.forEach(b => {
    const title = (b.dataset.title || "").toLowerCase();
    const text = (b.textContent || "").toLowerCase();
    const hit = !q || title.includes(q) || text.includes(q);
    b.style.display = hit ? "" : "none";
    if (hit) shown++;
  });

  const mode = q ? `Search mode (${shown} matches)` : "Reading mode";
  $("#readingModeText").textContent = mode;
}

/* ==========
  Lesson Completion
========== */
function syncCompleteBtn() {
  const done = localStorage.getItem(LS.complete) === "done";
  const btn = $("#btnComplete");
  btn.textContent = done ? "✅ Lesson completed" : "⬜ Mark lesson complete";
  btn.classList.toggle("primary", !done);
  btn.classList.toggle("ghost", done);
}

function toggleComplete() {
  const done = localStorage.getItem(LS.complete) === "done";
  localStorage.setItem(LS.complete, done ? "todo" : "done");
  syncCompleteBtn();
  toast(done ? "Marked as not completed" : "Lesson completed ✅");
}

/* ==========
  Lesson Stepper
========== */
const lessonSteps = [
  { id: "s1", label: "Read overview", jump: "overview" },
  { id: "s2", label: "Study theory", jump: "theory" },
  { id: "s3", label: "Setup notebook", jump: "lab" },
  { id: "s4", label: "Do exercises", jump: "exercises" },
  { id: "s5", label: "Try tickets", jump: "tickets" },
  { id: "s6", label: "Take quiz", jump: "check" },
  { id: "s7", label: "Take exam", jump: "exam" },
];

function buildLessonStepper() {
  const wrap = $("#lessonStepper");
  const done = new Set(loadJSON(LS.steps, []));
  wrap.innerHTML = "";

  lessonSteps.forEach((s, idx) => {
    const div = document.createElement("div");
    div.className = "step" + (done.has(s.id) ? " done" : "");
    div.innerHTML = `
      <div class="stepTop">
        <div class="row" style="gap:10px">
          <div class="stepNum">${idx + 1}</div>
          <strong>${s.label}</strong>
        </div>
        <button class="btnMini">${done.has(s.id) ? "Done" : "Mark"}</button>
      </div>
      <div class="tiny muted">Click to jump</div>
    `;
    div.addEventListener("click", (e) => {
      if (e.target.classList.contains("btnMini")) {
        const next = new Set(loadJSON(LS.steps, []));
        if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
        saveJSON(LS.steps, [...next]);
        buildLessonStepper();
      } else {
        document.getElementById(s.jump).scrollIntoView({ behavior: "smooth", block: "start" });
        $("#crumbs").textContent = sections.find(x => x.id === s.jump)?.title || "Lesson";
      }
    });
    wrap.appendChild(div);
  });
}

/* ==========
  IT Map + Flashcards
========== */
const itParts = [
  { t: "Users", d: "People who need accounts and access." },
  { t: "Devices", d: "Laptops, phones, tablets, printers." },
  { t: "Networks", d: "Wi-Fi, LAN, VPN, routing, DNS." },
  { t: "Identity", d: "Logins, MFA, permissions, accounts." },
  { t: "Applications", d: "Microsoft 365, SaaS, internal apps." },
  { t: "Data", d: "Files, email, databases." },
  { t: "Security controls", d: "Patching, endpoint protection, access rules." },
];

const flash = [
  { front: "Endpoint", back: "A user device like a laptop or phone." },
  { front: "Server", back: "A computer that provides services to others (files, auth, apps)." },
  { front: "Cloud", back: "Services hosted by a provider (Microsoft/Amazon/Google)." },
  { front: "On-prem", back: "Systems hosted in your own building/data center." },
  { front: "Hybrid", back: "A mix of cloud + on-prem services." },
];

function buildItMap() {
  const wrap = $("#itMap");
  wrap.innerHTML = "";
  itParts.forEach(p => {
    const div = document.createElement("div");
    div.className = "pillItem";
    div.innerHTML = `<strong>${p.t}</strong><div class="desc">${p.d}</div>`;
    div.addEventListener("click", () => {
      toast(`${p.t}: ${p.d}`);
    });
    wrap.appendChild(div);
  });
}

function buildFlashcards() {
  const wrap = $("#flashcards");
  wrap.innerHTML = "";
  flash.forEach((f) => {
    const div = document.createElement("div");
    div.className = "flash";
    div.innerHTML = `<div class="front">${f.front}</div><div class="back">${f.back}</div>`;
    div.addEventListener("click", () => div.classList.toggle("isFlip"));
    wrap.appendChild(div);
  });
}

/* ==========
  Roles
========== */
const roleData = [
  {
    title: "Tier 1 — Service Desk / Helpdesk",
    meta: ["Password resets", "Basic troubleshooting", "Triage + escalation"],
    body: "Front line support. Focus: fast wins + clean documentation."
  },
  {
    title: "Tier 2 — Desktop Support / Specialist",
    meta: ["Deeper OS/app issues", "Imaging/deployments", "More tool access"],
    body: "Hands-on device and OS troubleshooting. Often on-site."
  },
  {
    title: "Tier 3 — Systems/Network Admin or Engineer",
    meta: ["Servers + network", "Automation", "Major incidents"],
    body: "Architecture and advanced troubleshooting."
  },
  {
    title: "IT Support Administrator (Target Role)",
    meta: ["M365/Entra/AD/Intune tools", "Access + policy", "Standard operations"],
    body: "Bridges Tier 2–3: owns systems/tools, processes, and consistent operations."
  }
];

function buildRoles() {
  const wrap = $("#roles");
  wrap.innerHTML = "";
  roleData.forEach(r => {
    const div = document.createElement("div");
    div.className = "role";
    div.innerHTML = `
      <h5>${r.title}</h5>
      <div class="roleMeta">${r.meta.map(x => `<span>• ${x}</span>`).join("")}</div>
      <div class="tiny muted" style="margin-top:8px">${r.body}</div>
    `;
    wrap.appendChild(div);
  });
}

/* ==========
  Stack Layers
========== */
const layers = [
  { t: "Hardware", d: "Laptop, dock, monitor, peripherals." },
  { t: "Operating System", d: "Windows/macOS configuration & updates." },
  { t: "Network", d: "Wi-Fi, VPN, DNS, routing, connectivity." },
  { t: "Identity", d: "Accounts, MFA, permissions, lockouts." },
  { t: "Applications", d: "Outlook, Teams, browser, SaaS tools." },
  { t: "Data", d: "Email, files, OneDrive/SharePoint." },
  { t: "Security", d: "Patching, antivirus, access rules." },
];

function buildStack() {
  const wrap = $("#stack");
  wrap.innerHTML = "";
  layers.forEach(l => {
    const div = document.createElement("div");
    div.className = "layer";
    div.innerHTML = `<strong>${l.t}</strong><div class="muted tiny">${l.d}</div>`;
    div.addEventListener("click", () => toast(`Layer: ${l.t}`));
    wrap.appendChild(div);
  });
}

/* ==========
  Troubleshooting Stepper
========== */
const tsSteps = [
  "Clarify the problem",
  "Collect symptoms",
  "Check scope",
  "Form a hypothesis",
  "Test safely",
  "Fix / workaround",
  "Confirm with the user",
  "Document",
];

function buildTroubleshootStepper() {
  const wrap = $("#troubleshootStepper");
  let done = new Set(loadJSON("l11_ts_done", []));
  wrap.innerHTML = "";

  tsSteps.forEach((label, idx) => {
    const id = `ts${idx+1}`;
    const div = document.createElement("div");
    div.className = "step" + (done.has(id) ? " done" : "");
    div.innerHTML = `
      <div class="stepTop">
        <div class="row" style="gap:10px">
          <div class="stepNum">${idx+1}</div>
          <strong>${label}</strong>
        </div>
        <button class="btnMini">${done.has(id) ? "Undo" : "Done"}</button>
      </div>
      <div class="tiny muted" id="${id}_hint"></div>
    `;
    div.querySelector(".btnMini").addEventListener("click", (e) => {
      e.stopPropagation();
      done = new Set(loadJSON("l11_ts_done", []));
      if (done.has(id)) done.delete(id); else done.add(id);
      saveJSON("l11_ts_done", [...done]);
      buildTroubleshootStepper();
    });
    wrap.appendChild(div);
  });
}

function syncNotes() {
  const ta = $("#notePad");
  ta.value = localStorage.getItem(LS.notes) || "";
  ta.addEventListener("input", () => localStorage.setItem(LS.notes, ta.value));
}

function bindFakeIssue() {
  $("#applyIssue").addEventListener("click", () => {
    const issue = $("#fakeIssue").value.trim();
    if (!issue) return toast("Type an issue first 🙂");
    $("#issueApplied").textContent = `Applied issue: “${issue}” — now click through steps and write notes.`;
    toast("Issue applied");
  });
}

/* ==========
  Lab Templates (copy)
========== */
const ticketTemplateText =
`User / Department:
Device:
Issue Summary:
Business Impact:
When did it start:
What changed recently:
Symptoms (what works / what fails):
Scope (who is affected):
Troubleshooting steps tried:
Root cause (if known):
Resolution:
User confirmation:
Next steps / prevention:`;

const itMapTemplateText =
`My IT Map (Company Example)
- Users: employees, contractors
- Devices: Windows laptops, Macs, phones
- Identity: Entra ID (cloud), Active Directory (on-prem)
- Email/Collaboration: Microsoft 365 (Exchange, Teams)
- Files: OneDrive/SharePoint
- Device Management: Intune (+ Autopilot)
- Ticketing: ServiceNow
- Network: office Wi-Fi, VPN, DNS/DHCP`;

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied ✅");
    return true;
  } catch {
    toast("Copy failed — select and copy manually");
    return false;
  }
}

function setupCopyButtons() {
  $("#ticketTemplate").textContent = ticketTemplateText;
  $("#itMapTemplate").textContent = itMapTemplateText;

  $("#copyTemplate").addEventListener("click", async () => {
    const ok = await copyToClipboard(ticketTemplateText);
    $("#copyHint").textContent = ok ? "Copied to clipboard." : "Could not copy.";
  });

  $("#copyMap").addEventListener("click", async () => {
    const ok = await copyToClipboard(itMapTemplateText);
    $("#copyHint2").textContent = ok ? "Copied to clipboard." : "Could not copy.";
  });
}

/* ==========
  Exercises persistence
========== */
const glossaryTerms = ["Endpoint", "Server", "Cloud", "On-prem", "Hybrid"];

function buildGlossaryPills() {
  const wrap = $("#glossaryPills");
  const done = new Set(loadJSON(LS.glossary, []));
  wrap.innerHTML = "";

  glossaryTerms.forEach(t => {
    const b = document.createElement("button");
    b.className = "pillBtn" + (done.has(t) ? " done" : "");
    b.textContent = done.has(t) ? `✅ ${t}` : t;
    b.addEventListener("click", () => {
      const next = new Set(loadJSON(LS.glossary, []));
      if (next.has(t)) next.delete(t); else next.add(t);
      saveJSON(LS.glossary, [...next]);
      buildGlossaryPills();
    });
    wrap.appendChild(b);
  });
}

function bindExerciseButtons() {
  $("#markEx1").addEventListener("click", () => {
    $("#ex1Hint").textContent = "Nice — glossary started. Keep adding as you learn.";
    toast("Exercise 1 marked ✅");
  });

  const layerWrap = $("#layerChecks");
  layerWrap.innerHTML = "";
  layers.map(l => l.t).forEach(name => {
    const div = document.createElement("label");
    div.className = "check";
    div.innerHTML = `<input type="checkbox" value="${name}"/><div><strong>${name}</strong><div class="tiny muted">Select if it could cause Outlook sign-in issues</div></div>`;
    layerWrap.appendChild(div);
  });

  // Load Ex2
  const ex2 = loadJSON(LS.ex2, { layers: [], q1: "", q2: "", q3: "" });
  $$("#layerChecks input").forEach(cb => cb.checked = ex2.layers.includes(cb.value));
  $("#q1").value = ex2.q1; $("#q2").value = ex2.q2; $("#q3").value = ex2.q3;

  $("#saveEx2").addEventListener("click", () => {
    const selected = $$("#layerChecks input").filter(x => x.checked).map(x => x.value);
    const data = { layers: selected, q1: $("#q1").value.trim(), q2: $("#q2").value.trim(), q3: $("#q3").value.trim() };
    saveJSON(LS.ex2, data);
    $("#ex2Hint").textContent = "Saved. Now try mapping to the most likely layer first.";
    toast("Exercise 2 saved ✅");
  });

  // Ex3
  const ex3Done = localStorage.getItem(LS.ex3) === "done";
  $("#ex3Hint").textContent = ex3Done ? "Already marked complete." : "";
  $("#markEx3").addEventListener("click", () => {
    localStorage.setItem(LS.ex3, "done");
    $("#ex3Hint").textContent = "Checklist saved mentally ✅ (add it to your notebook too).";
    toast("Exercise 3 marked ✅");
  });

  // Rewrite
  $("#rewrite").value = localStorage.getItem(LS.rewrite) || "";
  $("#saveRewrite").addEventListener("click", () => {
    localStorage.setItem(LS.rewrite, $("#rewrite").value);
    $("#rewriteHint").textContent = "Saved. Keep it empathetic + clear + next step.";
    toast("Exercise 4 saved ✅");
  });

  // Ex5
  const ex5 = loadJSON(LS.ex5, { type: "", priority: "", notes: "" });
  $("#ex5Type").value = ex5.type;
  $("#ex5Priority").value = ex5.priority;
  $("#ex5Notes").value = ex5.notes;

  $("#saveEx5").addEventListener("click", () => {
    const data = { type: $("#ex5Type").value, priority: $("#ex5Priority").value, notes: $("#ex5Notes").value.trim() };
    saveJSON(LS.ex5, data);
    $("#ex5Hint").textContent = "Saved. Remember: office-wide Wi-Fi down = high priority incident.";
    toast("Exercise 5 saved ✅");
  });
}

/* ==========
  Tickets (attempt + reveal)
========== */
const tickets = [
  {
    id: "t1",
    title: "Ticket 1 — Can’t Log In",
    meta: ["Priority: High", "M365 + MFA"],
    prompt: "“My laptop says my password is wrong. I’m locked out.”",
    tasks: [
      "What layer(s) are involved?",
      "What 3 questions do you ask?",
      "What first steps do you take?",
      "When do you escalate?"
    ],
    solution: `
<strong>Layers:</strong> Identity (account/password/MFA), possibly endpoint (keyboard layout).<br><br>
<strong>Questions:</strong>
1) Can you sign into Microsoft 365 on phone/browser?<br>
2) Did you recently change your password?<br>
3) Do you see “account locked” or just “incorrect password”?<br><br>
<strong>Safe first steps:</strong> verify username, check caps/keyboard layout, password reset/unlock if allowed, confirm MFA prompts.<br><br>
<strong>Escalate:</strong> multiple users affected, risky sign-in/lockout loops, or suspected compromise.
`
  },
  {
    id: "t2",
    title: "Ticket 2 — Teams Isn’t Working (Maybe Outage?)",
    meta: ["Priority: Medium→High", "2 users affected"],
    prompt: "“Teams won’t load for me and my coworker. Microsoft sites are slow.”",
    tasks: [
      "Determine scope and likely layer",
      "Decide user issue vs incident",
      "What do you do first?"
    ],
    solution: `
<strong>Likely layers:</strong> Network or cloud service availability.<br>
<strong>Key:</strong> scope check (two users already suspicious).<br>
<strong>Actions:</strong> test Microsoft sites from your own device, check if more reports exist, if widespread treat as incident, notify team/manager, track updates.
`
  },
  {
    id: "t3",
    title: "Ticket 3 — New Hire Needs Everything",
    meta: ["Type: Request", "Time-sensitive"],
    prompt: "“New hire starts tomorrow. Need laptop, email, Teams, SharePoint access.”",
    tasks: [
      "Identify systems involved",
      "List info needed"
    ],
    solution: `
<strong>Systems:</strong> Identity (Entra/AD), device deployment (Intune/Autopilot), M365 (Exchange/Teams), SharePoint permissions.<br>
<strong>Info needed:</strong> start date/time zone, manager approval, role/department, required apps, required groups/sites, device type.
`
  },
  {
    id: "t4",
    title: "Ticket 4 — Printer Not Printing",
    meta: ["Priority: Medium", "1 user affected"],
    prompt: "“Printer shows offline. I must print contracts today.”",
    tasks: [
      "Map possible layers",
      "Propose safe tests"
    ],
    solution: `
<strong>Layers:</strong> network (printer connectivity), endpoint (driver/queue), device (printer status).<br>
<strong>Safe tests:</strong> confirm printer name/location, power-cycle, check if others can print (scope), clear queue, remove/re-add printer. Escalate if multiple users.
`
  },
  {
    id: "t5",
    title: "Ticket 5 — Suspicious Email",
    meta: ["Priority: High", "Security"],
    prompt: "“I clicked a link in an email and now I’m worried.”",
    tasks: [
      "What do you do immediately?",
      "What do you document?"
    ],
    solution: `
<strong>Immediate:</strong> contain risk (disconnect if suspicious behavior), gather details (sender/subject/link/time), escalate per security process (SOC/IT lead).<br>
<strong>Document:</strong> timeline, what was clicked, observed symptoms, actions taken, who notified.
`
  },
];

function buildTickets() {
  const wrap = $("#ticketGrid");
  const attempts = loadJSON(LS.ticketAttempts, {});
  wrap.innerHTML = "";

  tickets.forEach(t => {
    const div = document.createElement("div");
    div.className = "ticket";
    div.innerHTML = `
      <h4>${t.title}</h4>
      <div class="meta">${t.meta.map(m => `<span>${m}</span>`).join("")}</div>
      <p class="tiny"><strong>User complaint:</strong> ${t.prompt}</p>
      <ul class="miniList">${t.tasks.map(x => `<li>${x}</li>`).join("")}</ul>

      <textarea class="textarea" placeholder="Write your attempt here...">${attempts[t.id] || ""}</textarea>

      <div class="row">
        <button class="btn primary">Save attempt</button>
        <button class="btn ghost">Reveal solution</button>
      </div>

      <details class="block innerBlock">
        <summary>Solution & thought process</summary>
        <div class="inner tiny">${t.solution}</div>
      </details>
    `;

    const ta = div.querySelector("textarea");
    const [saveBtn, revealBtn] = div.querySelectorAll("button");

    saveBtn.addEventListener("click", () => {
      const next = loadJSON(LS.ticketAttempts, {});
      next[t.id] = ta.value;
      saveJSON(LS.ticketAttempts, next);
      toast("Attempt saved ✅");
    });

    revealBtn.addEventListener("click", () => {
      div.querySelector("details").open = true;
      toast("Solution revealed");
    });

    wrap.appendChild(div);
  });
}

/* ==========
  Quiz (12)
========== */
const quiz = [
  { id:"q1", type:"mc", q:"Which best describes an incident?", options:["Install Zoom","Outlook crashes when opening","Create a new user account","Order a new laptop next quarter"], a:1, why:"Broken thing = incident." },
  { id:"q2", type:"tf", q:"“Hybrid IT” means a company uses both cloud services and on-prem systems.", a:true, why:"That’s the definition of hybrid." },
  { id:"q3", type:"short", q:"What is an endpoint?", aText:"A user device like a laptop or phone used to access services.", why:"Endpoint = user device." },
  { id:"q4", type:"mc", q:"What does SLA refer to?", options:["A security tool","A service time commitment","A type of server","A login method"], a:1, why:"SLA defines response/resolution targets." },
  { id:"q5", type:"short", q:"Why is checking scope early important?", aText:"It tells you if it’s one user or a wider incident/outage.", why:"Scope = who/how many affected." },
  { id:"q6", type:"mc", q:"Which is most likely a service request?", options:["Can’t connect to Wi-Fi","My account is locked","Please add me to the Finance SharePoint site","Teams is down company-wide"], a:2, why:"Access request = service request." },
  { id:"q7", type:"tf", q:"Tier 1 typically handles complex server outages alone.", a:false, why:"Tier 1 escalates major issues." },
  { id:"q8", type:"short", q:"Name at least 4 layers from the support stack.", aText:"Hardware, OS, Network, Identity, Applications, Data, Security.", why:"Layer thinking speeds troubleshooting." },
  { id:"q9", type:"mc", q:"Identity issues usually relate to:", options:["Printer toner","Logins, MFA, permissions","Monitor brightness","Keyboard shortcuts"], a:1, why:"Identity = auth + permissions." },
  { id:"q10", type:"short", q:"What is the last step of troubleshooting workflow, and why?", aText:"Document — for repeatability, accountability, and knowledge sharing.", why:"Documentation is part of the job." },
  { id:"q11", type:"tf", q:"Documentation is optional if you solved the issue quickly.", a:false, why:"Documentation is always important." },
  { id:"q12", type:"mc", q:"If two users report Microsoft sites are slow, your next best action is:", options:["Ignore it","Check whether the issue is broader (scope + quick test)","Reinstall Windows","Replace laptops"], a:1, why:"Always validate scope first." },
];

function buildQuiz() {
  const wrap = $("#quiz");
  const saved = loadJSON(LS.quizAnswers, {});
  wrap.innerHTML = "";

  quiz.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "q";
    div.innerHTML = `<h5>${i+1}. ${item.q}</h5>`;

    if (item.type === "mc") {
      const opts = document.createElement("div");
      opts.className = "opts";
      item.options.forEach((opt, idx) => {
        const id = `${item.id}_${idx}`;
        const row = document.createElement("label");
        row.className = "opt";
        row.innerHTML = `
          <input type="radio" name="${item.id}" value="${idx}" ${saved[item.id] == idx ? "checked" : ""}/>
          <div>${opt}</div>
        `;
        opts.appendChild(row);
      });
      div.appendChild(opts);
    }

    if (item.type === "tf") {
      const opts = document.createElement("div");
      opts.className = "opts";
      ["True","False"].forEach((opt) => {
        const v = opt === "True";
        const row = document.createElement("label");
        row.className = "opt";
        row.innerHTML = `
          <input type="radio" name="${item.id}" value="${v}" ${String(saved[item.id]) === String(v) ? "checked" : ""}/>
          <div>${opt}</div>
        `;
        opts.appendChild(row);
      });
      div.appendChild(opts);
    }

    if (item.type === "short") {
      const ta = document.createElement("textarea");
      ta.className = "textarea";
      ta.placeholder = "Type your answer...";
      ta.value = saved[item.id] || "";
      ta.addEventListener("input", () => {
        const next = loadJSON(LS.quizAnswers, {});
        next[item.id] = ta.value;
        saveJSON(LS.quizAnswers, next);
      });
      div.appendChild(ta);
    }

    // Save on choice changes
    div.addEventListener("change", () => {
      const next = loadJSON(LS.quizAnswers, {});
      const chosen = div.querySelector(`input[name="${item.id}"]:checked`);
      if (chosen) {
        next[item.id] = chosen.value;
        saveJSON(LS.quizAnswers, next);
      }
    });

    wrap.appendChild(div);
  });

  // Build key (compact)
  $("#quizKey").innerHTML = quiz.map((x, idx) => {
    let ans = "";
    if (x.type === "mc") ans = `<strong>${String.fromCharCode(65 + x.a)}</strong>`;
    if (x.type === "tf") ans = `<strong>${x.a ? "True" : "False"}</strong>`;
    if (x.type === "short") ans = `<strong>Example:</strong> ${x.aText}`;
    return `<div style="margin:10px 0"><strong>${idx+1}.</strong> ${ans}<div class="muted tiny">${x.why}</div></div>`;
  }).join("");
}

function gradeQuiz() {
  const saved = loadJSON(LS.quizAnswers, {});
  let correct = 0;
  let total = quiz.length;

  quiz.forEach(item => {
    if (item.type === "mc") {
      const val = Number(saved[item.id]);
      if (val === item.a) correct++;
    }
    if (item.type === "tf") {
      const val = String(saved[item.id]);
      if (val === String(item.a)) correct++;
    }
    if (item.type === "short") {
      // Accept any non-empty attempt for "practice" grading
      if ((saved[item.id] || "").trim().length > 0) correct++;
    }
  });

  $("#quizScore").textContent = `Score: ${correct}/${total} (Short answers count if attempted)`;
  toast("Quiz graded");
}

/* ==========
  Exam (20) - interactive + timer
========== */
const exam = [
  { id:"e1", type:"short", q:"A user says “Everything is broken.” What are your first 3 clarifying questions?" },
  { id:"e2", type:"mc", q:"Which combination best describes modern IT in many companies?", options:["Only on-prem","Only cloud","Hybrid","No servers"], a:2 },
  { id:"e3", type:"tf", q:"A request to add a user to a SharePoint site is typically an incident.", a:false },
  { id:"e4", type:"short", q:"Two departments can’t print. What does that suggest about scope and priority?" },
  { id:"e5", type:"mc", q:"Best definition of “administrator” in IT support context?", options:["Only answers phones","Manages systems/tools and policies, not just fixes","Builds computer chips","Writes marketing emails"], a:1 },
  { id:"e6", type:"mc", q:"Outlook login fails but Teams works. Which is most suspicious?", options:["Hardware","Identity","Application-specific configuration","Monitor"], a:2 },
  { id:"e7", type:"tf", q:"The goal of troubleshooting is to guess quickly, not to test logically.", a:false },
  { id:"e8", type:"short", q:"A user clicked a suspicious link. List your first 4 actions." },
  { id:"e9", type:"mc", q:"Why do tickets need documentation?", options:["To waste time","Accountability, repeatability, knowledge sharing","Only for managers","To make users feel bad"], a:1 },
  { id:"e10", type:"short", q:"Define: cloud, on-prem, hybrid." },
  { id:"e11", type:"short", q:"New hire starts tomorrow. List 5 pieces of info you need before fulfilling the request." },
  { id:"e12", type:"mc", q:"SLA is most connected to:", options:["How you greet users","Response and resolution time targets","Laptop pricing","Keyboard layout"], a:1 },
  { id:"e13", type:"tf", q:"If multiple users report the same issue, escalation may be appropriate sooner.", a:true },
  { id:"e14", type:"short", q:"User says “Wi-Fi is down.” What quick scope test can you do?" },
  { id:"e15", type:"mc", q:"Which is a “problem” record in ITSM terms?", options:["One-time password reset","Repeated VPN drop affecting many users","New laptop request","Adding a printer"], a:1 },
  { id:"e16", type:"short", q:"What does “impact vs urgency” mean?" },
  { id:"e17", type:"short", q:"A user can’t sign in and is getting MFA prompts repeatedly. What concern might this raise?" },
  { id:"e18", type:"mc", q:"Tier 1 best matches:", options:["Advanced network redesign","Ticket triage + basic troubleshooting","Writing kernel drivers","Building cloud regions"], a:1 },
  { id:"e19", type:"tf", q:"“Scope” means how severe the issue feels to the user.", a:false },
  { id:"e20", type:"short", q:"After you fix an issue, what 2 things must you do before closing the ticket?" },
];

let examRunning = false;
let examStart = 0;
let examTimerInt = null;
const EXAM_LIMIT_MIN = 25; // gentle timer

function renderExam() {
  const area = $("#examArea");
  area.classList.remove("muted","tiny");
  area.innerHTML = "";

  exam.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "q";
    div.innerHTML = `<h5>${i+1}. ${item.q}</h5>`;

    if (item.type === "mc") {
      const opts = document.createElement("div");
      opts.className = "opts";
      item.options.forEach((opt, idx) => {
        const row = document.createElement("label");
        row.className = "opt";
        row.innerHTML = `<input type="radio" name="${item.id}" value="${idx}"/><div>${opt}</div>`;
        opts.appendChild(row);
      });
      div.appendChild(opts);
    } else if (item.type === "tf") {
      const opts = document.createElement("div");
      opts.className = "opts";
      ["True","False"].forEach((opt) => {
        const v = opt === "True";
        const row = document.createElement("label");
        row.className = "opt";
        row.innerHTML = `<input type="radio" name="${item.id}" value="${v}"/><div>${opt}</div>`;
        opts.appendChild(row);
      });
      div.appendChild(opts);
    } else {
      const ta = document.createElement("textarea");
      ta.className = "textarea";
      ta.placeholder = "Type your answer...";
      div.appendChild(ta);
    }

    area.appendChild(div);
  });

  const submit = document.createElement("button");
  submit.className = "btn primary";
  submit.textContent = "Submit exam";
  submit.addEventListener("click", gradeExam);
  area.appendChild(submit);

  const hint = document.createElement("div");
  hint.className = "tiny muted";
  hint.style.marginTop = "10px";
  hint.textContent = "Passing score: 80% (auto-graded on MC/TF; short answers are for practice).";
  area.appendChild(hint);
}

function startExam() {
  examRunning = true;
  examStart = Date.now();
  $("#startExam").disabled = true;
  $("#stopExam").disabled = false;
  renderExam();
  tickExamTimer();
  examTimerInt = setInterval(tickExamTimer, 1000);
  toast("Exam started");
}

function stopExam() {
  examRunning = false;
  $("#startExam").disabled = false;
  $("#stopExam").disabled = true;
  clearInterval(examTimerInt);
  $("#examTimer").textContent = "Timer: —";
  $("#examArea").className = "examArea muted tiny";
  $("#examArea").textContent = "Exam stopped. Click “Start exam” to begin again.";
  toast("Exam stopped");
}

function tickExamTimer() {
  if (!examRunning) return;
  const elapsed = Math.floor((Date.now() - examStart) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  $("#examTimer").textContent = `Timer: ${mm}:${ss} (limit ${EXAM_LIMIT_MIN}m)`;

  if (elapsed > EXAM_LIMIT_MIN * 60) {
    toast("Time limit reached — submit when ready.");
  }
}

function gradeExam() {
  // Auto-grade MC/TF only
  const area = $("#examArea");
  let correct = 0;
  let total = exam.filter(x => x.type !== "short").length;

  exam.forEach(item => {
    if (item.type === "mc") {
      const chosen = area.querySelector(`input[name="${item.id}"]:checked`);
      if (chosen && Number(chosen.value) === item.a) correct++;
    }
    if (item.type === "tf") {
      const chosen = area.querySelector(`input[name="${item.id}"]:checked`);
      if (chosen && String(chosen.value) === String(item.a)) correct++;
    }
  });

  const pct = total ? Math.round((correct/total)*100) : 0;
  const pass = pct >= 80;
  const box = document.createElement("div");
  box.className = "score";
  box.innerHTML = `Auto-graded score (MC/TF only): <strong>${correct}/${total}</strong> • <strong>${pct}%</strong> • ${pass ? "✅ PASS" : "❌ NOT YET"}<br><span class="tiny muted">Short answers are practice—review them with the lesson solutions.</span>`;
  area.appendChild(box);
  toast(pass ? "Nice — pass ✅" : "Keep going — you got this 💪");
}

/* ==========
  Focus mode + Reset
========== */
function syncFocus() {
  const focus = localStorage.getItem(LS.focus) === "on";
  document.body.classList.toggle("focus", focus);
}

function bindUI() {
  // Theme
  setTheme(getTheme());
  $("#toggleTheme").addEventListener("click", () => {
    const cur = getTheme();
    setTheme(cur === "dark" ? "light" : "dark");
    toast("Theme changed");
  });

  // Focus
  syncFocus();
  $("#toggleFocus").addEventListener("click", () => {
    const cur = localStorage.getItem(LS.focus) === "on";
    localStorage.setItem(LS.focus, cur ? "off" : "on");
    syncFocus();
    toast(cur ? "Focus mode off" : "Focus mode on");
  });

  // Completion
  syncCompleteBtn();
  $("#btnComplete").addEventListener("click", toggleComplete);

  // Search
  $("#search").addEventListener("input", (e) => applySearch(e.target.value));
  $("#clearSearch").addEventListener("click", () => {
    $("#search").value = "";
    applySearch("");
  });

  // Reset
  $("#resetAll").addEventListener("click", () => {
    const keepTheme = localStorage.getItem(LS.theme);
    localStorage.clear();
    if (keepTheme) localStorage.setItem(LS.theme, keepTheme);
    location.reload();
  });

  // Quiz
  $("#gradeQuiz").addEventListener("click", gradeQuiz);

  // Exam
  $("#startExam").addEventListener("click", startExam);
  $("#stopExam").addEventListener("click", stopExam);
}

/* ==========
  Init
========== */
function init() {
  buildNav();
  buildLessonStepper();
  buildItMap();
  buildFlashcards();
  buildRoles();
  buildStack();
  buildTroubleshootStepper();
  syncNotes();
  bindFakeIssue();
  setupCopyButtons();
  buildGlossaryPills();
  bindExerciseButtons();
  buildTickets();
  buildQuiz();
  bindUI();

  // Initial search state
  applySearch("");

  // Set crumbs based on scroll (lightweight)
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting);
    if (visible) {
      const id = visible.target.id;
      const match = sections.find(s => s.id === id);
      if (match) $("#crumbs").textContent = match.title;
    }
  }, { root: null, threshold: 0.22 });

  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
}

init();

