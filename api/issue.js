export const config = { runtime: 'edge' };

export default async function handler(req) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `2025-2026년 기준 세계적으로 가장 논쟁적인 이슈 1개를 선정해줘.
찬성 논거 1개(2문장)와 반대 논거 1개(2문장)를 함께 제시해.
마크다운 없이 순수 JSON만 출력:
{"tag":"카테고리(10자 이하)","title":"이슈 제목(질문형, 25자 이내)","pro_arg":"찬성 논거","con_arg":"반대 논거"}`
        }],
      }),
    });

    const data = await res.json();
    const text = data.content[0].text.replace(/```json|```/g, '').trim();
    const issue = JSON.parse(text);

    return new Response(JSON.stringify(issue), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
