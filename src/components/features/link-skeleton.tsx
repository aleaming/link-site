import React from 'react'

export function LinkSkeleton() {
  return (
    <div 
      className="link-card animate-pulse"
      style={{ 
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)'
      }}
    >
      {/* Image skeleton */}
      <div 
        className="w-full h-32 rounded-lg mb-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
      
      {/* Content skeleton */}
      <div className="space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div 
            className="h-5 rounded"
            style={{ backgroundColor: 'var(--bg-secondary)', width: '80%' }}
          />
          <div 
            className="h-4 rounded"
            style={{ backgroundColor: 'var(--bg-secondary)', width: '60%' }}
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div 
            className="h-3 rounded"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
          <div 
            className="h-3 rounded"
            style={{ backgroundColor: 'var(--bg-secondary)', width: '90%' }}
          />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <div 
            className="h-6 w-16 rounded-full"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
          <div 
            className="h-6 w-20 rounded-full"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
          <div 
            className="h-6 w-12 rounded-full"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-4">
            <div 
              className="h-4 w-12 rounded"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            />
            <div 
              className="h-4 w-8 rounded"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            />
          </div>
          <div 
            className="h-6 w-16 rounded-full"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>
      </div>
    </div>
  )
}