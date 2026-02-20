import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})); // safe parse
    const { prompt, isEdit = false, imageBase64 = null, aspect = '16:9', n = 3 } = body;

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      console.error('Missing XAI_API_KEY env var');
      return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
    }

    const endpoint = isEdit ? 'https://api.x.ai/v1/images/edits' : 'https://api.x.ai/v1/images/generations';

    const requestBody: any = {
      prompt: isEdit ? `Transform the uploaded yard photo into: ${prompt}` : prompt,
      model: 'grok-imagine-image',
      response_format: 'url',
      n,
      aspect_ratio: aspect,
    };

    if (isEdit && imageBase64) {
      requestBody.image = { url: `data:image/jpeg;base64,${imageBase64}` };
    }

    console.log('Sending to xAI:', { endpoint, promptPreview: prompt.slice(0, 100) + '...' });

    const xaiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!xaiRes.ok) {
      let errorText = await xaiRes.text(); // use .text() instead of .json() to avoid parse crash
      console.error('xAI error:', xaiRes.status, errorText);
      return NextResponse.json(
        { error: `xAI API failed (${xaiRes.status}): ${errorText || 'No details'}` },
        { status: xaiRes.status }
      );
    }

    // Safe json parse
    let data;
    try {
      data = await xaiRes.json();
    } catch (parseErr) {
      console.error('Failed to parse xAI response as JSON:', parseErr);
      const text = await xaiRes.text();
      return NextResponse.json({ error: 'Invalid response from xAI (not JSON)', raw: text.slice(0, 200) }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Proxy route error:', err);
    return NextResponse.json({ error: 'Internal server error: ' + (err.message || 'Unknown') }, { status: 500 });
  }
}
