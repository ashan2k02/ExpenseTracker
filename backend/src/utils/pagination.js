/**
 * Pagination helper
 */
const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  return {
    limit: limitNum,
    offset,
    page: pageNum,
  };
};

/**
 * Create pagination response
 */
const paginateResponse = (count, page, limit) => {
  return {
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    itemsPerPage: limit,
    hasNextPage: page * limit < count,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  paginate,
  paginateResponse,
};
