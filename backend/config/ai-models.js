/**
 * AI Model Helper - Provides access to initialized AI models
 * This file ensures models are accessed after initialization
 */

const aiConfig = require('./ai-config');

/**
 * Get the initialized model
 * @returns {object} Google Generative AI model
 */
function getModel() {
    if (!aiConfig.model) {
        throw new Error('AI model not initialized. Please set AI_API_KEY in environment variables.');
    }
    return aiConfig.model;
}

/**
 * Get the initialized embedding model
 * @returns {object} Google Generative AI embedding model
 */
function getEmbeddingModel() {
    if (!aiConfig.embeddingModel) {
        throw new Error('AI embedding model not initialized. Please set AI_API_KEY in environment variables.');
    }
    return aiConfig.embeddingModel;
}

module.exports = {
    getModel,
    getEmbeddingModel,
};
