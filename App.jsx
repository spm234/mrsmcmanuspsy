import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Search, Plus, X, Clock, CalendarClock, FolderOpen, AlertCircle, CheckCircle2, Circle,
  Trash2, ArrowLeft, ClipboardList, UserPlus, Archive, ArchiveRestore, ListChecks, Users2,
} from "lucide-react";

/* ---------------------------------- tokens --------------------------------- */
const COLORS = {
  paper: "#F3F4F0", panel: "#FFFFFF", ink: "#1F2D2B", inkSoft: "#4B5A56", muted: "#8A968F",
  line: "#E1E4DE", primary: "#3B6E64", primarySoft: "#E4ECE9",
  amber: "#C1622D", amberSoft: "#F5E3D6", red: "#A63D40", redSoft: "#F3DEDD",
};

/* Task types reflect the real Ohio special-education workflow: ETR (initial + 3-yr
   reevaluation), IEP annual review, FBA/BIP, 504 review, consent/paperwork windows,
   report writing, meeting scheduling, crisis follow-up. */
const TASK_TYPES = [
  { id: "etr_initial", label: "Initial ETR", color: "#3B6E64" },
  { id: "etr_reeval", label: "Reevaluation (3-yr ETR)", color: "#6B8CAE" },
  { id: "iep_review", label: "IEP Annual Review", color: "#8A5A73" },
  { id: "plan504", label: "504 Plan Review", color: "#B08D57" },
  { id: "fba_bip", label: "FBA / BIP", color: "#C1622D" },
  { id: "consent", label: "Consent / Paperwork", color: "#6B7280" },
  { id: "report", label: "Report Writing", color: "#5B7B8C" },
  { id: "meeting", label: "Meeting Scheduling", color: "#9C8AA5" },
  { id: "crisis", label: "Crisis Follow-up", color: "#A63D40" },
  { id: "other", label: "Other", color: "#9CA3AF" },
];
const taskTypeById = Object.fromEntries(TASK_TYPES.map((t) => [t.id, t]));

const ACTIVITY_TYPES = [
  { id: "assessment", label: "Assessment / Testing", color: "#3B6E64" },
  { id: "observation", label: "Observation", color: "#6B8CAE" },
  { id: "direct", label: "Direct Service / Counseling", color: "#C1622D" },
  { id: "meeting", label: "Meeting", color: "#8A5A73" },
  { id: "consult", label: "Consultation", color: "#B08D57" },
  { id: "documentation", label: "Documentation / Report Writing", color: "#6B7280" },
  { id: "crisis", label: "Crisis Response", color: "#A63D40" },
  { id: "other", label: "Other", color: "#9CA3AF" },
];
const activityById = Object.fromEntries(ACTIVITY_TYPES.map((a) => [a.id, a]));

const PLAN_TYPES = ["IEP", "504 Plan", "RTI / MTSS", "Evaluation in Progress", "Consultation Only"];
const DISABILITY_CATEGORIES = [
  "Not yet identified", "Autism", "Deaf-Blindness", "Deafness", "Emotional Disturbance",
  "Hearing Impairment", "Intellectual Disability", "Multiple Disabilities", "Orthopedic Impairment",
  "Other Health Impairment", "Specific Learning Disability", "Speech or Language Impairment",
  "Traumatic Brain Injury", "Visual Impairment", "Developmental Delay", "N/A — 504 only", "N/A — MTSS/RTI only",
];
const ROLE_OPTIONS = [
  "Special Education Teacher", "General Education Teacher", "Intervention Specialist",
  "Speech-Language Pathologist (SLP)", "Occupational Therapist (OT)", "Physical Therapist (PT)",
  "School Counselor", "Social Worker", "District Representative", "Administrator",
  "Parent / Guardian", "Other",
];

const OWNER = { name: "Lindsay McManus", credentials: "Psy.S, MA", title: "School Psychologist" };
const AVATAR_B64 = "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";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const todayISO = () => new Date().toISOString().slice(0, 10);

function minsToHM(mins) {
  const m = Math.round(mins || 0);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function daysUntil(iso) {
  if (!iso) return null;
  const today = new Date(todayISO() + "T00:00:00");
  const target = new Date(iso + "T00:00:00");
  return Math.round((target - today) / 86400000);
}
function taskStatus(task) {
  if (task.status === "done") return "done";
  if (!task.dueDate) return "none";
  const d = daysUntil(task.dueDate);
  if (d < 0) return "overdue";
  if (d <= 7) return "soon";
  return "upcoming";
}
const statusVisual = {
  overdue: { color: COLORS.red, bg: COLORS.redSoft, label: "Overdue" },
  soon: { color: COLORS.amber, bg: COLORS.amberSoft, label: "Due soon" },
  upcoming: { color: COLORS.primary, bg: COLORS.primarySoft, label: "Upcoming" },
  done: { color: COLORS.muted, bg: "#EEF0EC", label: "Done" },
  none: { color: COLORS.muted, bg: "#EEF0EC", label: "" },
};
const urgencyRank = { overdue: 0, soon: 1, upcoming: 2, none: 3, done: 4 };

/* --------------------------------- storage --------------------------------- */
/* Persists to the browser's localStorage — private to this browser/device, no
   server involved. Swap this hook out if Lindsay ever wants it synced across
   devices (that would need a real backend). */
const STORAGE_KEY = "caseload-store-v2";
const EMPTY = { students: [], tasks: [], entries: [] };

function useStore() {
  const [data, setData] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData({ ...EMPTY, ...JSON.parse(raw) });
      } else {
        // First-ever visit in this browser: seed demo data so the app isn't empty.
        const seeded = buildSampleData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        setData(seeded);
      }
    } catch (e) {
      setSaveError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback((next) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  }, []);

  return { data, setData: persist, loaded, saveError };
}

