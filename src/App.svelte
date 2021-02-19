<script>

import Stage from './Stage.svelte';
import Ball from './Ball.svelte';
// import TapHere from './TapHere.svelte';

import {Model, View, startSession} from '@croquet/croquet';

let isLocal = false;
let session;

let grid = false;
let gridText = 'Griding Off';

let stageWidth = 800;
let stageHeight = 300;
let stageBorder = 2;
let ballSize = 50;
let cycle = 2;

let soundStoppedByUser;
let context;

let barPos = 0;
let nekos = [];
let balls = [];
let normalBalls = [];

let enableButton;
let tapHere;
let partsBin;
let horizontal;

$: tapHere && enableButton && flashTapHere(tapHere, enableButton);

function flashTapHere(here, enable) {
  if (here && enable) {
    let rect = enable.getBoundingClientRect();
    here.classList.add("arrowFade");
    here.style.setProperty("display", "initial");
    here.style.left = (rect.right - 3) + "px";
    here.style.top = rect.top + "px";
    setTimeout(() => {
      here.remove();
    }, 4000);
  }
}

window.onresize = function() {
  let oldStageWidth = stageWidth;
  if (window.innerWidth < 900) {
    stageWidth = 400;
    stageHeight = 150;
    ballSize = 25;
  } else {
    stageWidth = 800;
    stageHeight = 300;
    ballSize = 50;
  }
  if (stageWidth !== oldStageWidth) {
    updateBalls(normalBalls);
  }
};

window.onresize();

function updateBalls(bs) {
  normalBalls = bs;
  balls = normalBalls.map((b) => ({
    id: b.id,
    left: b.left * (stageWidth - ballSize) + stageBorder,
    top: b.top * (stageHeight - ballSize) + stageBorder
  }));
}

function updateNekos(ns) {
  let realNekos = [];
  for (let k in ns) {
    let n = ns[k];
    let position = {left: n.position.left * stageWidth, top: n.position.top * stageWidth};
    realNekos.push(Object.assign({}, n, {id: k, position}));
  }
  nekos = realNekos;
}

class MockReflector {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  dispatch(arg) {
    if (arg === undefined) {return;}
    let mth = this.view.messages[arg.message];
    if (!mth || !this.view[mth]) {return;}
    let value = this.view[mth](arg);
    if (value === undefined) {return;}
    
    mth = this.model.messages[value.message];
    if (!mth || !this.model[mth]) {return;}
    value = this.model[mth](value);
    if (value === undefined) {return;}
    this.view.dispatch(value);
  }

  frame(time) {
    this.view.update(time);
    window.requestAnimationFrame(this.frame.bind(this));
  }
}

function makeMockReflector() {
  let m = MusicModel.create();
  m.init();
  let v = new MusicView(m);
  
  let mockReflector = new MockReflector(m, v);
  m.viewJoin(v.id);
  
  mockReflector.frame.bind(mockReflector)();

  return mockReflector;
}

function stof(s) {
  let scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C^'];
  let index = scale.indexOf(s);
  return Math.pow(1.0594630943592953, index) * 261.63;
}

function ftop(f) {
  // log_1.059 p = log p / log 1.059

  let p = f / 261.63;
  return Math.log(p) / Math.log(1.0594630943592953) / 12.0;
}

function ptof(p) {
  return Math.pow(1.0594630943592953, p * 12) * 261.63;
}

// [{x: normalizedPos, f: frequency}. x is normalized to [0, 1). f is frequency]
let defaultNotes = [
  {x: 0.000, f: stof('C')},
  {x: 0.125, f: stof('D')},
  {x: 0.250, f: stof('E')},
  {x: 0.375, f: stof('F')},
  {x: 0.500, f: stof('G')},
  {x: 0.625, f: stof('A')},
  {x: 0.750, f: stof('B')},
  {x: 0.875, f: stof('C^')},
];

function makeDefault() {
  let result = {};
  defaultNotes.forEach(n => {
    let id = newId();
    result[id] = Object.assign({}, n, {id: id});
  });
  return result;
}

function newId() {
  function hex() {
    let r = Math.random();
    return Math.floor(r * 256).toString(16).padStart(2, "0");
  }
  return`${hex()}${hex()}${hex()}${hex()}`;
}

