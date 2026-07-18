import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { deleteFromS3, getFileUrl } from "../utils/deleteFromS3.js";
import { uploadVideo, processAndUploadImage } from "../middlewares/multer.middlerware.js";

const VIDEO_MAX_SIZE_BYTES = 100 * 1024 * 1024;

// Get all reels (admin)
export const getReels = asyncHandler(async (req, res) => {
  const reels = await prisma.reel.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            take: 1,
            select: { url: true },
          },
          variants: {
            take: 1,
            select: { id: true, price: true, salePrice: true, sku: true },
          },
        },
      },
      variant: {
        select: {
          id: true,
          price: true,
          salePrice: true,
          sku: true,
          attributes: {
            include: {
              attributeValue: {
                select: { value: true, hexCode: true },
              },
            },
          },
        },
      },
    },
  });

  const formatted = reels.map((reel) => ({
    ...reel,
    videoUrl: reel.videoUrl ? getFileUrl(reel.videoUrl) : null,
    thumbnailUrl: reel.thumbnailUrl ? getFileUrl(reel.thumbnailUrl) : null,
    product: reel.product
      ? {
          ...reel.product,
          imageUrl: reel.product.images?.[0]?.url
            ? getFileUrl(reel.product.images[0].url)
            : null,
        }
      : null,
  }));

  res.status(200).json(
    new ApiResponsive(200, { reels: formatted }, "Reels fetched successfully")
  );
});

// Get single reel (admin)
export const getReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            take: 1,
            select: { url: true },
          },
          variants: {
            select: { id: true, price: true, salePrice: true, sku: true },
          },
        },
      },
      variant: {
        select: {
          id: true,
          price: true,
          salePrice: true,
          sku: true,
          attributes: {
            include: {
              attributeValue: {
                select: { value: true, hexCode: true },
              },
            },
          },
        },
      },
    },
  });

  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  res.status(200).json(
    new ApiResponsive(200, {
      reel: {
        ...reel,
        videoUrl: reel.videoUrl ? getFileUrl(reel.videoUrl) : null,
        thumbnailUrl: reel.thumbnailUrl ? getFileUrl(reel.thumbnailUrl) : null,
        product: reel.product
          ? {
              ...reel.product,
              imageUrl: reel.product.images?.[0]?.url
                ? getFileUrl(reel.product.images[0].url)
                : null,
            }
          : null,
      },
    })
  );
});

// Create reel
export const createReel = asyncHandler(async (req, res) => {
  const { productId, variantId, displayOrder, status } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    });
    if (!variant || variant.productId !== productId) {
      throw new ApiError(400, "Invalid variant for this product");
    }
  }

  // Handle video upload
  const videoFile = req.files?.video?.[0];
  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  if (videoFile.size > VIDEO_MAX_SIZE_BYTES) {
    throw new ApiError(400, `Video size must be less than ${VIDEO_MAX_SIZE_BYTES / (1024 * 1024)}MB`);
  }

  const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
  if (!allowedTypes.includes(videoFile.mimetype)) {
    throw new ApiError(400, "Only MP4, MOV, and WEBM files are allowed");
  }

  const videoKey = await uploadVideo(videoFile);

  // Handle optional thumbnail upload
  let thumbnailKey = null;
  const thumbFile = req.files?.thumbnail?.[0];
  if (thumbFile) {
    thumbnailKey = await processAndUploadImage(thumbFile, "reel-thumbs");
  }

  // Calculate display order with auto-shift
  let order = parseInt(displayOrder) || 0;
  if (order > 0) {
    await prisma.$executeRaw`
      UPDATE "Reel" SET "displayOrder" = "displayOrder" + 1
      WHERE "displayOrder" >= ${order}
    `;
  } else {
    const maxOrder = await prisma.reel.aggregate({ _max: { displayOrder: true } });
    order = (maxOrder._max.displayOrder || 0) + 1;
  }

  const reel = await prisma.reel.create({
    data: {
      videoUrl: videoKey,
      thumbnailUrl: thumbnailKey,
      productId,
      variantId: variantId || null,
      displayOrder: order,
      status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            take: 1,
            select: { url: true },
          },
          variants: {
            take: 1,
            select: { id: true, price: true, salePrice: true },
          },
        },
      },
      variant: {
        select: {
          id: true,
          price: true,
          salePrice: true,
          sku: true,
          attributes: {
            include: {
              attributeValue: {
                select: { value: true, hexCode: true },
              },
            },
          },
        },
      },
    },
  });

  res.status(201).json(
    new ApiResponsive(201, {
      reel: {
        ...reel,
        videoUrl: reel.videoUrl ? getFileUrl(reel.videoUrl) : null,
        thumbnailUrl: reel.thumbnailUrl ? getFileUrl(reel.thumbnailUrl) : null,
        product: reel.product
          ? {
              ...reel.product,
              imageUrl: reel.product.images?.[0]?.url
                ? getFileUrl(reel.product.images[0].url)
                : null,
            }
          : null,
      },
    }, "Reel created successfully")
  );
});

