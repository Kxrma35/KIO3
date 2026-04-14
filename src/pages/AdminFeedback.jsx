import { useEffect, useMemo, useState } from 'react'
import { auth, db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, ChartBarSquareIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { isAdminEmail } from '../utils/admin'
import './AdminFeedback.css'

function normalizeSuggestion(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function AdminFeedback() {
  const user = auth.currentUser
  const navigate = useNavigate()
  const [rows, setRows] = useState([])

  const allowed = isAdminEmail(user?.email)

  useEffect(() => {
    if (!allowed) return undefined
    return onSnapshot(collection(db, 'feedback'), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      setRows(data)
    })
  }, [allowed])

  const analytics = useMemo(() => {
    const total = rows.length
    const avg = total ? rows.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total : 0

    const bucket = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const freq = new Map()
    rows.forEach((r) => {
      const rating = Math.max(1, Math.min(5, Number(r.rating) || 0))
      if (rating) bucket[rating] += 1

      const key = normalizeSuggestion(r.suggestion)
      if (key) freq.set(key, (freq.get(key) || 0) + 1)
    })

    const topRequests = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }))

    return { total, avg, bucket, topRequests }
  }, [rows])

  if (!allowed) {
    return <Navigate to="/settings" replace />
  }

  return (
    <div className="admin-feedback-page">
      <div className="admin-feedback-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <ArrowLeftIcon className="back-icon" /> Back
        </button>
        <h2 className="admin-feedback-title">
          <ChartBarSquareIcon className="admin-feedback-title-icon" /> Feedback Dashboard
        </h2>
      </div>

      <div className="admin-feedback-stats">
        <div className="stat-card">
          <div className="stat-value">{analytics.total}</div>
          <div className="stat-label">Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.avg.toFixed(1)}</div>
          <div className="stat-label">Avg rating</div>
        </div>
      </div>

      <div className="admin-feedback-card">
        <h3 className="section-title">Rating Breakdown</h3>
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={`rb-${n}`} className="rating-row">
              <span className="rating-left">
                <StarIcon className="mini-star" /> {n}
              </span>
              <div className="rating-track">
                <div
                  className="rating-fill"
                  style={{
                    width: `${analytics.total ? (analytics.bucket[n] / analytics.total) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="rating-count">{analytics.bucket[n]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-feedback-card">
        <h3 className="section-title">Most Requested Features</h3>
        {analytics.topRequests.length === 0 ? (
          <p className="empty-text">No suggestions yet.</p>
        ) : (
          <div className="request-list">
            {analytics.topRequests.map((r, i) => (
              <div key={`rq-${i}`} className="request-item">
                <span className="request-rank">#{i + 1}</span>
                <div className="request-text">{r.text}</div>
                <span className="request-count">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-feedback-card">
        <h3 className="section-title">Recent Feedback</h3>
        {rows.length === 0 ? (
          <p className="empty-text">No feedback yet.</p>
        ) : (
          <div className="admin-feedback-list">
            {rows.slice(0, 25).map((r) => (
              <div key={r.id} className="admin-feedback-item">
                <div className="admin-feedback-item-top">
                  <span className="item-email">{r.email || 'Anonymous'}</span>
                  <span className="item-rating">
                    {Array.from({ length: Math.max(0, Number(r.rating) || 0) }).map((_, i) => (
                      <StarSolidIcon key={`${r.id}-star-${i}`} className="item-rating-star" />
                    ))}
                  </span>
                </div>
                <p className="item-text">{r.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

