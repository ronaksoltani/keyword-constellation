# Project plan: Keyword Constellation

## Brief

**Type:** Marketing and SEO tool

**Problem:** A raw list of topic ideas is hard to turn into a first content map.

**Audience:** A marketer cleaning a brainstorm or exported keyword list.

## Experience flow

1. Arrive at a direct, descriptive introduction.
2. Review the sample interface and its scope before interacting.
3. Try the core control: Group phrase ideas with a transparent word-overlap rule.
4. See a local result or demonstration state without sending a request to a service.

## Interaction

A deterministic word-overlap graph groups phrases at a chosen threshold, suggests broad intent cues and exports CSV.

## Key design decision

Expose the clustering rule instead of hiding it behind a black-box score.

## Boundaries

No search-volume, SERP, difficulty or user-intent data is queried; word overlap is not semantic relevance.

The tool is intentionally transparent about its input, assumptions and limits. It is a front-end educational prototype, not a substitute for platform data, professional review or controlled measurement.

## Next iteration

Allow manual merges/splits and attach verified external metrics as separate, sourced columns.

## Learning goals

- Structure a complete page with meaningful headings, landmarks and labelled controls.
- Separate visual rules in CSS from interaction logic in JavaScript.
- Make states understandable with keyboard controls and live status text.
- Document assumptions and the boundary between a helpful prototype and a production service.
