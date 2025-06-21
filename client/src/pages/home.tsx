import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, Calendar, TrendingUp, LogOut, CheckCircle, Clock, Edit3, Trash2, CalendarDays, List, Mic, MicOff } from "lucide-react";

import { format, isAfter, isToday, isTomorrow, startOfWeek, endOfWeek, isSameWeek } from "date-fns";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  estimatedHours?: number;
  dueDate?: string;
  completedAt?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"all" | "week">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    estimatedHours: ""
  });
  


  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest('POST', `/api/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Task completed!",
        description: "Great job! Your tree is growing.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: any }) => {
      return await apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setEditingTask(null);
      toast({
        title: "Task updated",
        description: "Changes saved successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Update failed",
        description: "Could not save changes.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest('DELETE', `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Task deleted",
        description: "Task removed successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Delete failed",
        description: "Could not delete task.",
        variant: "destructive",
      });
    },
  });



  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
      estimatedHours: task.estimatedHours?.toString() || ""
    });
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    
    const updates: any = {
      title: editForm.title,
      description: editForm.description || null,
      priority: editForm.priority,
      estimatedHours: editForm.estimatedHours ? parseInt(editForm.estimatedHours) : null,
    };

    if (editForm.dueDate) {
      updates.dueDate = new Date(editForm.dueDate).toISOString();
    } else {
      updates.dueDate = null;
    }

    updateTaskMutation.mutate({ taskId: editingTask.id, updates });
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    const date = new Date(dueDate);
    if (isAfter(new Date(), date)) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (isToday(date)) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (isTomorrow(date)) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "low": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getFilteredTasks = () => {
    if (!tasks) return { pending: [], completed: [] };
    
    let filteredTasks = tasks as Task[];
    
    if (viewMode === "week") {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
      const saturdayNight = new Date(weekEnd);
      saturdayNight.setHours(23, 59, 59, 999);
      
      filteredTasks = filteredTasks.filter(task => {
        if (task.dueDate) {
          return isSameWeek(new Date(task.dueDate), now, { weekStartsOn: 1 });
        } else {
          // If no due date, assume it's for this week with Saturday night deadline
          return task.status === "pending";
        }
      });
      
      // Add default Saturday night deadline for tasks without due dates
      filteredTasks = filteredTasks.map(task => {
        if (!task.dueDate && task.status === "pending") {
          return { ...task, dueDate: saturdayNight.toISOString() };
        }
        return task;
      });
    }
    
    const pending = filteredTasks.filter(task => task.status === 'pending');
    const completed = filteredTasks.filter(task => task.status === 'completed');
    
    return { pending, completed };
  };

  if (statsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const { pending: pendingTasks, completed: completedTasks } = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile-First Header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">TaskBoost</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hello, {(user as any)?.firstName || 'there'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => window.location.href = '/api/logout'} variant="ghost" size="sm" className="p-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {/* Progress Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.totalCompleted || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.overdueTasks || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.completedThisWeek || 0} tasks done</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {viewMode === "week" ? "This Week" : "All Tasks"} ({pendingTasks.length})
          </h2>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Button
              variant={viewMode === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="rounded-none border-0"
            >
              <List className="w-4 h-4 mr-1" />
              All
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-none border-0"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Week
            </Button>
          </div>
        </div>

        {/* Tasks Section */}
        {pendingTasks.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-4xl">📝</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">No tasks yet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Scan a handwritten note to get started
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task: Task) => (
              <Card key={task.id} className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-5">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0 ${getDueDateColor(task.dueDate)}`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDueDate(task.dueDate)}
                          </Badge>
                        )}
                        {task.estimatedHours && (
                          <Badge variant="outline" className="text-xs px-2 py-0 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                            {task.estimatedHours}h
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => handleEditTask(task)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        disabled={deleteTaskMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        disabled={completeTaskMutation.isPending}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recently Completed */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recently Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map((task: Task) => (
                <Card key={task.id} className="border-0 shadow-sm bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-through">
                          {task.title}
                        </p>
                        {task.completedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Completed {format(new Date(task.completedAt), "MMM d 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setEditForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Hours</label>
                <Input
                  type="number"
                  value={editForm.estimatedHours}
                  onChange={(e) => setEditForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="Hours"
                  min="0"
                  max="24"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button onClick={() => setEditingTask(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={updateTaskMutation.isPending || !editForm.title.trim()}
                className="flex-1"
              >
                {updateTaskMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 safe-area-bottom">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/scanner">
            <Button className="w-full flex items-center justify-center space-x-2 h-12 px-4 bg-green-600 hover:bg-green-700">
              <Camera className="w-5 h-5" />
              <span>Scan Notes</span>
            </Button>
          </Link>
          <Link href="/voice-recorder">
            <Button className="w-full flex items-center justify-center space-x-2 h-12 px-4 bg-purple-600 hover:bg-purple-700">
              <Mic className="w-5 h-5" />
              <span>Voice Record</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            made by{" "}
            <a
              href="https://x.com/saad32170"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              saad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}