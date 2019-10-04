<script>
  export let id;
  export let state;
  export let position;
  export let frame;
  export let bound;
  export let dir;
  export let name;
  export let scale = 1.0;
</script>

<div data-sevenup="{name}" style="transform-origin: top left; transform: translate({position.left}px, {position.top}px) scale({scale})"></div>

<style>
  [data-sevenup] { background-image: url('/img/neko-tora.png'); background-size: 192px 192px}
  [data-sevenup="awake"] { width: 32px; height: 32px; background-position: 0px 0px }
  [data-sevenup="down1"] { width: 32px; height: 32px; background-position: -32px 0px }
  [data-sevenup="down2"] { width: 32px; height: 32px; background-position: 0px -32px }
  [data-sevenup="dtogi1"] { width: 32px; height: 32px; background-position: -32px -32px }
  [data-sevenup="dtogi2"] { width: 32px; height: 32px; background-position: -64px 0px }
  [data-sevenup="dwleft1"] { width: 32px; height: 32px; background-position: -64px -32px }
  [data-sevenup="dwleft2"] { width: 32px; height: 32px; background-position: 0px -64px }
  [data-sevenup="dwright1"] { width: 32px; height: 32px; background-position: -32px -64px }
  [data-sevenup="dwright2"] { width: 32px; height: 32px; background-position: -64px -64px }
  [data-sevenup="jare2"] { width: 32px; height: 32px; background-position: -96px 0px }
  [data-sevenup="kaki1"] { width: 32px; height: 32px; background-position: -96px -32px }
  [data-sevenup="kaki2"] { width: 32px; height: 32px; background-position: -96px -64px }
  [data-sevenup="left1"] { width: 32px; height: 32px; background-position: 0px -96px }
  [data-sevenup="left2"] { width: 32px; height: 32px; background-position: -32px -96px }
  [data-sevenup="ltogi1"] { width: 32px; height: 32px; background-position: -64px -96px }
  [data-sevenup="ltogi2"] { width: 32px; height: 32px; background-position: -96px -96px }
  [data-sevenup="mati2"] { width: 32px; height: 32px; background-position: -128px 0px }
  [data-sevenup="mati3"] { width: 32px; height: 32px; background-position: -128px -32px }
  [data-sevenup="right1"] { width: 32px; height: 32px; background-position: -128px -64px }
  [data-sevenup="right2"] { width: 32px; height: 32px; background-position: -128px -96px }
  [data-sevenup="rtogi1"] { width: 32px; height: 32px; background-position: 0px -128px }
  [data-sevenup="rtogi2"] { width: 32px; height: 32px; background-position: -32px -128px }
  [data-sevenup="sleep1"] { width: 32px; height: 32px; background-position: -64px -128px }
  [data-sevenup="sleep2"] { width: 32px; height: 32px; background-position: -96px -128px }
  [data-sevenup="up1"] { width: 32px; height: 32px; background-position: -128px -128px }
  [data-sevenup="up2"] { width: 32px; height: 32px; background-position: -160px 0px }
  [data-sevenup="upleft1"] { width: 32px; height: 32px; background-position: -160px -32px }
  [data-sevenup="upleft2"] { width: 32px; height: 32px; background-position: -160px -64px }
  [data-sevenup="upright1"] { width: 32px; height: 32px; background-position: -160px -96px }
  [data-sevenup="upright2"] { width: 32px; height: 32px; background-position: -160px -128px }
  [data-sevenup="utogi1"] { width: 32px; height: 32px; background-position: 0px -160px }
  [data-sevenup="utogi2"] { width: 32px; height: 32px; background-position: -32px -160px }
</style>

