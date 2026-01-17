# Flashcards

A flashcard application for learning Russian letters and simple words with intelligent progress tracking, spaced repetition, contextual learning, and word frequency-based selection.

## Features

- **Letter Fill-in Exercises**: Practice Russian letters by filling in missing letters in simple words
- **Sentence Completion Exercises**: Learn words in context by completing Russian sentences
- **Word Frequency-Based Selection**: Learn high-frequency words first for faster practical communication
- **CEFR Level Tracking**: Progress through standardized language levels (A1-C2)
- **SM-2 Spaced Repetition System**: Optimized review scheduling based on memory strength for long-term retention
- **Contextual Learning**: See example sentences and definitions after each exercise to improve retention
- **Audio Pronunciation**: Listen to Russian word pronunciation with text-to-speech support
- **Progress Tracking**: Automatically tracks which letters you struggle with most
- **Adaptive Lesson Length**: Lessons get shorter when you make many errors, longer when you're doing well
- **LM Studio Integration**: Optionally uses LM Studio to generate contextual sentences and lessons
- **No External Dependencies**: Built using only Node.js built-in modules

### Word Frequency-Based Learning

The application prioritizes high-frequency words based on Russian word frequency lists, allowing beginners to achieve practical communication ability faster. Research shows that the most common 1,000 words account for approximately 80% of everyday conversation.

**Key Features:**
- **CEFR Level System**: Words are organized by internationally recognized levels:
  - **A1 (Beginner)**: 297 most frequent words - Basic everyday expressions
  - **A2 (Elementary)**: 276 words - Common phrases and routine tasks
  - **B1 (Intermediate)**: 208 words - Work, school, leisure topics
  - **B2 (Upper Intermediate)**: 110 words - Complex topics and abstract concepts
  - **C1 (Advanced)**: 98 words - Demanding topics and nuanced expression
  - **C2 (Mastery)**: 133 words - Native-like proficiency

- **Automatic Level Progression**: Advances to the next level when 80% of current level words are mastered
- **Manual Level Selection**: Choose your starting level based on your knowledge
- **Vocabulary Statistics**: Track your progress across all CEFR levels
- **Smart Word Selection**: Prioritizes high-frequency words while still focusing on your problematic letters

**Research Backing:**
- JSTOR: Word frequency is a strong predictor of vocabulary acquisition
- Reading Matrix (2024): High-frequency words provide greater communicative value
- CEFR Framework: Standardized levels used across European language education

### SM-2 Spaced Repetition System

The application now uses the proven SM-2 algorithm (SuperMemo 2) to optimize long-term retention:

- **Intelligent Scheduling**: Each letter-word-position combination is tracked individually with its own review schedule
- **Memory-Based Reviews**: Items are scheduled based on how well you remember them
- **4-Button Rating System**: After each answer, rate your recall:
  - **Again** (quality=1): Forgot completely - resets the item
  - **Hard** (quality=3): Recalled with difficulty - increases interval slightly
  - **Good** (quality=4): Recalled with effort - standard interval increase
  - **Easy** (quality=5): Recalled instantly - larger interval increase
- **Prioritized Reviews**: Due items appear first in lessons, ensuring you review at optimal times
- **Progress Tracking**: See your learning progress across four stages:
  - **New**: Items you haven't reviewed yet
  - **Learning**: Items with intervals less than 21 days
  - **Young**: Items with intervals between 21-60 days
  - **Mature**: Items with intervals over 60 days

Research shows that SM-2-based systems can improve long-term retention by 30-50% compared to fixed-interval review systems.

### Contextual Learning

Research shows that learning words in context improves retention by 40-60%. After completing each exercise, you'll see:

- **Word Definition**: Translation, part of speech, and gender (for nouns)
- **Example Sentences**: Real Russian sentences showing how the word is used
- **English Translations**: Clear translations to understand meaning

The application includes:
- 58 words with detailed definitions
- 171 example sentences at beginner (A1-A2) level
- Two exercise types mixed throughout lessons:
  - 60% Letter fill-in exercises
  - 20% Sentence completion exercises
  - 20% Future exercise types

### Audio Features

The application includes built-in audio pronunciation support to help you learn Russian word pronunciation:

- **🔊 Audio Button**: Click the speaker icon next to any Russian word to hear its pronunciation
- **Keyboard Shortcut**: Press the Space bar to play audio pronunciation of the current word
- **Customizable Settings**:
  - Enable/disable audio
  - Autoplay pronunciation on new words
  - Adjust speech rate (0.5x - 2.0x)
  - Select from available Russian voices
- **Browser Compatibility**: Uses the Web Speech API, supported by Chrome, Firefox, Safari, and Edge
- **Graceful Degradation**: Works even if Russian voices aren't available (falls back to default voice)

## Prerequisites

