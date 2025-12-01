import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Download, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Enhanced markdown renderer with math support
const renderMarkdown = (text: string) => {
  if (!text) return '';
  
  // Clean up escaped LaTeX (convert \\ to \ for proper rendering)
  // But be careful - only unescape within math expressions
  let processedText = text;
  
  // First, process block math ($$...$$) across multiple lines
  processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
    try {
      // Unescape LaTeX (convert \\ to \)
      const cleanedMath = mathContent.trim().replace(/\\\\/g, '\\');
      const rendered = katex.renderToString(cleanedMath, {
        displayMode: true,
        throwOnError: false
      });
      return `__MATH_BLOCK__${rendered}__MATH_BLOCK__`;
    } catch (e) {
      return `__MATH_ERROR__${mathContent}__MATH_ERROR__`;
    }
  });
  
  const lines = processedText.split('\n');
  let html = '';
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    
    // Check if this line contains a math block
    const hasMathBlock = line.includes('__MATH_BLOCK__') || line.includes('__MATH_ERROR__');
    
    // Restore math blocks first
    if (hasMathBlock) {
      closeList();
      line = line.replace(/__MATH_BLOCK__(.*?)__MATH_BLOCK__/g, '<div class="my-4 overflow-x-auto">$1</div>');
      line = line.replace(/__MATH_ERROR__(.*?)__MATH_ERROR__/g, '<div class="my-4 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">Math Error: $1</div>');
      html += line;
      continue;
    }
    
    // Headers
    if (trimmed.startsWith('#### ')) {
      closeList();
      html += `<h4 class="text-base font-bold text-gray-900 mt-4 mb-2">${formatInline(trimmed.substring(5))}</h4>`;
    } else if (trimmed.startsWith('### ')) {
      closeList();
      html += `<h3 class="text-lg font-bold text-gray-900 mt-6 mb-3">${formatInline(trimmed.substring(4))}</h3>`;
    } else if (trimmed.startsWith('## ')) {
      closeList();
      html += `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">${formatInline(trimmed.substring(3))}</h2>`;
    } else if (trimmed.startsWith('# ')) {
      closeList();
      html += `<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${formatInline(trimmed.substring(2))}</h1>`;
    }
    // Numbered lists
    else if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        closeList();
        html += '<ol class="list-decimal ml-6 mb-4 space-y-1">';
        inList = true;
        listType = 'ol';
      }
      const content = trimmed.replace(/^\d+\.\s+/, '');
      html += `<li class="mb-1">${formatInline(content)}</li>`;
    }
    // Bullet points
    else if (/^[-*]\s+/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        closeList();
        html += '<ul class="list-disc ml-6 mb-4 space-y-1">';
        inList = true;
        listType = 'ul';
      }
      const content = trimmed.replace(/^[-*]\s+/, '');
      html += `<li class="mb-1">${formatInline(content)}</li>`;
    }
    // Empty line
    else if (!trimmed) {
      closeList();
      if (html && !html.endsWith('</p>') && !html.endsWith('</h1>') && !html.endsWith('</h2>') && !html.endsWith('</h3>') && !html.endsWith('</h4>') && !html.endsWith('</div>')) {
        html += '<br>';
      }
    }
    // Regular paragraph
    else {
      closeList();
      html += `<p class="mb-4 text-gray-700 leading-relaxed">${formatInline(line)}</p>`;
    }
  }
  
  closeList();
  
  function closeList() {
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
      listType = null;
    }
  }
  
  function formatInline(text: string): string {
    // Don't process if it's already HTML (math blocks)
    if (text.includes('__MATH_BLOCK__') || text.includes('__MATH_ERROR__')) {
      return text;
    }
    
    // Escape HTML first
    let formatted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Inline math ($...$) - but not if it's part of block math ($$)
    formatted = formatted.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (match, mathContent) => {
      try {
        // Unescape LaTeX (convert \\ to \)
        const cleanedMath = mathContent.trim().replace(/\\\\/g, '\\');
        const rendered = katex.renderToString(cleanedMath, {
          displayMode: false,
          throwOnError: false
        });
        return rendered;
      } catch (e) {
        return `<span class="text-red-600 text-sm">Math Error: ${mathContent}</span>`;
      }
    });
    
    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-2 text-sm font-mono"><code>$1</code></pre>');
    
    // Inline code (but not if it's part of math)
    formatted = formatted.replace(/`([^`]+)`/g, (match, codeContent) => {
      // Check if this is inside a math expression
      if (match.includes('$')) return match;
      return `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">${codeContent}</code>`;
    });
    
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Italic (but not if part of bold)
    formatted = formatted.replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
    
    return formatted;
  }
  
  return html;
};

interface ToolConfig {
  name: string;
  description: string;
  icon: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'textarea';
    required?: boolean;
    options?: string[];
    placeholder?: string;
    dependsOn?: string; // Field name this field depends on
    getOptions?: (value: string) => string[]; // Function to get options based on dependency
    isStudentSelect?: boolean; // If true, populate from assigned students
  }>;
}

