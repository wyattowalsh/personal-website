'use client'

import * as React from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StudioUser } from '@/lib/studio/types'

interface ProfileEditorProps {
  user: StudioUser
}

export function ProfileEditor({ user }: ProfileEditorProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName ?? user.name ?? '')
  const [bio, setBio] = React.useState(user.bio ?? '')
  const [website, setWebsite] = React.useState(user.website ?? '')
  const [github, setGithub] = React.useState(user.socialLinks?.github ?? '')
  const [twitter, setTwitter] = React.useState(user.socialLinks?.twitter ?? '')
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaving(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/studio/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          website: website.trim() || undefined,
          socialLinks: {
            github: github.trim() || undefined,
            twitter: twitter.trim() || undefined,
          },
        }),
      })
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="profile-display-name" className="text-sm font-medium">
          Display Name
        </label>
        <input
          id="profile-display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={100}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Your display name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-muted-foreground">{bio.length}/500</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-website" className="text-sm font-medium">
          Website
        </label>
        <input
          id="profile-website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          maxLength={500}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="https://yoursite.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-github" className="text-sm font-medium">
          GitHub URL
        </label>
        <input
          id="profile-github"
          type="url"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="https://github.com/username"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-twitter" className="text-sm font-medium">
          Twitter / X URL
        </label>
        <input
          id="profile-twitter"
          type="url"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="https://x.com/username"
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {status === 'saved' ? 'Saved!' : status === 'error' ? 'Error \u2014 try again' : 'Save Profile'}
      </Button>
    </div>
  )
}
