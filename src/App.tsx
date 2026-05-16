import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  LayoutGrid,
  Home, 
  Users, 
  Clock, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  LogOut,
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
  MessageSquare,
  Share2,
  Copy,
  PlusCircle,
  FileCode,
  Link as LinkIcon,
  Globe,
  Info,
  Shield,
  HeartHandshake,
  Hourglass,
  Package,
  CalendarDays,
  MapPin,
  Clock3,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  setDoc,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Logo } from './components/Logo';
import { translations } from './translations';
import { 
  FamilyMember, 
  Memory, 
  Invitation, 
  CustomFacility,
  UserProfile
} from './types';
import { cn } from './lib/utils';

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Security Error: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className, icon: Icon, disabled }: any) => {
  const variants: any = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    accent: 'bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-md shadow-amber-400/20',
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'px-6 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

const Card = ({ children, className }: any) => (
  <div className={cn('bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 font-serif break-words">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firestore Data
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [facilities, setFacilities] = useState<CustomFacility[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeFacility, setActiveFacility] = useState<CustomFacility | null>(null);

  const t = translations.en;

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or connection.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user as FirebaseUser);
      setLoading(false);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
        }
        // Sync data
        syncData(user.uid, user.email || '');
        setupNotifications();
        syncUserNode(user as FirebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncUserNode = async (user: FirebaseUser) => {
    try {
      const q = query(collection(db, 'family_members'), where('userId', '==', user.uid), where('isMe', '==', true));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, 'family_members'), {
          userId: user.uid,
          name: user.displayName,
          relation: 'Me',
          description: 'App User',
          photoUrl: user.photoURL,
          isMe: true,
          createdAt: new Date().toISOString()
        });
        showNotification("Welcome to Family Shaastra", "I've added you to your own Family Tree! Start adding your ancestors and siblings.");
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'family_members');
    }
  };

  const syncData = (uid: string, email: string) => {
    // Members
    onSnapshot(query(collection(db, 'family_members'), where('userId', '==', uid)), (snap) => {
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'family_members');
    });
    // Memories
    onSnapshot(query(collection(db, 'memories'), where('userId', '==', uid), orderBy('date', 'desc')), (snap) => {
      setMemories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'memories');
    });
    // Invitations
    onSnapshot(query(collection(db, 'invitations'), where('recipientEmail', '==', email)), (snap) => {
      setInvitations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'invitations');
    });
    // Facilities
    onSnapshot(query(collection(db, 'facilities'), where('userId', '==', uid)), (snap) => {
      setFacilities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomFacility)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'facilities');
    });
  };

  const setupNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    setNotifications(prev => [{ id: Date.now(), title, body, date: new Date().toISOString(), read: false }, ...prev]);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Create user profile if not exists
      await setDoc(doc(db, 'users', result.user.uid), {
        userId: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'tree', label: t.familyTree, icon: Users },
    { id: 'events', label: t.eventPlanner || 'Events', icon: CalendarDays },
    { id: 'capsule', label: t.timeCapsule || 'Time Capsule', icon: Hourglass },
    { id: 'timeline', label: t.timeline, icon: Clock },
    { id: 'memories', label: t.memories, icon: ImageIcon },
    { id: 'facilities', label: t.facilities, icon: LayoutGrid },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold">Initialising Heritage...</div>;

  if (!currentUser) return <LoginView onLogin={handleLogin} t={t} />;

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-80 flex-col fixed inset-y-0 border-r border-slate-100 bg-white/50 backdrop-blur-xl z-50">
        <div className="p-6 lg:p-8">
          <Logo />
        </div>
        <nav className="flex-1 px-4 lg:px-6 space-y-1.5 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={cn(
                "w-full px-5 lg:px-6 py-3.5 lg:py-4 rounded-[1.5rem] text-sm font-black transition-all flex items-center gap-3 lg:gap-4 group",
                activeTab === item.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                  : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <item.icon className={cn("w-5 h-5 lg:w-6 lg:h-6", activeTab === item.id ? "text-white" : "text-slate-300 group-hover:text-emerald-600")} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 lg:p-8 border-t border-slate-50">
          <div className="flex items-center gap-3 lg:gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <img src={currentUser.photoURL || ''} alt="" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] lg:text-xs font-black text-slate-900 truncate">{currentUser.displayName}</p>
              <button onClick={handleLogout} className="text-[9px] lg:text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1">
                <LogOut className="w-3 h-3 shrink-0" /> {t.logout}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 lg:pl-80 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header - Mobile */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 justify-between md:hidden">
          <Logo />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-slate-50 rounded-2xl border border-slate-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Header - Contextual (Notifications/Logo) */}
        <header className="hidden md:flex sticky top-0 z-40 h-24 items-center px-8 lg:px-12 justify-between bg-white/40 backdrop-blur-sm pointer-events-none">
          <div className="pointer-events-auto">
             <h2 className="text-xl lg:text-2xl font-black text-slate-900 font-serif">
               {navItems.find(i => i.id === activeTab)?.label}
             </h2>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
            <button onClick={() => navigateTo('notifications')} className="p-2.5 lg:p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:scale-110 transition-transform relative">
              <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />
              {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Logo />
                <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-2xl">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={cn(
                      "w-full p-5 rounded-[2rem] text-lg font-black flex items-center gap-6 transition-all",
                      activeTab === item.id 
                        ? "bg-emerald-600 text-white shadow-xl" 
                        : "text-slate-500"
                    )}
                  >
                    <item.icon className="w-8 h-8" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-8 border-t border-slate-50">
                <Button variant="danger" className="w-full py-5 rounded-[2rem]" onClick={handleLogout} icon={LogOut}>
                  {t.logout}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
             >
                {renderContent(activeTab, t, currentUser!, members, memories, invitations, facilities, setMembers, setMemories, setInvitations, setFacilities, showNotification, navigateTo, activeFacility, setActiveFacility, notifications)}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- View Logic ---

