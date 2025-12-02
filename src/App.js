import React, { useEffect, useMemo, useState } from "react";

/* ================= Chart.js & react-chartjs-2 ================= */
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

/* ================= Material UI (BRS Styling) ================= */
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  Snackbar,
  Alert,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import {
  Logout,
  PersonAdd,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Insights as InsightsIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  LightMode,
  DarkMode,
  ShowChart as ShowChartIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Article as ArticleIcon,
  Brush as BrushIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

/* ======== Calendar (react-big-calendar + date-fns) ======== */
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format as dfFormat,
  parse as dfParse,
  startOfWeek as dfStartOfWeek,
  getDay,
} from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

/* ====================== Utilities ====================== */
const today = () => new Date().toLocaleDateString();
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr, k) => {
  const pool = [...arr];
  const out = [];
  const n = Math.min(k, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
};

const scaleToPct = (n) => Math.round(((Number(n) - 1) / 4) * 100);
const ynToPct = (val) => (val === "Yes" ? 100 : val === "No" ? 0 : null);
const mcScore = (options, selected) => {
  const found = options.find((o) => o.value === selected);
  return found ? found.score : null;
};

/* ======= date-fns localizer for react-big-calendar ======= */
const locales = { "en-US": undefined };
const localizer = dateFnsLocalizer({
  format: dfFormat,
  parse: (value, formatString) => dfParse(value, formatString, new Date()),
  startOfWeek: (date) => dfStartOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

/* ====================== Assessment Setup ====================== */
const CATS = ["Communication", "Social", "Adaptive", "Academic", "Behavior"];

const ASSESS_QUESTIONS = {
  Communication: [
    { id: "c1", type: "yesno", text: "Follows 2-step instructions?" },
    {
      id: "c2",
      type: "scale",
      text: "Initiates communication independently (1–5)?",
    },
    {
      id: "c3",
      type: "mc",
      text: "Primary communication mode?",
      options: [
        { value: "Nonverbal", label: "Nonverbal", score: 25 },
        { value: "AAC", label: "AAC", score: 60 },
        { value: "Words/Phrases", label: "Words/Phrases", score: 90 },
      ],
    },
  ],
  Social: [
    { id: "s1", type: "yesno", text: "Engages in peer play?" },
    {
      id: "s2",
      type: "mc",
      text: "Peer interaction style",
      options: [
        { value: "Isolated", label: "Isolated", score: 20 },
        { value: "Parallel", label: "Parallel", score: 55 },
        { value: "Cooperative", label: "Cooperative", score: 85 },
      ],
    },
    { id: "s3", type: "scale", text: "Turn taking independence (1–5)?" },
  ],
  Adaptive: [
    { id: "a1", type: "yesno", text: "Dresses independently?" },
    { id: "a2", type: "scale", text: "Toileting/safety independence (1–5)?" },
  ],
  Academic: [
    { id: "ac1", type: "yesno", text: "Identifies letters?" },
    {
      id: "ac2",
      type: "scale",
      text: "Completes classroom tasks independently (1–5)?",
    },
  ],
  Behavior: [
    { id: "b1", type: "yesno", text: "Responds to redirection?" },
    {
      id: "b2",
      type: "scale",
      text: "Needs behavior support frequency (1–5)?",
    },
  ],
};

/* ====================== ABA Goal Library ====================== */
const GOAL_LIB = {
  Communication: [
    {
      condition: "Given a verbal instruction",
      behavior: "follow 2-step directions",
      criteria: "with no more than 1 prompt in 4/5 trials",
      mastery: "across 3 consecutive sessions",
    },
    {
      condition: "When presented with familiar vocabulary",
      behavior: "label 10 items independently",
      criteria: "with 80% accuracy",
      mastery: "across 3 consecutive sessions",
    },
    {
      condition: "Given a visual cue or AAC",
      behavior: "request a preferred item using words or AAC",
      criteria: "in 80% of opportunities",
      mastery: "over 2 consecutive weeks",
    },
    {
      condition: "During classroom routines",
      behavior: "answer simple WH questions (who/what/where)",
      criteria: "with 80% accuracy",
      mastery: "over 3 data-days",
    },
    {
      condition: "Given a peer or adult greeting",
      behavior: "respond with an appropriate verbal or AAC greeting",
      criteria: "in 4/5 opportunities",
      mastery: "across 2 settings",
    },
  ],
  Social: [
    {
      condition: "During structured play",
      behavior: "engage in reciprocal turn-taking for 3 exchanges",
      criteria: "in 4/5 opportunities",
      mastery: "across 2 different partners",
    },
    {
      condition: "Given a group activity",
      behavior: "greet peers appropriately",
      criteria: "in 4/5 opportunities",
      mastery: "across 1 week",
    },
    {
      condition: "When sharing materials",
      behavior: "share with peers when prompted",
      criteria: "in 4/5 trials",
      mastery: "across 2 different activities",
    },
    {
      condition: "In a small group",
      behavior: "ask a peer a relevant question",
      criteria: "in 3/4 opportunities",
      mastery: "across 3 sessions",
    },
    {
      condition: "During free play",
      behavior: "join a peer activity appropriately",
      criteria: "in 4/5 opportunities",
      mastery: "across 2 settings",
    },
  ],
  Adaptive: [
    {
      condition: "During toileting routines",
      behavior: "complete each step independently",
      criteria: "with 80% accuracy",
      mastery: "across 3 sessions",
    },
    {
      condition: "Given a daily schedule",
      behavior: "transition between tasks within 1 minute",
      criteria: "in 4/5 opportunities",
      mastery: "over 1 week",
    },
    {
      condition: "When dressing",
      behavior: "fasten clothing items independently",
      criteria: "in 3/4 trials",
      mastery: "across 2 consecutive days",
    },
    {
      condition: "At snack/lunch",
      behavior: "use appropriate utensils",
      criteria: "with 80% independence",
      mastery: "across 3 sessions",
    },
    {
      condition: "During clean-up",
      behavior: "put materials away to labeled locations",
      criteria: "in 4/5 trials",
      mastery: "across 2 settings",
    },
  ],
  Academic: [
    {
      condition: "Given independent work time",
      behavior: "complete assignments within 10 minutes",
      criteria: "with no more than 2 prompts",
      mastery: "across 3 sessions",
    },
    {
      condition: "During small-group lessons",
      behavior: "answer comprehension questions",
      criteria: "with 80% accuracy",
      mastery: "in 3 sessions",
    },
    {
      condition: "When given a worksheet",
      behavior: "sustain on-task behavior for 10 minutes",
      criteria: "with fewer than 2 prompts",
      mastery: "across 3 sessions",
    },
    {
      condition: "Given math tasks",
      behavior: "complete 10 problems accurately",
      criteria: "with 80% accuracy",
      mastery: "across 2 consecutive days",
    },
    {
      condition: "Given writing prompts",
      behavior: "produce a 3-sentence response",
      criteria: "with correct capitalization and punctuation",
      mastery: "in 4/5 opportunities",
    },
  ],
  Behavior: [
    {
      condition: "When given a non-preferred task",
      behavior: "use a taught coping strategy to remain on task 5 minutes",
      criteria: "with 80% success",
      mastery: "across 3 sessions",
    },
    {
      condition: "Following a corrective prompt",
      behavior: "return to task within 30 seconds",
      criteria: "in 4/5 opportunities",
      mastery: "across 3 days",
    },
    {
      condition: "During instructional time",
      behavior: "maintain appropriate body posture and voice level",
      criteria: "for 10 minutes",
      mastery: "in 3 sessions",
    },
    {
      condition: "When frustrated",
      behavior: "request a break using taught phrase or AAC",
      criteria: "in 4/5 opportunities",
      mastery: "over 1 week",
    },
    {
      condition: "Upon staff direction",
      behavior: "comply with first-time instruction",
      criteria: "in 4/5 opportunities",
      mastery: "across 2 settings",
    },
  ],
};

const composeGoalText = (studentName, g) =>
  `By the next annual ARD, ${g.condition}, ${studentName} will ${g.behavior}, ${g.criteria}, ${g.mastery}.`;

/* ====================== Readiness calcs ====================== */
const masteryPctFromGoals = (goals) => {
  if (!goals || goals.length === 0) return 0;
  const mastered = goals.filter((g) => g.status === "Mastered").length;
  return Math.round((mastered / goals.length) * 100);
};
const combinedReadinessBase = (goalsPct, assessPct) =>
  Math.round(goalsPct * 0.6 + assessPct * 0.4);
const readinessLevel = (pct) =>
  pct >= 80 ? "Ready" : pct >= 50 ? "Emerging" : "Not Ready";

// Behavior burden penalty (max 20 points off readiness)
const behaviorBurdenPenalty = (behaviorLogs) => {
  if (!behaviorLogs || behaviorLogs.length === 0) return 0;
  const last = behaviorLogs.slice(-7);
  const avg = last.reduce((a, b) => a + (b.frequency || 0), 0) / last.length;
  const penalty = Math.min(20, Math.round((avg / 10) * 20));
  return penalty;
};

const combinedReadinessWithBehavior = (goalsPct, assessPct, behaviorLogs) => {
  const base = combinedReadinessBase(goalsPct, assessPct);
  const penalty = behaviorBurdenPenalty(behaviorLogs);
  return Math.max(0, base - penalty);
};

/* ====================== Persistence (multi-clinician) ====================== */
const LS_KEY = "brs_clinic_state_v3_sidebar_behavior_calendar_notes";

const defaultClinicians = [
  {
    id: "c1",
    username: "clinician1",
    password: "pass123",
    name: "Dr. Smith",
    credentials: "BCBA",
    phone: "(555) 111-2222",
    email: "dr.smith@brsclinic.com",
    photo: "",
    signature: "",
    children: [],
  },
  {
    id: "c2",
    username: "clinician2",
    password: "pass456",
    name: "Dr. Jones",
    credentials: "BCBA",
    phone: "(555) 333-4444",
    email: "dr.jones@brsclinic.com",
    photo: "",
    signature: "",
    children: [],
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw)
      return {
        clinicians: defaultClinicians,
        currentClinicianId: null,
        viewChildId: null,
        mode: "light",
        nav: "dashboard",
        calendarEvents: [],
      };
    const parsed = JSON.parse(raw);
    return {
      nav: "dashboard",
      mode: "light",
      calendarEvents: [],
      ...parsed,
    };
  } catch {
    return {
      clinicians: defaultClinicians,
      currentClinicianId: null,
      viewChildId: null,
      mode: "light",
      nav: "dashboard",
      calendarEvents: [],
    };
  }
}
function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ====================== Theming ====================== */
const makeTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#0056B3" }, // BRS navy
      secondary: { main: "#16a34a" }, // green accent
      background: {
        default: mode === "light" ? "#F5F7FA" : "#0f172a",
        paper: mode === "light" ? "#fff" : "#111827",
      },
    },
    typography: {
      fontFamily: "Roboto, Inter, system-ui, -apple-system, Segoe UI, Arial",
    },
    shape: { borderRadius: 10 },
  });

