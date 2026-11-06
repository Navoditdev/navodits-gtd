import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Download,
  Ellipsis,
  ExternalLink,
  Flag,
  Folder,
  GraduationCap,
  Inbox,
  Layers,
  Lightbulb,
  Link,
  Menu,
  Monitor,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Upload,
  WifiOff,
  X,
  Zap,
  Pause,
  Play,
} from "lucide-react";
import {
  type Data,
  type Task,
  type Page,
  type Project,
  type Exploration,
  load,
  persist,
  uid,
  dateKey,
  addDays,
  parseDate,
  formatDate,
  personalCount,
  availableTask,
  rankTasks,
  validData,
  normalize,
  isWeeklyReview,
  completeWeeklyReview,
  isTodayTask,
} from "./model";

import Practices from "./Practices";

const nav: [Page, typeof Sun][] = [
  ["Today", Sun],
  ["Inbox", Inbox],
  ["What can I do now?", Zap],
  ["Projects", Layers],
  ["Practices", BookOpen],
  ["Calendar", CalendarDays],
  ["Exploration", Compass],
  ["Weekly review", CheckCheck],
];
const reviewSteps = [
  [
    "Collect your loose ends",
    "Capture the thoughts, notes, and little things taking up space.",
    "Inbox",
  ],
  [
    "Get your inbox clear",
    "Decide what each item means and where it belongs.",
    "Inbox",
  ],
  [
    "Look at the week ahead",
    "Check your deadlines and make room for real work.",
    "Calendar",
  ],
  [
    "Review projects and practices",
    "Check projects and ongoing practices. Give each a small, visible next step.",
    "Projects",
  ],
  [
    "Check what you’re waiting for",
    "Follow up where a gentle nudge would help.",
    "Inbox",
  ],
  [
    "Make room for what matters",
    "Pause a project if your plate feels full. Revisit your curiosity.",
    "Exploration",
  ],
];
const labelContext = (context: string) =>
  ({
    computer: "At my computer",
    phone: "On my phone",
    anywhere: "Anywhere",
    errands: "Out and about",
    all: "Any context",
  })[context] || context;
const energyLabel = (energy: string) =>
  energy.charAt(0).toUpperCase() + energy.slice(1) + " energy";
