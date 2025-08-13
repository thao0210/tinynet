// controllers/contributionController.js
const Contribution = require('../models/Contribution');

exports.createContribution = async (req, res) => {
  try {
    const { itemId, lang, text, content } = req.body;
    const newContribution = new Contribution({
      itemId,
      userId: req.user._id,
      lang, text, content
    });
    await newContribution.save();
    res.status(201).json(newContribution);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contribution.' });
  }
};

exports.getContributionsByStory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const contributions = await Contribution.find({ itemId }).populate('userId', 'fullName username avatar');
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions.' });
  }
};

exports.getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('userId', 'username')
      .lean();

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    res.status(200).json(contribution);
  } catch (err) {
    console.error('Error fetching contribution:', err);
    res.status(500).json({ message: 'Error fetching contribution', error: err });
  }
};

exports.updateContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const {lang, text, content} = req.body;
    const contribution = await Contribution.findById(id);
    if (!contribution) return res.status(404).json({ error: 'Contribution not found' });
    if (!contribution.userId.equals(req.user._id)) return res.status(403).json({ error: 'Permission denied' });

    contribution.lang = lang;
    contribution.text = text;
    contribution.content = content;
    
    await contribution.save();
    res.json(contribution);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contribution.' });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const contribution = await Contribution.findById(id);
    if (!contribution) return res.status(404).json({ error: 'Contribution not found' });
    if (!contribution.userId.equals(req.user._id)) return res.status(403).json({ error: 'Permission denied' });

    await contribution.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contribution.' });
  }
};
