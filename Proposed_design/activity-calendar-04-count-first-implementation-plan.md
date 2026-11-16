# Implementation plan: Activity calendar — 04 Count First

## Goal

Apply the selected mobile design in [04-count-first.svg](../Proposed_prototypes/activity-calendar-phrases/04-count-first.svg) to the monthly Activity calendar in [index.html](../index.html). Keep the existing month navigation, daily-goal stars, current-day indicator, data source, and monthly summary. Do not redesign the Year Effort or Words tabs.

## Current implementation

- The Activity panel contains the month heading and previous/next buttons above `#activityCalendar`; `#activitySummary` shows the monthly totals.
- `.activity-calendar` uses seven equal-width columns. `renderActivityCalendar()` renders six rows (42 cells), Monday-first weekday headings, adjacent-month dates, daily counts, goal status, and the monthly summary.
- `getDailyPracticeCount(dateKey)` reads the sanitized count from `courseState.practiceActivity`. The daily goal is read from `courseState.dailyPracticeGoal` and defaults to 10.
- Current-month cells show a star when the count meets the goal, but zero counts are hidden and no per-day progress bar is rendered.
- The selected design uses a two-thirds upper area for the day number and a shaded one-third lower band for the count and progress bar. Its day number is 16px and the count is 9px.

## Design specification

### Cell geometry and responsive layout

1. Retain the seven-column, six-row calendar and its existing weekday order.
2. Keep the calendar fluid: each column remains `minmax(0, 1fr)` with no horizontal scrolling. At a 390px screen width, target the prototype's approximately 44px-wide by 49px-high in-month cells, adjusted to the available content width.
3. Give each in-month day cell two stacked regions with a 2:1 height ratio:
   - Upper region: two-thirds of the cell, containing the day number.
   - Lower region: one-third of the cell, with a subdued filled background, phrase count, and progress bar.
4. Clip the lower fill to the cell's bottom corner radii. Do not allow the band or progress track to change the overall cell height or overflow its column on narrow screens.
5. Preserve subdued adjacent-month dates. They remain outside-month placeholders and do not receive a phrase count, goal star, or progress bar.

### Visual states

- Day number: 16px, centered in the upper region. Keep it visually larger than the phrase count.
- Count: 9px, centered in the lower band; display `0` for an in-month day with no practice as well as positive counts.
- Progress: show a thin track and fill inside the lower band for every in-month day. An empty day retains the track with a zero-length fill.
- Progress ratio: `min(count / goal, 1)`, where `goal` is the current sanitized daily goal already used for the star. This makes the bar reflect the user's configured goal rather than hard-coding the sample illustration's scale. Zero counts produce an empty fill; counts at or above the goal fill the track.
- Color: use the existing application theme variables for text, surfaces, borders, and primary progress. Use the existing green goal treatment for a met-goal day and the existing gold star. The progress fill may use the goal green when the goal is met; keep the track distinguishable from the lower-band surface.
- Goal met: retain the star at the upper-right of the cell, away from the centered day number, and retain the green cell border/treatment. The star must not cover the count or progress bar.
- Today: retain the existing primary-color outline. If today also met the goal, both indicators remain visible.
- Monthly heading, month navigation, summary text, and their existing behavior remain unchanged.

## Implementation steps

1. **Update the Activity cell styles** in [index.html](../index.html).
   - Replace the current centered vertical layout with a two-row layout whose row sizing is 2fr/1fr.
   - Keep the existing seven-column grid and tune cell height responsively for the mobile mockup without hard-coding the whole calendar to a 390px width.
   - Add narrowly scoped styles for the day-number region, count band, count text, progress track/fill, and star positioning. Avoid changing shared styles used by the Year Effort calendar.
   - Preserve the existing today, goal-met, and outside-month selectors or update their selectors consistently with the new markup.

2. **Update `renderActivityCalendar()`** in [index.html](../index.html).
   - Continue using `getPracticeDateKey()`, `getDailyPracticeCount()`, the configured goal, the existing date calculations, and the existing 42-cell grid.
   - For each in-month date, render separate day-number and lower-band elements. Always include the numeric count, including zero.
   - Compute the progress fill from the sanitized count and active goal, clamped to 0–100%. Render a non-zero-width track even when the fill is zero.
   - Preserve the star condition (`count >= goal`), day classes for today/completion, accessible date/count/goal information, and existing monthly total calculations.
   - Keep adjacent-month cells muted and visually separate from current-month activity.
   - Continue constructing markup only from the numeric day/count values and dates produced by the existing helpers; do not insert user-provided HTML.

3. **Preserve accessibility.**
   - Keep the calendar's `role="grid"`, weekday `role="columnheader"`, and date `role="gridcell"` semantics.
   - Ensure each in-month grid cell's accessible name includes the localized date, phrase count (including zero), and whether the daily goal was met. Include today status if it can be identified without duplicating the visible date.
   - Mark the decorative bar track/fill and star as hidden from assistive technology when the complete information is already in the cell's accessible name.
   - Do not make date cells appear interactive or add keyboard behavior that the existing calendar does not support.
   - Check that the smaller 9px visual count remains readable at mobile scale; its full numeric value must also remain available in the accessible name.

4. **Update directly related UI documentation** in [elementos-visuales.md](../docs/elementos-visuales.md) to describe the Activity calendar's visible daily count, goal star, and per-day progress bar. Do not change [local_storage.md](../docs/local_storage.md): this design reads the existing `practiceActivity` and `dailyPracticeGoal` fields and requires no storage or migration change.

## Verification plan

### Functional cases

- Verify a current-month day with 0 phrases shows `0` and an empty progress bar.
- Verify counts below the goal show the correct count and proportional fill.
- Verify a count equal to the goal fills the bar and shows the goal star.
- Verify a count above the goal remains capped at a full bar while showing the actual count and star.
- Repeat with a changed daily goal to ensure both progress and star use the active configured goal.
- Verify today outline and goal star can appear together.
- Verify the monthly phrase/day totals are unchanged by the visual changes.
- Navigate to previous months and return to the current month; confirm cells, counts, and disabled next-month behavior remain correct.
- Check months that begin on each weekday and months with 28, 29, 30, and 31 days; confirm the 42-cell layout and adjacent-month placeholders remain correct.

### Visual and accessibility cases

- Compare the rendered mobile calendar with the selected SVG at approximately 390px wide; confirm the lower band occupies one-third of each in-month cell and the day number remains larger than the count.
- Check narrow screens (320–360px), a typical phone width (390px), and a wider viewport. Confirm seven columns fit without horizontal overflow, text does not collide with the star, and the count and bar remain inside the lower band.
- Check both a zero count and a two-digit count (for example 10 or more) in the narrowest cell.
- Inspect the accessibility tree or screen-reader output for weekday headers and date/count/goal announcements. Confirm the progress bar and star are not announced redundantly.
- Run the repository's existing relevant validation after implementation. If no automated visual test covers this calendar, perform the responsive and navigation checks manually in the browser.

## Acceptance criteria

- Every current-month date displays its phrase count and a progress bar; zero-activity dates display `0` with an empty bar.
- The shaded lower band occupies one-third of the day cell; the day-number region occupies the upper two-thirds.
- Day and count typography match the selected prototype's 16px and 9px sizes, with the day number larger.
- Progress is based on the configured daily goal, is capped visually at 100%, and does not replace the actual count.
- Existing goal stars, today indication, month navigation, 42-cell layout, outside-month styling, and monthly totals continue to work.
- The update is limited to the Activity calendar and its directly related visual documentation; no stored data format changes.
