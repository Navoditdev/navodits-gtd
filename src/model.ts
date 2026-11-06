export type Page =
  | "Today"
  | "Inbox"
  | "What can I do now?"
  | "Projects"
  | "Calendar"
  | "Exploration"
  | "Weekly review";
export type Task = {
  id: string;
  title: string;
  projectId: string;
  state: "inbox" | "next" | "waiting" | "someday";
  done: boolean;
  focus: boolean;
  due: string;
  planned: string;
  minutes: number;
  energy: "low" | "medium" | "high";
  context: "computer" | "phone" | "anywhere" | "errands";
  notes: string;
};
export type Project = {
  id: string;
  name: string;
  outcome: string;
  category: "coursework" | "personal";
  course: string;
  status: "active" | "paused" | "someday" | "complete";
  color: string;
};
export type Exploration = {
  id: string;
  title: string;
  description: string;
  tag: string;
  notes: string;
  links: { title: string; url: string }[];
  art: number;
};
export type Data = {
  version: 1;
  tasks: Task[];
  projects: Project[];
  explorations: Exploration[];
  settings: { limit: 2 | 3; theme: "dark" | "light"; name: string };
  reviewed: string;
  reviewChecks: boolean[];
};
export const uid = () => crypto.randomUUID();
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dateKey(d);
};
export const parseDate = (key: string) => new Date(`${key}T12:00:00`);
export const formatDate = (
  key: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) => (key ? parseDate(key).toLocaleDateString("en", options) : "");
export const personalCount = (data: Data) =>
  data.projects.filter(
    (p) => p.category === "personal" && p.status === "active",
  ).length;
export const availableTask = (t: Task, projects: Project[]) =>
  !t.done &&
  t.state === "next" &&
  (!t.projectId ||
    projects.some((p) => p.id === t.projectId && p.status === "active"));
