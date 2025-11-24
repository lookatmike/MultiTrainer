<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/stores/gameStore';
	import type { GameConfig } from '$lib/stores/gameStore';
	import { getPlayerHistory, getBestScore } from '$lib/utils/storage';

	const config = game.config;

	let playerName = $state('');
	let firstFactorInput = $state('');
	let secondFactorMin = $state(1);
	let secondFactorMax = $state(12);
	let timePerQuestion = $state(5);
	let totalQuestions = $state(10);
	let error = $state('');

	// Load previous config when component mounts
	onMount(() => {
		const currentConfig = $config;
		if (currentConfig.playerName) {
			playerName = currentConfig.playerName;
			firstFactorInput = formatFirstFactors(currentConfig.firstFactors);
			secondFactorMin = currentConfig.secondFactorRange[0];
			secondFactorMax = currentConfig.secondFactorRange[1];
			timePerQuestion = currentConfig.timePerQuestion;
			totalQuestions = currentConfig.totalQuestions;
		}
	});

	// Format first factors array back to string
	function formatFirstFactors(factors: number[]): string {
		if (factors.length === 0) return '';
		if (factors.length === 1) return factors[0].toString();

		// Check if it's a continuous range
		const isRange = factors.every((num, i) => i === 0 || num === factors[i - 1] + 1);
		if (isRange && factors.length > 2) {
			return `${factors[0]}-${factors[factors.length - 1]}`;
		}

		// Otherwise, return as comma-separated list
		return factors.join(',');
	}

	// Load player stats if name is entered
	let playerBestScore = $derived(playerName ? getBestScore(playerName) : 0);
	let playerHistory = $derived(playerName ? getPlayerHistory(playerName) : []);

	function parseFirstFactors(input: string): number[] {
		const trimmed = input.trim();
		if (!trimmed) return [];

		let numbers: number[] = [];

		// Handle range like "3-7"
		const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
		if (rangeMatch) {
			const start = parseInt(rangeMatch[1]);
			const end = parseInt(rangeMatch[2]);
			if (start > end) return [];
			numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
		}
		// Handle comma-separated like "3,4,5" or "3, 4, 5"
		else if (trimmed.includes(',')) {
			numbers = trimmed
				.split(',')
				.map(s => parseInt(s.trim()))
				.filter(n => !isNaN(n) && n > 0);
		}
		// Handle single number
		else {
			const num = parseInt(trimmed);
			numbers = isNaN(num) || num <= 0 ? [] : [num];
		}

		// Remove duplicates while preserving order
		return [...new Set(numbers)];
	}

	function validateAndStart() {
		error = '';

		if (!playerName.trim()) {
			error = 'Please enter your name';
			return;
		}

		const firstFactors = parseFirstFactors(firstFactorInput);
		if (firstFactors.length === 0) {
			error = 'Please enter valid first factors (e.g., "3", "3-7", or "3,4,5")';
			return;
		}

		if (secondFactorMin > secondFactorMax) {
			error = 'Second factor range is invalid';
			return;
		}

		if (timePerQuestion < 1 || timePerQuestion > 60) {
			error = 'Time per question must be between 1 and 60 seconds';
			return;
		}

		if (totalQuestions < 1 || totalQuestions > 100) {
			error = 'Number of questions must be between 1 and 100';
			return;
		}

		const config: GameConfig = {
			playerName: playerName.trim(),
			firstFactors,
			secondFactorRange: [secondFactorMin, secondFactorMax],
			timePerQuestion,
			totalQuestions
		};

		game.startGame(config);
	}
</script>

<div class="setup-container">
	<h1 class="title">Multiplication Trainer</h1>

	<div class="form-card">
		<div class="form-group">
			<label for="playerName">Your Name</label>
			<input
				id="playerName"
				type="text"
				bind:value={playerName}
				placeholder="Enter your name"
				class="input"
			/>
			{#if playerBestScore > 0}
				<p class="stats">Best Score: {playerBestScore} | Games Played: {playerHistory.length}</p>
			{/if}
		</div>

		<div class="form-group">
			<label for="firstFactors">First Factor(s)</label>
			<input
				id="firstFactors"
				type="text"
				bind:value={firstFactorInput}
				placeholder="e.g., 7 or 3-7 or 3,4,5"
				class="input"
			/>
			<p class="hint">Enter a single number, range (3-7), or list (3,4,5)</p>
		</div>

		<div class="form-group">
			<label for="secondFactorMin">Second Factor Range</label>
			<div class="range-inputs">
				<input
					id="secondFactorMin"
					type="number"
					bind:value={secondFactorMin}
					min="1"
					max="20"
					class="input input-small"
				/>
				<span class="range-separator">to</span>
				<input
					type="number"
					bind:value={secondFactorMax}
					min="1"
					max="20"
					class="input input-small"
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="timePerQuestion">Time Per Question (seconds)</label>
			<input
				id="timePerQuestion"
				type="number"
				bind:value={timePerQuestion}
				min="1"
				max="60"
				class="input"
			/>
		</div>

		<div class="form-group">
			<label for="totalQuestions">Number of Questions</label>
			<input
				id="totalQuestions"
				type="number"
				bind:value={totalQuestions}
				min="1"
				max="100"
				class="input"
			/>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<button onclick={validateAndStart} class="btn-start">Start!</button>
	</div>
</div>

<style>
	.setup-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
	}

	.title {
		font-size: 2.5rem;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 2rem;
		text-align: center;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.form-card {
		background: white;
		border-radius: 1.5rem;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 500px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.input:focus {
		outline: none;
		border-color: #4f46e5;
	}

	.input-small {
		width: auto;
		min-width: 80px;
	}

	.range-inputs {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.range-separator {
		color: #6b7280;
		font-weight: 500;
	}

	.hint {
		margin-top: 0.25rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.stats {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #059669;
		font-weight: 500;
	}

	.error {
		color: #dc2626;
		font-weight: 500;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: #fee2e2;
		border-radius: 0.5rem;
	}

	.btn-start {
		width: 100%;
		padding: 1rem;
		font-size: 1.25rem;
		font-weight: bold;
		color: white;
		background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
		border: none;
		border-radius: 1rem;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-start:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
	}

	.btn-start:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.title {
			font-size: 2rem;
		}

		.form-card {
			padding: 1.5rem;
		}
	}
</style>
