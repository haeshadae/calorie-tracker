export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { foodText, meal } = JSON.parse(event.body)

    if (!foodText?.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'foodText is required' }) }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a nutrition expert. A user logged the following food for ${meal}: "${foodText}"

Break this into individual food items and estimate the calories for each one.
Use realistic, practical estimates based on typical serving sizes.
If a quantity is not specified, assume a standard single serving.

Respond ONLY with a valid JSON array. No explanation, no markdown, just the raw JSON array.

Example format:
[
  { "food": "2 scrambled eggs", "calories": 180 },
  { "food": "white toast with butter, 1 slice", "calories": 115 }
]

Rules:
- Keep food names concise and descriptive (under 45 characters)
- Calories must be whole numbers
- One entry per distinct food item
- Return ONLY the JSON array`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Upstream API error. Check your ANTHROPIC_API_KEY.' }),
      }
    }

    const data = await response.json()
    const rawText = data.content[0].text.trim()

    let items
    try {
      items = JSON.parse(rawText)
    } catch {
      // Try extracting JSON array if Claude wrapped it in anything
      const match = rawText.match(/\[[\s\S]*\]/)
      if (match) {
        items = JSON.parse(match[0])
      } else {
        throw new Error('Could not parse response as JSON')
      }
    }

    if (!Array.isArray(items)) {
      throw new Error('Response is not an array')
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ items }),
    }
  } catch (err) {
    console.error('Function error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to estimate calories. Please try again.' }),
    }
  }
}
