import { writable, derived } from 'svelte/store';
import { DEFAULT_GAME_CONFIG, SCORING } from '$lib/constants';
import { generateQuestions } from '$lib/utils/gameLogic';

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

function createGameStore() {
	const gameState = writable<GameState>('SETUP');
	const config = writable<GameConfig>(DEFAULT_GAME_CONFIG);
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

				// Calculate bonus
				const bonusThreshold = $session.config.timePerQuestion * SCORING.BONUS_THRESHOLD_PERCENT;
				const earnedBonus = isCorrect && timeUsed >= bonusThreshold ? SCORING.BONUS_POINTS : 0;

				// Update question with player's answer
				currentQ.playerAnswer = answer;
				currentQ.timeUsed = $session.config.timePerQuestion - timeUsed;
				currentQ.bonus = earnedBonus;

				// Update score
				const points = (isCorrect ? SCORING.BASE_POINTS : 0) + earnedBonus;
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

				// Check if game is over
				if ($session.currentQuestionIndex >= $session.questions.length) {
					gameState.set('RESULTS');
				}

				return $session;
			});
		},

		// Reset to setup screen
		reset: (keepConfig: boolean = false) => {
			if (!keepConfig) {
				config.set(DEFAULT_GAME_CONFIG);
			}
			session.set(null);
			currentAnswer.set('');
			timeRemaining.set(0);
			gameState.set('SETUP');
		}
	};
}

export const game = createGameStore();
