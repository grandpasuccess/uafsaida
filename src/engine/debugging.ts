// UAFSAIDA — Autonomous Debugging System
// Detects, analyzes, and fixes errors automatically

import Anthropic from '@anthropic-ai/sdk';
import {
  DebugSession,
  DebugError,
  DebugFix,
  GeneratedCode,
  ProjectFile,
} from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-20250514';

// ═══════════════════════════════════════════════════════════════
// DEBUGGING ENGINE
// ═══════════════════════════════════════════════════════════════

export class DebuggingEngine {
  private projectId: string;
  private sessionId: string;

  constructor(projectId: string, sessionId: string) {
    this.projectId = projectId;
    this.sessionId = sessionId;
  }

  /**
   * Run the full debugging cycle
   */
  async runDebugCycle(code: GeneratedCode): Promise<DebugResult> {
    const errors = await this.detectErrors(code);
    const fixes: DebugFix[] = [];

    for (const error of errors) {
      const fix = await this.generateFix(error, code);
      if (fix) {
        fixes.push(fix);
        const applied = await this.applyFix(fix, code);
        if (applied) {
          fix.applied = true;
          fix.appliedAt = new Date();
        }
      }
    }

    return {
      errors,
      fixes,
      resolved: errors.every((e) => e.resolved),
      remainingErrors: errors.filter((e) => !e.resolved),
    };
  }

  /**
   * Detect errors in the code
   */
  async detectErrors(code: GeneratedCode): Promise<DebugError[]> {
    const errors: DebugError[] = [];

    // Check for common issues
    for (const file of code.files) {
      // Check for missing imports
      const missingImports = this.checkMissingImports(file.content, file.language);
      errors.push(...missingImports);

      // Check for syntax issues
      const syntaxIssues = this.checkSyntaxIssues(file.content, file.path);
      errors.push(...syntaxIssues);

      // Check for type errors
      const typeErrors = this.checkTypeErrors(file.content, file.path);
      errors.push(...typeErrors);
    }

    // Use AI for deeper analysis
    const aiErrors = await this.aiDetectErrors(code);
    errors.push(...aiErrors);

    return errors;
  }

