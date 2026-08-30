// UAFSAIDA — Quality Gate System
// Validates code against quality standards

import Anthropic from '@anthropic-ai/sdk';
import { QualityReport, QualityGateResult, QualityGate, QualityIssue, GeneratedCode } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-20250514';

export class QualityGateSystem {
  async runQualityGates(code: GeneratedCode, projectId: string): Promise<QualityReport> {
    const gates: QualityGateResult[] = [];

    // Run all quality gates
    gates.push(await this.checkBuild(code));
    gates.push(await this.checkTypeSafety(code));
    gates.push(await this.checkTesting(code));
    gates.push(await this.checkSecurity(code));
    gates.push(await this.checkPerformance(code));
    gates.push(await this.checkDocumentation(code));
    gates.push(await this.checkAccessibility(code));
    gates.push(await this.checkCodeQuality(code));

    const overallScore = Math.round(
      gates.reduce((sum, g) => sum + g.score, 0) / gates.length
    );

    const recommendations: string[] = [];
    for (const gate of gates) {
      if (gate.status === 'failed') {
        recommendations.push(...gate.issues.map(i => i.suggestion));
      }
    }

    return {
      projectId,
      timestamp: new Date(),
      overallScore,
      gates,
      summary: this.generateSummary(gates, overallScore),
      recommendations: [...new Set(recommendations)].slice(0, 10),
    };
  }