// Class-wise subjects mapping
const CLASS_SUBJECTS: Record<string, string[]> = {
  'Class 6': [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music'
  ],
  'Class 7': [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music'
  ],
  'Class 8': [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music'
  ],
  'Class 9': [
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Hindi',
    'Social Studies',
    'History',
    'Geography',
    'Civics',
    'Economics',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music'
  ],
  'Class 10': [
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Hindi',
    'Social Studies',
    'History',
    'Geography',
    'Civics',
    'Economics',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music'
  ],
  'Class 11': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Hindi',
    'Computer Science',
    'Physical Education',
    'Economics',
    'Business Studies',
    'Accountancy',
    'History',
    'Geography',
    'Political Science',
    'Psychology',
    'Sociology',
    'Philosophy',
    'Fine Arts',
    'Music'
  ],
  'Class 12': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Hindi',
    'Computer Science',
    'Physical Education',
    'Economics',
    'Business Studies',
    'Accountancy',
    'History',
    'Geography',
    'Political Science',
    'Psychology',
    'Sociology',
    'Philosophy',
    'Fine Arts',
    'Music'
  ],
  'Dropper Batch': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English'
  ]
};

const CLASS_OPTIONS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Dropper Batch'];

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  'activity-project-generator': {
    name: 'Activity & Project Generator',
    description: 'Create engaging activities and projects tailored to your curriculum',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'className', label: 'Section (Optional)', type: 'text', placeholder: 'e.g., A, B, C' }
    ]
  },
  'worksheet-generator': {
    name: 'Worksheet Generator',
    description: 'Design custom worksheets with exercises and problems',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'questionCount', label: 'Number of Questions', type: 'number', placeholder: '10' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'medium', 'hard'] }
    ]
  },
  'concept-mastery-helper': {
    name: 'Concept Mastery Helper',
    description: 'Break down complex concepts into digestible lessons',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'concept', label: 'Topic/Concept *', type: 'text', required: true, placeholder: 'Enter concept or topic name' }
    ]
  },
  'lesson-planner': {
    name: 'Lesson Planner',
    description: 'Plan structured lessons with objectives and activities',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', placeholder: '90' }
    ]
  },
  'homework-creator': {
    name: 'Homework Creator',
    description: 'Generate meaningful homework assignments',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'duration', label: 'Expected Duration (minutes)', type: 'number', placeholder: '30' }
    ]
  },
  'rubrics-evaluation-generator': {
    name: 'Rubrics & Evaluation Generator',
    description: 'Create clear assessment criteria and rubrics',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'assignmentType', label: 'Assignment Type *', type: 'text', required: true, placeholder: 'e.g., Project, Essay, Lab Report' }
    ]
  },
  'learning-outcomes-generator': {
    name: 'Learning Outcomes Generator',
    description: 'Define measurable learning outcomes for your courses',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' }
    ]
  },
  'story-passage-creator': {
    name: 'Story & Passage Creator',
    description: 'Generate engaging stories and reading passages',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'length', label: 'Length', type: 'select', options: ['short', 'medium', 'long'] }
    ]
  },
  'short-notes-summaries-maker': {
    name: 'Short Notes & Summaries Maker',
    description: 'Condense complex topics into concise notes',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' }
    ]
  },
  'flashcard-generator': {
    name: 'Flashcard Generator',
    description: 'Build study flashcards for quick revision',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'cardCount', label: 'Number of Cards', type: 'number', placeholder: '20' }
    ]
  },
  'report-card-generator': {
    name: 'Report Card Generator',
    description: 'Generate comprehensive student progress reports with feedback',
    icon: Sparkles,
    fields: [
      { name: 'studentName', label: 'Student Name *', type: 'select', required: true, placeholder: 'Select student', isStudentSelect: true },
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'term', label: 'Term', type: 'text', placeholder: 'e.g., First Term' }
    ]
  },
  'student-skill-tracker': {
    name: 'Student Skill Tracker',
    description: 'Monitor and track student skill development',
    icon: Sparkles,
    fields: [
      { name: 'studentName', label: 'Student Name *', type: 'select', required: true, placeholder: 'Select student', isStudentSelect: true },
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] }
    ]
  },
  'daily-class-plan-maker': {
    name: 'Daily Class Plan Maker',
    description: 'Organize your daily teaching schedule efficiently',
    icon: Sparkles,
    fields: [
      { name: 'date', label: 'Date', type: 'text', placeholder: 'e.g., 2025-01-15' },
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subjects', label: 'Subjects *', type: 'text', required: true, placeholder: 'e.g., Physics, Chemistry, Mathematics' },
      { name: 'timeSlots', label: 'Time Slots', type: 'text', placeholder: 'e.g., 9:00-10:00, 10:15-11:15' }
    ]
  },
  'exam-question-paper-generator': {
    name: 'Exam Question Paper Generator',
    description: 'Create comprehensive exam papers with varying difficulty',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'duration', label: 'Exam Duration (minutes)', type: 'number', placeholder: '90' },
      { name: 'difficulty', label: 'Difficulty Mix', type: 'select', options: ['easy', 'medium', 'hard', 'mixed'] }
    ]
  },
  'mcq-generator': {
    name: 'MCQ Generator',
    description: 'Create multiple-choice questions with detailed explanations',
    icon: Sparkles,
    fields: [
      { name: 'gradeLevel', label: 'Class *', type: 'select', required: true, options: CLASS_OPTIONS },
      { name: 'subject', label: 'Subject *', type: 'select', required: true, dependsOn: 'gradeLevel', getOptions: (classValue) => CLASS_SUBJECTS[classValue] || [] },
      { name: 'topic', label: 'Topic *', type: 'text', required: true, placeholder: 'Enter topic name' },
      { name: 'questionCount', label: 'Number of Questions', type: 'number', placeholder: '10' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'medium', 'hard'] }
    ]
  }
};