class FutureHandler {
    constructor(tOffset) {
        this.tOffset = tOffset || 0;
    }
    
    setup(target) {
        let that = this;
        return new Proxy(target, {
            get(_target, property) {
                if (typeof target[property] === "function") {
                    return new Proxy(target[property], {
                        apply(method, _this, args) {
                            setTimeout(() => method.apply(target, args), that.tOffset);
                        }
                    });
                }
            }
        });
    }
}

class MockModel {
  constructor() {
    this.id = 'abc';
  }
  static create() {return new this();}
  static register() {}
  
  init() {}
  subscribe() {}
  publish(id, message, data) {
    if (session && session.view) {
      session.view.dispatch(data);
    }
  }

  future(tOffset=0) {
    return new FutureHandler(tOffset).setup(this);
  }
}

class MockView {
  constructor(model) {
    this.id = 'def';
    this.viewId = this.id;
  }
  subscribe() {}
}

let M = isLocal ? MockModel : Model;
let V = isLocal ? MockView : View;

class MusicModel extends M {
  static types() {
    return {
      'NekoModel': {
        cls: NekoModel,
        write: (c) => {
          let {position, state, frame, inState, dir, bound} = c;
          return {position, state, frame, inState, dir, bound};
        },
        read: (obj) => {
          return new NekoModel(obj);
	}
      }
    }
  }

  init() {
    super.init();
    this.notes = makeDefault(); // {id, x, f}
    this.nekos = {}; // {id: {id, position, state, inState}}
    this.mice = {}; // {id: left, top};
    
    this.messages = {
      'add':  'handlePieceAdded',
      'move': 'handlePieceMoved',
      'delete': 'handlePieceDeleted',
      'reset': 'handleReset',
      'exit': 'handleExit',
      'nekoUpdate': 'handleNekoUpdate',
    };

    this.subscribe(this.id, "message", this.dispatch);
    this.subscribe(this.sessionId, "view-join", this.viewJoin);
    this.subscribe(this.sessionId, "view-exit", this.viewExit);

    this.future(2000).tick();
    this.future(100).mouse();
  }

  dispatch(arg) {
    if (arg === undefined) {return;}
    let mth = this.messages[arg.message];
    if (!mth || !this[mth]) {return undefined;}
    let value = this[mth](arg);
    if (value === undefined) {return undefined;}
    if (isLocal) {
      session.view.dispatch(value);
    } else {
      this.publish(this.id, "message-m", value);
    }
  }

  viewJoin(viewId) {
    let neko = this.nekos[viewId];
    if (neko) {
      console.log("something is wrong");
    } else {
      this.nekos[viewId] = new NekoModel({});
      this.mice[viewId] = {viewId: viewId, left: 0.5, top: 0.2};
    }
  }

  viewExit(viewId) {
    delete this.nekos[viewId];
    delete this.mice[viewId];
    this.dispatch({message: 'exit', id: viewId});
  }

  handleExit(arg) {
    return {message: 'nekoUpdate'};
  }

  handleNekoUpdate(arg) {
    return arg;
  }

  handlePieceAdded(info) {
    let id = newId();
    let note = {id: id, x: info.ratioX, f: ptof(info.ratioY)};
    this.notes[id] = note;
    return Object.assign({}, info, {id: id, 'message': 'add'});
  }

  handlePieceMoved(arg) {
    this.notes[arg.id] = {x: arg.x, f: arg.f, id: arg.id};
    this.mice[arg.viewId] = {left: arg.left, top: arg.top, viewId: arg.viewId};
    return {message: 'update'};
  }

  handlePieceDeleted({id}) {
    delete this.notes[id];
    return {message: 'update'};
  }

  handleReset() {
    this.notes = makeDefault();
    return {message: 'reset'};
  }

  tick() {
    this.publish(this.id, 'message-m', {message: 'wrap'});
    this.future(2000).tick();
  }

  mouse() {
    for (let k in this.nekos) {
      let neko = this.nekos[k];
      let mouse = this.mice[k];
      if (neko && mouse) {
        neko.update(mouse);
      }
    }
    this.dispatch({message: 'nekoUpdate'});
    this.future(100).mouse();
  }
}

MusicModel.register();

