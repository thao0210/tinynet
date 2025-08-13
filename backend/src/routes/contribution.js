// routes/contributions.js
const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/contributions', authMiddleware, contributionController.createContribution);
router.get('/contributions/:id', authMiddleware, contributionController.getContributionById);
router.get('/contributions/list/:itemId', contributionController.getContributionsByStory);
router.put('/contributions/:id', authMiddleware, contributionController.updateContribution);
router.delete('/contributions/:id', authMiddleware, contributionController.deleteContribution);

module.exports = router;
