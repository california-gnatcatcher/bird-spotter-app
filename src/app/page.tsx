"use client";

import { useState } from "react";
import { Bird, Loader2, Search } from "lucide-react";
import { getHotspotData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { HotspotData } from "@/lib/types";
import SpeciesList from "@/components/species-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [hotspotId, setHotspotId] = useState("");
  const [data, setData] = useState<HotspotData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [softError, setSoftError] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState(20);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSoftError(null);
    setData(null);

    const result = await getHotspotData(hotspotId.trim(), maxResults);

    if (result.error) {
      if (result.data) {
        setSoftError(result.error);
        setData(result.data);
      } else {
        setError(result.error);
      }
    } else if (result.data) {
      // Log the data as soon as it's received
      console.log("--- Full Server Response (for debugging) ---", result.data);
      if (result.data.speciesAnalysis) {
        console.log(
          "--- Server response for speciesAnalysis ---",
          result.data.speciesAnalysis,
        );
      }
      setData(result.data);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center justify-center gap-3 text-primary">
            <Bird className="w-10 h-10" />
            eBird Spotter
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Get recent bird sightings from your favorite eBird hotspots. Just
            enter a hotspot ID to begin.
          </p>
        </header>

        <Card className="max-w-2xl mx-auto shadow-md border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline">Search Hotspot</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                type="text"
                value={hotspotId}
                onChange={(e) => setHotspotId(e.target.value)}
                placeholder="Enter eBird Hotspot ID (e.g., L203425)"
                className="flex-grow"
                aria-label="eBird Hotspot ID"
              />
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="h-10 rounded-md border bg-background px-3 text-sm sm:w-[140px]"
                aria-label="Number of checklists"
                disabled={isLoading}
              >
                {[10, 20, 30, 40].map((n) => (
                  <option key={n} value={n}>
                    {n} lists
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                disabled={isLoading || !hotspotId}
                className="w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                <span className="ml-2">Search</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="max-w-4xl mx-auto mt-8">
          {isLoading && (
            <div className="space-y-8 mt-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border p-4 rounded-lg">
                      <Skeleton className="h-6 w-1/2 mb-2 rounded-md" />
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {data && <SpeciesList data={data} softError={softError} />}
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Powered by the eBird API. Made with Next.js.</p>
      </footer>
    </div>
  );
}
