import('../src/auth.js')
  .then(() => {
    console.log('imported successfully');
  })
  .catch((e) => {
    console.error('IMPORT ERROR:');
    console.error(e && e.stack ? e.stack : e);
    process.exit(1);
  });
