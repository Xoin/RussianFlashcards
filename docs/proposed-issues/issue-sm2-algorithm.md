# Issue: Implement SM-2 Spaced Repetition Algorithm

## Priority
High

## Effort Estimate
Medium (2-3 weeks)

## Labels
`enhancement`, `algorithm`, `core-feature`

## Description

Replace the current error-rate-based lesson length adaptation with proper SM-2 (SuperMemo 2) spaced repetition scheduling for individual items. This will significantly improve long-term retention by scheduling reviews at optimal intervals based on individual memory strength.

## Background

The SM-2 algorithm, developed by Piotr Wozniak in 1987, is the foundation for modern spaced repetition systems like Anki. Research shows that SM-2-based systems can improve long-term retention by 30-50% compared to fixed-interval review systems.

**Current State**: The app adjusts lesson length (5-12 words) based on overall error rate but does not schedule individual items based on memory strength.

**Desired State**: Each letter-word-position combination is tracked individually with its own ease factor, interval, and next review date. Items due for review are prioritized in lessons.

## Research Backing

- Journal of Biomed Research (2024): Statistically significant improvements in exam performance with Anki
- SuperMemo research: Optimal intervals maximize retention while minimizing study time
- Cognitive science: Testing effect and spacing effect are among the most robust findings in learning research

## Implementation Details

### Database Schema Changes

Add new table `srs_items`:
```javascript
{
  id: number,
  letter: string,
  word: string,
  position: number,
  easeFactor: number,      // Initial: 2.5
  interval: number,         // Days until next review
  repetitions: number,      // Consecutive correct answers
  nextReviewDate: string,   // ISO 8601 timestamp
  lastReviewDate: string,
  createdAt: string
}
```

### SM-2 Formula

```javascript
function calculateNextReview(quality, item) {
  // quality: 0-5 (0=total blackout, 5=perfect recall)
  
  if (quality < 3) {
    // Reset on failure
    return {
      repetitions: 0,
      interval: 1,
      easeFactor: Math.max(1.3, item.easeFactor - 0.2)
    };
  }
  
  const newEF = Math.max(1.3, 
    item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  let newInterval;
  if (item.repetitions === 0) {
    newInterval = 1;
  } else if (item.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(item.interval * newEF);
  }
  
  return {
    repetitions: item.repetitions + 1,
    interval: newInterval,
    easeFactor: newEF,
    nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
  };
}
```

### User Interface Changes

1. **After each answer**: Show 4-button rating system
   - "Again" (quality=1): Forgot completely
   - "Hard" (quality=3): Recalled with difficulty
   - "Good" (quality=4): Recalled with effort
   - "Easy" (quality=5): Recalled instantly

2. **Lesson generation**: Prioritize due items
   ```javascript
   async generateLesson() {
     const dueItems = await db.getDueItems(); // nextReviewDate <= now
     const newItems = await db.getNewItems(5); // Add 5 new items per lesson
     return [...dueItems, ...newItems];
   }
   ```

3. **Statistics page**: Show SRS distribution
   - New: 0 reviews
   - Learning: < 21 day interval
   - Young: 21 days - 60 days
   - Mature: > 60 days

### API Endpoints

New/Modified endpoints:

```javascript
POST /api/review
{
  itemId: number,
  quality: number (1-5),
  responseTime: number // milliseconds
}

GET /api/due-count
// Returns number of items due for review

GET /api/srs-stats
// Returns distribution across SRS stages
```

## Acceptance Criteria

- [ ] Database schema includes SRS item tracking
- [ ] SM-2 algorithm correctly implemented
- [ ] After answering, user sees 4-button rating interface
- [ ] Due items are prioritized in lessons
- [ ] Statistics page shows SRS distribution
- [ ] Migration script converts existing letter mistakes to SRS items
- [ ] Tests cover SM-2 calculation logic
- [ ] Documentation explains SRS system to users

## Migration Strategy

For existing users with letter mistake history:
1. Create SRS items for each unique letter-word-position combo
2. Set initial ease factor based on historical accuracy
3. Set initial interval based on time since last mistake
4. Preserve existing mistake tracking for statistics

## Performance Considerations

- Index on `nextReviewDate` for efficient due item queries
- Index on `letter` for problematic letter analysis
- Batch database updates for review sessions

## Testing Requirements

1. Unit tests for SM-2 calculation
2. Test quality ratings produce expected intervals
3. Test failure resets correctly
4. Test migration from existing data
5. Integration test for full review flow

## Documentation Requirements

- User guide explaining SRS system
- Developer documentation for algorithm
- Comments in code explaining SM-2 formula
- Update README with new features

## Related Research

See `docs/language-learning-research.md` sections 1.1 and 1.2 for detailed research backing.

## Follow-up Issues

After implementation, consider:
- FSRS algorithm (more advanced than SM-2)
- Custom scheduling based on user patterns
- Interval optimization based on aggregate data