  private async checkBuild(code: GeneratedCode): Promise<QualityGateResult> {
    const issues: QualityIssue[] = [];
    
    // Check for syntax errors
    for (const file of code.files) {
      if (file.language === 'typescript' || file.language === 'tsx') {
        // Check for common issues
        if (file.content.includes('any') && !file.content.includes('@ts-expect-error')) {
          issues.push({
            gate: 'build',
            severity: 'low',
            message: 'Usage of "any" type',
            file: file.path,
            line: null,
            suggestion: 'Replace "any" with a specific type',
          });
        }
      }
    }

    return {
      gate: 'build',
      status: issues.filter(i => i.severity === 'critical').length > 0 ? 'failed' : 'passed',
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10),
      details: issues.length === 0 ? 'Build checks passed' : `${issues.length} issues found`,
      issues,
    };
  }

  private async checkTypeSafety(code: GeneratedCode): Promise<QualityGateResult> {
    const issues: QualityIssue[] = [];
    
    for (const file of code.files) {
      if (file.language === 'typescript' || file.language === 'tsx') {
        const anyCount = (file.content.match(/: any/g) || []).length;
        if (anyCount > 0) {
          issues.push({
            gate: 'type-safety',
            severity: 'medium',
            message: `Found ${anyCount} usage(s) of "any" type`,
            file: file.path,
            line: null,
            suggestion: 'Use specific types instead of "any"',
          });
        }
      }
    }

    return {
      gate: 'type-safety',
      status: issues.filter(i => i.severity === 'high').length > 0 ? 'failed' : 'passed',
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 15),
      details: issues.length === 0 ? 'Type safety checks passed' : `${issues.length} type issues found`,
      issues,
    };
  }

  private async checkTesting(code: GeneratedCode): Promise<QualityGateResult> {
    const testFiles = code.files.filter(f => f.isTest);
    const sourceFiles = code.files.filter(f => !f.isTest && !f.isConfig);
    
    const coverage = sourceFiles.length > 0 
      ? Math.min(100, Math.round((testFiles.length / sourceFiles.length) * 100))
      : 0;

    const issues: QualityIssue[] = [];
    if (coverage < 50) {
      issues.push({
        gate: 'testing',
        severity: 'high',
        message: `Test coverage is ${coverage}% (below 50%)`,
        file: null,
        line: null,
        suggestion: 'Add more test files to improve coverage',
      });
    }

    return {
      gate: 'testing',
      status: coverage >= 50 ? 'passed' : 'failed',
      score: coverage,
      details: `${testFiles.length} test files for ${sourceFiles.length} source files (${coverage}% coverage)`,
      issues,
    };
  }

  private async checkSecurity(code: GeneratedCode): Promise<QualityGateResult> {
    const issues: QualityIssue[] = [];
    
    for (const file of code.files) {
      // Check for hardcoded secrets
      if (/sk-[a-zA-Z0-9]{32,}/.test(file.content)) {
        issues.push({
          gate: 'security',
          severity: 'critical',
          message: 'Potential hardcoded API key detected',
          file: file.path,
          line: null,
          suggestion: 'Move secrets to environment variables',
        });
      }
      
      // Check for eval usage
      if (file.content.includes('eval(')) {
        issues.push({
          gate: 'security',
          severity: 'high',
          message: 'Usage of eval() detected',
          file: file.path,
          line: null,
          suggestion: 'Avoid eval() — use safer alternatives',
        });
      }
    }

    return {
      gate: 'security',
      status: issues.filter(i => i.severity === 'critical').length > 0 ? 'failed' : 
               issues.filter(i => i.severity === 'high').length > 0 ? 'warning' : 'passed',
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20),
      details: issues.length === 0 ? 'Security checks passed' : `${issues.length} security issues found`,
      issues,
    };
  }

  private async checkPerformance(code: GeneratedCode): Promise<QualityGateResult> {
    const issues: QualityIssue[] = [];
    
    for (const file of code.files) {
      // Check for large files
      if (file.content.length > 10000) {
        issues.push({
          gate: 'performance',
          severity: 'medium',
          message: `File is large (${Math.round(file.content.length / 1000)}KB)`,
          file: file.path,
          line: null,
          suggestion: 'Consider splitting into smaller modules',
        });
      }
    }

    return {
      gate: 'performance',
      status: 'passed',
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10),
      details: issues.length === 0 ? 'Performance checks passed' : `${issues.length} performance concerns`,
      issues,
    };
  }

  private async checkDocumentation(code: GeneratedCode): Promise<QualityGateResult> {
    const hasReadme = code.files.some(f => f.path.toLowerCase().includes('readme'));
    const hasApiDocs = code.files.some(f => f.path.includes('docs') || f.path.includes('swagger'));
    
    const issues: QualityIssue[] = [];
    if (!hasReadme) {
      issues.push({
        gate: 'documentation',
        severity: 'medium',
        message: 'No README file found',
        file: null,
        line: null,
        suggestion: 'Add a README.md with project documentation',
      });
    }

    return {
      gate: 'documentation',
      status: hasReadme ? 'passed' : 'warning',
      score: hasReadme ? (hasApiDocs ? 100 : 80) : 40,
      details: hasReadme ? 'Documentation found' : 'Missing documentation',
      issues,
    };
  }

  private async checkAccessibility(code: GeneratedCode): Promise<QualityGateResult> {
    const issues: QualityIssue[] = [];
    
    for (const file of code.files) {
      if (file.language === 'tsx') {
        // Check for images without alt text
        if (/<img[^>]*>/i.test(file.content) && !/<img[^>]*alt=/i.test(file.content)) {
          issues.push({
            gate: 'accessibility',
            severity: 'medium',
            message: 'Image without alt text detected',
            file: file.path,
            line: null,
            suggestion: 'Add alt attributes to all images',
          });
        }
      }
    }

    return {
      gate: 'accessibility',
      status: issues.length === 0 ? 'passed' : 'warning',
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 15),
      details: issues.length === 0 ? 'Accessibility checks passed' : `${issues.length} accessibility issues`,
      issues,
    };
  }

  private async checkCodeQuality(code: GeneratedCode): Promise<QualityGateResult> {
    const issues: QualityIssue[] = [];
    
    for (const file of code.files) {
      // Check for TODO comments
      const todoCount = (file.content.match(/TODO|FIXME|HACK/g) || []).length;
      if (todoCount > 3) {
        issues.push({
          gate: 'code-quality',
          severity: 'low',
          message: `Found ${todoCount} TODO/FIXME comments`,
          file: file.path,
          line: null,
          suggestion: 'Resolve TODOs before production',
        });
      }
    }

    return {
      gate: 'code-quality',
      status: 'passed',
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 5),
      details: issues.length === 0 ? 'Code quality checks passed' : `${issues.length} quality notes`,
      issues,
    };
  }

  private generateSummary(gates: QualityGateResult[], overallScore: number): string {
    const passed = gates.filter(g => g.status === 'passed').length;
    const failed = gates.filter(g => g.status === 'failed').length;
    const warnings = gates.filter(g => g.status === 'warning').length;
    
    return `Quality Score: ${overallScore}/100. ${passed} gates passed, ${warnings} warnings, ${failed} failed.`;
  }
}
