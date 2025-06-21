import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "completed";
    estimatedHours?: number;
    dueDate?: string;
    completedAt?: string;
  };
  onComplete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function TaskItem({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete, 
  showActions = true 
}: TaskItemProps) {
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400';
      case 'medium': return 'border-yellow-400';
      case 'low': return 'border-green-400';
      default: return 'border-gray-400';
    }
  };

  const isOverdue = task.dueDate && task.status === 'pending' && new Date(task.dueDate) < new Date();

  return (
    <div className={`border rounded-xl p-4 hover:border-primary transition-colors ${getPriorityColor(task.priority)} ${task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={() => {
              if (task.status === 'pending' && onComplete) {
                onComplete(task.id);
              }
            }}
            disabled={task.status === 'completed'}
            className="mt-1"
          />
          
          <div className="flex-1">
            <h3 className={`font-medium mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            )}
            
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </Badge>
              
              {task.dueDate && (
                <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </span>
              )}
              
              {task.estimatedHours && (
                <span className="text-gray-500">Est: {task.estimatedHours}h</span>
              )}
              
              {task.status === 'completed' && task.completedAt && (
                <span className="text-green-600 font-medium">
                  ✓ Completed {format(new Date(task.completedAt), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(task.id)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
