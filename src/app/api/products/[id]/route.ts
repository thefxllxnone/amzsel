import { NextResponse } from 'next/server';
import { updateProduct, deleteProduct, getProductById } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const updated = await updateProduct(id, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.currentPrice !== undefined && { currentPrice: Number(body.currentPrice) }),
      ...(body.originalPrice !== undefined && { originalPrice: Number(body.originalPrice) }),
      ...(body.discountPercent !== undefined && { discountPercent: Number(body.discountPercent) }),
      ...(body.amazonUrl !== undefined && { amazonUrl: body.amazonUrl }),
      ...(body.isFeatured !== undefined && { isFeatured: Boolean(body.isFeatured) }),
      ...(body.isAvailable !== undefined && { isAvailable: Boolean(body.isAvailable) }),
      ...(body.dealBadge !== undefined && { dealBadge: body.dealBadge }),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(`API Error PUT /api/products/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = await deleteProduct(id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error(`API Error DELETE /api/products/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
