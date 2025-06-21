import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Mic, MicOff, Loader2, CheckCircle, Edit3, ArrowLeft, Clock, Save } from "lucide-react";

interface ExtractedTask {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  estimatedHours?: number;
  suggestedDeadline?: string;
}

export default function VoiceRecorder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [editingTask, setEditingTask] = useState<ExtractedTask | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const voiceToTasksMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/voice-to-tasks', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process audio');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Extract tasks without saving them automatically
      const tasks = data.tasks.map((task: any) => ({
        title: task.title,
        priority: task.priority || "medium",
        estimatedHours: task.estimatedHours,
        suggestedDeadline: task.suggestedDeadline
      }));
      setExtractedTasks(tasks);
      setIsProcessing(false);
      toast({
        title: "Voice processed!",
        description: `Found ${tasks.length} tasks in your recording.`,
      });
    },
    onError: (error) => {
      setIsProcessing(false);
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
        title: "Processing failed",
        description: error.message || "Could not extract tasks from the audio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveTasksMutation = useMutation({
    mutationFn: async (tasks: ExtractedTask[]) => {
      const promises = tasks.map(task => 
        apiRequest('POST', '/api/tasks', task)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Tasks saved!",
        description: "All tasks have been added to your list.",
      });
      setLocation('/');
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
        title: "Save failed",
        description: "Could not save tasks.",
        variant: "destructive",
      });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setIsProcessing(true);
        voiceToTasksMutation.mutate(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Speak your tasks and ideas...",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      toast({
        title: "Processing recording...",
        description: "AI is extracting tasks from your voice memo.",
      });
    }
  };

  const handleEditTask = (task: ExtractedTask, index: number) => {
    setEditingTask({ ...task });
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingTask && editingIndex >= 0) {
      const updatedTasks = [...extractedTasks];
      updatedTasks[editingIndex] = editingTask;
      setExtractedTasks(updatedTasks);
      setEditingTask(null);
      setEditingIndex(-1);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Voice Recording</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Speak your tasks and ideas aloud</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 pb-6 space-y-6">
        {/* Recording Tips */}
        <Card className="border-0 shadow-sm bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-lg">💡</span>
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Recording Tips</h3>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Mention tasks one by one: "I need to buy groceries"</li>
                  <li>• Include deadlines: "Submit report by Friday"</li>
                  <li>• Mention priorities: "This is urgent" or "Low priority task"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Recording Interface */}
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎤</div>
              
              {!isRecording && !isProcessing ? (
                <Button 
                  onClick={startRecording}
                  className="w-full h-16 text-lg bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <Mic className="w-6 h-6 mr-3" />
                  Start Recording
                </Button>
              ) : isRecording ? (
                <div className="space-y-4">
                  <div className="animate-pulse text-red-600 text-lg font-medium">
                    Recording... Speak now
                  </div>
                  <Button 
                    onClick={stopRecording}
                    className="w-full h-16 text-lg bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <MicOff className="w-6 h-6 mr-3" />
                    Stop Recording
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-600 dark:text-gray-400">Processing your recording...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Extracted Tasks */}
        {extractedTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Extracted Tasks ({extractedTasks.length})
              </h2>
              <Button
                onClick={() => saveTasksMutation.mutate(extractedTasks)}
                disabled={saveTasksMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveTasksMutation.isPending ? "Saving..." : "Save All"}
              </Button>
            </div>

            <div className="space-y-3">
              {extractedTasks.map((task, index) => (
                <Card key={index} className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-5">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task, index)}
                          className="p-1"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority} priority
                        </Badge>
                        
                        {task.estimatedHours && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.estimatedHours}h
                          </Badge>
                        )}
                        
                        {task.suggestedDeadline && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                            {task.suggestedDeadline}
                          </Badge>
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

      {/* Task Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  placeholder="Task description (optional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value: "low" | "medium" | "high") => 
                      setEditingTask(prev => prev ? ({ ...prev, priority: value }) : null)
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
                    value={editingTask.estimatedHours || ""}
                    onChange={(e) => setEditingTask(prev => prev ? ({ 
                      ...prev, 
                      estimatedHours: e.target.value ? parseInt(e.target.value) : undefined 
                    }) : null)}
                    placeholder="Hours"
                    min="0"
                    max="24"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Suggested Deadline</label>
                <Input
                  value={editingTask.suggestedDeadline || ""}
                  onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, suggestedDeadline: e.target.value }) : null)}
                  placeholder="e.g., tomorrow, next week, Friday"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={() => setEditingTask(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit} 
                  disabled={!editingTask.title.trim()}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        type="file"
        accept="audio/*"
        className="hidden"
      />
    </div>
  );
}