class NekoModel {
  constructor(init) {
    this.position = init.position || {left: 0, top: 0};
    this.state = init.state || 'move';
    this.inState = init.inState || 0;
    this.frame = init.frame || 0;
    this.dir = init.dir || 'right';
    this.bound = init.bound || null;
    this.name = 'awake';

    this.speed = init.speed || (1 / 75);
    this.size = init.size || (32 / 800);

    // default stage width = 800px. neko is 32px.
    // Let us say that the apparent size of a neko on screen is 1/25th, and speed is 1/75th
  }

  calcDir(pos, m) {
    let dirs = [
      {primary: 'left', secondary: 'left'},
      {primary: 'left', secondary: 'dwleft'},
      {primary: 'down', secondary: 'dwleft'},
      {primary: 'down', secondary: 'down'},

      {primary: 'down', secondary: 'down'},
      {primary: 'down', secondary: 'dwright'},
      {primary: 'right', secondary: 'dwright'},
      {primary: 'right', secondary: 'right'},
      
      {primary: 'right', secondary: 'right'},
      {primary: 'right', secondary: 'upright'},
      {primary: 'up', secondary: 'upright'},
      {primary: 'up', secondary: 'up'},

      {primary: 'up', secondary: 'up'},
      {primary: 'up', secondary: 'upleft'},
      {primary: 'left', secondary: 'upleft'},
      {primary: 'left', secondary: 'left'},
    ];

    if (pos === undefined || m === undefined) {
      return dirs[0];
    }
    
    let x = m.left - pos.left;
    let y = m.top - pos.top;
    let t = Math.atan2(-y, x) + Math.PI;
    let d = Math.floor(t / (Math.PI / 8)); // [0...15]
    let a = Math.atan2(y, x);
    let cs = [Math.cos(a), Math.sin(a)];
    
    return [dirs[d].secondary, ...cs, Math.sqrt(x * x + y * y)];
  }

  calcNewState(s, i, d, b) {
    if (s === 'sleep') {
      if (d >= this.speed) {
        return 'awake';
      }
      return 'sleep';
    }

    if (s === 'awake') {
      if (i > 6) {
        if (d >= this.speed) {return 'move';}
        return 'mati';
      }
      return 'awake';
    }

    if (s === 'mati') {
      if (d >= this.speed) {return 'move';}
      if (i > 48) {return 'sleep';}
    }

    if (s === 'move') {
      if (b === null) {
        if (d < this.speed) {return 'mati';}
        return 'move';
      }
      if (i > 2) {
        return 'togi';
      }
      return 'move';
    }

    if (s === 'togi') {
      if (b === null) {
        return 'move';
      }
      if (i > 10) {
        return 'mati';
      }
      return 'togi';
    }

    // s === 'jare'

    return s;
  }

  boundWithIn(pos, w, h) {
    // pos will be mutated
    if (pos.left < 0) {
      pos.left = 0;
      return 'l';
    }
    if (pos.left > w - this.size) {
      pos.left = w - this.size;
      return 'r';
    }
    if (pos.top < 0) {
      pos.top = 0;
      return 'u';
    }
    if (pos.top >= h - this.size) {
      pos.top = h - this.size;
      return 'd';
    }
    return null;
  }

  update(mouse) {
    let [newDir, nx, ny, distance] = this.calcDir(this.position, mouse);
    let newBound = null;
    let newPos = this.position;

    if (this.state === 'move' || this.state === 'togi') {
      newPos = {left: this.position.left + nx * this.speed, top: this.position.top + ny * this.speed};
      newBound = this.boundWithIn(newPos, 1, (stageHeight / stageWidth));
    }

    let newState = this.calcNewState(this.state, this.inState, distance, newBound);
    let newFrame = (this.frame + 1) % 16; // 0, 1, 2, 3, ... 15, 0, 1, ...
    let newInState = this.state === newState ? this.inState + 1 : 0;

    let newName;
    if (newState === 'sleep') {
      newName = newState + ((newFrame >> 3) + 1);
    } else if (newState === 'awake') {
      newName = newState;
    } else if (newState === 'togi') {
      newName = newBound + newState + ((newFrame >> 2) % 2 + 1);
    } else if (newState === 'move') {
      newName = newDir + ((newFrame % 2) + 1);
    } else if (newState === 'jare') {
      newName = newState + '2';
    } else if (newState === 'mati') {
      if (newFrame < 8) {
        newName = 'mati2';
      } else {
        newName = 'jare2';
      }
    }

    this.position = newPos;
    this.state = newState;
    this.frame = newFrame;
    this.inState = newInState;
    this.dir = newDir;
    this.bound = newBound;
    this.name = newName;
  }
}

