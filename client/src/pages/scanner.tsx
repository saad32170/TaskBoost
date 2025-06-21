import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, Upload, Loader2, CheckCircle, Edit3, ArrowLeft, Clock, Save } from "lucide-react";

interface ExtractedTask {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  estimatedHours?: number;
  suggestedDeadline?: string;
}

export default function Scanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<ExtractedTask | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);


  const scanImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/scan-image', formData);
      return await response.json();
    },
    onSuccess: (data) => {
      // Extract tasks without saving them automatically and remove auto-descriptions
      const tasks = data.tasks.map((task: any) => ({
        title: task.title,
        priority: task.priority || "medium",
        estimatedHours: task.estimatedHours,
        suggestedDeadline: task.suggestedDeadline
      }));
      setExtractedTasks(tasks);
      setIsProcessing(false);
      toast({
        title: "Tasks extracted successfully!",
        description: `Found ${tasks.length} tasks in your image.`,
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
        description: "Could not extract tasks from the image. Please try again.",
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
        description: "Could not save tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Start processing
      setIsProcessing(true);
      scanImageMutation.mutate(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveTasks = () => {
    if (extractedTasks.length > 0) {
      saveTasksMutation.mutate(extractedTasks);
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Scan Image</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Convert handwritten notes to tasks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 pb-6 space-y-6">
        {/* Photography Tips */}
        <Card className="border-0 shadow-sm bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-lg">💡</span>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Photography Tips</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Ensure good lighting - avoid shadows on the text</li>
                  <li>• Hold your camera parallel to the surface</li>
                  <li>• Make sure all text is clearly visible and in focus</li>
                  <li>• Keep text as straight as possible in the frame</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo Upload */}
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {!previewImage ? (
                  <>
                    <div className="text-4xl mb-3">📸</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Scan Photo
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Capture handwritten notes or documents
                      </p>
                    </div>
                    <Button 
                      onClick={handleCameraClick}
                      disabled={isProcessing}
                      className="w-full h-11 text-base"
                      size="lg"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Take Photo'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Captured note" 
                        className="w-full max-h-32 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="text-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                            <p className="text-xs">Processing...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleCameraClick}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Retake Photo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

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

            <div className="pt-4">
              <Button 
                onClick={handleSaveTasks}
                disabled={saveTasksMutation.isPending}
                className="w-full h-12 text-base"
                size="lg"
              >
                {saveTasksMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving Tasks...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save All Tasks ({extractedTasks.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tips for Best Results</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Ensure good lighting when taking photos</li>
              <li>• Keep text clear and legible</li>
              <li>• Avoid shadows and glare</li>
              <li>• Include the entire note in the frame</li>
            </ul>
          </CardContent>
        </Card>
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
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}