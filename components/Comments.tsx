'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  if (!siteMetadata.comments?.provider) {
    return null
  }
  return (
    <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
      <button
        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        onClick={() => setLoadComments(true)}
      >
        Load Comments
      </button>
      {loadComments && <CommentsComponent slug={slug} />}
    </div>
  )
}
