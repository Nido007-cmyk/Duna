// UI vendor bundle → public/vendor/ui.js (window.UIK). Built by build.mjs with esbuild; versions pinned in package.json.
// Motion: the "mini" animate (native Web Animations) plus its spring generator, which keeps the bundle small.
import {animate} from 'motion/mini';
import {spring, stagger} from 'motion';
import {computePosition, autoUpdate, flip, shift, offset, arrow} from '@floating-ui/dom';
import confetti from 'canvas-confetti';
import autoAnimate from '@formkit/auto-animate';
window.UIK={animate, spring, stagger, computePosition, autoUpdate, flip, shift, offset, arrow, confetti, autoAnimate};
