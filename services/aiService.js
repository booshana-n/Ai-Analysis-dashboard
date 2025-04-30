const axios = require('axios');
const supabaseService = require('./supabaseService');

// Fetch all metrics for evaluation (each includes ai_prompt and evaluation_area_type_id)
const getAllMetrics = async () => {
  return await supabaseService.getAllMetrics();
};

const callOpenAI = async (systemPrompt, prompt) => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );
  return response.data;
};

const generateEvaluation = async (model, url, description) => {
  try {
    // Fetch all metrics to evaluate
    const metrics = await getAllMetrics();
    if (!metrics || metrics.length === 0) throw new Error('No metrics found.');

    // Construct the user prompt
    const userPrompt = `
      Website URL: ${url}
      ${description ? `Description: ${description}` : ''}
      Please evaluate this website according to the specified criteria and provide your analysis in the required JSON format.
    `;

    // Collect evaluations for each metric
    const evaluations = [];
    for (const metric of metrics) {
      const aiResponse = await callOpenAI(metric.ai_prompt, userPrompt);
      console.log('AI Response:', aiResponse.choices[0]?.message?.content);
      const content = aiResponse.choices[0]?.message?.content;
      if (!content) throw new Error('No content in AI response');

      let evalObj;
      try {
        evalObj = JSON.parse(content);
      } catch (e) {
        throw new Error('Failed to parse AI response as JSON');
      }

      // Structure: { score, analysis, strengths, weaknesses, recommendations }
      evaluations.push({
        metric_id: metric.id,
        evaluation_area_type_id: metric.evaluation_area_type_id,
        score: evalObj.score,
        rationale: evalObj.rationale,
        strengths: evalObj.strengths,
        weaknesses: evalObj.weaknesses,
        recommendations: evalObj.recommendations
      });
    }

    // Get website name from URL
    const websiteName = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

    return {
      website: {
        url,
        name: websiteName,
        description: description || `Automated evaluation for ${url}`
      },
      evaluations
    };
  } catch (error) {
    console.error('Error in generateEvaluation:', error);
    throw new Error(`AI service error (${model}): ${error.message}`);
  }
};

module.exports = {
  generateEvaluation
};
