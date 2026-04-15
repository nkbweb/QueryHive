import { createClient } from '@/lib/supabase/client'

export async function uploadProfileImage(file: File, userId: string) {
  const supabase = createClient()
  
  // Validate file type and size
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('Image size must be less than 5MB')
  }
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  // Upload to Supabase storage
  const { error } = await supabase.storage
    .from('profile-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) {
    throw error
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(fileName)
  
  return publicUrl
}

export async function deleteProfileImage(userId: string) {
  const supabase = createClient()
  
  // List all files for this user
  const { data: files } = await supabase.storage
    .from('profile-images')
    .list(userId)
  
  if (files && files.length > 0) {
    // Delete all files for this user
    const filesToDelete = files.map(file => `${userId}/${file.name}`)
    
    const { error } = await supabase.storage
      .from('profile-images')
      .remove(filesToDelete)
    
    if (error) {
      throw error
    }
  }
}

export async function getProfileImageUrl(userId: string) {
  const supabase = createClient()
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()
  
  return profile?.avatar_url
}

export function getProfileImagePlaceholder() {
  return `https://ui-avatars.com/api/?name=User&background=131315&color=ffffff&size=128&bold=true`
}
