'use client'

import { ExternalLink, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatFileSize, formatDate } from "@/lib/format"
import type { Attachments } from "@/types/api"

interface ProcurementDocumentsProps {
  attachments: Attachments
}

export function ProcurementDocuments({ attachments }: ProcurementDocumentsProps) {
  const attachmentsList = attachments?.attachment || []

  if (!attachmentsList || attachmentsList.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Документы (0)
        </h2>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Документы отсутствуют</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Документы ({attachmentsList.length})
      </h2>

      <Card>
        <CardContent className="pt-4 space-y-3">
          {attachmentsList.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {doc.fileName}
                </div>
                {doc.docDescription && (
                  <div className="text-xs text-slate-600 mt-1">
                    {doc.docDescription}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  {doc.docDate && (
                    <span>
                      {formatDate(doc.docDate)}
                    </span>
                  )}
                  {doc.fileSize && (
                    <span>
                      {formatFileSize(doc.fileSize)}
                    </span>
                  )}
                  {doc.docKindCode && (
                    <span className="font-mono">
                      {doc.docKindCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                {doc.url && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title="Открыть"
                    >
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title="Скачать"
                    >
                      <a href={doc.url} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
