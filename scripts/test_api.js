(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/ai/thumbnails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Thumbnail', type: 'Poster', mood: 'Chill', overlay: 'Test overlay', style: 'neo-noir' }),
    });
    console.log('status:', res.status);
    const text = await res.text();
    console.log('body:', text);
  } catch (err) {
    console.error('request error:', err);
  }
})();
