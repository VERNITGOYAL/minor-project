import { useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'

const papers = [
  {
    title: 'Designing trustworthy AI systems',
    author: 'Maya Chen',
    type: 'Literature review',
    date: 'Updated today',
    color: 'bg-coral',
  },
  {
    title: 'Climate models and coastal cities',
    author: 'Jon Bell',
    type: 'Research paper',
    date: 'Updated yesterday',
    color: 'bg-sage',
  },
  {
    title: 'The quiet power of public libraries',
    author: 'You',
    type: 'Working draft',
    date: 'Updated Sep 18',
    color: 'bg-sky',
  },
]

function App() {
  const [activeTab, setActiveTab] = useState('All papers')
  const [query, setQuery] = useState('')
  const [showNotice, setShowNotice] = useState(false)

  const filteredPapers = papers.filter((paper) =>
    `${paper.title} ${paper.author} ${paper.type}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  const handleCreate = () => {
    setShowNotice(true)
    window.setTimeout(() => setShowNotice(false), 2600)
  }

  return (
    <main className="min-h-screen bg-ink text-paper selection:bg-coral selection:text-ink">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a className="flex items-center gap-3" href="#top" aria-label="Papertrail home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-ink">
            <BookOpen size={18} strokeWidth={2.5} />
          </span>
          <span className="font-serif text-xl tracking-tight">papertrail</span>
        </a>
        <div className="hidden items-center gap-8 text-sm text-paper/65 md:flex">
          <a className="text-paper" href="#library">Library</a>
          <a className="transition-colors hover:text-coral" href="#insights">Insights</a>
          <a className="transition-colors hover:text-coral" href="#about">About</a>
        </div>
        <button
          className="flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-sm transition-colors hover:border-coral hover:text-coral"
          type="button"
          onClick={handleCreate}
        >
          <Plus size={16} /> New paper
        </button>
      </nav>

      <section id="top" className="mx-auto max-w-7xl px-6 pb-16 pt-12 lg:px-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-coral">
              <Sparkles size={15} /> Your research desk
            </p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[0.94] tracking-[-0.04em] sm:text-7xl">
              Make space for <em className="text-coral">better</em> thinking.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/60">
              Keep your sources close, your ideas moving, and your next discovery within reach.
            </p>
          </div>
          <div className="border-l border-paper/15 pl-6 lg:mb-2">
            <p className="text-sm leading-6 text-paper/55">This week</p>
            <p className="mt-2 font-serif text-4xl">12 <span className="text-lg text-paper/50">sources read</span></p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-paper/10">
              <div className="h-full w-3/4 rounded-full bg-coral" />
            </div>
            <p className="mt-2 text-xs text-paper/45">3 sources ahead of last week</p>
          </div>
        </div>
      </section>

      <section id="library" className="bg-paper py-12 text-ink lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-6 border-b border-ink/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/45">Your library</p>
              <h2 className="mt-2 font-serif text-4xl tracking-tight">Recent papers</h2>
            </div>
            <label className="flex w-full items-center gap-3 border-b border-ink/25 pb-2 text-ink/50 sm:w-64">
              <Search size={17} />
              <input
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
                placeholder="Search your library"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search your library"
              />
            </label>
          </div>

          <div className="flex gap-6 border-b border-ink/15 py-5 text-sm text-ink/50">
            {['All papers', 'In progress', 'Completed'].map((tab) => (
              <button
                className={activeTab === tab ? 'font-semibold text-ink' : 'transition-colors hover:text-ink'}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="divide-y divide-ink/15">
            {filteredPapers.length ? filteredPapers.map((paper, index) => (
              <article className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center" key={paper.title}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${paper.color} text-ink`}>
                  <FileText size={22} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="mb-1 text-xs text-ink/45">0{index + 1} / {paper.type}</p>
                  <h3 className="font-serif text-2xl tracking-tight transition-colors group-hover:text-coral">{paper.title}</h3>
                  <p className="mt-1 text-sm text-ink/50">{paper.author} <span className="px-2">·</span> {paper.date}</p>
                </div>
                <button className="flex items-center gap-2 text-sm text-ink/55 transition-colors hover:text-ink" type="button">
                  Open <ChevronRight size={16} />
                </button>
              </article>
            )) : (
              <p className="py-12 text-center text-ink/55">No papers match “{query}”.</p>
            )}
          </div>
        </div>
      </section>

      <section id="insights" className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-coral">Keep the thread</p>
          <h2 className="mt-4 max-w-lg font-serif text-4xl leading-tight tracking-tight">Small notes become strong arguments.</h2>
          <button className="mt-8 flex items-center gap-2 text-sm text-paper transition-colors hover:text-coral" type="button" onClick={handleCreate}>
            Start a new note <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-px bg-paper/15">
          <div className="bg-ink p-6">
            <Clock3 className="text-coral" size={20} />
            <p className="mt-8 font-serif text-3xl">4.5h</p>
            <p className="mt-2 text-sm text-paper/50">deep work this week</p>
          </div>
          <div className="bg-ink p-6">
            <Check className="text-coral" size={20} />
            <p className="mt-8 font-serif text-3xl">08</p>
            <p className="mt-2 text-sm text-paper/50">ideas captured</p>
          </div>
          <div className="col-span-2 bg-ink p-6">
            <FolderOpen className="text-coral" size={20} />
            <p className="mt-8 font-serif text-3xl">3 collections</p>
            <p className="mt-2 text-sm text-paper/50">Organized around the questions you keep returning to.</p>
          </div>
        </div>
      </section>

      <footer id="about" className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-paper/15 px-6 py-7 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>papertrail / a calmer place to think</p>
        <MoreHorizontal size={18} />
      </footer>

      {showNotice && (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-ink shadow-2xl">
          <Check size={16} /> New paper ready to begin
        </div>
      )}
    </main>
  )
}

export default App
