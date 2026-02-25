import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Leaf, ClipboardList, TrendingUp, ArrowRight, Activity, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Patient, DietChart, Food } from "@/types/schema";

function StatCard({ title, value, icon: Icon, description, color }: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight" data-testid={`text-stat-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-2.5 rounded-md ${color}`}>
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DoshaDistribution({ patients }: { patients: Patient[] }) {
  const doshaCount = { Vata: 0, Pitta: 0, Kapha: 0 };
  patients.forEach((p) => {
    if (p.constitution?.primary_dosha) {
      const dosha = p.constitution.primary_dosha as keyof typeof doshaCount;
      if (dosha in doshaCount) doshaCount[dosha]++;
    }
  });
  const total = doshaCount.Vata + doshaCount.Pitta + doshaCount.Kapha || 1;

  const doshaColors: Record<string, string> = {
    Vata: "bg-chart-4",
    Pitta: "bg-chart-3",
    Kapha: "bg-chart-2",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dosha Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(doshaCount).map(([dosha, count]) => (
          <div key={dosha} className="space-y-1.5">
            <div className="flex items-center justify-between gap-1 text-sm">
              <span className="font-medium">{dosha}</span>
              <span className="text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${doshaColors[dosha]} transition-all duration-500`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentPatients({ patients }: { patients: Patient[] }) {
  const recent = patients.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-3">
        <CardTitle className="text-base">Recent Patients</CardTitle>
        <Link href="/patients">
          <Button variant="ghost" size="sm" data-testid="link-view-all-patients">
            View all <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No patients yet</p>
        ) : (
          <div className="space-y-3">
            {recent.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}`}>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-md hover-elevate cursor-pointer" data-testid={`card-patient-${patient.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.age}y, {patient.gender}</p>
                    </div>
                  </div>
                  {patient.constitution?.primary_dosha && (
                    <Badge variant="secondary">{patient.constitution.primary_dosha}</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentCharts({ charts }: { charts: DietChart[] }) {
  const recent = charts.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-3">
        <CardTitle className="text-base">Recent Diet Charts</CardTitle>
        <Link href="/diet-charts">
          <Button variant="ghost" size="sm" data-testid="link-view-all-charts">
            View all <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No diet charts yet</p>
        ) : (
          <div className="space-y-3">
            {recent.map((chart) => (
              <Link key={chart.id} href={`/diet-charts/${chart.id}`}>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-md hover-elevate cursor-pointer" data-testid={`card-chart-${chart.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{chart.chartType} Chart</p>
                      <p className="text-xs text-muted-foreground">{chart.durationDays} days</p>
                    </div>
                  </div>
                  <Badge variant={chart.status === "active" ? "default" : "secondary"}>
                    {chart.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: patients = [], isLoading: pLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  const { data: charts = [], isLoading: cLoading } = useQuery<DietChart[]>({
    queryKey: ["/api/diet-charts"],
  });
  const { data: foods = [], isLoading: fLoading } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
  });

  const isLoading = pLoading || cLoading || fLoading;
  const activeCharts = charts.filter((c) => c.status === "active").length;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to AyurDiet AI - Ayurvedic Diet Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          description="Registered patients"
          color="bg-primary"
        />
        <StatCard
          title="Active Charts"
          value={activeCharts}
          icon={ClipboardList}
          description="Currently active"
          color="bg-chart-2"
        />
        <StatCard
          title="Food Items"
          value={foods.length}
          icon={Leaf}
          description="In Ayurvedic database"
          color="bg-chart-4"
        />
        <StatCard
          title="AI Confidence"
          value={charts.length > 0 ? `${Math.round((charts.reduce((a, c) => a + (c.aiConfidence || 0), 0) / charts.length) * 100)}%` : "N/A"}
          icon={Sparkles}
          description="Avg recommendation"
          color="bg-chart-5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DoshaDistribution patients={patients} />
        <RecentPatients patients={patients} />
        <RecentCharts charts={charts} />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-primary">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Generate a New Diet Chart</h3>
                <p className="text-sm text-muted-foreground">Use AI to create a personalized Ayurvedic diet plan</p>
              </div>
            </div>
            <Link href="/generate">
              <Button data-testid="button-generate-diet">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Diet Chart
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
