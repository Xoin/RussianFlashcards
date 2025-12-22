# Flashcards

A flashcard application for learning Russian letters and simple words with intelligent progress tracking and contextual learning.

## Features

- **Letter Fill-in Exercises**: Practice Russian letters by filling in missing letters in simple words
- **Sentence Completion Exercises**: Learn words in context by completing Russian sentences
- **Contextual Learning**: See example sentences and definitions after each exercise to improve retention
- **Audio Pronunciation**: Listen to Russian word pronunciation with text-to-speech support
- **Progress Tracking**: Automatically tracks which letters you struggle with most
- **Adaptive Lesson Length**: Lessons get shorter when you make many errors, longer when you're doing well
- **LM Studio Integration**: Optionally uses LM Studio to generate contextual sentences and lessons
- **No External Dependencies**: Built using only Node.js built-in modules

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

### First Time Setup

If this is your first time running the application, you may want to load the initial content database:

```bash
node migrate.js
```

This will import:
- 58 word definitions with translations and grammatical information
- 171 example sentences to provide contextual learning

The migration script will only run once - it skips if data already exists.

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
2. **Listen**: Click the 🔊 button to hear Russian pronunciation
3. **Learn Context**: After each exercise, see the word's definition and example sentences
4. **Tracking**: Every mistake is recorded and tracked
5. **Adaptation**: The system focuses on letters you find challenging
6. **Progressive Learning**: 
   - High error rate (>50%): 5 words per lesson
   - Medium error rate (30-50%): 7 words per lesson
   - Low error rate (15-30%): 10 words per lesson
   - Very low error rate (<15%): 12 words per lesson

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

User progress, mistakes, word definitions, and example sentences are stored in `flashcards.json` in the project directory. This file is automatically created on first run and includes:

- Letter mistakes tracking
- User progress statistics  
- Audio settings preferences
- Word definitions database
- Example sentences database

## API Endpoints

The application provides several REST API endpoints:

### Lessons
- `GET /api/lesson` - Get a new lesson with adaptive word selection

### Progress & Mistakes
- `POST /api/mistake` - Record a letter mistake
- `POST /api/progress` - Update session progress
- `GET /api/statistics` - Get mistake statistics

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save user settings

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