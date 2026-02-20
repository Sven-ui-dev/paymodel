import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get('authorization');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            authorization: authHeader || '',
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // Service Role Client für Admin-Operationen (lazy init)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete profile from database first
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile delete error:', profileError);
      return NextResponse.json(
        { error: 'Profil konnte nicht gelöscht werden: ' + profileError.message },
        { status: 500 }
      );
    }

    // Delete auth user using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Auth delete error:', deleteError);
      return NextResponse.json(
        { error: 'Benutzer konnte nicht gelöscht werden: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Account erfolgreich gelöscht' });

  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten: ' + error.message },
      { status: 500 }
    );
  }
}
