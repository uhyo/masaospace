import { Game } from '@uhyo/masaospace-util';
import * as config from 'config';

// Util for front
export const getTitleImageOfGame = (game: Game) => {
  for (const r of game.resources) {
    if (r.target === 'filename_title') {
      return `${config.get('service.url')}uploaded/${r.id}`;
    }
  }
  return `${config.get('service.url')}static/title.gif`;
};
