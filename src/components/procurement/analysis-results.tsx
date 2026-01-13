'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Loader2
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { AnalysisResult, RuleResult, RuleStatus, RiskType, Severity } from '@/types/api'

interface AnalysisResultsProps {
  result: AnalysisResult
  taskId?: string
}

type FilterType = 'all' | 'violations' | 'risks' | 'ok'

function getRuleIcon(status: RuleStatus, riskType: RiskType) {
  if (status === 'ok') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />
  }
  if (riskType === 'violation') {
    return <AlertCircle className="h-5 w-5 text-red-500" />
  }
  if (riskType === 'risk') {
    return <AlertTriangle className="h-5 w-5 text-amber-500" />
  }
  return <Info className="h-5 w-5 text-blue-500" />
}

function getRuleBadgeVariant(status: RuleStatus, riskType: RiskType, severity: Severity): 'destructive' | 'default' | 'secondary' | 'outline' {
  if (status === 'ok') return 'outline'
  if (riskType === 'violation') return 'destructive'
  if (riskType === 'risk') return 'default'
  return 'secondary'
}

function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case 'high': return 'Высокий'
    case 'medium': return 'Средний'
    case 'low': return 'Низкий'
  }
}

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50'
    case 'medium': return 'text-amber-600 bg-amber-50'
    case 'low': return 'text-blue-600 bg-blue-50'
  }
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <div
        className="whitespace-pre-wrap text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/###\s+(.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/##\s+(.*?)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
            .replace(/^(\d+)\.\s+(.*?)$/gm, '<li class="ml-4">$2</li>')
            .replace(/\n\n/g, '</p><p class="mb-2">')
        }}
      />
    </div>
  )
}

function RuleCard({ rule, isExpanded, onToggle }: { rule: RuleResult; isExpanded: boolean; onToggle: () => void }) {
  const isTriggered = rule.status === 'triggered'

  return (
    <Card className={`transition-all ${isTriggered && rule.risk_type === 'violation' ? 'border-red-200 bg-red-50/30' : isTriggered && rule.risk_type === 'risk' ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <CardContent className="p-4">
        <button
          onClick={onToggle}
          className="w-full text-left"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getRuleIcon(rule.status, rule.risk_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm">{rule.title}</span>
                {isTriggered && (
                  <Badge className={`text-xs ${getSeverityColor(rule.severity)}`}>
                    {getSeverityLabel(rule.severity)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{rule.message}</p>
            </div>
            <div className="shrink-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            {rule.description && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Описание</div>
                <p className="text-sm">{rule.description}</p>
              </div>
            )}
            {rule.law_refs.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Ссылки на законодательство</div>
                <div className="flex flex-wrap gap-1.5">
                  {rule.law_refs.map((ref, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>ID: {rule.rule_id}</span>
              <span>Тип: {rule.risk_type}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RulesTab({ result }: { result: AnalysisResult }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  const rules = result.rule_results.applicable_rules

  const stats = useMemo(() => {
    const violations = rules.filter(r => r.status === 'triggered' && r.risk_type === 'violation').length
    const risks = rules.filter(r => r.status === 'triggered' && r.risk_type === 'risk').length
    const ok = rules.filter(r => r.status === 'ok').length
    const info = rules.filter(r => r.status === 'triggered' && r.risk_type === 'info').length
    return { violations, risks, ok, info, total: rules.length }
  }, [rules])

  const filteredRules = useMemo(() => {
    switch (filter) {
      case 'violations':
        return rules.filter(r => r.status === 'triggered' && r.risk_type === 'violation')
      case 'risks':
        return rules.filter(r => r.status === 'triggered' && (r.risk_type === 'risk' || r.risk_type === 'info'))
      case 'ok':
        return rules.filter(r => r.status === 'ok')
      default:
        return rules
    }
  }, [rules, filter])

  const sortedRules = useMemo(() => {
    return [...filteredRules].sort((a, b) => {
      // Sort by status first (triggered before ok)
      if (a.status !== b.status) {
        return a.status === 'triggered' ? -1 : 1
      }
      // Then by risk type (violation > risk > info)
      const riskOrder = { violation: 0, risk: 1, info: 2 }
      if (a.risk_type !== b.risk_type) {
        return riskOrder[a.risk_type] - riskOrder[b.risk_type]
      }
      // Then by severity (high > medium > low)
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }, [filteredRules])

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev)
      if (next.has(ruleId)) {
        next.delete(ruleId)
      } else {
        next.add(ruleId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={`cursor-pointer transition-all ${filter === 'violations' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setFilter(filter === 'violations' ? 'all' : 'violations')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.violations}</div>
                <div className="text-xs text-muted-foreground">Нарушения</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer transition-all ${filter === 'risks' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setFilter(filter === 'risks' ? 'all' : 'risks')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-amber-600">{stats.risks + stats.info}</div>
                <div className="text-xs text-muted-foreground">Риски</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer transition-all ${filter === 'ok' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setFilter(filter === 'ok' ? 'all' : 'ok')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.ok}</div>
                <div className="text-xs text-muted-foreground">В порядке</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary' : ''}`} onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Всего правил</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {sortedRules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Нет правил для отображения</p>
            </CardContent>
          </Card>
        ) : (
          sortedRules.map(rule => (
            <RuleCard
              key={rule.rule_id}
              rule={rule}
              isExpanded={expandedRules.has(rule.rule_id)}
              onToggle={() => toggleRule(rule.rule_id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function AnalysisResults({ result, taskId }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('summary')
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPdf = async () => {
    if (!taskId) return

    setIsDownloading(true)
    try {
      const blob = await apiClient.downloadAnalysisSummaryPdf(taskId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analysis-summary-${taskId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка скачивания PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Результаты анализа</h2>
        {taskId && (
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            variant="outline"
            size="sm"
            className='hover:text-black'
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Скачать PDF
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Кратко</TabsTrigger>
          <TabsTrigger value="rules">По проверкам</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          {result.llm ? (
            <Card>
              <CardContent className="p-6">
                <MarkdownContent content={result.llm} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Краткое описание не доступно</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <RulesTab result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
