<script>
export let ratio;
export let stageWidth;
export let stageHeight;
</script>

<style>
.bar {
  position: absolute;
  width: 4px;
  background: black;
}

@media (max-width: 900px) {
.bar {
  width: 2px;
}
}
</style>

<div class="bar" style="display: {ratio > 1.0 ? 'none' : 'inherit'}; left: {ratio * stageWidth}px; top: 0px; height: {stageHeight}px"></div>
