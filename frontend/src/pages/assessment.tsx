import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import type { Patient } from "@/types/schema";

const prakritiQuestions = [
  {
    id: "body_frame",
    category: "Physical",
    question: "What best describes your body frame?",
    options: [
      { text: "Thin, light, tall or short, difficulty gaining weight", vata: 3, pitta: 0, kapha: 0 },
      { text: "Medium build, moderate weight, athletic", vata: 0, pitta: 3, kapha: 0 },
      { text: "Large, broad, solid build, gains weight easily", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "skin_type",
    category: "Physical",
    question: "How would you describe your skin?",
    options: [
      { text: "Dry, rough, thin, cool to touch", vata: 3, pitta: 0, kapha: 0 },
      { text: "Warm, oily, sensitive, prone to rashes", vata: 0, pitta: 3, kapha: 0 },
      { text: "Thick, smooth, cool, well-lubricated", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "appetite",
    category: "Digestion",
    question: "How is your appetite?",
    options: [
      { text: "Variable, sometimes strong, sometimes weak", vata: 3, pitta: 0, kapha: 0 },
      { text: "Strong, gets irritable if meals are missed", vata: 0, pitta: 3, kapha: 0 },
      { text: "Steady but moderate, can skip meals easily", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "digestion",
    category: "Digestion",
    question: "How is your digestion?",
    options: [
      { text: "Irregular, prone to gas and bloating", vata: 3, pitta: 0, kapha: 0 },
      { text: "Strong, can digest almost anything, prone to acidity", vata: 0, pitta: 3, kapha: 0 },
      { text: "Slow but steady, heavy feeling after meals", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "sleep_pattern",
    category: "Lifestyle",
    question: "How do you sleep?",
    options: [
      { text: "Light, restless, often waking up, difficulty falling asleep", vata: 3, pitta: 0, kapha: 0 },
      { text: "Moderate, wake up easily, 6-7 hours sufficient", vata: 0, pitta: 3, kapha: 0 },
      { text: "Deep, heavy sleeper, hard to wake up, love sleeping long", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "temperature",
    category: "Physical",
    question: "What is your temperature preference?",
    options: [
      { text: "Dislike cold, love warmth and sunshine", vata: 3, pitta: 0, kapha: 0 },
      { text: "Dislike heat, prefer cool environments", vata: 0, pitta: 3, kapha: 0 },
      { text: "Tolerate most temperatures, mild dislike of cold and damp", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "mental_activity",
    category: "Mental",
    question: "How would you describe your mental activity?",
    options: [
      { text: "Quick, restless mind, many ideas, hard to focus", vata: 3, pitta: 0, kapha: 0 },
      { text: "Sharp, focused, goal-oriented, competitive", vata: 0, pitta: 3, kapha: 0 },
      { text: "Calm, steady, thoughtful, methodical", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "stress_response",
    category: "Mental",
    question: "How do you respond to stress?",
    options: [
      { text: "Anxiety, worry, fear, nervous energy", vata: 3, pitta: 0, kapha: 0 },
      { text: "Anger, irritability, impatience, frustration", vata: 0, pitta: 3, kapha: 0 },
      { text: "Withdrawal, lethargy, comfort eating, avoidance", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "thirst",
    category: "Digestion",
    question: "How is your thirst?",
    options: [
      { text: "Variable, forget to drink water sometimes", vata: 3, pitta: 0, kapha: 0 },
      { text: "Strong, need to drink frequently", vata: 0, pitta: 3, kapha: 0 },
      { text: "Moderate, not excessively thirsty", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
  {
    id: "speech",
    category: "Mental",
    question: "How would you describe your speech?",
    options: [
      { text: "Fast, talkative, may go off topic", vata: 3, pitta: 0, kapha: 0 },
      { text: "Precise, sharp, convincing, argumentative", vata: 0, pitta: 3, kapha: 0 },
      { text: "Slow, melodious, thoughtful, fewer words", vata: 0, pitta: 0, kapha: 3 },
    ],
  },
];

function ResultView({ result, onReset }: { result: any; onReset: () => void }) {
  const doshaDescriptions: Record<string, string> = {
    Vata: "Air & Space element. Creative, energetic, quick-thinking. Needs warmth, routine, and grounding foods.",
    Pitta: "Fire & Water element. Focused, ambitious, strong digestion. Needs cooling, calming foods and activities.",
    Kapha: "Earth & Water element. Steady, nurturing, strong endurance. Needs stimulating, light, and warming foods.",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" data-testid="text-constitution-type">
            Your Constitution: {result.constitution_type}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {doshaDescriptions[result.primary_dosha]}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge>Primary: {result.primary_dosha}</Badge>
            {result.secondary_dosha && (
              <Badge variant="secondary">Secondary: {result.secondary_dosha}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Confidence: {Math.round(result.confidence * 100)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dosha Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(result.scores as Record<string, number>).map(([dosha, score]) => {
            const colors: Record<string, string> = { Vata: "bg-chart-4", Pitta: "bg-chart-3", Kapha: "bg-chart-2" };
            return (
              <div key={dosha} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dosha}</span>
                  <span>{Math.round(score * 100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className={`h-full rounded-full ${colors[dosha]} transition-all duration-700`} style={{ width: `${score * 100}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {result.recommendations && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button onClick={onReset} variant="outline" className="w-full" data-testid="button-retake-assessment">
        Take Assessment Again
      </Button>
    </div>
  );
}

export default function Assessment() {
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [started, setStarted] = useState(false);

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const assessMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/prakriti-assessment", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Assessment completed!" });
    },
    onError: (err: Error) => {
      toast({ title: "Assessment failed", description: err.message, variant: "destructive" });
    },
  });

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQ]: optionIndex });
  };

  const handleNext = () => {
    if (currentQ < prakritiQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const responses = prakritiQuestions.map((q, i) => ({
        questionId: q.id,
        answer: q.options[answers[i] || 0].text,
        score: {
          vata: q.options[answers[i] || 0].vata,
          pitta: q.options[answers[i] || 0].pitta,
          kapha: q.options[answers[i] || 0].kapha,
        },
      }));
      assessMutation.mutate({
        patientId: selectedPatient ? parseInt(selectedPatient) : null,
        responses,
      });
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setStarted(false);
  };

  const progress = ((currentQ + 1) / prakritiQuestions.length) * 100;
  const question = prakritiQuestions[currentQ];

  if (result) {
    return (
      <div className="p-6 max-w-2xl mx-auto overflow-auto h-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Assessment Results</h1>
        <ResultView result={result} onReset={handleReset} />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="p-6 max-w-2xl mx-auto overflow-auto h-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-assessment-title">Prakriti Assessment</h1>
            <p className="text-muted-foreground">Determine your Ayurvedic constitution (Prakriti) through this questionnaire</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <FlaskConical className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Discover Your Dosha</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Answer {prakritiQuestions.length} questions about your physical characteristics,
                  digestion, and mental tendencies to determine your unique Ayurvedic constitution.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Link to Patient (optional)</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger data-testid="select-assessment-patient">
                    <SelectValue placeholder="Select a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No patient</SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={() => setStarted(true)} data-testid="button-start-assessment">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto overflow-auto h-full">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h1 className="text-lg font-bold tracking-tight">Prakriti Assessment</h1>
            <span className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {prakritiQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-assessment" />
        </div>

        <Card>
          <CardContent className="p-6">
            <Badge variant="outline" className="mb-3">{question.category}</Badge>
            <h2 className="text-lg font-semibold mb-5" data-testid="text-question">{question.question}</h2>
            <RadioGroup
              value={answers[currentQ]?.toString()}
              onValueChange={(v) => handleAnswer(parseInt(v))}
              className="space-y-3"
            >
              {question.options.map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-3 rounded-md border transition-colors cursor-pointer ${
                    answers[currentQ] === i ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleAnswer(i)}
                >
                  <RadioGroupItem value={i.toString()} id={`opt-${i}`} data-testid={`radio-option-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="text-sm cursor-pointer flex-1">{opt.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            data-testid="button-prev-question"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentQ] === undefined || assessMutation.isPending}
            data-testid="button-next-question"
          >
            {currentQ === prakritiQuestions.length - 1 ? (
              assessMutation.isPending ? "Analyzing..." : "Complete Assessment"
            ) : (
              <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
