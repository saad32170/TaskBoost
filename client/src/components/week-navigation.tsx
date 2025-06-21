import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type WeekView = 'last' | 'current' | 'next';

interface WeekNavigationProps {
  currentWeek: WeekView;
  onWeekChange: (week: WeekView) => void;
}

export default function WeekNavigation({ currentWeek, onWeekChange }: WeekNavigationProps) {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <Button
        variant={currentWeek === 'last' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onWeekChange('last')}
        className="text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Last Week
      </Button>
      
      <Button
        variant={currentWeek === 'current' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onWeekChange('current')}
        className="text-sm bg-primary text-white hover:bg-green-600"
      >
        This Week
      </Button>
      
      <Button
        variant={currentWeek === 'next' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onWeekChange('next')}
        className="text-sm"
      >
        Next Week
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
