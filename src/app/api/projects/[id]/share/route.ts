// UAFSAIDA — Project Sharing API
import { NextRequest, NextResponse } from 'next/server';

// In production, these would be stored in the database
const projectShares: Map<string, { isPublic: boolean; sharedWith: string[] }> = new Map();

// ═══════════════════════════════════════════════════════════════
// GET /api/projects/:id/share — Get sharing settings
// ═══════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const share = projectShares.get(params.id) || { isPublic: false, sharedWith: [] };
  return NextResponse.json(share);
}

// ═══════════════════════════════════════════════════════════════
// POST /api/projects/:id/share — Update sharing settings
// ═══════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isPublic, emails } = body;

    projectShares.set(params.id, {
      isPublic: isPublic || false,
      sharedWith: emails || [],
    });

    // In production, send invitation emails here

    return NextResponse.json({
      success: true,
      message: isPublic ? 'Project is now public' : 'Sharing settings updated',
      shareUrl: isPublic ? `${process.env.NEXT_PUBLIC_APP_URL}/shared/${params.id}` : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update sharing settings' },
      { status: 400 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE /api/projects/:id/share — Revoke sharing
// ═══════════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  projectShares.delete(params.id);
  return NextResponse.json({
    success: true,
    message: 'Sharing revoked',
  });
}
