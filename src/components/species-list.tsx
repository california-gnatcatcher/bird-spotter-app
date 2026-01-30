"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { HotspotData } from "@/lib/types";
import { Feather, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SpeciesListProps = {
  data: HotspotData;
  softError: string | null;
};

export default function SpeciesList({ data, softError }: SpeciesListProps) {
  const speciesAnalysis = data.speciesAnalysis || [];
  const { toast } = useToast();
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const getId = (s: any) => s.speciesCode || s.commonName;

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const enterSelectMode = () => setIsSelectMode(true);

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelected(new Set());
  };

  const selectAll = () =>
    setSelected(new Set(speciesAnalysis.map((s) => getId(s))));
  const clearAll = () => setSelected(new Set());

  const buildCopyText = () => {
    const hotspotTitle = data.hotspotInfo.locName;

    const chosen = speciesAnalysis.filter((s) => selected.has(getId(s)));

    const lines = chosen.map((s: any) => {
      const { commonName, checklistCount, lastObsDt } = s;

      const frequencyPercent =
        data.totalChecklists > 0
          ? Math.round((checklistCount / data.totalChecklists) * 100)
          : 0;

      const lastSeen = lastObsDt ? lastObsDt.split(" ")[0] : "N/A";

      return `${commonName} — ${frequencyPercent}% (${checklistCount}/${data.totalChecklists}), last seen ${lastSeen}`;
    });

    return [hotspotTitle, ...lines].join("\n");
  };

  const copyNames = async () => {
    try {
      const text = buildCopyText();
      await navigator.clipboard.writeText(text);

      toast({
        title: "Copied!",
        description: `Copied ${selected.size} species lines + hotspot title.`,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard access was blocked by the browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">
            {data.hotspotInfo.locName}
          </CardTitle>
          <CardDescription>
            {data.hotspotInfo.subnational1Name}, {data.hotspotInfo.countryName}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="font-headline">
              Recent Species Analysis
            </CardTitle>

            <div className="flex items-center gap-2">
              {!isSelectMode ? (
                <button
                  className="px-3 py-2 rounded-md border hover:bg-accent/40 transition"
                  onClick={enterSelectMode}
                >
                  Export…
                </button>
              ) : (
                <button
                  className="px-3 py-2 rounded-md border hover:bg-accent/40 transition"
                  onClick={exitSelectMode}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <CardDescription>
            Analysis from the {data.totalChecklists} most recent checklists.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {softError && (
            <Alert className="mb-4 bg-accent/50">
              <Feather className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>{softError}</AlertDescription>
            </Alert>
          )}

          {/* ✅ 3) 选择模式工具条（只在选择模式显示） */}
          {isSelectMode && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-accent/20">
              <span className="text-sm font-semibold">
                Select species to copy names
              </span>
              <span className="text-sm text-muted-foreground">
                Selected: {selected.size}
              </span>

              <button
                className="ml-auto px-3 py-1.5 rounded-md border hover:bg-accent/40 transition text-sm"
                onClick={selectAll}
                disabled={speciesAnalysis.length === 0}
              >
                Select all
              </button>
              <button
                className="px-3 py-1.5 rounded-md border hover:bg-accent/40 transition text-sm"
                onClick={clearAll}
                disabled={selected.size === 0}
              >
                Clear
              </button>
              <button
                className="px-3 py-1.5 rounded-md border bg-primary text-primary-foreground hover:opacity-90 transition text-sm disabled:opacity-50"
                onClick={copyNames}
                disabled={selected.size === 0}
              >
                Copy
              </button>
            </div>
          )}

          {speciesAnalysis.length > 0 ? (
            <ul className="space-y-4">
              {speciesAnalysis.map((species: any, i: number) => {
                const {
                  commonName,
                  checklistCount,
                  totalAbundance,
                  isRare,
                  lastObsDt,
                } = species;
                const id = getId(species);
                const ebirdUrl = species.speciesCode
                  ? `https://ebird.org/species/${species.speciesCode}`
                  : null;

                const frequencyPercent =
                  data.totalChecklists > 0
                    ? Math.round((checklistCount / data.totalChecklists) * 100)
                    : 0;

                return (
                  <li
                    key={id || i}
                    className={`border p-4 rounded-lg transition-all duration-300 ${
                      isRare
                        ? "bg-gradient-to-br from-orange-200/60 via-orange-100/40 to-background border-orange-300 shadow-md shadow-orange-100/50"
                        : "bg-background hover:bg-accent/30 border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        {isSelectMode && (
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4"
                            checked={selected.has(id)}
                            onChange={() => toggleOne(id)}
                          />
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {!isSelectMode && ebirdUrl ? (
                                <a
                                  href={ebirdUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-bold text-lg underline-offset-4 hover:underline ${
                                    isRare
                                      ? "text-orange-950"
                                      : "text-primary/90"
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {commonName}
                                </a>
                              ) : (
                                <h3
                                  className={`font-bold text-lg ${isRare ? "text-orange-950" : "text-primary/90"}`}
                                >
                                  {commonName}
                                </h3>
                              )}

                              {!isSelectMode && ebirdUrl && (
                                <a
                                  href={ebirdUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded hover:bg-accent/40 transition"
                                  aria-label="Open in eBird"
                                  title="Open in eBird"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4 opacity-70 hover:opacity-100" />
                                </a>
                              )}
                            </div>

                            {isRare && (
                              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black shadow-sm uppercase tracking-wider">
                                Rare
                              </span>
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-1 text-[11px] ${
                              isRare
                                ? "text-orange-800/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            Last seen:{" "}
                            {lastObsDt ? lastObsDt.split(" ")[0] : "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${isRare ? "text-orange-700" : "text-primary"}`}
                        >
                          {totalAbundance.toLocaleString()}
                        </div>
                        <div
                          className={`text-[10px] uppercase tracking-widest ${
                            isRare
                              ? "text-orange-800/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          Total Seen
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <div
                        className={`flex-1 h-2 rounded-full overflow-hidden ${isRare ? "bg-orange-950/10" : "bg-accent"}`}
                      >
                        <div
                          className={`h-full transition-all duration-1000 ${isRare ? "bg-orange-500" : "bg-primary/60"}`}
                          style={{ width: `${frequencyPercent}%` }}
                        />
                      </div>
                      <p
                        className={`text-sm whitespace-nowrap ${isRare ? "text-orange-900/80" : "text-muted-foreground"}`}
                      >
                        <span
                          className={`font-bold ${isRare ? "text-orange-950" : "text-foreground"}`}
                        >
                          {frequencyPercent}%
                        </span>{" "}
                        frequency <span className="mx-1 opacity-50">|</span>
                        {checklistCount}/{data.totalChecklists} lists
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                No species observations found in the recent checklists for this
                hotspot.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
