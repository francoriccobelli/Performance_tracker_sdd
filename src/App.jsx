import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Users, UserCheck, History, Target, Settings, Printer, Clock, LogOut, Briefcase } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';

const STORAGE_KEY = 'studiopulse_team_v3';
const STORAGE_KEY_MILESTONE = 'studiopulse_milestone_v2';

const STORAGE_KEY_MILESTONE_STATUS = 'studiopulse_milestone_status_v2';

const initialTeam = [
  {
    id: 1, name: 'Alice Smith', role: 'Software Engineer', team: 'Software', track: 'IC',
    metrics: { sprint: 85, qa: 90, sync: 95, milestone: 80 },
    peerFeedback: { excellence: 4, collab: 5, ownership: 4 },
    history: [
      { month: '2023-08', pulse: 80, metrics: {}, peerFeedback: {} },
      { month: '2023-09', pulse: 85, metrics: {}, peerFeedback: {} }
    ]
  },
  {
    id: 2, name: 'Bob Jones', role: 'UX Designer', team: 'Design', track: 'IC',
    metrics: { sprint: 75, qa: 85, sync: 90, milestone: 70 },
    peerFeedback: { excellence: 3, collab: 4, ownership: 4 },
    history: []
  },
  {
    id: 3, name: 'Charlie Brown', role: 'Product Manager', team: 'Software', track: 'Manager',
    metrics: { sprint: 90, qa: 85, sync: 100, milestone: 95 },
    peerFeedback: { excellence: 5, collab: 4, ownership: 5 },
    history: [
      { month: '2023-09', pulse: 92, metrics: {} }
    ]
  },
];

const getStoredTeam = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialTeam;
  } catch (error) {
    console.error("Failed to parse stored data", error);
    return initialTeam;
  }
};

const getStoredMilestone = () => {
  return localStorage.getItem(STORAGE_KEY_MILESTONE) || 'Current Month - Alpha Release';
};

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [presence, setPresence] = useState('Active');
  const [activeView, setActiveView] = useState('dashboard');
  const [team, setTeam] = useState(getStoredTeam);
  const [milestone, setMilestone] = useState(getStoredMilestone);
  const [milestoneStatus, setMilestoneStatus] = useState(() => localStorage.getItem(STORAGE_KEY_MILESTONE_STATUS) || 'On Track');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MILESTONE, milestone);
    localStorage.setItem(STORAGE_KEY_MILESTONE_STATUS, milestoneStatus);
  }, [milestone, milestoneStatus]);

  if (!authenticatedUser) {
    return <LoginView onLogin={setAuthenticatedUser} />;
  }

  const calculateScores = (member) => {
    const metrics = member.metrics || { sprint: 0, qa: 0, sync: 0, milestone: 0 };
    const peerFeedback = member.peerFeedback || { excellence: 0, collab: 0, ownership: 0 };

    const hardScore = (Number(metrics.sprint || 0) + Number(metrics.qa || 0) + Number(metrics.sync || 0) + Number(metrics.milestone || 0)) / 4;
    const softScore = ((Number(peerFeedback.excellence || 0) + Number(peerFeedback.collab || 0) + Number(peerFeedback.ownership || 0)) / 3) * 20;
    const pulseScore = Math.round((hardScore * 0.6) + (softScore * 0.4));
    
    return { quant: Math.round(hardScore), qual: Math.round(softScore), pulse: pulseScore || 0 };
  };

  const navItems = [
    { id: 'dashboard', label: 'Report View', icon: LayoutDashboard },
    { id: 'team', label: 'Team Roster', icon: Users },
    { id: 'review', label: 'Review Entry', icon: UserCheck },
    { id: 'history', label: 'History & Growth', icon: History },
    { id: 'allocation', label: 'Daily Allocation', icon: Briefcase },
    { id: 'milestone', label: 'Milestone Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col print:hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-500 mb-1">
            <Target className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">StudioPulse</h1>
          </div>
          <p className="text-slate-400 text-sm mb-4">R&D Performance Engine</p>
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">{authenticatedUser.name}</span>
              <button onClick={() => setAuthenticatedUser(null)} className="text-slate-500 hover:text-rose-400 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <select
                value={presence}
                onChange={(e) => setPresence(e.target.value)}
                className={`text-xs font-bold rounded px-2 py-1 bg-slate-900 border focus:outline-none w-full appearance-none cursor-pointer ${
                  presence === 'Active' ? 'text-emerald-400 border-emerald-500/30' :
                  presence === 'Break' ? 'text-amber-400 border-amber-500/30' :
                  presence === 'Lunch' ? 'text-amber-400 border-amber-500/30' :
                  'text-slate-400 border-slate-700'
                }`}
              >
                <option value="Active">🟢 Active (Punch In)</option>
                <option value="Break">🟠 Break</option>
                <option value="Lunch">🟡 Lunch</option>
                <option value="Offline">⚫ Offline (Punch Out)</option>
              </select>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-500 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8 relative print:p-0">
        {activeView === 'dashboard' && <ReportView team={team} calculateScores={calculateScores} milestone={milestone} milestoneStatus={milestoneStatus} />}
        {activeView === 'team' && <TeamRosterView team={team} setTeam={setTeam} />}
        {activeView === 'review' && <ReviewEntryView team={team} setTeam={setTeam} calculateScores={calculateScores} milestone={milestone} />}
        {activeView === 'history' && <HistoryView team={team} />}
        {activeView === 'allocation' && <AllocationView />}
        {activeView === 'milestone' && <MilestoneManagerView milestone={milestone} setMilestone={setMilestone} milestoneStatus={milestoneStatus} setMilestoneStatus={setMilestoneStatus} />}
      </main>
    </div>
  );
}

