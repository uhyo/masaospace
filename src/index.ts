import { System } from './system';

// Start the server.

const sys = new System();
sys.init(err => {
  if (err) {
    process.exit();
  }
});
