import app from './app.js';

const port = parseInt(process.env.PORT || '3001', 10);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Issuance service listening on :${port}`);
  });
}
