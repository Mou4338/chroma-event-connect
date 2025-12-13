import { Edit2, Plus, Award, Calendar, Settings, Moon, Sun, Bell, BellOff, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { events } from '@/data/mockData';
import { useState } from 'react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const achievements = [
    { id: '1', title: 'First Event', description: 'Attended your first event', badge: '🎉', earnedDate: '2024-01-15' },
    { id: '2', title: 'Active Participant', description: 'Attended 5+ events', badge: '⭐', earnedDate: '2024-02-20' },
    { id: '3', title: 'Tech Enthusiast', description: 'Attended 3 tech events', badge: '💻', earnedDate: '2024-03-01' },
  ];

  const projects = [
    { id: '1', title: 'Portfolio Website', description: 'Personal portfolio built with React', link: 'https://example.com' },
  ];

  const attendedEvents = events.slice(0, 2);
  const upcomingEvents = events.slice(2, 4);
  const missedEvents = events.slice(4, 5);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto particles-bg">
        {/* Hero Card */}
        <div className="glass-card p-6 animated-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-glow animate-pulse-slow">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-bold gradient-text">{user?.username || 'Student'}</h1>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.programme} • {user?.branch} • {user?.year}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange/20 to-primary/20 text-sm font-semibold flex items-center gap-1.5 animate-glow">
                    🏆 {user?.points || 0} Points
                  </div>
                  <div className="px-3 py-1 rounded-full bg-muted text-sm">
                    Batch {user?.passingYear}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-accent/20 text-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent" />
                    AI Enhanced
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Personal Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium">{user?.mobileNumber || 'Not provided'}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">Programme</p>
              <p className="text-sm font-medium">{user?.programme}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="text-sm font-medium">{user?.branch}</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">My Projects</h2>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-background/50 transition-colors">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No projects added yet</p>
          )}
        </div>

        {/* Achievements */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-orange" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 rounded-xl bg-muted/30 text-center hover:shadow-elevated transition-all duration-300 group">
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{achievement.badge}</span>
                <h3 className="font-medium text-sm">{achievement.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event History */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Event History
          </h2>
          <Tabs defaultValue="attended" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30">
              <TabsTrigger value="attended" className="data-[state=active]:bg-primary/20">Attended</TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-accent/20">Upcoming</TabsTrigger>
              <TabsTrigger value="missed" className="data-[state=active]:bg-destructive/20">Missed</TabsTrigger>
            </TabsList>
            <TabsContent value="attended" className="space-y-3 mt-4">
              {attendedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <img src={event.poster} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-xs text-green-500 font-medium px-2 py-1 rounded-full bg-green-500/10">✓ Attended</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <img src={event.poster} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-xs text-accent font-medium px-2 py-1 rounded-full bg-accent/10">Upcoming</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="missed" className="space-y-3 mt-4">
              {missedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <img src={event.poster} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-xs text-destructive font-medium px-2 py-1 rounded-full bg-destructive/10">Missed</span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Preferences */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="h-5 w-5 text-secondary" /> : <Sun className="h-5 w-5 text-orange" />}
                <div>
                  <p className="font-medium text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                {notifications ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5" />}
                <div>
                  <p className="font-medium text-sm">Notifications</p>
                  <p className="text-xs text-muted-foreground">Event reminders & updates</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button variant="destructive" className="w-full" onClick={logout}>
          Log Out
        </Button>
      </div>
    </MainLayout>
  );
};

export default Profile;
