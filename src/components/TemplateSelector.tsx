// UAFSAIDA — Template Selector Component
'use client';

import { useState } from 'react';
import { PROJECT_TEMPLATES, getAllCategories, getTemplatesByCategory } from '@/lib/templates';
import { Search, X, ChevronRight } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

export function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getAllCategories();
  const templates = selectedCategory
    ? getTemplatesByCategory(selectedCategory)
    : PROJECT_TEMPLATES;

  const filteredTemplates = searchQuery
    ? templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : templates;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Project Templates</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex">
          {/* Categories */}
          <div className="w-48 border-r p-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
            >
              All Templates
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedCategory === category ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '50vh' }}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelect(template.prompt);
                    onClose();
                  }}
                  className="group flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Use template</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
