import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Feather,
  Plus,
  Settings,
} from "lucide-react";
import {
  type Data,
  type Project,
  type Task,
  uid,
  dateKey,
  formatDate,
} from "./model";

type Props = {
  data: Data;
  selected: string | null;
  select: (id: string | null) => void;
  change: (fn: (d: Data) => Data) => void;
  edit: (project: Project) => void;
  addTask: (extra: Partial<Task>) => void;
  taskRow: (task: Task, showProject?: boolean) => ReactNode;
  flash: (message: string) => void;
};

export default function Practices({
  data,
  selected,
  select,
  change,
  edit,
  addTask,
  taskRow,
  flash,
}: Props) {
  const [entry, setEntry] = useState("");
  const [entryDate, setEntryDate] = useState(dateKey());
  const [next, setNext] = useState("");
  const practice = data.projects.find(
    (p) => p.id === selected && p.category === "practice",
  );
  const practices = data.projects.filter((p) => p.category === "practice");
  const blank = (name = "", rhythm = "", notes = ""): Project => ({
    id: uid(),
    name,
    outcome: "",
    category: "practice",
    course: "",
    status: "active",
    color: "ochre",
    rhythm,
    notes,
    entries: [],
  });
  const open = (id: string | null) => {
    select(id);
    setEntry("");
    setNext("");
    setEntryDate(dateKey());
  };

  function logSession(event: FormEvent) {
    event.preventDefault();
    if (!practice || !entry.trim()) return;
    const saved = { id: uid(), date: entryDate, text: entry.trim() };
    const nextTask: Task | null = next.trim()
      ? {
          id: uid(),
          title: next.trim(),
          projectId: practice.id,
          state: "next",
          done: false,
          focus: false,
          planned: "",
          due: "",
          minutes: 25,
          energy: "medium",
          context: "computer",
          notes: "",
        }
      : null;
    change((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === practice.id
          ? { ...p, entries: [...(p.entries || []), saved] }
          : p,
      ),
      tasks: nextTask ? [...d.tasks, nextTask] : d.tasks,
    }));
    setEntry("");
    setNext("");
    flash(
      nextTask
        ? "Session saved, with a next step for when you return."
        : "A little progress, kept for next time.",
    );
  }

  if (practice) {
    const entries = [...(practice.entries || [])]
      .reverse()
      .sort((a, b) => b.date.localeCompare(a.date));
    const actions = data.tasks.filter(
      (t) => t.projectId === practice.id && !t.done,
    );
    return (
      <>
        <button className="back-link" onClick={() => open(null)}>
          <ArrowLeft size={14} /> All practices
        </button>
        <div className="page-heading">
          <div>
            <span className="eyebrow">AN ONGOING THREAD</span>
            <h1>{practice.name}</h1>
            <p>{practice.rhythm || "Return to it at your own pace."}</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => edit(structuredClone(practice))}
          >
            <Settings size={14} /> Edit practice
          </button>
        </div>
        <div className="practice-meta">
          <span className={"status-pill " + practice.status}>
            {practice.status === "complete" ? "Archived" : practice.status}
          </span>
          <span>
            <BookOpen size={13} /> {entries.length} session
            {entries.length === 1 ? "" : "s"} kept
          </span>
          <span>Outside the personal project limit</span>
        </div>
        <div className="practice-detail-layout">
          <div>
            {entries[0] && (
              <section className="last-page">
                <span className="eyebrow">
                  WHERE YOU LEFT OFF · {formatDate(entries[0].date)}
                </span>
                <p>{entries[0].text}</p>
              </section>
            )}
            <div className="section-title">
              <h3>Next time, start here</h3>
              <span className="subtle">
                {actions.length} open action{actions.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="task-list">
              {actions.map((t) => taskRow(t, false))}
              <button
                className="add-row"
                onClick={() =>
                  addTask({ projectId: practice.id, state: "next" })
                }
              >
                <Plus size={15} /> Add a small next action
              </button>
            </div>
            <section className="practice-log">
              <div className="section-title">
                <h3>
                  <Feather size={15} /> Leave a note for future you
                </h3>
              </div>
              <form onSubmit={logSession}>
                <label className="field">
                  What did you try or learn?
                  <textarea
                    required
                    rows={4}
                    maxLength={5000}
                    placeholder="What clicked? Where did you stop? What’s still a question?"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                  />
                </label>
                <label className="field">
                  One next step{" "}
                  <span>Optional · becomes an action in this practice</span>
                  <input
                    maxLength={240}
                    placeholder="e.g. Solve one sliding-window problem"
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                  />
                </label>
                <div className="practice-log-footer">
                  <label className="field">
                    Session date
                    <input
                      required
                      type="date"
                      max={dateKey()}
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                    />
                  </label>
                  <button
                    className="primary-button"
                    disabled={!entry.trim()}
                    type="submit"
                  >
                    Keep this session <Check size={14} />
                  </button>
                </div>
              </form>
            </section>
            <section className="session-history">
              <div className="section-title">
                <h3>The thread so far</h3>
                <span className="subtle">A record, without a streak</span>
              </div>
              {entries.length ? (
                entries.map((e) => (
                  <article className="session-entry" key={e.id}>
                    <time dateTime={e.date}>
                      {formatDate(e.date, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <p>{e.text}</p>
                  </article>
                ))
              ) : (
                <p className="quiet-empty">
                  Your first session starts the thread. It can keep going for
                  months.
                </p>
              )}
            </section>
          </div>
          <aside className="practice-margin">
            <span className="eyebrow">THE INTENTION</span>
            <h3>{practice.outcome || "Keep showing up. Stay curious."}</h3>
            <p>
              {practice.notes ||
                "Keep useful resources, questions, and a rough direction here. Edit this practice whenever your interests change."}
            </p>
            <div className="margin-rule" />
            <Clock size={18} />
            <p>{practice.rhythm || "Set a gentle rhythm when you’re ready."}</p>
            <small>
              A rhythm is an intention. It does not schedule tasks or send
              reminders.
            </small>
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Practices</h1>
          <p>Long threads. Small returns. A little further each time.</p>
        </div>
        <button className="primary-button" onClick={() => edit(blank())}>
          <Plus size={16} /> New practice
        </button>
      </div>
      <div className="practice-preface">
        <span className="eyebrow">FOR THE THINGS THAT KEEP GOING</span>
        <p>
          Some things aren’t meant to be finished. Learning backend, solving
          problems, writing—give them a place to grow, without a project
          deadline.
        </p>
        <span>
          Practices never use one of your two active personal project slots.
        </span>
      </div>
      {practices.length ? (
        <div className="practice-shelf">
          {practices.map((p, i) => {
            const latest = [...(p.entries || [])].sort((a, b) =>
              b.date.localeCompare(a.date),
            )[0];
            const actions = data.tasks.filter(
              (t) => t.projectId === p.id && !t.done && t.state === "next",
            );
            return (
              <button
                className="practice-cover"
                key={p.id}
                onClick={() => open(p.id)}
              >
                <span className="practice-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="practice-cover-copy">
                  <span className="eyebrow">
                    {p.status === "complete"
                      ? "ARCHIVED"
                      : p.status.toUpperCase()}{" "}
                    THREAD
                  </span>
                  <h2>{p.name}</h2>
                  <p>{p.rhythm || "At your own pace"}</p>
                  <div className="practice-cover-preview">
                    {latest ? (
                      <>
                        <span>Last time · {formatDate(latest.date)}</span>
                        <p>{latest.text}</p>
                      </>
                    ) : (
                      <p>
                        {p.outcome ||
                          "Start a session and leave a note for next time."}
                      </p>
                    )}
                  </div>
                  <div className="practice-cover-bottom">
                    <span>
                      {p.entries?.length || 0} session
                      {p.entries?.length === 1 ? "" : "s"}
                    </span>
                    <span>
                      {actions.length} next action
                      {actions.length === 1 ? "" : "s"}
                    </span>
                    <ArrowUpRight size={17} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="practice-starters">
          <button
            onClick={() =>
              edit(
                blank(
                  "Learning backend",
                  "Three focused sessions a week",
                  "Follow the questions, build small things, and keep notes on what clicks.",
                ),
              )
            }
          >
            <BookOpen size={24} strokeWidth={1.2} />
            <span className="eyebrow">A PLACE TO START</span>
            <h2>Learning backend</h2>
            <p>
              Keep your experiments, questions, and next steps in one ongoing
              thread.
            </p>
            <span className="text-button">
              Start this practice <ArrowRight size={14} />
            </span>
          </button>
          <button
            onClick={() =>
              edit(
                blank(
                  "LeetCode practice",
                  "One thoughtful problem on weekdays",
                  "Notice patterns. Write down the approach, the mistake, and what to try next.",
                ),
              )
            }
          >
            <Feather size={24} strokeWidth={1.2} />
            <span className="eyebrow">A LITTLE, OFTEN</span>
            <h2>LeetCode practice</h2>
            <p>
              A place for patterns learned, problems tried, and where to pick up
              next.
            </p>
            <span className="text-button">
              Start this practice <ArrowRight size={14} />
            </span>
          </button>
        </div>
      )}
      <p className="footnote">
        <BookOpen size={14} /> A project has an outcome. A practice has a
        direction. Both can have a next action.
      </p>
    </>
  );
}
