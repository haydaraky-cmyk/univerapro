import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { UserPlan } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PLAN_LABELS: Record<UserPlan, string> = {
  free: 'مجاني',
  pro: 'برو',
  max: 'ماكس',
}

export const PLAN_COLORS: Record<UserPlan, string> = {
  free: 'bg-gray-500',
  pro: 'bg-primary-500',
  max: 'bg-gold-500',
}

export const PLAN_PRICES = {
  pro: { monthly: 1500, label: 'برو' },
  max: { monthly: 2500, label: 'ماكس' },
}

export function canAccess(userPlan: UserPlan, requiredPlan: UserPlan): boolean {
  const hierarchy = { free: 0, pro: 1, max: 2 }
  return hierarchy[userPlan] >= hierarchy[requiredPlan]
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(date))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-SY').format(price) + ' ل.س'
}

export function getVideoEmbedUrl(cloudflareId: string): string {
  return `https://iframe.videodelivery.net/${cloudflareId}?preload=true`
}

export const PAYMENT_METHOD_LABELS = {
  sham_cash: 'شام كاش',
  syriatel_cash: 'سيريتل كاش',
  other: 'طريقة أخرى',
}

export const STATUS_LABELS = {
  pending: 'قيد المراجعة',
  published: 'منشور',
  rejected: 'مرفوض',
  draft: 'مسودة',
  approved: 'مقبول',
}
