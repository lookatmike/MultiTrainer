import type { GameConfig, Question } from '$lib/stores/gameStore';
import { STORAGE } from '$lib/constants';

export interface ScoreHistoryEntry {
	date: number;
	totalScore: number;
	questions: Question[];
	config: GameConfig;
}

export interface PlayerHistory {
	playerName: string;
	scores: ScoreHistoryEntry[];
}

// Get all player histories
export function getAllHistory(): PlayerHistory[] {
	if (typeof window === 'undefined') return [];

	try {
		const data = localStorage.getItem(STORAGE.KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Error loading history:', error);
		return [];
	}
}

// Get history for a specific player
export function getPlayerHistory(playerName: string): ScoreHistoryEntry[] {
	const allHistory = getAllHistory();
	const playerHistory = allHistory.find(p => p.playerName === playerName);
	return playerHistory?.scores || [];
}

// Save a new score entry
export function saveScore(
	playerName: string,
	totalScore: number,
	questions: Question[],
	config: GameConfig
): void {
	if (typeof window === 'undefined') return;

	try {
		const allHistory = getAllHistory();
		let playerHistory = allHistory.find(p => p.playerName === playerName);

		const newEntry: ScoreHistoryEntry = {
			date: Date.now(),
			totalScore,
			questions,
			config
		};

		if (playerHistory) {
			// Add new score and keep only the most recent entries
			playerHistory.scores.unshift(newEntry);
			playerHistory.scores = playerHistory.scores.slice(0, STORAGE.MAX_SCORES);
		} else {
			// Create new player history
			playerHistory = {
				playerName,
				scores: [newEntry]
			};
			allHistory.push(playerHistory);
		}

		localStorage.setItem(STORAGE.KEY, JSON.stringify(allHistory));
	} catch (error) {
		console.error('Error saving score:', error);
	}
}

// Get player's best score
export function getBestScore(playerName: string): number {
	const history = getPlayerHistory(playerName);
	if (history.length === 0) return 0;
	return Math.max(...history.map(entry => entry.totalScore));
}

// Get player's average score
export function getAverageScore(playerName: string): number {
	const history = getPlayerHistory(playerName);
	if (history.length === 0) return 0;
	const sum = history.reduce((acc, entry) => acc + entry.totalScore, 0);
	return Math.round(sum / history.length);
}
