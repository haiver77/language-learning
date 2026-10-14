# Speaking Practice Rules

## Starting and stopping

- Speaking Practice uses the browser Speech Recognition API (`SpeechRecognition` or `webkitSpeechRecognition`). If neither API is available, the practice stops and reports that speech recognition is unsupported.
- Starting practice speaks the current phrase, then listens for the selected practice language.
- Stopping practice cancels speech synthesis, aborts recognition, clears practice timers, and marks the practice as stopped.
- A recognition result is ignored if practice is no longer active or if it belongs to an older phrase session.
- Recognition uses continuous listening, interim results, and one recognition alternative.
- The selected practice language is taken from the available language selectors and mapped to the first configured locale for that language.

## Phrase selection

- After a successful phrase, the next phrase is selected randomly when Random is enabled.
- Otherwise, the next phrase is the following row in CSV order, wrapping to the first row after the last row.
- Each phrase transition cancels the current recognition session and starts recognition for the new phrase.
- A phrase transition is guarded by the active recognition object and phrase-session token so an old recognition event cannot advance the wrong phrase.

## Speech comparison and scoring

- Speech is normalized before comparison: it is lowercased, accents are removed, punctuation is ignored, whitespace is collapsed, and the result is trimmed.
- Each spoken token is matched against target tokens in forward order using character similarity based on Levenshtein distance.
- A token is considered correct when its similarity is at least 70% for word highlighting and scoring.
- Matching prefers the best eligible target token ahead of the current cursor and advances the cursor after a match.
- A repeated spoken word may be marked correct by a fallback search without moving the cursor.
- The score is the percentage of target phrase words matched, rounded to a whole number.
- Correct target words are highlighted green; unmatched target words are highlighted red.
- The live transcript also highlights spoken words that were matched as correct or incorrect.
- Repeated or overlapping recognition chunks are merged and de-duplicated before comparison where possible.

## Phrase completion and advance rules

The configured `Min. Similarity (%)` value is clamped to the range 50 through 100. A completion decision requires a final speech result, not only interim speech.

The next phrase is taken when any of these rules is met:

1. The phrase score reaches 100%.
2. The phrase score reaches `Min. Similarity (%)`, and the app waits `Wait After Reach Min. Similarity (sec)` before advancing.
3. The phrase score reaches `Min. Similarity (%)` and the final target word is already highlighted green. In this case, the app advances immediately without waiting for `Wait After Reach Min. Similarity (sec)`.

When rule 3 applies, any pending similarity countdown is cancelled before the immediate transition. The same guarded transition path is used for all advance rules.

## Timing and reset behavior

- `Wait After Reach Min. Similarity (sec)` controls the delayed advance for threshold matches that do not satisfy the immediate final-word rule.
- `Silence Wait (sec)` controls how long speech can be silent before the current live speech validation is reset.
- A silence reset clears live transcript validation, resets the score and progress display, restores the phrase display, and clears accumulated recognition text for the next attempt.
- Recognition is restarted when the browser ends a recognition session unexpectedly, provided practice is still active and the phrase session is still current.

## Settings

- `Min. Similarity (%)` accepts integer values from 50 to 100.
- `Silence Wait (sec)` is at least 1 second.
- `Wait After Reach Min. Similarity (sec)` is at least 0 seconds; zero means no delayed wait for rule 2.
- Speaking-practice settings are shared between the Settings panel and the Speaking Practice controls and are persisted in browser local storage.
