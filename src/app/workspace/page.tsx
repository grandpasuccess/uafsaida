// UAFSAIDA — Project Command Center

'use client';

import { useState, useCallback } from 'react';
import { Project, ProjectStage, Activity, Requirement } from '../../types/project';
import { useProjectStore } from '../../store/projects';
import { generateDiscoveryQuestions, generateRequirements } from '../../engine/discovery';

type View = 'list' | 'new-project' | 'project-detail';

export default function WorkspacePage() {
  const [view, setView] = useState<View>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectCreated = useCallback((project: Project) => {
    setSelectedProject(project);
    setView('project-detail');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>U</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>UAFSAIDA</h1>
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('list')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: view === 'list' || view === 'project-detail' ? '#dbeafe' : 'transparent', color: view === 'list' || view === 'project-detail' ? '#1d4ed8' : '#64748b', fontSize: 14, cursor: 'pointer' }}>Projects</button>
          <button onClick={() => setView('new-project')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: view === 'new-project' ? '#dbeafe' : 'transparent', color: view === 'new-project' ? '#1d4ed8' : '#64748b', fontSize: 14, cursor: 'pointer' }}>+ New Project</button>
        </nav>
      </header>

      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {view === 'list' && <ProjectList onNewProject={() => setView('new-project')} onSelectProject={(p) => { setSelectedProject(p); setView('project-detail'); }} />}
        {view === 'new-project' && <NewProjectFlow onCancel={() => setView('list')} onComplete={handleProjectCreated} />}
        {view === 'project-detail' && selectedProject && <ProjectDetail project={selectedProject} onBack={() => setView('list')} />}
      </main>
    </div>
  );
}

