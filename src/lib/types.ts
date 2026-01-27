'use server';

// From eBird API /v2/data/obs/{locId}/recent
// Also compatible with observations from /v2/product/checklist/view/{subId}
export interface EbirdObservation {
  speciesCode: string;
  comName: string;
  sciName: string;
  locId?: string;
  locName?: string;
  obsDt: string;
  howMany?: number;
  lat?: number;
  lng?: number;
  obsValid?: boolean;
  obsReviewed?: boolean;
  locationPrivate?: boolean;
  subId: string;
}

// From eBird API /v2/ref/hotspot/info/{locId}
export interface EbirdHotspotInfo {
  locId: string;
  locName: string;
  countryCode: string;
  countryName: string;
  subnational1Code: string;
  subnational1Name: string;
  subnational2Code?: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
}

// From eBird API /v2/product/checklist/loc/{locId}
export interface EbirdChecklistSummary {
  locId: string;
  subId: string;
  userDisplayName: string;
  numSpecies: number;
  obsDt: string;
  obsTime: string;
}

// The result of our local analysis of the observation data.
export type SpeciesFrequencyAnalysisOutput = Array<{
  speciesCode: string;
  commonName: string;
  checklistCount: number;
  totalAbundance: number;
  isRare: boolean;    
  lastObsDt: string; 
  weightScore: number; 
  daysAgo: number;
  frequency: number;
}>;

export type HotspotData = {
  hotspotInfo: EbirdHotspotInfo;
  speciesAnalysis: SpeciesFrequencyAnalysisOutput;
  observations: EbirdObservation[];
  totalChecklists: number;
  checklists?: EbirdChecklistSummary[];
  observationsPerChecklist?: EbirdObservation[][];
}