// Update reel
export const updateReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;
  const { productId, variantId, displayOrder, status } = req.body;

  const existing = await prisma.reel.findUnique({
    where: { id: reelId },
  });
  if (!existing) {
    throw new ApiError(404, "Reel not found");
  }

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
  }

  if (variantId) {
    const targetProductId = productId || existing.productId;
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    });
    if (!variant || variant.productId !== targetProductId) {
      throw new ApiError(400, "Invalid variant for this product");
    }
  }

  // Handle video replacement
  let videoKey = existing.videoUrl;
  const videoFile = req.files?.video?.[0];
  if (videoFile) {
    if (videoFile.size > VIDEO_MAX_SIZE_BYTES) {
      throw new ApiError(400, `Video size must be less than ${VIDEO_MAX_SIZE_BYTES / (1024 * 1024)}MB`);
    }
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!allowedTypes.includes(videoFile.mimetype)) {
      throw new ApiError(400, "Only MP4, MOV, and WEBM files are allowed");
    }
    if (existing.videoUrl) {
      await deleteFromS3(existing.videoUrl).catch(() => {});
    }
    videoKey = await uploadVideo(videoFile);
  }

  // Handle thumbnail replacement
  let thumbnailKey = existing.thumbnailUrl;
  const thumbFile = req.files?.thumbnail?.[0];
  if (thumbFile) {
    if (existing.thumbnailUrl) {
      await deleteFromS3(existing.thumbnailUrl).catch(() => {});
    }
    thumbnailKey = await processAndUploadImage(thumbFile, "reel-thumbs");
  }

  // Handle display order shift
  const newOrder = displayOrder !== undefined ? parseInt(displayOrder) : existing.displayOrder;
  if (displayOrder !== undefined && newOrder !== existing.displayOrder) {
    if (newOrder > existing.displayOrder) {
      await prisma.$executeRaw`
        UPDATE "Reel" SET "displayOrder" = "displayOrder" - 1
        WHERE "displayOrder" > ${existing.displayOrder} AND "displayOrder" <= ${newOrder} AND "id" != ${reelId}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "Reel" SET "displayOrder" = "displayOrder" + 1
        WHERE "displayOrder" >= ${newOrder} AND "displayOrder" < ${existing.displayOrder} AND "id" != ${reelId}
      `;
    }
  }

  const reel = await prisma.reel.update({
    where: { id: reelId },
    data: {
      videoUrl: videoKey,
      thumbnailUrl: thumbnailKey,
      productId: productId || existing.productId,
      variantId: variantId !== undefined ? (variantId || null) : existing.variantId,
      displayOrder: newOrder,
      status: status || existing.status,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            take: 1,
            select: { url: true },
          },
          variants: {
            take: 1,
            select: { id: true, price: true, salePrice: true },
          },
        },
      },
      variant: {
        select: {
          id: true,
          price: true,
          salePrice: true,
          sku: true,
          attributes: {
            include: {
              attributeValue: {
                select: { value: true, hexCode: true },
              },
            },
          },
        },
      },
    },
  });

  res.status(200).json(
    new ApiResponsive(200, {
      reel: {
        ...reel,
        videoUrl: reel.videoUrl ? getFileUrl(reel.videoUrl) : null,
        thumbnailUrl: reel.thumbnailUrl ? getFileUrl(reel.thumbnailUrl) : null,
        product: reel.product
          ? {
              ...reel.product,
              imageUrl: reel.product.images?.[0]?.url
                ? getFileUrl(reel.product.images[0].url)
                : null,
            }
          : null,
      },
    }, "Reel updated successfully")
  );
});