/* ------------------------------- sample data -------------------------------- */
function buildSampleData() {
  const d = (offset) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };
  const s = (name, grade, planType, disabilityCategory, team) => ({ id: uid(), name, grade, planType, disabilityCategory, team: team.map((m) => ({ id: uid(), ...m })), archived: false, createdAt: Date.now() });

  const students = [
    s("Ava Thompson", "2nd grade", "Evaluation in Progress", "Not yet identified", [
      { name: "Mrs. Kowalski", role: "General Education Teacher" }, { name: "Mr. Diaz", role: "Intervention Specialist" },
    ]),
    s("Owen Baxter", "5th grade", "IEP", "Specific Learning Disability", [
      { name: "Mr. Diaz", role: "Intervention Specialist" }, { name: "Sarah Ng", role: "Speech-Language Pathologist (SLP)" },
    ]),
    s("Maya Patel", "1st grade", "IEP", "Autism", [
      { name: "Ms. Ferris", role: "Special Education Teacher" }, { name: "Sarah Ng", role: "Speech-Language Pathologist (SLP)" }, { name: "Tom Reilly", role: "Occupational Therapist (OT)" },
    ]),
    s("Elijah Brooks", "8th grade", "504 Plan", "Other Health Impairment", [
      { name: "Mrs. Whitfield", role: "School Counselor" },
    ]),
    s("Grace Kim", "3rd grade", "IEP", "Emotional Disturbance", [
      { name: "Ms. Ferris", role: "Special Education Teacher" }, { name: "Mrs. Whitfield", role: "School Counselor" }, { name: "Dr. Osei", role: "District Representative" },
    ]),
    s("Noah Campbell", "6th grade", "RTI / MTSS", "N/A — MTSS/RTI only", [
      { name: "Mr. Diaz", role: "Intervention Specialist" },
    ]),
  ];
  const [ava, owen, maya, elijah, grace, noah] = students;

  const tasks = [
    { id: uid(), studentId: ava.id, type: "consent", title: "Get parent consent for initial evaluation", dueDate: d(-2), notes: "Sent home 2 weeks ago, following up by phone.", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: ava.id, type: "etr_initial", title: "Complete cognitive + academic testing", dueDate: d(12), notes: "", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: owen.id, type: "etr_reeval", title: "3-year reevaluation due", dueDate: d(3), notes: "Last ETR on file from 3 years ago this month.", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: owen.id, type: "iep_review", title: "Annual IEP review meeting", dueDate: d(20), notes: "", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: maya.id, type: "fba_bip", title: "Update BIP — new elopement behavior", dueDate: d(-5), notes: "Teacher flagged increased elopement in hallway transitions.", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: elijah.id, type: "plan504", title: "504 review meeting", dueDate: d(30), notes: "", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: grace.id, type: "report", title: "Finish ETR report narrative", dueDate: d(6), notes: "Draft started, need behavior rating scale results from teacher.", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: grace.id, type: "meeting", title: "Schedule eligibility meeting", dueDate: d(9), notes: "", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: noah.id, type: "consent", title: "Send RTI progress data to parent", dueDate: d(-1), notes: "", status: "open", createdAt: Date.now() },
    { id: uid(), studentId: owen.id, type: "report", title: "File prior ETR paperwork", dueDate: d(-30), notes: "", status: "done", createdAt: Date.now() },
  ];

  const entries = [
    { id: uid(), studentId: ava.id, date: d(-1), type: "assessment", minutes: 60, notes: "WISC-V administration, session 1.", createdAt: Date.now() },
    { id: uid(), studentId: ava.id, date: d(-4), type: "observation", minutes: 30, notes: "Classroom observation during reading block.", createdAt: Date.now() },
    { id: uid(), studentId: owen.id, date: d(-2), type: "documentation", minutes: 45, notes: "Reevaluation review of existing data.", createdAt: Date.now() },
    { id: uid(), studentId: maya.id, date: d(-1), type: "direct", minutes: 30, notes: "Weekly social skills group.", createdAt: Date.now() },
    { id: uid(), studentId: maya.id, date: d(-3), type: "consult", minutes: 20, notes: "Consulted with OT on sensory strategies.", createdAt: Date.now() },
    { id: uid(), studentId: elijah.id, date: d(-2), type: "direct", minutes: 30, notes: "Check-in counseling session.", createdAt: Date.now() },
    { id: uid(), studentId: grace.id, date: d(-5), type: "assessment", minutes: 90, notes: "Behavior rating scales + record review.", createdAt: Date.now() },
    { id: uid(), studentId: grace.id, date: d(-1), type: "crisis", minutes: 40, notes: "De-escalation support, safety check-in.", createdAt: Date.now() },
    { id: uid(), studentId: noah.id, date: d(-3), type: "consult", minutes: 15, notes: "MTSS data review with intervention specialist.", createdAt: Date.now() },
  ];

  return { students, tasks, entries };
}

