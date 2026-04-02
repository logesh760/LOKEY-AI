import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  MessageSquare, 
  Shield, 
  Trash2, 
  Search, 
  ArrowLeft,
  Activity,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  messageCount?: number;
  banned?: boolean;
}

interface ChatMessage {
  id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
  profiles?: { email: string };
}

export default function AdminDashboard({ userId, onBack }: { userId: string, onBack: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "chats" | "create">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTask, setNewTask] = useState({ userId: "", title: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, chatsRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { "x-user-id": userId }
        }),
        fetch("/api/admin/chats", {
          headers: { "x-user-id": userId }
        })
      ]);

      if (!usersRes.ok || !chatsRes.ok) throw new Error("Failed to fetch admin data");

      const usersData = await usersRes.json();
      const chatsData = await chatsRes.json();

      setUsers(usersData);
      setChats(chatsData);
    } catch (error) {
      toast.error("Error loading admin data");
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/admin/chats/${id}`, { 
        method: "DELETE",
        headers: { "x-user-id": userId }
      });
      if (res.ok) {
        setChats(chats.filter(c => c.id !== id));
        toast.success("Message deleted");
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const toggleBan = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-ban`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ banned: !currentStatus })
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, banned: !currentStatus } : u));
        toast.success(`User ${action}ned`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const changeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        toast.success(`Role updated to ${newRole}`);
      }
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.userId || !newTask.title.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/goals", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify(newTask)
      });

      if (res.ok) {
        toast.success("Task assigned successfully");
        setNewTask({ userId: "", title: "" });
        setActiveTab("users");
      }
    } catch (error) {
      toast.error("Failed to assign task");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChats = chats.filter(c => 
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-indigo-400" },
    { label: "Total Messages", value: chats.length, icon: MessageSquare, color: "text-purple-400" },
    { label: "Banned Users", value: users.filter(u => u.banned).length, icon: Shield, color: "text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-slate-400">Manage users and monitor conversations</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === "users" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === "chats" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chats
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === "create" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Create
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Content */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "users" ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-bottom border-white/10 bg-white/5">
                      <th className="p-4 font-semibold text-slate-300">Email</th>
                      <th className="p-4 font-semibold text-slate-300">Role</th>
                      <th className="p-4 font-semibold text-slate-300">Messages</th>
                      <th className="p-4 font-semibold text-slate-300">Joined</th>
                      <th className="p-4 font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-bottom border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {user.email}
                            {user.banned && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded border border-red-500/30">BANNED</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">
                          {user.messageCount || 0}
                        </td>
                        <td className="p-4 text-slate-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => changeRole(user.id, user.role)}
                              className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                              title="Toggle Admin/User Role"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => toggleBan(user.id, !!user.banned)}
                              className={`p-2 rounded-lg transition-colors ${user.banned ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-red-400 hover:bg-red-400/10'}`}
                              title={user.banned ? "Unban User" : "Ban User"}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("create");
                                setNewTask({ ...newTask, userId: user.id });
                              }}
                              className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-400/10 transition-all"
                              title="Assign Task"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === "chats" ? (
                <div className="divide-y divide-white/10">
                  {filteredChats.map(chat => (
                    <div key={chat.id} className="p-4 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-indigo-400">{chat.profiles?.email || 'Unknown'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${chat.role === 'user' ? 'border-blue-500/50 text-blue-400' : 'border-purple-500/50 text-purple-400'}`}>
                            {chat.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500">{new Date(chat.created_at).toLocaleString()}</span>
                          <button 
                            onClick={() => deleteMessage(chat.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{chat.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Assign Mentor Task
                  </h2>
                  <form onSubmit={handleCreateTask} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-widest">Select Student</label>
                      <select
                        value={newTask.userId}
                        onChange={(e) => setNewTask({ ...newTask, userId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select a student...</option>
                        {users.filter(u => u.role !== 'admin').map(u => (
                          <option key={u.id} value={u.id}>{u.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-widest">Task / Goal Description</label>
                      <textarea
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="e.g., Complete the React hooks module by Friday"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {isCreating ? "Assigning..." : "Assign Task to Student"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
