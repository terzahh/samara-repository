import { PDFParse } from 'pdf-parse';
import CryptoJS from 'crypto-js';
import stringSimilarity from 'string-similarity';
import {
    checkFileHashExists,
    checkTextHashExists,
    getSimilarResearch
} from '../supabase/database';

/**
 * Calculate SHA-256 hash from file buffer
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - SHA-256 hash string
 */
export const calculateFileHash = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        return hash;
    } catch (error) {
        console.error('Error calculating file hash:', error);
        throw new Error('Failed to calculate file hash');
    }
};

/**
 * Extract text content from PDF file
 * @param {File} file - The PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const data = await PDFParse(Buffer.from(arrayBuffer));
        return data.text || '';
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        // Return empty string if extraction fails (non-PDF or corrupted file)
        return '';
    }
};

/**
 * Normalize text by converting to lowercase and removing punctuation/extra spaces
 * @param {string} text - The text to normalize
 * @returns {string} - Normalized text
 */
export const normalizeText = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .trim();
};

/**
 * Calculate SHA-256 hash from normalized text
 * @param {string} text - The text to hash
 * @returns {string} - SHA-256 hash string
 */
export const calculateTextHash = (text) => {
    const normalized = normalizeText(text);
    return CryptoJS.SHA256(normalized).toString();
};

/**
 * Calculate similarity score between two texts using cosine similarity
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score (0-1)
 */
export const calculateSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;

    const normalized1 = normalizeText(text1);
    const normalized2 = normalizeText(text2);

    if (!normalized1 || !normalized2) return 0;

    // Use string-similarity library for cosine similarity
    const similarity = stringSimilarity.compareTwoStrings(normalized1, normalized2);
    return similarity;
};

/**
 * Check for duplicate content using multiple detection methods
 * @param {File} file - The file to check
 * @param {string} title - Research title
 * @param {string} abstract - Research abstract
 * @returns {Promise<{isDuplicate: boolean, reason: string, matchedResearch: object|null}>}
 */
export const checkForDuplicates = async (file, title, abstract) => {
    try {
        // Step 1: Calculate and check file hash
        console.log('Checking file hash...');
        const fileHash = await calculateFileHash(file);
        const fileHashExists = await checkFileHashExists(fileHash);

        if (fileHashExists) {
            return {
                isDuplicate: true,
                reason: 'Duplicate content detected: this exact file already exists in the repository.',
                matchedResearch: fileHashExists,
                detectionMethod: 'file_hash'
            };
        }

        // Step 2: Extract text and check text hash (for PDFs)
        console.log('Extracting and checking text content...');
        let textContent = '';
        let textHash = '';

        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            textContent = await extractTextFromPDF(file);

            if (textContent) {
                textHash = calculateTextHash(textContent);
                const textHashExists = await checkTextHashExists(textHash);

                if (textHashExists) {
                    return {
                        isDuplicate: true,
                        reason: 'Duplicate content detected: a file with identical text content already exists in the repository.',
                        matchedResearch: textHashExists,
                        detectionMethod: 'text_hash'
                    };
                }
            }
        }

        // Step 3: Check content similarity (fuzzy matching)
        console.log('Checking content similarity...');
        if (textContent) {
            const similarResearch = await getSimilarResearch(textContent, 0.80); // 80% threshold

            if (similarResearch && similarResearch.length > 0) {
                // Calculate similarity with the most similar research
                const mostSimilar = similarResearch[0];
                const similarity = calculateSimilarity(textContent, mostSimilar.text_content || '');

                if (similarity >= 0.80) {
                    return {
                        isDuplicate: true,
                        reason: `Duplicate content detected: a highly similar document (${Math.round(similarity * 100)}% match) already exists in the repository.`,
                        matchedResearch: mostSimilar,
                        detectionMethod: 'similarity',
                        similarityScore: similarity
                    };
                }
            }
        }

        // No duplicates found
        return {
            isDuplicate: false,
            reason: '',
            matchedResearch: null,
            fileHash,
            textHash,
            textContent: textContent.substring(0, 5000) // Store first 5000 chars for future similarity checks
        };

    } catch (error) {
        console.error('Error in duplicate detection:', error);
        // If duplicate detection fails, log error but don't block upload
        // You can change this behavior based on requirements
        return {
            isDuplicate: false,
            reason: '',
            matchedResearch: null,
            error: error.message
        };
    }
};