export function seed(): Data {
  const task = (
    id: string,
    title: string,
    projectId: string,
    extra: Partial<Task> = {},
  ): Task => ({
    id,
    title,
    projectId,
    state: "next",
    done: false,
    focus: false,
    due: "",
    planned: "",
    minutes: 20,
    energy: "medium",
    context: "computer",
    notes: "",
    ...extra,
  });
  return {
    version: 1,
    settings: { limit: 3, theme: "dark", name: "Navodit" },
    reviewed: "",
    reviewChecks: Array(6).fill(false),
    projects: [
      {
        id: "p1",
        name: "History essay",
        outcome: "Submit a thoughtful essay on how cities evolve.",
        category: "coursework",
        course: "History",
        status: "active",
        color: "blue",
      },
      {
        id: "p2",
        name: "Calculus problem set",
        outcome: "Understand and complete this week’s integration problems.",
        category: "coursework",
        course: "Mathematics",
        status: "active",
        color: "blue",
      },
      {
        id: "p3",
        name: "Build a reading app",
        outcome: "A small, useful home for books and reading notes.",
        category: "personal",
        course: "",
        status: "active",
        color: "violet",
      },
      {
        id: "p4",
        name: "Learn photography",
        outcome: "Make a photo series that tells a small story.",
        category: "personal",
        course: "",
        status: "active",
        color: "amber",
      },
      {
        id: "p5",
        name: "Make my first track",
        outcome: "Finish and share one original piece of music.",
        category: "personal",
        course: "",
        status: "someday",
        color: "rose",
      },
    ],
    tasks: [
      task("t1", "Outline the history essay", "p1", {
        focus: true,
        planned: addDays(0),
        due: addDays(4),
        minutes: 25,
        notes:
          "Start with the central argument, then outline three supporting sections.",
      }),
      task("t2", "Work through integration exercises", "p2", {
        focus: true,
        planned: addDays(0),
        due: addDays(2),
        minutes: 45,
        energy: "high",
      }),
      task("t3", "Sketch the reading list screen", "p3", {
        focus: true,
        planned: addDays(0),
        minutes: 20,
        energy: "low",
      }),
      task("t4", "Review lecture notes", "p2", {
        minutes: 15,
        energy: "low",
        context: "anywhere",
      }),
      task("t5", "Ask the study group about question 4", "p2", {
        minutes: 5,
        energy: "low",
        context: "phone",
      }),
      task("t6", "Try the window light exercise", "p4", {
        minutes: 30,
        context: "anywhere",
        planned: addDays(1),
      }),
      task("t7", "Send the history essay draft", "p1", {
        minutes: 10,
        due: addDays(4),
        planned: addDays(3),
      }),
      task("t8", "Check out the book Maya mentioned", "", {
        state: "inbox",
        minutes: 10,
        energy: "low",
        context: "phone",
      }),
      task("t9", "Ideas for the semester break", "", {
        state: "inbox",
        minutes: 15,
        context: "anywhere",
      }),
      task("t10", "Tutor’s feedback on my outline", "p1", {
        state: "waiting",
        minutes: 5,
        energy: "low",
        context: "phone",
        notes: "Waiting for a reply before revising the final section.",
      }),
    ],
    explorations: [
      {
        id: "e1",
        title: "How synthesizers work",
        description: "What happens between a waveform and a sound?",
        tag: "Music",
        art: 0,
        notes:
          "A few things to wander into:\n• Oscillators and waveforms\n• Filters and resonance\n• What makes an analog synth sound different?\n\nTry making a tiny patch, just for fun.",
        links: [],
      },
      {
        id: "e2",
        title: "Why cities grow",
        description: "The invisible patterns behind the places we live.",
        tag: "Cities",
        art: 1,
        notes:
          "Why do some streets feel alive while others don’t?\n\nLook into Jane Jacobs and walkable neighborhoods.",
        links: [],
      },
      {
        id: "e3",
        title: "A tiny telescope",
        description: "Could I build something that lets me see Saturn?",
        tag: "Science",
        art: 2,
        notes:
          "Start with the basics of lenses. No shopping list yet. Just curious.",
        links: [],
      },
      {
        id: "e4",
        title: "The history of maps",
        description: "How people have imagined the shape of the world.",
        tag: "History",
        art: 3,
        notes: "Old maps are full of stories. Find a few early maps of India.",
        links: [],
      },
    ],
  };
}
const STORE = "navodit-gtd-v1";
function obj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
const str = (v: unknown) => typeof v === "string";
const one = (v: unknown, values: unknown[]) => values.includes(v);
export function validData(v: unknown): v is Data {
  if (
    !obj(v) ||
    v.version !== 1 ||
    !obj(v.settings) ||
    !one(v.settings.limit, [2, 3]) ||
    !one(v.settings.theme, ["dark", "light"]) ||
    !str(v.settings.name) ||
    !str(v.reviewed)
  )
    return false;
  if (
    !Array.isArray(v.reviewChecks) ||
    v.reviewChecks.length !== 6 ||
    !v.reviewChecks.every((x) => typeof x === "boolean")
  )
    return false;
  if (
    !Array.isArray(v.projects) ||
    !v.projects.every(
      (p) =>
        obj(p) &&
        ["id", "name", "outcome", "course", "color"].every((k) => str(p[k])) &&
        one(p.category, ["coursework", "personal"]) &&
        one(p.status, ["active", "paused", "someday", "complete"]),
    )
  )
    return false;
  if (new Set(v.projects.map((p) => p.id)).size !== v.projects.length)
    return false;
  const ids = new Set(v.projects.map((p) => p.id));
  if (
    !Array.isArray(v.tasks) ||
    !v.tasks.every(
      (t) =>
        obj(t) &&
        ["id", "title", "projectId", "notes"].every((k) => str(t[k])) &&
        (!t.projectId || ids.has(t.projectId)) &&
        ["due", "planned"].every(
          (k) =>
            str(t[k]) &&
            (!t[k] ||
              (/^\d{4}-\d{2}-\d{2}$/.test(t[k] as string) &&
                !isNaN(parseDate(t[k] as string).getTime()))),
        ) &&
        one(t.state, ["inbox", "next", "waiting", "someday"]) &&
        typeof t.done === "boolean" &&
        typeof t.focus === "boolean" &&
        typeof t.minutes === "number" &&
        Number.isFinite(t.minutes) &&
        t.minutes > 0 &&
        one(t.energy, ["low", "medium", "high"]) &&
        one(t.context, ["computer", "phone", "anywhere", "errands"]),
    )
  )
    return false;
  if (new Set(v.tasks.map((t) => t.id)).size !== v.tasks.length) return false;
  if (
    !Array.isArray(v.explorations) ||
    !v.explorations.every(
      (e) =>
        obj(e) &&
        ["id", "title", "description", "tag", "notes"].every((k) =>
          str(e[k]),
        ) &&
        typeof e.art === "number" &&
        Number.isInteger(e.art) &&
        e.art >= 0 &&
        e.art <= 3 &&
        Array.isArray(e.links) &&
        e.links.every(
          (l) =>
            obj(l) &&
            str(l.title) &&
            str(l.url) &&
            /^https?:\/\//.test(l.url as string),
        ),
    )
  )
    return false;
  return (
    new Set(v.explorations.map((e) => e.id)).size === v.explorations.length &&
    v.projects.filter((p) => p.category === "personal" && p.status === "active")
      .length <= (v.settings.limit as number)
  );
}
export function load(): Data {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE) || "null");
    if (validData(stored)) return stored;
  } catch {
    /* Keep the original stored value until the user makes a change. */
  }
  return seed();
}
export function persist(data: Data): boolean {
  try {
    localStorage.setItem(STORE, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export function rankTasks(
  tasks: Task[],
  projects: Project[],
  minutes: number,
  energy: string,
  context: string,
): Task[] {
  const levels = { low: 0, medium: 1, high: 2 };
  return tasks
    .filter(
      (t) =>
        availableTask(t, projects) &&
        (!t.planned || t.planned <= dateKey()) &&
        t.minutes <= minutes &&
        levels[t.energy] <= levels[energy as keyof typeof levels] &&
        (context === "all" ||
          t.context === "anywhere" ||
          t.context === context),
    )
    .sort(
      (a, b) =>
        (a.due || "9999").localeCompare(b.due || "9999") ||
        Number(b.focus) - Number(a.focus) ||
        a.minutes - b.minutes,
    );
}
