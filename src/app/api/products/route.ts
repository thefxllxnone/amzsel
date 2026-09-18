import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/storage';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('API Error GET /api/products:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch catalogue products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.category || body.currentPrice === undefined || body.originalPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required product fields (name, category, prices)' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: body.name,
      category: body.category,
      image: body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      currentPrice: Number(body.currentPrice),
      originalPrice: Number(body.originalPrice),
      discountPercent: Number(body.discountPercent) || 0,
      amazonUrl: body.amazonUrl || '',
      isFeatured: Boolean(body.isFeatured),
      isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
      dealBadge: body.dealBadge || '',
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('API Error POST /api/products:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
