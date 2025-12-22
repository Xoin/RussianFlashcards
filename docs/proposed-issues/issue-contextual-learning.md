# Issue: Add Contextual Learning with Example Sentences

## Priority
High

## Effort Estimate
Medium (2-3 weeks)

## Labels
`enhancement`, `vocabulary`, `content`

## Description

Display example sentences for vocabulary words to provide semantic context and improve retention through contextual learning. Research shows that context dramatically improves vocabulary retention (40-60% improvement) and understanding of meaning nuances.

## Background

Research consistently shows that words learned in rich, supportive contexts are retained significantly better than words learned in isolation. Context provides semantic clues, reinforces connections to other words, and helps learners understand how words are actually used.

**Current State**: Words presented in isolation without context or meaning.

**Desired State**: Each word includes example sentences, translations, and contextual usage. New exercise types use sentences for fill-in-the-blank practice.

## Research Backing

- Cambridge Applied Psycholinguistics: High-context conditions produce significantly higher productive and receptive vocabulary knowledge
- ERIC/JLTR (2014): Context dramatically affects long-term retention and form-meaning connections
- JSTOR: For verbs especially, contextual diversity is more important than raw frequency
- Reading Matrix (2024): Multiple exposures in varied contexts are key for productive vocabulary

## Implementation Details

### Database Schema Changes

Add `sentences` table:
```javascript
{
  id: number,
  word: string,
  sentence: string,          // Russian sentence
  translation: string,       // English translation
  targetPosition: number,    // Position of target word in sentence
  difficulty: string,        // 'beginner', 'intermediate', 'advanced'
  createdAt: string
}
```

Add `wordDefinitions` table:
```javascript
{
  id: number,
  word: string,
  translation: string,       // English translation
  partOfSpeech: string,      // noun, verb, adjective, etc.
  gender: string,            // masculine, feminine, neuter (for nouns)
  definition: string         // Brief definition in English
}
```

### LM Studio Integration for Sentence Generation

```javascript
async function generateContextualSentence(word) {
  const prompt = `Create a simple Russian sentence using the word "${word}". 
The sentence should be appropriate for beginners (A1-A2 level).
Format:
Russian: [sentence]
English: [translation]`;

  const response = await lmStudio.generateCompletion(prompt, 150);
  return parseGeneratedSentence(response);
}
```

### Example Sentence Database (Starter Set)

```javascript
const exampleSentences = [
  {
    word: 'дом',
    sentence: 'Это мой дом.',
    translation: 'This is my house.',
    targetPosition: 2
  },
  {
    word: 'кот',
    sentence: 'Мой кот спит.',
    translation: 'My cat is sleeping.',
    targetPosition: 1
  },
  {
    word: 'книга',
    sentence: 'Я читаю книгу.',
    translation: 'I am reading a book.',
    targetPosition: 2
  }
  // ... 50+ more examples
];
```

### New Exercise Type: Sentence Completion

```javascript
function generateSentenceExercise(sentence) {
  // Replace target word with blank
  const words = sentence.sentence.split(' ');
  words[sentence.targetPosition] = '____';
  
  return {
    type: 'sentence-completion',
    prompt: words.join(' '),
    translation: sentence.translation,
    correctAnswer: sentence.word,
    fullSentence: sentence.sentence
  };
}
```

### User Interface Changes

**1. After Exercise Completion - Context Display:**
```html
<div class="context-panel">
  <h3>Context & Meaning</h3>
  
  <div class="word-info">
    <span class="russian-word">дом</span>
    <span class="translation">house, home (masculine noun)</span>
  </div>
  
  <div class="example-sentence">
    <p class="russian">Это мой дом.</p>
    <p class="english">This is my house.</p>
  </div>
  
  <button class="show-more">Show more examples</button>
</div>
```

