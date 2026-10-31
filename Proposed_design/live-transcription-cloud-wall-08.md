# Implementation spec: cloud wall 08

## Selected concept

Implement [prototype 48](../Proposed_prototypes/live-transcription-scoring/48-cloud-wall-08.svg) in both **Speaking Practice** and **Intensive Challenge**. Replace the diagonal cone sweep with one broad, soft-edged cloud mass that travels from right to left, covers the complete card, pauses briefly, then travels back. Keep the existing recognition, scoring, transcript, streak, and success behavior unchanged.

## Layout and existing application mapping

Keep the current compact card structure and reuse it in both modes:

1. Existing mode-specific heading.
2. One horizontal reward row: **Streak** tile at the left; **Phrase progress** label, percentage, progress bar, and waveform to its right.
3. Live transcript beneath the reward row.
4. Existing polite success announcement beneath the transcript.
5. Status and silence timer on the bottom row.

Keep the existing Streak plant icon, labels, score values, controls, and mode-specific behavior. Speaking Practice retains its “Live transcription and scoring” heading and settings/start/stop controls. Intensive Challenge retains its own heading, status, and attempt flow. The decorative cloud is a background layer only; it must not change card dimensions, create a new control, or intercept pointer input.

Apply the shared appearance through the existing speaking-practice card and backdrop helper. Use mode-prefixed SVG gradient and clip-path IDs so the two rendered cards cannot collide. Preserve the existing `sp-*` and `ic-*` element IDs and state bindings.

## Visual treatment

- Keep the card’s existing surface, green border, rounded corners, and compact spacing.
- Place the cloud behind all card content and clip it to the rounded card interior.
- Render one continuous, oversized cloud silhouette, not multiple blobs, a narrow ribbon, or a diagonal beam.
- Use the prototype’s low-opacity horizontal gradient: mint at both edges, blending through soft green, warm yellow, and lavender. Keep text and controls legible throughout the full sweep.
- Retain the prototype’s three small, softly twinkling accents. Keep them decorative and subordinate to the transcript and progress.
- Do not animate card size, text position, progress value, or layout.

## Cloud motion

- Animate the single cloud from beyond the right edge to beyond the left edge, then reverse along the same path.
- Use an eased, alternating motion with a 19-second leg in each direction.
- Hold the cloud at the centered, full-card-coverage position for approximately 16% of each leg (the prototype’s 42%–58% keyframe interval). At this point the broad gradient should tint the whole panel rather than appear as a passing stripe.
- Keep the sweep continuous and subtle; the visual treatment must not imply recording state or alter listening status.
- Preserve the existing waveform behavior: static while not listening, gently pulsing while listening.
- For `prefers-reduced-motion: reduce`, stop the cloud, sparkle, and waveform animations at a safe static state. Do not rely on animation to communicate progress or state.

## Responsive behavior

- Preserve the current single-row Streak/progress/waveform arrangement on standard widths.
- At widths of 420px and below, retain the existing reduced card padding, narrower Streak tile, and narrower waveform allocation. Allow the progress track to shrink without pushing the card beyond the viewport.
- Keep the cloud SVG stretched to the card bounds and clipped within the rounded interior at every width; animation must not add scrollbars or cover content outside the card.
- Verify in both light and dark themes. Use the existing theme-aware card/text colors; the translucent cloud must remain sufficiently subtle in each.

## States and behavior to preserve

| State | Required presentation |
|---|---|
| Ready / idle | Existing mode-specific ready or idle status; cloud remains decorative. |
| Waiting for microphone | Existing waiting status; do not mark the card as listening prematurely. |
| Listening | Existing status and timer behavior; animate the waveform through the existing listening class. |
| Interim/final speech | Existing live transcript and score update in place; cloud must not obscure the text. |
| Successful phrase | Preserve current streak update, success message, and celebration feedback. |
| Stop, reset, or next attempt | Preserve current transcript, score, timer, and listening-state reset behavior. |
| Unsupported recognition or startup error | Preserve the existing explicit error status; animation must not suggest a successful start. |

## Accessibility

- Mark the SVG background and all sparkles as hidden from assistive technology; keep them unfocusable and non-interactive.
- Preserve the progress element’s accessible label and live success announcement.
- Keep status and transcript content in the accessibility tree and readable over every cloud position.
- Honor `prefers-reduced-motion` for every decorative animation. Keep all information available without motion.
- Maintain visible focus indicators and do not place a transparent decorative layer above buttons or controls.

## Acceptance criteria

1. Both modes show the same selected cloud treatment while retaining their existing headings, controls, IDs, and separate state.
2. A single broad cloud enters from the right, visibly covers the entire card, pauses briefly, exits left, and returns; it never reads as two separate globes or a diagonal band.
3. The card contents remain stationary and legible throughout the sweep, including transcript, score, status, streak, and success feedback.
4. Progress, transcript, streak, microphone errors, and start/stop behavior remain driven by the existing application logic.
5. The card has no horizontal overflow at 320px and 420px viewport widths, and remains clipped at its rounded corners.
6. With reduced motion enabled, all decorative motion stops while all content and functionality remain available.
7. Verify the listening waveform starts and stops with the existing listening state in both modes.
8. If the application shell cache includes the changed inline page, increment its cache version so clients receive the updated design.
