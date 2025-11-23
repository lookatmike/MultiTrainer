<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { game } from '$lib/stores/gameStore';
	import NumPad from './NumPad.svelte';
	import ProgressBar from './ProgressBar.svelte';

	const session = game.session;
	const currentQuestion = game.currentQuestion;
	const currentAnswer = game.currentAnswer;
	const timeRemaining = game.timeRemaining;

	let timerInterval: number | undefined;
	let showFeedback = $state(false);
	let isCorrect = $state(false);
	let earnedBonus = $state(false);
	let animationKey = $state(0);

	function startTimer() {
		if (!$session) return;

		timeRemaining.set($session.config.timePerQuestion);

		timerInterval = window.setInterval(() => {
			timeRemaining.update(t => {
				const newTime = t - 0.1;
				if (newTime <= 0) {
					handleTimeout();
					return 0;
				}
				return newTime;
			});
		}, 100);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}
	}

	function handleTimeout() {
		stopTimer();
		if (!$session || !$currentQuestion) return;

		// Submit with current answer (or 0 if empty)
		const answer = parseInt($currentAnswer || '0');
		game.submitAnswer(answer, 0);

		showFeedback = true;
		isCorrect = false;
		earnedBonus = false;

		setTimeout(() => {
			showFeedback = false;
			game.nextQuestion();

			// Check if there are more questions
			const updatedSession = game.session;
			if (updatedSession.subscribe(s => {
				if (s && s.currentQuestionIndex < s.questions.length) {
					animationKey++;
					startTimer();
				}
			})(), false) {};
		}, 1500);
	}

	function handleSubmit() {
		stopTimer();
		if (!$session || !$currentQuestion || !$timeRemaining) return;

		const answer = parseInt($currentAnswer);
		if (isNaN(answer)) return;

		game.submitAnswer(answer, $timeRemaining);

		// Get the updated question to check results
		const updatedQuestion = $session.questions[$session.currentQuestionIndex];
		isCorrect = updatedQuestion.playerAnswer === updatedQuestion.correctAnswer;
		earnedBonus = updatedQuestion.bonus > 0;

		showFeedback = true;

		setTimeout(() => {
			showFeedback = false;
			game.nextQuestion();

			// Check if there are more questions
			const updatedSession = game.session;
			if (updatedSession.subscribe(s => {
				if (s && s.currentQuestionIndex < s.questions.length) {
					animationKey++;
					startTimer();
				}
			})(), false) {};
		}, 1500);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (showFeedback) return;

		if (event.key >= '0' && event.key <= '9') {
			currentAnswer.update(v => v + event.key);
		} else if (event.key === 'Backspace') {
			currentAnswer.update(v => v.slice(0, -1));
		} else if (event.key === 'Enter' && $currentAnswer) {
			handleSubmit();
		}
	}

	onMount(() => {
		startTimer();
		window.addEventListener('keydown', handleKeyPress);
	});

	onDestroy(() => {
		stopTimer();
		window.removeEventListener('keydown', handleKeyPress);
	});
</script>

{#if $session && $currentQuestion}
	<div class="game-container">
		<div class="progress-section">
			<div class="question-counter">
				Question {$session.currentQuestionIndex + 1} of {$session.config.totalQuestions}
			</div>
			<ProgressBar timeRemaining={$timeRemaining} totalTime={$session.config.timePerQuestion} />
		</div>

		<div class="question-section" key={animationKey}>
			<div class="question">
				<span class="factor">{$currentQuestion.factor1}</span>
				<span class="operator">×</span>
				<span class="factor">{$currentQuestion.factor2}</span>
				<span class="equals">=</span>
				<span class="answer-display">{$currentAnswer || '?'}</span>
			</div>
		</div>

		<div class="input-section">
			<NumPad value={$currentAnswer} onInput={(v) => currentAnswer.set(v)} />

			<button
				class="btn-submit"
				onclick={handleSubmit}
				disabled={!$currentAnswer || showFeedback}
			>
				Answer
			</button>
		</div>

		{#if showFeedback}
			<div class="feedback-overlay" class:correct={isCorrect} class:incorrect={!isCorrect}>
				<div class="feedback-content">
					{#if isCorrect}
						<div class="feedback-icon">✓</div>
						<div class="feedback-text">Correct!</div>
						{#if earnedBonus}
							<div class="bonus-text">
								+5 Bonus!
								<span class="sparkles">✨</span>
							</div>
						{/if}
					{:else}
						<div class="feedback-icon">✗</div>
						<div class="feedback-text">
							{$currentQuestion.factor1} × {$currentQuestion.factor2} = {$currentQuestion.correctAnswer}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
		position: relative;
	}

	.progress-section {
		width: 100%;
		max-width: 600px;
		margin-bottom: 2rem;
	}

	.question-counter {
		text-align: center;
		font-size: 1rem;
		font-weight: 600;
		color: #ffffff;
		margin-bottom: 1rem;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.question-section {
		margin-bottom: 2rem;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.question {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		font-size: 3rem;
		font-weight: bold;
		color: #ffffff;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.factor {
		color: #fde047;
	}

	.operator {
		color: #ffffff;
	}

	.equals {
		color: #ffffff;
	}

	.answer-display {
		min-width: 120px;
		text-align: center;
		color: #4ade80;
		border-bottom: 4px solid #4ade80;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.btn-submit {
		width: 100%;
		max-width: 300px;
		padding: 1rem 2rem;
		font-size: 1.25rem;
		font-weight: bold;
		color: white;
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		border: none;
		border-radius: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
	}

	.btn-submit:active:not(:disabled) {
		transform: translateY(0);
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feedback-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	.feedback-overlay.correct {
		background: rgba(16, 185, 129, 0.95);
	}

	.feedback-overlay.incorrect {
		background: rgba(239, 68, 68, 0.95);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.feedback-content {
		text-align: center;
		color: white;
		animation: bounceIn 0.4s ease-out;
	}

	@keyframes bounceIn {
		0% {
			transform: scale(0.3);
			opacity: 0;
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.feedback-icon {
		font-size: 5rem;
		margin-bottom: 1rem;
	}

	.feedback-text {
		font-size: 2rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.bonus-text {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 1rem;
		animation: sparkle 0.6s ease-in-out infinite;
	}

	@keyframes sparkle {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.sparkles {
		display: inline-block;
		animation: rotate 2s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.question {
			font-size: 2rem;
			gap: 0.5rem;
		}

		.answer-display {
			min-width: 80px;
		}

		.feedback-icon {
			font-size: 4rem;
		}

		.feedback-text {
			font-size: 1.5rem;
		}

		.bonus-text {
			font-size: 1.25rem;
		}
	}
</style>