class MusicView extends V {
  constructor(model) {
    super(model);
    this.model = model;
    this.modelId = model.id;

    this.messages = {
      'wrap': 'handleBarWrapped',
      'down': 'mouseDown',
      'move': 'mouseMove',
      'up': 'mouseUp',
      'partsAdd': 'partsAdd',
      'add': 'pieceAdded',
      'update': 'handlePieceUpdated',
      'requestReset': 'requestReset',
      'reset': 'handleReset',
      'nekoUpdate': 'handleNekoUpdate',
      'mouseState': 'mouseState',
    };
    this.subscribe(this.modelId, "message-m", this.dispatch);

    this.clickId = null;
    soundStoppedByUser = false;
  }

  detach() {
    super.detach();
    if (this.updateMosue !== null) {
       clearInterval(this.updateMouse);
       this.updateMouse = null;
    }
  }

  dispatch(arg) {
    if (arg === undefined) {return;}
    let mth = this.messages[arg.message];
    if (!mth || !this[mth]) {return;}
    let value = this[mth](arg);
    if (value === undefined) {return;}

    if (!value.message) {value.message = arg.message;}
    if (isLocal) {
      session.model.dispatch(value);
    } else {
      this.publish(this.modelId, "message", value);
    }
  }

  mouseDown(evt) {
    // target is the piece. 'this' is the view
    if (!context && !soundStoppedByUser) {allowSound();}

    let target = evt.target;

    this.clickId = evt.id;

    this.clickInfo = {
      clickX: (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenX"],
      clickY: (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenY"],
      origX: parseFloat(target.style.left),
      origY: parseFloat(target.style.top)
    };
  }

  mouseMove(evt) {
    // 'this' is the piece. evt is on document
    if (this.clickId === null) {return;}
    let screenX = (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenX"];
    let screenY = (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenY"];
    let clickInfo = this.clickInfo;
    let posx = (screenX - clickInfo.clickX) + clickInfo.origX;
    let posy = (screenY - clickInfo.clickY) + clickInfo.origY;

    posx = Math.max(posx, stageBorder);
    posy = Math.min(Math.max(posy, stageBorder), stageHeight - ballSize + stageBorder);
    let makeParam = () => {
      let x = (posx - stageBorder) / (stageWidth - ballSize);
      let p = ((stageHeight - ballSize) - (posy - stageBorder)) / (stageHeight - ballSize);

      if (grid) {
        x = Math.floor(x * 32) / 32;
        p = Math.floor(p * 12) / 12;
      }

      let f = ptof(p);

      return {id: this.clickId, x, f, message: 'move', left: posx / stageWidth, top: (posy - (ballSize / 2)) / stageWidth, viewId: this.viewId};
    }
    this.lastTouchX = screenX;
    return makeParam();
  }

  mouseUp(evt) {
    // 'this' is the piece. evt is on document

    let screenX = evt["screenX"] || this.lastTouchX;
    let posx = (screenX - this.clickInfo.clickX) + this.clickInfo.origX;

    let id = this.clickId;
    this.clickId = null;
    this.lastTouchX = null;

    if (posx > stageWidth) {
      return {message: 'delete', id: id};
    }
    return undefined;
  }

  pieces(notes) {
    let ns = [];
    for (let k  in notes) {
      let n = notes[k];
      let b = {
        left: n.x,
        top: 1.0 - ftop(n.f),
        id: n.id
      };
      ns.push(b);
    }
    return ns;
  }

  partsAdd(evt) {
    let origRect = horizontal.getBoundingClientRect();
    let partRect = partsBin.firstChild.getBoundingClientRect();
    let ratioX = (partRect.left - origRect.left + ballSize) / stageWidth;
    let clickY = (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenY"];
    let posy = (evt.screenY - clickY) + (partRect.top - origRect.top);
    let p = 1.0 - ((posy - stageBorder) / (stageHeight - ballSize));

    this.clickInfo = {
      clickX: (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenX"],
      clickY: (evt.touches && evt.touches[0] ? evt.touches[0] : evt)["screenY"],
      origX: ratioX * stageWidth - ballSize,
      origY: ballSize / 2,
    };

    return {message: 'add', ratioX: ratioX, ratioY: p, touches: evt.touches, screenX: evt.screenX, screenY: evt.screenY};
  }

  pieceAdded(evt) {
    this.clickId = evt.id;
    updateBalls(this.pieces(this.model.notes));
  }

  requestReset() {
    return {message: 'reset'};
  }

  mouseState(m) {
    return Object.assign({message: 'nekoUpdate'}, this.mouse);
  }
    
  handleReset() {
    //disallowSound();
    soundStoppedByUser = false;
    this.handlePieceUpdated();
  }

  handlePieceUpdated() {
    updateBalls(this.pieces(this.model.notes));
  }

  handleNekoUpdate() {
    updateNekos(this.model.nekos);
  }

  handleBarWrapped() {
    this.originViewTime = this.viewTime;
    barPos = 0;
  }

  update(frameTime) {
    if (this.viewTime === undefined) {
      this.viewTime = frameTime;
      return;
    }
    let old = (this.viewTime - this.originViewTime) / (cycle * 1000);
    let now = (frameTime - this.originViewTime) / (cycle * 1000);

    let toPlay = [];

    for (let k in this.model.notes) {
      let n = this.model.notes[k];
      if (old <= n.x && n.x < now) {
        toPlay.push(n.f);
      }
    }
    this.viewTime = frameTime;
    this.play(toPlay);
    barPos = now;
  }

  play(ary) {
    if (!context) {return;}
    let now = context.currentTime;
    ary.forEach(sound => {
      let o = context.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(sound, now);

      let g = context.createGain();
      g.gain.setValueAtTime(0.0, now);
      g.gain.linearRampToValueAtTime(0.2, now + 0.1);
      o.connect(g);
      g.connect(context.destination);
      o.start(0, 0, 2);

      let stopTone = () => {
        if (!context) {return;}
        let future = context.currentTime;
        //g.gain.cancelScheduledValues(future);
        g.gain.setValueAtTime(g.gain.value, future);
        g.gain.exponentialRampToValueAtTime(0.00001, future + 1.0);
        o.stop(future + 1);
      };
      setTimeout(stopTone, 100);
    });
  }
}

function allowSound() {
  if (context) {return;}
  let AudioContext = window.AudioContext // Default
    || window.webkitAudioContext // Safari and old versions of Chrome
    || null;
  if (AudioContext) {
    context = new AudioContext();
    if (context.state === 'suspended') {
      context.resume();
    }
  }
}

function disallowSound() {
  if (context) {
    context.close();
  }
  soundStoppedByUser = true;
  context = null;
}

function resetBalls() {
  if (session.view) {
    session.view.dispatch({message: 'requestReset'})
  }
}

function toggleGrid() {
  grid = !grid;
  if (grid) {
    gridText = 'Grid On';
  } else {
    gridText = 'Grid Off';
  }
}

async function start() {
  if (isLocal) {
    session = makeMockReflector();
    session.view.handlePieceUpdated();
    return Promise.resolve('local');
  } else {
    session = await startSession("Music", MusicModel, MusicView, {tps: 20});
    window.models.push(session.model);
    
    session.view.handlePieceUpdated();
    return Promise.resolve('remote');
  }
}

</script>

<h1>Music Cat!</h1>
{#await start()}
<p> Waiting</p>
{:then}
<div>
  <button bind:this={enableButton} on:click={allowSound}>Enable Audio</button>
  <button on:click={disallowSound}>Disable Audio</button>
  <button on:click={resetBalls}>Reset</button>
  <button on:click={toggleGrid}>{gridText}</button>

  <div bind:this={horizontal} class="horizontal">
    <Stage session={session} balls={balls} nekos={nekos} barPos={barPos} stageWidth={stageWidth} stageHeight={stageHeight}></Stage>
    <div class="tools">
      <div bind:this={partsBin} class="partsBin">
        <Ball session={session} isPart={true} id='part'/>
      </div>
      <div class="trashholder">
        <div class="trash"></div>
      </div>
    </div>
  </div>
  <div class="arrow arrowFade" bind:this={tapHere}>← Tap Here!</div>
</div>
{/await}
<div id='qrcode'></div>
<a style="position: absolute; top: 0px; right: 0px;" href="https://github.com/yoshikiohshima/svelte-musicbox" target="_blank" rel="noopener noreferrer"><img width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149" class="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1"></a>

<style>
.horizontal {
  display: flex;
}

.partsBin {
  width: 80px;
  height: 80px;
  margin-top: 10px;
  margin-left: 10px;
  border: 2px solid gray;
  display: flex;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.tools {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.trashholder {
  margin-bottom: 10px;
  margin-left: 10px;
  width: 80px;
  height: 80px;
  display: flex;
  border: 1px solid blue;
}

.trash {
  width: 50px;
  height: 50px;
  margin: auto;
  background-repeat: no-repeat;
  background-size: 50px 50px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04Mi40MDEsMi4yMjlMNjUuOTk0LDUuMTIzbC01LjYwOS0zLjk2NEwzOS4yMjgsNC43NTNsLTIuODQ5LDUuMzI3ICAgbC0xNy43NDMsMi45OTdjLTIuNjk5LDAuNDUzLTQuNTA5LDMuMDEzLTQuMDU3LDUuNzEzYzAuNDY4LDIuNjk0LDMuMDIzLDQuNTA5LDUuNzE3LDQuMDQ2bDYzLjc2Ni0xMC44NDQgICBjMi43LTAuNDYzLDQuNTExLTMuMDE4LDQuMDU4LTUuNzEyQzg3LjY1MSwzLjU4MSw4NS4wOTYsMS43NzEsODIuNDAxLDIuMjI5eiI+PC9wYXRoPjwvZz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjQ1OCwyMy41NzZsOC44MDIsNzUuOTI3SDc4LjczbDguMjUzLTc1LjkyN0gxNS40NTh6IE0zNS4yNDgsOTEuNDMxICBjLTEuOTcsMC4xODUtMy43MTMtMS4yNTQtMy45MDMtMy4yMTlsLTUuMDIzLTUyLjU3OGMtMC4xODYtMS45NjQsMS4yNTQtMy43MTIsMy4yMTgtMy45MDJjMS45NjktMC4xOSwzLjcxMiwxLjI1NCwzLjkwMywzLjIyMyAgbDUuMDIyLDUyLjU3OUMzOC42NTcsODkuNDk4LDM3LjIxMiw5MS4yNDYsMzUuMjQ4LDkxLjQzMXogTTUxLjEyLDkxLjU2OWMtMS45NzUsMC4wMDUtMy41NzktMS41ODktMy41ODQtMy41NjJsLTAuMTU0LTUyLjgyICBjLTAuMDEtMS45NzQsMS41ODktMy41ODQsMy41NjMtMy41ODRjMS45NzQtMC4wMSwzLjU3OSwxLjU4OCwzLjU4OSwzLjU2M2wwLjE1NCw1Mi44MTlDNTQuNjk0LDg5Ljk2LDUzLjEsOTEuNTYzLDUxLjEyLDkxLjU2OXogICBNNzEuNTEyLDg4LjE0MWMtMC4xNDgsMS45NjktMS44NjEsMy40NDQtMy44MzEsMy4zYy0xLjk2OS0wLjE0NC0zLjQ0OS0xLjg2MS0zLjMtMy44M2wzLjg5Ny01Mi42NzYgIGMwLjE0OC0xLjk2NCwxLjg2MS0zLjQ0NSwzLjgyOS0zLjMwMWMxLjk3LDAuMTQ0LDMuNDUxLDEuODYxLDMuMzAyLDMuODNMNzEuNTEyLDg4LjE0MXoiPjwvcGF0aD48L3N2Zz4=")
}

.arrow {
  font-size: 16pt;
  color: #79dc40;
  background-color: gray;
  position: absolute;
  left: 200px;
  top: 80px;
  border-radius: 5px;
  margin: 3px;
}

.arrowFade {
  transition: left 4s, top 4s;
  -moz-transition: left 4s, top 4s;
  -webkit-transition: left 4s, top 4s;
}

@media (max-width: 900px) {
.partsBin {
  width: 40px;
  height: 40px;
}

.trashholder {
  width: 40px;
  height: 40px;
}

.trash {
  width: 25px;
  height: 25px;
  background-size: 25px 25px;
}
}
</style>

