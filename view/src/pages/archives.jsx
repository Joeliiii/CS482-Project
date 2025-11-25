import React, { useState, useEffect } from 'react'

export default function Archives() {
  const [archives, setArchives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, recent, popular
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    fetchArchives()
  }, [filter])

  const fetchArchives = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/archives?filter=${filter}`, {
        credentials: 'include'
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'Failed to load archives.')
        setLoading(false)
        return
      }
      setArchives(data.archives || [])
      setLoading(false)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleVideoClick = (archive) => {
    setSelectedVideo(archive)
  }

  const closeModal = () => {
    setSelectedVideo(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:00`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <main className="container-xl py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-ybt mb-2">📹 Game Archives</h1>
        <p className="lead text-secondary">Watch past games and highlights</p>
      </div>

      <section className="mb-4">
        <div className="ybt-card rounded-2xl p-4">
          <h2 className="h5 fw-bold text-ybt mb-3">Filter Archives</h2>
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className={`btn ${filter === 'all' ? 'bg-ybt' : 'btn-outline-secondary'} rounded-pill`}
              onClick={() => setFilter('all')}
            >
              All Games
            </button>
            <button 
              className={`btn ${filter === 'recent' ? 'bg-ybt' : 'btn-outline-secondary'} rounded-pill`}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
            <button 
              className={`btn ${filter === 'popular' ? 'bg-ybt' : 'btn-outline-secondary'} rounded-pill`}
              onClick={() => setFilter('popular')}
            >
              Most Viewed
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="alert alert-danger rounded-2xl mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-ybt" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <section>
          {archives.length === 0 ? (
            <div className="ybt-card rounded-2xl p-5 text-center text-secondary">
              <p className="mb-0">No archived games available.</p>
            </div>
          ) : (
            <div className="row g-4">
              {archives.map((archive) => (
                <div key={archive._id} className="col-md-6 col-lg-4">
                  <div 
                    className="ybt-card rounded-2xl overflow-hidden h-100 cursor-pointer"
                    onClick={() => handleVideoClick(archive)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="position-relative" style={{ paddingBottom: '56.25%', background: '#000' }}>
                      {archive.thumbnailUrl ? (
                        <img 
                          src={archive.thumbnailUrl} 
                          alt={archive.title}
                          className="position-absolute w-100 h-100"
                          style={{ objectFit: 'cover', top: 0, left: 0 }}
                        />
                      ) : (
                        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
                          <span className="text-secondary fs-1">🏀</span>
                        </div>
                      )}
                      <div className="position-absolute bottom-0 end-0 bg-dark text-white px-2 py-1 m-2 rounded small">
                        {formatDuration(archive.duration)}
                      </div>
                      <div className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center opacity-0 hover-overlay" style={{ background: 'rgba(0,0,0,0.6)', transition: 'opacity 0.3s' }}>
                        <div className="bg-ybt rounded-circle d-flex align-items-center justify-content-center" style={{ width: 60, height: 60 }}>
                          <span className="text-dark fs-4">▶</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="h6 fw-bold text-ybt mb-2">{archive.title}</h3>
                      <p className="text-secondary small mb-2">{archive.description}</p>
                      <div className="d-flex justify-content-between text-secondary small">
                        <span>{formatDate(archive.gameDate)}</span>
                        <span>{archive.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedVideo && (
        <div 
          className="modal fade show d-block" 
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-bottom ybt-border">
                <h5 className="modal-title text-ybt">{selectedVideo.title}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  {selectedVideo.videoUrl ? (
                    <video 
                      controls 
                      autoPlay
                      className="w-100"
                      src={selectedVideo.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-black text-secondary">
                      <p>Video unavailable</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-top ybt-border">
                <div className="w-100">
                  <p className="text-secondary mb-2">{selectedVideo.description}</p>
                  <div className="d-flex justify-content-between text-secondary small">
                    <span>{formatDate(selectedVideo.gameDate)}</span>
                    <span>{selectedVideo.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .hover-overlay:hover {
          opacity: 1 !important;
        }
        .cursor-pointer:hover .hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </main>
  )
}