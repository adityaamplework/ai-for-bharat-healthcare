import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Utensils, AlertTriangle, Sparkles, Activity, Leaf } from "lucide-react";
import type { DietChart, Patient } from "@/types/schema";

export default function DietChartDetail() {
  const [, params] = useRoute("/diet-charts/:id");
  const chartId = params?.id;

  const { data: chart, isLoading } = useQuery<DietChart>({
    queryKey: ["/api/diet-charts", chartId],
    enabled: !!chartId,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Diet chart not found</p>
        <Link href="/diet-charts">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Diet Charts
          </Button>
        </Link>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === chart.patientId);

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center gap-4">
        <Link href="/diet-charts">
          <Button variant="ghost" size="icon" data-testid="button-back-charts">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight capitalize" data-testid="text-chart-title">
            {chart.chartType} Diet Chart
          </h1>
          <p className="text-muted-foreground">
            {patient ? `For ${patient.name}` : ""} - {chart.durationDays} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={chart.status === "active" ? "default" : "secondary"}>{chart.status}</Badge>
          {chart.aiConfidence && (
            <Badge variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              {Math.round(chart.aiConfidence * 100)}% AI Confidence
            </Badge>
          )}
        </div>
      </div>

      {chart.ayurvedicAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Ayurvedic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Dosha Balance:</span>
                <span className="ml-2 font-medium">{chart.ayurvedicAnalysis.doshaBalance}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Seasonal Alignment:</span>
                <span className="ml-2 font-medium">{chart.ayurvedicAnalysis.seasonalAlignment}</span>
              </div>
            </div>
            {chart.ayurvedicAnalysis.rasaBalance && (
              <div>
                <span className="text-sm text-muted-foreground">Rasa Balance:</span>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {chart.ayurvedicAnalysis.rasaBalance.map((r, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
            {chart.ayurvedicAnalysis.therapeuticBenefits && (
              <div>
                <span className="text-sm text-muted-foreground">Therapeutic Benefits:</span>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {chart.ayurvedicAnalysis.therapeuticBenefits.map((b, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {chart.nutritionalAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Nutritional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{chart.nutritionalAnalysis.totalCalories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{chart.nutritionalAnalysis.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{chart.nutritionalAnalysis.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{chart.nutritionalAnalysis.fat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{chart.nutritionalAnalysis.fiber}g</p>
                <p className="text-xs text-muted-foreground">Fiber</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {chart.chartData?.meals && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Meal Plan</h2>
          {chart.chartData.meals.map((meal, i) => (
            <Card key={i} data-testid={`card-meal-${i}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{meal.type}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {meal.time}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {meal.foods.map((food, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/30">
                      <Leaf className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{food.name}</span>
                        {food.quantity && <span className="text-muted-foreground ml-1">({food.quantity})</span>}
                        {food.preparation && (
                          <p className="text-xs text-muted-foreground mt-0.5">{food.preparation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {meal.notes && (
                  <p className="text-xs text-muted-foreground mt-3 italic">{meal.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {chart.chartData?.guidelines && chart.chartData.guidelines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dietary Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {chart.chartData.guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {chart.chartData?.avoidFoods && chart.chartData.avoidFoods.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Foods to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1.5 flex-wrap">
              {chart.chartData.avoidFoods.map((f, i) => (
                <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            This diet chart is generated by AI and should be reviewed by a qualified Ayurvedic practitioner.
            It is not a substitute for professional medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
