import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface AuthError {
  message: string
  field?: string
}

export interface SignupData {
  fullName: string
  username: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const clearError = () => setError(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' }
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' }
    }
    return { isValid: true }
  }

  const validateUsername = (username: string): { isValid: boolean; message?: string } => {
    if (username.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters' }
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' }
    }
    return { isValid: true }
  }

  const signup = async (data: SignupData) => {
    setLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!data.fullName.trim()) {
        setError({ message: 'Full name is required', field: 'fullName' })
        return
      }

      const usernameValidation = validateUsername(data.username)
      if (!usernameValidation.isValid) {
        setError({ message: usernameValidation.message!, field: 'username' })
        return
      }

      if (!validateEmail(data.email)) {
        setError({ message: 'Invalid email address', field: 'email' })
        return
      }

      const passwordValidation = validatePassword(data.password)
      if (!passwordValidation.isValid) {
        setError({ message: passwordValidation.message!, field: 'password' })
        return
      }

      // Check if username is available
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', data.username)
        .single()

      if (existingUser) {
        setError({ message: 'Username is already taken', field: 'username' })
        return
      }

      // Check if email is already registered
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .single()

      if (existingEmail) {
        setError({ message: 'Email is already registered', field: 'email' })
        return
      }

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username,
          }
        }
      })

      if (signUpError) {
        setError({ message: signUpError.message })
        return
      }

      // Create profile record
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              full_name: data.fullName,
              username: data.username,
              email: data.email,
              created_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // If table doesn't exist, we can still proceed with auth
            // The profile can be created later via admin or migration
            router.push('/login?message=Account created successfully')
          } else {
            router.push('/login?message=Account created successfully')
          }
        } catch (err) {
          console.error('Profile creation failed:', err)
          // Continue with auth success even if profile fails
          router.push('/login?message=Account created successfully')
        }
      }
    } catch {
      setError({ message: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    setLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!validateEmail(data.email)) {
        setError({ message: 'Invalid email address', field: 'email' })
        return
      }

      if (!data.password) {
        setError({ message: 'Password is required', field: 'password' })
        return
      }

      // Sign in user
      console.log('Starting login process for:', data.email)
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      console.log('Login attempt result:', { authData, signInError })
      console.log('Session exists:', !!authData.session)

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError({ message: 'Invalid email or password' })
        } else {
          setError({ message: signInError.message })
        }
        return
      }

      if (authData.user) {
        console.log('Login successful, user data:', authData.user)
        
        // Manually set cookies to ensure persistence
              if (authData.user) {
          //  Let Supabase handle session
          window.location.href = '/home'
        }
      } else {
        console.log('No user data returned')
        setError({ message: 'Login failed: No user data returned' })
      }
    } catch {
      setError({ message: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      setError({ message: 'Failed to logout' })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    clearError,
    signup,
    login,
    logout,
    validateEmail,
    validatePassword,
    validateUsername
  }
}
