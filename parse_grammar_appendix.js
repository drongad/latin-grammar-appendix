const fs = require('fs');

// Read the text file
const raw = fs.readFileSync('/Users/dronagaddam_1/Downloads/Grammar-of-Latin-booklet-Final-25-tmp-_1_.txt', 'utf-8');
const lines = raw.split('\n');

// Section headers to look for
const sectionHeaders = [
  'Nominative Case',
  'Genitive Case',
  'Dative Case',
  'Accusative Case',
  'Ablative Case',
  'Vocative Case',
  'Locative Case',
  'Indicative Mood',
  'Infinitive Mood',
  'Imperative Mood',
  'Subjunctive Mood',
  'Other Verbal Constructions',
  'Conditions with the Subjunctive',
  'Participles',
  'Voice',
];

// Find the start of the actual grammar content (after Table of Contents)
let startIdx = lines.findIndex(line => line.match(/^1\. Agreement of Verb/));
if (startIdx === -1) {
  // If we can't find the specific line, start from the beginning
  startIdx = 0;
}

let data = [];
let currentSection = null;
let currentPoint = null;
let buffer = [];

function getTags(sectionTitle) {
  const tags = [];
  // Special case: only add 'Agreement and Basic Constructions' as tag for that section
  if (sectionTitle === 'Agreement and Basic Constructions') {
    tags.push('Agreement and Basic Constructions');
    return tags;
  }
  // Add major category tags first
  if (sectionTitle.includes('Case')) {
    tags.push('Noun');
  } else if (sectionTitle.includes('Mood') || sectionTitle === 'Other Verbal Constructions' || sectionTitle === 'Conditions with the Subjunctive') {
    tags.push('Verb');
  } else if (sectionTitle === 'Participles') {
    tags.push('Participles');
  } else if (sectionTitle === 'Voice') {
    tags.push('Voice');
  }
  // Add section title as secondary tag
  tags.push(sectionTitle);
  return tags;
}

function flushPoint() {
  if (currentPoint) {
    if (buffer.length) {
      currentPoint.description = buffer.join('\n').trim();
      buffer = [];
    }
    // Assign both section title and major category tags
    currentPoint.tags = getTags(currentSection ? currentSection.title : 'Agreement and Basic Constructions');
    if (currentSection) {
      if (!currentSection.points) currentSection.points = [];
      currentSection.points.push(currentPoint);
    }
    currentPoint = null;
  } else {
    buffer = [];
  }
}

// Create a section for the early grammar points (1-5) that don't have a clear section header
let earlySection = { title: 'Agreement and Basic Constructions', points: [] };

for (let i = startIdx; i < lines.length; i++) {
  let line = lines[i];
  let trimmed = line.trim();
  
  // Section header
  if (sectionHeaders.includes(trimmed)) {
    flushPoint();
    if (currentSection) data.push(currentSection);
    currentSection = { title: trimmed, points: [] };
    continue;
  }
  
  // Numbered grammar point
  let pointMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
  if (pointMatch) {
    flushPoint();
    currentPoint = {
      number: pointMatch[1],
      title: pointMatch[2],
      description: '',
      examples: [],
      tags: []
    };
    
    // If this is one of the early points (1-5) and we don't have a current section, 
    // add it to the early section
    if (parseInt(pointMatch[1]) <= 5 && !currentSection) {
      currentSection = earlySection;
    }
    continue;
  }
  
  // Example: indented line (tab or at least 2 spaces)
  if ((/^\s{2,}/.test(line) || /^\t/.test(line)) && currentPoint && trimmed !== '') {
    currentPoint.examples.push(trimmed);
    continue;
  }
  
  // Otherwise, buffer content
  if (currentPoint && trimmed !== '') buffer.push(trimmed);
}
flushPoint();
if (currentSection) data.push(currentSection);

fs.writeFileSync('grammar_appendix.json', JSON.stringify(data, null, 2));
console.log('Parsed grammar appendix to grammar_appendix.json'); 