// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 8000;
app.listen(PORT, (e) => {
  if (e) {
    console.error(e);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
