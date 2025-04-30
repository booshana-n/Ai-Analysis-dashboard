const express = require('express');
const router = express.Router();
const evaluationsController = require('../controllers/evaluationsController');

router.post('/evaluate', evaluationsController.websiteEvaluation);
router.post('/publish', evaluationsController.publishWebsite);
// router.post('/save', evaluationsController.saveEvaluation);
router.get('/', evaluationsController.getEvaluations);

module.exports = router;
