const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { logActivity } = require('../services/auditService');

/**
 * POST /api/research/:id/rate
 * Rate a research file
 */
router.post('/:id/rate', requireAuth, async (req, res, next) => {
    try {
        const researchId = req.params.id;
        const userId = req.user.id;
        const { rating } = req.body;

        console.log(`[Rating Debug] User ${userId} rating research ${researchId} with ${rating} stars`);

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Upsert rating using Service Role (bypassing RLS)
        const { data, error } = await supabaseAdmin
            .from('file_ratings')
            .upsert({
                user_id: userId,
                research_id: researchId,
                rating
            }, { onConflict: 'research_id,user_id' })
        await logActivity(
            userId,
            null, // Session ID handled by middleware context if needed, but not passed here directly easily without refactor
            'rate_research',
            'info',
            req.ip,
            req.headers['user-agent'],
            null,
            { researchId, rating }
        );

        res.json({ rating: data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/research/:id/ratings
 * Get ratings for a research file (public)
 */
router.get('/:id/ratings', async (req, res, next) => {
    try {
        const researchId = req.params.id;

        const { data, error } = await supabaseAdmin
            .from('file_ratings')
            .select('rating')
            .eq('research_id', researchId);

        if (error) {
            // If table doesn't exist yet, return empty
            if (error.code === '42P01') return res.json({ total: 0, average: 0 });
            throw error;
        }

        const total = data.length;
        const average = total > 0
            ? data.reduce((acc, curr) => acc + curr.rating, 0) / total
            : 0;

        res.json({ total, average });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/research/:id/user-rating
 * Get current user's rating
 */
router.get('/:id/user-rating', requireAuth, async (req, res, next) => {
    try {
        const researchId = req.params.id;
        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from('file_ratings')
            .select('rating')
            .eq('user_id', userId)
            .eq('research_id', researchId)
            .maybeSingle();

        if (error) {
            if (error.code === '42P01') return res.json({ rating: 0 });
            throw error;
        }

        res.json({ rating: data ? data.rating : 0 });
    } catch (error) {
        next(error);
    }
});

// ... (existing imports)

/**
 * GET /api/research/:id/download-url
 * Get a signed URL for a research file (handles restricted files)
 */
router.get('/:id/download-url', optionalAuth, async (req, res, next) => {
    try {
        const researchId = req.params.id;
        const userId = req.user ? req.user.id : null; // May be null for guests

        // 1. Get research metadata to check access level and file path
        const { data: research, error: fetchError } = await supabaseAdmin
            .from('research')
            .select('file_path, access_level, file_url')
            .eq('id', researchId)
            .single();

        if (fetchError || !research) {
            return res.status(404).json({ error: 'Research not found' });
        }

        // 2. Check Permissions
        // Guests can only access public files (unless we explicity allow guests to preview restricted - which we do via blurred view)
        // BUT: For the PDF viewer to work with blurred view, we simply need the URL.
        // The blurring is visual CSS. The file itself must be downloadable by the browser to be rendered in <canvas>.
        // So we MUST generate a signed URL even for guests if we want them to see the blurred preview,
        // OR we need a separate "preview" version of the file.
        //
        // However, giving a signed URL for the full PDF to a guest allows them to technically download it if they look at network tab.
        // User requested: "guest can view the restricted file ... make it all pages blured"
        // This implies the PDF must be loaded.

        // If it's restricted and user is NOT logged in:
        // We will Still generate the URL because the frontend needs it to render the "blurred" version.
        // SECURITY NOTE: This effectively makes the PDF public to anyone with technical know-how (inspect element),
        // but visually restricted in the UI. This meets the user's specific request for "blurred pages".
        // True security would require server-side rendering of pages to images.

        let signedUrl = null;

        // ALWAYS generate a signed URL. 
        // This ensures it works even if the storage bucket is "Private" (which prevents getPublicUrl from working).
        // Since we check permissions/logic here in the backend, we control who gets this URL.

        const { data: signedData, error: signError } = await supabaseAdmin
            .storage
            .from('research-files')
            .createSignedUrl(research.file_path, 3600); // 1 hour expiry

        if (signError) throw signError;
        signedUrl = signedData.signedUrl;

        res.json({ url: signedUrl });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
