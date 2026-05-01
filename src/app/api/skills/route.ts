import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category, name')

    if (error) {
      console.error('Error fetching skills:', error)
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }

    // Group skills by category
    const groupedSkills = data?.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({ skills: groupedSkills || {} })
  } catch (error) {
    console.error('Error in skills API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
