

// Talent apne links aur project submit karega
export const submitAssessmentLinks = async (req, res) => {
  const { aptitudeLinks, github, liveLink } = req.body;
  const userId = req.user.id; 

  try {
    const talent = await prisma.talent.findUnique({ where: { userId } });
    if (!talent) return res.status(404).json({ success: false, message: "Talent Profile Not Found" });

    const assessment = await prisma.assessment.upsert({
      where: { talentId: talent.id },
      update: {
        aptitudeLinks,
        projectGithub: github,
        projectLiveLink: liveLink,
        status: "UNDER_REVIEW"
      },
      create: {
        talentId: talent.id,
        aptitudeLinks,
        projectGithub: github,
        projectLiveLink: liveLink,
        status: "UNDER_REVIEW"
      }
    });

    res.status(200).json({ success: true, message: "Links Submitted for Review!", assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Talent apna current status check karega
export const getMyAssessment = async (req, res) => {
  try {
    const talent = await prisma.talent.findUnique({ where: { userId: req.user.id } });
    const assessment = await prisma.assessment.findUnique({ where: { talentId: talent.id } });
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};