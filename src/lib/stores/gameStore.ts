import { writable, derived } from 'svelte/store';

export type GameState = 'SETUP' | 'PLAYING' | 'RESULTS';

export interface GameConfig {
	playerName: string;
	firstFactors: number[];
	secondFactorRange: [number, number];
	timePerQuestion: number;
	totalQuestions: number;
}

export interface Question {
	factor1: number;
	factor2: number;
	correctAnswer: number;
	playerAnswer: number | null;
	timeUsed: number;
	bonus: number;
}

export interface GameSession {
	config: GameConfig;
	questions: Question[];
	currentQuestionIndex: number;
	totalScore: number;
}

const defaultConfig: GameConfig = {
	playerName: '',
	firstFactors: [],
	secondFactorRange: [1, 12],
	timePerQuestion: 5,
	totalQuestions: 10
};

function createGameStore() {
	const gameState = writable<GameState>('SETUP');
	const config = writable<GameConfig>(defaultConfig);
	const session = writable<GameSession | null>(null);
	const currentAnswer = writable<string>('');
	const timeRemaining = writable<number>(0);

	return {
		gameState,
		config,
		session,
		currentAnswer,
		timeRemaining,

		// Derived store for current question
		currentQuestion: derived(session, ($session) => {
			if (!$session) return null;
			return $session.questions[$session.currentQuestionIndex] || null;
		}),

		// Start a new game with the current config
		startGame: (gameConfig: GameConfig) => {
			config.set(gameConfig);
			const questions = generateQuestions(gameConfig);

			session.set({
				config: gameConfig,
				questions,
				currentQuestionIndex: 0,
				totalScore: 0
			});

			gameState.set('PLAYING');
			timeRemaining.set(gameConfig.timePerQuestion);
		},

		// Submit answer for current question
		submitAnswer: (answer: number, timeUsed: number) => {
			session.update($session => {
				if (!$session) return $session;

				const currentQ = $session.questions[$session.currentQuestionIndex];
				const isCorrect = answer === currentQ.correctAnswer;

				// Calculate bonus (5 points if answered within first 40% of time)
				const bonusThreshold = $session.config.timePerQuestion * 0.6;
				const earnedBonus = isCorrect && timeUsed >= bonusThreshold ? 5 : 0;

				// Update question with player's answer
				currentQ.playerAnswer = answer;
				currentQ.timeUsed = $session.config.timePerQuestion - timeUsed;
				currentQ.bonus = earnedBonus;

				// Update score
				const points = (isCorrect ? 10 : 0) + earnedBonus;
				$session.totalScore += points;

				return $session;
			});

			currentAnswer.set('');
		},

		// Move to next question
		nextQuestion: () => {
			session.update($session => {
				if (!$session) return $session;
				$session.currentQuestionIndex++;
				return $session;
			});

			// Check if game is over
			session.subscribe($session => {
				if ($session && $session.currentQuestionIndex >= $session.questions.length) {
					gameState.set('RESULTS');
				}
			})();
		},

		// Reset to setup screen
		reset: (keepConfig: boolean = false) => {
			if (!keepConfig) {
				config.set(defaultConfig);
			}
			session.set(null);
			currentAnswer.set('');
			timeRemaining.set(0);
			gameState.set('SETUP');
		}
	};
}

// Generate random questions based on config
function generateQuestions(config: GameConfig): Question[] {
	const questions: Question[] = [];

	for (let i = 0; i < config.totalQuestions; i++) {
		// Random first factor from the list
		const factor1 = config.firstFactors[
			Math.floor(Math.random() * config.firstFactors.length)
		];

		// Random second factor from the range
		const [min, max] = config.secondFactorRange;
		const factor2 = Math.floor(Math.random() * (max - min + 1)) + min;

		questions.push({
			factor1,
			factor2,
			correctAnswer: factor1 * factor2,
			playerAnswer: null,
			timeUsed: 0,
			bonus: 0
		});
	}

	return questions;
}

export const game = createGameStore();