/* ---------------------------------- app ------------------------------------ */
export default function App() {
  const { data, setData, loaded, saveError } = useStore();
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [caseFilter, setCaseFilter] = useState("active");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showTask, setShowTask] = useState(null);
  const [showLog, setShowLog] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const students = data.students, tasks = data.tasks, entries = data.entries;

  const totalsByStudent = useMemo(() => {
    const map = {};
    for (const s of students) map[s.id] = 0;
    for (const e of entries) if (map[e.studentId] !== undefined) map[e.studentId] += e.minutes;
    return map;
  }, [students, entries]);

  const openTasksByStudent = useMemo(() => {
    const map = {};
    for (const s of students) map[s.id] = [];
    for (const t of tasks) if (t.status !== "done" && map[t.studentId]) map[t.studentId].push(t);
    return map;
  }, [students, tasks]);

  const studentUrgency = useCallback((sid) => {
    const statuses = (openTasksByStudent[sid] || []).map(taskStatus);
    if (statuses.includes("overdue")) return "overdue";
    if (statuses.includes("soon")) return "soon";
    if (statuses.length) return "upcoming";
    return "none";
  }, [openTasksByStudent]);

  const allRoles = useMemo(() => {
    const set = new Set();
    students.forEach((s) => (s.team || []).forEach((m) => set.add(m.role)));
    return Array.from(set).sort();
  }, [students]);

  const visibleStudents = useMemo(() => {
    let list = students.filter((s) => (caseFilter === "active" ? !s.archived : caseFilter === "closed" ? s.archived : true));
    if (roleFilter !== "all") list = list.filter((s) => (s.team || []).some((m) => m.role === roleFilter));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.grade || "").toLowerCase().includes(q));
    }
    list = [...list];
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "time") list.sort((a, b) => totalsByStudent[b.id] - totalsByStudent[a.id]);
    else list.sort((a, b) => urgencyRank[studentUrgency(a.id)] - urgencyRank[studentUrgency(b.id)] || a.name.localeCompare(b.name));
    return list;
  }, [students, caseFilter, roleFilter, search, sortBy, totalsByStudent, studentUrgency]);

  const activeStudent = students.find((s) => s.id === activeId) || null;
  const studentName = (sid) => students.find((s) => s.id === sid)?.name || "—";

  /* ------------------------------ mutations ------------------------------ */
  const addStudent = (student) => {
    setData({ ...data, students: [...students, { id: uid(), team: [], archived: false, createdAt: Date.now(), ...student }] });
    setShowAddStudent(false);
  };
  const toggleArchive = (sid) => setData({ ...data, students: students.map((s) => (s.id === sid ? { ...s, archived: !s.archived } : s)) });
  const deleteStudent = (sid) => {
    setData({ students: students.filter((s) => s.id !== sid), tasks: tasks.filter((t) => t.studentId !== sid), entries: entries.filter((e) => e.studentId !== sid) });
    if (activeId === sid) setActiveId(null);
  };
  const saveTask = (task) => {
    if (task.id) setData({ ...data, tasks: tasks.map((t) => (t.id === task.id ? task : t)) });
    else setData({ ...data, tasks: [...tasks, { ...task, id: uid(), status: "open", createdAt: Date.now() }] });
    setShowTask(null);
  };
  const deleteTask = (id) => setData({ ...data, tasks: tasks.filter((t) => t.id !== id) });
  const toggleTaskDone = (id) => setData({ ...data, tasks: tasks.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "open" : "done" } : t)) });

  const saveEntry = (entry) => {
    if (entry.id) setData({ ...data, entries: entries.map((e) => (e.id === entry.id ? entry : e)) });
    else setData({ ...data, entries: [...entries, { ...entry, id: uid(), createdAt: Date.now() }] });
    setShowLog(null);
  };
  const deleteEntry = (id) => setData({ ...data, entries: entries.filter((e) => e.id !== id) });
  const saveTeam = (sid, team) => {
    setData({ ...data, students: students.map((s) => (s.id === sid ? { ...s, team } : s)) });
    setShowTeamModal(false);
  };
  const loadSampleData = () => { if (confirm("Replace everything currently loaded with fresh sample data?")) setData(buildSampleData()); };
  const clearAllData = () => { if (confirm("Clear all cases, tasks, and logged time? This can't be undone.")) setData(EMPTY); };

  if (!loaded) {
    return <div style={{ background: COLORS.paper, minHeight: "100vh" }} className="flex items-center justify-center">
      <div style={{ color: COLORS.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>Opening caseload…</div>
    </div>;
  }

  return (
    <div style={{ background: COLORS.paper, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: COLORS.ink }}>
      <FontImports />
      {saveError && <div style={{ background: COLORS.redSoft, color: COLORS.red }} className="text-xs text-center py-1 px-4">
        Changes aren't saving right now — keep working, but avoid closing this tab.
      </div>}

      <div className="flex flex-col md:flex-row" style={{ minHeight: "100vh" }}>
        {/* ---------------- Sidebar ---------------- */}
        <div className="md:w-80 w-full flex-shrink-0 flex flex-col" style={{ borderRight: `1px solid ${COLORS.line}`, background: COLORS.panel }}>
          <div className="px-5 pt-6 pb-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
            <img src={`data:image/jpeg;base64,${AVATAR_B64}`} alt={OWNER.name} className="w-11 h-11 rounded-full flex-shrink-0 object-cover" style={{ border: `2px solid ${COLORS.primarySoft}` }} />
            <div className="min-w-0">
              <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.15 }} className="truncate">
                {OWNER.name}, {OWNER.credentials}
              </h1>
              <div style={{ color: COLORS.primary, fontSize: 11.5, fontWeight: 600 }}>{OWNER.title}</div>
              <div style={{ color: COLORS.muted, fontSize: 11 }}>{visibleStudents.length} of {students.filter((s) => !s.archived).length} active cases</div>
            </div>
          </div>

          <div className="px-4 pt-3 pb-2 flex flex-col gap-2" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
            <div className="relative">
              <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: COLORS.muted }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students…"
                className="w-full text-sm py-2 pl-8 pr-3 rounded-md outline-none" style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}` }} />
            </div>
            <div className="flex gap-1.5 text-xs">
              {["active", "closed", "all"].map((f) => (
                <button key={f} onClick={() => setCaseFilter(f)} className="px-2.5 py-1 rounded-full capitalize"
                  style={{ background: caseFilter === f ? COLORS.primary : "transparent", color: caseFilter === f ? "#fff" : COLORS.inkSoft, border: `1px solid ${caseFilter === f ? COLORS.primary : COLORS.line}` }}>
                  {f}
                </button>
              ))}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ml-auto text-xs rounded-md px-1.5 py-1 outline-none" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft, background: "#fff" }}>
                <option value="urgency">By urgency</option>
                <option value="name">By name</option>
                <option value="time">By time</option>
              </select>
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-xs rounded-md px-2 py-1.5 outline-none" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft, background: "#fff" }}>
              <option value="all">All support roles</option>
              {allRoles.map((r) => <option key={r} value={r}>Has: {r}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <button onClick={() => { setActiveId(null); setTab("overview"); }} className="w-full text-left px-5 py-3 flex items-center gap-2"
              style={{ background: activeId === null ? COLORS.primarySoft : "transparent", borderBottom: `1px solid ${COLORS.line}` }}>
              <ClipboardList size={16} color={COLORS.primary} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.primary }}>Caseload overview</span>
              {tasks.some((t) => taskStatus(t) === "overdue") && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: COLORS.red }} />}
            </button>

            {visibleStudents.length === 0 && <div className="px-5 py-8 text-center" style={{ color: COLORS.muted, fontSize: 13 }}>No students match. Add one to get started.</div>}

            {visibleStudents.map((s) => {
              const urgency = studentUrgency(s.id);
              const v = statusVisual[urgency];
              const openCount = (openTasksByStudent[s.id] || []).length;
              return (
                <button key={s.id} onClick={() => { setActiveId(s.id); setTab("overview"); }} className="w-full text-left px-4 py-3 flex items-center gap-3"
                  style={{ background: activeId === s.id ? COLORS.primarySoft : "transparent", borderBottom: `1px solid ${COLORS.line}`, borderLeft: `3px solid ${urgency === "none" ? "transparent" : v.color}`, opacity: s.archived ? 0.55 : 1 }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 14, fontWeight: 600 }} className="truncate">{s.name}</span>
                      {s.archived && <Archive size={11} color={COLORS.muted} />}
                    </div>
                    <div style={{ fontSize: 11.5, color: COLORS.muted }} className="truncate">{[s.grade, s.planType].filter(Boolean).join(" · ") || "—"}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {openCount > 0 ? (
                      <div className="text-xs px-1.5 py-0.5 rounded-full inline-block" style={{ background: v.bg, color: v.color, fontWeight: 600 }}>{openCount} open</div>
                    ) : (
                      <div style={{ fontSize: 11, color: COLORS.muted }}>No tasks</div>
                    )}
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: COLORS.muted, marginTop: 2 }}>{minsToHM(totalsByStudent[s.id])} logged</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${COLORS.line}` }}>
            <button onClick={() => setShowAddStudent(true)} className="w-full py-2.5 rounded-md flex items-center justify-center gap-1.5 text-sm font-medium hover:opacity-90"
              style={{ background: COLORS.primary, color: "#fff" }}>
              <Plus size={16} /> New case
            </button>
            <div className="flex gap-2">
              <button onClick={loadSampleData} className="flex-1 py-1.5 rounded-md text-xs" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.muted }}>
                Reset sample data
              </button>
              <button onClick={clearAllData} className="flex-1 py-1.5 rounded-md text-xs" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.muted }}>
                Clear all data
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- Main panel ---------------- */}
        <div className="flex-1 min-w-0">
          {activeId === null ? (
            <CaseloadOverview
              students={students} tasks={tasks} entries={entries} totalsByStudent={totalsByStudent}
              onOpenStudent={(id) => { setActiveId(id); setTab("overview"); }}
              onNewTask={() => setShowTask({ studentId: students.find((s) => !s.archived)?.id || null })}
              onToggleTask={toggleTaskDone} studentName={studentName}
            />
          ) : (
            <StudentPanel
              student={activeStudent}
              tasks={tasks.filter((t) => t.studentId === activeId)}
              entries={entries.filter((e) => e.studentId === activeId)}
              totalMinutes={totalsByStudent[activeId] || 0}
              tab={tab} setTab={setTab}
              onBack={() => setActiveId(null)}
              onNewTask={() => setShowTask({ studentId: activeId })}
              onEditTask={(t) => setShowTask({ studentId: activeId, editTask: t })}
              onDeleteTask={deleteTask} onToggleTask={toggleTaskDone}
              onLog={() => setShowLog({ studentId: activeId })}
              onEditEntry={(e) => setShowLog({ studentId: activeId, editEntry: e })}
              onDeleteEntry={deleteEntry}
              onArchive={() => toggleArchive(activeId)}
              onDelete={() => { if (confirm(`Remove ${activeStudent.name}'s case, tasks, and logged time? This can't be undone.`)) deleteStudent(activeId); }}
              onManageTeam={() => setShowTeamModal(true)}
            />
          )}
        </div>
      </div>

      {showAddStudent && <AddStudentModal onCancel={() => setShowAddStudent(false)} onSave={addStudent} />}
      {showTask && (
        <TaskModal students={students.filter((s) => !s.archived)} initial={showTask} onCancel={() => setShowTask(null)} onSave={saveTask}
          onDelete={showTask.editTask ? () => { deleteTask(showTask.editTask.id); setShowTask(null); } : null} />
      )}
      {showLog && (
        <LogEntryModal students={students.filter((s) => !s.archived)} initial={showLog} onCancel={() => setShowLog(null)} onSave={saveEntry}
          onDelete={showLog.editEntry ? () => { deleteEntry(showLog.editEntry.id); setShowLog(null); } : null} />
      )}
      {showTeamModal && activeStudent && <TeamModal student={activeStudent} onCancel={() => setShowTeamModal(false)} onSave={(team) => saveTeam(activeStudent.id, team)} />}
    </div>
  );
}