function Art({ kind = 0 }: { kind?: number }) {
  return (
    <svg
      className={"art art-" + kind}
      viewBox="0 0 300 100"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={"dots" + kind}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".6" fill="currentColor" opacity=".13" />
        </pattern>
      </defs>
      <rect width="300" height="100" fill={`url(#dots${kind})`} />
      {kind === 0 ? (
        <>
          {[0, 1, 2].map((n) => (
            <path
              key={n}
              d={`M-10 50 C15 ${5 + n * 12}, 25 ${5 + n * 12}, 50 50 S85 ${95 - n * 12},110 50 S145 ${5 + n * 12},170 50 S205 ${95 - n * 12},230 50 S265 ${5 + n * 12},310 50`}
              stroke="currentColor"
              strokeWidth="1"
              opacity={1 - n * 0.25}
            />
          ))}
        </>
      ) : kind === 1 ? (
        <>
          {[18, 35, 21, 48, 67, 32, 44, 55, 25, 38, 17, 29].map((h, i) => (
            <path
              key={i}
              d={`M${16 + i * 23} 83 v-${h} h17 v${h}`}
              stroke="currentColor"
              opacity={0.4 + (i % 3) * 0.2}
            />
          ))}
          <path d="M0 84H300" stroke="currentColor" />
        </>
      ) : kind === 2 ? (
        <>
          <circle cx="211" cy="25" r="10" stroke="currentColor" />
          <circle cx="202" cy="21" r="1.5" fill="currentColor" />
          {[
            [43, 20],
            [77, 37],
            [160, 16],
            [263, 56],
            [119, 64],
            [29, 66],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x - 3} ${y}h6 M${x} ${y - 3}v6`}
              stroke="currentColor"
              opacity=".6"
            />
          ))}
          <path
            d="m120 48 54-25 7 15-54 25zM147 54v11m0-3-25 34m25-34 25 34m-25-34v34"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      ) : (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={`M${-40 + i * 38} -10 C${100 + i * 9} 40,${-70 + i * 38} 55,${70 + i * 38} 110`}
              stroke="currentColor"
              opacity={i % 2 ? 0.7 : 0.35}
            />
          ))}
        </>
      )}
    </svg>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = ref.current;
    const focus =
      el?.querySelector<HTMLElement>(
        "input:not([type=checkbox]),textarea,select",
      ) || el?.querySelector<HTMLElement>("button");
    focus?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && el) {
        const list = Array.from(
          el.querySelectorAll<HTMLElement>(
            'button,input,textarea,select,a[href],[tabindex="0"]',
          ),
        ).filter((n) => !n.hasAttribute("disabled"));
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      before?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"modal " + (wide ? "modal-wide" : "")}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App({ cloud }: { cloud?: { data: Data; setData: React.Dispatch<React.SetStateAction<Data>>; status: string; sync: () => void; signOut: () => void } }) {
  const [localData, setLocalData] = useState<Data>(load);
  const data = cloud?.data ?? localData;
  const setData = cloud?.setData ?? setLocalData;
  const [page, setPage] = useState<Page>("Today");
  const [mobile, setMobile] = useState(false);
  const [taskDraft, setTaskDraft] = useState<Task | null>(null);
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [exploreDraft, setExploreDraft] = useState<Exploration | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [intent, setIntent] = useState<"progress" | "explore">("progress");
  const [minutes, setMinutes] = useState(30);
  const [energy, setEnergy] = useState("medium");
  const [context, setContext] = useState("all");
  const [projectCategory, setProjectCategory] = useState<
    "all" | "coursework" | "personal"
  >("all");
  const [inboxTab, setInboxTab] = useState("inbox");
  const [exploreFilter, setExploreFilter] = useState("All");
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [calendarDate, setCalendarDate] = useState(dateKey());
  const [calendarView, setCalendarView] = useState<"month" | "agenda">("month");
  const [reviewDone, setReviewDone] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page, selectedProject]);
  const [today, setToday] = useState(dateKey);
  useEffect(() => {
    const refresh = () => setToday(dateKey());
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const flash = (message: string) => setToast(message);
  const change = (fn: (d: Data) => Data) => setData((d) => fn(d));
  const go = (p: Page) => {
    setReviewDone(false);
    setPage(p);
    setMobile(false);
    setSelectedProject(null);
  };
  const newTask = (extra: Partial<Task> = {}) =>
    setTaskDraft({
      id: uid(),
      title: "",
      projectId: "",
      state: "inbox",
      done: false,
      focus: false,
      due: "",
      planned: "",
      minutes: 15,
      energy: "medium",
      context: "computer",
      notes: "",
      ...extra,
    });
  const newProject = () =>
    setProjectDraft({
      id: uid(),
      name: "",
      outcome: "",
      category: projectCategory === "coursework" ? "coursework" : "personal",
      course: "",
      status: "active",
      color: "terracotta",
    });
  const newExploration = () =>
    setExploreDraft({
      id: uid(),
      title: "",
      description: "",
      tag: "Curiosity",
      notes: "",
      links: [],
      art: Math.floor(Math.random() * 4),
    });
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        data.settings.theme === "dark" ? "#1c1916" : "#f6f1e7",
      );
    if (!cloud) setStorageError(!persist(data));
  }, [data]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const yes = () => setOnline(true),
      no = () => setOnline(false),
      install = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
      };
    window.addEventListener("online", yes);
    window.addEventListener("offline", no);
    window.addEventListener("beforeinstallprompt", install);
    return () => {
      window.removeEventListener("online", yes);
      window.removeEventListener("offline", no);
      window.removeEventListener("beforeinstallprompt", install);
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => (s === null ? "" : null));
        return;
      }
      if (
        (e.target as HTMLElement).closest(
          "input,textarea,select,[contenteditable]",
        ) ||
        taskDraft ||
        projectDraft ||
        exploreDraft ||
        settings ||
        search !== null ||
        focusTask
      )
        return;
      if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        newTask();
      }
      if (e.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [taskDraft, projectDraft, exploreDraft, settings, search, focusTask]);
  useEffect(() => {
    if (!focusRunning || !focusTask) return;
    const started = Date.now() - focusSeconds * 1000;
    const interval = setInterval(
      () => setFocusSeconds(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(interval);
  }, [focusRunning, focusTask?.id]);
  const patchTask = (id: string, patch: Partial<Task>) =>
    change((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  const toggleTask = (task: Task) => {
    if (isWeeklyReview(task)) {
      if (task.done) return;
      change((d) => completeWeeklyReview(d, today));
      flash("Weekly review complete. Your next Saturday review is scheduled.");
      return;
    }
    patchTask(task.id, { done: !task.done });
    flash(task.done ? "Task reopened" : "One less thing on your mind.");
  };
  const getProject = (id: string) => data.projects.find((p) => p.id === id);
  const available = data.tasks.filter((t) => availableTask(t, data.projects));
  const inbox = data.tasks.filter((t) => !t.done && t.state === "inbox");
  const focused = available.filter((t) => isTodayTask(t, today));
  const deadlines = data.tasks
    .filter((t) => !t.done && t.due)
    .sort((a, b) => a.due.localeCompare(b.due));
  const count = personalCount(data);
  const activeProjects = data.projects.filter((p) => p.status === "active");
  const reviewTask = data.tasks.find((t) => isWeeklyReview(t) && !t.done);
  const reviewDue = Boolean(reviewTask && reviewTask.due <= today);
  const openTask = (task: Task) => {
    if (isWeeklyReview(task)) {
      go("Weekly review");
      setReviewDone(false);
    } else setTaskDraft({ ...task });
  };
  const startFocus = (task: Task) => {
    if (isWeeklyReview(task)) {
      openTask(task);
      return;
    }
    setFocusTask(task);
    setFocusSeconds(0);
    setFocusRunning(true);
  };
  const taskRow = (task: Task, showProject = true) => {
    const project = getProject(task.projectId);
    const overdue = task.due && task.due < today;
    return (
      <div className={"task-row " + (task.done ? "is-done" : "")} key={task.id}>
        <button
          className={"checkbox " + (task.done ? "checked" : "")}
          aria-label={(task.done ? "Reopen " : "Complete ") + task.title}
          onClick={() => toggleTask(task)}
          disabled={isWeeklyReview(task) && task.done}
        >
          {task.done && <Check size={12} />}
        </button>
        <button className="task-content" onClick={() => openTask(task)}>
          <span className="task-title">{task.title}</span>
          {isWeeklyReview(task) && (
            <span className="task-project review-task-label">
              <CheckCheck size={12} /> Every Saturday · open review
            </span>
          )}
          {showProject && project && (
            <span className="task-project">
              <span className={"dot " + project.color} />
              {project.name}
            </span>
          )}
        </button>
        <div className="task-trailing">
          <span className="duration">
            <Clock size={12} />
            {task.minutes}m
          </span>
          {task.due && (
            <span className={"task-due " + (overdue ? "overdue" : "")}>
              <Flag size={12} />
              {task.due === today ? "Today" : formatDate(task.due)}
            </span>
          )}
          <button
            className={
              "icon-button focus-toggle " + (task.focus ? "selected" : "")
            }
            title={task.focus ? "Remove from Today" : "Add to Today"}
            aria-label={task.focus ? "Remove from Today" : "Add to Today"}
            onClick={() => patchTask(task.id, { focus: !task.focus })}
          >
            <Target size={15} />
          </button>
        </div>
      </div>
    );
  };
  const pageHeading = (
    title: string,
    description: string,
    action?: ReactNode,
  ) => (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
  const empty = (title: string, description: string, action?: ReactNode) => (
    <div className="empty">
      <span className="empty-icon">
        <CheckCheck size={26} strokeWidth={1.2} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
  const projectCard = (project: Project) => {
    const tasks = data.tasks.filter((t) => t.projectId === project.id);
    const done = tasks.filter((t) => t.done).length;
    const next = tasks.find((t) => !t.done && t.state === "next");
    return (
      <button
        className="project-card"
        key={project.id}
        onClick={() => setSelectedProject(project.id)}
      >
        <div className="project-card-top">
          <span className={"project-icon " + project.color}>
            {project.category === "coursework" ? (
              <GraduationCap size={18} />
            ) : (
              <Folder size={18} />
            )}
          </span>
          <ArrowUpRight size={16} />
        </div>
        <h3>{project.name}</h3>
        <p>{project.outcome || "Add a clear outcome for this project."}</p>
        <div className="project-card-meta">
          <span
            className={
              "tag " + (project.category === "coursework" ? "blue-tag" : "")
            }
          >
            {project.course ||
              (project.category === "coursework" ? "Coursework" : "Personal")}
          </span>
          <span>
            {done}/{tasks.length} actions
          </span>
        </div>
        <div className="progress-track">
          <span
            style={{
              width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="project-next">
          <ArrowRight size={13} />
          <span>{next ? next.title : "Choose a next action"}</span>
        </div>
      </button>
    );
  };
  const explorationCard = (e: Exploration) => (
    <button
      className="exploration-card"
      key={e.id}
      onClick={() => setExploreDraft(structuredClone(e))}
    >
      <Art kind={e.art} />
      <div className="exploration-card-body">
        <span className="eyebrow">{e.tag}</span>
        <h3>{e.title}</h3>
        <p>{e.description || "A little thread worth following."}</p>
        <div className="exploration-card-bottom">
          <span>
            {e.links.length
              ? `${e.links.length} saved link${e.links.length === 1 ? "" : "s"}`
              : "Just a spark"}
          </span>
          <ArrowUpRight size={15} />
        </div>
      </div>
    </button>
  );
  const personalPanel = (
    <div className="side-section">
      <div className="section-title">
        <h3>Active personal projects</h3>
        <span className="subtle">
          {count} / {data.settings.limit}
        </span>
      </div>
      <p className="helper">
        Two at a time. Paused and someday stay unlimited.
      </p>
      {data.projects
        .filter((p) => p.category === "personal" && p.status === "active")
        .map((p) => (
          <button
            key={p.id}
            className="side-project"
            onClick={() => {
              setPage(p.category === "practice" ? "Practices" : "Projects");
              setSelectedProject(p.id);
            }}
          >
            <span className={"dot " + p.color} />
            <span>{p.name}</span>
            <ChevronRight size={14} />
          </button>
        ))}
      {count < data.settings.limit ? (
        <button
          className="text-button add-project-small"
          onClick={() => {
            setProjectCategory("personal");
            setProjectDraft({
              id: uid(),
              name: "",
              outcome: "",
              category: "personal",
              course: "",
              status: "active",
              color: "terracotta",
            });
          }}
        >
          <Plus size={14} /> {data.settings.limit - count} open project slot
          {data.settings.limit - count === 1 ? "" : "s"}
        </button>
      ) : (
        <p className="helper">
          Your plate is full. Finish or pause one to make room.
        </p>
      )}
    </div>
  );

  const renderToday = () => (
    <>
      {pageHeading(
        "Today",
        `A little clarity. A good place to start.`,
        <div className="date-pill">
          <CalendarDays size={14} />
          {new Date().toLocaleDateString("en", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </div>,
      )}
      <div className="today-layout">
        <div className="today-main">
          <div className="focus-intro">
            <span className="eyebrow">
              <span className="live-dot" /> YOUR DAILY FOCUS
            </span>
            <h2>Make room for what matters.</h2>
            <p>Pick a few things. Give them your attention.</p>
          </div>
          <div className="section-title">
            <h3>
              <Target size={16} /> Your focus{" "}
              <span className="count-badge">{focused.length}</span>
            </h3>
            <span className="subtle">
              {focused.reduce((s, t) => s + t.minutes, 0)} min planned
            </span>
          </div>
          <div className="task-list">
            {focused.length
              ? focused.map((t) => taskRow(t))
              : empty(
                  "A little breathing room",
                  "Add a task to your focus when you’re ready.",
                )}
            <button
              className="add-row"
              onClick={() =>
                newTask({ state: "next", focus: true, planned: today })
              }
            >
              <Plus size={16} /> Add a focus task <kbd>N</kbd>
            </button>
          </div>
          <div className="now-banner">
            <span className="banner-icon">
              <Zap size={21} />
            </span>
            <div>
              <h3>A little time on your hands?</h3>
              <p>Find a next action that fits the moment.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Find something to do now"
              onClick={() => go("What can I do now?")}
            >
              <ArrowRight size={19} />
            </button>
          </div>
          <div className="section-title deadlines-title">
            <h3>
              <Flag size={16} /> Upcoming deadlines
            </h3>
            <button className="text-button" onClick={() => go("Calendar")}>
              View calendar <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="deadline-list">
            {deadlines.length ? (
              deadlines.slice(0, 5).map((t) => (
                <button
                  className="deadline-row"
                  key={t.id}
                  onClick={() => openTask(t)}
                >
                  <span
                    className={"deadline-date " + (t.due < today ? "late" : "")}
                  >
                    <b>{parseDate(t.due).getDate()}</b>
                    <small>
                      {parseDate(t.due).toLocaleDateString("en", {
                        month: "short",
                      })}
                    </small>
                  </span>
                  <span className="deadline-copy">
                    <span>{t.title}</span>
                    <small>
                      {getProject(t.projectId)?.course ||
                        getProject(t.projectId)?.name ||
                        "Task"}
                    </small>
                  </span>
                  <span
                    className={
                      "deadline-distance " + (t.due < today ? "overdue" : "")
                    }
                  >
                    {t.due < today
                      ? "Overdue"
                      : t.due === today
                        ? "Today"
                        : formatDate(t.due, { weekday: "short" })}
                  </span>
                </button>
              ))
            ) : (
              <p className="helper">No deadlines on the horizon.</p>
            )}
          </div>
        </div>
        <aside className="today-aside">
          {personalPanel}
          <div className="review-card">
            <span className="review-orbit">
              <CheckCheck size={24} strokeWidth={1.5} />
            </span>
            <span className="eyebrow">A MOMENT TO RESET</span>
            <h3>Your weekly review</h3>
            <p>Clear the loose ends. See the bigger picture. Start fresh.</p>
            {reviewTask && (
              <p className="review-schedule-copy">
                {reviewDue ? "Due " : "Next: "}
                {formatDate(reviewTask.due, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · all day
              </p>
            )}
            <button
              className="secondary-button"
              onClick={() => go("Weekly review")}
            >
              {reviewDue ? "Start your review" : "Review early"}
              <ArrowRight size={14} />
            </button>
            <small>
              {data.reviewed
                ? `Last reviewed ${formatDate(data.reviewed)}`
                : "20 minutes. Every Saturday."}
            </small>
          </div>
          <button className="curiosity-nudge" onClick={() => go("Exploration")}>
            <Compass size={17} />
            <span>Leave a little room for curiosity.</span>
            <ArrowUpRight size={14} />
          </button>
        </aside>
      </div>
    </>
  );
  const renderInbox = () => {
    const filtered = data.tasks.filter((t) => !t.done && t.state === inboxTab);
    return (
      <>
        {pageHeading(
          "Inbox",
          "Get it out of your head. Give it a place to land.",
          <button className="primary-button" onClick={() => newTask()}>
            <Plus size={16} /> Capture a thought
          </button>,
        )}
        <div className="tabs">
          {[
            ["inbox", "Inbox"],
            ["next", "Next actions"],
            ["waiting", "Waiting for"],
            ["someday", "Someday"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={inboxTab === key ? "active" : ""}
              onClick={() => setInboxTab(key)}
            >
              {label}
              <span>
                {data.tasks.filter((t) => !t.done && t.state === key).length}
              </span>
            </button>
          ))}
        </div>
        {inboxTab === "inbox" && (
          <div className="inline-note">
            <Inbox size={17} />
            <p>
              Capture first. Click an item to clarify it, choose a project, and
              decide its next step.
            </p>
          </div>
        )}
        <div className="task-list">
          {filtered.length
            ? filtered.map((t) => taskRow(t))
            : empty(
                inboxTab === "inbox"
                  ? "A clear inbox. A clearer mind."
                  : "Nothing here yet.",
                inboxTab === "inbox"
                  ? "Your thoughts have a home whenever you need it."
                  : "Move an item here when it belongs.",
              )}
          <button
            className="add-row"
            onClick={() => newTask({ state: inboxTab as Task["state"] })}
          >
            <Plus size={16} /> Add an item <kbd>N</kbd>
          </button>
        </div>
        <details className="completed-section">
          <summary>
            Completed <span>{data.tasks.filter((t) => t.done).length}</span>
            <ChevronDown size={14} />
          </summary>
          <div className="task-list">
            {data.tasks.filter((t) => t.done).map((t) => taskRow(t))}
          </div>
        </details>
      </>
    );
  };
  const renderNow = () => {
    const matches = rankTasks(
      data.tasks,
      data.projects,
      minutes,
      energy,
      context,
    );
    return (
      <>
        {pageHeading(
          "What can I do now?",
          "Meet yourself where you are. Find one good next step.",
        )}
        <div className="intent-tabs">
          <button
            className={intent === "progress" ? "active" : ""}
            onClick={() => setIntent("progress")}
          >
            <Zap size={15} /> Make progress
          </button>
          <button
            className={intent === "explore" ? "active" : ""}
            onClick={() => setIntent("explore")}
          >
            <Compass size={15} /> Follow my curiosity
          </button>
        </div>
        {intent === "progress" ? (
          <>
            <div className="filter-bar">
              <label>
                <span>
                  <Clock size={15} /> I have
                </span>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                >
                  {[5, 15, 20, 30, 60, 120].map((n) => (
                    <option key={n} value={n}>
                      {n} minutes
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <Zap size={15} /> I’m feeling
                </span>
                <select
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                >
                  {["low", "medium", "high"].map((v) => (
                    <option key={v} value={v}>
                      {energyLabel(v)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <Monitor size={15} /> I’m
                </span>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                >
                  {["all", "computer", "phone", "anywhere", "errands"].map(
                    (v) => (
                      <option key={v} value={v}>
                        {labelContext(v)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <div className="section-title">
              <h3>Good fits for right now</h3>
              <span className="subtle">
                {matches.length} available action
                {matches.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="recommendations">
              {matches.slice(0, 5).map((t, i) => (
                <div
                  className={"recommendation " + (i === 0 ? "best-match" : "")}
                  key={t.id}
                >
                  <div className="recommendation-top">
                    <span
                      className={
                        "recommendation-number " + (i === 0 ? "accent" : "")
                      }
                    >
                      {i === 0 ? (
                        <Sparkles size={19} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <div>
                      <div className="recommendation-title">
                        <button onClick={() => openTask(t)}>{t.title}</button>
                        {i === 0 && (
                          <span className="best-label">
                            A GOOD PLACE TO START
                          </span>
                        )}
                      </div>
                      <p>
                        {getProject(t.projectId)?.name || "Next action"}
                        {t.due ? ` · Due ${formatDate(t.due)}` : ""}
                      </p>
                    </div>
                    <button
                      className={
                        i === 0 ? "primary-button" : "secondary-button"
                      }
                      onClick={() => startFocus(t)}
                    >
                      Start <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="match-reasons">
                    <span>
                      <Clock size={12} />
                      {t.minutes} min · fits your time
                    </span>
                    <span>
                      <Zap size={12} />
                      {energyLabel(t.energy)}
                    </span>
                    <span>
                      {t.context === "phone" ? (
                        <Smartphone size={12} />
                      ) : (
                        <Monitor size={12} />
                      )}{" "}
                      {labelContext(t.context)}
                    </span>
                  </div>
                </div>
              ))}
              {!matches.length &&
                empty(
                  "Nothing quite fits these filters.",
                  "Try a little more time or another context. You can also follow your curiosity.",
                  <button
                    className="secondary-button"
                    onClick={() => setIntent("explore")}
                  >
                    Explore something <Compass size={14} />
                  </button>,
                )}
            </div>
            <p className="footnote">
              <Lightbulb size={14} /> Suggestions use your estimates, context,
              project status, and planned dates.
            </p>
          </>
        ) : (
          <>
            <div className="explore-intro">
              <Compass size={23} />
              <div>
                <h3>No output required.</h3>
                <p>Pick a thread and see where it goes. Curiosity is enough.</p>
              </div>
            </div>
            <div className="exploration-grid">
              {data.explorations.map(explorationCard)}
            </div>
            {!data.explorations.length &&
              empty(
                "What are you curious about?",
                "Save the first thread you’d like to follow.",
                <button className="secondary-button" onClick={newExploration}>
                  Add a curiosity
                </button>,
              )}
          </>
        )}
      </>
    );
  };
  const renderProjects = () => {
    const selected = data.projects.find((p) => p.id === selectedProject);
    if (selected) {
      const tasks = data.tasks.filter((t) => t.projectId === selected.id);
      return (
        <>
          <button
            className="back-link"
            onClick={() => setSelectedProject(null)}
          >
            <ArrowLeft size={14} /> All projects
          </button>
          {pageHeading(
            selected.name,
            selected.outcome || "What will success look like?",
            <button
              className="secondary-button"
              onClick={() => setProjectDraft({ ...selected })}
            >
              <Settings size={14} /> Edit project
            </button>,
          )}
          <div className="project-detail-meta">
            <span className="tag">
              {selected.category === "coursework"
                ? selected.course || "Coursework"
                : "Personal"}
            </span>
            <span className={"status-pill " + selected.status}>
              {selected.status}
            </span>
          </div>
          <div className="section-title">
            <h3>Next actions</h3>
            <span className="subtle">
              {tasks.filter((t) => t.done).length} of {tasks.length} complete
            </span>
          </div>
          <div className="task-list">
            {tasks.filter((t) => !t.done).map((t) => taskRow(t, false))}
            <button
              className="add-row"
              onClick={() => newTask({ projectId: selected.id, state: "next" })}
            >
              <Plus size={16} /> Add next action
            </button>
          </div>
          {!tasks.some((t) => !t.done && t.state === "next") &&
            selected.status === "active" && (
              <div className="inline-note">
                <Lightbulb size={17} />
                <p>
                  What’s the smallest visible step that moves this project
                  forward?
                </p>
              </div>
            )}
          {tasks.some((t) => t.done) && (
            <>
              <div className="section-title space-top">
                <h3>Completed</h3>
              </div>
              {tasks.filter((t) => t.done).map((t) => taskRow(t, false))}
            </>
          )}
        </>
      );
    }
    const filtered = data.projects.filter(
      (p) =>
        p.category !== "practice" &&
        (projectCategory === "all" || p.category === projectCategory),
    );
    return (
      <>
        {pageHeading(
          "Projects",
          "A clear outcome. One next action at a time.",
          <button className="primary-button" onClick={newProject}>
            <Plus size={16} /> New project
          </button>,
        )}
        <div className="tabs">
          {(["all", "coursework", "personal"] as const).map((c) => (
            <button
              key={c}
              className={projectCategory === c ? "active" : ""}
              onClick={() => setProjectCategory(c)}
            >
              {c === "all"
                ? "All projects"
                : c === "coursework"
                  ? "Coursework"
                  : "Personal"}
              <span>
                {
                  data.projects.filter(
                    (p) =>
                      p.category !== "practice" &&
                      (c === "all" || p.category === c),
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        {projectCategory !== "coursework" && (
          <div className="project-limit-bar">
            <span>
              <span className="slot-dots">
                {Array.from({ length: data.settings.limit }, (_, i) => (
                  <i key={i} className={i < count ? "filled" : ""} />
                ))}
              </span>
              <strong>
                {count} of {data.settings.limit}
              </strong>{" "}
              personal projects active · paused and someday are unlimited
            </span>
            <button className="text-button" onClick={() => setSettings(true)}>
              Protect your focus <Settings size={13} />
            </button>
          </div>
        )}
        {(["active", "paused", "someday", "complete"] as const).map(
          (status) => {
            const list = filtered.filter((p) => p.status === status);
            return (
              <section className="project-group" key={status}>
                <div className="section-title">
                  <h3>
                    {status === "active" ? (
                      <Play size={14} />
                    ) : status === "paused" ? (
                      <Pause size={14} />
                    ) : status === "someday" ? (
                      <Compass size={14} />
                    ) : (
                      <CheckCheck size={14} />
                    )}{" "}
                    {status === "active"
                      ? "Active"
                      : status === "paused"
                        ? "Paused"
                        : status === "someday"
                          ? "Someday / maybe"
                          : "Completed"}
                    <span className="count-badge">{list.length}</span>
                  </h3>
                </div>
                {list.length ? (
                  <div className="project-grid">{list.map(projectCard)}</div>
                ) : (
                  <p className="quiet-empty">
                    {status === "paused"
                      ? "Permission to put things on hold."
                      : status === "someday"
                        ? "Good ideas can wait here."
                        : status === "complete"
                          ? "Finished projects will live here."
                          : "A little space for your next commitment."}
                  </p>
                )}
              </section>
            );
          },
        )}
      </>
    );
  };

  const calendarEvents = (key: string) =>
    data.tasks.filter((t) => !t.done && (t.due === key || t.planned === key));
  const renderCalendar = () => {
    const first = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    const selectedEvents = calendarEvents(calendarDate);
    const moveMonth = (n: number) =>
      setCalendarMonth(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + n, 1),
      );
    return (
      <>
        {pageHeading(
          "Calendar",
          "See what’s coming. Make space for the work.",
          <button
            className="primary-button"
            onClick={() => newTask({ state: "next", planned: calendarDate })}
          >
            <Plus size={16} /> Plan an action
          </button>,
        )}
        <div className="calendar-toolbar">
          <div className="calendar-month">
            <h2>
              {calendarMonth.toLocaleDateString("en", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              className="icon-button"
              aria-label="Previous month"
              onClick={() => moveMonth(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Next month"
              onClick={() => moveMonth(1)}
            >
              <ChevronRight size={17} />
            </button>
            <button
              className="secondary-button small"
              onClick={() => {
                setCalendarMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                );
                setCalendarDate(today);
              }}
            >
              Today
            </button>
          </div>
          <div className="view-switch">
            <button
              className={calendarView === "month" ? "active" : ""}
              onClick={() => setCalendarView("month")}
            >
              Month
            </button>
            <button
              className={calendarView === "agenda" ? "active" : ""}
              onClick={() => setCalendarView("agenda")}
            >
              Agenda
            </button>
          </div>
        </div>
        <div className="calendar-legend">
          <span>
            <i className="legend-deadline" /> Actual deadline
          </span>
          <span>
            <i className="legend-planned" /> Planned work
          </span>
        </div>
        {calendarView === "month" ? (
          <div className="calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div className="calendar-weekday" key={d}>
                {d}
              </div>
            ))}
            {cells.map((d) => {
              const key = dateKey(d);
              const events = calendarEvents(key);
              return (
                <button
                  className={
                    "calendar-cell " +
                    (d.getMonth() !== calendarMonth.getMonth()
                      ? "other-month "
                      : "") +
                    (key === calendarDate ? "selected-day " : "") +
                    (key === today ? "is-today" : "")
                  }
                  key={key}
                  onClick={() => setCalendarDate(key)}
                  aria-label={`${formatDate(key, { month: "long", day: "numeric" })}, ${events.length} tasks`}
                >
                  <span className="day-number">{d.getDate()}</span>
                  <span className="calendar-cell-events">
                    {events.slice(0, 2).map((t) => (
                      <span
                        key={t.id}
                        className={
                          "calendar-event " +
                          (t.due === key ? "event-deadline" : "event-planned")
                        }
                      >
                        {t.due === key ? (
                          <Flag size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        <span>{t.title}</span>
                      </span>
                    ))}
                    {events.length > 2 && (
                      <small>+{events.length - 2} more</small>
                    )}
                  </span>
                  <span className="mobile-event-dots">
                    {events.slice(0, 3).map((t) => (
                      <i
                        key={t.id}
                        className={
                          t.due === key ? "legend-deadline" : "legend-planned"
                        }
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="agenda">
            {cells
              .filter(
                (d) =>
                  d.getMonth() === calendarMonth.getMonth() &&
                  calendarEvents(dateKey(d)).length,
              )
              .map((d) => {
                const key = dateKey(d);
                return (
                  <div className="agenda-day" key={key}>
                    <div>
                      <b>{d.getDate()}</b>
                      <small>{formatDate(key, { weekday: "short" })}</small>
                    </div>
                    <div>
                      {calendarEvents(key).map((t) => (
                        <button
                          key={t.id}
                          className={
                            "agenda-item " +
                            (t.due === key ? "event-deadline" : "event-planned")
                          }
                          onClick={() => openTask(t)}
                        >
                          <span>
                            {t.due === key ? (
                              <Flag size={14} />
                            ) : (
                              <Clock size={14} />
                            )}{" "}
                            {t.title}
                          </span>
                          <small>
                            {t.due === key ? "Deadline" : "Planned work"} ·{" "}
                            {t.minutes} min
                          </small>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            {!cells.some(
              (d) =>
                d.getMonth() === calendarMonth.getMonth() &&
                calendarEvents(dateKey(d)).length,
            ) &&
              empty(
                "An open month.",
                "Add a planned date or deadline to see it here.",
              )}
          </div>
        )}
        {calendarView === "month" && (
          <div className="selected-day-panel">
            <div className="section-title">
              <h3>
                {formatDate(calendarDate, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <button
                className="text-button"
                onClick={() =>
                  newTask({ state: "next", planned: calendarDate })
                }
              >
                <Plus size={14} /> Add action
              </button>
            </div>
            {selectedEvents.length ? (
              selectedEvents.map((t) => taskRow(t))
            ) : (
              <p className="quiet-empty">
                Nothing planned. A little room to breathe.
              </p>
            )}
          </div>
        )}
      </>
    );
  };
  const renderExploration = () => {
    const tags = ["All", ...new Set(data.explorations.map((e) => e.tag))];
    return (
      <>
        {pageHeading(
          "Exploration",
          "Follow your curiosity. No deadlines. No expectations.",
          <button className="primary-button" onClick={newExploration}>
            <Plus size={16} /> A new curiosity
          </button>,
        )}
        <button className="capture-exploration" onClick={newExploration}>
          <Plus size={18} />
          <span>What caught your attention?</span>
          <span className="subtle">
            A question, a link, a little rabbit hole…
          </span>
        </button>
        <div className="filter-chips">
          {tags.map((tag) => (
            <button
              key={tag}
              className={exploreFilter === tag ? "active" : ""}
              onClick={() => setExploreFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="exploration-grid">
          {data.explorations
            .filter((e) => exploreFilter === "All" || e.tag === exploreFilter)
            .map(explorationCard)}
        </div>
        {!data.explorations.length &&
          empty(
            "Start with a little wonder.",
            "There’s no right way to explore.",
            <button className="secondary-button" onClick={newExploration}>
              Add your first curiosity
            </button>,
          )}
        <div className="exploration-footer">
          <Compass size={16} />
          <p>
            These are possibilities, not promises. They only become projects
            when you choose.
          </p>
        </div>
      </>
    );
  };
  const renderReview = () => {
    const checked = data.reviewChecks.filter(Boolean).length;
    return (
      <>
        {pageHeading(
          "Weekly review",
          "A small pause to get clear and start again.",
          <span className="date-pill">
            <Clock size={14} /> Every Saturday · 20 minutes
          </span>,
        )}
        <div className="review-schedule-banner">
          <CalendarDays size={17} />
          <div>
            <strong>Every Saturday · all day</strong>
            <p>
              {reviewTask
                ? `${reviewDue ? "Due" : "Next review"}: ${formatDate(reviewTask.due, { weekday: "long", month: "long", day: "numeric" })}. `
                : ""}
              Finishing this review automatically schedules the next Saturday.
              Unfinished reviews stay visible in Today.
            </p>
          </div>
        </div>
        {reviewDone ? (
          <div className="review-success">
            <span className="review-orbit">
              <CheckCheck size={34} />
            </span>
            <h2>A little lighter. A little clearer.</h2>
            <p>You’ve made space for the week ahead.</p>
            <button
              className="primary-button"
              onClick={() => {
                go("Today");
                setReviewDone(false);
              }}
            >
              Back to Today <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="review-layout">
            <div>
              <div className="review-progress">
                <span>{checked} of 6 steps</span>
                <div className="progress-track">
                  <span style={{ width: `${(checked / 6) * 100}%` }} />
                </div>
              </div>
              {reviewSteps.map(([title, description, target], i) => (
                <div
                  className={
                    "review-step " +
                    (data.reviewChecks[i] ? "step-complete" : "")
                  }
                  key={title}
                >
                  <button
                    className={
                      "checkbox " + (data.reviewChecks[i] ? "checked" : "")
                    }
                    aria-label={
                      "Mark " +
                      title +
                      " " +
                      (data.reviewChecks[i] ? "incomplete" : "complete")
                    }
                    onClick={() =>
                      change((d) => ({
                        ...d,
                        reviewChecks: d.reviewChecks.map((v, n) =>
                          n === i ? !v : v,
                        ),
                      }))
                    }
                  >
                    {data.reviewChecks[i] && <Check size={13} />}
                  </button>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <button
                      className="text-button"
                      onClick={() => {
                        go(target as Page);
                        if (i === 4) setInboxTab("waiting");
                      }}
                    >
                      Open {i === 4 ? "Waiting for" : target.toLowerCase()}{" "}
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <span className="review-step-number">0{i + 1}</span>
                </div>
              ))}
              <button
                className="primary-button finish-review"
                disabled={checked < 6}
                onClick={() => {
                  change((d) => completeWeeklyReview(d, today));
                  setReviewDone(true);
                }}
              >
                Finish your review <Check size={15} />
              </button>
            </div>
            <aside className="review-aside">
              <span className="eyebrow">A QUICK SNAPSHOT</span>
              <div>
                <b>{inbox.length}</b>
                <span>things to clarify</span>
              </div>
              <div>
                <b>
                  {
                    activeProjects.filter(
                      (p) =>
                        !data.tasks.some(
                          (t) =>
                            t.projectId === p.id &&
                            !t.done &&
                            t.state === "next",
                        ),
                    ).length
                  }
                </b>
                <span>projects or practices need a next action</span>
              </div>
              <div>
                <b>
                  {
                    data.tasks.filter((t) => !t.done && t.state === "waiting")
                      .length
                  }
                </b>
                <span>things you’re waiting for</span>
              </div>
              <p>
                {data.reviewed
                  ? `Last review: ${formatDate(data.reviewed)}`
                  : "Your first review is a good place to begin."}
              </p>
            </aside>
          </div>
        )}
      </>
    );
  };

  function saveTask(e: FormEvent) {
    e.preventDefault();
    if (!taskDraft?.title.trim()) return;
    if (isWeeklyReview(taskDraft)) {
      go("Weekly review");
      setTaskDraft(null);
      return;
    }
    const value = { ...taskDraft, title: taskDraft.title.trim() };
    change((d) => ({
      ...d,
      tasks: d.tasks.some((t) => t.id === value.id)
        ? d.tasks.map((t) => (t.id === value.id ? value : t))
        : [...d.tasks, value],
    }));
    setTaskDraft(null);
    flash("Task saved. A little more clarity.");
  }
  function saveProject(e: FormEvent) {
    e.preventDefault();
    if (!projectDraft?.name.trim()) return;
    const value = { ...projectDraft, name: projectDraft.name.trim() };
    const others = data.projects.filter(
      (p) =>
        p.id !== value.id && p.category === "personal" && p.status === "active",
    ).length;
    if (
      value.category === "personal" &&
      value.status === "active" &&
      others >= data.settings.limit
    ) {
      flash(
        `You already have ${data.settings.limit} active personal projects. Pause or finish one, or save this for someday.`,
      );
      return;
    }
    change((d) => ({
      ...d,
      projects: d.projects.some((p) => p.id === value.id)
        ? d.projects.map((p) => (p.id === value.id ? value : p))
        : [...d.projects, value],
    }));
    setProjectDraft(null);
    if (value.category === "practice") {
      setPage("Practices");
      setSelectedProject(value.id);
    }
    flash(
      value.category === "practice"
        ? "Practice saved. A thread you can keep returning to."
        : "Project saved.",
    );
  }
  function saveExploration(e: FormEvent) {
    e.preventDefault();
    if (!exploreDraft?.title.trim()) return;
    const value = {
      ...exploreDraft,
      title: exploreDraft.title.trim(),
      tag: exploreDraft.tag.trim() || "Curiosity",
    };
    change((d) => ({
      ...d,
      explorations: d.explorations.some((x) => x.id === value.id)
        ? d.explorations.map((x) => (x.id === value.id ? value : x))
        : [...d.explorations, value],
    }));
    setExploreDraft(null);
    flash("A curiosity worth keeping.");
  }
  function convertExploration() {
    if (!exploreDraft?.title.trim()) return;
    if (count >= data.settings.limit) {
      flash(
        `All ${data.settings.limit} personal project slots are in use. Pause or complete a project first.`,
      );
      return;
    }
    const value = exploreDraft;
    change((d) => ({
      ...d,
      explorations: d.explorations.some((x) => x.id === value.id)
        ? d.explorations.map((x) => (x.id === value.id ? value : x))
        : [...d.explorations, value],
    }));
    setExploreDraft(null);
    setProjectDraft({
      id: uid(),
      name: value.title,
      outcome: value.description,
      category: "personal",
      status: "active",
      course: "",
      color: "terracotta",
    });
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `navodits-gtd-${today}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash("Backup downloaded. Keep it somewhere safe.");
  }
  const renderers = {
    [nav[0][0]]: renderToday,
    Inbox: renderInbox,
    "What can I do now?": renderNow,
    Projects: renderProjects,
    Practices: () => (
      <Practices
        data={data}
        selected={selectedProject}
        select={setSelectedProject}
        change={change}
        edit={setProjectDraft}
        addTask={newTask}
        taskRow={taskRow}
        flash={flash}
      />
    ),
    Calendar: renderCalendar,
    Exploration: renderExploration,
    "Weekly review": renderReview,
  };
  const results =
    search === null
      ? []
      : [
          ...data.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            kind: t.done ? "Completed task" : "Task",
            open: () => {
              setSearch(null);
              openTask(t);
            },
          })),
          ...data.projects.map((p) => ({
            id: p.id,
            title: p.name,
            kind: p.category === "practice" ? "Practice" : "Project",
            open: () => {
              setSearch(null);
              setPage(p.category === "practice" ? "Practices" : "Projects");
              setSelectedProject(p.id);
            },
          })),
          ...data.explorations.map((e) => ({
            id: e.id,
            title: e.title,
            kind: "Exploration",
            open: () => {
              setSearch(null);
              setExploreDraft(structuredClone(e));
            },
          })),
        ]
          .filter((r) =>
            r.title.toLowerCase().includes(search.trim().toLowerCase()),
          )
          .slice(0, 12);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <button className="workspace" onClick={() => go("Today")}>
          <span className="brand-mark">
            <BookOpen size={19} />
          </span>
          <span>Navodit’s GTD</span>
          <ChevronDown size={13} />
        </button>
        <button className="sidebar-search" onClick={() => setSearch("")}>
          <Search size={15} />
          <span>Search anything</span>
          <kbd>⌘ K</kbd>
        </button>
        <button
          className="sidebar-capture"
          onClick={() => {
            setMobile(false);
            newTask();
          }}
        >
          <Plus size={16} />
          <span>Quick capture</span>
          <kbd>N</kbd>
        </button>
        <div className="nav-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(([name, Icon], i) => (
            <button
              key={name}
              className={
                "nav-item " +
                (page === name ? "active" : "") +
                (name === "Exploration" ? " nav-separated" : "")
              }
              onClick={() => go(name)}
            >
              <Icon size={17} strokeWidth={1.6} />
              <span>{name === "What can I do now?" ? "What now?" : name}</span>
              {name === "Inbox" && inbox.length > 0 && (
                <span className="nav-count">{inbox.length}</span>
              )}
              {name === "Weekly review" && reviewDue && (
                <span className="review-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-projects">
          <div className="nav-label">
            PROJECTS{" "}
            <button
              className="icon-button"
              aria-label="New project"
              onClick={() => {
                setMobile(false);
                newProject();
              }}
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            className="nav-item"
            onClick={() => {
              go("Projects");
              setProjectCategory("coursework");
            }}
          >
            <GraduationCap size={16} />
            <span>Coursework</span>
            <span className="subtle">
              {
                data.projects.filter(
                  (p) => p.category === "coursework" && p.status === "active",
                ).length
              }
            </span>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              go("Projects");
              setProjectCategory("personal");
            }}
          >
            <Folder size={16} />
            <span>Personal</span>
            <span className="subtle">
              {count}/{data.settings.limit}
            </span>
          </button>
          {data.projects
            .filter((p) => p.category === "personal" && p.status === "active")
            .map((p) => (
              <button
                className="sidebar-project"
                key={p.id}
                onClick={() => {
                  go("Projects");
                  setSelectedProject(p.id);
                }}
              >
                <span className={"dot " + p.color} />
                {p.name}
              </button>
            ))}
        </div>
        <div className="sidebar-bottom">
          <div className="local-status">
            <span className={"status-dot " + (!online ? "offline" : "")} />
            {cloud ? cloud.status : online ? "Saved on this device" : "Offline · saved on this device"}
          </div>
          <button
            className="profile"
            onClick={() => {
              setMobile(false);
              setSettings(true);
            }}
          >
            <span className="avatar">N</span>
            <span>
              <strong>{data.settings.name}’s space</strong>
              <small>Personal workspace</small>
            </span>
            <Settings size={16} />
          </button>
        </div>
      </aside>
      <div className="app-body">
        {data.notice && (
          <div className="migration-notice" role="status">
            <BookOpen size={16} />
            <p>{data.notice}</p>
            <button
              className="icon-button"
              aria-label="Dismiss project limit update"
              onClick={() => change((d) => ({ ...d, notice: undefined }))}
            >
              <X size={15} />
            </button>
          </div>
        )}
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb-home">Navodit’s GTD</span>
            <span className="breadcrumb-slash">/</span>
            <span>
              {selectedProject && (page === "Projects" || page === "Practices")
                ? getProject(selectedProject)?.name
                : page}
            </span>
          </div>
          <div className="topbar-actions">
            {!online && (
              <span className="offline-label">
                <WifiOff size={13} /> Offline
              </span>
            )}
            <button
              className="icon-button"
              title="Search (Ctrl+K)"
              aria-label="Search"
              onClick={() => setSearch("")}
            >
              <Search size={16} />
            </button>
            <button
              className="icon-button"
              aria-label={
                data.settings.theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              onClick={() =>
                change((d) => ({
                  ...d,
                  settings: {
                    ...d.settings,
                    theme: d.settings.theme === "dark" ? "light" : "dark",
                  },
                }))
              }
            >
              {data.settings.theme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </button>
            <span className="topbar-divider" />
            <span className="version-label">A PERSONAL NOTEBOOK</span>
          </div>
        </header>
        {storageError && (
          <div className="storage-warning">
            Your browser couldn’t save this change. Export a backup in Settings
            before closing this page.
          </div>
        )}
        <main
          id="main"
          className={"main page-" + page.toLowerCase().replaceAll(" ", "-")}
          key={page}
        >
          {renderers[page]()}
        </main>
        <footer className="app-footer">
          <span>Small steps. A clearer mind.</span>
          <button className="text-button" onClick={() => setSettings(true)}>
            Made for Navodit <Settings size={12} />
          </button>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[nav[0], nav[1], nav[2], nav[3]].map(([name, Icon]) => (
          <button
            className={page === name ? "active" : ""}
            key={name}
            onClick={() => go(name)}
          >
            <Icon size={20} />
            <span>{name === "What can I do now?" ? "What now?" : name}</span>
          </button>
        ))}
        <button onClick={() => setMobile(true)}>
          <MoreHorizontal size={21} />
          <span>More</span>
        </button>
      </nav>
      <button
        className="mobile-fab"
        aria-label="Quick capture"
        onClick={() => newTask()}
      >
        <Plus size={24} />
      </button>

      {taskDraft && (
        <Modal
          title={
            data.tasks.some((t) => t.id === taskDraft.id)
              ? "A little more clarity"
              : "Quick capture"
          }
          onClose={() => setTaskDraft(null)}
        >
          <form onSubmit={saveTask}>
            <div className="form-body">
              <label className="field">
                What’s on your mind?
                <input
                  autoFocus
                  required
                  maxLength={240}
                  placeholder="Write it down. You can sort it out later."
                  value={taskDraft.title}
                  onChange={(e) =>
                    setTaskDraft({ ...taskDraft, title: e.target.value })
                  }
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  Project or practice
                  <select
                    value={taskDraft.projectId}
                    onChange={(e) =>
                      setTaskDraft({
                        ...taskDraft,
                        projectId: e.target.value,
                        state:
                          e.target.value && taskDraft.state === "inbox"
                            ? "next"
                            : taskDraft.state,
                      })
                    }
                  >
                    <option value="">No project</option>
                    {data.projects
                      .filter(
                        (p) =>
                          p.status !== "complete" ||
                          p.id === taskDraft.projectId,
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.category === "practice" ? " · Practice" : ""}
                          {p.status !== "active" ? ` (${p.status})` : ""}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="field">
                  Where does it belong?
                  <select
                    value={taskDraft.state}
                    onChange={(e) =>
                      setTaskDraft({
                        ...taskDraft,
                        state: e.target.value as Task["state"],
                      })
                    }
                  >
                    <option value="inbox">Inbox · clarify later</option>
                    <option value="next">Next action</option>
                    <option value="waiting">Waiting for</option>
                    <option value="someday">Someday / maybe</option>
                  </select>
                </label>
                <label className="field">
                  Planned date <span>When I want to work on it</span>
                  <input
                    type="date"
                    value={taskDraft.planned}
                    onChange={(e) =>
                      setTaskDraft({ ...taskDraft, planned: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  Deadline <span>When it really must be done</span>
                  <input
                    type="date"
                    value={taskDraft.due}
                    onChange={(e) =>
                      setTaskDraft({ ...taskDraft, due: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="form-grid three">
                <label className="field">
                  Minutes
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    required
                    value={taskDraft.minutes}
                    onChange={(e) =>
                      setTaskDraft({
                        ...taskDraft,
                        minutes: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="field">
                  Energy
                  <select
                    value={taskDraft.energy}
                    onChange={(e) =>
                      setTaskDraft({
                        ...taskDraft,
                        energy: e.target.value as Task["energy"],
                      })
                    }
                  >
                    {["low", "medium", "high"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Context
                  <select
                    value={taskDraft.context}
                    onChange={(e) =>
                      setTaskDraft({
                        ...taskDraft,
                        context: e.target.value as Task["context"],
                      })
                    }
                  >
                    {["computer", "phone", "anywhere", "errands"].map((v) => (
                      <option key={v} value={v}>
                        {labelContext(v)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                Notes
                <textarea
                  rows={3}
                  placeholder="A useful detail, a link, or what you’re waiting for…"
                  value={taskDraft.notes}
                  onChange={(e) =>
                    setTaskDraft({ ...taskDraft, notes: e.target.value })
                  }
                />
              </label>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={taskDraft.focus}
                  onChange={(e) =>
                    setTaskDraft({
                      ...taskDraft,
                      focus: e.target.checked,
                      state:
                        e.target.checked && taskDraft.state === "inbox"
                          ? "next"
                          : taskDraft.state,
                    })
                  }
                />{" "}
                Add to my daily focus
              </label>
            </div>
            <div className="modal-footer">
              {data.tasks.some((t) => t.id === taskDraft.id) && (
                <button
                  type="button"
                  className="icon-button danger"
                  title="Delete task"
                  aria-label="Delete task"
                  onClick={() => {
                    change((d) => ({
                      ...d,
                      tasks: d.tasks.filter((t) => t.id !== taskDraft.id),
                    }));
                    setTaskDraft(null);
                    flash("Task removed.");
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                className="secondary-button"
                onClick={() => setTaskDraft(null)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Save task <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {projectDraft && (
        <Modal
          title={
            data.projects.some((p) => p.id === projectDraft.id)
              ? projectDraft.category === "practice"
                ? "Edit practice"
                : "Edit project"
              : projectDraft.category === "practice"
                ? "A new practice"
                : "A new project"
          }
          onClose={() => setProjectDraft(null)}
        >
          <form onSubmit={saveProject}>
            <div className="form-body">
              <label className="field">
                {projectDraft.category === "practice"
                  ? "Practice name"
                  : "Project name"}
                <input
                  autoFocus
                  required
                  maxLength={120}
                  placeholder="What are you working toward?"
                  value={projectDraft.name}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, name: e.target.value })
                  }
                />
              </label>
              <label className="field">
                {projectDraft.category === "practice"
                  ? "Direction"
                  : "Desired outcome"}
                <textarea
                  rows={2}
                  placeholder={
                    projectDraft.category === "practice"
                      ? "What do you want to keep learning or developing?"
                      : "Describe what done looks like."
                  }
                  value={projectDraft.outcome}
                  onChange={(e) =>
                    setProjectDraft({
                      ...projectDraft,
                      outcome: e.target.value,
                    })
                  }
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  Category
                  <select
                    value={projectDraft.category}
                    onChange={(e) =>
                      setProjectDraft({
                        ...projectDraft,
                        category: e.target.value as Project["category"],
                      })
                    }
                  >
                    <option value="personal">Personal</option>
                    <option value="coursework">Coursework</option>
                    <option value="practice">Ongoing practice</option>
                  </select>
                </label>
                <label className="field">
                  Status
                  <select
                    value={projectDraft.status}
                    onChange={(e) =>
                      setProjectDraft({
                        ...projectDraft,
                        status: e.target.value as Project["status"],
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="someday">Someday / maybe</option>
                    <option value="complete">
                      {projectDraft.category === "practice"
                        ? "Archived"
                        : "Complete"}
                    </option>
                  </select>
                </label>
              </div>
              {projectDraft.category === "coursework" ? (
                <label className="field">
                  Course
                  <input
                    placeholder="e.g. Mathematics"
                    value={projectDraft.course}
                    onChange={(e) =>
                      setProjectDraft({
                        ...projectDraft,
                        course: e.target.value,
                      })
                    }
                  />
                </label>
              ) : projectDraft.category === "practice" ? (
                <>
                  <label className="field">
                    A gentle rhythm
                    <input
                      placeholder="e.g. Three sessions a week"
                      value={projectDraft.rhythm || ""}
                      onChange={(e) =>
                        setProjectDraft({
                          ...projectDraft,
                          rhythm: e.target.value,
                        })
                      }
                    />
                    <span>
                      An intention, without automatic scheduling or reminders.
                    </span>
                  </label>
                  <label className="field">
                    Notes & resources
                    <textarea
                      rows={4}
                      placeholder="A rough learning path, resources, or questions to return to…"
                      value={projectDraft.notes || ""}
                      onChange={(e) =>
                        setProjectDraft({
                          ...projectDraft,
                          notes: e.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="inline-note">
                    <BookOpen size={18} />
                    <p>
                      This is an ongoing thread. It doesn’t use a personal
                      project slot and doesn’t need a finish date.
                    </p>
                  </div>
                </>
              ) : (
                <div className="inline-note">
                  <Target size={18} />
                  <p>
                    {count} of {data.settings.limit} personal project slots are
                    in use. Someday and paused projects don’t use a slot.
                  </p>
                </div>
              )}
              <label className="field">
                {projectDraft.category === "practice"
                  ? "Notebook color"
                  : "Project color"}
                <select
                  value={projectDraft.color}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, color: e.target.value })
                  }
                >
                  {["terracotta", "sage", "ochre", "brick", "ink"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setProjectDraft(null)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                {projectDraft.category === "practice"
                  ? "Save practice"
                  : "Save project"}{" "}
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {exploreDraft && (
        <Modal
          title="A thread to follow"
          wide
          onClose={() => setExploreDraft(null)}
        >
          <form onSubmit={saveExploration}>
            <div className="exploration-editor-art">
              <Art kind={exploreDraft.art} />
              <span className="tag">
                <Compass size={12} /> Just curious
              </span>
            </div>
            <div className="form-body">
              <label className="field">
                What caught your attention?
                <input
                  autoFocus
                  required
                  maxLength={160}
                  className="exploration-title-input"
                  placeholder="A question worth wandering into…"
                  value={exploreDraft.title}
                  onChange={(e) =>
                    setExploreDraft({ ...exploreDraft, title: e.target.value })
                  }
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  A little context
                  <input
                    placeholder="What makes it interesting?"
                    value={exploreDraft.description}
                    onChange={(e) =>
                      setExploreDraft({
                        ...exploreDraft,
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  Topic
                  <input
                    maxLength={35}
                    placeholder="Music, science, anything…"
                    value={exploreDraft.tag}
                    onChange={(e) =>
                      setExploreDraft({ ...exploreDraft, tag: e.target.value })
                    }
                  />
                </label>
              </div>
              <label className="field">
                Notes
                <textarea
                  className="exploration-notes"
                  rows={6}
                  placeholder="Collect questions, little discoveries, and things to try. No checklist required."
                  value={exploreDraft.notes}
                  onChange={(e) =>
                    setExploreDraft({ ...exploreDraft, notes: e.target.value })
                  }
                />
              </label>
              <div className="section-title">
                <h3>
                  <Link size={15} /> Saved links
                </h3>
              </div>
              {exploreDraft.links.map((l, i) => (
                <div className="saved-link" key={i}>
                  <Link size={15} />
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.title || l.url}
                    <ExternalLink size={12} />
                  </a>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={"Remove " + l.title}
                    onClick={() =>
                      setExploreDraft({
                        ...exploreDraft,
                        links: exploreDraft.links.filter((_, n) => n !== i),
                      })
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <LinkInput
                onAdd={(title, url) =>
                  setExploreDraft({
                    ...exploreDraft,
                    links: [...exploreDraft.links, { title, url }],
                  })
                }
              />
              <button
                className="text-button convert-button"
                type="button"
                onClick={convertExploration}
              >
                <Layers size={14} /> Turn this into a personal project{" "}
                <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="modal-footer">
              {data.explorations.some((x) => x.id === exploreDraft.id) && (
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label="Delete exploration"
                  onClick={() => {
                    change((d) => ({
                      ...d,
                      explorations: d.explorations.filter(
                        (x) => x.id !== exploreDraft.id,
                      ),
                    }));
                    setExploreDraft(null);
                    setExploreFilter("All");
                    flash("Exploration removed.");
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                className="secondary-button"
                type="button"
                onClick={() => setExploreDraft(null)}
              >
                Cancel
              </button>
              <button className="primary-button" type="submit">
                Save curiosity <Check size={14} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {settings && (
        <Modal title="Your workspace" onClose={() => setSettings(false)}>
          <div className="form-body settings-body">
            {cloud && <section className="cloud-settings"><p>{cloud.status}</p><button onClick={cloud.sync}>Sync now</button><button onClick={cloud.signOut}>Sign out</button></section>}
            <div className="settings-intro">
              <span className="avatar large">N</span>
              <div>
                <h3>Navodit’s GTD</h3>
                <p>Small steps. A clearer mind.</p>
              </div>
            </div>
            <label className="field">
              Your name
              <input
                value={data.settings.name}
                maxLength={40}
                onChange={(e) =>
                  change((d) => ({
                    ...d,
                    settings: { ...d.settings, name: e.target.value },
                  }))
                }
              />
            </label>
            <div className="settings-row">
              <div>
                <h3>Appearance</h3>
                <p>A calmer space, day or night.</p>
              </div>
              <div className="view-switch">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    className={data.settings.theme === t ? "active" : ""}
                    onClick={() =>
                      change((d) => ({
                        ...d,
                        settings: { ...d.settings, theme: t },
                      }))
                    }
                  >
                    {t === "dark" ? <Moon size={14} /> : <Sun size={14} />}{" "}
                    {t === "dark" ? "Dark" : "Light"}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <div>
                <h3>Active personal projects</h3>
                <p>
                  Only active personal projects count. Keep as many paused or
                  someday projects as you like.
                </p>
              </div>
              <span className="fixed-limit">2 active projects</span>
            </div>
            <div className="settings-data">
              <h3>{cloud ? "Your data and backups" : "Your data, on this device"}</h3>
              <p>
                {cloud ? "Your workspace syncs between signed-in devices. Offline edits wait on this device until you reconnect. Export a backup before importing or replacing data." : "This preview saves in your browser. Export a backup to keep or transfer your data."}
              </p>
              <div className="settings-data-actions">
                <button className="secondary-button" onClick={exportData}>
                  <Download size={14} /> Export backup
                </button>
                <label className="secondary-button upload-label">
                  <Upload size={14} /> Import backup
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      try {
                        const value = JSON.parse(await file.text());
                        if (!validData(value)) {
                          flash(
                            "This file isn’t a valid Navodit’s GTD backup. Your data is unchanged.",
                          );
                          return;
                        }
                        if (
                          !window.confirm(
                            "Replace your workspace with this backup? This will also replace the cloud copy when synced. Export your current data first if you want to keep it.",
                          )
                        )
                          return;
                        setData(normalize(value));
                        flash("Backup imported. Welcome back.");
                      } catch {
                        flash(
                          "Couldn’t read this backup. Choose a valid JSON export.",
                        );
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="settings-data">
              <h3>Install on Android</h3>
              <p>
                In Chrome, open the menu and choose “Add to home screen” or
                “Install app”. Open the app online once to make it available
                offline.
              </p>
              {installPrompt && (
                <button
                  className="secondary-button"
                  onClick={async () => {
                    await installPrompt.prompt();
                    setInstallPrompt(null);
                  }}
                >
                  <Smartphone size={14} /> Install app
                </button>
              )}
            </div>
            <div className="keyboard-hints">
              <span>
                <kbd>N</kbd> Quick capture
              </span>
              <span>
                <kbd>Ctrl / ⌘ K</kbd> Search
              </span>
              <span>
                <kbd>Esc</kbd> Close
              </span>
            </div>
          </div>
        </Modal>
      )}

      {search !== null && (
        <Modal title="Find a little clarity" onClose={() => setSearch(null)}>
          <div className="search-input">
            <Search size={19} />
            <input
              autoFocus
              aria-label="Search tasks, projects and explorations"
              placeholder="Search tasks, projects, curiosity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="search-results">
            {results.map((r) => (
              <button key={r.id} onClick={r.open}>
                <span className="search-result-icon">
                  {r.kind === "Project" ? (
                    <Folder size={17} />
                  ) : r.kind === "Exploration" ? (
                    <Compass size={17} />
                  ) : (
                    <CheckCheck size={17} />
                  )}
                </span>
                <span>
                  {r.title}
                  <small>{r.kind}</small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))}
            {!results.length && (
              <p className="quiet-empty">No matches. Try another word.</p>
            )}
          </div>
        </Modal>
      )}

      {focusTask && (
        <Modal
          title="One thing at a time"
          onClose={() => {
            setFocusTask(null);
            setFocusRunning(false);
          }}
        >
          <div className="focus-session">
            <span className="focus-orbit">
              <Target size={33} strokeWidth={1.2} />
            </span>
            <span className="eyebrow">A LITTLE ROOM TO FOCUS</span>
            <h2>{focusTask.title}</h2>
            <p>{getProject(focusTask.projectId)?.name || "Your next action"}</p>
            <div className="focus-timer">
              {String(Math.floor(focusSeconds / 60)).padStart(2, "0")}
              <span>:</span>
              {String(focusSeconds % 60).padStart(2, "0")}
            </div>
            <small>Elapsed time · estimated {focusTask.minutes} minutes</small>
            <div className="focus-actions">
              <button
                className="secondary-button"
                onClick={() => setFocusRunning(!focusRunning)}
              >
                {focusRunning ? <Pause size={15} /> : <Play size={15} />}{" "}
                {focusRunning ? "Pause" : "Resume"}
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  patchTask(focusTask.id, { done: true });
                  setFocusTask(null);
                  setFocusRunning(false);
                  flash("Done. Take a breath before the next thing.");
                }}
              >
                <Check size={15} /> Mark complete
              </button>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setFocusTask(null);
                setFocusRunning(false);
              }}
            >
              Leave focus
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          <span>{toast}</span>
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function LinkInput({ onAdd }: { onAdd: (title: string, url: string) => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const add = () => {
    try {
      const link = new URL(url.startsWith("http") ? url : "https://" + url);
      if (
        !["https:", "http:"].includes(link.protocol) ||
        !link.hostname.includes(".")
      )
        throw new Error();
      onAdd(link.hostname, link.href);
      setUrl("");
      setError("");
    } catch {
      setError("Enter a valid website URL.");
    }
  };
  return (
    <div className="link-input-wrap">
      <div className="link-input">
        <input
          type="text"
          inputMode="url"
          placeholder="Paste a link to keep…"
          aria-label="Link to save"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (url.trim()) add();
            }
          }}
        />
        <button
          type="button"
          className="secondary-button small"
          disabled={!url.trim()}
          onClick={add}
        >
          <Plus size={14} /> Add
        </button>
      </div>
      {error && <small className="overdue">{error}</small>}
    </div>
  );
}
