import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();

    if (error) {
      return NextResponse.json({ _error: _error.message }, { _status: 500 });
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .from('vehicles')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ _error: _error.message }, { _status: 500 });
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _error } = await supabase.from('vehicles').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ _error: _error.message }, { _status: 500 });
    }

    return NextResponse.json({ _success: true });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}
