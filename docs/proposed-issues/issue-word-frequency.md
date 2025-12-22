# Issue: Implement Word Frequency-Based Selection

## Priority
Medium

## Effort Estimate
Low (3-5 days)

## Labels
`enhancement`, `algorithm`, `vocabulary`

## Description

Prioritize high-frequency words for beginners based on Russian word frequency lists (e.g., Russian National Corpus), allowing users to reach practical communication ability faster. Research shows that high-frequency words provide the most communicative value and are easier to learn.

## Background

Not all words are equally valuable for language learners. The most common 1,000 words in Russian account for approximately 80% of everyday conversation. By focusing early learning on high-frequency words, learners can achieve practical communication much faster.

**Current State**: All words treated equally. Random or arbitrary word selection.

**Desired State**: Words tagged by frequency rank and CEFR level. Beginners see high-frequency words first. Natural progression through frequency tiers.

## Research Backing

- JSTOR: Word frequency is a strong predictor of vocabulary acquisition, especially for concrete nouns
- Reading Matrix (2024): High-frequency words are learned more easily and provide greater communicative value
- Cambridge Applied Psycholinguistics: Frequency affects orthographic knowledge and recognition
- CEFR Framework: Standardized levels (A1, A2, B1, B2, C1, C2) widely used in European language education

## Implementation Details

### Frequency Data Source

**Option 1: Russian National Corpus Frequency List**
- Most authoritative Russian frequency data
- Based on billions of words of real Russian text
- Free to use for educational purposes

**Option 2: Sharoff's Internet Russian Frequency List**
- Based on web text
- More contemporary vocabulary
- Includes informal language

**Recommended**: Use Russian National Corpus for base, supplement with contemporary words from Sharoff.

### Database Schema Changes

Add frequency data to existing word storage:

```javascript
// Extend existing word data
{
  word: string,
  frequency_rank: number,      // 1 = most common
  frequency_per_million: number,
  cefr_level: string,          // A1, A2, B1, B2, C1, C2
  wordnet_freq: number         // Alternative frequency measure
}
```

### Frequency List Format

```csv
rank,word,frequency_per_million,cefr_level
1,и,23150.24,A1
2,в,17420.16,A1
3,не,12458.09,A1
4,на,10234.45,A1
5,я,9876.32,A1
6,что,9234.11,A1
7,он,8765.54,A1
8,с,8234.76,A1
9,как,7654.32,A1
10,а,7234.11,A1
...
```

### CEFR Level Distribution

**A1 (Beginner)**: 300-500 most frequent words
- Basic everyday expressions
- Survival vocabulary
- Personal information

**A2 (Elementary)**: 500-1,000 words
- Common phrases
- Routine tasks
- Basic social situations

**B1 (Intermediate)**: 1,000-2,500 words
- Work, school, leisure
- Travel independently
- Familiar topics

**B2 (Upper Intermediate)**: 2,500-5,000 words
- Complex topics
- Abstract concepts
- Detailed arguments

**C1 (Advanced)**: 5,000-10,000 words
- Demanding topics
- Nuanced expression
- Professional contexts

**C2 (Mastery)**: 10,000+ words
- Native-like proficiency
- Specialized vocabulary

### Word Selection Algorithm

```javascript
function selectWords(userLevel, count) {
  const levelRanges = {
    'A1': { min: 1, max: 500 },
    'A2': { min: 501, max: 1000 },
    'B1': { min: 1001, max: 2500 }
  };
  
  const range = levelRanges[userLevel];
  
  // Get words in frequency range
  const availableWords = words.filter(w => 
    w.frequency_rank >= range.min && 
    w.frequency_rank <= range.max
  );
  
  // Prioritize:
  // 1. Due for review (SRS)
  // 2. User's problematic letters
  // 3. Frequency rank (lower = more common)
  
  return availableWords
    .sort((a, b) => a.frequency_rank - b.frequency_rank)
    .slice(0, count);
}
```

### User Level Tracking

```javascript
// In user progress data
{
  current_level: 'A1',      // Current CEFR level
  words_mastered: 234,      // Count of mastered words
  level_progress: 0.47,     // Progress toward next level (0-1)
  estimated_vocabulary: 300 // Estimated active vocabulary
}
```

