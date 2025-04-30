const supabaseService = require('./supabaseService');
const aiService = require('./aiService');

const evaluateWebsite = async (model, url, description) => {
  let website = await supabaseService.getWebsiteByUrl(url);

  // If website doesn't exist, call AI and return evaluation data
  if (!website) {
    return await aiService.generateEvaluation(model, url, description);
  } else {
    // If website exists, check if evaluations already exist
    const existingEvaluations = await supabaseService.getEvaluationsByWebsiteId(website.id);
    if (existingEvaluations.length > 0) {
      return null;
    }
    // If no evaluations, call AI and return evaluation data
    return await aiService.generateEvaluation(model, url, description);
  }
};

const saveEvaluationResult = async (evaluationData) => {
  // Check if website exists
  let website = await supabaseService.getWebsiteByUrl(evaluationData.website.url);

  // Create website if it doesn't exist
  if (!website) {
    website = await supabaseService.createWebsite({
      name: evaluationData.website.name,
      url: evaluationData.website.url,
      description: evaluationData.website.description
    });
  }

  // Prepare evaluations for insertion
  const evaluations = evaluationData.evaluations.map(eval => ({
    website_id: website.id,
    metric_id: eval.metric_id,
    score: eval.score,
    rationale: eval.rationale,
    strengths: eval.strengths,
    weaknesses: eval.weaknesses,
    recommendations: eval.recommendations
  }));

  // Store evaluations in database
  const createdEvaluations = [];
  for (const eval of evaluations) {
    const created = await supabaseService.createEvaluation(eval);
    createdEvaluations.push(created);
  }

  console.log("Saving evaluation result to the database:", evaluationData);
  return { success: true, message: "Evaluation result saved successfully" };
};

const publishWebsite = async (url) => {
  const publishedWebsite = await supabaseService.publishWebsite(url);
  return publishedWebsite;
};

const getWebsiteEvaluations = async (url) => {
  const website = await supabaseService.getWebsiteByUrl(url);
  if (!website) return null;

  const evaluations = await supabaseService.getEvaluationsByWebsiteId(website.id);
  return {
    website,
    evaluations
  };
};

module.exports = {
  evaluateWebsite,
  getWebsiteEvaluations,
  saveEvaluationResult,
  publishWebsite
};
