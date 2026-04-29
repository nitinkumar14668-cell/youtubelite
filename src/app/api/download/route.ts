import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  const url = `https://www.youtube.com/watch?v=${id}`;

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highest' });
    
    // Instead of streaming the buffer manually into a NextResponse (which can be hard because NextResponse expects a standard ReadableStream), 
    // it's easier to just redirect the user to the format.url, or we can stream it if allowed.
    // If we redirect, the browser will download it if it has content-disposition, or just play it.
    // To trigger a download, we can proxy the stream.
    
    const stream = ytdl(url, { format });
    
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4"`);
    headers.set('Content-Type', 'video/mp4');

    return new NextResponse(readableStream, {
      headers,
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
