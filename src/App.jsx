import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Users, UserCheck, History, Target } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';

const STORAGE_KEY = 'studiopulse_team_v2';

const initialTeam = [
  {
    id: 1, name: 'Alice Smith', role: 'Software Engineer', team: 'Software',
    metrics: { velocity: 85, quality: 90, presence: 95, milestone: 80, excellence: 4, collaboration: 5, ownership: 4 },
    history: [
      { month: '2023-08', pulse: 80, metrics: {} },
      { month: '2023-09', pulse: 85, metrics: {} }
    ]
  },
  {
    id: 2, name: 'Bob Jones', role: 'UX Designer', team: 'Design',
    metrics: { velocity: 75, quality: 85, presence: 90, milestone: 70, excellence: 3, collaboration: 4, ownership: 4 },
    history: []
  },
  {
    id: 3, name: 'Charlie Brown', role: 'Product Manager', team: 'Software',
    metrics: { velocity: 90, quality: 85, presence: 100, milestone: 95, excellence: 5, collaboration: 4, ownership: 5 },
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

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [team, setTeam] = useState(getStoredTeam);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  const calculateScores = (metrics) => {
    const { velocity, quality, presence, milestone, excellence, collaboration, ownership } = metrics;
    const quantAvg = (Number(velocity) + Number(quality) + Number(presence) + Number(milestone)) / 4;
    const qualAvg = (((Number(excellence) + Number(collaboration) + Number(ownership)) / 3) / 5) * 100;
    const pulseScore = Math.round((quantAvg * 0.6) + (qualAvg * 0.4));
    
    return { quant: Math.round(quantAvg), qual: Math.round(qualAvg), pulse: pulseScore || 0 };
  };

  const navItems = [
    { id: 'dashboard', label: 'Report View', icon: LayoutDashboard },
    { id: 'team', label: 'Team Roster', icon: Users },
    { id: 'review', label: 'Review Entry', icon: UserCheck },
    { id: 'history', label: 'History & Growth', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-500 mb-1">
            <Target className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">StudioPulse</h1>
          </div>
          <p className="text-slate-400 text-sm">R&D Performance Engine</p>
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

      <main className="flex-1 overflow-auto p-8 relative">
        {activeView === 'dashboard' && <ReportView team={team} calculateScores={calculateScores} />}
        {activeView === 'team' && <TeamRosterView team={team} setTeam={setTeam} />}
        {activeView === 'review' && <ReviewEntryView team={team} setTeam={setTeam} calculateScores={calculateScores} />}
        {activeView === 'history' && <HistoryView team={team} />}
      </main>
    </div>
  );
}

function ReportView({ team, calculateScores }) {
  const chartData = useMemo(() => {
    return team.map(member => {
      const scores = calculateScores(member.metrics);
      return {
        name: member.name,
        Pulse: scores.pulse,
        Quant: scores.quant,
        Qual: scores.qual,
      };
    });
  }, [team, calculateScores]);

  const radarData = useMemo(() => {
    if (team.length === 0) return [];
    
    const avgs = team.reduce((acc, m) => {
      acc.velocity += Number(m.metrics.velocity) || 0;
      acc.quality += Number(m.metrics.quality) || 0;
      acc.presence += Number(m.metrics.presence) || 0;
      acc.milestone += Number(m.metrics.milestone) || 0;
      acc.excellence += ((Number(m.metrics.excellence) || 0) / 5) * 100;
      acc.collaboration += ((Number(m.metrics.collaboration) || 0) / 5) * 100;
      acc.ownership += ((Number(m.metrics.ownership) || 0) / 5) * 100;
      return acc;
    }, { velocity: 0, quality: 0, presence: 0, milestone: 0, excellence: 0, collaboration: 0, ownership: 0 });

    const count = team.length;
    return [
      { dimension: 'Velocity', value: Math.round(avgs.velocity / count), fullMark: 100 },
      { dimension: 'Quality', value: Math.round(avgs.quality / count), fullMark: 100 },
      { dimension: 'Presence', value: Math.round(avgs.presence / count), fullMark: 100 },
      { dimension: 'Milestone', value: Math.round(avgs.milestone / count), fullMark: 100 },
      { dimension: 'Excellence', value: Math.round(avgs.excellence / count), fullMark: 100 },
      { dimension: 'Collab', value: Math.round(avgs.collaboration / count), fullMark: 100 },
      { dimension: 'Ownership', value: Math.round(avgs.ownership / count), fullMark: 100 },
    ];
  }, [team]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Report View</h2>
        <p className="text-slate-400 mt-2">Studio-wide performance metrics and dimension mapping.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-medium text-slate-200 mb-6">7 Core Dimensions (Studio Avg)</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                <Radar name="Studio Average" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontFamily: 'JetBrains Mono' }} />
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
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fontFamily: 'Inter' }} angle={-45} textAnchor="end" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontFamily: 'JetBrains Mono' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="Pulse" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamRosterView({ team, setTeam }) {
  const [newMember, setNewMember] = useState({ name: '', role: '', teamName: 'Software' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    
    setTeam([...team, {
      id: Date.now(),
      name: newMember.name,
      role: newMember.role,
      team: newMember.teamName,
      history: [],
      metrics: { velocity: 0, quality: 0, presence: 0, milestone: 0, excellence: 0, collaboration: 0, ownership: 0 }
    }]);
    setNewMember({ name: '', role: '', teamName: 'Software' });
  };

  const handleDelete = (id) => {
    setTeam(team.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Team Roster</h2>
        <p className="text-slate-400 mt-2">Manage employee records, roles, and teams.</p>
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
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Team</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {team.map(member => (
              <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">{member.name}</td>
                <td className="px-6 py-4 text-slate-400">{member.role}</td>
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

function ReviewEntryView({ team, setTeam, calculateScores }) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [metrics, setMetrics] = useState({
    velocity: '', quality: '', presence: '', milestone: '',
    excellence: '', collaboration: '', ownership: ''
  });

  const activeMember = team.find(m => m.id === Number(selectedMemberId));

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedMemberId(id);
    const member = team.find(m => m.id === Number(id));
    if (member) {
      setMetrics({ ...member.metrics });
    } else {
      setMetrics({
        velocity: '', quality: '', presence: '', milestone: '',
        excellence: '', collaboration: '', ownership: ''
      });
    }
  };

  const handleChange = (field, value) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    if (!activeMember) return;
    setTeam(team.map(m => m.id === activeMember.id ? { ...m, metrics: { ...metrics } } : m));
    alert(`Draft saved for ${activeMember.name}!`);
  };

  const isFormValid = Object.values(metrics).every(val => val !== '' && !isNaN(val));
  let currentScores = null;
  if(isFormValid) {
    currentScores = calculateScores(metrics);
  } else if (activeMember) {
    currentScores = calculateScores({ ...activeMember.metrics, ...metrics });
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
          pulse: currentScores.pulse
        };
        return { 
          ...m, 
          history: [...(m.history || []), newHistoryRecord],
          // Reset current metrics to zero indicating a fresh review period
          metrics: { velocity: 0, quality: 0, presence: 0, milestone: 0, excellence: 0, collaboration: 0, ownership: 0 }
        };
      }
      return m;
    }));
    
    setMetrics({ velocity: '', quality: '', presence: '', milestone: '', excellence: '', collaboration: '', ownership: '' });
    setSelectedMemberId('');
    alert(`Review for ${activeMember.name} has been signed-off and finalized! Historic data updated.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Review Entry</h2>
        <p className="text-slate-400 mt-2">Enter objective metrics and 360 peer feedback. Finalize the review to record it to history.</p>
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
              <option key={member.id} value={member.id}>{member.name} ({member.team})</option>
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
                <MetricInput label="Velocity (%)" value={metrics.velocity} onChange={(v) => handleChange('velocity', v)} max="100" />
                <MetricInput label="Quality (%)" value={metrics.quality} onChange={(v) => handleChange('quality', v)} max="100" />
                <MetricInput label="Presence (%)" value={metrics.presence} onChange={(v) => handleChange('presence', v)} max="100" />
                <MetricInput label="Milestone (%)" value={metrics.milestone} onChange={(v) => handleChange('milestone', v)} max="100" />
              </div>
            </div>

            {/* Qualitative Section */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                Qualitative <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">40% WEIGHT</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Peer Feedback Ratings (1-5)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricInput label="Excellence (1-5)" value={metrics.excellence} onChange={(v) => handleChange('excellence', v)} max="5" />
                <MetricInput label="Collaboration (1-5)" value={metrics.collaboration} onChange={(v) => handleChange('collaboration', v)} max="5" />
                <MetricInput label="Ownership (1-5)" value={metrics.ownership} onChange={(v) => handleChange('ownership', v)} max="5" />
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

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">History & Growth</h2>
          <p className="text-slate-400 mt-2">Track performance velocity and historical growth over time.</p>
        </div>
        <select 
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {team.map(member => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>
      </header>

      {activeMember ? (
        chartData.length > 0 ? (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
            <h3 className="text-lg font-medium text-slate-200 mb-6 flex justify-between">
              <span>Historical Pulse Score Trend</span>
              <span className="text-sm font-normal text-slate-400 bg-slate-950 px-3 py-1 rounded-full">{activeMember.history.length} finalized periods</span>
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
