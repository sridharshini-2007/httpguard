
import { useState, useEffect } from "react";
import { getRequests, addRequest as saveRequest } from "./api";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation
} from "react-router-dom";

import {
  ShieldCheck,
  LayoutDashboard,
  Send,
  History,
  AlertTriangle,
  Workflow,
  Bell,
  Activity,
  CheckCircle2,
  XCircle,
  Server,
  Menu
} from "lucide-react";

import "./App.css";

function mapRequest(item) {
  return {
    id: item._id,
    method: item.method,
    endpoint: item.endpoint,
    code: item.responseCode,
    status: item.status,
    session: item.sessionId,
    anomalyReason: item.anomalyReason || ""
  };
}

function Sidebar({ open, setOpen }) {
  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/simulator", label: "Request Simulator", icon: Send },
    { path: "/history", label: "Request History", icon: History },
    { path: "/anomalies", label: "Anomalies", icon: AlertTriangle },
    { path: "/dfa", label: "DFA Visualizer", icon: Workflow }
  ];

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-icon"><ShieldCheck size={25} /></div>
        <div>
          <h2>HTTP Guard</h2>
          <span>Sequence Monitor</span>
        </div>
      </div>

      <p className="nav-heading">MAIN MENU</p>

      <nav>
        {links.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={() => setOpen(false)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="server-status">
          <span className="online-dot"></span>
          <div>
            <strong>Monitoring Active</strong>
            <small>System is running</small>
          </div>
        </div>
        <p>HTTP Guard v1.0</p>
      </div>
    </aside>
  );
}

function Header({ title, setOpen }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>
      <div>
        <h2>{title}</h2>
        <p>Monitor and analyze HTTP request sequences</p>
      </div>
      <div className="header-right">
        <span className="live-badge"><span className="online-dot"></span> Live Monitoring</span>
        <button className="icon-button" title="Notifications">
          <Bell size={19} />
        </button>
      </div>
    </header>
  );
}

function Dashboard({ requests }) {
  const valid = requests.filter(r => r.status === "Valid").length;
  const invalid = requests.length - valid;

  const stats = [
    { title: "Total Requests", value: requests.length, icon: Activity, color: "blue" },
    { title: "Valid Requests", value: valid, icon: CheckCircle2, color: "green" },
    { title: "Invalid Requests", value: invalid, icon: XCircle, color: "red" },
    { title: "Anomalies", value: invalid, icon: AlertTriangle, color: "orange" }
  ];

  return (
    <>
      <div className="welcome">
        <div>
          <h1>Monitoring Dashboard</h1>
          <p>Welcome! Here is your HTTP traffic overview.</p>
        </div>
        <span className="date-label">System Overview</span>
      </div>

      <div className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div className="stat-card" key={item.title}>
              <div className={`stat-icon ${item.color}`}><Icon size={23} /></div>
              <p>{item.title}</p>
              <h2>{item.value}</h2>
              <small>Recorded in this session</small>
            </div>
          );
        })}
      </div>

      <div className="content-grid">
        <section className="panel request-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent HTTP Requests</h3>
              <p>Latest monitored network activity</p>
            </div>
            <span className="small-tag">Recent</span>
          </div>
          <RequestTable requests={requests.slice(-5).reverse()} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>System Status</h3>
              <p>Monitoring components</p>
            </div>
          </div>
          <div className="system-item">
            <Server size={20} />
            <div><strong>API Server</strong><small>Backend integration pending</small></div>
            <span className="status-wait">Setup</span>
          </div>
          <div className="system-item">
            <Activity size={20} />
            <div><strong>Sequence Analyzer</strong><small>Demo mode</small></div>
            <span className="status-wait">Demo</span>
          </div>
          <div className="system-item">
            <ShieldCheck size={20} />
            <div><strong>Database</strong><small>Atlas connection pending</small></div>
            <span className="status-wait">Setup</span>
          </div>
        </section>
      </div>
    </>
  );
}

function RequestTable({ requests }) {
  if (!requests.length) return <p className="empty-state">No requests recorded yet.</p>;

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>METHOD</th>
            <th>ENDPOINT</th>
            <th>SESSION</th>
            <th>RESPONSE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td><span className={`method ${r.method}`}>{r.method}</span></td>
              <td>{r.endpoint}</td>
              <td>{r.session}</td>
              <td>{r.code}</td>
              <td>
                <span className={`result ${r.status.toLowerCase()}`}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestSimulator({ addRequest }) {
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/login");
  const [session, setSession] = useState("S102");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
  e.preventDefault();

  const normalized = endpoint.trim();

  if (!normalized.startsWith("/")) {
    setMessage("Endpoint must start with /");
    return;
  }

  try {
    const result = await addRequest({
      method,
      endpoint: normalized,
      session: session.trim() || "S102"
    });

    setMessage(result.message || "Request saved successfully!");

  } catch (error) {
    setMessage(
      error.response?.data?.message ||
      "Unable to connect to backend. Check server."
    );
  }
}

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <h3>HTTP Request Simulator</h3>
          <p>Generate sample HTTP requests for monitoring</p>
        </div>
        <Send size={22} />
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        <label>HTTP Method</label>
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>

        <label>Endpoint</label>
        <input
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          placeholder="/login"
          required
        />

        <label>Session ID</label>
        <input
          value={session}
          onChange={e => setSession(e.target.value)}
          placeholder="S102"
          required
        />

        <button className="primary-button" type="submit">
          <Send size={17} /> Simulate Request
        </button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}

