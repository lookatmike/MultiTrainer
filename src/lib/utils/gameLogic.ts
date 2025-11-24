import type { GameConfig, Question } from '$lib/stores/gameStore';

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

// Generate questions like a deck of cards - no repeats unless necessary
export function generateQuestions(config: GameConfig): Question[] {
	// Generate all possible questions
	const allPossibleQuestions: Question[] = [];

	const [min, max] = config.secondFactorRange;

	for (const factor1 of config.firstFactors) {
		for (let factor2 = min; factor2 <= max; factor2++) {
			allPossibleQuestions.push({
				factor1,
				factor2,
				correctAnswer: factor1 * factor2,
				playerAnswer: null,
				timeUsed: 0,
				bonus: 0
			});
		}
	}

	// If no possible questions, return empty array
	if (allPossibleQuestions.length === 0) {
		return [];
	}

	// Draw from the "deck" - shuffle and deal, reshuffle when needed
	const questions: Question[] = [];
	let remaining = config.totalQuestions;

	while (remaining > 0) {
		// Shuffle the deck
		const shuffled = shuffleArray(allPossibleQuestions);

		// Take as many as we need (or all available if we need more)
		const toTake = Math.min(remaining, shuffled.length);

		for (let i = 0; i < toTake; i++) {
			// Create a copy so each question is independent
			questions.push({ ...shuffled[i] });
		}

		remaining -= toTake;
	}

	return questions;
}