/* ---------------------------- Caseload overview ---------------------------- */
function CaseloadOverview({ students, tasks, entries, totalsByStudent, onOpenStudent, onNewTask, onToggleTask, studentName }) {
  const active = students.filter((s) => !s.archived);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const overdue = openTasks.filter((t) => taskStatus(t) === "overdue");
  const soon = openTasks.filter((t) => taskStatus(t) === "soon");
  const etrOpen = openTasks.filter((t) => t.type === "etr_initial" || t.type === "etr_reeval");

  const filteredTasks = useMemo(() => {
    let list = showDone ? tasks : openTasks;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    return [...list].sort((a, b) => {
      if (!!a.dueDate !== !!b.dueDate) return a.dueDate ? -1 : 1;
      return (a.dueDate || "").localeCompare(b.dueDate || "") || urgencyRank[taskStatus(a)] - urgencyRank[taskStatus(b)];
    });
  }, [tasks, openTasks, typeFilter, showDone]);

  const now = new Date(); const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const weekMins = entries.filter((e) => new Date(e.date) >= weekAgo).reduce((s, e) => s + e.minutes, 0);
  const topStudents = useMemo(() => active
    .map((s) => ({ name: s.name.split(" ")[0] + (s.name.split(" ")[1] ? " " + s.name.split(" ")[1][0] + "." : ""), full: s.name, id: s.id, minutes: totalsByStudent[s.id] || 0 }))
    .filter((d) => d.minutes > 0).sort((a, b) => b.minutes - a.minutes).slice(0, 6), [active, totalsByStudent]);

  const directory = useMemo(() => {
    const map = {};
    active.forEach((s) => (s.team || []).forEach((m) => {
      const key = m.name.trim().toLowerCase() + "|" + m.role;
      if (!map[key]) map[key] = { name: m.name, role: m.role, students: [] };
      map[key].students.push(s.name);
    }));
    return Object.values(map).sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  }, [active]);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 600 }}>Caseload overview</h2>
          <p style={{ color: COLORS.muted, fontSize: 13.5, marginTop: 2 }}>{active.length} active {active.length === 1 ? "case" : "cases"} · {fmtDate(todayISO())}</p>
        </div>
        <button onClick={onNewTask} disabled={!students.length} className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-40"
          style={{ background: COLORS.primary, color: "#fff" }}>
          <Plus size={15} /> New task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active cases" value={active.length} icon={<Users2 size={15} />} />
        <StatCard label="Overdue tasks" value={overdue.length} icon={<AlertCircle size={15} />} accent={overdue.length ? COLORS.red : undefined} />
        <StatCard label="Due this week" value={soon.length} icon={<CalendarClock size={15} />} accent={soon.length ? COLORS.amber : undefined} />
        <StatCard label="ETRs pending" value={etrOpen.length} icon={<ListChecks size={15} />} accent={etrOpen.length ? COLORS.primary : undefined} />
      </div>

      <Panel
        title={`Outstanding tasks (${openTasks.length})`}
        action={
          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-xs rounded-md px-2 py-1 outline-none" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}>
              <option value="all">All types</option>
              {TASK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs" style={{ color: COLORS.muted }}>
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show completed
            </label>
          </div>
        }
      >
        {filteredTasks.length ? (
          <div className="flex flex-col divide-y" style={{ borderColor: COLORS.line }}>
            {filteredTasks.map((t) => (
              <TaskRow key={t.id} task={t} showStudent studentName={studentName(t.studentId)} onOpenStudent={() => onOpenStudent(t.studentId)} onToggle={() => onToggleTask(t.id)} />
            ))}
          </div>
        ) : <EmptyNote text="Nothing outstanding. New tasks — ETRs, IEP reviews, FBAs, and more — will show up here." />}
      </Panel>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Panel title="Support team directory">
          {directory.length ? (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {directory.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: COLORS.primary }} />
                  <div className="min-w-0">
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: COLORS.muted }}> · {p.role}</span>
                    <div style={{ color: COLORS.muted }} className="truncate">{p.students.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyNote text="Add team members to a case to build this directory." />}
        </Panel>

        <Panel title="Time snapshot">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: COLORS.primary }}>{minsToHM(weekMins)}</div>
          <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 8 }}>logged in the last 7 days</div>
          {topStudents.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={topStudents} layout="vertical" margin={{ left: 4, right: 12, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={64} tick={{ fontSize: 11, fill: COLORS.inkSoft }} />
                <Tooltip formatter={(v) => minsToHM(v)} labelFormatter={(_, p) => p?.[0]?.payload?.full || ""} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}` }} />
                <Bar dataKey="minutes" fill={COLORS.primary} radius={[0, 4, 4, 0]} onClick={(d) => onOpenStudent(d.id)} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyNote text="Log time on the Time tab of a case to see totals." />}
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------- Student panel ------------------------------ */
function StudentPanel({ student, tasks, entries, totalMinutes, tab, setTab, onBack, onNewTask, onEditTask, onDeleteTask, onToggleTask, onLog, onEditEntry, onDeleteEntry, onArchive, onDelete, onManageTeam }) {
  if (!student) return null;
  const openTasks = tasks.filter((t) => t.status !== "done").sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  const doneTasks = tasks.filter((t) => t.status === "done");
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const feed = useMemo(() => {
    const items = [
      ...tasks.map((t) => ({ kind: "task", date: t.dueDate || todayISO(), sortKey: t.createdAt, t })),
      ...entries.map((e) => ({ kind: "entry", date: e.date, sortKey: e.createdAt, e })),
    ];
    return items.sort((a, b) => b.sortKey - a.sortKey).slice(0, 6);
  }, [tasks, entries]);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4 hover:underline" style={{ color: COLORS.muted }}><ArrowLeft size={14} /> All cases</button>

      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 600 }}>{student.name}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {student.grade && <Badge text={student.grade} />}
            {student.planType && <Badge text={student.planType} tone={COLORS.primary} bg={COLORS.primarySoft} />}
            {student.disabilityCategory && student.disabilityCategory !== "Not yet identified" && <Badge text={student.disabilityCategory} />}
          </div>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={onArchive} title={student.archived ? "Reopen case" : "Close case"}>{student.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}</IconButton>
          <IconButton onClick={onDelete} title="Delete case" danger><Trash2 size={15} /></IconButton>
        </div>
      </div>

      <div className="flex gap-1 mt-5 mb-6 flex-wrap" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "tasks", label: `Tasks (${openTasks.length})` },
          { id: "team", label: `Team (${(student.team || []).length})` },
          { id: "time", label: "Time" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-3.5 py-2 text-sm font-medium relative" style={{ color: tab === t.id ? COLORS.primary : COLORS.muted }}>
            {t.label}
            {tab === t.id && <div className="absolute left-0 right-0 -bottom-px h-0.5" style={{ background: COLORS.primary }} />}
          </button>
        ))}
        <button onClick={tab === "time" ? onLog : onNewTask} className="ml-auto mb-1.5 flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: COLORS.primary, color: "#fff" }}>
          <Plus size={13} /> {tab === "time" ? "Log time" : "Add task"}
        </button>
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Panel title="Open tasks">
            {openTasks.length ? (
              <div className="flex flex-col divide-y" style={{ borderColor: COLORS.line }}>
                {openTasks.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onClick={() => onEditTask(t)} />)}
              </div>
            ) : <EmptyNote text="No open tasks for this case." />}
          </Panel>
          <Panel title="Recent activity">
            {feed.length ? (
              <div className="flex flex-col divide-y" style={{ borderColor: COLORS.line }}>
                {feed.map((item, i) => item.kind === "task"
                  ? <TaskRow key={i} task={item.t} compact onToggle={() => onToggleTask(item.t.id)} onClick={() => onEditTask(item.t)} />
                  : <EntryRow key={i} entry={item.e} compact onClick={() => onEditEntry(item.e)} />
                )}
              </div>
            ) : <EmptyNote text="Nothing logged yet." />}
          </Panel>
          <div className="md:col-span-2">
            <Panel title="Time logged"><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: COLORS.primary }}>{minsToHM(totalMinutes)}</div>
              <div style={{ color: COLORS.muted, fontSize: 12 }}>across {entries.length} logged {entries.length === 1 ? "entry" : "entries"} — see the Time tab for a breakdown</div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="flex flex-col gap-6">
          <Panel title={`Open (${openTasks.length})`}>
            {openTasks.length ? (
              <div className="flex flex-col divide-y" style={{ borderColor: COLORS.line }}>
                {openTasks.map((t) => <TaskRow key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onClick={() => onEditTask(t)} onDelete={() => onDeleteTask(t.id)} />)}
              </div>
            ) : <EmptyNote text="Nothing outstanding for this case right now." />}
          </Panel>
          {doneTasks.length > 0 && (
            <Panel title={`Completed (${doneTasks.length})`}>
              <div className="flex flex-col divide-y" style={{ borderColor: COLORS.line }}>
                {doneTasks.map((t) => <TaskRow key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onClick={() => onEditTask(t)} onDelete={() => onDeleteTask(t.id)} />)}
              </div>
            </Panel>
          )}
        </div>
      )}

      {tab === "team" && (
        <Panel title="Who's involved" action={<button onClick={onManageTeam} className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.primary }}><UserPlus size={13} /> Manage team</button>}>
          {(student.team || []).length ? (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {student.team.map((m) => (
                <div key={m.id} className="p-3 rounded-lg" style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{m.role}</div>
                </div>
              ))}
            </div>
          ) : <EmptyNote text="No team members added. Add the special education teacher, intervention specialist, or others working this case." />}
        </Panel>
      )}

      {tab === "time" && (
        <Panel title={`Logged time — ${minsToHM(totalMinutes)} total`}>
          {sortedEntries.length ? (
            <div className="flex flex-col divide-y" style={{ borderColor: COLORS.line }}>
              {sortedEntries.map((e) => <EntryRow key={e.id} entry={e} onClick={() => onEditEntry(e)} onDelete={() => onDeleteEntry(e.id)} />)}
            </div>
          ) : <EmptyNote text="No time logged for this case yet. This is optional — use it when you want a record of how much a case is taking." />}
        </Panel>
      )}
    </div>
  );
}

/* --------------------------------- pieces ----------------------------------- */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="p-3.5 rounded-lg" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center gap-1.5" style={{ color: accent || COLORS.muted, fontSize: 11.5 }}>{icon} {label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: accent || COLORS.ink, marginTop: 4 }}>{value}</div>
    </div>
  );
}
function Panel({ title, action, children }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
function EmptyNote({ text }) { return <div style={{ color: COLORS.muted, fontSize: 13 }} className="py-4 text-center">{text}</div>; }
function IconButton({ children, onClick, title, danger }) {
  return <button onClick={onClick} title={title} className="p-2 rounded-md" style={{ border: `1px solid ${COLORS.line}`, color: danger ? COLORS.red : COLORS.inkSoft, background: "#fff" }}>{children}</button>;
}
function Badge({ text, tone, bg }) {
  return <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: tone || COLORS.inkSoft, background: bg || COLORS.paper, border: `1px solid ${tone ? "transparent" : COLORS.line}`, fontWeight: 600 }}>{text}</span>;
}

function TaskRow({ task, showStudent, studentName, onOpenStudent, onToggle, onClick, onDelete, compact }) {
  const type = taskTypeById[task.type];
  const st = taskStatus(task);
  const v = statusVisual[st];
  return (
    <div className="flex items-center gap-3 py-2.5 first:pt-0 group">
      <button onClick={onToggle} className="flex-shrink-0">
        {task.status === "done" ? <CheckCircle2 size={17} color={COLORS.muted} /> : <Circle size={17} color={v.color} />}
      </button>
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: type.color + "22", color: type.color, fontWeight: 600 }}>{type.label}</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? COLORS.muted : COLORS.ink }} className="truncate">{task.title}</span>
        </div>
        {!compact && task.notes && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }} className="line-clamp-1">{task.notes}</div>}
        {showStudent && (
          <button onClick={(ev) => { ev.stopPropagation(); onOpenStudent(); }} className="text-xs hover:underline mt-0.5" style={{ color: COLORS.primary }}>{studentName}</button>
        )}
      </button>
      {task.dueDate && task.status !== "done" && (
        <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ background: v.bg, color: v.color, fontWeight: 600 }}>{fmtDate(task.dueDate)}</span>
      )}
      {onDelete && <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 flex-shrink-0" title="Delete task"><Trash2 size={13} color={COLORS.muted} /></button>}
    </div>
  );
}

function EntryRow({ entry, compact, onClick, onDelete }) {
  const a = activityById[entry.type];
  return (
    <div className="flex items-start gap-3 py-2.5 first:pt-0 group">
      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: a.color }} />
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.label}</span>
          <span style={{ fontSize: 11.5, color: COLORS.muted }}>{fmtDate(entry.date)}</span>
        </div>
        {entry.notes && !compact && <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }} className="line-clamp-2">{entry.notes}</div>}
      </button>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: COLORS.inkSoft }} className="flex-shrink-0 mt-0.5">{minsToHM(entry.minutes)}</span>
      {onDelete && <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 flex-shrink-0" title="Delete entry"><Trash2 size={13} color={COLORS.muted} /></button>}
    </div>
  );
}

/* --------------------------------- modals ----------------------------------- */
function ModalShell({ title, onCancel, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(31,45,43,0.35)" }}>
      <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-xl p-5 max-h-[90vh] overflow-y-auto`} style={{ background: COLORS.panel, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 19, fontWeight: 600 }}>{title}</h3>
          <button onClick={onCancel}><X size={18} color={COLORS.muted} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return <div className="mb-3.5"><label style={{ fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }} className="block mb-1">{label}</label>{children}</div>;
}
const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 13.5, outline: "none", fontFamily: "inherit" };

