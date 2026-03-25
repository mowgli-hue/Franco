#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'apps/mobile/src/content');
const FILES = [
  'foundation/foundationStructuredLessons.ts',
  'a1/a1StructuredLessons.ts',
  'a2/a2StructuredLessons.ts',
  'b1/b1StructuredLessons.ts',
  'clb/clbStructuredLessons.ts'
];
const EXPECTED_LESSONS = {
  'foundation/foundationStructuredLessons.ts': 4,
  'a1/a1StructuredLessons.ts': 40,
  'a2/a2StructuredLessons.ts': 40,
  'b1/b1StructuredLessons.ts': 40,
  'clb/clbStructuredLessons.ts': 80
};

function read(file) {
  return fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
}

function count(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function scoreFile(file, text) {
  const lessons = EXPECTED_LESSONS[file] ?? 1;
  const teachSegments = count(text, /teachingSegments:/g);
  const production = count(text, /productionTask:/g);
  const miniTest = count(text, /type:\s*'miniTest'/g);
  const listening = count(text, /kind:\s*'listeningPrompt'/g);
  const speaking = count(text, /kind:\s*'speakingPrompt'/g);
  const writing = count(text, /kind:\s*'writingPrompt'/g);
  const puzzles = count(text, /kind:\s*'sentenceOrderPuzzle'/g);
  const memory = count(text, /kind:\s*'memoryMatch'/g);
  const classify = count(text, /kind:\s*'quickClassification'/g);
  const canada = count(text, /Canada|Canadian|Montréal|Toronto|Vancouver|Calgary|Service|clinic|transit|immigration/gi);
  const mistakes = count(text, /Common Mistakes to Avoid|explanationOnWrong/g);

  // Weighted quality score with a soft baseline for authored structure.
  let quality = 0;
  quality += teachSegments * 2;
  quality += production * 4;
  quality += miniTest * 3;
  quality += listening + speaking + writing;
  quality += puzzles + memory + classify;
  quality += Math.min(canada, 80) * 0.3;
  quality += Math.min(mistakes, 120) * 0.2;

  const normalized = Math.round((quality / lessons) * 1000) / 10;
  const status = normalized >= 30 ? 'strong' : normalized >= 18 ? 'good' : 'needs-upgrade';

  return {
    file,
    lessons,
    normalized,
    status,
    metrics: { teachSegments, production, miniTest, listening, speaking, writing, puzzles, memory, classify, canada, mistakes }
  };
}

function main() {
  const strict = process.argv.includes('--strict');
  const results = FILES.map((file) => scoreFile(file, read(file)));

  console.log('Lesson quality audit\n');
  results.forEach((r) => {
    console.log(
      `${r.file}\n` +
        `  lessons=${r.lessons} score=${r.normalized} status=${r.status}\n` +
        `  teach=${r.metrics.teachSegments} prod=${r.metrics.production} test=${r.metrics.miniTest} ` +
        `listen=${r.metrics.listening} speak=${r.metrics.speaking} write=${r.metrics.writing} ` +
        `puzzle=${r.metrics.puzzles} memory=${r.metrics.memory} classify=${r.metrics.classify} canadaRefs=${r.metrics.canada}`
    );
  });

  const weak = results.filter((r) => r.status === 'needs-upgrade');
  const hasWeak = weak.length > 0;
  if (strict && hasWeak) {
    console.error(`\n[FAIL] ${weak.length} file(s) need upgrade.`);
    process.exit(1);
  }

  console.log(`\nSummary: ${results.length - weak.length}/${results.length} files at good+ quality.`);
}

main();
