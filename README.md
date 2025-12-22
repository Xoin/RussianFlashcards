# Flashcards

A flashcard application for learning Russian letters and simple words with intelligent progress tracking.

## Features

- **Letter Fill-in Exercises**: Practice Russian letters by filling in missing letters in simple words
- **Progress Tracking**: Automatically tracks which letters you struggle with most
- **Adaptive Lesson Length**: Lessons get shorter when you make many errors, longer when you're doing well
- **LM Studio Integration**: Optionally uses LM Studio to generate contextual words and lessons
- **No External Dependencies**: Built using only Node.js built-in modules

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

3. Start learning Russian letters!

## Optional: LM Studio Integration

For enhanced lesson generation, you can optionally connect to LM Studio:

1. Install and run [LM Studio](https://lmstudio.ai/)
2. Load a language model
3. Start the local server (default: http://localhost:1234)
4. The application will automatically use LM Studio when available

If LM Studio is not available, the application will use a built-in set of Russian words.

## How It Works

1. **Practice**: Fill in missing letters in Russian words
2. **Tracking**: Every mistake is recorded and tracked
3. **Adaptation**: The system focuses on letters you find challenging
4. **Progressive Learning**: 
   - High error rate (>50%): 5 words per lesson
   - Medium error rate (30-50%): 7 words per lesson
   - Low error rate (15-30%): 10 words per lesson
   - Very low error rate (<15%): 12 words per lesson

## Data Storage

User progress and mistakes are stored in `flashcards.json` in the project directory. This file is automatically created on first run.

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