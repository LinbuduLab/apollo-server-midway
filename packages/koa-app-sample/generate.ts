import transformer from 'json-type-graphql';
import path from 'path';

(async () => {
  await transformer({
    reader: {
      url: 'http://127.0.0.1:7001/',
    },
    writter: {
      outputPath: path.join(__dirname, './generated.ts'),
    },
  });
})();
