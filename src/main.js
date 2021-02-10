import App, {foo} from './App.svelte';

window.models = [];
window.views = [];

window.document.addEventListener("wheel", evt => evt.preventDefault(), { passive: false, capture: false });

let app = new App({
  target: document.body,
  props: {}
});
  
export default app;
