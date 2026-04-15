import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getVoteCounts(targetType: 'question' | 'answer', targetId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    
  if (error) {
    console.error('Error fetching vote counts:', error)
    return { upvotes: 0, downvotes: 0 }
  }
  
  const votes = data || []
  const upvotes = votes.filter(v => v.value > 0).length
  const downvotes = votes.filter(v => v.value < 0).length
  
  return { upvotes, downvotes }
}
