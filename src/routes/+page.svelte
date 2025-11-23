<script lang="ts">
	import { game } from '$lib/stores/gameStore';
	import SetupScreen from '$lib/components/SetupScreen.svelte';
	import GameScreen from '$lib/components/GameScreen.svelte';
	import ResultsScreen from '$lib/components/ResultsScreen.svelte';

	const gameState = game.gameState;
</script>

{#if $gameState === 'SETUP'}
	<SetupScreen />
{:else if $gameState === 'PLAYING'}
	<GameScreen />
{:else if $gameState === 'RESULTS'}
	<ResultsScreen />
{/if}
