'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadProfileImage, getProfileImagePlaceholder } from '@/lib/storage/profile-images'
import Image from 'next/image'

interface ProfileImageUploadProps {
  userId: string
  currentAvatar?: string
  onAvatarChange?: (newAvatarUrl: string) => void
  size?: 'small' | 'medium' | 'large'
  editable?: boolean
}

export default function ProfileImageUpload({ 
  userId, 
  currentAvatar, 
  onAvatarChange,
  size = 'medium',
  editable = true 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!editable) return

    setIsUploading(true)
    setError('')

    try {
      const newAvatarUrl = await uploadProfileImage(file, userId)
      
      // Update local state
      if (onAvatarChange) {
        onAvatarChange(newAvatarUrl)
      }

      // Update profile in database
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const avatarUrl = currentAvatar || getProfileImagePlaceholder()

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full bg-surface-container-high 
          border-2 border-outline-variant/20 
          overflow-hidden cursor-pointer
          transition-all duration-200
          ${editable ? 'hover:border-primary-container/50' : ''}
          ${isUploading ? 'opacity-50' : ''}
        `}
        onClick={handleClick}
      >
        <Image
          src={avatarUrl}
          alt="Profile"
          className="w-full h-full object-cover"
          width={size === 'small' ? 64 : size === 'medium' ? 96 : 128}
          height={size === 'small' ? 64 : size === 'medium' ? 96 : 128}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {editable && !isUploading && (
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[12px] text-on-primary">edit</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!editable || isUploading}
      />

      {error && (
        <div className="absolute top-full mt-1 text-xs text-error whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
