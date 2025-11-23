<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/stores/gameStore';
	import { saveScore } from '$lib/utils/storage';
	import { getCorrectCount, getBonusCount, getEncouragingMessage } from '$lib/utils/scoring';

	const session = game.session;
	let showDetails = $state(false);

	const correctCount = $derived($session ? getCorrectCount($session.questions) : 0);
	const bonusCount = $derived($session ? getBonusCount($session.questions) : 0);
	const encouragingMessage = $derived(
		$session ? getEncouragingMessage($session.totalScore, $session.config.totalQuestions) : ''
	);

	onMount(() => {
		// Save score to localStorage when results are shown
		if ($session) {
			saveScore(
				$session.config.playerName,
				$session.totalScore,
				$session.questions,
				$session.config
			);
		}
	});

	function handlePlayAgain() {
		game.reset(true); // Keep config
	}
</script>

{#if $session}
	<div class="results-container">
		<h1 class="title">Results</h1>

		<div class="score-card">
			<div class="score-display">
				<div class="score-label">Your Score</div>
				<div class="score-value">{$session.totalScore}</div>
				<div class="score-max">out of {$session.config.totalQuestions * 15}</div>
			</div>

			<div class="message">{encouragingMessage}</div>

			<div class="stats-row">
				<div class="stat">
					<div class="stat-value">{correctCount}</div>
					<div class="stat-label">Correct</div>
				</div>
				<div class="stat">
					<div class="stat-value">{bonusCount}</div>
					<div class="stat-label">Bonuses</div>
				</div>
				<div class="stat">
					<div class="stat-value">{$session.config.totalQuestions}</div>
					<div class="stat-label">Total</div>
				</div>
			</div>
		</div>

		<button class="details-toggle" onclick={() => (showDetails = !showDetails)}>
			{showDetails ? '▼' : '▶'} Question Details
		</button>

		{#if showDetails}
			<div class="details-card">
				{#each $session.questions as question, index}
					{@const isCorrect = question.playerAnswer === question.correctAnswer}
					<div class="question-detail" class:correct={isCorrect} class:incorrect={!isCorrect}>
						<div class="question-number">{index + 1}</div>
						<div class="question-info">
							<div class="question-text">
								{question.factor1} × {question.factor2} = {question.correctAnswer}
							</div>
							<div class="answer-info">
								Your answer: {question.playerAnswer ?? 'No answer'}
								{#if isCorrect}
									<span class="check">✓</span>
								{:else}
									<span class="cross">✗</span>
								{/if}
							</div>
							<div class="time-info">
								Time: {question.timeUsed.toFixed(1)}s
								{#if question.bonus > 0}
									<span class="bonus-badge">+{question.bonus} Bonus!</span>
								{/if}
							</div>
						</div>
						<div class="points">
							{isCorrect ? 10 : 0}{question.bonus > 0 ? ` + ${question.bonus}` : ''} pts
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<button class="btn-play-again" onclick={handlePlayAgain}>Play Again</button>
	</div>
{/if}

<style>
	.results-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.title {
		font-size: 2.5rem;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 2rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.score-card {
		background: white;
		border-radius: 1.5rem;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 500px;
		margin-bottom: 1.5rem;
		animation: slideUp 0.5s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.score-display {
		text-align: center;
		margin-bottom: 2rem;
	}

	.score-label {
		font-size: 1.25rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.score-value {
		font-size: 4rem;
		font-weight: bold;
		color: #4f46e5;
		line-height: 1;
	}

	.score-max {
		font-size: 1rem;
		color: #9ca3af;
		margin-top: 0.5rem;
	}

	.message {
		font-size: 1.5rem;
		font-weight: 600;
		color: #059669;
		text-align: center;
		margin-bottom: 2rem;
	}

	.stats-row {
		display: flex;
		justify-content: space-around;
		gap: 1rem;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		color: #1f2937;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.details-toggle {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 1rem;
	}

	.details-toggle:hover {
		border-color: #4f46e5;
		color: #4f46e5;
	}

	.details-card {
		background: white;
		border-radius: 1.5rem;
		padding: 1.5rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 600px;
		margin-bottom: 2rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.question-detail {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-radius: 0.75rem;
		margin-bottom: 0.75rem;
		transition: transform 0.2s;
	}

	.question-detail.correct {
		background: #d1fae5;
		border-left: 4px solid #059669;
	}

	.question-detail.incorrect {
		background: #fee2e2;
		border-left: 4px solid #dc2626;
	}

	.question-number {
		font-size: 1.25rem;
		font-weight: bold;
		color: #6b7280;
		min-width: 30px;
	}

	.question-info {
		flex: 1;
	}

	.question-text {
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}

	.answer-info {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.check {
		color: #059669;
		font-weight: bold;
	}

	.cross {
		color: #dc2626;
		font-weight: bold;
	}

	.time-info {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.bonus-badge {
		background: #fbbf24;
		color: white;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-weight: 600;
		margin-left: 0.5rem;
	}

	.points {
		font-weight: bold;
		color: #4f46e5;
		white-space: nowrap;
	}

	.btn-play-again {
		width: 100%;
		max-width: 500px;
		padding: 1rem;
		font-size: 1.125rem;
		font-weight: bold;
		color: white;
		background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
		border: none;
		border-radius: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
	}

	.btn-play-again:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
	}

	.btn-play-again:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.title {
			font-size: 2rem;
		}

		.score-value {
			font-size: 3rem;
		}

		.message {
			font-size: 1.25rem;
		}
	}
</style>
