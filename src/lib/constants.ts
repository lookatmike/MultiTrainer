import type { GameConfig } from '$lib/stores/gameStore';

export const DEFAULT_GAME_CONFIG: GameConfig = {
	playerName: '',
	firstFactors: [],
	secondFactorRange: [1, 12],
	timePerQuestion: 5,
	totalQuestions: 10
};

export const SCORING = {
	BASE_POINTS: 10,
	BONUS_POINTS: 5,
	BONUS_THRESHOLD_PERCENT: 0.6
} as const;

export const STORAGE = {
	KEY: 'multitrainer-history',
	MAX_SCORES: 50
} as const;

export const FEEDBACK_THRESHOLDS = [
	{ percent: 100, message: "Perfect! You're a multiplication master!" },
	{ percent: 90, message: "Amazing work! You're really good at this!" },
	{ percent: 80, message: "Great job! Keep up the good work!" },
	{ percent: 70, message: "Well done! You're getting better!" },
	{ percent: 60, message: "Good effort! Practice makes perfect!" },
	{ percent: 50, message: "Nice try! Keep practicing!" },
	{ percent: 0, message: "Keep going! Every practice helps you improve!" }
] as const;
