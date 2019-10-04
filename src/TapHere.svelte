<script>
import { fly } from 'svelte/transition';
let text = "← Tap Here!";
</script>

<div class="arrow">{text}</div>

<style>
.arrow {
  font-size: 16pt;
  color: #79dc40;
  background-color: gray;
  position: absolute;
  left: 200px;
  top: 10px;
  border-radius: 5px;
  margin: 3px;
}

</style>
