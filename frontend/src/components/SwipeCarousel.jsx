import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SwipeCarousel({ items = [], title = '', showControls = true }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollLeft, offsetWidth } = containerRef.current
    if (offsetWidth > 0) {
      const index = Math.round(scrollLeft / offsetWidth)
      setActiveIndex(index)
    }
  }

  const scrollToIndex = (index) => {
    if (!containerRef.current) return
    const offsetWidth = containerRef.current.offsetWidth
    containerRef.current.scrollTo({
      left: index * offsetWidth,
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }

  if (!items || items.length === 0) return null

  return (
    <div className="swipe-carousel-section">
      {title && (
        <div className="carousel-header">
          <span className="carousel-title">{title}</span>
          <div className="carousel-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carousel-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => scrollToIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="carousel-container"
        onScroll={handleScroll}
      >
        {items.map((item, i) => (
          <div key={i} className="carousel-slide">
            {item}
          </div>
        ))}
      </div>

      {showControls && items.length > 1 && (
        <div className="carousel-controls-bar">
          <button
            type="button"
            className="carousel-arrow-btn"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="carousel-page-indicator">
            {activeIndex + 1} / {items.length}
          </span>
          <button
            type="button"
            className="carousel-arrow-btn"
            disabled={activeIndex === items.length - 1}
            onClick={() => scrollToIndex(Math.min(items.length - 1, activeIndex + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
