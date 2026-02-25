import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Users, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import type { Patient } from "@/types/schema";

function AddPatientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", age: "", gender: "male", weight: "", height: "", phone: "", email: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/patients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      onOpenChange(false);
      setForm({ name: "", age: "", gender: "male", weight: "", height: "", phone: "", email: "" });
      toast({ title: "Patient added successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add patient", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      phone: form.phone || null,
      email: form.email || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-patient-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required data-testid="input-patient-age" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger data-testid="select-patient-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} data-testid="input-patient-weight" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" step="0.1" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} data-testid="input-patient-height" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="input-patient-phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-patient-email" />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-patient">
            {mutation.isPending ? "Adding..." : "Add Patient"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-patients-title">Patients</h1>
          <p className="text-muted-foreground">Manage patient profiles and Ayurvedic assessments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-patient">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-patients"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No patients found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try a different search term" : "Add your first patient to get started"}
            </p>
            {!search && (
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-patient">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="cursor-pointer hover-elevate transition-all" data-testid={`card-patient-${patient.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-semibold">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{patient.name}</h3>
                        <p className="text-xs text-muted-foreground">{patient.age} years, {patient.gender}</p>
                      </div>
                    </div>
                    {patient.constitution?.primary_dosha && (
                      <Badge variant="secondary">{patient.constitution.primary_dosha}</Badge>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {patient.weight && patient.height && (
                      <p>{patient.weight} kg / {patient.height} cm</p>
                    )}
                    {patient.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    {patient.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                  </div>
                  {patient.constitution && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex gap-1.5 flex-wrap">
                        {Object.entries(patient.constitution.scores || {}).map(([dosha, score]) => (
                          <Badge key={dosha} variant="outline" className="text-xs">
                            {dosha}: {Math.round((score as number) * 100)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AddPatientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
