import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CONGRESS_API_KEY = Deno.env.get('CONGRESS_API_KEY');
    if (!CONGRESS_API_KEY) {
      throw new Error('CONGRESS_API_KEY is not configured');
    }

    // Get params from body (POST) or URL (GET)
    let params: any = {};
    if (req.method === 'POST') {
      try {
        params = await req.json();
      } catch {
        params = {};
      }
    }
    
    const url = new URL(req.url);
    const action = params.action || url.searchParams.get('action') || 'recent-bills';
    const billId = params.billId || url.searchParams.get('billId');
    const congress = params.congress || url.searchParams.get('congress') || '118';
    const limit = params.limit || url.searchParams.get('limit') || '10';

    let data: any;

    switch (action) {
      case 'recent-bills':
        // Fetch recent bills with health-related subjects
        const billsUrl = `${CONGRESS_API_BASE}/bill/${congress}?api_key=${CONGRESS_API_KEY}&format=json&limit=${limit}&sort=updateDate+desc`;
        const billsRes = await fetch(billsUrl);
        if (!billsRes.ok) {
          throw new Error(`Congress API error: ${billsRes.status}`);
        }
        const billsData = await billsRes.json();
        data = {
          bills: billsData.bills?.map((bill: any) => ({
            id: `${bill.type}${bill.number}`,
            congress: bill.congress,
            type: bill.type,
            number: bill.number,
            title: bill.title,
            latestAction: bill.latestAction,
            updateDate: bill.updateDate,
            url: bill.url,
          })) || [],
        };
        break;

      case 'bill-details':
        if (!billId) {
          throw new Error('billId is required for bill-details action');
        }
        // Parse bill ID (e.g., "hr1234" -> type=hr, number=1234)
        const match = billId.match(/^([a-z]+)(\d+)$/i);
        if (!match) {
          throw new Error('Invalid billId format. Use format like "hr1234" or "s567"');
        }
        const billType = match[1].toLowerCase();
        const billNumber = match[2];
        
        const detailUrl = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}?api_key=${CONGRESS_API_KEY}&format=json`;
        const detailRes = await fetch(detailUrl);
        if (!detailRes.ok) {
          throw new Error(`Congress API error: ${detailRes.status}`);
        }
        const detailData = await detailRes.json();
        
        // Also fetch summaries if available
        let summary = null;
        try {
          const summaryUrl = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}/summaries?api_key=${CONGRESS_API_KEY}&format=json`;
          const summaryRes = await fetch(summaryUrl);
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            summary = summaryData.summaries?.[0]?.text || null;
          }
        } catch (e) {
          console.log('No summary available');
        }

        data = {
          bill: {
            ...detailData.bill,
            summary,
          },
        };
        break;

      case 'health-bills':
        // Use the Congress API subject search to find health-related bills directly
        const healthSubjects = ['Health', 'Health care coverage and access', 'Medicare', 'Medicaid'];
        const allHealthBills: any[] = [];
        
        // Try fetching bills by subject/policy area using the search endpoint
        for (const subject of healthSubjects) {
          if (allHealthBills.length >= parseInt(limit as string)) break;
          try {
            const subjectUrl = `${CONGRESS_API_BASE}/bill/${congress}?api_key=${CONGRESS_API_KEY}&format=json&limit=20&sort=updateDate+desc`;
            const subjectRes = await fetch(subjectUrl);
            if (subjectRes.ok) {
              const subjectData = await subjectRes.json();
              const filtered = subjectData.bills?.filter((bill: any) => {
                const titleLower = bill.title?.toLowerCase() || '';
                const healthTerms = [
                  'health', 'medicare', 'medicaid', 'mental health', 'hospital', 'medical',
                  'prescription', 'drug', 'pharmaceutical', 'opioid', 'veteran',
                  'nursing', 'physician', 'patient', 'care act', 'affordable care',
                  'maternal', 'reproductive', 'telehealth', 'public health', 'disease',
                  'pandemic', 'vaccine', 'cancer', 'diabetes', 'healthcare', 'health care',
                  'insurance', 'clinical', 'therapy', 'treatment', 'surgeon', 'nurse',
                  'wellness', 'nutrition', 'obesity', 'substance abuse', 'addiction',
                  'emergency medical', 'ambulance', 'hospice', 'rehabilitation'
                ];
                return healthTerms.some(term => titleLower.includes(term));
              }) || [];
              for (const bill of filtered) {
                const id = `${bill.type}${bill.number}`;
                if (!allHealthBills.find((b: any) => b.id === id)) {
                  allHealthBills.push({
                    id,
                    congress: bill.congress,
                    type: bill.type,
                    number: bill.number,
                    title: bill.title,
                    latestAction: bill.latestAction,
                    updateDate: bill.updateDate,
                  });
                }
              }
            }
          } catch (e) {
            console.log(`Error fetching subject ${subject}:`, e);
          }
        }

        // If not enough from subject search, try fetching a larger batch
        if (allHealthBills.length < parseInt(limit as string)) {
          const fallbackLimit = 250;
          const fallbackUrl = `${CONGRESS_API_BASE}/bill/${congress}?api_key=${CONGRESS_API_KEY}&format=json&limit=${fallbackLimit}&sort=updateDate+desc`;
          const fallbackRes = await fetch(fallbackUrl);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const healthTerms = [
              'health', 'medicare', 'medicaid', 'mental health', 'hospital', 'medical',
              'prescription', 'drug', 'pharmaceutical', 'opioid', 'veteran',
              'nursing', 'physician', 'patient', 'care act', 'affordable care',
              'maternal', 'reproductive', 'telehealth', 'public health', 'disease',
              'pandemic', 'vaccine', 'cancer', 'diabetes', 'healthcare', 'health care',
              'insurance', 'clinical', 'therapy', 'treatment', 'surgeon', 'nurse',
              'wellness', 'nutrition', 'obesity', 'substance abuse', 'addiction',
              'emergency medical', 'ambulance', 'hospice', 'rehabilitation'
            ];
            const filtered = fallbackData.bills?.filter((bill: any) => {
              const titleLower = bill.title?.toLowerCase() || '';
              return healthTerms.some(term => titleLower.includes(term));
            }) || [];
            for (const bill of filtered) {
              const id = `${bill.type}${bill.number}`;
              if (!allHealthBills.find((b: any) => b.id === id) && allHealthBills.length < parseInt(limit as string)) {
                allHealthBills.push({
                  id,
                  congress: bill.congress,
                  type: bill.type,
                  number: bill.number,
                  title: bill.title,
                  latestAction: bill.latestAction,
                  updateDate: bill.updateDate,
                });
              }
            }
          }
        }

        data = {
          bills: allHealthBills.slice(0, parseInt(limit as string)),
        };
        break;

      case 'subjects':
        // Fetch policy area subjects
        const subjectsUrl = `${CONGRESS_API_BASE}/bill/${congress}?api_key=${CONGRESS_API_KEY}&format=json&limit=50&sort=updateDate+desc`;
        const subjectsRes = await fetch(subjectsUrl);
        if (!subjectsRes.ok) {
          throw new Error(`Congress API error: ${subjectsRes.status}`);
        }
        const subjectsData = await subjectsRes.json();
        
        // Extract unique policy areas
        const policyAreas = new Set<string>();
        subjectsData.bills?.forEach((bill: any) => {
          if (bill.policyArea?.name) {
            policyAreas.add(bill.policyArea.name);
          }
        });

        data = {
          subjects: Array.from(policyAreas),
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Congress API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
