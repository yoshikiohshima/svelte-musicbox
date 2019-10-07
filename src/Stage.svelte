<script>
import Bar from './Bar.svelte';
import Ball from './Ball.svelte';
import Neko from './Neko.svelte';

export let session;
export let balls = [];
export let nekos = [];
export let barPos = 0;
export let stageHeight;
export let stageWidth;

</script>

<div class={"stage"}>
  {#each balls as ball (ball.id)}
    <Ball session={session} id={ball.id} left={ball.left} top={ball.top}/>
  {/each}
  {#each nekos as neko (neko.id)}
    <Neko id={neko.id} name={neko.name} state={neko.state} position={neko.position} frame={neko.frame} bound={neko.bound} dir={neko.dir} scale={stageWidth === 800 ? 1 : 0.5}/>
  {/each}
  <Bar stageWidth={stageWidth} stageHeight={stageHeight} ratio={barPos}/>
</div>

<style>
.stage {
  position: relative;
  width: 800px;
  height: 300px;
  border: 2px solid blue;
}

@media (max-width: 900px) {
.stage {
  width: 400px;
  height: 150px;
}
}
</style>
