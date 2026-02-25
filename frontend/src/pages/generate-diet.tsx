import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Sparkles, Loader2, Users, AlertTriangle, Leaf, Activity, CheckCircle } from "lucide-react";
import type { Patient } from "@/types/schema";

export default function GenerateDiet() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [chartType, setChartType] = useState("maintenance");
  const [duration, setDuration] = useState("7");
  const [season, setSeason] = useState("summer");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const selectedPatientData = patients.find((p) => p.id === parseInt(selectedPatient));

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/diet-charts/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/diet-charts"] });
      toast({ title: "Diet chart generated successfully!" });
      navigate(`/diet-charts/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to generate diet chart", description: err.message, variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    if (!selectedPatient) {
      toast({ title: "Please select a patient", variant: "destructive" });
      return;
    }
    generateMutation.mutate({
      patientId: parseInt(selectedPatient),
      chartType,
      durationDays: parseInt(duration),
      season,
      additionalNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-generate-title">Generate Diet Chart</h1>
        <p className="text-muted-foreground">Create a personalized Ayurvedic diet chart using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">No patients available</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/patients")}>
                    Add Patient First
                  </Button>
                </div>
              ) : (
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger data-testid="select-generate-patient">
                    <SelectValue placeholder="Choose a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} - {p.age}y, {p.gender}
                        {p.constitution?.primary_dosha ? ` (${p.constitution.primary_dosha})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Chart Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger data-testid="select-chart-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapeutic">Therapeutic</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="detox">Detox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger data-testid="select-season">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring (Vasant)</SelectItem>
                      <SelectItem value="summer">Summer (Grishma)</SelectItem>
                      <SelectItem value="monsoon">Monsoon (Varsha)</SelectItem>
                      <SelectItem value="autumn">Autumn (Sharad)</SelectItem>
                      <SelectItem value="early_winter">Early Winter (Hemant)</SelectItem>
                      <SelectItem value="late_winter">Late Winter (Shishir)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any specific requirements, preferences, or health goals..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                  data-testid="textarea-additional-notes"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  AI-generated diet charts are based on Ayurvedic principles and the patient's profile.
                  They should be reviewed by a qualified practitioner before implementation.
                  This is not a substitute for professional medical advice.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={!selectedPatient || generateMutation.isPending}
            data-testid="button-generate-chart"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Diet Chart...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Diet Chart
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {selectedPatientData ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Patient Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-semibold text-sm">
                      {selectedPatientData.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedPatientData.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedPatientData.age}y, {selectedPatientData.gender}</p>
                    </div>
                  </div>
                  {selectedPatientData.weight && selectedPatientData.height && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">BMI: </span>
                      <span className="font-medium">
                        {(selectedPatientData.weight / ((selectedPatientData.height / 100) ** 2)).toFixed(1)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedPatientData.constitution && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Constitution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge>{selectedPatientData.constitution.constitution_type}</Badge>
                    <div className="space-y-1.5">
                      {Object.entries(selectedPatientData.constitution.scores).map(([dosha, score]) => {
                        const colors: Record<string, string> = { Vata: "bg-chart-4", Pitta: "bg-chart-3", Kapha: "bg-chart-2" };
                        return (
                          <div key={dosha} className="space-y-0.5">
                            <div className="flex justify-between text-xs">
                              <span>{dosha}</span>
                              <span>{Math.round((score as number) * 100)}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted">
                              <div className={`h-full rounded-full ${colors[dosha]}`} style={{ width: `${(score as number) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!selectedPatientData.constitution && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No Prakriti assessment. The AI will estimate the constitution.
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedPatientData.allergies && selectedPatientData.allergies.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1 flex-wrap">
                      {selectedPatientData.allergies.map((a, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a patient to see their profile
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
