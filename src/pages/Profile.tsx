import { useState } from 'react';
import { Edit2, Plus, Award, Calendar, Settings, Moon, Sun, Bell, BellOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { events } from '@/data/mockData';

const Profile = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
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
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        {/* Hero Card */}
        <div className="glass-card p-6 gradient-border">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-glow">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold">{user?.username || 'Student'}</h1>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.programme} • {user?.branch} • {user?.year}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange/20 to-primary/20 text-sm font-semibold">
                  🏆 {user?.points || 0} Points
                </div>
                <div className="px-3 py-1 rounded-full bg-muted text-sm">
                  Batch {user?.passingYear}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Personal Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium">{user?.mobileNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Programme</p>
              <p className="text-sm font-medium">{user?.programme}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="text-sm font-medium">{user?.branch}</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">My Projects</h2>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
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
            <Award className="h-5 w-5" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 rounded-xl bg-muted/50 text-center">
                <span className="text-3xl block mb-2">{achievement.badge}</span>
                <h3 className="font-medium text-sm">{achievement.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event History */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event History
          </h2>
          <Tabs defaultValue="attended" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="attended">Attended</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
            </TabsList>
            <TabsContent value="attended" className="space-y-3 mt-4">
              {attendedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <img src={event.poster} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-xs text-green-500 font-medium">✓ Attended</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <img src={event.poster} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-xs text-accent font-medium">Upcoming</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="missed" className="space-y-3 mt-4">
              {missedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <img src={event.poster} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-xs text-destructive font-medium">Missed</span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Preferences */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <p className="font-medium text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifications ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
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
