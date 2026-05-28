"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { useAlerts } from "@/hooks/use-app-data";

export default function AlertesPage() {
  const { data = [], isLoading } = useAlerts();

  return (
    <>
      <PageHeader
        description="Alertes metier priorisees par criticite avec lien futur vers les operations concernees."
        eyebrow="Controle"
        title="Alertes"
      />
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-3">
          {data.map((alert) => (
            <Card className="flex items-start justify-between gap-4 p-5" key={alert.id}>
              <div className="flex gap-3">
                <span className="mt-1 rounded-xl bg-orange-50 p-2 text-orange-600">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <h2 className="font-black text-slate-950">{alert.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                </div>
              </div>
              <Badge tone={alert.severity === "critical" ? "red" : alert.severity === "warning" ? "orange" : "blue"}>
                {alert.severity}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
