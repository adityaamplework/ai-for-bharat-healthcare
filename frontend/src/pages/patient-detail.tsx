import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Activity, Utensils, ClipboardList, Heart, Sparkles } from "lucide-react";
import type { Patient, DietChart } from "@/types/schema";

function DoshaChart({ scores }: { scores: { Vata: number; Pitta: number; Kapha: number } }) {
  const doshaInfo: Record<string, { color: string; desc: string }> = {
    Vata: { color: "bg-chart-4", desc: "Air & Space - Movement" },
    Pitta: { color: "bg-chart-3", desc: "Fire & Water - Transformation" },
    Kapha: { color: "bg-chart-2", desc: "Earth & Water - Structure" },
  };

  return (
    <div className="space-y-3">
      {Object.entries(scores).map(([dosha, score]) => (
        <div key={dosha} className="space-y-1.5">
          <div className="flex items-center justify-between gap-1 text-sm">
            <div>
              <span className="font-medium">{dosha}</span>
              <span className="text-muted-foreground ml-2 text-xs">{doshaInfo[dosha]?.desc}</span>
            </div>
            <span className="font-medium">{Math.round(score * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${doshaInfo[dosha]?.color} transition-all duration-700`}
              style={{ width: `${score * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const patientId = params?.id;

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: charts = [] } = useQuery<DietChart[]>({
    queryKey: ["/api/diet-charts"],
  });

  const patientCharts = charts.filter((c) => c.patientId === parseInt(patientId || "0"));

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Patient not found</p>
        <Link href="/patients">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon" data-testid="button-back-patients">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-patient-name">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.age} years, {patient.gender}</p>
        </div>
        {patient.constitution?.primary_dosha && (
          <Badge className="ml-auto">{patient.constitution.constitution_type}</Badge>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="constitution" data-testid="tab-constitution">Constitution</TabsTrigger>
          <TabsTrigger value="diet" data-testid="tab-diet">Diet Charts</TabsTrigger>
          <TabsTrigger value="lifestyle" data-testid="tab-lifestyle">Lifestyle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                <p className="text-xl font-bold">{patient.weight ? `${patient.weight} kg` : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Height</p>
                <p className="text-xl font-bold">{patient.height ? `${patient.height} cm` : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">BMI</p>
                <p className="text-xl font-bold">
                  {patient.weight && patient.height
                    ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1)
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Diet Charts</p>
                <p className="text-xl font-bold">{patientCharts.length}</p>
              </CardContent>
            </Card>
          </div>

          {patient.allergies && patient.allergies.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Allergies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1.5 flex-wrap">
                  {patient.allergies.map((a, i) => (
                    <Badge key={i} variant="destructive">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {patient.medicalHistory?.conditions && patient.medicalHistory.conditions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1.5 flex-wrap">
                  {patient.medicalHistory.conditions.map((c, i) => (
                    <Badge key={i} variant="outline">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="constitution" className="space-y-4 mt-4">
          {patient.constitution ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Dosha Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DoshaChart scores={patient.constitution.scores} />
                  <div className="mt-4 flex items-center gap-2">
                    <Badge>{patient.constitution.constitution_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(patient.constitution.confidence * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {patient.currentImbalance && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Current Imbalance (Vikriti)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{patient.currentImbalance.dosha}</Badge>
                      <Badge variant={patient.currentImbalance.severity === "high" ? "destructive" : "outline"}>
                        {patient.currentImbalance.severity}
                      </Badge>
                    </div>
                    {patient.currentImbalance.symptoms.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {patient.currentImbalance.symptoms.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No Constitution Assessment</h3>
                <p className="text-sm text-muted-foreground mb-4">Take a Prakriti assessment to determine dosha profile</p>
                <Link href="/assessment">
                  <Button data-testid="button-take-assessment">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diet" className="space-y-4 mt-4">
          {patientCharts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No Diet Charts</h3>
                <p className="text-sm text-muted-foreground mb-4">Generate a personalized diet chart for this patient</p>
                <Link href="/generate">
                  <Button data-testid="button-generate-diet-patient">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Diet Chart
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            patientCharts.map((chart) => (
              <Link key={chart.id} href={`/diet-charts/${chart.id}`}>
                <Card className="cursor-pointer hover-elevate" data-testid={`card-chart-${chart.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold capitalize">{chart.chartType} Diet Chart</h3>
                        <p className="text-sm text-muted-foreground">{chart.durationDays} days - Created {new Date(chart.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={chart.status === "active" ? "default" : "secondary"}>{chart.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.lifestyleFactors && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lifestyle Factors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Activity Level</span><span className="capitalize">{patient.lifestyleFactors.activity_level}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sleep Pattern</span><span className="capitalize">{patient.lifestyleFactors.sleep_pattern}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stress Level</span><span className="capitalize">{patient.lifestyleFactors.stress_level}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Occupation</span><span className="capitalize">{patient.lifestyleFactors.occupation}</span></div>
                </CardContent>
              </Card>
            )}
            {patient.dietaryHabits && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Dietary Habits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Meals/Day</span><span>{patient.dietaryHabits.meal_frequency}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Schedule</span><span className="capitalize">{patient.dietaryHabits.eating_schedule}</span></div>
                  <div>
                    <span className="text-muted-foreground">Preferred Cuisine</span>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {patient.dietaryHabits.preferred_cuisine.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {patient.foodPreferences && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Food Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    {patient.foodPreferences.vegetarian && <Badge variant="secondary">Vegetarian</Badge>}
                    {patient.foodPreferences.vegan && <Badge variant="secondary">Vegan</Badge>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {!patient.lifestyleFactors && !patient.dietaryHabits && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No lifestyle information recorded</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
