const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Website functions
const getWebsiteByUrl = async (url) => {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('url', url)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const createWebsite = async (websiteData) => {
  const { data, error } = await supabase
    .from('websites')
    .insert(websiteData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Metric functions
const getMetricById = async (id) => {
  const { data, error } = await supabase
    .from('metric')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const getAllMetrics = async () => {
  const { data, error } = await supabase
    .from('metric')
    .select('*');
  if (error) throw error;
  return data;
};

// Evaluation functions
const createEvaluation = async (evaluationData) => {
  const { data, error } = await supabase
    .from('website_evaluations')
    .insert(evaluationData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

//pubish the website
const publishWebsite = async (websiteUrl) => {
  const { data, error } = await supabase
    .from('websites')
    .update({ publish: true })
    .eq('url', websiteUrl)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const getEvaluationsByWebsiteId = async (websiteId) => {
  const { data, error } = await supabase
    .from('website_evaluations')
    .select('*, metric(*), metric:evaluation_area_types(name)')
    .eq('website_id', websiteId);
  if (error) throw error;
  return data;
};

module.exports = {
  getWebsiteByUrl,
  createWebsite,
  createEvaluation,
  getEvaluationsByWebsiteId,
  getMetricById,
  getAllMetrics,
  publishWebsite
};
