import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import WeekNavigation from "@/components/week-navigation";
import Confetti from "@/components/confetti";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

type WeekView = 'last' | 'current' | 'next';

export default function Planner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState<WeekView>('current');
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['/api/tasks/week', currentWeek === 'current' ? undefined : currentWeek],
    retry: false,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest('POST', `/api/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      if (data.celebration) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      toast({
        title: "Task Completed! 🎉",
        description: "Great job! Your tree is growing.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete task: " + error.message,
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400';
      case 'medium': return 'border-yellow-400';
      case 'low': return 'border-green-400';
      default: return 'border-gray-400';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    let baseDate = today;
    
    if (currentWeek === 'last') {
      baseDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (currentWeek === 'next') {
      baseDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getTasksForDay = (day: Date) => {
    if (!weeklyData?.tasks) return [];
    return weeklyData.tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };

  const getTotalTasksForWeek = () => {
    return weeklyData?.tasks?.length || 0;
  };

  const getCompletedTasksForWeek = () => {
    return weeklyData?.tasks?.filter((task: any) => task.status === 'completed').length || 0;
  };

  const getPendingTasksForWeek = () => {
    return weeklyData?.tasks?.filter((task: any) => task.status === 'pending').length || 0;
  };

  const getOverdueTasksForWeek = () => {
    const now = new Date();
    return weeklyData?.tasks?.filter((task: any) => 
      task.status === 'pending' && 
      task.dueDate && 
      new Date(task.dueDate) < now
    ).length || 0;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-primary">🌳 TaskTree</div>
              <nav className="hidden md:flex space-x-8">
                <Button variant="ghost" onClick={() => setLocation('/')}>Home</Button>
                <Button variant="ghost" onClick={() => setLocation('/scanner')}>Scanner</Button>
                <Button variant="ghost" className="text-primary">Planner</Button>
                <Button variant="ghost" onClick={() => setLocation('/progress')}>Progress</Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Planner Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <Calendar className="inline w-8 h-8 mr-2" />
              Weekly Planner
            </h1>
            <p className="text-gray-600">Organize and track your tasks by day</p>
          </div>
          <div className="flex items-center space-x-4">
            <WeekNavigation 
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
            />
            <Button 
              onClick={() => setLocation('/scanner')}
              className="bg-primary text-white hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Week Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const dayName = dayNames[index];
            
            return (
              <Card key={index} className="min-h-[300px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dayName}</h3>
                      <p className="text-sm text-gray-500">{format(day, 'MMM d')}</p>
                    </div>
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{dayTasks.length}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {dayTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">
                        {dayName === 'Saturday' || dayName === 'Sunday' 
                          ? 'Weekend break' 
                          : 'No tasks scheduled'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayTasks.map((task: any) => (
                        <div 
                          key={task.id} 
                          className={`p-3 bg-gray-50 rounded-lg border-l-4 ${getPriorityColor(task.priority)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 flex-1 pr-2">
                              {task.title}
                            </h4>
                            <Checkbox
                              checked={task.status === 'completed'}
                              onCheckedChange={() => {
                                if (task.status === 'pending') {
                                  completeTaskMutation.mutate(task.id);
                                }
                              }}
                              disabled={task.status === 'completed' || completeTaskMutation.isPending}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={getPriorityBadgeVariant(task.priority)}
                                className="text-xs"
                              >
                                {task.priority}
                              </Badge>
                              {task.estimatedHours && (
                                <span className="text-gray-500">{task.estimatedHours}h</span>
                              )}
                            </div>
                            {task.status === 'completed' && (
                              <span className="text-green-600 font-medium">✓ Done</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Week Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Week Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getTotalTasksForWeek()}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getCompletedTasksForWeek()}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{getPendingTasksForWeek()}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{getOverdueTasksForWeek()}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
