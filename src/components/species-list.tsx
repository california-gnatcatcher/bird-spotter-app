'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { HotspotData } from '@/lib/types';
import { Feather, Clock } from 'lucide-react';

type SpeciesListProps = {
    data: HotspotData;
    softError: string | null;
}

export default function SpeciesList({ data, softError }: SpeciesListProps) {
    const speciesAnalysis = data.speciesAnalysis || [];

    return (
        <div className="space-y-8 animate-in fade-in-0 duration-500">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline">{data.hotspotInfo.locName}</CardTitle>
                    <CardDescription>{data.hotspotInfo.subnational1Name}, {data.hotspotInfo.countryName}</CardDescription>
                </CardHeader>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <CardTitle className="font-headline">Recent Species Analysis</CardTitle>
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
                    {speciesAnalysis.length > 0 ? (
                        <ul className="space-y-4">
                            {speciesAnalysis.map((species, i) => {
    const { commonName, checklistCount, totalAbundance, isRare, lastObsDt } = species;
    
    const frequencyPercent = data.totalChecklists > 0 
        ? Math.round((checklistCount / data.totalChecklists) * 100) 
        : 0;

    return (
        <li 
            key={species.speciesCode || i} 
            className={`border p-4 rounded-lg transition-all duration-300 ${
                isRare 
                ? "bg-gradient-to-br from-orange-200/60 via-orange-100/40 to-background border-orange-300 shadow-md shadow-orange-100/50" 
                : "bg-background hover:bg-accent/30 border-border"
            }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${isRare ? "text-orange-950" : "text-primary/90"}`}>
                            {commonName}
                        </h3>
                        {isRare && (
                            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black shadow-sm uppercase tracking-wider">
                                Rare
                            </span>
                        )}
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] ${isRare ? "text-orange-800/70" : "text-muted-foreground"}`}>
                        <Clock className="h-3 w-3" />
                        Last seen: {lastObsDt ? lastObsDt.split(' ')[0] : 'N/A'}
                    </div>
                </div>
                
                <div className="text-right">
                    <div className={`text-2xl font-bold ${isRare ? "text-orange-700" : "text-primary"}`}>
                        {totalAbundance.toLocaleString()}
                    </div>
                    <div className={`text-[10px] uppercase tracking-widest ${isRare ? "text-orange-800/60" : "text-muted-foreground"}`}>
                        Total Seen
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isRare ? "bg-orange-950/10" : "bg-accent"}`}>
                    <div 
                        className={`h-full transition-all duration-1000 ${isRare ? "bg-orange-500" : "bg-primary/60"}`} 
                        style={{ width: `${frequencyPercent}%` }}
                    />
                </div>
                <p className={`text-sm whitespace-nowrap ${isRare ? "text-orange-900/80" : "text-muted-foreground"}`}>
                    <span className={`font-bold ${isRare ? "text-orange-950" : "text-foreground"}`}>{frequencyPercent}%</span> frequency 
                    <span className="mx-1 opacity-50">|</span>
                    {checklistCount}/{data.totalChecklists} lists
                </p>
            </div>
        </li>
    );
})}
                        </ul>
                    ) : (
                         <div className="text-center py-8 text-muted-foreground">
                            <p>No species observations found in the recent checklists for this hotspot.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