function renderContent(tab: string, t: any, user: FirebaseUser, members: FamilyMember[], memories: Memory[], invitations: Invitation[], facilities: CustomFacility[], setMembers: any, setMemories: any, setInvitations: any, setFacilities: any, showNotification: any, navigateTo: any, activeFacility: CustomFacility | null, setActiveFacility: any, notifications: any[]) {
  switch (tab) {
    case 'home': return <HomeView t={t} user={user} navigateTo={navigateTo} />;
    case 'tree': return <FamilyTreeView t={t} members={members} setMembers={setMembers} user={user} />;
    case 'timeline': return <TimelineView t={t} memories={memories} />;
    case 'events': return <EventPlannerView t={t} user={user} />;
    case 'capsule': return <TimeCapsuleView t={t} user={user} />;
    case 'memories': return <MemoriesView t={t} memories={memories} setMemories={setMemories} user={user} members={members} />;
    case 'facilities': return <ToolboxView t={t} facilities={facilities} user={user} setFacilities={setFacilities} activeFacility={activeFacility} setActiveFacility={setActiveFacility} />;
    case 'settings': return <SettingsView t={t} user={user} invitations={invitations} setInvitations={setInvitations} setMembers={setMembers} navigateTo={navigateTo} members={members} />;
    case 'notifications': return <NotificationsTab t={t} notifications={notifications} />;
    case 'guide': return <GuideView t={t} navigateTo={navigateTo} />;
    case 'disclaimer': return <DisclaimerView t={t} navigateTo={navigateTo} />;
    default: return <HomeView t={t} user={user} navigateTo={navigateTo} />;
  }
}

// --- Specialized Views ---

