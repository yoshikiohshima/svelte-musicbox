<script>
export let session;

export let isPart;
export let id;

export let left;
export let top;

let currentDocCapture;

class DocMouseCapture {
  static capture(move, up) {
    currentDocCapture = new DocMouseCapture(move, up);
  }
  
  constructor(move, up) {
    this.move = move;
    this.up = up;

    this.mouseMove = (evt) => this.docMouseMove(evt);
    this.mouseUp = (evt) => this.docMouseUp(evt);
    if (currentDocCapture && move) {
      console.error("we don't support multi touch");
      return;
    }

    document.addEventListener("mousemove", this.mouseMove);
    document.addEventListener("touchmove", this.mouseMove);
    document.addEventListener("mouseup", this.mouseUp);
    document.addEventListener("touchend", this.mouseUp);
  }

  docMouseMove(evt) {
    if (!this.move) {return;}
    this.move(evt);
  }

  docMouseUp(evt) {
    if (!this.up) {return;}
    this.up(evt);
    document.removeEventListener("mousemove", this.mouseMove);
    document.removeEventListener("mouseup", this.mouseUp);
    document.removeEventListener("touchmove", this.mouseMove);
    document.removeEventListener("touchend", this.mouseUp);
    currentDocCapture = null;
  }
}

function dragger(session, id) {
  let clickState;
  let updater = (obj) => {if (session.view) {session.view.dispatch(obj);}};

  function mouseDown(evt) {
    let target = evt.target;
    evt.preventDefault();

    let left = target.style.getPropertyValue("left");
    left = left === "" ? 0 : parseInt(left, 10);
    let top = target.style.getPropertyValue("top");
    top = top === "" ? 0 : parseInt(top, 10);
    clickState = {origX: left, origY: top,
                  pageX: evt.pageX, pageY: evt.pageY,
                  left: left, top: top};
    DocMouseCapture.capture(mouseMove, mouseUp);
    updater({message: 'down', target: evt.target, id: id,
             touches: evt.touches,
             screenX: evt.screenX, screenY: evt.screenY});
  }

  function mouseMove(evt) {
    if (!clickState) {return;}
    evt.preventDefault();
    updater({message: 'move', target: evt.target, id: id,
             touches: evt.touches,
             screenX: evt.screenX, screenY: evt.screenY});
  }

  function mouseUp(evt) {
    evt.preventDefault();
    updater({message: 'up', target: evt.target, id: id,
             touches: evt.touches,
             screenX: evt.screenX, screenY: evt.screenY});
  }
  return mouseDown;
}

function bePart(session, id) {
  let clickState;
  let updater = (obj) => session.view.dispatch(obj);

  let state = 'none'; // or 'moved', or 'down'
  function mouseDown(evt) {
    let target = evt.target;
    evt.preventDefault();

    let left = target.style.getPropertyValue("left");
    left = left === "" ? 0 : parseInt(left, 10);
    let top = target.style.getPropertyValue("top");
    top = top === "" ? 0 : parseInt(top, 10);
    clickState = {origX: left, origY: top,
                  pageX: evt.pageX, pageY: evt.pageY,
                  left: left, top: top};
    DocMouseCapture.capture(mouseMove, mouseUp);
    state = 'down';
  }
    
  function mouseMove(evt) {
    if (!clickState) {return;}
    evt.preventDefault();
    let obj = {target: evt.target,
               touches: evt.touches,
               screenX: evt.screenX, screenY: evt.screenY};
    if (state === 'down') {
      state ='moved';
      obj.message = 'partsAdd';
    } else {
      obj.message = 'move';
    }
    updater(obj);
  }

  function mouseUp(evt) {
    state = 'none';
    updater({message: 'up', target: evt.target,
             touches: evt.touches,
             screenX: evt.screenX, screenY: evt.screenY});
  }

  return mouseDown;
}

</script>

{#if isPart}
  <div class="piece part" id={id} on:touchstart={bePart(session, id)} on:mousedown={bePart(session, id)} />
{:else}
  <div class="piece" key={id} style="left: {left}px; top: {top}px" on:touchstart={dragger(session, id)} on:mousedown={dragger(session, id)} />
{/if}

<style>
.piece {
  width: 50px;
  height: 50px;
  left: 0px;
  top: 0px;
  border-radius: 25px;
  background: radial-gradient(circle at 20px 20px, #f00, #000);
  position: absolute;
}

.part {
  margin: auto;
  position: inherit;
}

@media (max-width: 900px) {
.piece {
  width: 25px;
  height: 25px;
  left: 0px;
  top: 0px;
  border-radius: 12.5px;
  background: radial-gradient(circle at 10px 10px, #f00, #000);
}
}
</style>