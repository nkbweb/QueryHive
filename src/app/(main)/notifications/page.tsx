import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserNotifications } from '@/lib/queries/notifications'
import NotificationsList from '@/components/notifications/NotificationsList'

export default async function NotificationsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const notifications = await getUserNotifications(user.id)

  return (
    <div className="flex h-full bg-[#08080A]">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">Notifications</h1>
            <button
              className="px-4 py-2 text-sm bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors rounded-lg"
            >
              Mark all as read
            </button>
          </div>

          <NotificationsList notifications={notifications} />
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-[220px] h-full bg-[#131315] border-l border-[#1C1B1E] p-4">
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Filter</h3>
        <div className="flex flex-col gap-2">
          <button className="px-3 py-2 text-sm text-white bg-white/[0.05] rounded-lg text-left">
            All
          </button>
          <button className="px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg text-left transition-colors">
            Unread
          </button>
          <button className="px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg text-left transition-colors">
            Votes
          </button>
          <button className="px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg text-left transition-colors">
            Comments
          </button>
          <button className="px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg text-left transition-colors">
            Answers
          </button>
        </div>
      </aside>
    </div>
  )
}
