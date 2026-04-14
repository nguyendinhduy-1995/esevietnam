import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const call = await prisma.callRecord.findUnique({ where: { id } });
  if (!call) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  let apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'openai_api_key' } });
    if (config?.value) {
      apiKey = config.value;
      process.env.OPENAI_API_KEY = apiKey;
    }
  }
  if (!apiKey) return NextResponse.json({ error: 'Chưa cấu hình OpenAI API Key. Vào Cài đặt để thêm key.' }, { status: 400 });

  try {
    // If there's a transcript, analyze it
    let transcript = call.transcript;

    // If no transcript but has audio, transcribe first
    if (!transcript && call.audioPath) {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', call.audioPath);

      if (fs.existsSync(filePath)) {
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer]);
        formData.append('file', blob, 'audio.mp3');
        formData.append('model', 'whisper-1');
        formData.append('language', 'vi');

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: formData,
        });

        if (whisperRes.ok) {
          const whisperData = await whisperRes.json();
          transcript = whisperData.text;
          await prisma.callRecord.update({ where: { id }, data: { transcript } });
        }
      }
    }

    if (!transcript) {
      return NextResponse.json({ error: 'Không có nội dung để phân tích. Cần file ghi âm hoặc transcript.' }, { status: 400 });
    }

    // AI Analysis
    const analysisRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Bạn là chuyên gia đào tạo telesales cho trung tâm dạy nghi thức xã giao ESE Vietnam. Phân tích cuộc gọi tư vấn và chấm điểm.

Trả về JSON với format:
{
  "score": <số từ 0-10>,
  "criteria": {
    "greeting": { "score": <0-10>, "comment": "<nhận xét>" },
    "tone": { "score": <0-10>, "comment": "<nhận xét>" },
    "product_knowledge": { "score": <0-10>, "comment": "<nhận xét>" },
    "objection_handling": { "score": <0-10>, "comment": "<nhận xét>" },
    "closing": { "score": <0-10>, "comment": "<nhận xét>" }
  },
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>"],
  "weaknesses": ["<điểm yếu 1>", "<điểm yếu 2>"],
  "suggestions": ["<gợi ý cải thiện 1>", "<gợi ý cải thiện 2>"],
  "summary": "<tóm tắt 2-3 câu>"
}`
          },
          { role: 'user', content: `Phân tích cuộc gọi tư vấn sau:\n\n${transcript}` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!analysisRes.ok) {
      const errData = await analysisRes.json();
      return NextResponse.json({ error: `OpenAI error: ${errData.error?.message || 'Unknown'}` }, { status: 500 });
    }

    const analysisData = await analysisRes.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    await prisma.callRecord.update({
      where: { id },
      data: { aiScore: analysis.score, aiAnalysis: JSON.stringify(analysis) },
    });

    return NextResponse.json({ analysis, transcript });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