function TimeCapsuleView({ t, user }: any) {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', createdBy: user.displayName || '', openingDate: '', fileUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'time_capsules'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setCapsules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'time_capsules');
    });
  }, [user.uid]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'time_capsules'), {
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        isOpened: false
      });
      setFormData({ title: '', description: '', createdBy: user.displayName || '', openingDate: '', fileUrl: '' });
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'time_capsules');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, fileUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const shareCapsule = (capsule: any) => {
    const text = `⏳ *Time Capsule: ${capsule.title}*\n\nCreated by: ${capsule.createdBy}\nSet to be opened on: ${format(new Date(capsule.openingDate), 'PPP p')}\n\nPreserved via Family Shaastra.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const isLocked = (date: string) => new Date(date) > new Date();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
           <h2 className="text-4xl font-black font-serif text-slate-900 flex items-center gap-3">
             <Hourglass className="w-10 h-10 text-emerald-600" /> Time Capsule
           </h2>
           <p className="text-slate-500 max-w-xl">
             A digital vault for the future. Lock away memories, messages, or files to be opened by your family on a specific future date.
           </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Package} variant="accent">Create Capsule</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {capsules.map((c) => {
          const locked = isLocked(c.openingDate);
          return (
            <Card key={c.id} className={cn("p-10 space-y-6 flex flex-col items-start transition-all group overflow-hidden relative", locked ? "bg-slate-50 grayscale-[0.5]" : "bg-white border-emerald-100")}>
               <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110", locked ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-emerald-50 border-emerald-100 text-emerald-600")}>
                  {locked ? <Clock3 className="w-8 h-8" /> : <Package className="w-8 h-8" />}
               </div>
               <div className="space-y-4 flex-1 w-full">
                  <div>
                    <h3 className="text-2xl font-black font-serif text-slate-900 mb-1 break-words">{c.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <UserIcon className="w-3 h-3" /> {c.createdBy}
                    </div>
                  </div>
                  
                  <div className={cn("inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", locked ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                    {locked ? `Opens: ${format(new Date(c.openingDate), 'PP')}` : "Available Now"}
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed italic">
                    {locked ? "The contents of this capsule are currently sealed until the appointed time." : c.description}
                  </p>

                  {!locked && c.fileUrl && (
                    <div className="pt-2">
                       <a href={c.fileUrl} download={c.title} className="text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
                         <Download className="w-4 h-4" /> Download Attached File
                       </a>
                    </div>
                  )}
               </div>
               <div className="flex gap-2 w-full pt-4">
                 <Button variant="secondary" className="flex-1 py-4 !rounded-2xl" onClick={() => shareCapsule(c)} icon={Share2}>Share</Button>
                 <button onClick={async () => { if(confirm('Delete this capsule?')) await deleteDoc(doc(db, 'time_capsules', c.id)) }} className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100 transition-colors">
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
               
               {locked && (
                 <div className="absolute top-4 right-4 animate-pulse">
                   <Shield className="w-6 h-6 text-slate-300" />
                 </div>
               )}
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Time Capsule">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Capsule Title</label>
             <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. My message to my future kids" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Created By</label>
               <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.createdBy} onChange={e => setFormData({...formData, createdBy: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Opening Date & Time</label>
               <input type="datetime-local" required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.openingDate} onChange={e => setFormData({...formData, openingDate: e.target.value})} />
             </div>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Message Description</label>
             <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold min-h-[120px] outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Write the heart of your message here..." />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Upload Files (Photos, Docs, etc.)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 transition-all bg-slate-50/50"
              >
                {formData.fileUrl ? (
                  <div className="text-emerald-600 font-bold flex items-center gap-2"><Check className="w-6 h-6" /> File Attached</div>
                ) : (
                  <div className="text-slate-400 font-bold flex flex-col items-center gap-1">
                    <Plus className="w-8 h-8 opacity-40" />
                    <span className="text-xs">Drag and drop or click to upload</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
           </div>
           <Button className="w-full py-6 rounded-3xl shadow-xl shadow-emerald-900/10" icon={Hourglass}>Seal Capsule</Button>
        </form>
      </Modal>
    </div>
  );
}

function EventPlannerView({ t, user }: any) {
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', date: '', location: '', description: '', status: 'planning', organizer: user.displayName || '' });

  useEffect(() => {
    const q = query(collection(db, 'events'), where('userId', '==', user.uid), orderBy('date', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'events');
    });
  }, [user.uid]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), { ...formData, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'events'), { ...formData, userId: user.uid, createdAt: new Date().toISOString() });
      }
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'events');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', location: '', description: '', status: 'planning', organizer: user.displayName || '' });
    setEditingEvent(null);
    setIsModalOpen(false);
  };

  const handleShare = (ev: any) => {
    const text = `📅 *Family Event: ${ev.title}*\n\nStatus: ${ev.status.toUpperCase()}\nDate: ${format(new Date(ev.date), 'PPP p')}\nLocation: ${ev.location}\nOrganizer: ${ev.organizer}\n\nDescription: ${ev.description}\n\nShared via Family Shaastra.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const deleteEvent = async (id: string) => {
    if (confirm('Permanently cancel and delete this event?')) await deleteDoc(doc(db, 'events', id));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
           <h2 className="text-4xl font-black font-serif text-slate-900 flex items-center gap-3">
             <CalendarDays className="w-10 h-10 text-emerald-600" /> Event Planner
           </h2>
           <p className="text-slate-500 max-w-xl">Professional coordination for family reunions, weddings, and milestones. Plan, execute, and share with precision.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>New Event</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-4 border-l-4 border-emerald-500">Upcoming Lineup</h3>
           <div className="space-y-4">
              {events.map((ev) => (
                <Card key={ev.id} className="p-8 flex flex-col md:flex-row gap-6 group hover:border-emerald-200 transition-all">
                   <div className="w-24 h-24 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
                      <span className="text-[10px] font-black text-emerald-600 uppercase mb-1">{format(new Date(ev.date), 'MMM')}</span>
                      <span className="text-3xl font-black text-slate-900">{format(new Date(ev.date), 'dd')}</span>
                   </div>
                   <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                         <div>
                            <h4 className="text-xl font-bold text-slate-900 break-words">{ev.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                 <MapPin className="w-3 h-3 text-emerald-500" /> {ev.location}
                               </div>
                               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                 <Clock3 className="w-3 h-3 text-amber-500" /> {format(new Date(ev.date), 'p')}
                               </div>
                            </div>
                         </div>
                         <div className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                           ev.status === 'planning' ? "bg-blue-50 text-blue-600" :
                           ev.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" :
                           ev.status === 'executed' ? "bg-slate-50 text-slate-600" : "bg-red-50 text-red-600"
                         )}>
                           {ev.status}
                         </div>
                      </div>
                      <p className="text-slate-500 text-sm break-words leading-relaxed">{ev.description}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                         {ev.status !== 'executed' && (
                           <button onClick={async () => await updateDoc(doc(db, 'events', ev.id), { status: 'executed' })} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2">
                             <Check className="w-4 h-4" /> Execute
                           </button>
                         )}
                         <button onClick={() => { setEditingEvent(ev); setFormData({...ev}); setIsModalOpen(true); }} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 transition-all" title="Edit Event"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => deleteEvent(ev.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 transition-all" title="Delete Event"><Trash2 className="w-4 h-4" /></button>
                         <button onClick={() => handleShare(ev)} className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2">
                           <Share2 className="w-4 h-4" /> Share Lineup
                         </button>
                      </div>
                   </div>
                </Card>
              ))}
              {events.length === 0 && (
                <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                   <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold">No events scheduled. Start planning your family reunion!</p>
                </div>
              )}
           </div>
        </div>

        <Card className="p-10 space-y-8 h-fit sticky top-24">
           <h3 className="text-2xl font-black font-serif text-slate-900 leading-tight">Master Planning <br/><span className="text-emerald-600">Workspace</span></h3>
           <div className="space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0"><Check className="w-5 h-5 text-emerald-600" /></div>
                 <div>
                    <h5 className="font-bold text-slate-900">Define Scope</h5>
                    <p className="text-xs text-slate-500">Add titles, dates, and locations for your family to know where to go.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0"><Share2 className="w-5 h-5 text-amber-600" /></div>
                 <div>
                    <h5 className="font-bold text-slate-900">Push to WhatsApp</h5>
                    <p className="text-xs text-slate-500">Every event detail can be instantly shared with family groups.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Hourglass className="w-5 h-5 text-blue-600" /></div>
                 <div>
                    <h5 className="font-bold text-slate-900">Track Progress</h5>
                    <p className="text-xs text-slate-500">Change status from Planning to Confirmed as you book venues.</p>
                 </div>
              </div>
           </div>
           <div className="p-6 bg-slate-900 rounded-3xl text-white">
              <p className="text-xs font-medium text-slate-400 mb-2 italic">Pro Tip</p>
              <p className="text-sm font-bold leading-relaxed">Collaborate by inviting family members as users; they can view the schedule in real-time.</p>
           </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingEvent ? "Edit Family Event" : "Plan New Event"}>
         <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Event Title</label>
               <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. 50th Wedding Anniversary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Date & Time</label>
                  <input type="datetime-local" required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Organizer</label>
                  <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Location / Venue</label>
               <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Grand Heritage Hall" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Details / Itinerary</label>
               <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold min-h-[120px] outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What's happening?" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Current Status</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="planning">🏗️ Planning</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="executed">🏅 Executed</option>
                  <option value="cancelled">❌ Cancelled</option>
               </select>
            </div>
            <Button className="w-full py-6 rounded-3xl shadow-xl" icon={CalendarDays}>{editingEvent ? "Update Event" : "Initiate Event"}</Button>
         </form>
      </Modal>
    </div>
  );
}

// --- Sub-Views ---

