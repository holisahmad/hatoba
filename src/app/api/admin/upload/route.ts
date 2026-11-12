import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import path from 'path'
import { supabaseAdmin, HATOBA_BUCKET } from '@/lib/supabase'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_admin_session')?.value === 'authenticated'
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login terlebih dahulu.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file gambar yang dikirim.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10 MB.' },
        { status: 400 }
      )
    }

    const originalName = file.name || 'image.jpg'
    const ext = path.extname(originalName).toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Format file tidak didukung (${ext}). Gunakan JPG, PNG, atau WEBP.` },
        { status: 400 }
      )
    }

    const cleanBaseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30)

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const storagePath = `products/${cleanBaseName || 'img'}-${uniqueSuffix}${ext}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 1. Primary: Upload to Supabase Storage Bucket ('hatoba')
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(HATOBA_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (!uploadError && uploadData) {
        const { data: pubUrlData } = supabaseAdmin.storage
          .from(HATOBA_BUCKET)
          .getPublicUrl(storagePath)

        return NextResponse.json({
          success: true,
          url: pubUrlData.publicUrl,
          filename: originalName,
          size: file.size,
          storage: 'supabase',
        })
      }

      console.warn('[upload] Supabase upload failed, falling back:', uploadError?.message)
    } catch (sbErr) {
      console.warn('[upload] Supabase upload exception:', (sbErr as Error).message)
    }

    // 2. Fallback: Base64 Data URL (guarantees zero failure on serverless)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: originalName,
      size: file.size,
      storage: 'base64_fallback',
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mengunggah gambar.' },
      { status: 500 }
    )
  }
}
