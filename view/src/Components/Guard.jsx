import { Navigate } from 'react-router-dom'

export default function Guard({ isAllowed, redirectTo = '/', children }) {
    if (!isAllowed) return <Navigate to={redirectTo} replace />
    return children
}
