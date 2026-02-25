import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Sparkles, Calendar, Activity } from "lucide-react";
import { Link } from "wouter";
import type { DietChart, Patient } from "@/types/schema";

export default function DietCharts() {
  const { data: charts = [], isLoading: cLoading } = useQuery<DietChart[]>({
    queryKey: ["/api/diet-charts"],
  });
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const getPatientName = (patientId: number) => {
    const p = patients.find((p) => p.id === patientId);
    return p?.name || "Unknown";
  };

  if (cLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-charts-title">Diet Charts</h1>
          <p className="text-muted-foreground">View and manage AI-generated Ayurvedic diet charts</p>
        </div>
        <Link href="/generate">
          <Button data-testid="button-generate-new-chart">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New
          </Button>
        </Link>
      </div>

      {charts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No diet charts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate your first AI-powered Ayurvedic diet chart</p>
            <Link href="/generate">
              <Button data-testid="button-first-chart">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Diet Chart
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {charts.map((chart) => (
            <Link key={chart.id} href={`/diet-charts/${chart.id}`}>
              <Card className="cursor-pointer hover-elevate mb-3" data-testid={`card-diet-chart-${chart.id}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{chart.chartType} Diet Chart</h3>
                        <p className="text-sm text-muted-foreground">
                          Patient: {getPatientName(chart.patientId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={chart.status === "active" ? "default" : "secondary"}>
                        {chart.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{chart.durationDays} days</span>
                      </div>
                      {chart.aiConfidence && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="w-3 h-3" />
                          <span>{Math.round(chart.aiConfidence * 100)}% confidence</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(chart.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {chart.ayurvedicAnalysis && (
                    <div className="mt-3 pt-3 border-t flex gap-1.5 flex-wrap">
                      {chart.ayurvedicAnalysis.therapeuticBenefits?.slice(0, 3).map((b, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
