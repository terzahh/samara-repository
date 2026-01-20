const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { AI_CONFIG } = require('../config/ai-config');

// Import AI services
const aiService = require('../services/aiService');
const embeddingService = require('../services/embeddingService');
const chatbotService = require('../services/chatbotService');
const plagiarismService = require('../services/plagiarismService');
const recommendationService = require('../services/recommendationService');
const { supabaseAdmin } = require('../config/database');

/**
 * AI Routes - All AI-powered endpoints
 */

// ============================================
// DOCUMENT ANALYSIS ENDPOINTS
// ============================================

/**
 * POST /api/ai/analyze-document/:id
 * Full document analysis (summary, keywords, category)
 */
router.post('/analyze-document/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get document
        const { data: research, error } = await supabaseAdmin
            .from('research')
            .select('title, abstract, file_path')
            .eq('id', id)
            .single();

        if (error || !research) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Combine text for analysis
        const textToAnalyze = `${research.title}\n\n${research.abstract || ''}`;

        // Run analysis in parallel
        const [summary, keywords, category] = await Promise.all([
            aiService.summarizeDocument(textToAnalyze, 200),
            aiService.extractKeywords(textToAnalyze, 10),
            aiService.categorizeDocument(research.title, research.abstract || ''),
        ]);

        // Store analysis
        const { data: analysis, error: storeError } = await supabaseAdmin
            .from('document_analysis')
            .upsert({
                research_id: id,
                summary,
                keywords,
                suggested_category: category.departmentId,
                analyzed_at: new Date().toISOString(),
            }, { onConflict: 'research_id' })
            .select()
            .single();

        if (storeError) throw storeError;

        // Log AI usage
        await logAIUsage(req.user.id, 'analyze_document', textToAnalyze.length);

        res.json({
            analysis: {
                summary,
                keywords,
                suggestedCategory: category,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/summarize/:id
 * Generate summary only
 */
router.post('/summarize/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { maxLength = 200 } = req.body;

        const { data: research, error } = await supabaseAdmin
            .from('research')
            .select('title, abstract')
            .eq('id', id)
            .single();

        if (error || !research) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const text = `${research.title}\n\n${research.abstract || ''}`;
        const summary = await aiService.summarizeDocument(text, maxLength);

        await logAIUsage(req.user.id, 'summarize', text.length);

        res.json({ summary });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/extract-keywords/:id
 * Extract keywords only
 */
router.post('/extract-keywords/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { maxKeywords = 10 } = req.body;

        const { data: research, error } = await supabaseAdmin
            .from('research')
            .select('title, abstract')
            .eq('id', id)
            .single();

        if (error || !research) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const text = `${research.title}\n\n${research.abstract || ''}`;
        const keywords = await aiService.extractKeywords(text, maxKeywords);

        await logAIUsage(req.user.id, 'extract_keywords', text.length);

        res.json({ keywords });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/categorize/:id
 * Auto-categorize document
 */
router.post('/categorize/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: research, error } = await supabaseAdmin
            .from('research')
            .select('title, abstract')
            .eq('id', id)
            .single();

        if (error || !research) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const category = await aiService.categorizeDocument(research.title, research.abstract || '');

        await logAIUsage(req.user.id, 'categorize', research.title.length);

        res.json({ category });
    } catch (error) {
        next(error);
    }
});

// ============================================
// SEARCH & DISCOVERY ENDPOINTS
// ============================================

/**
 * POST /api/ai/search
 * Semantic search with natural language
 */
router.post('/search', optionalAuth, async (req, res, next) => {
    try {
        const { query, limit = 10, filters = {} } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        if (!AI_CONFIG.enableSmartSearch) {
            return res.status(503).json({ error: 'Smart search is currently disabled' });
        }

        const results = await embeddingService.semanticSearch(query, limit, filters);

        await logAIUsage(req.user?.id, 'semantic_search', query.length);

        res.json({ results, count: results.length });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ai/similar/:id
 * Find similar documents
 */
router.get('/similar/:id', optionalAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { limit = 5 } = req.query;

        const similar = await embeddingService.findSimilarDocuments(id, parseInt(limit));

        await logAIUsage(req.user?.id, 'find_similar', 0);

        res.json({ similar, count: similar.length });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ai/recommendations
 * Personalized recommendations
 */
router.get('/recommendations', requireAuth, async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const recommendations = await recommendationService.getPersonalizedRecommendations(
            req.user.id,
            parseInt(limit)
        );

        await logAIUsage(req.user.id, 'recommendations', 0);

        res.json({ recommendations, count: recommendations.length });
    } catch (error) {
        next(error);
    }
});

// ============================================
// CHATBOT ENDPOINTS
// ============================================

/**
 * POST /api/ai/chat
 * Send chat message
 */
router.post('/chat', requireAuth, async (req, res, next) => {
    try {
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!AI_CONFIG.enableChatbot) {
            return res.status(503).json({ error: 'Chatbot is currently disabled' });
        }

        const result = await chatbotService.chat(req.user.id, message, conversationId);

        await logAIUsage(req.user.id, 'chat', message.length);

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ai/chat/history
 * Get chat history
 */
router.get('/chat/history', requireAuth, async (req, res, next) => {
    try {
        const { conversationId } = req.query;

        if (!conversationId) {
            // Get list of conversations
            const conversations = await chatbotService.getUserConversations(req.user.id);
            return res.json({ conversations });
        }

        // Get specific conversation history
        const history = await chatbotService.getChatHistory(conversationId, req.user.id);
        res.json({ history });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/ai/chat/:conversationId
 * Clear conversation
 */
router.delete('/chat/:conversationId', requireAuth, async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        await chatbotService.deleteConversation(conversationId, req.user.id);

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// CONTENT QUALITY ENDPOINTS
// ============================================

/**
 * POST /api/ai/check-plagiarism/:id
 * Check for plagiarism
 */
router.post('/check-plagiarism/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!AI_CONFIG.enablePlagiarismCheck) {
            return res.status(503).json({ error: 'Plagiarism check is currently disabled' });
        }

        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
            return res.status(403).json({ error: 'Only admins can check plagiarism' });
        }

        const report = await plagiarismService.generatePlagiarismReport(id, req.user.id);

        await logAIUsage(req.user.id, 'plagiarism_check', 0);

        res.json({ report });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ai/plagiarism-report/:id
 * Get plagiarism report
 */
router.get('/plagiarism-report/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const report = await plagiarismService.getPlagiarismReport(id);

        res.json({ report });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/check-quality/:id
 * Assess content quality
 */
router.post('/check-quality/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: research, error } = await supabaseAdmin
            .from('research')
            .select('title, abstract')
            .eq('id', id)
            .single();

        if (error || !research) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const text = `${research.title}\n\n${research.abstract || ''}`;
        const quality = await aiService.assessContentQuality(text);

        await logAIUsage(req.user.id, 'quality_check', text.length);

        res.json({ quality });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/correct-language/:id
 * Get language suggestions
 */
router.post('/correct-language/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: research, error } = await supabaseAdmin
            .from('research')
            .select('title, abstract')
            .eq('id', id)
            .single();

        if (error || !research) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const text = `${research.title}\n\n${research.abstract || ''}`;
        const languageCheck = await aiService.checkLanguageQuality(text);

        await logAIUsage(req.user.id, 'language_check', text.length);

        res.json({ languageCheck });
    } catch (error) {
        next(error);
    }
});

// ============================================
// INTERACTION TRACKING
// ============================================

/**
 * POST /api/ai/track-interaction
 * Track user interaction
 */
router.post('/track-interaction', requireAuth, async (req, res, next) => {
    try {
        const { researchId, interactionType, interactionData } = req.body;

        if (!researchId || !interactionType) {
            return res.status(400).json({ error: 'researchId and interactionType are required' });
        }

        await recommendationService.trackUserInteraction(
            req.user.id,
            researchId,
            interactionType,
            interactionData
        );

        res.json({ message: 'Interaction tracked' });
    } catch (error) {
        // Don't fail the request if tracking fails
        console.error('Error tracking interaction:', error);
        res.json({ message: 'Interaction tracking failed but request succeeded' });
    }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/ai/usage-stats
 * AI usage statistics (admin only)
 */
router.get('/usage-stats', requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { startDate, endDate } = req.query;

        let query = supabaseAdmin
            .from('ai_usage_logs')
            .select('feature, tokens_used, estimated_cost, created_at');

        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data: logs, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Aggregate stats
        const stats = {
            totalRequests: logs?.length || 0,
            totalTokens: logs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0,
            totalCost: logs?.reduce((sum, log) => sum + (parseFloat(log.estimated_cost) || 0), 0) || 0,
            byFeature: {},
        };

        logs?.forEach(log => {
            if (!stats.byFeature[log.feature]) {
                stats.byFeature[log.feature] = { count: 0, tokens: 0, cost: 0 };
            }
            stats.byFeature[log.feature].count++;
            stats.byFeature[log.feature].tokens += log.tokens_used || 0;
            stats.byFeature[log.feature].cost += parseFloat(log.estimated_cost) || 0;
        });

        res.json({ stats });
    } catch (error) {
        next(error);
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Log AI usage for cost tracking
 */
async function logAIUsage(userId, feature, tokensUsed) {
    try {
        // Estimate cost (Google Gemini free tier = $0)
        const estimatedCost = 0;

        await supabaseAdmin
            .from('ai_usage_logs')
            .insert({
                user_id: userId,
                feature,
                tokens_used: tokensUsed,
                estimated_cost: estimatedCost,
            });
    } catch (error) {
        console.error('Error logging AI usage:', error);
        // Don't throw - logging failures shouldn't break the app
    }
}

module.exports = router;
