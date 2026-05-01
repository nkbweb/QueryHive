import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserSkills, updateUserSkills } from '@/lib/queries/profiles'

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skills = await getUserSkills(user.id)
    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Error fetching user skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skillIds } = body

    if (!Array.isArray(skillIds)) {
      return NextResponse.json({ error: 'Invalid skillIds format' }, { status: 400 })
    }

    const result = await updateUserSkills(user.id, skillIds)

    if (!result) {
      return NextResponse.json({ error: 'Failed to update skills' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