function AddStudentModal({ onCancel, onSave }) {
  const [name, setName] = useState(""); const [grade, setGrade] = useState("");
  const [planType, setPlanType] = useState(PLAN_TYPES[0]); const [disabilityCategory, setDisabilityCategory] = useState(DISABILITY_CATEGORIES[0]);
  return (
    <ModalShell title="New case" onCancel={onCancel}>
      <Field label="Student name"><input autoFocus style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Reyes" /></Field>
      <Field label="Grade"><input style={inputStyle} value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 3rd grade" /></Field>
      <Field label="Plan type"><select style={inputStyle} value={planType} onChange={(e) => setPlanType(e.target.value)}>{PLAN_TYPES.map((o) => <option key={o}>{o}</option>)}</select></Field>
      <Field label="Disability category (optional)"><select style={inputStyle} value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}>{DISABILITY_CATEGORIES.map((o) => <option key={o}>{o}</option>)}</select></Field>
      <div className="flex gap-2 mt-5">
        <button onClick={onCancel} className="flex-1 py-2 rounded-md text-sm" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}>Cancel</button>
        <button onClick={() => name.trim() && onSave({ name: name.trim(), grade: grade.trim(), planType, disabilityCategory })} disabled={!name.trim()}
          className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-40" style={{ background: COLORS.primary, color: "#fff" }}>Add case</button>
      </div>
    </ModalShell>
  );
}