**2. Sentence Completion Exercise:**
```html
<div class="sentence-exercise">
  <p class="instruction">Fill in the missing word:</p>
  <p class="sentence-prompt">Это мой ____.</p>
  <p class="translation">This is my house.</p>
  <input type="text" id="answer" placeholder="Type the word...">
</div>
```

**3. Word Detail View (Optional):**
```html
<div class="word-details-modal">
  <h2>дом</h2>
  <div class="definition">
    <span class="translation">house, home</span>
    <span class="pos">masculine noun</span>
  </div>
  
  <h3>Example Sentences</h3>
  <ul class="sentence-list">
    <li>
      <p class="ru">Это мой дом.</p>
      <p class="en">This is my house.</p>
    </li>
    <li>
      <p class="ru">Он идёт домой.</p>
      <p class="en">He is going home.</p>
    </li>
  </ul>
</div>
```

### API Endpoints

```javascript
GET /api/word/:word/sentences
// Returns example sentences for a word

GET /api/word/:word/definition
// Returns definition and translation

POST /api/generate-sentence
{
  word: string,
  difficulty: string
}
// Uses LM Studio to generate contextual sentence
```

## Content Requirements

### Initial Content (Minimum Viable Product)

- 50 most common Russian words with definitions
- 2-3 example sentences per word (150 sentences minimum)
- All sentences A1-A2 level (beginner-friendly)
- All sentences include English translations

### Content Format

```csv
word,translation,part_of_speech,gender,sentence,sentence_translation,target_position
дом,house/home,noun,masculine,Это мой дом.,This is my house.,2
кот,cat,noun,masculine,Мой кот спит.,My cat is sleeping.,1
```

## Acceptance Criteria

- [ ] Database schema includes sentences and definitions tables
- [ ] At least 50 words have definitions
- [ ] At least 150 example sentences in database
- [ ] After completing exercise, context panel displays with sentence
- [ ] New exercise type: sentence completion
- [ ] Sentence completion exercises appear in lessons (20% of exercises)
- [ ] LM Studio integration generates sentences for words without examples
- [ ] Word detail view shows all available sentences
- [ ] All sentences include English translations
- [ ] Sentences appropriate for beginner level (A1-A2)
- [ ] Migration script imports initial sentence database
- [ ] Tests cover sentence generation and display

## Exercise Mix

Recommended distribution in lessons:
- 60% letter fill-in (current exercise)
- 20% sentence completion
- 20% word recognition/multiple choice (future)

## Quality Assurance for Generated Sentences

When using LM Studio to generate sentences:
1. Validate sentence is proper Russian
2. Verify word appears in sentence
3. Check sentence length (5-10 words ideal)
4. Ensure translation is accurate
5. Flag for human review if validation fails

## Testing Requirements

1. Test sentence display after exercises
2. Test sentence completion exercise flow
3. Test LM Studio sentence generation
4. Test fallback when LM Studio unavailable
5. Test with Cyrillic input
6. Test translation accuracy
7. Test database queries for sentences

## Content Creation Strategy

**Phase 1**: Manual curation (50 words, 150 sentences)
**Phase 2**: LM Studio generation with human review
**Phase 3**: Community contributions (user-submitted examples)

### High-Priority Words for Sentences

Focus on:
1. Top 100 frequency words
2. Words currently in fallback word list
3. Words users struggle with most (from error tracking)

## Documentation Requirements

- User guide explaining context feature
- Content contribution guidelines
- LM Studio prompt templates
- Update README with contextual learning features
- Developer guide for adding sentences

## Related Research

See `docs/language-learning-research.md` section 1.5 for detailed research on contextual learning and vocabulary acquisition.

## Follow-up Issues

After implementation, consider:
- Cloze deletion exercises (multiple words removed)
- Audio sentences with native speaker recordings
- User-generated sentence contributions
- Sentence difficulty progression (A1→A2→B1)
- Thematic sentence groups (family, food, travel)
- Grammar hints in context panel
