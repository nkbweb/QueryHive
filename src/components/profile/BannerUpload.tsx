'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface BannerUploadProps {
  currentBannerUrl: string
  onBannerChange: (url: string) => void
  userId: string
}

export default function BannerUpload({ currentBannerUrl, onBannerChange, userId }: BannerUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentBannerUrl || null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/banner-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-banners')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-banners')
        .getPublicUrl(fileName)

      onBannerChange(publicUrl)
    } catch (error) {
      console.error('Error uploading banner:', error)
      alert('Failed to upload banner')
      setPreview(currentBannerUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onBannerChange('')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Banner Image</label>
        <p className="text-xs text-white/40 mb-3">Recommended size: 1200x300px (4:1 aspect ratio). Max 5MB.</p>
      </div>

      {/* Banner Preview */}
      <div className="relative w-full h-48 bg-surface-container border border-surface-container-high rounded-lg overflow-hidden">
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Banner preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">No banner image</span>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-surface-container border border-surface-container-high rounded-lg text-white/70 hover:text-white hover:bg-surface-container-high transition-colors cursor-pointer">
        {uploading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Banner
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  )
}