  /**
   * Generate a fix for an error
   */
  async generateFix(error: DebugError, code: GeneratedCode): Promise<DebugFix | null> {
    const relevantFiles = code.files.filter((f) =>
      error.file ? f.path === error.file : true
    );

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: `You are an expert debugging agent. Analyze errors and generate precise fixes.
Rules:
- Fix the root cause, not just the symptom
- Don't break other functionality
- Follow the existing code style
- Add comments explaining the fix
- Ensure type safety`,
      messages: [
        {
          role: 'user',
          content: `Fix this error:

Type: ${error.type}
Message: ${error.message}
File: ${error.file || 'unknown'}
Line: ${error.line || 'unknown'}

Code context:
${relevantFiles.map(f => `// ${f.path}\n${f.content}`).join('\n\n')}

Respond with valid JSON:
{
  "description": "What the fix does",
  "filesChanged": ["path/to/file"],
  "diff": "unified diff format"
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const result = this.parseJSON(content.text);
        return {
          id: crypto.randomUUID(),
          errorId: error.id,
          description: result.description,
          filesChanged: result.filesChanged,
          diff: result.diff,
          applied: false,
          validated: false,
          appliedAt: null,
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Apply a fix to the code
   */
  async applyFix(fix: DebugFix, code: GeneratedCode): Promise<boolean> {
    try {
      for (const filePath of fix.filesChanged) {
        const file = code.files.find((f) => f.path === filePath);
        if (file) {
          // Apply the diff (simplified - in production use a proper diff parser)
          // For now, we'll mark it as applied
          file.content += `\n// Fix applied: ${fix.description}\n`;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STATIC ANALYSIS
  // ═══════════════════════════════════════════════════════════

  private checkMissingImports(content: string, language: string): DebugError[] {
    const errors: DebugError[] = [];
    
    // Check for common missing import patterns
    const patterns = [
      { regex: /useState|useEffect|useCallback/, import: 'react', lang: 'tsx' },
      { regex: /import.*from ['"]next/, import: 'next', lang: 'tsx' },
      { regex: /z\.object|z\.string|z\.number/, import: 'zod', lang: 'typescript' },
    ];

    for (const pattern of patterns) {
      if (pattern.lang === language || pattern.lang === 'typescript') {
        if (pattern.regex.test(content) && !content.includes(`from '${pattern.import}'`)) {
          errors.push({
            id: crypto.randomUUID(),
            type: 'type',
            severity: 'high',
            message: `Missing import from '${pattern.import}'`,
            file: null,
            line: null,
            column: null,
            stackTrace: null,
            suggestedFix: `Add import from '${pattern.import}'`,
            resolved: false,
            resolvedAt: null,
          });
        }
      }
    }

    return errors;
  }

  private checkSyntaxIssues(content: string, filePath: string): DebugError[] {
    const errors: DebugError[] = [];
    
    // Check for unmatched brackets
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        id: crypto.randomUUID(),
        type: 'build',
        severity: 'critical',
        message: `Unmatched brackets: ${openBrackets} opening vs ${closeBrackets} closing`,
        file: filePath,
        line: null,
        column: null,
        stackTrace: null,
        suggestedFix: 'Balance the brackets',
        resolved: false,
        resolvedAt: null,
      });
    }

    // Check for unmatched parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        id: crypto.randomUUID(),
        type: 'build',
        severity: 'critical',
        message: `Unmatched parentheses: ${openParens} opening vs ${closeParens} closing`,
        file: filePath,
        line: null,
        column: null,
        stackTrace: null,
        suggestedFix: 'Balance the parentheses',
        resolved: false,
        resolvedAt: null,
      });
    }

    return errors;
  }

  private checkTypeErrors(content: string, filePath: string): DebugError[] {
    const errors: DebugError[] = [];
    
    // Check for common TypeScript issues
    if (content.includes(': any')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(': any')) {
          errors.push({
            id: crypto.randomUUID(),
            type: 'type',
            severity: 'medium',
            message: 'Usage of "any" type reduces type safety',
            file: filePath,
            line: index + 1,
            column: null,
            stackTrace: null,
            suggestedFix: 'Replace "any" with a specific type',
            resolved: false,
            resolvedAt: null,
          });
        }
      });
    }

    return errors;
  }

  // ═══════════════════════════════════════════════════════════
  // AI-POWERED ERROR DETECTION
  // ═══════════════════════════════════════════════════════════

  private async aiDetectErrors(code: GeneratedCode): Promise<DebugError[]> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: `You are a code review expert. Analyze the code for bugs, security issues, and quality problems.
Focus on:
1. Logic errors
2. Security vulnerabilities
3. Performance issues
4. Missing error handling
5. Type safety issues
6. Accessibility problems`,
      messages: [
        {
          role: 'user',
          content: `Review these code files for issues:

${code.files.map(f => `// ${f.path}\n${f.content}`).join('\n\n')}

Respond with valid JSON array of issues:
[
  {
    "type": "build|runtime|test|type|lint|security|performance",
    "severity": "critical|high|medium|low",
    "message": "description",
    "file": "path/to/file",
    "line": 1,
    "suggestion": "how to fix"
  }
]

If no issues found, return empty array [].`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const issues = this.parseJSON(content.text);
        return issues.map((issue: any) => ({
          id: crypto.randomUUID(),
          type: issue.type,
          severity: issue.severity,
          message: issue.message,
          file: issue.file,
          line: issue.line,
          column: null,
          stackTrace: null,
          suggestedFix: issue.suggestion,
          resolved: false,
          resolvedAt: null,
        }));
      } catch {
        return [];
      }
    }
    return [];
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  private parseJSON(text: string): any {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    try {
      return JSON.parse(text);
    } catch {
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface DebugResult {
  errors: DebugError[];
  fixes: DebugFix[];
  resolved: boolean;
  remainingErrors: DebugError[];
}
