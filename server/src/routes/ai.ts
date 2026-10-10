import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../db.js';

const router = Router();

// Restricted to authenticated staff
router.use(requireAuth);

/**
 * POST /api/ai/triage
 * Assists officers with automated text scanning, category hints, urgency indicators,
 * and duplicate pattern detection.
 * Clearly marked: "Demo Classification — Not AI Verified"
 */
router.post('/triage', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { description = '', platform = '', currentCategory } = req.body;
    const text = description.toLowerCase();

    // 1. Keyword-based category suggestion
    let suggestedCategory = 'OTHER';
    let categoryConfidence = 0.65;
    let categoryReason = 'General digital misconduct pattern detected.';

    if (text.includes('fake') || text.includes('clone') || text.includes('impostor') || text.includes('stolen picture') || text.includes('pretending to be')) {
      suggestedCategory = 'FAKE_PROFILE';
      categoryConfidence = 0.88;
      categoryReason = 'Mentions fake profile, cloning, or someone pretending to be another student.';
    } else if (text.includes('threat') || text.includes('kill') || text.includes('hurt') || text.includes('weapon') || text.includes('violence') || text.includes('physical')) {
      suggestedCategory = 'THREATS';
      categoryConfidence = 0.94;
      categoryReason = 'Physical or explicit threat terminology identified.';
    } else if (text.includes('following') || text.includes('dorm') || text.includes('stalk') || text.includes('watched') || text.includes('tracking me')) {
      suggestedCategory = 'CYBERSTALKING';
      categoryConfidence = 0.89;
      categoryReason = 'Physical location monitoring or cyberstalking indicators detected.';
    } else if (text.includes('harass') || text.includes('spam') || text.includes('doxx') || text.includes('nonconsensual') || text.includes('leak')) {
      suggestedCategory = 'ONLINE_HARASSMENT';
      categoryConfidence = 0.85;
      categoryReason = 'Relentless messaging, private detail leak, or harassment patterns.';
    } else if (text.includes('bully') || text.includes('group chat') || text.includes('rumor') || text.includes('humiliat')) {
      suggestedCategory = 'CYBERBULLYING';
      categoryConfidence = 0.82;
      categoryReason = 'Targeted social exclusion or defamatory group rumors detected.';
    }

    // 2. Urgency and Threat Indicators
    const urgencyFlags: string[] = [];
    let recommendedPriority = 'MEDIUM';

    if (text.includes('kill') || text.includes('hurt') || text.includes('harm') || text.includes('tonight') || text.includes('outside') || text.includes('know where you live')) {
      urgencyFlags.push('High-risk threat indicators detected. Immediate safety review advised.');
      recommendedPriority = 'CRITICAL';
    }

    if (text.includes('doxx') || text.includes('address') || text.includes('phone number') || text.includes('ssn') || text.includes('dorm room')) {
      urgencyFlags.push('Personal identifying information exposure risk (Doxxing).');
      if (recommendedPriority !== 'CRITICAL') recommendedPriority = 'HIGH';
    }

    if (text.includes('anonymous account') || text.includes('burner') || text.includes('finsta')) {
      urgencyFlags.push('Burner or ephemeral account pattern identified.');
    }

    // 3. Potential duplicate reports check across recent submissions
    const recentSimilar = await prisma.case.findMany({
      where: {
        platform: platform || undefined,
        status: { not: 'CLOSED' },
      },
      select: {
        id: true,
        category: true,
        platform: true,
        createdAt: true,
        priority: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    // 4. Recommended Officer Next Steps
    const recommendedActions = [
      'Preserve raw timestamped screenshots and verify profile URL validity.',
      'Check if campus IP ranges or university WiFi networks match incident logs.',
      'Formulate initial reassuring reporter update within the 24-hour SLA.',
    ];
    if (recommendedPriority === 'CRITICAL') {
      recommendedActions.unshift('Escalate to Campus Safety Dispatch and Dean on Call immediately.');
    }

    res.json({
      disclaimer: 'Demo Classification — Not AI Verified. For human officer decision-making assistance only.',
      suggestedCategory,
      categoryConfidence,
      categoryReason,
      recommendedPriority,
      urgencyFlags,
      potentialCorrelatedCases: recentSimilar,
      recommendedActions,
    });
  } catch (error) {
    console.error('AI Triage error:', error);
    res.status(500).json({ error: 'Failed to run triage analysis.' });
  }
});

export default router;