function HistoryPage({ requests }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h3>Request History</h3>
          <p>All simulated HTTP requests</p>
        </div>
        <History size={22} />
      </div>
      <RequestTable requests={[...requests].reverse()} />
    </section>
  );
}

function AnomaliesPage({ requests }) {
  const anomalies = requests.filter(r => r.status === "Invalid");

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h3>Anomaly Detection</h3>
          <p>Invalid requests and suspicious activity</p>
        </div>
        <AlertTriangle color="#f59e0b" size={23} />
      </div>

      {anomalies.length === 0 ? (
        <p className="empty-state">No anomalies detected in the current demo data.</p>
      ) : anomalies.map(r => (
        <div className="alert-item" key={r.id}>
          <AlertTriangle color="#ef4444" />
          <div>
            <strong>Invalid request: {r.endpoint}</strong>
            <p>Session {r.session} – HTTP {r.code}</p>
          </div>
          <span className="result invalid">Detected</span>
        </div>
      ))}
    </section>
  );
}

function DFAVisualizer() {
  const states = [
    { name: "START", desc: "Initial state" },
    { name: "LOGGED IN", desc: "After GET /login" },
    { name: "DASHBOARD", desc: "After GET /dashboard" },
    { name: "PROFILE", desc: "After GET /profile" },
    { name: "LOGGED OUT", desc: "After POST /logout" }
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h3>DFA State Transition Model</h3>
          <p>Finite automata for HTTP session monitoring</p>
        </div>
        <Workflow size={23} />
      </div>

      <div className="dfa-flow">
        {states.map((state, index) => (
          <div className="dfa-state" key={state.name}>
            <div className={`state-circle ${index === 4 ? "final-state" : ""}`}>
              {index + 1}
            </div>
            <strong>{state.name}</strong>
            <small>{state.desc}</small>
            {index < states.length - 1 && <span className="state-arrow">→</span>}
          </div>
        ))}
      </div>
      <p className="dfa-note">
        This is the initial workflow visualization. Actual DFA transition
        validation will be implemented in the backend.
      </p>
    </section>
  );
}

function AppLayout() {
  const [requests, setRequests] = useState([]);
  const [apiError, setApiError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
  async function loadRequests() {
    try {
      const data = await getRequests();

      const savedRequests = (data.requests || [])
        .map(mapRequest)
        .reverse();

      setRequests(savedRequests);
      setApiError("");

    } catch (error) {
      console.error("API Error:", error);

      setApiError(
        error.response?.data?.message ||
        "Cannot connect to backend server"
      );
    }
  }

  loadRequests();
}, []);

  const titles = {
    "/": "Dashboard",
    "/simulator": "Request Simulator",
    "/history": "Request History",
    "/anomalies": "Anomaly Detection",
    "/dfa": "DFA Visualizer"
  };

  async function addRequest(request) {
  const result = await saveRequest({
    sessionId: request.session,
    method: request.method,
    endpoint: request.endpoint
  });

  const savedRequest = mapRequest(result.request);

  setRequests(prev => [...prev, savedRequest]);

  return result;
}

  return (
    <div className="app-layout">
      <Sidebar open={menuOpen} setOpen={setMenuOpen} />
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
      <main className="main-area">
        <Header title={titles[location.pathname] || "HTTP Guard"} setOpen={setMenuOpen} />
          <div className="page-content">

           {apiError && (
            <p className="form-message">
            Backend Error: {apiError}
            </p>
          )}
          <Routes>
            <Route path="/" element={<Dashboard requests={requests} />} />
            <Route path="/simulator" element={<RequestSimulator addRequest={addRequest} />} />
            <Route path="/history" element={<HistoryPage requests={requests} />} />
            <Route path="/anomalies" element={<AnomaliesPage requests={requests} />} />
            <Route path="/dfa" element={<DFAVisualizer />} />
          </Routes>
        </div>
        <footer>HTTP Guard © 2026 | HTTP Request Sequence Monitoring System</footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