function ProjectList({ onNewProject, onSelectProject }: { onNewProject: () => void; onSelectProject: (p: Project) => void }) {
  const { projects } = useProjectStore();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>My Projects</h2>
        <button onClick={onNewProject} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>No projects yet</h3>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Create your first project to get started.</p>
          <button onClick={onNewProject} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Create First Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onClick={() => onSelectProject(project)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#10b981';
      case 'generating': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'paused': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { draft: 'Draft', discovering: 'Discovering', specifying: 'Specifying', architecting: 'Architecting', generating: 'Generating', preview: 'Preview Ready', testing: 'Testing', deploying: 'Deploying', live: 'Live', paused: 'Paused', failed: 'Failed' };
    return labels[status] || status;
  };

  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{project.name}</h3>
        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: `${getStatusColor(project.status)}20`, color: getStatusColor(project.status) }}>{getStatusLabel(project.status)}</span>
      </div>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description}</p>
      
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{project.progress}%</span>
        </div>
        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${project.progress}%`, background: getStatusColor(project.status), borderRadius: 3 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {project.stages.map(stage => (
          <div key={stage.id} style={{ flex: 1, height: 4, borderRadius: 2, background: stage.status === 'completed' ? '#10b981' : stage.status === 'in-progress' ? '#f59e0b' : '#e2e8f0' }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
        <span>{project.stages.filter(s => s.status === 'completed').length}/{project.stages.length} stages</span>
        <span>{project.activities.length} activities</span>
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'activity' | 'requirements'>('overview');

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 6, border: 'none', background: '#e2e8f0', color: '#475569', fontSize: 14, cursor: 'pointer' }}>← Back to Projects</button>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{project.name}</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{project.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: '#64748b' }}>Overall Progress</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{project.progress}%</span>
            </div>
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${project.progress}%`, background: '#3b82f6', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['overview', 'stages', 'activity', 'requirements'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: activeTab === tab ? '#3b82f6' : '#e2e8f0', color: activeTab === tab ? '#fff' : '#475569', fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Project Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{project.status}</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Status</div>
              </div>
              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{project.stages.filter(s => s.status === 'completed').length}/{project.stages.length}</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Stages Completed</div>
              </div>
              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{project.activities.length}</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Activities</div>
              </div>
              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{project.createdAt.toLocaleDateString()}</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Created</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stages' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Project Stages</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {project.stages.map((stage, index) => (
                <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: stage.status === 'completed' ? '#10b981' : stage.status === 'in-progress' ? '#f59e0b' : '#e2e8f0', color: stage.status === 'pending' ? '#64748b' : '#fff', fontWeight: 600, fontSize: 14 }}>
                    {stage.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{stage.name}</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>{stage.description}</div>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: stage.status === 'completed' ? '#d1fae5' : stage.status === 'in-progress' ? '#fef3c7' : '#f1f5f9', color: stage.status === 'completed' ? '#065f46' : stage.status === 'in-progress' ? '#92400e' : '#64748b' }}>{stage.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Activity Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.activities.map(activity => (
                <div key={activity.id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 8, background: activity.requiresAction ? '#fff7ed' : '#f8fafc', borderLeft: activity.requiresAction ? '3px solid #f59e0b' : '3px solid transparent' }}>
                  <div style={{ fontSize: 20 }}>
                    {activity.type === 'project-created' ? '📁' : activity.type === 'requirement-added' ? '📋' : activity.type === 'requirement-approved' ? '✅' : activity.type === 'code-generated' ? '💻' : activity.type === 'deployment-complete' ? '✨' : activity.type === 'ai-decision' ? '🤖' : activity.type === 'human-action-required' ? '⚠️' : '📝'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{activity.message}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      {activity.timestamp.toLocaleTimeString()} {activity.automated ? '• 🤖 Automated' : '• 👤 Manual'}
                      {activity.requiresAction && ' • ⚠️ Action Required'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Requirements</h3>
            {project.requirements && project.requirements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {project.requirements.map(req => (
                  <div key={req.id} style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.title}</div>
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: req.priority === 'must' ? '#fee2e2' : req.priority === 'should' ? '#fef3c7' : '#dbeafe', color: req.priority === 'must' ? '#dc2626' : req.priority === 'should' ? '#d97706' : '#2563eb' }}>{req.priority}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>{req.description}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {req.acceptanceCriteria.map((ac, i) => (
                        <span key={i} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: '#e2e8f0', color: '#475569' }}>{ac}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>No requirements yet. Start the discovery phase to generate requirements.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewProjectFlow({ onCancel, onComplete }: { onCancel: () => void; onComplete: (project: Project) => void }) {
  const [step, setStep] = useState<'describe' | 'discover' | 'review'>('describe');
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState<ReturnType<typeof generateDiscoveryQuestions>>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const store = useProjectStore();

  const handleStartDiscovery = useCallback(() => {
    if (!prompt.trim()) return;
    const discoveryQuestions = generateDiscoveryQuestions(prompt);
    setQuestions(discoveryQuestions);
    setStep('discover');
  }, [prompt]);

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleCompleteDiscovery = useCallback(() => {
    const project = store.createProject(prompt, prompt);
    const generatedRequirements = generateRequirements(prompt, answers);
    
    store.updateProject(project.id, { status: 'specifying' });
    store.addActivity(project.id, { type: 'project-created', message: 'Discovery phase completed', automated: false });
    store.setRequirements(project.id, generatedRequirements);
    setRequirements(generatedRequirements);
    setCreatedProjectId(project.id);
    setStep('review');
  }, [prompt, answers, store]);

  const handleApproveProject = useCallback(() => {
    if (createdProjectId) {
      store.updateProject(createdProjectId, { status: 'generating', progress: 10 });
      const project = store.projects.find(p => p.id === createdProjectId);
      if (project) onComplete(project);
    }
  }, [createdProjectId, store, onComplete]);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>New Project</h2>
        <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#e2e8f0', color: '#475569', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
      </div>

      {step === 'describe' && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>What are you building?</h3>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your application in detail..." style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 16 }} />
          <button onClick={handleStartDiscovery} disabled={!prompt.trim()} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: prompt.trim() ? '#3b82f6' : '#cbd5e1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: prompt.trim() ? 'pointer' : 'not-allowed' }}>Continue →</button>
        </div>
      )}

      {step === 'discover' && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>A few questions to clarify</h3>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Your answers help us generate better requirements.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {questions.map(question => (
              <div key={question.id}>
                <label style={{ display: 'block', fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                  {question.question}
                  {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                {question.options ? (
                  <select value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}>
                    <option value="">Select an option...</option>
                    {question.options.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <input type="text" value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)} placeholder="Your answer..." style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep('describe')} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#e2e8f0', color: '#475569', fontSize: 14, cursor: 'pointer' }}>← Back</button>
            <button onClick={handleCompleteDiscovery} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Generate Requirements →</button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Generated Requirements</h3>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Based on your description and answers, we've generated {requirements.length} requirements.</p>
          
          <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requirements.map(req => (
                <div key={req.id} style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.title}</div>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: req.priority === 'must' ? '#fee2e2' : '#dbeafe', color: req.priority === 'must' ? '#dc2626' : '#2563eb' }}>{req.priority}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#64748b' }}>{req.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep('discover')} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#e2e8f0', color: '#475569', fontSize: 14, cursor: 'pointer' }}>← Back</button>
            <button onClick={handleApproveProject} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>✓ Approve & Start Building</button>
          </div>
        </div>
      )}
    </div>
  );
}
