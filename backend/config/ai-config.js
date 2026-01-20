const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Configuration
const AI_CONFIG = {
    provider: process.env.AI_PROVIDER || 'gemini',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
    embeddingModel: process.env.AI_EMBEDDING_MODEL || 'text-embedding-004',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 4000,
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
    vectorDimensions: parseInt(process.env.VECTOR_DIMENSIONS) || 768,

    // Feature flags
    enableChatbot: process.env.ENABLE_AI_CHATBOT === 'true',
    enablePlagiarismCheck: process.env.ENABLE_PLAGIARISM_CHECK === 'true',
    enableAutoCategorization: process.env.ENABLE_AUTO_CATEGORIZATION === 'true',
    enableSmartSearch: process.env.ENABLE_SMART_SEARCH === 'true',

    // Rate limits
    rateLimitPerUser: parseInt(process.env.AI_RATE_LIMIT_PER_USER) || 50,
    rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 60,
    rateLimitPerDay: parseInt(process.env.AI_RATE_LIMIT_PER_DAY) || 1500,
};

// Initialize Google Gemini
let genAI = null;
let model = null;
let embeddingModel = null;

function initializeAI() {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
        console.warn('⚠️  AI_API_KEY not set. AI features will be disabled.');
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
        embeddingModel = genAI.getGenerativeModel({ model: AI_CONFIG.embeddingModel });

        console.log('✅ Google Gemini AI initialized successfully');
        console.log(`   Model: ${AI_CONFIG.model}`);
        console.log(`   Embedding Model: ${AI_CONFIG.embeddingModel}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize AI:', error.message);
        return false;
    }
}

// Helper function to chunk text for large documents
function chunkText(text, maxTokens = 1500) {
    // Rough estimate: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    const chunks = [];

    if (text.length <= maxChars) {
        return [text];
    }

    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length > maxChars) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }

            // If single paragraph is too long, split by sentences
            if (paragraph.length > maxChars) {
                const sentences = paragraph.split(/\. /);
                for (const sentence of sentences) {
                    if ((currentChunk + sentence).length > maxChars) {
                        if (currentChunk) {
                            chunks.push(currentChunk.trim());
                        }
                        currentChunk = sentence + '. ';
                    } else {
                        currentChunk += sentence + '. ';
                    }
                }
            } else {
                currentChunk = paragraph + '\n\n';
            }
        } else {
            currentChunk += paragraph + '\n\n';
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// Estimate token count (rough approximation)
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

module.exports = {
    AI_CONFIG,
    genAI,
    model,
    embeddingModel,
    initializeAI,
    chunkText,
    estimateTokens,
};
