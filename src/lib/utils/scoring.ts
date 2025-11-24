import type { Question } from '$lib/stores/gameStore';
import { SCORING, FEEDBACK_THRESHOLDS } from '$lib/constants';

export function calculateQuestionScore(question: Question): number {
	if (question.playerAnswer === null) return 0;
	const baseScore = question.playerAnswer === question.correctAnswer ? SCORING.BASE_POINTS : 0;
	return baseScore + question.bonus;
}

export function calculateTotalScore(questions: Question[]): number {
	return questions.reduce((total, q) => total + calculateQuestionScore(q), 0);
}

export function getCorrectCount(questions: Question[]): number {
	return questions.filter(q => q.playerAnswer === q.correctAnswer).length;
}

export function getBonusCount(questions: Question[]): number {
	return questions.filter(q => q.bonus > 0).length;
}

export function getEncouragingMessage(score: number, totalQuestions: number): string {
	const maxScore = totalQuestions * (SCORING.BASE_POINTS + SCORING.BONUS_POINTS);
	const percentage = (score / maxScore) * 100;

	for (const threshold of FEEDBACK_THRESHOLDS) {
		if (percentage >= threshold.percent) {
			return threshold.message;
		}
	}
	return FEEDBACK_THRESHOLDS[FEEDBACK_THRESHOLDS.length - 1].message;
}
