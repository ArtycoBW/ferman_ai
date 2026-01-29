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
  Lightbulb,
  Download,
  Loader2
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { AnalysisResult, RuleResult, RuleStatus, RiskType, Severity } from '@/types/api'

interface AnalysisResultsProps {
  result: AnalysisResult
  taskId?: string
}

type FilterType = 'all' | 'violations' | 'risks' | 'ok' | 'hints'

function getRuleIcon(status: RuleStatus, riskType: RiskType) {
  if (status === 'ok') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />
  }
  if (riskType === 'violation') {
    return <AlertCircle className="h-5 w-5 text-red-500" />
  }
  if (riskType === 'risk' || riskType === 'inconsistency') {
    return <AlertTriangle className="h-5 w-5 text-amber-500" />
  }
  return <Info className="h-5 w-5 text-blue-500" />
}

function getRuleBadgeVariant(status: RuleStatus, riskType: RiskType, severity: Severity): 'destructive' | 'default' | 'secondary' | 'outline' {
  if (status === 'ok') return 'outline'
  if (riskType === 'violation') return 'destructive'
  if (riskType === 'risk' || riskType === 'inconsistency') return 'default'
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
  const formatContent = (text: string) => {
    const lines = text.split('\n')
    const result: string[] = []
    let inList = false

    for (const line of lines) {
      const trimmed = line.trim()

      // Пустая строка
      if (!trimmed) {
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        result.push('<div class="h-3"></div>')
        continue
      }

      // Заголовки с ## и номерами (## 1) Краткая информация...)
      const mdHeaderMatch = trimmed.match(/^#{1,3}\s*(\d+)\)\s+(.+)$/)
      if (mdHeaderMatch) {
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        result.push(`<h3 class="text-base font-semibold mt-4 mb-2 text-slate-800">${mdHeaderMatch[1]}. ${mdHeaderMatch[2]}</h3>`)
        continue
      }

      // Заголовки только с номерами (1) Краткая информация...)
      const headerMatch = trimmed.match(/^(\d+)\)\s+(.+)$/)
      if (headerMatch) {
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        result.push(`<h3 class="text-base font-semibold mt-4 mb-2 text-slate-800">${headerMatch[1]}. ${headerMatch[2]}</h3>`)
        continue
      }

      // Обычные markdown заголовки (## Заголовок)
      const plainMdHeaderMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
      if (plainMdHeaderMatch) {
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        const level = plainMdHeaderMatch[1].length
        const className = level === 1
          ? 'text-lg font-semibold mt-5 mb-3 text-slate-900'
          : 'text-base font-semibold mt-4 mb-2 text-slate-800'
        result.push(`<h${level + 2} class="${className}">${plainMdHeaderMatch[2]}</h${level + 2}>`)
        continue
      }

      // Буллеты с •
      const bulletMatch = trimmed.match(/^[•\-]\s+(.+)$/)
      if (bulletMatch) {
        if (!inList) {
          result.push('<ul class="list-disc pl-6 my-2 space-y-1">')
          inList = true
        }
        result.push(`<li class="text-slate-700">${bulletMatch[1]}</li>`)
        continue
      }

      // Обычный текст
      if (inList) {
        result.push('</ul>')
        inList = false
      }

      // Жирный текст
      let formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')

      result.push(`<p class="mb-2 text-slate-700">${formatted}</p>`)
    }

    if (inList) {
      result.push('</ul>')
    }

    return result.join('')
  }

  return (
    <div className="prose prose-sm max-w-none">
      <div
        className="text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: formatContent(content)
        }}
      />
    </div>
  )
}

function RuleCard({ rule, isExpanded, onToggle, isHint }: { rule: RuleResult; isExpanded: boolean; onToggle: () => void; isHint?: boolean }) {
  const isTriggered = rule.status === 'triggered'

  return (
    <Card className={`transition-all ${isHint ? 'border-purple-200 bg-purple-50/30' : isTriggered && rule.risk_type === 'violation' ? 'border-red-200 bg-red-50/30' : isTriggered && (rule.risk_type === 'risk' || rule.risk_type === 'inconsistency') ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <CardContent className="p-4">
        <button
          onClick={onToggle}
          className="w-full text-left"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {isHint ? <Lightbulb className="h-5 w-5 text-purple-500" /> : getRuleIcon(rule.status, rule.risk_type)}
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
  const hints = result.rule_results.hints || []

  const stats = useMemo(() => {
    const violations = rules.filter(r => r.status === 'triggered' && r.risk_type === 'violation').length
    const risks = rules.filter(r => r.status === 'triggered' && (r.risk_type === 'risk' || r.risk_type === 'inconsistency')).length
    const ok = rules.filter(r => r.status === 'ok').length
    const info = rules.filter(r => r.status === 'triggered' && r.risk_type === 'info').length
    return { violations, risks, ok, info, hints: hints.length }
  }, [rules, hints])

  const filteredRules = useMemo(() => {
    switch (filter) {
      case 'violations':
        return rules.filter(r => r.status === 'triggered' && r.risk_type === 'violation')
      case 'risks':
        return rules.filter(r => r.status === 'triggered' && (r.risk_type === 'risk' || r.risk_type === 'inconsistency' || r.risk_type === 'info'))
      case 'ok':
        return rules.filter(r => r.status === 'ok')
      case 'hints':
        return hints
      default:
        return rules
    }
  }, [rules, hints, filter])

  const sortedRules = useMemo(() => {
    return [...filteredRules].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'triggered' ? -1 : 1
      }
      const riskOrder: Record<string, number> = { violation: 0, risk: 1, inconsistency: 2, info: 3 }
      if (a.risk_type !== b.risk_type) {
        return riskOrder[a.risk_type] - riskOrder[b.risk_type]
      }
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
        <Card className={`cursor-pointer transition-all ${filter === 'hints' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setFilter(filter === 'hints' ? 'all' : 'hints')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.hints}</div>
                <div className="text-xs text-muted-foreground">Подсказки</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              isHint={filter === 'hints'}
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
