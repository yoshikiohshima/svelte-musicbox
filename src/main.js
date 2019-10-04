import App, {foo} from './App.svelte';

window.models = [];
window.views = [];

let app = new App({
  target: document.body,
  props: {}
});
  
export default app;
