import { NextResponse } from 'next/server'
import { getPlatformStats } from '@/lib/queries/explore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getPlatformStats()

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in GET /api/explore/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