- Node.js v20 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Xoin/Flashcards.git
cd Flashcards
```

2. No npm install needed - the project uses only built-in Node.js modules!

3. **IMPORTANT - Load Initial Data** (Required for full functionality):
```bash
node migrate.js
node migrate-frequency.js
```

This will import:
- 58 word definitions with translations and grammatical information
- 171 example sentences to provide contextual learning
- 989 frequency-ranked words with CEFR level classifications

**Note**: These migrations are **required** for vocabulary tracking, contextual learning, and CEFR level progression features to work properly. The application will still run without them, but with limited functionality.

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Start learning Russian!

**First-time users**: If you see a warning about missing initial data when starting the server, stop the server (Ctrl+C) and run the migration commands above.

## Optional: LM Studio Integration

For enhanced lesson and sentence generation, you can optionally connect to LM Studio:

1. Install and run [LM Studio](https://lmstudio.ai/)
2. Load a language model
3. Start the local server (default: http://localhost:1234)
4. The application will automatically use LM Studio when available

LM Studio can be used to:
- Generate new contextual sentences for words
- Create custom lessons based on focus areas

If LM Studio is not available, the application will use a built-in set of Russian words and sentences.

## How It Works

1. **Practice**: Fill in missing letters in Russian words or complete Russian sentences
2. **Rate Your Memory**: After each answer, rate how well you recalled it (Again/Hard/Good/Easy)
3. **Listen**: Click the 🔊 button to hear Russian pronunciation
4. **Learn Context**: After each exercise, see the word's definition and example sentences
5. **Spaced Repetition**: The SM-2 algorithm schedules your next review at the optimal time
6. **Progressive Learning**: Items you struggle with appear more frequently until mastered

### Exercise Types

The application uses a mix of exercise types to optimize learning:

1. **Letter Fill-in (60%)**: Practice individual letters by filling in blanks in words
2. **Sentence Completion (20%)**: Learn words in context by completing sentences
3. **Future exercises (20%)**: Reserved for planned features like word recognition

### Context Panel

After completing each exercise (correct or incorrect), a context panel appears showing:

- The word in Russian with its English translation
- Grammatical information (part of speech, gender for nouns)
- An example sentence in Russian with English translation
- Option to view more example sentences

### Using Audio Features

To access audio settings:
1. Click the **⚙️ Settings** button in the top-right corner
2. Adjust audio preferences:
   - Toggle "Enable Audio" on/off
   - Enable "Autoplay on New Word" for automatic pronunciation
   - Adjust speech rate using the slider (slower for beginners, faster for advanced learners)
   - Select your preferred Russian voice (if multiple are available)
3. Click "Test Audio" to preview your settings

**Keyboard Shortcuts:**
- Press **Space** to play audio for the current word

## Data Storage

User progress, mistakes, SRS items, word definitions, example sentences, and frequency data are stored in `flashcards.json` in the project directory. This file is automatically created on first run and includes:

- **Letter mistakes tracking**: Records which letters you struggle with most
- **SRS items**: Individual review schedules for each letter-word-position combination
- **User progress statistics**: Session-by-session tracking of correct/incorrect answers
- **Audio settings preferences**: Your preferred audio settings
- **Word definitions database**: Translations and grammatical information (loaded via `migrate.js`)
- **Example sentences database**: Contextual examples for words (loaded via `migrate.js`)
- **Frequency-ranked words**: ~1,000 words with CEFR levels (loaded via `migrate-frequency.js`)
- **User level tracking**: Your current CEFR level and vocabulary progress

**Progress Persistence**: All progress is automatically saved to `flashcards.json` after each action (answering a question, completing a lesson, changing settings). Your progress will persist across browser refreshes and server restarts.

**Backup Recommendation**: Consider backing up `flashcards.json` periodically to preserve your learning progress.

## API Endpoints

The application provides several REST API endpoints:

### Lessons
- `GET /api/lesson` - Get a new lesson with frequency-based and SRS-based word selection (prioritizes due items and high-frequency words)

### SRS (Spaced Repetition)
- `POST /api/review` - Submit a review rating for an item
  - Body: `{ itemId, quality (1-5), responseTime (optional) }`
- `GET /api/due-count` - Get count of items due for review
- `GET /api/srs-stats` - Get SRS statistics (new, learning, young, mature)

### Progress & Mistakes
- `POST /api/mistake` - Record a letter mistake
- `POST /api/progress` - Update session progress
- `GET /api/statistics` - Get mistake statistics

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save user settings

### User Level & Frequency
- `GET /api/user/level` - Get user level information and vocabulary distribution
- `POST /api/user/level` - Update user level
  - Body: `{ level: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2' }` or `{ auto_progress: boolean }`
- `GET /api/words/level/:level` - Get words for a specific CEFR level
- `GET /api/statistics/vocabulary-distribution` - Get vocabulary distribution across all levels

### Contextual Learning
- `GET /api/word/:word/definition` - Get word definition and translation
- `GET /api/word/:word/sentences` - Get example sentences for a word
- `POST /api/generate-sentence` - Generate new sentence using LM Studio (optional)

## Research and Future Enhancements

This project is backed by comprehensive research on language acquisition and cognitive science. We've researched:

- Spaced repetition algorithms (SM-2, FSRS)
- Retrieval practice and flashcard effectiveness
- Russian language acquisition pedagogy
- Cyrillic alphabet learning challenges
- Contextual learning and word frequency optimization

**See our research documentation:**
- 📚 [Research Summary](docs/RESEARCH_SUMMARY.md) - Quick overview of findings and recommendations
- 📖 [Full Research Document](docs/language-learning-research.md) - Comprehensive research with citations
- 💡 [Proposed Features](docs/proposed-issues/) - Detailed specifications for planned enhancements

**Key recommendations from research:**
1. **SM-2 Spaced Repetition** - 30-50% better retention
2. **Audio Pronunciation** - Critical for Cyrillic letter-sound mapping
3. **Contextual Learning** - 40-60% improvement with example sentences
4. **Word Frequency** - Faster path to practical communication

## License

MIT