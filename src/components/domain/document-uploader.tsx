"use client";

import { useMemo, useState } from "react";
import { FileUp, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocuments, useUploadDocument } from "@/hooks/use-app-data";
import { apiDownload } from "@/services/api-client";

type DocumentUploaderProps = {
  chantierId: string;
  module: string;
  targetType: string;
  targetId: string;
  compact?: boolean;
};

export function DocumentUploader({ chantierId, module, targetType, targetId, compact = false }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadDocument();
  const { data: documents = [] } = useDocuments(chantierId);
  const linkedDocuments = useMemo(
    () => documents.filter((document) => document.targetType === targetType && document.targetId === targetId),
    [documents, targetId, targetType],
  );

  async function download(documentId: string, fileName: string) {
    const blob = await apiDownload(`/api/v1/documents/${documentId}/download`);
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={compact ? "space-y-2" : "rounded-xl border border-slate-200 bg-slate-50 p-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-orange-200 hover:bg-orange-50">
          <FileUp className="size-4" />
          Justificatif
          <input
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <Button
          disabled={!file || upload.isPending}
          onClick={() => {
            if (!file) return;
            upload.mutate({
              chantierId,
              documentType: "FACTURE",
              module,
              targetType,
              targetId,
              file,
            });
            setFile(null);
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          Envoyer
        </Button>
      </div>
      {file ? <p className="text-xs font-semibold text-slate-500">{file.name}</p> : null}
      {upload.error ? <p className="text-xs font-semibold text-red-600">{upload.error.message}</p> : null}
      {linkedDocuments.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {linkedDocuments.map((document) => (
            <button
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#12355b] ring-1 ring-slate-200"
              key={document.id}
              onClick={() => void download(document.id, document.fileName)}
              type="button"
            >
              <Paperclip className="size-3" />
              {document.fileName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
