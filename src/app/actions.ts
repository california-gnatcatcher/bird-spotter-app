'use server';

import { EBIRD_API_BASE_URL, EBIRD_API_KEY } from '@/lib/constants';
import type { EbirdHotspotInfo, EbirdChecklistSummary, SpeciesFrequencyAnalysisOutput } from '@/lib/types';

export async function getHotspotData(hotspotId: string): Promise<{ data: any | null; error: string | null }> {
  if (!hotspotId) return { data: null, error: 'Hotspot ID is required.' };

  try {
    const headers = { 'X-eBirdApiToken': EBIRD_API_KEY };
    const now = new Date();

    const [infoResponse, checklistsResponse] = await Promise.all([
      fetch(`${EBIRD_API_BASE_URL}/ref/hotspot/info/${hotspotId}`, { headers }),
      fetch(`${EBIRD_API_BASE_URL}/product/lists/${hotspotId}?maxResults=20&back=7`, { headers }),
    ]);

    if (!infoResponse.ok || !checklistsResponse.ok) return { data: null, error: 'Failed to fetch basic data.' };

    const hotspotInfo = await infoResponse.json();
    const allChecklists: EbirdChecklistSummary[] = await checklistsResponse.json();
    const totalChecklists = allChecklists.length;

    if (totalChecklists === 0) return { data: { hotspotInfo, speciesAnalysis: [], totalChecklists: 0 }, error: 'No recent checklists.' };

    const regionCode = hotspotInfo.subnational2Code || hotspotInfo.subnational1Code;
    const notableResponse = await fetch(`${EBIRD_API_BASE_URL}/data/obs/${regionCode}/recent/notable?back=7&detail=full`, { headers });
    const notableData = notableResponse.ok ? await notableResponse.json() : [];
    const notableObsIds = new Set(notableData.map((n: any) => n.obsId));

    const checklistPromises = allChecklists.map(checklist =>
      fetch(`${EBIRD_API_BASE_URL}/product/checklist/view/${checklist.subId}?sppLocale=en`, { headers })
        .then(async (res) => {
          if (!res.ok) return [];
          const d = await res.json();
          return (d.obs || []).map((o: any) => ({ ...o, subId: checklist.subId, obsDt: d.obsDt }));
        }).catch(() => [])
    );

    const observations = (await Promise.all(checklistPromises)).flat();
    const speciesMap = new Map<string, any>();

    observations.forEach(obs => {
      if (!obs.speciesCode) return;
      if (!speciesMap.has(obs.speciesCode)) {
        speciesMap.set(obs.speciesCode, {
          commonName: obs.comName || obs.speciesCode,
          checklistIds: new Set<string>(), // 后端计算用的临时 Set
          totalAbundance: 0,
          isRare: false,
          lastObsDt: '1900-01-01',
        });
      }
      const s = speciesMap.get(obs.speciesCode)!;
      s.checklistIds.add(obs.subId);
      if (notableObsIds.has(obs.obsId)) s.isRare = true;
      if (obs.obsDt && obs.obsDt > s.lastObsDt) s.lastObsDt = obs.obsDt;

      let count = 0;
      if (typeof obs.howMany === 'number') count = obs.howMany;
      else if (obs.howManyStr === 'X') count = 1;
      else count = parseInt(obs.howManyStr, 10) || 1;
      s.totalAbundance += count;
    });

    // 批量获取英文名
    const speciesCodes = Array.from(speciesMap.keys());
    if (speciesCodes.length > 0) {
      try {
        const taxRes = await fetch(`${EBIRD_API_BASE_URL}/ref/taxonomy/ebird?fmt=json&species=${speciesCodes.join(',')}&sppLocale=en`, { headers });
        if (taxRes.ok) {
          const taxData = await taxRes.json();
          taxData.forEach((item: any) => {
            if (speciesMap.has(item.speciesCode)) speciesMap.get(item.speciesCode)!.commonName = item.comName;
          });
        }
      } catch (err) { console.error("Taxonomy error", err); }
    }

    // ✨ 第二步：显式映射字段，避免传递 Set 对象
    const speciesAnalysis: SpeciesFrequencyAnalysisOutput = [];
    speciesMap.forEach((data, speciesCode) => {
      const checklistCount = data.checklistIds.size; // 关键：转为数字
      const freqValue = checklistCount / totalChecklists;
      
      const lastSeen = new Date(data.lastObsDt);
      const diffTime = Math.max(0, now.getTime() - lastSeen.getTime());
      const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const rarityScore = data.isRare ? Math.max(0, 100 - (daysAgo * 25)) : 0;
      const weightScore = rarityScore + (freqValue * 100);

      speciesAnalysis.push({
        speciesCode,
        commonName: data.commonName,
        checklistCount: checklistCount, // 显式赋值数字
        totalAbundance: data.totalAbundance,
        isRare: data.isRare,
        lastObsDt: data.lastObsDt,
        frequency: Math.round(freqValue * 100),
        weightScore,
        daysAgo,
      });
    });

    speciesAnalysis.sort((a, b) => b.weightScore - a.weightScore);

    return { 
      data: { hotspotInfo, speciesAnalysis, totalChecklists, checklists: allChecklists }, 
      error: null 
    };

  } catch (err) {
    console.error(err);
    return { data: null, error: 'Internal Server Error' };
  }
}