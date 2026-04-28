import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProfileByUsername, getUserQuestions, getUserAnswers, getUserComments } from '@/lib/queries/profiles'
import ProfileView from '@/components/profile/ProfileView'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await getProfileByUsername(params.username)

  if (!profile) {
    redirect('/home')
  }

  const isOwnProfile = user?.id === profile.id

  // Fetch user activity
  const [questions, answers, comments] = await Promise.all([
    getUserQuestions(profile.id),
    getUserAnswers(profile.id),
    getUserComments(profile.id)
  ])

  return (
    <ProfileView
      profile={profile}
      isOwnProfile={isOwnProfile}
      currentUserId={user?.id}
      questions={questions}
      answers={answers}
      comments={comments}
    />
  )
}
