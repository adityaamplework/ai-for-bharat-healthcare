import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Leaf, Flame, Droplets, Wind, Clock } from "lucide-react";
import type { Food } from "@/types/schema";

const doshaColorMap: Record<string, string> = {
  increases: "destructive",
  decreases: "default",
  neutral: "secondary",
};

function FoodCard({ food }: { food: Food }) {
  return (
    <Card className="hover-elevate" data-testid={`card-food-${food.id}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm">{food.name}</h3>
            {food.nameHindi && (
              <p className="text-xs text-muted-foreground">{food.nameHindi}</p>
            )}
          </div>
          {food.foodCategory && (
            <Badge variant="outline" className="text-xs capitalize">{food.foodCategory}</Badge>
          )}
        </div>

        {food.rasa && food.rasa.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Rasa (Taste)</p>
            <div className="flex gap-1 flex-wrap">
              {food.rasa.map((r, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 text-xs">
          {food.virya && (
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>{food.virya}</span>
            </div>
          )}
          {food.vipaka && (
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              <span>{food.vipaka}</span>
            </div>
          )}
          {food.preparationTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{food.preparationTime}m</span>
            </div>
          )}
        </div>

        {food.doshaEffects && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Dosha Effects</p>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(food.doshaEffects).map(([dosha, effect]) => (
                <Badge
                  key={dosha}
                  variant={doshaColorMap[effect] as any || "outline"}
                  className="text-xs"
                >
                  {dosha}: {effect}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {food.nutritionalData && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">Per 100g</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs font-medium">{food.nutritionalData.calories}</p>
                <p className="text-xs text-muted-foreground">Cal</p>
              </div>
              <div>
                <p className="text-xs font-medium">{food.nutritionalData.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-xs font-medium">{food.nutritionalData.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div>
                <p className="text-xs font-medium">{food.nutritionalData.fat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </div>
        )}

        {food.seasonalAvailability && food.seasonalAvailability.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {food.seasonalAvailability.map((s, i) => (
              <Badge key={i} variant="outline" className="text-xs capitalize">{s}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Foods() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [doshaFilter, setDoshaFilter] = useState("all");

  const { data: foods = [], isLoading } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
  });

  const categories = [...new Set(foods.map((f) => f.foodCategory).filter(Boolean))];

  const filtered = foods.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.nameHindi && f.nameHindi.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || f.foodCategory === categoryFilter;
    const matchesDosha = doshaFilter === "all" || (f.doshaEffects && (f.doshaEffects as any)[doshaFilter.toLowerCase()] === "decreases");
    return matchesSearch && matchesCategory && matchesDosha;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-52" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-foods-title">Ayurvedic Food Database</h1>
        <p className="text-muted-foreground">Browse foods with their Ayurvedic properties and nutritional information</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-foods"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40" data-testid="select-food-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c!} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={doshaFilter} onValueChange={setDoshaFilter}>
          <SelectTrigger className="w-40" data-testid="select-food-dosha">
            <SelectValue placeholder="Dosha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doshas</SelectItem>
            <SelectItem value="Vata">Good for Vata</SelectItem>
            <SelectItem value="Pitta">Good for Pitta</SelectItem>
            <SelectItem value="Kapha">Good for Kapha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} food{filtered.length !== 1 ? "s" : ""} found</p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No foods found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
