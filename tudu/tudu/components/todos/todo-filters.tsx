'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TodoFiltersProps {
  filters: {
    category?: string;
    priority?: string;
    includeOldCompleted?: boolean;
  };
  onFilterChange: (filters: any) => void;
}

export function TodoFilters({ filters, onFilterChange }: TodoFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    'work',
    'personal',
    'shopping',
    'health',
    'finance',
    'home',
    'education',
    'social',
    'other',
  ];

  const priorities = ['high', 'medium', 'low', 'none'];

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      category: value === 'all' ? undefined : value,
    });
  };

  const handlePriorityChange = (value: string) => {
    onFilterChange({
      ...filters,
      priority: value === 'all' ? undefined : value,
    });
  };

  const toggleOldCompleted = () => {
    onFilterChange({
      ...filters,
      includeOldCompleted: !filters.includeOldCompleted,
    });
  };

  const activeFilterCount = [
    filters.category,
    filters.priority,
    filters.includeOldCompleted,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    onFilterChange({});
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile: Filter Button */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop: Inline Filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters:
        </div>

        <Select
          value={filters.category || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || 'all'}
          onValueChange={handlePriorityChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((pri) => (
              <SelectItem key={pri} value={pri}>
                {pri.charAt(0).toUpperCase() + pri.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={filters.includeOldCompleted ? 'default' : 'outline'}
          size="sm"
          onClick={toggleOldCompleted}
        >
          {filters.includeOldCompleted ? 'Showing All' : 'Hide Old Completed'}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Mobile: Filter Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <div className="max-h-[85vh] overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Todos
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Category
                </label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Priority
                </label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((pri) => (
                      <SelectItem key={pri} value={pri}>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  variant={filters.includeOldCompleted ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleOldCompleted}
                  className="w-full"
                >
                  {filters.includeOldCompleted
                    ? 'Showing All Completed'
                    : 'Hide Old Completed'}
                </Button>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-muted-foreground"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
