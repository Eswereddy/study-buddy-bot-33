import { useState } from "react";
import { BookOpen, Brain, MessageCircle, Calendar, BarChart3, FileText, Menu, X, GraduationCap, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import NotesPanel from "./panels/NotesPanel";
import QuizPanel from "./panels/QuizPanel";
import ChatPanel from "./panels/ChatPanel";
import SchedulePanel from "./panels/SchedulePanel";
import ProgressPanel from "./panels/ProgressPanel";
import SummaryPanel from "./panels/SummaryPanel";
import ProfilePanel from "./panels/ProfilePanel";

const tabs = [
  { id: "summary", label: "PDF Summary", icon: FileText },
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "quiz", label: "Quizzes", icon: Brain },
  { id: "chat", label: "AI Tutor", icon: MessageCircle },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: UserCircle },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Dashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const panels: Record<TabId, React.ReactNode> = {
    summary: <SummaryPanel />,
    notes: <NotesPanel />,
    quiz: <QuizPanel />,
    chat: <ChatPanel />,
    schedule: <SchedulePanel />,
    progress: <ProgressPanel />,
    profile: <ProfilePanel />,
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed md:static z-50 inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform md:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          <span className="font-heading font-bold text-lg text-sidebar-foreground">StudyAI</span>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-heading font-semibold text-lg">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-6">{panels[activeTab]}</div>
      </main>
    </div>
  );
}
