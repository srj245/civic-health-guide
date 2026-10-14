import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CareResult } from "@/hooks/useCareFinder";
import { useToast } from "@/hooks/use-toast";

export interface FavoriteFacility {
  id: string;
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("favorite_facilities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFavorites(data as FavoriteFacility[]);
      setFavoriteIds(new Set(data.map((f) => f.place_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (result: CareResult) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Create an account to save favorites.", variant: "destructive" });
      return;
    }

    const isFaved = favoriteIds.has(result.id);

    if (isFaved) {
      const { error } = await supabase
        .from("favorite_facilities")
        .delete()
        .eq("user_id", user.id)
        .eq("place_id", result.id);

      if (!error) {
        setFavoriteIds((prev) => { const next = new Set(prev); next.delete(result.id); return next; });
        setFavorites((prev) => prev.filter((f) => f.place_id !== result.id));
        toast({ title: "Removed from favorites" });
      }
    } else {
      const { error } = await supabase
        .from("favorite_facilities")
        .insert({
          user_id: user.id,
          place_id: result.id,
          name: result.name,
          address: result.address,
          rating: result.rating,
          lat: result.lat,
          lng: result.lng,
        });

      if (!error) {
        setFavoriteIds((prev) => new Set(prev).add(result.id));
        fetchFavorites();
        toast({ title: "Saved to favorites" });
      }
    }
  };

  const isFavorite = (placeId: string) => favoriteIds.has(placeId);

  return { favorites, loading, toggleFavorite, isFavorite, fetchFavorites };
}