/* ====================== Root App ====================== */
export default function App() {
  const [state, setState] = useState(loadState);
  const theme = useMemo(() => makeTheme(state.mode || "light"), [state.mode]);

  useEffect(() => saveState(state), [state]);

  const currentClinician = useMemo(
    () =>
      state.clinicians.find((c) => c.id === state.currentClinicianId) || null,
    [state]
  );

  const handleToggleMode = () =>
    setState((s) => ({ ...s, mode: s.mode === "light" ? "dark" : "light" }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell
        state={state}
        setState={setState}
        currentClinician={currentClinician}
        onToggleMode={handleToggleMode}
      />
    </ThemeProvider>
  );
}

/* ====================== App Shell (Header + Sidebar + Body) ====================== */
const drawerWidth = 250;

function AppShell({ state, setState, currentClinician, onToggleMode }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const mdUp = useMediaQuery("(min-width:900px)");

  const nav = state.nav || "dashboard";
  const setNav = (n) => setState((s) => ({ ...s, nav: n }));

  /* ---------- Auth ---------- */
  const handleLogin = (e) => {
    e.preventDefault();
    const found = state.clinicians.find(
      (c) =>
        c.username === credentials.username &&
        c.password === credentials.password
    );
    if (!found) {
      alert(
        "Invalid credentials (try clinician1/pass123 or clinician2/pass456)"
      );
      return;
    }
    setState((s) => ({ ...s, currentClinicianId: found.id }));
  };

  const handleLogout = () =>
    setState((s) => ({
      ...s,
      currentClinicianId: null,
      viewChildId: null,
      nav: "dashboard",
    }));

  /* ---------- Sidebar Content ---------- */
  const DrawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Behavior Response Solutions{" "}
          <Typography component="span" sx={{ opacity: 0.7 }}>
            (BRS)
          </Typography>
        </Typography>
        <Typography
          sx={{ fontStyle: "italic", opacity: 0.85, mt: 0.5, fontSize: 13 }}
        >
          Transforming Behavior Data into Meaningful Results
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        <ListItemButton
          selected={nav === "dashboard"}
          onClick={() => setNav("dashboard")}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton
          selected={nav === "children"}
          onClick={() => setNav("children")}
        >
          <ListItemIcon>
            <GroupsIcon />
          </ListItemIcon>
          <ListItemText primary="Children" />
        </ListItemButton>
        <ListItemButton
          selected={nav === "calendar"}
          onClick={() => setNav("calendar")}
        >
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItemButton>
        <ListItemButton
          selected={nav === "reports"}
          onClick={() => setNav("reports")}
        >
          <ListItemIcon>
            <ArticleIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItemButton>
        <ListItemButton
          selected={nav === "profile"}
          onClick={() => setNav("profile")}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Clinician Profile" />
        </ListItemButton>
        <ListItemButton
          selected={nav === "settings"}
          onClick={() => setNav("settings")}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {currentClinician ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={currentClinician.photo || ""}>
              {currentClinician.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>
                {currentClinician.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {currentClinician.credentials}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Not signed in
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        color="primary"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {!mdUp && (
            <IconButton
              color="inherit"
              edge="start"
              sx={{ mr: 1 }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            BRS Clinical Suite
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            <LightMode fontSize="small" />
            <Switch
              checked={(state.mode || "light") === "dark"}
              onChange={onToggleMode}
            />
            <DarkMode fontSize="small" />
          </Stack>
          {currentClinician && (
            <Button
              color="inherit"
              startIcon={<Logout />}
              sx={{ ml: 2 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {DrawerContent}
        </Drawer>
        {/* Desktop */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {DrawerContent}
        </Drawer>
      </Box>

      {/* Body */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {!currentClinician ? (
          <LoginCard
            credentials={credentials}
            setCredentials={setCredentials}
            onLogin={handleLogin}
          />
        ) : state.nav === "dashboard" ? (
          <DashboardPage
            state={state}
            setState={setState}
            currentClinician={currentClinician}
          />
        ) : state.nav === "children" ? (
          <ChildrenPage
            state={state}
            setState={setState}
            currentClinician={currentClinician}
          />
        ) : state.nav === "calendar" ? (
          <CalendarPage
            state={state}
            setState={setState}
            currentClinician={currentClinician}
          />
        ) : state.nav === "reports" ? (
          <ReportsPage
            state={state}
            setState={setState}
            currentClinician={currentClinician}
          />
        ) : state.nav === "profile" ? (
          <ProfilePage
            state={state}
            setState={setState}
            currentClinician={currentClinician}
          />
        ) : (
          <SettingsPage state={state} setState={setState} />
        )}
        <Box
          component="footer"
          sx={{ py: 2, textAlign: "center", opacity: 0.8 }}
        >
          <Typography variant="body2">
            © 2025 Behavior Response Solutions (BRS) — 123 Main St, Houston, TX
            | (555) 555-5555 | info@brsclinic.com
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ====================== Login Card ====================== */
function LoginCard({ credentials, setCredentials, onLogin }) {
  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} md={7} lg={6}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome to BRS
          </Typography>
          <Typography sx={{ mb: 2, opacity: 0.8 }}>
            Please sign in to access your clinician dashboard.
          </Typography>
          <Box component="form" onSubmit={onLogin}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials((v) => ({ ...v, username: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((v) => ({ ...v, password: e.target.value }))
                }
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<AssessmentIcon />}
              >
                Sign In
              </Button>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Demo users: clinician1 / pass123 &nbsp;|&nbsp; clinician2 /
                pass456
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

/* ====================== Dashboard Page (clinic-wide KPIs) ====================== */
function DashboardPage({ state, setState, currentClinician }) {
  const children = currentClinician.children;
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const stats = useMemo(() => {
    const totalChildren = children.length;
    let activeGoals = 0;
    let masteredGoals = 0;
    let completedAssessments = 0;
    const readinessByChild = [];

    children.forEach((ch) => {
      const a = ch.goals || [];
      activeGoals += a.filter((g) => g.status === "Active").length;
      masteredGoals += a.filter((g) => g.status === "Mastered").length;
      completedAssessments += (ch.assessments || []).filter(
        (x) => !x._draft
      ).length;

      const mastery = masteryPctFromGoals(ch.goals || []);
      const lastFinal = (ch.assessments || [])
        .filter((a) => !a._draft)
        .slice(-1)[0];
      const assessPct = lastFinal ? lastFinal.overallPct : 0;
      const behaviorLogs = ch.behaviors || [];
      const combined = combinedReadinessWithBehavior(
        mastery,
        assessPct,
        behaviorLogs
      );

      readinessByChild.push({ name: ch.name, score: combined });
    });

    const avgReadiness =
      readinessByChild.length > 0
        ? Math.round(
            readinessByChild.reduce((acc, x) => acc + x.score, 0) /
              readinessByChild.length
          )
        : 0;

    return {
      totalChildren,
      activeGoals,
      masteredGoals,
      completedAssessments,
      avgReadiness,
      readinessByChild,
    };
  }, [children]);

  const barData = {
    labels: stats.readinessByChild.map((x) => x.name),
    datasets: [
      {
        label: "Readiness %",
        data: stats.readinessByChild.map((x) => x.score),
        backgroundColor: "rgba(0,86,179,0.6)",
      },
    ],
  };

  const goalMix = (() => {
    let m = 0,
      a = 0,
      mt = 0;
    children.forEach((ch) => {
      (ch.goals || []).forEach((g) => {
        if (g.status === "Mastered") m++;
        else if (g.status === "Active") a++;
        else if (g.status === "Maintenance") mt++;
      });
    });
    return { m, a, mt };
  })();

  const doughnutData = {
    labels: ["Mastered", "Active", "Maintenance"],
    datasets: [
      {
        data: [goalMix.m, goalMix.a, goalMix.mt],
        backgroundColor: ["#16a34a", "#0056B3", "#f59e0b"],
      },
    ],
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={2.4}>
          <KPI
            title="Avg Readiness"
            value={`${stats.avgReadiness}%`}
            icon={<InsightsIcon />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <KPI
            title="Total Children"
            value={stats.totalChildren}
            icon={<GroupsIcon />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <KPI
            title="Active Goals"
            value={stats.activeGoals}
            icon={<AssessmentIcon />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <KPI
            title="Mastered Goals"
            value={stats.masteredGoals}
            icon={<SchoolIcon />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <KPI
            title="Assessments Completed"
            value={stats.completedAssessments}
            icon={<AssessmentIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                Readiness by Child
              </Typography>
              <Bar data={barData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                Goal Status Mix
              </Typography>
              <Doughnut data={doughnutData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

/* ====================== Children Page (list + open profile) ====================== */
function ChildrenPage({ state, setState, currentClinician }) {
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const children = currentClinician.children;

  const [form, setForm] = useState({ name: "", age: "", grade: "" });

  const addChild = () => {
    if (!form.name || !form.age || !form.grade) {
      setSnack({
        open: true,
        msg: "Please fill Name, Age, and Grade.",
        severity: "warning",
      });
      return;
    }
    const child = {
      id: Date.now(),
      name: form.name,
      age: parseInt(form.age, 10),
      grade: form.grade,
      goals: [],
      pastGoals: [],
      readinessHistory: [],
      assessments: [],
      behaviors: [],
      reinforcers: [],
      notes: [], // NEW: notes per child
    };
    setState((s) => ({
      ...s,
      clinicians: s.clinicians.map((cl) =>
        cl.id === currentClinician.id
          ? { ...cl, children: [...cl.children, child] }
          : cl
      ),
    }));
    setForm({ name: "", age: "", grade: "" });
    setSnack({ open: true, msg: "Child added.", severity: "success" });
  };

  const deleteChild = (childId) => {
    if (!window.confirm("Delete this child profile?")) return;
    setState((s) => ({
      ...s,
      clinicians: s.clinicians.map((cl) =>
        cl.id === currentClinician.id
          ? { ...cl, children: cl.children.filter((ch) => ch.id !== childId) }
          : cl
      ),
      viewChildId: s.viewChildId === childId ? null : s.viewChildId,
    }));
    setSnack({ open: true, msg: "Child deleted 🗑️", severity: "info" });
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Add Child
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Child Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Age</InputLabel>
              <Select
                label="Age"
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
              >
                {[...Array(8)].map((_, i) => (
                  <MenuItem key={i} value={i + 3}>
                    {i + 3}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Grade</InputLabel>
              <Select
                label="Grade"
                value={form.grade}
                onChange={(e) =>
                  setForm((f) => ({ ...f, grade: e.target.value }))
                }
              >
                {["Pre-K", "K", "1st", "2nd", "3rd", "4th", "5th", "6th"].map(
                  (g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={addChild}
            >
              Add
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {children.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography>No children yet — add one above.</Typography>
            </Paper>
          </Grid>
        ) : (
          children.map((ch) => {
            const mastery = masteryPctFromGoals(ch.goals || []);
            const lastFinal = (ch.assessments || [])
              .filter((a) => !a._draft)
              .slice(-1)[0];
            const assessPct = lastFinal ? lastFinal.overallPct : 0;
            const combined = combinedReadinessWithBehavior(
              mastery,
              assessPct,
              ch.behaviors || []
            );

            return (
              <Grid item xs={12} md={6} key={ch.id}>
                <Card>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h6">{ch.name}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Age: {ch.age} — Grade: {ch.grade}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Readiness: {combined}% ({readinessLevel(combined)})
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setState((s) => ({
                              ...s,
                              viewChildId: ch.id,
                              nav: "children",
                            }))
                          }
                        >
                          Open Profile
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => deleteChild(ch.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>

                    {state.viewChildId === ch.id && (
                      <Box sx={{ mt: 2 }}>
                        <ChildProfile
                          state={state}
                          setState={setState}
                          currentClinician={currentClinician}
                          child={ch}
                          onClose={() =>
                            setState((s) => ({ ...s, viewChildId: null }))
                          }
                          onSnack={(msg, severity = "success") =>
                            setSnack({ open: true, msg, severity })
                          }
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

/* ====================== Calendar/Scheduler Page ====================== */
function CalendarPage({ state, setState, currentClinician }) {
  const clinicianId = currentClinician.id;

  // Events are stored at root: state.calendarEvents = [{ id, title, start, end, childId, notes, clinicianId }]
  const events = state.calendarEvents || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({
    title: "Session",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00",
    endTime: "10:30",
    childId: "",
    notes: "",
  });

  const children = currentClinician.children;

  const openNew = ({ start, end }) => {
    const d = start ? new Date(start) : new Date();
    const e = end ? new Date(end) : new Date(d.getTime() + 30 * 60000);
    const toTime = (dt) =>
      dt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    setEditing(null);
    setDraft({
      title: "Session",
      date: d.toISOString().slice(0, 10),
      startTime: toTime(d),
      endTime: toTime(e),
      childId: children[0]?.id || "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (ev) => {
    const d = new Date(ev.start);
    const e = new Date(ev.end);
    const toTime = (dt) =>
      dt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    setEditing(ev);
    setDraft({
      title: ev.title || "Session",
      date: d.toISOString().slice(0, 10),
      startTime: toTime(d),
      endTime: toTime(e),
      childId: ev.childId || "",
      notes: ev.notes || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const upsertEvent = () => {
    const [sh, sm] = draft.startTime.split(":").map(Number);
    const [eh, em] = draft.endTime.split(":").map(Number);
    const base = new Date(draft.date + "T00:00:00");
    const start = new Date(base);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(base);
    end.setHours(eh, em, 0, 0);

    if (end <= start) {
      alert("End time must be after start time.");
      return;
    }

    const child = children.find((c) => String(c.id) === String(draft.childId));
    const title = draft.title || (child ? `Session: ${child.name}` : "Session");

    if (editing) {
      const updated = events.map((ev) =>
        ev.id === editing.id
          ? {
              ...ev,
              title,
              start,
              end,
              childId: draft.childId || "",
              notes: draft.notes || "",
              clinicianId,
            }
          : ev
      );
      setState((s) => ({ ...s, calendarEvents: updated }));
    } else {
      const ev = {
        id: Date.now(),
        title,
        start,
        end,
        childId: draft.childId || "",
        notes: draft.notes || "",
        clinicianId,
      };
      setState((s) => ({
        ...s,
        calendarEvents: [...(s.calendarEvents || []), ev],
      }));
    }
    closeDialog();
  };

  const deleteEvent = () => {
    if (!editing) return;
    if (!window.confirm("Delete this event?")) return;
    const updated = events.filter((ev) => ev.id !== editing.id);
    setState((s) => ({ ...s, calendarEvents: updated }));
    closeDialog();
  };

  // Only show events for this clinician, convert dates (localStorage restores as strings)
  const myEvents = events.filter((ev) => ev.clinicianId === clinicianId);
  const myEventsWithDates = myEvents.map((ev) => ({
    ...ev,
    start: new Date(ev.start),
    end: new Date(ev.end),
  }));

  const eventPropGetter = () => ({
    style: {
      background: "rgba(0,86,179,0.85)",
      borderRadius: 8,
      color: "#fff",
      border: "none",
    },
  });

  return (
    <Container maxWidth="lg" disableGutters>
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Calendar / Scheduler
              </Typography>
              <Calendar
                localizer={localizer}
                events={myEventsWithDates}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                selectable
                onSelectSlot={openNew}
                onSelectEvent={openEdit}
                eventPropGetter={eventPropGetter}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                Upcoming (next 7 days)
              </Typography>
              <Stack spacing={1}>
                {myEventsWithDates
                  .slice()
                  .sort((a, b) => a.start - b.start)
                  .filter((ev) => {
                    const now = new Date();
                    const seven = new Date();
                    seven.setDate(seven.getDate() + 7);
                    return ev.start >= now && ev.start <= seven;
                  })
                  .map((ev) => {
                    const ch =
                      currentClinician.children.find(
                        (c) => String(c.id) === String(ev.childId)
                      ) || null;
                    return (
                      <Paper
                        key={ev.id}
                        variant="outlined"
                        sx={{ p: 1, cursor: "pointer" }}
                        onClick={() => openEdit(ev)}
                      >
                        <Typography fontWeight={700}>{ev.title}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {ev.start.toLocaleString()} –{" "}
                          {ev.end.toLocaleTimeString()}
                          {ch ? ` • ${ch.name}` : ""}
                        </Typography>
                      </Paper>
                    );
                  })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Date"
                type="date"
                value={draft.date}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, date: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Start Time"
                type="time"
                value={draft.startTime}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, startTime: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Time"
                type="time"
                value={draft.endTime}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, endTime: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Link to Child (optional)</InputLabel>
              <Select
                label="Link to Child (optional)"
                value={draft.childId}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, childId: e.target.value }))
                }
              >
                <MenuItem value="">No link</MenuItem>
                {children.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} (Age {c.age}, {c.grade})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              value={draft.notes}
              onChange={(e) =>
                setDraft((d) => ({ ...d, notes: e.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {editing && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={deleteEvent}
            >
              Delete
            </Button>
          )}
          <Button startIcon={<CloseIcon />} onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={upsertEvent}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

/* ====================== Reports Page (simple exports & overviews) ====================== */
function ReportsPage({ state, setState, currentClinician }) {
  const children = currentClinician.children;

  const readinessData = useMemo(() => {
    const labels = [];
    const values = [];
    children.forEach((ch) => {
      const mastery = masteryPctFromGoals(ch.goals || []);
      const lastFinal = (ch.assessments || [])
        .filter((a) => !a._draft)
        .slice(-1)[0];
      const assessPct = lastFinal ? lastFinal.overallPct : 0;
      const combined = combinedReadinessWithBehavior(
        mastery,
        assessPct,
        ch.behaviors || []
      );
      labels.push(ch.name);
      values.push(combined);
    });
    return {
      labels,
      datasets: [
        {
          label: "Combined Readiness %",
          data: values,
          backgroundColor: "rgba(0,86,179,0.6)",
        },
      ],
    };
  }, [children]);

  const exportClinicCSV = () => {
    const rows = [
      [
        "Child",
        "Age",
        "Grade",
        "Goals Mastery %",
        "Assessment %",
        "Behavior Penalty",
        "Combined Readiness %",
      ],
    ];
    children.forEach((ch) => {
      const mastery = masteryPctFromGoals(ch.goals || []);
      const lastFinal = (ch.assessments || [])
        .filter((a) => !a._draft)
        .slice(-1)[0];
      const assessPct = lastFinal ? lastFinal.overallPct : 0;
      const penalty = behaviorBurdenPenalty(ch.behaviors || []);
      const combined = combinedReadinessWithBehavior(
        mastery,
        assessPct,
        ch.behaviors || []
      );
      rows.push([
        ch.name,
        ch.age,
        ch.grade,
        mastery,
        assessPct,
        penalty,
        combined,
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const a = document.createElement("a");
    a.href = uri;
    a.download = "BRS_Clinic_Readiness.csv";
    a.click();
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Clinic Readiness Overview
              </Typography>
              <Bar data={readinessData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Exports
              </Typography>
              <Button variant="contained" onClick={exportClinicCSV}>
                Export Clinic Readiness (CSV)
              </Button>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                Use child profile to export detailed readiness PDF with
                signature.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

/* ====================== Profile Page (clinician profile & signature/photo) ====================== */
function ProfilePage({ state, setState, currentClinician }) {
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const [form, setForm] = useState({
    name: currentClinician.name || "",
    credentials: currentClinician.credentials || "",
    phone: currentClinician.phone || "",
    email: currentClinician.email || "",
    photo: currentClinician.photo || "",
    signature: currentClinician.signature || "",
  });

  const updateClinician = (patch) =>
    setState((s) => ({
      ...s,
      clinicians: s.clinicians.map((c) =>
        c.id === currentClinician.id ? { ...c, ...patch } : c
      ),
    }));

  const handleSave = () => {
    updateClinician(form);
    setSnack({ open: true, msg: "Profile saved.", severity: "success" });
  };

  const handleImage = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((f) => ({ ...f, [field]: e.target.result }));
    reader.readAsDataURL(file);
  };

  return (
    <Container maxWidth="md" disableGutters>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Clinician Profile
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Credentials (e.g., BCBA)"
                  value={form.credentials}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, credentials: e.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  fullWidth
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center">
                <Avatar src={form.photo || ""} sx={{ width: 96, height: 96 }}>
                  {form.name?.[0]}
                </Avatar>
                <Button
                  startIcon={<PhotoCameraIcon />}
                  component="label"
                  variant="outlined"
                >
                  Upload Photo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImage("photo", e.target.files[0])}
                  />
                </Button>

                <Button
                  startIcon={<BrushIcon />}
                  component="label"
                  variant="outlined"
                >
                  Upload Signature
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImage("signature", e.target.files[0])
                    }
                  />
                </Button>
                {form.signature && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <img
                      src={form.signature}
                      alt="signature"
                      style={{ maxWidth: 180 }}
                    />
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

/* ====================== Settings Page ====================== */
function SettingsPage({ state, setState }) {
  const clearAll = () => {
    if (!window.confirm("This will erase all BRS local data. Continue?"))
      return;
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  };

  return (
    <Container maxWidth="sm" disableGutters>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
            Manage app preferences and data.
          </Typography>
          <Button color="error" variant="outlined" onClick={clearAll}>
            Clear All Local Data
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

/* ====================== KPI Card ====================== */
function KPI({ title, value, icon }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ color: "primary.main" }}>{icon}</Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {title}
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ====================== Notes Panel ====================== */
function NotesPanel({ state, setState, currentClinician, child }) {
  const [note, setNote] = useState("");
  const [filterMine, setFilterMine] = useState(false);

  const clinicians = state.clinicians;

  const parseMentions = (text) => {
    const mentionNames = Array.from(text.matchAll(/@([\w.\- ]{2,50})/g)).map(
      (m) => m[1].trim().toLowerCase()
    );
    const ids = clinicians
      .filter((c) => mentionNames.includes((c.name || "").trim().toLowerCase()))
      .map((c) => c.id);
    return ids;
  };

  const updateChild = (patch) => {
    setState((s) => ({
      ...s,
      clinicians: s.clinicians.map((cl) =>
        cl.id === currentClinician.id
          ? {
              ...cl,
              children: cl.children.map((c) =>
                c.id === child.id ? { ...c, ...patch } : c
              ),
            }
          : cl
      ),
    }));
  };

  const addNote = () => {
    if (!note.trim()) return;
    const mentions = parseMentions(note);
    const list = (child.notes || []).concat([
      {
        id: Date.now(),
        date: new Date().toLocaleString(),
        authorId: currentClinician.id,
        text: note.trim(),
        mentions,
      },
    ]);
    updateChild({ notes: list });
    setNote("");
  };

  const deleteNote = (id) => {
    if (!window.confirm("Delete this note?")) return;
    const list = (child.notes || []).filter((n) => n.id !== id);
    updateChild({ notes: list });
  };

  const items = (child.notes || [])
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter((n) => !filterMine || n.authorId === currentClinician.id);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Stack
              spacing={1}
              direction={{ xs: "column", md: "row" }}
              sx={{ mb: 1 }}
            >
              <TextField
                label="Add a note (supports @mentions)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Stack spacing={1} direction="row" alignItems="flex-start">
                <Button variant="contained" onClick={addNote}>
                  Post
                </Button>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    label="Filter"
                    value={filterMine ? "Mine" : "All"}
                    onChange={(e) => setFilterMine(e.target.value === "Mine")}
                  >
                    <MenuItem value="All">All Notes</MenuItem>
                    <MenuItem value="Mine">My Notes</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            {items.length === 0 ? (
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography>No notes yet.</Typography>
              </Paper>
            ) : (
              <Stack spacing={1}>
                {items.map((n) => {
                  const author = clinicians.find((c) => c.id === n.authorId);
                  return (
                    <Paper key={n.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28 }}>
                            {author?.name?.[0] || "C"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700} variant="body2">
                              {author?.name || "Clinician"}
                              {n.mentions?.length ? (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ ml: 1, opacity: 0.8 }}
                                >
                                  • mentions:{" "}
                                  {n.mentions
                                    .map(
                                      (id) =>
                                        clinicians.find((c) => c.id === id)
                                          ?.name
                                    )
                                    .filter(Boolean)
                                    .join(", ")}
                                </Typography>
                              ) : null}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {n.date}
                            </Typography>
                          </Box>
                        </Stack>
                        {n.authorId === currentClinician.id && (
                          <IconButton
                            size="small"
                            onClick={() => deleteNote(n.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                      <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                        {n.text}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Quick mention help */}
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
              Team Directory (mentionable)
            </Typography>
            {state.clinicians.map((c) => (
              <Stack
                key={c.id}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Avatar>{c.name?.[0]}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {c.credentials} • @{c.name}
                  </Typography>
                </Box>
              </Stack>
            ))}
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Tip: Type <code>@</code> followed by the clinician’s profile name
              (e.g., <code>@Dr. Smith</code>).
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

/* ====================== Child Profile ====================== */
function ChildProfile({
  state,
  setState,
  currentClinician,
  child,
  onClose,
  onSnack,
}) {
  // Tabs: Overview | Goals | Assessments | Behavior | Readiness Report | Notes
  const [tab, setTab] = useState(0);
  const [catIndex, setCatIndex] = useState(0);
  const currentCat = CATS[catIndex];

  // Goal Editor
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState({
    condition: "",
    behavior: "",
    criteria: "",
    mastery: "",
  });

  // Session Tracking dialogs
  const [sessionFor, setSessionFor] = useState(null);
  const [sessionDraft, setSessionDraft] = useState({
    date: today(),
    correct: "",
    total: "",
    notes: "",
  });
  const [goalProgress, setGoalProgress] = useState(null); // SINGLE source for progress dialog

  // Behavior tracking
  const [behaviorDraft, setBehaviorDraft] = useState({
    date: today(),
    type: "Aggression",
    frequency: "",
    antecedent: "",
    behavior: "",
    consequence: "",
  });

  // Reinforcers
  const [reinforcerDraft, setReinforcerDraft] = useState({
    name: "",
    successes: "",
    attempts: "",
  });

  const updateChild = (patch) => {
    setState((s) => ({
      ...s,
      clinicians: s.clinicians.map((cl) =>
        cl.id === currentClinician.id
          ? {
              ...cl,
              children: cl.children.map((c) =>
                c.id === child.id ? { ...c, ...patch } : c
              ),
            }
          : cl
      ),
    }));
  };

  /* ---------- Assessment helpers (scoring & finalize) ---------- */
  const scoreAssessment = (draft) => {
    const scores = {};
    CATS.forEach((cat) => {
      const qs = ASSESS_QUESTIONS[cat];
      const resp = draft.responses?.[cat] || {};
      const pts = [];
      qs.forEach((q) => {
        if (q.type === "yesno") {
          const v = ynToPct(resp[q.id]);
          if (v !== null) pts.push(v);
        } else if (q.type === "scale") {
          const v = scaleToPct(resp[q.id] ?? "");
          if (!isNaN(v)) pts.push(v);
        } else if (q.type === "mc") {
          const v = mcScore(q.options, resp[q.id]);
          if (v !== null) pts.push(v);
        }
      });
      const catPct =
        pts.length > 0
          ? Math.round(pts.reduce((a, b) => a + b, 0) / pts.length)
          : 0;
      scores[cat] = catPct;
    });
    const overall =
      Math.round(
        CATS.reduce((acc, cat) => acc + (scores[cat] ?? 0), 0) / CATS.length
      ) || 0;
    return { scores, overallPct: overall };
  };

  const ensureDraft = () => {
    const last = child.assessments[child.assessments.length - 1];
    if (last && last._draft) return child;
    const draft = {
      date: today(),
      _draft: true,
      responses: {},
      scores: {},
      overallPct: 0,
      notes: "",
    };
    updateChild({ assessments: [...child.assessments, draft] });
    const refreshed =
      (
        state.clinicians.find((c) => c.id === currentClinician.id)?.children ||
        []
      ).find((x) => x.id === child.id) || child;
    return refreshed;
  };

  const setResponse = (cat, qid, value) => {
    const withDraft = ensureDraft();
    const idx = withDraft.assessments.length - 1;
    const draft = withDraft.assessments[idx];

    const newDraft = {
      ...draft,
      responses: {
        ...draft.responses,
        [cat]: { ...(draft.responses?.[cat] || {}), [qid]: value },
      },
    };
    const scored = { ...newDraft, ...scoreAssessment(newDraft) };
    const newAssess = withDraft.assessments.slice();
    newAssess[idx] = scored;
    updateChild({ assessments: newAssess });
  };

  const finalizeAssessment = () => {
    const fresh =
      currentClinician.children.find((c) => c.id === child.id) || child;
    const idx = fresh.assessments.length - 1;
    const draft = fresh.assessments[idx];
    if (!draft || !draft._draft) return alert("No draft to finalize.");

    const scored = { ...draft, _draft: false, ...scoreAssessment(draft) };

    // Low domains (<=50): generate 3–5 goals each (RESET list)
    const lowDomains = CATS.filter((d) => (scored.scores[d] ?? 0) <= 50);
    let newGoals = [];
    const notes = [];

    lowDomains.forEach((dom) => {
      const k = randInt(3, 5);
      const picks = sample(GOAL_LIB[dom], k);
      notes.push(`${dom}: ${picks.length} goals`);
      newGoals = newGoals.concat(
        picks.map((tpl, i) => ({
          id: Number(`${Date.now()}${i}${Math.floor(Math.random() * 100)}`),
          domain: dom,
          condition: tpl.condition,
          behavior: tpl.behavior,
          criteria: tpl.criteria,
          mastery: tpl.mastery,
          status: "Active",
          generalization: false,
          maintenance: false,
          sessions: [],
        }))
      );
    });

    if (lowDomains.length === 0) {
      const best = [...CATS].sort(
        (a, b) => (scored.scores[b] ?? 0) - (scored.scores[a] ?? 0)
      )[0];
      const picks = sample(GOAL_LIB[best], 3);
      notes.push(`${best}: 3 extension goals`);
      newGoals = newGoals.concat(
        picks.map((tpl, i) => ({
          id: Number(`${Date.now()}${i}${Math.floor(Math.random() * 100)}`),
          domain: best,
          condition: tpl.condition,
          behavior: tpl.behavior,
          criteria: tpl.criteria,
          mastery: tpl.mastery,
          status: "Active",
          generalization: false,
          maintenance: false,
          sessions: [],
        }))
      );
    }

    const newPast = (fresh.pastGoals || []).concat([
      { date: today(), goals: fresh.goals || [] },
    ]);

    const masteryAfterReset = masteryPctFromGoals(newGoals);
    const combined = combinedReadinessWithBehavior(
      masteryAfterReset,
      scored.overallPct,
      fresh.behaviors || []
    );

    const newTimeline = [
      ...(fresh.readinessHistory || []),
      { date: today(), score: combined },
    ];

    const newAssessList = fresh.assessments.slice();
    newAssessList[idx] = {
      ...scored,
      notes: `Auto-added goals → ${notes.join(", ")}`,
    };

    updateChild({
      goals: newGoals,
      pastGoals: newPast,
      readinessHistory: newTimeline,
      assessments: newAssessList,
    });

    onSnack?.("Assessment finalized & goals generated 🎯", "success");
  };

  /* ---------- Charts ---------- */
  const pieData = (() => {
    const mastered = child.goals.filter((g) => g.status === "Mastered").length;
    const active = child.goals.filter((g) => g.status === "Active").length;
    const maintenance = child.goals.filter(
      (g) => g.status === "Maintenance"
    ).length;
    return {
      labels: ["Mastered", "Active", "Maintenance"],
      datasets: [
        {
          data: [mastered, active, maintenance],
          backgroundColor: ["#16a34a", "#0056B3", "#f59e0b"],
        },
      ],
    };
  })();

  const timelineData = {
    labels: (child.readinessHistory || []).map((r) => r.date),
    datasets: [
      {
        label: "Readiness %",
        data: (child.readinessHistory || []).map((r) => r.score),
        borderColor: "#0056B3",
        backgroundColor: "rgba(0,86,179,0.2)",
        tension: 0.3,
      },
    ],
  };

  /* ---------- Goal Editor & Progress ---------- */
  const openEdit = (g) => {
    setEditing(g);
    setEditDraft({
      condition: g.condition,
      behavior: g.behavior,
      criteria: g.criteria,
      mastery: g.mastery,
    });
  };
  const closeEdit = () => {
    setEditing(null);
    setEditDraft({ condition: "", behavior: "", criteria: "", mastery: "" });
  };
  const saveEdit = () => {
    const updated = child.goals.map((x) =>
      x.id === editing.id ? { ...x, ...editDraft } : x
    );
    updateChild({ goals: updated });
    closeEdit();
    onSnack?.("Goal updated.", "success");
  };

  const openSession = (g) => {
    setSessionFor(g);
    setSessionDraft({ date: today(), correct: "", total: "", notes: "" });
  };
  const closeSession = () => {
    setSessionFor(null);
    setSessionDraft({ date: today(), correct: "", total: "", notes: "" });
  };

  const addSession = () => {
    const correct = Number(sessionDraft.correct);
    const total = Number(sessionDraft.total);
    if (!correct && correct !== 0)
      return onSnack?.("Enter trials correct.", "warning");
    if (!total || total <= 0)
      return onSnack?.("Enter total trials (>0).", "warning");
    if (correct > total)
      return onSnack?.("Correct cannot exceed total.", "warning");

    const percent = Math.round((correct / total) * 100);

    const updatedGoals = child.goals.map((g) => {
      if (g.id !== sessionFor.id) return g;
      const sessions = (g.sessions || []).concat([
        {
          date: sessionDraft.date,
          correct,
          total,
          percent,
          notes: sessionDraft.notes || "",
        },
      ]);

      // Auto mastery check: last 3 sessions >= 80%
      let newStatus = g.status;
      if (sessions.length >= 3) {
        const last3 = sessions.slice(-3);
        const ok = last3.every((s) => s.percent >= 80);
        if (ok) newStatus = "Mastered";
      }

      return { ...g, sessions, status: newStatus };
    });

    updateChild({ goals: updatedGoals });
    closeSession();
    onSnack?.("Session logged.", "success");
  };

  const openProgress = (g) => setGoalProgress(g);
  const closeProgress = () => setGoalProgress(null);

  /* ---------- Behavior tracking ---------- */
  const addBehavior = () => {
    const frequency = Number(behaviorDraft.frequency);
    if (!behaviorDraft.type)
      return onSnack?.("Enter a behavior type.", "warning");
    if (!frequency && frequency !== 0)
      return onSnack?.("Enter frequency (number).", "warning");

    const logs = (child.behaviors || []).concat([
      { ...behaviorDraft, frequency },
    ]);
    updateChild({ behaviors: logs });

    // update readiness timeline
    const mastery = masteryPctFromGoals(child.goals || []);
    const lastFinal = (child.assessments || [])
      .filter((a) => !a._draft)
      .slice(-1)[0];
    const assessPct = lastFinal ? lastFinal.overallPct : 0;
    const combined = combinedReadinessWithBehavior(mastery, assessPct, logs);
    const newTimeline = [
      ...(child.readinessHistory || []),
      { date: today(), score: combined },
    ];
    updateChild({ readinessHistory: newTimeline });

    setBehaviorDraft({
      date: today(),
      type: "Aggression",
      frequency: "",
      antecedent: "",
      behavior: "",
      consequence: "",
    });
    onSnack?.("Behavior log added.", "success");
  };

  const behaviorSeries = useMemo(() => {
    const logs = child.behaviors || [];
    const dates = Array.from(new Set(logs.map((l) => l.date))).sort();
    const types = Array.from(new Set(logs.map((l) => l.type)));

    const datasets = types.map((t, i) => ({
      label: t,
      data: dates.map((d) =>
        logs
          .filter((l) => l.type === t && l.date === d)
          .reduce((a, b) => a + (b.frequency || 0), 0)
      ),
      borderColor: ["#0056B3", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed"][
        i % 5
      ],
      backgroundColor: "transparent",
      tension: 0.3,
    }));

    return { labels: dates, datasets };
  }, [child.behaviors]);

  /* ---------- Reinforcers ---------- */
  const addReinforcer = () => {
    if (!reinforcerDraft.name)
      return onSnack?.("Enter reinforcer name.", "warning");
    const successes = Number(reinforcerDraft.successes || 0);
    const attempts = Number(reinforcerDraft.attempts || 0);
    if (attempts <= 0) return onSnack?.("Attempts must be > 0.", "warning");
    const rate = Math.round((successes / attempts) * 100);

    const list = [...(child.reinforcers || [])];
    const idx = list.findIndex(
      (r) => r.name.toLowerCase() === reinforcerDraft.name.toLowerCase()
    );
    if (idx >= 0) {
      const r = list[idx];
      const newAttempts = r.attempts + attempts;
      const newSuccesses = r.successes + successes;
      const newRate = Math.round((newSuccesses / newAttempts) * 100);
      list[idx] = {
        ...r,
        successes: newSuccesses,
        attempts: newAttempts,
        rate: newRate,
      };
    } else {
      list.push({ name: reinforcerDraft.name, successes, attempts, rate });
    }
    updateChild({ reinforcers: list });

    setReinforcerDraft({ name: "", successes: "", attempts: "" });
    onSnack?.("Reinforcer updated.", "success");
  };

  const topReinforcers = useMemo(() => {
    return (child.reinforcers || [])
      .slice()
      .sort((a, b) => (b.rate || 0) - (a.rate || 0))
      .slice(0, 3);
  }, [child.reinforcers]);

  /* ---------- Export Report ---------- */
  const exportReport = () => {
    const mastery = masteryPctFromGoals(child.goals);
    const latestFinal = child.assessments.filter((a) => !a._draft).slice(-1)[0];
    const assessPct = latestFinal ? latestFinal.overallPct : 0;
    const combined = combinedReadinessWithBehavior(
      mastery,
      assessPct,
      child.behaviors || []
    );
    const level = readinessLevel(combined);

    const goalRows = (child.goals || [])
      .map((g, i) => {
        const text = composeGoalText(child.name, g);
        return `<tr>
          <td>${i + 1}</td><td>${g.domain}</td><td>${text}</td><td>${
          g.status
        }</td>
          <td>${g.generalization ? "✔" : ""}</td><td>${
          g.maintenance ? "✔" : ""
        }</td>
        </tr>`;
      })
      .join("");

    const behaviorRows = (child.behaviors || [])
      .map(
        (b, i) =>
          `<tr><td>${i + 1}</td><td>${b.date}</td><td>${b.type}</td><td>${
            b.frequency
          }</td><td>${b.antecedent || ""}</td><td>${b.behavior || ""}</td><td>${
            b.consequence || ""
          }</td></tr>`
      )
      .join("");

    const reinforcerRows = (child.reinforcers || [])
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.successes}</td><td>${
            r.attempts
          }</td><td>${r.rate}%</td></tr>`
      )
      .join("");

    const clinician = state.clinicians.find(
      (c) => c.id === state.currentClinicianId
    );

    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><meta charset="utf-8" />
      <title>${child.name} — BRS Readiness Report</title>
      <style>
        body{font-family:Roboto,Arial;padding:28px;color:#111;background:#fff;}
        h1,h2{color:#0056B3;margin:0 0 8px;}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
        th{background:#f5f7fa}
        .meta{margin-bottom:8px}
        .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .logo{font-weight:900;color:#0056B3;font-size:20px}
        .tag{font-style:italic;opacity:.85}
        .sign{margin-top:32px;display:flex;gap:24px;align-items:flex-end}
        .line{border-top:1px solid #000;padding-top:6px;width:260px;text-align:center}
        .footer{margin-top:24px;font-size:12px;opacity:.8}
        .page-break{page-break-before:always}
      </style></head><body>
      <div class="header">
        <div>
          <div class="logo">Behavior Response Solutions (BRS)</div>
          <div class="tag">Transforming Behavior Data into Meaningful Results</div>
        </div>
        <div>
          <div class="meta"><strong>Date:</strong> ${today()}</div>
          <div class="meta"><strong>Clinician:</strong> ${
            clinician?.name || ""
          } (${clinician?.credentials || ""})</div>
        </div>
      </div>

      <h1>Readiness Report</h1>
      <div class="meta"><strong>Child:</strong> ${
        child.name
      } &nbsp; <strong>Age:</strong> ${
      child.age
    } &nbsp; <strong>Grade:</strong> ${child.grade}</div>
      <div class="meta"><strong>Goals Mastery:</strong> ${mastery}% &nbsp; <strong>Assessment:</strong> ${assessPct}% &nbsp; <strong>Combined:</strong> ${combined}% (${level})</div>

      <h2>Current Goals</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Domain</th><th>Goal</th><th>Status</th><th>Gen.</th><th>Maint.</th></tr>
        </thead>
        <tbody>${goalRows}</tbody>
      </table>

      <div class="page-break"></div>
      <h2>Behavior Logs (ABC)</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Date</th><th>Type</th><th>Freq</th><th>Antecedent</th><th>Behavior</th><th>Consequence</th></tr>
        </thead>
        <tbody>${
          behaviorRows || "<tr><td colspan='7'>No behavior logs.</td></tr>"
        }</tbody>
      </table>

      <h2>Reinforcer Effectiveness</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Reinforcer</th><th>Successes</th><th>Attempts</th><th>Success Rate</th></tr>
        </thead>
        <tbody>${
          reinforcerRows ||
          "<tr><td colspan='5'>No reinforcers logged.</td></tr>"
        }</tbody>
      </table>

      <div class="page-break"></div>
      <div class="sign">
        <div>
          ${
            clinician?.signature
              ? `<img src="${clinician.signature}" style="max-height:90px;display:block;margin-bottom:6px" />`
              : ""
          }
          <div class="line">Clinician Signature</div>
        </div>
        <div class="line">Parent/Guardian Signature</div>
      </div>
      <div class="footer">© 2025 Behavior Response Solutions (BRS) — 123 Main St, Houston, TX | (555) 555-5555 | info@brsclinic.com</div>
      </body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  /* ---------- Render ---------- */
  const lastAssess = child.assessments[child.assessments.length - 1];
  const draft = lastAssess && lastAssess._draft ? lastAssess : null;
  const scores = draft?.scores || {};
  const overall = draft?.overallPct || 0;
  const responses = draft?.responses || {};
  const progressPct = Math.round(((catIndex + 1) / CATS.length) * 100);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6" fontWeight={800}>
          {child.name} — Profile
        </Typography>
        <Button variant="text" startIcon={<CloseIcon />} onClick={onClose}>
          Close
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Overview" />
        <Tab label="Goals" />
        <Tab label="Assessments" />
        <Tab label="Behavior" />
        <Tab label="Readiness Report" />
        <Tab label="Notes" />
      </Tabs>

      {/* OVERVIEW */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                  Goal Status
                </Typography>
                <Pie data={pieData} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                  Readiness Timeline
                </Typography>
                {child.readinessHistory?.length ? (
                  <Line data={timelineData} />
                ) : (
                  <Typography sx={{ opacity: 0.8 }}>
                    No readiness history yet. Finalize an assessment or add
                    behavior logs to add a point.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* GOALS */}
      {tab === 1 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6">Current Goals</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              (Auto-generated after each finalized assessment)
            </Typography>
          </Stack>

          {(!child.goals || child.goals.length === 0) && (
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography>
                No current goals — finalize an assessment to generate them.
              </Typography>
            </Paper>
          )}

          <Stack spacing={1.5}>
            {Array.isArray(child.goals) &&
              child.goals.map((g, idx) => {
                const goalText = composeGoalText(child.name, g);
                const last3 =
                  (g.sessions || []).length >= 3
                    ? (g.sessions || []).slice(-3).map((s) => s.percent)
                    : null;
                const meetsMastery =
                  last3 && last3.length === 3 && last3.every((p) => p >= 80);

                return (
                  <Paper key={g.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box sx={{ pr: 1, flexGrow: 1 }}>
                        <Typography fontWeight={700}>
                          {idx + 1}. [{g.domain}] {goalText}
                        </Typography>

                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                          sx={{ mt: 1 }}
                          alignItems="center"
                        >
                          <FormControl size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              label="Status"
                              value={g.status}
                              onChange={(e) =>
                                updateChild({
                                  goals: child.goals.map((x) =>
                                    x.id === g.id
                                      ? { ...x, status: e.target.value }
                                      : x
                                  ),
                                })
                              }
                            >
                              <MenuItem value="Active">Active</MenuItem>
                              <MenuItem value="Mastered">Mastered</MenuItem>
                              <MenuItem value="Maintenance">
                                Maintenance
                              </MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl size="small">
                            <InputLabel>Generalization</InputLabel>
                            <Select
                              label="Generalization"
                              value={g.generalization ? "Yes" : "No"}
                              onChange={(e) =>
                                updateChild({
                                  goals: child.goals.map((x) =>
                                    x.id === g.id
                                      ? {
                                          ...x,
                                          generalization:
                                            e.target.value === "Yes",
                                        }
                                      : x
                                  ),
                                })
                              }
                            >
                              <MenuItem value="No">No</MenuItem>
                              <MenuItem value="Yes">Yes</MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl size="small">
                            <InputLabel>Maintenance</InputLabel>
                            <Select
                              label="Maintenance"
                              value={g.maintenance ? "Yes" : "No"}
                              onChange={(e) =>
                                updateChild({
                                  goals: child.goals.map((x) =>
                                    x.id === g.id
                                      ? {
                                          ...x,
                                          maintenance: e.target.value === "Yes",
                                        }
                                      : x
                                  ),
                                })
                              }
                            >
                              <MenuItem value="No">No</MenuItem>
                              <MenuItem value="Yes">Yes</MenuItem>
                            </Select>
                          </FormControl>

                          {last3 && (
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Last 3: {last3.join("%, ")}%
                              {meetsMastery ? " — Mastery met" : ""}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ minWidth: 300, justifyContent: "flex-end" }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEdit(g)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ShowChartIcon />}
                          onClick={() => setGoalProgress(g)}
                        >
                          Progress
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<AddIcon />}
                          onClick={() => openSession(g)}
                        >
                          Track Session
                        </Button>
                      </Stack>
                    </Stack>

                    {(g.sessions || []).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Recent Sessions:
                        </Typography>
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            mt: 0.5,
                          }}
                        >
                          <Grid
                            container
                            sx={{ p: 1, bgcolor: "action.hover" }}
                          >
                            <Grid item xs={3}>
                              <Typography variant="caption">Date</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption">
                                Correct / Total
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography variant="caption">
                                % Accuracy
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption">Notes</Typography>
                            </Grid>
                          </Grid>
                          {(g.sessions || []).slice(-5).map((s, i) => (
                            <Grid container key={i} sx={{ p: 1 }}>
                              <Grid item xs={3}>
                                <Typography variant="body2">
                                  {s.date}
                                </Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="body2">
                                  {s.correct} / {s.total}
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <Typography variant="body2">
                                  {s.percent}%
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  {s.notes}
                                </Typography>
                              </Grid>
                            </Grid>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                );
              })}
          </Stack>

          {/* Goal Editor */}
          <Dialog open={!!editing} onClose={closeEdit} fullWidth maxWidth="md">
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Condition"
                    value={editDraft.condition}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, condition: e.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Behavior"
                    value={editDraft.behavior}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, behavior: e.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Criteria"
                    value={editDraft.criteria}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, criteria: e.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mastery"
                    value={editDraft.mastery}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, mastery: e.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<CloseIcon />} onClick={closeEdit}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveEdit}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Session Tracking */}
          <Dialog
            open={!!sessionFor}
            onClose={closeSession}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Track Session — {sessionFor?.domain}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Date"
                  value={sessionDraft.date}
                  onChange={(e) =>
                    setSessionDraft((d) => ({ ...d, date: e.target.value }))
                  }
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Trials Correct"
                    type="number"
                    value={sessionDraft.correct}
                    onChange={(e) =>
                      setSessionDraft((d) => ({
                        ...d,
                        correct: e.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Trials Total"
                    type="number"
                    value={sessionDraft.total}
                    onChange={(e) =>
                      setSessionDraft((d) => ({ ...d, total: e.target.value }))
                    }
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Notes (optional)"
                  value={sessionDraft.notes}
                  onChange={(e) =>
                    setSessionDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<CloseIcon />} onClick={closeSession}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={addSession}
              >
                Save Session
              </Button>
            </DialogActions>
          </Dialog>

          {/* Progress Chart */}
          <Dialog
            open={!!goalProgress}
            onClose={() => setGoalProgress(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              Progress — {goalProgress?.domain}
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {goalProgress ? composeGoalText(child.name, goalProgress) : ""}
              </Typography>
            </DialogTitle>
            <DialogContent>
              {(goalProgress?.sessions || []).length ? (
                <Box sx={{ mt: 1 }}>
                  <Line
                    data={
                      {
                        labels: (goalProgress.sessions || []).map(
                          (s) => s.date
                        ),
                        datasets: [
                          {
                            label: "% Accuracy",
                            data: (goalProgress.sessions || []).map(
                              (s) => s.percent
                            ),
                            borderColor: "#16a34a",
                            backgroundColor: "rgba(22,163,74,0.2)",
                            tension: 0.3,
                          },
                        ],
                      } || {}
                    }
                  />
                </Box>
              ) : (
                <Typography sx={{ mt: 1, opacity: 0.8 }}>
                  No sessions yet for this goal.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<CloseIcon />}
                onClick={() => setGoalProgress(null)}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* ASSESSMENTS */}
      {tab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Baseline Assessment
          </Typography>

          <Box sx={{ mb: 1 }}>
            <LinearProgress variant="determinate" value={progressPct} />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {currentCat} — Step {catIndex + 1} of {CATS.length}
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
            {ASSESS_QUESTIONS[currentCat].map((q) => {
              const existing =
                (responses[currentCat] && responses[currentCat][q.id]) || "";

              if (q.type === "yesno") {
                return (
                  <Stack
                    key={q.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 1.5 }}
                  >
                    <Typography flex={1}>{q.text}</Typography>
                    <FormControl sx={{ minWidth: 160 }} size="small">
                      <InputLabel>Response</InputLabel>
                      <Select
                        label="Response"
                        value={existing || ""}
                        onChange={(e) =>
                          setResponse(currentCat, q.id, e.target.value)
                        }
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                );
              }

              if (q.type === "scale") {
                return (
                  <Stack
                    key={q.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 1.5 }}
                  >
                    <Typography flex={1}>{q.text}</Typography>
                    <FormControl sx={{ minWidth: 160 }} size="small">
                      <InputLabel>1–5</InputLabel>
                      <Select
                        label="1–5"
                        value={existing || 3}
                        onChange={(e) =>
                          setResponse(currentCat, q.id, e.target.value)
                        }
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                );
              }

              return (
                <Stack
                  key={q.id}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 1.5 }}
                >
                  <Typography flex={1}>{q.text}</Typography>
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Choose</InputLabel>
                    <Select
                      label="Choose"
                      value={existing || ""}
                      onChange={(e) =>
                        setResponse(currentCat, q.id, e.target.value)
                      }
                    >
                      {q.options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              );
            })}
          </Paper>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Category Score:{" "}
              {scores[currentCat] != null ? `${scores[currentCat]}%` : "—"}{" "}
              &nbsp;|&nbsp; Assessment Overall: {overall}%
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => setCatIndex((i) => Math.max(0, i - 1))}
                disabled={catIndex === 0}
              >
                Back
              </Button>
              {catIndex < CATS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setCatIndex((i) => i + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={finalizeAssessment}
                >
                  Finalize & Generate Goals
                </Button>
              )}
            </Stack>
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Past Assessments
            </Typography>
            {child.assessments.filter((a) => !a._draft).length === 0 ? (
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography>No finalized assessments yet.</Typography>
              </Paper>
            ) : (
              <Stack spacing={1}>
                {child.assessments
                  .filter((a) => !a._draft)
                  .map((a, i) => (
                    <Paper
                      key={`${a.date}-${i}`}
                      variant="outlined"
                      sx={{ p: 1.5 }}
                    >
                      <Typography fontWeight={700}>
                        {a.date} — Overall: {a.overallPct}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {Object.entries(a.scores).map(([cat, val]) => (
                          <span key={cat} style={{ marginRight: 12 }}>
                            {cat}: {val}%
                          </span>
                        ))}
                      </Typography>
                      {a.notes && (
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Notes: {a.notes}
                        </Typography>
                      )}
                    </Paper>
                  ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}

      {/* BEHAVIOR */}
      {tab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Behavior Tracking
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                    Behavior Frequency (by day)
                  </Typography>
                  {behaviorSeries.labels?.length ? (
                    <Line data={behaviorSeries} />
                  ) : (
                    <Typography sx={{ opacity: 0.8 }}>
                      No behavior logs yet. Add some using the form.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                    Add Behavior Log (ABC)
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      label="Date"
                      value={behaviorDraft.date}
                      onChange={(e) =>
                        setBehaviorDraft((d) => ({
                          ...d,
                          date: e.target.value,
                        }))
                      }
                    />
                    <FormControl>
                      <InputLabel>Behavior Type</InputLabel>
                      <Select
                        label="Behavior Type"
                        value={behaviorDraft.type}
                        onChange={(e) =>
                          setBehaviorDraft((d) => ({
                            ...d,
                            type: e.target.value,
                          }))
                        }
                      >
                        {[
                          "Aggression",
                          "Elopement",
                          "Tantrum",
                          "SIB",
                          "Noncompliance",
                        ].map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Frequency (count)"
                      type="number"
                      value={behaviorDraft.frequency}
                      onChange={(e) =>
                        setBehaviorDraft((d) => ({
                          ...d,
                          frequency: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Antecedent"
                      value={behaviorDraft.antecedent}
                      onChange={(e) =>
                        setBehaviorDraft((d) => ({
                          ...d,
                          antecedent: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Behavior"
                      value={behaviorDraft.behavior}
                      onChange={(e) =>
                        setBehaviorDraft((d) => ({
                          ...d,
                          behavior: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Consequence"
                      value={behaviorDraft.consequence}
                      onChange={(e) =>
                        setBehaviorDraft((d) => ({
                          ...d,
                          consequence: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <Button variant="contained" onClick={addBehavior}>
                      Add Behavior Log
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
                    Reinforcer Tracking
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                    <TextField
                      label="Reinforcer"
                      value={reinforcerDraft.name}
                      onChange={(e) =>
                        setReinforcerDraft((d) => ({
                          ...d,
                          name: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Successes"
                      type="number"
                      value={reinforcerDraft.successes}
                      onChange={(e) =>
                        setReinforcerDraft((d) => ({
                          ...d,
                          successes: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Attempts"
                      type="number"
                      value={reinforcerDraft.attempts}
                      onChange={(e) =>
                        setReinforcerDraft((d) => ({
                          ...d,
                          attempts: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <Button variant="contained" onClick={addReinforcer}>
                      Add / Update
                    </Button>
                  </Stack>

                  <Box
                    sx={{
                      mt: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Grid container sx={{ p: 1, bgcolor: "action.hover" }}>
                      <Grid item xs={5}>
                        <Typography variant="caption">Reinforcer</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption">
                          Successes / Attempts
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="caption">Rate</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="caption">Suggested</Typography>
                      </Grid>
                    </Grid>
                    {(child.reinforcers || []).map((r, i) => (
                      <Grid container key={i} sx={{ p: 1 }}>
                        <Grid item xs={5}>
                          <Typography>{r.name}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography>
                            {r.successes} / {r.attempts}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography>{r.rate}%</Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography>{i < 3 ? "⭐" : ""}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </Box>

                  {topReinforcers?.length > 0 && (
                    <Typography sx={{ mt: 1 }}>
                      Top suggestions:{" "}
                      {topReinforcers
                        .map((r) => `${r.name} (${r.rate}%)`)
                        .join(", ")}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* READINESS REPORT */}
      {tab === 4 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Readiness Report (BRS)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Export the current goals, behavior logs, reinforcers, and readiness
            summary for school re-entry planning.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={exportReport}
          >
            Export Readiness Report (PDF)
          </Button>
        </Box>
      )}

      {/* NOTES & COLLABORATION */}
      {tab === 5 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Clinician Notes & Collaboration
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Use <strong>@mentions</strong> to tag colleagues (e.g.,{" "}
            <code>@Dr. Smith</code>).
          </Typography>

          <NotesPanel
            state={state}
            setState={setState}
            currentClinician={currentClinician}
            child={child}
          />
        </Box>
      )}
    </Paper>
  );
}