function ReportView({ team, calculateScores, milestone, milestoneStatus }) {
  const [teamFilter, setTeamFilter] = useState('All');

  const filteredTeam = useMemo(() => {
    if (teamFilter === 'All') return team;
    return team.filter(m => m.team === teamFilter);
  }, [team, teamFilter]);

  const chartData = useMemo(() => {
    return filteredTeam.map(member => {
      const scores = calculateScores(member);
      return {
        name: member.name,
        Pulse: scores.pulse,
        Quant: scores.quant,
        Qual: scores.qual,
      };
    });
  }, [filteredTeam, calculateScores]);

  const nineBoxMatrix = useMemo(() => {
    const boxes = Array(9).fill().map(() => []);
    chartData.forEach(m => {
      let x = m.Quant < 60 ? 0 : m.Quant < 85 ? 1 : 2;
      let y = m.Qual < 60 ? 0 : m.Qual < 85 ? 1 : 2;
      boxes[(2 - y) * 3 + x].push(m);
    });
    return boxes;
  }, [chartData]);

  const radarData = useMemo(() => {
    if (filteredTeam.length === 0) return [];
    
    const avgs = filteredTeam.reduce((acc, m) => {
      acc.sprint += Number(m.metrics?.sprint) || 0;
      acc.qa += Number(m.metrics?.qa) || 0;
      acc.sync += Number(m.metrics?.sync) || 0;
      acc.milestone += Number(m.metrics?.milestone) || 0;
      acc.excellence += ((Number(m.peerFeedback?.excellence) || 0) / 5) * 100;
      acc.collab += ((Number(m.peerFeedback?.collab) || 0) / 5) * 100;
      acc.ownership += ((Number(m.peerFeedback?.ownership) || 0) / 5) * 100;
      return acc;
    }, { sprint: 0, qa: 0, sync: 0, milestone: 0, excellence: 0, collab: 0, ownership: 0 });

    const count = filteredTeam.length;
    return [
      { dimension: 'Sprint', value: Math.round(avgs.sprint / count), fullMark: 100 },
      { dimension: 'QA', value: Math.round(avgs.qa / count), fullMark: 100 },
      { dimension: 'Sync', value: Math.round(avgs.sync / count), fullMark: 100 },
      { dimension: 'Milestone', value: Math.round(avgs.milestone / count), fullMark: 100 },
      { dimension: 'Excellence', value: Math.round(avgs.excellence / count), fullMark: 100 },
      { dimension: 'Collab', value: Math.round(avgs.collab / count), fullMark: 100 },
      { dimension: 'Ownership', value: Math.round(avgs.ownership / count), fullMark: 100 },
    ];
  }, [filteredTeam]);

  return (
    <div className="space-y-6 animate-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Report View</h2>
          <p className="text-slate-400 mt-2">Studio-wide performance metrics and dimension mapping.</p>
        </div>
        <select 
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="All">All Teams</option>
          <option value="Software">Software</option>
          <option value="Design">Design</option>
        </select>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Studio Milestone Status</h3>
            <p className="text-xl font-bold text-white font-mono">{milestone}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold font-mono ${
            milestoneStatus === 'On Track' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            milestoneStatus === 'Minor Blockers' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {milestoneStatus.toUpperCase()}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-medium text-slate-200 mb-6">7 Core Dimensions (Studio Avg)</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontFamily: "'JetBrains Mono', monospace" }} />
                <Radar name="Studio Average" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontFamily: "'JetBrains Mono', monospace" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Current Pulse Scores by Member</h3>
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} angle={-45} textAnchor="end" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontFamily: "'JetBrains Mono', monospace" }} />
                <RechartsTooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <Bar dataKey="Pulse" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-medium text-slate-200 mb-6">9-Box Performance vs Potential Matrix</h3>
          <div className="grid grid-cols-3 grid-rows-3 gap-3 h-[550px]">
            {nineBoxMatrix.map((boxMembers, idx) => {
              const bgColors = [
                'bg-amber-500/10 border-amber-500/30', 'bg-indigo-500/10 border-indigo-500/30', 'bg-emerald-500/20 border-emerald-500/40',
                'bg-rose-500/10 border-rose-500/30', 'bg-slate-800/50 border-slate-700/50', 'bg-indigo-500/10 border-indigo-500/30',
                'bg-rose-500/20 border-rose-500/40', 'bg-amber-500/10 border-amber-500/30', 'bg-emerald-500/10 border-emerald-500/30'
              ];
              const labels = [
                'Enigma (Low Perf, High Pot)', 'Growth (Mod Perf, High Pot)', 'Future Leader (High Perf, High Pot)',
                'Dilemma (Low Perf, Mod Pot)', 'Core Employee (Mod Perf, Mod Pot)', 'High Impact (High Perf, Mod Pot)',
                'Underperformer (Low, Low)', 'Effective Worker (Mod Perf, Low Pot)', 'Trusted Expert (High Perf, Low Pot)'
              ];
              return (
                <div key={idx} className={`p-4 rounded-xl border flex flex-col ${bgColors[idx]}`}>
                  <span className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">{labels[idx]}</span>
                  <div className="flex-1 flex flex-wrap content-start gap-2">
                    {boxMembers.map(m => (
                      <div key={m.name} className="px-3 py-2 bg-slate-950/80 rounded block border border-slate-800 text-sm font-medium text-slate-200 shadow-sm shrink-0 min-w-full lg:min-w-0 flex items-center justify-between gap-4">
                        <span>{m.name}</span>
                        <div className="text-[10px] text-slate-400 font-mono tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800">P:{m.Quant} Q:{m.Qual}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamRosterView({ team, setTeam }) {
  const [newMember, setNewMember] = useState({ name: '', role: '', teamName: 'Software', track: 'IC' });
  const [teamFilter, setTeamFilter] = useState('All');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    
    setTeam([...team, {
      id: Date.now(),
      name: newMember.name,
      role: newMember.role,
      team: newMember.teamName,
      track: newMember.track,
      history: [],
      metrics: { sprint: 0, qa: 0, sync: 0, milestone: 0 },
      peerFeedback: { excellence: 0, collab: 0, ownership: 0 }
    }]);
    setNewMember({ name: '', role: '', teamName: 'Software', track: 'IC' });
  };

  const handleDelete = (id) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const filteredTeam = useMemo(() => {
    if (teamFilter === 'All') return team;
    return team.filter(m => m.team === teamFilter);
  }, [team, teamFilter]);

  return (
    <div className="space-y-6 max-w-5xl animate-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Team Roster</h2>
          <p className="text-slate-400 mt-2">Manage employee records, roles, and teams.</p>
        </div>
        <select 
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="All">All Teams</option>
          <option value="Software">Software</option>
          <option value="Design">Design</option>
        </select>
      </header>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl mb-8">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Add Employee</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Full Name</label>
            <input 
              type="text" 
              value={newMember.name}
              onChange={e => setNewMember({...newMember, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Role</label>
            <input 
              type="text" 
              value={newMember.role}
              onChange={e => setNewMember({...newMember, role: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              placeholder="e.g. Senior Designer"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm text-slate-400 mb-1">Track</label>
            <select 
              value={newMember.track}
              onChange={e => setNewMember({...newMember, track: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans h-[42px]"
            >
              <option value="IC">IC</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm text-slate-400 mb-1">Team</label>
            <select 
              value={newMember.teamName}
              onChange={e => setNewMember({...newMember, teamName: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans h-[42px]"
            >
              <option value="Software">Software</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <button 
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors h-[42px]"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Name</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Role</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Track</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Team</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredTeam.map(member => (
              <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">{member.name}</td>
                <td className="px-6 py-4 text-slate-400">{member.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${member.track === 'Manager' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {member.track || 'IC'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${member.team === 'Software' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {member.team}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(member.id)} className="text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewEntryView({ team, setTeam, calculateScores, milestone }) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [metrics, setMetrics] = useState({
    sprint: '', qa: '', sync: '', milestone: ''
  });
  const [peerFeedback, setPeerFeedback] = useState({
    excellence: '', collab: '', ownership: ''
  });

  const activeMember = team.find(m => m.id === Number(selectedMemberId));

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedMemberId(id);
    const member = team.find(m => m.id === Number(id));
    if (member) {
      setMetrics({ ...(member.metrics || { sprint: '', qa: '', sync: '', milestone: '' }) });
      setPeerFeedback({ ...(member.peerFeedback || { excellence: '', collab: '', ownership: '' }) });
    } else {
      setMetrics({
        sprint: '', qa: '', sync: '', milestone: ''
      });
      setPeerFeedback({
        excellence: '', collab: '', ownership: ''
      });
    }
  };

  const handleMetricsChange = (field, value) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  const handlePeerFeedbackChange = (field, value) => {
    setPeerFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    if (!activeMember) return;
    setTeam(team.map(m => m.id === activeMember.id ? { ...m, metrics: { ...metrics }, peerFeedback: { ...peerFeedback } } : m));
    alert(`Draft saved for ${activeMember.name}!`);
  };

  const isFormValid = Object.values(metrics).every(val => val !== '' && !isNaN(val)) && 
                      Object.values(peerFeedback).every(val => val !== '' && !isNaN(val));
  let currentScores = null;
  if(isFormValid) {
    currentScores = calculateScores({ metrics, peerFeedback });
  } else if (activeMember) {
    currentScores = calculateScores({ 
      metrics: { ...activeMember.metrics, ...metrics },
      peerFeedback: { ...activeMember.peerFeedback, ...peerFeedback }
    });
  }

  const handleSignOff = () => {
    if (!activeMember || !currentScores) return;
    
    // Auto-generate timestamp
    const now = new Date();
    const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    setTeam(team.map(m => {
      if (m.id === activeMember.id) {
        const newHistoryRecord = {
          month: monthId,
          metrics: { ...metrics },
          peerFeedback: { ...peerFeedback },
          pulse: currentScores.pulse
        };
        return { 
          ...m, 
          history: [...(m.history || []), newHistoryRecord],
          metrics: { ...metrics },
          peerFeedback: { ...peerFeedback }
        };
      }
      return m;
    }));
    
    // Clear the form after saving
    setMetrics({ sprint: '', qa: '', sync: '', milestone: '' });
    setPeerFeedback({ excellence: '', collab: '', ownership: '' });
    setSelectedMemberId('');
    alert(`Review for ${activeMember.name} has been signed-off and finalized! Historic data updated.`);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Review Entry</h2>
        <p className="text-slate-400 mt-2">Enter objective metrics and 360 peer feedback. Finalize the review to record it to history.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-sm font-medium">
          <Target size={16} />
          <span>Current Milestone: {milestone}</span>
        </div>
      </header>

      <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-xl space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Employee</label>
          <select 
            value={selectedMemberId}
            onChange={handleSelect}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
          >
             <option value="">-- Choose a team member --</option>
            {team.map(member => (
              <option key={member.id} value={member.id}>{member.name} ({member.team} - {member.track || 'IC'})</option>
            ))}
          </select>
        </div>

        {activeMember && (
          <div className="space-y-8 pt-6 border-t border-slate-800">
            {/* Quantitative Section */}
            <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                Quantitative <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">60% WEIGHT</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricInput label="Sprint Velocity (%)" value={metrics.sprint} onChange={(v) => handleMetricsChange('sprint', v)} max="100" />
                <MetricInput label="QA & Testing (%)" value={metrics.qa} onChange={(v) => handleMetricsChange('qa', v)} max="100" />
                <MetricInput label="Daily Sync (%)" value={metrics.sync} onChange={(v) => handleMetricsChange('sync', v)} max="100" />
                <MetricInput label="Milestone Impact (%)" value={metrics.milestone} onChange={(v) => handleMetricsChange('milestone', v)} max="100" />
              </div>
            </div>

            {/* Qualitative Section */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                Qualitative <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">40% WEIGHT</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Peer Feedback Ratings (1-5)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricInput label="Excellence (1-5)" value={peerFeedback.excellence} onChange={(v) => handlePeerFeedbackChange('excellence', v)} max="5" />
                <MetricInput label="Cross-Collaboration (1-5)" value={peerFeedback.collab} onChange={(v) => handlePeerFeedbackChange('collab', v)} max="5" />
                <MetricInput label="Ownership (1-5)" value={peerFeedback.ownership} onChange={(v) => handlePeerFeedbackChange('ownership', v)} max="5" />
              </div>
            </div>

            {/* Final Calculation & Action */}
            <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 flex items-center justify-between mt-8 shadow-inner">
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-slate-400 mb-1 font-medium">Quant Avg</p>
                  <div className="text-2xl font-mono text-indigo-400">{currentScores && !isNaN(currentScores.quant) ? currentScores.quant : '--'}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1 font-medium">Qual Avg</p>
                  <div className="text-2xl font-mono text-emerald-400">{currentScores && !isNaN(currentScores.qual) ? currentScores.qual : '--'}</div>
                </div>
                <div className="pl-6 border-l border-slate-800">
                  <p className="text-sm text-amber-500 mb-1 font-bold">PULSE SCORE</p>
                  <div className="text-4xl font-mono text-white">{currentScores && !isNaN(currentScores.pulse) ? currentScores.pulse : '--'}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleSaveDraft}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Save Draft
                </button>
                <button 
                  onClick={handleSignOff}
                  disabled={!isFormValid}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:shadow-none tracking-wide"
                >
                  SIGN-OFF & FINALIZE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricInput({ label, value, onChange, max }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1 tracking-wide">{label}</label>
      <input 
        type="number" 
        min="0" max={max}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xl"
      />
    </div>
  );
}

function HistoryView({ team }) {
  const [selectedMemberId, setSelectedMemberId] = useState(team.length > 0 ? team[0].id : '');
  const activeMember = team.find(m => m.id === Number(selectedMemberId));

  const chartData = useMemo(() => {
    if (!activeMember || !activeMember.history) return [];
    return activeMember.history.map(record => ({
      month: record.month,
      Pulse: record.pulse
    }));
  }, [activeMember]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl print:max-w-none print:m-0 print:p-8 animate-in">
      <header className="mb-8 flex items-center justify-between print:mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white print:text-slate-900">
            {activeMember ? `${activeMember.name} - Performance Summary` : 'History & Growth'}
          </h2>
          <p className="text-slate-400 mt-2 print:text-slate-600">Track performance velocity and historical growth over time.</p>
        </div>
        <div className="flex gap-4 print:hidden">
          <select 
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {team.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          {activeMember && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700"
            >
              <Printer size={18} />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </header>

      {activeMember ? (
        chartData.length > 0 ? (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl print:bg-white print:border-slate-300 print:shadow-none">
            <h3 className="text-lg font-medium text-slate-200 mb-6 flex justify-between print:text-slate-900">
              <span>Historical Pulse Score Trend</span>
              <span className="text-sm font-normal text-slate-400 bg-slate-950 px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-700">{activeMember.history.length} finalized periods</span>
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 13, fontFamily: 'Inter' }} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontFamily: 'JetBrains Mono' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Pulse" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 6 }} 
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-12 border border-slate-800 flex flex-col items-center justify-center text-center">
            <History className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-medium text-slate-300">No History Available</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              This employee doesn't have any signed-off reviews yet. Finalize a review in the Review Entry view to populate growth charts.
            </p>
          </div>
        )
      ) : (
        <p className="text-slate-500">Please select an employee.</p>
      )}
    </div>
  );
}

function MilestoneManagerView({ milestone, setMilestone, milestoneStatus, setMilestoneStatus }) {
  const [draftMilestone, setDraftMilestone] = useState(milestone);
  const [draftStatus, setDraftStatus] = useState(milestoneStatus);

  const handleSave = (e) => {
    e.preventDefault();
    setMilestone(draftMilestone);
    setMilestoneStatus(draftStatus);
    alert('Milestone settings updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Milestone Settings</h2>
        <p className="text-slate-400 mt-2">Define the studio goal for the current month and its status. This appears on performance reviews and the dashboard.</p>
      </header>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Current Milestone</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Milestone Description</label>
            <input 
              type="text" 
              value={draftMilestone}
              onChange={e => setDraftMilestone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              placeholder="e.g. March 2026 - Alpha Release"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Project Health Status</label>
            <select 
              value={draftStatus}
              onChange={e => setDraftStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            >
              <option value="On Track">On Track</option>
              <option value="Minor Blockers">Minor Blockers</option>
              <option value="Critical / Needs Review">Critical / Needs Review</option>
            </select>
          </div>
          <button 
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginView({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({ name: username, role: 'Employee' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 animate-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-center gap-3 text-indigo-500 mb-8">
          <Target className="w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight text-white">StudioPulse</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Username or Studio ID</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 font-sans focus:outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="e.g. employee.name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Secure Passkey</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 font-sans focus:outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            Authenticate Session
          </button>
        </form>
      </div>
    </div>
  );
}

function AllocationView() {
  const [allocations, setAllocations] = useState([
    { id: 1, project: 'Project Alpha (Core Platform)', hours: 4 },
    { id: 2, project: 'Project Beta (Mobile App)', hours: 2 },
  ]);

  const totalHours = allocations.reduce((acc, curr) => acc + Number(curr.hours || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl animate-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Daily Allocation</h2>
        <p className="text-slate-400 mt-2">Log your daily hours against active studio projects.</p>
      </header>
      
      <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-xl">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-medium text-slate-200">Today's Timesheet</h3>
          <div className={`text-xl font-mono font-bold px-4 py-1 rounded-full border ${
            totalHours === 8 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
            totalHours > 8 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            Total: {totalHours}h
          </div>
        </div>
        
        <div className="space-y-4">
          {allocations.map((alloc, idx) => (
            <div key={alloc.id} className="flex gap-4 items-center">
              <input 
                type="text" 
                value={alloc.project}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none font-mono text-sm"
                readOnly
              />
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="0" max="24"
                  value={alloc.hours}
                  onChange={(e) => {
                    const newAllocs = [...allocations];
                    newAllocs[idx].hours = e.target.value;
                    setAllocations(newAllocs);
                  }}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 font-mono focus:outline-none focus:border-indigo-500 text-center"
                />
                <span className="text-slate-500 font-mono">hrs</span>
              </div>
            </div>
          ))}
        </div>
        
        <button className="mt-6 text-indigo-400 font-medium hover:text-indigo-300 transition-colors text-sm">
          + Add another project
        </button>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg">
            Submit Daily Log
          </button>
        </div>
      </div>
    </div>
  );
}
