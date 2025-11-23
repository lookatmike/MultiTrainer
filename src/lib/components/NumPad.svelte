<script lang="ts">
	interface Props {
		value: string;
		onInput: (value: string) => void;
	}

	let { value = $bindable(''), onInput }: Props = $props();

	function handleNumber(num: string) {
		const newValue = value + num;
		value = newValue;
		onInput(newValue);
	}

	function handleBackspace() {
		const newValue = value.slice(0, -1);
		value = newValue;
		onInput(newValue);
	}

	function handleClear() {
		value = '';
		onInput('');
	}

	const buttons = [
		['7', '8', '9'],
		['4', '5', '6'],
		['1', '2', '3'],
		['C', '0', '←']
	];
</script>

<div class="numpad">
	{#each buttons as row}
		<div class="numpad-row">
			{#each row as btn}
				{#if btn === 'C'}
					<button class="numpad-btn btn-clear" onclick={handleClear}>
						{btn}
					</button>
				{:else if btn === '←'}
					<button class="numpad-btn btn-backspace" onclick={handleBackspace}>
						{btn}
					</button>
				{:else}
					<button class="numpad-btn btn-number" onclick={() => handleNumber(btn)}>
						{btn}
					</button>
				{/if}
			{/each}
		</div>
	{/each}
</div>

<style>
	.numpad {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.numpad-row {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.numpad-btn {
		flex: 1;
		min-width: 70px;
		min-height: 70px;
		font-size: 1.5rem;
		font-weight: bold;
		border: none;
		border-radius: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-number {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
		color: white;
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
	}

	.btn-number:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
	}

	.btn-number:active {
		transform: scale(0.95);
	}

	.btn-clear {
		background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
		color: white;
		box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
	}

	.btn-clear:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4);
	}

	.btn-clear:active {
		transform: scale(0.95);
	}

	.btn-backspace {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: white;
		box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
	}

	.btn-backspace:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4);
	}

	.btn-backspace:active {
		transform: scale(0.95);
	}

	@media (max-width: 640px) {
		.numpad {
			padding: 0.5rem;
			gap: 0.5rem;
		}

		.numpad-row {
			gap: 0.5rem;
		}

		.numpad-btn {
			min-width: 60px;
			min-height: 60px;
			font-size: 1.25rem;
		}
	}

	@media (min-width: 641px) {
		.numpad-btn {
			min-width: 90px;
			min-height: 90px;
			font-size: 2rem;
		}
	}
</style>
