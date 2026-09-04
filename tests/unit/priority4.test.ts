// UAFSAIDA — Priority 4 Feature Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { PROJECT_TEMPLATES, getTemplateById, getTemplatesByCategory, getAllCategories } from '@/lib/templates';
import { useUndoRedoStore } from '@/lib/undo-redo';

describe('Project Templates', () => {
  it('should have 12 templates', () => {
    expect(PROJECT_TEMPLATES.length).toBe(12);
  });

  it('should get template by id', () => {
    const template = getTemplateById('ecommerce');
    expect(template).toBeDefined();
    expect(template?.name).toBe('E-Commerce Store');
  });

  it('should get templates by category', () => {
    const businessTemplates = getTemplatesByCategory('Business');
    expect(businessTemplates.length).toBeGreaterThan(0);
  });

  it('should get all categories', () => {
    const categories = getAllCategories();
    expect(categories).toContain('Business');
    expect(categories).toContain('Education');
    expect(categories).toContain('Personal');
  });

  it('should have valid template structure', () => {
    for (const template of PROJECT_TEMPLATES) {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.prompt).toBeDefined();
      expect(template.features).toBeDefined();
      expect(template.features.length).toBeGreaterThan(0);
      expect(template.complexity).toMatch(/^(simple|moderate|complex)$/);
      expect(template.techStack).toBeDefined();
    }
  });
});

describe('Undo/Redo Store', () => {
  beforeEach(() => {
    useUndoRedoStore.getState().clear();
  });

  it('should push state', () => {
    const state = { files: [], messages: [] };
    useUndoRedoStore.getState().pushState(state, 'Initial state');
    
    expect(useUndoRedoStore.getState().present).toBeDefined();
  });

  it('should undo', () => {
    useUndoRedoStore.getState().pushState({ count: 1 }, 'State 1');
    useUndoRedoStore.getState().pushState({ count: 2 }, 'State 2');
    
    const result = useUndoRedoStore.getState().undo();
    expect(result).toEqual({ count: 1 });
  });

  it('should redo', () => {
    useUndoRedoStore.getState().pushState({ count: 1 }, 'State 1');
    useUndoRedoStore.getState().pushState({ count: 2 }, 'State 2');
    useUndoRedoStore.getState().undo();
    
    const result = useUndoRedoStore.getState().redo();
    expect(result).toEqual({ count: 2 });
  });

  it('should check canUndo', () => {
    expect(useUndoRedoStore.getState().canUndo()).toBe(false);
    useUndoRedoStore.getState().pushState({ count: 1 }, 'State 1');
    useUndoRedoStore.getState().pushState({ count: 2 }, 'State 2');
    expect(useUndoRedoStore.getState().canUndo()).toBe(true);
  });

  it('should check canRedo', () => {
    expect(useUndoRedoStore.getState().canRedo()).toBe(false);
    useUndoRedoStore.getState().pushState({ count: 1 }, 'State 1');
    useUndoRedoStore.getState().pushState({ count: 2 }, 'State 2');
    useUndoRedoStore.getState().undo();
    expect(useUndoRedoStore.getState().canRedo()).toBe(true);
  });

  it('should clear history', () => {
    useUndoRedoStore.getState().pushState({ count: 1 }, 'State 1');
    useUndoRedoStore.getState().clear();
    
    expect(useUndoRedoStore.getState().present).toBeNull();
    expect(useUndoRedoStore.getState().canUndo()).toBe(false);
  });

  it('should get history', () => {
    useUndoRedoStore.getState().pushState({ count: 1 }, 'State 1');
    useUndoRedoStore.getState().pushState({ count: 2 }, 'State 2');
    
    const history = useUndoRedoStore.getState().getHistory();
    expect(history.length).toBe(2);
  });
});
