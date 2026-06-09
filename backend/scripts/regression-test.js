import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 8000;
const backendUrl = `http://localhost:${port}`;

async function runTests() {
  console.log('🚀 Running Dynamic Content Regression Tests...');
  let failed = false;

  let totalVocabularyCount = 0;

  // Test 1: Health check / API vocabulary listing
  try {
    console.log(`\n[Test 1] Fetching dynamic vocabulary from ${backendUrl}/api/vocabulary...`);
    const res = await fetch(`${backendUrl}/api/vocabulary`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error(`Expected array, got ${typeof data}`);
    }
    
    totalVocabularyCount = data.length;
    console.log(`   - Received ${totalVocabularyCount} vocabulary terms.`);
    
    if (totalVocabularyCount === 0) {
      throw new Error(`Expected at least one vocabulary item, got 0`);
    }
    
    const sample = data[0];
    const requiredKeys = ['id', 'name', 'category', 'description', 'example_prompt', 'difficulty', 'tags', 'design_tokens'];
    requiredKeys.forEach(key => {
      if (!(key in sample)) {
        throw new Error(`Sample item is missing key: "${key}"`);
      }
    });
    console.log('   - Sample item verification passed. All metadata columns present.');
    console.log(`✅ Test 1 Passed: /api/vocabulary returned ${totalVocabularyCount} valid items.`);
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed = true;
  }

  // Test 2: Global Stats check
  try {
    console.log(`\n[Test 2] Fetching stats from ${backendUrl}/api/vocabulary/stats...`);
    const res = await fetch(`${backendUrl}/api/vocabulary/stats`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}: ${res.statusText}`);
    }
    
    const stats = await res.json();
    console.log('   - Stats returned:', stats);
    
    if (stats.total_design_patterns !== totalVocabularyCount) {
      throw new Error(`Expected total_design_patterns to match vocabulary count (${totalVocabularyCount}), got ${stats.total_design_patterns}`);
    }
    if (typeof stats.total_specifications_compiled !== 'number') {
      throw new Error(`Expected total_specifications_compiled to be a number, got ${typeof stats.total_specifications_compiled}`);
    }
    
    console.log('✅ Test 2 Passed: /api/vocabulary/stats returned consistent stats.');
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed = true;
  }

  console.log('\n=============================================');
  if (failed) {
    console.error('🚨 Regression Tests Failed!');
    process.exit(1);
  } else {
    console.log('🎉 All Regression Tests Passed Successfully!');
    process.exit(0);
  }
}

runTests();
