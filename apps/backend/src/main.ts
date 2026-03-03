import { createApp } from './app';
import { config } from './infrastructure/config/env';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Backend listening on port ${config.port}`);
});
