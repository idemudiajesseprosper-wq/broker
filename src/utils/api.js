export function badRequest(message) {
  return Response.json({ error: message }, { status: 400 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return Response.json({ error: message }, { status: 404 });
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function serverError(error) {
  console.error(error);

  if (error?.message === "MONGODB_URI is not defined") {
    return Response.json(
      { error: "Database is not configured. Add MONGODB_URI in Vercel." },
      { status: 500 },
    );
  }

  if (error?.message === "JWT_SECRET is not defined") {
    return Response.json(
      { error: "Authentication is not configured. Add JWT_SECRET in Vercel." },
      { status: 500 },
    );
  }

  if (
    error?.name === "MongooseServerSelectionError" ||
    error?.message?.includes("Server selection timed out")
  ) {
    return Response.json(
      {
        error:
          "Database connection failed. Check MONGODB_URI and MongoDB Atlas Network Access.",
      },
      { status: 503 },
    );
  }

  return Response.json({ error: "Internal server error" }, { status: 500 });
}

export function getPagination(searchParams) {
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 20, 1),
    100,
  );

  return {
    limit,
    page,
    skip: (page - 1) * limit,
  };
}