function LoginView({ onLogin, t }: any) {
  return (
    <div className="h-screen flex items-center justify-center bg-[#fdfcfb] p-6">
      <div className="flex flex-col items-center gap-12 max-w-lg w-full">
         <div className="scale-[2]">
           <Logo />
         </div>
         <div className="text-center space-y-4">
           <h1 className="text-4xl font-black text-slate-900 font-serif leading-tight">Your Family Legacy Starts Here.</h1>
           <p className="text-lg text-slate-500">Record, connect, and celebrate your heritage in a secure digital space.</p>
         </div>
         <button 
           onClick={onLogin}
           className="w-full py-6 px-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all flex items-center justify-center gap-4 group active:scale-95"
         >
           <Globe className="w-8 h-8 text-emerald-600 group-hover:rotate-12 transition-transform" />
           <span className="text-xl font-black text-slate-800">Continue with Google</span>
         </button>
         <div className="flex gap-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
           <span>Secure</span>
           <span>Private</span>
           <span>Generational</span>
         </div>
      </div>
    </div>
  );
}

function HomeView({ t, user, navigateTo }: any) {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[3rem] bg-emerald-900 p-10 md:p-16 lg:p-20 text-white flex flex-col md:flex-row items-center gap-8 lg:gap-12 overflow-hidden shadow-2xl shadow-emerald-900/20">
        <div className="flex-1 space-y-5 lg:space-y-6 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1.5 bg-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-700"
          >
            A Digital Family Sanctuary
          </motion.div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-serif leading-tight break-words">{t.welcome}</h1>
          <div className="space-y-4 max-w-xl">
            <p className="text-lg text-emerald-50 font-black font-serif italic">"Preserving Your Family Legacy."</p>
            <div className="space-y-2 text-emerald-100/100 text-xs font-medium leading-relaxed">
              <p>• Grow your Family Tree. Plan reunions and events.</p>
              <p>• Save your memories and records safely forever.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="accent" className="px-8 py-4 rounded-2xl text-base shadow-lg" onClick={() => navigateTo('tree')} icon={Users}>Family Tree</Button>
            <Button variant="secondary" className="px-8 py-4 rounded-2xl text-base bg-emerald-800 border-none text-white hover:bg-emerald-700 shadow-lg" onClick={() => navigateTo('memories')} icon={ImageIcon}>Record Memory</Button>
          </div>
        </div>
        
        {/* Fun Interactive Animation */}
        <div className="w-full md:w-1/3 aspect-square relative flex items-center justify-center p-2">
            <div className="absolute inset-0 bg-emerald-800/40 rounded-full blur-[60px] animate-pulse" />
            <motion.div
               animate={{ y: [0, -8, 0], rotate: [0, 0.5, -0.5, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
               className="relative z-10 w-full max-w-[240px] aspect-square bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl flex items-center justify-center group"
            >
               <div className="relative">
                 <Heart className="w-24 h-24 text-amber-400 fill-amber-400 group-hover:scale-105 transition-transform duration-500" />
                 <motion.div 
                   animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-amber-400 blur-2xl opacity-20"
                 />
               </div>

               {/* Orbital Icons */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-0 pointer-events-none"
               >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                    <ImageIcon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                    <Users className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                    <Mic className="w-7 h-7 text-amber-600" />
                  </div>
               </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Quick Links / Guide/Disclaimer */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <Card className="p-10 space-y-4 hover:border-emerald-300 transition-colors">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                 <Info className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black font-serif uppercase tracking-tight">{t.guide}</h3>
            <p className="text-slate-500 leading-relaxed">New here? Learn how to invite family members, record multi-generational memories, and build a beautiful tree legacy.</p>
            <button onClick={() => navigateTo('guide')} className="text-emerald-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 pt-4 hover:translate-x-2 transition-transform">
              Open the Guide <ChevronRight className="w-4 h-4" />
            </button>
         </Card>
         <Card className="p-10 space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                 <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black font-serif uppercase tracking-tight">{t.disclaimer}</h3>
            <p className="text-slate-500 leading-relaxed">Your family data is sacred. Read our transparency pledge regarding your digital heritage and privacy.</p>
            <button onClick={() => navigateTo('disclaimer')} className="text-amber-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 pt-4 hover:translate-x-2 transition-transform">
              Legal Info <ChevronRight className="w-4 h-4" />
            </button>
         </Card>
         <Card className="p-10 space-y-4 bg-slate-900 text-white relative overflow-hidden">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                 <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black font-serif uppercase tracking-tight">Family Events</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Organize reunions, birthdays, and milestones with our professional event planner.</p>
            <Button variant="accent" className="w-full mt-4 !rounded-2xl" onClick={() => navigateTo('events')}>Plan Now</Button>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 blur-2xl rounded-full" />
         </Card>
         <Card className="p-10 space-y-4 bg-emerald-700 text-white relative overflow-hidden">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                 <Hourglass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black font-serif uppercase tracking-tight">Future Legacy</h3>
            <p className="text-emerald-100/70 leading-relaxed text-sm">Seal a digital time capsule today, for your family to discover in the years to come.</p>
            <Button variant="secondary" className="w-full mt-4 !rounded-2xl bg-white/20 border-none text-white hover:bg-white/30" onClick={() => navigateTo('capsule')}>Seal Capsule</Button>
         </Card>
      </section>
    </div>
  );
}

function FamilyTreeView({ t, members, setMembers, user }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', relation: '', description: '', photoUrl: '', parentId: '', connectionType: 'child' });
  const [editingMember, setEditingMember] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMember = async (e: any) => {
    e.preventDefault();
    let finalParentId = formData.parentId;

    if (formData.parentId && !editingMember) {
      if (formData.connectionType === 'sibling') {
        const targetMember = members.find((m: any) => m.id === formData.parentId);
        finalParentId = targetMember?.parentId || '';
      } else if (formData.connectionType === 'parent') {
        const newMemberRef = await addDoc(collection(db, 'family_members'), {
          ...formData,
          parentId: '', 
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        await updateDoc(doc(db, 'family_members', formData.parentId), {
          parentId: newMemberRef.id
        });
        resetForm();
        return;
      }
    }

    if (editingMember) {
      await updateDoc(doc(db, 'family_members', editingMember.id), {
        name: formData.name,
        relation: formData.relation,
        description: formData.description,
        photoUrl: formData.photoUrl,
        parentId: finalParentId
      });
    } else {
      await addDoc(collection(db, 'family_members'), {
        ...formData,
        parentId: finalParentId,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', relation: '', description: '', photoUrl: '', parentId: '', connectionType: 'child' });
    setEditingMember(null);
    setIsModalOpen(false);
  };

  const startEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relation: member.relation,
      description: member.description || '',
      photoUrl: member.photoUrl || '',
      parentId: member.parentId || '',
      connectionType: 'child'
    });
    setIsModalOpen(true);
  };

  const renderRecursiveTree = (parentId: string | null = null, level = 0) => {
    const list = members.filter((m: FamilyMember) => m.parentId === parentId || (!parentId && !m.parentId && members.every((prev: FamilyMember) => prev.id !== m.parentId)));
    const displayList = level === 0 && list.length === 0 ? members.filter((m: any) => !m.parentId) : list;

    return (
      <div className={cn("flex flex-wrap justify-center gap-8 pt-6", level > 0 ? "relative" : "")}>
        {displayList.map((member: any) => (
          <div key={member.id} className="flex flex-col items-center gap-8 group">
            <motion.div 
               className="tree-node-enter relative"
               whileHover={{ y: -3 }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full border-4 border-emerald-100 shadow-lg overflow-hidden p-1 flex items-center justify-center cursor-pointer group-hover:border-emerald-500 transition-all">
                {member.photoUrl ? (
                  <img src={member.photoUrl} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                   <button onClick={() => startEdit(member)} className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
                     <Edit2 className="w-4 h-4 text-emerald-600" />
                   </button>
                   <button onClick={() => {
                     const text = `🌳 *Family Lineage: ${member.name}*\nRelation: ${member.relation}\nNotes: ${member.description || 'N/A'}\n\nShared via Family Shaastra.`;
                     window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                   }} className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
                     <Share2 className="w-4 h-4 text-emerald-600" />
                   </button>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 bg-white border border-slate-100 rounded-xl shadow-md p-2 text-center transition-all group-hover:shadow-lg z-20">
                <h4 className="font-bold text-slate-900 truncate text-sm">{member.name}</h4>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{member.relation}</p>
                {member.description && <p className="hidden group-hover:block text-[8px] text-slate-400 italic mt-0.5">{member.description}</p>}
              </div>
              
              {/* Connector Line */}
              {members.some((m: any) => m.parentId === member.id) && (
                <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-emerald-100 -translate-x-1/2 -z-10" />
              )}
            </motion.div>
            
            {/* Render Children */}
            {renderRecursiveTree(member.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black font-serif text-slate-900">{t.familyTree}</h2>
           <p className="text-slate-500 text-sm italic">"Family in an app" — Map your roots.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle} className="py-3 px-6 text-sm">Add Member</Button>
      </div>

      <div className="pb-10 flex justify-center w-full overflow-hidden">
        <div className="w-full px-4 py-8">
          {members.length > 0 ? (
             <div className="origin-top scale-[0.7] sm:scale-80 md:scale-90 lg:scale-100 transition-transform">
               {renderRecursiveTree()}
             </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
               <Users className="w-16 h-16 opacity-20" />
               <p className="text-lg font-bold">Start your tree.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingMember ? "Edit Family Member" : "Define Family Member"}>
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Member Name</label>
               <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Relation Label</label>
               <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm" placeholder="e.g. Sister, Father" value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Connect To</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm appearance-none" value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} >
                  <option value="">(Root Node)</option>
                  {members.map((m: FamilyMember) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Connection Type</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm appearance-none" value={formData.connectionType} onChange={e => setFormData({...formData, connectionType: e.target.value})} >
                  <option value="child">Child of</option>
                  <option value="sibling">Sibling of</option>
                  <option value="parent">Parent of</option>
                </select>
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Short Description</label>
             <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm" placeholder="A brief legacy note..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Upload Photo</label>
             <div onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                {formData.photoUrl ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs"><Check className="w-4 h-4" /> Photo Attached</div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 text-slate-300 group-hover:text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400">Choose from device</span>
                  </div>
                )}
             </div>
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
          </div>

          <Button className="w-full py-4 rounded-2xl text-base" icon={Check}>Add Member</Button>
        </form>
      </Modal>
    </div>
  );
}

function MemoriesView({ t, memories, setMemories, user, members }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ title: '', date: format(new Date(), 'yyyy-MM-dd'), description: '', fileUrl: '' });
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    await addDoc(collection(db, 'memories'), {
      ...formData,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
    setFormData({ title: '', date: format(new Date(), 'yyyy-MM-dd'), description: '', fileUrl: '' });
    setIsModalOpen(false);
  };

  const filteredMemories = memories.filter((m: any) => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const exportDoc = async () => {
    const docObj = new Document({
      sections: [{
        children: memories.map((m: Memory) => new Paragraph({
          children: [
            new TextRun({ text: m.title, bold: true, size: 28 }),
            new TextRun({ text: `\nDate: ${m.date}\n`, italics: true }),
            new TextRun({ text: m.description }),
          ],
        }))
      }]
    });
    const blob = await Packer.toBlob(docObj);
    saveAs(blob, 'Family_Memories.docx');
  };

  const copyAsMessage = (m: any) => {
    const text = `Heritage Shared: ${m.title}\nDate: ${m.date}\n\n${m.description}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const shareWhatsapp = (m: any) => {
    const text = `Heritage Shared: ${m.title}\nDate: ${m.date}\n\n${m.description}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black font-serif text-slate-900">{t.memories}</h2>
           <p className="text-slate-500">Every moment is a treasure for the future.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="secondary" onClick={exportDoc} icon={Download}>{t.exportWord}</Button>
           <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>{t.recordMemory}</Button>
        </div>
      </div>

      <div className="relative">
         <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
         <input 
           className="w-full bg-white border border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-lg"
           placeholder="Search family events, names, or stories..."
           value={search}
           onChange={e => setSearch(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMemories.map((m: any) => (
          <Card key={m.id} className="group hover:border-emerald-200 transition-all flex flex-col h-full">
            <div className="aspect-video bg-slate-50 relative overflow-hidden">
               {m.fileUrl ? (
                  <img src={m.fileUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center">
                     <ImageIcon className="w-16 h-16 text-slate-200" />
                  </div>
               )}
               <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">
                  {m.date}
               </div>
            </div>
            <div className="p-8 space-y-4 flex-1">
               <h3 className="text-2xl font-black font-serif text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight break-words">{m.title}</h3>
               <p className="text-slate-500 break-words leading-relaxed text-sm">{m.description}</p>
            </div>
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
               <div className="flex gap-2">
                  <button onClick={() => copyAsMessage(m)} className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all" title="Copy Message">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => shareWhatsapp(m)} className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all" title="Share WhatsApp">
                    <Share2 className="w-4 h-4" />
                  </button>
               </div>
               <button className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 hover:translate-x-1 transition-transform">
                 Read Full <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Memory">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
              <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
           </div>
           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Story Overview</label>
              <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold min-h-[120px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
           </div>
           <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Media (Photos, Video, Audio, PDF, Docs)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
              >
                {formData.fileUrl ? (
                  <div className="flex items-center gap-3 text-emerald-600 font-bold">
                    <Check className="w-6 h-6" /> File Attached
                  </div>
                ) : (
                  <>
                    <PlusCircle className="w-8 h-8 text-slate-300 group-hover:text-emerald-500" />
                    <span className="text-sm font-bold text-slate-400">Click to choose a file from your device</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
           </div>
           <Button className="w-full py-5 rounded-3xl" icon={Heart}>Preserve Memory</Button>
        </form>
      </Modal>
    </div>
  );
}

function TimelineView({ t, memories }: any) {
  return (
    <div className="space-y-10 px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black font-serif text-slate-900">{t.timeline}</h2>
           <p className="text-slate-500 text-sm italic">The journey of your family recorded.</p>
        </div>
      </div>

      <div className="relative">
        {/* Central Line */}
        <div className="hidden lg:block absolute h-0.5 top-1/2 left-0 right-0 bg-emerald-100 -z-10" />
        
        <div className="flex flex-wrap gap-8 pb-12 justify-center">
          {memories.length > 0 ? (
            memories.sort((a: Memory, b: Memory) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((m: Memory, i: number) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative shrink-0"
              >
                 <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-emerald-400 transition-all hover:shadow-lg w-72 md:w-80 relative group">
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 bg-emerald-50 inline-block px-3 py-1 rounded-full">{m.date}</div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 break-words">{m.title}</h3>
                    <p className="text-slate-500 text-xs break-words mb-4 leading-relaxed">{m.description}</p>
                    <button 
                      onClick={() => {
                        const text = `⏳ *Heritage Milestone: ${m.title}*\nDate: ${m.date}\n\n${m.description}\n\nPreserved via Family Shaastra.`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="absolute top-6 right-6 p-2 bg-emerald-50 text-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                 </div>
                 {/* Connection Dot */}
                 <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-md" />
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center w-full text-slate-300">No events recorded in your timeline yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolboxView({ t, facilities, user, setFacilities, activeFacility, setActiveFacility }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', content: '' });

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'facilities'), {
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setFormData({ title: '', description: '', content: '' });
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'facilities');
    }
  };

  const handleUpdateContent = async (id: string, newContent: string) => {
    try {
      await updateDoc(doc(db, 'facilities', id), {
        content: newContent,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `facilities/${id}`);
    }
  };

  if (activeFacility) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveFacility(null)} className="p-3 hover:bg-slate-100 rounded-2xl">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <div>
            <h2 className="text-3xl font-black font-serif text-slate-900">{activeFacility.title}</h2>
            <p className="text-slate-500">{activeFacility.description}</p>
          </div>
        </div>
        <Card className="p-0 overflow-hidden border-2 border-emerald-100 shadow-xl">
          <textarea 
            className="w-full min-h-[500px] bg-white outline-none font-medium leading-relaxed resize-none p-10 text-slate-700 text-lg"
            placeholder="Start drafting your family plans, recipes, or logs here..."
            defaultValue={activeFacility.content || ''}
            onBlur={(e) => handleUpdateContent(activeFacility.id, e.target.value)}
          />
          <div className="bg-slate-50 px-8 py-4 text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2 border-t border-slate-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             Private Workspace • Saves automatically
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
           <h2 className="text-4xl font-black font-serif text-slate-900">Toolbox</h2>
           <p className="text-slate-500">Add your own tools for recipes, event plans, or secrets.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>{t.createFacility}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facilities.map((f: CustomFacility) => (
          <Card key={f.id} className="p-10 space-y-6 flex flex-col items-start bg-emerald-50/10 hover:border-emerald-200 transition-all group relative overflow-hidden">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm transition-transform group-hover:scale-110 shadow-emerald-600/5">
                <LayoutGrid className="w-8 h-8 text-emerald-600" />
             </div>
             <div className="space-y-2 flex-1">
                <h3 className="text-2xl font-black font-serif text-slate-900 break-words">{f.title}</h3>
                <p className="text-slate-500 break-words leading-relaxed">{f.description}</p>
                <button onClick={() => {
                   const text = `🛠️ *Family Tool: ${f.title}*\nContext: ${f.description}\n\nAccess yours in Family Shaastra.`;
                   window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                 }} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mt-2">
                  <Share2 className="w-3 h-3" /> Share Tool
                </button>
             </div>
             <Button variant="secondary" className="w-full py-4 !rounded-2xl" onClick={() => setActiveFacility(f)}>Open Tool</Button>
          </Card>
        ))}
        {facilities.length === 0 && (
          <div 
            onClick={() => setIsModalOpen(true)}
            className="col-span-full py-32 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
          >
             <LayoutGrid className="w-20 h-20 text-slate-200 group-hover:text-emerald-200" />
             <div className="text-center">
               <p className="text-xl font-black text-slate-300">Toolbox is empty.</p>
               <p className="text-sm text-slate-400 font-bold">Add a tool for recipes, health, or reunions.</p>
             </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Tool">
        <form onSubmit={handleCreate} className="space-y-6">
           <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Tool Name</label>
              <input required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Grandma's Secret Recipes" />
           </div>
           <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">What is it for?</label>
              <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-bold min-h-[120px] focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short description..." />
           </div>
           <Button className="w-full py-6 rounded-3xl shadow-2xl shadow-emerald-600/30" icon={PlusCircle}>Add to Toolbox</Button>
        </form>
      </Modal>
    </div>
  );
}

function SettingsView({ t, user, invitations, setInvitations, setMembers, navigateTo, members }: any) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ recipientName: '', recipientEmail: '' });

  const handleSendInvite = async (e: any) => {
    e.preventDefault();
    const standardMessage = `Hello ${inviteData.recipientName},\n\n${user.displayName} has invited you to join their Family. Come to Family Shaastra.\n\n"Family in an app"`;
    
    await addDoc(collection(db, 'invitations'), {
      ...inviteData,
      senderId: user.uid,
      senderName: user.displayName,
      message: standardMessage,
      status: 'pending',
      sentAt: new Date().toISOString()
    });

    const mailtoUrl = `mailto:${inviteData.recipientEmail}?subject=${encodeURIComponent('A Special Invitation from Your Family')}&body=${encodeURIComponent(standardMessage)}`;
    window.location.href = mailtoUrl;

    setInviteData({ recipientName: '', recipientEmail: '' });
    setIsInviteOpen(false);
  };

  const deleteMember = async (id: string) => {
    if (confirm("Are you sure you want to remove this member from the digital lineage?")) {
      await deleteDoc(doc(db, 'family_members', id));
    }
  };

  const acceptInvite = async (invite: any) => {
    try {
      await updateDoc(doc(db, 'invitations', invite.id), { status: 'accepted' });
      await addDoc(collection(db, 'family_members'), {
        userId: user.uid,
        name: invite.senderName,
        relation: 'Connected Family',
        description: `Linked via invitation from ${invite.senderName}`,
        createdAt: new Date().toISOString()
      });
      alert(`Invitation from ${invite.senderName} accepted! They have been added to your lineage.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="text-3xl font-black font-serif text-slate-900">{t.settings}</h2>
        <p className="text-slate-500 text-sm">Sophisticated Family & Invitation Management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="space-y-8">
           <Card className="bg-emerald-900 text-white p-6 md:p-10 relative overflow-hidden border-none shadow-2xl">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-1 bg-amber-400 rounded-full" />
                <h3 className="text-3xl font-black font-serif leading-tight">Grow Your Heritage.</h3>
                <p className="text-sm text-emerald-100/60 font-medium leading-relaxed">
                  Bring your descendants and ancestors into the "Family in an app" experience. Send sophisticated invites.
                </p>
                <div className="pt-2">
                  <Button variant="accent" className="px-10 py-4 rounded-2xl text-sm font-black shadow-xl" onClick={() => setIsInviteOpen(true)} icon={Mail}>Craft Invitation</Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <Mail className="w-64 h-64 -rotate-12" />
              </div>
           </Card>

           {invitations.some((i: any) => i.status === 'pending') && (
             <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Incoming Requests</h4>
               <div className="space-y-3">
                  {invitations.filter((i: any) => i.status === 'pending').map((invite: any) => (
                    <Card key={invite.id} className="p-6 bg-amber-50/30 border-amber-100/50 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                             <Mail className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 text-sm break-words">{invite.senderName}</p>
                             <p className="text-[10px] text-slate-500 font-medium break-words">Invited you to connect</p>
                          </div>
                       </div>
                       <Button variant="accent" className="text-xs py-2 px-4 shadow-none" onClick={() => acceptInvite(invite)}>Accept</Button>
                    </Card>
                  ))}
               </div>
             </div>
           )}

           <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Manage Lineage</h4>
                 <button onClick={() => setIsManageOpen(true)} className="text-[10px] font-black text-emerald-600 uppercase border-b border-emerald-600">View All Members</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {members.slice(0, 3).map((m: any) => (
                  <Card key={m.id} className="p-4 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                          {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 m-2.5 text-slate-300" />}
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 text-sm break-words">{m.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest break-words">{m.relation}</p>
                       </div>
                    </div>
                    <button onClick={() => deleteMember(m.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                ))}
                {members.length > 3 && <p className="text-center text-[10px] text-slate-400 font-bold italic">And {members.length - 3} more members...</p>}
              </div>
           </div>
        </section>

        <section className="space-y-8">
           <Card className="p-10 space-y-8 bg-white border border-slate-100 shadow-xl">
              <div className="flex items-center gap-6">
                <img src={user.photoURL || ''} alt="" className="w-20 h-20 rounded-[2rem] border-4 border-slate-50 shadow-inner" />
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black font-serif text-slate-900 leading-none break-words">{user.displayName}</h3>
                  <p className="text-slate-400 text-sm font-bold break-all">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1.5 font-bold text-sm">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <Globe className="w-5 h-5 text-emerald-600" />
                       <span className="text-slate-700">App Language</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-slate-100 uppercase">English</span>
                 </div>
                 
                 <div onClick={() => navigateTo('notifications')} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <Bell className="w-5 h-5 text-amber-500" />
                       <span className="text-slate-700">System Notifications</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                 </div>
              </div>

              <Button variant="danger" className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-base" onClick={() => auth.signOut()} icon={LogOut}>
                Sign Out
              </Button>
           </Card>

           <Card className="p-8 bg-slate-950 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-3">
                 <Shield className="w-6 h-6 text-emerald-400" />
                 <h4 className="text-xl font-black font-serif">Family Data Sanctuary</h4>
                 <p className="text-slate-400 text-[10px] leading-relaxed">No AI operations. No data selling. Pure heritage preservation in the most secure digital vault available.</p>
              </div>
           </Card>
        </section>
      </div>

      {/* Invitations Management Modal */}
      <Modal isOpen={isManageOpen} onClose={() => setIsManageOpen(false)} title="Sophisticated Member Management">
         <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-3">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Family Lineage</h5>
               <div className="grid grid-cols-1 gap-3">
                  {members.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-4">
                          <img src={m.photoUrl || 'https://picsum.photos/seed/user/100/100'} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div>
                             <p className="font-bold text-slate-900">{m.name}</p>
                             <p className="text-[9px] text-emerald-600 font-black uppercase">{m.relation}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => deleteMember(m.id)} className="p-3 bg-white text-slate-300 hover:text-red-500 rounded-xl border border-slate-100 transition-colors shadow-sm">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="space-y-3">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past Invitations Archive</h5>
               <div className="grid grid-cols-1 gap-3">
                  {invitations.map((i: any) => (
                    <div key={i.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="font-bold text-sm text-slate-900">{i.recipientName}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{i.recipientEmail}</p>
                       </div>
                       <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase", 
                          i.status === 'accepted' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                       )}>
                          {i.status}
                       </span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
         <div className="pt-6 border-t border-slate-100">
            <Button className="w-full py-4 rounded-2xl" variant="secondary" onClick={() => setIsManageOpen(false)}>Close Management</Button>
         </div>
      </Modal>

      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Newsletter Invitation">
         <form onSubmit={handleSendInvite} className="space-y-6">
            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 text-center space-y-3">
               <div className="inline-flex flex-col items-center"><Logo /></div>
               <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed px-4">
                 "Family in an app. Our roots run deep. We invite you to join us in documenting every victory for the generations to come."
               </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 block">Recipient Name</label>
                 <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm" value={inviteData.recipientName} onChange={e => setInviteData({...inviteData, recipientName: e.target.value})} placeholder="Shared Heritage Recipient Name" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 block">Email Address</label>
                 <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm" value={inviteData.recipientEmail} onChange={e => setInviteData({...inviteData, recipientEmail: e.target.value})} placeholder="email@family.com" />
               </div>
            </div>
            <Button className="w-full py-5 rounded-3xl shadow-xl" icon={Share2}>Send Invitation</Button>
         </form>
      </Modal>
    </div>
  );
}

function NotificationsTab({ t, notifications }: any) {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
        <h2 className="text-4xl font-black font-serif text-slate-900">System Notifications</h2>
        <div className="space-y-4">
           {notifications.length > 0 ? notifications.map((n: any) => (
             <Card key={n.id} className="p-8 flex gap-6 items-start hover:border-emerald-200 transition-all">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                   <Bell className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                   <h4 className="font-bold text-slate-900 leading-tight break-words">{n.title}</h4>
                   <p className="text-slate-500 text-sm break-words">{n.body}</p>
                   <p className="text-[10px] font-black text-slate-300 uppercase pt-2">
                     {format(new Date(n.date), 'MMM dd, HH:mm')}
                   </p>
                </div>
             </Card>
           )) : (
             <div className="py-20 text-center text-slate-300">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p>No new notifications at this moment.</p>
             </div>
           )}
        </div>
    </div>
  );
}

function GuideView({ t, navigateTo }: any) {
  const steps = [
    { title: 'Invite Your Family', desc: 'Securely invite relatives via official newsletters to contribute to your lineage.', icon: Mail },
    { title: 'Record Memories', desc: 'Upload photos, audio, and documents to preserve stories that last forever.', icon: Camera },
    { title: 'Build the Tree', desc: 'Construct a visual map of your ancestors and descendants.', icon: Users },
    { title: 'Custom Facilities', desc: 'Create private tools like recipe logs or health diaries for your family nodes.', icon: LayoutGrid }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigateTo('home')} className="p-3 hover:bg-slate-100 rounded-2xl"><ArrowLeft /></button>
        <h2 className="text-4xl font-black font-serif text-slate-900">User Guide</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, idx) => (
          <Card key={idx} className="p-10 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <step.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">{step.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DisclaimerView({ t, navigateTo }: any) {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigateTo('home')} className="p-3 hover:bg-slate-100 rounded-2xl"><ArrowLeft /></button>
        <h2 className="text-4xl font-black font-serif text-slate-900">Legal Disclaimer</h2>
      </div>
      <Card className="p-12 space-y-8 prose prose-slate max-w-none">
        <div className="space-y-4">
          <h3 className="text-2xl font-black font-serif text-slate-900">Privacy & Heritage</h3>
          <p className="text-slate-500 font-medium">Family Shaastra is designed as a personal, private archive. Your data remains yours. We do not use AI to process, crawl, or analyze your family memories. Your legacy is kept in a secure vault meant only for your invited circle.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black font-serif text-slate-900">Data Integrity</h3>
          <p className="text-slate-500 font-medium">While we provide secure storage via Google Cloud infrastructure, users are encouraged to maintain their own backups. We are not liable for accidental data loss or unauthorized access resulting from compromised user credentials.</p>
        </div>
      </Card>
    </div>
  );
}
