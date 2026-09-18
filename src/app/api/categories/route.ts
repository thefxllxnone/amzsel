import { NextResponse } from 'next/server';
import { getCategories, addCategory, renameCategory, deleteCategory } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name required' }, { status: 400 });
    }
    const categories = await addCategory(name.trim());
    return NextResponse.json({ success: true, data: categories }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add category' },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { oldName, newName } = await request.json();
    if (!oldName || !newName) {
      return NextResponse.json({ success: false, error: 'oldName and newName required' }, { status: 400 });
    }
    const categories = await renameCategory(oldName, newName);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to rename category' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name param required' }, { status: 400 });
    }
    const categories = await deleteCategory(name);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete category' },
      { status: 400 }
    );
  }
}
