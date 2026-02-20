import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body (not JSON)' }, { status: 400 });
    }

    const { prompt, isEdit = false, imageBase64 = null, aspect = '16:9', n = 3 } = body;

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      console.error('[Proxy] Missing XAI_API_KEY');
      return NextResponse.json({ error: 'Server error: API key not configured' }, { status: 500 });
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
      if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
        return NextResponse.json({ error: 'Invalid image data (base64 too short or missing)' }, { status: 400 });
      }
      requestBody.image = { url: `data:image/jpeg;base64,${imageBase64}` };
    }

    const xaiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let responseData;
    const contentType = xaiRes.headers.get('content-type') || '';

    if (xaiRes.ok) {
      if (contentType.includes('application/json')) {
        responseData = await xaiRes.json();
      } else {
        const text = await xaiRes.text();
        console.error('[Proxy] xAI OK but non-JSON content-type:', contentType, text.slice(0, 200));
        return NextResponse.json({ error: 'xAI returned non-JSON success response' }, { status: 500 });
      }
    } else {
      // Handle error – try text first to avoid parse crash
      let errorBody = '';
      try {
        errorBody = await xaiRes.text(); // safer than .json()
      } catch {
        errorBody = '(empty body)';
      }
      console.error('[Proxy] xAI error:', xaiRes.status, errorBody);
      return NextResponse.json(
        { error: `xAI API error (${xaiRes.status}): ${errorBody || 'No details provided'}` },
        { status: xaiRes.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error('[Proxy] Internal error:', err.message, err.stack);
    return NextResponse.json({ error: 'Internal proxy error: ' + (err.message || 'Unknown') }, { status: 500 });
  }
}