function TaskModal({ students, initial, onCancel, onSave, onDelete }) {
  const t = initial.editTask;
  const [studentId, setStudentId] = useState(t?.studentId || initial.studentId || students[0]?.id || "");
  const [type, setType] = useState(t?.type || "etr_initial");
  const [title, setTitle] = useState(t?.title || "");
  const [dueDate, setDueDate] = useState(t?.dueDate || "");
  const [notes, setNotes] = useState(t?.notes || "");
  const canSave = studentId && title.trim();
  return (
    <ModalShell title={t ? "Edit task" : "New task"} onCancel={onCancel} wide>
      <Field label="Student"><select style={inputStyle} value={studentId} onChange={(e) => setStudentId(e.target.value)}>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      <Field label="Task type"><select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>{TASK_TYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select></Field>
      <Field label="What needs to happen"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete cognitive testing, Send ETR draft to team" /></Field>
      <Field label="Due date (optional)"><input type="date" style={inputStyle} value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      <Field label="Notes (optional)"><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div className="flex gap-2 mt-4">
        {onDelete && <button onClick={onDelete} className="py-2 px-3 rounded-md text-sm" style={{ border: `1px solid ${COLORS.redSoft}`, color: COLORS.red }}>Delete</button>}
        <button onClick={onCancel} className="flex-1 py-2 rounded-md text-sm" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}>Cancel</button>
        <button onClick={() => canSave && onSave({ id: t?.id, studentId, type, title: title.trim(), dueDate, notes, status: t?.status || "open" })} disabled={!canSave}
          className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-40" style={{ background: COLORS.primary, color: "#fff" }}>{t ? "Save changes" : "Add task"}</button>
      </div>
    </ModalShell>
  );
}

