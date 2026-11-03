import levels from "virtual:levels";
import { format, move, replay, proofScript, type Level } from "./model.ts";
import {
  fresh,
  load,
  save,
  encode,
  decode,
  type Progress,
} from "./progress.ts";
import { Music } from "./audio.ts";
import { drawScene } from "./art.ts";
import { drawMiniature } from "./miniature.ts";
import { environmentFor } from "./environments.ts";
import { chapterFor, chapterLevels, chapters, entryRoom } from "./chapters.ts";
import { drawWorkshop } from "./workshop-art.ts";
import { inputs, sharedWitness } from "./guarantees.ts";
import "./style.css";
const app = document.querySelector<HTMLDivElement>("#app")!;
const storage = () => ({
  getItem: (key: string) =>
    window.localStorage.getItem(`${key}:${__PROFILE__}`),
  setItem: (key: string, value: string) =>
    window.localStorage.setItem(`${key}:${__PROFILE__}`, value),
});
let loaded: ReturnType<typeof load>;
try {
  loaded = load(storage(), levels);
} catch {
  loaded = {
    progress: fresh(levels),
    warning: "Storage is unavailable. Use Copy progress to keep your journey.",
  };
}
let progress: Progress = loaded.progress;
let feedback = loaded.warning;
let focused = 0;
let hintCount = 0;
let saving = true;
const music = new Music();
const compactView = matchMedia("(max-height: 500px)");
const stagedView = matchMedia("(max-height: 500px) and (max-width: 400px)");

