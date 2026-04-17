'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/components/Toast'

const TOPICS = [
  'Technology', 'Design', 'Science', 'Philosophy',
  'Business', 'Health', 'Finance', 'Culture',
  'Productivity', 'Mathematics',
]

// ── Read-time helper ──────────────────────────────────────────────────────────

function calcReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WriteClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [title,      setTitle]      = useState('')
  const [excerpt,    setExcerpt]    = useState('')
  const [topic,      setTopic]      = useState(TOPICS[0])
  const [tags,       setTags]       = useState<string[]>([])
  const [tagInput,   setTagInput]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  // ── Tiptap editor ───────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write something worth reading...' }),
    ],
    editorProps: {
      attributes: { class: 'ProseMirror' },
    },
  })

  const readTime = editor ? calcReadTime(editor.getHTML()) : 1

  // ── Tag helpers ─────────────────────────────────────────────────────────────

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!tag || tags.includes(tag) || tags.length >= 6) return
    setTags(prev => [...prev, tag])
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput.replace(',', ''))
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editor) return

    const content = editor.getHTML()
    if (!title.trim())   { setError('title is required'); return }
    if (!excerpt.trim()) { setError('excerpt is required'); return }
    if (content === '<p></p>' || !editor.getText().trim()) {
      setError('post content is required'); return
    }

    setError('')
    setSubmitting(true)

    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')]
      : tags

    const { data, error: dbError } = await supabase
      .from('posts')
      .insert({
        title:       title.trim(),
        excerpt:     excerpt.trim(),
        topic,
        tags:        finalTags,
        content,
        read_time:   readTime,
        author_id:   userId,
        trust_score: 0,
        verified:    false,
      })
      .select('id')
      .single()

    if (dbError || !data) {
      setError('something went wrong — please try again')
      setSubmitting(false)
      return
    }

    showToast('post published!')
    router.push(`/post/${data.id}`)
  }

  // ── Toolbar ─────────────────────────────────────────────────────────────────

  const ToolBtn = useCallback(({
    onClick, active, title: t, children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={t}
      className={`p-1.5 rounded text-xs font-bold transition-colors ${
        active
          ? 'text-[#4a9ebb] bg-[rgba(74,158,187,0.12)]'
          : 'text-[#787068] hover:text-[#4a9ebb] hover:bg-[rgba(74,158,187,0.08)]'
      }`}
    >
      {children}
    </button>
  ), [])

  function setLink() {
    const url = window.prompt('URL')
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* Page label */}
      <p className="text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#787068]">
        new post
      </p>

      {/* Title */}
      <div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
          placeholder="title"
          autoFocus
          className="w-full bg-transparent text-[2rem] font-extrabold tracking-tight
                     text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]/40
                     outline-none border-none"
        />
      </div>

      {/* Excerpt */}
      <div>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          maxLength={240}
          rows={2}
          placeholder="one or two sentences that make someone want to read on…"
          className="w-full bg-transparent resize-none text-base text-[#787068]
                     placeholder:text-[#787068]/40 outline-none leading-relaxed"
        />
      </div>

      {/* Topic + Tags row */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Topic */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.6rem] font-semibold tracking-wider uppercase text-[#787068]">topic</label>
          <select
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="bg-[#f0ede8] dark:bg-[#1e1e1e] border border-black/[0.09] dark:border-[#f0ede8]/[0.09]
                       text-sm text-[#1c1a16] dark:text-[#f0ede8] rounded-lg px-3 py-2 outline-none
                       focus:border-[#4a9ebb]/40 transition-colors cursor-pointer"
          >
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[0.6rem] font-semibold tracking-wider uppercase text-[#787068]">
            tags <span className="normal-case tracking-normal font-normal opacity-60">({tags.length}/6)</span>
          </label>
          <div className="flex gap-2 items-start">
            <div className="flex flex-wrap gap-2 items-center flex-1 min-h-[38px] px-3 py-2 rounded-lg
                            bg-[#f0ede8] dark:bg-[#1e1e1e] border border-black/[0.09] dark:border-[#f0ede8]/[0.09]
                            focus-within:border-[#4a9ebb]/40 transition-colors cursor-text">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(74,158,187,0.14)', color: '#4a9ebb' }}>
                  {t}
                  <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}
                          className="hover:opacity-70 leading-none">&times;</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput('') } }}
                type="text"
                placeholder={tags.length ? '' : 'add tags…'}
                autoComplete="off"
                className="bg-transparent outline-none text-xs text-[#1c1a16] dark:text-[#f0ede8]
                           placeholder:text-[#787068]/60 flex-1 min-w-[80px] h-5"
              />
            </div>
            <button type="button"
                    onClick={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput('') } }}
                    className="shrink-0 h-[38px] px-3 rounded-lg border text-xs font-semibold transition-colors
                               border-black/[0.1] dark:border-[#f0ede8]/[0.1] text-[#787068]
                               hover:border-[#4a9ebb]/40 hover:text-[#4a9ebb]
                               bg-[#f0ede8] dark:bg-[#1e1e1e]">
              + tag
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black/[0.06] dark:border-[#f0ede8]/[0.06]" />

      {/* Editor */}
      <div>
        {/* Toolbar */}
        {editor && (
          <div className="flex items-center gap-0.5 mb-3 flex-wrap">
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}
                     active={editor.isActive('bold')} title="Bold">
              <span className="font-black text-sm w-5 h-5 flex items-center justify-center">B</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}
                     active={editor.isActive('italic')} title="Italic">
              <span className="italic text-sm w-5 h-5 flex items-center justify-center">I</span>
            </ToolBtn>
            <div className="w-px h-4 bg-black/[0.1] dark:bg-[#f0ede8]/[0.1] mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                     active={editor.isActive('heading', { level: 2 })} title="Heading 2">
              <span className="text-[0.65rem] font-black w-7 h-5 flex items-center justify-center">H2</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                     active={editor.isActive('heading', { level: 3 })} title="Heading 3">
              <span className="text-[0.65rem] font-black w-7 h-5 flex items-center justify-center">H3</span>
            </ToolBtn>
            <div className="w-px h-4 bg-black/[0.1] dark:bg-[#f0ede8]/[0.1] mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
                     active={editor.isActive('bulletList')} title="Bullet list">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="9" y1="6"  x2="20" y2="6"/>
                <line x1="9" y1="12" x2="20" y2="12"/>
                <line x1="9" y1="18" x2="20" y2="18"/>
                <circle cx="4" cy="6"  r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </ToolBtn>
            <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </ToolBtn>
          </div>
        )}

        {/* Editor area */}
        <div className="rounded-xl border border-black/[0.07] dark:border-[#f0ede8]/[0.07]
                        bg-[#f0ede8] dark:bg-[#1e1e1e] px-6 py-5
                        focus-within:border-[#4a9ebb]/30 transition-colors">
          <EditorContent editor={editor} />
        </div>

        {/* Read time */}
        <p className="mt-2 text-[0.65rem] text-[#787068] text-right">
          ~{readTime} min read
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={submitting}
          className="ws-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'publishing…' : 'publish post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors"
        >
          cancel
        </button>
      </div>

    </form>
  )
}
