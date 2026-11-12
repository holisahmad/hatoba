import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_admin_session')?.value === 'authenticated'
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB

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
        { error: 'Ukuran file terlalu besar. Maksimal 8 MB.' },
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

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Generate clean unique filename
    const cleanBaseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30)

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const finalFilename = `${cleanBaseName || 'img'}-${uniqueSuffix}${ext}`
    const targetFilePath = path.join(uploadsDir, finalFilename)

    // Convert file to Buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(targetFilePath, buffer)

    const publicUrl = `/uploads/${finalFilename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      size: file.size,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mengunggah gambar.' },
      { status: 500 }
    )
  }
}

