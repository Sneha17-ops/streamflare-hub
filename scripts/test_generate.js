(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/ai/thumbnails/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Cinematic poster for Test Thumbnail', size: '512x512' }),
    });
    console.log('status:', res.status);
    const text = await res.text();
    console.log('body:', text);
  } catch (err) {
    console.error('request error:', err);
  }
})();
