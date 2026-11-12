import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getAdminProducts,
  saveAdminProduct,
  deleteAdminProduct,
} from '@/lib/admin-store'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_admin_session')?.value === 'authenticated'
}

// GET all products
export async function GET() {
  const products = await getAdminProducts()
  return NextResponse.json({ success: true, products })
}

// POST create or edit product
export async function POST(request: Request) {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Nama produk wajib diisi.' }, { status: 400 })
    }

    const saved = await saveAdminProduct(body)
    return NextResponse.json({ success: true, product: saved })
  } catch (err) {
    console.error('Save product error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan menu.' },
      { status: 500 }
    )
  }
}

// DELETE product
export async function DELETE(request: Request) {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID produk tidak disertakan.' }, { status: 400 })
    }

    const deleted = await deleteAdminProduct(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Menu berhasil dihapus.' })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus menu.' },
      { status: 500 }
    )
  }
}

