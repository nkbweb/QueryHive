import { createClient } from '@/lib/supabase/client'

export async function getUserVote(userId: string, targetType: 'question' | 'answer', targetId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('user_id', userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single()
    
  if (error) {
    console.error('Error fetching user vote:', error)
    return 0
  }
  
  return data?.value || 0
}

export async function updateVote(userId: string, targetType: 'question' | 'answer', targetId: string, voteValue: 1 | -1 | 0) {
  const supabase = createClient()
  
  try {
    // First, remove any existing vote
    await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
    
    // Then, add new vote if not 0
    if (voteValue !== 0) {
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
          value: voteValue
        })
        
      if (insertError) {
        console.error('Error inserting vote:', insertError)
        return false
      }
    }
    
    // Update the target's vote count
    const updateField = targetType === 'question' ? 'upvotes' : 'upvotes'
    const { data: updateData, error: updateError } = await supabase
      .from(targetType === 'question' ? 'questions' : 'answers')
      .select('upvotes')
      .eq('id', targetId)
      .single()
    
    if (updateError || !updateData) {
      console.error('Error fetching target for vote update:', updateError)
      return false
    }
    
    // Calculate new upvote count
    const currentUpvotes = updateData.upvotes || 0
    let newUpvotes = currentUpvotes
    
    if (voteValue > 0) {
      newUpvotes = currentUpvotes + 1
    } else if (voteValue < 0) {
      newUpvotes = currentUpvotes - 1
    }
    
    // Update the upvote count
    const { error: finalUpdateError } = await supabase
      .from(targetType === 'question' ? 'questions' : 'answers')
      .update({ upvotes: newUpvotes })
      .eq('id', targetId)
      
    if (finalUpdateError) {
      console.error('Error updating vote count:', finalUpdateError)
      return false
    }
    
    return true
    
  } catch (error) {
    console.error('Vote update error:', error)
    return false
  }
}

export async function getVoteCounts(targetType: 'question' | 'answer', targetId: string): Promise<{ upvotes: number, downvotes: number }> {
  const supabase = createClient()
  
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
  const upvotes = votes.filter((v: any) => v.value > 0).length
  const downvotes = votes.filter((v: any) => v.value < 0).length
  
  return { upvotes, downvotes }
}
