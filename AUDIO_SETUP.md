# Audio Setup Guide

This guide explains how to add audio files for Books 2 and 3 in the Phonics Sonics project.

## Audio File Requirements

All audio files should be in `.wav` format for best compatibility. The application will also attempt to load `.mp3` files as a fallback.

## Book 2: Word Families Audio Files

Place your word family audio files in the `assets/audio/book2/` directory.

### Required Files:

- `at.wav` - Pronunciation of the "-at" word family
- `an.wav` - Pronunciation of the "-an" word family
- `ap.wav` - Pronunciation of the "-ap" word family
- `ag.wav` - Pronunciation of the "-ag" word family
- `ad.wav` - Pronunciation of the "-ad" word family
- `am.wav` - Pronunciation of the "-am" word family
- `ig.wav` - Pronunciation of the "-ig" word family
- `in.wav` - Pronunciation of the "-in" word family
- `ip.wav` - Pronunciation of the "-ip" word family
- `it.wav` - Pronunciation of the "-it" word family
- `id.wav` - Pronunciation of the "-id" word family
- `og.wav` - Pronunciation of the "-og" word family
- `op.wav` - Pronunciation of the "-op" word family
- `ot.wav` - Pronunciation of the "-ot" word family
- `ob.wav` - Pronunciation of the "-ob" word family
- `ug.wav` - Pronunciation of the "-ug" word family
- `un.wav` - Pronunciation of the "-un" word family
- `ut.wav` - Pronunciation of the "-ut" word family
- `ub.wav` - Pronunciation of the "-ub" word family
- `ed.wav` - Pronunciation of the "-ed" word family
- `en.wav` - Pronunciation of the "-en" word family
- `et.wav` - Pronunciation of the "-et" word family
- `ell.wav` - Pronunciation of the "-ell" word family
- `est.wav` - Pronunciation of the "-est" word family

### Total Files Needed: 24

## Book 3: Digraphs Audio Files

Place your digraph audio files in the `assets/audio/book3/` directory.

### Required Files:

- `ch.wav` - Pronunciation of the "ch" digraph sound (as in "chair")
- `sh.wav` - Pronunciation of the "sh" digraph sound (as in "ship")
- `th.wav` - Pronunciation of the "th" digraph sound (as in "this")
- `wh.wav` - Pronunciation of the "wh" digraph sound (as in "what")
- `ph.wav` - Pronunciation of the "ph" digraph sound (as in "phone")
- `ck.wav` - Pronunciation of the "ck" digraph sound (as in "duck")
- `ng.wav` - Pronunciation of the "ng" digraph sound (as in "ring")
- `qu.wav` - Pronunciation of the "qu" digraph sound (as in "queen")

### Total Files Needed: 8

## How to Add Your Audio Files

### From Local Machine:

1. Locate your audio files on your local machine:
   - Book 2 files: `C:\Users\natal\Desktop\audio2\`
   - Book 3 files: `C:\Users\natal\Desktop\audio3\`

2. Copy the Book 2 files to: `assets/audio/book2/`
3. Copy the Book 3 files to: `assets/audio/book3/`

### Using Command Line:

```bash
# For Book 2
cp /path/to/your/audio2/*.wav assets/audio/book2/

# For Book 3
cp /path/to/your/audio3/*.wav assets/audio/book3/
```

## Audio File Format Specifications

- **Format**: WAV (preferred) or MP3 (fallback)
- **Sample Rate**: 44.1 kHz recommended
- **Bit Depth**: 16-bit or higher
- **Channels**: Mono or Stereo
- **Duration**: 1-3 seconds recommended for best user experience

## Testing Audio Playback

After adding your audio files:

1. Open `book2.html` in a web browser
2. Click the play button (▶) on any word family card
3. Verify that the audio plays correctly
4. Repeat for `book3.html` with digraph cards

## Troubleshooting

### Audio Not Playing

- Check that the file names match exactly (case-sensitive)
- Ensure files are in `.wav` or `.mp3` format
- Verify file permissions allow reading
- Check browser console for error messages
- Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)

### Audio Quality Issues

- Ensure audio files are not corrupted
- Check that sample rate is at least 22 kHz
- Verify bit depth is at least 16-bit
- Consider re-encoding with better quality settings

## Browser Compatibility

The audio playback functionality has been tested and works on:

- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Additional Notes

- The application uses robust audio loading with automatic fallback mechanisms
- Audio files are loaded on-demand (not preloaded) to optimize performance
- Play buttons are disabled during playback to prevent overlapping sounds
- The same audio loading logic is used across all three books for consistency
