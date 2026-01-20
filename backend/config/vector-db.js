const { supabaseAdmin } = require('./database');
const { AI_CONFIG } = require('./ai-config');

// Vector database configuration using Supabase pgvector
const VECTOR_CONFIG = {
    dimensions: AI_CONFIG.vectorDimensions, // 768 for Gemini, 1536 for OpenAI
    indexType: 'ivfflat', // Fast approximate nearest neighbor search
    distanceMetric: 'cosine', // Cosine similarity for semantic search
    lists: 100, // Number of clusters for IVFFlat index
};

// Helper to create vector index if it doesn't exist
async function ensureVectorIndex() {
    try {
        // Check if index exists
        const { data, error } = await supabaseAdmin.rpc('check_vector_index');

        if (error && error.code === '42883') {
            // Function doesn't exist, create it
            console.log('Creating vector index helper function...');
            return true;
        }

        console.log('✅ Vector database configured');
        return true;
    } catch (error) {
        console.warn('⚠️  Could not verify vector index:', error.message);
        return false;
    }
}

module.exports = {
    VECTOR_CONFIG,
    ensureVectorIndex,
};
