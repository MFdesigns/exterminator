import { DebugModel } from './model.js';
import { DebugView } from './views/debugView.js';
import { DebugController } from './controller.js';

/** Global reference to controller */
let ctrl = null;

(function main() {
  const model = new DebugModel();
  const dbgView = new DebugView()
  ctrl = new DebugController(model, dbgView);
})();

// ======================= //
//   NAVBAR EVENT HANDLER
// ======================= //

const nav = document.getElementsByTagName('nav')[0];
nav.addEventListener('click', (event) => {
  const closest = event.target.closest('.nav__btn');
  if (closest) {
    const navs = document.getElementsByClassName('nav__btn');
    const pages = document.getElementsByClassName('page');
    const { page } = closest.dataset;

    for (let i = 0; i < pages.length; i++) {
      const pageElem = pages[i];
      if (pageElem.dataset.page === page) {
        pageElem.classList.toggle('page--active', true);
      } else {
        pageElem.classList.toggle('page--active', false);
      }
    }

    for (let i = 0; i < navs.length; i++) {
      const navElem = navs[i];
      if (navElem.dataset.page === page) {
        navElem.classList.toggle('nav__btn--active', true);
      } else {
        navElem.classList.toggle('nav__btn--active', false);
      }
    }
  }
});
