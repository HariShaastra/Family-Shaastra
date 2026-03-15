import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  ExternalLink,
  Shield,
  Info,
  Star,
  Zap,
  LayoutGrid,
  Home, 
  Users, 
  Clock, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  LogOut,
  Lock,
  Menu,
  X,
  ChevronRight,
  Heart,
  Calendar,
  Camera,
  Plus,
  Trash2,
  Edit2,
  Mic,
  Video,
  FileText,
  Bell,
  Download,
  Filter,
  UserPlus,
  Mail,
  Check,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { translations } from './translations';
import { 
  Language, 
  FamilyMember, 
  TimelineEvent, 
  Memory, 
  MemoryCategory, 
  AppNotification, 
  Invitation 
} from './types';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<{ email: string } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('home');
  const [navigationStack, setNavigationStack] = useState<string[]>(['home']);
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('isPremium') === 'true';
  });

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setNavigationStack(prev => [...prev, tab]);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop(); // remove current
      const prevTab = newStack[newStack.length - 1];
      setActiveTab(prevTab);
      setNavigationStack(newStack);
    }
  };

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('emailNotifications') === 'true';
  });

  // Data State
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('members');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Grandpa Sharma', relation: 'Grandfather', birthDate: '1945-05-12', category: 'family' },
      { id: '2', name: 'Grandma Sharma', relation: 'Grandmother', birthDate: '1948-08-20', category: 'family' },
      { id: '3', name: 'Rajesh Sharma', relation: 'Father', birthDate: '1972-03-15', parentId: '1', category: 'family' },
      { id: '4', name: 'Sunita Sharma', relation: 'Mother', birthDate: '1975-11-10', category: 'family' },
      { id: '5', name: 'Aryan Sharma', relation: 'Son', birthDate: '2000-01-01', parentId: '3', category: 'family' },
    ];
  });

  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '1945', title: 'Grandpa Born', description: 'The patriarch of the Sharma family was born in a small village.', type: 'birth' },
      { id: '2', date: '1970', title: 'The Big Move', description: 'Family moved to the city for better opportunities.', type: 'milestone' },
      { id: '3', date: '1972', title: 'Father Born', description: 'Rajesh was born, bringing joy to the household.', type: 'birth' },
      { id: '4', date: '1998', title: 'Wedding Day', description: 'Rajesh and Sunita tied the knot in a grand ceremony.', type: 'marriage' },
      { id: '5', date: '2000', title: 'New Generation', description: 'Aryan was born at the turn of the millennium.', type: 'birth' },
    ];
  });

  const [memories, setMemories] = useState<Memory[]>(() => {
    const saved = localStorage.getItem('memories');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Summer Vacation 2015', date: '2015-06-15', description: 'Our first family trip to the mountains.', author: 'Sunita', category: 'photo' },
      { id: '2', title: 'Diwali Celebration', date: '2023-11-12', description: 'The whole family gathered for lights and sweets.', author: 'Rajesh', category: 'text' },
      { id: '3', title: 'Graduation Day', date: '2022-05-20', description: 'Aryan graduating from university.', author: 'Grandpa', category: 'video' },
    ];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Milestone Reached', message: '5 years ago today, your family recorded a memory.', date: '2024-03-13', type: 'milestone', read: false },
      { id: '2', title: 'New Invitation', message: 'Rajesh invited you to join the Sharma Family Space.', date: '2024-03-12', type: 'invitation', read: true },
    ];
  });

  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    const saved = localStorage.getItem('invitations');
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[language];

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('emailNotifications', String(emailNotifications));
  }, [emailNotifications]);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('invitations', JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem('isPremium', String(isPremium));
  }, [isPremium]);

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'record', label: t.recordMemory, icon: Plus },
    { id: 'memories', label: t.memories, icon: ImageIcon },
    { id: 'tree', label: t.familyTree, icon: Users },
    { id: 'timeline', label: t.timeline, icon: Clock },
    { id: 'resources', label: t.resources, icon: LayoutGrid },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    setNavigationStack(['home']);
  };

  const renderContent = () => {
    if (!user) {
      return <LoginView t={t} onLogin={(email) => setUser({ email })} />;
    }
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            t={t} 
            isPremium={isPremium}
            onStart={() => navigateTo('record')} 
            onExplore={() => navigateTo('memories')} 
            onInvite={() => navigateTo('settings')}
          />
        );
      case 'record':
        return (
          <RecordMemoryView 
            t={t} 
            members={members}
            isPremium={isPremium}
            onSave={(memory) => {
              setMemories(prev => [memory, ...prev]);
              navigateTo('memories');
            }}
          />
        );
      case 'tree':
        return (
          <FamilyTreeView 
            t={t} 
            members={members} 
            setMembers={setMembers} 
          />
        );
      case 'timeline':
        return (
          <TimelineView 
            t={t} 
            events={events} 
            setEvents={setEvents} 
          />
        );
      case 'memories':
        return (
          <MemoriesView 
            t={t} 
            memories={memories} 
            setMemories={setMemories} 
            members={members}
            isPremium={isPremium}
          />
        );
      case 'resources':
        return (
          <FamilyResourcesView t={t} />
        );
      case 'settings':
        return (
          <SettingsView 
            t={t} 
            language={language} 
            setLanguage={setLanguage} 
            members={members}
            setMembers={setMembers}
            invitations={invitations}
            setInvitations={setInvitations}
            notifications={notifications}
            setNotifications={setNotifications}
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <HomeView 
            t={t} 
            isPremium={isPremium}
            onStart={() => navigateTo('record')} 
            onExplore={() => navigateTo('memories')} 
            onInvite={() => navigateTo('settings')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 overflow-x-hidden flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 border-r border-slate-200 bg-white z-50">
        <div className="p-6">
          <button 
            onClick={() => navigateTo('home')}
            className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            {t.title}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                activeTab === item.id 
                  ? "bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500/10" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-emerald-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.language}</span>
            </div>
            <div className="flex gap-1">
              {(['en', 'hi', 'ta'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all border",
                    language === lang 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                      : "bg-white border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-600"
                  )}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {!isPremium && (
            <button 
              onClick={() => navigateTo('settings')}
              className="w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group hover:bg-emerald-100 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span className="text-xs font-black text-emerald-700 uppercase tracking-tight">{t.premium}</span>
              </div>
              <p className="text-[10px] text-emerald-600/80 font-medium leading-tight">Unlock unlimited storage and remove all advertisements.</p>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen">
        {/* Header (Mobile & Contextual) */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            {navigationStack.length > 1 && (
              <button
                onClick={goBack}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="md:hidden text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <h2 className="hidden md:block text-lg font-bold text-slate-900">
              {navItems.find(i => i.id === activeTab)?.label || t.home}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button 
                className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isPremium ? t.premiumVersion : t.freeVersion}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 z-50 md:hidden bg-white flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {t.title}
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-4 rounded-2xl text-lg font-bold flex items-center gap-4 transition-all",
                      activeTab === item.id 
                        ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                        : "text-slate-600 active:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("w-6 h-6", activeTab === item.id ? "text-emerald-600" : "text-slate-400")} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.language}</span>
                  <div className="flex gap-2">
                    {(['en', 'hi', 'ta'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                          language === lang 
                            ? "bg-emerald-600 border-emerald-600 text-white" 
                            : "bg-white border-slate-200 text-slate-400"
                        )}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {user && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 px-4">
          <div className="max-w-5xl mx-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <p>© 2026 {t.title}. {t.tagline}</p>
            <div className="flex gap-6">
              <button onClick={() => navigateTo('settings')} className="hover:text-emerald-600 transition-colors">{t.guide}</button>
              <button onClick={() => navigateTo('settings')} className="hover:text-emerald-600 transition-colors">{t.disclaimer}</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function HomeView({ t, isPremium, onStart, onExplore, onInvite }: { t: any, isPremium: boolean, onStart: () => void, onExplore: () => void, onInvite: () => void }) {
  return (
    <div className="space-y-12 overflow-hidden">
      <section className="text-center space-y-6 py-12 relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-emerald-400/10 rounded-full blur-xl"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight"
        >
          {t.welcome}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto"
        >
          {t.tagline}
        </motion.p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button 
            onClick={onStart}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-emerald-600/20"
          >
            {t.recordMemory}
          </button>
          <button 
            onClick={onExplore}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-full font-semibold transition-all"
          >
            {t.memories}
          </button>
          <button 
            onClick={onInvite}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" /> {t.invite}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Plus, title: t.recordMemory, desc: 'Record stories in text, photo, audio, or video.' },
          { icon: Users, title: t.familyTree, desc: 'Visualize your lineage across generations.' },
          { icon: Clock, title: t.timeline, desc: 'Track key milestones and historical events.' },
        ].map((feature, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-slate-200 rounded-3xl hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Banner Ad Section */}
      {!isPremium && (
        <section className="mt-12 p-8 bg-slate-100 rounded-3xl border border-slate-200 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.sponsored}</span>
            <div className="aspect-[3/1] bg-slate-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
              <p className="text-slate-500 font-medium italic">Preserve your family legacy with Ancestry.com</p>
            </div>
            <p className="text-xs text-slate-500">{t.sponsoredBy} Heritage Partners</p>
          </div>
        </section>
      )}
    </div>
  );
}

function FamilyResourcesView({ t }: { t: any }) {
  const resources = [
    { title: 'Genealogy Research', provider: 'Ancestry Experts', desc: 'Professional help to trace your roots back centuries.', link: '#' },
    { title: 'Photo Restoration', provider: 'MemoryFix', desc: 'Bring your old, damaged family photos back to life.', link: '#' },
    { title: 'Oral History Recording', provider: 'StoryKeepers', desc: 'Professional interviewers to record your elders\' stories.', link: '#' },
    { title: 'Family Reunion Planning', provider: 'GatherRound', desc: 'Tools and services to plan the perfect family gathering.', link: '#' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">{t.resources}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">Discover services and tools to help you preserve and celebrate your family history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-slate-200 rounded-3xl hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">{res.title}</h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full uppercase">{t.sponsored}</span>
              </div>
              <p className="text-sm text-emerald-600 font-medium mb-3">{res.provider}</p>
              <p className="text-slate-600 text-sm mb-6">{res.desc}</p>
            </div>
            <button className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
              Learn More <ExternalLink className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecordMemoryView({ t, members, isPremium, onSave }: { t: any, members: FamilyMember[], isPremium: boolean, onSave: (memory: Memory) => void }) {
  const [formData, setFormData] = useState<Partial<Memory>>({
    category: 'text',
    date: new Date().toISOString().split('T')[0]
  });
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const prompts = [
    { text: "What was your childhood like?", sponsored: false },
    { text: "What was your first job?", sponsored: false },
    { text: "How did you meet your spouse?", sponsored: true, sponsor: "WeddingWire" },
    { text: "What was the happiest moment in your life?", sponsored: false },
    { text: "What advice would you give to the next generation?", sponsored: true, sponsor: "LegacyBooks" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Convert to base64 for local storage preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, description: (prev.description || '') + ' ' + text }));
    };

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMemory: Memory = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    } as Memory;
    onSave(newMemory);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">{t.recordMemory}</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.title_label}</label>
              <input 
                required
                type="text" 
                value={formData.title || ''} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
                placeholder="e.g. My First Day at School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
              <input 
                required
                type="date" 
                value={formData.date || ''} 
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Person Associated</label>
              <select 
                value={formData.personId || ''} 
                onChange={e => setFormData({ ...formData, personId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
              >
                <option value="">Select a person</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.categories}</label>
              <div className="flex gap-2">
                {(['text', 'photo', 'audio', 'video', 'document'] as MemoryCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={cn(
                      "p-2 rounded-xl border transition-all",
                      formData.category === cat 
                        ? "bg-emerald-600 border-emerald-600 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    )}
                  >
                    {cat === 'text' && <FileText className="w-5 h-5" />}
                    {cat === 'photo' && <ImageIcon className="w-5 h-5" />}
                    {cat === 'audio' && <Mic className="w-5 h-5" />}
                    {cat === 'video' && <Video className="w-5 h-5" />}
                    {cat === 'document' && <Download className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">{t.description}</label>
              <button 
                type="button"
                onClick={handleVoiceInput}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full transition-all",
                  isRecording ? "bg-red-100 text-red-600 animate-pulse" : "bg-emerald-100 text-emerald-600"
                )}
              >
                <Mic className="w-3 h-3" /> {isRecording ? "Recording..." : t.voiceInput}
              </button>
            </div>
            <textarea 
              required
              value={formData.description || ''} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 min-h-[150px]"
              placeholder="Tell your story here..."
            />
          </div>

          {formData.category !== 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Upload {formData.category}</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Download className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">
                      {file ? file.name : `Click to upload ${formData.category}`}
                    </p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept={
                    formData.category === 'photo' ? 'image/*' :
                    formData.category === 'video' ? 'video/*' :
                    formData.category === 'audio' ? 'audio/*' :
                    '*'
                  } />
                </label>
              </div>
              {!isPremium && (
                <p className="text-[10px] text-slate-400 italic">
                  {t.storageLimit}: 50MB (Free Version)
                </p>
              )}
            </div>
          )}

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {t.prompts}
            </h4>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, description: (prev.description || '') + ' ' + p.text }))}
                    className="text-xs bg-white px-3 py-1.5 rounded-full border border-emerald-200 text-slate-600 hover:bg-emerald-100 transition-colors"
                  >
                    {p.text}
                  </button>
                  {!isPremium && p.sponsored && (
                    <span className="text-[8px] text-slate-400 text-center uppercase tracking-tighter">
                      {t.sponsoredBy} {p.sponsor}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all"
          >
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
}

function MemoriesView({ t, memories, setMemories, members, isPremium }: { t: any, memories: Memory[], setMemories: React.Dispatch<React.SetStateAction<Memory[]>>, members: FamilyMember[], isPremium: boolean }) {
  const [filter, setFilter] = useState<MemoryCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [showExportSponsor, setShowExportSponsor] = useState(false);

  const filteredMemories = memories.filter(m => {
    const matchesCategory = filter === 'all' || m.category === filter;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerson = selectedPerson === 'all' || m.personId === selectedPerson;
    return matchesCategory && matchesSearch && matchesPerson;
  });

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Family Shaastra - Memories Archive",
            heading: HeadingLevel.HEADING_1,
          }),
          ...filteredMemories.flatMap(m => [
            new Paragraph({
              text: m.title,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Date: ${m.date}`, bold: true }),
                new TextRun({ text: ` | Author: ${m.author}`, bold: true }),
              ],
            }),
            new Paragraph({
              text: m.description,
              spacing: { after: 200 },
            }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Family_Memories.docx");
    if (!isPremium) setShowExportSponsor(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-900">{t.memories}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToWord}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
          >
            <Download className="w-4 h-4" /> {t.exportWord}
          </button>
        </div>
      </div>

      <Modal isOpen={showExportSponsor} onClose={() => setShowExportSponsor(false)} title={t.sponsored}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-slate-600">This memory book export was made possible by <strong>FamilyLegacy Prints</strong>. Get 20% off your first physical photo book with code FAMILY20.</p>
          <button 
            onClick={() => setShowExportSponsor(false)}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
          >
            Continue
          </button>
        </div>
      </Modal>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search memories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
            />
          </div>
          <select 
            value={selectedPerson}
            onChange={e => setSelectedPerson(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
          >
            <option value="all">All People</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'text', 'photo', 'audio', 'video', 'document'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                filter === cat 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : "bg-white border-slate-200 text-slate-500 hover:border-emerald-500"
              )}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((memory) => (
          <motion.div 
            layout
            key={memory.id} 
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden group hover:shadow-xl transition-all"
          >
            <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {memory.imageUrl ? (
                <img 
                  src={memory.imageUrl} 
                  alt={memory.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  {memory.category === 'photo' && <ImageIcon className="w-12 h-12 text-emerald-500/50" />}
                  {memory.category === 'video' && <Video className="w-12 h-12 text-blue-500/50" />}
                  {memory.category === 'audio' && <Mic className="w-12 h-12 text-purple-500/50" />}
                  {memory.category === 'text' && <FileText className="w-12 h-12 text-slate-500/50" />}
                  {memory.category === 'document' && <Download className="w-12 h-12 text-orange-500/50" />}
                </>
              )}
              
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-full">
                {memory.date}
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{memory.title}</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded-full uppercase text-slate-500">
                  {memory.category}
                </span>
              </div>
              <p className="text-slate-600 text-sm line-clamp-3">{memory.description}</p>
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400">By {memory.author}</span>
                <button className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                  View <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NotificationsView({ t, notifications, setNotifications }: { t: any, notifications: AppNotification[], setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>> }) {
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-slate-900">{t.notifications}</h2>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No new notifications</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={cn(
                "p-6 rounded-3xl border transition-all flex items-start gap-4",
                n.read 
                  ? "bg-white border-slate-200" 
                  : "bg-emerald-50 border-emerald-100 shadow-sm"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'milestone' ? "bg-emerald-100 text-emerald-600" : 
                n.type === 'invitation' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
              )}>
                {n.type === 'milestone' && <Clock className="w-5 h-5" />}
                {n.type === 'invitation' && <UserPlus className="w-5 h-5" />}
                {n.type === 'update' && <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>
                <p className="text-sm text-slate-600">{n.message}</p>
                <div className="pt-2 flex gap-2">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="text-xs font-bold text-emerald-600">Mark as read</button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="text-xs font-bold text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FamilyTreeView({ t, members, setMembers }: { t: any, members: FamilyMember[], setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Family Shaastra - Family Tree",
            heading: HeadingLevel.HEADING_1,
          }),
          ...members.map(m => (
            new Paragraph({
              children: [
                new TextRun({ text: `${m.name}`, bold: true }),
                new TextRun({ text: ` (${m.relation})` }),
                m.birthDate ? new TextRun({ text: ` - Born: ${m.birthDate}` }) : new TextRun({ text: "" }),
              ],
              spacing: { before: 200 },
            })
          )),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Family_Tree.docx");
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...formData } as FamilyMember : m));
    } else {
      const newMember: FamilyMember = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as FamilyMember;
      setMembers(prev => [...prev, newMember]);
    }
    setIsModalOpen(false);
  };

  const renderTree = (parentId: string | null = null, level: number = 0) => {
    const children = members.filter(m => m.parentId === (parentId || undefined) || (!parentId && !m.parentId));
    
    if (children.length === 0) return null;

    return (
      <div className={cn("flex flex-col gap-4", level > 0 ? "ml-8 md:ml-12 border-l-2 border-slate-100 pl-4 md:pl-8 py-2" : "")}>
        {children.map((member) => (
          <div key={member.id} className="space-y-4">
            <div className="group relative flex items-center gap-4">
              <div className={cn(
                "flex-1 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all relative z-10 flex items-center gap-4",
                member.relation.includes('Grand') ? "border-emerald-500/50 ring-1 ring-emerald-500/10" : ""
              )}>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{member.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{member.relation}</p>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(member)} className="p-1.5 bg-slate-50 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Render children recursively */}
            {renderTree(member.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-900">{t.familyTree}</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToWord}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
          >
            <Download className="w-4 h-4" /> {t.exportWord}
          </button>
          <button 
            onClick={handleAdd}
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> {t.add}
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 md:p-8 shadow-sm min-h-[400px]">
        {members.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p>No family members added yet.</p>
          </div>
        ) : (
          renderTree(null)
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMember ? t.edit : t.add}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
            <input 
              required
              type="text" 
              value={formData.name || ''} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.relation}</label>
            <input 
              required
              type="text" 
              value={formData.relation || ''} 
              onChange={e => setFormData({ ...formData, relation: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parent (Optional)</label>
            <select 
              value={formData.parentId || ''} 
              onChange={e => setFormData({ ...formData, parentId: e.target.value || undefined })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
            >
              <option value="">None (Root)</option>
              {members.filter(m => m.id !== editingMember?.id).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
            >
              {t.cancel}
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              {t.save}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TimelineView({ t, events, setEvents }: { t: any, events: TimelineEvent[], setEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({});

  const exportToWord = async () => {
    const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Family Shaastra - Timeline",
            heading: HeadingLevel.HEADING_1,
          }),
          ...sortedEvents.flatMap(e => [
            new Paragraph({
              text: `${e.date}: ${e.title}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: e.description,
              spacing: { after: 200 },
            }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Family_Timeline.docx");
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData(event);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...formData } as TimelineEvent : ev));
    } else {
      const newEvent: TimelineEvent = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as TimelineEvent;
      setEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
  };

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">{t.timeline}</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToWord}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
          >
            <Download className="w-4 h-4" /> {t.exportWord}
          </button>
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> {t.add}
          </button>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {sortedEvents.map((event, i) => (
          <div key={event.id} className={cn(
            "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
            i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          )}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-900">{event.title}</div>
                <time className="font-mono text-sm font-medium text-emerald-600">{event.date}</time>
              </div>
              <div className="text-slate-600 text-sm mb-4">{event.description}</div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(event)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingEvent ? t.edit : t.add}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.title_label}</label>
            <input 
              required
              type="text" 
              value={formData.title || ''} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 1995"
              value={formData.date || ''} 
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.description}</label>
            <textarea 
              required
              value={formData.description || ''} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 min-h-[100px]"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
            >
              {t.cancel}
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              {t.save}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SettingsView({ 
  t, 
  language, 
  setLanguage, 
  members, 
  setMembers, 
  invitations, 
  setInvitations, 
  notifications, 
  setNotifications, 
  emailNotifications, 
  setEmailNotifications,
  isPremium,
  setIsPremium,
  onLogout 
}: { 
  t: any, 
  language: Language, 
  setLanguage: (l: Language) => void, 
  members: FamilyMember[], 
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>,
  invitations: Invitation[],
  setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>,
  notifications: AppNotification[],
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>,
  emailNotifications: boolean,
  setEmailNotifications: (v: boolean) => void,
  isPremium: boolean,
  setIsPremium: (v: boolean) => void,
  onLogout: () => void 
}) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'notifications' | 'invitations'>('general');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newInvite: Invitation = {
      id: Math.random().toString(36).substr(2, 9),
      email: inviteEmail,
      status: 'pending',
      sentDate: new Date().toISOString().split('T')[0]
    };
    setInvitations(prev => [newInvite, ...prev]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const renderGeneral = () => (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{t.language}</h4>
              <p className="text-xs text-slate-500">Choose your preferred language</p>
            </div>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{isPremium ? t.premiumVersion : t.freeVersion}</h4>
              <p className="text-xs text-slate-500">{isPremium ? t.unlimitedStorage : `${t.storageLimit}: 50MB`}</p>
            </div>
          </div>
          {!isPremium && (
            <button 
              onClick={() => setIsPremium(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
            >
              <Zap className="w-4 h-4" /> {t.upgrade}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setShowGuide(true)}
          className="p-6 bg-white border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{t.guide}</h4>
            <p className="text-xs text-slate-500">Learn how to use Family Shaastra</p>
          </div>
        </button>

        <button 
          onClick={() => setShowDisclaimer(true)}
          className="p-6 bg-white border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{t.disclaimer}</h4>
            <p className="text-xs text-slate-500">Privacy and legal information</p>
          </div>
        </button>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
      >
        <LogOut className="w-5 h-5" /> {t.logout}
      </button>

      <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title={t.guide}>
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p><strong>Welcome to Family Shaastra!</strong> This app is your digital family archive. Here is how to get started:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Record Memories:</strong> Use the "Record" tab to add stories, photos, audio, or video. You can even use voice input!</li>
            <li><strong>Family Tree:</strong> Add your relatives in the "Family Tree" tab to visualize your lineage.</li>
            <li><strong>Timeline:</strong> Track major family milestones like births, weddings, and moves.</li>
            <li><strong>Memories:</strong> Browse and search through all your recorded family history.</li>
            <li><strong>Export:</strong> You can export your memories, tree, or timeline to a Word document at any time.</li>
          </ul>
        </div>
      </Modal>

      <Modal isOpen={showDisclaimer} onClose={() => setShowDisclaimer(false)} title={t.disclaimer}>
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p><strong>Privacy First:</strong> Family Shaastra is designed to protect your personal family data. Your memories are stored locally on your device.</p>
          <p><strong>Advertisements:</strong> To keep the basic version free, we show minimal, respectful advertisements. We never use your personal memories or family data for ad targeting.</p>
          <p><strong>No AI:</strong> This application does not use Artificial Intelligence in its core operations to ensure your data remains private and human-centric.</p>
          <p><strong>Data Loss:</strong> Since data is stored locally, clearing your browser cache or switching devices may result in data loss unless you have exported your archives.</p>
        </div>
      </Modal>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">{t.settings}</h2>
      </div>

      <div className="flex flex-wrap border-b border-slate-200">
        {(['general', 'notifications', 'invitations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "px-4 md:px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
              activeSubTab === tab 
                ? "border-emerald-600 text-emerald-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab === 'general' ? t.general : tab === 'notifications' ? t.notifications : t.invitations}
          </button>
        ))}
      </div>

      <div className="py-4">
        {activeSubTab === 'general' && renderGeneral()}
        {activeSubTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t.emailNotifications}</h4>
                  <p className="text-xs text-slate-500">Receive updates about family milestones</p>
                </div>
              </div>
              <button 
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  emailNotifications ? "bg-emerald-600" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  emailNotifications ? "right-1" : "left-1"
                )} />
              </button>
            </div>
            <NotificationsView t={t} notifications={notifications} setNotifications={setNotifications} />
          </div>
        )}
        {activeSubTab === 'invitations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{t.invitations}</h3>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> {t.invite}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">No invitations sent yet</td>
                    </tr>
                  ) : (
                    invitations.map(inv => (
                      <tr key={inv.id}>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{inv.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{inv.sentDate}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            inv.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title={t.invite}>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.emailAddress}</label>
            <input 
              required
              type="email" 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
              placeholder="family@example.com"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
          >
            Send Invitation
          </button>
        </form>
      </Modal>
    </div>
  );
}

function LoginView({ t, onLogin }: { t: any, onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl"
      >
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">{t.login}</h2>
          <p className="text-slate-500">Sign in to access your family history</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{t.emailAddress}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-600 font-medium">{t.rememberMe}</span>
            </label>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all"
          >
            {t.login}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