// Delete reel
export const deleteReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
  });
  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  // Delete S3/R2 files
  const deletePromises = [];
  if (reel.videoUrl) {
    deletePromises.push(
      deleteFromS3(reel.videoUrl).catch((err) =>
        console.error("Failed to delete video from storage:", reel.videoUrl, err.message)
      )
    );
  }
  if (reel.thumbnailUrl) {
    deletePromises.push(
      deleteFromS3(reel.thumbnailUrl).catch((err) =>
        console.error("Failed to delete thumbnail from storage:", reel.thumbnailUrl, err.message)
      )
    );
  }
  await Promise.allSettled(deletePromises);

  await prisma.reel.delete({ where: { id: reelId } });

  // Recalculate orders: shift higher-ordered reels down
  await prisma.$executeRaw`
    UPDATE "Reel" SET "displayOrder" = "displayOrder" - 1
    WHERE "displayOrder" > ${reel.displayOrder}
  `;

  res.status(200).json(
    new ApiResponsive(200, null, "Reel deleted successfully")
  );
});

// Reorder reels
export const reorderReels = asyncHandler(async (req, res) => {
  const { reelIds } = req.body;

  if (!Array.isArray(reelIds) || reelIds.length === 0) {
    throw new ApiError(400, "reelIds array is required");
  }

  await prisma.$transaction(
    reelIds.map((id, index) =>
      prisma.reel.update({
        where: { id },
        data: { displayOrder: index + 1 },
      })
    )
  );

  res.status(200).json(
    new ApiResponsive(200, null, "Reels reordered successfully")
  );
});

// Bulk update reels (status)
export const bulkUpdateReels = asyncHandler(async (req, res) => {
  const { reelIds, status } = req.body;

  if (!Array.isArray(reelIds) || reelIds.length === 0) {
    throw new ApiError(400, "reelIds array is required");
  }
  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    throw new ApiError(400, "Status must be ACTIVE or INACTIVE");
  }

  await prisma.reel.updateMany({
    where: { id: { in: reelIds } },
    data: { status },
  });

  res.status(200).json(
    new ApiResponsive(200, null, `${reelIds.length} reel(s) updated`)
  );
});

// Bulk delete reels
export const bulkDeleteReels = asyncHandler(async (req, res) => {
  const { reelIds } = req.body;

  if (!Array.isArray(reelIds) || reelIds.length === 0) {
    throw new ApiError(400, "reelIds array is required");
  }

  const reels = await prisma.reel.findMany({
    where: { id: { in: reelIds } },
    select: { id: true, videoUrl: true, thumbnailUrl: true },
  });

  // Delete S3 files
  const deletePromises = [];
  for (const reel of reels) {
    if (reel.videoUrl) {
      deletePromises.push(
        deleteFromS3(reel.videoUrl).catch((err) =>
          console.error("Failed to delete video from storage:", reel.videoUrl, err.message)
        )
      );
    }
    if (reel.thumbnailUrl) {
      deletePromises.push(
        deleteFromS3(reel.thumbnailUrl).catch((err) =>
          console.error("Failed to delete thumbnail from storage:", reel.thumbnailUrl, err.message)
        )
      );
    }
  }
  await Promise.allSettled(deletePromises);

  await prisma.reel.deleteMany({ where: { id: { in: reelIds } } });

  // Recalculate display orders
  const remaining = await prisma.reel.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true },
  });
  await prisma.$transaction(
    remaining.map((r, i) =>
      prisma.reel.update({
        where: { id: r.id },
        data: { displayOrder: i + 1 },
      })
    )
  );

  res.status(200).json(
    new ApiResponsive(200, null, `${reelIds.length} reel(s) deleted`)
  );
});