### UI Changes

**1. Level Indicator:**
```html
<div class="user-level">
  <span class="level-badge">A1</span>
  <div class="level-progress">
    <div class="progress-bar" style="width: 47%"></div>
  </div>
  <span class="progress-text">234 / 500 words</span>
</div>
```

**2. Word Difficulty Indicator:**
```html
<div class="word-card">
  <span class="word">дом</span>
  <span class="frequency-badge" title="Rank #45">★★★</span>
  <span class="cefr-badge">A1</span>
</div>
```

**3. Settings Panel:**
```html
<div class="difficulty-settings">
  <label>Current Level:</label>
  <select id="cefr-level">
    <option value="A1">A1 - Beginner</option>
    <option value="A2">A2 - Elementary</option>
    <option value="B1">B1 - Intermediate</option>
  </select>
  
  <label>
    <input type="checkbox" id="auto-progress">
    Automatically advance to next level
  </label>
</div>
```

**4. Statistics View:**
```html
<div class="vocabulary-stats">
  <h3>Vocabulary by Level</h3>
  <ul>
    <li>A1: 234 / 500 (47%)</li>
    <li>A2: 45 / 500 (9%)</li>
    <li>B1: 0 / 1500 (0%)</li>
  </ul>
  
  <h3>Most Common Words Mastered</h3>
  <p>You know 234 of the 500 most common Russian words (47%)</p>
</div>
```

### API Endpoints

```javascript
GET /api/words/level/:level
// Returns words for specified CEFR level

GET /api/user/level
// Returns current user level and progress

POST /api/user/level
{
  level: 'A2'
}
// Updates user's current level

GET /api/statistics/vocabulary-distribution
// Returns words mastered across levels
```

## Data Files Required

1. `frequency-list-5000.csv` - Top 5,000 Russian words with frequency data
2. `cefr-mappings.json` - CEFR level assignments
3. `word-metadata.json` - Additional word information (part of speech, gender, etc.)

## Acceptance Criteria

- [ ] Frequency list (top 5,000 words) imported into database
- [ ] All words tagged with frequency rank and CEFR level
- [ ] User level tracking implemented (A1-B2 minimum)
- [ ] Word selection algorithm prioritizes high-frequency words
- [ ] Level indicator shown in UI
- [ ] Settings panel allows user to select level
- [ ] Statistics page shows vocabulary distribution by level
- [ ] Level progression automatic when 80% of level mastered
- [ ] Manual level selection available in settings
- [ ] Tests cover word selection algorithm
- [ ] Documentation explains levels and progression

## Frequency List Sources

### Recommended Sources:

1. **Russian National Corpus**: http://www.ruscorpora.ru/
   - Most authoritative
   - Academic quality
   - Requires extraction/parsing

2. **Wiktionary Frequency Lists**: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Russian
   - Ready-to-use format
   - Good for MVP
   - Limited to ~10,000 words

3. **Hermit Dave's Word Frequency Data**: https://github.com/hermitdave/FrequencyWords
   - Open source
   - Multiple sources
   - Easy integration

## Testing Requirements

1. Test word selection for each CEFR level
2. Test level progression logic
3. Test frequency ranking
4. Verify frequency data accuracy (sample check)
5. Test UI displays correct level
6. Test statistics calculations
7. Test migration of existing words to frequency system

## Performance Considerations

- Index on `frequency_rank` for fast queries
- Index on `cefr_level` for filtering
- Cache frequently-accessed frequency data
- Pre-compute level ranges at startup

## Documentation Requirements

- User guide explaining CEFR levels
- Explanation of word frequency and selection
- Guide to level progression
- Update README with frequency-based learning
- Developer documentation for frequency list format

## Related Research

See `docs/language-learning-research.md` section 1.5 for detailed research on word frequency and vocabulary acquisition.

## Follow-up Issues

After implementation, consider:
- Dynamic level assessment (test user to determine level)
- Custom word lists (user-specified topics)
- Domain-specific vocabulary (business, medical, etc.)
- Compound word handling (multi-word expressions)
- Frequency-adjusted spaced repetition (combine with SM-2)
