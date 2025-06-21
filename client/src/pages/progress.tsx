import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  CheckCircle, 
  Zap, 
  Clock, 
  AlertTriangle,
  Award,
  Target
} from "lucide-react";
import TreeVisualization from "@/components/tree-visualization";

export default function ProgressPage() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  const getTreeLevelProgress = () => {
    const currentLevel = stats?.treeLevel || 1;
    const tasksCompleted = stats?.totalCompleted || 0;
    const tasksForNextLevel = currentLevel * 10; // Each level requires 10 more tasks
    const progressInCurrentLevel = tasksCompleted % tasksForNextLevel;
    const progressPercentage = Math.min((progressInCurrentLevel / tasksForNextLevel) * 100, 100);
    
    return {
      currentLevel,
      progressPercentage,
      tasksForNextLevel: tasksForNextLevel - progressInCurrentLevel,
    };
  };

  const getRecentAchievements = () => {
    const achievements = [];
    
    if ((stats?.completedThisWeek || 0) >= 10) {
      achievements.push({
        icon: "🌟",
        title: "Week Warrior",
        description: "Completed 10+ tasks this week",
        date: "2 days ago"
      });
    }
    
    if ((stats?.currentStreak || 0) >= 7) {
      achievements.push({
        icon: "🔥",
        title: "Streak Master",
        description: `${stats?.currentStreak}-day completion streak`,
        date: "Today"
      });
    }
    
    if ((stats?.totalCompleted || 0) >= 25) {
      achievements.push({
        icon: "📝",
        title: "Scanner Pro",
        description: "Scanned 25 notes successfully",
        date: "1 week ago"
      });
    }
    
    return achievements;
  };

  const getWeeklyProgressData = () => {
    // Mock weekly progress data - in real app, this would come from API
    return [
      { day: 'Mon', completed: 4, total: 5 },
      { day: 'Tue', completed: 3, total: 5 },
      { day: 'Wed', completed: 2, total: 2 },
      { day: 'Thu', completed: 2, total: 5 },
      { day: 'Fri', completed: 3, total: 4 },
    ];
  };

  const treeProgress = getTreeLevelProgress();
  const achievements = getRecentAchievements();
  const weeklyProgress = getWeeklyProgressData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-primary">🌳 TaskTree</div>
              <nav className="hidden md:flex space-x-8">
                <Button variant="ghost" onClick={() => setLocation('/')}>Home</Button>
                <Button variant="ghost" onClick={() => setLocation('/scanner')}>Scanner</Button>
                <Button variant="ghost" onClick={() => setLocation('/planner')}>Planner</Button>
                <Button variant="ghost" className="text-primary">Progress</Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <TrendingUp className="inline w-8 h-8 mr-2" />
            Your Progress
          </h1>
          <p className="text-lg text-gray-600">Watch your productivity tree grow with every completed task</p>
        </div>

        {/* Tree Visualization */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="text-center">
              <TreeVisualization 
                level={stats?.treeLevel || 1}
                completedTasks={stats?.completedThisWeek || 0}
              />
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Level {treeProgress.currentLevel} Productive Oak
                </h2>
                <p className="text-green-600 mb-4">
                  {stats?.completedThisWeek || 0} tasks completed this week
                </p>
                <div className="max-w-md mx-auto">
                  <Progress 
                    value={treeProgress.progressPercentage} 
                    className="h-3 mb-2"
                  />
                  <p className="text-sm text-green-600">
                    {treeProgress.tasksForNextLevel} more tasks to Level {treeProgress.currentLevel + 1}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalCompleted || 0}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
              <div className="text-xs text-green-600 mt-1">
                +{stats?.completedThisWeek || 0} this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
              <div className="text-xs text-accent mt-1">Keep it up!</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">23</div>
              <div className="text-sm text-gray-600">Hours Saved</div>
              <div className="text-xs text-secondary mt-1">Through AI organization</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.overdueTasks || 0}
              </div>
              <div className="text-sm text-gray-600">Overdue Tasks</div>
              <div className="text-xs text-red-600 mt-1">Need attention</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Complete more tasks to unlock achievements!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <div className="text-xs text-gray-500">{achievement.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-16">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <Progress 
                        value={(day.completed / day.total) * 100} 
                        className="h-3"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {day.completed}/{day.total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
