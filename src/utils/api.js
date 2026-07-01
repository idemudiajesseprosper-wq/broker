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
