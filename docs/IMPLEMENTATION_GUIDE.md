# Implementation Quick Start Guide

This guide helps developers get started implementing the research-backed enhancements for the Flashcards project.

## Getting Started

1. **Read the Research**: Start with [RESEARCH_SUMMARY.md](RESEARCH_SUMMARY.md) for a quick overview
2. **Choose a Feature**: Pick an issue from [proposed-issues/](proposed-issues/) based on your skills and interests
3. **Review Full Research**: Read relevant sections of [language-learning-research.md](language-learning-research.md)
4. **Implement**: Follow the detailed specifications in the issue document

## Recommended Implementation Order

### Phase 1: Quick Wins (Recommended Start Here)

#### 1. Audio Pronunciation Support (1-2 weeks)
**File**: [proposed-issues/issue-audio-pronunciation.md](proposed-issues/issue-audio-pronunciation.md)

**Why Start Here?**
- Low complexity (browser-native Web Speech API)
- High impact (addresses #1 Cyrillic learning challenge)
- No database changes required
- Immediate visible benefit

**Skills Needed**: JavaScript, Web APIs, basic UI

**Key Changes**:
- Add speaker button to each word
- Integrate Web Speech API
- Add settings for autoplay and speed

---

#### 2. Word Frequency-Based Selection (3-5 days)
**File**: [proposed-issues/issue-word-frequency.md](proposed-issues/issue-word-frequency.md)

**Why Next?**
- Quick to implement
- Improves learning progression
- Foundation for future features

**Skills Needed**: JavaScript, basic database operations

**Key Changes**:
- Import frequency list CSV
- Tag words with CEFR levels
- Update word selection algorithm

---

### Phase 2: Foundation Features

#### 3. SM-2 Spaced Repetition Algorithm (2-3 weeks)
**File**: [proposed-issues/issue-sm2-algorithm.md](proposed-issues/issue-sm2-algorithm.md)

**Why Third?**
- Requires database schema changes
- Foundation for optimal learning
- 30-50% improvement in retention

**Skills Needed**: JavaScript, database design, algorithm implementation

**Key Changes**:
- New database table for SRS items
- SM-2 algorithm implementation
- 4-button rating UI
- Statistics dashboard

---

#### 4. Contextual Learning with Sentences (2-3 weeks)
**File**: [proposed-issues/issue-contextual-learning.md](proposed-issues/issue-contextual-learning.md)

**Why Fourth?**
- Requires content creation
- Works well with LM Studio integration
- 40-60% improvement in retention

**Skills Needed**: JavaScript, database design, content creation

**Key Changes**:
- Sentence database
- Context display UI
- New exercise type: sentence completion
- LM Studio integration for generation

---

## Quick Implementation Tips

### For Audio Pronunciation

```javascript
// Simple implementation
function speakRussian(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.8; // Slower for learners
  speechSynthesis.speak(utterance);
}
```

### For Word Frequency

```javascript
// Priority sorting
function selectWords(level, count) {
  return words
    .filter(w => w.cefr_level === level)
    .sort((a, b) => a.frequency_rank - b.frequency_rank)
    .slice(0, count);
}
```

### For SM-2 Algorithm

```javascript
// Core SM-2 calculation
function calculateNextReview(quality, item) {
  if (quality < 3) {
    return { repetitions: 0, interval: 1, easeFactor: item.easeFactor - 0.2 };
  }
  
  const newEF = Math.max(1.3, 
    item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  let newInterval;
  if (item.repetitions === 0) newInterval = 1;
  else if (item.repetitions === 1) newInterval = 6;
  else newInterval = Math.round(item.interval * newEF);
  
  return {
    repetitions: item.repetitions + 1,
    interval: newInterval,
    easeFactor: newEF,
    nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
  };
}
```

## Testing Your Implementation

### Manual Testing Checklist

#### Audio Feature:
- [ ] Click speaker button - audio plays
- [ ] Audio is clear and correct Russian pronunciation
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Settings persist between sessions
- [ ] Autoplay works when enabled

#### Word Frequency:
- [ ] Beginners see A1 words
- [ ] Words are in frequency order
- [ ] Level progression works
- [ ] Statistics show correct distribution

#### SM-2 Algorithm:
- [ ] Rating buttons appear after answer
- [ ] Intervals calculated correctly
- [ ] Due items appear in lessons
- [ ] Statistics show SRS distribution

#### Contextual Learning:
- [ ] Context appears after exercise
- [ ] Sentences are appropriate level
- [ ] Translations are accurate
- [ ] Sentence completion works

### Automated Testing

```javascript
// Example test for SM-2
describe('SM-2 Algorithm', () => {
  it('should reset on failure', () => {
    const item = { easeFactor: 2.5, interval: 10, repetitions: 5 };
    const result = calculateNextReview(2, item); // Quality < 3
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });
  
  it('should increase interval on success', () => {
    const item = { easeFactor: 2.5, interval: 1, repetitions: 1 };
    const result = calculateNextReview(4, item);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });
});
```

## Data Files You'll Need

### For Word Frequency (Issue #4)
- `frequency-list-5000.csv` - Russian word frequency list
  - Source: Wiktionary or Russian National Corpus
  - Format: rank,word,frequency_per_million,cefr_level

### For Contextual Learning (Issue #3)
- `sentences.csv` - Example sentences
  - Format: word,sentence,translation,target_position,difficulty
  - Minimum: 150 sentences for top 50 words

### For Audio (Issue #2)
- No data files needed! Uses browser's built-in Web Speech API

## Common Pitfalls to Avoid

### Audio Implementation
❌ Don't: Create audio files manually  
✅ Do: Use Web Speech API for dynamic generation

❌ Don't: Play audio synchronously (blocks UI)  
✅ Do: Play asynchronously with loading indicators

### SM-2 Implementation
❌ Don't: Modify SM-2 formula without understanding it  
✅ Do: Follow proven algorithm exactly, then optimize later

❌ Don't: Schedule every item individually at first  
✅ Do: Start with simplified version, add complexity gradually

### Word Frequency
❌ Don't: Manually assign CEFR levels  
✅ Do: Use established frequency lists with pre-assigned levels

❌ Don't: Change levels too quickly  
✅ Do: Require 80%+ mastery before progression

## Getting Help

### Questions About Research
- Read the full research document: [language-learning-research.md](language-learning-research.md)
- Check the references section for original sources
- Open a GitHub discussion

### Implementation Questions
- Review the detailed issue specification
- Check the code examples in this guide
- Look at similar implementations (e.g., Anki for SM-2)
- Ask in GitHub issues

### Testing Help
- Follow the manual testing checklist above
- Run existing tests: `npm test` (if tests exist)
- Ask for code review before merging

## Resources

### Spaced Repetition
- [SuperMemo Algorithm Description](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Anki Manual - Deck Options](https://docs.ankiweb.net/deck-options.html)
- [FSRS Algorithm Guide](https://github.com/open-spaced-repetition/fsrs4anki/wiki)

### Russian Language Learning
- [Russian National Corpus](http://www.ruscorpora.ru/)
- [Wiktionary Russian Frequency List](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Russian)
- [CEFR Framework](https://www.coe.int/en/web/common-european-framework-reference-languages/)

### Web Speech API
- [MDN Web Speech API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Compatibility](https://caniuse.com/speech-synthesis)

### Database Design
- [JSON-based Database Patterns](https://jsonlines.org/)
- [SQLite for Node.js](https://github.com/WiseLibs/better-sqlite3) (if upgrading from JSON)

## Contributing Your Implementation

Once you've implemented a feature:

1. **Test Thoroughly**: Use manual and automated tests
2. **Document Changes**: Update README if needed
3. **Add Examples**: Include usage examples
4. **Request Review**: Open a PR referencing the research
5. **Share Learnings**: Document any insights or challenges

## Next Steps

1. ✅ Choose your starting feature (recommend Audio or Word Frequency)
2. ✅ Read the detailed issue specification
3. ✅ Review relevant research sections
4. ✅ Set up development environment
5. ✅ Start coding!
6. ✅ Test thoroughly
7. ✅ Submit PR

Good luck with your implementation! Remember: these changes are backed by peer-reviewed research and will significantly improve learning outcomes for users.
