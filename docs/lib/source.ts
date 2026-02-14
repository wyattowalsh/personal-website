import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { docs, meta } from '@/.source';
import { createElement, type ReactElement } from 'react';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
  icon(icon) {
    if (!icon) return;

    const [set, name] = icon.split('/');

    if (!set || !name) {
      console.warn(`Invalid icon format: ${icon}`);
      return;
    }

    let lib: Record<string, unknown>;

    try {
      // Use a switch statement to handle dynamic imports in a way
      // that is compatible with bundlers like Turbopack and Webpack.
      switch (set) {
        case 'ai':
          lib = require('react-icons/ai');
          break;
        case 'bi':
          lib = require('react-icons/bi');
          break;
        case 'bs':
          lib = require('react-icons/bs');
          break;
        case 'cg':
          lib = require('react-icons/cg');
          break;
        case 'di':
          lib = require('react-icons/di');
          break;
        case 'fa':
          lib = require('react-icons/fa');
          break;
        case 'fc':
          lib = require('react-icons/fc');
          break;
        case 'fi':
          lib = require('react-icons/fi');
          break;
        case 'gi':
          lib = require('react-icons/gi');
          break;
        case 'go':
          lib = require('react-icons/go');
          break;
        case 'gr':
          lib = require('react-icons/gr');
          break;
        case 'hi':
          lib = require('react-icons/hi');
          break;
        case 'hi2':
          lib = require('react-icons/hi2');
          break;
        case 'im':
          lib = require('react-icons/im');
          break;
        case 'io':
          lib = require('react-icons/io');
          break;
        case 'io5':
          lib = require('react-icons/io5');
          break;
        case 'lia':
          lib = require('react-icons/lia');
          break;
        case 'md':
          lib = require('react-icons/md');
          break;
        case 'pi':
          lib = require('react-icons/pi');
          break;
        case 'ri':
          lib = require('react-icons/ri');
          break;
        case 'rx':
          lib = require('react-icons/rx');
          break;
        case 'si':
          lib = require('react-icons/si');
          break;
        case 'sl':
          lib = require('react-icons/sl');
          break;
        case 'tb':
          lib = require('react-icons/tb');
          break;
        case 'tfi':
          lib = require('react-icons/tfi');
          break;
        case 'ti':
          lib = require('react-icons/ti');
          break;
        case 'vsc':
          lib = require('react-icons/vsc');
          break;
        case 'wi':
          lib = require('react-icons/wi');
          break;
        default:
          throw new Error(`Unknown icon set: ${set}`);
      }

      const Component = lib[name] as (props: Record<string, unknown>) => ReactElement;

      if (Component) {
        return createElement(Component);
      } else {
        console.warn(`Icon not found: ${name} in set ${set}`);
        return;
      }
    } catch (error) {
      console.warn(`Failed to load icon: ${icon}`, error);
      return;
    }
  },
});
