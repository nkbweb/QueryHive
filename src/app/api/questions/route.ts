import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { AIAnswerJob } from '@/lib/jobs/ai-answer-job'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()

    const { title, content, userId, tags } = body

    // Validate required fields
    if (!title || !content || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, userId' },
        { status: 400 }
      )
    }

    // Validate content length
    if (title.length < 10 || title.length > 300) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 300 characters' },
        { status: 400 }
      )
    }

    // No minimum content length requirement - removed 30 character limit

    // Create the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        title: title.trim(),
        content: content.trim(),
        user_id: userId,
        views: 0,
        upvotes: 0
      })
      .select()
      .single()

    if (questionError) {
      console.error('Error creating question:', questionError)
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      )
    }

    // Add tag associations if tags are provided
    let tagNames: string[] = []
    if (tags && tags.length > 0) {
      const tagAssociations = tags.map((tagId: string) => ({
        question_id: question.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabase
        .from('question_tags')
        .insert(tagAssociations)

      if (tagError) {
        console.error('Error adding tags:', tagError)
        // Don't fail the whole request if tags fail, but log the error
      }

      // Fetch tag names for AI context
      const { data: tagData } = await supabase
        .from('tags')
        .select('name')
        .in('id', tags)
      
      tagNames = tagData?.map((t: any) => t.name) || []
    }

    // Trigger AI answer generation (async, don't wait for it)
    let hasQuota = false
    try {
      const aiJob = AIAnswerJob.getInstance()
      
      // Check user AI quota first
      hasQuota = await aiJob.checkUserAIQuota(userId)
      
      if (hasQuota) {
        // Trigger AI generation in background (don't await to avoid slowing down response)
        aiJob.triggerAIAnswerForQuestion(question.id).catch(error => {
          console.error('Background AI answer generation failed:', error)
        })
        console.log(`AI answer generation triggered for question: ${question.id}`)
      } else {
        console.log(`User ${userId} has exceeded AI quota, skipping AI generation`)
      }
    } catch (aiError) {
      console.error('Failed to trigger AI answer generation:', aiError)
      // Don't fail the question creation if AI generation fails
    }

    return NextResponse.json(
      { 
        success: true, 
        question: {
          id: question.id,
          title: question.title,
          content: question.content,
          aiAnswerTriggered: hasQuota
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const tagId = searchParams.get('tag')

    let query = supabase
      .from('questions')
      .select(`
        id,
        title,
        content,
        views,
        upvotes,
        created_at,
        profiles (
          username
        ),
        answers (
          id
        ),
        question_tags (
          tags (
            id,
            name,
            color
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (tagId) {
      query = query.eq('question_tags.tag_id', tagId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    const questions = (data || []).map((q: any) => ({
      id: q.id,
      title: q.title,
      content: q.content,
      views: q.views || 0,
      upvotes: q.upvotes || 0,
      createdAt: q.created_at,
      username: q.profiles?.[0]?.username || 'Unknown',
      answersCount: q.answers?.length || 0,
      tags: (q.question_tags || [])
        .filter((qt: any) => qt.tags)
        .map((qt: any) => ({
          id: qt.tags.id,
          name: qt.tags.name,
          color: qt.tags.color || '#6B7280'
        }))
    }))

    return NextResponse.json({ questions })

  } catch (error) {
    console.error('Error in GET /api/questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
