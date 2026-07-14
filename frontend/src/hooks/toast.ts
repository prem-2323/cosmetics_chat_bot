import { toast } from 'react-hot-toast'

export const notifyInfo = (message: string) => toast(message, { style: { background: '#1f1f1f', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } })
export const notifySuccess = (message: string) => toast.success(message, { style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } })
export const notifyError = (message: string) => toast.error(message, { style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } })
