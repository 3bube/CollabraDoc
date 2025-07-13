'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Users, 
  Target, 
  BookOpen,
  Code,
  MessageSquare,
  CheckSquare,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  icon: React.ReactNode;
  tags: string[];
}

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect?: (template: Template) => void;
}

const defaultTemplates: Template[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured template for meeting notes with action items',
    category: 'Business',
    icon: <MessageSquare className="h-6 w-6" />,
    tags: ['meeting', 'notes', 'business'],
    content: `# Meeting Notes

## Meeting Details
- **Date:** [Date]
- **Time:** [Time]
- **Location:** [Location/Virtual]
- **Attendees:** [List attendees]

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Points
### [Topic 1]
- [Discussion point]
- [Discussion point]

### [Topic 2]
- [Discussion point]
- [Discussion point]

## Action Items
- [ ] [Action item 1] - [Assignee] - [Due date]
- [ ] [Action item 2] - [Assignee] - [Due date]
- [ ] [Action item 3] - [Assignee] - [Due date]

## Next Steps
- [Next step 1]
- [Next step 2]

## Notes
[Additional notes and observations]`
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Comprehensive project planning template',
    category: 'Project Management',
    icon: <Target className="h-6 w-6" />,
    tags: ['project', 'planning', 'management'],
    content: `# Project Plan

## Project Overview
- **Project Name:** [Project Name]
- **Project Manager:** [Name]
- **Start Date:** [Date]
- **End Date:** [Date]
- **Budget:** [Amount]

## Project Goals
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

## Scope
### In Scope
- [Deliverable 1]
- [Deliverable 2]
- [Deliverable 3]

### Out of Scope
- [Non-deliverable 1]
- [Non-deliverable 2]

## Timeline
### Phase 1: Planning (Week 1-2)
- [ ] [Task 1]
- [ ] [Task 2]

### Phase 2: Development (Week 3-8)
- [ ] [Task 1]
- [ ] [Task 2]

### Phase 3: Testing (Week 9-10)
- [ ] [Task 1]
- [ ] [Task 2]

### Phase 4: Deployment (Week 11-12)
- [ ] [Task 1]
- [ ] [Task 2]

## Resources
### Team Members
- [Role 1]: [Name]
- [Role 2]: [Name]

### Tools & Technology
- [Tool 1]
- [Tool 2]

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | [High/Medium/Low] | [High/Medium/Low] | [Mitigation strategy] |
| [Risk 2] | [High/Medium/Low] | [High/Medium/Low] | [Mitigation strategy] |

## Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]`
  },
  {
    id: 'technical-doc',
    name: 'Technical Documentation',
    description: 'Template for technical documentation and guides',
    category: 'Technical',
    icon: <Code className="h-6 w-6" />,
    tags: ['technical', 'documentation', 'guide'],
    content: `# Technical Documentation

## Overview
[Brief description of the system, feature, or process being documented]

## Table of Contents
1. [Section 1](#section-1)
2. [Section 2](#section-2)
3. [Section 3](#section-3)

## Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

## Installation
### Step 1: [Installation step]
\`\`\`bash
[command here]
\`\`\`

### Step 2: [Installation step]
\`\`\`bash
[command here]
\`\`\`

## Configuration
### Environment Variables
| Variable | Description | Default Value |
|----------|-------------|---------------|
| \`VARIABLE_1\` | [Description] | [Default] |
| \`VARIABLE_2\` | [Description] | [Default] |

### Configuration File
\`\`\`json
{
  "setting1": "value1",
  "setting2": "value2"
}
\`\`\`

## Usage
### Basic Usage
[Description of basic usage with examples]

### Advanced Usage
[Description of advanced features]

## API Reference
### Endpoint 1
**Method:** \`GET\`
**URL:** \`/api/endpoint\`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`param1\` | string | Yes | [Description] |

**Response:**
\`\`\`json
{
  "status": "success",
  "data": {}
}
\`\`\`

## Troubleshooting
### Common Issues
1. **Issue 1**
   - **Symptoms:** [Description]
   - **Solution:** [Solution steps]

2. **Issue 2**
   - **Symptoms:** [Description]
   - **Solution:** [Solution steps]

## Contributing
[Guidelines for contributing to this documentation]

## Changelog
### Version 1.0.0
- [Change 1]
- [Change 2]`
  },
  {
    id: 'research-paper',
    name: 'Research Paper',
    description: 'Academic research paper template',
    category: 'Academic',
    icon: <BookOpen className="h-6 w-6" />,
    tags: ['research', 'academic', 'paper'],
    content: `# Research Paper Title

## Abstract
[Brief summary of the research, methodology, and key findings]

## Keywords
[Keyword 1], [Keyword 2], [Keyword 3], [Keyword 4], [Keyword 5]

## 1. Introduction
### 1.1 Background
[Background information and context]

### 1.2 Problem Statement
[Clear statement of the research problem]

### 1.3 Research Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### 1.4 Significance
[Why this research is important]

## 2. Literature Review
### 2.1 Previous Work
[Review of relevant previous research]

### 2.2 Theoretical Framework
[Theoretical basis for the research]

## 3. Methodology
### 3.1 Research Design
[Description of the research design]

### 3.2 Data Collection
[Methods used to collect data]

### 3.3 Data Analysis
[Methods used to analyze the data]

## 4. Results
### 4.1 Descriptive Statistics
[Basic statistical information]

### 4.2 Hypothesis Testing
[Results of hypothesis tests]

### 4.3 Key Findings
[Main findings of the research]

## 5. Discussion
### 5.1 Interpretation of Results
[What the results mean]

### 5.2 Implications
[Practical and theoretical implications]

### 5.3 Limitations
[Limitations of the study]

## 6. Conclusion
[Summary of findings and conclusions]

## 7. Future Work
[Suggestions for future research]

## References
1. [Author, A. (Year). Title. Journal, Volume(Issue), Pages.]
2. [Author, B. (Year). Title. Publisher.]
3. [Author, C. (Year). Title. URL]`
  },
  {
    id: 'weekly-report',
    name: 'Weekly Report',
    description: 'Template for weekly progress reports',
    category: 'Business',
    icon: <BarChart3 className="h-6 w-6" />,
    tags: ['report', 'weekly', 'progress'],
    content: `# Weekly Report

## Week of [Date Range]
**Report Period:** [Start Date] - [End Date]
**Prepared by:** [Your Name]
**Department:** [Department]

## Executive Summary
[Brief overview of the week's accomplishments and key highlights]

## Accomplishments This Week
### Completed Tasks
- [ ] [Task 1] - [Brief description]
- [ ] [Task 2] - [Brief description]
- [ ] [Task 3] - [Brief description]

### In Progress
- [ ] [Task 1] - [Progress update]
- [ ] [Task 2] - [Progress update]

### Blocked/Issues
- [ ] [Issue 1] - [Description and impact]
- [ ] [Issue 2] - [Description and impact]

## Key Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| [Metric 1] | [Target] | [Actual] | [Status] |
| [Metric 2] | [Target] | [Actual] | [Status] |

## Meetings Attended
- [Meeting 1] - [Date] - [Outcome]
- [Meeting 2] - [Date] - [Outcome]

## Next Week's Priorities
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

## Resource Needs
- [Resource 1] - [Justification]
- [Resource 2] - [Justification]

## Notes
[Additional observations, concerns, or suggestions]`
  }
];

export function TemplateDialog({ open, onOpenChange, onTemplateSelect }: TemplateDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const categories = ['all', ...Array.from(new Set(defaultTemplates.map(t => t.category)))];

  const filteredTemplates = defaultTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: Template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      // Navigate to create document with template
      router.push(`/create?template=${template.id}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a template to get started with your document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Templates' : category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      <div className="flex gap-1">
                        {template.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 