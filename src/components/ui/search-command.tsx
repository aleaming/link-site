import * as React from "react"
import { Command } from "cmdk"
import * as Dialog from "@radix-ui/react-dialog"
import { Search, Hash, Clock, Zap, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  url: string
  icon?: string
}

export interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: SearchResult[]
  recentSearches: string[]
  suggestions: string[]
  loading?: boolean
  onSearch: (query: string) => void
  onSelect: (result: SearchResult) => void
  onRecentSelect: (query: string) => void
  placeholder?: string
}

const SearchCommand = React.forwardRef<HTMLDivElement, SearchCommandProps>(
  ({
    open,
    onOpenChange,
    results,
    recentSearches,
    suggestions,
    loading = false,
    onSearch,
    onSelect,
    onRecentSelect,
    placeholder = "Search resources...",
    ...props
  }, ref) => {
    const [query, setQuery] = React.useState("")

    // Keyboard shortcut
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          onOpenChange(!open)
        }
        if (e.key === "Escape") {
          onOpenChange(false)
        }
      }

      document.addEventListener("keydown", down)
      return () => document.removeEventListener("keydown", down)
    }, [open, onOpenChange])

    // Handle search
    React.useEffect(() => {
      if (query.trim()) {
        onSearch(query)
      }
    }, [query, onSearch])

    // Group results by category
    const groupedResults = React.useMemo(() => {
      const groups: Record<string, SearchResult[]> = {}
      results.forEach((result) => {
        if (!groups[result.category]) {
          groups[result.category] = []
        }
        groups[result.category].push(result)
      })
      return groups
    }, [results])

    const handleSelect = (result: SearchResult) => {
      onSelect(result)
      onOpenChange(false)
      setQuery("")
    }

    const handleRecentSelect = (searchQuery: string) => {
      setQuery(searchQuery)
      onRecentSelect(searchQuery)
    }

    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <motion.div
              ref={ref}
              className="bg-white/10 dark:bg-neutral-900/10 backdrop-blur-xl border border-white/20 dark:border-neutral-700/50 rounded-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              {...props}
            >
              <Command className="w-full">
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-white/10 dark:border-neutral-700/50">
                  <Search size={18} className="text-neutral-400 dark:text-neutral-500 mr-3" />
                  <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none outline-none text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  {loading && (
                    <Loader2 size={16} className="text-cyan-500 animate-spin ml-2" />
                  )}
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded border">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center">
                    <div className="text-neutral-500 dark:text-neutral-400">
                      {query ? `No results found for "${query}"` : "Start typing to search..."}
                    </div>
                  </Command.Empty>

                  {/* Recent Searches */}
                  {!query && recentSearches.length > 0 && (
                    <Command.Group heading="Recent Searches">
                      {recentSearches.map((search) => (
                        <Command.Item
                          key={search}
                          onSelect={() => handleRecentSelect(search)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-neutral-800/50 data-[selected]:bg-cyan-500/20 data-[selected]:text-cyan-400 transition-colors"
                        >
                          <Clock size={16} className="text-neutral-400 dark:text-neutral-500" />
                          <span className="flex-1 truncate">{search}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Suggestions */}
                  {!query && suggestions.length > 0 && (
                    <Command.Group heading="Suggestions">
                      {suggestions.map((suggestion) => (
                        <Command.Item
                          key={suggestion}
                          onSelect={() => setQuery(suggestion)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-neutral-800/50 data-[selected]:bg-cyan-500/20 data-[selected]:text-cyan-400 transition-colors"
                        >
                          <Zap size={16} className="text-lime-500" />
                          <span className="flex-1 truncate">{suggestion}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Grouped Results */}
                  {Object.entries(groupedResults).map(([category, categoryResults]) => (
                    <Command.Group key={category} heading={category}>
                      {categoryResults.map((result) => (
                        <Command.Item
                          key={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-neutral-800/50 data-[selected]:bg-cyan-500/20 data-[selected]:text-cyan-400 transition-colors"
                        >
                          {result.icon ? (
                            <img src={result.icon} alt="" className="w-4 h-4 rounded" />
                          ) : (
                            <Hash size={16} className="text-neutral-400 dark:text-neutral-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.title}</div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                              {result.description}
                            </div>
                          </div>
                          <div className="text-xs text-neutral-400 dark:text-neutral-500 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                            {result.category}
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }
)
SearchCommand.displayName = "SearchCommand"

export { SearchCommand }