function LogEntryModal({ students, initial, onCancel, onSave, onDelete }) {
  const e = initial.editEntry;
  const [studentId, setStudentId] = useState(e?.studentId || initial.studentId || students[0]?.id || "");
  const [date, setDate] = useState(e?.date || todayISO());
  const [type, setType] = useState(e?.type || ACTIVITY_TYPES[0].id);
  const [minutes, setMinutes] = useState(e?.minutes ?? 30);
  const [notes, setNotes] = useState(e?.notes || "");
  const canSave = studentId && date && minutes > 0;
  return (
    <ModalShell title={e ? "Edit logged time" : "Log time"} onCancel={onCancel} wide>
      <Field label="Student"><select style={inputStyle} value={studentId} onChange={(ev) => setStudentId(ev.target.value)}>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" style={inputStyle} value={date} onChange={(ev) => setDate(ev.target.value)} /></Field>
        <Field label="Minutes"><input type="number" min={1} style={inputStyle} value={minutes} onChange={(ev) => setMinutes(Number(ev.target.value))} /></Field>
      </div>
      <Field label="Activity type"><select style={inputStyle} value={type} onChange={(ev) => setType(ev.target.value)}>{ACTIVITY_TYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select></Field>
      <Field label="Notes (optional)"><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={notes} onChange={(ev) => setNotes(ev.target.value)} /></Field>
      <div className="flex gap-2 mt-4">
        {onDelete && <button onClick={onDelete} className="py-2 px-3 rounded-md text-sm" style={{ border: `1px solid ${COLORS.redSoft}`, color: COLORS.red }}>Delete</button>}
        <button onClick={onCancel} className="flex-1 py-2 rounded-md text-sm" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}>Cancel</button>
        <button onClick={() => canSave && onSave({ id: e?.id, studentId, date, type, minutes, notes })} disabled={!canSave}
          className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-40" style={{ background: COLORS.primary, color: "#fff" }}>{e ? "Save changes" : "Log time"}</button>
      </div>
    </ModalShell>
  );
}