// Saved sound preferences never bypass the browser's explicit activation requirement.
let activated = false;
let audioPending = false;
const entry = entryRoom(new URL(location.href), levels);
if (entry.room) progress.current = entry.room;
if (entry.warning) feedback = entry.warning;
if (location.hash.startsWith("#resume=")) {
  try {
    progress = decode(decodeURIComponent(location.hash.slice(8)), levels);
    feedback = "Your progress is restored.";
  } catch (e) {
    feedback = (e as Error).message;
  }
}
let arrival =
  stagedView.matches &&
  !history().length &&
  !location.hash.startsWith("#resume=");
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function persist() {
  try {
    saving = save(storage(), progress);
  } catch {
    saving = false;
  }
}
function current(): Level {
  return levels.find((l) => l.id === progress.current)!;
}
function history() {
  return progress.histories[progress.current] ?? [];
}
function navigate(id: string) {
  if (!levels.some((l) => l.id === id)) return;
  progress.current = id;
  arrival = stagedView.matches;
  focused = 0;
  hintCount = 0;
  feedback = "";
  persist();
  location.hash = `room=${id}`;
  render();
}
function standaloneUrl() {
  const url = new URL("./index.html", location.href);
  url.hash = `resume=${encode(progress)}`;
  return url.href;
}
function button(text: string, action: string, extra = "") {
  return `<button type="button" data-command="${action}" ${extra}>${text}</button>`;
}
function chapterComplete(id: string) {
  const rooms = chapterLevels(id, levels);
  return (
    rooms.length === chapterFor(id).total &&
    rooms.every((x) => replay(x, progress.histories[x.id] ?? []).complete)
  );
}
function paintScene() {
  const l = current(),
    rooms = chapterLevels(l.id, levels);
  const restored = rooms.map(
    (x) => replay(x, progress.histories[x.id] ?? []).complete,
  );
  const compact = compactView.matches && !(stagedView.matches && arrival);
  const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
  if (l.id.startsWith("W"))
    drawWorkshop(
      canvas,
      rooms.indexOf(l) + 1,
      replay(l, history()).complete,
      restored,
      compact,
    );
  else
    (compact ? drawMiniature : drawScene)(
      canvas,
      rooms.indexOf(l) + 1,
      replay(l, history()).complete,
      restored,
    );
}
function render() {
  const l = current(),
    h = history(),
    node = replay(l, h);
  focused = Math.min(focused, Math.max(0, node.goals.length - 1));
  const goal = node.goals[focused];
  const chapter = chapterFor(l.id),
    rooms = chapterLevels(l.id, levels);
  const index = rooms.indexOf(l),
    done = rooms.filter(
      (x) => replay(x, progress.histories[x.id] ?? []).complete,
    ).length;
  const environment = environmentFor(l.id);
  const allFinished = chapterComplete(l.id);
  const resolution = allFinished ? chapter.ending : environment.resolution;
  const hasWorkshop = levels.some((x) => x.id === "W01");
  document.documentElement.style.setProperty(
    "--room-accent",
    environment.accent,
  );
  app.innerHTML = `<div class="shell" data-stage="${arrival ? "arrival" : "proof"}" data-room-id="${l.id}" data-score-id="${music.score.id}"><header class="topbar"><a class="brand" href="#room=D01" aria-label="Proof Quest, first room"><span class="brand-mark">⊢</span> <span class="brand-name">${__PROFILE__ === "embed-test" ? "PROOF CARD" : "PROOF QUEST"}</span><span class="lantern-count" aria-label="${done} of ${rooms.length} ${chapter.unit}">✦ ${done}/${rooms.length}</span><span class="edition">A SMALL ADVENTURE IN BIG IDEAS</span></a><div class="top-actions">${button(music.enabled ? "♫ Sound on" : "♪ Sound off", "sound", 'aria-label="Toggle sound" aria-pressed="' + music.enabled + '" ' + (audioPending ? "disabled" : ""))}${button("Chapters", "chapters")}<a class="expand-game" href="${escape(standaloneUrl())}" target="_blank" rel="noopener" aria-label="Expand game in a new tab" title="Expand game in a new tab">↗</a></div></header>
 <div class="layout"><aside class="sidebar"><div class="eyebrow">YOUR JOURNEY</div><h2>The Proof<br>${chapter.shortName}<span class="chapter-number">0${chapter.id}</span></h2><p class="sidebar-note">${chapter.task}</p><nav aria-label="${chapter.shortName} rooms">${rooms
   .map((r, i) => {
     const solved = replay(r, progress.histories[r.id] ?? []).complete;
     return `<button class="room-link ${r.id === l.id ? "selected" : ""}" data-room="${r.id}" ${r.id === l.id ? 'aria-current="step"' : ""}><span class="room-num">${solved ? "✓" : String(i + 1).padStart(2, "0")}</span><span>${escape(r.title)}</span><span class="room-arrow">${r.id === l.id ? "↗" : ""}</span></button>`;
   })
   .join(
     "",
   )}</nav><div class="journey-progress"><span>${done} / ${rooms.length} ${chapter.unit}</span><div class="progress-track"><i style="width:${(done / rooms.length) * 100}%"></i></div></div><p class="sidebar-foot">Take your time.<br>Every good proof starts with a question.</p></aside>
 <main><div class="arrival-heading"><h2>${String(index + 1).padStart(2, "0")} · ${escape(environment.name)}</h2>${button("Story", "story", 'aria-label="Read room story"')}</div>${button(h.length ? "Continue proof →" : "Start proof →", "begin", 'class="arrival-start primary"')}<div class="room-heading"><div><p class="eyebrow">CHAPTER 0${chapter.id} <span>/</span> ${chapter.id === 1 ? "ROOM" : "STATION"} ${String(index + 1).padStart(2, "0")}</p><h1>${escape(l.title)}</h1><p class="subtitle">${escape(l.subtitle)}</p></div><span class="room-seal">${node.complete ? "✓" : "⊢"}</span></div>
 <section class="scene" aria-label="${escape(environment.name)}${chapter.id === 1 ? (node.complete ? ", lantern lit" : ", lantern unlit") : node.complete ? ", station restored" : ", station awaiting proof"}"><canvas id="scene" aria-hidden="true"></canvas><span class="scene-label">${escape(environment.name)}</span><span class="scene-caption">${chapter.id === 1 ? (allFinished ? "The Workshop awaits at dawn." : node.complete ? "Another lantern on the way upstairs." : "Follow the lanterns. Find the way upstairs.") : allFinished ? "The Induction Railway awaits." : node.complete ? "Another station ready for work." : "A certificate for every machine."}</span></section>
 <div class="guide"><span class="pip-icon" aria-hidden="true">P</span><div><strong>PIP, THE KEEPER</strong><p>${escape(node.complete ? resolution : l.story)}</p></div>${button("Story", "story", 'class="story-button" aria-label="Read room story"')}</div>
 <section class="proof-workspace" aria-label="Live proof state"><div class="proof-heading"><span class="eyebrow proof-state-label">${node.complete ? "PROOF COMPLETE" : "YOUR PROOF STATE"}</span>${button(`${String(index + 1).padStart(2, "0")} · ${escape(environment.name)}`, "room", 'class="compact-room" aria-label="View room"')}<div class="branch-tabs" aria-label="Open goals">${node.goals.map((_, i) => `<button data-branch="${i}" aria-pressed="${focused === i}" aria-label="Inspect goal ${i + 1}">${i === 0 ? "●" : "○"} ${i + 1}</button>`).join("")}<span>${node.goals.length} open</span></div></div>
 <div class="proof-columns"><div class="hypotheses"><h2><b class="full-proof-label">WHAT YOU KNOW</b><b class="short-proof-label">FACTS</b> <span>hypotheses</span></h2><div class="context" tabindex="0" aria-label="Available hypotheses">${goal?.context.length ? goal.context.map((x) => `<div class="fact"><code>${escape(x.name)}</code><span>${escape(format(x.type))}</span></div>`).join("") : `<p class="empty">${node.complete ? "Every obligation is closed." : "No assumptions yet."}</p>`}${l.parameters ? `<div class="parameters"><strong>Given objects &amp; rules</strong>${l.parameters.map((p) => `<div>${escape(p.name)} : ${escape(p.type.replace(/->/g, "→"))}</div>`).join("")}</div>` : ""}</div></div><div class="goal-pane"><h2><b class="full-proof-label">${node.complete ? "ESTABLISHED" : "WHAT TO PROVE"}</b><b class="short-proof-label">${node.complete ? "PROVED" : "GOAL"}</b> <span>${node.complete ? "theorem" : "goal"}</span></h2><div class="formula" tabindex="0" aria-label="Current conclusion">${escape(node.complete ? format(l.nodes[0].goals[0].conclusion) : format(goal.conclusion))}</div><p class="goal-note">${node.complete ? "A complete proof, built by you." : focused ? "Inspecting this branch. Moves act on goal 1." : "One small step at a time."}</p></div></div></section>
 <section class="choices" aria-label="Proof moves">${node.complete ? `<div class="completion"><strong>${chapter.id === 1 ? "Door opened." : "Station restored."}</strong><span>${index === rooms.length - 1 ? (allFinished ? "Your chapter certificate is ready." : "This proof is complete. Explore the other stations.") : "Your next room is waiting."}</span>${button(index < rooms.length - 1 ? "Next room →" : chapter.id === 1 && hasWorkshop ? "Enter Workshop →" : chapter.id === 2 ? "Compare guarantees" : "Chapter complete ✓", index < rooms.length - 1 || (chapter.id === 1 && hasWorkshop) ? "next" : chapter.id === 2 ? "guarantees" : "chapters", 'class="primary"')}</div>` : focused ? button("Return to active goal", "active", 'class="choice"') : node.actions.length ? node.actions.map((a) => `<button class="choice" data-move="${a.id}"><span>${escape(a.label)}</span><code>${escape(a.tactic)}</code><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join("") : `<div class="dead-end"><span>Inspect this goal, then try the other route.</span>${button("Undo this choice", "undo", 'class="primary"')}</div>`}</section>
 <p class="feedback ${node.complete ? "success" : ""} ${!feedback && !node.complete ? "idle" : ""}" role="status" aria-live="polite">${escape(feedback || (node.complete ? "All goals closed. Well reasoned." : "Choose a move. You can always undo."))}</p>
 <footer class="toolbar"><div>${button("↶ Undo", "undo", h.length ? "" : "disabled")}${button("↻ Restart", "restart", 'class="secondary-control"')}${button("✧ Hint", "hint", node.complete ? "disabled" : "")}</div><div class="secondary-control">${button("Proof script", "script")}${button("Save / restore", "progress")}</div>${button("More ···", "more", 'class="compact-more"')}<span class="save-status">${saving ? "Saved on this browser" : "Session only · copy progress"}</span></footer>
 </main></div><footer class="page-footer"><span>BUILT FROM SMALL, CERTAIN STEPS.</span><span>Chapter 0${chapter.id} · ${__PROFILE__ === "embed-test" ? "Technical preview" : "A journey into Rocq"}</span></footer></div><dialog id="dialog" aria-label="Game menu"></dialog>`;
  paintScene();
  app
    .querySelectorAll<HTMLButtonElement>("[data-room]")
    .forEach((b) => (b.onclick = () => navigate(b.dataset.room!)));
  app.querySelectorAll<HTMLButtonElement>("[data-branch]").forEach(
    (b) =>
      (b.onclick = () => {
        focused = Number(b.dataset.branch);
        render();
      }),
  );
  app.querySelectorAll<HTMLButtonElement>("[data-move]").forEach(
    (b) =>
      (b.onclick = () => {
        if (current().id !== l.id || replay(l, history()).id !== node.id)
          return;
        const result = move(l, history(), b.dataset.move!);
        progress.histories[l.id] = result.history;
        feedback = result.feedback;
        hintCount = 0;
        persist();
        const now = replay(l, result.history);
        if (now.complete)
          feedback = chapterComplete(l.id)
            ? chapterFor(l.id).ending
            : environmentFor(l.id).resolution;
        music.cue(
          now.complete ? "complete" : result.accepted ? "move" : "invalid",
        );
        render();
        document
          .querySelector<HTMLButtonElement>(".choices button")
          ?.focus({ preventScroll: true });
      }),
  );
  app
    .querySelectorAll<HTMLButtonElement>("[data-command]")
    .forEach((b) => (b.onclick = () => command(b.dataset.command!)));
}
function modal(title: string, body: string) {
  const d = document.querySelector<HTMLDialogElement>("#dialog")!;
  d.innerHTML = `<header><h2>${title}</h2><button id="close-dialog" aria-label="Close dialog">×</button></header>${body}`;
  d.querySelector<HTMLButtonElement>("#close-dialog")!.onclick = () =>
    d.close();
  d.showModal();
  return d;
}
async function command(name: string) {
  const l = current();
  if (name === "begin") {
    arrival = false;
    render();
    document
      .querySelector<HTMLButtonElement>(".choices button")
      ?.focus({ preventScroll: true });
  }
  if (name === "room") {
    if (stagedView.matches) {
      arrival = true;
      render();
      document.querySelector<HTMLButtonElement>(".arrival-start")?.focus();
    } else {
      await command("story");
    }
  }
  if (name === "more") {
    const d = modal(
      "Room tools",
      `<div class="room-menu">${button("Proof script", "script")}${button("Save / restore", "progress")}${button("↻ Restart", "restart")}</div>`,
    );
    d.querySelectorAll<HTMLButtonElement>("[data-command]").forEach((b) => {
      b.onclick = () => {
        d.close();
        void command(b.dataset.command!);
      };
    });
  }
  if (name === "undo") {
    progress.histories[l.id] = history().slice(0, -1);
    focused = 0;
    feedback = "One step back. Your facts and goals are restored.";
    music.cue("undo");
    persist();
    render();
  }
  if (name === "restart") {
    const d = modal(
      "Start this room again?",
      `<p>Your other rooms are kept. This room’s moves will be cleared.</p><button id="confirm-restart" class="primary">Restart room</button>`,
    );
    d.querySelector<HTMLButtonElement>("#confirm-restart")!.onclick = () => {
      progress.histories[l.id] = [];
      feedback = "A fresh start.";
      focused = 0;
      hintCount = 0;
      persist();
      render();
    };
  }
  if (name === "active") {
    focused = 0;
    render();
  }
  if (name === "hint") {
    hintCount++;
    feedback = hintCount === 1 ? l.lesson : replay(l, history()).hint;
    music.cue("hint");
    render();
  }
  if (name === "next") navigate(levels[levels.indexOf(l) + 1].id);
  if (name === "guarantees") {
    const d = modal(
      "One witness, or one for each input?",
      `<p>Our two inputs are <code>false</code> and <code>true</code>. A certificate works when its witness equals its input.</p><h3>A witness for each input</h3><p><code>∀ x, ∃ y, x = y</code></p><p>${inputs.map((x) => `Input ${x} → choose witness ${x} ✓`).join("<br>")}</p><h3>One shared witness for every input</h3><p><code>∃ y, ∀ x, x = y</code></p><p>Try sending the same witness to both inputs:</p><div class="dialog-actions"><button data-witness="false">Use false for both</button><button data-witness="true">Use true for both</button></div><p id="witness-result" role="status" aria-live="polite">Choose a witness to test the shared guarantee.</p><p>Neither candidate works for both inputs. A shared witness always gives each input a witness, but separate witnesses need not be the same. Quantifier order changes the guarantee.</p>`,
    );
    d.querySelectorAll<HTMLButtonElement>("[data-witness]").forEach(
      (b) =>
        (b.onclick = () => {
          const rows = sharedWitness(b.dataset.witness === "true");
          d.querySelector("#witness-result")!.textContent = rows
            .map(
              (row) =>
                `Input ${row.input}, witness ${row.witness}: ${row.works ? "matches ✓" : "does not match ✗"}.`,
            )
            .join(" ");
        }),
    );
  }
  if (name === "sound") {
    if (audioPending) return;
    activated = true;
    audioPending = true;
    const next = !music.enabled;
    render();
    try {
      await music.enable(next);
      progress.sound = music.enabled;
      persist();
    } catch (e) {
      feedback = (e as Error).message;
    } finally {
      audioPending = false;
      render();
    }
  }
  if (name === "story") {
    const solved = replay(l, history()).complete;
    const all = chapterComplete(l.id);
    const room = environmentFor(l.id);
    modal(
      room.name,
      `<p>${escape(l.story)}</p>${solved ? `<p>${escape(all ? chapterFor(l.id).ending : room.resolution)}</p>` : ""}<h3>The proof idea</h3><p>${escape(l.lesson)}</p>${l.parameters ? `<h3>Objects and rules</h3><p>${l.parameters.map((p) => `${escape(p.name)} : ${escape(p.type)}`).join("<br>")}</p>` : ""}${l.id === "W06" ? `<p>One shared witness guarantees a witness for each input. Try the comparison after finishing this station.</p>` : ""}`,
    );
  }
  if (name === "script") {
    modal(
      "Your Rocq proof",
      `<p>Each move becomes a tactic. Completed proofs end with Qed.</p><pre>${escape(proofScript(l, history()))}</pre><p class="small">This edition’s offered moves are checked with Rocq during development. Rocq does not run in your browser.</p>`,
    );
  }
  if (name === "chapters") {
    const d = modal(
      "Your journey",
      `<p>Jump to any available room. No keys or accounts required.</p><p><a class="standalone" href="${escape(standaloneUrl())}" target="_blank" rel="noopener">Open full game ↗</a></p>${chapters
        .map((chapter) => {
          const available = levels.filter((x) =>
            x.id.startsWith(chapter.prefix),
          );
          return available.length
            ? `<h3>0${chapter.id} · ${chapter.name}</h3><p><a class="standalone" href="chapter-${chapter.id}.html" target="_blank" rel="noopener">Share Chapter ${chapter.id} ↗</a></p><div class="room-menu">${available.map((x) => `<button data-select-room="${x.id}">${x.id.slice(1)} · ${escape(x.title)}</button>`).join("")}</div>`
            : `<p>0${chapter.id} · ${chapter.name} <span>Not in this edition</span></p>`;
        })
        .join(
          "",
        )}<div class="coming"><p>03 · The Induction Railway <span>Coming soon</span></p><p>04 · The Invariant Observatory <span>Coming soon</span></p></div><details><summary>Proof glossary</summary><dl><dt>Hypothesis</dt><dd>A fact available in this branch. It can be reused.</dd><dt>Goal</dt><dd>The proposition you need to prove.</dd><dt>Branch</dt><dd>One obligation, with its own facts. Every open branch must close.</dd><dt>A, B, C</dt><dd>Arbitrary propositions: statements that may have proofs.</dd><dt>AND · ∧</dt><dd>Both parts. Unpack it in a fact; prove both parts in a goal.</dd><dt>OR · ∨</dt><dd>At least one part. Handle both cases in a fact; choose a side in a goal.</dd><dt>For every · ∀</dt><dd>A rule for every object of the stated type. Introduce an arbitrary object to prove it; use an in-scope object to specialize it.</dd><dt>There exists · ∃</dt><dd>A witness together with its evidence. Choose a witness to prove it; discover a witness when unpacking it.</dd><dt>Witness scope</dt><dd>Use an object only where it is available. Evidence about x does not become evidence about a different object.</dd><dt>Implies · →</dt><dd>A rule from a premise to a conclusion. To prove one, assume the premise.</dd></dl></details><label class="volume">Sound volume <input id="volume" type="range" min="0" max="1" step="0.05" value="${progress.volume}"></label>`,
    );
    d.querySelectorAll<HTMLButtonElement>("[data-select-room]").forEach(
      (b) => (b.onclick = () => navigate(b.dataset.selectRoom!)),
    );
    d.querySelector<HTMLInputElement>("#volume")!.oninput = (e) => {
      progress.volume = Number((e.target as HTMLInputElement).value);
      music.setVolume(progress.volume);
      persist();
    };
  }
  if (name === "progress") {
    const d = modal(
      "Keep your progress",
      `<p>Progress saves automatically on this browser. Copy this code to move between X, another browser, or another device.</p><label for="progress-code">Progress code</label><textarea id="progress-code" spellcheck="false">${encode(progress)}</textarea><div class="dialog-actions"><button id="copy-progress" class="primary">Copy progress</button><button id="restore-progress">Restore code</button></div><p id="import-result" role="status"></p><p class="small">A code is local to this edition. No account, cloud save, or server is involved.</p>`,
    );
    const area = d.querySelector<HTMLTextAreaElement>("#progress-code")!,
      result = d.querySelector<HTMLElement>("#import-result")!;
    d.querySelector<HTMLButtonElement>("#copy-progress")!.onclick =
      async () => {
        area.select();
        try {
          await navigator.clipboard.writeText(area.value);
          result.textContent = "Copied. Keep this code somewhere safe.";
        } catch {
          result.textContent =
            "Select and copy the code above. Clipboard access is unavailable.";
        }
      };
    d.querySelector<HTMLButtonElement>("#restore-progress")!.onclick = () => {
      try {
        const restored = decode(area.value.trim(), levels);
        progress = restored;
        arrival = false;
        focused = 0;
        feedback = "Progress restored.";
        music.setVolume(progress.volume);
        if (!progress.sound) void music.enable(false);
        persist();
        location.hash = `room=${progress.current}`;
        render();
      } catch (e) {
        result.textContent = (e as Error).message;
      }
    };
  }
}
compactView.addEventListener("change", paintScene);
stagedView.addEventListener("change", paintScene);
window.addEventListener("hashchange", () => {
  const m = /^#room=([DW]\d{2})$/.exec(location.hash);
  if (m && levels.some((l) => l.id === m[1]) && m[1] !== progress.current)
    navigate(m[1]);
});
document.addEventListener("visibilitychange", () => music.visibility());
window.addEventListener("pagehide", () => music.pause());
window.addEventListener("pageshow", () => {
  if (activated && music.enabled) music.start();
});
music.volume = progress.volume;
persist();
render();
