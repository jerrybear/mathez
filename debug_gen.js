import { generateProblem } from './src/utils/mathEngine.js';

console.log('--- Testing Number Basics (c01-number-basics) ---');
for (let i = 0; i < 20; i++) {
    const problem = generateProblem(1, '+', { topic: 'number-basics', chapterId: 'c01-number-basics' });
    console.log(`Problem ${i + 1}:`);
    console.log(`  Formula: ${problem.num1} ${problem.operator} ${problem.num2} = ${problem.answer}`);
    if (problem.visual) {
        console.log(`  Visual: type=${problem.visual.type}, subType=${problem.visual.subType || 'N/A'}`);
        if (problem.visual.prompt) console.log(`    Prompt: ${problem.visual.prompt}`);
        if (problem.visual.question) console.log(`    Question: ${problem.visual.question}`);
    }
    console.log('---');
}
