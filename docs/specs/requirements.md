---
abstract: Stable product requirements for a local Satisfactory save map watcher.
out_of_scope: Implementation details, dependency choices, exact command syntax, and third-party page selectors.
---

# Requirements Document: Satisfactory Save Map Watcher

The project provides a local developer-operated tool that watches Satisfactory save files and presents the latest saved game in an interactive map workflow. Detailed runtime, tooling, and verification choices are defined in the related module design documents.

## Authoring Constraints
- This document SHALL contain only stable, project-level constraints and expected outcomes.
- Statements tied to technologies, APIs, data models, file paths, or UI component behavior SHALL be moved to design documents.
- When implementation details change but governing constraints remain valid, requirement text SHALL remain stable and related design documents SHALL be updated.
- If execution context is needed, this document SHALL state governing constraints and reference related design modules for details.

## Requirements

### R-001: Save discovery

As a Satisfactory player, I want the tool to locate my local game saves so that I do not have to manually provide a save file every time I run the tool.

The system SHALL discover Satisfactory save files from the default local save location for the supported operating environment.

### R-002: Startup map loading

As a Satisfactory player, I want the tool to load my latest save when it starts so that the map reflects my current game without requiring a new in-game save event.

When at least one save file exists, the system SHALL select the most recently modified save file during startup and submit it to the map workflow.

### R-003: Continuous save monitoring

As a Satisfactory player, I want the map to update after the game saves so that the map follows my current factory state.

The system SHALL detect newly created or modified save files while running.

The system SHALL wait briefly after a save change before selecting the latest save file for processing.

### R-004: Interactive map presentation

As a Satisfactory player, I want save changes to appear in an interactive map so that I can inspect the game state visually.

The system SHALL submit the selected save file to an interactive Satisfactory map page without requiring repeated manual file selection.

### R-005: Single active map session

As a Satisfactory player, I want repeated save updates to use the same map session so that the tool does not create uncontrolled browser tabs or windows.

The system SHALL reuse a single active map session for repeated save submissions during one tool run.

### R-006: Local command surface

As the project maintainer, I want a single local command surface so that running, checking, testing, and building the tool are predictable.

The project SHALL provide documented commands for development startup, compiled startup, build, lint, typecheck, test, and aggregate checks.

### R-007: Quality gates

As the project maintainer, I want local checks and commit-time guardrails so that simple regressions are caught before changes are committed.

The project SHALL include automated tests for stable local behavior.

The project SHALL include formatting, linting, typechecking, and commit-message validation guardrails.
