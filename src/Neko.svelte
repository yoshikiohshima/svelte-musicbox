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

<div data-sevenup="{name}" style="position: absolute; transform-origin: top left; transform: scale({scale}); left: {position.left}px; top: {position.top}px" key={id}></div>

<style>
  [data-sevenup] { background-image: url('data:image/png;base64,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'); background-size: 192px 192px}
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

