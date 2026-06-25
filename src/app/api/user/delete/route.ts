import { NextResponse } from 'next/server'
import { createClient as createLocalClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE() {
  try {
    const supabaseLocal = await createLocalClient()
    const { data: { user } } = await supabaseLocal.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete the authentication identity (this will cascade delete all related data due to ON DELETE CASCADE)
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('Failed to delete auth user:', error)
      return NextResponse.json({ error: 'Failed to delete user identity.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Failed to delete account:', error)
    return NextResponse.json({ error: 'An error occurred while deleting the account.' }, { status: 500 })
  }
}
