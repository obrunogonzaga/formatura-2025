import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createPresignedPutUrl, publicObjectUrl } from "@/lib/storage";
import { submissionInputSchema } from "@/lib/validators";
import { slugifyFileName, toSnakeCase } from "@/lib/slug";

type UploadMeta = {
  objectKey: string;
  contentType?: string;
  childIndex: number;
  photoIndex: number;
};

function buildObjectKey(params: {
  turma: string;
  guardianName: string;
  childName: string;
  photoIndex: number;
  fileName: string;
}) {
  const safeName = slugifyFileName(params.fileName);
  const turmaSlug = toSnakeCase(params.turma);
  const guardianSlug = toSnakeCase(params.guardianName);
  const childSlug = toSnakeCase(params.childName);
  
  return `${turmaSlug}/${guardianSlug}/${childSlug}/${params.photoIndex + 1}-${safeName}`;
}

export async function POST(request: Request) {
  try {
    const payload = submissionInputSchema.parse(await request.json());
    const uploads: UploadMeta[] = [];

    const { submissionId } = await prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          guardianName: payload.guardianName.trim(),
          turma: payload.turma.trim()
        }
      });

      for (const [childIndex, child] of payload.children.entries()) {
        const createdChild = await tx.child.create({
          data: {
            name: child.name.trim(),
            submissionId: submission.id
          }
        });

        for (const [photoIndex, photo] of child.photos.entries()) {
          const objectKey = buildObjectKey({
            turma: submission.turma,
            guardianName: submission.guardianName,
            childName: createdChild.name,
            photoIndex,
            fileName: photo.fileName
          });

          await tx.photo.create({
            data: {
              childId: createdChild.id,
              fileName: photo.fileName,
              mimeType: photo.fileType,
              objectKey,
              order: photoIndex
            }
          });

          uploads.push({
            objectKey,
            contentType: photo.fileType,
            childIndex: child.childIndex ?? childIndex,
            photoIndex
          });
        }
      }

      return { submissionId: submission.id };
    });

    const uploadTargets = await Promise.all(
      uploads.map(async (upload) => ({
        url: await createPresignedPutUrl({
          objectKey: upload.objectKey,
          contentType: upload.contentType
        }),
        childIndex: upload.childIndex,
        photoIndex: upload.photoIndex
      }))
    );

    return NextResponse.json({ submissionId, uploadTargets });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos. Verifique os campos e tente novamente." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Não foi possível salvar a submissão agora." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        children: {
          include: { photos: true }
        }
      }
    });

    const payload = submissions.map((submission) => ({
      id: submission.id,
      guardianName: submission.guardianName,
      createdAt: submission.createdAt,
      children: submission.children.map((child) => ({
        id: child.id,
        name: child.name,
        photos: child.photos.map((photo) => ({
          id: photo.id,
          fileName: photo.fileName,
          mimeType: photo.mimeType,
          objectKey: photo.objectKey,
          order: photo.order,
          url: publicObjectUrl(photo.objectKey)
        }))
      }))
    }));

    return NextResponse.json({ submissions: payload });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível listar as submissões." },
      { status: 500 }
    );
  }
}

