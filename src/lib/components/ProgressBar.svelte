<script lang="ts">
	interface Props {
		timeRemaining: number;
		totalTime: number;
	}

	let { timeRemaining, totalTime }: Props = $props();

	const percentage = $derived((timeRemaining / totalTime) * 100);
	const bonusThreshold = $derived(totalTime * 0.6); // 40% of time remaining
	const inBonusZone = $derived(timeRemaining >= bonusThreshold);

	// Calculate color based on remaining time
	const barColor = $derived(() => {
		if (percentage > 60) return '#4ade80'; // Green
		if (percentage > 30) return '#fbbf24'; // Yellow
		return '#ef4444'; // Red
	});
</script>

<div class="progress-container">
	<div class="progress-bar-wrapper">
		<div
			class="progress-bar"
			style="width: {percentage}%; background-color: {barColor()};"
			class:bonus-zone={inBonusZone}
		></div>
		{#if inBonusZone}
			<div class="bonus-indicator">Bonus Zone!</div>
		{/if}
	</div>
	<div class="time-remaining">{timeRemaining.toFixed(1)}s</div>
</div>

<style>
	.progress-container {
		width: 100%;
		margin-bottom: 1.5rem;
	}

	.progress-bar-wrapper {
		position: relative;
		width: 100%;
		height: 2rem;
		background: #e5e7eb;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.progress-bar {
		height: 100%;
		transition: width 0.1s linear, background-color 0.3s ease;
		border-radius: 1rem;
		position: relative;
	}

	.progress-bar.bonus-zone {
		animation: pulse 0.8s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(74, 222, 128, 0);
		}
	}

	.bonus-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-weight: bold;
		font-size: 0.875rem;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		pointer-events: none;
		animation: bounce 0.6s ease-in-out infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.05);
		}
	}

	.time-remaining {
		text-align: center;
		margin-top: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: #ffffff;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
</style>
