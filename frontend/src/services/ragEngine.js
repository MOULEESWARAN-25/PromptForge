import { designVocabulary } from '../data/designVocabulary';

// A collection of standard stopwords to filter out noisy tokens
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 
  'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 
  'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 
  'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 
  'should', 'now', 'want', 'create', 'make', 'build', 'design', 'add', 'need', 'expect', 'look'
]);

/**
 * Tokenizes a string: lowercases, removes non-alphabetic chars, splits by spaces, and filters stopwords.
 * @param {string} text 
 * @returns {string[]} tokens
 */
export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Generates a Term Frequency (TF) map for an array of tokens.
 * @param {string[]} tokens 
 * @returns {Map<string, number>}
 */
function getTermFrequencies(tokens) {
  const tf = new Map();
  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1);
  });
  return tf;
}

// =========================================================================
// Pre-calculate document vectors and Inverse Document Frequencies (IDF)
// =========================================================================
const documentCount = designVocabulary.length;
const documentRepresentations = designVocabulary.map(doc => {
  // Combine all searchable text fields, giving additional weight to name and keywords
  const weightedText = `
    ${doc.name} ${doc.name} ${doc.name} 
    ${doc.category} 
    ${doc.keywords.join(' ')} ${doc.keywords.join(' ')} 
    ${doc.description}
  `;
  const tokens = tokenize(weightedText);
  return {
    docId: doc.id,
    tokens,
    tf: getTermFrequencies(tokens)
  };
});

// Calculate Document Frequency (DF) for each unique token in the corpus
const docFrequencies = {};
documentRepresentations.forEach(repr => {
  const uniqueTokens = new Set(repr.tokens);
  uniqueTokens.forEach(token => {
    docFrequencies[token] = (docFrequencies[token] || 0) + 1;
  });
});

// Calculate Inverse Document Frequency (IDF) for each unique token
const idf = {};
Object.keys(docFrequencies).forEach(token => {
  // Formula: log(1 + (Total Documents / Document Frequency of Term))
  idf[token] = Math.log(1 + (documentCount / docFrequencies[token]));
});

/**
 * Calculates the cosine similarity between two numeric maps representing vectors.
 * @param {Map<string, number>} vec1 
 * @param {Map<string, number>} vec2 
 * @returns {number} similarity score (0.0 to 1.0)
 */
function calculateCosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  // Union of keys
  const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

  allTerms.forEach(term => {
    const val1 = vec1.get(term) || 0;
    const val2 = vec2.get(term) || 0;
    
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Performs local RAG Vector-Space Retrieval based on semantic query similarity.
 * Returns relevant vocabulary terms sorted by cosine similarity score.
 * 
 * @param {string} query The raw user query
 * @param {number} limit Maximum number of records to retrieve (default: 3)
 * @param {string} [boostCategory] Optional category to boost (e.g. "Component")
 * @returns {Array<{term: object, score: number}>} matched terms with scores
 */
export function searchVectorVocabulary(query, limit = 3, boostCategory = null) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    // If no query tokens, return top elements of specified category or general items
    const fallback = designVocabulary
      .filter(item => !boostCategory || item.category.toLowerCase().includes(boostCategory.toLowerCase()))
      .slice(0, limit)
      .map(item => ({ term: item, score: 0.1 }));
    return fallback;
  }

  const queryTf = getTermFrequencies(queryTokens);
  
  // Create TF-IDF vector map for the query
  const queryVector = new Map();
  queryTf.forEach((tfVal, token) => {
    const idfVal = idf[token] || 1.5; // default boost for out-of-vocabulary terms
    queryVector.set(token, tfVal * idfVal);
  });

  const results = documentRepresentations.map(repr => {
    // Create TF-IDF vector map for this document
    const docVector = new Map();
    repr.tf.forEach((tfVal, token) => {
      const idfVal = idf[token] || 0;
      docVector.set(token, tfVal * idfVal);
    });

    let score = calculateCosineSimilarity(queryVector, docVector);
    const vocabularyItem = designVocabulary.find(item => item.id === repr.docId);

    // Apply exact substring matches boost for keywords
    if (vocabularyItem) {
      const queryLower = query.toLowerCase();
      // Name matches exactly
      if (queryLower.includes(vocabularyItem.name.toLowerCase())) {
        score += 0.4;
      }
      
      // Keywords matches
      vocabularyItem.keywords.forEach(kw => {
        if (queryLower.includes(kw.toLowerCase())) {
          score += 0.25;
        }
      });

      // Category boost if specified
      if (boostCategory && vocabularyItem.category.toLowerCase().includes(boostCategory.toLowerCase())) {
        score *= 1.25; // Boost matches in the requested category by 25%
      }
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    return {
      term: vocabularyItem,
      score: parseFloat(score.toFixed(3))
    };
  });

  // Filter out terms with zero scores, sort by score descending, and limit
  return results
    .filter(res => res.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
