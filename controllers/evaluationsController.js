const evaluationService = require('../services/evaluationService');

const websiteEvaluation = async (req, res, next) => {
  try {
    const { model, url, description } = req.body;

    if (!model || !url) {
      return res.status(400).json({
        error: 'Both model and url are required'
      });
    }

    // Evaluate the website
    const evaluationResult = await evaluationService.evaluateWebsite(model, url, description);
    await evaluationService.saveEvaluationResult(evaluationResult);
    res.json(evaluationResult);
  } catch (error) {
    next(error);
  }
};

const saveEvaluation = async (req, res, next) => {
  try {
    const evaluationData = req.body;

    if (!evaluationData || !evaluationData.website || !evaluationData.website.url) {
      return res.status(400).json({
        error: 'Evaluation data with a valid website URL is required'
      });
    }

    const saveResult = await evaluationService.saveEvaluationResult(evaluationData);
    res.json(saveResult);
  } catch (error) {
    next(error);
  }
};

const publishWebsite = async (req, res, next) => {
  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({
        error: 'Website url is required'
      });
    }

    const publishedWebsite = await evaluationService.publishWebsite(websiteUrl);
    res.json(publishedWebsite);
  } catch (error) {
    next(error);
  }
}

const getEvaluations = async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'URL query parameter is required'
      });
    }

    const result = await evaluationService.getWebsiteEvaluations(url);

    if (!result) {
      return res.status(404).json({
        error: 'No evaluations found for this URL'
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  websiteEvaluation,
  saveEvaluation,
  publishWebsite,
  getEvaluations
};