function TeamModal({ student, onCancel, onSave }) {
  const [team, setTeam] = useState(student.team || []);
  const [name, setName] = useState(""); const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const add = () => { if (!name.trim()) return; setTeam([...team, { id: uid(), name: name.trim(), role }]); setName(""); };
  return (
    <ModalShell title={`Team — ${student.name}`} onCancel={onCancel}>
      <div className="flex flex-col gap-2 mb-4">
        {team.map((m) => (
          <div key={m.id} className="flex items-center gap-2 p-2 rounded-md" style={{ background: COLORS.paper }}>
            <div className="flex-1 min-w-0"><div style={{ fontSize: 13.5, fontWeight: 600 }} className="truncate">{m.name}</div><div style={{ fontSize: 11.5, color: COLORS.muted }}>{m.role}</div></div>
            <button onClick={() => setTeam(team.filter((x) => x.id !== m.id))}><X size={14} color={COLORS.muted} /></button>
          </div>
        ))}
        {team.length === 0 && <EmptyNote text="No team members yet." />}
      </div>
      <div className="flex gap-2 items-end mb-1">
        <div className="flex-1"><Field label="Name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mrs. Alvarez" onKeyDown={(e) => e.key === "Enter" && add()} /></Field></div>
        <div className="flex-1"><Field label="Role"><select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>{ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}</select></Field></div>
        <button onClick={add} className="mb-3.5 p-2 rounded-md" style={{ background: COLORS.primary, color: "#fff" }}><Plus size={16} /></button>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 py-2 rounded-md text-sm" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}>Cancel</button>
        <button onClick={() => onSave(team)} className="flex-1 py-2 rounded-md text-sm font-medium" style={{ background: COLORS.primary, color: "#fff" }}>Save team</button>
      </div>
    </ModalShell>
  );
}

function FontImports() {
  return <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>;
}
