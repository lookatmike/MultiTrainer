import type { Question } from '$lib/stores/gameStore';

export function calculateQuestionScore(question: Question): number {
	if (question.playerAnswer === null) return 0;
	const baseScore = question.playerAnswer === question.correctAnswer ? 10 : 0;
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
	const maxScore = totalQuestions * 15; // 10 + 5 bonus
	const percentage = (score / maxScore) * 100;

	if (percentage === 100) return "Perfect! You're a multiplication master!";
	if (percentage >= 90) return "Amazing work! You're really good at this!";
	if (percentage >= 80) return "Great job! Keep up the good work!";
	if (percentage >= 70) return "Well done! You're getting better!";
	if (percentage >= 60) return "Good effort! Practice makes perfect!";
	if (percentage >= 50) return "Nice try! Keep practicing!";
	return "Keep going! Every practice helps you improve!";
}
