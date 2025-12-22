# Issue: Add Audio Pronunciation Support

## Priority
High

## Effort Estimate
Low-Medium (1-2 weeks)

## Labels
`enhancement`, `audio`, `accessibility`

## Description

Integrate text-to-speech (TTS) for Russian words to support pronunciation learning and enable multisensory acquisition of the Cyrillic alphabet. Research shows that audio support is critical for overcoming the #1 challenge in Cyrillic learning: mapping letters to sounds.

## Background

Research from HSE (2020) on "Orthographic Learning in L1 and L2 Alphabets" shows that learners struggle with letter-sound connections, especially when Cyrillic letters look similar to Latin letters but represent different sounds. Audio support with native pronunciation is identified as a key strategy for overcoming these challenges.

**Current State**: No audio or pronunciation support. Learning is purely visual.

**Desired State**: Users can hear correct Russian pronunciation for all words, with optional autoplay and listening exercises.

## Research Backing

- HSE (2020): Phonological inconsistencies impede Cyrillic learning; audio essential
- Russian Language Academy BORN: Audio samples crucial for developing auditory discrimination
- MGU Russian: Multisensory approaches (visual-auditory-kinesthetic) most effective
- Cognitive science: Multimodal learning improves retention by 40-60%

## Implementation Options

### Option 1: Web Speech API (Recommended for MVP)

**Pros:**
- Built into modern browsers
- No API keys or external dependencies
- Zero cost
- Works offline

**Cons:**
- Quality varies by browser
- Limited voice options
- May not work on older browsers

**Implementation:**
```javascript
function speakRussian(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.8; // Slightly slower for learners
  speechSynthesis.speak(utterance);
}
```

### Option 2: Google Cloud Text-to-Speech API

**Pros:**
- High-quality natural voices
- Consistent across platforms
- Multiple voice options (WaveNet)

**Cons:**
- Requires API key and billing
- Network dependency
- Cost: $4 per 1 million characters

### Option 3: Microsoft Azure Speech Service

**Pros:**
- Excellent Russian voice quality
- Neural TTS voices available
- Free tier: 500k characters/month

**Cons:**
- Requires API key
- Network dependency
- Setup complexity

## Recommended Approach

**Phase 1**: Implement Web Speech API for immediate functionality
**Phase 2**: Add Azure Speech as optional enhancement for premium quality

## Implementation Details

### Frontend Changes

Add audio button to each word:
```html
<div class="word-container">
  <span class="russian-word">дом</span>
  <button class="audio-btn" onclick="speakWord('дом')" aria-label="Pronounce word">
    🔊
  </button>
</div>
```

Add settings:
```javascript
const audioSettings = {
  enabled: true,
  autoplay: false,      // Auto-play on word display
  rate: 0.8,            // Speech rate (0.5-2.0)
  voiceIndex: 0,        // Selected voice
  volume: 1.0           // 0-1
};
```

### CSS Styling

```css
.audio-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: transform 0.2s;
}

.audio-btn:hover {
  transform: scale(1.2);
}

.audio-btn:active {
  transform: scale(0.9);
}
```

### New Exercise Type: Listening Practice

```javascript
// User hears audio, types what they hear
async function generateListeningExercise(word) {
  return {
    type: 'listening',
    audio: word,
    correctAnswer: word,
    showAudioOnly: true
  };
}
```

### API Changes

```javascript
// Add audio preference to user progress
POST /api/settings
{
  audio: {
    enabled: boolean,
    autoplay: boolean,
    rate: number
  }
}
```

## User Interface Flow

1. **Word Display**: Each word shows speaker icon 🔊
2. **On Click**: Plays audio pronunciation
3. **Settings Panel**: 
   - Enable/disable audio
   - Autoplay on/off
   - Speech rate slider (0.5x - 2.0x)
   - Voice selection (if multiple available)
4. **Listening Exercise Mode**: 
   - Shows only speaker icon
   - User hears word and types it
   - Immediate feedback on correctness

## Acceptance Criteria

- [ ] Audio button appears on all Russian words
- [ ] Clicking button plays correct Russian pronunciation
- [ ] Settings panel allows enabling/disabling audio
- [ ] Settings panel includes autoplay toggle
- [ ] Settings panel includes speed control (0.5x-2.0x)
- [ ] Audio works on Chrome, Firefox, Safari, Edge
- [ ] Listening exercise type implemented
- [ ] Audio gracefully degrades if unavailable
- [ ] Visual feedback during audio playback
- [ ] Keyboard shortcut for audio (e.g., Space bar)

## Accessibility Considerations

- Proper ARIA labels on audio buttons
- Keyboard navigation support
- Visual feedback for audio playback (animated icon)
- Captions/transcription available
- Volume control for hearing-impaired users

## Testing Requirements

1. Test on major browsers (Chrome, Firefox, Safari, Edge)
2. Test on mobile devices (iOS Safari, Android Chrome)
3. Test with various Russian words (different lengths, stress patterns)
4. Test autoplay functionality
5. Test speech rate adjustments
6. Test graceful degradation when Speech API unavailable
7. Test keyboard shortcuts

## Performance Considerations

- Lazy-load Speech API only when needed
- Cache voice selection
- Throttle rapid audio button clicks
- Consider pre-loading audio for next word in lesson

## Documentation Requirements

- User guide for audio features
- Settings documentation
- Browser compatibility notes
- Keyboard shortcuts guide
- Update README with audio features

## Related Research

See `docs/language-learning-research.md` section 1.4 for detailed research on Cyrillic alphabet learning challenges and audio support effectiveness.

## Follow-up Issues

After implementation, consider:
- Speech recognition for pronunciation assessment
- Native speaker audio recordings for higher quality
- Phonetic transcription display (IPA)
- Slow/fast playback modes
- Male/female voice options