export default function TeacherToolPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/teacher/tools/:toolType');
  const { toast } = useToast();
  const [formParams, setFormParams] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<Array<{id: string, name: string, classNumber?: string}>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Get tool type from route params
  const toolType = params?.toolType || '';
  const config = TOOL_CONFIGS[toolType];

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
          <Button onClick={() => {
            localStorage.setItem('teacherDashboardTab', 'vidya-ai');
            setLocation('/teacher/dashboard');
          }}>Go Back</Button>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  // Fetch assigned students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      // Only fetch if this tool needs student selection
      if (toolType === 'student-skill-tracker' || toolType === 'report-card-generator') {
        setIsLoadingStudents(true);
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${API_BASE_URL}/api/teacher/students`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const students = data.data.map((student: any) => ({
                id: student._id || student.id,
                name: student.fullName || student.name,
                classNumber: student.classNumber || student.assignedClass?.classNumber
              }));
              setAssignedStudents(students);
            }
          }
        } catch (error) {
          console.error('Failed to fetch students:', error);
        } finally {
          setIsLoadingStudents(false);
        }
      }
    };

    fetchStudents();
  }, [toolType]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormParams(prev => {
      const updated = { ...prev, [fieldName]: value };
      
      // If student is selected, try to auto-populate class
      if (fieldName === 'studentName' && value) {
        const selectedStudent = assignedStudents.find(s => s.name === value);
        if (selectedStudent && selectedStudent.classNumber) {
          // Map classNumber to Class format (e.g., "8" -> "Class 8")
          const classValue = selectedStudent.classNumber.toString().startsWith('Class') 
            ? selectedStudent.classNumber.toString()
            : `Class ${selectedStudent.classNumber}`;
          
          if (CLASS_OPTIONS.includes(classValue)) {
            updated.gradeLevel = classValue;
          }
        }
      }
      
      // If gradeLevel changes, clear dependent fields (like subject)
      if (fieldName === 'gradeLevel') {
        // Clear subject and other dependent fields
        Object.keys(updated).forEach(key => {
          const field = config?.fields.find(f => f.name === key);
          if (field?.dependsOn === 'gradeLevel') {
            delete updated[key];
          }
        });
      }
      
      return updated;
    });
  };
  
  const getFieldOptions = (field: ToolConfig['fields'][0]): string[] => {
    if (field.options) {
      return field.options;
    }
    
    if (field.dependsOn && field.getOptions) {
      const dependencyValue = formParams[field.dependsOn];
      if (dependencyValue) {
        return field.getOptions(dependencyValue);
      }
      return [];
    }
    
    return [];
  };

  const handleGenerate = async () => {
    // Validate required fields
    const requiredFields = config.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formParams[f.name]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/teacher/ai/tool`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolType,
          ...formParams
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.data.content);
        toast({
          title: 'Success',
          description: 'Content generated successfully!'
        });
      } else {
        throw new Error(data.message || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Content downloaded successfully'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => {
              // Navigate to dashboard and set Vidya AI tab as active
              localStorage.setItem('teacherDashboardTab', 'vidya-ai');
              setLocation('/teacher/dashboard');
            }}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.name}</h1>
              <p className="text-gray-600">{config.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.fields.map((field) => {
                let fieldOptions: string[] = [];
                let isDisabled = false;
                
                if (field.isStudentSelect) {
                  // Use assigned students for student selection
                  fieldOptions = assignedStudents.map(s => s.name);
                  isDisabled = isLoadingStudents || assignedStudents.length === 0;
                } else {
                  fieldOptions = getFieldOptions(field);
                  isDisabled = field.dependsOn && !formParams[field.dependsOn];
                }
                
                return (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === 'select' ? (
                      <Select
                        value={formParams[field.name] || ''}
                        onValueChange={(value) => handleInputChange(field.name, value)}
                        disabled={isDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isDisabled 
                              ? field.isStudentSelect
                                ? isLoadingStudents 
                                  ? 'Loading students...'
                                  : 'No students assigned'
                                : `Select ${config.fields.find(f => f.name === field.dependsOn)?.label || 'Class'} first`
                              : field.placeholder || `Select ${field.label}`
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      value={formParams[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={formParams[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                  </div>
                );
              })}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Content</CardTitle>
                {generatedContent && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 max-h-[600px] overflow-y-auto shadow-sm"
                >
                  <div 
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedContent) }}
                  />
                </motion.div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Fill in the form and click Generate to create content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

