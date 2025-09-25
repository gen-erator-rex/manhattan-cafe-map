import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  try {
    if (event.httpMethod === 'GET') {
        const { data, error } = await supabase
        .from('cafes')
        .select('id,name,address,lon,lat,founderReview:founder_review,rating,tags,logo,created_at')
        .order('created_at', { ascending: false });      
      if (error) throw error;

      const rows = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        address: r.address,
        coords: [r.lon, r.lat],
        founderReview: r.founderReview,
        rating: r.rating,
        tags: r.tags || [],
        logo: r.logo,
        created_at: r.created_at,
      }));

      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const [lon, lat] = body.coords || [];
      const payload = {
        name: body.name,
        address: body.address || null,
        lon, lat,
        founder_review: body.founderReview || null,
        rating: body.rating ?? null,
        tags: body.tags || [],
        logo: body.logo || null,
      };

      const { error } = await supabase.from('cafes').insert(payload);
      if (error) throw error;

      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
}
